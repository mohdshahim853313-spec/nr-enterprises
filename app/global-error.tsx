"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorRoot({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout runtime error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#2B2520] font-sans px-4 sm:px-6 py-12">
        <div className="max-w-xl w-full mx-auto text-center flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 rounded-full flex items-center justify-center text-[#C19A6B] border border-[#EAEAEB] shadow-md mb-5">
            <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#C19A6B] bg-white/90 px-4 py-1 rounded-full border border-[#EAEAEB] mb-4 block">
            System Alert
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2B2520] mb-3">
            Something unexpected occurred
          </h1>

          <p className="text-xs sm:text-sm text-[#7A7065] max-w-md mx-auto mb-8 leading-relaxed">
            We encountered an unexpected issue. Please try refreshing the application.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center bg-[#2B2520] hover:bg-[#C19A6B] text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] rounded-full transition-all cursor-pointer shadow-md"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-white text-[#2B2520] border border-[#2B2520]/25 px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] rounded-full transition-all cursor-pointer shadow-2xs"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
