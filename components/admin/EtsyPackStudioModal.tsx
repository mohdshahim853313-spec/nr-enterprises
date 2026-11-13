"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface EtsyPackStudioModalProps {
  productId: string;
  onClose: () => void;
  availableProducts?: Array<{ id: string; name: string; sku?: string }>;
  onSelectProduct?: (id: string) => void;
}

export default function EtsyPackStudioModal({
  productId,
  onClose,
  availableProducts,
  onSelectProduct,
}: EtsyPackStudioModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/admin/etsy-pack/preview?productId=${productId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load pack preview");
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load pack");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [productId]);

  const handleDownloadZip = () => {
    setDownloading(true);
    window.location.href = `/api/admin/etsy-pack/download?productId=${productId}`;
    setTimeout(() => setDownloading(false), 3000);
  };

  const handlePushDraft = async () => {
    setPushing(true);
    setPushResult(null);
    try {
      const res = await fetch("/api/admin/etsy-pack/push-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const result = await res.json();
      setPushResult(result);
    } catch (err: any) {
      setPushResult({ success: false, error: err.message });
    } finally {
      setPushing(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border border-[#DFD8CC] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#EAEAEB] bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C19A6B] font-bold">
                Etsy Humanized Studio Pack
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                🛡️ AI-Detection Bypassed
              </span>
              {data?.isEtsyConnected ? (
                <span className="text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                  <span>🟢</span>
                  <span>Etsy Direct Write Ready</span>
                </span>
              ) : (
                <a
                  href="/api/etsy/oauth/connect"
                  className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="Click to authorize 1-click direct Etsy draft updating"
                >
                  <span>🔐</span>
                  <span>Connect Etsy for 1-Click Draft</span>
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-serif text-2xl text-[#1C1917] truncate max-w-md">
                {data?.product?.name || "Loading Pack Studio..."}
              </h3>
              {availableProducts && availableProducts.length > 0 && onSelectProduct && (
                <select
                  value={productId}
                  onChange={(e) => onSelectProduct(e.target.value)}
                  className="text-xs bg-[#F6F4F0] border border-[#DFD8CC] rounded-lg px-2.5 py-1 text-[#1C1917] font-medium focus:outline-none focus:border-[#C19A6B] cursor-pointer max-w-xs truncate"
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-[#7A7065] flex items-center gap-2">
              <span className="font-mono font-bold text-[#1C1917]">{data?.product?.sku}</span>
              <span>•</span>
              <span>Sony Alpha A7R IV Metadata</span>
              <span>•</span>
              <span>Bhadohi Atelier Geotag</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={loading || downloading}
              className="px-4 py-2.5 bg-[#1C1917] hover:bg-[#C19A6B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{downloading ? "⏳ Preparing ZIP..." : "📥 Download .ZIP Pack"}</span>
            </button>

            <button
              type="button"
              onClick={handlePushDraft}
              disabled={loading || pushing}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F1641E] to-[#D95314] hover:from-[#D95314] hover:to-[#B8400C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{pushing ? "⏳ Uploading Photos & Setting Draft..." : "🚀 Push Watermarked Pack to Etsy"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F6F4F0] hover:bg-[#EAEAEB] text-[#7A7065] hover:text-[#1C1917] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Push Result Banner */}
          {pushResult && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-3 ${
                pushResult.requiresOAuth
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : pushResult.success
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-red-50 border-red-200 text-red-950"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {pushResult.requiresOAuth ? (
                    <>
                      <span>🔐</span>
                      <span>1-Time Etsy Authorization Required</span>
                    </>
                  ) : pushResult.success ? (
                    <>
                      <span>🎉</span>
                      <span>Listing Directly Moved to Draft on Etsy!</span>
                    </>
                  ) : (
                    <>
                      <span>❌</span>
                      <span>Error Updating Listing</span>
                    </>
                  )}
                </span>
                {pushResult.etsyShopUrl && (
                  <a
                    href={pushResult.etsyShopUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1C1917] hover:underline flex items-center gap-1 font-bold bg-white px-2.5 py-1 rounded-lg border border-[#DFD8CC] shadow-2xs"
                  >
                    <span>Open in Etsy Listing Editor</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
              <p>{pushResult.message || pushResult.error}</p>
              {pushResult.requiresOAuth && (
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <a
                    href={pushResult.oauthConnectUrl || "/api/etsy/oauth/connect"}
                    className="px-4 py-2 bg-gradient-to-r from-[#F1641E] to-[#D95314] hover:from-[#D95314] hover:to-[#B8400C] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>🔗</span>
                    <span>Connect Etsy Account (1-Click Login)</span>
                  </a>
                  <span className="text-[11px] text-[#7A7065]">
                    (Etsy requires shop owner permission to let website update listings to draft directly)
                  </span>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <span className="text-4xl block animate-bounce">📦</span>
              <p className="text-sm font-semibold text-[#1C1917]">
                Generating Realistic Sony DSLR Sensor Profiles...
              </p>
              <p className="text-xs text-[#7A7065]">
                Injecting authentic shutter speeds, micro-grain overlays, and Bhadohi GPS tags.
              </p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Photo Inspection Grid */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-heading font-bold text-sm text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                    <span>📸 Complete 10-Photo Etsy Pack ({data.photos?.length || 10})</span>
                    <span className="text-[11px] font-normal text-[#7A7065]">
                      (8 Humanized Design + 2 Real Craft Proofs)
                    </span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
                      🎞️ Micro-Grain (ISO 400)
                    </span>
                    <span className="text-[11px] text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 shadow-2xs">
                      <img src="/watermark-logo.png" alt="RZ" className="w-3.5 h-3.5 object-contain opacity-80" />
                      <span>RZ Logo Watermark (60% Opacity)</span>
                    </span>
                    <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                      🛡️ Real Bhadohi Proofs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.photos.map((photo: any) => (
                    <div
                      key={photo.index}
                      className={`rounded-2xl p-3 shadow-2xs space-y-2.5 group transition-all ${
                        photo.isCraftProof
                          ? "bg-gradient-to-b from-emerald-50/50 to-white border-2 border-emerald-400"
                          : "bg-white border border-[#DFD8CC] hover:border-[#C19A6B]"
                      }`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F6F4F0] border border-black/5">
                        <Image
                          src={photo.imgUrl}
                          alt={photo.label}
                          fill
                          sizes="(max-width: 768px) 100vw, 250px"
                          className="object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            photo.isCraftProof
                              ? "bg-emerald-700 text-white shadow-xs"
                              : "bg-black/75 text-white"
                          }`}
                        >
                          #{photo.index} {photo.isCraftProof ? "REAL CRAFT PROOF" : photo.label}
                        </span>

                        {photo.hasWatermark && (
                          <div
                            className="absolute bottom-2 right-2 pointer-events-none p-1 rounded-lg bg-black/25 backdrop-blur-xs flex items-center justify-center shadow-xs"
                            title="NR Enterprises Atelier Official Logo Watermark"
                          >
                            <img
                              src="/logo.png"
                              alt="NR Enterprises Logo Watermark"
                              className="w-10 h-10 object-contain opacity-70 drop-shadow-sm select-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Camera EXIF Details */}
                      <div className="space-y-1 font-mono text-[10px] text-[#7A7065] bg-[#FAF9F5] p-2 rounded-xl border border-[#EAEAEB]">
                        <div className="flex items-center justify-between text-[#1C1917] font-bold">
                          <span>{photo.camera}</span>
                          <span className="text-emerald-700">ISO {photo.iso}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{photo.lens}</span>
                          <span>{photo.aperture} • {photo.shutter}</span>
                        </div>
                        <div className="pt-1 border-t border-[#EAEAEB] flex items-center justify-between text-[9px] text-[#8C7A63]">
                          <span>📅 {photo.shootDate}</span>
                          <span>📍 Bhadohi Atelier</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Listing Copy/Paste Details */}
              <div className="p-5 bg-white border border-[#DFD8CC] rounded-2xl shadow-2xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                  📝 Etsy Ready-Made Listing Data
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Title */}
                  <div className="flex items-center justify-between p-3 bg-[#FAF9F5] rounded-xl border border-[#EAEAEB]">
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A63] block">Title</span>
                      <p className="font-semibold text-[#1C1917] truncate">{data.product.original_name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(data.product.original_name, "title")}
                      className="shrink-0 px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-lg text-xs font-bold text-[#1C1917] hover:bg-[#FAF9F5] cursor-pointer"
                    >
                      {copiedField === "title" ? "✓ Copied" : "Copy Title"}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex items-start justify-between p-3 bg-[#FAF9F5] rounded-xl border border-[#EAEAEB] gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#8C7A63]">
                          Tags ({data.product.tags?.length || 0}/13)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {data.product.tags?.map((t: string, i: number) => (
                          <span
                            key={i}
                            className="bg-white border border-[#DFD8CC] px-2 py-0.5 rounded-md text-[11px] text-[#1C1917]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(data.product.tags.join(", "), "tags")}
                      className="shrink-0 px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-lg text-xs font-bold text-[#1C1917] hover:bg-[#FAF9F5] cursor-pointer"
                    >
                      {copiedField === "tags" ? "✓ Copied" : "Copy Tags"}
                    </button>
                  </div>

                  {/* Pricing & Sizes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAEAEB]">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A63] block">Price</span>
                      <p className="font-bold text-base text-[#1C1917]">{data.product.price}</p>
                      <span className="text-[10px] text-[#7A7065]">
                        MRP: {data.product.original_price} (33% OFF)
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAEAEB]">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A63] block">Material & Craft</span>
                      <p className="font-semibold text-xs text-[#1C1917]">{data.product.material}</p>
                      <span className="text-[10px] text-[#7A7065]">{data.product.category} • Hand-Tufted</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
