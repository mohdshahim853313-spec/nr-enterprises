"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Configured Admin Email & Master Password
  const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "nrenterprises@gmail.com")
    .toLowerCase()
    .split(",")
    .map((e) => e.trim());
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "nrenterprises@2026";

  useEffect(() => {
    // Detect if running on localhost / dev environment
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");
      setIsLocalhost(isLocal);
    }

    // 1. Listen for Supabase session & user
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // 2. Check if already unlocked in sessionStorage
        const savedAuth = sessionStorage.getItem("rz_admin_authenticated");
        if (savedAuth === "true") {
          setIsUnlocked(true);
        }
      } catch (err) {
        console.error("Admin auth check error:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setIsUnlocked(false);
        sessionStorage.removeItem("rz_admin_authenticated");
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
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, []);

  // Google Login for Admin with explicit account chooser
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      
      const safetyTimer = setTimeout(() => {
        setIsGoogleLoading(false);
      }, 8000);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?redirect=/admin`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });
      if (error) {
        clearTimeout(safetyTimer);
        setErrorMessage(error.message || "Failed to initiate Google login.");
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed.");
      setIsGoogleLoading(false);
    }
  };

  // Sign out / Switch Account
  const handleSignOut = async () => {
    sessionStorage.removeItem("rz_admin_authenticated");
    setIsUnlocked(false);
    await supabase.auth.signOut();
  };

  // Lock session (keep Supabase login, require password again)
  const handleLockSession = () => {
    sessionStorage.removeItem("rz_admin_authenticated");
    setIsUnlocked(false);
    setPasswordInput("");
    setErrorMessage("");
  };

  // Verify Master Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      sessionStorage.setItem("rz_admin_authenticated", "true");
      setIsUnlocked(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Incorrect Master Password. Access Denied.");
      setPasswordInput("");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F5F5F7] flex flex-col items-center justify-center font-serif text-[#C19A6B] text-sm animate-pulse gap-3">
        <div className="w-10 h-10 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin"></div>
        <span>Verifying Security Protocol...</span>
      </div>
    );
  }

  // 🚀 LOCALHOST DEV ACCESS: Allow opening admin panel directly on localhost without requiring login
  if (isLocalhost) {
    return (
      <div className="relative">
        {/* Floating Dev Mode Security Badge */}
        <div className="fixed bottom-4 right-4 z-[999] flex items-center gap-2 bg-amber-50/95 backdrop-blur-md border border-amber-300 px-3.5 py-2 rounded-sm shadow-lg text-[11px]">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-mono text-amber-900 font-semibold">
              🛠️ Localhost Admin (Direct Access)
            </span>
          </div>
          <Link
            href="/"
            className="text-[#7A7065] hover:text-[#3A332C] font-bold uppercase tracking-wider px-2 py-1 border border-amber-200 hover:bg-white rounded-xs transition-colors"
          >
            ← Storefront
          </Link>
        </div>

        {children}
      </div>
    );
  }

  // 🔒 STEP 1: NOT LOGGED IN WITH SUPABASE (FOR LIVE PRODUCTION WEBSITE)
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F5F5F7] flex flex-col items-center justify-center px-4 sm:px-6 py-6 font-sans select-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-7 sm:p-9 border border-[#DFD8CC] rounded-2xl shadow-xl text-center"
        >
          <div className="w-14 h-14 bg-[#FAFAFA] border border-[#DFD8CC] rounded-full mx-auto flex items-center justify-center text-[#C19A6B] mb-5 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C19A6B] block mb-1">
            NR Enterprises Atelier Studio
          </span>
          <h1 className="text-2xl font-serif text-[#3A332C] mb-2 font-medium">
            Admin Login Required
          </h1>
          <p className="text-xs text-[#7A7065] mb-8 leading-relaxed">
            This console is strictly restricted. Please sign in with your authorized NR Enterprises administrator account to proceed.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#DFD8CC] hover:border-[#3A332C] text-[#3A332C] py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-all rounded-xl shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? "Connecting Google..." : "Sign in with Google"}</span>
            </button>

            <Link
              href="/login?redirect=/admin"
              className="block w-full bg-[#3A332C] hover:bg-[#C19A6B] text-[#F5F5F7] py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl shadow-sm"
            >
              Sign in with Email & Password
            </Link>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-600 font-medium mt-4 bg-red-50 p-2.5 rounded-xs border border-red-200">
              {errorMessage}
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-[#EAEAEB]">
            <Link
              href="/"
              className="text-[11px] text-[#8C7A63] hover:text-[#3A332C] uppercase tracking-wider font-semibold"
            >
              ← Return to Storefront
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🔒 STEP 2: LOGGED IN, BUT NOT AN AUTHORIZED ADMIN EMAIL
  const userEmail = (user.email || "").toLowerCase().trim();
  const isAuthorizedAdmin = ADMIN_EMAILS.includes(userEmail);

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F5F5F7] flex flex-col items-center justify-center px-4 sm:px-6 py-6 font-sans select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-7 sm:p-9 border-2 border-red-200 rounded-2xl shadow-xl text-center"
        >
          <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-full mx-auto flex items-center justify-center text-red-600 mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-red-600 block mb-1">
            Access Denied
          </span>
          <h1 className="text-2xl font-serif text-[#3A332C] mb-2 font-medium">
            Unauthorized Account
          </h1>
          <p className="text-xs text-[#7A7065] mb-4 leading-relaxed">
            You are currently signed in as:
          </p>
          <div className="bg-[#FAFAFA] p-3 rounded-xs border border-[#DFD8CC] font-mono text-xs text-[#3A332C] font-semibold mb-6 break-all">
            {user.email}
          </div>
          <p className="text-xs text-[#8C7A63] mb-8 leading-relaxed">
            This account does not have administrator privileges. Only <strong className="text-[#3A332C]">nrenterprises@gmail.com</strong> is authorized to manage the studio.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full bg-[#3A332C] hover:bg-[#C19A6B] text-[#F5F5F7] py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors rounded-xl shadow-sm cursor-pointer"
            >
              Switch Account (Login as nrenterprises@gmail.com)
            </button>
            <button
              onClick={handleSignOut}
              className="w-full border border-[#DFD8CC] text-[#7A7065] hover:text-[#3A332C] hover:bg-[#FAFAFA] py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xl cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EAEAEB]">
            <Link
              href="/"
              className="text-[11px] text-[#8C7A63] hover:text-[#3A332C] uppercase tracking-wider font-semibold"
            >
              ← Return to Storefront
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🔒 STEP 3: AUTHORIZED EMAIL (nrenterprises@gmail.com), BUT REQUIRES MASTER PASSWORD / PIN
  if (!isUnlocked) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F5F5F7] flex flex-col items-center justify-center px-4 sm:px-6 py-6 font-sans select-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-7 sm:p-8 border border-[#DFD8CC] rounded-2xl shadow-xl text-center"
        >
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full mx-auto flex items-center justify-center text-emerald-600 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-3">
            Verified Admin: {user.email}
          </span>
          <h1 className="text-2xl font-serif text-[#3A332C] mb-2 font-medium">
            Enter Master Password
          </h1>
          <p className="text-xs text-[#7A7065] mb-6 font-light leading-relaxed">
            Enter your management access key to unlock the admin console.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full border border-[#DFD8CC] px-4 py-3 text-center text-sm outline-none focus:border-[#C19A6B] transition-all bg-[#FAFAF8] font-mono tracking-widest rounded-xl shadow-2xs"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 font-medium">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#3A332C] text-[#F5F5F7] py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C19A6B] transition-colors rounded-xl shadow-md cursor-pointer"
            >
              Unlock Console ↗
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#EAEAEB] text-[11px]">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[#8C7A63] hover:text-red-600 font-semibold cursor-pointer"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="text-[#8C7A63] hover:text-[#3A332C] font-semibold"
            >
              ← Storefront
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🌟 STEP 4: FULLY AUTHENTICATED & UNLOCKED
  return (
    <div className="relative">
      {/* Top / Floating Security Control Bar */}
      <div className="fixed bottom-4 right-4 z-[999] flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#DFD8CC] px-3.5 py-2 rounded-sm shadow-lg text-[11px]">
        <div className="flex items-center gap-1.5 mr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[#3A332C] font-semibold hidden sm:inline">{user.email}</span>
        </div>
        <button
          onClick={handleLockSession}
          title="Lock Console (Requires Password)"
          className="text-[#7A7065] hover:text-[#3A332C] font-bold uppercase tracking-wider px-2 py-1 border border-[#DFD8CC] hover:bg-[#FAFAFA] rounded-xs transition-colors cursor-pointer"
        >
          🔒 Lock
        </button>
        <button
          onClick={handleSignOut}
          title="Sign out of Admin Session"
          className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider px-2 py-1 border border-red-200 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {children}
    </div>
  );
}