"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BulkPriceMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProductsCount: number;
  onSuccess?: () => void;
}

export default function BulkPriceMarkupModal({
  isOpen,
  onClose,
  totalProductsCount,
  onSuccess,
}: BulkPriceMarkupModalProps) {
  const [percent, setPercent] = useState<number>(20);
  const [customInput, setCustomInput] = useState<string>("20");
  const [applyIndia, setApplyIndia] = useState(true);
  const [applyUS, setApplyUS] = useState(true);
  const [applyEverywhere, setApplyEverywhere] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPercentages = [10, 15, 20, 25, 30, 40, 50, 75, 100];

  const handleSelectPreset = (p: number) => {
    setPercent(p);
    setCustomInput(String(p));
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPercent(num);
    }
  };

  const sampleBasePrice = 5000;
  const sampleNewPrice = Math.round(sampleBasePrice * (1 + percent / 100));
  const sampleUsdPrice = Math.round(sampleBasePrice / 83.5);
  const sampleNewUsdPrice = Math.round(sampleNewPrice / 83.5);

  const handleApplyMarkup = async () => {
    if (percent === 0) {
      alert("Please select or enter a percentage greater than 0.");
      return;
    }

    const confirmRun = window.confirm(
      `Are you sure you want to increase prices for ALL ${totalProductsCount} listings by +${percent}%?\n\nThis will update base prices and all size variants across India, US, and Everywhere Else.`
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
          percent,
          applyToAll: true,
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

      setResultMessage(data.message || `Successfully updated ${data.updatedCount} products!`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred while updating prices.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5DDD2] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE6DF] bg-gradient-to-r from-[#240609] via-[#3D0C12] to-[#180305] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading">
                Bulk Price Markup & Global Scaling
              </h2>
              <p className="text-xs text-[#EAE6DF]/70">
                Update all listings in 1-click across India, US, and Everywhere Else
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Target Regions / Columns */}
          <div className="space-y-2.5">
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B]">
              1. Target Columns / Regions (Sabhi Columns me)
            </label>
            <div className="grid grid-cols-3 gap-3">
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

          {/* Select Percentage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B]">
                2. Select Markup Percentage (% badhana)
              </label>
              <span className="text-xs font-bold text-[#C19A6B]">
                Currently: +{percent}%
              </span>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {quickPercentages.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    percent === p
                      ? "bg-[#2B070B] text-white shadow-xs"
                      : "bg-[#FAF8F5] hover:bg-[#EAE6DF] text-[#2B070B] border border-[#EAE6DF]"
                  }`}
                >
                  +{p}%
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-medium text-neutral-600">Or enter custom %:</span>
              <div className="relative w-32">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customInput}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-neutral-300 focus:border-[#2B070B] focus:ring-1 focus:ring-[#2B070B] text-sm font-bold text-[#2B070B] outline-none"
                  placeholder="20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl p-4 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
              📊 Live Preview Calculation (Before vs After)
            </span>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#EAE6DF]/60">
                <span className="text-[11px] text-neutral-500 block">Current Base Sample</span>
                <span className="text-base font-bold text-neutral-700">₹{sampleBasePrice.toLocaleString("en-IN")}</span>
                <span className="text-xs text-neutral-400 block mt-0.5">Approx ${sampleUsdPrice} USD</span>
              </div>
              <div className="bg-[#2B070B]/5 p-3 rounded-xl border border-[#2B070B]/20">
                <span className="text-[11px] text-[#2B070B] font-semibold block">After +{percent}% Markup</span>
                <span className="text-base font-bold text-[#2B070B]">₹{sampleNewPrice.toLocaleString("en-IN")}</span>
                <span className="text-xs text-[#8C6B38] font-bold block mt-0.5">Approx ${sampleNewUsdPrice} USD</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8C7A6B] leading-relaxed pt-1">
              ⚡ <em>Proportional Scaling:</em> All size variants (3x5, 4x6, 5x8, 6x9, 8x10, 9x12 ft) for every active listing will be scaled up proportionally by <strong>+{percent}%</strong>.
            </p>
          </div>

          {/* Status Messages */}
          {resultMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>✓</span>
              <span>{resultMessage}</span>
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
        <div className="p-6 border-t border-[#EAE6DF] bg-neutral-50 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-neutral-500">
            Targeting: <strong className="text-[#2B070B]">{totalProductsCount} Listings</strong>
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
              disabled={isUpdating || percent === 0}
              className="px-6 py-2.5 rounded-xl bg-[#2B070B] hover:bg-[#3D0C12] text-white text-xs font-heading font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Prices...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Apply +{percent}% Markup (1-Click)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
