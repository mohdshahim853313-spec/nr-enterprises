"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EtsyListing {
  listing_id: number;
  title: string;
  clean_title: string;
  price: string;
  raw_price: number;
  currency: string;
  quantity: number;
  url: string;
  tags: string[];
  materials: string[];
  category: string;
  shape: string;
  is_synced: boolean;
  created_timestamp: number;
}

interface EtsySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export default function EtsySyncModal({
  isOpen,
  onClose,
  onSyncComplete,
}: EtsySyncModalProps) {
  const [listings, setListings] = useState<EtsyListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; currentTitle: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "new" | "synced">("all");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchEtsyListings = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/etsy/sync");
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch Etsy listings");
      }
      setListings(data.listings || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect to Etsy API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEtsyListings();
      setSelectedIds(new Set());
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [isOpen]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Filter by tab
      if (filterTab === "new" && item.is_synced) return false;
      if (filterTab === "synced" && !item.is_synced) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query) || item.clean_title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesCategory || matchesTags;
      }
      return true;
    });
  }, [listings, filterTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredListings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredListings.map((l) => l.listing_id)));
    }
  };

  const toggleSelectOne = (id: number) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Perform sync
  const handleSync = async (targetIds?: number[]) => {
    const idsToSync = targetIds || Array.from(selectedIds);
    if (idsToSync.length === 0) {
      alert("Please select at least one listing to sync.");
      return;
    }

    setIsSyncing(true);
    setErrorMsg("");
    setSuccessMsg("");
    setSyncProgress({ current: 0, total: idsToSync.length, currentTitle: "Starting sync..." });

    try {
      // Chunk sync in batches of 4 for smooth progress feedback
      const BATCH_SIZE = 4;
      let totalSuccess = 0;

      for (let i = 0; i < idsToSync.length; i += BATCH_SIZE) {
        const batch = idsToSync.slice(i, i + BATCH_SIZE);
        const currentItem = listings.find((l) => l.listing_id === batch[0]);
        setSyncProgress({
          current: Math.min(i + BATCH_SIZE, idsToSync.length),
          total: idsToSync.length,
          currentTitle: currentItem?.clean_title || `Syncing batch ${Math.floor(i / BATCH_SIZE) + 1}...`,
        });

        const res = await fetch("/api/etsy/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingIds: batch }),
        });

        const data = await res.json();
        if (data.success) {
          totalSuccess += data.syncedCount || 0;
        } else {
          console.warn("Batch sync error:", data.error);
        }
      }

      setSuccessMsg(`🎉 Successfully synced ${totalSuccess} listings from Etsy!`);
      await fetchEtsyListings();
      setSelectedIds(new Set());
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to complete sync process");
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const handleSyncAll = () => {
    const confirmAll = window.confirm(
      `Are you sure you want to sync all ${listings.length} active listings from Etsy to NR Enterprises? Existing products will be updated with fresh images and prices.`
    );
    if (!confirmAll) return;
    handleSync(listings.map((l) => l.listing_id));
  };

  if (!isOpen) return null;

  const syncedCount = listings.filter((l) => l.is_synced).length;
  const newCount = listings.length - syncedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-[#E5DDD2] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with Etsy Brand Accent */}
        <div className="bg-[#1C1917] text-white px-6 py-5 flex items-center justify-between border-b-4 border-[#F1641E]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F1641E] flex items-center justify-center font-bold text-white text-xl shadow-md">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading">
                  Etsy Live Catalog Sync
                </h2>
                <span className="bg-[#F1641E]/20 text-[#F1641E] border border-[#F1641E]/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live API
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Connected to <strong className="text-white">AHADGLOBALRUGS</strong> (https://www.etsy.com/shop/AHADGLOBALRUGS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSyncing}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center text-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Quick Stats & Controls Bar */}
        <div className="bg-[#FAF8F5] border-b border-[#E8DFD3] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#3A332C]">
                Total: <strong className="text-sm font-heading">{listings.length} Listings</strong>
              </span>
            </div>
            <div className="text-xs text-[#5C5247]">
              <span>Already Synced: </span>
              <strong className="text-emerald-700 font-bold">{syncedCount}</strong>
            </div>
            <div className="text-xs text-[#5C5247]">
              <span>Pending New: </span>
              <strong className="text-[#F1641E] font-bold">{newCount}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchEtsyListings}
              disabled={isLoading || isSyncing}
              className="px-3.5 py-2 text-xs font-bold bg-white border border-[#DFD8CC] text-[#3A332C] hover:bg-neutral-100 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{isLoading ? "Refreshing..." : "🔄 Refresh"}</span>
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => handleSync()}
                disabled={isSyncing}
                className="px-4 py-2 text-xs font-bold bg-[#3A332C] hover:bg-black text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                Sync Selected ({selectedIds.size})
              </button>
            )}

            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing || listings.length === 0}
              className="px-4 py-2 text-xs font-bold bg-[#F1641E] hover:bg-[#D95314] text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>⚡ Sync All {listings.length} Listings</span>
            </button>
          </div>
        </div>

        {/* Live Sync Progress Bar Overlay */}
        {isSyncing && syncProgress && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>Importing: {syncProgress.currentTitle}</span>
              </span>
              <span>
                {syncProgress.current} / {syncProgress.total} (
                {Math.round((syncProgress.current / syncProgress.total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#F1641E] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(syncProgress.current / syncProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {successMsg}
          </div>
        )}

        {/* Filters & Search */}
        <div className="px-6 py-3.5 border-b border-[#E8DFD3] flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterTab === "all"
                  ? "bg-[#1C1917] text-white"
                  : "bg-neutral-100 text-[#5C5247] hover:bg-neutral-200"
                }`}
            >
              All ({listings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("new")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterTab === "new"
                  ? "bg-[#F1641E] text-white"
                  : "bg-neutral-100 text-[#5C5247] hover:bg-neutral-200"
                }`}
            >
              New Only ({newCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("synced")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterTab === "synced"
                  ? "bg-emerald-700 text-white"
                  : "bg-neutral-100 text-[#5C5247] hover:bg-neutral-200"
                }`}
            >
              Already Synced ({syncedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search Etsy listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#DFD8CC] px-3.5 py-1.5 text-xs rounded-xl bg-white focus:border-[#C19A6B] outline-none text-[#3A332C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1.5 text-neutral-400 hover:text-black text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Listings Table / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5]">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#F1641E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#5C5247] uppercase tracking-wider">
                Connecting to Etsy API & Loading Listings...
              </p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 text-xs">
              No listings found matching your search.
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Select All Toggle Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3] text-xs font-bold text-[#5C5247] px-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      filteredListings.length > 0 &&
                      selectedIds.size === filteredListings.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded-sm accent-[#F1641E]"
                  />
                  <span>Select All ({filteredListings.length})</span>
                </label>
                <span>{selectedIds.size} Selected</span>
              </div>

              {/* Listing Rows */}
              {filteredListings.map((listing) => {
                const isSelected = selectedIds.has(listing.listing_id);
                return (
                  <div
                    key={listing.listing_id}
                    className={`bg-white border rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-md ${isSelected
                        ? "border-[#F1641E] bg-[#FFF9F5]"
                        : "border-[#E8DFD3] hover:border-[#C19A6B]"
                      }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(listing.listing_id)}
                        className="mt-1 rounded-sm accent-[#F1641E] cursor-pointer shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${listing.is_synced
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                              }`}
                          >
                            {listing.is_synced ? "✓ Synced on Website" : "✨ New Listing"}
                          </span>

                          <span className="bg-neutral-100 text-[#5C5247] text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                            {listing.category}
                          </span>

                          <span className="text-[10px] text-neutral-400 font-mono">
                            ID: {listing.listing_id}
                          </span>
                        </div>

                        <h3 className="font-heading font-bold text-sm text-[#1F1A17] line-clamp-1 mb-1">
                          {listing.clean_title}
                        </h3>

                        <p className="text-[11px] text-[#7A7065] line-clamp-1 mb-2">
                          {listing.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="font-bold text-[#1F1A17] font-heading">
                            {listing.price}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-[#5C5247]">
                            Qty: <strong>{listing.quantity}</strong>
                          </span>
                          <span className="text-neutral-400">•</span>
                          <a
                            href={listing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F1641E] hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <span>View on Etsy</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => handleSync([listing.listing_id])}
                        disabled={isSyncing}
                        className="px-3.5 py-1.5 text-xs font-bold bg-[#FAF8F5] hover:bg-[#F1641E] hover:text-white border border-[#DFD8CC] hover:border-[#F1641E] text-[#3A332C] rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        {listing.is_synced ? "Re-Sync Item" : "Import Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#E8DFD3] px-6 py-4 flex items-center justify-between">
          <p className="text-[11px] text-[#7A7065]">
            💡 Synced listings automatically import full HD photos, title, pricing, tags, and link back to your Etsy listing.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-neutral-200 hover:bg-neutral-300 text-[#3A332C] rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
