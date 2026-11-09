"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/SafeImage";
import { useCurrency } from "@/context/CurrencyContext";

export interface StackedCardProduct {
  id: string;
  name: string;
  badge?: string;
  rating?: number;
  price: number | string;
  originalPrice?: number | string;
  img: string;
  link?: string;
  tag?: string;
  colors?: any;
}

interface StackedCardsDeckProps {
  items: StackedCardProduct[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  defaultCategoryLink?: string;
  autoPlayInterval?: number;
  subTitle?: string;
}

const cardVariants: any = {
  exit: (dir: "left" | "right") => ({
    x: dir === "left" ? -460 : 460,
    rotate: dir === "left" ? -18 : 18,
    scale: 0.88,
    opacity: 0,
    zIndex: 35,
    transition: { duration: 0.32, ease: [0.25, 1, 0.5, 1] },
  }),
};

export default function StackedCardsDeck({
  items,
  wishlist,
  onToggleWishlist,
  defaultCategoryLink = "/collections",
  autoPlayInterval = 4500,
  subTitle = "Handcrafted in Bhadohi",
}: StackedCardsDeckProps) {
  const { formatPrice } = useCurrency();
  const containerRef = useRef<HTMLDivElement>(null);

  // Circular pool of cards
  const initialPool = useMemo(() => {
    if (!items || items.length === 0) return [];
    let pool: Array<StackedCardProduct & { _deckId: string }> = [];
    let copyIdx = 0;
    while (pool.length < 12) {
      for (const item of items) {
        pool.push({
          ...item,
          _deckId: `${item.id}-c${copyIdx}-${Math.random().toString(36).slice(2, 6)}`,
        });
        copyIdx++;
      }
    }
    return pool;
  }, [items]);

  const [cards, setCards] = useState<Array<StackedCardProduct & { _deckId: string }>>(() => initialPool);
  const [exitDirection, setExitDirection] = useState<"left" | "right">("left");
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const isBusyRef = useRef(false);

  // Sync if source items change
  useEffect(() => {
    setCards(initialPool);
  }, [initialPool]);

  // Only run auto-play when visible in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Slide Next
  const handleNext = () => {
    if (isBusyRef.current || cards.length <= 1) return;
    isBusyRef.current = true;
    setExitDirection("left");

    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });

