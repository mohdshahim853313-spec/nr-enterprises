"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App runtime error:", error);
    // Instantly complete & dismiss any pending top progress bar
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:route-complete"));
    }
  }, [error]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF8F5] px-4 sm:px-6 py-10 sm:py-16 text-center font-sans text-[#2B2520] relative overflow-hidden">
      {/* Soft Ambient Radial Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#EAE2D5]/50 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Luxury Warning Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#C19A6B] border border-[#EAEAEB] shadow-md mb-5">
          <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Small Upper Badge */}
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#C19A6B] bg-white/90 backdrop-blur-md px-4 py-1 rounded-full border border-[#EAEAEB] shadow-2xs mb-4 block">
          Momentary Hiccup
        </span>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#2B2520] mb-3 tracking-tight">
          Something unexpected occurred
        </h1>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm text-[#7A7065] max-w-md mx-auto mb-8 font-normal leading-relaxed">
          We encountered an issue loading this page. Please try refreshing or return to our handcrafted collections.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center bg-[#2B2520] hover:bg-[#C19A6B] text-white px-8 py-3 text-xs font-heading font-bold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-white hover:bg-[#F5F2EC] text-[#2B2520] border border-[#2B2520]/25 hover:border-[#2B2520] px-8 py-3 text-xs font-heading font-bold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-2xs cursor-pointer"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
