"use client";

import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [debouncedUsername] = useDebounceValue(username, 500);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Handle Username uniqueness checking
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${debouncedUsername}`,
          );
          setUsernameMessage(response.data.message);
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username",
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data);
      toast.success(response.data.message || "Registration successful!");
      router.replace(`/auth/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ?? "Registration failed";
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
            &quot;Anonymity is not a mask to hide behind. It is a mirror that
            reflects the uncompromised self.&quot;
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
              Create Account
            </h2>
            <p className="text-xs text-[#828896]">
              Register to deploy your own anonymous portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#828896] uppercase tracking-widest pl-0.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="shadow_whisperer"
                  {...register("username")}
                  onChange={(e) => {
                    setValue("username", e.target.value);
                    setUsername(e.target.value);
                  }}
                  className="w-full bg-[#111317] border-y-0 border-r-0 border-l-2 border-l-[#1D2027] px-3 py-2.5 rounded-none focus:outline-none focus:border-l-[#B87B5C] focus:bg-[#15181E] text-[#EBEAE6] placeholder-[#4E5361] text-sm transition-all duration-150"
                />

                {/* Checking Username Indicator */}
                <div className="absolute right-3 top-3 flex items-center">
                  {isCheckingUsername && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#8FA3B8]" />
                  )}
                </div>
              </div>

              {/* Username Uniqueness Status Message */}
              {!isCheckingUsername && usernameMessage && (
                <p
                  className={`text-xs pl-0.5 mt-1 font-medium flex items-center gap-1.5 ${
                    usernameMessage.includes("unique") ||
                    usernameMessage.includes("available")
                      ? "text-[#3E6E56]"
                      : "text-[#A85252]"
                  }`}
                >
                  {usernameMessage.includes("unique") ||
                  usernameMessage.includes("available") ? (
                    <Check className="h-3 w-3 inline" />
                  ) : (
                    <AlertCircle className="h-3 w-3 inline" />
                  )}
                  {usernameMessage}
                </p>
              )}
              {errors.username && (
                <p className="text-xs text-[#A85252] pl-0.5 mt-1 font-medium">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#828896] uppercase tracking-widest pl-0.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="agent@mystery.com"
                {...register("email")}
                className="w-full bg-[#111317] border-y-0 border-r-0 border-l-2 border-l-[#1D2027] px-3 py-2.5 rounded-none focus:outline-none focus:border-l-[#B87B5C] focus:bg-[#15181E] text-[#EBEAE6] placeholder-[#4E5361] text-sm transition-all duration-150"
              />
              {errors.email && (
                <p className="text-xs text-[#A85252] pl-0.5 mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#828896] uppercase tracking-widest pl-0.5">
                Password
              </label>
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
              className="w-full py-2.5 bg-[#EBEAE6] hover:bg-[#B87B5C] text-[#0B0C0E] hover:text-[#0B0C0E] font-medium rounded-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0B0C0E]" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Create Portal</span>
              )}
            </button>
          </form>

          {/* Footer Redirect */}
          <div className="pt-4 border-t border-[#1A1D24] text-left">
            <p className="text-[#828896] text-xs">
              Already part of the mystery?{" "}
              <Link
                href="/auth/sign-in"
                className="text-[#EBEAE6] hover:text-[#B87B5C] font-semibold transition-colors pl-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
