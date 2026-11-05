"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickPasteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  editingProductName?: string;
  currentJsonString?: string;
  onApply: (data: {
    formData: any;
    imageUrls?: string[];
    studioImageUrl?: string;
  }) => void;
  filterSettings?: {
    types?: string[];
    materials?: string[];
    shapes?: string[];
    colors?: Array<{ name: string; hex: string } | string>;
    patterns?: string[];
  };
}

const SAMPLE_AI_PROMPT = `Please generate or modify a rug listing JSON for NR Enterprises in this exact JSON format:
{
  "name": "Sculpted Ivory Relief Wool Rug",
  "category": "Hand-Tufted",
  "material": "Pure New Zealand Wool",
  "color": "Ivory / Warm Cream",
  "shape": "Rectangular",
  "style": "Modern Minimalist",
  "room": "Living Room, Bedroom",
  "pattern": "Subtle Geometric High-Low Relief",
  "sku": "RZ-HT-001",
  "description": "Exquisitely hand-tufted from 100% New Zealand wool, featuring tactile carved organic contour ridges that invite barefoot comfort.",
  "features": "100% Pure Wool, Hand-Carved 3D Relief, Ultra-Plush Density, Shed-Resistant, Artisanal Craftsmanship",
  "care_instructions": "Vacuum regularly with suction only. Spot clean immediately with mild detergent.",
  "processing_time": "3-5 business days",
  "return_policy": "Returns accepted within 14 days",
  "tags": "Luxury, Wool, Hand Tufted, Modern, Warm Cream, Plush",
  "variants": [
    { "dimensions": "3 x 5", "unit": "ft", "price": "18000" },
    { "dimensions": "5 x 8", "unit": "ft", "price": "42000" },
    { "dimensions": "8 x 10", "unit": "ft", "price": "75000" },
    { "dimensions": "9 x 12", "unit": "ft", "price": "105000" }
  ],
  "images": [
    "https://pub-your-domain.r2.dev/sample-rug-1.webp"
  ]
}`;

