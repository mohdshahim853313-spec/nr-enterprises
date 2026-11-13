"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/context/CurrencyContext";



export type RugShape = "Rectangular" | "Round" | "Oval" | "Runner" | "Square" | "Arch";

export interface ShapeOption {
  id: RugShape;
  label: string;
  icon: string;
}

export const SHAPE_OPTIONS: ShapeOption[] = [
  { id: "Rectangular", label: "Rectangular", icon: "M3 6h18v12H3z" },
  { id: "Round", label: "Round Circle", icon: "M12 3a9 9 0 100 18 9 9 0 000-18z" },
  { id: "Oval", label: "Oval Capsule", icon: "M6 3h12a9 9 0 010 18H6A9 9 0 016 3z" },
  { id: "Runner", label: "Hallway Runner", icon: "M2 8h20v8H2z" },
  { id: "Square", label: "Square Studio", icon: "M4 4h16v16H4z" },
  { id: "Arch", label: "Modern Arch", icon: "M4 20V12a8 8 0 0116 0v8H4z" },
];



export type FloorScene = "atelier" | "oak" | "walnut" | "travertine";

interface PresetSize {
  shape: RugShape;
  label: string;
  w: string;
  l: string;
  d?: string;
}

const PRESET_SIZES: PresetSize[] = [
  { shape: "Rectangular", label: "5' × 8' (Standard)", w: "5", l: "8" },
  { shape: "Rectangular", label: "6' × 9' (Living Area)", w: "6", l: "9" },
  { shape: "Rectangular", label: "8' × 10' (Grand Room)", w: "8", l: "10" },
  { shape: "Rectangular", label: "9' × 12' (Master Suite)", w: "9", l: "12" },
  { shape: "Round", label: "5' Diameter", w: "5", l: "5", d: "5" },
  { shape: "Round", label: "6' Diameter", w: "6", l: "6", d: "6" },
  { shape: "Round", label: "8' Diameter", w: "8", l: "8", d: "8" },
  { shape: "Oval", label: "5' × 8' Oval", w: "5", l: "8" },
  { shape: "Oval", label: "6' × 9' Oval", w: "6", l: "9" },
  { shape: "Runner", label: "2.5' × 8' Entryway", w: "2.5", l: "8" },
  { shape: "Runner", label: "2.5' × 10' Long Hall", w: "2.5", l: "10" },
  { shape: "Square", label: "6' × 6' Square", w: "6", l: "6" },
  { shape: "Square", label: "8' × 8' Square", w: "8", l: "8" },
  { shape: "Arch", label: "4' × 6' Arch", w: "4", l: "6" },
  { shape: "Arch", label: "5' × 8' Arch", w: "5", l: "8" },
];

