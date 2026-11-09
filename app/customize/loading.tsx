"use client";

import Image from "next/image";

export default function CustomizeLoading() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[80px] lg:top-[135px] z-30 bg-[#FAF8F5] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer pulsating ring */}
        <div className="w-16 h-16 rounded-full border-2 border-[#DFD8CC] border-t-[#C19A6B] animate-spin" />
        
        {/* Soft centered logo badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/90 border border-[#DFD8CC] flex items-center justify-center shadow-xs">
            <Image
              src="/nr-logo.png"
              alt="NR Enterprises Atelier"
              width={24}
              height={24}
              className="object-contain opacity-70"
            />
          </div>
        </div>
      </div>

      <span className="text-xs uppercase tracking-[0.25em] text-[#2B2520] font-heading font-bold mb-1.5">
        Entering Bespoke Studio
      </span>
      <p className="text-xs text-[#8C7A63] tracking-wide font-body max-w-xs">
        Preparing custom loom configurations, room scenes & color palettes...
      </p>
    </div>
  );
}
