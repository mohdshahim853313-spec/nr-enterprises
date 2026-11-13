"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { compressAndConvertToWebP } from "@/lib/compressImage";

export interface HeroSlideItem {
  id: string;
  title: string;
  tag?: string;
  bgImage: string;
  thumb?: string;
  ctaText?: string;
  ctaLink?: string;
  secText?: string;
  secLink?: string;
}

const DEFAULT_SLIDES: HeroSlideItem[] = [
  {
    id: "slide-1",
    title: "Masterpiece Rugs",
    tag: "BESPOKE ARTISANAL FLOOR COVERINGS",
    bgImage: "",
    ctaText: "Explore Handcrafted Rugs",
    ctaLink: "/collections",
  },
  {
    id: "slide-2",
    title: "Artisanal Living Elegance",
    tag: "NEW • CURATED COLLECTION",
    bgImage: "",
    ctaText: "Shop the Collection",
    ctaLink: "/collections",
  },
  {
    id: "slide-3",
    title: "Bespoke Lounge Sculptures",
    tag: "NEW • CURATED COLLECTION",
    bgImage: "",
    ctaText: "Shop the Collection",
    ctaLink: "/collections",
  },
  {
    id: "slide-4",
    title: "Architectural Corridor Weaves",
    tag: "NEW • CURATED COLLECTION",
    bgImage: "",
    ctaText: "Shop the Collection",
    ctaLink: "/collections",
  },
  {
    id: "slide-5",
    title: "Timeless Moroccan Knots",
    tag: "NEW • CURATED COLLECTION",
    bgImage: "",
    ctaText: "Shop the Collection",
    ctaLink: "/collections",
  },
];

