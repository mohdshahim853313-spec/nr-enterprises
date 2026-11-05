"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type CurrencyContextType = {
  currency: string;
  usdRate: number;
  setCurrency: (curr: string) => void;
  formatPrice: (inrPrice: any, qty?: number) => string;
};

const relativeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  AED: 3.67,
  SAR: 3.75,
  SGD: 1.34,
  CHF: 0.88,
  NZD: 1.64,
  JPY: 155.0,
  INR: 83.5,
  PLN: 4.02,
  SEK: 10.65,
};

const symbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "AU$",
  AED: "AED ",
  SAR: "SAR ",
  SGD: "SG$",
  CHF: "CHF ",
  NZD: "NZ$",
  JPY: "¥",
  INR: "₹",
  PLN: "zł ",
  SEK: "kr ",
};

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {}
  return null;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  usdRate: 83.5,
  setCurrency: () => {},
  formatPrice: () => "",
});

export const CurrencyProvider = ({
  children,
  initialCurrency = "USD",
  initialUsdRate = 83.5,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
  initialUsdRate?: number;
}) => {
  // ⚡ Synchronously read user's cookie / saved currency & rate to eliminate refresh price jumps & hydration mismatch
  const [currency, setCurrencyState] = useState<string>(() => {
    const cookieCurr = getCookieValue("user_currency");
    if (cookieCurr && symbols[cookieCurr]) return cookieCurr;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user_currency");
        if (saved && symbols[saved]) return saved;
      } catch {}
    }
    return initialCurrency && symbols[initialCurrency] ? initialCurrency : "USD";
  });

  const [usdRate, setUsdRate] = useState<number>(() => {
    const cookieRate = getCookieValue("cached_usd_rate");
    if (cookieRate) {
      const val = parseFloat(cookieRate);
      if (!isNaN(val) && val > 0) return val;
    }
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cached_usd_rate");
        if (saved) {
          const val = parseFloat(saved);
          if (!isNaN(val) && val > 0) return val;
        }
      } catch {}
    }
    return initialUsdRate || 83.5;
  });

  useEffect(() => {
    // Sync storage and ensure cookie is set for future requests
    try {
      const saved = localStorage.getItem("user_currency");
      if (saved && symbols[saved]) {
        document.cookie = `user_currency=${encodeURIComponent(saved)}; path=/; max-age=31536000; SameSite=Lax`;
        if (saved !== currency) {
          setCurrencyState(saved);
        }
      } else if (currency) {
        localStorage.setItem("user_currency", currency);
        document.cookie = `user_currency=${encodeURIComponent(currency)}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {}

    // Fetch and cache live rate silently in background without flickering
    const fetchRate = async () => {
      try {
        const { data } = await supabase
          .from("store_settings")
          .select("usd_rate")
          .eq("id", 1)
          .maybeSingle();

        if (data?.usd_rate) {
          const rate = Number(data.usd_rate);
          setUsdRate((prev) => (prev === rate ? prev : rate));
          try {
            localStorage.setItem("cached_usd_rate", rate.toString());
            document.cookie = `cached_usd_rate=${rate}; path=/; max-age=31536000; SameSite=Lax`;
          } catch {}
        }
      } catch {}
    };

    fetchRate();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user_currency" && e.newValue && symbols[e.newValue]) {
        setCurrencyState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [currency]);

  const setCurrency = useCallback((code: string) => {
    if (!symbols[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem("user_currency", code);
      document.cookie = `user_currency=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("currency_changed", { detail: code }));
      }
    } catch {}
  }, []);

  const formatPrice = useCallback((inrPrice: any, qty: number = 1): string => {
    if (!inrPrice && inrPrice !== 0) return "Price on Request";
    const cleaned = inrPrice.toString().replace(/[^0-9.]/g, "");
    const numericInr = parseFloat(cleaned);
    if (isNaN(numericInr) || numericInr <= 0) return "Price on Request";

    const totalInr = numericInr * qty;

    if (currency === "INR") {
      return `₹${Math.round(totalInr).toLocaleString("en-IN")}`;
    }

    const targetMultiplier = relativeRates[currency] || 1.0;
    const priceInUSD = totalInr / (usdRate || 83.5);
    const finalConverted = Math.round(priceInUSD * targetMultiplier);

    return `${symbols[currency] || "$"}${finalConverted.toLocaleString()}`;
  }, [currency, usdRate]);

  const contextValue = useMemo(
    () => ({ currency, usdRate, setCurrency, formatPrice }),
    [currency, usdRate, setCurrency, formatPrice]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);