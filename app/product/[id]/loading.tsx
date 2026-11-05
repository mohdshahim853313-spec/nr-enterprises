import Image from "next/image";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#2B2520] pt-3 sm:pt-3.5 pb-20 animate-in fade-in duration-150">
      
      {/* 🧭 Breadcrumb Navigation Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="h-3.5 w-12 rounded-full animate-shimmer" />
          <span className="text-[#DFD5C6] text-xs">/</span>
          <div className="h-3.5 w-20 rounded-full animate-shimmer" />
          <span className="text-[#DFD5C6] text-xs">/</span>
          <div className="h-3.5 w-24 rounded-full animate-shimmer" />
          <span className="text-[#DFD5C6] text-xs">/</span>
          <div className="h-3.5 w-32 rounded-full animate-shimmer" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ========================================================================= */}
          {/* 🖼️ LEFT COLUMN: IMAGE SHOWCASE SKELETON */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center lg:sticky lg:top-20 xl:top-24 self-start">
            
            {/* Primary Big Frame Container Skeleton */}
            <div className="relative w-full aspect-square sm:aspect-[4/4.2] max-h-[520px] lg:max-h-[580px] rounded-3xl overflow-hidden border border-[#EAEAEB]/70 animate-shimmer shadow-xs flex items-center justify-center">
              {/* Rounded NR Enterprises Brand Logo in Center of Skeleton (Subtle Luxury Watermark) */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/50 backdrop-blur-xs border border-[#EAEAEB]/50 shadow-xs flex items-center justify-center p-3.5 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="NR Enterprises"
                  width={96}
                  height={96}
                  priority={true}
                  className="object-contain rounded-xl w-full h-full opacity-40"
                />
              </div>

              {/* View switch button skeleton */}
              <div className="absolute top-4 left-4 h-7 w-24 rounded-full bg-white/80 border border-[#EAEAEB]/60 shadow-xs" />
            </div>

            {/* Thumbnail Row Skeletons */}
            <div className="flex items-center gap-3 mt-4 w-full overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl animate-shimmer border-2 border-[#C19A6B]/40 shrink-0" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl animate-shimmer border border-[#EAEAEB] shrink-0" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl animate-shimmer border border-[#EAEAEB] shrink-0" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl animate-shimmer border border-[#EAEAEB] shrink-0" />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 🏷️ RIGHT COLUMN: PRODUCT DETAILS & COMMERCE SKELETON */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-start text-left">
            
            {/* Header & Badges */}
            <div className="border-b border-[#EAEAEB] pb-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3.5 w-36 rounded-full animate-shimmer" />
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-[#EAEAEB] animate-shimmer" />
                  <div className="w-9 h-9 rounded-full border border-[#EAEAEB] animate-shimmer" />
                </div>
              </div>

              {/* Title lines */}
              <div className="h-7 sm:h-8 w-4/5 rounded-lg animate-shimmer mb-2.5" />
              <div className="h-5 sm:h-6 w-2/5 rounded-lg animate-shimmer mb-4" />

              {/* Price Line */}
              <div className="flex items-center gap-3 mt-3">
                <div className="h-8 w-32 rounded-lg animate-shimmer" />
                <div className="h-5 w-20 rounded-md animate-shimmer" />
                <div className="h-6 w-40 rounded-full animate-shimmer" />
              </div>
            </div>

            {/* Sizing Selector Skeleton */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3.5 w-28 rounded-full animate-shimmer" />
                <div className="h-3.5 w-32 rounded-full animate-shimmer" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="h-11 rounded-xl animate-shimmer border border-[#EAEAEB]" />
                <div className="h-11 rounded-xl animate-shimmer border border-[#EAEAEB]" />
                <div className="h-11 rounded-xl animate-shimmer border border-[#EAEAEB]" />
                <div className="h-11 rounded-xl animate-shimmer border border-[#EAEAEB]" />
              </div>
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="space-y-3 mb-8">
              <div className="h-13 w-full rounded-full animate-shimmer bg-gradient-to-r from-[#DFD5C6] via-[#EFEBE4] to-[#DFD5C6]" />
              <div className="h-13 w-full rounded-full animate-shimmer bg-gradient-to-r from-[#2B2520]/20 via-[#2B2520]/10 to-[#2B2520]/20" />
            </div>

            {/* Trust Badges 2x2 Grid Skeleton */}
            <div className="border-t border-[#EAEAEB] pt-5 pb-2">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="h-14 rounded-2xl animate-shimmer border border-[#EAEAEB]/70" />
                <div className="h-14 rounded-2xl animate-shimmer border border-[#EAEAEB]/70" />
                <div className="h-14 rounded-2xl animate-shimmer border border-[#EAEAEB]/70" />
                <div className="h-14 rounded-2xl animate-shimmer border border-[#EAEAEB]/70" />
              </div>
            </div>

            {/* Accordion Drawer Skeletons */}
            <div className="border-t border-[#EAEAEB] mt-5 divide-y divide-[#EAEAEB]">
              <div className="py-4 space-y-2">
                <div className="h-4 w-44 rounded-full animate-shimmer" />
                <div className="h-3.5 w-full rounded-md animate-shimmer" />
                <div className="h-3.5 w-4/5 rounded-md animate-shimmer" />
              </div>
              <div className="py-4">
                <div className="h-4 w-52 rounded-full animate-shimmer" />
              </div>
              <div className="py-4">
                <div className="h-4 w-40 rounded-full animate-shimmer" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
