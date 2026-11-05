"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "PASSWORD_RECOVERY" || session) {
              setHasValidSession(true);
            }
          }
        );
        return () => subscription.unsubscribe();
      }
    };

    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update password. Link might be expired.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Your password has been reset successfully! Redirecting to sign in...");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
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
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B2520] tracking-tight">Set New Password</h1>
          <p className="text-[#7A7065] font-body text-xs sm:text-sm mt-2 leading-relaxed">
            Create a secure new password for your NR Enterprises account.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl leading-relaxed font-body">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl leading-relaxed font-body">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold">
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[#7A7065] hover:text-[#2B2520] uppercase tracking-wider font-heading font-semibold cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm font-body text-[#2B2520] outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm font-body text-[#2B2520] outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2B2520] text-white py-4 text-xs tracking-wider uppercase font-heading font-bold hover:bg-[#C19A6B] transition-colors duration-300 rounded-full shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </button>
        </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] pt-40 pb-40 text-center text-[#C19A6B] font-heading font-semibold text-base animate-pulse">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
