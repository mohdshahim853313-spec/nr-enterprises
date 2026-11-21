"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/SafeImage";

interface VariantItem {
  size: string;
  dimensions?: string;
  price: string | number;
  base_price?: string | number;
  original_price?: string | number;
}

interface ProductItem {
  id: string | number;
  name: string;
  sku?: string;
  price?: string | number;
  original_price?: string | number;
  category?: string;
  images?: string[];
  sizes?: string[];
  variants?: VariantItem[];
}

interface HistoryProductDetail {
  id: string;
  sku: string;
  name: string;
  image?: string;
  old_price: string;
  new_price: string;
  variants?: any[];
}

interface HistoryItem {
  id: string;
  timestamp: string;
  description: string;
  percent: number;
  productsCount: number;
  products?: HistoryProductDetail[];
}

interface BulkPriceMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProductsCount: number;
  products?: ProductItem[];
  onSuccess?: () => void;
}

function getProductBaseSize(product: ProductItem): string {
  if (Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.size) {
    return product.variants[0].size;
  }
  if (Array.isArray(product.sizes) && product.sizes.length > 0 && product.sizes[0]) {
    return product.sizes[0];
  }
  return "Standard Size";
}

function getProductVariantsCount(product: ProductItem): number {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.length;
  }
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.length;
  }
  return 1;
}

function getProductAllVariants(product: ProductItem): VariantItem[] {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.map((s) => ({
      size: s,
      price: product.price || 5000,
      base_price: product.price || 5000,
    }));
  }
  return [
    {
      size: "Standard Size",
      price: product.price || 5000,
      base_price: product.price || 5000,
    },
  ];
}

