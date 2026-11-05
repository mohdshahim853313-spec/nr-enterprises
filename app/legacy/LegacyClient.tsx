"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { legacyContent as defaultLegacyContent } from "@/lib/siteContent/legacy";

interface LegacyClientProps {
  initialData: any;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function LegacyClient({ initialData }: LegacyClientProps) {
  const legacyData = initialData;

  const hero = {
    title:
      legacyData?.hero?.title &&
      legacyData?.hero?.title !== "Emerald Premium " &&
      legacyData?.hero?.title !== "Emerald Premium."
        ? legacyData.hero.title
        : defaultLegacyContent.hero.title,
    subtitle: legacyData?.hero?.subtitle || defaultLegacyContent.hero.subtitle,
    bgImage:
      legacyData?.hero?.bgImage &&
      typeof legacyData.hero.bgImage === "string" &&
      !legacyData.hero.bgImage.includes("images.unsplash.com/photo-1600166898405")
        ? legacyData.hero.bgImage
        : defaultLegacyContent.hero.bgImage,
    stats: Array.isArray(legacyData?.hero?.stats) && legacyData.hero.stats.length > 0
      ? legacyData.hero.stats
      : defaultLegacyContent.hero.stats,
  };

  const intro = {
    tag: legacyData?.intro?.tag || defaultLegacyContent.intro.tag,
    quote: legacyData?.intro?.quote || defaultLegacyContent.intro.quote,
    description: legacyData?.intro?.description || defaultLegacyContent.intro.description,
  };

  const craftsmanship = {
    tag: legacyData?.craftsmanship?.tag || defaultLegacyContent.craftsmanship.tag,
    title: legacyData?.craftsmanship?.title || defaultLegacyContent.craftsmanship.title,
    subtitle: legacyData?.craftsmanship?.subtitle || defaultLegacyContent.craftsmanship.subtitle,
    stages: Array.isArray(legacyData?.craftsmanship?.stages) && legacyData.craftsmanship.stages.length > 0
      ? legacyData.craftsmanship.stages
      : defaultLegacyContent.craftsmanship.stages,
  };

  const disciplines = {
    tag: legacyData?.disciplines?.tag || defaultLegacyContent.disciplines.tag,
    title: legacyData?.disciplines?.title || defaultLegacyContent.disciplines.title,
    subtitle: legacyData?.disciplines?.subtitle || defaultLegacyContent.disciplines.subtitle,
    items: Array.isArray(legacyData?.disciplines?.items) && legacyData.disciplines.items.length > 0
      ? legacyData.disciplines.items
      : defaultLegacyContent.disciplines.items,
  };

  const promise = {
    tag: legacyData?.promise?.tag || defaultLegacyContent.promise.tag,
    title: legacyData?.promise?.title || defaultLegacyContent.promise.title,
    subtitle: legacyData?.promise?.subtitle || defaultLegacyContent.promise.subtitle,
    retailPoints: Array.isArray(legacyData?.promise?.retailPoints) && legacyData.promise.retailPoints.length > 0
      ? legacyData.promise.retailPoints
      : defaultLegacyContent.promise.retailPoints,
    nrEnterprisesPoints: Array.isArray(legacyData?.promise?.nrEnterprisesPoints) && legacyData.promise.nrEnterprisesPoints.length > 0
      ? legacyData.promise.nrEnterprisesPoints
      : defaultLegacyContent.promise.nrEnterprisesPoints,
  };

  const bespokeCta = {
    tag: legacyData?.bespokeCta?.tag || defaultLegacyContent.bespokeCta.tag,
    title: legacyData?.bespokeCta?.title || defaultLegacyContent.bespokeCta.title,
    description: legacyData?.bespokeCta?.description || defaultLegacyContent.bespokeCta.description,
    btnText: legacyData?.bespokeCta?.btnText || defaultLegacyContent.bespokeCta.btnText,
    btnLink: legacyData?.bespokeCta?.btnLink || defaultLegacyContent.bespokeCta.btnLink,
    whatsappText: legacyData?.bespokeCta?.whatsappText || defaultLegacyContent.bespokeCta.whatsappText,
    whatsappNumber: legacyData?.bespokeCta?.whatsappNumber || defaultLegacyContent.bespokeCta.whatsappNumber,
  };

  const heroBg = hero.bgImage;

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-[#1F1A17] overflow-x-hidden selection:bg-[#C19A6B] selection:text-white">
      {/* =========================================================================
          🌟 1. CINEMATIC ATELIER HERO (Luminous Warm Editorial)
         ========================================================================= */}
      <section className="relative w-full min-h-[70vh] md:min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#221D1A]">
        {heroBg && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt={hero.title}
              fill
              priority
              quality={92}
              sizes="100vw"
              className="object-cover object-center brightness-[0.92] contrast-[1.02]"
            />
            {/* Soft, Balanced Ambient Overlay - No heavy dark shadow */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/55" />
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto py-16 sm:py-20 flex flex-col items-center"
        >
          {/* Majestic Hero Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-bold font-heading text-white mb-4 tracking-tight leading-[1.06] drop-shadow-md"
          >
            {hero.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-white/90 font-normal tracking-[0.03em] text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm"
          >
            {hero.subtitle}
          </motion.p>

          {/* Provenance Key Pillars - Clean White & Neutral without yellow */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-3xl"
          >
            {hero.stats.map((stat: any, idx: number) => (
              <div
                key={idx}
                className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl py-3.5 px-3 text-center shadow-sm"
              >
                <span className="block text-base sm:text-xl font-bold font-heading text-white">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-[11px] text-white/80 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* =========================================================================
          🌟 2. THE ATELIER MANIFESTO (Warm Editorial Storytelling)
         ========================================================================= */}
      <section className="relative w-full py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="text-center"
        >
          <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.25em] text-[#C19A6B] block mb-3 font-heading">
            {intro.tag}
          </span>

          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#1F1A17] mb-6 leading-snug tracking-tight max-w-3xl mx-auto"
          >
            &ldquo;{intro.quote}&rdquo;
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="w-16 h-[2px] bg-[#C19A6B] mx-auto mb-6 rounded-full"
          />

          <motion.p
            variants={itemVariants}
            className="text-[#4A4036] text-[15px] sm:text-[17px] leading-[1.85] font-normal max-w-3xl mx-auto whitespace-pre-line text-justify sm:text-center"
          >
            {intro.description}
          </motion.p>
        </motion.div>
      </section>

      {/* =========================================================================
          🌟 3. THE 4 STAGES OF CRAFTSMANSHIP (Step-by-Step Artisanal Journey)
         ========================================================================= */}
      <section className="w-full bg-[#F4EEE6] py-14 sm:py-20 px-4 sm:px-6 md:px-10 border-y border-[#E9E0D4]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-10 sm:mb-14 max-w-4xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#A87B45] block mb-2 font-heading">
              {craftsmanship.tag}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#1F1A17] mb-3 tracking-tight">
              {craftsmanship.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5C5247] leading-relaxed max-w-2xl mx-auto">
              {craftsmanship.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {craftsmanship.stages.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DEC0]/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Visual Step Image */}
                <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#ECE7DE] mb-4">
                  <SafeImage
                    src={item.img}
                    alt={item.title}
                    fill
                    quality={85}
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white font-heading font-bold text-[11px] px-2.5 py-1 rounded-full border border-white/10">
                    STAGE {item.step}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-[#1F1A17] mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[#5C5247] text-xs sm:text-[13px] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          🌟 4. THE 4 SACRED LOOM TECHNIQUES (High-End Gallery Grid)
         ========================================================================= */}
      <section className="w-full py-14 sm:py-20 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
        <div className="text-center mb-10 sm:mb-14 max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2 font-heading">
            {disciplines.tag}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#1F1A17] mb-3 tracking-tight">
            {disciplines.title}
          </h2>
          <p className="text-sm sm:text-base text-[#5C5247] leading-relaxed max-w-2xl mx-auto">
            {disciplines.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {disciplines.items.map((tech: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: idx * 0.12 }}
              className="relative group rounded-2xl overflow-hidden h-[390px] sm:h-[420px] lg:h-[450px] bg-[#ECE7DE] border border-[#E5DACB] shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <SafeImage
                src={tech.img}
                alt={tech.title}
                fill
                quality={88}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.82]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex flex-col justify-end">
                <span className="inline-block self-start bg-[#C19A6B] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2.5 shadow-xs">
                  {tech.badge}
                </span>

                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2 leading-tight">
                  {tech.title}
                </h3>

                <p className="text-[#EADCC7] text-xs leading-relaxed mb-3 line-clamp-3">
                  {tech.desc}
                </p>

                <Link
                  href={tech.link}
                  className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-white hover:text-[#C19A6B] transition-colors pt-1"
                >
                  <span>Explore Styles</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          🌟 5. DIRECT ATELIER PROMISE (Transparent Maker Luxury)
         ========================================================================= */}
      <section className="w-full bg-[#1F1A17] text-white py-14 sm:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2 font-heading">
              {promise.tag}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-3 tracking-tight">
              {promise.title}
            </h2>
            <p className="text-[#D8C4A9] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {promise.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Traditional Retail */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2 font-heading">
                  TRADITIONAL LUXURY RETAIL
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-4">
                  Multiple Middlemen Markups
                </h3>
                <ul className="space-y-3 text-sm text-[#D8C4A9]">
                  {promise.retailPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* NR Enterprises Atelier */}
            <div className="bg-[#C19A6B]/15 border-2 border-[#C19A6B] rounded-2xl p-6 sm:p-8 backdrop-blur-xs flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C19A6B] font-heading">
                    THE NR ENTERPRISES PROMISE
                  </span>
                  <span className="bg-[#C19A6B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    100% Direct
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-4">
                  Artisan Maker Transparency
                </h3>
                <ul className="space-y-3 text-sm text-white/90">
                  {(promise.nrEnterprisesPoints || []).map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#C19A6B] font-bold">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          🌟 6. BESPOKE COMMISSION CTA (Private Atelier Concierge)
         ========================================================================= */}
      <section className="w-full bg-[#1A1613] py-16 sm:py-24 px-4 sm:px-6 text-center border-t border-white/10">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#C19A6B] block mb-3">
            {bespokeCta.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-4 tracking-tight">
            {bespokeCta.title}
          </h2>
          <p className="text-[#D8C4A9] text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
            {bespokeCta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href={bespokeCta.btnLink || "/customize"}
              className="bg-[#C19A6B] hover:bg-white text-white hover:text-[#1F1A17] px-9 py-3.5 text-xs font-heading font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer w-full sm:w-auto"
            >
              {bespokeCta.btnText || "Start Custom Sizing"}
            </Link>

            <a
              href={`https://wa.me/${bespokeCta.whatsappNumber || "918874585277"}?text=Hello%20NR Enterprises%20Atelier,%20I%20would%20like%20to%20discuss%20a%20bespoke%20rug%20commission.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent hover:bg-white/10 text-white border border-white/25 px-8 py-3.5 text-xs font-heading font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-300 cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <span>{bespokeCta.whatsappText || "WhatsApp Concierge"}</span>
              <span>💬</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
