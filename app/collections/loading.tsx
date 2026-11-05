export default function CollectionsLoading() {
  return (
    <div className="bg-[#FAFAFA] pt-3 pb-20 px-3.5 sm:px-6 md:px-10 min-h-screen font-sans text-[#2B2520]">
      <div className="max-w-[1500px] mx-auto">
        {/* 🌟 1. HERO BANNER SKELETON (Exact 1:1 match to loaded banner) */}
        <div className="relative w-full min-h-[220px] md:h-[280px] mb-8 sm:mb-10 rounded-3xl overflow-hidden flex items-center justify-center text-center shadow-lg border border-[#352D26] bg-[#1F1A17] p-6">
          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            {/* Gold Tag Pill Badge */}
            <div className="h-3 w-44 rounded-full bg-[#E5C158]/35 animate-pulse mb-3" />
            {/* Large Banner Title */}
            <div className="h-8 sm:h-12 md:h-14 w-72 sm:w-[480px] md:w-[560px] rounded-2xl bg-white/20 animate-pulse mb-3.5" />
            {/* Subtitle Lines */}
            <div className="h-3.5 sm:h-4 w-64 sm:w-[420px] rounded-full bg-white/10 animate-pulse mb-1.5" />
            <div className="h-3.5 sm:h-4 w-48 sm:w-[300px] rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* 🌟 2. FILTER NAVIGATION BAR SKELETON (Exact 1:1 match) */}
        <div className="relative mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#EAEAEB] pb-4">
          {/* Left: Filters Button */}
          <div className="self-start md:self-auto">
            <div className="flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[#DFD8CC] bg-white shadow-xs">
              <div className="grid grid-cols-2 gap-[3px] w-3.5 h-3.5">
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B2520]" />
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B2520]" />
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B2520]" />
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#2B2520]" />
              </div>
              <span className="text-[11px] sm:text-xs tracking-wider uppercase font-heading font-bold text-[#2B2520]">
                Filters
              </span>
            </div>
          </div>

          {/* Center / Tabs: Shape Category Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full bg-[#2B2520] text-white font-bold shadow-xs">
              ALL
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#7A7065] font-semibold">
              RECTANGLE
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#7A7065] font-semibold">
              ROUND
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#7A7065] font-semibold">
              OVAL
            </div>
            <div className="text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full text-[#7A7065] font-semibold hidden sm:inline-flex">
              RUNNER
            </div>
          </div>
        </div>

        {/* 🌟 3. PRODUCT CARDS GRID SKELETON */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-y-8 sm:gap-y-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              {/* Product Card Image Container */}
              <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#ECE7DE] shadow-xs mb-3 border border-[#EAEAEB]/60">
                {/* Discount Badge Placeholder */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-white/80 border border-[#EAEAEB] h-5 w-11 rounded-full" />
              </div>

              {/* Product Info Lines */}
              <div className="w-full flex flex-col items-center space-y-2 pt-1 text-center">
                {/* Category */}
                <div className="h-2.5 w-16 bg-[#C19A6B]/30 rounded-full" />
                {/* Product Name */}
                <div className="h-4 w-36 sm:w-44 bg-[#DFD8CC] rounded-full" />
                {/* Star Rating */}
                <div className="h-3 w-20 bg-[#E5DDD2] rounded-full" />
                {/* Price */}
                <div className="h-4 w-24 bg-[#DFD8CC] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
