"use client";

import defaultData from "@/lib/siteContent";
import CarpetSphere from "@/components/home/CarpetSphere";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { compressAndConvertToWebP } from "@/lib/compressImage";
import { deleteStorageImage } from "@/lib/deleteStorageImage";
import HeroSlidesManager from "@/components/admin/HeroSlidesManager";

function ImageUploader({
  label,
  value,
  onChange,
  onUpload,
  isUploading,
  linkValue,
  onLinkChange,
  recommendedSize,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File, cb: (url: string) => void, oldUrl?: string) => void;
  isUploading: boolean;
  linkValue?: string;
  onLinkChange?: (link: string) => void;
  recommendedSize?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0], onChange, value);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63]">
          {label}
        </label>
        {recommendedSize && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#1B3624] bg-[#E8F0E8] border border-[#C5DAC5] px-2 py-0.5 rounded-xs shadow-2xs">
            <span className="text-[11px]">📐</span>
            <span>Size: <strong className="font-bold text-[#1B3624]">{recommendedSize}</strong></span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-20 h-20 bg-[#EAEAEB] border border-[#DFD8CC] rounded-sm overflow-hidden relative group shadow-2xs">
            {value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8C7A63] uppercase font-semibold text-center p-1">No Image</div>
            )}
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-2.5 text-center rounded-sm transition-colors cursor-pointer ${isDragging ? "border-[#C19A6B] bg-[#F5F5F7]" : "border-[#DFD8CC] bg-[#FAFAF8] hover:border-[#C19A6B]"
              }`}
          >
            <p className="text-xs text-[#7A7065]">
              {isUploading ? "Optimizing & Uploading..." : "Drag & Drop image here, or "}
              <label className="text-[#C19A6B] font-bold underline cursor-pointer hover:text-[#3A332C]">
                browse file
                <input
                  type="file"
                  accept="image/*,.webp,.avif,.svg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onUpload(e.target.files[0], onChange, value);
                    }
                  }}
                />
              </label>
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-[#8C7A63] shrink-0">Direct URL:</span>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste image URL directly"
              className="w-full border border-[#DFD8CC] px-3 py-1.5 text-xs bg-white focus:border-[#C19A6B] outline-none text-[#3A332C]"
            />
            {value && (
              <button
                type="button"
                onClick={async () => {
                  await deleteStorageImage(value);
                  onChange("");
                }}
                className="text-[11px] text-red-600 hover:underline px-2 py-1 font-semibold uppercase shrink-0"
              >
                Delete
              </button>
            )}
          </div>

          {onLinkChange !== undefined && (
            <div className="flex gap-2 items-center">
              <span className="text-[10px] uppercase font-bold text-[#8C7A63] shrink-0">Click Link:</span>
              <input
                type="text"
                value={linkValue || ""}
                onChange={(e) => onLinkChange(e.target.value)}
                placeholder="Target URL on image click (e.g. /collections, /product/123, /customize)"
                className="w-full border border-[#DFD8CC] px-3 py-1.5 text-xs bg-white focus:border-[#C19A6B] outline-none text-[#3A332C]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodebasePublishBar({
  pageId,
  pageName,
  filePath,
  onPublishToWebsite,
  onSaveToCodebase,
  isSaving,
  isSavingToCode,
}: {
  pageId: string;
  pageName: string;
  filePath: string;
  onPublishToWebsite: (pageId: string, overwriteImages: boolean) => void;
  onSaveToCodebase: (pageId: string) => void;
  isSaving: boolean;
  isSavingToCode: boolean;
}) {
  return (
    <div className="bg-[#FAF8F5] border-2 border-[#DFD8CC] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#2B2520]">
            2-Way Codebase Sync Hub
          </span>
          <span className="text-[10px] bg-[#2B2520] text-[#E5C158] font-mono px-2.5 py-0.5 rounded-md font-bold">
            {filePath}
          </span>
        </div>
        <span className="text-[11px] text-[#8C7A63] font-medium hidden sm:inline">
          Admin Panel aur Code file ko aapas me sync karein
        </span>
      </div>

      {/* 2 Clear, Unambiguous Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

        {/* CARD 1: ADMIN ➔ CODE FILE */}
        <div className="bg-white p-4 rounded-xl border border-[#DFD8CC] shadow-2xs flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Direction: Admin ➔ File
              </span>
              <span className="text-xs">📥</span>
            </div>
            <h4 className="text-xs font-bold text-[#2B2520] mb-1">
              Save Admin Text into Code File
            </h4>
            <p className="text-[11px] text-[#7A7065] leading-relaxed">
              Admin me jo naya text ya heading aapne likhi hai, use seedhe computer file (<strong className="text-[#2B2520]">{filePath}</strong>) me save karega.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSaveToCodebase(pageId)}
            disabled={isSavingToCode}
            className="w-full py-2.5 px-3 bg-[#2B2520] hover:bg-[#C19A6B] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            title="Admin ka content seedhe code file me save karein"
          >
            <span>📥</span>
            <span>{isSavingToCode ? "Saving to File..." : `Save to ${filePath.split("/").pop()}`}</span>
          </button>
        </div>

        {/* CARD 2: CODE FILE ➔ LIVE WEBSITE */}
        <div className="bg-white p-4 rounded-xl border border-[#DFD8CC] shadow-2xs flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Direction: File ➔ Website
              </span>
              <span className="text-xs">🚀</span>
            </div>
            <h4 className="text-xs font-bold text-[#2B2520] mb-1">
              Publish Code File to Live Website
            </h4>
            <p className="text-[11px] text-[#7A7065] leading-relaxed">
              Computer file (<strong className="text-[#2B2520]">{filePath}</strong>) me likhe text ko seedhe live Supabase aur website par bhej dega.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPublishToWebsite(pageId, true)}
              disabled={isSaving}
              className="flex-1 py-2.5 px-2 bg-[#1B3624] hover:bg-[#2b5438] text-white text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="File ka Text + Images live publish karein"
            >
              <span>🚀</span>
              <span>Publish All (Text+Img)</span>
            </button>
            <button
              type="button"
              onClick={() => onPublishToWebsite(pageId, false)}
              disabled={isSaving}
              className="py-2.5 px-3 bg-[#F5F2EC] hover:bg-white text-[#2B2520] border border-[#DFD8CC] text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              title="Sirf Text publish karein, uploaded photos ko safe rakhein"
            >
              <span>📝 Text Only</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function CollectionProductPickerModal({
  currentProductId,
  currentLink,
  currentImg,
  currentName,
  currentPrice,
  availableProducts,
  onSelectProduct,
  accent = "emerald",
}: {
  currentProductId?: string;
  currentLink?: string;
  currentImg?: string;
  currentName?: string;
  currentPrice?: number;
  availableProducts: any[];
  onSelectProduct: (data: {
    productId: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    link: string;
    img: string;
    suggestedColor?: string;
  }) => void;
  accent?: "emerald" | "amber" | "purple" | "teal";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const matchedProduct = useMemo(() => {
    if (!availableProducts || availableProducts.length === 0) return null;
    if (currentProductId) {
      return availableProducts.find((p) => p.id === currentProductId) || null;
    }
    if (currentLink && currentLink.startsWith("/product/")) {
      const pid = currentLink.replace("/product/", "").trim();
      return availableProducts.find((p) => p.id === pid) || null;
    }
    return null;
  }, [availableProducts, currentProductId, currentLink]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    availableProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter((p) => {
      const matchesCat =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSearch =
        searchTerm === "" ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [availableProducts, selectedCategory, searchTerm]);

  const theme = {
    emerald: {
      box: "bg-emerald-50/70 border-emerald-300",
      tag: "text-emerald-950",
      btnMatched: "bg-emerald-800 hover:bg-emerald-950 text-white",
      btnUnmatched: "bg-emerald-700 hover:bg-emerald-900 text-white",
    },
    amber: {
      box: "bg-amber-50/70 border-amber-300",
      tag: "text-amber-950",
      btnMatched: "bg-amber-800 hover:bg-amber-950 text-white",
      btnUnmatched: "bg-amber-700 hover:bg-amber-900 text-white",
    },
    purple: {
      box: "bg-purple-50/70 border-purple-300",
      tag: "text-purple-950",
      btnMatched: "bg-purple-800 hover:bg-purple-950 text-white",
      btnUnmatched: "bg-purple-700 hover:bg-purple-900 text-white",
    },
    teal: {
      box: "bg-teal-50/70 border-teal-300",
      tag: "text-teal-950",
      btnMatched: "bg-teal-800 hover:bg-teal-950 text-white",
      btnUnmatched: "bg-teal-700 hover:bg-teal-900 text-white",
    },
  }[accent || "emerald"] || {
    box: "bg-emerald-50/70 border-emerald-300",
    tag: "text-emerald-950",
    btnMatched: "bg-emerald-800 hover:bg-emerald-950 text-white",
    btnUnmatched: "bg-emerald-700 hover:bg-emerald-900 text-white",
  };

  const handleSelect = (p: any, specificImg?: string) => {
    const numPrice =
      parseFloat(
        (p.variants?.[0]?.price || p.price || "0").toString().replace(/[^0-9.]/g, "")
      ) || 0;

    const rawOrig = p.variants?.[0]?.original_price || p.original_price || null;
    const numOrig = rawOrig
      ? parseFloat(rawOrig.toString().replace(/[^0-9.]/g, ""))
      : numPrice > 0
        ? Math.round(numPrice * 1.8)
        : null;

    const chosenImg =
      specificImg || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "");

    onSelectProduct({
      productId: p.id,
      name: p.name || "",
      price: numPrice,
      originalPrice: numOrig,
      link: `/product/${p.id}`,
      img: chosenImg,
      suggestedColor: p.color || undefined,
    });

    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5">
      {/* Clean Full-Width Trigger Bar on the Card */}
      <div
        className={`p-2.5 rounded-xl border transition-all ${theme.box} space-y-2`}
      >
        {/* Status Line */}
        <div className="flex items-center justify-between gap-1 text-[10px]">
          <span
            className={`font-bold uppercase tracking-wider flex items-center gap-1 ${theme.tag}`}
          >
            <span>⚡</span>
            <span>Collection Auto-Fill</span>
          </span>
          {matchedProduct ? (
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>✔</span>
              <span>Linked to Listing</span>
            </span>
          ) : (
            <span className="text-[9px] text-[#8C7A63] font-medium">Click below to browse</span>
          )}
        </div>

        {/* Clean Full-Width Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${matchedProduct ? theme.btnMatched : theme.btnUnmatched
            }`}
        >
          <span>🖼️</span>
          <span>{matchedProduct ? "Change Rug (Open Gallery)" : "Choose from Collection Gallery"}</span>
        </button>

        {/* If linked, show subtle product info */}
        {matchedProduct && (
          <div className="flex items-center justify-between text-[10.5px] px-1 text-[#6B5E51] border-t border-black/5 pt-1.5">
            <span className="truncate max-w-[210px] font-medium" title={matchedProduct.name}>
              {matchedProduct.name}
            </span>
            <a
              href={`/product/${matchedProduct.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline font-bold shrink-0 ml-1.5"
            >
              Live Page ↗
            </a>
          </div>
        )}
      </div>

      {/* 🌟 BIG COLLECTIONS POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#FAF8F5] w-full max-w-6xl max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#DFD8CC] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2B2520] via-stone-900 to-[#1C1917] text-white flex items-center justify-between gap-4 border-b border-[#3A332C]">
              <div>
                <span className="text-amber-400 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                  NR Enterprises Collections Visual Picker
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Select Rug from Published Catalog</span>
                </h3>
                <p className="text-xs text-stone-300/80 mt-1">
                  Click on any rug photo below to auto-fill title, price, images, and live link.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-xl font-bold transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 sm:p-4 bg-white border-b border-[#DFD8CC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Search rugs by title, category, material or ID..."
                  className="w-full pl-3 pr-8 py-2 text-xs border border-[#DFD8CC] rounded-lg outline-none focus:border-[#C19A6B] bg-[#FAFAF8]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${selectedCategory === cat
                        ? "bg-[#2B2520] text-[#E5C158] shadow-xs"
                        : "bg-[#EAE6DF] hover:bg-[#DFD8CC] text-[#4A3E31]"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Gallery Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#F5F2EC]/60">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-2">🔍</span>
                  <p className="text-sm font-bold text-stone-700">No matching rugs found in catalog</p>
                  <p className="text-xs text-stone-500 mt-1">Try clearing your search query or choosing another category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {filteredProducts.map((p) => {
                    const price =
                      p.variants?.[0]?.price || p.price || "N/A";
                    const origPrice =
                      p.variants?.[0]?.original_price || p.original_price;
                    const img =
                      Array.isArray(p.images) && p.images.length > 0
                        ? p.images[0]
                        : "";
                    const isSelected = matchedProduct?.id === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        className={`group bg-white rounded-xl border-2 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 ${isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/30"
                            : "border-[#E5DDD2] hover:border-[#C19A6B]"
                          }`}
                      >
                        {/* Rug Photo (Exact 4:5 Aspect Ratio like collections) */}
                        <div className="relative aspect-[4/5] w-full bg-[#ECE7DE] overflow-hidden">
                          {img ? (
                            <img
                              src={img}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                              No Image
                            </div>
                          )}

                          {/* Category Tag */}
                          {p.category && (
                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 text-white backdrop-blur-xs pointer-events-none">
                              {p.category}
                            </span>
                          )}

                          {/* Selected Indicator */}
                          {isSelected && (
                            <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-md pointer-events-none">
                              ✔ Selected
                            </span>
                          )}

                          {/* Hover Overlay Button */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                            <span className="bg-[#C19A6B] hover:bg-white text-stone-900 font-bold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg transition-colors">
                              Select This Rug ➔
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-2.5 flex flex-col flex-1 justify-between bg-white text-center">
                          <h4 className="text-xs font-semibold text-[#2B2520] line-clamp-2 leading-tight group-hover:text-[#C19A6B] transition-colors mb-1">
                            {p.name}
                          </h4>
                          <div className="flex items-baseline justify-center gap-1.5 mt-auto pt-1">
                            <span className="text-xs font-bold text-[#2B2520]">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </span>
                            {origPrice && (
                              <span className="text-[10px] text-stone-400 line-through">
                                ₹{Number(origPrice).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* If product has multiple photos, show mini selector strip */}
                        {Array.isArray(p.images) && p.images.length > 1 && (
                          <div className="flex items-center justify-center gap-1.5 p-1.5 bg-stone-50 border-t border-stone-200 overflow-x-auto">
                            <span className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider shrink-0">
                              {p.images.length} Photos:
                            </span>
                            {p.images.slice(0, 4).map((subImg: string, sIdx: number) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelect(p, subImg);
                                }}
                                title={`Select Photo #${sIdx + 1}`}
                                className="w-6 h-6 rounded border border-stone-300 overflow-hidden hover:scale-115 hover:ring-2 hover:ring-[#C19A6B] transition-all cursor-pointer shrink-0"
                              >
                                <img src={subImg} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#DFD8CC] flex items-center justify-between text-xs text-stone-600">
              <span>Showing <strong>{filteredProducts.length}</strong> rugs in collection catalog</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// 🌟 Modular Default Configuration Data
// Imported from modular files in lib/siteContent/ (home.ts, collections.ts, legacy.ts, about.ts, contact.ts)

const PAGES = [
  { id: "home", label: "Home", livePath: "/" },
  { id: "collections", label: "Collections", livePath: "/collections" },
  { id: "legacy", label: "Our Story", livePath: "/legacy" },
  { id: "about", label: "About Us", livePath: "/about" },
  { id: "contact", label: "Contact", livePath: "/contact" }
];

const PAGE_THEMES: Record<string, { activeBg: string; border: string; accent: string }> = {
  home: {
    activeBg: "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]",
    border: "border-[#C19A6B]",
    accent: "text-[#C19A6B]"
  },
  collections: {
    activeBg: "bg-[#241F1A] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]",
    border: "border-[#C19A6B]",
    accent: "text-[#C19A6B]"
  },
  legacy: {
    activeBg: "bg-[#2B231C] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]",
    border: "border-[#C19A6B]",
    accent: "text-[#C19A6B]"
  },
  about: {
    activeBg: "bg-[#1C261E] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]",
    border: "border-[#C19A6B]",
    accent: "text-[#C19A6B]"
  },
  contact: {
    activeBg: "bg-[#1C2226] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]",
    border: "border-[#C19A6B]",
    accent: "text-[#C19A6B]"
  },
};

const SLIDE_THEMES = [
  {
    name: "Primary Atelier",
    containerBg: "bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm",
    headerBg: "bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] text-white rounded-t-xl",
    badge: "bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/40",
    numBadge: "bg-[#C19A6B] text-white shadow-sm",
    tagColor: "text-[#3A332C] font-bold",
    bannerBox: "bg-[#FAFAFA] border border-[#E5DDD2] rounded-xl p-5",
    bannerTitle: "text-[#1C1917]",
  },
  {
    name: "Warm Bronze",
    containerBg: "bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm",
    headerBg: "bg-gradient-to-r from-[#2A241F] via-[#382F27] to-[#2A241F] text-white rounded-t-xl",
    badge: "bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/40",
    numBadge: "bg-[#C19A6B] text-white shadow-sm",
    tagColor: "text-[#3A332C] font-bold",
    bannerBox: "bg-[#FAFAFA] border border-[#E5DDD2] rounded-xl p-5",
    bannerTitle: "text-[#1C1917]",
  },
  {
    name: "Forest Sage",
    containerBg: "bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm",
    headerBg: "bg-gradient-to-r from-[#1A261C] via-[#243527] to-[#1A261C] text-white rounded-t-xl",
    badge: "bg-[#2D5A3C]/30 text-[#C8E0CD] border border-[#2D5A3C]/40",
    numBadge: "bg-[#2D5A3C] text-white shadow-sm",
    tagColor: "text-[#3A332C] font-bold",
    bannerBox: "bg-[#FAFAFA] border border-[#E5DDD2] rounded-xl p-5",
    bannerTitle: "text-[#1C1917]",
  },
  {
    name: "Earthy Linen",
    containerBg: "bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm",
    headerBg: "bg-gradient-to-r from-[#29221D] via-[#352C25] to-[#29221D] text-white rounded-t-xl",
    badge: "bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/40",
    numBadge: "bg-[#C19A6B] text-white shadow-sm",
    tagColor: "text-[#3A332C] font-bold",
    bannerBox: "bg-[#FAFAFA] border border-[#E5DDD2] rounded-xl p-5",
    bannerTitle: "text-[#1C1917]",
  },
  {
    name: "Artisan Obsidian",
    containerBg: "bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm",
    headerBg: "bg-gradient-to-r from-[#1C1917] via-[#26201B] to-[#1C1917] text-white rounded-t-xl",
    badge: "bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/40",
    numBadge: "bg-[#C19A6B] text-white shadow-sm",
    tagColor: "text-[#3A332C] font-bold",
    bannerBox: "bg-[#FAFAFA] border border-[#E5DDD2] rounded-xl p-5",
    bannerTitle: "text-[#1C1917]",
  },
];

export default function SiteContentAdmin() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedExtraSlide, setSelectedExtraSlide] = useState<number>(1);
  const [siteContent, setSiteContent] = useState<Record<string, any>>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  // 🌟 Confirmation Modal for Save & Publish (Images to Cloudflare R2 & Text to Supabase)
  const [confirmPublishModal, setConfirmPublishModal] = useState<{
    isOpen: boolean;
    type: "current" | "all";
    targetPageName?: string;
  } | null>(null);

  const requestPublishCurrent = () => {
    const pageObj = PAGES.find((p) => p.id === activeTab);
    setConfirmPublishModal({
      isOpen: true,
      type: "current",
      targetPageName: pageObj ? pageObj.label : activeTab,
    });
  };

  const requestPublishAll = () => {
    setConfirmPublishModal({
      isOpen: true,
      type: "all",
      targetPageName: "All 5 Pages",
    });
  };

  // Live Quick Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadAllContent() {
      try {
        const [contentRes, productsRes] = await Promise.all([
          supabase.from("site_content").select("id, data"),
          supabase
            .from("products")
            .select("id, name, price, original_price, images, category, color, variants")
            .order("created_at", { ascending: false }),
        ]);

        if (productsRes?.data) {
          setAvailableProducts(productsRes.data);
        }

        if (contentRes?.data && contentRes.data.length > 0) {
          const loaded: Record<string, any> = { ...defaultData };
          contentRes.data.forEach((row: any) => {
            if (row.id) {
              loaded[row.id] = { ...defaultData[row.id], ...row.data };
            }
          });
          setSiteContent(loaded);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllContent();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = async (
    file: File,
    callback: (url: string) => void,
    oldUrl?: string
  ) => {
    setIsUploading(true);
    setStatusMsg(`Optimizing "${file.name}" to WebP...`);

    try {
      if (oldUrl) {
        setStatusMsg("Replacing old image...");
        await deleteStorageImage(oldUrl);
      }

      setStatusMsg(`Compressing & converting to WebP...`);
      const optimizedFile = await compressAndConvertToWebP(file);

      console.log(
        `[CMS Upload] ${file.name} | Original: ${(file.size / 1024).toFixed(0)} KB -> Compressed: ${(optimizedFile.size / 1024).toFixed(0)} KB`
      );

      // 🌟 Save permanently to Supabase Storage with local fallback
      setStatusMsg(`Uploading optimized WebP image to secure storage...`);
      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("folder", "cms-content");
      if (oldUrl) {
        formData.append("oldUrl", oldUrl);
      }

      try {
        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success && data.url) {
          callback(data.url);
          setStatusMsg("Photo optimized & uploaded! ✔");
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (uploadErr: any) {
        console.error("Upload error:", uploadErr);
        throw new Error(`Upload failed: ${uploadErr.message || uploadErr}`);
      }
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setStatusMsg("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCurrentPage = async () => {
    setIsSaving(true);
    const pageObj = PAGES.find((p) => p.id === activeTab);
    const pageName = pageObj ? pageObj.label : activeTab;
    setStatusMsg(`Saving & publishing changes for ${pageName}...`);
    try {
      const pageData = siteContent[activeTab] || defaultData[activeTab];
      const { error } = await supabase
        .from("site_content")
        .upsert(
          {
            id: activeTab,
            data: pageData,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`rz_${activeTab}_content`, JSON.stringify(pageData));
          if (activeTab === "home") {
            localStorage.setItem("rz_home_content_v9", JSON.stringify(pageData));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setIsSaving(false);
      setStatusMsg(`✔ "${pageName}" ke sabhi text & image changes live website par publish ho gaye!`);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setStatusMsg("");
      }, 3000);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
      setIsSaving(false);
    }
  };

  const handleSaveAllFivePages = async () => {
    setIsSaving(true);
    setStatusMsg("Saving & publishing all 5 pages live to website...");
    try {
      for (const page of PAGES) {
        const pageData = siteContent[page.id] || defaultData[page.id];
        const { error } = await supabase
          .from("site_content")
          .upsert(
            {
              id: page.id,
              data: pageData,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
        if (error) throw error;

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`rz_${page.id}_content`, JSON.stringify(pageData));
            if (page.id === "home") {
              localStorage.setItem("rz_home_content_v9", JSON.stringify(pageData));
            }
          } catch (e) { }
        }
      }

      setIsSaving(false);
      setStatusMsg("✔ Sabhi 5 Pages (Home, Collections, Legacy, About, Contact) live publish ho gaye!");
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setStatusMsg("");
      }, 3000);
    } catch (err: any) {
      alert("Failed to save all pages: " + err.message);
      setIsSaving(false);
    }
  };

  const handleConfirmAndPublish = async () => {
    const targetType = confirmPublishModal?.type;
    setConfirmPublishModal(null);
    if (targetType === "all") {
      await handleSaveAllFivePages();
    } else {
      await handleSaveCurrentPage();
    }
  };

  // 🌟 Helper: Merge code defaults text while strictly preserving any uploaded images
  const mergeCodeTextPreservingImages = (codeObj: any, currentObj: any): any => {
    if (codeObj === null || codeObj === undefined) {
      return currentObj;
    }
    if (typeof codeObj !== "object") {
      return codeObj;
    }

    const isImageKey = (key: string) => {
      const k = key.toLowerCase();
      return (
        k === "img" ||
        k === "image" ||
        k === "bgimage" ||
        k === "bgimages" ||
        k === "images" ||
        k === "mainimage" ||
        k === "detailimage" ||
        k === "video" ||
        k === "avatar" ||
        k === "photo" ||
        k === "bannerimage" ||
        k.endsWith("img") ||
        k.endsWith("image") ||
        k.endsWith("images")
      );
    };

    if (Array.isArray(codeObj)) {
      if (!Array.isArray(currentObj)) return codeObj;
      return codeObj.map((item, index) => {
        const currentItem = currentObj[index];
        if (typeof item === "string" && typeof currentItem === "string") {
          if (currentItem.trim().length > 0) return currentItem;
          return item;
        } else if (typeof item === "object" && item !== null) {
          return mergeCodeTextPreservingImages(item, currentItem);
        }
        return currentItem !== undefined ? currentItem : item;
      });
    }

    const result: Record<string, any> = { ...codeObj };

    for (const key of Object.keys(codeObj)) {
      const codeVal = codeObj[key];
      const currentVal = currentObj ? currentObj[key] : undefined;

      if (isImageKey(key)) {
        if (Array.isArray(currentVal)) {
          if (Array.isArray(codeVal)) {
            result[key] = codeVal.map((cSlot, idx) => {
              const curSlot = currentVal[idx];
              return typeof curSlot === "string" && curSlot.trim().length > 0 ? curSlot : cSlot;
            });
          } else {
            result[key] = currentVal;
          }
        } else if (typeof currentVal === "string" && currentVal.trim().length > 0) {
          result[key] = currentVal;
        } else if (typeof currentVal === "object" && currentVal !== null) {
          result[key] = currentVal;
        } else {
          result[key] = codeVal;
        }
      } else if (typeof codeVal === "object" && codeVal !== null) {
        result[key] = mergeCodeTextPreservingImages(codeVal, currentVal);
      } else {
        result[key] = codeVal;
      }
    }

    if (currentObj && typeof currentObj === "object") {
      for (const key of Object.keys(currentObj)) {
        if (isImageKey(key) && (result[key] === undefined || result[key] === "")) {
          if (currentObj[key]) {
            result[key] = currentObj[key];
          }
        }
      }
    }

    return result;
  };

  const handlePublishCodeDefaults = async (pageId: string = activeTab, overwriteImages: boolean = false) => {
    const pageObj = PAGES.find((p) => p.id === pageId);
    const pageName = pageObj ? pageObj.label : pageId;

    const confirmMsg = overwriteImages
      ? `Kya aap "${pageName}" ka pura content (TEXT + IMAGES) codebase file (lib/siteContent/${pageId}.ts) se live Supabase par overwrite & publish karna chahte hain?\n\n⚠️ NOTE: Code file ke naye text aur naye image URLs dono live website par apply ho jayenge.`
      : `Kya aap "${pageName}" ka text codebase defaults se overwrite karke live publish karna chahte hain?\n\n📸 NOTE: Aapki uploaded images safe rahengi, sirf texts/headings/descriptions hi code se update honge.`;

    const confirmReset = window.confirm(confirmMsg);
    if (!confirmReset) return;

    setIsSaving(true);
    setStatusMsg(`Publishing Codebase ${overwriteImages ? "Texts & Images" : "Texts"} for ${pageName}...`);

    try {
      const codeDefault = defaultData[pageId] || {};
      const currentData = siteContent[pageId] || {};

      const finalContent = overwriteImages
        ? codeDefault
        : mergeCodeTextPreservingImages(codeDefault, currentData);

      // 1. Update State in Admin
      setSiteContent((prev) => ({
        ...prev,
        [pageId]: finalContent
      }));

      // 2. Overwrite Supabase row
      const { error } = await supabase
        .from("site_content")
        .upsert(
          {
            id: pageId,
            data: finalContent,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      // 3. Overwrite localStorage cache
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`rz_${pageId}_content`, JSON.stringify(finalContent));
          if (pageId === "home") {
            localStorage.setItem("rz_home_content_v9", JSON.stringify(finalContent));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setStatusMsg(`✔ "${pageName}" ka Codebase content (${overwriteImages ? "Text + Images" : "Text Only"}) live website par publish ho gaya!`);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setStatusMsg("");
      }, 3500);
    } catch (err: any) {
      alert("Publish failed: " + err.message);
      setStatusMsg("");
    } finally {
      setIsSaving(false);
    }
  };

  const [isSavingToCode, setIsSavingToCode] = useState(false);

  const handleSaveAdminToCodebase = async (pageId: string = activeTab) => {
    const pageObj = PAGES.find((p) => p.id === pageId);
    const pageName = pageObj ? pageObj.label : pageId;

    const confirmMsg = `📥 [Admin ➔ File Sync]\n\nKya aap Admin me likhe hue "${pageName}" ke naye content ko seedhe aapki computer file (lib/siteContent/${pageId}.ts) me save karna chahte hain?`;
    if (!window.confirm(confirmMsg)) return;

    setIsSavingToCode(true);
    setStatusMsg(`Saving Admin content to lib/siteContent/${pageId}.ts...`);

    try {
      const dataToSave = siteContent[pageId];
      if (!dataToSave) throw new Error("No content found in Admin state.");

      const res = await fetch("/api/admin/save-to-codebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, data: dataToSave }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to write to file");
      }

      setStatusMsg(`✔ Success! Admin content seedhe lib/siteContent/${pageId}.ts me save ho gaya!`);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setStatusMsg("");
      }, 3500);
    } catch (err: any) {
      alert("Save to Codebase failed: " + err.message);
      setStatusMsg("");
    } finally {
      setIsSavingToCode(false);
    }
  };

  const handlePublishAllCodeDefaults = async (overwriteImages: boolean = false) => {
    const confirmMsg = overwriteImages
      ? `Kya aap SABHI 5 Pages (Home, Collections, Our Story, About Us, Contact) ka pura content (TEXT + IMAGES) codebase files (lib/siteContent/) se live Supabase par publish karna chahte hain?\n\n⚠️ NOTE: Code files ke naye texts aur image URLs live ho jayenge.`
      : `Kya aap SABHI 5 Pages (Home, Collections, Our Story, About Us, Contact) ke texts ko Codebase Defaults se live publish karna chahte hain?\n\n📸 NOTE: Sabhi pages ki images safe rahengi, sirf texts hi code se update honge.`;

    const confirmReset = window.confirm(confirmMsg);
    if (!confirmReset) return;

    setIsSaving(true);
    setStatusMsg(`Publishing Codebase ${overwriteImages ? "Content (Text + Images)" : "Texts"} for ALL 5 pages...`);

    try {
      const newAllContent: Record<string, any> = {};

      for (const page of PAGES) {
        const codeDefault = defaultData[page.id] || {};
        const currentData = siteContent[page.id] || {};
        const finalContent = overwriteImages
          ? codeDefault
          : mergeCodeTextPreservingImages(codeDefault, currentData);
        newAllContent[page.id] = finalContent;

        await supabase
          .from("site_content")
          .upsert(
            {
              id: page.id,
              data: finalContent,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`rz_${page.id}_content`, JSON.stringify(finalContent));
            if (page.id === "home") {
              localStorage.setItem("rz_home_content_v9", JSON.stringify(finalContent));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      setSiteContent((prev) => ({
        ...prev,
        ...newAllContent
      }));

      setStatusMsg(`✔ Sabhi 5 Pages ka Codebase content (${overwriteImages ? "Text + Images" : "Text Only"}) live website par publish ho gaya!`);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setStatusMsg("");
      }, 3500);
    } catch (err: any) {
      alert("Publish all failed: " + err.message);
      setStatusMsg("");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    setSiteContent((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [section]: {
          ...prev[activeTab]?.[section],
          [field]: value
        }
      }
    }));
  };

  const searchableEntries = useMemo(() => {
    const results: Array<{
      tabId: string;
      tabLabel: string;
      sectionTitle: string;
      fieldLabel: string;
      targetId: string;
      valueText: string;
    }> = [];

    const formatLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

    const recurse = (obj: any, tabId: string, tabLabel: string, path: string[]) => {
      if (!obj || typeof obj !== "object") return;
      Object.entries(obj).forEach(([key, val]) => {
        const currentPath = [...path, key];
        if (typeof val === "string") {
          if (val.startsWith("http://") || val.startsWith("https://")) return;
          const targetId = `${tabId}-${currentPath.join("-")}`;
          results.push({
            tabId,
            tabLabel,
            sectionTitle: formatLabel(path[0] || "Section"),
            fieldLabel: formatLabel(key),
            targetId,
            valueText: val
          });
        } else if (typeof val === "object") {
          recurse(val, tabId, tabLabel, currentPath);
        }
      });
    };

    PAGES.forEach((p) => {
      const pageData = siteContent[p.id] || defaultData[p.id];
      if (pageData) {
        recurse(pageData, p.id, p.label, []);
      }
    });

    return results;
  }, [siteContent]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableEntries
      .filter((item) =>
        item.valueText.toLowerCase().includes(q) ||
        item.fieldLabel.toLowerCase().includes(q) ||
        item.sectionTitle.toLowerCase().includes(q) ||
        item.tabLabel.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [searchQuery, searchableEntries]);

  const handleJumpToField = (tabId: string, targetId: string) => {
    setActiveTab(tabId);
    setSearchQuery("");
    setIsSearchFocused(false);

    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
        element.classList.add("ring-4", "ring-[#C19A6B]/50", "border-[#C19A6B]", "bg-amber-50/50");
        setTimeout(() => {
          element.classList.remove("ring-4", "ring-[#C19A6B]/50", "border-[#C19A6B]", "bg-amber-50/50");
        }, 2500);
      }
    }, 150);
  };

  const currentContent = siteContent[activeTab] || defaultData[activeTab];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] pt-16 text-center text-[#C19A6B] font-serif text-lg animate-pulse">
        Loading NR Enterprises Studio CMS...
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F7] min-h-screen pt-4 sm:pt-6 md:pt-8 pb-32 px-3 sm:px-6 md:px-8 lg:px-10 font-sans">
      <div className="max-w-[1180px] w-full mx-auto">

        {/* 🌟 0. TOP HEADER WITH EDIT LISTING / ADMIN NAVIGATION & STORAGE TOGGLE */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-sm border border-[#EAEAEB] shadow-xs">
          <div>
            <span className="text-[#C19A6B] uppercase tracking-[0.2em] font-bold text-[11px] block mb-0.5">
              NR Enterprises Atelier Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-serif text-[#3A332C]">
              Web Page Content Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 🌟 PERMANENT ACTIVE CLOUDFLARE R2 BADGE */}
            <div className="flex items-center gap-2.5 bg-[#F0FDF4] border border-[#BBF7D0] px-3.5 py-2 rounded-sm shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-[#14532D] leading-none">
                  ☁️ Cloudflare R2 Active
                </span>
                <span className="text-[9px] text-[#15803D] mt-0.5 leading-none">
                  Images to Cloudflare R2 • Text to Supabase
                </span>
              </div>
            </div>

            <Link
              href="/admin"
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#3A332C] text-[#F5F5F7] hover:bg-[#C19A6B] transition-colors rounded-sm shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>🏷️ Edit Listings / Products</span>
              <span className="text-xs">↗</span>
            </Link>
          </div>
        </div>

        {/* 🌟 1. INTERACTIVE LIVE SEARCH BAR */}
        <div ref={searchContainerRef} className="relative mb-6 z-40">
          <div className="relative flex items-center bg-white border border-[#DFD8CC] rounded-sm shadow-sm focus-within:border-[#C19A6B] focus-within:ring-2 focus-within:ring-[#C19A6B]/20 transition-all">
            <div className="pl-4 pr-2 text-[#8C7A63]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Quick Jump: Search any text, title, or section name across all pages..."
              className="w-full py-3.5 pr-10 text-sm bg-transparent outline-none text-[#3A332C] placeholder-[#8C7A63]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="pr-4 text-xs font-bold text-[#8C7A63] hover:text-[#3A332C]"
              >
                ✕
              </button>
            )}
          </div>

          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#DFD8CC] rounded-sm shadow-xl max-h-80 overflow-y-auto z-50 divide-y divide-[#EAEAEB]">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => handleJumpToField(item.tabId, item.targetId)}
                    className="p-3.5 hover:bg-[#F5F5F7] cursor-pointer transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#3A332C] text-[#F5F5F7] rounded-xs">
                          {item.tabLabel}
                        </span>
                        <span className="text-xs font-semibold text-[#C19A6B]">
                          {item.sectionTitle} → {item.fieldLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#3A332C] truncate font-medium">
                        "{item.valueText}"
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C7A63] shrink-0 mt-1">
                      Jump To Box ↗
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#7A7065]">
                  No matching text found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🌟 2. PAGE NAVIGATION TABS BAR */}
        <div className="bg-white p-4 border border-[#EAEAEB] rounded-sm shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A63] mr-2">
              Select Page:
            </span>
            {PAGES.map((page) => {
              const theme = PAGE_THEMES[page.id];
              const isActive = activeTab === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setActiveTab(page.id)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-sm transition-all cursor-pointer ${isActive
                      ? theme?.activeBg || "bg-[#3A332C] text-[#F5F5F7] shadow-sm"
                      : "bg-[#F5F5F7] text-[#6B6054] hover:bg-[#EAEAEB] hover:text-[#3A332C]"
                    }`}
                >
                  {page.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin"
              className="text-xs uppercase font-bold text-[#1C1917] hover:text-[#C19A6B] px-3.5 py-2 border border-[#DFD8CC] bg-[#FAFAFA] hover:bg-white rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>🏷️ Listings</span>
            </Link>
            <Link
              href={PAGES.find((p) => p.id === activeTab)?.livePath || "/"}
              target="_blank"
              className="text-xs uppercase font-bold text-[#8C7A63] hover:text-[#1C1917] px-3.5 py-2 border border-[#DFD8CC] rounded-xl bg-white shadow-2xs hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            >
              View Live ↗
            </Link>
            <button
              type="button"
              onClick={() => handlePublishAllCodeDefaults(true)}
              disabled={isSaving}
              className="bg-[#1B3624] text-white hover:bg-[#2e573c] transition-all px-4 py-2 text-xs uppercase font-bold tracking-wider rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              title="Publish all 5 pages directly from code files (lib/siteContent/)"
            >
              <span>⚡ Sync All From Code</span>
            </button>
            <button
              type="button"
              onClick={requestPublishAll}
              disabled={isSaving}
              className="border-2 border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white transition-all px-4 py-2 text-xs uppercase font-bold tracking-wider rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              title="Save and publish all 5 pages live to storefront"
            >
              <span>🚀 Publish All 5 Pages</span>
            </button>
            <button
              onClick={requestPublishCurrent}
              disabled={isSaving}
              className="bg-[#C19A6B] text-white hover:bg-[#1C1917] transition-all px-6 py-2 text-xs uppercase font-bold tracking-widest rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <span>💾</span>
              <span>{isSaving ? "Publishing..." : `Save & Publish ${PAGES.find((p) => p.id === activeTab)?.label || "Page"}`}</span>
            </button>
          </div>
        </div>

        {/* 🌟 CONFIRMATION MODAL (ENGLISH): Images to Cloudflare R2 & Text to Supabase */}
        <AnimatePresence>
          {confirmPublishModal?.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmPublishModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DFD8CC] shadow-2xl relative overflow-hidden"
              >
                {/* Header with decorative badge */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEB]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#DFD8CC] flex items-center justify-center text-lg">
                      🚀
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C19A6B] block">
                        NR Enterprises Atelier Studio
                      </span>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1C1917]">
                        Confirm & Publish
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmPublishModal(null)}
                    className="w-8 h-8 rounded-full text-[#8C7A63] hover:text-[#1C1917] hover:bg-[#F5F5F7] flex items-center justify-center transition-colors text-lg cursor-pointer"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {/* Scope target */}
                <p className="text-xs sm:text-sm text-[#7A7065] mt-4 leading-relaxed">
                  You are about to publish live changes for{" "}
                  <strong className="text-[#1C1917] font-bold">
                    {confirmPublishModal.targetPageName || "selected content"}
                  </strong>
                  . Please review the storage architecture below:
                </p>

                {/* Storage Architecture Breakdown */}
                <div className="space-y-3 my-5">
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                    <span className="text-2xl shrink-0 mt-0.5">☁️</span>
                    <div>
                      <strong className="block text-[#14532D] font-bold text-xs sm:text-sm mb-0.5">
                        Images → Cloudflare R2
                      </strong>
                      <p className="text-[11px] sm:text-xs text-[#15803D] leading-relaxed">
                        All media and product photos will be permanently stored in your <strong>Cloudflare R2 Bucket</strong> and delivered across the globe via high-speed Edge CDN.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF]">
                    <span className="text-2xl shrink-0 mt-0.5">🗄️</span>
                    <div>
                      <strong className="block text-[#581C87] font-bold text-xs sm:text-sm mb-0.5">
                        Text & Content → Supabase
                      </strong>
                      <p className="text-[11px] sm:text-xs text-[#6B21A8] leading-relaxed">
                        All headlines, descriptions, stories, and page text will be saved into <strong>Supabase PostgreSQL Database</strong> for instant, real-time live updates without redeploying code.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEAEB]">
                  <button
                    type="button"
                    onClick={() => setConfirmPublishModal(null)}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#7A7065] hover:text-[#1C1917] bg-[#FAFAFA] hover:bg-[#F2EFEB] rounded-xl border border-[#DFD8CC] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndPublish}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-[#C19A6B] hover:bg-[#1C1917] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>✔</span>
                    <span>Confirm & Publish</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {statusMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2">
            <span>✔</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* 🌟 3. ACTIVE TAB CONTENTS */}

        {/* --- TAB 1: HOME --- */}
        {activeTab === "home" && (
          <div className="space-y-10">
            <CodebasePublishBar
              pageId="home"
              pageName="Home"
              filePath="lib/siteContent/home.ts"
              onPublishToWebsite={handlePublishCodeDefaults}
              onSaveToCodebase={handleSaveAdminToCodebase}
              isSaving={isSaving}
              isSavingToCode={isSavingToCode}
            />

            {/* 🌟 1. HERO 5 SLIDES PC PICKER & MANAGER (REPLACES OLD COMPLEX FORM) */}
            <HeroSlidesManager
              onSaveCallback={(newSlides) => {
                setSiteContent((prev) => ({
                  ...prev,
                  home: {
                    ...(prev.home || {}),
                    heroSlides: newSlides,
                  },
                }));
              }}
            />

            {/* 🌟 Etsy Floating Button Config */}
            <div className="p-5 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-stone-50 border border-amber-200/80 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3A332C] flex items-center gap-2">
                  <span className="text-base">🛍️</span>
                  <span>Etsy Floating Button (Homepage Top Right)</span>
                </span>
                <label className="flex items-center gap-2 text-xs font-bold text-[#3A332C] cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={currentContent.etsy?.show !== false}
                    onChange={(e) => updateField("etsy", "show", e.target.checked)}
                    className="accent-[#4A1017] w-4 h-4 cursor-pointer"
                  />
                  <span>Show Etsy Button</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1">Button Text</label>
                  <input
                    type="text"
                    value={currentContent.etsy?.btnText || "Shop on Etsy"}
                    onChange={(e) => updateField("etsy", "btnText", e.target.value)}
                    className="w-full border border-amber-200/80 p-2.5 text-xs bg-white outline-none focus:border-[#4A1017] focus:ring-1 focus:ring-[#4A1017]/20 rounded-xl text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1">Etsy Shop URL</label>
                  <input
                    type="text"
                    value={currentContent.etsy?.url || "https://www.etsy.com/shop/AHADGLOBALRUGS"}
                    onChange={(e) => updateField("etsy", "url", e.target.value)}
                    className="w-full border border-amber-200/80 p-2.5 text-xs bg-white outline-none focus:border-[#4A1017] focus:ring-1 focus:ring-[#4A1017]/20 rounded-xl text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* 🌟 2. SECTION 1: NR ENTERPRISES COLLECTIONS (8 FROSTED GLASS CAPSULES) */}
            <div className="bg-white border border-[#EAEAEB] rounded-sm shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-violet-950 via-purple-950 to-slate-900 text-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-purple-300 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                      Frosted Glass Showcase
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5">
                      <span>2. Section 1: NR Enterprises Collections (8 Capsules)</span>
                    </h2>
                    <p className="text-xs text-purple-200/80 mt-1">
                      Manage the section header and the 8 featured collection capsules.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-purple-500/20 text-purple-200 border border-purple-400/30 rounded-full">
                    8 Capsules
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 space-y-6">
                {/* Header texts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.collectionsSection?.tag ?? "HANDCRAFTED WEAVES"}
                      onChange={(e) => updateField("collectionsSection", "tag", e.target.value)}
                      className="w-full border border-purple-200 p-2 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={currentContent.collectionsSection?.title ?? "NR Enterprises Collections"}
                      onChange={(e) => updateField("collectionsSection", "title", e.target.value)}
                      className="w-full border border-purple-200 p-2 text-xs bg-white outline-none focus:border-purple-600 font-serif rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={currentContent.collectionsSection?.desc ?? ""}
                    onChange={(e) => updateField("collectionsSection", "desc", e.target.value)}
                    className="w-full border border-purple-200 p-2 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={currentContent.collectionsSection?.ctaText ?? "VIEW ALL COLLECTIONS"}
                      onChange={(e) => updateField("collectionsSection", "ctaText", e.target.value)}
                      className="w-full border border-purple-200 p-2 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">CTA Button Link</label>
                    <input
                      type="text"
                      value={currentContent.collectionsSection?.ctaLink ?? "/collections"}
                      onChange={(e) => updateField("collectionsSection", "ctaLink", e.target.value)}
                      className="w-full border border-purple-200 p-2 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                    />
                  </div>
                </div>

                {/* 8 Categories Grid */}
                <div className="pt-4 border-t border-purple-100 space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-purple-950 flex items-center gap-2">
                    <span>✨</span>
                    <span>8 Category Capsule Cards</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories).map((cat: any, idx: number) => (
                      <div key={idx} className="p-4 border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/50 via-white to-white rounded-md space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-purple-200/80 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">
                            Capsule #{idx + 1}
                          </span>
                        </div>

                        {/* ⚡ Collection Visual Gallery Modal Picker */}
                        <CollectionProductPickerModal
                          currentProductId={cat.productId}
                          currentLink={cat.link}
                          currentImg={cat.img}
                          currentName={cat.title}
                          availableProducts={availableProducts}
                          accent="purple"
                          onSelectProduct={(selected) => {
                            const updated = [...(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories)];
                            updated[idx] = {
                              ...updated[idx],
                              productId: selected.productId,
                              img: selected.img || updated[idx].img,
                            };
                            setSiteContent((prev) => ({
                              ...prev,
                              home: {
                                ...prev.home,
                                collectionsSection: {
                                  ...prev.home?.collectionsSection,
                                  categories: updated,
                                },
                              },
                            }));
                          }}
                        />

                        <ImageUploader
                          label="Background Image (Or choose from gallery above)"
                          value={cat.img || ""}
                          recommendedSize="600 × 750 px (4:5 Portrait)"
                          onChange={(url) => {
                            const updated = [...(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories)];
                            updated[idx] = { ...updated[idx], img: url };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, collectionsSection: { ...prev.home?.collectionsSection, categories: updated } } }));
                          }}
                          onUpload={handleImageUpload}
                          isUploading={isUploading}
                        />
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-purple-900 mb-0.5">Title</label>
                          <input
                            type="text"
                            value={cat.title ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories)];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, collectionsSection: { ...prev.home?.collectionsSection, categories: updated } } }));
                            }}
                            className="w-full border border-purple-200 p-1.5 text-xs bg-white outline-none focus:border-purple-600 rounded-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-purple-900 mb-0.5">Tagline</label>
                          <input
                            type="text"
                            value={cat.tagline ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories)];
                              updated[idx] = { ...updated[idx], tagline: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, collectionsSection: { ...prev.home?.collectionsSection, categories: updated } } }));
                            }}
                            className="w-full border border-purple-200 p-1.5 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-purple-900 mb-0.5">Badge</label>
                            <input
                              type="text"
                              value={cat.badge ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories)];
                                updated[idx] = { ...updated[idx], badge: e.target.value };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, collectionsSection: { ...prev.home?.collectionsSection, categories: updated } } }));
                              }}
                              className="w-full border border-purple-200 p-1.5 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-purple-900 mb-0.5">Link</label>
                            <input
                              type="text"
                              value={cat.link ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.collectionsSection?.categories || defaultData.home.collectionsSection.categories)];
                                updated[idx] = { ...updated[idx], link: e.target.value };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, collectionsSection: { ...prev.home?.collectionsSection, categories: updated } } }));
                              }}
                              className="w-full border border-purple-200 p-1.5 text-xs bg-white outline-none focus:border-purple-600 rounded-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 2.5. SECTION: TUFTED RUGS (HIGH-FOCUS SHOWCASE) */}
            <div className="bg-white border border-[#EAEAEB] rounded-sm shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-emerald-300 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                      High Focus Showcase
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5">
                      <span>2.5. Section: Tufted Rugs (Primary Selling Focus)</span>
                    </h2>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      Manage the spotlight tufted section positioned between NR Enterprises Collections and Trending.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full">
                    {(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products).length} Featured Tufted Rugs
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.tuftedSection?.tag ?? "SIGNATURE HAND-TUFTED FOCUS"}
                      onChange={(e) => updateField("tuftedSection", "tag", e.target.value)}
                      className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={currentContent.tuftedSection?.title ?? "Tufted Rugs"}
                      onChange={(e) => updateField("tuftedSection", "title", e.target.value)}
                      className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 font-serif rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Description (Single Line)</label>
                  <textarea
                    rows={2}
                    value={currentContent.tuftedSection?.desc ?? ""}
                    onChange={(e) => updateField("tuftedSection", "desc", e.target.value)}
                    className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={currentContent.tuftedSection?.ctaText ?? "View All"}
                      onChange={(e) => updateField("tuftedSection", "ctaText", e.target.value)}
                      className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">CTA Button Link</label>
                    <input
                      type="text"
                      value={currentContent.tuftedSection?.ctaLink ?? "/collections?category=Tufted"}
                      onChange={(e) => updateField("tuftedSection", "ctaLink", e.target.value)}
                      className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                    />
                  </div>
                </div>

                {/* Tufted Products Grid with Add / Remove / Custom Badge */}
                <div className="pt-4 border-t border-emerald-100 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-950 flex items-center gap-2">
                      <span>✨</span>
                      <span>Tufted Rug Product Cards ({(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products).length} Items)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                        updated.push({
                          id: `tufted-${Date.now()}`,
                          name: "New Hand-Tufted Wool Rug",
                          badge: "-50% OFF",
                          rating: 5,
                          price: 4999,
                          originalPrice: 9999,
                          img: "/uploads/ai_rug_hand_tufted_v1.webp",
                          colors: ["#ECE5DD", "#D8C7B5"],
                          link: "/collections?category=Tufted",
                          tagline: "High-low sculpted pile in pure New Zealand wool",
                        });
                        setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                      }}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-950 text-white text-[11px] font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-xs transition-colors"
                    >
                      + Add New Tufted Rug
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products).map((prod: any, idx: number) => (
                      <div key={idx} className="p-4 border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/40 via-white to-white rounded-md space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                            Tufted Rug #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Tufted Rug #${idx + 1} ("${prod.name || 'Rug'}") ko delete karna chahte hain?`)) {
                                const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                                updated.splice(idx, 1);
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-800 font-bold px-2 py-0.5 hover:bg-red-50 rounded cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        </div>

                        {/* ⚡ Collection Visual Gallery Modal Picker */}
                        <CollectionProductPickerModal
                          currentProductId={prod.productId}
                          currentLink={prod.link}
                          currentImg={prod.img}
                          currentName={prod.name}
                          currentPrice={prod.price}
                          availableProducts={availableProducts}
                          accent="emerald"
                          onSelectProduct={(selected) => {
                            const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                            updated[idx] = {
                              ...updated[idx],
                              productId: selected.productId,
                              name: selected.name,
                              price: selected.price,
                              originalPrice: selected.originalPrice,
                              link: selected.link,
                              img: selected.img || updated[idx].img,
                              tagline: updated[idx].tagline || "Artisanal hand-tufted dense wool pile",
                            };
                            setSiteContent((prev) => ({
                              ...prev,
                              home: {
                                ...prev.home,
                                tuftedSection: {
                                  ...prev.home?.tuftedSection,
                                  products: updated,
                                },
                              },
                            }));
                          }}
                        />

                        {/* Thumbnail Image (Auto-filled or Custom Override) */}
                        <ImageUploader
                          label="Rug Photo (Listing photo or upload custom override)"
                          value={prod.img || ""}
                          recommendedSize="600 × 750 px (4:5 Portrait)"
                          onChange={(url) => {
                            const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                            updated[idx] = { ...updated[idx], img: url };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                          }}
                          onUpload={handleImageUpload}
                          isUploading={isUploading}
                        />

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Product Title</label>
                          <input
                            type="text"
                            value={prod.name ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                            }}
                            className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Tagline / Fiber Highlight</label>
                          <input
                            type="text"
                            value={prod.tagline ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                              updated[idx] = { ...updated[idx], tagline: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                            }}
                            className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">
                              Badge / Offer Text
                            </label>
                            <input
                              type="text"
                              value={prod.badge ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                                updated[idx] = { ...updated[idx], badge: e.target.value };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                              }}
                              placeholder="e.g. -50% OFF, BESTSELLER, NEW"
                              className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs font-semibold"
                            />
                            <span className="text-[8px] text-emerald-700 block mt-0.5">Apna manchaaha text likhein</span>
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Price (₹)</label>
                            <input
                              type="number"
                              value={prod.price ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                                updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                              }}
                              className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Original (₹)</label>
                            <input
                              type="number"
                              value={prod.originalPrice ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                                updated[idx] = { ...updated[idx], originalPrice: e.target.value ? Number(e.target.value) : null };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                              }}
                              className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs text-[#8C7A63]"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[9px] uppercase font-bold text-emerald-900">
                              Color Hex Codes (comma-separated)
                            </label>
                            {prod.colors && (
                              <div className="flex items-center gap-1">
                                {(Array.isArray(prod.colors) ? prod.colors : String(prod.colors).split(",").map((c: string) => c.trim()).filter(Boolean)).map((hex: string, ci: number) => (
                                  <span key={ci} className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: hex }} />
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={Array.isArray(prod.colors) ? prod.colors.join(", ") : (prod.colors || "")}
                            onChange={(e) => {
                              const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                              updated[idx] = {
                                ...updated[idx],
                                colors: e.target.value.split(",").map((c: string) => c.trim()).filter(Boolean),
                              };
                              setSiteContent((prev) => ({
                                ...prev,
                                home: {
                                  ...prev.home,
                                  tuftedSection: {
                                    ...prev.home?.tuftedSection,
                                    products: updated,
                                  },
                                },
                              }));
                            }}
                            placeholder="#121212, #EA6A2A, #F5F2EC"
                            className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Product Link (Homepage click target)</label>
                          <input
                            type="text"
                            value={prod.link ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.tuftedSection?.products || defaultData.home.tuftedSection.products)];
                              updated[idx] = { ...updated[idx], link: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, tuftedSection: { ...prev.home?.tuftedSection, products: updated } } }));
                            }}
                            placeholder="/product/[id] or /collections?category=Tufted"
                            className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 3. SECTION 2: TRENDING (MOST LOVED PIECES) */}
            <div className="bg-white border border-[#EAEAEB] rounded-sm shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-stone-900 text-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-amber-300 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                      Best Sellers Module
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5">
                      <span>3. Section 2: Trending (Most Loved Pieces)</span>
                    </h2>
                    <p className="text-xs text-amber-200/80 mt-1">
                      Manage the section header and the 5 trending product cards.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full">
                    {(currentContent.trendingSection?.products || defaultData.home.trendingSection.products).length} Featured Products
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.trendingSection?.tag ?? "MOST LOVED PIECES"}
                      onChange={(e) => updateField("trendingSection", "tag", e.target.value)}
                      className="w-full border border-amber-200 p-2 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={currentContent.trendingSection?.title ?? "Trending"}
                      onChange={(e) => updateField("trendingSection", "title", e.target.value)}
                      className="w-full border border-amber-200 p-2 text-xs bg-white outline-none focus:border-amber-600 font-serif rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={currentContent.trendingSection?.desc ?? ""}
                    onChange={(e) => updateField("trendingSection", "desc", e.target.value)}
                    className="w-full border border-amber-200 p-2 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                  />
                </div>

                {/* Trending Products Grid with Add / Remove / Custom Badge */}
                <div className="pt-4 border-t border-amber-100 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-950 flex items-center gap-2">
                      <span>🔥</span>
                      <span>Trending Product Cards ({(currentContent.trendingSection?.products || defaultData.home.trendingSection.products).length} Items)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                        updated.push({
                          id: `new-${Date.now()}`,
                          name: "New Trending Area Rug",
                          badge: "TRENDING",
                          rating: 5,
                          price: 4999,
                          originalPrice: 9999,
                          img: "/uploads/ai_rug_hand_tufted_v1.webp",
                          colors: ["#2B2B2B", "#C19A6B"],
                          link: "/collections",
                        });
                        setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                      }}
                      className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-xs transition-colors"
                    >
                      + Add New Trending Rug
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentContent.trendingSection?.products || defaultData.home.trendingSection.products).map((prod: any, idx: number) => (
                      <div key={idx} className="p-4 border-2 border-amber-200/90 bg-gradient-to-b from-amber-50/50 via-white to-white rounded-md space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                            Trending Product #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Trending Product #${idx + 1} ("${prod.name || 'Rug'}") ko delete karna chahte hain?`)) {
                                const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                                updated.splice(idx, 1);
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-800 font-bold px-2 py-0.5 hover:bg-red-50 rounded cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        </div>

                        {/* ⚡ Collection Visual Gallery Modal Picker */}
                        <CollectionProductPickerModal
                          currentProductId={prod.productId}
                          currentLink={prod.link}
                          currentImg={prod.img}
                          currentName={prod.name}
                          currentPrice={prod.price}
                          availableProducts={availableProducts}
                          accent="amber"
                          onSelectProduct={(selected) => {
                            const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                            updated[idx] = {
                              ...updated[idx],
                              productId: selected.productId,
                              name: selected.name,
                              price: selected.price,
                              originalPrice: selected.originalPrice,
                              link: selected.link,
                              img: selected.img || updated[idx].img,
                            };
                            setSiteContent((prev) => ({
                              ...prev,
                              home: {
                                ...prev.home,
                                trendingSection: {
                                  ...prev.home?.trendingSection,
                                  products: updated,
                                },
                              },
                            }));
                          }}
                        />

                        {/* Thumbnail Image (Auto-filled or Custom Override) */}
                        <ImageUploader
                          label="Product Photo (Listing photo or upload custom override)"
                          value={prod.img || ""}
                          recommendedSize="600 × 750 px (4:5 Portrait)"
                          onChange={(url) => {
                            const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                            updated[idx] = { ...updated[idx], img: url };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                          }}
                          onUpload={handleImageUpload}
                          isUploading={isUploading}
                        />
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">Product Title</label>
                          <input
                            type="text"
                            value={prod.name ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                            }}
                            className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs font-semibold"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">
                              Badge / Offer Text
                            </label>
                            <input
                              type="text"
                              value={prod.badge ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                                updated[idx] = { ...updated[idx], badge: e.target.value };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                              }}
                              placeholder="e.g. ARCHITECTURAL, -50% OFF, LIMITED"
                              className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs font-semibold"
                            />
                            <span className="text-[8px] text-amber-800 block mt-0.5">Apna manchaaha text likhein</span>
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">Price (₹)</label>
                            <input
                              type="number"
                              value={prod.price ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                                updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                              }}
                              className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">MRP (₹)</label>
                            <input
                              type="number"
                              value={prod.originalPrice ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                                updated[idx] = { ...updated[idx], originalPrice: e.target.value ? Number(e.target.value) : null };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                              }}
                              placeholder="Optional"
                              className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[9px] uppercase font-bold text-amber-900">
                              Color Hex Codes (comma-separated)
                            </label>
                            {prod.colors && (
                              <div className="flex items-center gap-1">
                                {(Array.isArray(prod.colors) ? prod.colors : String(prod.colors).split(",").map(c => c.trim()).filter(Boolean)).map((hex: string, ci: number) => (
                                  <span key={ci} className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: hex }} />
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={Array.isArray(prod.colors) ? prod.colors.join(", ") : (prod.colors || "")}
                            onChange={(e) => {
                              const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                              updated[idx] = { ...updated[idx], colors: e.target.value.split(",").map(c => c.trim()).filter(Boolean) };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                            }}
                            placeholder="#2D5A3C, #C19A6B, #826C99"
                            className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">Product Link (Homepage click target)</label>
                          <input
                            type="text"
                            value={prod.link ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.trendingSection?.products || defaultData.home.trendingSection.products)];
                              updated[idx] = { ...updated[idx], link: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, trendingSection: { ...prev.home?.trendingSection, products: updated } } }));
                            }}
                            placeholder="/product/[id] or /collections"
                            className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 4. SECTION 3: COLLECTIONS BY COLOR (FIND YOUR SHADE) */}
            <div className="bg-white border border-[#EAEAEB] rounded-sm shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-rose-950 via-pink-950 to-slate-900 text-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-rose-300 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                      Color Wheel Palette
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5">
                      <span>4. Section 3: Collections by Color (Find Your Shade)</span>
                    </h2>
                    <p className="text-xs text-rose-200/80 mt-1">
                      Manage color disks, filter codes, and section titles.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full">
                    8 Color Disks
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.colorSection?.tag ?? "FIND YOUR SHADE"}
                      onChange={(e) => updateField("colorSection", "tag", e.target.value)}
                      className="w-full border border-rose-200 p-2 text-xs bg-white outline-none focus:border-rose-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={currentContent.colorSection?.title ?? "Collections by Color"}
                      onChange={(e) => updateField("colorSection", "title", e.target.value)}
                      className="w-full border border-rose-200 p-2 text-xs bg-white outline-none focus:border-rose-600 font-serif rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={currentContent.colorSection?.desc ?? ""}
                    onChange={(e) => updateField("colorSection", "desc", e.target.value)}
                    className="w-full border border-rose-200 p-2 text-xs bg-white outline-none focus:border-rose-600 rounded-xs"
                  />
                </div>

                {/* 8 Color Swatches Grid */}
                <div className="pt-4 border-t border-rose-100 space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-rose-950 flex items-center gap-2">
                    <span>🎨</span>
                    <span>8 Color Swatch Disks</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(currentContent.colorSection?.swatches || defaultData.home.colorSection.swatches).map((swatch: any, idx: number) => (
                      <div key={idx} className="p-3.5 border-2 border-rose-200/90 bg-gradient-to-b from-rose-50/40 via-white to-white rounded-md space-y-2.5 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          {/* Live 3D Texture Sphere Preview */}
                          <div className="w-10 h-10 rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden relative">
                            <CarpetSphere hex={swatch.hex || "#C19A6B"} code={swatch.code} name={swatch.name} />
                          </div>
                          <input
                            type="color"
                            value={swatch.hex || "#C19A6B"}
                            onChange={(e) => {
                              const updated = [...(currentContent.colorSection?.swatches || defaultData.home.colorSection.swatches)];
                              updated[idx] = { ...updated[idx], hex: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, colorSection: { ...prev.home?.colorSection, swatches: updated } } }));
                            }}
                            className="w-8 h-8 rounded-full border border-black/20 cursor-pointer shrink-0 shadow-xs"
                            title="Pick Color"
                          />
                          <input
                            type="text"
                            value={swatch.name ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.colorSection?.swatches || defaultData.home.colorSection.swatches)];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, colorSection: { ...prev.home?.colorSection, swatches: updated } } }));
                            }}
                            placeholder="Color Name"
                            className="w-full border border-rose-200 p-1 text-xs bg-white outline-none focus:border-rose-600 font-semibold rounded-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={swatch.code ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.colorSection?.swatches || defaultData.home.colorSection.swatches)];
                              updated[idx] = { ...updated[idx], code: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, colorSection: { ...prev.home?.colorSection, swatches: updated } } }));
                            }}
                            placeholder="Filter code"
                            className="w-full border border-rose-200 p-1 text-[11px] bg-white outline-none focus:border-rose-600 rounded-xs"
                          />
                          <input
                            type="text"
                            value={swatch.hex ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.colorSection?.swatches || defaultData.home.colorSection.swatches)];
                              updated[idx] = { ...updated[idx], hex: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, colorSection: { ...prev.home?.colorSection, swatches: updated } } }));
                            }}
                            placeholder="#Hex"
                            className="w-full border border-rose-200 p-1 text-[11px] bg-white outline-none focus:border-rose-600 font-mono rounded-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 5. SECTION 4: MODERN HOMES (SPATIAL LIVING / ROOMS) */}
            <div className="bg-white border border-[#EAEAEB] rounded-sm shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 text-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-teal-300 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                      Spatial Layouts
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5">
                      <span>5. Section 4: Modern Homes (Shop by Room)</span>
                    </h2>
                    <p className="text-xs text-teal-200/80 mt-1">
                      Manage spatial living scenes and the 4 room cards.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-teal-500/20 text-teal-200 border border-teal-400/30 rounded-full">
                    4 Room Spaces
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.roomsSection?.tag ?? "SPATIAL LIVING"}
                      onChange={(e) => updateField("roomsSection", "tag", e.target.value)}
                      className="w-full border border-teal-200 p-2 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={currentContent.roomsSection?.title ?? "Modern Homes"}
                      onChange={(e) => updateField("roomsSection", "title", e.target.value)}
                      className="w-full border border-teal-200 p-2 text-xs bg-white outline-none focus:border-teal-600 font-serif rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={currentContent.roomsSection?.desc ?? ""}
                    onChange={(e) => updateField("roomsSection", "desc", e.target.value)}
                    className="w-full border border-teal-200 p-2 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                  />
                </div>

                {/* 4 Room Cards Grid */}
                <div className="pt-4 border-t border-teal-100 space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-teal-950 flex items-center gap-2">
                    <span>🛋️</span>
                    <span>4 Room Scene Cards</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms).map((room: any, idx: number) => (
                      <div key={idx} className="p-4 border-2 border-teal-200/90 bg-gradient-to-b from-teal-50/50 via-white to-white rounded-md space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-teal-200/80 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-full">
                            Room #{idx + 1}
                          </span>
                        </div>

                        {/* ⚡ Collection Visual Gallery Modal Picker */}
                        <CollectionProductPickerModal
                          currentProductId={room.productId}
                          currentLink={room.link}
                          currentImg={room.img}
                          currentName={room.name}
                          availableProducts={availableProducts}
                          accent="teal"
                          onSelectProduct={(selected) => {
                            const updated = [...(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms)];
                            updated[idx] = {
                              ...updated[idx],
                              productId: selected.productId,
                              img: selected.img || updated[idx].img,
                            };
                            setSiteContent((prev) => ({
                              ...prev,
                              home: {
                                ...prev.home,
                                roomsSection: {
                                  ...prev.home?.roomsSection,
                                  rooms: updated,
                                },
                              },
                            }));
                          }}
                        />

                        <ImageUploader
                          label="Room Scene Photo (Or choose from gallery above)"
                          value={room.img || ""}
                          recommendedSize="600 × 800 px (3:4 Portrait)"
                          onChange={(url) => {
                            const updated = [...(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms)];
                            updated[idx] = { ...updated[idx], img: url };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, roomsSection: { ...prev.home?.roomsSection, rooms: updated } } }));
                          }}
                          onUpload={handleImageUpload}
                          isUploading={isUploading}
                        />
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Room Name</label>
                          <input
                            type="text"
                            value={room.name ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms)];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, roomsSection: { ...prev.home?.roomsSection, rooms: updated } } }));
                            }}
                            className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Styles Count Badge</label>
                          <input
                            type="text"
                            value={room.stylesCount ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms)];
                              updated[idx] = { ...updated[idx], stylesCount: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, roomsSection: { ...prev.home?.roomsSection, rooms: updated } } }));
                            }}
                            placeholder="e.g. 92 Designs"
                            className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Tagline / Description</label>
                          <input
                            type="text"
                            value={room.tagline ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms)];
                              updated[idx] = { ...updated[idx], tagline: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, roomsSection: { ...prev.home?.roomsSection, rooms: updated } } }));
                            }}
                            className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Link</label>
                          <input
                            type="text"
                            value={room.link ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.roomsSection?.rooms || defaultData.home.roomsSection.rooms)];
                              updated[idx] = { ...updated[idx], link: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, roomsSection: { ...prev.home?.roomsSection, rooms: updated } } }));
                            }}
                            className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 6. SECTION 5: MATERIALS GLANCE (JUTE & ORGANIC WEAVES) */}
            <div className="bg-white border border-[#EAEAEB] rounded-sm shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-green-950 to-teal-950 text-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-emerald-300 uppercase tracking-[0.2em] font-bold text-[10px] block mb-1">
                      Sustainable Fibers
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5">
                      <span>6. Section 5: Materials Glance (Organic Fibers)</span>
                    </h2>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      Manage natural fibers, jute collections, and the 5 material product cards.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full">
                    5 Organic Items
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.materialsSection?.tag ?? "ORGANIC FIBERS"}
                      onChange={(e) => updateField("materialsSection", "tag", e.target.value)}
                      className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={currentContent.materialsSection?.title ?? "Materials Glance"}
                      onChange={(e) => updateField("materialsSection", "title", e.target.value)}
                      className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 font-serif rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={currentContent.materialsSection?.desc ?? ""}
                    onChange={(e) => updateField("materialsSection", "desc", e.target.value)}
                    className="w-full border border-emerald-200 p-2 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                  />
                </div>

                {/* 5 Material Products Grid */}
                <div className="pt-4 border-t border-emerald-100 space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-950 flex items-center gap-2">
                    <span>🌿</span>
                    <span>5 Material Product Cards</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentContent.materialsSection?.products || defaultData.home.materialsSection.products).map((item: any, idx: number) => (
                      <div key={idx} className="p-4 border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 via-white to-white rounded-md shadow-2xs space-y-3 transition-all hover:border-emerald-300">
                        <div className="flex items-center justify-between pb-1 border-b border-emerald-100">
                          <span className="text-xs font-bold font-serif text-emerald-950">Item #{idx + 1}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Material</span>
                        </div>

                        {/* ⚡ Collection Visual Gallery Modal Picker */}
                        <CollectionProductPickerModal
                          currentProductId={item.productId}
                          currentLink={item.link}
                          currentImg={item.img}
                          currentName={item.name}
                          availableProducts={availableProducts}
                          accent="emerald"
                          onSelectProduct={(selected) => {
                            const updated = [...(currentContent.materialsSection?.products || defaultData.home.materialsSection.products)];
                            updated[idx] = {
                              ...updated[idx],
                              productId: selected.productId,
                              name: selected.name,
                              link: selected.link,
                              img: selected.img || updated[idx].img,
                            };
                            setSiteContent((prev) => ({
                              ...prev,
                              home: {
                                ...prev.home,
                                materialsSection: {
                                  ...prev.home?.materialsSection,
                                  products: updated,
                                },
                              },
                            }));
                          }}
                        />

                        <ImageUploader
                          label="Product Photo (Or choose from gallery above)"
                          value={item.img || ""}
                          recommendedSize="600 × 750 px (4:5 Portrait)"
                          onChange={(url) => {
                            const updated = [...(currentContent.materialsSection?.products || defaultData.home.materialsSection.products)];
                            updated[idx] = { ...updated[idx], img: url };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, materialsSection: { ...prev.home?.materialsSection, products: updated } } }));
                          }}
                          onUpload={handleImageUpload}
                          isUploading={isUploading}
                        />
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Product Title</label>
                          <input
                            type="text"
                            value={item.name ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.materialsSection?.products || defaultData.home.materialsSection.products)];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, materialsSection: { ...prev.home?.materialsSection, products: updated } } }));
                            }}
                            className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Badge / Tag (Optional)</label>
                            <input
                              type="text"
                              value={item.badge ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.materialsSection?.products || defaultData.home.materialsSection.products)];
                                updated[idx] = { ...updated[idx], badge: e.target.value };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, materialsSection: { ...prev.home?.materialsSection, products: updated } } }));
                              }}
                              placeholder="e.g. 100% Organic, Jute"
                              className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-emerald-900 mb-0.5">Link</label>
                            <input
                              type="text"
                              value={item.link ?? ""}
                              onChange={(e) => {
                                const updated = [...(currentContent.materialsSection?.products || defaultData.home.materialsSection.products)];
                                updated[idx] = { ...updated[idx], link: e.target.value };
                                setSiteContent((prev) => ({ ...prev, home: { ...prev.home, materialsSection: { ...prev.home?.materialsSection, products: updated } } }));
                              }}
                              className="w-full border border-emerald-200 p-1.5 text-xs bg-white outline-none focus:border-emerald-600 rounded-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 7. SECTION 6: Our Story (EXCLUSIVE CARPETS) */}
            <div className="bg-white p-6 sm:p-8 border-2 border-amber-200/80 rounded-xl shadow-xs space-y-6">
              <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8 rounded-t-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-amber-500/40 shadow-inner">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-200 border border-amber-400/30">
                      Heritage & Masterpieces
                    </span>
                    <span className="text-xs text-amber-200/70 font-mono">Module 06</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide mt-1">
                    7. Section 6: Premium Carpets (Atelier Masterpieces)
                  </h2>
                  <p className="text-xs text-amber-100/70 mt-1 max-w-xl">
                    Manage the heritage showcase header and 4 exclusive high-density masterpieces.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-amber-100 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>4 Masterpieces</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-amber-900 mb-1">Section Tag</label>
                  <input
                    type="text"
                    value={currentContent.legacySection?.tag ?? "ATELIER MASTERPIECES"}
                    onChange={(e) => updateField("legacySection", "tag", e.target.value)}
                    className="w-full border border-amber-200 p-2 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-amber-900 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={currentContent.legacySection?.title ?? "Premium Carpets"}
                    onChange={(e) => updateField("legacySection", "title", e.target.value)}
                    className="w-full border border-amber-200 p-2 text-xs bg-white outline-none focus:border-amber-600 font-serif rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-amber-900 mb-1">Section Description</label>
                <textarea
                  rows={2}
                  value={currentContent.legacySection?.desc ?? ""}
                  onChange={(e) => updateField("legacySection", "desc", e.target.value)}
                  className="w-full border border-amber-200 p-2 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                />
              </div>

              {/* 4 Legacy Products Grid */}
              <div className="pt-4 border-t border-amber-100 space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-950 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>4 Atelier Masterpiece Cards</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(currentContent.legacySection?.products || defaultData.home.legacySection.products).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 border-2 border-amber-200/90 bg-gradient-to-b from-amber-50/50 via-white to-white rounded-md shadow-2xs space-y-3 transition-all hover:border-amber-300">
                      <div className="flex items-center justify-between pb-1 border-b border-amber-100">
                        <span className="text-xs font-bold font-serif text-amber-950">Piece #{idx + 1}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Atelier</span>
                      </div>

                      {/* ⚡ Collection Visual Gallery Modal Picker */}
                      <CollectionProductPickerModal
                        currentProductId={item.productId}
                        currentLink={item.link}
                        currentImg={item.img}
                        currentName={item.name}
                        currentPrice={item.price}
                        availableProducts={availableProducts}
                        accent="amber"
                        onSelectProduct={(selected) => {
                          const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                          updated[idx] = {
                            ...updated[idx],
                            productId: selected.productId,
                            name: selected.name,
                            price: selected.price,
                            originalPrice: selected.originalPrice,
                            link: selected.link,
                            img: selected.img || updated[idx].img,
                            badge: updated[idx].badge || "ATELIER",
                          };
                          setSiteContent((prev) => ({
                            ...prev,
                            home: {
                              ...prev.home,
                              legacySection: {
                                ...prev.home?.legacySection,
                                products: updated,
                              },
                            },
                          }));
                        }}
                      />

                      {/* Thumbnail Image (Auto-filled or Custom Override) */}
                      <ImageUploader
                        label="Masterpiece Photo (Listing photo or upload custom override)"
                        value={item.img || ""}
                        recommendedSize="600 × 750 px (4:5 Portrait)"
                        onChange={(url) => {
                          const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                          updated[idx] = { ...updated[idx], img: url };
                          setSiteContent((prev) => ({ ...prev, home: { ...prev.home, legacySection: { ...prev.home?.legacySection, products: updated } } }));
                        }}
                        onUpload={handleImageUpload}
                        isUploading={isUploading}
                      />
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">Product Title</label>
                        <input
                          type="text"
                          value={item.name ?? ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, legacySection: { ...prev.home?.legacySection, products: updated } } }));
                          }}
                          className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">
                          Badge / Offer Text
                        </label>
                        <input
                          type="text"
                          value={item.badge ?? ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                            updated[idx] = { ...updated[idx], badge: e.target.value };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, legacySection: { ...prev.home?.legacySection, products: updated } } }));
                          }}
                          placeholder="e.g. ATELIER, HEIRLOOM, EXCLUSIVE"
                          className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">Price (₹)</label>
                          <input
                            type="number"
                            value={item.price ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                              updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, legacySection: { ...prev.home?.legacySection, products: updated } } }));
                            }}
                            className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">MRP (₹)</label>
                          <input
                            type="number"
                            value={item.originalPrice ?? ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                              updated[idx] = { ...updated[idx], originalPrice: e.target.value ? Number(e.target.value) : null };
                              setSiteContent((prev) => ({ ...prev, home: { ...prev.home, legacySection: { ...prev.home?.legacySection, products: updated } } }));
                            }}
                            placeholder="Optional"
                            className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[9px] uppercase font-bold text-amber-900">
                            Color Hex Codes (comma-separated)
                          </label>
                          {item.colors && (
                            <div className="flex items-center gap-1">
                              {(Array.isArray(item.colors) ? item.colors : String(item.colors).split(",").map(c => c.trim()).filter(Boolean)).map((hex: string, ci: number) => (
                                <span key={ci} className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: hex }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={Array.isArray(item.colors) ? item.colors.join(", ") : (item.colors || "")}
                          onChange={(e) => {
                            const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                            updated[idx] = {
                              ...updated[idx],
                              colors: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                            };
                            setSiteContent((prev) => ({
                              ...prev,
                              home: {
                                ...prev.home,
                                legacySection: {
                                  ...prev.home?.legacySection,
                                  products: updated,
                                },
                              },
                            }));
                          }}
                          placeholder="#C19A6B, #2B2520, #EFE8DD"
                          className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-amber-900 mb-0.5">Product Link (Homepage click target)</label>
                        <input
                          type="text"
                          value={item.link ?? ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.legacySection?.products || defaultData.home.legacySection.products)];
                            updated[idx] = { ...updated[idx], link: e.target.value };
                            setSiteContent((prev) => ({ ...prev, home: { ...prev.home, legacySection: { ...prev.home?.legacySection, products: updated } } }));
                          }}
                          placeholder="/product/[id] or /collections?category=Irregular"
                          className="w-full border border-amber-200 p-1.5 text-xs bg-white outline-none focus:border-amber-600 rounded-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 🌟 8. SECTION 7: PRE-FOOTER CONCIERGE BAR */}
            <div className="bg-white p-6 sm:p-8 border-2 border-teal-200/80 rounded-xl shadow-xs space-y-6">
              <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8 rounded-t-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-teal-500/40 shadow-inner">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-200 border border-teal-400/30">
                      Customer Experience & Support
                    </span>
                    <span className="text-xs text-teal-200/70 font-mono">Module 07</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide mt-1">
                    8. Section 7: Pre-Footer Concierge Bar
                  </h2>
                  <p className="text-xs text-teal-100/70 mt-1 max-w-xl">
                    Manage the 3 concierge features, artisan desk info, and Quick Inquire direct contact.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-teal-100 text-xs">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Direct Concierge</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-teal-200/80 bg-gradient-to-b from-teal-50/50 via-white to-white rounded-md shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-teal-100">
                    <span className="text-xs font-bold font-serif text-teal-950">Feature #1</span>
                    <span className="text-[9px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Sizing</span>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={currentContent.concierge?.feature1Title ?? "Free Custom Sizing"}
                      onChange={(e) => updateField("concierge", "feature1Title", e.target.value)}
                      className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Description</label>
                    <input
                      type="text"
                      value={currentContent.concierge?.feature1Desc ?? "Custom shapes, colors & pile height"}
                      onChange={(e) => updateField("concierge", "feature1Desc", e.target.value)}
                      className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                </div>

                <div className="p-4 border-2 border-teal-200/80 bg-gradient-to-b from-teal-50/50 via-white to-white rounded-md shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-teal-100">
                    <span className="text-xs font-bold font-serif text-teal-950">Feature #2</span>
                    <span className="text-[9px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Shipping</span>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={currentContent.concierge?.feature2Title ?? "Pan India & Global Shipping"}
                      onChange={(e) => updateField("concierge", "feature2Title", e.target.value)}
                      className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Description</label>
                    <input
                      type="text"
                      value={currentContent.concierge?.feature2Desc ?? "Tracked white-glove doorstep delivery"}
                      onChange={(e) => updateField("concierge", "feature2Desc", e.target.value)}
                      className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                </div>

                <div className="p-4 border-2 border-teal-200/80 bg-gradient-to-b from-teal-50/50 via-white to-white rounded-md shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-teal-100">
                    <span className="text-xs font-bold font-serif text-teal-950">Feature #3 & Phone</span>
                    <span className="text-[9px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Direct Line</span>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={currentContent.concierge?.feature3Title ?? "Atelier Concierge Desk"}
                      onChange={(e) => updateField("concierge", "feature3Title", e.target.value)}
                      className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-teal-900 mb-0.5">Subtitle / Desk Note</label>
                    <input
                      type="text"
                      value={currentContent.concierge?.feature3Desc ?? "Quick email & custom support"}
                      onChange={(e) => updateField("concierge", "feature3Desc", e.target.value)}
                      className="w-full border border-teal-200 p-1.5 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-2 border-teal-200/80 bg-gradient-to-r from-teal-50/60 via-emerald-50/40 to-teal-50/60 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                    <span>⚡ Quick Inquire Concierge Desk</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Active (Floating Drawer & Instant Inquire on Products)"
                    className="w-full border border-teal-200 p-2 text-xs bg-teal-50/80 text-teal-800 outline-none rounded-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                    <span>✉️ Concierge Email (Incoming Alerts)</span>
                  </label>
                  <input
                    type="text"
                    value={currentContent.concierge?.email ?? "nrenterprises@gmail.com"}
                    onChange={(e) => updateField("concierge", "email", e.target.value)}
                    className="w-full border border-teal-200 p-2 text-xs bg-white outline-none focus:border-teal-600 rounded-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: COLLECTIONS --- */}
        {activeTab === "collections" && (
          <div className="space-y-10">
            <CodebasePublishBar
              pageId="collections"
              pageName="Collections"
              filePath="lib/siteContent/collections.ts"
              onPublishToWebsite={handlePublishCodeDefaults}
              onSaveToCodebase={handleSaveAdminToCodebase}
              isSaving={isSaving}
              isSavingToCode={isSavingToCode}
            />

            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                    Catalog Hero
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif text-white">Collections Page Header</h2>
                  <p className="text-xs text-stone-300 mt-1">Leave background image blank to keep standard light ambient header.</p>
                </div>
                {currentContent.hero?.bgImage && (
                  <button
                    type="button"
                    onClick={() => updateField("hero", "bgImage", "")}
                    className="text-xs text-red-200 hover:text-white bg-red-950/60 hover:bg-red-800 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/40 cursor-pointer w-fit shadow-xs"
                  >
                    ✕ Remove Image
                  </button>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Tagline</label>
                  <input
                    id="collections-hero-tag"
                    type="text"
                    value={currentContent.hero?.tag || ""}
                    onChange={(e) => updateField("hero", "tag", e.target.value)}
                    placeholder="e.g. THE"
                    className="w-full border border-[#DFD8CC] p-3 text-sm outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B]/30 rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Main Heading</label>
                  <input
                    id="collections-hero-title"
                    type="text"
                    value={currentContent.hero?.title || ""}
                    onChange={(e) => updateField("hero", "title", e.target.value)}
                    placeholder="e.g. Artisanal Floor Sculptures"
                    className="w-full border border-[#DFD8CC] p-3 text-sm outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B]/30 font-serif rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Subtitle / Description</label>
                  <textarea
                    id="collections-hero-description"
                    rows={3}
                    value={currentContent.hero?.description || ""}
                    onChange={(e) => updateField("hero", "description", e.target.value)}
                    placeholder="Browse our hand-braided rPET area rugs..."
                    className="w-full border border-[#DFD8CC] p-3 text-sm outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B]/30 rounded-lg transition-all"
                  />
                </div>

                <div className="pt-2">
                  <ImageUploader
                    label="Header Background Image (Optional)"
                    value={currentContent.hero?.bgImage || ""}
                    recommendedSize="1920 × 600 px (Wide Panoramic Header)"
                    onChange={(url) => updateField("hero", "bgImage", url)}
                    onUpload={handleImageUpload}
                    isUploading={isUploading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: Our Story --- */}
        {activeTab === "legacy" && (
          <div className="space-y-10">
            <CodebasePublishBar
              pageId="legacy"
              pageName="Our Story"
              filePath="lib/siteContent/legacy.ts"
              onPublishToWebsite={handlePublishCodeDefaults}
              onSaveToCodebase={handleSaveAdminToCodebase}
              isSaving={isSaving}
              isSavingToCode={isSavingToCode}
            />

            {/* 1. Cinematic Hero Section */}
            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Heritage Story
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">1. Cinematic Hero Section</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Title</label>
                    <input
                      id="legacy-hero-title"
                      type="text"
                      value={currentContent.hero?.title || ""}
                      onChange={(e) => updateField("hero", "title", e.target.value)}
                      placeholder="Bhadohi Heritage."
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Subtitle</label>
                    <input
                      id="legacy-hero-subtitle"
                      type="text"
                      value={currentContent.hero?.subtitle || ""}
                      onChange={(e) => updateField("hero", "subtitle", e.target.value)}
                      placeholder="Four Centuries of Weaving Mastery, Direct to Modern Sanctuaries."
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                </div>

                <ImageUploader
                  label="Hero Background Image"
                  value={currentContent.hero?.bgImage || ""}
                  recommendedSize="1920 × 1080 px (16:9 Cinematic Hero)"
                  onChange={(url) => updateField("hero", "bgImage", url)}
                  onUpload={handleImageUpload}
                  isUploading={isUploading}
                />

                {/* 4 Hero Stat Badges */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-3">
                    4 Hero Stat Badges (Floating on Hero)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(currentContent.hero?.stats || defaultData.legacy.hero.stats).map((stat: any, idx: number) => (
                      <div key={idx} className="border border-[#E5DDD2] p-3.5 bg-[#FAFAFA] rounded-xl space-y-2.5 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C19A6B] block">
                          Badge #{idx + 1}
                        </span>
                        <div>
                          <label className="block text-[9.5px] uppercase font-bold text-[#8C7A63] mb-1">Value</label>
                          <input
                            type="text"
                            value={stat.value || ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.hero?.stats || defaultData.legacy.hero.stats)];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              setSiteContent((prev: any) => ({
                                ...prev,
                                legacy: { ...prev.legacy, hero: { ...prev.legacy?.hero, stats: updated } },
                              }));
                            }}
                            className="w-full border border-[#DFD8CC] p-1.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-md font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9.5px] uppercase font-bold text-[#8C7A63] mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label || ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.hero?.stats || defaultData.legacy.hero.stats)];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              setSiteContent((prev: any) => ({
                                ...prev,
                                legacy: { ...prev.legacy, hero: { ...prev.legacy?.hero, stats: updated } },
                              }));
                            }}
                            className="w-full border border-[#DFD8CC] p-1.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Editorial Quote & Atelier Manifesto */}
            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Philosophy
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">2. The Atelier Manifesto</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Section Tag</label>
                  <input
                    id="legacy-intro-tag"
                    type="text"
                    value={currentContent.intro?.tag || ""}
                    onChange={(e) => updateField("intro", "tag", e.target.value)}
                    placeholder="THE ATELIER MANIFESTO"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Main Quote</label>
                  <textarea
                    id="legacy-intro-quote"
                    rows={3}
                    value={currentContent.intro?.quote || ""}
                    onChange={(e) => updateField("intro", "quote", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Detailed Paragraph</label>
                  <textarea
                    id="legacy-intro-description"
                    rows={4}
                    value={currentContent.intro?.description || ""}
                    onChange={(e) => updateField("intro", "description", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. The 4 Stages of Craftsmanship ("How a NR Enterprises Carpet is Born") */}
            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Artisanal Steps
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">3. How a NR Enterprises Carpet is Born (4 Stages)</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.craftsmanship?.tag || ""}
                      onChange={(e) => updateField("craftsmanship", "tag", e.target.value)}
                      placeholder="METICULOUS DISCIPLINE"
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Heading</label>
                    <input
                      type="text"
                      value={currentContent.craftsmanship?.title || ""}
                      onChange={(e) => updateField("craftsmanship", "title", e.target.value)}
                      placeholder="How a NR Enterprises Carpet is Born"
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={currentContent.craftsmanship?.subtitle || ""}
                      onChange={(e) => updateField("craftsmanship", "subtitle", e.target.value)}
                      placeholder="From natural raw fleeces to hand-carved sculptural reliefs..."
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {(currentContent.craftsmanship?.stages || defaultData.legacy.craftsmanship.stages).map((stage: any, idx: number) => (
                    <div key={idx} className="border-2 border-[#E5DDD2] p-5 bg-[#FAFAFA] rounded-xl space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD2]">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#3A332C]">
                          Stage {stage.step || `0${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-bold bg-[#C19A6B] text-white px-2.5 py-0.5 rounded-full">
                          Step #{idx + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Step Number</label>
                          <input
                            type="text"
                            value={stage.step || ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.craftsmanship?.stages || defaultData.legacy.craftsmanship.stages)];
                              updated[idx] = { ...updated[idx], step: e.target.value };
                              setSiteContent((prev: any) => ({
                                ...prev,
                                legacy: { ...prev.legacy, craftsmanship: { ...prev.legacy?.craftsmanship, stages: updated } },
                              }));
                            }}
                            className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Stage Title</label>
                          <input
                            type="text"
                            value={stage.title || ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.craftsmanship?.stages || defaultData.legacy.craftsmanship.stages)];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setSiteContent((prev: any) => ({
                                ...prev,
                                legacy: { ...prev.legacy, craftsmanship: { ...prev.legacy?.craftsmanship, stages: updated } },
                              }));
                            }}
                            className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg font-serif"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={stage.desc || ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.craftsmanship?.stages || defaultData.legacy.craftsmanship.stages)];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setSiteContent((prev: any) => ({
                              ...prev,
                              legacy: { ...prev.legacy, craftsmanship: { ...prev.legacy?.craftsmanship, stages: updated } },
                            }));
                          }}
                          className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg"
                        />
                      </div>
                      <ImageUploader
                        label={`Stage ${idx + 1} Image`}
                        value={stage.img || ""}
                        recommendedSize="800 × 600 px (4:3 Artisan Step)"
                        onChange={(url) => {
                          const updated = [...(currentContent.craftsmanship?.stages || defaultData.legacy.craftsmanship.stages)];
                          updated[idx] = { ...updated[idx], img: url };
                          setSiteContent((prev: any) => ({
                            ...prev,
                            legacy: { ...prev.legacy, craftsmanship: { ...prev.legacy?.craftsmanship, stages: updated } },
                          }));
                        }}
                        onUpload={handleImageUpload}
                        isUploading={isUploading}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. The 4 Weaving Disciplines */}
            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Weaving Techniques
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">4. Our Four Weaving Disciplines</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.disciplines?.tag || ""}
                      onChange={(e) => updateField("disciplines", "tag", e.target.value)}
                      placeholder="TAILORED WEAVE MASTERY"
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Heading</label>
                    <input
                      type="text"
                      value={currentContent.disciplines?.title || ""}
                      onChange={(e) => updateField("disciplines", "title", e.target.value)}
                      placeholder="Our Four Weaving Disciplines"
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={currentContent.disciplines?.subtitle || ""}
                      onChange={(e) => updateField("disciplines", "subtitle", e.target.value)}
                      placeholder="Each space commands a distinct texture..."
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {(currentContent.disciplines?.items || defaultData.legacy.disciplines.items).map((item: any, idx: number) => (
                    <div key={idx} className="border-2 border-[#E5DDD2] p-5 bg-[#FAFAFA] rounded-xl space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD2]">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#3A332C]">
                          Discipline #{idx + 1}
                        </span>
                        <span className="text-[10px] font-bold bg-[#1C1917] text-[#DFC8A4] px-2.5 py-0.5 rounded-full">
                          {item.badge || "Signature"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Title</label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.disciplines?.items || defaultData.legacy.disciplines.items)];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setSiteContent((prev: any) => ({
                                ...prev,
                                legacy: { ...prev.legacy, disciplines: { ...prev.legacy?.disciplines, items: updated } },
                              }));
                            }}
                            className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg font-serif"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Badge</label>
                          <input
                            type="text"
                            value={item.badge || ""}
                            onChange={(e) => {
                              const updated = [...(currentContent.disciplines?.items || defaultData.legacy.disciplines.items)];
                              updated[idx] = { ...updated[idx], badge: e.target.value };
                              setSiteContent((prev: any) => ({
                                ...prev,
                                legacy: { ...prev.legacy, disciplines: { ...prev.legacy?.disciplines, items: updated } },
                              }));
                            }}
                            className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={item.desc || ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.disciplines?.items || defaultData.legacy.disciplines.items)];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setSiteContent((prev: any) => ({
                              ...prev,
                              legacy: { ...prev.legacy, disciplines: { ...prev.legacy?.disciplines, items: updated } },
                            }));
                          }}
                          className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-1">Target Link</label>
                        <input
                          type="text"
                          value={item.link || ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.disciplines?.items || defaultData.legacy.disciplines.items)];
                            updated[idx] = { ...updated[idx], link: e.target.value };
                            setSiteContent((prev: any) => ({
                              ...prev,
                              legacy: { ...prev.legacy, disciplines: { ...prev.legacy?.disciplines, items: updated } },
                            }));
                          }}
                          placeholder="/collections?category=Tufted"
                          className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg"
                        />
                      </div>
                      <ImageUploader
                        label={`${item.title || "Discipline"} Image`}
                        value={item.img || ""}
                        recommendedSize="800 × 1000 px (Portrait Discipline)"
                        onChange={(url) => {
                          const updated = [...(currentContent.disciplines?.items || defaultData.legacy.disciplines.items)];
                          updated[idx] = { ...updated[idx], img: url };
                          setSiteContent((prev: any) => ({
                            ...prev,
                            legacy: { ...prev.legacy, disciplines: { ...prev.legacy?.disciplines, items: updated } },
                          }));
                        }}
                        onUpload={handleImageUpload}
                        isUploading={isUploading}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Direct Atelier Promise (Comparison) */}
            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Fair Pricing Transparency
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">5. Direct from the Loom Promise</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Section Tag</label>
                    <input
                      type="text"
                      value={currentContent.promise?.tag || ""}
                      onChange={(e) => updateField("promise", "tag", e.target.value)}
                      placeholder="TRANSPARENT PROVENANCE"
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Heading</label>
                    <input
                      type="text"
                      value={currentContent.promise?.title || ""}
                      onChange={(e) => updateField("promise", "title", e.target.value)}
                      placeholder="Direct from the Loom to Your Home"
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={currentContent.promise?.subtitle || ""}
                      onChange={(e) => updateField("promise", "subtitle", e.target.value)}
                      placeholder="Why traditional luxury stores charge 5x-8x markup..."
                      className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Traditional Retail Points */}
                  <div className="border border-red-200 p-5 bg-red-50/30 rounded-xl space-y-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-red-700 block pb-1 border-b border-red-200">
                      Traditional Luxury Retail Pain Points (✕)
                    </span>
                    {(currentContent.promise?.retailPoints || defaultData.legacy.promise.retailPoints).map((point: string, idx: number) => (
                      <div key={idx}>
                        <label className="block text-[9.5px] uppercase font-bold text-[#8C7A63] mb-1">Point #{idx + 1}</label>
                        <input
                          type="text"
                          value={point || ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.promise?.retailPoints || defaultData.legacy.promise.retailPoints)];
                            updated[idx] = e.target.value;
                            setSiteContent((prev: any) => ({
                              ...prev,
                              legacy: { ...prev.legacy, promise: { ...prev.legacy?.promise, retailPoints: updated } },
                            }));
                          }}
                          className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg"
                        />
                      </div>
                    ))}
                  </div>

                  {/* NR Enterprises Atelier Points */}
                  <div className="border-2 border-[#C19A6B] p-5 bg-[#C19A6B]/5 rounded-xl space-y-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#3A332C] block pb-1 border-b border-[#C19A6B]/30">
                      The NR Enterprises Promise Points (✓)
                    </span>
                    {(currentContent.promise?.nrEnterprisesPoints || defaultData.legacy.promise.nrEnterprisesPoints || []).map((point: string, idx: number) => (
                      <div key={idx}>
                        <label className="block text-[9.5px] uppercase font-bold text-[#8C7A63] mb-1">Point #{idx + 1}</label>
                        <input
                          type="text"
                          value={point || ""}
                          onChange={(e) => {
                            const updated = [...(currentContent.promise?.nrEnterprisesPoints || defaultData.legacy.promise.nrEnterprisesPoints || [])];
                            updated[idx] = e.target.value;
                            setSiteContent((prev: any) => ({
                              ...prev,
                              legacy: { ...prev.legacy, promise: { ...prev.legacy?.promise, nrEnterprisesPoints: updated } },
                            }));
                          }}
                          className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Bespoke Commission CTA */}
            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Private Atelier Concierge
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">6. Bespoke Commission CTA</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Section Tag</label>
                  <input
                    type="text"
                    value={currentContent.bespokeCta?.tag || ""}
                    onChange={(e) => updateField("bespokeCta", "tag", e.target.value)}
                    placeholder="BESPOKE COMMISSION"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Heading</label>
                  <input
                    type="text"
                    value={currentContent.bespokeCta?.title || ""}
                    onChange={(e) => updateField("bespokeCta", "title", e.target.value)}
                    placeholder="Commission a Sacred Piece for Your Home"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Description</label>
                  <textarea
                    rows={2}
                    value={currentContent.bespokeCta?.description || ""}
                    onChange={(e) => updateField("bespokeCta", "description", e.target.value)}
                    placeholder="Have a custom dimensions requirement..."
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Button Text</label>
                    <input
                      type="text"
                      value={currentContent.bespokeCta?.btnText || ""}
                      onChange={(e) => updateField("bespokeCta", "btnText", e.target.value)}
                      placeholder="Start Custom Sizing"
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Button Link</label>
                    <input
                      type="text"
                      value={currentContent.bespokeCta?.btnLink || ""}
                      onChange={(e) => updateField("bespokeCta", "btnLink", e.target.value)}
                      placeholder="/customize"
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">WhatsApp Text</label>
                    <input
                      type="text"
                      value={currentContent.bespokeCta?.whatsappText || ""}
                      onChange={(e) => updateField("bespokeCta", "whatsappText", e.target.value)}
                      placeholder="WhatsApp Concierge"
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">WhatsApp Number</label>
                    <input
                      type="text"
                      value={currentContent.bespokeCta?.whatsappNumber || ""}
                      onChange={(e) => updateField("bespokeCta", "whatsappNumber", e.target.value)}
                      placeholder="918874585277"
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: ABOUT US --- */}
        {activeTab === "about" && (
          <div className="space-y-10">
            <CodebasePublishBar
              pageId="about"
              pageName="About Us"
              filePath="lib/siteContent/about.ts"
              onPublishToWebsite={handlePublishCodeDefaults}
              onSaveToCodebase={handleSaveAdminToCodebase}
              isSaving={isSaving}
              isSavingToCode={isSavingToCode}
            />

            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Brand Story
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">About Us Editorial Content</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Tagline</label>
                  <input
                    id="about-hero-tag"
                    type="text"
                    value={currentContent.hero?.tag || ""}
                    onChange={(e) => updateField("hero", "tag", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Main Heading</label>
                  <input
                    id="about-hero-title"
                    type="text"
                    value={currentContent.hero?.title || ""}
                    onChange={(e) => updateField("hero", "title", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Paragraph 1 (Origin & Heritage)</label>
                  <textarea
                    id="about-hero-para1"
                    rows={3}
                    value={currentContent.hero?.para1 || ""}
                    onChange={(e) => updateField("hero", "para1", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Paragraph 2 (Workshop & Craftsmanship)</label>
                  <textarea
                    id="about-hero-para2"
                    rows={3}
                    value={currentContent.hero?.para2 || ""}
                    onChange={(e) => updateField("hero", "para2", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Paragraph 3 (Promise & Direct Manufacture)</label>
                  <textarea
                    id="about-hero-para3"
                    rows={3}
                    value={currentContent.hero?.para3 || ""}
                    onChange={(e) => updateField("hero", "para3", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div className="pt-2">
                  <ImageUploader
                    label="About Us Bottom Feature Image"
                    value={currentContent.hero?.image || ""}
                    recommendedSize="1400 × 900 px (16:10 Workshop Photo)"
                    onChange={(url) => updateField("hero", "image", url)}
                    onUpload={handleImageUpload}
                    isUploading={isUploading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: CONTACT --- */}
        {activeTab === "contact" && (
          <div className="space-y-10">
            <CodebasePublishBar
              pageId="contact"
              pageName="Contact"
              filePath="lib/siteContent/contact.ts"
              onPublishToWebsite={handlePublishCodeDefaults}
              onSaveToCodebase={handleSaveAdminToCodebase}
              isSaving={isSaving}
              isSavingToCode={isSavingToCode}
            />

            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Inquiry Desk
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">Contact Page Form & Header</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Main Heading</label>
                  <input
                    id="contact-header-title"
                    type="text"
                    value={currentContent.header?.title || ""}
                    onChange={(e) => updateField("header", "title", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] font-serif rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Description / Subtitle</label>
                  <textarea
                    id="contact-header-description"
                    rows={3}
                    value={currentContent.header?.description || ""}
                    onChange={(e) => updateField("header", "description", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A63] mb-2">Submit Button Text</label>
                  <input
                    id="contact-header-btnText"
                    type="text"
                    value={currentContent.header?.btnText || ""}
                    onChange={(e) => updateField("header", "btnText", e.target.value)}
                    className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#E5DDD2] rounded-2xl shadow-sm overflow-hidden space-y-6">
              <div className="bg-gradient-to-r from-[#1C1917] via-[#2A241F] to-[#1C1917] p-5 sm:p-6 text-white border-b-2 border-[#C19A6B]/40 shadow-inner">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C19A6B]/20 text-[#DFC8A4] border border-[#C19A6B]/30 block w-fit mb-1">
                  Bhadohi Headquarters
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white">Workshop & Direct Contact Info</h2>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border border-[#E5DDD2] bg-[#FAFAFA] rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7A63] mb-1">Workshop Address</label>
                    <input
                      id="contact-info-address"
                      type="text"
                      value={currentContent.info?.address || ""}
                      onChange={(e) => updateField("info", "address", e.target.value)}
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div className="p-4 border border-[#E5DDD2] bg-[#FAFAFA] rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7A63] mb-1">Email Address</label>
                    <input
                      id="contact-info-email"
                      type="text"
                      value={currentContent.info?.email || ""}
                      onChange={(e) => updateField("info", "email", e.target.value)}
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                  <div className="p-4 border border-[#E5DDD2] bg-[#FAFAFA] rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7A63] mb-1">Concierge Desk / Note</label>
                    <input
                      id="contact-info-phone"
                      type="text"
                      value={currentContent.info?.phone || ""}
                      onChange={(e) => updateField("info", "phone", e.target.value)}
                      placeholder="e.g. Atelier Quick Inquire"
                      className="w-full border border-[#DFD8CC] p-2 text-xs bg-white outline-none focus:border-[#C19A6B] rounded-lg transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 1. FULLSCREEN DARK BACKDROP WITH ROUND GREEN SPINNER */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm select-none"
          >
            <div className="bg-white border border-[#DFD8CC] p-8 rounded-sm shadow-2xl flex flex-col items-center gap-5 max-w-xs w-full text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 animate-pulse"></div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
              <div>
                <h4 className="text-base font-serif text-[#3A332C] font-semibold">
                  Processing...
                </h4>
                <p className="text-xs text-[#7A7065] mt-1 font-medium">
                  Saving and synchronizing content...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 2. ANIMATED GREEN CHECKMARK SUCCESS MODAL */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-sm max-w-xs w-full p-8 text-center shadow-2xl border-t-4 border-emerald-500"
            >
              <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-serif text-[#3A332C] font-semibold">
                Changes Saved!
              </h3>
              <p className="text-xs text-[#7A7065] mt-1">
                Updated live across the storefront.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}