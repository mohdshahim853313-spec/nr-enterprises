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
  const isEager = Boolean(rest.priority || rest.loading === "eager");
  const isCached = typeof src === "string" ? loadedUrlsCache.has(src) : false;

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(() => isEager || isCached);

  useEffect(() => {
    setHasError(false);
    if (typeof src === "string" && loadedUrlsCache.has(src)) {
      setIsLoaded(true);
    } else if (isEager) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src, isEager]);

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
        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A1F17] via-[#0F2A1E] to-[#06140E] select-none ${className}`}
        title={alt}
      >
        {/* Animated luxury shimmer pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent animate-pulse pointer-events-none" />

        {/* NR Enterprises Splash Gold Emblem */}
        <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 mb-2">
            <img
              src="/nr-logo.png"
              alt="NR Enterprises"
              className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.45)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <span className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#F3E5AB] drop-shadow-sm">
            NR Enterprises
          </span>
          <span className="text-[9.5px] text-[#A6C0B3] font-serif italic mt-0.5">
            Bespoke Carpet Atelier
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background Skeleton while image is downloading */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0A1F17] via-[#0F2A1E] to-[#06140E] flex flex-col items-center justify-center p-4 animate-pulse select-none">
          <div className="w-12 h-12 flex items-center justify-center p-1 mb-1.5">
            <img
              src="/nr-logo.png"
              alt="NR Enterprises"
              className="w-full h-full object-contain opacity-50"
            />
          </div>
          <span className="text-[9px] font-heading font-bold uppercase tracking-[0.2em] text-[#D4AF37]/70">
            NR Enterprises
          </span>
        </div>
      )}

      {/* Main Next.js Image */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
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