// =================================================================
// MAIN BESPOKE CUSTOMIZER COMPONENT
// =================================================================
export function CustomizerContent({ initialProductId }: { initialProductId?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const requestedId = initialProductId || searchParams.get("product") || searchParams.get("id");

  const [products, setProducts] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Shape & Dimensions
  const [shape, setShape] = useState<RugShape>("Rectangular");
  const [length, setLength] = useState("8");
  const [width, setWidth] = useState("5");
  const [diameter, setDiameter] = useState("6");
  const [unit, setUnit] = useState<"ft" | "cm" | "in">("ft");

  const [isRugPickerOpen, setIsRugPickerOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // 🌟 PHOTO DYE: COLOR CONTROLS (MATCHING USER REQUEST)
  const defaultPhotoFilters = {
    saturation: 100, // 0% - 300%
    temperature: 0,   // -100° - 100°
    tint: 0,          // -100° - 100°
    hue: 0,           // -180° - 180°
  };

  const [photoFilters, setPhotoFilters] = useState(defaultPhotoFilters);

  const handleResetPhotoFilters = () => {
    setPhotoFilters(defaultPhotoFilters);
  };

  const [specialInstructions, setSpecialInstructions] = useState("");

  // Room Scene Preview
  const [floorScene, setFloorScene] = useState<FloorScene>("atelier");
  const [zoomPreview, setZoomPreview] = useState(false);

  // Pricing & State
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 🌟 SEND CUSTOM ORDER REQUEST MODAL & SUBMISSION STATE
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custNotes, setCustNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<null | { orderCode: string; message: string }>(null);
  const [requestError, setRequestError] = useState("");
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);

  // Auto-fill customer info if logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (session.user.email) setCustEmail(session.user.email);
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        if (name) setCustName(name);
      }
    });
  }, []);

  const handleSendCustomRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!custEmail.trim()) {
      setRequestError("Please enter your email address so we can confirm your custom order.");
      return;
    }

    setIsSubmittingRequest(true);
    setRequestError("");

    try {
      const generatedCode = `RZ-CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      const dimStr = shape === "Round" ? `${diameter} ${unit} Diameter` : `${width} × ${length} ${unit}`;
      const configUrl = typeof window !== "undefined" ? window.location.href : "";

      const res = await fetch("/api/custom-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: generatedCode,
          customerName: custName.trim() || "Valued Patron",
          customerEmail: custEmail.trim(),
          customerPhone: custPhone.trim(),
          shape,
          dimensions: dimStr,
          areaSqFt: parseFloat(areaSqFt.toFixed(1)),
          photoFilters,
          thickness: "Classic Chunky (12mm)",
          edgeFinish: "Seamless Tailored Fold",
          specialInstructions: custNotes.trim() || specialInstructions.trim(),
          calculatedPrice,
          currency: "USD",
          configUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit custom request");
      }

      setRequestSuccess({
        orderCode: data.orderCode || generatedCode,
        message: data.message || "we got your request please be pationt we will send you email",
      });

      try {
        const localRequests = JSON.parse(localStorage.getItem("nrenterprises_custom_requests") || "[]");
        localRequests.unshift({
          orderCode: data.orderCode || generatedCode,
          shape,
          dimensions: dimStr,
          photoFilters,
          price: calculatedPrice,
          date: new Date().toISOString(),
        });
        localStorage.setItem("nrenterprises_custom_requests", JSON.stringify(localRequests));
      } catch (storageErr) {}
    } catch (err: any) {
      console.error(err);
      setRequestError(err.message || "Could not send your request. Please try again.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // 1. Fetch Products & Initialize
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const { data: allProducts, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: studioReg } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "studio_rug_images")
          .maybeSingle();

        const studioMap = studioReg?.data || {};

        if (!error && allProducts && allProducts.length > 0) {
          const augmentedProducts = allProducts.map((p: any) => ({
            ...p,
            studio_image:
              p.studio_image ||
              p.variants?.[0]?.studio_image ||
              studioMap[p.id] ||
              null,
          }));

          setProducts(augmentedProducts);

          let initialProduct = null;
          if (requestedId) {
            initialProduct = augmentedProducts.find((p: any) => p.id === requestedId);
          }
          if (!initialProduct) {
            // Pick a product with studio_image if available, otherwise first product
            initialProduct = augmentedProducts.find((p: any) => p.studio_image) || augmentedProducts[0];
          }
          setProduct(initialProduct);
        }
      } catch (e) {
        console.error("Customizer init failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInit();
  }, [requestedId]);

  // Read URL query params
  useEffect(() => {
    const qShape = searchParams.get("shape") as RugShape;
    const qW = searchParams.get("w");
    const qL = searchParams.get("l");
    const qD = searchParams.get("d");
    const qUnit = searchParams.get("unit") as "ft" | "cm" | "in";

    if (qShape && SHAPE_OPTIONS.some((s) => s.id === qShape)) setShape(qShape);
    if (qW) setWidth(qW);
    if (qL) setLength(qL);
    if (qD) setDiameter(qD);
    if (qUnit && ["ft", "cm", "in"].includes(qUnit)) setUnit(qUnit);

    const qSat = searchParams.get("sat");
    const qTemp = searchParams.get("temp");
    const qTint = searchParams.get("tint");
    const qHue = searchParams.get("hue");

    if (qSat || qTemp || qTint || qHue) {
      setPhotoFilters((prev) => ({
        saturation: qSat !== null ? parseInt(qSat, 10) : prev.saturation,
        temperature: qTemp !== null ? parseInt(qTemp, 10) : prev.temperature,
        tint: qTint !== null ? parseInt(qTint, 10) : prev.tint,
        hue: qHue !== null ? parseInt(qHue, 10) : prev.hue,
      }));
    }
  }, [searchParams]);

  // Unit conversion helper
  const handleUnitChange = (newUnit: "ft" | "cm" | "in") => {
    if (newUnit === unit) return;

    let toFeetMultiplier = 1;
    if (unit === "cm") toFeetMultiplier = 1 / 30.48;
    if (unit === "in") toFeetMultiplier = 1 / 12;

    let fromFeetMultiplier = 1;
    if (newUnit === "cm") fromFeetMultiplier = 30.48;
    if (newUnit === "in") fromFeetMultiplier = 12;

    const convertValue = (val: string) => {
      const num = parseFloat(val);
      if (isNaN(num)) return val;
      const inFeet = num * toFeetMultiplier;
      const converted = inFeet * fromFeetMultiplier;
      return newUnit === "ft" ? converted.toFixed(1) : Math.round(converted).toString();
    };

    setWidth((prev) => convertValue(prev));
    setLength((prev) => convertValue(prev));
    setDiameter((prev) => convertValue(prev));
    setUnit(newUnit);
  };

  // Convert current dimensions to feet for area calculation
  const areaSqFt = useMemo(() => {
    let factor = 1;
    if (unit === "cm") factor = 1 / 30.48;
    if (unit === "in") factor = 1 / 12;

    const l = (parseFloat(length) || 0) * factor;
    const w = (parseFloat(width) || 0) * factor;
    const d = (parseFloat(diameter) || 0) * factor;

    if (shape === "Round") {
      return Math.PI * Math.pow(d / 2, 2);
    } else if (shape === "Oval") {
      const minDim = Math.min(l, w);
      const maxDim = Math.max(l, w);
      const radius = minDim / 2;
      const straightLength = Math.max(0, maxDim - minDim);
      const circleArea = Math.PI * Math.pow(radius, 2);
      const rectArea = minDim * straightLength;
      return circleArea + rectArea;
    } else if (shape === "Arch") {
      const radius = w / 2;
      const rectHeight = Math.max(0, l - radius);
      const halfCircleArea = 0.5 * Math.PI * Math.pow(radius, 2);
      const rectArea = w * rectHeight;
      return halfCircleArea + rectArea;
    } else {
      return l * w;
    }
  }, [length, width, diameter, shape, unit]);

  const areaSqMeters = useMemo(() => {
    return areaSqFt * 0.092903;
  }, [areaSqFt]);

  // 🌟 Dynamic Custom Price Calculator
  useEffect(() => {
    if (!product) return;

    let basePrice = 1;
    let baseArea = 15; // default 3x5 ft

    if (product.variants && product.variants.length > 0) {
      const baseVariant = product.variants[0];
      const basePriceStr = (baseVariant.price || "").toString().replace(/[^0-9.]/g, "");
      basePrice = parseFloat(basePriceStr) || 1;

      const dimMatch = baseVariant.size?.match(/([\d.]+)\s*[xX]\s*([\d.]+)/);
      if (dimMatch) {
        baseArea = parseFloat(dimMatch[1]) * parseFloat(dimMatch[2]);
      }
    } else if (product.price) {
      const pStr = product.price.toString().replace(/[^0-9.]/g, "");
      basePrice = parseFloat(pStr) || 1;
    }

    const ratePerSqFt = basePrice / (baseArea > 0 ? baseArea : 15);
    const usableArea = areaSqFt > 0 ? areaSqFt : baseArea;

    const surchargePercent = parseFloat(product.customization_surcharge) || 15;
    const surchargeMultiplier = 1 + surchargePercent / 100;

    const finalInrPrice = usableArea * ratePerSqFt * surchargeMultiplier;
    setCalculatedPrice(Math.round(finalInrPrice));
  }, [areaSqFt, product]);

  // Preset Size Selection
  const applyPreset = (preset: PresetSize) => {
    setShape(preset.shape);
    if (preset.d) {
      setDiameter(preset.d);
    } else {
      setWidth(preset.w);
      setLength(preset.l);
    }
    setUnit("ft");
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (!product) return;

    if (shape === "Round" && (!diameter || parseFloat(diameter) <= 0)) {
      alert("Please specify a valid custom diameter.");
      return;
    }
    if (shape !== "Round" && (!length || !width || parseFloat(length) <= 0 || parseFloat(width) <= 0)) {
      alert("Please specify both valid length and width.");
      return;
    }

    setIsAdding(true);

    const customSizeStr =
      shape === "Round"
        ? `${diameter} ${unit} Dia`
        : `${width} × ${length} ${unit}`;

    const rugImage = product.studio_image || product.images?.[0] || product.image || "";

    const customCartItem = {
      id: product.id + "_custom_" + Date.now(),
      product_id: product.id,
      name: `${product.name} (Bespoke Studio Custom)`,
      category: "CUSTOM ORDER",
      image: rugImage,
      size: `${shape} — ${customSizeStr} (${areaSqFt.toFixed(1)} sq ft)`,
      price: Math.round(calculatedPrice),
      quantity: 1,
      isCustom: true,
      customDetails: {
        shape,
        dimensions: customSizeStr,
        areaSqFt: areaSqFt.toFixed(1),
        unit,
        photoFilters,
        instructions: specialInstructions.trim() || undefined,
      },
    };

    try {
      const existingCart = JSON.parse(localStorage.getItem("nrenterprises_cart") || "[]");
      existingCart.push(customCartItem);
      localStorage.setItem("nrenterprises_cart", JSON.stringify(existingCart));

      window.dispatchEvent(new Event("cart_updated"));

      setTimeout(() => {
        setIsAdding(false);
        window.dispatchEvent(new Event("open_cart"));
      }, 400);
    } catch (err) {
      console.error(err);
      setIsAdding(false);
    }
  };

  // Share Configuration Link
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("product", product?.id || "");
    url.searchParams.set("shape", shape);
    url.searchParams.set("w", width);
    url.searchParams.set("l", length);
    if (shape === "Round") url.searchParams.set("d", diameter);
    url.searchParams.set("unit", unit);
    if (photoFilters.saturation !== 100) url.searchParams.set("sat", photoFilters.saturation.toString());
    if (photoFilters.temperature !== 0) url.searchParams.set("temp", photoFilters.temperature.toString());
    if (photoFilters.tint !== 0) url.searchParams.set("tint", photoFilters.tint.toString());
    if (photoFilters.hue !== 0) url.searchParams.set("hue", photoFilters.hue.toString());

    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-[80px] lg:top-[135px] z-30 bg-[#FAF8F5] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#DFD8CC] border-t-[#C19A6B] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-white/90 border border-[#DFD8CC] flex items-center justify-center shadow-xs">
              <img src="/nr-logo.png" alt="NR Enterprises Atelier" className="w-6 h-6 object-contain opacity-80" />
            </div>
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#2B2520] font-heading font-bold mb-1.5">
          Entering Bespoke Studio
        </span>
        <p className="text-xs text-[#8C7A63] tracking-wide font-body max-w-xs">
          Preparing custom loom configurations, room scenes & color palettes...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-[#FAF8F5] px-6 text-center py-12">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B070B] mb-3">No Customizable Rug Found</h2>
        <p className="text-[#5A4E42] font-body mb-8 max-w-md text-sm">Please browse our collection atelier to pick an artisanal silhouette.</p>
        <Link
          href="/collections"
          className="border border-[#4A1017] text-[#FAF5EB] bg-[#2B070B] hover:bg-[#3D0C12] hover:text-white px-8 py-3.5 text-xs tracking-widest uppercase transition rounded-none font-heading font-semibold shadow-xs"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-2 pb-14 font-sans text-[#2B070B]">
      {/* COMPACT ATELIER STUDIO HEADER */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mb-3 sm:mb-4 pb-2 sm:pb-2.5 border-b border-[#4A1017]/20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          {/* Breadcrumb line */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] mb-0.5">
            <button
              onClick={() => router.back()}
              className="uppercase tracking-wider text-[#5A4E42] hover:text-[#8C6B38] inline-flex items-center gap-1 transition-colors cursor-pointer font-heading font-semibold"
            >
              ← Back to Atelier
            </button>
            <span className="text-[#4A1017]/30">•</span>
            <span className="uppercase tracking-[0.2em] text-[#8C6B38] font-heading font-bold">
              Bespoke Studio
            </span>
            <span className="text-[#4A1017]/30">•</span>
            <span className="bg-[#4A1017]/10 text-[#2B070B] border border-[#4A1017]/20 px-2 py-0.5 rounded-none font-heading font-semibold uppercase tracking-wider text-[9px]">
              {product?.category || "Bespoke Collection"}
            </span>
          </div>

          {/* Compact Product Name */}
          <h1 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-[#2B070B] tracking-tight truncate max-w-3xl leading-snug">
            {product?.name || "Bespoke Floor Sculpture"}
          </h1>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-[11px] uppercase tracking-wider font-heading font-semibold text-[#2B070B] hover:text-[#8C6B38] border border-[#4A1017]/20 px-3 py-1.5 rounded-none bg-white hover:border-[#4A1017] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-[#8C6B38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{copiedLink ? "Link Copied! ✔" : "Share Config"}</span>
          </button>

          <Link
            href="/legacy"
            className="text-[11px] uppercase tracking-wider font-heading font-semibold text-[#2B070B] hover:text-[#8C6B38] border border-[#4A1017]/20 px-3 py-1.5 rounded-none bg-white hover:border-[#4A1017] transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>Artisan Process →</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-6 xl:gap-8">
        {/* =========================================================
            LEFT COLUMN: REAL-TIME CONCENTRIC BRAID & PHOTO VISUALIZER
        ========================================================= */}
        <div className="w-full lg:w-5/12 xl:w-1/2 flex flex-col">
          <div className="lg:sticky lg:top-20 space-y-3">
            
            {/* 🌟 BASE PRODUCT SELECTOR / PICK ANY RUG BAR - SLIM */}
            <div className="bg-white px-3 py-2 rounded-none border border-[#4A1017]/20 shadow-2xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-none overflow-hidden bg-[#FAF8F5] border border-[#4A1017]/20 shrink-0 relative">
                  {product?.studio_image || product?.images?.[0] || product?.image ? (
                    <img
                      src={product?.studio_image || product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#5A4E42]">
                      NR
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase tracking-wider bg-[#FAF5EB] border border-[#4A1017]/20 text-[#8C6B38] px-1.5 py-0.2 rounded-none font-heading font-bold">
                      {product?.category || "Bespoke"}
                    </span>
                    {product?.studio_image ? (
                      <span className="text-[9px] uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-none font-heading font-bold">
                        ✓ Studio Ready
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider bg-[#FAF5EB] text-[#2B070B] border border-[#4A1017]/20 px-1.5 py-0.2 rounded-none font-heading font-bold">
                        Studio Shot
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-heading font-bold text-[#2B070B] truncate block max-w-xs sm:max-w-md">
                    {product?.name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRugPickerOpen(true)}
                className="shrink-0 bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white px-3 py-1.5 rounded-none text-[11px] uppercase tracking-wider font-heading font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs border border-[#4A1017]/30"
              >
                <span>🔄 Change Rug</span>
                {products.length > 0 && (
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-none hidden sm:inline">
                    {products.length}
                  </span>
                )}
              </button>
            </div>

            {/* VISUALIZER CANVAS CONTAINER WITH REALISTIC FLOOR BACKGROUNDS */}
            <div
              className={`relative w-full rounded-none overflow-hidden border border-[#4A1017]/20 shadow-md transition-all duration-500 flex items-center justify-center ${
                zoomPreview ? "h-[460px] sm:h-[540px]" : "h-[330px] sm:h-[380px] lg:h-[410px]"
              }`}
              style={{
                background:
                  floorScene === "oak"
                    ? "repeating-linear-gradient(90deg, #E6D8C2 0px, #E6D8C2 78px, #D5C5AC 79px, #DFD1B8 80px, #EFE4D2 160px)"
                    : floorScene === "walnut"
                    ? "repeating-linear-gradient(90deg, #3A2B20 0px, #3A2B20 80px, #2A1D14 81px, #443428 82px, #3D2D22 160px)"
                    : floorScene === "travertine"
                    ? "radial-gradient(circle at 50% 50%, #FAF6EE 0%, #EDE5D6 60%, #E3D9C6 100%)"
                    : "linear-gradient(135deg, #F5F1E8 0%, #E8E0D2 100%)",
              }}
            >
              {/* Floor Plank Seam Overlay for Wood */}
              {(floorScene === "oak" || floorScene === "walnut") && (
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: "linear-gradient(0deg, rgba(0,0,0,0.15) 1px, transparent 1px)",
                    backgroundSize: "100% 220px",
                  }}
                />
              )}

              {/* AMBIENT DROP SHADOW ON FLOOR */}
              <div className="absolute inset-0 bg-radial from-transparent via-black/5 to-black/20 pointer-events-none" />

              {/* 🌟 DUAL MODE VISUALIZER: REAL PHOTO DYE RECOLORING OR VECTOR CONCENTRIC BRAID */}
              <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                  className={`relative flex items-center justify-center transition-transform duration-300 drop-shadow-[0_25px_35px_rgba(0,0,0,0.38)] ${
                    zoomPreview ? "scale-115" : "scale-100"
                  }`}
                  style={{
                    width: "auto",
                    height: "auto",
                    maxHeight: "92%",
                    maxWidth: "92%",
                  }}
                >
                  {product?.studio_image ? (
                    /* 🎨 REALISTIC PHOTOGRAPHIC DYE OVERLAY ENGINE (TOP-DOWN STUDIO SHOT) - PRESERVES EXACT UPLOAD FRAME */
                    <div
                      className="relative overflow-hidden rounded-none transition-all duration-300 flex items-center justify-center max-w-full max-h-full"
                      style={{
                        boxShadow: "0 22px 38px -10px rgba(74,16,23,0.35)",
                      }}
                    >
                      {/* Rug Base High-Resolution Top-Down Studio Photo - 100% Full Frame (No Crop) */}
                      <img
                        src={product.studio_image}
                        alt={product.name}
                        className="max-h-[290px] sm:max-h-[340px] lg:max-h-[370px] w-auto max-w-full object-contain select-none pointer-events-none transition-[filter] duration-75 block"
                        style={{
                          filter: `saturate(${photoFilters.saturation}%) hue-rotate(${photoFilters.hue}deg)`,
                        }}
                      />

                      {/* Temperature Layer (Warm Amber vs Cool Blue) */}
                      {photoFilters.temperature !== 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-opacity duration-75"
                          style={{
                            backgroundColor: photoFilters.temperature > 0 ? "#FF8C00" : "#007BFF",
                            mixBlendMode: "color",
                            opacity: (Math.abs(photoFilters.temperature) / 100) * 0.45,
                          }}
                        />
                      )}

                      {/* Tint Layer (Magenta vs Green) */}
                      {photoFilters.tint !== 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-opacity duration-75"
                          style={{
                            backgroundColor: photoFilters.tint > 0 ? "#E040FB" : "#00E676",
                            mixBlendMode: "color",
                            opacity: (Math.abs(photoFilters.tint) / 100) * 0.4,
                          }}
                        />
                      )}

                      {/* Ambient Fiber Sheen & Edge Shade */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 68%, rgba(0,0,0,0.14) 100%)",
                        }}
                      />
                    </div>
                  ) : (
                    /* ⚠️ STUDIO IMAGE NOT AVAILABLE FOR THIS RUG */
                    <div className="relative w-full h-full rounded-3xl bg-white/95 border border-[#EAEAEB] shadow-lg flex flex-col items-center justify-center p-6 text-center z-10">
                      <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#DFD8CC] flex items-center justify-center text-2xl mb-3 shadow-2xs">
                        🎨
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-bold mb-1">
                        Bespoke Studio Notice
                      </span>
                      <h4 className="text-base sm:text-lg font-heading font-bold text-[#2B2520] mb-2">
                        This option of custom is not available for this rug
                      </h4>
                      <p className="text-xs text-[#7A7065] max-w-sm mb-5 font-body leading-relaxed">
                        A front top-down studio flatlay shot has not been uploaded for &ldquo;{product?.name}&rdquo; in the catalog listing. Please select a rug from the atelier that is studio-ready.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsRugPickerOpen(true)}
                        className="bg-[#2B2520] hover:bg-[#C19A6B] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-heading font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <span>🔄 Select a Studio-Ready Rug</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* 🌟 CONTROLS BAR OUTSIDE & BELOW VISUALIZER CANVAS */}
            <div className="bg-white px-4 py-3 rounded-2xl border border-[#EAEAEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-[#2B2520]">
              {/* Floor Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-heading font-semibold text-[#7A7065]">
                  Floor:
                </span>
                <div className="flex items-center gap-1">
                  {(["atelier", "oak", "walnut", "travertine"] as FloorScene[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFloorScene(f)}
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-heading font-semibold rounded-full transition-colors cursor-pointer ${
                        floorScene === f
                          ? "bg-[#2B070B] text-[#FAF5EB] shadow-xs"
                          : "bg-[#FAF5EB] text-[#5A4E42] hover:bg-[#FAF8F5] border border-[#4A1017]/20"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom & Color Indicators */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#FAF5EB] px-2.5 py-1 rounded-none border border-[#4A1017]/20 text-[10px] text-[#8C6B38] font-heading font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#8C6B38] shadow-[0_0_6px_rgba(140,107,56,0.6)]" />
                  <span>{photoFilters.saturation}% Sat • {photoFilters.hue}° Hue</span>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomPreview(!zoomPreview)}
                  className="flex items-center gap-1 px-3 py-1 rounded-none border border-[#4A1017]/20 bg-white hover:bg-[#FAF5EB] text-[#2B070B] hover:text-[#8C6B38] transition-colors cursor-pointer text-[10px] uppercase tracking-wider font-heading font-bold"
                  title={zoomPreview ? "Normal View" : "Zoom In"}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {zoomPreview ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    )}
                  </svg>
                  <span>{zoomPreview ? "Reset" : "Zoom"}</span>
                </button>
              </div>
            </div>

            {/* STATS PILLS */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-white p-3.5 rounded-none border border-[#4A1017]/20 shadow-xs">
                <span className="text-[9px] uppercase tracking-widest text-[#5A4E42] font-heading font-semibold block mb-0.5">
                  Coverage
                </span>
                <span className="font-heading font-bold text-[#2B070B]">
                  {areaSqFt.toFixed(1)} sq ft <span className="text-[10px] text-[#5A4E42] font-normal">({areaSqMeters.toFixed(2)} m²)</span>
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-none border border-[#4A1017]/20 shadow-xs">
                <span className="text-[9px] uppercase tracking-widest text-[#5A4E42] font-heading font-semibold block mb-0.5">
                  Style / Category
                </span>
                <span className="font-heading font-bold text-[#8C6B38] truncate block">
                  {product?.category || "Handcrafted"}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-none border border-[#4A1017]/20 shadow-xs">
                <span className="text-[9px] uppercase tracking-widest text-[#5A4E42] font-heading font-semibold block mb-0.5">
                  Material
                </span>
                <span className="font-heading font-bold text-[#2B070B] truncate block">
                  {product?.material || "Artisan Natural Fibers"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: SETTINGS & CONTROLS
        ========================================================= */}
        <div className="w-full lg:w-7/12 xl:w-1/2 space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-none border border-[#4A1017]/20 shadow-sm">
          
          {/* =========================================================
              🌟 ARTISAN PHOTO COLOR & DYE CONTROLS
          ========================================================= */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-none border border-[#4A1017]/20 shadow-xs space-y-5">
              <style dangerouslySetInnerHTML={{ __html: `
                .studio-glow-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 100%;
                  height: 4px;
                  background: #E8E2D9;
                  border-radius: 0px;
                  outline: none;
                }
                .studio-glow-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 0px;
                  background: #4A1017;
                  cursor: pointer;
                  box-shadow: 0 0 10px 2px rgba(74, 16, 23, 0.45);
                  border: 2px solid #FFFFFF;
                  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
                }
                .studio-glow-slider::-webkit-slider-thumb:hover {
                  transform: scale(1.18);
                  box-shadow: 0 0 14px 3px rgba(74, 16, 23, 0.7);
                }
                .studio-glow-slider::-webkit-slider-thumb:active {
                  transform: scale(1.25);
                  background: #2B070B;
                  box-shadow: 0 0 16px 3px rgba(43, 7, 11, 0.5);
                }
                .studio-glow-slider::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  border-radius: 0px;
                  background: #4A1017;
                  cursor: pointer;
                  box-shadow: 0 0 10px 2px rgba(193, 154, 107, 0.45);
                  border: 2px solid #FFFFFF;
                  transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .rainbow-hue-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 100%;
                  height: 10px;
                  background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
                  border-radius: 9999px;
                  outline: none;
                  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
                }
                .rainbow-hue-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: #FFFFFF;
                  border: 2.5px solid #2B2520;
                  cursor: pointer;
                  box-shadow: 0 0 14px 4px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(0,0,0,0.4);
                  transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .rainbow-hue-slider::-webkit-slider-thumb:hover {
                  transform: scale(1.18);
                  box-shadow: 0 0 18px 5px rgba(255, 255, 255, 1), 0 3px 8px rgba(0,0,0,0.5);
                }
                .rainbow-hue-slider::-webkit-slider-thumb:active {
                  transform: scale(1.25);
                  box-shadow: 0 0 20px 6px rgba(255, 255, 255, 1), 0 4px 10px rgba(0,0,0,0.6);
                }
                .rainbow-hue-slider::-moz-range-thumb {
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: #FFFFFF;
                  border: 2.5px solid #2B2520;
                  cursor: pointer;
                  box-shadow: 0 0 14px 4px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(0,0,0,0.4);
                  transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
              `}} />

              {/* Header: Color + RESET ALL */}
              <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-heading font-bold text-[#7A7065] block">
                    Artisan Color Tuning
                  </span>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#2B2520] tracking-wide">
                    Color
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetPhotoFilters}
                  className="text-xs font-heading font-bold uppercase tracking-wider text-[#C19A6B] hover:text-[#2B2520] transition-colors cursor-pointer border border-[#E8DFD5] px-3.5 py-1.5 rounded-full bg-white shadow-2xs"
                >
                  RESET ALL
                </button>
              </div>

              {/* 🌈 SIGNATURE RAINBOW HUE SELECTOR (MATCHES USER SPEC) */}
              <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-2xs space-y-3">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* 3D Glossy Color Orb on the left */}
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full shrink-0 shadow-md border-2 border-white relative overflow-hidden transition-colors duration-100"
                    style={{
                      backgroundColor: `hsl(${photoFilters.hue}, 85%, 52%)`,
                      boxShadow: `0 4px 14px rgba(0,0,0,0.22), inset 0 2px 4px rgba(255,255,255,0.7), 0 0 12px 1px hsl(${photoFilters.hue}, 85%, 52%, 0.4)`,
                    }}
                    title={`Current Hue: ${photoFilters.hue}°`}
                  >
                    {/* 3D Glass / Bubble Gloss Highlight */}
                    <div className="absolute top-1 left-1.5 w-4 h-2.5 rounded-full bg-white/70 blur-[0.6px] pointer-events-none" />
                    <div className="absolute bottom-1 right-1.5 w-2.5 h-2 rounded-full bg-black/15 blur-[0.5px] pointer-events-none" />
                  </div>

                  {/* Slider Track and Labels */}
                  <div className="flex-1 space-y-2">
                    <div className="relative flex items-center py-1">
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={photoFilters.hue}
                        onChange={(e) => setPhotoFilters((prev) => ({ ...prev, hue: parseInt(e.target.value, 10) }))}
                        className="rainbow-hue-slider w-full cursor-pointer"
                        title={`Select Hue: ${photoFilters.hue}°`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-heading font-bold">
                      <span className="text-[#7A7065] uppercase tracking-wider">
                        SELECT HUE
                      </span>
                      <span className="bg-[#2B2520] text-white px-2.5 py-0.5 rounded-md font-mono text-[11px] tracking-wide shadow-2xs">
                        H:{photoFilters.hue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saturation, Temperature, & Tint Adjustment Sliders */}
              <div className="space-y-4 pt-1">
                {[
                  {
                    id: "saturation",
                    label: "Saturation",
                    min: 0,
                    max: 300,
                    step: 1,
                    value: photoFilters.saturation,
                    display: `${photoFilters.saturation}%`,
                    onChange: (val: number) => setPhotoFilters((prev) => ({ ...prev, saturation: val })),
                  },
                  {
                    id: "temperature",
                    label: "Temperature",
                    min: -100,
                    max: 100,
                    step: 1,
                    value: photoFilters.temperature,
                    display: `${photoFilters.temperature}°`,
                    onChange: (val: number) => setPhotoFilters((prev) => ({ ...prev, temperature: val })),
                  },
                  {
                    id: "tint",
                    label: "Tint",
                    min: -100,
                    max: 100,
                    step: 1,
                    value: photoFilters.tint,
                    display: `${photoFilters.tint}°`,
                    onChange: (val: number) => setPhotoFilters((prev) => ({ ...prev, tint: val })),
                  },
                ].map((s) => (
                  <div key={s.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#2B2520] font-heading font-semibold tracking-wide">{s.label}</span>
                      <span className="text-[#C19A6B] font-heading font-bold font-mono">{s.display}</span>
                    </div>
                    <div className="relative flex items-center py-1">
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.value}
                        onChange={(e) => s.onChange(parseInt(e.target.value, 10))}
                        className="studio-glow-slider w-full cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* =========================================================
              SHAPE SELECTION
          ========================================================= */}
          <div className="border-t border-[#EAEAEB] pt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] font-heading font-bold text-[#7A7065]">
                Rug Shape & Silhouette
              </span>
              <span className="text-xs font-heading font-bold text-[#C19A6B]">{shape}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {SHAPE_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-none border transition-all cursor-pointer ${
                    shape === s.id
                      ? "border-[#4A1017] bg-[#FAF5EB] text-[#4A1017] shadow-xs"
                      : "border-[#4A1017]/20 text-[#5A4E42] hover:border-[#4A1017]/60 bg-white"
                  }`}
                >
                  <svg className="w-6 h-6 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                  </svg>
                  <span className="text-[10px] font-heading font-bold tracking-wider uppercase text-center">
                    {s.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* =========================================================
              DIMENSIONS & QUICK SIZES
          ========================================================= */}
          <div className="border-t border-[#4A1017]/20 pt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] font-heading font-bold text-[#5A4E42]">
                Dimensions & Sizing
              </span>
              
              {/* Unit Toggle */}
              <div className="flex items-center gap-1 bg-[#FAF5EB] p-1 rounded-none border border-[#4A1017]/20">
                {(["ft", "cm", "in"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitChange(u)}
                    className={`px-3 py-0.5 text-[10px] uppercase font-heading font-bold rounded-none transition-colors cursor-pointer ${
                      unit === u ? "bg-[#2B070B] text-[#FAF5EB]" : "text-[#5A4E42] hover:text-[#2B070B]"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Preset Buttons for active shape */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-heading font-bold text-[#5A4E42] self-center mr-1">
                Popular:
              </span>
              {PRESET_SIZES.filter((p) => p.shape === shape).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 text-xs font-heading font-semibold border border-[#4A1017]/20 hover:border-[#4A1017] rounded-none bg-[#FAF5EB] text-[#2B070B] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Dimension Inputs */}
            {shape === "Round" ? (
              <div className="bg-[#FAF5EB] p-5 rounded-none border border-[#4A1017]/20 flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-heading font-bold text-[#5A4E42] block mb-1.5">
                    Diameter ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    placeholder="e.g. 6"
                    className="w-full bg-white border border-[#4A1017]/20 p-3 text-lg font-heading font-bold text-[#2B070B] rounded-none focus:outline-none focus:border-[#4A1017]"
                  />
                </div>
                <div className="text-xs font-body text-[#5A4E42] pt-5">
                  Circular area: <strong className="text-[#2B070B] font-heading">{areaSqFt.toFixed(1)} sq ft</strong>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF5EB] p-5 rounded-none border border-[#4A1017]/20 grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-[10px] uppercase font-heading font-bold text-[#5A4E42] block mb-1.5">
                    Width ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-white border border-[#4A1017]/20 p-3 text-lg font-heading font-bold text-[#2B070B] rounded-none focus:outline-none focus:border-[#4A1017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-heading font-bold text-[#5A4E42] block mb-1.5">
                    Length ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full bg-white border border-[#4A1017]/20 p-3 text-lg font-heading font-bold text-[#2B070B] rounded-none focus:outline-none focus:border-[#4A1017]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ARTISAN NOTES */}
          <div className="border-t border-[#4A1017]/20 pt-8 space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] font-heading font-bold text-[#5A4E42] block">
              Weaver Notes & Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any specific door clearance notes or placement requests for the Bhadohi weavers..."
              className="w-full bg-[#FAF5EB] border border-[#4A1017]/20 p-3.5 text-xs font-body text-[#2B070B] focus:outline-none focus:border-[#4A1017] rounded-none"
            />
          </div>

          {/* =========================================================
              PRICE & ACTION CTA BAR
          ========================================================= */}
          <div className="border-t-2 border-[#4A1017] pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#5A4E42] font-heading font-bold block">
                  Bespoke Order Total
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-heading font-bold text-[#2B070B]">
                    {formatPrice(calculatedPrice)}
                  </span>
                  <span className="text-xs text-[#5A4E42] font-body">
                    ({areaSqFt.toFixed(1)} sq ft)
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#5A4E42] font-body text-left sm:text-right">
                Includes custom concentric weaving & insured express delivery
              </span>
            </div>

            {/* TWO EQUAL-WIDTH BUTTONS CONTAINED 100% WITHIN CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              {/* SEND ORDER REQUEST BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setRequestSuccess(null);
                  setRequestError("");
                  setShowRequestModal(true);
                }}
                className="w-full min-h-[52px] border border-[#4A1017] bg-white hover:bg-[#FAF5EB] text-[#2B070B] hover:text-[#4A1017] px-4 py-3.5 uppercase tracking-[0.14em] text-xs font-heading font-bold transition-all rounded-none shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#8C6B38] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">Send Order Request</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full min-h-[52px] bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white px-5 py-3.5 uppercase tracking-[0.14em] text-xs font-heading font-bold transition-colors rounded-none shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-[#4A1017]"
              >
                {isAdding ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-none animate-spin" />
                    <span>Adding to Bag...</span>
                  </>
                ) : (
                  <>
                    <span className="truncate">Add to Bag</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          🌟 SEND CUSTOM ORDER MODAL (EMAILS TO nrenterprises@gmail.com)
      ========================================================= */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white max-w-lg w-full rounded-none border border-[#4A1017]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* MODAL HEADER */}
              <div className="bg-[#240609] border-b border-[#4A1017] p-6 flex items-center justify-between text-[#FAF5EB]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-heading font-bold text-[#FAF5EB] block">
                    Bespoke Atelier Request
                  </span>
                  <h3 className="text-xl font-heading font-bold text-[#FAF5EB]">
                    {requestSuccess ? "Request Submitted Successfully" : "Send Custom Order to Atelier"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 text-[#D8C9C5] hover:text-[#FAF5EB] rounded-none transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {requestSuccess ? (
                  /* SUCCESS VIEW */
                  <div className="text-center space-y-5 py-4">
                    <div className="w-16 h-16 bg-[#FAFAFA] text-[#C19A6B] rounded-full flex items-center justify-center mx-auto border border-[#EAEAEB]">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* BESPOKE ORDER CODE */}
                    <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-[#EAEAEB]">
                      <span className="text-[10px] uppercase tracking-widest text-[#7A7065] font-heading font-bold block mb-1">
                        Your Bespoke Order Code
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-mono text-2xl font-bold text-[#2B2520] tracking-wider">
                          {requestSuccess.orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(requestSuccess.orderCode);
                            setCopiedOrderCode(true);
                            setTimeout(() => setCopiedOrderCode(false), 2500);
                          }}
                          className="text-[10px] uppercase font-heading font-bold text-[#C19A6B] hover:text-[#2B2520] border border-[#EAEAEB] px-3 py-1 rounded-full bg-white cursor-pointer"
                        >
                          {copiedOrderCode ? "Copied! ✔" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* EXACT MESSAGE REQUESTED BY USER */}
                    <div className="p-4 bg-[#FAFAFA] border border-[#C19A6B]/40 rounded-2xl">
                      <p className="text-sm sm:text-base font-heading font-semibold text-[#2B2520] leading-relaxed">
                        &ldquo;we got your request please be pationt we will send you email&rdquo;
                      </p>
                    </div>

                    <p className="text-xs font-body text-[#7A7065] leading-relaxed">
                      Your custom design coordinates, fiber color codes, and dimensions have been dispatched directly to <strong className="text-[#2B2520]">nasimshah2441@gmail.com</strong>. We will contact you at <strong className="text-[#2B2520]">{custEmail}</strong> shortly.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="w-full bg-[#2B2520] text-white py-3.5 px-6 rounded-full uppercase tracking-[0.16em] text-xs font-heading font-bold hover:bg-[#C19A6B] transition-colors cursor-pointer"
                    >
                      Close & Return to Studio
                    </button>
                  </div>
                ) : (
                  /* FORM VIEW */
                  <form onSubmit={handleSendCustomRequest} className="space-y-5">
                    {/* SPECS RECAP PILL */}
                    <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#EAEAEB] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-heading font-bold text-[#2B2520] block">
                          {shape} {shape === "Round" ? `${diameter} ${unit} Dia` : `${width}' × ${length}' ${unit}`}
                        </span>
                        <span className="text-[10px] font-heading text-[#7A7065]">
                          Bespoke Atelier • {areaSqFt.toFixed(1)} sq ft
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8DFD5] text-[10px] text-[#C19A6B] font-heading font-semibold shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-[#C19A6B]" />
                          <span>H:{photoFilters.hue}°</span>
                        </div>
                        <span className="font-heading font-bold text-[#2B2520]">
                          {formatPrice(calculatedPrice)}
                        </span>
                      </div>
                    </div>

                    {requestError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-body">
                        {requestError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-heading font-bold text-[#7A7065] mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Mohd Shahim"
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3 text-xs font-body text-[#2B2520] focus:outline-none focus:border-[#C19A6B] rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-heading font-bold text-[#7A7065] mb-1.5">
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="patron@example.com"
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3 text-xs font-body text-[#2B2520] focus:outline-none focus:border-[#C19A6B] rounded-xl"
                      />
                      <span className="text-[10px] font-body text-[#7A7065] mt-1 block">
                        We will send order confirmation and dispatch updates to this email.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-heading font-bold text-[#7A7065] mb-1.5">
                        Contact Number / City (Optional)
                      </label>
                      <input
                        type="tel"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3 text-xs font-body text-[#2B2520] focus:outline-none focus:border-[#C19A6B] rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-heading font-bold text-[#7A7065] mb-1.5">
                        Special Instructions for Master Weaver
                      </label>
                      <textarea
                        rows={2}
                        value={custNotes}
                        onChange={(e) => setCustNotes(e.target.value)}
                        placeholder="Custom room size requirements, door clearance notes, or delivery timing..."
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3 text-xs font-body text-[#2B2520] focus:outline-none focus:border-[#C19A6B] rounded-xl"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRequestModal(false)}
                        className="px-4 py-3 text-xs uppercase tracking-wider font-heading font-bold text-[#7A7065] hover:text-[#2B2520] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingRequest}
                        className="bg-[#2B2520] text-white hover:bg-[#C19A6B] px-6 py-3 rounded-full uppercase tracking-[0.14em] text-xs font-heading font-bold transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {isSubmittingRequest ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending to Atelier...</span>
                          </>
                        ) : (
                          <>
                            <span>Send to nasimshah2441@gmail.com</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          🌟 BESPOKE RUG PICKER MODAL (CUSTOMISE ANY RUG IN THE ATELIER)
      ========================================================= */}
      <AnimatePresence>
        {isRugPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-none max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#4A1017]/30"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#4A1017]/20 flex items-center justify-between bg-[#240609] text-[#FAF5EB]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#FAF5EB] font-heading font-bold block">
                    Bespoke Atelier Collection
                  </span>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FAF5EB] mt-0.5">
                    Select Any Rug to Customise
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRugPickerOpen(false)}
                  className="w-10 h-10 rounded-none border border-[#4A1017] flex items-center justify-center text-[#D8C9C5] hover:text-[#FAF5EB] hover:bg-[#2B070B] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="px-6 py-3 border-b border-[#4A1017]/20 bg-[#FAF5EB] overflow-x-auto flex items-center gap-2 no-scrollbar">
                {[
                  "All",
                  "Hand-Tufted",
                  "Irregular",
                  "Shaggy & Plush",
                  "Jute & Braided",
                  "Hand-Knotted",
                  "Flatweave Dhurries",
                  "Runners",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-none text-xs font-heading font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? "bg-[#2B070B] text-[#FAF5EB] shadow-xs"
                        : "bg-white text-[#5A4E42] hover:text-[#2B070B] border border-[#4A1017]/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Rug Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-[#FAF8F5]">
                {(() => {
                  const filtered = products.filter((p) => {
                    if (selectedCategoryFilter === "All") return true;
                    const catLower = (p.category || "").toLowerCase();
                    const nameLower = (p.name || "").toLowerCase();
                    const filterLower = selectedCategoryFilter.toLowerCase();

                    if (filterLower.includes("tufted")) return catLower.includes("tufted") || nameLower.includes("tufted");
                    if (filterLower.includes("irregular")) return catLower.includes("irregular") || nameLower.includes("irregular") || catLower.includes("contour");
                    if (filterLower.includes("shag")) return catLower.includes("shag") || nameLower.includes("shag") || catLower.includes("plush");
                    if (filterLower.includes("jute") || filterLower.includes("braid")) return catLower.includes("jute") || catLower.includes("braid") || nameLower.includes("jute") || nameLower.includes("braid");
                    if (filterLower.includes("knotted")) return catLower.includes("knot") || nameLower.includes("knot");
                    if (filterLower.includes("flatweave") || filterLower.includes("dhurrie")) return catLower.includes("flatweave") || catLower.includes("dhurrie") || nameLower.includes("flatweave");
                    if (filterLower.includes("runner")) return catLower.includes("runner") || nameLower.includes("runner");

                    return catLower.includes(filterLower);
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 text-[#5A4E42] font-body text-sm">
                        No rugs found in this category. Select &quot;All&quot; to browse all {products.length} artisanal rugs.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filtered.map((p) => {
                        const isCurrent = p.id === product?.id;
                        const hasStudio = Boolean(p.studio_image);
                        const rugImg = p.studio_image || p.images?.[0] || p.image;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setProduct(p);
                              setIsRugPickerOpen(false);
                              if (typeof window !== "undefined") {
                                const url = new URL(window.location.href);
                                url.searchParams.set("product", p.id);
                                window.history.replaceState(null, "", url.toString());
                              }
                            }}
                            className={`group relative rounded-none border p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(74,16,23,0.38)] ${
                              isCurrent
                                ? "border-[#4A1017] ring-2 ring-[#4A1017] bg-[#FAF5EB] shadow-md"
                                : "border-[#4A1017]/20 bg-white"
                            }`}
                          >
                            <div>
                              <div className="aspect-square rounded-none overflow-hidden bg-[#FAF8F5] mb-2.5 relative">
                                {rugImg ? (
                                  <img
                                    src={rugImg}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#5A4E42]">
                                    NR
                                  </div>
                                )}
                                {isCurrent && (
                                  <span className="absolute top-2 right-2 bg-[#2B070B] text-[#FAF5EB] text-[9px] uppercase tracking-wider font-heading font-bold px-2 py-0.5 rounded-none shadow-xs border border-[#4A1017]">
                                    Active
                                  </span>
                                )}
                                {hasStudio ? (
                                  <span className="absolute bottom-2 left-2 bg-[#4A1017] text-[#FAF5EB] text-[8.5px] uppercase tracking-wider font-heading font-bold px-2 py-0.5 rounded-none shadow-xs">
                                    ✓ Studio Image
                                  </span>
                                ) : (
                                  <span className="absolute bottom-2 left-2 bg-[#240609]/80 text-[#FAF5EB] text-[8.5px] uppercase tracking-wider font-heading font-semibold px-2 py-0.5 rounded-none shadow-xs">
                                    Studio Pending
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] uppercase tracking-widest text-[#8C6B38] font-heading font-bold block mb-0.5">
                                {p.category || "Bespoke"}
                              </span>
                              <h4 className="text-xs sm:text-sm font-heading font-bold text-[#2B070B] line-clamp-1 group-hover:text-[#8C6B38] transition-colors">
                                {p.name}
                              </h4>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-[#4A1017]/20 flex items-center justify-between">
                              <span className="text-xs font-heading font-bold text-[#2B070B]">
                                {formatPrice(p.price || 0)}
                              </span>
                              <span className={`text-[10px] uppercase font-heading font-bold ${hasStudio ? "text-[#8C6B38]" : "text-[#5A4E42]"}`}>
                                {hasStudio ? "Customise →" : "View →"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-x-0 bottom-0 top-[80px] lg:top-[135px] z-30 bg-[#FAF8F5] flex flex-col items-center justify-center text-center px-4">
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#DFD8CC] border-t-[#C19A6B] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white/90 border border-[#DFD8CC] flex items-center justify-center shadow-xs">
                <img src="/nr-logo.png" alt="NR Enterprises Atelier" className="w-6 h-6 object-contain opacity-80" />
              </div>
            </div>
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#2B2520] font-heading font-bold mb-1.5">
            Loading Bespoke Atelier
          </span>
          <p className="text-xs text-[#8C7A63] tracking-wide font-body max-w-xs">
            Preparing customizable rug silhouettes...
          </p>
        </div>
      }
    >
      <CustomizerContent />
    </Suspense>
  );
}
