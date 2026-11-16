"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { DUMMY_RUG_IMAGES, DUMMY_RUG_GALLERY } from "@/lib/dummyImages";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase";
import { useCurrency } from "@/context/CurrencyContext";
import { getColorVariants, type ColorVariant } from "@/lib/productColorVariants";

const SpecItem = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  return (
    <div className="border-t border-[#EAEAEB] pt-3.5">
      <span className="block text-[11px] uppercase tracking-[0.2em] text-[#7A7065] font-heading font-bold mb-1.5">{label}</span>
      <span className="block text-base md:text-lg text-[#2B2520] font-heading font-semibold capitalize tracking-wide">{value.trim()}</span>
    </div>
  );
};

export default function ProductDetailClient({
  initialProduct,
  id: propId,
}: {
  initialProduct?: any;
  id?: string;
}) {
  const router = useRouter();
  const params = useParams();
  const rawId = propId || params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // 🌟 Global Currency Context Integration
  const { formatPrice } = useCurrency();

  // Helper to initialize variants from raw product
  const getInitialMappedProduct = (raw: any) => {
    if (!raw) return null;
    let mappedVariants = raw.variants;
    if (!mappedVariants || mappedVariants.length === 0) {
      const fallbackSizes = Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes : ["Standard Size"];
      mappedVariants = fallbackSizes.map((sz: string) => ({ size: sz, price: raw.price || "0" }));
    }
    return { ...raw, variants: mappedVariants };
  };

  const initialMapped = getInitialMappedProduct(initialProduct);

  const [product, setProduct] = useState<any>(initialMapped);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(initialMapped?.variants?.[0] || null);

  // 🎨 Linked Color Variants (Etsy / Shopify style with photo preview)
  const activeColorVariants: ColorVariant[] = useMemo(() => {
    return getColorVariants(product);
  }, [product]);

  const getInitialColor = (prod: any) => {
    if (!prod) return "Original Tone";
    const cvs = getColorVariants(prod);
    if (cvs && cvs.length > 0) {
      return cvs[0].color;
    }
    if (prod.color && typeof prod.color === "string" && prod.color.trim()) {
      return prod.color.trim();
    }
    return "Original Tone";
  };
  const [selectedColor, setSelectedColor] = useState<string>(getInitialColor(initialMapped));
  const [sizeViewMode, setSizeViewMode] = useState<"dropdown" | "grid">("dropdown");

  // 🌟 Ensure product page always opens cleanly at the top (scrollY = 0) with header fully visible
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
      return () => cancelAnimationFrame(raf);
    }
  }, [id]);

  // 🌟 Custom Luxury Dropdowns State & Outside Click Handler
  const [openDropdown, setOpenDropdown] = useState<"size" | "color" | "quantity" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic curated colors for dropdown
  const availableColors = useMemo(() => {
    if (activeColorVariants && activeColorVariants.length > 0) {
      return activeColorVariants.map((cv) => cv.color);
    }
    const list: string[] = [];
    const primary = product?.color?.trim();
    if (primary) {
      list.push(`${primary} (As Pictured)`);
      if (primary.includes("/") || primary.includes(",")) {
        primary
          .split(/[/,]+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .forEach((c: string) => {
            if (!list.includes(c)) list.push(c);
          });
      }
    } else {
      list.push("Original Tone (As Pictured)");
    }

    const curated = [
      "Warm Ivory / Cream",
      "Natural Beige / Oat",
      "Midnight Navy Blue",
      "Terracotta Rust",
      "Forest Olive Sage",
      "Muted Charcoal Grey",
      "Golden Sand",
    ];
    curated.forEach((c) => {
      const base = c.toLowerCase().split(" ")[0];
      if (!list.some((item) => item.toLowerCase().includes(base))) {
        list.push(c);
      }
    });

    return list;
  }, [product?.color, activeColorVariants]);

  const getInitialActiveImg = (prod: any) => {
    if (!prod) return "";
    const cvs = getColorVariants(prod);
    if (cvs && cvs.length > 0 && cvs[0].image) {
      return cvs[0].image;
    }
    const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.image || ""];
    return imgs[0] || "";
  };
  const [activeImage, setActiveImage] = useState<string>(getInitialActiveImg(initialMapped));

  // 🎨 Switch Image on Color Selection
  const handleColorSelect = (chosenColor: string) => {
    setSelectedColor(chosenColor);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    if (activeColorVariants && activeColorVariants.length > 0) {
      const matched = activeColorVariants.find(
        (cv) => cv.color.toLowerCase().trim() === chosenColor.toLowerCase().trim()
      );
      if (matched && matched.image) {
        setActiveImage(matched.image);
      }
    }
  };

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // 🔍 Interactive Image Zoom & Pan States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageFit, setImageFit] = useState<"contain" | "cover">("cover");
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const shareData = {
      title: product?.name || "NR Enterprises Handcrafted Rug",
      text: `Discover ${product?.name || "this handcrafted heirloom rug"} on NR Enterprises.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          navigator.clipboard?.writeText(window.location.href);
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2500);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch {
        // ignore
      }
    }
  };

  // ✅ Cart Status Listener
  useEffect(() => {
    const checkCartStatus = () => {
      if (!product || !selectedVariant) return;
      try {
        const cart = JSON.parse(localStorage.getItem("nrenterprises_cart") || "[]");
        const exists = cart.some(
          (item: any) =>
            item.id === product.id &&
            item.size === selectedVariant.size &&
            (!selectedColor || !item.color || item.color === selectedColor)
        );
        setIsInCart(exists);
      } catch (e) {
        setIsInCart(false);
      }
    };

    checkCartStatus();

    window.addEventListener("cart_updated", checkCartStatus);
    window.addEventListener("storage", checkCartStatus);

    return () => {
      window.removeEventListener("cart_updated", checkCartStatus);
      window.removeEventListener("storage", checkCartStatus);
    };
  }, [product, selectedVariant, selectedColor]);

  useEffect(() => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem("nrenterprises_wishlist") || "[]");
    const exists = wishlist.some((item: any) => item.id === product.id);
    setIsWishlisted(exists);
  }, [product]);

  // 📜 Interactive Product Detail Drawer Sections (All minimized by default)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    desc: false,
    specs: false,
    care: false,
    shipping: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchProduct = async () => {
    if (!id) return;
    try {
      if (!product) {
        setIsLoading(true);
        setError("");
      }

      const { data, error: dbError } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

      if (dbError) throw dbError;
      if (!data) {
        if (!product) {
          setError("Product not found.");
          setProduct(null);
        }
        return;
      }

      let mappedVariants = data.variants;
      if (!mappedVariants || mappedVariants.length === 0) {
        const fallbackSizes = Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ["Standard Size"];
        mappedVariants = fallbackSizes.map((sz: string) => ({ size: sz, price: data.price || "0" }));
      }

      data.variants = mappedVariants;

      let studioImg = data.studio_image || data.variants?.[0]?.studio_image || null;
      let colorVariants = data.color_variants || data.variants?.[0]?.color_variants || null;
      if (!studioImg || !colorVariants) {
        try {
          const { data: contentRegs } = await supabase
            .from("site_content")
            .select("id, data")
            .in("id", ["studio_rug_images", "product_color_variants"]);
          if (contentRegs && contentRegs.length > 0) {
            const sReg = contentRegs.find((r: any) => r.id === "studio_rug_images");
            const cReg = contentRegs.find((r: any) => r.id === "product_color_variants");
            if (!studioImg && sReg?.data?.[id]) studioImg = sReg.data[id];
            if (!colorVariants && cReg?.data?.[id]) colorVariants = cReg.data[id];
          }
        } catch { }
      }
      data.studio_image = studioImg;
      data.color_variants = colorVariants || [];

      setProduct(data);
      if (!selectedVariant) {
        setSelectedVariant(mappedVariants[0]);
      }
      if (colorVariants && colorVariants.length > 0) {
        if (!selectedColor || selectedColor === "Original Tone") {
          setSelectedColor(colorVariants[0].color);
          if (colorVariants[0].image && !activeImage) {
            setActiveImage(colorVariants[0].image);
          }
        }
      } else if (data.color && (!selectedColor || selectedColor === "Original Tone")) {
        setSelectedColor(data.color.trim());
      }

      const imgs = Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || ""];
      if (!activeImage) {
        setActiveImage(imgs[0]);
      }

      // 🌟 Fetch Similar & Collection Rugs for "You May Also Like"
      try {
        const currentId = data.id || id;
        const currentCategory = data.category || "";
        let matchedItems: any[] = [];

        // 1. Explicit related products if specified
        if (data.related_products && Array.isArray(data.related_products) && data.related_products.length > 0) {
          const { data: relData } = await supabase
            .from("products")
            .select("*")
            .in("id", data.related_products);
          if (relData && relData.length > 0) {
            matchedItems = relData.filter((item: any) => item.id !== currentId);
          }
        }

        // 2. Fetch rugs of the same related category ONLY
        if (currentCategory) {
          const { data: catData } = await supabase
            .from("products")
            .select("*")
            .ilike("category", `%${currentCategory}%`)
            .neq("id", currentId);
          if (catData && catData.length > 0) {
            const existingIds = new Set(matchedItems.map((m: any) => m.id));
            for (const item of catData) {
              if (!existingIds.has(item.id)) {
                matchedItems.push(item);
                existingIds.add(item.id);
              }
            }
          }
        }

        // Strictly related category products only (no unrelated products mixed)
        setRelatedItems(matchedItems);
      } catch {
        // ignore
      }
    } catch (err: any) {
      if (!product) {
        setError("Product not found.");
        setProduct(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  // 🌟 Main Banner Arrow Image Switcher
  const handleNavigateImage = (direction: "next" | "prev", e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    if (!product || !Array.isArray(product.images) || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(activeImage);
    const total = product.images.length;
    const nextIndex = direction === "next"
      ? (currentIndex + 1) % total
      : (currentIndex - 1 + total) % total;
    setActiveImage(product.images[nextIndex]);
  };

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [activeImage]);

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, Number(newZoom.toFixed(2))));
    setZoom(clampedZoom);
    if (clampedZoom === 1) {
      setPan({ x: 0, y: 0 });
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * (clampedZoom - 1)) / 2;
      const maxPanY = (rect.height * (clampedZoom - 1)) / 2;
      setPan((prev) => ({
        x: Math.max(-maxPanX, Math.min(maxPanX, prev.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, prev.y)),
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1 || !containerRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const rect = containerRef.current.getBoundingClientRect();
    const maxPanX = (rect.width * (zoom - 1)) / 2;
    const maxPanY = (rect.height * (zoom - 1)) / 2;
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.startPanX + dx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.startPanY + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 👆 Mobile Swipe Tracking on Big Preview
  const swipeTouchRef = useRef<{ startX: number; startY: number; endX: number; endY: number }>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    swipeTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
    };

    if (zoom > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    swipeTouchRef.current.endX = touch.clientX;
    swipeTouchRef.current.endY = touch.clientY;

    if (isDragging && zoom > 1 && containerRef.current) {
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const rect = containerRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * (zoom - 1)) / 2;
      const maxPanY = (rect.height * (zoom - 1)) / 2;
      setPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.startPanX + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.startPanY + dy)),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If not zoomed in, detect left or right swipe to switch image
    if (zoom <= 1) {
      const deltaX = swipeTouchRef.current.startX - swipeTouchRef.current.endX;
      const deltaY = swipeTouchRef.current.startY - swipeTouchRef.current.endY;
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX > 0) {
          // Swiped Left -> Next Image
          handleNavigateImage("next");
        } else {
          // Swiped Right -> Previous Image
          handleNavigateImage("prev");
        }
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target?.closest("button, input, a, [role='button'], .cursor-pointer")) {
      return;
    }

    if (zoom > 1) {
      handleZoomChange(1);
    } else {
      handleZoomChange(2);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    setIsAddingToCart(true);

    const existingCart = JSON.parse(localStorage.getItem("nrenterprises_cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (item: any) =>
        item.id === product.id &&
        item.size === selectedVariant.size &&
        (!selectedColor || item.color === selectedColor)
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        image: activeImage || product.images?.[0] || product.image || "",
        size: selectedVariant.size,
        color: selectedColor || product.color || "Original",
        price: selectedVariant.price,
        quantity: quantity,
      });
    }

    localStorage.setItem("nrenterprises_cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cart_updated"));

    setTimeout(() => {
      setIsAddingToCart(false);
      setIsInCart(true);
      window.dispatchEvent(new Event("open_cart"));
    }, 400);
  };

  const handleBuyItNow = () => {
    if (!product || !selectedVariant) return;

    const existingCart = JSON.parse(localStorage.getItem("nrenterprises_cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (item: any) =>
        item.id === product.id &&
        item.size === selectedVariant.size &&
        (!selectedColor || item.color === selectedColor)
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity = quantity;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        image: activeImage || product.images?.[0] || product.image || "",
        size: selectedVariant.size,
        color: selectedColor || product.color || "Original",
        price: selectedVariant.price,
        quantity: quantity,
      });
    }

    localStorage.setItem("nrenterprises_cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cart_updated"));
    router.push("/checkout");
  };

  const toggleWishlist = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem("nrenterprises_wishlist") || "[]");
    const index = wishlist.findIndex((item: any) => item.id === product.id);

    if (index >= 0) {
      wishlist.splice(index, 1);
      setIsWishlisted(false);
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.images?.[0] || product.image || "",
      });
      setIsWishlisted(true);
    }

    localStorage.setItem("nrenterprises_wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlist_updated"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4A1017] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-3xl font-heading font-bold text-[#2B070B] mb-3">Product Not Found</h2>
        <p className="text-[#5A4E42] text-base mb-8 max-w-md">The bespoke silhouette or handcrafted carpet you are looking for is currently unavailable or has been archived.</p>
        <Link href="/collections" className="bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white border border-[#4A1017] px-8 py-3.5 text-xs uppercase tracking-widest font-heading font-semibold rounded-none transition-all">
          Explore All Collections
        </Link>
      </div>
    );
  }

  const rawImages: string[] = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const validImages = rawImages.filter((img: string) => img && !img.startsWith("/uploads/") && !img.includes("undefined"));
  const images = validImages.length > 0 ? validImages : [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B070B] pt-3 sm:pt-3.5 pb-20">

      {/* 🧭 Breadcrumb Navigation (Desktop Only - Hidden on Mobile) */}
      <div className="hidden sm:block max-w-7xl mx-auto px-6 lg:px-8 mb-6">
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#8C6B38] font-heading font-medium">
          <Link href="/" className="hover:text-[#2B070B] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-[#2B070B] transition-colors">Collections</Link>
          <span>/</span>
          <Link href={`/collections?category=${encodeURIComponent(product.category || "")}`} className="hover:text-[#2B070B] transition-colors">
            {product.category || "Carpets"}
          </Link>
          <span>/</span>
          <span className="text-[#2B070B] font-bold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      <div id="product-showcase-section" className="max-w-7xl mx-auto px-[5px] sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ========================================================================= */}
          {/* 🖼️ LEFT COLUMN: IMAGE SHOWCASE WITH INTERACTIVE ZOOM SLIDER & PAN */}
          {/* ========================================================================= */}
          <div
            id="product-sticky-gallery"
            className="lg:col-span-7 flex flex-col items-center lg:sticky lg:top-6 xl:top-6 self-start transition-all duration-300"
          >

            {/* Primary Big Frame Container */}
            <div
              ref={containerRef}
              className={`relative w-full aspect-[3/3.8] sm:aspect-[4/4.2] max-h-[560px] lg:max-h-[580px] bg-[#F7F4EE] rounded-none overflow-hidden shadow-sm group select-none border border-[#EAEAEB]/70 transition-colors ${zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
                }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
            >
              {/* 🎨 Ambient Studio Glow (soft blur behind uncropped rug for seamless luxury presentation) */}
              {imageFit === "contain" && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 filter blur-3xl scale-125 transition-opacity duration-500">
                  <SafeImage
                    src={activeImage || images[0]}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                    fallbackSrc={DUMMY_RUG_IMAGES.defaultCarpet}
                  />
                </div>
              )}

              {/* 🔀 Fit / Fill View Toggle Button (More Compact on Mobile) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFit((prev) => (prev === "contain" ? "cover" : "contain"));
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-white/90 hover:bg-white text-[#2B2520] backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#EAEAEB] shadow-sm text-[9.5px] sm:text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer group/fit"
                title={imageFit === "cover" ? "Switch to Full Rug (Uncropped View)" : "Switch to Fill Frame (Edge-to-edge)"}
              >
                {imageFit === "cover" ? (
                  <>
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Full Rug</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H4v4m0 8v4h4m8-16h4v4m-4 12h4v-4" />
                    </svg>
                    <span>Fill Frame</span>
                  </>
                )}
              </button>

              {images.map((img: string, idx: number) => {
                const isCurrent = (activeImage || images[0]) === img;
                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-300 will-change-transform ${imageFit === "contain" ? "p-3 sm:p-5 flex items-center justify-center" : ""
                      } ${isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    style={{
                      transform: isCurrent ? `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` : "none",
                      transformOrigin: "center center",
                      transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease-out",
                    }}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} - View ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1600px"
                      quality={95}
                      className={`pointer-events-none select-none transition-all duration-300 ${imageFit === "contain"
                        ? "object-contain drop-shadow-sm"
                        : "object-cover"
                        }`}
                    />
                  </div>
                );
              })}

              {/* 🔍 BOTTOM-LEFT ZOOM SLIDER (Slimmer & Non-Intrusive) */}
              <div
                className="absolute left-2.5 sm:left-5 bottom-2.5 sm:bottom-5 z-20 flex items-center gap-1.5 sm:gap-2 bg-white/80 hover:bg-white text-[#2B2520] backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-full border border-[#EAEAEB] shadow-sm select-none transition-all"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {/* Zoom Out Button */}
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom - 0.25)}
                  disabled={zoom <= 1}
                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs sm:text-base font-bold text-[#2B2520] hover:text-[#C19A6B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out"
                >
                  −
                </button>

                {/* Range Slider - Slimmer Track */}
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-14 sm:w-24 h-1 sm:h-1.5 bg-[#EAEAEB] accent-[#C19A6B] rounded-full cursor-pointer"
                  title={`Zoom: ${Math.round(zoom * 100)}%`}
                />

                {/* Zoom In Button */}
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom + 0.25)}
                  disabled={zoom >= 3}
                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs sm:text-base font-bold text-[#2B2520] hover:text-[#C19A6B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In"
                >
                  +
                </button>

                {/* Reset Indicator */}
                {zoom > 1 && (
                  <button
                    type="button"
                    onClick={() => handleZoomChange(1)}
                    className="ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-[#C19A6B] hover:text-[#2B2520] transition-colors"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Prev/Next Banner Image Switcher Buttons (Hidden on Mobile) */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleNavigateImage("prev", e)}
                    onDoubleClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    className="hidden sm:flex absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#2B2520] hover:text-[#C19A6B] backdrop-blur-md shadow-md items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20 cursor-pointer select-none text-base"
                    title="Previous Image"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleNavigateImage("next", e)}
                    onDoubleClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    className="hidden sm:flex absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#2B2520] hover:text-[#C19A6B] backdrop-blur-md shadow-md items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20 cursor-pointer select-none text-base"
                    title="Next Image"
                  >
                    →
                  </button>
                </>
              )}

              {/* Image Counter Pill (Compact on Mobile) */}
              {images.length > 1 && (
                <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 bg-black/55 backdrop-blur-md text-white text-[9.5px] sm:text-[11px] font-heading font-medium tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10 pointer-events-none">
                  {images.indexOf(activeImage) + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto w-full pb-2 scrollbar-none justify-start sm:justify-center">
                {images.map((img: string, idx: number) => {
                  const isSelected = (activeImage || images[0]) === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                        setIsDragging(false);
                        setActiveImage(img);
                      }}
                      onDoubleClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-none overflow-hidden shrink-0 transition-all border-2 cursor-pointer select-none ${isSelected ? "border-[#C19A6B] ring-2 ring-[#C19A6B]/30 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                    >
                      <SafeImage
                        src={img}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* 🏷️ RIGHT COLUMN: PRODUCT DETAILS, SIZING, COMMERCE & ACTIONS */}
          {/* ========================================================================= */}
          <div
            id="product-details-column"
            className="lg:col-span-5 flex flex-col justify-start text-left"
          >

            {/* Header & Badges */}
            <div className="border-b border-[#EAEAEB] pb-5 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-bold">
                  {product.category || "Handcrafted Heritage"}
                </span>

                {/* Wishlist & Share Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full border border-[#EAEAEB] hover:border-[#2B2520] text-[#2B2520] transition-colors relative cursor-pointer"
                    title="Share Masterpiece"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {shareCopied && (
                      <span className="absolute -bottom-8 right-0 bg-[#2B2520] text-white text-[10px] uppercase tracking-wider py-1 px-2 rounded shadow-md whitespace-nowrap">
                        Link Copied!
                      </span>
                    )}
                  </button>

                  <button
                    onClick={toggleWishlist}
                    className={`p-2.5 rounded-full border transition-colors cursor-pointer ${isWishlisted
                      ? "border-[#A63C38] bg-[#A63C38]/5 text-[#A63C38]"
                      : "border-[#EAEAEB] hover:border-[#2B2520] text-[#2B2520]"
                      }`}
                    title={isWishlisted ? "Remove from Private Wishlist" : "Save to Private Wishlist"}
                  >
                    <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-[#2B2520] leading-snug mb-3">
                {product.name}
              </h1>

              {/* Price display with Global Currency Integration */}
              <div className="flex items-baseline space-x-3 mt-3">
                <span suppressHydrationWarning className="text-2xl sm:text-3xl font-heading font-bold text-[#2B2520]">
                  {formatPrice(selectedVariant?.price || product.price, 1)}
                </span>

                {(() => {
                  const curVal = parseFloat(String(selectedVariant?.price || product.price || "0").replace(/[^0-9.]/g, "")) || 0;
                  const origVal = parseFloat(String(selectedVariant?.original_price || product.original_price || "0").replace(/[^0-9.]/g, "")) || 0;
                  if (origVal > curVal) {
                    return (
                      <span suppressHydrationWarning className="text-base text-[#7A7065] line-through font-body">
                        {formatPrice(origVal, 1)}
                      </span>
                    );
                  }
                  return null;
                })()}

                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#1B7042] bg-[#EAF5EF] px-2.5 py-0.5 rounded-full">
                  Tax Included • Free Insured Delivery
                </span>
              </div>
            </div>

            {/* 📏 Variant / Size, Color & Quantity Selectors (Matching Luxury Dropdown Style with Rounded Corners) */}
            <div ref={dropdownRef} className="space-y-4 mb-6">

              {/* 1. Size Dropdown */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-heading font-semibold text-[#2B2520]">
                      Size
                    </label>
                    <div className="flex items-center gap-3">
                      {product.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSizeViewMode(sizeViewMode === "dropdown" ? "grid" : "dropdown")}
                          className="text-[11px] text-[#7A7065] hover:text-[#2B2520] underline transition-colors cursor-pointer"
                        >
                          {sizeViewMode === "dropdown" ? "View all sizes grid ⊞" : "Switch to dropdown ▾"}
                        </button>
                      )}
                      {/* {product.studio_image ? (
                        <Link 
                          href={`/customize?product=${product.id}`}
                          className="text-xs text-[#C19A6B] hover:text-[#2B2520] underline transition-colors"
                        >
                          Custom size & colors?
                        </Link>
                      ) : null} */}
                    </div>
                  </div>

                  {sizeViewMode === "dropdown" ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
                        className="w-full flex items-center justify-between bg-[#FAF8F5] border border-[#4A1017]/25 hover:border-[#4A1017] focus:border-[#2B070B] rounded-xl px-4 py-3.5 text-sm font-medium text-[#2B070B] outline-none transition-all cursor-pointer shadow-2xs text-left"
                      >
                        <span className="truncate">
                          {selectedVariant ? `${selectedVariant.size} — ${formatPrice(selectedVariant.price, 1)}` : "Select an option"}
                        </span>
                        <svg
                          className={`w-4 h-4 text-[#8C6B38] transition-transform duration-200 shrink-0 ml-2 ${openDropdown === "size" ? "rotate-180 text-[#2B070B]" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openDropdown === "size" && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#FAF8F5] border border-[#4A1017] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                          {product.variants.map((v: any, idx: number) => {
                            const isChosen = selectedVariant?.size === v.size;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedVariant(v);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors cursor-pointer ${isChosen
                                  ? "bg-[#2B070B] text-[#FAF5EB] font-semibold"
                                  : "text-[#2B070B] hover:bg-[#FAF5EB]"
                                  }`}
                              >
                                <span>{v.size}</span>
                                <span className={isChosen ? "text-[#FAF5EB] font-bold" : "text-[#8C6B38] font-medium"}>
                                  {formatPrice(v.price, 1)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {product.variants.map((v: any, idx: number) => {
                        const isChosen = selectedVariant?.size === v.size;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${isChosen
                              ? "border-[#4A1017] bg-[#FAF5EB] shadow-sm ring-1 ring-[#4A1017]"
                              : "border-[#4A1017]/20 bg-white/60 hover:bg-white hover:border-[#4A1017]"
                              }`}
                          >
                            <div className="font-heading font-bold text-xs sm:text-sm text-[#2B070B]">
                              {v.size}
                            </div>
                            <div suppressHydrationWarning className="text-[11px] text-[#8C6B38] font-medium mt-0.5">
                              {formatPrice(v.price, 1)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Color Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-heading font-semibold text-[#2B070B]">
                    Color
                  </label>
                  {selectedColor && (
                    <span className="text-xs text-[#8C6B38] font-medium">
                      {selectedColor}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "color" ? null : "color")}
                    className="w-full flex items-center justify-between bg-[#FAF8F5] border border-[#4A1017]/25 hover:border-[#4A1017] focus:border-[#2B070B] rounded-xl px-4 py-3.5 text-sm font-medium text-[#2B070B] outline-none transition-all cursor-pointer shadow-2xs text-left"
                  >
                    <span className="truncate">
                      {selectedColor || "Select an option"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-[#8C6B38] transition-transform duration-200 shrink-0 ml-2 ${openDropdown === "color" ? "rotate-180 text-[#2B070B]" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openDropdown === "color" && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#FAF8F5] border border-[#4A1017] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                      {availableColors.map((col: string, idx: number) => {
                        const isChosen = selectedColor.toLowerCase().trim() === col.toLowerCase().trim();
                        const matched = activeColorVariants.find(
                          (cv) => cv.color.toLowerCase().trim() === col.toLowerCase().trim()
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleColorSelect(col);
                              setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors cursor-pointer ${isChosen
                              ? "bg-[#2B070B] text-[#FAF5EB] font-semibold"
                              : "text-[#2B070B] hover:bg-[#FAF5EB]"
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {matched?.image ? (
                                <img
                                  src={matched.image}
                                  alt={col}
                                  className="w-5 h-5 rounded-md object-cover border border-black/10 shrink-0"
                                />
                              ) : matched?.hex ? (
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: matched.hex }}
                                />
                              ) : null}
                              <span>{col}</span>
                            </div>
                            {isChosen && <span className="text-xs text-[#FAF5EB]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Quantity Dropdown */}
              <div>
                <label className="block text-sm font-heading font-semibold text-[#2B070B] mb-1.5">
                  Quantity
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "quantity" ? null : "quantity")}
                    className="w-full flex items-center justify-between bg-[#FAF8F5] border border-[#4A1017]/25 hover:border-[#4A1017] focus:border-[#2B070B] rounded-xl px-4 py-3.5 text-sm font-medium text-[#2B070B] outline-none transition-all cursor-pointer shadow-2xs text-left"
                  >
                    <span>{quantity}</span>
                    <svg
                      className={`w-4 h-4 text-[#8C6B38] transition-transform duration-200 shrink-0 ml-2 ${openDropdown === "quantity" ? "rotate-180 text-[#2B070B]" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openDropdown === "quantity" && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#FAF8F5] border border-[#4A1017] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isChosen = quantity === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setQuantity(num);
                              setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${isChosen
                              ? "bg-[#2B070B] text-[#FAF5EB] font-semibold"
                              : "text-[#2B070B] hover:bg-[#FAF5EB]"
                              }`}
                          >
                            <span>{num}</span>
                            {isChosen && <span className="text-xs text-[#FAF5EB]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 🔢 Action Buttons */}
            <div className="space-y-3 mb-8">
              {/* Row 1: Add to Bag */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`w-full py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 text-center ${isInCart
                    ? "bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] border border-[#4A1017]"
                    : "bg-[#2B070B] hover:bg-[#1F0508] text-[#FAF5EB] hover:text-white border border-[#4A1017]/50"
                    }`}
                >
                  {isAddingToCart ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </span>
                  ) : isInCart ? (
                    <span>✓ In Bag • Add Another</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Row 2: Instant Buy It Now Button (Warm Camel Artisan Gold) */}
              <button
                type="button"
                onClick={handleBuyItNow}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-heading font-bold text-xs sm:text-sm uppercase tracking-widest bg-[#C19A6B] hover:bg-[#2B070B] text-white transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 border border-[#C19A6B]/30"
              >
                <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Buy It Now</span>
              </button>

              {/* Row 3: Order on Etsy (Direct Link) */}
              {(product.etsy_url || product.show_etsy) && (
                <a
                  href={product.etsy_url || "https://www.etsy.com/shop/AHADGLOBALRUGS"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-xs uppercase tracking-wider bg-[#F1641E] hover:bg-[#D95314] text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                  title="View and order this listing directly on our official Etsy shop"
                >
                  <span className="w-4 h-4 rounded-full bg-white text-[#F1641E] flex items-center justify-center font-bold text-[10px]">
                    E
                  </span>
                  <span>Order on Etsy</span>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}

              {/* Quick Inquire for this Product */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("open-quick-inquire", {
                        detail: {
                          subject: `Inquiry: ${product.title}`,
                          message: `Hi NR Enterprises Atelier, I have an inquiry regarding "${product.title}" (Size: ${selectedVariant?.size || "Standard"}, Color: ${selectedColor || "Default"}). Please assist me.`
                        }
                      })
                    );
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl font-heading font-medium text-xs text-[#8C6B38] hover:text-[#2B070B] hover:bg-[#FAF5EB] border border-dashed border-[#4A1017]/30 hover:border-[#4A1017] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#8C6B38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Have a custom size or question? Quick Inquire with Atelier →</span>
              </button>
            </div>

            {/* 🛡️ Trust & Artisan Guarantee Badges */}
            <div className="border-t border-[#4A1017]/15 pt-5 pb-2">
              <div className="grid grid-cols-2 gap-2.5 text-xs text-[#2B070B]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#4A1017]/20 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#2B070B]/10 text-[#4A1017] flex items-center justify-center shrink-0 text-xs font-bold">
                    🛡️
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#2B070B]">Authentic Bhadohi</h5>
                    <p className="text-[10.5px] text-[#5A4E42] mt-0.5 leading-snug">Woven by generational master weavers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#4A1017]/20 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#2B070B]/10 text-[#4A1017] flex items-center justify-center shrink-0 text-xs font-bold">
                    🚚
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#2B070B]">Insured Delivery</h5>
                    <p className="text-[10.5px] text-[#5A4E42] mt-0.5 leading-snug">Complimentary doorstep transit.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#4A1017]/20 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#2B070B]/10 text-[#4A1017] flex items-center justify-center shrink-0 text-xs font-bold">
                    🔄
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#2B070B]">7-Day Exchange</h5>
                    <p className="text-[10.5px] text-[#5A4E42] mt-0.5 leading-snug">Hassle-free size or shade change.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#4A1017]/20 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#2B070B]/10 text-[#4A1017] flex items-center justify-center shrink-0 text-xs font-bold">
                    🔒
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#2B070B]">Secure Checkout</h5>
                    <p className="text-[10.5px] text-[#5A4E42] mt-0.5 leading-snug">PCI-DSS encrypted via Razorpay.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 📜 LUXURY PRODUCT DRAWER & ACCORDION (Right Column) */}
            <div className="border-t border-[#EAEAEB] mt-5 divide-y divide-[#EAEAEB]">

              {/* 1. Description & Story (Expanded by default) */}
              {product.description && typeof product.description === "string" && product.description.trim().length > 0 && (
                <div className="py-4.5">
                  <button
                    type="button"
                    onClick={() => toggleSection("desc")}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#2B2520] group-hover:text-[#C19A6B] transition-colors flex items-center gap-2">
                      <span>Description & Details</span>
                    </span>
                    <span className="text-base font-semibold text-[#7A7065] group-hover:text-[#2B2520] transition-colors">
                      {openSections.desc ? "−" : "+"}
                    </span>
                  </button>

                  {openSections.desc && (
                    <div className="pt-3.5 text-[13px] sm:text-[14px] text-[#4A4238] leading-relaxed font-body whitespace-pre-line space-y-3">
                      <p>{product.description.trim()}</p>

                      {/* Features if available */}
                      {Array.isArray(product.features) && product.features.length > 0 && (
                        <div className="pt-2 border-t border-[#F2EDE4] mt-3">
                          <span className="block text-[11px] uppercase tracking-wider font-heading font-bold text-[#7A7065] mb-2">Key Highlights</span>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-[#5C5346] marker:text-[#C19A6B]">
                            {product.features.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {Array.isArray(product.tags) && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {product.tags.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5F2EC] text-[#7A7065] border border-[#EAEAEB]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Specifications & Craftsmanship */}
              <div className="py-4.5">
                <button
                  type="button"
                  onClick={() => toggleSection("specs")}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#2B2520] group-hover:text-[#C19A6B] transition-colors">
                    Specifications & Craftsmanship
                  </span>
                  <span className="text-base font-semibold text-[#7A7065] group-hover:text-[#2B2520] transition-colors">
                    {openSections.specs ? "−" : "+"}
                  </span>
                </button>

                {openSections.specs && (
                  <div className="pt-3.5 grid grid-cols-2 gap-2.5 text-xs">
                    {product.material && (
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                        <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Material</span>
                        <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">{product.material}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                        <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Primary Color</span>
                        <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">{product.color}</span>
                      </div>
                    )}
                    {product.style && (
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                        <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Weave Style</span>
                        <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">{product.style}</span>
                      </div>
                    )}
                    {product.room && (
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                        <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Ideal Room</span>
                        <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">{product.room}</span>
                      </div>
                    )}
                    {product.pattern && (
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                        <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Pattern</span>
                        <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">{product.pattern}</span>
                      </div>
                    )}
                    {product.shape && (
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                        <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Shape</span>
                        <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">{product.shape}</span>
                      </div>
                    )}
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                      <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Origin</span>
                      <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">Bhadohi, India</span>
                    </div>
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAEAEB]/70">
                      <span className="block text-[10px] uppercase tracking-wider text-[#8C7E70] font-heading font-bold">Artisan Technique</span>
                      <span className="block text-xs font-heading font-semibold text-[#2B2520] mt-0.5">Generational Handcrafted</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Care & Maintenance */}
              <div className="py-4.5">
                <button
                  type="button"
                  onClick={() => toggleSection("care")}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#2B2520] group-hover:text-[#C19A6B] transition-colors">
                    Care & Maintenance
                  </span>
                  <span className="text-base font-semibold text-[#7A7065] group-hover:text-[#2B2520] transition-colors">
                    {openSections.care ? "−" : "+"}
                  </span>
                </button>

                {openSections.care && (
                  <div className="pt-3.5 text-xs sm:text-[13px] text-[#4A4238] leading-relaxed font-body whitespace-pre-line space-y-2">
                    <p>
                      {product.care_instructions && typeof product.care_instructions === "string" && product.care_instructions.trim().length > 0
                        ? product.care_instructions.trim()
                        : "• Regular vacuuming with suction only (avoid rotating beater brush).\n• Blot spills immediately with a clean, dry cloth; do not rub.\n• Rotate the rug 180 degrees every 6 months to ensure balanced wear.\n• Professional carpet cleaning recommended for deep refreshing."}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Shipping & Returns */}
              <div className="py-4.5">
                <button
                  type="button"
                  onClick={() => toggleSection("shipping")}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#2B2520] group-hover:text-[#C19A6B] transition-colors">
                    Shipping & Exchange
                  </span>
                  <span className="text-base font-semibold text-[#7A7065] group-hover:text-[#2B2520] transition-colors">
                    {openSections.shipping ? "−" : "+"}
                  </span>
                </button>

                {openSections.shipping && (
                  <div className="pt-3.5 text-xs sm:text-[13px] text-[#4A4238] leading-relaxed font-body space-y-2">
                    <p className="flex items-center gap-2 text-[#1B7042] font-semibold">
                      <span>✓</span> Free Insured Delivery across India & Global Transit
                    </p>
                    <p className="text-[#5C5346]">
                      Every NR Enterprises piece is individually inspected, roll-packed in moisture-barrier layers, and dispatched straight from the artisan loom in Bhadohi.
                    </p>
                    <p className="text-[#5C5346]">
                      {product.return_policy && typeof product.return_policy === "string" && product.return_policy.trim().length > 0
                        ? product.return_policy.trim()
                        : "Enjoy a 7-day hassle-free exchange window. If the size, palette, or pile height doesn't fit your space, our concierge will coordinate a replacement."}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 🌟 YOU MAY ALSO LIKE (Related Items First + Full Mixed Shop Catalog) */}
        {/* ========================================================================= */}
        {relatedItems.length > 0 && (
          <div className="mt-20 sm:mt-28 border-t border-[#EAEAEB] pt-14 sm:pt-18 max-w-7xl mx-auto px-[5px] sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-bold block mb-1.5">
                  Curated For Your Space
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#2B2520]">
                  You May Also Like
                </h3>
              </div>
              <Link
                href="/collections"
                prefetch={true}
                className="text-xs uppercase tracking-widest font-heading font-bold text-[#2B2520] hover:text-[#C19A6B] transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Explore All Collections</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-10">
              {relatedItems.map((item: any, idx: number) => {
                const displayImg = Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : (item.image || "");
                const itemDiscount = item.original_price && Number(item.original_price) > Number(item.price)
                  ? Math.round(((Number(item.original_price) - Number(item.price)) / Number(item.original_price)) * 100)
                  : 0;

                return (
                  <div key={item.id || idx} className="flex flex-col group cursor-pointer">
                    {/* Seamless 3:4 Image Container (Square Corners) */}
                    <div className="relative aspect-[3/4] sm:aspect-4/5 w-full rounded-none overflow-hidden bg-[#ECE7DE] shadow-xs group-hover:shadow-lg active:scale-[0.98] transition-all duration-300 mb-3">
                      <Link href={`/product/${item.id}`} prefetch={true} className="block w-full h-full">
                        {displayImg && (
                          <Image
                            src={displayImg}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            quality={85}
                            loading={idx < 4 ? "eager" : "lazy"}
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        )}
                      </Link>

                      {/* Top Badges */}
                      {itemDiscount > 0 ? (
                        <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-[#1B4D3E] text-white border border-[#26624F] text-[9.5px] sm:text-[10.5px] font-heading font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-none shadow-sm pointer-events-none z-10">
                          -{itemDiscount}%
                        </span>
                      ) : item.badge ? (
                        <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-white/95 text-[#2B070B] text-[9.5px] sm:text-[10px] font-heading font-bold tracking-wider px-2.5 py-0.5 rounded-none shadow-sm border border-[#4A1017]/20 pointer-events-none z-10">
                          {item.badge}
                        </span>
                      ) : null}

                      {/* Desktop View Details Button on Hover */}
                      <Link
                        href={`/product/${item.id}`}
                        prefetch={true}
                        className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block"
                      >
                        <span className="w-full block text-center bg-white hover:bg-[#FAF5EB] text-[#2B070B] hover:text-[#4A1017] py-2.5 rounded-none text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 shadow-xl border border-black/10 backdrop-blur-md">
                          View Details →
                        </span>
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col text-left">
                      {item.category && (
                        <span className="text-[10px] sm:text-[11px] text-[#C19A6B] uppercase tracking-[0.2em] font-heading font-bold mb-1">
                          {item.category}
                        </span>
                      )}
                      <Link href={`/product/${item.id}`} prefetch={true}>
                        <h4 className="text-[13px] sm:text-[14.5px] text-[#2B2520] font-heading font-semibold leading-snug line-clamp-2 hover:text-[#C19A6B] transition-colors mb-1">
                          {item.name}
                        </h4>
                      </Link>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span suppressHydrationWarning className="text-xs sm:text-sm text-[#2B2520] font-heading font-bold">
                          {formatPrice(item.price, 1)}
                        </span>
                        {item.original_price && Number(item.original_price) > Number(item.price) && (
                          <span suppressHydrationWarning className="text-[11px] sm:text-xs text-[#7A7065] line-through font-body">
                            {formatPrice(item.original_price, 1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom View All CTA */}
            <div className="text-center mt-12 sm:mt-14">
              <Link
                href="/collections"
                prefetch={true}
                className="inline-flex items-center justify-center bg-[#2B2520] hover:bg-[#C19A6B] text-white px-9 py-3 text-xs font-heading font-bold tracking-[0.18em] uppercase rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                Browse All Handcrafted Collections →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
