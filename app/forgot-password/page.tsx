"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to send reset link. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(
        "Password reset instructions have been sent! Please check your inbox (and spam folder) and click the link to set a new password."
      );
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-3 sm:pt-4 pb-20 px-4 sm:px-6 flex flex-col items-center justify-start font-sans text-[#2B2520]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-6 sm:p-10 md:p-12 border border-[#EAEAEB]/80 shadow-xl rounded-3xl"
      >
        <div className="text-center mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-bold block mb-2">
            NR Enterprises Atelier
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B2520] tracking-tight">Reset Password</h1>
          <p className="text-[#7A7065] font-body text-xs sm:text-sm mt-2 leading-relaxed">
            Enter your account email address and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl leading-relaxed font-body">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl leading-relaxed font-body">
            <div className="font-heading font-bold mb-1">Email Sent!</div>
            {successMsg}
          </div>
        )}

        {!successMsg ? (
          <form onSubmit={handleResetRequest} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm font-body text-[#2B2520] outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2B2520] text-white py-4 text-xs tracking-wider uppercase font-heading font-bold hover:bg-[#C19A6B] transition-colors duration-300 rounded-full shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-block bg-[#2B2520] text-white px-8 py-3.5 text-xs tracking-wider uppercase font-heading font-bold hover:bg-[#C19A6B] transition-colors rounded-full shadow-md"
            >
              Return to Sign In
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#EAEAEB] text-center">
          <Link
            href="/login"
            className="text-xs uppercase tracking-wider text-[#7A7065] hover:text-[#2B2520] font-heading font-semibold"
          >
            ← Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] pt-40 pb-40 text-center text-[#C19A6B] font-heading font-semibold text-base animate-pulse">
          Loading Reset...
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