export default function HeroSlidesManager({
  onSaveCallback,
}: {
  onSaveCallback?: (slides: HeroSlideItem[]) => void;
}) {
  const [slides, setSlides] = useState<HeroSlideItem[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 🌟 Load current slides from Supabase site_content 'home'
  useEffect(() => {
    let mounted = true;
    async function loadHeroSlides() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "home")
          .maybeSingle();

        if (error) {
          console.warn("[HeroSlidesManager] Error loading home content:", error);
        }

        if (mounted && data?.data?.heroSlides && Array.isArray(data.data.heroSlides)) {
          const loadedSlides: HeroSlideItem[] = [];
          for (let i = 0; i < 5; i++) {
            const existing = data.data.heroSlides[i];
            const def = DEFAULT_SLIDES[i];
            loadedSlides.push({
              id: existing?.id || def.id,
              title: existing?.title || def.title,
              tag: existing?.tag || def.tag,
              bgImage: existing?.bgImage || "",
              thumb: existing?.bgImage || "",
              ctaText: existing?.ctaText || def.ctaText,
              ctaLink: existing?.ctaLink || def.ctaLink,
            });
          }
          setSlides(loadedSlides);
        }
      } catch (err) {
        console.error("[HeroSlidesManager] Exception:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHeroSlides();
    return () => {
      mounted = false;
    };
  }, []);

  // 🌟 Upload File from PC Handler
  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingIdx(index);
    setStatusMsg({ text: `Slide #${index + 1}: Compressing image to WebP...`, type: "info" });

    try {
      // 1. Optimize locally to WebP
      const optimized = await compressAndConvertToWebP(file);

      setStatusMsg({ text: `Slide #${index + 1}: Uploading to secure storage...`, type: "info" });

      // 2. Upload to our API route
      const formData = new FormData();
      formData.append("file", optimized);
      formData.append("folder", "hero-slides");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success || !resData.url) {
        throw new Error(resData.error || "Upload failed");
      }

      // 3. Update slide state
      const uploadedUrl = resData.url;
      setSlides((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          bgImage: uploadedUrl,
          thumb: uploadedUrl,
        };
        return next;
      });

      setHasChanges(true);
      setStatusMsg({
        text: `✔ Slide #${index + 1} photo uploaded successfully! Click 'Save All 5 Slides' below to publish.`,
        type: "success",
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      console.error("[HeroSlidesManager] Upload failed:", err);
      setStatusMsg({ text: `❌ Upload failed: ${err.message}`, type: "error" });
    } finally {
      setUploadingIdx(null);
    }
  };

  // 🌟 Change text fields or URL
  const updateSlideField = (index: number, field: keyof HeroSlideItem, val: string) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: val,
        ...(field === "bgImage" ? { thumb: val } : {}),
      };
      return next;
    });
    setHasChanges(true);
  };

  // 🌟 Save to Supabase and publish live
  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMsg({ text: "Saving all 5 slides to website database...", type: "info" });

    try {
      // 1. Fetch current home row to merge
      const { data: currentHome } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "home")
        .maybeSingle();

      const existingData = currentHome?.data || {};

      // 2. Format 5 slides
      const cleanedSlides = slides.map((s, idx) => ({
        id: s.id || `slide-${idx + 1}`,
        title: s.title || `Curated Rugs ${idx + 1}`,
        tag: s.tag || "BESPOKE ARTISANAL FLOOR COVERINGS",
        bgImage: s.bgImage,
        thumb: s.bgImage,
        ctaText: s.ctaText || "Explore Handcrafted Rugs",
        ctaLink: s.ctaLink || "/collections",
      }));

      const updatedHomeData = {
        ...existingData,
        heroSlides: cleanedSlides,
      };

      // 3. Upsert to Supabase
      const { error } = await supabase.from("site_content").upsert(
        {
          id: "home",
          data: updatedHomeData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      // 4. Update local storage caches
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("nr_home_content_v1", JSON.stringify(updatedHomeData));
          localStorage.setItem("rz_home_content_v9", JSON.stringify(updatedHomeData));
        } catch (e) { }
      }

      if (onSaveCallback) {
        onSaveCallback(cleanedSlides);
      }

      setHasChanges(false);
      setStatusMsg({
        text: "🎉 All 5 Hero Slides saved & published live to the homepage!",
        type: "success",
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err: any) {
      console.error("[HeroSlidesManager] Save failed:", err);
      setStatusMsg({ text: `❌ Save failed: ${err.message}`, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FAF8F5] border-2 border-[#E5DDD2] rounded-2xl p-8 text-center text-stone-600 font-sans shadow-sm">
        <div className="w-8 h-8 border-3 border-[#4A1017] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-widest font-bold text-[#4A1017]">
          Loading 5 Homepage Hero Slides...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F3EDE2] border-2 border-[#D4C3AB] rounded-2xl p-5 sm:p-7 shadow-md space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D4C3AB]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#4A1017] text-white flex items-center justify-center text-lg shadow-sm">
              🖼️
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2A0E13]">
                Homepage Hero Carousel — 5 Slides
              </h3>
              <p className="text-xs text-[#6B5A4B] mt-0.5">
                Apne PC se 5 photos choose karke lagayein. Ye 5 photos homepage ke main banner aur neeche ke 5 clickable thumbnail buttons me dikhengi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto">
          {hasChanges && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full animate-pulse">
              ● Unsaved Changes
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 bg-[#4A1017] hover:bg-[#681821] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>💾 Save & Publish 5 Slides</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {statusMsg && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${statusMsg.type === "success"
            ? "bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs"
            : statusMsg.type === "error"
              ? "bg-red-50 text-red-900 border border-red-300"
              : "bg-blue-50 text-blue-900 border border-blue-300"
            }`}
        >
          <span>{statusMsg.type === "success" ? "✔" : statusMsg.type === "error" ? "❌" : "ℹ"}</span>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 5 Slide Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {slides.map((slide, idx) => {
          const isUploading = uploadingIdx === idx;
          const hasImage = Boolean(slide.bgImage && slide.bgImage.trim());

          return (
            <div
              key={slide.id || idx}
              className="bg-white border-2 border-[#E2D6C5] hover:border-[#4A1017] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-[#2A0E13] text-[#FAF5EB] px-3 py-2 flex items-center justify-between text-xs font-bold font-serif">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF5EB] text-[#2A0E13] flex items-center justify-center text-[10px] font-sans font-black">
                    {idx + 1}
                  </span>
                  <span>Slide #{idx + 1}</span>
                </span>
                {idx === 0 && (
                  <span className="text-[9px] uppercase tracking-wider bg-[#FAF5EB]/20 px-2 py-0.5 rounded-full font-sans">
                    Default 1st
                  </span>
                )}
              </div>

              {/* Image Preview Box */}
              <div className="relative w-full aspect-[4/3] bg-stone-100 border-b border-[#E2D6C5] overflow-hidden group">
                {hasImage ? (
                  <>
                    <Image
                      src={slide.bgImage}
                      alt={`Slide ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[idx]?.click()}
                        className="bg-white/90 hover:bg-white text-stone-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSlideField(idx, "bgImage", "")}
                        className="bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-stone-200/60 transition-colors"
                  >
                    <span className="text-2xl mb-1 opacity-60">📷</span>
                    <span className="text-[11px] font-bold text-stone-700">No Image Set</span>
                    <span className="text-[10px] text-[#4A1017] underline font-semibold mt-0.5">
                      Click to choose from PC
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-semibold p-2 text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1.5" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 text-xs">
                {/* Hidden File Input */}
                <input
                  ref={(el) => {
                    fileInputRefs.current[idx] = el;
                  }}
                  type="file"
                  accept="image/*,.webp,.jpg,.jpeg,.png,.avif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(idx, e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />

                {/* PC Upload Button */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRefs.current[idx]?.click()}
                  className="w-full py-2 px-3 bg-[#4A1017] hover:bg-[#681821] text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>📁</span>
                  <span>Choose from PC</span>
                </button>

                {/* URL Direct Paste Input */}
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-stone-500 mb-1">
                    Or Direct URL:
                  </label>
                  <input
                    type="text"
                    value={slide.bgImage || ""}
                    onChange={(e) => updateSlideField(idx, "bgImage", e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-stone-300 rounded px-2 py-1 text-[11px] text-stone-800 outline-none focus:border-[#4A1017]"
                  />
                </div>

                {/* Optional Title Input */}
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-stone-500 mb-1">
                    Slide Title:
                  </label>
                  <input
                    type="text"
                    value={slide.title || ""}
                    onChange={(e) => updateSlideField(idx, "title", e.target.value)}
                    placeholder={`Slide ${idx + 1} Title`}
                    className="w-full border border-stone-300 rounded px-2 py-1 text-[11px] text-stone-800 outline-none focus:border-[#4A1017]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Reminder */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D4C3AB] bg-[#FAF5EB] p-3.5 rounded-xl text-xs text-[#5C4838]">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span>
            <strong>Tip:</strong> PC se photo select karte hi image automatic WebP format me convert hokar upload ho jaati hai. Final website par dikhane ke liye right side ka <strong>&quot;Save &amp; Publish 5 Slides&quot;</strong> button click karein.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="shrink-0 px-6 py-2.5 bg-[#4A1017] hover:bg-[#681821] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          {saving ? "Publishing..." : "💾 Save & Publish 5 Slides"}
        </button>
      </div>
    </div>
  );
}

