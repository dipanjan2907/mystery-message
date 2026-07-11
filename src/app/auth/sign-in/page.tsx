"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/signInSchema";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Incorrect username or password");
        } else {
          toast.error("Failed to sign in");
        }
      } else {
        toast.success("Signed in successfully!");
        router.replace("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
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
            &quot;In a world of performative noise, whispers carry the most
            weight. Speak without being seen.&quot;
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
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden text-xs font-semibold tracking-[0.2em] text-[#5C616E] uppercase mb-6">
              Mystery Message
            </div>
            <h2 className="text-xl font-medium text-[#EBEAE6] tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-[#828896]">
              Enter your credentials to access your secure mailbox.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email / Username Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#828896] uppercase tracking-widest pl-0.5">
                Email or Username
              </label>
              <input
                type="text"
                placeholder="agent@mystery.com"
                {...register("identifier")}
                className="w-full bg-[#111317] border-y-0 border-r-0 border-l-2 border-l-[#1D2027] px-3 py-2.5 rounded-none focus:outline-none focus:border-l-[#B87B5C] focus:bg-[#15181E] text-[#EBEAE6] placeholder-[#4E5361] text-sm transition-all duration-150"
              />
              {errors.identifier && (
                <p className="text-xs text-[#A85252] pl-0.5 mt-1 font-medium">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[10px] font-semibold text-[#828896] uppercase tracking-widest">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#828896] hover:text-[#EBEAE6] transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-[#111317] border-y-0 border-r-0 border-l-2 border-l-[#1D2027] px-3 py-2.5 pr-10 rounded-none focus:outline-none focus:border-l-[#B87B5C] focus:bg-[#15181E] text-[#EBEAE6] placeholder-[#4E5361] text-sm transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#4E5361] hover:text-[#828896] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#A85252] pl-0.5 mt-1 font-medium">
                  {errors.password.message}
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
                <span>Enter Portal</span>
              )}
            </button>
          </form>

          {/* Footer Redirect */}
          <div className="pt-4 border-t border-[#1A1D24] text-left">
            <p className="text-[#828896] text-xs">
              New to the portal?{" "}
              <Link
                href="/auth/signup"
                className="text-[#EBEAE6] hover:text-[#B87B5C] font-semibold transition-colors pl-1"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
