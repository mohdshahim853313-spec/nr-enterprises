"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/SafeImage";

interface ProductItem {
  id: string | number;
  name: string;
  sku?: string;
  price?: string | number;
  original_price?: string | number;
  category?: string;
  images?: string[];
}

interface BulkPriceMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProductsCount: number;
  products?: ProductItem[];
  onSuccess?: () => void;
}

export default function BulkPriceMarkupModal({
  isOpen,
  onClose,
  totalProductsCount,
  products = [],
  onSuccess,
}: BulkPriceMarkupModalProps) {
  // Mode: "increase" (+%) or "decrease" (-%)
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [percentMagnitude, setPercentMagnitude] = useState<number>(20);
  const [customInput, setCustomInput] = useState<string>("20");

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

  // Undo / Rollback State
  const [lastUndoSnapshot, setLastUndoSnapshot] = useState<{
    id: string;
    description: string;
    timestamp: string;
    productsCount: number;
  } | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);

  const fetchUndoHistory = async () => {
    try {
      const res = await fetch("/api/admin/bulk-price-markup/undo");
      const data = await res.json();
      if (data.success && data.latestSnapshot) {
        setLastUndoSnapshot(data.latestSnapshot);
      } else {
        setLastUndoSnapshot(null);
      }
    } catch (e) {
      console.warn("Could not fetch undo history:", e);
    }
  };

  // Fetch Etsy OAuth Status & Undo History on open
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
      `Are you sure you want to ${actionWord} prices for ${countToUpdate} listing(s) by ${signString}?\n\nThis will update prices across the website database and sync to Etsy.`
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#E5DDD2] overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE6DF] bg-gradient-to-r from-[#240609] via-[#3D0C12] to-[#180305] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-xl font-bold shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold font-heading">
                Price Adjustment (+% / -%) & Live Etsy Sync
              </h2>
              <p className="text-xs text-[#EAE6DF]/70">
                Increase or Decrease prices for selected/all listings on Website and Etsy Shop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* 🌟 ETSY SYNC NOTICE / CONNECT PILL */}
          <div className="rounded-2xl border p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FAF8F5] border-[#E8DFD3]">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#F1641E] text-white font-bold flex items-center justify-center text-sm shrink-0">
                E
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1C1917]">Etsy Shop (AHADGLOBALRUGS)</span>
                  {isEtsyConnected ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Live Connected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Action Needed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-600">
                  {isEtsyConnected
                    ? "Prices will update on your Website and Etsy shop in real-time."
                    : "Website updates instantly. To also update Etsy shop directly, connect once:"}
                </p>
              </div>
            </div>

            {!isEtsyConnected && (
              <a
                href="/api/etsy/oauth/connect"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-[#F1641E] hover:bg-[#d95314] text-white text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                🔗 Connect Etsy Shop
              </a>
            )}
          </div>

          {/* ↺ UNDO / ROLLBACK SAFETY BANNER */}
          {lastUndoSnapshot && (
            <div className="rounded-2xl border p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/80 border-amber-300 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#2B070B] text-[#FAF5EB] font-bold flex items-center justify-center text-sm shrink-0">
                  ↺
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2B070B]">Safety Undo Available</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {new Date(lastUndoSnapshot.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-700 mt-0.5">
                    Last update was: <strong>"{lastUndoSnapshot.description}"</strong>. Undo will restore exact previous prices & variants on Website and live on Etsy shop.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUndoPriceChange(lastUndoSnapshot.id)}
                disabled={isUndoing || isUpdating}
                className="px-3.5 py-1.5 rounded-xl bg-[#2B070B] hover:bg-[#3D0C12] text-white text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUndoing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Restoring Normal Prices...</span>
                  </>
                ) : (
                  <>
                    <span>↺</span>
                    <span>Undo & Restore Normal Prices</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 1. Target Regions / Columns */}
          <div className="space-y-2.5">
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B]">
              1. Target Columns / Regions (Sabhi Columns me)
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  applyIndia
                    ? "border-[#2B070B] bg-[#2B070B]/5 shadow-xs"
                    : "border-neutral-200 bg-neutral-50 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={applyIndia}
                  onChange={(e) => setApplyIndia(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-lg mb-1">🇮🇳</span>
                <span className="text-xs font-bold text-[#2B070B]">India (Domestic)</span>
                <span className="text-[10px] text-neutral-500">₹ INR Base & MRP</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  applyUS
                    ? "border-[#2B070B] bg-[#2B070B]/5 shadow-xs"
                    : "border-neutral-200 bg-neutral-50 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={applyUS}
                  onChange={(e) => setApplyUS(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-lg mb-1">🇺🇸</span>
                <span className="text-xs font-bold text-[#2B070B]">United States</span>
                <span className="text-[10px] text-neutral-500">$ USD Converted</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  applyEverywhere
                    ? "border-[#2B070B] bg-[#2B070B]/5 shadow-xs"
                    : "border-neutral-200 bg-neutral-50 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={applyEverywhere}
                  onChange={(e) => setApplyEverywhere(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-lg mb-1">🌍</span>
                <span className="text-xs font-bold text-[#2B070B]">Everywhere Else</span>
                <span className="text-[10px] text-neutral-500">Global & Worldwide</span>
              </label>
            </div>
          </div>

          {/* 2. CHOOSE DIRECTION: INCREASE (+%) OR DECREASE (-%) */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B]">
                2. Price Change Direction: Badhana ya Ghatana?
              </label>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDirection("increase")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    direction === "increase"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <span>➕</span>
                  <span>Increase (+%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("decrease")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    direction === "decrease"
                      ? "bg-rose-700 text-white shadow-xs"
                      : "bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <span>➖</span>
                  <span>Decrease (-%)</span>
                </button>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(direction === "increase" ? quickIncreasePercentages : quickDecreasePercentages).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      percentMagnitude === p
                        ? direction === "increase"
                          ? "bg-emerald-800 text-white shadow-xs"
                          : "bg-rose-800 text-white shadow-xs"
                        : "bg-white hover:bg-neutral-100 text-[#2B070B] border border-neutral-300"
                    }`}
                  >
                    {direction === "increase" ? `+${p}%` : `-${p}%`}
                  </button>
                )
              )}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-medium text-neutral-600">
                Or enter custom percentage ({direction === "increase" ? "+" : "-"}):
              </span>
              <div className="relative w-36">
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
                    direction === "increase" ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {direction === "increase" ? "+" : "-"}
                </span>
                <input
                  type="number"
                  min="0.1"
                  max={direction === "decrease" ? 95 : 1000}
                  step="0.5"
                  value={customInput}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="w-full pl-7 pr-8 py-2 rounded-xl border border-neutral-300 focus:border-[#2B070B] focus:ring-1 focus:ring-[#2B070B] text-sm font-bold text-[#2B070B] outline-none bg-white"
                  placeholder="20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  %
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  direction === "increase"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                Selected: {direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}
              </span>
            </div>
          </div>

          {/* 3. TARGET SCOPE & LISTINGS SELECTION WITH PHOTOS */}
          <div className="space-y-3 pt-2 border-t border-[#EAE6DF]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B]">
                3. Choose Listings to Update (Photo Dekh kar Select karein)
              </label>
            </div>

            {/* Scope Toggle: All vs Selected */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetScope("all")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  targetScope === "all"
                    ? "bg-[#2B070B] text-white border-[#2B070B] shadow-sm"
                    : "bg-[#FAF8F5] text-neutral-700 border-neutral-300 hover:bg-[#F0ECE1]"
                }`}
              >
                <span>🌐 All Listings ({products.length || totalProductsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope("selected")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  targetScope === "selected"
                    ? "bg-[#2B070B] text-white border-[#2B070B] shadow-sm"
                    : "bg-[#FAF8F5] text-neutral-700 border-neutral-300 hover:bg-[#F0ECE1]"
                }`}
              >
                <span>🎯 Select Specific Listings ({selectedIds.size} Selected)</span>
              </button>
            </div>

            {/* Specific Listings Picker with Photos */}
            {targetScope === "selected" && (
              <div className="space-y-3 pt-2">
                {/* Search & Bulk Select Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE6DF]">
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

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 transition-colors cursor-pointer"
                    >
                      Select All ({filteredProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Scrollable Products List with Image Cards */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 border border-[#EAE6DF] rounded-2xl p-2 bg-[#FCFAF7]">
                  {filteredProducts.length === 0 ? (
                    <div className="py-10 text-center text-xs text-neutral-500">
                      No listings match your search query.
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = selectedIds.has(p.id);
                      const rawPriceNum = p.price
                        ? parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0
                        : 0;
                      const newPriceNum = Math.max(1, Math.round(rawPriceNum * multiplier));
                      const firstImg =
                        Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "";

                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleSelectOne(p.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-[#2B070B]/5 border-[#2B070B] shadow-2xs"
                              : "bg-white border-neutral-200 hover:border-[#D4AF37]/50"
                          }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Controlled by container onClick
                            className="w-4 h-4 rounded-sm accent-[#2B070B] cursor-pointer shrink-0"
                          />

                          {/* Image Thumbnail */}
                          <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-2xs">
                            {firstImg ? (
                              <SafeImage
                                src={firstImg}
                                alt={p.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                No img
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-neutral-800 truncate" title={p.name}>
                              {p.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {p.sku && (
                                <span className="text-[9.5px] font-mono font-semibold px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded">
                                  {p.sku}
                                </span>
                              )}
                              {p.category && (
                                <span className="text-[9.5px] font-medium px-1.5 py-0.2 bg-amber-50 text-amber-900 border border-amber-200 rounded">
                                  {p.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price Preview */}
                          <div className="text-right shrink-0">
                            <div className="text-[11px] text-neutral-400 line-through">
                              ₹{rawPriceNum.toLocaleString("en-IN")}
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                direction === "increase" ? "text-emerald-700" : "text-rose-700"
                              }`}
                            >
                              ₹{newPriceNum.toLocaleString("en-IN")}
                            </div>
                            <span
                              className={`text-[9.5px] font-bold ${
                                direction === "increase" ? "text-emerald-800" : "text-rose-800"
                              }`}
                            >
                              {direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl p-4 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
              📊 Live Calculation Sample (Before vs After)
            </span>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#EAE6DF]/60 shadow-2xs">
                <span className="text-[11px] text-neutral-500 block">Current Base Sample</span>
                <span className="text-base font-bold text-neutral-700">
                  ₹{sampleBasePrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-neutral-400 block mt-0.5">
                  Approx ${sampleUsdPrice} USD
                </span>
              </div>
              <div
                className={`p-3 rounded-xl border shadow-2xs ${
                  direction === "increase"
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-rose-50/70 border-rose-200"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold block ${
                    direction === "increase" ? "text-emerald-900" : "text-rose-900"
                  }`}
                >
                  After {direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}{" "}
                  {direction === "increase" ? "Markup" : "Discount"}
                </span>
                <span
                  className={`text-base font-bold ${
                    direction === "increase" ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  ₹{sampleNewPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-neutral-600 font-bold block mt-0.5">
                  Approx ${sampleNewUsdPrice} USD
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#8C7A6B] leading-relaxed pt-1">
              ⚡ <em>Proportional Scaling:</em> All size variants and dropdown offerings for each targeted listing will be adjusted proportionally by{" "}
              <strong>{direction === "increase" ? `+${percentMagnitude}%` : `-${percentMagnitude}%`}</strong>.
            </p>
          </div>

          {/* Sync to Etsy Checkbox */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={syncToEtsy}
                onChange={(e) => setSyncToEtsy(e.target.checked)}
                className="w-4 h-4 rounded-sm accent-[#F1641E] cursor-pointer"
              />
              <span>Also update and push price live to Etsy Shop listings (AHADGLOBALRUGS)</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Etsy API v3</span>
          </div>

          {/* Alerts */}
          {resultMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">✓</span>
                <span>{resultMessage}</span>
              </div>
              {lastUndoSnapshot && (
                <button
                  type="button"
                  onClick={() => handleUndoPriceChange(lastUndoSnapshot.id)}
                  disabled={isUndoing}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {isUndoing ? "Restoring..." : "↺ Undo This Change"}
                </button>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAE6DF] bg-neutral-50 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-neutral-600">
            Targeting:{" "}
            <strong className="text-[#2B070B]">
              {targetScope === "all"
                ? `All ${products.length || totalProductsCount} Listings`
                : `${selectedIds.size} Selected Listing(s)`}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
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
              className={`px-5 sm:px-6 py-2.5 rounded-xl text-white text-xs font-heading font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                direction === "increase"
                  ? "bg-[#2B070B] hover:bg-[#3D0C12]"
                  : "bg-rose-800 hover:bg-rose-900"
              }`}
            >
              {isUpdating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        </div>
      </motion.div>
    </div>
  );
}
