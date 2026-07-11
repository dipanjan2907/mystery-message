"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  LogOut,
  Loader2,
  MessageSquareOff,
  Trash2,
  Archive,
  ArchiveRestore,
  Send,
  Sparkles,
  Inbox,
  SendHorizontal,
} from "lucide-react";
import { ApiResponse } from "@/types/ApiResponse";
import { useRouter } from "next/navigation";
import type { Variants } from "framer-motion";

// Types
interface Message {
  _id: string;
  content: string;
  createdAt: string;
}

// Animations
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tabs: "inbox" | "quick-send"
  const [activeTab, setActiveTab] = useState<"inbox" | "quick-send">("inbox");

  // Portal Status State
  const [acceptMessages, setAcceptMessages] = useState(false);
  const [isSwitchingAcceptance, setIsSwitchingAcceptance] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Inbox State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  // Quick Send State
  const [quickSendUser, setQuickSendUser] = useState("");
  const [quickSendValid, setQuickSendValid] = useState<boolean | null>(null);
  const [quickSendAccepting, setQuickSendAccepting] = useState<boolean | null>(
    null,
  );
  const [quickSendChecking, setQuickSendChecking] = useState(false);
  const [quickSendContent, setQuickSendContent] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Keep track of timeout IDs for Undo Send
  const pendingSends = useRef<Record<string, NodeJS.Timeout>>({});

  // 1. Initialize Archived IDs from LocalStorage
  useEffect(() => {
    const storedArchived = localStorage.getItem("mystery_message_archived");
    if (storedArchived) {
      try {
        setArchivedIds(JSON.parse(storedArchived));
      } catch (e) {
        console.error("Error parsing archived IDs from localStorage", e);
      }
    }
  }, []);

  // Helper function to persist archive mutations
  const saveArchivedIds = (ids: string[]) => {
    setArchivedIds(ids);
    localStorage.setItem("mystery_message_archived", JSON.stringify(ids));
  };

  // 2. Portal Status Sync Effect
  useEffect(() => {
    if (session?.user?.isAcceptingMessages !== undefined) {
      setAcceptMessages(session.user.isAcceptingMessages);
    }
  }, [session]);

  const fetchAcceptMessageStatus = useCallback(async () => {
    setIsSwitchingAcceptance(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setAcceptMessages(response.data.isAcceptingMessages ?? false);
    } catch (error) {
      // Graceful fallback
    } finally {
      setIsSwitchingAcceptance(false);
    }
  }, []);

  const handleSwitchChange = async () => {
    setIsSwitchingAcceptance(true);
    const newStatus = !acceptMessages;
    setAcceptMessages(newStatus);
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: newStatus,
      });
      toast.success(response.data.message);
    } catch (error) {
      setAcceptMessages(!newStatus); // Revert on failure
      toast.error("Failed to update portal status.");
    } finally {
      setIsSwitchingAcceptance(false);
    }
  };

  // 3. Inbox Handlers
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages");
      setMessages((response.data.messages as unknown as Message[]) || []);
      if (refresh) toast.success("Messages refreshed");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 404
      ) {
        setMessages([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial configuration on mount/auth state change
  useEffect(() => {
    if (status === "authenticated") {
      fetchAcceptMessageStatus();
      fetchMessages();
    }
  }, [status, fetchAcceptMessageStatus, fetchMessages]);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${messageId}`,
      );
      toast.success(response.data.message);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const toggleArchiveMessage = (messageId: string) => {
    if (archivedIds.includes(messageId)) {
      saveArchivedIds(archivedIds.filter((id) => id !== messageId));
      toast.success("Message unarchived.");
    } else {
      saveArchivedIds([...archivedIds, messageId]);
      toast.success("Message archived.");
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard.");
  };

  // 4. Quick Send Handlers
  const checkUsername = async (username: string) => {
    setQuickSendUser(username);
    setQuickSendValid(null);
    setQuickSendAccepting(null);
    if (!username.trim()) return;

    setQuickSendChecking(true);
    try {
      // If the API returns 400 "Username is already taken", the user EXISTS. This is valid for sending.
      await axios.get(`/api/check-username-unique?username=${username}`);
      // If 200/201, user is unique (doesn't exist)
      setQuickSendValid(false);
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response?.status === 400) {
        setQuickSendValid(true);
        const isAccepting = axiosError.response.data.isAcceptingMessage ?? true;
        setQuickSendAccepting(isAccepting);
      } else {
        setQuickSendValid(false);
      }
    } finally {
      setQuickSendChecking(false);
    }
  };

  const fetchSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const response = await axios.post("/api/suggest-messages", {
        message: "Give me three interesting questions.",
      });
      const data = response.data.response || "";
      const splitSuggestions = data
        .split(/\|{2,3}/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      setSuggestions(splitSuggestions);
    } catch (error) {
      toast.error("Failed to generate AI suggestions.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Real API post action triggered upon expiration of the undo frame
  const executeSend = async (recipient: string, content: string) => {
    try {
      await axios.post("/api/send-message", {
        username: recipient,
        content: content,
      });
      toast.success(`Message cleanly delivered to @${recipient}`);
    } catch (error) {
      toast.error("Failed to deliver your message. Please try again.");
    }
  };

  const handleQuickSend = () => {
    if (!quickSendContent.trim() || !quickSendValid) return;

    const messageId = Date.now().toString();
    const messageContent = quickSendContent;
    const recipient = quickSendUser;

    setQuickSendContent("");

    // Start 30s Undo timer
    const timeoutId = setTimeout(() => {
      executeSend(recipient, messageContent);
      delete pendingSends.current[messageId];
    }, 30000);

    pendingSends.current[messageId] = timeoutId;

    toast.success(`Sending to @${recipient}...`, {
      duration: 30000,
      action: {
        label: "Undo Send",
        onClick: () => {
          clearTimeout(pendingSends.current[messageId]);
          delete pendingSends.current[messageId];
          setQuickSendContent(messageContent); // Re-populate field
          toast.success("Message sending cancelled.");
        },
      },
    });
  };

  const copyToClipboard = () => {
    if (!session?.user?.username) return;
    const url = `${window.location.origin}/u/${session.user.username}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success("Profile link copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 5. Auth Routing Layout Protections
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#B87B5C]" />
      </div>
    );
  }

  if (!session || !session.user) {
    router.push("/auth/sign-in");
    return null;
  }

  const username = session.user.username;
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${username}`
      : "";

  const displayedMessages = messages.filter((m) =>
    showArchived ? archivedIds.includes(m._id) : !archivedIds.includes(m._id),
  );

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EBEAE6] font-sans selection:bg-[#B87B5C] selection:text-[#0B0C0E]">
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full border-b border-[#1A1D24] bg-[#0B0C0E]/90 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#111317] border border-[#1D2027] flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#8FA3B8]" />
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[#EBEAE6] uppercase hidden sm:block">
              Mystery Message
            </span>
          </div>
          <button
            onClick={() => router.push("/auth/sign-out")}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-[#828896] hover:text-[#EBEAE6] transition-colors"
          >
            Sign Out
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header & Portal Controls */}
          <section className="space-y-8">
            <motion.div variants={fadeUp} className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[#EBEAE6]">
                Welcome back, {username}.
              </h1>
              <p className="text-[#828896] text-sm font-light">
                Manage your anonymous portal and read incoming correspondence.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Public Link Card */}
              <div className="bg-[#111317] border border-[#1D2027] p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#828896] mb-4">
                    Your Public Link
                  </h3>
                  <div className="flex items-center bg-[#0B0C0E] border border-[#1A1D24]">
                    <input
                      type="text"
                      value={profileUrl}
                      readOnly
                      className="w-full bg-transparent text-sm text-[#EBEAE6] px-4 py-3 focus:outline-none placeholder-[#4E5361]"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-3 bg-[#EBEAE6] text-[#0B0C0E] hover:bg-[#B87B5C] transition-colors border-l border-[#1A1D24] shrink-0"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Acceptance Toggle Card */}
              <div className="bg-[#111317] border border-[#1D2027] p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#828896] mb-4">
                    Portal Status
                  </h3>
                  <div className="w-full mt-2">
                    <div className="flex bg-[#0B0C0E] border border-[#1A1D24] p-1 w-full relative h-10 select-none">
                      <button
                        type="button"
                        onClick={() => !acceptMessages && handleSwitchChange()}
                        disabled={isSwitchingAcceptance}
                        className="relative flex-1 flex items-center justify-center text-[10px] font-semibold tracking-widest uppercase focus:outline-none transition-colors duration-200 disabled:opacity-50"
                      >
                        {acceptMessages && (
                          <motion.div
                            layoutId="portalStatusBg"
                            className="absolute inset-0 bg-[#3E6E56]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <span
                          className={`relative z-10 flex items-center gap-1.5 ${
                            acceptMessages
                              ? "text-[#EBEAE6]"
                              : "text-[#5C616E] hover:text-[#EBEAE6]"
                          }`}
                        >
                          {isSwitchingAcceptance && acceptMessages && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          Active
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => acceptMessages && handleSwitchChange()}
                        disabled={isSwitchingAcceptance}
                        className="relative flex-1 flex items-center justify-center text-[10px] font-semibold tracking-widest uppercase focus:outline-none transition-colors duration-200 disabled:opacity-50"
                      >
                        {!acceptMessages && (
                          <motion.div
                            layoutId="portalStatusBg"
                            className="absolute inset-0 bg-[#A85252]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <span
                          className={`relative z-10 flex items-center gap-1.5 ${
                            !acceptMessages
                              ? "text-[#EBEAE6]"
                              : "text-[#5C616E] hover:text-[#EBEAE6]"
                          }`}
                        >
                          {isSwitchingAcceptance && !acceptMessages && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          Paused
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Premium Tab Navigation */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col border-t border-[#1A1D24] pt-8 space-y-8"
          >
            <div className="flex space-x-8 border-b border-[#1A1D24]">
              {[
                { id: "inbox", label: "Inbox", icon: Inbox },
                { id: "quick-send", label: "Quick Send", icon: SendHorizontal },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as "inbox" | "quick-send")
                    }
                    className={`pb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-colors relative ${
                      isActive
                        ? "text-[#EBEAE6]"
                        : "text-[#5C616E] hover:text-[#828896]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B87B5C]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[400px]">
              {/* INBOX TAB */}
              {activeTab === "inbox" && (
                <motion.div
                  key="inbox"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="text-[10px] uppercase tracking-widest font-medium text-[#828896] hover:text-[#EBEAE6] transition-colors"
                    >
                      {showArchived ? "View Active Inbox" : "View Archived"}
                    </button>
                    <button
                      onClick={() => fetchMessages(true)}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-[#828896] hover:text-[#EBEAE6] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isLoading ? "animate-spin text-[#B87B5C]" : ""
                        }`}
                      />
                      Refresh
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-full h-24 bg-[#111317] border border-[#1D2027] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : displayedMessages.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center border border-[#1A1D24] bg-[#07080A] text-center p-6">
                      <MessageSquareOff className="w-8 h-8 text-[#5C616E] mb-4" />
                      <p className="text-[#828896] text-sm font-light">
                        {showArchived
                          ? "No archived messages."
                          : "The silence is golden. No messages yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {displayedMessages.map((message) => (
                          <motion.div
                            key={message._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111317] border border-[#1D2027] hover:border-[#B87B5C] p-6 flex flex-col justify-between group transition-colors"
                          >
                            <p className="text-[#EBEAE6] font-light leading-relaxed mb-6 whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between border-t border-[#1A1D24] pt-4 mt-auto">
                              <span className="text-[10px] text-[#5C616E] tracking-widest uppercase">
                                {new Date(message.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => copyMessage(message.content)}
                                  className="text-[#828896] hover:text-[#EBEAE6] transition-colors"
                                  title="Copy Message"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    toggleArchiveMessage(message._id)
                                  }
                                  className="text-[#828896] hover:text-[#EBEAE6] transition-colors"
                                  title={showArchived ? "Unarchive" : "Archive"}
                                >
                                  {showArchived ? (
                                    <ArchiveRestore className="w-4 h-4" />
                                  ) : (
                                    <Archive className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteMessage(message._id)
                                  }
                                  className="text-[#A85252] hover:text-[#ff7878] transition-colors"
                                  title="Delete Permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {/* QUICK SEND TAB */}
              {activeTab === "quick-send" && (
                <motion.div
                  key="quick-send"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="max-w-2xl"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#828896] mb-2 block">
                        Recipient Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={quickSendUser}
                          onChange={(e) => checkUsername(e.target.value)}
                          placeholder="e.g. design_tester"
                          className="w-full bg-[#111317] border border-[#1A1D24] text-[#EBEAE6] px-4 py-3 focus:outline-none focus:border-[#B87B5C] transition-colors placeholder-[#4E5361]"
                        />
                        <div className="absolute right-4 top-3">
                          {quickSendChecking ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#5C616E]" />
                          ) : quickSendValid === true ? (
                            quickSendAccepting ? (
                              <Check className="w-4 h-4 text-[#3E6E56]" />
                            ) : (
                              <span className="text-xs text-[#A85252]">
                                Paused
                              </span>
                            )
                          ) : quickSendValid === false ? (
                            <span className="text-xs text-[#A85252]">
                              Not Found
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {quickSendValid && quickSendAccepting && (
                        <motion.div
                          key="composer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <textarea
                            value={quickSendContent}
                            onChange={(e) =>
                              setQuickSendContent(e.target.value)
                            }
                            placeholder="Type your message..."
                            className="w-full min-h-[160px] bg-[#111317] border border-[#1A1D24] text-[#EBEAE6] p-6 focus:outline-none focus:border-[#B87B5C] transition-colors resize-y font-light placeholder:text-[#4E5361]"
                          />
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button
                              onClick={fetchSuggestions}
                              disabled={isSuggesting}
                              className="px-6 py-3 border border-[#1A1D24] bg-[#111317] hover:bg-[#15181E] text-[#828896] hover:text-[#EBEAE6] transition-colors flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase disabled:opacity-50"
                            >
                              {isSuggesting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              AI Suggestion
                            </button>
                            <button
                              onClick={handleQuickSend}
                              disabled={!quickSendContent.trim()}
                              className="flex-1 px-8 py-3 bg-[#EBEAE6] text-[#0B0C0E] hover:bg-[#B87B5C] transition-colors flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase disabled:opacity-50 disabled:bg-[#4E5361]"
                            >
                              <Send className="w-4 h-4" />
                              Send Now
                            </button>
                          </div>

                          {suggestions.length > 0 && (
                            <div className="pt-4 space-y-2">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    setQuickSendContent(suggestion)
                                  }
                                  className="w-full text-left bg-[#111317] border border-[#1D2027] hover:border-l-2 hover:border-[#B87B5C] p-4 text-[#EBEAE6] text-sm font-light transition-all"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                      {quickSendValid && !quickSendAccepting && (
                        <motion.div
                          key="paused-notice"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 bg-[#1B1212] border border-[#3D1A1A] text-[#E5A5A5] text-xs font-light tracking-wide"
                        >
                          @{quickSendUser} is currently not accepting anonymous
                          messages.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
