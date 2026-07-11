"use client";

import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function VerifyAccountPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: z.infer<typeof verifyCodeSchema>) => {
    if (!params.username) {
      toast.error("Invalid username parameter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/verify-code", {
        username: params.username,
        code: data.code,
      });

      toast.success(response.data.message || "Account verified successfully!");
      router.replace("/auth/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ?? "Verification failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
            &quot;Secrecy is the beginning of security. Verify to protect the
            sanctuary of conversation.&quot;
          </blockquote>
          <cite className="text-[10px] text-[#5C616E] tracking-widest uppercase block not-italic">
            — The Anonymous Portal
          </cite>
        </div>
        <div className="text-[10px] text-[#5C616E] tracking-wider">
          © 2026 Mystery Message. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 bg-[#0B0C0E]">
        <div className="w-full max-w-[360px] mx-auto space-y-8">
          {/* Back Link */}
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 text-xs text-[#828896] hover:text-[#EBEAE6] transition-colors group/back"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover/back:-translate-x-0.5 transition-transform" />
            Back to Sign Up
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-[#EBEAE6] tracking-tight">
              Verify Account
            </h2>
            <p className="text-xs text-[#828896]">
              Enter the 6-digit decryption code sent to your email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Verification Code Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[10px] font-semibold text-[#828896] uppercase tracking-widest">
                  Decryption Code
                </label>
                <span className="text-[#4E5361] text-xs lowercase">
                  ({params.username})
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  {...register("code")}
                  className="w-full bg-[#111317] border-y-0 border-r-0 border-l-2 border-l-[#1D2027] px-3 py-2.5 rounded-none focus:outline-none focus:border-l-[#B87B5C] focus:bg-[#15181E] text-[#EBEAE6] placeholder-[#4E5361] text-center tracking-[0.5em] font-mono text-lg transition-all duration-150"
                />
                <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-[#4E5361]" />
              </div>
              {errors.code && (
                <p className="text-xs text-[#A85252] pl-0.5 mt-1 font-medium text-center">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#EBEAE6] hover:bg-[#B87B5C] text-[#0B0C0E] hover:text-[#0B0C0E] font-medium rounded-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0B0C0E]" />
                  <span>Decrypting...</span>
                </>
              ) : (
                <span>Verify Code</span>
              )}
            </button>
          </form>

          {/* Footer Reminder */}
          <div className="pt-4 border-t border-[#1A1D24]">
            <p className="text-[#828896] text-xs leading-relaxed">
              Codes expire after 1 hour. If you didn&apos;t receive the email,
              please check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
