"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { supabase } from "../../lib/supabase";
import { useCurrency } from "@/context/CurrencyContext";
import { DEFAULT_FILTER_SETTINGS, FilterSettings } from "@/lib/filterConfig";

const ProductSkeleton = () => (
  <div className="flex flex-col h-full animate-pulse items-center">
    <div className="aspect-[3/4] sm:aspect-4/5 w-full bg-[#240609] mb-3 rounded-none shadow-xs relative overflow-hidden border border-[#4A1017] flex flex-col items-center justify-center p-4 select-none">
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-[#1B4D3E] text-white border border-[#26624F] h-5 w-11 rounded-md z-10" />
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
    <div className="flex flex-col items-center text-center mt-auto space-y-1.5 w-full pt-1">
      <div className="h-2.5 w-16 bg-[#8C6B38]/30 rounded-none"></div>
      <div className="h-4 w-36 sm:w-44 bg-[#4A1017]/15 rounded-none"></div>
      <div className="h-3 w-20 bg-[#FAF5EB]/25 rounded-none"></div>
      <div className="h-4 w-24 bg-[#4A1017]/20 rounded-none"></div>
    </div>
  </div>
);

const SkeletonProductGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-12">
    {[...Array(8)].map((_, i) => <ProductSkeleton key={`skeleton-${i}`} />)}
  </div>
);

interface CollectionsClientProps {
  initialPageContent?: any;
  initialFilterConfig?: FilterSettings;
  initialProducts?: any[];
}

