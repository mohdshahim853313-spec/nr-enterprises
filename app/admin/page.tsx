"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { compressAndConvertToWebP } from "@/lib/compressImage";
import { deleteStorageImage } from "@/lib/deleteStorageImage";
import BlogManager from "@/components/admin/BlogManager";
import QuickPasteListingModal from "@/components/admin/QuickPasteListingModal";
import EtsySyncModal from "@/components/admin/EtsySyncModal";
import EtsyDeletedManager from "@/components/admin/EtsyDeletedManager";
import EtsyPackStudioModal from "@/components/admin/EtsyPackStudioModal";
import BulkPriceMarkupModal from "@/components/admin/BulkPriceMarkupModal";
import { DEFAULT_FILTER_SETTINGS, FilterSettings } from "@/lib/filterConfig";
import HeroSlidesManager from "@/components/admin/HeroSlidesManager";

const InputField = ({ label, name, placeholder, required = false, type = "text", value, onChange }: any) => (
  <div className="w-full">
    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B]"
    />
  </div>
);

type ImageFile = { id: string; file: File | null; preview: string; isExisting: boolean; };

export default function AdminUpload() {
  const [loadingAction, setLoadingAction] = useState<"publish" | "draft" | "copy" | "load" | "delete" | null>(null);
  const [lastSubmittedStatus, setLastSubmittedStatus] = useState<"publish" | "draft">("publish");
  const [statusMsg, setStatusMsg] = useState("");

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState(false);
  const [isEtsySyncOpen, setIsEtsySyncOpen] = useState(false);
  const [isBulkMarkupOpen, setIsBulkMarkupOpen] = useState(false);
  const [packStudioProductId, setPackStudioProductId] = useState<string | null>(null);

  const [editingProductId, setEditingProductId] = useState<string>("");

  const [images, setImages] = useState<ImageFile[]>([]);
  const [studioImage, setStudioImage] = useState<ImageFile | null>(null);
  const [studioImagesRegistry, setStudioImagesRegistry] = useState<Record<string, string>>({});
  const [colorVariantsRegistry, setColorVariantsRegistry] = useState<Record<string, any[]>>({});
  const [colorVariants, setColorVariants] = useState<{ color: string; image: string; hex?: string }[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorImage, setNewColorImage] = useState("");
  const [newColorHex, setNewColorHex] = useState("#C19A6B");
  const [isColorUploading, setIsColorUploading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [duplicatedFromTitle, setDuplicatedFromTitle] = useState("");

  // 🌟 Storage se auto cleanup ke saath delete
  const handleRemoveImage = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];

    if (imageToRemove?.isExisting && imageToRemove.preview) {
      await deleteStorageImage(imageToRemove.preview);
    }

    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 🌟 Studio Image Remove Handler
  const handleRemoveStudioImage = async () => {
    if (studioImage?.isExisting && studioImage.preview) {
      await deleteStorageImage(studioImage.preview);
    }
    setStudioImage(null);
  };

  // 🌟 Delete Entire Listing and Auto Cleanup All Associated Images from R2 / Storage
  const handleDeleteProduct = async () => {
    if (!editingProductId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this listing permanently? All associated images will also be deleted from Cloudflare R2 / storage.");
    if (!confirmDelete) return;

    setLoadingAction("delete");
    setStatusMsg("Deleting images from Cloudflare R2 / storage and removing listing...");

    try {
      // 1. Delete all images from storage / Cloudflare R2
      for (const img of images) {
        if (img.preview) {
          await deleteStorageImage(img.preview);
        }
      }
      if (studioImage?.preview) {
        await deleteStorageImage(studioImage.preview);
      }

      // 2. Delete product from Supabase database
      const { error } = await supabase.from("products").delete().eq("id", editingProductId);
      if (error) throw error;

      // Clean up studio registry
      try {
        const updatedRegistry = { ...studioImagesRegistry };
        delete updatedRegistry[editingProductId];
        setStudioImagesRegistry(updatedRegistry);
        await supabase.from("site_content").upsert({
          id: "studio_rug_images",
          data: updatedRegistry,
        });
      } catch { }

      alert("Listing and all its photos have been deleted successfully!");
      resetForm();
    } catch (err: any) {
      alert("Failed to delete listing: " + err.message);
    } finally {
      setLoadingAction(null);
      setStatusMsg("");
    }
  };

  const [globalUsdRate, setGlobalUsdRate] = useState<string>("45.00");
  const [initialUsdRate, setInitialUsdRate] = useState<string>("45.00");
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [rateSavedSuccess, setRateSavedSuccess] = useState(false);

  // Payment Gateways Config State
  const [paymentConfig, setPaymentConfig] = useState({
    razorpay_key_id: "",
    razorpay_key_secret: "",
    razorpay_enabled: true,
    payoneer_email: "",
    payoneer_account_name: "NR Enterprises Carpets Atelier",
    payoneer_payment_url: "",
    payoneer_details: "Payoneer Receiving Account (USD / EUR / GBP)",
    payoneer_enabled: true,
  });
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [paymentSavedSuccess, setPaymentSavedSuccess] = useState(false);

  // Dynamic Filter Settings State (Admin Customizable)
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [isSavingFilters, setIsSavingFilters] = useState(false);
  const [filterSavedSuccess, setFilterSavedSuccess] = useState(false);

  // Filter Quick Add Inputs
  const [newTypeInput, setNewTypeInput] = useState("");
  const [newMaterialInput, setNewMaterialInput] = useState("");
  const [newColorNameInput, setNewColorNameInput] = useState("");
  const [newColorHexInput, setNewColorHexInput] = useState("#C19A6B");
  const [newPatternInput, setNewPatternInput] = useState("");
  const [newShapeInput, setNewShapeInput] = useState("");

  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Navigation View State: "listings" | "filters" | "blogs" | "payments" | "inquiries" | "etsy_deleted" | "hero_slides"
  const [adminView, setAdminView] = useState<"listings" | "filters" | "blogs" | "payments" | "inquiries" | "etsy_deleted" | "hero_slides">("listings");

  const [showCelebration, setShowCelebration] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const defaultCategories = [
    "Braided (rPET)",
    "Jute & Natural Fiber",
    "Hand-Tufted",
    "Flatweave & Dhurrie",
    "Hand-Knotted",
    "Shag & High Pile",
    "Kilim",
    "Outdoor & Washable",
    "Vintage & Distressed",
    "Modern & Minimalist",
    "Rectangle",
    "Round",
    "Oval",
    "Runner"
  ];

  const defaultShapes = [
    "Rectangular",
    "Round",
    "Oval",
    "Runner",
    "Square"
  ];

  const defaultMaterials = [
    "100% Recycled PET (rPET)",
    "Natural Jute / Plant Fiber",
    "Pure New Zealand Wool",
    "Organic Cotton Blend",
    "Wool & Bamboo Silk Blend",
    "Pure Viscose / Silk",
    "Jute & Wool Blend",
    "Hemp & Wool Blend",
    "Chenille & Cotton"
  ];

  const initialFormState = {
    name: "", original_name: "", sku: "", quantity: "1",
    category: "Braided (rPET)", custom_category: "",
    color: "", shape: "Rectangular", custom_shape: "", style: "", room: "", pattern: "",
    material: "100% Recycled PET (rPET)", custom_material: "",
    tags: "", features: "100% Reversible, Shed-free, Stain-resistant, Wool-like soft feel", description: "",
    processing_type: "Made to Order",
    care_instructions: "Spot clean or hose wash. Do not machine wash.", processing_time: "2-3 business days", return_policy: "Returns accepted within 14 days",
    is_customizable: false,
    customization_surcharge: "20",
    free_delivery: false,
    show_etsy: false,
    etsy_url: "",
    markup_percent: "",
    discount_percent: "",
    related_products: [] as string[],
    variants: [{ dimensions: "3 x 5", unit: "ft", price: "4500" }]
  };

  const [formData, setFormData] = useState(initialFormState);

  // Current Listing JSON for Quick Paste in Edit Mode
  const currentListingJsonString = useMemo(() => {
    if (!formData.name) return "";
    return JSON.stringify({
      name: formData.name,
      original_name: formData.original_name || undefined,
      category: formData.category === "Custom" ? formData.custom_category : formData.category,
      material: formData.material === "Custom" ? formData.custom_material : formData.material,
      color: formData.color,
      shape: formData.shape === "Custom" ? formData.custom_shape : formData.shape,
      style: formData.style,
      room: formData.room,
      pattern: formData.pattern,
      sku: formData.sku,
      quantity: formData.quantity,
      description: formData.description,
      features: formData.features,
      care_instructions: formData.care_instructions,
      processing_time: formData.processing_time,
      return_policy: formData.return_policy,
      tags: formData.tags,
      is_customizable: formData.is_customizable,
      customization_surcharge: formData.customization_surcharge,
      markup_percent: formData.markup_percent,
      discount_percent: formData.discount_percent,
      variants: formData.variants.map((v) => ({
        dimensions: v.dimensions,
        unit: v.unit,
        price: v.price
      })),
      images: images.filter(img => img.preview && !img.preview.startsWith("blob:")).map(img => img.preview),
      studio_image: studioImage?.preview && !studioImage.preview.startsWith("blob:") ? studioImage.preview : undefined,
      color_variants: colorVariants.length > 0 ? colorVariants : undefined
    }, null, 2);
  }, [formData, images, studioImage, colorVariants]);

  const fetchData = async () => {
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, images, price, original_price, sku, category, sizes, variants")
        .order("created_at", { ascending: false });
      if (products) setAvailableProducts(products);

      const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
      if (settings && settings.usd_rate) {
        setGlobalUsdRate(settings.usd_rate.toString());
        setInitialUsdRate(settings.usd_rate.toString());
      }

      const { data: contentData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "payment_settings")
        .maybeSingle();

      if (contentData?.data) {
        setPaymentConfig((prev) => ({ ...prev, ...contentData.data }));
      } else if (settings) {
        setPaymentConfig((prev) => ({
          ...prev,
          razorpay_key_id: settings.razorpay_key_id || "",
          razorpay_key_secret: settings.razorpay_key_secret || "",
        }));
      }

      // Load Contact Inquiries
      const { data: inqData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "contact_inquiries")
        .maybeSingle();

      if (inqData?.data?.list) {
        setInquiries(inqData.data.list);
      }

      // Load Filter Settings
      const { data: filterData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "filter_settings")
        .maybeSingle();

      if (filterData?.data) {
        setFilterSettings({
          types: filterData.data.types || DEFAULT_FILTER_SETTINGS.types,
          materials: filterData.data.materials || DEFAULT_FILTER_SETTINGS.materials,
          colors: filterData.data.colors || DEFAULT_FILTER_SETTINGS.colors,
          patterns: filterData.data.patterns || DEFAULT_FILTER_SETTINGS.patterns,
          shapes: filterData.data.shapes || DEFAULT_FILTER_SETTINGS.shapes,
        });
      }

      // Load Studio Rug Images Registry
      const { data: studioRegData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "studio_rug_images")
        .maybeSingle();

      if (studioRegData?.data) {
        setStudioImagesRegistry(studioRegData.data);
      }

      // Load Color Variants Registry
      const { data: colorRegData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "product_color_variants")
        .maybeSingle();

      if (colorRegData?.data) {
        setColorVariantsRegistry(colorRegData.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("etsy_connected") === "true") {
        alert("🎉 Etsy Shop Connected Successfully! Direct Draft push is now active.");
        window.history.replaceState({}, "", "/admin");
      } else if (params.get("etsy_error")) {
        alert("Etsy Connection Note: " + params.get("etsy_error"));
        window.history.replaceState({}, "", "/admin");
      }
    }
  }, []);

  // 🌟 Filter Settings CRUD Handlers
  const handleAddType = () => {
    if (!newTypeInput.trim()) return;
    if (filterSettings.types.some(t => t.toLowerCase() === newTypeInput.trim().toLowerCase())) {
      alert("This category/type already exists.");
      return;
    }
    setFilterSettings(prev => ({ ...prev, types: [...prev.types, newTypeInput.trim()] }));
    setNewTypeInput("");
  };

  const handleDeleteType = (indexToRemove: number) => {
    setFilterSettings(prev => ({
      ...prev,
      types: prev.types.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddMaterial = () => {
    if (!newMaterialInput.trim()) return;
    if (filterSettings.materials.some(m => m.toLowerCase() === newMaterialInput.trim().toLowerCase())) {
      alert("This material already exists.");
      return;
    }
    setFilterSettings(prev => ({ ...prev, materials: [...prev.materials, newMaterialInput.trim()] }));
    setNewMaterialInput("");
  };

  const handleDeleteMaterial = (indexToRemove: number) => {
    setFilterSettings(prev => ({
      ...prev,
      materials: prev.materials.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddColor = () => {
    if (!newColorNameInput.trim()) return;
    if (filterSettings.colors.some(c => c.name.toLowerCase() === newColorNameInput.trim().toLowerCase())) {
      alert("This color already exists.");
      return;
    }
    setFilterSettings(prev => ({
      ...prev,
      colors: [...prev.colors, { name: newColorNameInput.trim(), hex: newColorHexInput }]
    }));
    setNewColorNameInput("");
  };

  const handleDeleteColor = (indexToRemove: number) => {
    setFilterSettings(prev => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddPattern = () => {
    if (!newPatternInput.trim()) return;
    if (filterSettings.patterns.some(p => p.toLowerCase() === newPatternInput.trim().toLowerCase())) {
      alert("This pattern already exists.");
      return;
    }
    setFilterSettings(prev => ({ ...prev, patterns: [...prev.patterns, newPatternInput.trim()] }));
    setNewPatternInput("");
  };

  const handleDeletePattern = (indexToRemove: number) => {
    setFilterSettings(prev => ({
      ...prev,
      patterns: prev.patterns.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddShape = () => {
    if (!newShapeInput.trim()) return;
    if (filterSettings.shapes.some(s => s.toLowerCase() === newShapeInput.trim().toLowerCase())) {
      alert("This shape already exists.");
      return;
    }
    setFilterSettings(prev => ({ ...prev, shapes: [...prev.shapes, newShapeInput.trim()] }));
    setNewShapeInput("");
  };

  const handleDeleteShape = (indexToRemove: number) => {
    setFilterSettings(prev => ({
      ...prev,
      shapes: prev.shapes.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleResetFiltersToDefault = () => {
    if (confirm("Reset all filter options to factory defaults?")) {
      setFilterSettings(DEFAULT_FILTER_SETTINGS);
    }
  };

  const handleSaveFilterSettings = async () => {
    setIsSavingFilters(true);
    try {
      const { error } = await supabase.from("site_content").upsert({
        id: "filter_settings",
        data: filterSettings,
      });
      if (error) throw error;
      setFilterSavedSuccess(true);
      setTimeout(() => setFilterSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving filter settings: " + (err.message || err));
    } finally {
      setIsSavingFilters(false);
    }
  };

  const saveGlobalRate = async () => {
    setIsSavingRate(true);
    await supabase.from("store_settings").upsert({ id: 1, usd_rate: parseFloat(globalUsdRate) });
    setInitialUsdRate(globalUsdRate);
    setIsSavingRate(false);
    setRateSavedSuccess(true);
    setTimeout(() => setRateSavedSuccess(false), 3000);
  };

  const savePaymentSettings = async () => {
    setIsSavingPayments(true);
    try {
      await supabase.from("site_content").upsert({
        id: "payment_settings",
        data: paymentConfig,
      });

      try {
        await supabase.from("store_settings").upsert({
          id: 1,
          usd_rate: parseFloat(globalUsdRate),
          razorpay_key_id: paymentConfig.razorpay_key_id,
          razorpay_key_secret: paymentConfig.razorpay_key_secret,
        });
      } catch (e) {
        // optional column
      }

      setPaymentSavedSuccess(true);
      setTimeout(() => setPaymentSavedSuccess(false), 3000);
    } catch (e: any) {
      alert("Error saving payment settings: " + e.message);
    } finally {
      setIsSavingPayments(false);
    }
  };

  const handleDeleteInquiry = async (indexToDelete: number) => {
    const updated = inquiries.filter((_, idx) => idx !== indexToDelete);
    setInquiries(updated);
    try {
      await supabase.from("site_content").upsert({
        id: "contact_inquiries",
        data: { list: updated },
      });
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  const handleClearAllInquiries = async () => {
    if (!confirm("Are you sure you want to clear all customer inquiries?")) return;
    setInquiries([]);
    try {
      await supabase.from("site_content").upsert({
        id: "contact_inquiries",
        data: { list: [] },
      });
    } catch (err) {
      console.error("Error clearing inquiries:", err);
    }
  };

  const parseSizeStr = (sizeStr: string) => {
    const match = sizeStr.match(/(.*?)\s*(ft|cm|m|in)$/i);
    if (match) return { dimensions: match[1].trim(), unit: match[2].toLowerCase() };
    return { dimensions: sizeStr.trim(), unit: "ft" };
  };

  const loadProductForEdit = async (productId: string) => {
    setEditingProductId(productId);
    if (!productId) {
      resetForm();
      return;
    }

    setLoadingAction("load");
    setStatusMsg("Loading product specifications & photos...");
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
      if (error) throw error;
      if (data) {
        let loadedVariants = [];
        if (data.variants && data.variants.length > 0) {
          loadedVariants = data.variants.map((v: any) => ({
            ...parseSizeStr(v.size || ""),
            price: v.base_price ? v.base_price.toString().replace(/[^0-9.]/g, "") : (v.price ? v.price.toString().replace(/[^0-9.]/g, "") : "")
          }));
        } else {
          loadedVariants = [{ ...parseSizeStr(data.sizes?.[0] || ""), price: data.price ? data.price.replace(/[^0-9.]/g, "") : "" }];
        }

        const isCustomCategory = Boolean(data.category && !defaultCategories.includes(data.category));
        const isCustomShape = Boolean(data.shape && !defaultShapes.includes(data.shape));
        const isCustomMaterial = Boolean(data.material && !defaultMaterials.includes(data.material));

        setFormData({
          name: data.name || "",
          original_name: data.original_name || "",
          sku: data.sku || "",
          quantity: data.stock_quantity?.toString() || "1",
          category: isCustomCategory ? "Custom" : (data.category || defaultCategories[0]),
          custom_category: isCustomCategory ? data.category : "",
          color: data.color || "",
          shape: isCustomShape ? "Custom" : (data.shape || defaultShapes[0]),
          custom_shape: isCustomShape ? data.shape : "",
          style: data.style || "",
          room: data.room || "",
          pattern: data.pattern || "",
          material: isCustomMaterial ? "Custom" : (data.material || defaultMaterials[0]),
          custom_material: isCustomMaterial ? data.material : "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
          features: Array.isArray(data.features) ? data.features.join(", ") : (data.features || ""),
          description: data.description || "",
          processing_type: data.processing_type || "Made to Order",
          care_instructions: data.care_instructions || "",
          processing_time: data.processing_time || "",
          return_policy: data.return_policy || "",
          is_customizable: data.is_customizable || false,
          customization_surcharge: data.customization_surcharge?.toString() || "20",
          free_delivery: data.free_delivery || false,
          show_etsy: data.show_etsy || false,
          etsy_url: data.etsy_url || "",
          markup_percent: data.markup_percent?.toString() || data.variants?.[0]?.markup_percent?.toString() || "",
          discount_percent: data.discount_percent?.toString() || data.variants?.[0]?.discount_percent?.toString() || "",
          related_products: data.related_products || [],
          variants: loadedVariants.length > 0 ? loadedVariants : [{ dimensions: "3 x 5", unit: "ft", price: "4500" }]
        });

        if (data.images && Array.isArray(data.images)) {
          setImages(data.images.map((url: string) => ({ id: Math.random().toString(36).substring(2, 9), file: null, preview: url, isExisting: true })));
        } else {
          setImages([]);
        }

        // Load Studio Image if configured
        let loadedStudioImg = data.studio_image || data.variants?.[0]?.studio_image || "";
        if (!loadedStudioImg && studioImagesRegistry[productId]) {
          loadedStudioImg = studioImagesRegistry[productId];
        }
        if (!loadedStudioImg) {
          try {
            const { data: sReg } = await supabase.from("site_content").select("data").eq("id", "studio_rug_images").maybeSingle();
            if (sReg?.data?.[productId]) {
              loadedStudioImg = sReg.data[productId];
            }
          } catch { }
        }

        if (loadedStudioImg) {
          setStudioImage({
            id: "studio_" + Math.random().toString(36).substring(2, 9),
            file: null,
            preview: loadedStudioImg,
            isExisting: true,
          });
        } else {
          setStudioImage(null);
        }

        // Load Color Variants if configured
        let loadedColorVariants = data.color_variants || data.variants?.[0]?.color_variants || [];
        if ((!loadedColorVariants || loadedColorVariants.length === 0) && colorVariantsRegistry[productId]) {
          loadedColorVariants = colorVariantsRegistry[productId];
        }
        if (!loadedColorVariants || loadedColorVariants.length === 0) {
          try {
            const { data: cReg } = await supabase.from("site_content").select("data").eq("id", "product_color_variants").maybeSingle();
            if (cReg?.data?.[productId]) {
              loadedColorVariants = cReg.data[productId];
            }
          } catch { }
        }
        setColorVariants(Array.isArray(loadedColorVariants) ? loadedColorVariants : []);
      }
    } catch (err: any) {
      alert("Failed to load: " + err.message);
    } finally {
      setLoadingAction(null);
      setStatusMsg("");
    }
  };

  // 🌟 Etsy-Style One-Click Copy / Duplicate Listing
  const duplicateProductListing = async (productId: string) => {
    if (!productId) return;
    setLoadingAction("copy");
    setStatusMsg("Cloning listing details, variants & photos (Etsy style)...");
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
      if (error) throw error;
      if (data) {
        let loadedVariants = [];
        if (data.variants && data.variants.length > 0) {
          loadedVariants = data.variants.map((v: any) => ({
            ...parseSizeStr(v.size || ""),
            price: v.base_price ? v.base_price.toString().replace(/[^0-9.]/g, "") : (v.price ? v.price.toString().replace(/[^0-9.]/g, "") : "")
          }));
        } else {
          loadedVariants = [{ ...parseSizeStr(data.sizes?.[0] || ""), price: data.price ? data.price.replace(/[^0-9.]/g, "") : "" }];
        }

        const isCustomCategory = Boolean(data.category && !defaultCategories.includes(data.category));
        const isCustomShape = Boolean(data.shape && !defaultShapes.includes(data.shape));
        const isCustomMaterial = Boolean(data.material && !defaultMaterials.includes(data.material));

        setFormData({
          name: `${data.name || "Handcrafted Rug"} (Copy)`,
          original_name: data.original_name ? `${data.original_name} (Copy)` : "",
          sku: data.sku ? `${data.sku}-COPY` : "",
          quantity: data.stock_quantity?.toString() || "1",
          category: isCustomCategory ? "Custom" : (data.category || defaultCategories[0]),
          custom_category: isCustomCategory ? data.category : "",
          color: data.color || "",
          shape: isCustomShape ? "Custom" : (data.shape || defaultShapes[0]),
          custom_shape: isCustomShape ? data.shape : "",
          style: data.style || "",
          room: data.room || "",
          pattern: data.pattern || "",
          material: isCustomMaterial ? "Custom" : (data.material || defaultMaterials[0]),
          custom_material: isCustomMaterial ? data.material : "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
          features: Array.isArray(data.features) ? data.features.join(", ") : (data.features || ""),
          description: data.description || "",
          processing_type: data.processing_type || "Made to Order",
          care_instructions: data.care_instructions || "",
          processing_time: data.processing_time || "",
          return_policy: data.return_policy || "",
          is_customizable: data.is_customizable || false,
          customization_surcharge: data.customization_surcharge?.toString() || "20",
          free_delivery: data.free_delivery || false,
          show_etsy: data.show_etsy || false,
          etsy_url: data.etsy_url || "",
          markup_percent: data.markup_percent?.toString() || data.variants?.[0]?.markup_percent?.toString() || "",
          discount_percent: data.discount_percent?.toString() || data.variants?.[0]?.discount_percent?.toString() || "",
          related_products: data.related_products || [],
          variants: loadedVariants.length > 0 ? loadedVariants : [{ dimensions: "3 x 5", unit: "ft", price: "4500" }]
        });

        if (data.images && Array.isArray(data.images)) {
          setImages(data.images.map((url: string) => ({ id: Math.random().toString(36).substring(2, 9), file: null, preview: url, isExisting: true })));
        } else {
          setImages([]);
        }

        // Studio Image
        let loadedStudioImg = data.studio_image || data.variants?.[0]?.studio_image || "";
        if (!loadedStudioImg && studioImagesRegistry[productId]) {
          loadedStudioImg = studioImagesRegistry[productId];
        }
        if (!loadedStudioImg) {
          try {
            const { data: sReg } = await supabase.from("site_content").select("data").eq("id", "studio_rug_images").maybeSingle();
            if (sReg?.data?.[productId]) {
              loadedStudioImg = sReg.data[productId];
            }
          } catch { }
        }

        if (loadedStudioImg) {
          setStudioImage({
            id: "studio_" + Math.random().toString(36).substring(2, 9),
            file: null,
            preview: loadedStudioImg,
            isExisting: true,
          });
        } else {
          setStudioImage(null);
        }

        // Color Variants
        let loadedColorVariants = data.color_variants || data.variants?.[0]?.color_variants || [];
        if ((!loadedColorVariants || loadedColorVariants.length === 0) && colorVariantsRegistry[productId]) {
          loadedColorVariants = colorVariantsRegistry[productId];
        }
        if (!loadedColorVariants || loadedColorVariants.length === 0) {
          try {
            const { data: cReg } = await supabase.from("site_content").select("data").eq("id", "product_color_variants").maybeSingle();
            if (cReg?.data?.[productId]) {
              loadedColorVariants = cReg.data[productId];
            }
          } catch { }
        }
        setColorVariants(Array.isArray(loadedColorVariants) ? loadedColorVariants : []);

        // 🌟 Switch to CREATE mode and clear editingProductId (Brand New Listing)
        setMode("create");
        setEditingProductId("");
        setDuplicatedFromTitle(data.name || "Selected Rug");
        setShowCelebration(false);
        setNewlyCreatedId(null);

        // Smooth scroll to form
        setTimeout(() => {
          const formEl = document.getElementById("admin-listing-form");
          if (formEl) {
            formEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    } catch (err: any) {
      alert("Failed to duplicate listing: " + err.message);
    } finally {
      setLoadingAction(null);
      setStatusMsg("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { dimensions: "", unit: "ft", price: "" }] });

  const removeVariant = (index: number) => {
    if (formData.variants.length === 1) return alert("Must have at least one size variant.");
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  // 🎨 Color Variations Handlers
  const handleAddColorVariant = () => {
    if (!newColorName.trim()) {
      alert("Please enter a color name (e.g. Olive Green, Beige, Terracotta)");
      return;
    }
    setColorVariants((prev) => [
      ...prev,
      {
        color: newColorName.trim(),
        image: newColorImage.trim(),
        hex: newColorHex,
      },
    ]);
    setNewColorName("");
    setNewColorImage("");
  };

  const handleRemoveColorVariant = (idx: number) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== idx));
  };


  // 🌟 AI / Code Quick Paste Auto-Fill Handler
  const handleApplyQuickPaste = (data: {
    formData: any;
    imageUrls?: string[];
    studioImageUrl?: string;
  }) => {
    setFormData(data.formData);

    // If images were included in the quick paste data, attach them directly
    if (data.imageUrls && data.imageUrls.length > 0) {
      const attachedImages: ImageFile[] = data.imageUrls.map((url) => ({
        id: "url_" + Math.random().toString(36).substring(2, 9),
        file: null,
        preview: url,
        isExisting: true,
      }));
      setImages(attachedImages);
    }

    // If studio image was included, attach it directly
    if (data.studioImageUrl) {
      setStudioImage({
        id: "studio_" + Math.random().toString(36).substring(2, 9),
        file: null,
        preview: data.studioImageUrl,
        isExisting: true,
      });
    }

    setStatusMsg("✨ Listing fields populated from code! Review and click Publish to save live to Supabase.");
    setTimeout(() => setStatusMsg(""), 6000);
  };

  const handleRelatedProductChange = (productId: string) => {
    setFormData(prev => {
      const isSelected = prev.related_products.includes(productId);
      if (isSelected) return { ...prev, related_products: prev.related_products.filter(id => id !== productId) };
      if (prev.related_products.length >= 4) { alert("Maximum 4 items allowed."); return prev; }
      return { ...prev, related_products: [...prev.related_products, productId] };
    });
  };

  // 🌟 Auto WebP Compress on Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setStatusMsg("Optimizing & converting images to WebP...");

      const processedFiles: ImageFile[] = [];

      for (const file of selectedFiles) {
        const optimizedWebpFile = await compressAndConvertToWebP(file);

        // 🌟 यहाँ पर लॉग जुड़ेगा
        console.log(
          `Image: ${file.name} | Original: ${(file.size / 1024).toFixed(0)} KB -> Compressed: ${(optimizedWebpFile.size / 1024).toFixed(0)} KB`
        );

        processedFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          file: optimizedWebpFile,
          preview: URL.createObjectURL(optimizedWebpFile),
          isExisting: false,
        });
      }

      setImages((prev) => [...prev, ...processedFiles]);
      setStatusMsg("");
    }
  };

  // 🌟 Studio Image File Selection (Dedicated Top-Down Flatlay Shot)
  const handleStudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStatusMsg("Optimizing & converting Studio top-down shot to WebP...");
      const optimizedWebpFile = await compressAndConvertToWebP(file);
      setStudioImage({
        id: "studio_" + Math.random().toString(36).substring(2, 9),
        file: optimizedWebpFile,
        preview: URL.createObjectURL(optimizedWebpFile),
        isExisting: false,
      });
      setStatusMsg("");
    }
  };

  const handleDragStart = (e: React.DragEvent, position: number) => { dragItem.current = position; };
  const handleDragEnter = (e: React.DragEvent, position: number) => { dragOverItem.current = position; };
  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const copyImages = [...images];
      const dragItemContent = copyImages[dragItem.current];
      copyImages.splice(dragItem.current, 1);
      copyImages.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setImages(copyImages);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setStudioImage(null);
    setColorVariants([]);
    setNewColorName("");
    setNewColorImage("");
    setDuplicatedFromTitle("");
    setStatusMsg("");
    setShowCelebration(false);
    setNewlyCreatedId(null);
    setEditingProductId("");
    fetchData();
  };

  const submitData = async (statusType: "publish" | "draft") => {
    if (!formData.name.trim()) return alert("Please fill the Carpet Title.");
    if (images.length === 0) return alert("Please add at least 1 image.");
    if (formData.variants.some(v => !v.dimensions || !v.price)) return alert("Please fill all size dimensions and prices.");

    const finalCategory = formData.category === "Custom" ? formData.custom_category.trim() : formData.category;
    if (!finalCategory) return alert("Please specify a category.");

    const finalShape = formData.shape === "Custom" ? formData.custom_shape.trim() : formData.shape;
    const finalMaterial = formData.material === "Custom" ? formData.custom_material.trim() : formData.material;

    setLastSubmittedStatus(statusType);
    setLoadingAction(statusType);
    setStatusMsg(
      statusType === "publish"
        ? "Uploading files & synchronizing live to NR Enterprises..."
        : "Saving listing as a draft..."
    );

    try {
      const finalImageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.isExisting) {
          finalImageUrls.push(img.preview);
        } else if (img.file) {
          setStatusMsg(`Optimizing & uploading image ${i + 1} of ${images.length} to Cloudflare R2...`);
          const compressed = await compressAndConvertToWebP(img.file);

          let uploadedUrl: string | null = null;
          try {
            const uploadFormData = new FormData();
            uploadFormData.append("file", compressed);
            const res = await fetch("/api/r2-upload", {
              method: "POST",
              body: uploadFormData,
            });
            const data = await res.json();
            if (res.ok && data.success && data.url) {
              uploadedUrl = data.url;
            }
          } catch (r2Err) {
            console.warn("R2 upload error, falling back to Supabase:", r2Err);
          }

          if (uploadedUrl) {
            finalImageUrls.push(uploadedUrl);
          } else {
            // Fallback to Supabase Storage
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
            const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, compressed, {
              contentType: "image/webp",
              cacheControl: "31536000",
            });
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
            finalImageUrls.push(publicUrlData.publicUrl);
          }
        }
      }

      // 🌟 Upload Dedicated Studio Top-Down Shot if present
      let finalStudioImageUrl: string | null = null;
      if (studioImage) {
        if (studioImage.isExisting) {
          finalStudioImageUrl = studioImage.preview;
        } else if (studioImage.file) {
          setStatusMsg("Optimizing & uploading Studio top-down shot to Cloudflare R2...");
          const compressed = await compressAndConvertToWebP(studioImage.file);
          try {
            const uploadFormData = new FormData();
            uploadFormData.append("file", compressed);
            const res = await fetch("/api/r2-upload", {
              method: "POST",
              body: uploadFormData,
            });
            const data = await res.json();
            if (res.ok && data.success && data.url) {
              finalStudioImageUrl = data.url;
            }
          } catch (r2Err) {
            console.warn("R2 upload error for studio image:", r2Err);
          }

          if (!finalStudioImageUrl) {
            // Fallback to Supabase Storage
            const fileName = `studio-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
            const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, compressed, {
              contentType: "image/webp",
              cacheControl: "31536000",
            });
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
              finalStudioImageUrl = publicUrlData.publicUrl;
            }
          }
        }
      }

      const markup = parseFloat(formData.markup_percent) || 0;
      const discount = parseFloat(formData.discount_percent) || 0;

      const constructedVariants = formData.variants.map((v, idx) => {
        const rawBase = parseFloat(v.price) || 0;
        const mrpPrice = markup > 0 ? Math.round(rawBase * (1 + markup / 100)) : rawBase;
        const finalSellingPrice = discount > 0 ? Math.round(mrpPrice * (1 - discount / 100)) : mrpPrice;

        return {
          size: `${v.dimensions.trim()} ${v.unit}`,
          base_price: rawBase.toString(),
          original_price: mrpPrice > finalSellingPrice ? mrpPrice.toString() : (markup > 0 ? mrpPrice.toString() : null),
          price: finalSellingPrice.toString(),
          markup_percent: markup,
          discount_percent: discount,
          studio_image: idx === 0 ? finalStudioImageUrl : undefined,
          color_variants: idx === 0 ? colorVariants : undefined,
        };
      });

      const basePrice = constructedVariants[0]?.price || "0";
      const baseOriginalPrice = constructedVariants[0]?.original_price || null;
      const sizesArray = constructedVariants.map(v => v.size);
      const tagsArray = formData.tags ? formData.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const featuresArray = formData.features ? formData.features.split(",").map((s) => s.trim()).filter(Boolean) : [];

      const productPayload: any = {
        name: formData.name,
        original_name: formData.original_name,
        price: `₹${basePrice}`,
        original_price: baseOriginalPrice ? `₹${baseOriginalPrice}` : null,
        markup_percent: markup,
        discount_percent: discount,
        sizes: sizesArray,
        variants: constructedVariants,
        sku: formData.sku,
        stock_quantity: parseInt(formData.quantity) || 1,
        category: finalCategory,
        color: formData.color,
        shape: finalShape || "Rectangular",
        style: formData.style,
        room: formData.room,
        pattern: formData.pattern,
        material: finalMaterial || "100% Recycled PET (rPET)",
        tags: tagsArray,
        features: featuresArray,
        description: formData.description,
        processing_type: formData.processing_type,
        care_instructions: formData.care_instructions,
        processing_time: formData.processing_time,
        return_policy: formData.return_policy,
        is_customizable: formData.is_customizable,
        customization_surcharge: parseFloat(formData.customization_surcharge) || 20,
        free_delivery: formData.free_delivery,
        show_etsy: formData.show_etsy,
        etsy_url: formData.etsy_url.trim(),
        images: finalImageUrls,
        studio_image: finalStudioImageUrl,
        related_products: formData.related_products,
        status: statusType === "publish" ? "published" : "draft"
      };

      let submittedId = null;

      const performSave = async (payload: any) => {
        if (mode === "create") {
          return await supabase.from("products").insert([payload]).select("id").maybeSingle();
        } else {
          return await supabase.from("products").update(payload).eq("id", editingProductId).select("id").maybeSingle();
        }
      };

      let saveResult = await performSave(productPayload);

      // If database is missing top-level columns (markup_percent/discount_percent/original_price/studio_image), retry without them safely
      if (saveResult.error && (saveResult.error.message?.includes("column") || saveResult.error.message?.includes("schema cache") || saveResult.error.message?.includes("Could not find"))) {
        console.warn("Retrying database save with safe schema payload...", saveResult.error.message);
        const { original_price, markup_percent, discount_percent, studio_image: sImg, ...safePayload } = productPayload;
        saveResult = await performSave(safePayload);
      }

      if (saveResult.error) throw saveResult.error;
      submittedId = saveResult.data?.id || editingProductId;

      if (submittedId) {
        setNewlyCreatedId(submittedId);
        // Persist studio image in site_content registry
        try {
          const updatedRegistry = { ...studioImagesRegistry };
          if (finalStudioImageUrl) {
            updatedRegistry[submittedId] = finalStudioImageUrl;
          } else {
            delete updatedRegistry[submittedId];
          }
          setStudioImagesRegistry(updatedRegistry);
          await supabase.from("site_content").upsert({
            id: "studio_rug_images",
            data: updatedRegistry,
          });
        } catch (regErr) {
          console.warn("Failed to update studio image registry:", regErr);
        }

        // Persist color variants in site_content registry
        try {
          const updatedColorReg = { ...colorVariantsRegistry };
          if (colorVariants && colorVariants.length > 0) {
            updatedColorReg[submittedId] = colorVariants;
          } else {
            delete updatedColorReg[submittedId];
          }
          setColorVariantsRegistry(updatedColorReg);
          await supabase.from("site_content").upsert({
            id: "product_color_variants",
            data: updatedColorReg,
          });
        } catch (cRegErr) {
          console.warn("Failed to update color variants registry:", cRegErr);
        }
      }

      setLoadingAction(null);
      setShowCelebration(true);

    } catch (err: any) {
      console.error(err);
      alert(`Error saving listing: ${err.message || 'Please check database fields'}`);
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen pt-4 sm:pt-6 md:pt-8 pb-24 px-3 sm:px-6 md:px-8 lg:px-10 relative">
      <div className="max-w-[1180px] w-full mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-[#E5DDD2]">

        {/* 🌟 1. TOP HEADER (TITLE & QUICK ACTIONS) */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAEAEB] pb-5">
          <div>
            <span className="text-[#C19A6B] uppercase tracking-[0.2em] font-semibold text-xs block mb-1">
              NR Enterprises Studio CMS
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1C1917]">
              {adminView === "listings" && "Listing Management"}
              {adminView === "filters" && "Filter Options & Taxonomy Manager"}
              {adminView === "blogs" && "Editorial Journal Studio"}
              {adminView === "payments" && "Payment Gateways Configuration"}
              {adminView === "inquiries" && `Customer Inquiries Inbox (${inquiries.length})`}
              {adminView === "etsy_deleted" && "Deleted on Etsy Protection Archive"}
              {adminView === "hero_slides" && "Homepage Hero Carousel (5 Slides)"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Global Currency Rate Box */}
            <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#DFD8CC] px-3.5 py-1.5 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-[#6B6054] uppercase tracking-wider">
                1 USD =
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[#6B6054] font-medium text-xs">₹</span>
                <input
                  type="number"
                  value={globalUsdRate}
                  onChange={(e) => setGlobalUsdRate(e.target.value)}
                  className="w-16 text-xs font-semibold text-[#C19A6B] border-b border-[#DFD8CC] focus:outline-none focus:border-[#C19A6B] text-center bg-transparent py-0.5"
                />
              </div>
              {globalUsdRate !== initialUsdRate && !rateSavedSuccess && (
                <button
                  type="button"
                  onClick={saveGlobalRate}
                  disabled={isSavingRate}
                  className="text-[10px] uppercase bg-[#1C1917] text-white px-2.5 py-1 rounded-lg hover:bg-[#C19A6B] transition-colors cursor-pointer font-bold"
                >
                  {isSavingRate ? "..." : "Save"}
                </button>
              )}
              {rateSavedSuccess && (
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">
                  Saved ✔
                </span>
              )}
            </div>

            {/* Edit Web CMS Link */}
            <Link
              href="/admin/content"
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#1C1917] text-[#FAFAFA] hover:bg-[#C19A6B] transition-colors rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Edit Web CMS</span>
              <span className="text-xs">↗</span>
            </Link>
          </div>
        </div>

        {/* 🌟 2. DEDICATED FULL-WIDTH TAB NAVIGATION BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8 bg-[#FAFAFA] p-2 rounded-2xl border border-[#E5DDD2] shadow-2xs">
          {/* Tab 1: Product Listings */}
          <button
            type="button"
            onClick={() => setAdminView("listings")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "listings"
                ? "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
          >
            <span>🏷️ Listings</span>
          </button>

          {/* Tab 2: Manage Filters */}
          <button
            type="button"
            onClick={() => setAdminView("filters")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "filters"
                ? "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
          >
            <span>⚙️ Filters</span>
          </button>

          {/* Tab 3: Manage Blogs */}
          <button
            type="button"
            onClick={() => setAdminView("blogs")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "blogs"
                ? "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
          >
            <span>📰 Blogs</span>
          </button>

          {/* Tab 4: Payment Gateways */}
          <button
            type="button"
            onClick={() => setAdminView("payments")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "payments"
                ? "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
          >
            <span>💳 Payments</span>
          </button>

          {/* Tab 5: Customer Inquiries */}
          <button
            type="button"
            onClick={() => setAdminView("inquiries")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "inquiries"
                ? "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
          >
            <span>📬 Inquiries</span>
            {inquiries.length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${adminView === "inquiries" ? "bg-[#C19A6B] text-white" : "bg-[#8C7A63] text-white"
                }`}>
                {inquiries.length}
              </span>
            )}
          </button>

          {/* Tab 6: Deleted on Etsy Protection Archive */}
          <button
            type="button"
            onClick={() => setAdminView("etsy_deleted")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "etsy_deleted"
                ? "bg-[#1C1917] text-[#FAFAFA] shadow-md border-b-2 border-amber-600"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
            title="Items deleted/inactive on Etsy but safely preserved on NR Enterprises"
          >
            <span>🗑️ Deleted on Etsy</span>
          </button>

          {/* Tab 7: 5 Hero Slides Manager */}
          <button
            type="button"
            onClick={() => setAdminView("hero_slides")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${adminView === "hero_slides"
                ? "bg-[#4A1017] text-[#FAFAFA] shadow-md border-b-2 border-[#C19A6B]"
                : "text-[#7A7065] hover:text-[#1C1917] hover:bg-white"
              }`}
            title="Edit 5 Homepage Hero Carousel Images from PC"
          >
            <span>🖼️ 5 Hero Slides</span>
          </button>

          {/* Tab 8: Web Page & Home Edit CMS */}
          <Link
            href="/admin/content"
            className="py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-gradient-to-r from-[#2A241F] to-[#1C1917] text-[#FAFAFA] hover:bg-[#C19A6B] shadow-md border-b-2 border-[#C19A6B]"
            title="Edit Home and all Web Page Content & Images"
          >
            <span>🌐 Web Edit CMS</span>
            <span className="text-[10px]">↗</span>
          </Link>
        </div>

        {/* 🌟 3. LISTINGS SUB-NAVIGATION (CREATE NEW vs EDIT EXISTING) */}
        {adminView === "listings" && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#EAEAEB]">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A63]">
                Listing Mode:
              </span>
              <div className="flex bg-[#FAFAFA] p-1 rounded-xl border border-[#DFD8CC]">
                <button
                  type="button"
                  onClick={() => { setMode("create"); resetForm(); }}
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg cursor-pointer ${mode === "create"
                      ? "bg-white text-[#C19A6B] shadow-xs border border-[#DFD8CC]"
                      : "text-[#7A7065] hover:text-[#1C1917]"
                    }`}
                >
                  Create New Listing
                </button>
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg cursor-pointer ${mode === "edit"
                      ? "bg-white text-[#C19A6B] shadow-xs border border-[#DFD8CC]"
                      : "text-[#7A7065] hover:text-[#1C1917]"
                    }`}
                >
                  Edit Existing Listing
                </button>
              </div>
            </div>

            {/* Right: Clean, cohesive luxury Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {mode === "edit" && availableProducts.length > 0 && (
                <span className="text-xs text-[#8C7A63] font-serif italic hidden md:inline mr-1">
                  ({availableProducts.length} published products)
                </span>
              )}

              {/* 1. Etsy Safe Pack Studio */}
              <button
                type="button"
                onClick={() => {
                  const targetId = editingProductId || (availableProducts.length > 0 ? availableProducts[0].id : null);
                  if (!targetId) {
                    alert("Please select a product first or add a product to generate an Etsy Safe Pack.");
                    return;
                  }
                  setPackStudioProductId(targetId);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1C1917] hover:bg-[#3A332C] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer border border-[#1C1917]"
                title="Open Etsy Safe Pack Studio (Micro-grain, Sony EXIF, Bhadohi Geotag, 1-Click ZIP, Push to Etsy)"
              >
                <span>📦</span>
                <span>Safe Pack Studio</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-mono">
                  AI Shield
                </span>
              </button>

              {/* 2. Sync from Etsy */}
              <button
                type="button"
                onClick={() => setIsEtsySyncOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF5F0] hover:bg-[#F3EBE1] text-[#D95314] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-[#E8DCCF]"
                title="Sync listings directly from your Etsy shop (AHADGLOBALRUGS)"
              >
                <span>🛍️</span>
                <span>Sync Etsy</span>
              </button>

              {/* 2.5 Bulk Price Markup */}
              <button
                type="button"
                onClick={() => setIsBulkMarkupOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2B070B] hover:bg-[#3D0C12] text-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs border border-[#4A1017]"
                title="Bulk adjust or markup listing prices across India, US, and Everywhere Else in 1 click"
              >
                <span>⚡</span>
                <span>Bulk Price Markup</span>
              </button>

              {/* 3. AI / Code Quick Paste */}
              <button
                type="button"
                onClick={() => {
                  if (mode === "edit" && !editingProductId) {
                    alert("Please select a product from the dropdown first to view or edit its code.");
                    return;
                  }
                  setIsQuickPasteOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F6F4F0] text-[#1C1917] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-[#DFD8CC]"
                title={mode === "edit" ? "Copy, modify, or paste code to edit this product" : "Paste JSON code to auto-fill new product listing"}
              >
                <span>✨</span>
                <span>{mode === "edit" ? "Code / AI" : "AI Quick Paste"}</span>
              </button>
            </div>
          </div>
        )}

        {/* 🌟 1. EDITORIAL BLOG MANAGER PANEL */}
        {adminView === "blogs" && (
          <BlogManager onClose={() => setAdminView("listings")} />
        )}

        {/* 🌟 2. CUSTOMER INQUIRIES VIEWER PANEL */}
        {adminView === "inquiries" && (
          <div className="mb-10 p-6 bg-[#FAFAFA] border-2 border-[#3A332C]/30 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEAEB] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C19A6B] font-bold block mb-1">
                  Contact Form Messages
                </span>
                <h3 className="font-serif text-xl text-[#3A332C]">Customer Inquiries Inbox ({inquiries.length})</h3>
              </div>
              <div className="flex items-center gap-3">
                {inquiries.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllInquiries}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold uppercase tracking-wider px-2 py-1 border border-red-200 rounded-xs hover:bg-red-50 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAdminView("listings")}
                  className="text-xs text-[#8C7A63] hover:text-[#3A332C] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <p className="text-xs text-[#7A7065] py-6 text-center font-serif text-base">
                No customer inquiries in inbox.
              </p>
            ) : (
              <div className="divide-y divide-[#EAEAEB] max-h-[500px] overflow-y-auto space-y-3 pr-1">
                {inquiries.map((inq: any, idx: number) => {
                  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inq.email || "")}&su=${encodeURIComponent(`Re: NR Enterprises Inquiry - ${inq.name || "Customer"}`)}&body=${encodeURIComponent(`Hi ${inq.name || "there"},\n\nThank you for reaching out to NR Enterprises.\n\n`)}`;

                  return (
                    <div key={idx} className="p-4 bg-white rounded-sm border border-[#DFD8CC] space-y-3 mt-2 shadow-xs hover:shadow-sm transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#3A332C]">{inq.name || "Customer"}</span>
                          <span className="text-xs text-[#C19A6B] font-mono">
                            {inq.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#8C7A63]">
                            {inq.created_at ? new Date(inq.created_at).toLocaleString("en-IN") : ""}
                          </span>
                          {/* Cut / Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInquiry(idx)}
                            title="Delete this message"
                            className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer border border-red-200"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#4A4036] bg-[#FAFAFA] p-3 rounded-xs border border-[#EAEAEB] whitespace-pre-wrap leading-relaxed font-sans">
                        {inq.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(idx)}
                          className="text-[11px] text-red-600 hover:text-red-800 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>🗑️ Delete Message</span>
                        </button>

                        {/* Direct Gmail Web Compose Button */}
                        <a
                          href={gmailComposeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold uppercase tracking-wider bg-[#3A332C] text-white px-4 py-1.5 rounded-xs hover:bg-[#C19A6B] transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>✉️ Reply via Gmail</span>
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 🌟 3. PAYMENT GATEWAY CONFIGURATION PANEL */}
        {adminView === "payments" && (
          <div className="mb-10 p-6 bg-[#FAFAFA] border-2 border-[#C19A6B]/40 rounded-sm shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAEAEB] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C19A6B] font-bold block mb-1">
                  Atelier Payment Infrastructure
                </span>
                <h3 className="font-serif text-xl text-[#3A332C]">Razorpay & Payoneer Settings</h3>
              </div>
              <div className="flex items-center gap-3">
                {paymentSavedSuccess && (
                  <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-xs">
                    Settings Saved Successfully ✔
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setAdminView("listings")}
                  className="text-xs text-[#8C7A63] hover:text-[#3A332C] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* RAZORPAY CONFIG */}
              <div className="bg-white p-5 border border-[#DFD8CC] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base text-[#3A332C] font-bold">Razorpay Gateway</h4>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#8C7A63] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig.razorpay_enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpay_enabled: e.target.checked })}
                    />
                    Enabled
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-1">
                    Razorpay Key ID *
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.razorpay_key_id}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpay_key_id: e.target.value })}
                    placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] font-mono bg-[#FAFAFA]"
                  />
                  <span className="text-[10px] text-[#8C7A63] mt-1 block">
                    Found in Razorpay Dashboard &gt; Settings &gt; API Keys
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-1">
                    Razorpay Key Secret *
                  </label>
                  <input
                    type="password"
                    value={paymentConfig.razorpay_key_secret}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpay_key_secret: e.target.value })}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] font-mono bg-[#FAFAFA]"
                  />
                  <span className="text-[10px] text-[#8C7A63] mt-1 block">
                    Kept strictly secure on server for payment verification.
                  </span>
                </div>
              </div>

              {/* PAYONEER CONFIG */}
              <div className="bg-white p-5 border border-[#DFD8CC] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base text-[#3A332C] font-bold">Payoneer Global</h4>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#8C7A63] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig.payoneer_enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, payoneer_enabled: e.target.checked })}
                    />
                    Enabled
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-1">
                    Payoneer Account Name / Beneficiary
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.payoneer_account_name}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, payoneer_account_name: e.target.value })}
                    placeholder="NR Enterprises Carpets Atelier"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] bg-[#FAFAFA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-1">
                    Payoneer Registered Email
                  </label>
                  <input
                    type="email"
                    value={paymentConfig.payoneer_email}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, payoneer_email: e.target.value })}
                    placeholder="payments@nrenterprises.com"
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] bg-[#FAFAFA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-1">
                    Payoneer Direct Payment Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={paymentConfig.payoneer_payment_url}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, payoneer_payment_url: e.target.value })}
                    placeholder="https://payoneer.com/..."
                    className="w-full border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] bg-[#FAFAFA]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={savePaymentSettings}
                disabled={isSavingPayments}
                className="bg-[#3A332C] text-[#F5F5F7] px-6 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-[#C19A6B] transition-colors rounded-sm shadow-sm disabled:opacity-50"
              >
                {isSavingPayments ? "Saving Gateways..." : "Save Payment Settings"}
              </button>
            </div>
          </div>
        )}

        {/* 🌟 4. DELETED ON ETSY ARCHIVE MANAGER PANEL */}
        {adminView === "etsy_deleted" && (
          <EtsyDeletedManager
            onClose={() => setAdminView("listings")}
            onOpenPackStudio={(productId) => setPackStudioProductId(productId)}
          />
        )}

        {/* 🌟 5. HOMEPAGE HERO CAROUSEL 5 SLIDES MANAGER */}
        {adminView === "hero_slides" && (
          <HeroSlidesManager />
        )}

        {/* 🌟 3. FILTER OPTIONS MANAGEMENT (ONLY WHEN adminView === 'filters') */}
        {adminView === "filters" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEB] pb-4">
              <div>
                <h3 className="text-xl font-serif text-[#3A332C]">
                  Filter Options & Taxonomy Manager
                </h3>
                <p className="text-xs text-[#7A7065] mt-1">
                  Add or delete any Category/Type, Material, Color, Pattern, or Shape. All changes reflect live across the storefront and product listings.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFiltersToDefault}
                  className="px-4 py-2 border border-[#DFD8CC] text-[#7A7065] hover:text-[#3A332C] hover:bg-[#FAFAFA] text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveFilterSettings}
                  disabled={isSavingFilters}
                  className="bg-[#3A332C] text-white px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-[#C19A6B] transition-colors rounded-xs shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSavingFilters ? "Saving..." : "Save Filter Options"}
                </button>
              </div>
            </div>

            {filterSavedSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xs flex items-center justify-between">
                <span>✔ All filter settings saved and published to storefront!</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600">Active</span>
              </div>
            )}

            {/* 1. Types / Categories */}
            <div className="bg-[#FAFAFA] border border-[#DFD8CC] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-[#3A332C] uppercase tracking-wider">
                  1. Rug Categories & Types ({filterSettings.types.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {filterSettings.types.map((type, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-[#DFD8CC] px-3 py-1.5 text-xs text-[#3A332C] rounded-xs shadow-2xs font-medium"
                  >
                    <span>{type}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteType(idx)}
                      className="text-red-400 hover:text-red-700 font-bold text-xs cursor-pointer ml-1"
                      title="Delete category"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddType(); } }}
                  placeholder="Enter new rug type (e.g. Dhurrie, Chatai, Braided)..."
                  className="w-full border border-[#DFD8CC] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#C19A6B]"
                />
                <button
                  type="button"
                  onClick={handleAddType}
                  className="bg-[#3A332C] text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-[#C19A6B] transition-colors rounded-xs cursor-pointer shrink-0"
                >
                  + Add Type
                </button>
              </div>
            </div>

            {/* 2. Materials */}
            <div className="bg-[#FAFAFA] border border-[#DFD8CC] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-[#3A332C] uppercase tracking-wider">
                  2. Material Compositions ({filterSettings.materials.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {filterSettings.materials.map((mat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-[#DFD8CC] px-3 py-1.5 text-xs text-[#3A332C] rounded-xs shadow-2xs font-medium"
                  >
                    <span>{mat}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(idx)}
                      className="text-red-400 hover:text-red-700 font-bold text-xs cursor-pointer ml-1"
                      title="Delete material"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newMaterialInput}
                  onChange={(e) => setNewMaterialInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMaterial(); } }}
                  placeholder="Enter new material (e.g. Cotton, Pure Silk, Wool)..."
                  className="w-full border border-[#DFD8CC] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#C19A6B]"
                />
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="bg-[#3A332C] text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-[#C19A6B] transition-colors rounded-xs cursor-pointer shrink-0"
                >
                  + Add Material
                </button>
              </div>
            </div>

            {/* 3. Colors with Swatches */}
            <div className="bg-[#FAFAFA] border border-[#DFD8CC] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-[#3A332C] uppercase tracking-wider">
                  3. Color Palette Swatches ({filterSettings.colors.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {filterSettings.colors.map((col, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-[#DFD8CC] px-3 py-1.5 text-xs text-[#3A332C] rounded-xs shadow-2xs font-medium"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteColor(idx)}
                      className="text-red-400 hover:text-red-700 font-bold text-xs cursor-pointer ml-1"
                      title="Delete color"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 max-w-lg">
                <input
                  type="text"
                  value={newColorNameInput}
                  onChange={(e) => setNewColorNameInput(e.target.value)}
                  placeholder="Color Name (e.g. Lavender, Peach)..."
                  className="flex-1 min-w-[150px] border border-[#DFD8CC] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#C19A6B]"
                />
                <div className="flex items-center gap-1.5 border border-[#DFD8CC] bg-white px-2 py-1 rounded-xs">
                  <input
                    type="color"
                    value={newColorHexInput}
                    onChange={(e) => setNewColorHexInput(e.target.value)}
                    className="w-7 h-7 border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-[#7A7065] uppercase">{newColorHexInput}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="bg-[#3A332C] text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-[#C19A6B] transition-colors rounded-xs cursor-pointer shrink-0"
                >
                  + Add Color
                </button>
              </div>
            </div>

            {/* 4. Patterns */}
            <div className="bg-[#FAFAFA] border border-[#DFD8CC] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-[#3A332C] uppercase tracking-wider">
                  4. Patterns & Styles ({filterSettings.patterns.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {filterSettings.patterns.map((pat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-[#DFD8CC] px-3 py-1.5 text-xs text-[#3A332C] rounded-xs shadow-2xs font-medium"
                  >
                    <span>{pat}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePattern(idx)}
                      className="text-red-400 hover:text-red-700 font-bold text-xs cursor-pointer ml-1"
                      title="Delete pattern"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newPatternInput}
                  onChange={(e) => setNewPatternInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddPattern(); } }}
                  placeholder="Enter pattern (e.g. Geometric, Floral, Abstract)..."
                  className="w-full border border-[#DFD8CC] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#C19A6B]"
                />
                <button
                  type="button"
                  onClick={handleAddPattern}
                  className="bg-[#3A332C] text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-[#C19A6B] transition-colors rounded-xs cursor-pointer shrink-0"
                >
                  + Add Pattern
                </button>
              </div>
            </div>

            {/* 5. Shapes */}
            <div className="bg-[#FAFAFA] border border-[#DFD8CC] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-[#3A332C] uppercase tracking-wider">
                  5. Rug Shapes ({filterSettings.shapes.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {filterSettings.shapes.map((shp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-[#DFD8CC] px-3 py-1.5 text-xs text-[#3A332C] rounded-xs shadow-2xs font-medium"
                  >
                    <span>{shp}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteShape(idx)}
                      className="text-red-400 hover:text-red-700 font-bold text-xs cursor-pointer ml-1"
                      title="Delete shape"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newShapeInput}
                  onChange={(e) => setNewShapeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddShape(); } }}
                  placeholder="Enter shape (e.g. Hexagon, Pentagon, Round)..."
                  className="w-full border border-[#DFD8CC] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#C19A6B]"
                />
                <button
                  type="button"
                  onClick={handleAddShape}
                  className="bg-[#3A332C] text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-[#C19A6B] transition-colors rounded-xs cursor-pointer shrink-0"
                >
                  + Add Shape
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSaveFilterSettings}
                disabled={isSavingFilters}
                className="bg-[#3A332C] text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#C19A6B] transition-colors rounded-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSavingFilters ? "Saving Filter Settings..." : "Save All Filter Settings"}
              </button>
            </div>
          </div>
        )}

        {/* 🌟 4. PRODUCT LISTING MANAGEMENT (ONLY WHEN adminView === 'listings') */}
        {adminView === "listings" && (
          <>
            {mode === "edit" && (
              <div className="mb-8 p-6 bg-[#F5F5F7] border border-[#DFD8CC] rounded-xl shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C]">
                    Select Product to Edit
                  </label>
                  {editingProductId && (
                    <span className="text-xs text-[#8C7A63]">
                      Product ID: <code className="font-mono bg-white px-2 py-0.5 rounded border border-[#DFD8CC]">{editingProductId}</code>
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <select
                    value={editingProductId}
                    onChange={(e) => loadProductForEdit(e.target.value)}
                    className="flex-1 border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white cursor-pointer rounded-lg shadow-2xs"
                  >
                    <option value="">-- Select a product to edit --</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>

                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => duplicateProductListing(editingProductId)}
                      className="px-5 py-3 bg-[#C19A6B] hover:bg-[#2B2520] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      title="Duplicate this listing to create a new one (Like Etsy)"
                    >
                      <span>📋</span>
                      <span>Copy / Duplicate Listing</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 🌟 Etsy-Style One-Click Copy Listing Bar */}
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#FAF8F5] to-[#F5F1E8] border border-[#E3DAC9] rounded-xl shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-[#C19A6B]/15 text-[#C19A6B] flex items-center justify-center text-lg shrink-0">
                    📋
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-heading font-bold text-[#2B2520] uppercase tracking-wider flex items-center gap-2">
                      Copy / Duplicate Listing
                      <span className="text-[10px] bg-[#C19A6B] text-white px-2 py-0.5 rounded-full font-mono normal-case">
                        Etsy Style
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#7A7065] mt-0.5">
                      Select an existing product to clone its sizes, prices, specifications, and images into a new listing with 1 click.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        duplicateProductListing(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="border border-[#DFD8CC] px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white text-[#2B2520] focus:outline-none focus:border-[#C19A6B] cursor-pointer shadow-2xs hover:border-[#C19A6B] transition-colors"
                  >
                    <option value="" disabled>-- 📋 Select a Rug to Copy --</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 🌟 Cloned Listing Success Banner */}
            {duplicatedFromTitle && mode === "create" && (
              <div className="mb-6 p-4 bg-[#EAF5EF] border border-[#1B7042]/30 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#1B7042] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    ✓
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#1B7042] uppercase tracking-wider block">
                      Listing Successfully Cloned from "{duplicatedFromTitle}"
                    </span>
                    <span className="text-[11px] text-[#335A42]">
                      All pricing, size variants, specifications, and images have been loaded into this <strong>NEW</strong> listing. Update any photo or details and click <strong>"Publish New Listing"</strong> to save!
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDuplicatedFromTitle("")}
                  className="text-xs text-[#7A7065] hover:text-[#2B2520] font-bold p-1 cursor-pointer"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            )}

            <form id="admin-listing-form" onSubmit={(e) => e.preventDefault()} className={`space-y-10 ${(mode === "edit" && !editingProductId) ? "opacity-40 pointer-events-none" : ""}`}>

              {/* SECTION 1 */}
              <div>
                <h3 className="text-lg font-serif text-[#3A332C] mb-4 border-b border-[#DFD8CC] pb-2">1. Basic Information & Pricing Variants</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <InputField label="Carpet Title (Public) *" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Royal Golden Jute Rug" />
                  <InputField label="Original Name (Optional - Internal)" name="original_name" value={formData.original_name} onChange={handleInputChange} placeholder="e.g. Artisan Design Alpha" />
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">
                      Rug Category / Weave Type *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white mb-2"
                    >
                      <optgroup label="Configured Categories">
                        {filterSettings.types.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                      <option value="Custom">+ Create New Custom Category</option>
                    </select>
                    {formData.category === "Custom" && (
                      <input
                        type="text"
                        name="custom_category"
                        value={formData.custom_category}
                        onChange={handleInputChange}
                        placeholder="Enter new custom category (e.g. Jute, Tufted, Silk)..."
                        className="w-full border border-[#C19A6B] bg-[#F5F5F7] p-3 text-sm focus:outline-none rounded-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-[#F5F5F7] p-6 border border-[#EAEAEB] rounded-sm">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-4">Size & Price Configurations</label>
                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex flex-col md:flex-row items-end gap-4 bg-white p-4 border border-[#DFD8CC] shadow-sm rounded-sm">
                        <div className="w-full">
                          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">Dimensions & Unit</label>
                          <div className="flex">
                            <input type="text" required value={variant.dimensions} onChange={(e) => handleVariantChange(index, 'dimensions', e.target.value)} placeholder="e.g. 3 x 5" className="w-2/3 border border-[#DFD8CC] border-r-0 p-3 text-sm focus:outline-none focus:border-[#C19A6B]" />
                            <select value={variant.unit} onChange={(e) => handleVariantChange(index, 'unit', e.target.value)} className="w-1/3 border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-[#F5F5F7]">
                              <option value="ft">ft</option>
                              <option value="cm">cm</option>
                              <option value="m">m</option>
                              <option value="in">in</option>
                            </select>
                          </div>
                        </div>
                        <InputField label="Base Price (in ₹)" type="number" required value={variant.price} onChange={(e: any) => handleVariantChange(index, 'price', e.target.value)} placeholder="e.g. 4500" />
                        <button type="button" onClick={() => removeVariant(index)} className="px-4 py-3 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors uppercase tracking-wider mb-px shrink-0">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={addVariant} className="text-[#C19A6B] text-xs font-bold uppercase tracking-wider hover:text-[#3A332C] flex items-center gap-2 mt-4">
                      <span>+ Add New Size Variant</span>
                    </button>
                  </div>
                </div>

                {/* Promotional Pricing (% Add & % Off) */}
                <div className="bg-[#FAFAFA] p-6 border border-[#E3DCCE] rounded-sm mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C]">
                        Promotional Pricing & Psychology Markup
                      </label>
                      <p className="text-xs text-[#7A7065] mt-1">
                        Set a markup percentage to create an elevated original price (MRP), and a discount percentage to show high-converting discount badges while retaining profit margins.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputField
                        label="% Add (Markup to Create MRP / Original Price)"
                        name="markup_percent"
                        type="number"
                        value={formData.markup_percent}
                        onChange={handleInputChange}
                        placeholder="e.g. 50 (for 50% added to base price)"
                      />
                      <p className="text-[11px] text-[#7A7065] mt-1">
                        Example: Base ₹5,000 + 50% = <strong>₹7,500 Original MRP</strong> (Strikethrough)
                      </p>
                    </div>

                    <div>
                      <InputField
                        label="% Off (Customer Discount Badge Percentage)"
                        name="discount_percent"
                        type="number"
                        value={formData.discount_percent}
                        onChange={handleInputChange}
                        placeholder="e.g. 70 (for 70% OFF badge)"
                      />
                      <p className="text-[11px] text-[#7A7065] mt-1">
                        Example: ₹7,500 MRP with 70% OFF = <strong>₹2,250 Final Selling Price</strong>
                      </p>
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  {(parseFloat(formData.markup_percent) > 0 || parseFloat(formData.discount_percent) > 0) && (
                    <div className="mt-4 p-4 bg-white border border-[#DFD8CC] rounded-sm">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C19A6B] block mb-2">Live Price Calculation Preview</span>
                      <div className="space-y-2">
                        {formData.variants.map((v, i) => {
                          const raw = parseFloat(v.price) || 0;
                          const mk = parseFloat(formData.markup_percent) || 0;
                          const dc = parseFloat(formData.discount_percent) || 0;
                          const mrp = mk > 0 ? Math.round(raw * (1 + mk / 100)) : raw;
                          const final = dc > 0 ? Math.round(mrp * (1 - dc / 100)) : mrp;
                          return (
                            <div key={i} className="flex flex-wrap items-center justify-between text-xs py-1.5 border-b border-dashed border-[#EAEAEB] last:border-0">
                              <span className="font-medium text-[#3A332C]">{v.dimensions || "Variant"} {v.unit}:</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[#7A7065]">Base: ₹{raw.toLocaleString("en-IN")}</span>
                                {mk > 0 && <span className="text-[#8C7E72] line-through">MRP: ₹{mrp.toLocaleString("en-IN")}</span>}
                                <span className="font-bold text-[#1B3624]">Selling: ₹{final.toLocaleString("en-IN")}</span>
                                {dc > 0 && (
                                  <span className="bg-[#1B3624] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {dc}% OFF
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: IMAGES */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#DFD8CC] pb-2">
                  <h3 className="text-lg font-serif text-[#3A332C]">2. Visuals</h3>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#1B3624] bg-[#E8F0E8] border border-[#C5DAC5] px-2.5 py-1 rounded-xs shadow-2xs">
                    <span>📐 Best Fit:</span>
                    <strong className="font-bold text-[#1B3624]">1080 × 1350 px (4:5 Portrait) or 1200 × 1200 px (1:1 Square)</strong>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <label className="bg-[#EAEAEB] text-[#3A332C] px-6 py-3 text-xs tracking-wider uppercase font-semibold cursor-pointer hover:bg-[#C19A6B] hover:text-white transition-colors rounded-sm">
                    + Select Images
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <span className="text-xs text-[#7A7065]">Drag and drop to rearrange order. Automatically converted to WebP.</span>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6 p-4 bg-[#F5F5F7] border border-[#EAEAEB] rounded-sm">
                    {images.map((img, index) => (
                      <div
                        key={img.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDrop} onDragOver={(e) => e.preventDefault()}
                        className={`relative aspect-square cursor-grab active:cursor-grabbing rounded-sm overflow-hidden border-2 transition-colors ${index === 0 ? "border-[#C19A6B] shadow-md" : "border-transparent hover:border-[#DFD8CC]"}`}
                      >
                        <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✕</button>
                        {index === 0 && <div className="absolute bottom-0 left-0 w-full bg-[#C19A6B] text-white text-[10px] text-center py-1 uppercase tracking-wider font-semibold">Thumbnail</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* 🌟 2.1 BESPOKE STUDIO TOP-DOWN FLATLAY IMAGE (FOR LIVE CUSTOMIZATION IN STUDIO) */}
                <div className="mt-8 pt-6 border-t border-[#DFD8CC]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      <h4 className="text-base font-serif font-bold text-[#3A332C]">
                        Bespoke Studio Visualizer Image (Top-Down Flatlay Shot)
                      </h4>
                      <span className="bg-[#C19A6B]/15 text-[#C19A6B] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Direct Studio Import
                      </span>
                    </div>
                    {studioImage ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1B7042] bg-[#EAF5EF] px-3 py-1 rounded-full border border-[#C5DAC5]">
                        ✓ Studio Customization Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7A7065] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-[#DFD8CC]">
                        Studio Customization Inactive (Upload Top-Down Shot)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#7A7065] mb-4 leading-relaxed max-w-3xl">
                    Upload a <strong>clean, front top-down view of the rug</strong> (flat on the floor or neutral isolated background).
                    When a user selects this rug to edit in the <strong>Bespoke Studio</strong>, this exact top-down image is directly imported for live yarn dyeing and color customization.
                    If this image is not provided, the studio will inform users that custom editing is not available for this rug.
                  </p>

                  {studioImage ? (
                    <div className="flex flex-col sm:flex-row items-start gap-5 p-4 bg-[#FAF8F5] border-2 border-[#C19A6B]/50 rounded-xl shadow-xs">
                      <div className="relative w-36 h-36 sm:w-44 sm:h-44 aspect-square rounded-xl overflow-hidden border border-[#DFD8CC] shadow-sm bg-white shrink-0">
                        <img
                          src={studioImage.preview}
                          alt="Studio Top-Down Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#2B2520] text-white text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          Studio Image
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2B2520]">Top-Down Flatlay Visualizer Ready</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            Live Dye Ready
                          </span>
                        </div>
                        <p className="text-xs text-[#7A7065] leading-relaxed max-w-xl">
                          Patrons customizing this rug will see this high-resolution top-down flatlay photo dynamically re-dyed with their chosen fiber colors in real time.
                        </p>
                        <div className="pt-2 flex items-center gap-4">
                          <label className="text-xs uppercase tracking-wider font-bold text-[#C19A6B] hover:text-[#2B2520] cursor-pointer underline transition-colors">
                            Replace Studio Image
                            <input type="file" accept="image/*" onChange={handleStudioFileChange} className="hidden" />
                          </label>
                          <span className="text-[#DFD8CC]">|</span>
                          <button
                            type="button"
                            onClick={handleRemoveStudioImage}
                            className="text-xs uppercase tracking-wider font-bold text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                          >
                            Remove Studio Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-[#FAFAFA] border border-dashed border-[#DFD8CC] rounded-xl">
                      <label className="bg-[#2B2520] hover:bg-[#C19A6B] text-white px-5 py-3 text-xs tracking-wider uppercase font-semibold cursor-pointer transition-colors rounded-sm flex items-center gap-2 shadow-xs">
                        <span>+ Upload Top-Down Studio Image</span>
                        <input type="file" accept="image/*" onChange={handleStudioFileChange} className="hidden" />
                      </label>
                      <span className="text-xs text-[#7A7065]">
                        Flat top-down perspective recommended. Automatically converted to WebP and saved to Cloudflare.
                      </span>
                    </div>
                  )}
                </div>

                {/* 🌟 2.2 COLOR VARIATIONS & PHOTO LINKING (Etsy / Shopify Style) */}
                <div className="mt-8 pt-6 border-t border-[#DFD8CC]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎨</span>
                      <h4 className="text-sm font-heading font-bold text-[#2B2520] uppercase tracking-wider">
                        2.2 Color Variations & Photo Linking (Like Etsy / Shopify)
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#7A7065] bg-[#F5F2EC] px-2.5 py-1 rounded-full border border-[#DFD8CC]">
                      Links color names directly to photos for live preview switching
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Color Name Input */}
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6054] mb-1.5 tracking-wider">
                          Color Name *
                        </label>
                        <input
                          type="text"
                          list="color-preset-list"
                          placeholder="e.g. Olive Green, Beige, Navy Blue"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="w-full border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] bg-white rounded-xs"
                        />
                        <datalist id="color-preset-list">
                          {filterSettings.colors.map((c) => (
                            <option key={c.name} value={c.name} />
                          ))}
                        </datalist>
                      </div>

                      {/* Optional Hex Color */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6054] mb-1.5 tracking-wider">
                          Swatch Color
                        </label>
                        <div className="flex items-center gap-2 h-[38px] px-2 bg-white border border-[#DFD8CC] rounded-xs">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-7 h-7 border-0 cursor-pointer p-0 bg-transparent"
                          />
                          <span className="text-[11px] font-mono text-[#52483E]">{newColorHex}</span>
                        </div>
                      </div>

                      {/* Linked Image URL / Choice */}
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6054] mb-1.5 tracking-wider">
                          Linked Photo (Select from uploaded photos below or paste URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Select from thumbnails below or paste image URL"
                            value={newColorImage}
                            onChange={(e) => setNewColorImage(e.target.value)}
                            className="flex-1 border border-[#DFD8CC] p-2.5 text-xs focus:outline-none focus:border-[#C19A6B] bg-white rounded-xs truncate"
                          />
                          <button
                            type="button"
                            onClick={handleAddColorVariant}
                            className="px-4 py-2.5 bg-[#2B2520] hover:bg-[#C19A6B] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                          >
                            + Link Color
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick 1-Click Link from Uploaded Product Photos */}
                    {images.length > 0 && (
                      <div className="pt-3 border-t border-[#DFD8CC]">
                        <span className="block text-[10px] uppercase font-bold text-[#8C7A63] mb-2 tracking-wider">
                          💡 Quick Link: Click on any uploaded photo to set as this color's image:
                        </span>
                        <div className="flex flex-wrap gap-2.5 items-center">
                          {images.map((img, i) => {
                            const isSelected = newColorImage === img.preview;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setNewColorImage(img.preview)}
                                className={`w-14 h-14 rounded-md border-2 overflow-hidden transition-all cursor-pointer relative group ${isSelected
                                    ? "border-[#C19A6B] ring-2 ring-[#C19A6B]/40 scale-105"
                                    : "border-[#DFD8CC] hover:border-[#2B2520]"
                                  }`}
                                title={`Select Photo #${i + 1}`}
                              >
                                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                {isSelected && (
                                  <span className="absolute inset-0 bg-[#C19A6B]/30 flex items-center justify-center text-white text-xs font-bold">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Display List of Linked Color Variations */}
                  {colorVariants.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {colorVariants.map((cv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-white border border-[#DFD8CC] rounded-xl shadow-2xs hover:border-[#C19A6B] transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-[#ECE7DE] border border-[#DFD8CC] overflow-hidden shrink-0">
                            {cv.image ? (
                              <img src={cv.image} alt={cv.color} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8C7A63]">No Photo</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {cv.hex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: cv.hex }}
                                />
                              )}
                              <span className="text-xs font-bold text-[#2B2520] truncate block">
                                {cv.color}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#1B7042] bg-[#EAF5EF] px-2 py-0.5 rounded-full font-medium inline-block truncate max-w-full">
                              ✓ Linked to Photo
                            </span>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveColorVariant(idx)}
                            className="text-stone-400 hover:text-red-600 text-xs font-bold p-1 transition-colors cursor-pointer"
                            title="Remove color linking"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-center py-4 bg-white/70 border border-dashed border-[#DFD8CC] rounded-xl text-xs text-[#8C7A63]">
                      No color variations linked yet. Upar color ka naam aur photo select karke <strong>"+ Link Color"</strong> par click karein.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3 */}
              <div>
                <h3 className="text-lg font-serif text-[#3A332C] mb-4 border-b border-[#DFD8CC] pb-2">3. Search & Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Primary Color Selection with Suggestions */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">
                      Primary Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      list="color-options-list"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g. Ivory, Dark Green, Peach..."
                      className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white"
                    />
                    <datalist id="color-options-list">
                      {filterSettings.colors.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </datalist>
                  </div>

                  {/* Shape Selection */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">
                      Shape
                    </label>
                    <select
                      name="shape"
                      value={formData.shape}
                      onChange={handleInputChange}
                      className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white mb-2"
                    >
                      <optgroup label="Configured Shapes">
                        {filterSettings.shapes.map((shp) => (
                          <option key={shp} value={shp}>{shp}</option>
                        ))}
                      </optgroup>
                      <option value="Custom">+ Custom Shape</option>
                    </select>
                    {formData.shape === "Custom" && (
                      <input
                        type="text"
                        name="custom_shape"
                        value={formData.custom_shape}
                        onChange={handleInputChange}
                        placeholder="Enter custom shape..."
                        className="w-full border border-[#C19A6B] bg-[#F5F5F7] p-3 text-sm focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Material Composition Selection */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">
                      Material Composition
                    </label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white mb-2"
                    >
                      <optgroup label="Configured Materials">
                        {filterSettings.materials.map((mat) => (
                          <option key={mat} value={mat}>{mat}</option>
                        ))}
                      </optgroup>
                      <option value="Custom">+ Custom Material</option>
                    </select>
                    {formData.material === "Custom" && (
                      <input
                        type="text"
                        name="custom_material"
                        value={formData.custom_material}
                        onChange={handleInputChange}
                        placeholder="Enter custom material (e.g. 100% Recycled PET)..."
                        className="w-full border border-[#C19A6B] bg-[#F5F5F7] p-3 text-sm focus:outline-none"
                      />
                    )}
                  </div>

                  <InputField label="Style" name="style" value={formData.style} onChange={handleInputChange} placeholder="e.g. Bohemian, Minimalist" />

                  {/* Pattern Selection with Suggestions */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">
                      Pattern
                    </label>
                    <input
                      type="text"
                      name="pattern"
                      list="pattern-options-list"
                      value={formData.pattern}
                      onChange={handleInputChange}
                      placeholder="e.g. Geometric, Floral, Abstract..."
                      className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white"
                    />
                    <datalist id="pattern-options-list">
                      {filterSettings.patterns.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </datalist>
                  </div>

                  <InputField label="Room Context" name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g. Living Room, Bedroom" />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2 flex items-center justify-between">
                      <span>Description</span>
                      <span className="text-[10px] text-[#8C7A63] font-normal normal-case">Expanded writing area • Drag bottom corner to resize</span>
                    </label>
                    <textarea
                      name="description"
                      rows={9}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detailed product description, artisan weaving story, texture & fiber details..."
                      className="w-full min-h-[200px] md:min-h-[240px] border border-[#DFD8CC] p-4 text-sm leading-relaxed text-[#3A332C] bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] rounded-sm transition-all resize-y"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Tags (Comma Separated)" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="handmade rug, living room carpet" />
                    <InputField label="Features (Comma Separated)" name="features" value={formData.features} onChange={handleInputChange} placeholder="100% Reversible, Shed-free, Stain-resistant" />
                    <InputField label="Care Instructions" name="care_instructions" value={formData.care_instructions} onChange={handleInputChange} placeholder="Spot clean or hose wash..." />
                    <InputField label="SKU / Internal Ref" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="e.g. RUG-PET-001" />
                  </div>
                </div>
              </div>

              {/* SECTION 4 */}
              <div>
                <h3 className="text-lg font-serif text-[#3A332C] mb-4 border-b border-[#DFD8CC] pb-2">4. Operations & External Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#3A332C] mb-2">Processing Type</label>
                    <select name="processing_type" value={formData.processing_type} onChange={handleInputChange} className="w-full border border-[#DFD8CC] p-3 text-sm focus:outline-none focus:border-[#C19A6B] bg-white">
                      <option value="Made to Order">Made to Order</option>
                      <option value="Ready to Ship">Ready to Ship</option>
                    </select>
                  </div>
                  <InputField label="Estimated Processing Time" name="processing_time" value={formData.processing_time} onChange={handleInputChange} placeholder="e.g. 2-3 days" />
                  <InputField label="Inventory Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
                  <InputField label="Return Policy" name="return_policy" value={formData.return_policy} onChange={handleInputChange} placeholder="e.g. Returns accepted within 14 days" />

                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3 bg-white p-3 border border-[#DFD8CC] rounded-sm">
                      <input type="checkbox" name="is_customizable" id="is_customizable" checked={formData.is_customizable} onChange={handleInputChange} className="w-4 h-4 text-[#C19A6B]" />
                      <label htmlFor="is_customizable" className="text-sm text-[#3A332C] font-medium cursor-pointer">Accept Customization Requests</label>
                    </div>

                    <div className="flex items-center space-x-3 bg-emerald-50 p-3 border border-emerald-100 rounded-sm">
                      <input type="checkbox" name="free_delivery" id="free_delivery" checked={formData.free_delivery} onChange={handleInputChange} className="w-4 h-4 text-emerald-600" />
                      <label htmlFor="free_delivery" className="text-sm text-emerald-800 font-bold cursor-pointer">Offer Free Worldwide Delivery</label>
                    </div>

                    {/* View on Etsy */}
                    <div className="flex flex-col bg-[#FAFAFA] p-4 border border-[#E4DCce] rounded-sm gap-3">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" name="show_etsy" id="show_etsy" checked={formData.show_etsy} onChange={handleInputChange} className="w-4 h-4 text-[#C19A6B]" />
                        <label htmlFor="show_etsy" className="text-sm text-[#3A332C] font-semibold cursor-pointer flex items-center gap-2">
                          <span>View on Etsy</span>
                          <span className="text-[10px] uppercase tracking-wider bg-[#F26522]/10 text-[#F26522] px-2 py-0.5 rounded font-bold">Channel</span>
                        </label>
                      </div>
                      {formData.show_etsy && (
                        <div className="pl-7 pt-1">
                          <input
                            type="url"
                            name="etsy_url"
                            value={formData.etsy_url}
                            onChange={handleInputChange}
                            placeholder="https://www.etsy.com/listing/..."
                            className="w-full border border-[#DFD8CC] bg-white p-2.5 text-sm outline-none focus:border-[#C19A6B]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5 */}
              <div>
                <div className="flex items-center justify-between border-b border-[#DFD8CC] pb-2 mb-4">
                  <h3 className="text-lg font-serif text-[#3A332C]">5. Related Products Merchandising</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#EAEAEB] text-[#3A332C] rounded-full">
                    {formData.related_products.length} / 4 Selected
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto border border-[#DFD8CC] rounded-sm p-4 bg-[#F5F5F7]/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {availableProducts.filter(p => p.id !== editingProductId).map(p => {
                    const selectedIndex = formData.related_products.indexOf(p.id);
                    const isSelected = selectedIndex !== -1;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleRelatedProductChange(p.id)}
                        className={`flex items-center space-x-3 cursor-pointer p-3 rounded-sm border select-none transition-all ${isSelected ? 'bg-white border-[#C19A6B] shadow-sm ring-1 ring-[#C19A6B]' : 'bg-transparent border-transparent hover:bg-white hover:border-[#EAEAEB]'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-[#C19A6B] text-white shadow-sm' : 'border border-[#DFD8CC] text-[#7A7065] bg-white'
                          }`}>
                          {isSelected ? `#${selectedIndex + 1}` : ''}
                        </div>
                        <span className="text-sm text-[#3A332C] font-medium truncate flex-1">{p.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t border-[#DFD8CC]">
                {mode === "edit" && editingProductId && (
                  <>
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={loadingAction !== null}
                      className="w-full sm:w-auto px-6 bg-red-50 border-2 border-red-200 text-red-700 py-4 text-xs tracking-[0.15em] uppercase font-bold hover:bg-red-600 hover:text-white transition cursor-pointer"
                      title="Delete listing and all its photos from storage permanently"
                    >
                      🗑️ Delete Listing
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateProductListing(editingProductId)}
                      disabled={loadingAction !== null}
                      className="w-full sm:w-auto px-6 bg-[#FAF7F2] border-2 border-[#C19A6B]/50 text-[#8C6D45] py-4 text-xs tracking-[0.15em] uppercase font-bold hover:bg-[#C19A6B] hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
                      title="Clone this listing as a brand new product (Etsy style)"
                    >
                      <span>📋</span>
                      <span>Duplicate as New Listing</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => submitData("draft")}
                  disabled={loadingAction !== null}
                  className="w-full sm:w-1/3 bg-[#F5F5F7] border-2 border-[#DFD8CC] text-[#6B6054] py-4 text-sm tracking-[0.2em] uppercase font-bold hover:bg-[#EAEAEB] transition cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => submitData("publish")}
                  disabled={loadingAction !== null}
                  className="w-full sm:flex-1 bg-[#3A332C] text-[#F5F5F7] py-4 text-sm tracking-[0.2em] uppercase font-bold hover:bg-[#C19A6B] transition shadow-lg cursor-pointer"
                >
                  {mode === "create" ? "Publish New Listing" : "Update Listing"}
                </button>
              </div>
            </form>

            {/* ✨ AI / Code Quick Paste Auto-Fill Modal */}
            <QuickPasteListingModal
              isOpen={isQuickPasteOpen}
              onClose={() => setIsQuickPasteOpen(false)}
              mode={mode}
              editingProductName={availableProducts.find(p => p.id === editingProductId)?.name}
              currentJsonString={currentListingJsonString}
              onApply={handleApplyQuickPaste}
              filterSettings={filterSettings}
            />

            {/* 🛍️ Etsy Live Catalog Sync Modal */}
            <EtsySyncModal
              isOpen={isEtsySyncOpen}
              onClose={() => setIsEtsySyncOpen(false)}
              onSyncComplete={fetchData}
            />

            {/* ⚡ Bulk Price Markup Modal */}
            <BulkPriceMarkupModal
              isOpen={isBulkMarkupOpen}
              onClose={() => setIsBulkMarkupOpen(false)}
              totalProductsCount={availableProducts.length}
              products={availableProducts}
              onSuccess={fetchData}
            />

            {/* 📦 Etsy Safe Pack Studio Modal */}
            {packStudioProductId && (
              <EtsyPackStudioModal
                productId={packStudioProductId}
                availableProducts={availableProducts}
                onClose={() => setPackStudioProductId(null)}
                onSelectProduct={(id) => setPackStudioProductId(id)}
              />
            )}

          </>
        )}
      </div>

      {/* 🌟 1. FULLSCREEN LOADING OVERLAY */}
      <AnimatePresence>
        {loadingAction !== null && (
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
                  {loadingAction === "copy" && "Copying Listing (Etsy Style)..."}
                  {loadingAction === "load" && "Loading Product Details..."}
                  {loadingAction === "delete" && "Deleting Listing..."}
                  {loadingAction === "draft" && (mode === "create" ? "Saving Draft..." : "Updating Draft...")}
                  {loadingAction === "publish" && (mode === "create" ? "Publishing New Listing..." : "Updating Live Listing...")}
                </h4>
                <p className="text-xs text-[#7A7065] mt-1 font-medium">
                  {statusMsg || "Processing request..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 2. SUCCESS MODAL */}
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
              className="bg-white rounded-sm max-w-md w-full p-8 text-center shadow-2xl border-t-4 border-emerald-500 relative overflow-hidden"
            >
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-400"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-20 h-20 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-inner relative z-10"
                >
                  <svg
                    className="w-10 h-10 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              </div>

              <h2 className="text-2xl font-serif text-[#3A332C] mb-2 font-medium">
                {lastSubmittedStatus === "draft"
                  ? (mode === "create" ? "Draft Saved!" : "Draft Updated!")
                  : (mode === "create" ? "Listing Published Live!" : "Listing Updated Live!")}
              </h2>
              <p className="text-sm text-[#7A7065] mb-8 leading-relaxed">
                {lastSubmittedStatus === "draft"
                  ? "This listing has been saved as a private draft and will not appear on the public storefront until published."
                  : "The product details, variants, and external configurations are now synchronized live on the storefront."}
              </p>

              <div className="space-y-3">
                {newlyCreatedId && lastSubmittedStatus === "publish" && (
                  <Link
                    href={`/product/${newlyCreatedId}`}
                    target="_blank"
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs uppercase tracking-[0.15em] font-semibold rounded-sm transition-colors shadow-md"
                  >
                    View Live Listing ↗
                  </Link>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full border border-[#DFD8CC] text-[#3A332C] hover:bg-[#F5F5F7] py-3.5 text-xs uppercase tracking-[0.15em] font-semibold rounded-sm transition-colors"
                >
                  Close Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}