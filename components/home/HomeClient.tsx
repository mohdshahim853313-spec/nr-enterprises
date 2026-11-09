"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/context/CurrencyContext";
import StackedCardsDeck from "@/components/home/StackedCardsDeck";

// ============================================================================
// 🌟 BESPOKE HANDCRAFTED LUXURY SVGS (Minimalist Line Art)
// ============================================================================
const HandCraftedIcon = () => (
  <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V4.5a1.5 1.5 0 113 0v4.5m0 0a1.5 1.5 0 013 0V11m-3-2V6a1.5 1.5 0 113 0v5" />
  </svg>
);

const IndiaOriginIcon = () => (
  <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SecurePaymentIcon = () => (
  <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const ConciergeSupportIcon = () => (
  <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829M9 10a3 3 0 11-6 0 3 3 0 016 0zm-3 5a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
  </svg>
);

const CustomLoomIcon = () => (
  <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

const GlobalShippingIcon = () => (
  <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

// ============================================================================
// 🌟 1. SHOP BY CATEGORIES (Transparent Blurry Frosted Glass Cards)
// ============================================================================
const defaultCategories = [
  {
    id: "hand-tufted",
    title: "Hand Tufted",
    tagline: "Plush Wool Density",
    badge: "Popular",
    img: "/uploads/ai_rug_hand_tufted_v1.webp",
    link: "/collections?category=Tufted",
  },
  {
    id: "shaggy-carpet",
    title: "Shaggy Carpets",
    tagline: "Cloud Pile Softness",
    badge: "Signature",
    img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    link: "/collections?category=Shag",
  },
  {
    id: "jute-carpets",
    title: "Artisan Jute",
    tagline: "Organic Sustainable Weaves",
    badge: "Organic",
    img: "/uploads/ai_rug_artisan_jute_v1.webp",
    link: "/collections?category=Jute",
  },
  {
    id: "irregular-shaped",
    title: "Irregular Silhouettes",
    tagline: "Avant-Garde Contours",
    badge: "Limited Drop",
    img: "/uploads/ai_rug_irregular_contour_v1.webp",
    link: "/collections?category=Irregular",
  },
  {
    id: "hand-knotted",
    title: "Hand‑Knotted Luxury",
    tagline: "Generational Master Knots",
    badge: "Heirloom",
    img: "/uploads/ai_rug_hand_knotted_luxury_v1.webp",
    link: "/collections?category=Hand-Knotted",
  },
  {
    id: "flatweave-dhurries",
    title: "Flatweave Dhurries",
    tagline: "Reversible Heritage Weave",
    badge: "Artisanal",
    img: "/uploads/ai_rug_flatweave_dhurrie_v1.webp",
    link: "/collections?category=Flatweave",
  },
  {
    id: "braided-carpets",
    title: "Braided Carpets",
    tagline: "Spiral Textured Coils",
    badge: "Natural",
    img: "/uploads/ai_rug_braided_coils_v1.webp",
    link: "/collections?category=Braided",
  },
  {
    id: "modern-runners",
    title: "Hallway Runners",
    tagline: "Corridor Statement Pieces",
    badge: "Bespoke",
    img: "/uploads/ai_rug_hallway_runner_v1.webp",
    link: "/collections?category=Runner",
  },
];

// ============================================================================
// 🌟 TUFTED RUGS (Signature Hand-Tufted Collection - Diverse & High Focus)
// ============================================================================
const defaultTuftedRugs = [
  {
    id: "tufted-1",
    name: "Prism Geometric 3D Relief Hand-Tufted Wool Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 5499,
    originalPrice: 10999,
    img: "/uploads/ai_rug_tufted_geometric_relief_v1.webp",
    colors: ["#ECE5DD", "#D8C7B5", "#8E8271"],
    link: "/collections?category=Tufted",
    tagline: "High-low sculpted pile in pure New Zealand wool",
  },
  {
    id: "tufted-2",
    name: "Arco Minimalist Arch Hand-Tufted Wool Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 4999,
    originalPrice: 9999,
    img: "/uploads/ai_rug_tufted_modern_minimalist_v1.webp",
    colors: ["#F0ECE1", "#DCD5C6", "#6E6659"],
    link: "/collections?category=Tufted",
    tagline: "Serene architectural carved arches & cloud underfoot feel",
  },
  {
    id: "tufted-3",
    name: "Contour Fluid Wave Hand-Tufted Wool Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 6299,
    originalPrice: 12599,
    img: "/uploads/ai_rug_tufted_abstract_organic_v1.webp",
    colors: ["#E5DDD3", "#BCAEA0", "#6A5E52"],
    link: "/collections?category=Tufted",
    tagline: "Artisan sculpted wave ridges & plush tactile density",
  },
  {
    id: "tufted-4",
    name: "Retro 70s Wavy Sculpted Contour Tufted Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 5799,
    originalPrice: 11599,
    img: "/uploads/ai_rug_tufted_retro_wave_v1.webp",
    colors: ["#EADCC9", "#C8A97E", "#59402B"],
    link: "/collections?category=Tufted",
    tagline: "Curved 70s high-low relief ridges in warm honey tones",
  },
  {
    id: "tufted-5",
    name: "Natura Nova Sculpted Scandinavian Hand-Tufted Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 4799,
    originalPrice: 9599,
    img: "/uploads/ai_rug_hand_tufted_v1.webp",
    colors: ["#EDEAE4", "#D1C8BC", "#4A453E"],
    link: "/collections?category=Tufted",
    tagline: "Subtle geometric relief weave with dense hand-sheared surface",
  },
  {
    id: "tufted-6",
    name: "Botanica Carved Leaf Hand-Tufted Luxury Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 5899,
    originalPrice: 11799,
    img: "/uploads/ai_rug_tufted_botanical_contemporary_v1.webp",
    colors: ["#EAE6DC", "#CAD3C3", "#7A8271"],
    link: "/collections?category=Tufted",
    tagline: "Contemporary botanical leaf relief in soft tonal accents",
  },
  {
    id: "tufted-7",
    name: "Pebble Form Amoeba Sculpted Hand-Tufted Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 6499,
    originalPrice: 12999,
    img: "/uploads/ai_rug_irregular_contour_v1.webp",
    colors: ["#D8C4A9", "#EAE6DF"],
    link: "/collections?category=Irregular",
    tagline: "Fluid organic curved perimeter with sculpted pile contours",
  },
  {
    id: "tufted-8",
    name: "PixelFrame Checkered Geometric Tufted Wool Carpet",
    badge: "-50% OFF",
    rating: 5,
    price: 7199,
    originalPrice: 14399,
    img: "/uploads/scandinavian_rug_living_room-1789700885905.webp",
    colors: ["#2B2B2B", "#C19A6B", "#F5F2EC"],
    link: "/collections?category=Tufted",
    tagline: "Bold modern checkered relief woven with dense wool pile",
  },
  {
    id: "tufted-9",
    name: "Cozy Cloud Plush Shaggy Hand-Tufted Wool Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 5199,
    originalPrice: 10399,
    img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    colors: ["#FAF8F5", "#ECE6DC"],
    link: "/collections?category=Shag",
    tagline: "Ultra-deep fluffy shaggy fibers for bedroom & lounge sanctuaries",
  },
  {
    id: "tufted-10",
    name: "Japandi Zen Water Ripple Hand-Tufted Rug",
    badge: "-50% OFF",
    rating: 5,
    price: 6099,
    originalPrice: 12199,
    img: "/uploads/japandi_living_room_rug_2-1790142809035.webp",
    colors: ["#E8E3DA", "#8C8275"],
    link: "/collections?category=Tufted",
    tagline: "Concentric soothing ripple texture in neutral organic wool",
  },
  {
    id: "tufted-11",
    name: "Nordic Linear Carved Hand-Tufted Wool Carpet",
    badge: "-50% OFF",
    rating: 5,
    price: 4699,
    originalPrice: 9399,
    img: "/uploads/scandinavian_flatlay_rug-1790142787863.webp",
    colors: ["#F2EFEB", "#6E685E"],
    link: "/collections?category=Tufted",
    tagline: "Clean architectural line carving with dense sheared wool",
  },
  {
    id: "tufted-12",
    name: "Checkered Artisan Relief Flatlay Tufted Carpet",
    badge: "-50% OFF",
    rating: 5,
    price: 4899,
    originalPrice: 9799,
    img: "/uploads/checkered_rug_flat_lay-1790142774538.webp",
    colors: ["#EAE4D9", "#3A352F"],
    link: "/collections?category=Tufted",
    tagline: "Modern tactile grid relief sculpted with high-low depth",
  },
];

// ============================================================================
// 🌟 2. NEW ARRIVALS (TRENDING)
// ============================================================================
const defaultNewArrivals = [
  {
    id: "new-1",
    name: "PixelFrame Geometric Checkered Hand-Tufted Wool Carpet",
    badge: "ARCHITECTURAL",
    rating: 5,
    price: 22450,
    originalPrice: 44900,
    img: "/uploads/ai_rug_hand_tufted_v1.webp",
    colors: ["#2B2B2B", "#C19A6B", "#F5F2EC"],
    link: "/collections?category=Tufted",
  },
  {
    id: "new-2",
    name: "Pebble Form Beige Irregular Shaped Hand-Tufted Carpet",
    badge: "BESPOKE SHAPE",
    rating: 5,
    price: 10999,
    originalPrice: 21999,
    img: "/uploads/ai_rug_irregular_contour_v1.webp",
    colors: ["#D8C4A9", "#EAE6DF"],
    link: "/collections?category=Irregular",
  },
  {
    id: "new-3",
    name: "Handbraided Rectangular Check Box Pattern Boho Rug",
    badge: "LIMITED",
    rating: 5,
    price: 12999,
    originalPrice: 25999,
    img: "/uploads/ai_rug_braided_coils_v1.webp",
    colors: ["#F4F1EA", "#6B503B"],
    link: "/collections?category=Braided",
  },
  {
    id: "new-4",
    name: "Indigo Round Handwoven Natural Braided Carpet",
    badge: "CALM LIVING",
    rating: 5,
    price: 4599,
    originalPrice: 9199,
    img: "/uploads/ai_rug_artisan_jute_v1.webp",
    colors: ["#2B4C7E", "#F5F2EC"],
    link: "/collections?category=Braided",
  },
  {
    id: "new-5",
    name: "Cozy Cloud Warm Beige Modern Shaggy Carpet",
    badge: "CLOUD SOFT",
    rating: 5,
    price: 2625,
    originalPrice: 5250,
    img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    colors: ["#D8C4A9", "#C5B5A9", "#A8A8A8"],
    link: "/collections?category=Shag",
  },
  {
    id: "new-6",
    name: "Botanica Carved Leaf Hand-Tufted Luxury Rug",
    badge: "BOTANICAL",
    rating: 5,
    price: 5899,
    originalPrice: 11799,
    img: "/uploads/ai_rug_tufted_botanical_contemporary_v1.webp",
    colors: ["#EAE6DC", "#CAD3C3", "#7A8271"],
    link: "/collections?category=Tufted",
  },
  {
    id: "new-7",
    name: "Retro 70s Wavy Sculpted Contour Tufted Rug",
    badge: "VIRAL DESIGN",
    rating: 5,
    price: 5799,
    originalPrice: 11599,
    img: "/uploads/ai_rug_tufted_retro_wave_v1.webp",
    colors: ["#EADCC9", "#C8A97E", "#59402B"],
    link: "/collections?category=Tufted",
  },
  {
    id: "new-8",
    name: "Sundial Fade Braided Natural Jute Carpet",
    badge: "ARTISANAL",
    rating: 5,
    price: 4799,
    originalPrice: 9600,
    img: "/uploads/ai_rug_artisan_jute_v1.webp",
    colors: ["#D1BA9E", "#59402B"],
    link: "/collections?category=Jute",
  },
  {
    id: "new-9",
    name: "Kashan Royal Heritage Heirloom Silk Carpet",
    badge: "EXCLUSIVE",
    rating: 5,
    price: 45000,
    originalPrice: 90000,
    img: "/uploads/ai_rug_hand_knotted_luxury_v1.webp",
    colors: ["#822026", "#C19A6B", "#25364D"],
    link: "/collections?category=Hand-Knotted",
  },
  {
    id: "new-10",
    name: "Terra Plain Natural Jute Braided Carpet",
    badge: "EARTHEN",
    rating: 5,
    price: 4799,
    originalPrice: 9600,
    img: "/uploads/ai_rug_braided_coils_v1.webp",
    colors: ["#BCA488", "#59402B"],
    link: "/collections?category=Jute",
  },
];

// ============================================================================
// 🌟 3. SHOP BY COLOR
// ============================================================================
const colorSwatches = [
  { name: "Forest Green", code: "green", hex: "#264E36" },
  { name: "Royal Purple", code: "purple", hex: "#6E5487" },
  { name: "Oatmeal Beige", code: "beige", hex: "#CDBAA0" },
  { name: "Warm Terracotta", code: "orange", hex: "#C7611D" },
  { name: "Blush Rose", code: "pink", hex: "#DFA0AF" },
  { name: "Ruby Crimson", code: "red", hex: "#8E1E28" },
  { name: "Mineral Slate", code: "grey", hex: "#666D77" },
  { name: "Aegean Blue", code: "blue", hex: "#3B6E88" },
];

// ============================================================================
// 🌟 4. SHOP BY ROOM
// ============================================================================
const defaultRooms = [
  {
    id: "living-room",
    name: "Living Room",
    stylesCount: "92 Designs",
    tagline: "Statement centerpieces crafted for elevated entertaining.",
    img: "/uploads/ai_rug_hand_tufted_v1.webp",
    link: "/collections?room=living",
  },
  {
    id: "bedroom",
    name: "Bed Room",
    stylesCount: "71 Designs",
    tagline: "Ultra-plush deep pile softness for tranquil sanctuaries.",
    img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    link: "/collections?room=bedroom",
  },
  {
    id: "dining-room",
    name: "Dining Room",
    stylesCount: "23 Designs",
    tagline: "Spill-resistant low pile flatweaves & durable jute.",
    img: "/uploads/ai_rug_flatweave_dhurrie_v1.webp",
    link: "/collections?room=dining",
  },
  {
    id: "kids-room",
    name: "Kids Room",
    stylesCount: "22 Designs",
    tagline: "Hypoallergenic, natural organic wool textures for cozy play.",
    img: "/uploads/ai_rug_irregular_contour_v1.webp",
    link: "/collections?room=kids",
  },
];

// ============================================================================
// 🌟 5. JUTE CARPETS
// ============================================================================
const defaultJuteCarpets = [
  {
    id: "jute-1",
    name: "Sundial Fade Braided Natural Jute Carpet",
    badge: "-50%",
    rating: 5,
    price: 4799,
    originalPrice: 9600,
    img: "/uploads/ai_rug_artisan_jute_v1.webp",
    link: "/collections?category=Jute",
  },
  {
    id: "jute-2",
    name: "Terra Plain Natural Jute Braided Carpet",
    badge: "-50%",
    rating: 5,
    price: 4799,
    originalPrice: 9600,
    img: "/uploads/ai_rug_braided_coils_v1.webp",
    link: "/collections?category=Jute",
  },
  {
    id: "jute-3",
    name: "Ora Natural Round Braided Jute Rug",
    badge: "-50%",
    rating: 5,
    price: 3199,
    originalPrice: 6400,
    img: "/uploads/ai_rug_artisan_jute_v1.webp",
    link: "/collections?category=Round",
  },
  {
    id: "jute-4",
    name: "Kora Natural Braided Jute Flatlay Carpet",
    badge: "-50%",
    rating: 5,
    price: 3199,
    originalPrice: 6400,
    img: "/uploads/ai_rug_braided_coils_v1.webp",
    link: "/collections?category=Jute",
  },
  {
    id: "jute-5",
    name: "Tana Natural Braided Rug with White Base",
    badge: "-50%",
    rating: 5,
    price: 4799,
    originalPrice: 9600,
    img: "/uploads/ai_rug_flatweave_dhurrie_v1.webp",
    link: "/collections?category=Flatweave",
  },
];

// ============================================================================
// 🌟 6. EXCLUSIVE CARPETS
// ============================================================================
const defaultExclusiveCarpets = [
  {
    id: "excl-1",
    name: "Irregular Shaped Rug Driftic Beige Hand Tufted Carpet",
    rating: 5,
    price: 9999,
    originalPrice: 18999,
    img: "/uploads/ai_rug_irregular_contour_v1.webp",
    link: "/collections?category=Irregular",
  },
  {
    id: "excl-2",
    name: "Beige Brown Striped Boho Masterpiece Carpet",
    rating: 5,
    price: 9999,
    originalPrice: 19999,
    img: "/uploads/ai_rug_braided_coils_v1.webp",
    link: "/collections?category=Rectangular",
  },
  {
    id: "excl-3",
    name: "Hand-Knotted Reversible Masterpiece Heirloom Carpet",
    rating: 5,
    price: 11999,
    originalPrice: 22999,
    img: "/uploads/ai_rug_hand_knotted_luxury_v1.webp",
    link: "/collections?category=Hand-Knotted",
  },
  {
    id: "excl-4",
    name: "Natura Nova Woolen Scandinavian Hand-Tufted Carpet",
    rating: 5,
    price: 4999,
    originalPrice: 9999,
    img: "/uploads/ai_rug_hand_tufted_v1.webp",
    link: "/collections?category=Tufted",
  },
];

// 🌟 Default Published Hero Slides (Cloudflare R2 Master Curation)
const defaultHeroSlides = [
  {
    id: "masterpiece",
    tag: "BESPOKE ARTISANAL FLOOR COVERINGS",
    title: "Masterpiece Rugs.",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/modern-luxury-hall-rug-1791629806105.webp",
    ctaLink: "/collections",
    ctaText: "Explore Handcrafted Rugs",
    secLink: "/legacy",
    secText: "Explore Craftsmanship",
    card1Img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    card2Img: "/uploads/ai_rug_artisan_jute_v1.webp",
    card1Desc: "Soft, plush texture for cozy comfort",
    card1Link: "/collections?category=Shag",
    card2Desc: "Natural fiber, sustainable craftsmanship",
    card2Link: "/collections?category=Jute",
    card1Price: 2625,
    card1Title: "Plush Shaggy",
    card2Price: 3199,
    card2Title: "Artisan Jute",
    description: "Luxury rugs and artisanal floor coverings. From hand-knotted and tufted creations to natural jute, flatweave dhurries, and sustainable braided weaves."
  },
  {
    id: "slide-1791630127230",
    tag: "NEW • CURATED COLLECTION",
    title: "Artisanal Rugs 2",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/image-20261005-134806-1-1791630341522.webp",
    ctaLink: "/collections",
    ctaText: "Shop the Collection",
    secLink: "/customize",
    secText: "Custom Sizing",
    card1Img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    card2Img: "/uploads/ai_rug_artisan_jute_v1.webp",
    card1Desc: "Soft, plush texture for cozy comfort",
    card1Link: "/collections?category=Shag",
    card2Desc: "Natural fiber, sustainable craftsmanship",
    card2Link: "/collections?category=Jute",
    card1Price: 2625,
    card1Title: "Plush Shaggy",
    card2Price: 3199,
    card2Title: "Artisan Jute",
    description: "Handcrafted luxury carpets woven with pure natural fibers and timeless elegance."
  },
  {
    id: "slide-1791630178860",
    tag: "NEW • CURATED COLLECTION",
    title: "Artisanal Rugs 3",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/gallery-image-20261005-131349-is-rug-ka-hi-color-badal-diya-karo-par-shape-size-in-sab-colors-ka-bhi-4-1791630190353.webp",
    ctaLink: "/collections",
    ctaText: "Shop the Collection",
    secLink: "/customize",
    secText: "Custom Sizing",
    card1Img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    card2Img: "/uploads/ai_rug_artisan_jute_v1.webp",
    card1Desc: "Soft, plush texture for cozy comfort",
    card1Link: "/collections?category=Shag",
    card2Desc: "Natural fiber, sustainable craftsmanship",
    card2Link: "/collections?category=Jute",
    card1Price: 2625,
    card1Title: "Plush Shaggy",
    card2Price: 3199,
    card2Title: "Artisan Jute",
    description: "Handcrafted luxury carpets woven with pure natural fibers and timeless elegance."
  },
  {
    id: "slide-1791630208029",
    tag: "NEW • CURATED COLLECTION",
    title: "Artisanal Rugs 4",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/gallery-image-20261005-131349-is-rug-ka-hi-color-badal-diya-karo-par-shape-size-5-1791630219755.webp",
    ctaLink: "/collections",
    ctaText: "Shop the Collection",
    secLink: "/customize",
    secText: "Custom Sizing",
    card1Img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    card2Img: "/uploads/ai_rug_artisan_jute_v1.webp",
    card1Desc: "Soft, plush texture for cozy comfort",
    card1Link: "/collections?category=Shag",
    card2Desc: "Natural fiber, sustainable craftsmanship",
    card2Link: "/collections?category=Jute",
    card1Price: 2625,
    card1Title: "Plush Shaggy",
    card2Price: 3199,
    card2Title: "Artisan Jute",
    description: "Handcrafted luxury carpets woven with pure natural fibers and timeless elegance."
  },
  {
    id: "slide-1791630246605",
    tag: "NEW • CURATED COLLECTION",
    title: "Artisanal Rugs 5",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/image-20260929-133614-more-1791630261749.webp",
    ctaLink: "/collections",
    ctaText: "Shop the Collection",
    secLink: "/customize",
    secText: "Custom Sizing",
    card1Img: "/uploads/ai_rug_plush_shaggy_v1.webp",
    card2Img: "/uploads/ai_rug_artisan_jute_v1.webp",
    card1Desc: "Soft, plush texture for cozy comfort",
    card1Link: "/collections?category=Shag",
    card2Desc: "Natural fiber, sustainable craftsmanship",
    card2Link: "/collections?category=Jute",
    card1Price: 2625,
    card1Title: "Plush Shaggy",
    card2Price: 3199,
    card2Title: "Artisan Jute",
    description: "Handcrafted luxury carpets woven with pure natural fibers and timeless elegance."
  }
];

export default function HomeClient({ initialSiteData }: { initialSiteData?: any }) {
  const { formatPrice } = useCurrency();
  const [siteData, setSiteData] = useState<any>(initialSiteData || null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // 🌟 Load Wishlist
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("nrenterprises_wishlist") || "[]");
      setWishlist(Array.isArray(saved) ? saved : []);
    } catch (e) {}
  }, []);

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem("nrenterprises_wishlist", JSON.stringify(updated));
  };

  // 🌟 Load Content
  useEffect(() => {
    if (initialSiteData) {
      setSiteData(initialSiteData);
      try {
        localStorage.removeItem("rz_home_content");
        localStorage.removeItem("rz_home_content_v2");
        localStorage.removeItem("rz_home_content_v3");
        localStorage.removeItem("rz_home_content_v4");
        localStorage.removeItem("rz_home_content_v5");
        localStorage.removeItem("rz_home_content_v6");
        localStorage.removeItem("rz_home_content_v7");
        localStorage.removeItem("rz_home_content_v8");
        localStorage.setItem("rz_home_content_v9", JSON.stringify(initialSiteData));
      } catch (e) {}
      return;
    }

    try {
      localStorage.removeItem("rz_home_content");
      localStorage.removeItem("rz_home_content_v2");
      localStorage.removeItem("rz_home_content_v3");
      localStorage.removeItem("rz_home_content_v4");
      localStorage.removeItem("rz_home_content_v5");
      localStorage.removeItem("rz_home_content_v6");
      localStorage.removeItem("rz_home_content_v7");
      localStorage.removeItem("rz_home_content_v8");
      const cached = localStorage.getItem("rz_home_content_v9");
      if (cached) {
        setSiteData(JSON.parse(cached));
      }
    } catch (e) {}

    async function getDynamicContent() {
      try {
        const { data } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "home")
          .maybeSingle();

        if (data && data.data) {
          setSiteData(data.data);
          localStorage.setItem("rz_home_content_v9", JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Error fetching home content:", err);
      }
    }
    getDynamicContent();
  }, [initialSiteData]);

  // 🌟 Hero Showcase Slider Data (Atelier Collections)
  const heroSlides = useMemo(() => {
    if (siteData?.heroSlides && Array.isArray(siteData.heroSlides) && siteData.heroSlides.length > 0) {
      return siteData.heroSlides;
    }
    return defaultHeroSlides;
  }, [siteData]);

  // Dynamic Highlight Cards paired with the active slide
  const heroHighlights = useMemo(() => {
    const activeSlide = heroSlides[currentHeroSlide % heroSlides.length];
    if (activeSlide?.card1Title || activeSlide?.card1Img) {
      return [
        {
          title: activeSlide.card1Title || "Plush Shaggy",
          desc: activeSlide.card1Desc || "Soft, plush texture for cozy comfort",
          price: activeSlide.card1Price ?? 2625,
          img: activeSlide.card1Img || "/uploads/ai_rug_plush_shaggy_v1.webp",
          link: activeSlide.card1Link || "/collections?category=Shag",
        },
        {
          title: activeSlide.card2Title || "Artisan Jute",
          desc: activeSlide.card2Desc || "Natural fiber, sustainable craftsmanship",
          price: activeSlide.card2Price ?? 3199,
          img: activeSlide.card2Img || "/uploads/ai_rug_artisan_jute_v1.webp",
          link: activeSlide.card2Link || "/collections?category=Jute",
        },
      ];
    }
    if (siteData?.heroHighlights && Array.isArray(siteData.heroHighlights) && siteData.heroHighlights.length >= 2) {
      return siteData.heroHighlights;
    }
    return [
      {
        title: "Plush Shaggy",
        desc: "Soft, plush texture for cozy comfort",
        price: 2625,
        img: "/uploads/ai_rug_plush_shaggy_v1.webp",
        link: "/collections?category=Shag",
      },
      {
        title: "Artisan Jute",
        desc: "Natural fiber, sustainable craftsmanship",
        price: 3199,
        img: "/uploads/ai_rug_artisan_jute_v1.webp",
        link: "/collections?category=Jute",
      },
    ];
  }, [heroSlides, currentHeroSlide, siteData]);

  const etsyConfig = siteData?.etsy || {
    show: true,
    url: "https://www.etsy.com/shop/NREnterprises",
    btnText: "Shop on Etsy",
  };

  const collectionsSection = siteData?.collectionsSection || {
    tag: "HANDCRAFTED WEAVES",
    title: "NR Collections",
    desc: "Explore our signature curation of handcrafted area rugs, runners, and heritage flatweaves.",
    ctaText: "VIEW ALL COLLECTIONS",
    ctaLink: "/collections",
    categories: defaultCategories,
  };
  const categoriesList = collectionsSection.categories || defaultCategories;

  // 🌟 Dedicated Tufted Rugs Section (High Focus & Diverse Curation)
  const tuftedSection = siteData?.tuftedSection || {
    tag: "SIGNATURE HAND-TUFTED FOCUS",
    title: "Tufted Rugs",
    desc: "Handcrafted in Bhadohi with pure New Zealand wool and sculpted 3D relief.",
    ctaText: "EXPLORE ALL TUFTED RUGS",
    ctaLink: "/collections?category=Tufted",
    products: defaultTuftedRugs,
  };
  const rawTufted = (tuftedSection.products && tuftedSection.products.length > 0)
    ? tuftedSection.products
    : defaultTuftedRugs;

  // Build a perpetual circular queue of at least 20 items so it never runs out or hits blank space
  const initialTuftedPool = useMemo(() => {
    if (!rawTufted || rawTufted.length === 0) return [];
    let pool = [...rawTufted];
    while (pool.length < 24) {
      pool = [...pool, ...rawTufted];
    }
    return pool.map((item, idx) => ({
      ...item,
      _uid: `tufted-uid-${item.id || "t"}-${idx}`,
    }));
  }, [rawTufted]);

  const [tuftedList, setTuftedList] = useState<any[]>(() => initialTuftedPool);
  const [tuftedOffset, setTuftedOffset] = useState<number>(0);
  const [isTuftedAnimating, setIsTuftedAnimating] = useState<boolean>(false);
  const [isTuftedPaused, setIsTuftedPaused] = useState<boolean>(false);
  const isTuftedBusyRef = useRef<boolean>(false);
  const tuftedResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTuftedList(initialTuftedPool);
  }, [initialTuftedPool]);

  // Responsive screen observer for accurate 3D center card calculation
  const [visibleTrendingCount, setVisibleTrendingCount] = useState<number>(5);
  useEffect(() => {
    const updateCount = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1024) setVisibleTrendingCount(5);
      else if (window.innerWidth >= 640) setVisibleTrendingCount(3);
      else setVisibleTrendingCount(2);
    };
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  // Pure slide-forward function (used by both auto-slide and click/swipe)
  const stepForwardTufted = useCallback(() => {
    if (isTuftedBusyRef.current || tuftedList.length === 0) return;
    isTuftedBusyRef.current = true;

    setIsTuftedAnimating(true);
    setTuftedOffset(-1);

    setTimeout(() => {
      setTuftedList((prev) => (prev.length > 0 ? [...prev.slice(1), prev[0]] : prev));
      setTuftedOffset(0);
      setIsTuftedAnimating(false);
      isTuftedBusyRef.current = false;
    }, 350);
  }, [tuftedList.length]);

  const stepBackwardTufted = useCallback(() => {
    if (isTuftedBusyRef.current || tuftedList.length === 0) return;
    isTuftedBusyRef.current = true;

    setTuftedList((prev) => (prev.length > 0 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev));
    setTuftedOffset(-1);
    setIsTuftedAnimating(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTuftedAnimating(true);
        setTuftedOffset(0);
        setTimeout(() => {
          setIsTuftedAnimating(false);
          isTuftedBusyRef.current = false;
        }, 350);
      });
    });
  }, [tuftedList.length]);

  const handleNextTufted = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTuftedPaused(true);
    if (tuftedResumeTimerRef.current) clearTimeout(tuftedResumeTimerRef.current);
    tuftedResumeTimerRef.current = setTimeout(() => setIsTuftedPaused(false), 2500);
    stepForwardTufted();
  }, [stepForwardTufted]);

  const handlePrevTufted = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTuftedPaused(true);
    if (tuftedResumeTimerRef.current) clearTimeout(tuftedResumeTimerRef.current);
    tuftedResumeTimerRef.current = setTimeout(() => setIsTuftedPaused(false), 2500);
    stepBackwardTufted();
  }, [stepBackwardTufted]);

  // 👆 Touch Swipe Support for Tufted Rugs Carousel
  const tuftedTouchRef = useRef<{ startX: number; startY: number; endX: number; endY: number }>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const handleTuftedTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    tuftedTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
    };
  };

  const handleTuftedTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    tuftedTouchRef.current.endX = touch.clientX;
    tuftedTouchRef.current.endY = touch.clientY;
  };

  const handleTuftedTouchEnd = () => {
    const deltaX = tuftedTouchRef.current.startX - tuftedTouchRef.current.endX;
    const deltaY = tuftedTouchRef.current.startY - tuftedTouchRef.current.endY;
    if (Math.abs(deltaX) > 28 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        handleNextTufted();
      } else {
        handlePrevTufted();
      }
    }
  };

  // Infinite Auto-Slide for Tufted Rugs: delayed start on mount to prevent page open lag
  useEffect(() => {
    if (isTuftedPaused || tuftedList.length === 0) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    let timer: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      timer = setInterval(() => {
        stepForwardTufted();
      }, 3500);
    }, 2800);

    return () => {
      clearTimeout(initialDelay);
      if (timer) clearInterval(timer);
    };
  }, [isTuftedPaused, tuftedList.length, stepForwardTufted]);

  const trendingSection = siteData?.trendingSection || {
    tag: "MOST LOVED PIECES",
    title: "Trending",
    desc: "Contemporary designs and viral masterpieces shaping modern luxury interiors.",
    ctaText: "View All",
    ctaLink: "/collections",
    products: defaultNewArrivals,
  };
  const rawTrending = (trendingSection.products && trendingSection.products.length > 0)
    ? trendingSection.products
    : defaultNewArrivals;

  // Build a perpetual circular queue of at least 20 items so it never runs out or hits blank space
  const initialTrendingPool = useMemo(() => {
    if (!rawTrending || rawTrending.length === 0) return [];
    let pool = [...rawTrending];
    while (pool.length < 24) {
      pool = [...pool, ...rawTrending];
    }
    return pool.map((item, idx) => ({
      ...item,
      _uid: `trending-uid-${item.id || "tr"}-${idx}`,
    }));
  }, [rawTrending]);

  const [trendingList, setTrendingList] = useState<any[]>(() => initialTrendingPool);
  const [trendingOffset, setTrendingOffset] = useState<number>(0);
  const [isTrendingAnimating, setIsTrendingAnimating] = useState<boolean>(false);
  const [isTrendingPaused, setIsTrendingPaused] = useState<boolean>(false);
  const isTrendingBusyRef = useRef<boolean>(false);
  const trendingResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTrendingList(initialTrendingPool);
  }, [initialTrendingPool]);

  // Pure slide-forward function for Trending
  const stepForwardTrending = useCallback(() => {
    if (isTrendingBusyRef.current || trendingList.length === 0) return;
    isTrendingBusyRef.current = true;

    setIsTrendingAnimating(true);
    setTrendingOffset(-1);

    setTimeout(() => {
      setTrendingList((prev) => (prev.length > 0 ? [...prev.slice(1), prev[0]] : prev));
      setTrendingOffset(0);
      setIsTrendingAnimating(false);
      isTrendingBusyRef.current = false;
    }, 350);
  }, [trendingList.length]);

  const stepBackwardTrending = useCallback(() => {
    if (isTrendingBusyRef.current || trendingList.length === 0) return;
    isTrendingBusyRef.current = true;

    setTrendingList((prev) => (prev.length > 0 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev));
    setTrendingOffset(-1);
    setIsTrendingAnimating(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTrendingAnimating(true);
        setTrendingOffset(0);
        setTimeout(() => {
          setIsTrendingAnimating(false);
          isTrendingBusyRef.current = false;
        }, 350);
      });
    });
  }, [trendingList.length]);

  const handleNextTrending = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTrendingPaused(true);
    if (trendingResumeTimerRef.current) clearTimeout(trendingResumeTimerRef.current);
    trendingResumeTimerRef.current = setTimeout(() => setIsTrendingPaused(false), 2500);
    stepForwardTrending();
  }, [stepForwardTrending]);

  const handlePrevTrending = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTrendingPaused(true);
    if (trendingResumeTimerRef.current) clearTimeout(trendingResumeTimerRef.current);
    trendingResumeTimerRef.current = setTimeout(() => setIsTrendingPaused(false), 2500);
    stepBackwardTrending();
  }, [stepBackwardTrending]);

  // 👆 Touch Swipe Support for Trending Rugs Carousel
  const trendingTouchRef = useRef<{ startX: number; startY: number; endX: number; endY: number }>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const handleTrendingTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    trendingTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
    };
  };

  const handleTrendingTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    trendingTouchRef.current.endX = touch.clientX;
    trendingTouchRef.current.endY = touch.clientY;
  };

  const handleTrendingTouchEnd = () => {
    const deltaX = trendingTouchRef.current.startX - trendingTouchRef.current.endX;
    const deltaY = trendingTouchRef.current.startY - trendingTouchRef.current.endY;
    if (Math.abs(deltaX) > 28 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        handleNextTrending();
      } else {
        handlePrevTrending();
      }
    }
  };

  // Infinite Auto-Slide for Trending Pieces: staggered timing (delayed start on mount)
  useEffect(() => {
    if (isTrendingPaused || trendingList.length === 0) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    let timer: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      stepForwardTrending();
      timer = setInterval(() => {
        stepForwardTrending();
      }, 4200);
    }, 4200);

    return () => {
      clearTimeout(initialDelay);
      if (timer) clearInterval(timer);
    };
  }, [isTrendingPaused, trendingList.length, stepForwardTrending]);

  const colorSection = siteData?.colorSection || {
    tag: "FIND YOUR SHADE",
    title: "Collections by Color",
    desc: "Curate your room palette — from warm ivory & champagne gold to deep charcoal tones.",
    swatches: colorSwatches,
  };
  const swatchesList = colorSection.swatches || colorSwatches;

  const roomsSection = siteData?.roomsSection || {
    tag: "SPATIAL LIVING",
    title: "Modern Homes",
    desc: "Discover rugs tailored to transform your living room, master bedroom, dining hall, and foyer.",
    rooms: defaultRooms,
  };
  const roomsList = roomsSection.rooms || defaultRooms;

  const materialsSection = siteData?.materialsSection || {
    tag: "ORGANIC FIBERS",
    title: "Materials Glance",
    desc: "Pure New Zealand wool, organic natural jute, hand-spun bamboo silk, and plush cotton weaves.",
    ctaText: "View All",
    ctaLink: "/collections?category=Jute",
    products: defaultJuteCarpets,
  };
  const materialsProducts = materialsSection.products || defaultJuteCarpets;

  const legacySection = siteData?.legacySection || {
    tag: "ATELIER MASTERPIECES",
    title: "Our Legacy",
    desc: "Limited edition high-knot-density heritage carpets woven by master artisans over months.",
    ctaText: "View All",
    ctaLink: "/collections?category=Irregular",
    products: defaultExclusiveCarpets,
  };
  const legacyProducts = legacySection.products || defaultExclusiveCarpets;

  const concierge = siteData?.concierge || {
    feature1Title: "Free Custom Sizing",
    feature1Desc: "Custom shapes, colors & pile height",
    feature2Title: "Pan India & Global Shipping",
    feature2Desc: "Tracked white-glove doorstep delivery",
    feature3Title: "Atelier Concierge Desk",
    phone: "Quick Inquire",
    email: "nrenterprises@gmail.com",
    whatsappNumber: "",
    whatsappText: "Hi NR Enterprises, I need help choosing a carpet",
  };

  const activeSlide = heroSlides[currentHeroSlide % heroSlides.length];

  const handlePrevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // 👆 Mobile Touch Swipe Support for Big Hero Slider
  const heroTouchRef = useRef<{ startX: number; startY: number; endX: number; endY: number }>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    heroTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
    };
  };

  const handleHeroTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    heroTouchRef.current.endX = touch.clientX;
    heroTouchRef.current.endY = touch.clientY;
  };

  const handleHeroTouchEnd = () => {
    const deltaX = heroTouchRef.current.startX - heroTouchRef.current.endX;
    const deltaY = heroTouchRef.current.startY - heroTouchRef.current.endY;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX > 0) {
        handleNextHeroSlide();
      } else {
        handlePrevHeroSlide();
      }
    }
  };

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="w-full flex flex-col bg-[#FAF8F5] overflow-x-hidden font-sans text-[#1A1715]">
      
      {/* =========================================================================
          🌟 HERO SHOWCASE: CLEAN ATELIER EDITORIAL (Warm Luxury Linen & Obsidian)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 pt-2 sm:pt-3 pb-2">
        <div className="max-w-[1500px] mx-auto relative">
          
          {/* Main Hero Container (Supports Swipe Gestures on Mobile) */}
          <div 
            onTouchStart={handleHeroTouchStart}
            onTouchMove={handleHeroTouchMove}
            onTouchEnd={handleHeroTouchEnd}
            className="relative min-h-[520px] sm:min-h-[560px] lg:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#EAE6DF] shadow-[0_12px_45px_rgba(0,0,0,0.06)] flex flex-col justify-center p-4 sm:p-10 lg:p-14 select-none group isolate [transform:translateZ(0)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] [mask-image:-webkit-radial-gradient(white,black)]"
          >
            
            {/* 🌟 Big Hero Banner Top Right Corner: Shop on Etsy Floating Button */}
            {etsyConfig.show !== false && (
              <a
                href={etsyConfig.url || "https://www.etsy.com/shop/NREnterprises"}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3.5 sm:top-6 lg:top-8 right-3.5 sm:right-6 lg:right-8 z-20 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 bg-[#F1641E] hover:bg-[#D95314] text-white text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs border border-white/20"
                title="Shop NR Enterprises on Etsy"
              >
                <span>{etsyConfig.btnText || "Shop on Etsy"}</span>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            
            {/* Background Image Carousel with Ultra-Slow Majestic Zoom-In & Seamless Crossfade */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl isolate [transform:translateZ(0)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] [mask-image:-webkit-radial-gradient(white,black)]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentHeroSlide}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 1.055 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 1.4, ease: "easeInOut" },
                    scale: { duration: 8.5, ease: "easeOut" },
                  }}
                  className="absolute inset-0 will-change-transform rounded-3xl overflow-hidden [transform:translateZ(0)]"
                >
                  <Image
                    src={activeSlide?.bgImage}
                    alt={activeSlide?.title || "NR Enterprises Carpet"}
                    fill
                    priority
                    quality={95}
                    sizes="100vw"
                    className="object-cover object-center rounded-3xl brightness-100 contrast-[1.02]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Soft Ambient Left Contrast for Text Legibility (Neutral Cinema Contrast - ZERO Green) */}
            <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-[2] rounded-3xl" />

            {/* Hero Main Copy & Action Buttons - Desktop Only (Hidden on Mobile for completely clean hero image) */}
            <div className="hidden sm:flex relative z-10 max-w-xl sm:max-w-2xl lg:max-w-4xl flex-col justify-center mt-14 sm:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id || currentHeroSlide}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex flex-col"
                >
                  {/* Tag Pill - Desktop Only (Hidden on Mobile) */}
                  <div className="hidden sm:flex h-8 mb-3 items-center">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F5F2EB] border border-white/25 shadow-md text-[11px] sm:text-xs font-heading font-semibold uppercase tracking-[0.25em]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
                      {activeSlide.tag || "HERITAGE CRAFT • DIRECT FROM BHADOHI"}
                    </span>
                  </div>

                  <div className="min-h-[50px] sm:min-h-[64px] md:min-h-[76px] lg:min-h-[88px] flex items-center mb-3">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.05] tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
                      {activeSlide.title}
                    </h1>
                  </div>

                  {/* Description - Desktop Only (Hidden on Mobile) */}
                  <div className="hidden sm:flex min-h-[60px] sm:min-h-[70px] md:min-h-[80px] items-start mb-6 sm:mb-8 max-w-xl">
                    <p className="text-xs sm:text-sm md:text-base text-white/90 font-normal leading-relaxed line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                      {activeSlide.description}
                    </p>
                  </div>

                  {/* Action Buttons (Primary on Mobile, Both on Desktop) */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-h-[44px] h-auto shrink-0 mb-1 sm:mb-0">
                    <Link
                      href={activeSlide.ctaLink || "/collections"}
                      className="inline-flex items-center justify-center gap-2 min-w-[150px] sm:min-w-[220px] h-[42px] sm:h-[50px] px-5 sm:px-8 bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 rounded-full text-xs sm:text-[13px] font-heading font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(74,16,23,0.45)] hover:shadow-[0_6px_25px_rgba(74,16,23,0.6)] text-center shrink-0 hover:scale-[1.02] active:scale-98"
                    >
                      <span>{activeSlide.ctaText || "Explore Luxury Knots"}</span>
                      <span className="text-sm font-bold text-[#E8C86A]">›</span>
                    </Link>

                    {/* Secondary Button - Desktop Only (Hidden on Mobile) */}
                    {activeSlide.secText && (
                      <Link
                        href={activeSlide.secLink || "/legacy"}
                        className="hidden sm:inline-flex items-center justify-center gap-2 min-w-[140px] sm:min-w-[200px] h-[42px] sm:h-[50px] px-5 sm:px-7 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-full text-xs sm:text-[13px] font-heading font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 backdrop-blur-md shadow-md text-center hover:scale-[1.02] active:scale-98"
                      >
                        <span>{activeSlide.secText}</span>
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Floating Swatch / Texture Selector (Clean Frosted Glass) - Only shown if more than 1 slide */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-6 sm:bottom-10 left-3.5 sm:left-10 lg:left-14 z-20 bg-black/60 backdrop-blur-md rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.4)] border border-white/25 inline-flex items-center gap-2.5 sm:gap-3.5 shrink-0 max-w-[calc(100%-28px)] overflow-x-auto overflow-y-hidden no-scrollbar">
                <span className="text-[11px] sm:text-xs font-heading font-bold text-white/90 px-1 tabular-nums select-none shrink-0 tracking-widest">
                  {`0${(currentHeroSlide % heroSlides.length) + 1} / 0${heroSlides.length}`}
                </span>

                <div className="w-px h-5 bg-white/30 shrink-0" />

                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-0.5">
                  {heroSlides.map((slide: any, idx: number) => (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={() => setCurrentHeroSlide(idx)}
                      className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shrink-0 ${
                        idx === currentHeroSlide
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black/60 scale-105 shadow-md opacity-100"
                          : "opacity-50 hover:opacity-90 scale-95 border border-white/20"
                      }`}
                      aria-label={`Select ${slide.thumbLabel || slide.title || `Slide ${idx + 1}`}`}
                    >
                      <Image
                        src={slide.bgImage || slide.thumb || "/uploads/photo-1444362408440-274ecb6fc730-1789700907085.webp"}
                        alt={slide.title || "Slide"}
                        fill
                        quality={90}
                        sizes="120px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          🌟 EDITORIAL USP TICKER STRIP (Royal Persian Maroon & Gold Ribbon)
          Zero Scrollbar Guaranteed: overflow-hidden + no-scrollbar flex container
         ========================================================================= */}
      <section className="w-full bg-[#4A1017] border-y border-[#380C11] py-3.5 px-4 overflow-hidden relative select-none shadow-xs">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[#FAF5EB]">
            <span className="w-2 h-2 rounded-full bg-[#E8C86A] animate-pulse" />
            <span className="font-heading font-bold text-xs sm:text-[13px] uppercase tracking-[0.2em] text-[#FAF5EB]">400+ Master Looms</span>
            <span className="text-[11px] text-[#D8C9C5] hidden md:inline">Generational Artisans</span>
          </div>
          <span className="text-[#E8C86A] shrink-0 font-serif">✦</span>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[#FAF5EB]">
            <span className="w-2 h-2 rounded-full bg-[#E8C86A] animate-pulse" />
            <span className="font-heading font-bold text-xs sm:text-[13px] uppercase tracking-[0.2em] text-[#FAF5EB]">100% Handcrafted</span>
            <span className="text-[11px] text-[#D8C9C5] hidden md:inline">Pure NZ Wool & Silk</span>
          </div>
          <span className="text-[#E8C86A] shrink-0 font-serif">✦</span>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[#FAF5EB]">
            <span className="w-2 h-2 rounded-full bg-[#E8C86A] animate-pulse" />
            <span className="font-heading font-bold text-xs sm:text-[13px] uppercase tracking-[0.2em] text-[#FAF5EB]">Direct From Bhadohi</span>
            <span className="text-[11px] text-[#D8C9C5] hidden md:inline">No Middlemen Atelier</span>
          </div>
          <span className="text-[#E8C86A] shrink-0 font-serif">✦</span>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[#FAF5EB]">
            <span className="w-2 h-2 rounded-full bg-[#E8C86A] animate-pulse" />
            <span className="font-heading font-bold text-xs sm:text-[13px] uppercase tracking-[0.2em] text-[#FAF5EB]">Worldwide Delivery</span>
            <span className="text-[11px] text-[#D8C9C5] hidden md:inline">Doorstep White-Glove</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          🌟 1. NR COLLECTIONS (Clean, Crisp High-Definition Luxury Tiles)
          ZERO GREEN OVERLAYS: Pure, natural rug photography in full brightness
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-[#FAF8F5]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {collectionsSection.tag || "HANDCRAFTED WEAVES"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {collectionsSection.title?.replace("NR Enterprises Collections", "NR Collections").replace("RugZora Collections", "NR Collections") || "NR Collections"}
          </h2>
          {collectionsSection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-lg mx-auto mb-10 sm:mb-12 leading-relaxed">
              {collectionsSection.desc}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 md:gap-6 mb-12 text-left">
            {categoriesList.map((cat: any) => (
              <Link
                key={cat.id || cat.title}
                href={cat.link || "/collections"}
                className="group relative w-full aspect-[4/5] min-h-[260px] sm:min-h-[300px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F0ECE1] border border-[#E5DFD5] hover:border-[#C5A880] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-4.5 cursor-pointer transform-gpu [contain:paint]"
              >
                {/* Background Carpet Image - 100% Bright, Crisp, Sharp (ZERO green overlay) */}
                <SafeImage
                  src={cat.img}
                  alt={cat.title}
                  fill
                  quality={95}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 35vw, 320px"
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-500 brightness-100 contrast-[1.02]"
                />

                {/* Top Royal Maroon Badge */}
                {cat.badge && (
                  <div className="relative z-10 self-start">
                    <span className="inline-block text-[9.5px] font-heading font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#4A1017] text-[#FAF5EB] border border-[#E8C86A]/40 shadow-xs">
                      {cat.badge}
                    </span>
                  </div>
                )}

                {/* Bottom Luminous Luxury Capsule (Smooth 60FPS Native Scroll) */}
                <div className="relative z-10 bg-white/95 backdrop-blur-md py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl border border-[#EAE6DF] group-hover:border-[#C5A880] shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 transition-all duration-300">
                  <div className="min-w-0 flex-1">
                    {cat.tagline && (
                      <span className="block text-[10.5px] sm:text-[11px] text-[#8C7A6B] font-medium mb-0.5 truncate uppercase tracking-wider">
                        {cat.tagline}
                      </span>
                    )}
                    <h3 className="text-[13.5px] sm:text-[15px] font-bold font-heading text-[#1A1715] leading-snug group-hover:text-[#4A1017] transition-colors truncate" title={cat.title}>
                      {cat.title}
                    </h3>
                  </div>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#4A1017] text-white group-hover:bg-[#E8C86A] group-hover:text-[#240609] flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs shrink-0 group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={collectionsSection.ctaLink || "/collections"}
            className="inline-flex items-center gap-2.5 bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase font-heading font-bold tracking-[0.22em] rounded-full transition-all duration-300 shadow-[0_4px_18px_rgba(74,16,23,0.35)] hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>{collectionsSection.ctaText || "VIEW ALL COLLECTIONS"}</span>
            <span className="text-sm font-bold text-[#E8C86A]">→</span>
          </Link>

        </div>
      </section>

      {/* =========================================================================
          🌟 TUFTED RUGS (Warm Atelier Linen Showcase)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-gradient-to-b from-[#FAF5EB] via-[#FDFBF7] to-[#FAF5EB] text-[#1A1715] border-y border-[#EBDCC5]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {tuftedSection.tag || "SIGNATURE HAND-TUFTED"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {tuftedSection.title || "Tufted Rugs"}
          </h2>
          {tuftedSection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              {tuftedSection.desc}
            </p>
          )}

          {/* 📱 Mobile: 3D Stacked Cards Deck (Tinder-like Swipe Deck) */}
          <div className="block md:hidden">
            <StackedCardsDeck
              items={rawTufted}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              defaultCategoryLink="/collections?category=Tufted"
              subTitle="Signature Hand-Tufted"
              autoPlayInterval={4200}
            />
          </div>

          {/* 💻 Desktop/PC: Original Horizontal Sliding Carousel */}
          <div 
            onTouchStart={handleTuftedTouchStart}
            onTouchMove={handleTuftedTouchMove}
            onTouchEnd={handleTuftedTouchEnd}
            className="hidden md:block relative w-full overflow-hidden mb-12 [--base-offset:-40%] sm:[--base-offset:0%] [--tufted-w:60%] sm:[--tufted-w:33.333333%] lg:[--tufted-w:20%] py-8 sm:py-10 -my-3 select-none"
          >
            <div
              className={`flex will-change-transform items-start ${
                isTuftedAnimating
                  ? "transition-transform duration-350 ease-[cubic-bezier(0.2,0,0,1)]"
                  : "transition-none"
              }`}
              style={{
                transform: `translateX(calc(var(--base-offset, 0%) + (${tuftedOffset} * var(--tufted-w))))`,
              }}
            >
              {tuftedList.map((product: any, idx: number) => {
                const tuftedCenterOffset = visibleTrendingCount >= 5 ? 2 : 1;
                const activeTuftedCenterIdx = tuftedOffset === -1 ? tuftedCenterOffset + 1 : tuftedCenterOffset;
                const distTufted = Math.abs(idx - activeTuftedCenterIdx);
                const isTuftedCenter = distTufted === 0;
                const isTuftedNeighbor = distTufted === 1;

                return (
                  <div
                    key={product._uid || `${product.id}-${idx}`}
                    className="shrink-0 w-[60%] sm:w-1/3 lg:w-1/5 px-1.5 sm:px-3 text-center flex flex-col items-center"
                  >
                    <div className="flex flex-col group items-center w-full">
                      {/* Seamless Image Container with Silky Smooth 3D Depth */}
                      <div className={`relative aspect-[3/4] sm:aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#ECE7DE] transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center opacity-100 ${
                        isTuftedCenter
                          ? "scale-[1.08] sm:scale-[1.10] z-20"
                          : isTuftedNeighbor
                          ? "scale-[0.96] sm:scale-[0.98] z-10"
                          : "scale-[0.90] sm:scale-[0.92] z-0"
                      }`}>
                        <Link 
                          href={product.link || "/collections?category=Tufted"} 
                          prefetch={true} 
                          className="block w-full h-full"
                        >
                          <SafeImage 
                            src={product.img} 
                            alt={product.name} 
                            fill
                            quality={90}
                            loading={idx < 2 ? "eager" : "lazy"}
                            priority={idx < 2}
                            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 450px"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                          />
                        </Link>

                        {/* Smooth Fading Gold Border & Soft Ambient Shadow */}
                        <div
                          className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ring-2 ring-[#4A1017] ring-offset-2 ring-offset-white shadow-[0_20px_45px_rgba(74,16,23,0.18)] z-10 ${
                            isTuftedCenter ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        {/* Top Sharp Royal Ribbon Badge */}
                        {product.badge && (
                          <span className={`absolute top-2.5 sm:top-3 left-2.5 sm:left-3 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 pointer-events-none transition-all duration-500 shadow-xs rounded-full ${
                            isTuftedCenter
                              ? "bg-[#4A1017] text-[#FAF5EB] border border-[#E8C86A]/40"
                              : "bg-[#4A1017]/90 text-[#FAF5EB] border border-[#E8C86A]/30"
                          }`}>
                            {product.badge}
                          </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          aria-label="Save to wishlist"
                          className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 border border-[#EBDCC5] flex items-center justify-center text-[#1A1715] hover:text-[#C5A880] hover:scale-110 transition-all shadow-xs z-10 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={wishlist.includes(product.id) ? "#C5A880" : "none"}
                            stroke={wishlist.includes(product.id) ? "#C5A880" : "currentColor"}
                            strokeWidth="2"
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className={`w-full flex flex-col items-center pt-3 sm:pt-4 min-h-[96px] sm:min-h-[105px] justify-start transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isTuftedCenter ? "translate-y-4 sm:translate-y-5" : "translate-y-0"
                      }`}>
                        <Link 
                          href={product.link || "/collections?category=Tufted"} 
                          prefetch={true} 
                          className="w-full block"
                        >
                          <h3 className={`font-serif text-[14px] sm:text-[15px] line-clamp-2 leading-snug transition-colors duration-500 mb-1.5 text-center ${
                            isTuftedCenter
                              ? "text-[#1A1715] font-bold"
                              : "text-[#524538] font-medium hover:text-[#1A1715]"
                          }`}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Gold Star Ratings - Constant height */}
                        <div className="flex items-center justify-center text-[#C5A880] text-[12px] tracking-widest mb-1.5 font-bold h-4 opacity-100">
                          {"★".repeat(product.rating || 5)}
                        </div>

                        {/* Price & Original Price */}
                        <div className="flex items-baseline justify-center gap-2 h-5">
                          <span className={`font-heading font-bold text-[14px] sm:text-[15px] transition-colors duration-500 ${
                            isTuftedCenter ? "text-[#1A1715] font-bold" : "text-[#1A1715]"
                          }`}>
                            {formatPrice(product.price, 1)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] sm:text-[12px] text-[#8C7A6B] line-through font-normal">
                              {formatPrice(product.originalPrice, 1)}
                            </span>
                          )}
                        </div>

                        {/* Color Swatches */}
                        <div className="h-5 flex items-center justify-center gap-1.5 pt-1">
                          {product.colors && (Array.isArray(product.colors) ? product.colors.length > 0 : String(product.colors).trim().length > 0) && (
                            (Array.isArray(product.colors) ? product.colors : String(product.colors).split(",").map((c: string) => c.trim()).filter(Boolean)).map((c: string, i: number) => (
                              <span
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs transition-transform hover:scale-115"
                                style={{ backgroundColor: c }}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Left & Right Interactive Navigation Controls */}
            <button
              type="button"
              onClick={handlePrevTufted}
              aria-label="Previous Tufted Rug"
              className="hidden sm:flex absolute left-1 sm:left-4 top-[38%] -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#EBDCC5] shadow-md items-center justify-center text-[#1A1715] hover:bg-[#1A1715] hover:text-white transition-all cursor-pointer z-30 group active:scale-90"
            >
              <span className="text-sm font-bold transition-transform group-hover:-translate-x-0.5">←</span>
            </button>
            <button
              type="button"
              onClick={handleNextTufted}
              aria-label="Next Tufted Rug"
              className="hidden sm:flex absolute right-1 sm:right-4 top-[38%] -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#EBDCC5] shadow-md items-center justify-center text-[#1A1715] hover:bg-[#1A1715] hover:text-white transition-all cursor-pointer z-30 group active:scale-90"
            >
              <span className="text-sm font-bold transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          <Link
            href={tuftedSection.ctaLink || "/collections?category=Tufted"}
            className="inline-flex items-center justify-center bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 px-9 py-3 text-xs font-heading font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(74,16,23,0.35)] hover:shadow-xl cursor-pointer"
          >
            {tuftedSection.ctaText || "View All"}
          </Link>

        </div>
      </section>

      {/* =========================================================================
          🌟 2. TRENDING (Silk Alabaster & Warm Linen)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-[#FAF8F5] border-y border-[#EAE6DF]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {trendingSection.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {trendingSection.title}
          </h2>
          {trendingSection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
              {trendingSection.desc}
            </p>
          )}

          {/* 📱 Mobile: 3D Stacked Cards Deck (Tinder-like Swipe Deck) */}
          <div className="block md:hidden">
            <StackedCardsDeck
              items={rawTrending}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              defaultCategoryLink="/collections"
              subTitle="Trending Luxury Curation"
              autoPlayInterval={4500}
            />
          </div>

          {/* 💻 Desktop/PC: Original Horizontal Sliding Carousel */}
          <div
            onTouchStart={handleTrendingTouchStart}
            onTouchMove={handleTrendingTouchMove}
            onTouchEnd={handleTrendingTouchEnd}
            className="hidden md:block relative w-full overflow-hidden mb-10 py-8 sm:py-10 -my-3 [--base-offset:-40%] sm:[--base-offset:0%] [--trending-w:60%] sm:[--trending-w:33.333333%] lg:[--trending-w:20%] select-none"
          >
            <div
              className={`flex will-change-transform items-start ${
                isTrendingAnimating
                  ? "transition-transform duration-350 ease-[cubic-bezier(0.2,0,0,1)]"
                  : "transition-none"
              }`}
              style={{
                transform: `translateX(calc(var(--base-offset, 0%) + (${trendingOffset} * var(--trending-w))))`,
              }}
            >
              {trendingList.map((product: any, idx: number) => {
                const trendingCenterOffset = visibleTrendingCount >= 5 ? 2 : 1;
                const activeCenterIdx = trendingOffset === -1 ? trendingCenterOffset + 1 : trendingCenterOffset;
                const distFromCenter = Math.abs(idx - activeCenterIdx);
                const isCenter = distFromCenter === 0;
                const isNeighbor = distFromCenter === 1;

                return (
                  <div
                    key={product._uid || `${product.id}-${idx}`}
                    className="shrink-0 w-[60%] sm:w-1/3 lg:w-1/5 px-1.5 sm:px-3 text-center flex flex-col items-center"
                  >
                    <div className="flex flex-col group items-center w-full">
                      {/* Seamless Image Container with Silky Smooth 3D Depth */}
                      <div className={`relative aspect-[3/4] sm:aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#ECE7DE] transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center opacity-100 ${
                        isCenter
                          ? "scale-[1.08] sm:scale-[1.10] z-20"
                          : isNeighbor
                          ? "scale-[0.96] sm:scale-[0.98] z-10"
                          : "scale-[0.90] sm:scale-[0.92] z-0"
                      }`}>
                        <Link 
                          href={product.link || "/collections"} 
                          prefetch={true} 
                          className="block w-full h-full"
                        >
                          <SafeImage 
                            src={product.img} 
                            alt={product.name} 
                            fill
                            quality={90}
                            loading={idx < 2 ? "eager" : "lazy"}
                            priority={idx < 2}
                            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 450px"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                          />
                        </Link>

                        {/* Smooth Fading Gold Border & Soft Ambient Shadow */}
                        <div
                          className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ring-2 ring-[#4A1017] ring-offset-2 ring-offset-[#FAF8F5] shadow-[0_20px_45px_rgba(74,16,23,0.18)] z-10 ${
                            isCenter ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        {/* Top Sharp Royal Ribbon Badge */}
                        {product.badge && (
                          <span className={`absolute top-2.5 sm:top-3 left-2.5 sm:left-3 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 pointer-events-none transition-all duration-500 shadow-xs rounded-full ${
                            isCenter
                              ? "bg-[#4A1017] text-[#FAF5EB] border border-[#E8C86A]/40"
                              : "bg-[#4A1017]/90 text-[#FAF5EB] border border-[#E8C86A]/30"
                          }`}>
                            {product.badge}
                          </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          aria-label="Save to wishlist"
                          className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-[#EBDCC5] flex items-center justify-center text-[#1A1715] hover:text-[#C5A880] hover:scale-110 transition-all shadow-xs z-10 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={wishlist.includes(product.id) ? "#C5A880" : "none"}
                            stroke={wishlist.includes(product.id) ? "#C5A880" : "currentColor"}
                            strokeWidth="2"
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className={`w-full flex flex-col items-center pt-3 sm:pt-4 min-h-[96px] sm:min-h-[105px] justify-start transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isCenter ? "translate-y-4 sm:translate-y-5" : "translate-y-0"
                      }`}>
                        <Link 
                          href={product.link || "/collections"} 
                          prefetch={true} 
                          className="w-full block"
                        >
                          <h3 className={`font-heading text-[13px] sm:text-[14px] line-clamp-2 leading-snug transition-colors duration-500 mb-1.5 text-center ${
                            isCenter
                              ? "text-[#1A1715] font-bold"
                              : "text-[#6B5A49] font-medium hover:text-[#1A1715]"
                          }`}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Gold Star Ratings - Constant height */}
                        <div className="flex items-center justify-center text-[#C5A880] text-[12px] tracking-widest mb-1.5 font-bold h-4 opacity-100">
                          {"★".repeat(product.rating || 5)}
                        </div>

                        {/* Price & Original Price - Constant height */}
                        <div className="flex items-baseline justify-center gap-2 h-5">
                          <span className={`font-heading font-bold text-[14px] sm:text-[15px] transition-colors duration-500 ${
                            isCenter ? "text-[#1A1715] font-bold" : "text-[#1A1715]"
                          }`}>
                            {formatPrice(product.price, 1)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] sm:text-[12px] text-[#9E9488] line-through font-normal">
                              {formatPrice(product.originalPrice, 1)}
                            </span>
                          )}
                        </div>

                        {/* Color Swatches - Constant height */}
                        <div className="h-5 flex items-center justify-center gap-1.5 pt-1">
                          {product.colors && (Array.isArray(product.colors) ? product.colors.length > 0 : String(product.colors).trim().length > 0) && (
                            (Array.isArray(product.colors) ? product.colors : String(product.colors).split(",").map((c: string) => c.trim()).filter(Boolean)).map((c: string, i: number) => (
                              <span
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs transition-transform hover:scale-115"
                                style={{ backgroundColor: c }}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Left & Right Interactive Navigation Controls (Hidden on Mobile) */}
            <button
              type="button"
              onClick={handlePrevTrending}
              aria-label="Previous Trending Rug"
              className="hidden sm:flex absolute left-1 sm:left-4 top-[38%] -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#EBDCC5] shadow-lg items-center justify-center text-[#2B231D] hover:bg-[#1A1715] hover:text-white transition-all cursor-pointer z-30 group active:scale-90"
            >
              <span className="text-sm font-bold transition-transform group-hover:-translate-x-0.5">←</span>
            </button>
            <button
              type="button"
              onClick={handleNextTrending}
              aria-label="Next Trending Rug"
              className="hidden sm:flex absolute right-1 sm:right-4 top-[38%] -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#EBDCC5] shadow-lg items-center justify-center text-[#2B231D] hover:bg-[#1A1715] hover:text-white transition-all cursor-pointer z-30 group active:scale-90"
            >
              <span className="text-sm font-bold transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          <Link
            href={trendingSection.ctaLink || "/collections"}
            className="inline-flex items-center justify-center bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 px-9 py-3 text-xs font-heading font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(74,16,23,0.35)] hover:shadow-xl cursor-pointer"
          >
            {trendingSection.ctaText || "View All"}
          </Link>

        </div>
      </section>

      {/* =========================================================================
          🌟 3. COLLECTIONS BY COLOR (Warm Linen Interactive Disks)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-[#F5F2EB] text-[#1A1715] border-y border-[#E8E2D8]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {colorSection.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {colorSection.title}
          </h2>
          {colorSection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
              {colorSection.desc}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 mb-6">
            {swatchesList.map((swatch: any) => (
              <Link
                key={swatch.code || swatch.name}
                href={`/collections?color=${swatch.code}`}
                className="group flex flex-col items-center cursor-pointer"
              >
                <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-white border border-[#EAE6DF] shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md group-hover:scale-105 transition-all duration-300 flex items-center justify-center p-2 mb-2.5">
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden border border-black/15 shadow-[inset_0_2px_5px_rgba(255,255,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-102"
                    style={{
                      backgroundColor: swatch.hex,
                      backgroundImage: `
                        radial-gradient(circle at 35% 28%, rgba(255,255,255,0.28) 0%, transparent 60%),
                        repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1.5px, transparent 1.5px, transparent 4px),
                        repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1.5px, transparent 1.5px, transparent 4px)
                      `,
                    }}
                  >
                    {/* Fine Carpet Micro-Weave Loop Grid */}
                    <div
                      className="absolute inset-0 rounded-full opacity-65 mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle, rgba(255,255,255,0.8) 0.6px, transparent 0.6px),
                          radial-gradient(circle, rgba(0,0,0,0.7) 0.6px, transparent 0.6px)
                        `,
                        backgroundSize: "3px 3px, 3px 3px",
                        backgroundPosition: "0 0, 1.5px 1.5px",
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1A1715] group-hover:text-[#8C6D3F] transition-colors">
                  {swatch.name}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          🌟 4. MODERN HOMES (Silk Alabaster & Linen Framed Vignettes)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-[#FAF8F5] border-y border-[#EAE6DF]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {roomsSection.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {roomsSection.title}
          </h2>
          {roomsSection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
              {roomsSection.desc}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 mb-8 text-left">
            {roomsList.map((room: any) => (
              <Link
                key={room.id || room.name}
                href={room.link || "/collections"}
                className="group relative w-full aspect-[4/5] min-h-[290px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F0ECE1] border border-[#EAE6DF] hover:border-[#C5A880] shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between p-4 sm:p-5 cursor-pointer"
              >
                <SafeImage src={room.img} alt={room.name} fill
                  quality={90}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 35vw, 650px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark shadow gradient localized behind text (Neutral contrast - ZERO green) */}
                <div className="absolute inset-x-0 bottom-0 h-44 sm:h-48 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-[5] pointer-events-none" />

                <div className="relative z-10 self-end">
                  <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    {room.stylesCount}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mb-1.5 drop-shadow-md">
                    {room.name}
                  </h3>
                  <p className="text-[13px] sm:text-xs text-white/90 font-medium leading-relaxed mb-3 line-clamp-2">
                    {room.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider px-4 py-2 bg-white text-[#4A1017] hover:bg-[#4A1017] hover:text-white rounded-full transition-all shadow-md group-hover:scale-105">
                    <span>EXPLORE STYLES</span>
                    <span className="text-xs font-bold text-[#C5A880]">↗</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          🌟 5. MATERIALS GLANCE (Warm Ivory & Handcrafted Jute/Silk Textures)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-[#FAF8F5] text-[#1A1715] border-y border-[#EAE6DF]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {materialsSection.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {materialsSection.title}
          </h2>
          {materialsSection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
              {materialsSection.desc}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-12 text-center">
            {materialsProducts.map((item: any) => (
              <div
                key={item.id || item.name}
                className="flex flex-col group items-center last:odd:col-span-2 last:odd:w-[calc(50%-8px)] last:odd:mx-auto sm:last:odd:col-span-1 sm:last:odd:w-full"
              >
                <div className="relative aspect-[3/4] sm:aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#ECE7DE] border border-[#EAE6DF] shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md active:scale-[0.98] transition-all duration-300 cursor-pointer">
                  <Link href={item.link || "/collections?category=Jute"} prefetch={true} className="block w-full h-full">
                    <SafeImage src={item.img} alt={item.name} fill
                      quality={90}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {item.badge && (
                    <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-[#4A1017] text-[#FAF5EB] border border-[#E8C86A]/40 text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 shadow-xs rounded-full pointer-events-none">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="w-full flex flex-col items-center pt-3 sm:pt-3.5">
                  <Link href={item.link || "/collections?category=Jute"} prefetch={true} className="w-full">
                    <h3 className="font-serif font-semibold text-[13.5px] sm:text-[14.5px] text-[#1A1715] line-clamp-2 leading-snug hover:text-[#8C6D3F] transition-colors mb-1 text-center">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center text-[#C5A880] text-[12px] tracking-widest font-bold">
                    {"★".repeat(item.rating || 5)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={materialsSection.ctaLink || "/collections?category=Jute"}
            prefetch={true}
            className="inline-flex items-center justify-center bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 px-9 py-3 text-xs font-heading font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(74,16,23,0.35)] hover:shadow-xl cursor-pointer"
          >
            {materialsSection.ctaText || "View All"}
          </Link>

        </div>
      </section>

      {/* =========================================================================
          🌟 6. OUR LEGACY (Silk Alabaster & Linen Atelier Masterpieces)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 py-12 md:py-20 bg-[#FAF8F5] border-t border-[#EAE6DF]">
        <div className="max-w-[1500px] mx-auto text-center">
          
          <span className="text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C7A6B] block mb-2">
            {legacySection.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-[#1A1715] mb-3 tracking-tight">
            {legacySection.title}
          </h2>
          {legacySection.desc && (
            <p className="text-[13.5px] sm:text-[15px] text-[#6B5E51] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
              {legacySection.desc}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 text-center">
            {legacyProducts.map((item: any) => (
              <div
                key={item.id || item.name}
                className="flex flex-col group items-center"
              >
                {/* Seamless Image Container */}
                <div className="relative aspect-[3/4] sm:aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#ECE7DE] border border-[#EAE6DF] shadow-xs group-hover:border-[#C5A880] group-hover:shadow-md active:scale-[0.98] transition-all duration-300 cursor-pointer">
                  <Link href={item.link || "/collections?category=Irregular"} prefetch={true} className="block w-full h-full">
                    <SafeImage src={item.img} alt={item.name} fill
                      quality={90}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1536px) 30vw, 550px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Top Royal Maroon Badge */}
                  {item.badge && (
                    <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-[#4A1017] text-[#FAF5EB] border border-[#E8C86A]/40 shadow-xs rounded-full pointer-events-none">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Product Details (Clean & Centered) */}
                <div className="w-full flex flex-col items-center pt-3 sm:pt-3.5">
                  <Link href={item.link || "/collections?category=Irregular"} prefetch={true} className="w-full">
                    <h3 className="font-serif font-semibold text-[13.5px] sm:text-[14.5px] text-[#1A1715] line-clamp-2 leading-snug hover:text-[#8C6D3F] transition-colors mb-1.5 text-center">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center text-[#C5A880] text-[12px] tracking-widest mb-1.5 font-bold">
                    {"★".repeat(item.rating || 5)}
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-heading font-bold text-[14px] sm:text-[15px] text-[#1A1715]">
                      {formatPrice(item.price, 1)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[11px] sm:text-[12px] text-[#8C7A6B] line-through font-normal">
                        {formatPrice(item.originalPrice, 1)}
                      </span>
                    )}
                  </div>

                  {/* Color Swatches */}
                  {item.colors && (Array.isArray(item.colors) ? item.colors.length > 0 : String(item.colors).trim().length > 0) && (
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      {(Array.isArray(item.colors) ? item.colors : String(item.colors).split(",").map((c: string) => c.trim()).filter(Boolean)).map((c: string, i: number) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs transition-transform hover:scale-115"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Link
            href={legacySection.ctaLink || "/collections?category=Irregular"}
            className="inline-flex items-center justify-center bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 px-9 py-3 text-xs font-heading font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(74,16,23,0.35)] hover:shadow-xl cursor-pointer"
          >
            {legacySection.ctaText || "View All"}
          </Link>

        </div>
      </section>

      {/* =========================================================================
          PRE-FOOTER CONCIERGE BAR: (Warm Linen Atelier Bar)
         ========================================================================= */}
      <section className="w-full px-[5px] sm:px-6 md:px-10 pb-10">
        <div className="max-w-[1500px] mx-auto bg-[#F5F2EB] text-[#1A1715] p-6 sm:p-8 rounded-2xl shadow-xs border border-[#E8E2D8] flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left flex-1">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[#8C6D3F] flex items-center justify-center shrink-0 border border-[#E8E2D8] shadow-xs">
                <CustomLoomIcon />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">{concierge.feature1Title}</h4>
                <p className="text-xs text-[#6B5E51] mt-0.5">{concierge.feature1Desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[#8C6D3F] flex items-center justify-center shrink-0 border border-[#E8E2D8] shadow-xs">
                <GlobalShippingIcon />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">{concierge.feature2Title}</h4>
                <p className="text-xs text-[#6B5E51] mt-0.5">{concierge.feature2Desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[#8C6D3F] flex items-center justify-center shrink-0 border border-[#E8E2D8] shadow-xs">
                <ConciergeSupportIcon />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">Atelier Concierge</h4>
                <p className="text-xs text-[#6B5E51] mt-0.5">Quick email & bespoke support</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("open-quick-inquire", {
                    detail: {
                      subject: "Atelier Assistance",
                      message: "Hi NR Enterprises, I need help choosing or customizing an artisanal rug.",
                    },
                  })
                );
              }
            }}
            className="inline-flex items-center gap-2.5 bg-[#4A1017] hover:bg-[#380C11] text-white border border-[#C5A880]/40 px-6 py-3 text-xs uppercase font-bold tracking-wider rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(74,16,23,0.35)] hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 text-[#E8C86A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Quick Inquire</span>
          </button>

        </div>
      </section>

    </div>
  );
}