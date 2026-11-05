"use client";

import { useEffect } from "react";

/**
 * Returns the device category according to standard breakpoint standards:
 * - mobile: < 768px
 * - tablet: 768px to 1023px
 * - pc: >= 1024px
 */
function getDeviceCategory(width: number): "mobile" | "tablet" | "pc" {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "pc";
}

export default function ResponsiveReloader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialCategory = getDeviceCategory(window.innerWidth);
    let resizeTimer: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        const currentCategory = getDeviceCategory(window.innerWidth);
        if (currentCategory !== initialCategory) {
          initialCategory = currentCategory;
          window.location.reload();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
}
