"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";

export default function Wishlist() {
  const { formatPrice } = useCurrency();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // 🌟 Undo States
  const [fadingOutIds, setFadingOutIds] = useState<string[]>([]);
  const [undoToast, setUndoToast] = useState<{ show: boolean; item: any; timeoutId?: NodeJS.Timeout | null }>({ show: false, item: null, timeoutId: null });

  useEffect(() => {
    const loadWishlist = () => setWishlistItems(JSON.parse(localStorage.getItem("nrenterprises_wishlist") || "[]"));
    loadWishlist();
  }, []);

  // 🌟 Handle Removal Request (Starts the fade & shows Undo)
  const handleRemoveRequest = (item: any) => {
    setFadingOutIds(prev => [...prev, item.id]);

    if (undoToast.timeoutId) clearTimeout(undoToast.timeoutId);

    const timer = setTimeout(() => {
      actuallyRemove(item.id);
      setUndoToast({ show: false, item: null, timeoutId: null });
    }, 5000);

    setUndoToast({ show: true, item: item, timeoutId: timer });
  };

  // 🌟 Execute Real Deletion
  const actuallyRemove = (idToRemove: string) => {
    setWishlistItems(prev => {
      const updated = prev.filter(item => item.id !== idToRemove);
      localStorage.setItem("nrenterprises_wishlist", JSON.stringify(updated));
      return updated;
    });
    setFadingOutIds(prev => prev.filter(id => id !== idToRemove));
  };

  // 🌟 Handle Undo Click
  const handleUndo = () => {
    if (undoToast.timeoutId) clearTimeout(undoToast.timeoutId);
    setFadingOutIds(prev => prev.filter(id => id !== undoToast.item?.id));
    setUndoToast({ show: false, item: null, timeoutId: null });
  };

  useEffect(() => {
    return () => {
      if (undoToast.timeoutId) clearTimeout(undoToast.timeoutId);
    };
  }, [undoToast.timeoutId]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-3 sm:pt-4 pb-20 sm:pb-28 px-1.5 sm:px-6 md:px-10 font-sans text-[#2B070B]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EB] border border-[#4A1017]/40 text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C6B38] shadow-2xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B38]" />
            Curated Vault
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-heading text-[#2B070B] mb-2 tracking-tight">
            Saved Masterpieces
          </h1>
          <p className="text-xs sm:text-sm text-[#5A4E42]">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'rug' : 'rugs'} saved in your private atelier wishlist
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-[#4A1017]/20 p-8 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-[#FAF8F5] rounded-2xl flex items-center justify-center text-[#8C6B38] mb-5 border border-[#4A1017]/25 shadow-xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2B070B] mb-2">No Saved Pieces Yet</h2>
            <p className="text-xs sm:text-sm text-[#5A4E42] max-w-sm mx-auto mb-8 leading-relaxed">
              Explore our master-crafted collections and bookmark your favorite carpets to compare dimensions and colorways.
            </p>
            <Link
              href="/collections"
              className="bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white border border-[#4A1017] px-8 py-3.5 text-xs font-heading font-bold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6">
            {wishlistItems.map((item) => (
              <div 
                key={item.id} 
                className={`flex flex-col group items-center text-center relative transition-opacity ease-linear ${
                  fadingOutIds.includes(item.id) ? "opacity-0 duration-[3000ms] pointer-events-none" : "opacity-100 duration-300"
                }`}
              >
                {/* Seamless Image Container - NO hover border line, gentle lift + maroon shadow */}
                <div className="relative aspect-[3/4] sm:aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#ECE7DE] shadow-xs group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-4px_rgba(74,16,23,0.4)] transition-all duration-300">
                  <Link href={`/product/${item.id}`} className="block w-full h-full">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        quality={85}
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#8C6B38]">No Image</div>
                    )}
                  </Link>
                  
                  {/* Remove Button */}
                  <button 
                    onClick={(e) => { e.preventDefault(); handleRemoveRequest(item); }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 bg-[#2B070B]/85 hover:bg-red-700 text-[#FAF5EB] rounded-full flex items-center justify-center text-xs transition-all duration-200 shadow-sm z-10 cursor-pointer backdrop-blur-xs border border-[#4A1017]"
                    aria-label="Remove from wishlist"
                    title="Remove from saved"
                  >
                    ✕
                  </button>
                </div>

                {/* Product Details */}
                <div className="w-full flex flex-col items-center pt-3 sm:pt-3.5">
                  {item.category && (
                    <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-[#8C6B38] mb-1">
                      {item.category}
                    </span>
                  )}
                  <Link href={`/product/${item.id}`} className="w-full">
                    <h3 className="font-heading font-semibold text-[13px] sm:text-[14px] text-[#2B070B] line-clamp-2 leading-snug hover:text-[#8C6B38] transition-colors mb-1.5 text-center">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center text-[#4A1017] text-[12px] tracking-widest mb-1.5 font-bold">
                    ★★★★★
                  </div>
                  <div className="font-heading font-bold text-[14px] sm:text-[15px] text-[#2B070B]">
                    {formatPrice(item.price, 1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 UNDO TOAST NOTIFICATION */}
      <AnimatePresence>
        {undoToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#240609] text-[#FAF5EB] px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-[100] border border-[#4A1017]"
          >
            <span className="text-xs font-normal tracking-wide">Item removed from wishlist.</span>
            <button
              onClick={handleUndo}
              className="text-[#FAF5EB] hover:text-white underline font-heading font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}