export default function BulkPriceMarkupModal({
  isOpen,
  onClose,
  totalProductsCount,
  products = [],
  onSuccess,
}: BulkPriceMarkupModalProps) {
  // Navigation Tabs: "editor" | "history"
  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");

  // View Mode for listings: "grid" (Big Cards) | "list" (Detailed List)
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");

  // Mode: "increase" (+%) or "decrease" (-%)
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [percentMagnitude, setPercentMagnitude] = useState<number>(40);
  const [customInput, setCustomInput] = useState<string>("40");

  const [applyIndia, setApplyIndia] = useState(true);
  const [applyUS, setApplyUS] = useState(true);
  const [applyEverywhere, setApplyEverywhere] = useState(true);
  const [syncToEtsy, setSyncToEtsy] = useState(true);

  // Etsy Connection Status
  const [isEtsyConnected, setIsEtsyConnected] = useState<boolean | null>(null);

  // Target Mode: "all" or "selected"
  const [targetScope, setTargetScope] = useState<"all" | "selected">("selected");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dropdown open state for variation sizes of a listing
  const [openDropdownListingId, setOpenDropdownListingId] = useState<string | number | null>(null);

  // Full History / Audit Log State
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  const [lastUndoSnapshot, setLastUndoSnapshot] = useState<HistoryItem | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const fetchUndoHistory = async () => {
    try {
      const res = await fetch("/api/admin/bulk-price-markup/undo");
      const data = await res.json();
      if (data.success) {
        setLastUndoSnapshot(data.latestSnapshot || null);
        setAllHistory(data.history || []);
      } else {
        setLastUndoSnapshot(null);
        setAllHistory([]);
      }
    } catch (e) {
      console.warn("Could not fetch undo history:", e);
    }
  };

  // Fetch Etsy OAuth Status & History on open
  useEffect(() => {
    if (isOpen) {
      fetch("/api/etsy/oauth/status")
        .then((res) => res.json())
        .then((data) => setIsEtsyConnected(Boolean(data.connected)))
        .catch(() => setIsEtsyConnected(false));

      fetchUndoHistory();
    }
  }, [isOpen]);

  const quickIncreasePercentages = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const quickDecreasePercentages = [5, 10, 15, 20, 25, 30, 40, 50];

  const handleSelectPreset = (p: number) => {
    setPercentMagnitude(p);
    setCustomInput(String(p));
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const cleaned = val.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      setPercentMagnitude(num);
    }
  };

  // Signed percentage (+40 or -10)
  const signedPercent = direction === "increase" ? percentMagnitude : -percentMagnitude;
  const multiplier = 1 + signedPercent / 100;

  const sampleBasePrice = 5000;
  const sampleNewPrice = Math.max(1, Math.round(sampleBasePrice * multiplier));
  const sampleUsdPrice = Math.round(sampleBasePrice / 83.5);
  const sampleNewUsdPrice = Math.max(1, Math.round(sampleNewPrice / 83.5));

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      return matchName || matchSku || matchCat;
    });
  }, [products, searchQuery]);

  const toggleSelectOne = (id: string | number) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const selectAllFiltered = () => {
    const updated = new Set(selectedIds);
    filteredProducts.forEach((p) => updated.add(p.id));
    setSelectedIds(updated);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleApplyMarkup = async () => {
    if (percentMagnitude === 0) {
      alert("Please enter a percentage greater than 0.");
      return;
    }

    if (targetScope === "selected" && selectedIds.size === 0) {
      alert("Please select at least 1 listing to update price.");
      return;
    }

    const countToUpdate =
      targetScope === "all" ? (products.length || totalProductsCount) : selectedIds.size;

    const actionWord = direction === "increase" ? "INCREASE (+)" : "DECREASE (-)";
    const signString = direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`;

    const confirmRun = window.confirm(
      `Are you sure you want to ${actionWord} prices for ${countToUpdate} listing(s) by ${signString}?\n\nThis will update prices across the website database and sync live to Etsy shop.`
    );
    if (!confirmRun) return;

    setIsUpdating(true);
    setErrorMessage(null);
    setResultMessage(null);

    try {
      const res = await fetch("/api/admin/bulk-price-markup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percent: signedPercent,
          applyToAll: targetScope === "all",
          productIds: targetScope === "selected" ? Array.from(selectedIds) : [],
          syncToEtsy,
          regions: [
            applyIndia ? "india" : null,
            applyUS ? "us" : null,
            applyEverywhere ? "everywhere_else" : null,
          ].filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update prices.");
      }

      setResultMessage(data.message || `Successfully updated ${data.updatedCount} listings!`);
      await fetchUndoHistory();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred while updating prices.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUndoPriceChange = async (snapshotId?: string) => {
    const targetDesc = lastUndoSnapshot?.description || "Previous price update";
    const confirmUndo = window.confirm(
      `Are you sure you want to UNDO this price change?\n\nTarget: ${targetDesc}\n\nThis will restore exact previous prices and variants on both Website and Etsy Shop!`
    );
    if (!confirmUndo) return;

    setIsUndoing(true);
    setErrorMessage(null);
    setResultMessage(null);

    try {
      const res = await fetch("/api/admin/bulk-price-markup/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to undo price changes.");
      }

      setResultMessage(data.message || `Restored listings back to normal prices!`);
      await fetchUndoHistory();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to undo price changes.");
    } finally {
      setIsUndoing(false);
    }
  };

  // Filter History Items by search
  const filteredHistory = useMemo(() => {
    if (!historySearchQuery.trim()) return allHistory;
    const q = historySearchQuery.toLowerCase().trim();
    return allHistory.filter((h) => {
      const matchDesc = h.description?.toLowerCase().includes(q);
      const matchDate = new Date(h.timestamp).toLocaleDateString().toLowerCase().includes(q);
      const matchProd = (h.products || []).some(
        (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      );
      return matchDesc || matchDate || matchProd;
    });
  }, [allHistory, historySearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF8F5] overflow-hidden text-[#2B070B]">
      {/* 🌟 1. FULLSCREEN TOP NAVIGATION BAR */}
      <header className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#240609] via-[#3D0C12] to-[#180305] text-white flex items-center justify-between shrink-0 shadow-lg border-b border-[#EAE6DF]/20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-xl font-bold shadow-md shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg md:text-xl font-bold font-heading tracking-wide">
                Price Markup & Global Scaling Studio
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#EAE6DF] border border-white/15">
                Full Screen Studio
              </span>
            </div>
            <p className="text-xs text-[#EAE6DF]/75 hidden sm:block">
              Scale prices with HD rug previews, exact size tracking, and complete historical audit logs
            </p>
          </div>
        </div>

        {/* Studio Tabs & Controls */}
        <div className="flex items-center gap-3">
          {/* Tab Navigation */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "editor"
                  ? "bg-[#FAF5EB] text-[#2B070B] shadow-sm font-extrabold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <span>⚡</span>
              <span>Price Adjuster</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-[#FAF5EB] text-[#2B070B] shadow-sm font-extrabold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <span>📜</span>
              <span>History & Records</span>
              {allHistory.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#4A1017] text-white font-mono">
                  {allHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* Close Studio Button */}
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 text-base"
            title="Close Panel"
          >
            ✕
          </button>
        </div>
      </header>

      {/* 🌟 2. BODY CONTENT (EDITOR TAB VS HISTORY TAB) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: PRICE ADJUSTER STUDIO */}
        {/* ========================================================================= */}
        {activeTab === "editor" && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Etsy Shop Live Connection Banner */}
            <div className="rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border-[#E8DFD3] shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#F1641E] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  E
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1C1917]">Etsy Shop (AHADGLOBALRUGS)</span>
                    {isEtsyConnected ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Live Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Action Needed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600">
                    {isEtsyConnected
                      ? "Prices update in real-time on your Website and live on your Etsy shop listings & variation dropdowns."
                      : "Website updates instantly. To also push updates to Etsy shop directly, please connect once:"}
                  </p>
                </div>
              </div>

              {!isEtsyConnected && (
                <a
                  href="/api/etsy/oauth/connect"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#F1641E] hover:bg-[#d95314] text-white text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap"
                >
                  🔗 Connect Etsy Shop
                </a>
              )}
            </div>

            {/* ↺ UNDO / ROLLBACK QUICK BANNER */}
            {lastUndoSnapshot && (
              <div className="rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/80 border-amber-300 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#2B070B] text-[#FAF5EB] font-bold flex items-center justify-center text-base shadow-xs shrink-0">
                    ↺
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2B070B]">Safety Undo Available</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {new Date(lastUndoSnapshot.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 mt-0.5">
                      Last update: <strong>"{lastUndoSnapshot.description}"</strong>. Reverting will restore exact previous prices & variants on Website and live on Etsy shop.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                  >
                    📜 View Full Record
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUndoPriceChange(lastUndoSnapshot.id)}
                    disabled={isUndoing || isUpdating}
                    className="px-4 py-2 rounded-xl bg-[#2B070B] hover:bg-[#3D0C12] text-white text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUndoing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Restoring Normal Prices...</span>
                      </>
                    ) : (
                      <>
                        <span>↺</span>
                        <span>Undo / Revert to Normal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TOP CONTROLS GRID: Target Columns + Direction + Percentage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Regions + Direction + Percentage (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-5">
                {/* 1. Target Currency Columns */}
                <div>
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] block mb-2.5">
                    1. Target Regions / Currencies (Sabhi Columns Me)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setApplyIndia(!applyIndia)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        applyIndia
                          ? "bg-[#2B070B]/5 border-[#2B070B] shadow-2xs font-bold text-[#2B070B]"
                          : "border-neutral-200 text-neutral-400 bg-neutral-50"
                      }`}
                    >
                      <div className="text-xs font-bold">IN</div>
                      <div className="text-[11px] text-neutral-600">India (INR ₹)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyUS(!applyUS)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        applyUS
                          ? "bg-[#2B070B]/5 border-[#2B070B] shadow-2xs font-bold text-[#2B070B]"
                          : "border-neutral-200 text-neutral-400 bg-neutral-50"
                      }`}
                    >
                      <div className="text-xs font-bold">US</div>
                      <div className="text-[11px] text-neutral-600">United States ($)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyEverywhere(!applyEverywhere)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        applyEverywhere
                          ? "bg-[#2B070B]/5 border-[#2B070B] shadow-2xs font-bold text-[#2B070B]"
                          : "border-neutral-200 text-neutral-400 bg-neutral-50"
                      }`}
                    >
                      <div className="text-xs font-bold">🌍 Global</div>
                      <div className="text-[11px] text-neutral-600">Worldwide</div>
                    </button>
                  </div>
                </div>

                {/* 2. Direction Switch: Increase (+%) vs Decrease (-%) */}
                <div>
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] block mb-2.5">
                    2. Price Change Direction: Badhana ya Ghatana?
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setDirection("increase");
                        if (percentMagnitude === 0) handleSelectPreset(40);
                      }}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        direction === "increase"
                          ? "bg-emerald-700 text-white shadow-sm font-extrabold"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      <span>➕</span>
                      <span>Increase (+% Markup)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDirection("decrease");
                        if (percentMagnitude > 50) handleSelectPreset(20);
                      }}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        direction === "decrease"
                          ? "bg-rose-700 text-white shadow-sm font-extrabold"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      <span>➖</span>
                      <span>Decrease (-% Discount)</span>
                    </button>
                  </div>
                </div>

                {/* Percentage Chips & Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-700">
                      {direction === "increase"
                        ? "Select Markup Percentage (+% Badhana)"
                        : "Select Discount Percentage (-% Ghatana)"}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        direction === "increase"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Active: {direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}
                    </span>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(direction === "increase"
                      ? quickIncreasePercentages
                      : quickDecreasePercentages
                    ).map((p) => {
                      const isSelected = percentMagnitude === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleSelectPreset(p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? direction === "increase"
                                ? "bg-emerald-700 border-emerald-800 text-white shadow-xs"
                                : "bg-rose-700 border-rose-800 text-white shadow-xs"
                              : "bg-white border-neutral-300 text-neutral-700 hover:border-black"
                          }`}
                        >
                          {direction === "increase" ? `+${p}%` : `-${p}%`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Percentage Input */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-neutral-600 whitespace-nowrap">Or custom %:</span>
                    <div className="relative w-36">
                      <input
                        type="number"
                        min="0.1"
                        max={direction === "decrease" ? 95 : 1000}
                        step="0.5"
                        value={customInput}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 focus:border-[#2B070B] text-xs font-bold text-[#2B070B] outline-none bg-white"
                        placeholder="40"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Calculation Preview & Etsy Sync Toggle (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B]">
                      📊 Live Calculation Sample
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">1 Item Preview</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
                    <div>
                      <span className="text-[11px] text-neutral-500 block">Current Base Sample</span>
                      <span className="text-lg font-bold text-neutral-700">₹{sampleBasePrice.toLocaleString("en-IN")}</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">Approx ${sampleUsdPrice} USD</span>
                    </div>
                    <div className="border-l border-neutral-200 pl-3">
                      <span className="text-[11px] text-neutral-500 block">
                        After {direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}
                      </span>
                      <span
                        className={`text-lg font-extrabold ${
                          direction === "increase" ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        ₹{sampleNewPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Approx ${sampleNewUsdPrice} USD
                      </span>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-[#8C7A6B] leading-relaxed mt-3">
                    ⚡ <strong>Proportional Scaling:</strong> Every variation size (e.g. 2x4, 3x5, 4x6, 5x8, up to all 49 custom sizes) of each selected listing will be adjusted proportionally by{" "}
                    <strong>{direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}</strong>.
                  </p>
                </div>

                {/* Etsy Live Sync Checkbox */}
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between">
                  <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer select-none font-semibold">
                    <input
                      type="checkbox"
                      checked={syncToEtsy}
                      onChange={(e) => setSyncToEtsy(e.target.checked)}
                      className="w-4 h-4 rounded-sm accent-[#F1641E] cursor-pointer"
                    />
                    <span>Also update & push live to Etsy Shop listings (AHADGLOBALRUGS)</span>
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">Etsy API v3</span>
                </div>
              </div>
            </div>

            {/* 🌟 3. LISTINGS SELECTION CANVAS WITH BIG PHOTOS & EXACT SIZES */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
                <div>
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-[#2B070B]">
                    3. Choose Listings To Update (Big HD Rug Photos & Size Info)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Har rug ki badi photo, SKU, aur uska exact starting size yahan dekh kar select karein
                  </p>
                </div>

                {/* View Mode Toggle: Big Cards Grid vs Detailed List */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setViewLayout("grid")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewLayout === "grid"
                          ? "bg-white text-[#2B070B] shadow-2xs font-extrabold"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      <span>⊞</span>
                      <span>Big Cards Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewLayout("list")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewLayout === "list"
                          ? "bg-white text-[#2B070B] shadow-2xs font-extrabold"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      <span>☰</span>
                      <span>Detailed List</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Scope Switch: All Listings vs Select Specific */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="grid grid-cols-2 gap-2.5 max-w-md w-full">
                  <button
                    type="button"
                    onClick={() => setTargetScope("all")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                      targetScope === "all"
                        ? "bg-[#2B070B] text-white border-[#2B070B] shadow-xs font-extrabold"
                        : "bg-white text-neutral-700 border-neutral-200 hover:border-black"
                    }`}
                  >
                    <span>🌐</span>
                    <span>All Listings ({products.length || totalProductsCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetScope("selected")}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                      targetScope === "selected"
                        ? "bg-[#2B070B] text-white border-[#2B070B] shadow-xs font-extrabold"
                        : "bg-white text-neutral-700 border-neutral-200 hover:border-black"
                    }`}
                  >
                    <span>🎯</span>
                    <span>Select Specific ({selectedIds.size})</span>
                  </button>
                </div>

                {/* Search Bar + Select All / Clear */}
                <div className="flex items-center gap-2 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="🔍 Search rug title, SKU or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:border-[#2B070B] outline-none text-[#2B070B]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-3 py-2 text-[11px] font-bold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer shrink-0"
                  >
                    Select All ({filteredProducts.length})
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-2 text-[11px] font-bold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer shrink-0"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* 🖼️ RUGS LIST / GRID CONTAINER */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                  No listings found matching "{searchQuery}".
                </div>
              ) : viewLayout === "grid" ? (
                /* 🌟 BIG CARDS GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[58vh] overflow-y-auto p-1 pr-2">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedIds.has(p.id);
                    const rawPriceNum = p.price
                      ? parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0
                      : 0;
                    const newPriceNum = Math.max(1, Math.round(rawPriceNum * multiplier));
                    const firstImg =
                      Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "";
                    const baseSize = getProductBaseSize(p);
                    const allVariants = getProductAllVariants(p);
                    const totalVariants = allVariants.length;
                    const isOpenDropdown = openDropdownListingId === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelectOne(p.id)}
                        className={`group relative rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col bg-white ${
                          isSelected
                            ? "border-[#2B070B] shadow-md ring-2 ring-[#2B070B]"
                            : "border-neutral-200 hover:border-[#D4AF37] hover:shadow-sm"
                        }`}
                      >
                        {/* Big HD Rug Image Preview */}
                        <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                          {firstImg ? (
                            <SafeImage
                              src={firstImg}
                              alt={p.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                              No Image
                            </div>
                          )}

                          {/* Checkbox badge overlay */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Controlled by container onClick
                              className="w-5 h-5 rounded-md accent-[#2B070B] cursor-pointer shadow-md"
                            />
                          </div>

                          {/* Category pill overlay */}
                          {p.category && (
                            <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/20">
                              {p.category}
                            </span>
                          )}
                        </div>

                        {/* Card Info & Exact Size Details */}
                        <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                          <div>
                            <h4
                              className="text-xs font-bold text-neutral-800 line-clamp-2 leading-snug group-hover:text-[#4A1017] transition-colors"
                              title={p.name}
                            >
                              {p.name}
                            </h4>
                            {p.sku && (
                              <span className="text-[10px] font-mono text-neutral-500 block mt-1">
                                {p.sku}
                              </span>
                            )}
                          </div>

                          {/* 📏 EXACT SIZE OF THIS PRICE */}
                          <div className="p-2 bg-[#FAF5EB] border border-[#4A1017]/15 rounded-xl">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-neutral-500">Price for Size:</span>
                              <span className="font-extrabold text-[#2B070B] truncate ml-1">
                                {baseSize}
                              </span>
                            </div>
                            {totalVariants > 1 && (
                              <div className="text-[9.5px] text-[#8C7A6B] mt-0.5">
                                + {totalVariants - 1} other variation sizes scaled proportionally
                              </div>
                            )}
                          </div>

                          {/* 🔽 INTERACTIVE DROPDOWN: ALL ORIGINAL VARIATION SIZES & PRICES */}
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownListingId(isOpenDropdown ? null : p.id);
                              }}
                              className="w-full py-1.5 px-2.5 rounded-xl bg-[#FAF5EB] hover:bg-[#F3EAD8] border border-[#D4AF37]/50 text-[#2B070B] text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <span>📏</span>
                                <span>{totalVariants} Sizes & Original Prices</span>
                              </span>
                              <span className="text-[10px] text-neutral-600 font-bold">
                                {isOpenDropdown ? "▲ Hide" : "▼ View All"}
                              </span>
                            </button>

                            {isOpenDropdown && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 bg-[#FAF8F5] rounded-xl border border-neutral-300 p-2 max-h-48 overflow-y-auto space-y-1 shadow-inner"
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 pb-1 border-b border-neutral-200">
                                  <span>Original Size / Option</span>
                                  <span>Original → New</span>
                                </div>
                                {allVariants.map((v, vIdx) => {
                                  const vRaw = v.price
                                    ? parseFloat(String(v.price).replace(/[^0-9.]/g, "")) || 0
                                    : rawPriceNum;
                                  const vNew = Math.max(1, Math.round(vRaw * multiplier));
                                  return (
                                    <div
                                      key={vIdx}
                                      className="flex items-center justify-between text-[10.5px] py-1 px-1.5 rounded-md bg-white border border-neutral-100"
                                    >
                                      <span
                                        className="font-semibold text-neutral-800 truncate mr-2"
                                        title={v.size}
                                      >
                                        {v.size}
                                      </span>
                                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                                        <span className="text-neutral-400 line-through">
                                          ₹{vRaw.toLocaleString("en-IN")}
                                        </span>
                                        <span className="text-neutral-400">→</span>
                                        <span
                                          className={`font-bold ${
                                            direction === "increase"
                                              ? "text-emerald-700"
                                              : "text-rose-700"
                                          }`}
                                        >
                                          ₹{vNew.toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Price Before / After Badge */}
                          <div className="flex items-baseline justify-between pt-1 border-t border-neutral-100">
                            <div>
                              <span className="text-[10px] text-neutral-400 line-through block">
                                ₹{rawPriceNum.toLocaleString("en-IN")}
                              </span>
                              <span
                                className={`text-sm font-extrabold ${
                                  direction === "increase" ? "text-emerald-700" : "text-rose-700"
                                }`}
                              >
                                ₹{newPriceNum.toLocaleString("en-IN")}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                direction === "increase"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {direction === "increase"
                                ? `+${percentMagnitude}%`
                                : `-${percentMagnitude}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 🌟 DETAILED WIDE LIST VIEW */
                <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-2">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedIds.has(p.id);
                    const rawPriceNum = p.price
                      ? parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0
                      : 0;
                    const newPriceNum = Math.max(1, Math.round(rawPriceNum * multiplier));
                    const firstImg =
                      Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "";
                    const baseSize = getProductBaseSize(p);
                    const allVariants = getProductAllVariants(p);
                    const totalVariants = allVariants.length;
                    const isOpenDropdown = openDropdownListingId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border transition-all cursor-pointer bg-white overflow-hidden ${
                          isSelected
                            ? "border-[#2B070B] shadow-sm ring-1 ring-[#2B070B] bg-[#2B070B]/5"
                            : "border-neutral-200 hover:border-[#D4AF37]"
                        }`}
                      >
                        <div
                          onClick={() => toggleSelectOne(p.id)}
                          className="flex items-center gap-4 p-3"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-5 h-5 rounded-md accent-[#2B070B] cursor-pointer shrink-0"
                          />

                          {/* Large 96px Photo */}
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-xs">
                            {firstImg ? (
                              <SafeImage
                                src={firstImg}
                                alt={p.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                No Img
                              </div>
                            )}
                          </div>

                          {/* Info & Exact Size */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-neutral-800 truncate" title={p.name}>
                              {p.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {p.sku && (
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                  {p.sku}
                                </span>
                              )}
                              {p.category && (
                                <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded">
                                  {p.category}
                                </span>
                              )}
                            </div>

                            {/* Exact Size Tag + Dropdown Button */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs font-semibold text-neutral-500">
                                Base Size:
                              </span>
                              <span className="text-xs font-extrabold text-[#2B070B] bg-[#FAF5EB] px-2.5 py-0.5 rounded-md border border-[#4A1017]/20">
                                {baseSize}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownListingId(isOpenDropdown ? null : p.id);
                                }}
                                className="text-xs font-bold text-[#2B070B] bg-[#FAF5EB] hover:bg-[#F3EAD8] px-2.5 py-0.5 rounded-md border border-[#D4AF37]/50 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>📏 {totalVariants} Sizes & Original Prices</span>
                                <span className="text-[10px]">{isOpenDropdown ? "▲" : "▼"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Price Details */}
                          <div className="text-right shrink-0 pr-2">
                            <div className="text-xs text-neutral-400 line-through">
                              ₹{rawPriceNum.toLocaleString("en-IN")}
                            </div>
                            <div
                              className={`text-base font-extrabold ${
                                direction === "increase" ? "text-emerald-700" : "text-rose-700"
                              }`}
                            >
                              ₹{newPriceNum.toLocaleString("en-IN")}
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                direction === "increase"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {direction === "increase"
                                ? `+${percentMagnitude}%`
                                : `-${percentMagnitude}%`}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Accordion in List View */}
                        {isOpenDropdown && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-[#FAF8F5] border-t border-neutral-200"
                          >
                            <div className="text-xs font-bold text-[#2B070B] mb-2 flex items-center justify-between">
                              <span>Sabhi Original Options / Sizes aur Calculated New Prices:</span>
                              <span className="text-[11px] text-neutral-500 font-normal">
                                Total {allVariants.length} Sizes
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                              {allVariants.map((v, vIdx) => {
                                const vRaw = v.price
                                  ? parseFloat(String(v.price).replace(/[^0-9.]/g, "")) || 0
                                  : rawPriceNum;
                                const vNew = Math.max(1, Math.round(vRaw * multiplier));
                                return (
                                  <div
                                    key={vIdx}
                                    className="p-2 rounded-xl bg-white border border-neutral-200 flex flex-col justify-between"
                                  >
                                    <div className="text-xs font-bold text-neutral-800 truncate" title={v.size}>
                                      {v.size}
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-neutral-100 font-mono">
                                      <span className="text-neutral-400 line-through">
                                        ₹{vRaw.toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-neutral-400">→</span>
                                      <span
                                        className={`font-bold ${
                                          direction === "increase"
                                            ? "text-emerald-700"
                                            : "text-rose-700"
                                        }`}
                                      >
                                        ₹{vNew.toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Alerts */}
            {resultMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-emerald-700">✓</span>
                  <span className="font-semibold">{resultMessage}</span>
                </div>
                {lastUndoSnapshot && (
                  <button
                    type="button"
                    onClick={() => handleUndoPriceChange(lastUndoSnapshot.id)}
                    disabled={isUndoing}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    {isUndoing ? "Restoring..." : "↺ Undo This Change"}
                  </button>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl text-xs font-medium flex items-center gap-2.5 shadow-xs">
                <span className="text-base">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPLETE PRICE HISTORY & AUDIT RECORD LOG (SAARA DATA) */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-heading text-[#2B070B]">
                  📜 Complete Price Change History & Audit Records
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Kis din, kitne baje, kaun-kaun si listing ka price badhaya ya ghataya gaya — poora audit record yahan hai.
                </p>
              </div>

              {/* History Search */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="🔍 Search history date, SKU or name..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:border-[#2B070B] outline-none text-[#2B070B]"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* History Cards List */}
            {filteredHistory.length === 0 ? (
              <div className="py-20 text-center text-xs text-neutral-500 bg-white rounded-3xl border border-[#EAE6DF]">
                Abhi tak koi price change history record nahi hai.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item, hIdx) => {
                  const dateObj = new Date(item.timestamp);
                  const formattedDate = dateObj.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const isExpanded = expandedHistoryId === item.id;
                  const isPositive = (item.percent || 0) >= 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-[#EAE6DF] shadow-xs overflow-hidden transition-all"
                    >
                      {/* Summary Header of this Record */}
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 bg-[#FAF8F5]">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shadow-xs shrink-0 ${
                              isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isPositive ? "➕" : "➖"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-extrabold text-[#2B070B]">
                                {item.description || `${item.percent}% update`}
                              </span>
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                                {item.productsCount} Listings
                              </span>
                              {hIdx === 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  Latest Change
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                              <span>📅 {formattedDate}</span>
                              <span>•</span>
                              <span>⏰ {formattedTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 self-end md:self-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHistoryId(isExpanded ? null : item.id)
                            }
                            className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{isExpanded ? "▲ Hide Items" : "▼ View Listings (" + (item.products?.length || item.productsCount) + ")"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUndoPriceChange(item.id)}
                            disabled={isUndoing}
                            className="px-4 py-2 rounded-xl bg-[#2B070B] hover:bg-[#3D0C12] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isUndoing ? "Restoring..." : "↺ Revert This Update"}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Detailed Breakdown of Listings */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 sm:p-5 bg-white border-t border-neutral-100"
                          >
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                              Detailed Items Modified on {formattedDate} ({formattedTime}):
                            </h4>

                            {!item.products || item.products.length === 0 ? (
                              <div className="py-6 text-center text-xs text-neutral-400">
                                No individual items stored for this historical record.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                                {item.products.map((p, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="p-3 rounded-2xl border border-neutral-200 bg-[#FCFAF7] flex items-center gap-3"
                                  >
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0">
                                      {p.image ? (
                                        <SafeImage
                                          src={p.image}
                                          alt={p.name}
                                          fill
                                          sizes="64px"
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                          Rug
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5
                                        className="text-xs font-bold text-neutral-800 truncate"
                                        title={p.name}
                                      >
                                        {p.name}
                                      </h5>
                                      <span className="text-[10px] font-mono text-neutral-500 block">
                                        {p.sku}
                                      </span>
                                      <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-[10px] text-neutral-400 line-through">
                                          {p.old_price}
                                        </span>
                                        <span
                                          className={`text-xs font-extrabold ${
                                            isPositive ? "text-emerald-700" : "text-rose-700"
                                          }`}
                                        >
                                          {p.new_price}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🌟 3. FIXED BOTTOM ACTION BAR (ONLY IN EDITOR TAB) */}
      {activeTab === "editor" && (
        <footer className="p-4 sm:p-5 border-t border-[#EAE6DF] bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xl">
          <div className="text-xs text-neutral-600">
            Targeting:{" "}
            <strong className="text-[#2B070B]">
              {targetScope === "all"
                ? `All ${products.length || totalProductsCount} Listings`
                : `${selectedIds.size} Selected Listing(s)`}
            </strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyMarkup}
              disabled={
                isUpdating ||
                percentMagnitude === 0 ||
                (targetScope === "selected" && selectedIds.size === 0)
              }
              className={`flex-1 sm:flex-none px-6 sm:px-8 py-2.5 rounded-xl text-white text-xs sm:text-sm font-heading font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                direction === "increase"
                  ? "bg-[#2B070B] hover:bg-[#3D0C12]"
                  : "bg-rose-800 hover:bg-rose-900"
              }`}
            >
              {isUpdating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Prices...</span>
                </>
              ) : (
                <>
                  <span>{direction === "increase" ? "⚡" : "🏷️"}</span>
                  <span>
                    {direction === "increase"
                      ? `Apply +${percentMagnitude}% Markup (${
                          targetScope === "all" ? "All" : selectedIds.size
                        })`
                      : `Apply -${percentMagnitude}% Discount (${
                          targetScope === "all" ? "All" : selectedIds.size
                        })`}
                  </span>
                </>
              )}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
