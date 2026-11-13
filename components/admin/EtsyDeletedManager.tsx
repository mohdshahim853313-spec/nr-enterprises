"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EtsyDeletedManager({
  onClose,
  onOpenPackStudio,
}: {
  onClose: () => void;
  onOpenPackStudio?: (productId: string) => void;
}) {
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchDeleted = async () => {
    setIsLoading(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/etsy/sync");
      const data = await res.json();
      if (data?.deletedOnEtsy) {
        setDeletedItems(data.deletedOnEtsy);
      } else {
        setDeletedItems([]);
      }
    } catch (err: any) {
      console.error("Error checking deleted Etsy items:", err);
      setFeedbackMsg("Failed to check Etsy status: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === "draft" ? "published" : "draft";
    const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", item.id);
    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      setDeletedItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: newStatus } : p))
      );
    }
  };

  const handleDeletePermanent = async (item: any) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${item.name}" from your website too?\n\nThis will remove it completely from NR Enterprises.`
      )
    ) {
      return;
    }
    const { error } = await supabase.from("products").delete().eq("id", item.id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      setDeletedItems((prev) => prev.filter((p) => p.id !== item.id));
    }
  };

  const filtered = deletedItems.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-10 p-6 bg-[#FAFAFA] border-2 border-amber-600/30 rounded-2xl shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#EAEAEB] pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-bold block mb-1">
            Etsy Shop Sync & Catalog Protection
          </span>
          <h3 className="font-serif text-2xl text-[#1C1917] flex items-center gap-2">
            <span>🗑️ Deleted on Etsy</span>
            <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-mono font-bold">
              {deletedItems.length} items
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDeleted}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-white border border-[#DFD8CC] text-[#1C1917] hover:bg-[#F6F4F0] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className={isLoading ? "animate-spin" : ""}>🔄</span>
            <span>{isLoading ? "Checking..." : "Refresh Check"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#8C7A63] hover:text-[#1C1917] font-bold uppercase tracking-wider px-3 py-2 cursor-pointer"
          >
            Close ✕
          </button>
        </div>
      </div>

      {/* Informational Policy Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950 leading-relaxed flex items-start gap-3">
        <span className="text-lg shrink-0">🛡️</span>
        <div>
          <p className="font-bold text-amber-950 mb-1">
            Automatic Website Protection Active:
          </p>
          <p>
            Agar aapne Etsy shop se koi listing delete ya expire ki hai, toh wo aapki <strong>NR Enterprises website se automatic delete nahi hogi</strong>. Wo website par safe rahegi taaki aapke customers, SEO ranking aur links intact rahein. Aap chahein toh use website par live rakh sakte hain, Draft kar sakte hain, ya yahan se manually delete kar sakte hain.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {feedbackMsg}
        </div>
      )}

      {/* Search Bar */}
      {deletedItems.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deleted items by name or SKU..."
            className="w-full max-w-md px-3.5 py-2 text-xs bg-white border border-[#DFD8CC] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#C19A6B]"
          />
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="py-12 text-center text-[#7A7065] text-sm">
          <span className="inline-block animate-spin mr-2">⏳</span>
          Comparing live Etsy shop active listings with database...
        </div>
      ) : deletedItems.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-[#DFD8CC]/60 p-8 space-y-2">
          <span className="text-3xl block">✨</span>
          <h4 className="font-heading font-bold text-[#1C1917] text-base">
            All Etsy Products are Active & In Sync!
          </h4>
          <p className="text-xs text-[#7A7065] max-w-md mx-auto">
            Abhi koi bhi aisi listing nahi hai jo Etsy se delete ho chuki ho. Jab bhi aap Etsy par kisi listing ko delete ya deactivate karenge, wo yahan is list me dikhne lagegi!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F6F4F0] shrink-0 border border-black/5 relative">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#7A7065]">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                      {item.sku}
                    </span>
                    <h4 className="font-heading font-semibold text-sm text-[#1C1917] truncate mt-1">
                      {item.name}
                    </h4>
                    <span className="text-xs font-bold text-[#C19A6B]">
                      {item.price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-amber-50/70 px-2.5 py-1.5 rounded-lg border border-amber-200/50">
                  <span>⚠️ Status:</span>
                  <span className="font-semibold">Deleted on Etsy</span>
                  <span
                    className={`font-bold ml-auto ${
                      item.status === "draft"
                        ? "text-[#7A7065]"
                        : "text-emerald-700"
                    }`}
                  >
                    ● {item.status === "draft" ? "Draft" : "Live on NR Enterprises"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAEAEB] flex flex-wrap items-center gap-2 text-xs">
                {onOpenPackStudio && (
                  <button
                    type="button"
                    onClick={() => onOpenPackStudio(item.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1C1917] text-white hover:bg-black font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Open Etsy Safe Pack Studio (Micro-Grain + Sony EXIF + Tags + Draft Push)"
                  >
                    <span>📦</span>
                    <span>Safe Pack</span>
                  </button>
                )}
                <Link
                  href={`/product/${item.id}`}
                  target="_blank"
                  className="px-2.5 py-1.5 rounded-lg border border-[#DFD8CC] text-[#1C1917] hover:bg-[#F6F4F0] font-medium transition-colors"
                >
                  👁️ View
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#DFD8CC] text-[#7A7065] hover:text-[#1C1917] font-medium transition-colors cursor-pointer"
                >
                  {item.status === "draft" ? "Publish Live" : "Move to Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePermanent(item)}
                  className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium ml-auto transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
