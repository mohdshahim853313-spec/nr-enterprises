"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  showLogo?: boolean;
}

const loadedUrlsCache = new Set<string>();

export default function SafeImage({
  src,
  alt = "NR Enterprises Carpet",
  fallbackSrc,
  showLogo = true,
  className = "",
  fill,
  ...rest
}: SafeImageProps) {
  const isValidSrc =
    typeof src === "string"
      ? src.trim().length > 0 &&
        !src.includes("undefined") &&
        !src.includes("null")
      : Boolean(src);

  const [imgSrc, setImgSrc] = useState<string>(() => (isValidSrc && typeof src === "string" ? src : ""));
  const [hasError, setHasError] = useState(false);
  const isDirectCdn = typeof imgSrc === "string" && (imgSrc.includes("etsystatic.com") || imgSrc.includes(".r2.dev") || imgSrc.includes("supabase.co") || imgSrc.startsWith("/uploads/"));
  const [isLoaded, setIsLoaded] = useState(() => (typeof imgSrc === "string" ? loadedUrlsCache.has(imgSrc) || isDirectCdn : false));

  useEffect(() => {
    if (typeof src === "string" && src.trim() && !src.includes("undefined") && !src.includes("null")) {
      setImgSrc(src);
      setHasError(false);
      setIsLoaded(loadedUrlsCache.has(src) || src.includes("etsystatic.com") || src.includes(".r2.dev") || src.includes("supabase.co") || src.startsWith("/uploads/"));
    } else {
      setImgSrc(fallbackSrc || "");
      setHasError(!fallbackSrc);
      setIsLoaded(Boolean(fallbackSrc));
    }
  }, [src, fallbackSrc]);

  // If source is invalid or failed to load
  if (!isValidSrc || (hasError && !fallbackSrc)) {
    return (
      <div
        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#3D0C12] via-[#2A080C] to-[#1A0407] border border-[#4A1017] select-none ${className}`}
        title={alt}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,245,235,0.06),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center w-full max-w-[280px]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 mb-1.5">
            <img
              src="/nr-logo.png"
              alt="NR Enterprises"
              className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(74,16,23,0.5)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <span className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-[0.22em] text-[#FAF5EB] drop-shadow-sm">
            NR Enterprises
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] text-[#FAF5EB]/70 font-serif italic mt-0.5">
            Artisanal Bhadohi Atelier
          </span>
        </div>
      </div>
    );
  }

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : imgSrc;
  const isUnoptimized = Boolean(
    rest.unoptimized ||
    (typeof effectiveSrc === "string" && (effectiveSrc.includes("etsystatic.com") || effectiveSrc.includes(".r2.dev")))
  );

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-[#240609] flex flex-col items-center justify-center p-4 select-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 mb-1.5">
            <img
              src="/nr-logo.png"
              alt="NR Enterprises"
              className="w-full h-full object-contain opacity-75 drop-shadow-[0_2px_12px_rgba(74,16,23,0.35)]"
            />
          </div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-[#FAF5EB]/80">
            NR Enterprises
          </span>
        </div>
      )}

      <Image
        src={effectiveSrc}
        alt={alt}
        fill={fill}
        quality={rest.quality || 90}
        unoptimized={isUnoptimized}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => {
          if (typeof effectiveSrc === "string") loadedUrlsCache.add(effectiveSrc);
          setIsLoaded(true);
        }}
        onError={() => {
          if (!hasError && fallbackSrc) {
            setHasError(true);
            setImgSrc(fallbackSrc);
            setIsLoaded(true);
          } else {
            setHasError(true);
          }
        }}
        {...rest}
      />
    </>
  );
}
