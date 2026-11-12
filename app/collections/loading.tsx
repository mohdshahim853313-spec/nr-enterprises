export default function CollectionsLoading() {
  return (
    <div className="bg-[#FAF8F5] pt-3 pb-20 px-3.5 sm:px-6 md:px-10 min-h-screen font-sans text-[#2B070B]">
      <div className="max-w-[1500px] mx-auto">
        {/* 🌟 1. HERO BANNER SKELETON (Rounded 1:1 match) */}
        <div className="relative w-full min-h-[220px] md:h-[280px] mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center text-center shadow-lg border border-[#4A1017] bg-[#240609] p-6">
          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            {/* Ivory Tag Pill Badge */}
            <div className="h-3 w-44 rounded-full bg-[#FAF5EB]/30 animate-pulse mb-3" />
            {/* Large Banner Title */}
            <div className="h-8 sm:h-12 md:h-14 w-72 sm:w-[480px] md:w-[560px] rounded-2xl bg-white/20 animate-pulse mb-3.5" />
            {/* Subtitle Lines */}
            <div className="h-3.5 sm:h-4 w-64 sm:w-[420px] rounded-full bg-white/10 animate-pulse mb-1.5" />
            <div className="h-3.5 sm:h-4 w-48 sm:w-[300px] rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* 🌟 2. FILTER NAVIGATION BAR SKELETON (Rounded 1:1 match) */}
        <div className="relative mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#4A1017]/20 pb-4">
          {/* Left: Filters Button */}
          <div className="self-start md:self-auto">
            <div className="flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[#4A1017]/30 bg-[#FAF5EB] shadow-xs">
              <div className="grid grid-cols-2 gap-[3px] w-3.5 h-3.5">
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B070B]" />
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B070B]" />
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B070B]" />
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B070B]" />
              </div>
              <span className="text-[11px] sm:text-xs tracking-wider uppercase font-heading font-bold text-[#2B070B]">
                Filters
              </span>
            </div>
          </div>

          {/* Center / Tabs: Shape Category Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full bg-[#2B070B] text-[#FAF5EB] font-bold shadow-xs border border-[#4A1017]">
              ALL
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#6A5A55] font-semibold">
              RECTANGLE
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#6A5A55] font-semibold">
              ROUND
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#6A5A55] font-semibold">
              OVAL
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#6A5A55] font-semibold hidden sm:inline-flex">
              RUNNER
            </div>
          </div>
        </div>

        {/* 🌟 3. PRODUCT CARDS GRID SKELETON (Normal Square Corner with NR Splash Emblem) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              {/* Product Card Image Container with NR Splash Screen */}
              <div className="relative aspect-[3/4] sm:aspect-4/5 w-full rounded-none overflow-hidden bg-[#240609] shadow-xs mb-3 border border-[#4A1017] flex flex-col items-center justify-center p-4 select-none">
                {/* Discount Badge Placeholder */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-[#1B4D3E] text-white border border-[#26624F] h-5 w-11 rounded-md z-10" />

                {/* NR Splash Emblem */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 mb-1.5">
                  <img
                    src="/nr-logo.png"
                    alt="NR Enterprises"
                    className="w-full h-full object-contain opacity-75 drop-shadow-[0_2px_12px_rgba(74,16,23,0.35)]"
                  />
                </div>
                <span className="text-[9px] sm:text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#FAF5EB]/80">
                  NR Enterprises
                </span>
              </div>

              {/* Product Info Lines */}
              <div className="w-full flex flex-col items-center space-y-2 pt-1 text-center">
                {/* Category */}
                <div className="h-2.5 w-16 bg-[#8C6B38]/30 rounded-none" />
                {/* Product Name */}
                <div className="h-4 w-36 sm:w-44 bg-[#4A1017]/15 rounded-none" />
                {/* Star Rating */}
                <div className="h-3 w-20 bg-[#4A1017]/20 rounded-none" />
                {/* Price */}
                <div className="h-4 w-24 bg-[#4A1017]/20 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
