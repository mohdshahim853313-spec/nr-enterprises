"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full min-h-[72vh] flex items-center justify-center bg-[#FAF8F5] px-4 sm:px-6 py-10 sm:py-16 relative overflow-hidden font-sans text-[#2B2520]">
      
      {/* Soft Ambient Radial Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#EAE2D5]/50 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Artistic Watermark 404 with Badge */}
        <div className="relative mb-3 flex items-center justify-center select-none">
          <span className="text-[110px] sm:text-[140px] font-heading font-extralight text-[#D8C7B5]/40 leading-none tracking-widest">
            404
          </span>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#C19A6B] bg-white/95 backdrop-blur-md px-4 py-1 rounded-full border border-[#EAEAEB] shadow-2xs">
              LOST IN THE WEAVE
            </span>
          </div>
        </div>

        {/* Headline & Description */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#2B2520] mb-3 tracking-tight">
          An Uncharted Thread
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7065] max-w-md mx-auto leading-relaxed mb-7 font-normal">
          The tapestry or page you are looking for does not exist or has been relocated. Let us guide you back to our curated handcrafted carpets.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-9 w-full">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#2B2520] hover:bg-[#C19A6B] text-white px-7 py-2.5 text-xs font-heading font-bold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
          >
            ← Return to Home
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center bg-white hover:bg-[#F5F2EC] text-[#2B2520] border border-[#2B2520]/25 hover:border-[#2B2520] px-7 py-2.5 text-xs font-heading font-bold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-2xs cursor-pointer"
          >
            Explore Collections →
          </Link>
        </div>

        {/* Quick Discovery Navigation (Helpful for Users) */}
        <div className="w-full pt-6 border-t border-[#EAEAEB]">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A63] block mb-3">
            POPULAR CURATIONS
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/collections?category=Tufted"
              className="text-[11px] font-medium px-3.5 py-1.5 bg-white hover:bg-[#2B2520] text-[#2B2520] hover:text-white border border-[#EAEAEB] hover:border-[#2B2520] rounded-full transition-all shadow-2xs"
            >
              Hand-Tufted Wool
            </Link>
            <Link
              href="/collections?category=Shag"
              className="text-[11px] font-medium px-3.5 py-1.5 bg-white hover:bg-[#2B2520] text-[#2B2520] hover:text-white border border-[#EAEAEB] hover:border-[#2B2520] rounded-full transition-all shadow-2xs"
            >
              Plush Shaggy
            </Link>
            <Link
              href="/collections?category=Jute"
              className="text-[11px] font-medium px-3.5 py-1.5 bg-white hover:bg-[#2B2520] text-[#2B2520] hover:text-white border border-[#EAEAEB] hover:border-[#2B2520] rounded-full transition-all shadow-2xs"
            >
              Artisan Jute
            </Link>
            <Link
              href="/collections?category=Irregular"
              className="text-[11px] font-medium px-3.5 py-1.5 bg-white hover:bg-[#2B2520] text-[#2B2520] hover:text-white border border-[#EAEAEB] hover:border-[#2B2520] rounded-full transition-all shadow-2xs"
            >
              Bespoke Silhouettes
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