export default function QuickPasteListingModal({
  isOpen,
  onClose,
  mode,
  editingProductName,
  currentJsonString,
  onApply,
  filterSettings,
}: QuickPasteListingModalProps) {
  const [pasteContent, setPasteContent] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  // When opening in edit mode with existing data, pre-fill text area
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (mode === "edit" && currentJsonString) {
        setPasteContent(currentJsonString);
      } else if (mode === "create" && !pasteContent) {
        // Keep empty for clean paste
      }
    }
  }, [isOpen, mode, currentJsonString]);

  if (!isOpen) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(SAMPLE_AI_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleCopyCurrentListing = () => {
    if (currentJsonString) {
      navigator.clipboard.writeText(currentJsonString);
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2500);
    }
  };

  const handleLoadCurrent = () => {
    if (currentJsonString) {
      setPasteContent(currentJsonString);
      setErrorMsg(null);
    }
  };

  const handleLoadSample = () => {
    setPasteContent(SAMPLE_AI_PROMPT.substring(SAMPLE_AI_PROMPT.indexOf("{")));
    setErrorMsg(null);
  };

  const handleApply = () => {
    setErrorMsg(null);
    if (!pasteContent.trim()) {
      setErrorMsg("Please paste JSON or JavaScript code first.");
      return;
    }

    try {
      let cleaned = pasteContent.trim();

      // 1. Remove markdown fences like ```json ... ``` or ```javascript ... ```
      cleaned = cleaned.replace(/^```(?:json|javascript|js|typescript|ts)?\s*/i, "");
      cleaned = cleaned.replace(/\s*```$/i, "");
      cleaned = cleaned.trim();

      // 2. Remove assignment prefixes like `const rug = ` or `export default `
      cleaned = cleaned.replace(/^(?:const|let|var)\s+[a-zA-Z0-9_$]+\s*=\s*/, "");
      cleaned = cleaned.replace(/^export\s+default\s+/, "");
      cleaned = cleaned.replace(/;+\s*$/, "");

      let parsed: any = null;

      // Try strict JSON parse first
      try {
        parsed = JSON.parse(cleaned);
      } catch (jsonErr) {
        // Fallback: Safe Function evaluation for relaxed JavaScript object formats
        try {
          const fn = new Function(`"use strict"; return (${cleaned});`);
          parsed = fn();
        } catch (evalErr: any) {
          throw new Error("Invalid format. Please ensure valid JSON or JavaScript object syntax: " + (jsonErr as Error).message);
        }
      }

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Parsed content must be an object containing carpet listing details.");
      }

      // Extract and map all fields
      const name = parsed.name || parsed.title || parsed.carpet_name || parsed.product_name || "";
      const original_name = parsed.original_name || parsed.internal_name || "";
      const sku = parsed.sku || parsed.code || "";
      const quantity = String(parsed.quantity || parsed.stock_quantity || parsed.stock || "1");

      const category = parsed.category || parsed.type || parsed.weave_type || "Hand-Tufted";
      const material = parsed.material || parsed.fiber || "Pure New Zealand Wool";
      const color = parsed.color || parsed.colors || "";
      const shape = parsed.shape || "Rectangular";
      const style = parsed.style || "";
      const room = parsed.room || parsed.rooms || "";
      const pattern = parsed.pattern || "";

      const tags = Array.isArray(parsed.tags) ? parsed.tags.join(", ") : (parsed.tags || "");
      const features = Array.isArray(parsed.features) ? parsed.features.join(", ") : (parsed.features || "");
      const description = parsed.description || parsed.story || parsed.about || "";
      const care_instructions = parsed.care_instructions || parsed.care || "Spot clean or vacuum with suction only. Do not machine wash.";
      const processing_time = parsed.processing_time || parsed.lead_time || "2-3 business days";
      const return_policy = parsed.return_policy || "Returns accepted within 14 days";
      const processing_type = parsed.processing_type || "Made to Order";

      const is_customizable = Boolean(parsed.is_customizable ?? parsed.customizable ?? false);
      const customization_surcharge = String(parsed.customization_surcharge || "20");
      const free_delivery = Boolean(parsed.free_delivery ?? false);
      const show_etsy = Boolean(parsed.show_etsy ?? false);
      const etsy_url = parsed.etsy_url || "";
      const markup_percent = String(parsed.markup_percent || "");
      const discount_percent = String(parsed.discount_percent || "");

      // Parse Variants
      let variants: Array<{ dimensions: string; unit: string; price: string }> = [];

      if (Array.isArray(parsed.variants) && parsed.variants.length > 0) {
        variants = parsed.variants.map((v: any) => {
          if (v.dimensions && v.price) {
            return {
              dimensions: String(v.dimensions).trim(),
              unit: (v.unit || "ft").toLowerCase().trim(),
              price: String(v.price).replace(/[^0-9.]/g, ""),
            };
          }
          if (v.size && (v.price || v.base_price)) {
            const rawPrice = String(v.price || v.base_price).replace(/[^0-9.]/g, "");
            const match = String(v.size).match(/(.*?)\s*(ft|cm|m|in)?$/i);
            return {
              dimensions: match ? match[1].trim() : String(v.size).trim(),
              unit: (match && match[2] ? match[2] : "ft").toLowerCase().trim(),
              price: rawPrice,
            };
          }
          return { dimensions: "5 x 8", unit: "ft", price: "45000" };
        });
      } else if (Array.isArray(parsed.sizes) && parsed.sizes.length > 0) {
        const singlePrice = String(parsed.price || "45000").replace(/[^0-9.]/g, "");
        variants = parsed.sizes.map((s: string) => {
          const match = String(s).match(/(.*?)\s*(ft|cm|m|in)?$/i);
          return {
            dimensions: match ? match[1].trim() : String(s).trim(),
            unit: (match && match[2] ? match[2] : "ft").toLowerCase().trim(),
            price: singlePrice,
          };
        });
      } else {
        const rawPrice = String(parsed.price || "45000").replace(/[^0-9.]/g, "");
        variants = [{ dimensions: "5 x 8", unit: "ft", price: rawPrice }];
      }

      // Check for custom category/shape/material compared to available options
      const knownTypes = filterSettings?.types || [];
      const knownMaterials = filterSettings?.materials || [];
      const knownShapes = filterSettings?.shapes || [];

      const isCustomCategory = knownTypes.length > 0 && !knownTypes.includes(category);
      const isCustomMaterial = knownMaterials.length > 0 && !knownMaterials.includes(material);
      const isCustomShape = knownShapes.length > 0 && !knownShapes.includes(shape);

      const mappedFormData = {
        name,
        original_name,
        sku,
        quantity,
        category: isCustomCategory ? "Custom" : category,
        custom_category: isCustomCategory ? category : "",
        material: isCustomMaterial ? "Custom" : material,
        custom_material: isCustomMaterial ? material : "",
        shape: isCustomShape ? "Custom" : shape,
        custom_shape: isCustomShape ? shape : "",
        color,
        style,
        room,
        pattern,
        tags,
        features,
        description,
        care_instructions,
        processing_time,
        return_policy,
        processing_type,
        is_customizable,
        customization_surcharge,
        free_delivery,
        show_etsy,
        etsy_url,
        markup_percent,
        discount_percent,
        related_products: Array.isArray(parsed.related_products) ? parsed.related_products : [],
        variants,
      };

      // Extract image URLs if provided
      const rawImages = parsed.images || parsed.image_urls || parsed.photos || [];
      const imageUrls: string[] = Array.isArray(rawImages) ? rawImages.filter((u: any) => typeof u === "string" && u.trim().startsWith("http")) : [];

      const rawStudio = parsed.studio_image || parsed.studio_image_url || parsed.top_down_image;
      const studioImageUrl: string | undefined = typeof rawStudio === "string" && rawStudio.trim().startsWith("http") ? rawStudio.trim() : undefined;

      onApply({
        formData: mappedFormData,
        imageUrls,
        studioImageUrl,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse listing code.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white border border-[#DFD8CC] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-[#FAFAFA] border-b border-[#EAEAEB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C19A6B] to-[#967448] flex items-center justify-center text-white text-lg shadow-sm">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  {mode === "edit" ? "Edit Listing with Code / AI" : "AI / Code Listing Auto-Fill"}
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  mode === "edit" ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  {mode === "edit" ? "Editing Mode" : "New Listing Mode"}
                </span>
              </div>
              <p className="text-xs text-[#7A7065] mt-0.5">
                {mode === "edit" 
                  ? (editingProductName ? `Modifying existing listing: "${editingProductName}"` : "Copy current JSON, ask AI to modify, and paste back to update.") 
                  : "Paste JSON or AI code here — all 20+ fields and variants will auto-populate instantly."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#EAEAEB] flex items-center justify-center text-[#7A7065] hover:text-[#1C1917] transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 bg-[#F5F2EB]/50 border-b border-[#EAEAEB] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {mode === "edit" && currentJsonString && (
              <>
                <button
                  type="button"
                  onClick={handleCopyCurrentListing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#DFD8CC] text-[#1C1917] hover:border-[#C19A6B] hover:text-[#C19A6B] rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Copy the current listing JSON to give to AI"
                >
                  <span>{copiedCurrent ? "✔ Copied Current!" : "📋 Copy Current Product JSON"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadCurrent}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#DFD8CC] text-[#7A7065] hover:text-[#1C1917] rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Reset textarea to current product details"
                >
                  <span>↺ Reload Current</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#DFD8CC] text-[#3A332C] hover:border-[#C19A6B] hover:text-[#C19A6B] rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <span>{copiedPrompt ? "✔ Copied Prompt!" : "📋 Copy AI Format Prompt"}</span>
            </button>

            {mode === "create" && (
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#DFD8CC] text-[#7A7065] hover:text-[#1C1917] rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <span>🪄 Load Sample Demo</span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#8C7A63] font-medium">
            Supports JSON, JS objects, &amp; Markdown
          </span>
        </div>

        {/* Text Area Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <textarea
            value={pasteContent}
            onChange={(e) => {
              setPasteContent(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder='Paste your listing code here, e.g.:&#10;{&#10;  "name": "Sculpted Ivory Relief Wool Rug",&#10;  "category": "Hand-Tufted",&#10;  "material": "Pure New Zealand Wool",&#10;  "variants": [&#10;    { "dimensions": "5 x 8", "unit": "ft", "price": "42000" }&#10;  ]&#10;}'
            rows={14}
            className="w-full font-mono text-xs bg-[#1C1917] text-[#E7E5E4] p-4 rounded-xl border border-[#3A332C] focus:outline-none focus:border-[#C19A6B] shadow-inner leading-relaxed resize-none selection:bg-[#C19A6B]/40"
          />

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <span className="font-bold text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#EAEAEB] text-[11px] text-[#7A7065] space-y-1">
            <p className="font-bold text-[#3A332C]">
              {mode === "edit" ? "💡 How to Edit with Code / AI:" : "💡 How to Create with Code / AI:"}
            </p>
            {mode === "edit" ? (
              <>
                <p>1. Click <strong>&quot;Copy Current Product JSON&quot;</strong> above.</p>
                <p>2. Give it to ChatGPT/Claude with instructions (e.g. <em>&quot;Change prices by 10% and add 9x12 size for 85000&quot;</em>).</p>
                <p>3. Paste the AI response back into the box above and click <strong>&quot;Apply Changes to Listing&quot;</strong>.</p>
                <p>4. Click <strong>&quot;Update Carpet&quot;</strong> on the page to save directly to Supabase live!</p>
              </>
            ) : (
              <>
                <p>1. Copy the AI Format Prompt and give it to ChatGPT, Claude, or Gemini along with your rug specs.</p>
                <p>2. Paste the AI response into the box above and click <strong>&quot;Apply &amp; Auto-Fill Form&quot;</strong>.</p>
                <p>3. Review your carpet fields, attach any extra photos if needed, and hit <strong>&quot;Publish Carpet&quot;</strong>.</p>
              </>
            )}
            <p className="text-[#8C7A63] italic">No listing text is stored in the Next.js codebase — everything syncs dynamically with Supabase!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFAFA] border-t border-[#EAEAEB] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPasteContent("")}
            className="px-4 py-2 text-xs font-semibold text-[#8C7A63] hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear Text
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A7065] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 bg-gradient-to-r from-[#C19A6B] to-[#967448] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 shadow-md transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <span>{mode === "edit" ? "⚡ Apply Changes to Listing" : "⚡ Apply & Auto-Fill Form"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
