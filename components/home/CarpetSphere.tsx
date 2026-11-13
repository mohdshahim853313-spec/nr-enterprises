"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface CarpetSphereProps {
  code?: string;
  hex: string;
  name?: string;
  className?: string;
}

const STATIC_MAP: Record<string, string> = {
  green: "/textures/swatches/green.png",
  purple: "/textures/swatches/purple.png",
  beige: "/textures/swatches/beige.png",
  orange: "/textures/swatches/orange.png",
  pink: "/textures/swatches/pink.png",
  red: "/textures/swatches/red.png",
  grey: "/textures/swatches/grey.png",
  blue: "/textures/swatches/blue.png",
};

export default function CarpetSphere({ code, hex, name, className = "" }: CarpetSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticSrc = code ? STATIC_MAP[code.toLowerCase()] : null;

  useEffect(() => {
    // If not a standard static asset, tint dynamically via canvas
    if (!staticSrc && hex) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = "/textures/carpet-sphere-lum.png";
      img.onload = () => {
        canvas.width = 160;
        canvas.height = 160;
        ctx.clearRect(0, 0, 160, 160);
        ctx.drawImage(img, 0, 0, 160, 160);

        try {
          const imgData = ctx.getImageData(0, 0, 160, 160);
          const data = imgData.data;

          const cleanHex = hex.replace("#", "");
          const r = parseInt(cleanHex.substring(0, 2), 16) || 180;
          const g = parseInt(cleanHex.substring(2, 4), 16) || 140;
          const b = parseInt(cleanHex.substring(4, 6), 16) || 120;

          const avgLum = 110;
          for (let i = 0; i < data.length; i += 4) {
            const lum = data[i];
            const alpha = data[i + 3];
            if (alpha > 0) {
              const factor = lum / avgLum;
              let nr = r * factor;
              let ng = g * factor;
              let nb = b * factor;

              if (factor > 1.25) {
                const spec = Math.min(1.0, (factor - 1.25) / 0.8) * 0.4;
                nr = nr * (1 - spec) + 255 * spec;
                ng = ng * (1 - spec) + 255 * spec;
                nb = nb * (1 - spec) + 255 * spec;
              }

              data[i] = Math.min(255, Math.max(0, Math.round(nr)));
              data[i + 1] = Math.min(255, Math.max(0, Math.round(ng)));
              data[i + 2] = Math.min(255, Math.max(0, Math.round(nb)));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Fallback to fill
          ctx.fillStyle = hex;
          ctx.beginPath();
          ctx.arc(80, 80, 78, 0, Math.PI * 2);
          ctx.fill();
        }
      };
    }
  }, [staticSrc, hex]);

  if (staticSrc) {
    return (
      <div className={`relative w-full h-full rounded-full overflow-hidden ${className}`}>
        <Image
          src={staticSrc}
          alt={name || "Carpet swatch"}
          fill
          sizes="140px"
          quality={95}
          className="object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-full object-cover"
        style={{ backgroundColor: hex }}
      />
    </div>
  );
}

