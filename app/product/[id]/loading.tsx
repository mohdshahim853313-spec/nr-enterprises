import Image from "next/image";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B070B] pt-3 sm:pt-3.5 pb-20 animate-in fade-in duration-150">
      
      {/* 🧭 Breadcrumb Navigation Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="h-3.5 w-12 rounded-full bg-[#4A1017]/15 animate-shimmer" />
          <span className="text-[#4A1017]/30 text-xs">/</span>
          <div className="h-3.5 w-20 rounded-full bg-[#4A1017]/15 animate-shimmer" />
          <span className="text-[#4A1017]/30 text-xs">/</span>
          <div className="h-3.5 w-24 rounded-full bg-[#4A1017]/15 animate-shimmer" />
          <span className="text-[#4A1017]/30 text-xs">/</span>
          <div className="h-3.5 w-32 rounded-full bg-[#4A1017]/15 animate-shimmer" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ========================================================================= */}
          {/* 🖼️ LEFT COLUMN: IMAGE SHOWCASE SKELETON */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-center lg:sticky lg:top-20 xl:top-24 self-start">
            
            {/* Primary Big Frame Container Skeleton */}
            <div className="relative w-full aspect-square sm:aspect-[4/4.2] max-h-[520px] lg:max-h-[580px] rounded-xl overflow-hidden border border-[#4A1017]/20 bg-[#ECE7DE] shadow-xs flex items-center justify-center">
              {/* Square NR Enterprises Brand Logo in Center of Skeleton */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/50 backdrop-blur-xs border border-[#4A1017]/20 shadow-xs flex items-center justify-center p-3.5 overflow-hidden">
                <Image
                  src="/nr-logo.png"
                  alt="NR Enterprises"
                  width={96}
                  height={96}
                  priority={true}
                  className="object-contain w-full h-full opacity-40"
                />
              </div>

              {/* View switch button skeleton */}
              <div className="absolute top-4 left-4 h-7 w-24 rounded-lg bg-[#2B070B] text-[#FAF5EB] border border-[#4A1017] shadow-xs" />
            </div>

            {/* Thumbnail Row Skeletons */}
            <div className="flex items-center gap-3 mt-4 w-full overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#ECE7DE] border-2 border-[#4A1017] shrink-0" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#ECE7DE] border border-[#4A1017]/20 shrink-0" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#ECE7DE] border border-[#4A1017]/20 shrink-0" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#ECE7DE] border border-[#4A1017]/20 shrink-0" />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 🏷️ RIGHT COLUMN: PRODUCT DETAILS & COMMERCE SKELETON */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-start text-left">
            
            {/* Header & Badges */}
            <div className="border-b border-[#4A1017]/20 pb-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3.5 w-36 rounded-full bg-[#8C6B38]/30 animate-shimmer" />
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl border border-[#4A1017]/20 bg-white" />
                  <div className="w-9 h-9 rounded-xl border border-[#4A1017]/20 bg-white" />
                </div>
              </div>

              {/* Title lines */}
              <div className="h-7 sm:h-8 w-4/5 rounded-lg bg-[#4A1017]/15 mb-2.5" />
              <div className="h-5 sm:h-6 w-2/5 rounded-lg bg-[#4A1017]/10 mb-4" />

              {/* Price Line */}
              <div className="flex items-center gap-3 mt-3">
                <div className="h-8 w-32 rounded-lg bg-[#2B070B]/20" />
                <div className="h-5 w-20 rounded-md bg-[#4A1017]/15" />
                <div className="h-6 w-40 rounded-full bg-[#4A1017]/15" />
              </div>
            </div>

            {/* Sizing Selector Skeleton */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3.5 w-28 rounded-full bg-[#4A1017]/15" />
                <div className="h-3.5 w-32 rounded-full bg-[#8C6B38]/25" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="h-11 rounded-xl border border-[#4A1017]/20 bg-[#FAF5EB]" />
                <div className="h-11 rounded-xl border border-[#4A1017]/20 bg-[#FAF5EB]" />
                <div className="h-11 rounded-xl border border-[#4A1017]/20 bg-[#FAF5EB]" />
                <div className="h-11 rounded-xl border border-[#4A1017]/20 bg-[#FAF5EB]" />
              </div>
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="space-y-3 mb-8">
              <div className="h-13 w-full rounded-xl bg-[#2B070B] border border-[#4A1017]" />
              <div className="h-13 w-full rounded-xl bg-[#C19A6B]/30 border border-[#C19A6B]/40" />
              <div className="h-11 w-full rounded-xl bg-[#F1641E]/20 border border-[#F1641E]/30" />
            </div>

            {/* Trust Badges 2x2 Grid Skeleton */}
            <div className="border-t border-[#4A1017]/20 pt-5 pb-2">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="h-14 rounded-xl bg-white border border-[#4A1017]/20" />
                <div className="h-14 rounded-xl bg-white border border-[#4A1017]/20" />
                <div className="h-14 rounded-xl bg-white border border-[#4A1017]/20" />
                <div className="h-14 rounded-xl bg-white border border-[#4A1017]/20" />
              </div>
            </div>

            {/* Accordion Drawer Skeletons */}
            <div className="border-t border-[#4A1017]/20 mt-5 divide-y divide-[#4A1017]/15">
              <div className="py-4 space-y-2">
                <div className="h-4 w-44 rounded-md bg-[#4A1017]/20" />
                <div className="h-3.5 w-full rounded-md bg-[#4A1017]/10" />
                <div className="h-3.5 w-4/5 rounded-md bg-[#4A1017]/10" />
              </div>
              <div className="py-4">
                <div className="h-4 w-52 rounded-md bg-[#4A1017]/20" />
              </div>
              <div className="py-4">
                <div className="h-4 w-40 rounded-md bg-[#4A1017]/20" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
