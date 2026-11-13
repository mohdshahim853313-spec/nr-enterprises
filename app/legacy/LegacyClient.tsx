"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";

interface StoryProps {
  initialData?: any;
}

export default function LegacyClient({ initialData }: StoryProps) {
  const [activeMediaFilter, setActiveMediaFilter] = useState<"all" | "looms" | "artisan" | "fibers">("all");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<any | null>(null);

  // 📖 Chapter Milestones Data (Bhadohi Roots -> Today)
  const chapters = [
    {
      era: "CHAPTER I • 1970s",
      year: "1972",
      title: "The Solitary Pit Loom of Bhadohi",
      tagline: "Where the ancestral rhythm of wool and wooden shuttles began.",
      story:
        "In the quiet labyrinthine lanes of Bhadohi, Uttar Pradesh, our grandfather anchored a single wooden pit-loom in the shaded courtyard of our ancestral home. Here, master weaving was never treated as automated commerce—it was sacred prayer. Every skein of hand-spun raw wool was hand-graded by touch, and every knot honored a lineage spanning over four centuries of Mughal court weavers.",
      quote: "A true carpet is not merely laid upon a floor; it holds the silent patience of hands that refused to hurry.",
      img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
      badge: "Ancestral Origins",
      stats: { primary: "1 Loom", secondary: "Pure Hand-Knotted" },
    },
    {
      era: "CHAPTER II • 1990s",
      year: "1994",
      title: "Mastery of Natural Herbs & Solar Patina",
      tagline: "The alchemy of sun, river water, and sacred vegetable dyes.",
      story:
        "As the atelier expanded, we pioneered traditional herb-infused textile cleansing and sun-curing across open brick terraces. Pure rainwater and organic plant infusions unlocked an iridescent natural luster in long-staple New Zealand wool that synthetic chemical washes could never replicate. International patrons began discovering our private workshop through word of mouth.",
      quote: "The sun in Bhadohi doesn't merely dry wool; it sets the immortal soul into every fiber.",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      badge: "Solar Patina Alchemy",
      stats: { primary: "40+ Looms", secondary: "100% Organic Dyes" },
    },
    {
      era: "CHAPTER III • 2010s",
      year: "2012",
      title: "Architectural 3D Shearing & Organic Jute",
      tagline: "Sculpting tactile landscapes for avant-garde interior spaces.",
      story:
        "With architectural minimalism transforming modern homes, our generational weavers mastered tactile 3D relief carving using specialized curved hand-shears. Braided organic golden jute from Bengal and sustainable plant fibers were woven into concentric spirals and organic contours—redefining rugs as sculptural flooring.",
      quote: "We do not simply make rugs; we sculpt architectural grounding for mindful living.",
      img: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80",
      badge: "Sculptural Innovation",
      stats: { primary: "150+ Artisans", secondary: "Hand-Carved Relief" },
    },
    {
      era: "CHAPTER IV • PRESENT DAY",
      year: "2026",
      title: "Direct from the Loom to Global Sanctuaries",
      tagline: "Eliminating the 800% middleman markup with absolute maker transparency.",
      story:
        "Today, NR Enterprises brings authentic museum-grade Bhadohi craftsmanship directly to homes worldwide. By cutting out luxury boutiques, distributors, and importer markups, we ensure fair master artisan compensation, certified sustainable rPET and organic fibers, and unmatched bespoke tailoring for your home.",
      quote: "Direct maker integrity: Honest pricing, fair artisan wages, and carpets built to outlive generations.",
      img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      badge: "Maker to Sanctuary",
      stats: { primary: "400+ Master Looms", secondary: "Zero Middlemen" },
    },
  ];

  // 🖼️ Interactive Gallery Items
  const galleryItems = [
    {
      category: "looms",
      title: "Traditional Wooden Pit-Loom",
      subtitle: "Where generational tension and hand-knotting unfold",
      img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
      tag: "Heritage Craft",
    },
    {
      category: "artisan",
      title: "Precision 3D Pile Sculpting",
      subtitle: "Curved shearing scissors creating high-low relief",
      img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      tag: "Artisan Hands",
    },
    {
      category: "fibers",
      title: "Organic Bengal Golden Jute",
      subtitle: "Hand-braided sustainable plant cords with organic tensile strength",
      img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      tag: "Natural Fibers",
    },
    {
      category: "artisan",
      title: "Solar Patio Textile Curing",
      subtitle: "Natural courtyard curing under the warm Indian sun",
      img: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80",
      tag: "Ancient Alchemy",
    },
    {
      category: "looms",
      title: "Reversible Dhurrie Weft Tightening",
      subtitle: "Heavy wooden combs striking each weft into tight alignment",
      img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      tag: "Heritage Weft",
    },
    {
      category: "fibers",
      title: "Recycled Eco-PET & Pure NZ Wool",
      subtitle: "Plush, stain-resistant yarns spun for mindful luxury living",
      img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      tag: "Conscious Materials",
    },
  ];

  const filteredGallery = galleryItems.filter((item) =>
    activeMediaFilter === "all" ? true : item.category === activeMediaFilter
  );

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-[#2B070B] overflow-x-hidden selection:bg-[#4A1017] selection:text-[#FAF5EB]">
      {/* =========================================================================
          🌟 1. HERO SHOWCASE: THE STORY OF SACRED THREADS
         ========================================================================= */}
      <section className="relative w-full min-h-[75vh] md:min-h-[82vh] flex items-center justify-center overflow-hidden bg-[#240609] border-b border-[#4A1017]">
        {/* Background Ambience */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
            alt="NR Enterprises Bhadohi Heritage"
            fill
            priority
            quality={92}
            sizes="100vw"
            className="object-cover object-center brightness-[0.78] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#240609]/85 via-[#2B070B]/70 to-[#240609]/95" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto py-20 flex flex-col items-center">
          {/* Warm Ivory Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#350A10]/90 border border-[#FAF5EB]/30 text-[#FAF5EB] text-[10.5px] sm:text-xs font-heading font-bold uppercase tracking-[0.28em] mb-4 shadow-lg backdrop-blur-md"
          >
            <span>✦</span>
            <span>FOUR DECADES OF DEVOTION</span>
            <span>✦</span>
          </motion.div>

          {/* Grand Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold font-heading text-white mb-5 tracking-tight leading-[1.08] drop-shadow-lg"
          >
            Our Story. <br />
            <span className="font-serif italic font-normal text-[#FAF5EB]">Born at the Loom.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[#FAF5EB]/90 font-normal text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            How a humble pit-loom in Bhadohi evolved into an internationally revered atelier crafting
            honest, sustainable floor sculptures for the modern world.
          </motion.p>

          {/* Key Provenance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl"
          >
            {[
              { val: "1972", label: "Founded at the Loom" },
              { val: "400+", label: "Master Pit Looms" },
              { val: "100%", label: "Fair Maker Wages" },
              { val: "Zero", label: "Middlemen Markups" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#2D080C]/85 backdrop-blur-md border border-[#4A1017] rounded-2xl py-4 px-3 text-center shadow-md hover:border-[#FAF5EB]/40 transition-colors"
              >
                <span className="block text-xl sm:text-2xl font-bold font-heading text-[#FAF5EB] mb-0.5">
                  {stat.val}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#FAF5EB]/80 uppercase tracking-wider font-semibold block">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          🌟 2. THE ATELIER MANIFESTO (Editorial Quote & Philosophy)
         ========================================================================= */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6B38] block mb-3 font-heading">
            THE ATELIER PHILOSOPHY
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#2B070B] mb-6 leading-snug tracking-tight max-w-3xl mx-auto">
            &ldquo;In a world of automated fast-furnishings, we choose the deliberate, unhurried
            cadence of human hands and natural fibers.&rdquo;
          </h2>

          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#4A1017] to-transparent mx-auto mb-8" />

          <p className="text-[#5A4E42] text-[15px] sm:text-[17px] leading-[1.85] font-normal max-w-3xl mx-auto text-justify sm:text-center">
            For generations, the weavers of Bhadohi have carried an ancestral intuition for wool tension,
            fiber elasticity, and sacred geometric rhythm. At NR Enterprises, we reject the industrialization
            that turns floor textiles into disposable commodities. Every creation begins with virgin fibers,
            patient hands, and an unyielding commitment to longevity.
          </p>
        </div>
      </section>

      {/* =========================================================================
          🌟 3. CHAPTER TIMELINE: FROM 1972 TO THE MODERN SANCTUARY
         ========================================================================= */}
      <section className="w-full bg-[#FAF5EB] py-16 sm:py-24 px-4 sm:px-6 md:px-10 border-y border-[#4A1017]/15">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6B38] block mb-2 font-heading">
              A GENERATIONAL ODYSSEY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[#2B070B] mb-3 tracking-tight">
              Chapters of Our Craft
            </h2>
            <p className="text-sm sm:text-base text-[#5A4E42] leading-relaxed">
              Trace the evolution of our Bhadohi loom atelier from a humble courtyard pit-loom to a
              direct-to-patron global movement.
            </p>
          </div>

          {/* Timeline Vertical Track with Alternating Editorial Cards */}
          <div className="relative space-y-12 sm:space-y-20">
            {/* Center Timeline Track (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-8 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#FAF5EB]/40 via-[#4A1017]/50 to-[#FAF5EB]/40" />

            {chapters.map((chapter, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col md:flex-row items-center gap-8 lg:gap-14 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline Central Year Marker Pill */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#2B070B] text-[#FAF5EB] border-2 border-[#FAF5EB]/60 items-center justify-center font-heading font-bold text-xs shadow-md">
                    {chapter.year}
                  </div>

                  {/* Left / Right 1: Visual Image Card */}
                  <div className="w-full md:w-1/2">
                    <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#ECE7DE] border border-[#4A1017]/20 shadow-md hover:shadow-xl transition-all duration-500">
                      <SafeImage
                        src={chapter.img}
                        alt={chapter.title}
                        fill
                        quality={90}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#240609]/75 via-transparent to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <span className="absolute top-4 left-4 bg-[#2B070B]/90 backdrop-blur-md text-[#FAF5EB] border border-[#4A1017] text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                        {chapter.badge}
                      </span>

                      {/* Bottom Metric Pill */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#FAF5EB] font-heading font-semibold bg-[#240609]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#4A1017]">
                        <span className="text-[#FAF5EB] font-bold">{chapter.stats.primary}</span>
                        <span className="text-[#FAF5EB]/80">{chapter.stats.secondary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Left / Right 2: Editorial Story Text */}
                  <div className="w-full md:w-1/2 text-left space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#4A1017]">
                        {chapter.era}
                      </span>
                      <span className="md:hidden text-xs bg-[#2B070B] text-[#FAF5EB] px-2 py-0.5 rounded-full font-bold border border-[#4A1017]">
                        {chapter.year}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B070B] leading-tight">
                      {chapter.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-medium text-[#8C6B38] italic">
                      {chapter.tagline}
                    </p>

                    <p className="text-sm sm:text-[15px] text-[#5A4E42] leading-relaxed">
                      {chapter.story}
                    </p>

                    {/* Pull Quote Box */}
                    <div className="p-4 bg-white rounded-2xl border-l-4 border-[#4A1017] shadow-xs text-xs sm:text-[13px] text-[#2B070B] italic font-serif leading-relaxed">
                      &ldquo;{chapter.quote}&rdquo;
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          🌟 4. THE ATELIER WORKSHOP: INTERACTIVE GALLERY & CRAFT
         ========================================================================= */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
        <div className="text-center mb-10 sm:mb-12 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6B38] block mb-2 font-heading">
            BEHIND THE LOOM
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[#2B070B] mb-3 tracking-tight">
            The Living Workshop Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#5A4E42] leading-relaxed">
            Witness the intricate processes that transform virgin plant and woolen fibers into heirloom floor pieces.
          </p>

          {/* Media Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "all", label: "All Insights" },
              { id: "looms", label: "Master Looms" },
              { id: "artisan", label: "Artisan Hands" },
              { id: "fibers", label: "Sustainable Fibers" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMediaFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeMediaFilter === tab.id
                    ? "bg-[#2B070B] text-[#FAF5EB] shadow-xs border border-[#4A1017]"
                    : "bg-white text-[#5A4E42] hover:text-[#2B070B] border border-[#4A1017]/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6-Item Masonry/Grid Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredGallery.map((item, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              onClick={() => setSelectedGalleryItem(item)}
              className="group relative h-[320px] sm:h-[360px] rounded-3xl overflow-hidden bg-[#240609] border border-[#4A1017]/25 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <SafeImage
                src={item.img}
                alt={item.title}
                fill
                quality={88}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.9]"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#240609]/95 via-[#240609]/40 to-transparent pointer-events-none" />

              {/* Tag Badge */}
              <span className="absolute top-4 left-4 bg-[#2B070B]/90 backdrop-blur-md text-[#FAF5EB] text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#4A1017]">
                {item.tag}
              </span>

              {/* Bottom Info */}
              <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col justify-end">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[#FAF5EB]/80 text-xs line-clamp-2 mb-2 font-normal">
                  {item.subtitle}
                </p>
                <span className="text-[11px] font-heading font-bold text-[#FAF5EB] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <span>→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          🌟 5. PROVENANCE COMPARISON: DIRECT MAKER VS RETAIL MARKUP
         ========================================================================= */}
      <section className="w-full bg-[#240609] text-white py-16 sm:py-24 px-4 sm:px-6 md:px-10 border-t border-[#4A1017]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#FAF5EB]/80 block mb-2 font-heading">
              FAIR PROVENANCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-3 tracking-tight">
              Direct from the Loom to Your Sanctuary
            </h2>
            <p className="text-[#FAF5EB]/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Why traditional luxury stores charge 5x to 8x the price, and how NR Enterprises ensures
              direct maker pricing without compromising master quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Retail Card */}
            <div className="bg-[#2D080C]/60 border border-[#4A1017] rounded-3xl p-6 sm:p-8 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FAF5EB]/60 block mb-2 font-heading">
                  TRADITIONAL BOUTIQUE MODEL
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-5">
                  Layered Middlemen Markups
                </h3>
                <ul className="space-y-3.5 text-sm text-[#FAF5EB]/70">
                  {[
                    "500% to 800% importer, distributor & boutique retail markup",
                    "Mass warehouse storage with months of aged inventory",
                    "Unknown artisan origin and synthetic fiber blending",
                    "Aggressive sales overhead pass-through to customer",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-400 font-bold text-base shrink-0">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* NR Enterprises Maker Card */}
            <div className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] border-2 border-[#FAF5EB]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xs flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FAF5EB] font-heading">
                    THE NR ENTERPRISES ATELIER
                  </span>
                  <span className="bg-[#4A1017] text-[#FAF5EB] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase border border-[#FAF5EB]/30">
                    100% Direct
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-5">
                  Artisan Maker Transparency
                </h3>
                <ul className="space-y-3.5 text-sm text-white/95">
                  {[
                    "Direct weaver pricing with zero retail markup",
                    "Handcrafted on-demand in Bhadohi, India with sustainable fibers",
                    "100% certified fair wages and authentic craft preservation",
                    "Direct line of communication with our master loom team",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#FAF5EB] font-bold text-base shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          🌟 6. ATELIER INQUIRY / CONCIERGE BANNER
         ========================================================================= */}
      <section className="w-full bg-[#1F0508] py-16 sm:py-24 px-4 sm:px-6 text-center border-t border-[#4A1017]">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#FAF5EB]/80 block mb-3">
            PRIVATE CONCIERGE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-4 tracking-tight">
            Bring a Sacred Piece to Your Home
          </h2>
          <p className="text-[#FAF5EB]/80 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
            Whether selecting an artisanal creation from our collection or inquiring about loom
            availability, our Bhadohi atelier concierge is at your service.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/collections"
              className="bg-[#FAF5EB] hover:bg-white text-[#240609] px-9 py-3.5 text-xs font-heading font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer w-full sm:w-auto"
            >
              Explore In-Stock Rugs
            </Link>

            <a
              href="https://wa.me/919151452441?text=Hello%20NR%20Enterprises%20Atelier,%20I%20am%20interested%20in%20learning%20more%20about%20your%20story%20and%20handcrafted%20rugs."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white border border-[#4A1017] px-8 py-3.5 text-xs font-heading font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-300 cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <span>WhatsApp Concierge</span>
              <span>💬</span>
            </a>
          </div>
        </div>
      </section>

      {/* 🌟 LIGHTBOX MODAL FOR GALLERY ITEM */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelectedGalleryItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#240609] border border-[#4A1017] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white"
            >
              <div className="relative aspect-4/3 w-full bg-[#1A0406]">
                <SafeImage
                  src={selectedGalleryItem.img}
                  alt={selectedGalleryItem.title}
                  fill
                  quality={95}
                  sizes="600px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedGalleryItem(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#2B070B]/90 text-white border border-[#4A1017] flex items-center justify-center cursor-pointer hover:bg-[#FAF5EB] hover:text-[#240609] transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-heading font-bold text-[#FAF5EB] block mb-1">
                  {selectedGalleryItem.tag}
                </span>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  {selectedGalleryItem.title}
                </h3>
                <p className="text-sm text-[#FAF5EB]/80 leading-relaxed">
                  {selectedGalleryItem.subtitle}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
