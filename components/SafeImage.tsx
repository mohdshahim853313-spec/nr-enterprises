"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  showLogo?: boolean;
}

// In-memory cache of already loaded image URLs to prevent re-flashing skeletons on carousels/re-renders
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
  const isCached = typeof src === "string" ? loadedUrlsCache.has(src) : false;

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(() => isCached);

  useEffect(() => {
    setHasError(false);
    if (typeof src === "string" && loadedUrlsCache.has(src)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  const isValidSrc =
    typeof src === "string"
      ? src.trim().length > 0 &&
        !src.includes("undefined") &&
        !src.includes("null") &&
        !src.endsWith("/undefined")
      : Boolean(src);

  if (!isValidSrc || hasError) {
    return (
      <div
        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#3D0C12] via-[#2A080C] to-[#1A0407] border border-[#4A1017] select-none ${className}`}
        title={alt}
      >
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,245,235,0.06),transparent_70%)] pointer-events-none" />

        {/* NR Enterprises Emblem Placeholder */}
        <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center w-full max-w-[320px]">
          <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center p-1 mb-2">
            <img
              src="/nr-logo.png"
              alt="NR Enterprises"
              className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(74,16,23,0.5)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-[0.25em] text-[#FAF5EB] drop-shadow-sm">
            NR Enterprises
          </span>
          <span className="text-[10px] sm:text-[11.5px] text-[#FAF5EB]/80 font-serif italic mt-0.5">
            Bespoke Carpet Atelier • Bhadohi
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background Skeleton while image is downloading - Solid Dark Maroon (Zero White Flash) */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-[#240609] flex flex-col items-center justify-center p-4 select-none">
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center p-1 mb-2">
            <img
              src="/nr-logo.png"
              alt="NR Enterprises"
              className="w-full h-full object-contain opacity-75 drop-shadow-[0_2px_12px_rgba(74,16,23,0.35)]"
            />
          </div>
          <span className="text-[10px] sm:text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#FAF5EB]/80">
            NR Enterprises
          </span>
        </div>
      )}

      {/* Main Next.js Image with Crystal-Clear Full-Definition Support */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        quality={rest.quality || 95}
        unoptimized={Boolean(rest.unoptimized || (typeof src === "string" && (src.includes(".r2.dev") || src.startsWith("/uploads/"))))}
        className={`${className} transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => {
          if (typeof src === "string") loadedUrlsCache.add(src);
          setIsLoaded(true);
        }}
        onError={() => setHasError(true)}
        {...rest}
      />
    </>
  );
}
