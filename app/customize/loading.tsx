"use client";

import Image from "next/image";

export default function CustomizeLoading() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[80px] lg:top-[135px] z-30 bg-[#FAF8F5] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer pulsating ring in Royal Maroon */}
        <div className="w-16 h-16 rounded-none border-2 border-[#4A1017]/20 border-t-[#4A1017] animate-spin" />
        
        {/* Soft centered logo badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-none bg-white/90 border border-[#4A1017]/30 flex items-center justify-center shadow-xs">
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

      <span className="text-xs uppercase tracking-[0.25em] text-[#2B070B] font-heading font-bold mb-1.5">
        Entering Bespoke Studio
      </span>
      <p className="text-xs text-[#8C6B38] tracking-wide font-body max-w-xs">
        Preparing custom loom configurations, room scenes & color palettes...
      </p>
    </div>
  );
}
