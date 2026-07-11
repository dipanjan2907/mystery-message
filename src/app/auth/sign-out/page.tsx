"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ArrowLeft, Loader2 } from "lucide-react";

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/auth/sign-in" });
    } catch (error) {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:flex bg-[#0B0C0E] text-[#EBEAE6] font-sans antialiased">
      {/* Left Panel - Editorial Quote (desktop only) */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#07080A] border-r border-[#1A1D24] flex-col justify-between p-12 select-none">
        <div className="text-xs font-semibold tracking-[0.2em] text-[#5C616E] uppercase">
          Mystery Message
        </div>
        <div className="space-y-5">
          <blockquote className="text-2xl font-light leading-relaxed text-[#D4D2CD] tracking-tight">
            &quot;Every connection must eventually fade back into the shadows.
            Until next time, keep the secrets safe.&quot
          </blockquote>
          <cite className="text-[10px] text-[#5C616E] tracking-widest uppercase block not-italic">
            — The Anonymous Portal
          </cite>
        </div>
        <div className="text-[10px] text-[#5C616E] tracking-wider">
          © 2026 Mystery Message. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Confirmation Card */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 bg-[#0B0C0E]">
        <div className="w-full max-w-[360px] mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden text-xs font-semibold tracking-[0.2em] text-[#5C616E] uppercase mb-6">
              Mystery Message
            </div>
            <h2 className="text-xl font-medium text-[#EBEAE6] tracking-tight">
              Sign Out
            </h2>
            <p className="text-xs text-[#828896]">
              Are you sure you want to secure your session and disconnect from
              the portal?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full py-2.5 bg-[#EBEAE6] hover:bg-[#B87B5C] text-[#0B0C0E] font-medium rounded-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0B0C0E]" />
                  <span>Disconnecting...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Secure Disconnect</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.back()}
              disabled={isSigningOut}
              className="w-full py-2.5 bg-transparent border border-[#1D2027] hover:border-[#828896] hover:bg-[#111317] text-[#EBEAE6] font-medium rounded-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
