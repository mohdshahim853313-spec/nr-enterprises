"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // 🌟 Pehli baar page open hone par scroll reset na karein taaki user ka initial scroll gesture hang/lock na ho
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Jab user route change kare (page navigation) tab scroll top par reset karein
    window.scrollTo(0, 0);

    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}