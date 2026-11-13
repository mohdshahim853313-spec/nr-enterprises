"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface AboutClientProps {
  initialData: any;
}

export default function AboutClient({ initialData }: AboutClientProps) {
  const aboutData = initialData;

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
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Cloud data with matching cloud defaults
  const tag = aboutData?.hero?.tag || "THE FOUNDER'S PERSPECTIVE";
  const title = aboutData?.hero?.title || "Rooted in Bhadohi. Crafted for the Modern Home.";
  const para1 =
    aboutData?.hero?.para1 ||
    "Growing up in Bhadohi—India’s legendary Carpet City—textiles and hand-braiding weren't just a business; they were a way of life. When I founded NR Enterprises, my vision was simple: bridge centuries of local weaving heritage with conscious, modern innovation.";
  const para2 =
    aboutData?.hero?.para2 ||
    "By eliminating middlemen and operating directly from our own production floor, we ensure that every rPET and jute creation meets uncompromising standards of quality. No retail markups, just honest luxury shipped straight from our looms to your living space.";
  const para3 =
    aboutData?.hero?.para3 ||
    "At NR Enterprises, we take personal pride in every single weave that leaves our Bhadohi floor. By keeping the complete manufacturing process under direct supervision, we promise uncompromising quality, sustainable materials, and honest pricing shipped straight from our looms to your home.";

  const displayImage =
    (typeof aboutData?.footerImage === "string" && aboutData.footerImage.trim()) ||
    (typeof aboutData?.hero?.image === "string" && aboutData.hero.image.trim()) ||
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2B070B] selection:bg-[#4A1017] selection:text-[#FAF5EB]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-3 sm:pt-4 pb-20 sm:pb-28 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto text-center"
      >
        {/* Pill Tag */}
        {tag && (
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EB] border border-[#4A1017]/40 text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C6B38] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B38]" />
              {tag}
            </span>
          </motion.div>
        )}

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl md:text-6xl font-bold font-heading mb-8 sm:mb-10 text-[#2B070B] tracking-tight leading-[1.12]"
        >
          {title}
        </motion.h1>

        {/* Editorial Body Text */}
        <div className="space-y-6 text-[#5A4E42] leading-[1.8] font-normal text-base sm:text-lg max-w-3xl mx-auto mb-14">
          {para1 && (
            <motion.p variants={itemVariants} className="whitespace-pre-line">
              {para1}
            </motion.p>
          )}

          {para2 && (
            <motion.p variants={itemVariants} className="whitespace-pre-line">
              {para2}
            </motion.p>
          )}

          {para3 && (
            <motion.p variants={itemVariants} className="whitespace-pre-line">
              {para3}
            </motion.p>
          )}
        </div>

        {/* 3 Value Pillars in Royal Persian Maroon */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16 text-left">
          <div className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] p-6 rounded-2xl border border-[#4A1017] shadow-md hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(74,16,23,0.52)] transition-all duration-300">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FAF5EB] block mb-2">
              01 • HERITAGE
            </span>
            <h3 className="font-heading font-bold text-lg text-[#FAF5EB] mb-2">Bhadohi Master Looms</h3>
            <p className="text-xs text-[#FAF5EB]/80 leading-relaxed">
              Centuries of generational knotting expertise preserved with ethically compensated artisans.
            </p>
          </div>
          <div className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] p-6 rounded-2xl border border-[#4A1017] shadow-md hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(74,16,23,0.52)] transition-all duration-300">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FAF5EB] block mb-2">
              02 • SUSTAINABLE
            </span>
            <h3 className="font-heading font-bold text-lg text-[#FAF5EB] mb-2">100% Pure Organic</h3>
            <p className="text-xs text-[#FAF5EB]/80 leading-relaxed">
              Virgin New Zealand wool and unbleached golden jute free from synthetic petroleum dyes.
            </p>
          </div>
          <div className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] p-6 rounded-2xl border border-[#4A1017] shadow-md hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(74,16,23,0.52)] transition-all duration-300">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FAF5EB] block mb-2">
              03 • BESPOKE
            </span>
            <h3 className="font-heading font-bold text-lg text-[#FAF5EB] mb-2">Custom Sizing</h3>
            <p className="text-xs text-[#FAF5EB]/80 leading-relaxed">
              Individual custom dimensions, pile heights and shapes tailored for unique living architectures.
            </p>
          </div>
        </motion.div>

        {/* Workshop / Showcase Image */}
        <motion.div variants={itemVariants} className="w-full mb-12">
          <div className="relative w-full h-[380px] sm:h-[480px] md:h-[580px] bg-[#ECE7DE] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#4A1017] shadow-xl group flex items-center justify-center">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={title || "NR Enterprises Workshop"}
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                priority
                quality={92}
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#8C6B38]">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold">
                  Atelier Showcase
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white border border-[#4A1017] px-8 py-3.5 text-xs font-heading font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            Explore Collections
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-[#FAF5EB] hover:bg-[#2B070B] text-[#2B070B] hover:text-white border border-[#4A1017]/40 hover:border-[#4A1017] px-8 py-3.5 text-xs font-heading font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
          >
            Contact Atelier
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