export default function Shop({ initialPageContent, initialFilterConfig, initialProducts }: CollectionsClientProps) {
  // 🌟 Global Currency Context Integration
  const { formatPrice } = useCurrency();

  const [activeCategory, setActiveCategory] = useState("All");
  const [dbProducts, setDbProducts] = useState<any[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts || initialProducts.length === 0);
  const [mounted, setMounted] = useState(false);

  // 🌟 Wishlist State Persistence
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rz_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) { }

    const handleWishlistUpdate = () => {
      try {
        const saved = localStorage.getItem("rz_wishlist");
        if (saved) setWishlist(JSON.parse(saved));
      } catch (e) { }
    };
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlist-updated", handleWishlistUpdate);
  }, []);

  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem("rz_wishlist", JSON.stringify(next));
        window.dispatchEvent(new Event("wishlist-updated"));
      } catch (e) { }
      return next;
    });
  };

  // Dynamic filter settings loaded from server cloud data / fallback
  const [filterConfig, setFilterConfig] = useState<FilterSettings>(() => {
    if (initialFilterConfig) return initialFilterConfig;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("rz_filter_settings");
        if (cached) return JSON.parse(cached);
      } catch (e) { }
    }
    return DEFAULT_FILTER_SETTINGS;
  });

  const [pageContent, setPageContent] = useState<any>(() => {
    if (initialPageContent) return initialPageContent;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("rz_collections_content");
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  useEffect(() => {
    setMounted(true);
    const fetchPageContent = async () => {
      try {
        const { data } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "collections")
          .maybeSingle();
        if (data && data.data) {
          setPageContent(data.data);
          localStorage.setItem("rz_collections_content", JSON.stringify(data.data));
        }
      } catch (err) { }
    };

    const fetchFilterSettings = async () => {
      try {
        const { data } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "filter_settings")
          .maybeSingle();
        if (data?.data) {
          setFilterConfig({
            types: data.data.types || DEFAULT_FILTER_SETTINGS.types,
            materials: data.data.materials || DEFAULT_FILTER_SETTINGS.materials,
            colors: data.data.colors || DEFAULT_FILTER_SETTINGS.colors,
            patterns: data.data.patterns || DEFAULT_FILTER_SETTINGS.patterns,
            shapes: data.data.shapes || DEFAULT_FILTER_SETTINGS.shapes,
          });
          localStorage.setItem("rz_filter_settings", JSON.stringify(data.data));
        }
      } catch (e) { }
    };

    fetchPageContent();
    fetchFilterSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      if (!initialProducts || initialProducts.length === 0) {
        setIsLoading(true);
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDbProducts(data);
      }
    } catch (err) { } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter Selection States (Multi-select)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Collapsible Accordion Section States - Only TYPE is open by default
  const [openSections, setOpenSections] = useState({
    type: true,
    material: false,
    color: false,
    pattern: false,
    shape: false,
    sort: false,
  });

  // Section Expansion (Show More / Less)
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllPatterns, setShowAllPatterns] = useState(false);
  const [showAllShapes, setShowAllShapes] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const toggleMaterial = (m: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const toggleColor = (c: string) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const togglePattern = (p: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleShape = (s: string) => {
    setSelectedShapes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const categories = [
    "All",
    "Rectangle",
    "Round",
    "Oval",
    "Runner"
  ];

  // Merge dynamic product values with admin configured options (A-Z sorted)
  const allTypes = useMemo(() => {
    const fromProducts = dbProducts.map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set([...(filterConfig.types || []), ...fromProducts]));
    return combined.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [filterConfig.types, dbProducts]);

  const allMaterials = useMemo(() => {
    const fromProducts = dbProducts.map((p) => p.material).filter(Boolean);
    const combined = Array.from(new Set([...(filterConfig.materials || []), ...fromProducts]));
    return combined.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [filterConfig.materials, dbProducts]);

  const allColors = useMemo(() => {
    const fromProducts = dbProducts.flatMap((p) => {
      if (Array.isArray(p.colors)) return p.colors;
      if (typeof p.color === "string") return [p.color];
      return [];
    }).filter(Boolean);

    const configNames = (filterConfig.colors || []).map((c) => c.name);
    const combinedNames = Array.from(new Set([...configNames, ...fromProducts]));

    return combinedNames
      .map((name) => {
        const found = (filterConfig.colors || []).find((c) => c.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          hex: found?.hex || "#2C2A29",
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [filterConfig.colors, dbProducts]);

  const allPatterns = useMemo(() => {
    const fromProducts = dbProducts.map((p) => p.pattern || p.style).filter(Boolean);
    const combined = Array.from(new Set([...(filterConfig.patterns || []), ...fromProducts]));
    return combined.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [filterConfig.patterns, dbProducts]);

  const allShapes = useMemo(() => {
    const fromProducts = dbProducts.map((p) => p.shape).filter(Boolean);
    const combined = Array.from(new Set([...(filterConfig.shapes || []), ...fromProducts]));
    return combined.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [filterConfig.shapes, dbProducts]);

  const activeFiltersCount =
    selectedTypes.length +
    selectedMaterials.length +
    selectedColors.length +
    selectedPatterns.length +
    selectedShapes.length +
    (sortBy !== "default" ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedTypes([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedPatterns([]);
    setSelectedShapes([]);
    setSortBy("default");
    setActiveCategory("All");
  };

  const filteredProducts = useMemo(() => {
    if (isLoading) return [];
    return dbProducts
      .filter((item) => {
        // 1. Top Shape Navigation Category Filter
        if (activeCategory !== "All") {
          const cat = (item.category || "").toLowerCase();
          const name = (item.name || "").toLowerCase();
          const shape = (item.shape || "").toLowerCase();
          const target = activeCategory.toLowerCase();
          if (!cat.includes(target) && !name.includes(target) && !shape.includes(target)) {
            return false;
          }
        }

        // 2. Types / Categories Filter (Multi-select)
        if (selectedTypes.length > 0) {
          const catVal = (item.category || "").toLowerCase();
          const nameVal = (item.name || "").toLowerCase();
          const styleVal = (item.style || "").toLowerCase();
          const tagsVal = Array.isArray(item.tags)
            ? item.tags.join(" ").toLowerCase()
            : (item.tags || "").toLowerCase();

          const matchesType = selectedTypes.some((type) => {
            const searchCat = type.toLowerCase();
            return (
              catVal.includes(searchCat) ||
              tagsVal.includes(searchCat) ||
              nameVal.includes(searchCat) ||
              styleVal.includes(searchCat)
            );
          });
          if (!matchesType) return false;
        }

        // 3. Materials Filter (Multi-select)
        if (selectedMaterials.length > 0) {
          const matVal = (item.material || "").toLowerCase();
          const tagsVal = Array.isArray(item.tags)
            ? item.tags.join(" ").toLowerCase()
            : (item.tags || "").toLowerCase();

          const matchesMat = selectedMaterials.some((mat) => {
            const searchMat = mat.toLowerCase();
            return matVal.includes(searchMat) || tagsVal.includes(searchMat);
          });
          if (!matchesMat) return false;
        }

        // 4. Color Filter (Multi-select)
        if (selectedColors.length > 0) {
          const colVal = (item.color || "").toLowerCase();
          const tagsVal = Array.isArray(item.tags)
            ? item.tags.join(" ").toLowerCase()
            : (item.tags || "").toLowerCase();
          const nameVal = (item.name || "").toLowerCase();

          const matchesCol = selectedColors.some((col) => {
            const searchCol = col.toLowerCase();
            return colVal.includes(searchCol) || tagsVal.includes(searchCol) || nameVal.includes(searchCol);
          });
          if (!matchesCol) return false;
        }

        // 5. Pattern Filter (Multi-select)
        if (selectedPatterns.length > 0) {
          const patVal = (item.pattern || item.style || "").toLowerCase();
          const tagsVal = Array.isArray(item.tags)
            ? item.tags.join(" ").toLowerCase()
            : (item.tags || "").toLowerCase();

          const matchesPat = selectedPatterns.some((pat) => {
            const searchPat = pat.toLowerCase();
            return patVal.includes(searchPat) || tagsVal.includes(searchPat);
          });
          if (!matchesPat) return false;
        }

        // 6. Shape Filter (Multi-select from Accordion)
        if (selectedShapes.length > 0) {
          const shpVal = (item.shape || item.category || "").toLowerCase();
          const matchesShp = selectedShapes.some((shp) => {
            const searchShp = shp.toLowerCase();
            return shpVal.includes(searchShp);
          });
          if (!matchesShp) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          const priceA = parseFloat((a.variants?.[0]?.price || a.price || "0").toString().replace(/[^0-9.]/g, "")) || 0;
          const priceB = parseFloat((b.variants?.[0]?.price || b.price || "0").toString().replace(/[^0-9.]/g, "")) || 0;
          return priceA - priceB;
        }
        if (sortBy === "price_desc") {
          const priceA = parseFloat((a.variants?.[0]?.price || a.price || "0").toString().replace(/[^0-9.]/g, "")) || 0;
          const priceB = parseFloat((b.variants?.[0]?.price || b.price || "0").toString().replace(/[^0-9.]/g, "")) || 0;
          return priceB - priceA;
        }
        return 0;
      });
  }, [dbProducts, isLoading, activeCategory, selectedTypes, selectedMaterials, selectedColors, selectedPatterns, selectedShapes, sortBy]);

  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const buttonVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#FAF8F5]" />;
  }

  const heroBg = pageContent?.hero?.bgImage;
  const hasBgImage = typeof heroBg === "string" && heroBg.trim() !== "";

  return (
    <div className="bg-[#FAF8F5] pt-3 pb-20 px-[5px] sm:px-6 md:px-10 min-h-screen font-sans text-[#2B070B]">
      <div className="max-w-[1500px] mx-auto">

        {/* Page Header */}
        {hasBgImage ? (
          <div className="relative w-full min-h-[220px] md:h-[280px] mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center text-center shadow-lg border border-[#4A1017]">
            <Image
              src={heroBg}
              alt="Collections Header"
              fill
              priority
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#240609]/75 backdrop-blur-[1px]"></div>

            <motion.div variants={fadeUpVariant} initial="hidden" animate="visible" className="relative z-10 px-4 sm:px-6 max-w-5xl mx-auto">
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#FAF5EB] font-heading font-bold mb-2 block drop-shadow-xs">
                {pageContent?.hero?.tag || "THE PREMIUM NR ENTERPRISES PRODUCTS"}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-2.5 text-white leading-tight drop-shadow-md sm:whitespace-nowrap">
                {pageContent?.hero?.title || "Artisanal Floor Sculptures"}
              </h1>
              <p className="text-[#FAF5EB]/90 text-xs md:text-sm font-normal leading-relaxed drop-shadow-xs line-clamp-2 max-w-2xl mx-auto">
                {pageContent?.hero?.description || "Browse our hand-braided rPET area rugs, runners, and custom silhouettes. 100% reversible, stain-resistant, and woven for mindful living."}
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div variants={fadeUpVariant} initial="hidden" animate="visible" className="text-center pt-2 mb-8 sm:mb-10 max-w-5xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-[#4A1017] font-heading font-bold mb-2 block">
              {pageContent?.hero?.tag || "THE PREMIUM NR ENTERPRISES PRODUCTS"}
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-3 text-[#2B070B] leading-tight tracking-tight sm:whitespace-nowrap">
              {pageContent?.hero?.title || "Artisanal Floor Sculptures"}
            </h1>
            <p className="text-[#6A5A55] text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed">
              {pageContent?.hero?.description || "Browse our hand-braided rPET area rugs, runners, and custom silhouettes. 100% reversible, stain-resistant, and woven for mindful living."}
            </p>
          </motion.div>
        )}

        {/* Filter Navigation Bar: Left-Aligned 4-Dots Button + Shape Tabs */}
        <div className="relative mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#4A1017]/20 pb-4">

          {/* 🌟 1. Left Side: 4-Dots Filter Button with its attached Dropdown List directly below it */}
          <div className="relative self-start md:self-auto">
            <motion.button
              variants={buttonVariants}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`relative flex items-center justify-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-xs ${isFilterOpen || activeFiltersCount > 0
                  ? "bg-[#2B070B] text-white border-[#4A1017]"
                  : "bg-[#FAF5EB] text-[#2B070B] border-[#4A1017]/30 hover:border-[#4A1017] hover:shadow-sm"
                }`}
              title="Filter by Rug Categories & Materials"
            >
              {/* 4-Dots 2x2 Grid Icon */}
              <div className="grid grid-cols-2 gap-[3px] w-3.5 h-3.5 items-center justify-center">
                <span className={`w-1.5 h-1.5 rounded-[1px] transition-colors ${isFilterOpen || activeFiltersCount > 0 ? "bg-[#FAF5EB]" : "bg-[#2B070B]"}`} />
                <span className={`w-1.5 h-1.5 rounded-[1px] transition-colors ${isFilterOpen || activeFiltersCount > 0 ? "bg-[#FAF5EB]" : "bg-[#2B070B]"}`} />
                <span className={`w-1.5 h-1.5 rounded-[1px] transition-colors ${isFilterOpen || activeFiltersCount > 0 ? "bg-[#FAF5EB]" : "bg-[#2B070B]"}`} />
                <span className={`w-1.5 h-1.5 rounded-[1px] transition-colors ${isFilterOpen || activeFiltersCount > 0 ? "bg-[#FAF5EB]" : "bg-[#2B070B]"}`} />
              </div>
              <span className="text-[11px] sm:text-xs tracking-wider uppercase font-heading font-bold">
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#4A1017] text-[#FAF5EB] text-[9px] font-bold flex items-center justify-center shadow-xs border border-[#FAF5EB]/30">
                  {activeFiltersCount}
                </span>
              )}
            </motion.button>

            {/* 🌟 Dropdown / Sidebar Filter Drawer directly underneath the left button */}
            <AnimatePresence>
              {isFilterOpen && (
                <>
                  {/* Backdrop for closing without blur */}
                  <div
                    className="fixed inset-0 z-20 bg-transparent"
                    onClick={() => setIsFilterOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-2 w-[310px] sm:w-[350px] bg-[#FAF8F5] border border-[#4A1017] rounded-2xl shadow-[0_22px_45px_rgba(43,7,11,0.28)] p-5 z-30 divide-y divide-[#4A1017]/15 max-h-[75vh] overflow-y-auto"
                  >
                    {/* Drawer Header */}
                    <div className="pb-3 flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-heading font-bold text-[#2B070B]">
                        Refine Collection
                      </h3>
                      {activeFiltersCount > 0 && (
                        <button
                          type="button"
                          onClick={resetAllFilters}
                          className="text-[11px] text-[#8C6B38] hover:text-[#2B070B] underline uppercase tracking-wider font-semibold cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {/* 🌟 1. TYPE / CATEGORY ACCORDION */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleSection("type")}
                        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-heading font-bold text-[#2B2520] mb-2 cursor-pointer hover:text-[#C19A6B] transition-colors"
                      >
                        <span>TYPE ({allTypes.length})</span>
                        <span className="text-xs">{openSections.type ? "▲" : "▼"}</span>
                      </button>

                      {openSections.type && (
                        <div className="space-y-1.5 pl-0.5">
                          {(showAllTypes ? allTypes : allTypes.slice(0, 6)).map((t: string) => {
                            const isChecked = selectedTypes.includes(t);
                            return (
                              <label
                                key={t}
                                className="flex items-center gap-2.5 text-xs text-[#5A4E42] hover:text-[#2B2520] cursor-pointer py-0.5 group select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleType(t)}
                                  className="w-4 h-4 rounded-xs border-[#DFD8CC] text-[#2B2520] focus:ring-0 cursor-pointer accent-[#C19A6B]"
                                />
                                <span className={isChecked ? "font-semibold text-[#2B2520]" : "font-normal"}>
                                  {t}
                                </span>
                              </label>
                            );
                          })}

                          {allTypes.length > 6 && (
                            <button
                              type="button"
                              onClick={() => setShowAllTypes(!showAllTypes)}
                              className="text-[10px] text-[#C19A6B] hover:text-[#2B2520] font-bold uppercase tracking-wider pt-1 block cursor-pointer"
                            >
                              {showAllTypes ? "Show Less" : `${allTypes.length - 6} MORE`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🌟 2. MATERIAL ACCORDION */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleSection("material")}
                        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-heading font-bold text-[#2B2520] mb-2 cursor-pointer hover:text-[#C19A6B] transition-colors"
                      >
                        <span>MATERIAL ({allMaterials.length})</span>
                        <span className="text-xs">{openSections.material ? "▲" : "▼"}</span>
                      </button>

                      {openSections.material && (
                        <div className="space-y-1.5 pl-0.5">
                          {(showAllMaterials ? allMaterials : allMaterials.slice(0, 6)).map((m: string) => {
                            const isChecked = selectedMaterials.includes(m);
                            return (
                              <label
                                key={m}
                                className="flex items-center gap-2.5 text-xs text-[#5A4E42] hover:text-[#2B2520] cursor-pointer py-0.5 group select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleMaterial(m)}
                                  className="w-4 h-4 rounded-xs border-[#DFD8CC] text-[#2B2520] focus:ring-0 cursor-pointer accent-[#C19A6B]"
                                />
                                <span className={isChecked ? "font-semibold text-[#2B2520]" : "font-normal"}>
                                  {m}
                                </span>
                              </label>
                            );
                          })}

                          {allMaterials.length > 6 && (
                            <button
                              type="button"
                              onClick={() => setShowAllMaterials(!showAllMaterials)}
                              className="text-[10px] text-[#C19A6B] hover:text-[#2B2520] font-bold uppercase tracking-wider pt-1 block cursor-pointer"
                            >
                              {showAllMaterials ? "Show Less" : `${allMaterials.length - 6} MORE`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🌟 3. COLOR ACCORDION */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleSection("color")}
                        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-heading font-bold text-[#2B2520] mb-2 cursor-pointer hover:text-[#C19A6B] transition-colors"
                      >
                        <span>COLOR ({allColors.length})</span>
                        <span className="text-xs">{openSections.color ? "▲" : "▼"}</span>
                      </button>

                      {openSections.color && (
                        <div className="space-y-2 pl-0.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            {(showAllColors ? allColors : allColors.slice(0, 8)).map((c) => {
                              const isChecked = selectedColors.includes(c.name);
                              return (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => toggleColor(c.name)}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${isChecked
                                      ? "border-[#C19A6B] bg-[#FAFAFA] font-semibold text-[#2B2520]"
                                      : "border-[#EAEAEB] hover:border-[#C19A6B] text-[#5A4E42]"
                                    }`}
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  <span className="truncate">{c.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          {allColors.length > 8 && (
                            <button
                              type="button"
                              onClick={() => setShowAllColors(!showAllColors)}
                              className="text-[10px] text-[#C19A6B] hover:text-[#2B2520] font-bold uppercase tracking-wider pt-1 block cursor-pointer"
                            >
                              {showAllColors ? "Show Less" : `${allColors.length - 8} MORE`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🌟 4. PATTERN ACCORDION */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleSection("pattern")}
                        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-heading font-bold text-[#2B2520] mb-2 cursor-pointer hover:text-[#C19A6B] transition-colors"
                      >
                        <span>PATTERN ({allPatterns.length})</span>
                        <span className="text-xs">{openSections.pattern ? "▲" : "▼"}</span>
                      </button>

                      {openSections.pattern && (
                        <div className="space-y-1.5 pl-0.5">
                          {(showAllPatterns ? allPatterns : allPatterns.slice(0, 6)).map((pat: string) => {
                            const isChecked = selectedPatterns.includes(pat);
                            return (
                              <label
                                key={pat}
                                className="flex items-center gap-2.5 text-xs text-[#5A4E42] hover:text-[#2B2520] cursor-pointer py-0.5 group select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePattern(pat)}
                                  className="w-4 h-4 rounded-xs border-[#DFD8CC] text-[#2B2520] focus:ring-0 cursor-pointer accent-[#C19A6B]"
                                />
                                <span className={isChecked ? "font-semibold text-[#2B2520]" : "font-normal"}>
                                  {pat}
                                </span>
                              </label>
                            );
                          })}

                          {allPatterns.length > 6 && (
                            <button
                              type="button"
                              onClick={() => setShowAllPatterns(!showAllPatterns)}
                              className="text-[10px] text-[#C19A6B] hover:text-[#2B2520] font-bold uppercase tracking-wider pt-1 block cursor-pointer"
                            >
                              {showAllPatterns ? "Show Less" : `${allPatterns.length - 6} MORE`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🌟 5. SHAPE ACCORDION */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleSection("shape")}
                        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-heading font-bold text-[#2B2520] mb-2 cursor-pointer hover:text-[#C19A6B] transition-colors"
                      >
                        <span>SHAPE ({allShapes.length})</span>
                        <span className="text-xs">{openSections.shape ? "▲" : "▼"}</span>
                      </button>

                      {openSections.shape && (
                        <div className="space-y-1.5 pl-0.5">
                          {(showAllShapes ? allShapes : allShapes.slice(0, 6)).map((shp: string) => {
                            const isChecked = selectedShapes.includes(shp);
                            return (
                              <label
                                key={shp}
                                className="flex items-center gap-2.5 text-xs text-[#5A4E42] hover:text-[#2B2520] cursor-pointer py-0.5 group select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleShape(shp)}
                                  className="w-4 h-4 rounded-xs border-[#DFD8CC] text-[#2B2520] focus:ring-0 cursor-pointer accent-[#C19A6B]"
                                />
                                <span className={isChecked ? "font-semibold text-[#2B2520]" : "font-normal"}>
                                  {shp}
                                </span>
                              </label>
                            );
                          })}

                          {allShapes.length > 6 && (
                            <button
                              type="button"
                              onClick={() => setShowAllShapes(!showAllShapes)}
                              className="text-[10px] text-[#C19A6B] hover:text-[#2B2520] font-bold uppercase tracking-wider pt-1 block cursor-pointer"
                            >
                              {showAllShapes ? "Show Less" : `${allShapes.length - 6} MORE`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🌟 6. PRICE SORT ACCORDION */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleSection("sort")}
                        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-heading font-bold text-[#2B2520] mb-2 cursor-pointer hover:text-[#C19A6B] transition-colors"
                      >
                        <span>PRICE SORT</span>
                        <span className="text-xs">{openSections.sort ? "▲" : "▼"}</span>
                      </button>

                      {openSections.sort && (
                        <div className="space-y-1.5 pl-0.5">
                          {[
                            { id: "default", label: "Featured / Recommended" },
                            { id: "price_asc", label: "Price: Low to High" },
                            { id: "price_desc", label: "Price: High to Low" },
                          ].map((s) => {
                            const isChecked = sortBy === s.id;
                            return (
                              <label
                                key={s.id}
                                className="flex items-center gap-2.5 text-xs text-[#5A4E42] hover:text-[#2B2520] cursor-pointer py-0.5 group select-none"
                              >
                                <input
                                  type="radio"
                                  name="sortByRadio"
                                  checked={isChecked}
                                  onChange={() => setSortBy(s.id as any)}
                                  className="w-4 h-4 text-[#2B2520] focus:ring-0 cursor-pointer accent-[#C19A6B]"
                                />
                                <span className={isChecked ? "font-semibold text-[#2B2520]" : "font-normal"}>
                                  {s.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Drawer Footer */}
                    <div className="pt-3 flex items-center justify-between">
                      <span className="text-xs text-[#6A5A55]">
                        <strong className="text-[#2B070B] font-heading">{filteredProducts.length}</strong> rugs found
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="bg-[#2B070B] text-[#FAF5EB] px-5 py-2 text-xs uppercase tracking-wider font-heading font-bold hover:bg-[#3D0C12] hover:text-white transition-colors rounded-none border border-[#4A1017] cursor-pointer shadow-xs"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 🌟 2. Center / Tabs: Shape Category Tabs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center items-center gap-2 sm:gap-3"
          >
            {categories.map((category) => (
              <motion.button
                variants={buttonVariants}
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-[11px] sm:text-xs md:text-[13px] tracking-[0.14em] uppercase py-1.5 px-3.5 rounded-full transition-all duration-300 relative cursor-pointer font-heading ${category.toLowerCase() === "runner" ? "hidden sm:inline-flex" : "inline-flex"
                  } ${activeCategory === category
                    ? "bg-[#2B070B] text-[#FAF5EB] font-bold border border-[#4A1017] shadow-xs"
                    : "text-[#6A5A55] hover:text-[#2B070B] hover:bg-[#FAF5EB] font-semibold border border-transparent hover:border-[#4A1017]/30"
                  }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Spacer for symmetrical flex layout on desktop */}
          <div className="hidden md:block w-24" />
        </div>

        {/* Active Filter Chips Display */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
          >
            <span className="text-[10px] uppercase tracking-wider text-[#8C6B38] font-heading font-bold mr-1">
              Active Filters:
            </span>

            {/* Type Chips */}
            {selectedTypes.map((type) => (
              <span key={type} className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#4A1017]/30 text-[#2B070B] px-3 py-1 rounded-full text-[11px] shadow-2xs font-medium">
                <span>Type: <strong>{type}</strong></span>
                <button
                  onClick={() => toggleType(type)}
                  className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* Material Chips */}
            {selectedMaterials.map((mat) => (
              <span key={mat} className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#4A1017]/30 text-[#2B070B] px-3 py-1 rounded-full text-[11px] shadow-2xs font-medium">
                <span>Material: <strong>{mat}</strong></span>
                <button
                  onClick={() => toggleMaterial(mat)}
                  className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* Color Chips */}
            {selectedColors.map((col) => (
              <span key={col} className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#4A1017]/30 text-[#2B070B] px-3 py-1 rounded-full text-[11px] shadow-2xs font-medium">
                <span>Color: <strong>{col}</strong></span>
                <button
                  onClick={() => toggleColor(col)}
                  className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* Pattern Chips */}
            {selectedPatterns.map((pat) => (
              <span key={pat} className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#4A1017]/30 text-[#2B070B] px-3 py-1 rounded-full text-[11px] shadow-2xs font-medium">
                <span>Pattern: <strong>{pat}</strong></span>
                <button
                  onClick={() => togglePattern(pat)}
                  className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* Shape Chips */}
            {selectedShapes.map((shp) => (
              <span key={shp} className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#4A1017]/30 text-[#2B070B] px-3 py-1 rounded-full text-[11px] shadow-2xs font-medium">
                <span>Shape: <strong>{shp}</strong></span>
                <button
                  onClick={() => toggleShape(shp)}
                  className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* Sort Chip */}
            {sortBy !== "default" && (
              <span key="sort-chip" className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#4A1017]/30 text-[#2B070B] px-3 py-1 rounded-full text-[11px] shadow-2xs font-medium">
                <span>Sort: <strong>{sortBy === "price_asc" ? "Low to High" : "High to Low"}</strong></span>
                <button
                  onClick={() => setSortBy("default")}
                  className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] text-[#8C6B38] hover:text-[#2B070B] underline uppercase tracking-wider font-heading font-bold ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </motion.div>
        )}

        {/* Product Grid Area */}
        {isLoading ? (
          <SkeletonProductGrid />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-12">
            <AnimatePresence>
              {filteredProducts.map((item: any, index: number) => {
                const displayImg = Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : item.image || "/images/placeholder.jpg";
                const itemDiscount = item.discount_percent || item.variants?.[0]?.discount_percent || 0;
                const itemOriginalPrice = item.original_price || (item.variants?.[0]?.original_price ? (item.variants[0].original_price.toString().startsWith('₹') ? item.variants[0].original_price : `₹${item.variants[0].original_price}`) : null);
                const isItemWishlisted = wishlist.includes(item.id);

                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.02, 0.15),
                      ease: "easeOut"
                    }}
                    className="flex flex-col group h-full items-center text-center"
                  >
                    <div className="w-full flex flex-col h-full">
                      {/* Seamless Image Container - Normal Square Corner, pure photo, gentle lift + maroon shadow */}
                      <div className="relative aspect-[3/4] sm:aspect-4/5 w-full rounded-none overflow-hidden bg-[#240609] shadow-xs group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-4px_rgba(74,16,23,0.4)] active:scale-[0.98] transition-all duration-300 mb-3 cursor-pointer">
                        <Link href={`/product/${item.id}`} prefetch={true} className="block w-full h-full">
                          {displayImg ? (
                            <SafeImage
                              src={displayImg}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 450px"
                              quality={90}
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#240609]">
                              <img
                                src="/nr-logo.png"
                                alt="NR Enterprises"
                                className="w-16 h-16 object-contain opacity-75 mb-1.5"
                              />
                              <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-[#FAF5EB]/80">
                                NR Enterprises
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Top Badges */}
                        {itemDiscount > 0 ? (
                          <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-[#1B4D3E] text-white border border-[#26624F] text-[9.5px] sm:text-[10.5px] font-heading font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-md shadow-sm z-10 pointer-events-none">
                            -{itemDiscount}%
                          </span>
                        ) : item.badge ? (
                          <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-white/95 text-[#2B070B] text-[9.5px] sm:text-[10px] font-heading font-bold tracking-wider px-2.5 py-0.5 rounded-md shadow-sm border border-[#4A1017]/20 z-10 pointer-events-none">
                            {item.badge}
                          </span>
                        ) : null}

                        {/* Desktop View Details Button on Hover */}
                        <Link
                          href={`/product/${item.id}`}
                          prefetch={true}
                          className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block"
                        >
                          <span className="w-full block text-center bg-white hover:bg-[#FAF5EB] text-[#2B070B] hover:text-[#4A1017] py-2.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 shadow-xl border border-black/10 backdrop-blur-md">
                            View Details →
                          </span>
                        </Link>
                      </div>

                      {/* Product Details (Centered, Crisp & Perfectly Spaced) */}
                      <div className="w-full flex flex-col items-center pt-1 flex-1 justify-between">
                        <div>
                          {item.category && (
                            <span className="text-[10px] sm:text-[11px] font-heading font-bold text-[#4A1017] uppercase tracking-[0.2em] block mb-1">
                              {item.category}
                            </span>
                          )}
                          <Link href={`/product/${item.id}`} prefetch={true}>
                            <h3 className="text-[13px] sm:text-[14.5px] text-[#2B070B] font-heading font-semibold leading-snug line-clamp-2 hover:text-[#4A1017] transition-colors mb-1.5">
                              {item.name}
                            </h3>
                          </Link>
                          {/* Star Ratings */}
                          <div className="flex items-center justify-center text-[#4A1017] text-[12px] tracking-widest mb-1.5 font-bold">
                            {"★".repeat(item.rating || 5)}
                          </div>
                        </div>

                        {/* Price Details */}
                        <div className="flex items-baseline justify-center gap-2 pt-1">
                          <span className="text-[13.5px] sm:text-[15px] text-[#2B070B] font-heading font-bold">
                            {formatPrice(item.price, 1)}
                          </span>
                          {itemOriginalPrice && (
                            <span className="text-[11px] sm:text-[12px] text-[#8C7A63] line-through font-normal">
                              {typeof itemOriginalPrice === 'number' ? formatPrice(itemOriginalPrice, 1) : itemOriginalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-[#6A5A55]">
            <p className="font-heading font-semibold text-base mb-2">No rugs found matching your filter criteria.</p>
            <button
              onClick={resetAllFilters}
              className="inline-block bg-[#2B070B] text-[#FAF5EB] hover:bg-[#3D0C12] hover:text-white border border-[#4A1017] px-6 py-2 rounded-none text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Dynamic Bespoke Custom Banner - Link to WhatsApp Inquiry */}
        <div className="mt-20 p-8 sm:p-12 bg-gradient-to-r from-[#240609] via-[#2D080C] to-[#240609] border border-[#4A1017] shadow-xl rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left text-white">
          <div className="max-w-xl">
            <span className="text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#FAF5EB] block mb-2">
              BHADOHI LOOM ATELIER
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
              {pageContent?.banner?.title || "Need Custom Architectural Dimensions?"}
            </h3>
            <p className="text-xs sm:text-sm text-[#FAF5EB]/80 leading-relaxed">
              Every room has distinct proportions. Speak directly with our Bhadohi master artisans to weave your custom silhouette.
            </p>
          </div>
          <a
            href="https://wa.me/919151452441?text=Hello%20NR%20Enterprises%20Atelier,%20I%20would%20like%20to%20discuss%20a%20custom%20rug%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FAF5EB] hover:bg-white text-[#240609] hover:text-[#240609] px-8 py-3.5 text-xs font-heading font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-full shadow-lg shrink-0 cursor-pointer"
          >
            Chat on WhatsApp →
          </a>
        </div>

      </div>
    </div>
  );
}