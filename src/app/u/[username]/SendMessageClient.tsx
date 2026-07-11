"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  Loader2,
  User,
  ShieldCheck,
  PenLine,
} from "lucide-react";
import { ApiResponse } from "@/types/ApiResponse";

// Animations
const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function SendMessageClient({ username }: { username: string }) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    setIsSending(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content,
      });
      toast.success(response.data.message || "Message sent securely.");
      setContent("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const fetchSuggestions = async () => {
    setIsSuggesting(true);
    setHasFetchedSuggestions(true);
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
      toast.error("Failed to generate AI suggestions. Please try again.");
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setContent(suggestion);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EBEAE6] font-sans selection:bg-[#B87B5C] selection:text-[#0B0C0E]">
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header Section */}
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#111317] border border-[#1D2027] mb-4 shadow-sm">
              <User className="w-8 h-8 text-[#8FA3B8]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[#EBEAE6]">
              Send a secret to{" "}
              <span className="font-medium text-[#B87B5C]">@{username}</span>.
            </h1>
            <p className="text-[#828896] text-sm md:text-base font-light flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3E6E56]" />
              Your identity remains completely anonymous.
            </p>
          </motion.div>

          {/* Message Input Section */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="relative group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your unvarnished truth here..."
                className="w-full min-h-[160px] bg-[#111317] border border-[#1A1D24] text-[#EBEAE6] p-6 focus:outline-none focus:border-[#B87B5C] transition-colors resize-y font-light placeholder:text-[#4E5361] rounded-none shadow-sm"
                aria-label="Anonymous Message Content"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
                <span
                  className={`text-[10px] uppercase tracking-widest transition-colors ${
                    content.length > 500 ? "text-[#A85252]" : "text-[#5C616E]"
                  }`}
                >
                  {content.length}/500
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={fetchSuggestions}
                disabled={isSuggesting}
                className="w-full sm:w-auto px-6 py-3 border border-[#1A1D24] bg-[#111317] hover:bg-[#15181E] text-[#828896] hover:text-[#EBEAE6] transition-colors flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase disabled:opacity-50 shadow-sm"
                aria-label="Suggest AI Message"
              >
                {isSuggesting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#B87B5C]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#B87B5C]" />
                )}
                {isSuggesting ? "Generating..." : "Suggest Idea"}
              </button>

              <button
                onClick={handleSend}
                disabled={
                  isSending || content.length === 0 || content.length > 500
                }
                className="w-full sm:w-auto px-8 py-3 bg-[#EBEAE6] text-[#0B0C0E] hover:bg-[#B87B5C] transition-colors flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase disabled:opacity-50 disabled:bg-[#4E5361] disabled:text-[#1A1D24] shadow-sm"
                aria-label="Send Message"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </motion.div>

          {/* AI Suggestions Section */}
          {hasFetchedSuggestions && (
            <motion.div
              variants={fadeUp}
              className="pt-8 border-t border-[#1A1D24]"
            >
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#828896] mb-6 flex items-center gap-2">
                <PenLine className="w-4 h-4" />
                AI Suggestions
              </h3>

              <div className="space-y-4">
                {isSuggesting ? (
                  /* Premium Skeleton Loaders */
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full h-16 bg-[#111317] border border-[#1D2027] animate-pulse"
                    />
                  ))
                ) : suggestions.length > 0 ? (
                  <AnimatePresence>
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left bg-[#111317] border border-[#1D2027] hover:border-l-2 hover:border-l-[#B87B5C] p-4 text-[#EBEAE6] text-sm font-light leading-relaxed transition-all duration-200 flex items-center justify-between group shadow-sm"
                        aria-label={`Use suggestion: ${suggestion}`}
                      >
                        <span className="pr-4">{suggestion}</span>
                        <span className="text-[10px] text-[#5C616E] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Use This
                        </span>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                ) : (
                  /* Empty / Failed State for Suggestions */
                  <div className="text-center py-8 bg-[#07080A] border border-[#1A1D24]">
                    <p className="text-sm text-[#5C616E] font-light">
                      No suggestions generated. Feel free to try again.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
