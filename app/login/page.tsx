"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already logged in + reset Google loading on tab focus
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(redirectUrl);
      }
    });

    const handleFocusOrVisible = () => {
      setTimeout(() => {
        setIsGoogleLoading(false);
      }, 500);
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [redirectUrl, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg("");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      
      const safetyTimer = setTimeout(() => {
        setIsGoogleLoading(false);
      }, 8000);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });

      if (error) {
        clearTimeout(safetyTimer);
        setErrorMsg(error.message || "Failed to sign in with Google.");
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during Google sign in.");
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        router.push(redirectUrl);
      } else {
        setErrorMsg("Please verify your email to complete sign in.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 flex flex-col items-center justify-center font-sans text-[#2B2520]">
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
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B2520] tracking-tight">Sign In to Your Account</h1>
          <p className="text-[#7A7065] font-body text-xs sm:text-sm mt-2 leading-relaxed">
            Access your tailored carpet orders, bespoke requests, and private wishlist.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl leading-relaxed font-body">
            {errorMsg}
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full mb-6 bg-[#FAFAFA] border border-[#EAEAEB] hover:border-[#2B2520] hover:bg-white text-[#2B2520] py-3.5 px-4 text-xs tracking-wider uppercase font-heading font-bold transition-all duration-200 rounded-full shadow-xs flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? "Connecting Google..." : "Continue with Google"}</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-[#EAEAEB] w-full" />
          <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-[#7A7065] font-heading font-bold absolute">
            Or With Email
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold">
                Password
              </label>
              <div className="flex items-center gap-3">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#C19A6B] hover:underline uppercase tracking-wider font-heading font-semibold"
                >
                  Forgot?
                </Link>
                <span className="text-[#EAEAEB] text-xs">|</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#7A7065] hover:text-[#2B2520] uppercase tracking-wider font-heading font-semibold cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm font-body text-[#2B2520] outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-[#2B2520] text-white py-4 text-xs tracking-wider uppercase font-heading font-bold hover:bg-[#C19A6B] transition-colors duration-300 rounded-full shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#EAEAEB] text-center">
          <p className="text-xs font-body text-[#7A7065]">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-[#C19A6B] font-heading font-bold uppercase tracking-wider hover:underline ml-1"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] pt-40 pb-40 text-center text-[#C19A6B] font-heading font-semibold text-base animate-pulse">
          Loading Sign In...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