    setTimeout(() => {
      isBusyRef.current = false;
    }, 350);
  };

  // Slide Prev
  const handlePrev = () => {
    if (isBusyRef.current || cards.length <= 1) return;
    isBusyRef.current = true;
    setExitDirection("right");

    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });

    setTimeout(() => {
      isBusyRef.current = false;
    }, 350);
  };

  // Auto-slide loop only when in viewport and not paused
  useEffect(() => {
    if (isPaused || !isInView || cards.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, isInView, cards.length, autoPlayInterval]);

  if (!cards || cards.length === 0) return null;

  const visibleCards = cards.slice(0, 3);
  const activeProduct = cards[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center select-none py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 🌟 3D Card Deck Container */}
      <div className="relative w-[84vw] max-w-[340px] aspect-[3/4.2] mx-auto">
        <AnimatePresence mode="popLayout" custom={exitDirection}>
          {visibleCards.map((card, idx) => {
            const isFront = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <motion.div
                key={card._deckId}
                custom={exitDirection}
                drag={isFront ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50 || info.velocity.x < -300) {
                    handleNext();
                  } else if (info.offset.x > 50 || info.velocity.x > 300) {
                    handlePrev();
                  }
                }}
                initial={
                  isFront
                    ? exitDirection === "left"
                      ? { x: 30, scale: 0.92, rotate: 3, opacity: 0.85 }
                      : { x: -30, scale: 0.92, rotate: -3, opacity: 0.85 }
                    : isSecond
                    ? { x: 0, scale: 0.86, rotate: 0, opacity: 0.6 }
                    : { x: -30, scale: 0.8, rotate: -3, opacity: 0 }
                }
                animate={
                  isFront
                    ? {
                        x: 0,
                        y: 0,
                        scale: 1,
                        rotate: 0,
                        opacity: 1,
                        zIndex: 30,
                        transition: { duration: 0.32, ease: [0.25, 1, 0.5, 1] },
                      }
                    : isSecond
                    ? {
                        x: 30,
                        y: 0,
                        scale: 0.92,
                        rotate: 3,
                        opacity: 0.85,
                        zIndex: 20,
                        transition: { duration: 0.32, ease: [0.25, 1, 0.5, 1] },
                      }
                    : {
                        x: -30,
                        y: 0,
                        scale: 0.86,
                        rotate: -3,
                        opacity: 0.7,
                        zIndex: 10,
                        transition: { duration: 0.32, ease: [0.25, 1, 0.5, 1] },
                      }
                }
                variants={cardVariants}
                exit="exit"
                style={{
                  cursor: isFront ? "grab" : "pointer",
                }}
                className={`absolute inset-0 w-full h-full rounded-[28px] overflow-hidden bg-[#ECE7DE] border border-white/60 shadow-[0_12px_28px_-6px_rgba(20,15,10,0.32)] origin-bottom transform-gpu will-change-transform ${
                  isFront ? "active:cursor-grabbing" : ""
                }`}
                onClick={() => {
                  if (isSecond) handleNext();
                  if (isThird) handlePrev();
                }}
              >
                {/* Full Image */}
                <Link
                  href={card.link || defaultCategoryLink}
                  prefetch={true}
                  className="block w-full h-full relative cursor-pointer"
                  onClick={(e) => {
                    if (!isFront) {
                      e.preventDefault();
                    }
                  }}
                >
                  <SafeImage
                    src={card.img}
                    alt={card.name}
                    fill
                    quality={75}
                    sizes="340px"
                    className="object-cover object-center pointer-events-none"
                  />

                  {/* Top-Right Wishlist Heart Button (GPU-Friendly translucent circle) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleWishlist(card.id);
                    }}
                    aria-label="Save to Wishlist"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0A1F17]/70 border border-[#D4AF37]/40 flex items-center justify-center text-[#F3E5AB] active:scale-95 transition-transform shadow-md z-40 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={wishlist.includes(card.id) ? "#D4AF37" : "none"}
                      stroke={wishlist.includes(card.id) ? "#D4AF37" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Top-Left Sharp Royal Ribbon Badge */}
                  {card.badge && (
                    <span className="absolute top-4 left-4 text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-[#0A1F17] text-[#F3E5AB] border-l-2 border-[#D4AF37] shadow-md pointer-events-none">
                      {card.badge}
                    </span>
                  )}

                  {/* Bottom Text Panel with Dark Gradient Overlay */}
                  <div
                    className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent pt-12 pb-3.5 px-4 flex flex-col justify-end text-left pointer-events-auto transition-opacity duration-250 ${
                      isFront ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Origin / Subtitle */}
                    <span className="text-[10.5px] font-semibold text-white/75 tracking-[0.12em] uppercase mb-0.5">
                      {card.tag || subTitle}
                    </span>

                    {/* Product Title */}
                    <h3 className="font-heading font-bold text-[15px] text-white line-clamp-1 leading-snug">
                      {card.name}
                    </h3>

                    {/* Star Ratings & Review Count */}
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/90">
                      <span className="text-[#FBBF24] text-[12px]">★</span>
                      <span className="font-semibold text-white">5.0</span>
                      <span className="text-white/60 text-[10.5px] font-normal">(120+ reviews)</span>
                    </div>

                    {/* Price & "See More" Button */}
                    <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-white">
                          {formatPrice(card.price, 1)}
                        </span>
                        {card.originalPrice && (
                          <span className="text-xs text-white/50 line-through">
                            {formatPrice(card.originalPrice, 1)}
                          </span>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-1.5 bg-white/20 text-white pl-3 pr-1.5 py-1 rounded-full text-[11px] font-heading font-semibold tracking-wider uppercase transition-colors">
                        <span>See more</span>
                        <div className="w-4 h-4 rounded-full bg-white text-[#1F1A17] flex items-center justify-center text-[9px] font-bold">
                          ›
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Dimmer layer for non-front cards */}
                  {!isFront && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 🌟 Navigation Controls Below Deck */}
      <div className="flex items-center justify-center gap-3.5 mt-5">
        <button
          onClick={handlePrev}
          aria-label="Previous Rug Card"
          className="w-9 h-9 rounded-full bg-white border border-[#EBDCC5] shadow-sm active:bg-[#14110E] active:text-[#D4AF37] text-[#1F1813] flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          ←
        </button>

        {/* Dynamic Pagination Pill Indicators */}
        <div className="flex items-center gap-1.5">
          {items.slice(0, 6).map((item, i) => {
            const isActive = activeProduct?.id === item.id;
            return (
              <span
                key={item.id || i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  isActive ? "w-5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37]" : "w-1.5 bg-[#E0D3BE]"
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next Rug Card"
          className="w-9 h-9 rounded-full bg-white border border-[#EBDCC5] shadow-sm active:bg-[#14110E] active:text-[#D4AF37] text-[#1F1813] flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          →
        </button>
      </div>
    </div>
  );
}
