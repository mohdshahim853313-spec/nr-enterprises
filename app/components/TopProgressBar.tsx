"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const progressValRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialMountRef = useRef(true);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    timerRef.current = null;
    stepIntervalRef.current = null;
    safetyTimeoutRef.current = null;
  };

  const completeProgress = () => {
    clearTimers();
    if (!lineRef.current || !containerRef.current) return;

    progressValRef.current = 100;
    lineRef.current.style.width = "100%";

    timerRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
      }
      timerRef.current = setTimeout(() => {
        if (lineRef.current) {
          lineRef.current.style.width = "0%";
          progressValRef.current = 0;
        }
      }, 300);
    }, 180);
  };

  const startProgress = () => {
    clearTimers();
    if (!lineRef.current || !containerRef.current) return;

    progressValRef.current = 28;
    lineRef.current.style.width = "28%";
    containerRef.current.style.opacity = "1";

    stepIntervalRef.current = setInterval(() => {
      let next = progressValRef.current;
      if (next >= 88) {
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
        return;
      }
      if (next < 60) next += 18;
      else if (next < 78) next += 9;
      else next += 3;

      progressValRef.current = next;
      if (lineRef.current) {
        lineRef.current.style.width = `${next}%`;
      }
    }, 150);

    safetyTimeoutRef.current = setTimeout(() => {
      completeProgress();
    }, 3500);
  };

  // Listen to Next.js route completion
  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    completeProgress();
  }, [pathname, searchParams]);

  // Global click & navigation listeners
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href === "#" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        target.getAttribute("role") === "button" ||
        target.hasAttribute("data-no-progress") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const currentUrl = new URL(window.location.href);
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        startProgress();
      } catch {}
    };

    const handlePopState = () => {
      startProgress();
    };

    const handleNavigationComplete = () => {
      completeProgress();
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("app:route-complete", handleNavigationComplete);
    window.addEventListener("error", handleNavigationComplete);
    window.addEventListener("unhandledrejection", handleNavigationComplete);
    window.addEventListener("pageshow", handleNavigationComplete);
    window.addEventListener("load", handleNavigationComplete);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("app:route-complete", handleNavigationComplete);
      window.removeEventListener("error", handleNavigationComplete);
      window.removeEventListener("unhandledrejection", handleNavigationComplete);
      window.removeEventListener("pageshow", handleNavigationComplete);
      window.removeEventListener("load", handleNavigationComplete);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-300 opacity-0"
    >
      {/* Golden Progress Line */}
      <div
        ref={lineRef}
        className="h-[3px] bg-gradient-to-r from-[#9E7848] via-[#C19A6B] to-[#E5A83B] shadow-[0_0_12px_rgba(193,154,107,0.7),0_0_5px_rgba(229,168,59,0.5)] transition-all duration-200 ease-out relative w-0"
      >
        {/* Leading glow head */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/60 blur-[1px]" />
        <div className="absolute -right-1 -top-[2px] w-2 h-2 rounded-full bg-[#FFF4DC] shadow-[0_0_8px_#E5A83B]" />
      </div>
    </div>
  );
}
