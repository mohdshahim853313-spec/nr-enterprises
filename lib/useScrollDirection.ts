"use client";

import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastScrollY = window.pageYOffset || window.scrollY || 0;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY =
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement.scrollTop ||
        0;

      // Always show when near the top of the page
      if (scrollY <= 50) {
        setScrollDirection((prev) => (prev !== "up" ? "up" : prev));
        lastScrollY = scrollY > 0 ? scrollY : 0;
        ticking = false;
        return;
      }

      const diff = scrollY - lastScrollY;
      // Sturdy trigger on 25px intentional scroll (prevents nervous micro-twitching)
      if (diff > 25) {
        setScrollDirection((prev) => (prev !== "down" ? "down" : prev));
      } else if (diff < -20) {
        setScrollDirection((prev) => (prev !== "up" ? "up" : prev));
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrollDirection;
}
