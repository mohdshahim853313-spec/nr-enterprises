"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // 🌟 User Auth State
  const [user, setUser] = useState<any>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("192.168.") ||
        host.endsWith(".local")
      ) {
        setIsLocalhost(true);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🌟 Global Currency Context
  const { currency: selectedCurrency, setCurrency, formatPrice } = useCurrency();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const isHeaderVisibleRef = useRef(true);

  const setHeaderVisible = (visible: boolean) => {
    isHeaderVisibleRef.current = visible;
    setIsHeaderVisible(visible);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const userFullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "NR Enterprises Patron";

  const userMemberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    : "2026";

  const headerRef = useRef<HTMLElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // 🌟 Click Outside Listener to Close Dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCurrencyDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 🌟 Cart State
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user_country") || "United States";
    }
    return "United States";
  });

  const currencies = [
    { country: "United States", code: "USD", symbol: "$", label: "United States" },
    { country: "Europe", code: "EUR", symbol: "€", label: "Europe" },
    { country: "United Kingdom", code: "GBP", symbol: "£", label: "United Kingdom" },
    { country: "Canada", code: "CAD", symbol: "CA$", label: "Canada" },
    { country: "Australia", code: "AUD", symbol: "AU$", label: "Australia" },
    { country: "New Zealand", code: "NZD", symbol: "NZ$", label: "New Zealand" },
    { country: "Poland", code: "PLN", symbol: "zł", label: "Poland" },
    { country: "Sweden", code: "SEK", symbol: "kr", label: "Sweden" },
    { country: "Switzerland", code: "CHF", symbol: "CHF", label: "Switzerland" },
    { country: "Japan", code: "JPY", symbol: "¥", label: "Japan" },
    { country: "India", code: "INR", symbol: "₹", label: "India" },
    { country: "United Arab Emirates", code: "AED", symbol: "AED", label: "UAE" },
    { country: "Saudi Arabia", code: "SAR", symbol: "SAR", label: "Saudi Arabia" },
    { country: "Singapore", code: "SGD", symbol: "SG$", label: "Singapore" },
  ];

  const categories = [
    { name: "Hand Tufted", href: "/collections?category=Tufted", desc: "Plush density & bespoke artistry" },
    { name: "Shaggy Carpet", href: "/collections?category=Shag", desc: "Ultra-deep cozy pile softness" },
    { name: "Jute Carpets", href: "/collections?category=Jute", desc: "100% natural organic textures" },
    { name: "Irregular Shaped", href: "/collections?category=Irregular", desc: "Avant-garde organic silhouettes" },
    { name: "Hand-Knotted Luxury", href: "/collections?category=Hand-Knotted", desc: "Heirloom grade master knots" },
    { name: "Flatweave Dhurries", href: "/collections?category=Flatweave", desc: "Reversible lightweight heritage" },
    { name: "Braided Carpets", href: "/collections?category=Braided", desc: "Durable artisan spiral coils" },
    { name: "Modern Runners", href: "/collections?category=Runner", desc: "Luxury corridor & hallway accents" },
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Collections", href: "/collections" },
    // { name: "Customise Rug", href: "/customize" },
    { name: "Our Story", href: "/legacy" },
    { name: "Blogs", href: "/blog" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // 🌟 Dynamic Current Page
  const dynamicCurrentPage = useMemo(() => {
    if (!pathname || pathname === "/") return null;
    if (pathname === "/collections") return null;
    if (pathname === "/customize") return null;
    if (pathname === "/legacy") return null;
    if (pathname === "/blog" || pathname.startsWith("/blog/")) return null;
    if (pathname === "/about") return null;
    if (pathname === "/contact") return null;
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

    if (pathname.startsWith("/product/")) return { name: "Products", href: pathname };
    if (pathname.startsWith("/wishlist")) return { name: "Wishlist", href: pathname };
    if (
      pathname.startsWith("/account") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password")
    ) {
      return { name: "Account", href: pathname };
    }
    if (pathname.startsWith("/checkout")) return { name: "Checkout", href: pathname };
    if (pathname.startsWith("/process")) return { name: "Process", href: pathname };
    if (pathname.startsWith("/terms")) return { name: "Terms", href: pathname };
    if (pathname.startsWith("/privacy")) return { name: "Privacy", href: pathname };
    if (pathname.startsWith("/refunds") || pathname.startsWith("/refund-policy")) return { name: "Refunds", href: pathname };
    if (pathname.startsWith("/disclaimer")) return { name: "Disclaimer", href: pathname };

    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (firstSegment) {
      const formatted = firstSegment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { name: formatted, href: pathname };
    }

    return null;
  }, [pathname]);

  // 🌟 Load Cart on Mount and Setup Listeners
  useEffect(() => {
    const loadCart = () => setCartItems(JSON.parse(localStorage.getItem("nrenterprises_cart") || "[]"));
    loadCart();

    window.addEventListener("cart_updated", loadCart);
    window.addEventListener("open_cart", () => setIsCartOpen(true));

    return () => {
      window.removeEventListener("cart_updated", loadCart);
      window.removeEventListener("open_cart", () => setIsCartOpen(true));
    };
  }, []);

  const handleCurrencyChange = (code: string, countryName?: string) => {
    setCurrency(code);
    if (countryName) {
      setSelectedCountry(countryName);
      try {
        localStorage.setItem("user_country", countryName);
      } catch { }
    }
    setIsCurrencyDropdownOpen(false);
  };

  const removeFromCart = (indexToRemove: number) => {
    const updatedCart = cartItems.filter((_, idx) => idx !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem("nrenterprises_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const cartSubtotalINR = cartItems.reduce((total, item) => {
    const numericInr = parseFloat((item.price || "0").toString().replace(/[^0-9.]/g, ""));
    return total + (isNaN(numericInr) ? 0 : numericInr * (item.quantity || 1));
  }, 0);

  // Search Logic
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, images")
        .ilike("name", `%${searchQuery}%`)
        .limit(6);

      if (!error && data) setSearchResults(data);
      setIsSearching(false);
    };
    const timeoutId = setTimeout(fetchSearchResults, 250);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
    setHeaderVisible(true);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery("");
        }
        if (isCartOpen) setIsCartOpen(false);
        if (isCurrencyDropdownOpen) setIsCurrencyDropdownOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, isCartOpen, isCurrencyDropdownOpen, isMobileMenuOpen]);

  // 🌟 Universal Smooth Header Scroll Behavior (Zero-Lag Hardware Accelerated)
  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;

    // Guaranteed visible on mount and whenever pathname changes
    setHeaderVisible(true);

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollDelta = scrollY - lastScrollY;

      // 🌟 At or near the top of the page (scrollY <= 60px):
      // The header MUST ALWAYS be 100% visible, perfectly filling the top area without leaving empty whitespace.
      if (scrollY <= 60) {
        if (!isHeaderVisibleRef.current) {
          setHeaderVisible(true);
        }
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      // If search, cart, or mobile menu is open, keep navbar visible
      if (isSearchOpen || isCartOpen || isMobileMenuOpen) {
        if (!isHeaderVisibleRef.current) {
          setHeaderVisible(true);
        }
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      // 🌟 Scrolling Down: smoothly slide header up out of view once past top area
      if (scrollDelta > 6 && scrollY > 80) {
        if (isHeaderVisibleRef.current) {
          setHeaderVisible(false);
          setIsCurrencyDropdownOpen(false);
        }
      }
      // 🌟 Scrolling Up: smoothly slide header down into view
      else if (scrollDelta < -4) {
        if (!isHeaderVisibleRef.current) {
          setHeaderVisible(true);
        }
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isSearchOpen, isCartOpen, isMobileMenuOpen, pathname]);

  return (
    <>
      <div
        className={`w-full sticky top-0 z-50 transform-gpu will-change-transform transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHeaderVisible ? "translate-y-0" : "-translate-y-full shadow-none"
          }`}
      >
        {/* 🌟 1. TOP ANNOUNCEMENT STRIP (Royal Heritage Maroon Ribbon) */}
        <div className="w-full bg-[#4A1017] text-[#FAF5EB] text-[11px] sm:text-xs py-1.5 px-4 tracking-wider uppercase flex items-center justify-center text-center relative border-b border-[#380C11] font-medium shadow-xs">
          <div className="w-full md:w-auto font-heading tracking-widest flex items-center justify-center gap-2">
            <span>GET 25% OFF FOR YOUR FIRST ORDER.</span>
            <Link href="/signup" className="underline font-bold text-white hover:text-[#FAF5EB] transition-colors">
              SIGN UP NOW
            </Link>
          </div>
        </div>

        {/* 🌟 2. ROYAL PERSIAN MAROON HEADER */}
        <header
          ref={headerRef}
          className="w-full bg-[#2B070B] border-b border-[#4A1017] shadow-md transition-all duration-300 text-white"
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-5 xl:px-8 h-[68px] sm:h-[76px] flex items-center justify-between gap-2.5 lg:gap-3 xl:gap-6 relative">

            {/* Left: Mobile Burger + Mobile Search & Desktop Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#FAF5EB] hover:text-white transition-colors rounded-lg border border-[#4A1017] hover:border-[#FAF5EB] bg-[#3D0C12] cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>

              {/* 🌟 Mobile Search Trigger: Placed on Left of Logo for Perfect 2-and-2 Symmetry */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery("");
                }}
                className="lg:hidden p-2 text-[#FAF5EB] hover:text-white hover:bg-[#3D0C12] transition-colors rounded-lg border border-transparent hover:border-[#4A1017] cursor-pointer"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Desktop Logo (hidden on mobile, visible on desktop) */}
              <Link
                href="/"
                className="hidden lg:flex items-center group cursor-pointer text-left select-none shrink-0"
                aria-label="NR Enterprises Atelier Home"
              >
                <div className="relative h-11 sm:h-12 lg:h-12 xl:h-14 w-28 sm:w-32 lg:w-32 xl:w-36 shrink-0 drop-shadow-[0_2px_14px_rgba(232,200,106,0.4)] transition-transform group-hover:scale-105 duration-200">
                  <Image
                    src="/nr-logo.png"
                    alt="NR Enterprises"
                    fill
                    sizes="(max-width: 1280px) 130px, 160px"
                    priority
                    unoptimized
                    className="object-contain object-left"
                  />
                </div>
              </Link>
            </div>

            {/* 🌟 Center Logo for Mobile Only (Centered between screen edges) */}
            <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
              <Link
                href="/"
                className="flex items-center justify-center group cursor-pointer select-none"
                aria-label="NR Enterprises Atelier Home"
              >
                <div className="relative h-12 w-28 sm:h-14 sm:w-32 shrink-0 drop-shadow-[0_2px_14px_rgba(232,200,106,0.4)] transition-transform active:scale-95 duration-150">
                  <Image
                    src="/nr-logo.png"
                    alt="NR Enterprises"
                    fill
                    sizes="130px"
                    priority
                    unoptimized
                    className="object-contain object-center"
                  />
                </div>
              </Link>
            </div>

            {/* Center: Sleek Single-Line Navigation Links (Desktop & Laptop) */}
            <nav className="hidden lg:flex flex-nowrap items-center justify-center gap-2.5 lg:gap-3 xl:gap-5 2xl:gap-7 text-[11px] lg:text-[11.5px] xl:text-[12.5px] tracking-[0.06em] lg:tracking-[0.08em] xl:tracking-[0.14em] font-bold font-sans uppercase shrink-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors duration-200 group ${isActive ? "text-white font-extrabold" : "text-[#E6D7D4] hover:text-[#FAF5EB]"
                      }`}
                  >
                    <span className="whitespace-nowrap">{link.name}</span>
                    <span
                      className={`absolute left-0 bottom-0 h-[2.5px] bg-[#FAF5EB] rounded-full transition-all duration-300 ${isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                        }`}
                    />
                  </Link>
                );
              })}

              {dynamicCurrentPage && (
                <Link
                  href={dynamicCurrentPage.href}
                  className="relative py-1.5 whitespace-nowrap shrink-0 transition-colors duration-200 text-white font-extrabold"
                >
                  <span className="whitespace-nowrap">{dynamicCurrentPage.name}</span>
                  <span className="absolute left-0 bottom-0 h-[2.5px] bg-[#FAF5EB] rounded-full w-full opacity-100" />
                </Link>
              )}
            </nav>

            {/* Right: Currency Switcher, Search, Wishlist, Cart, Account */}
            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 text-white shrink-0">

              {/* Admin Dev Pill */}
              {mounted && isLocalhost && (
                <div className="hidden sm:flex items-center mr-0.5 shrink-0">
                  <Link
                    href="/admin"
                    className="px-2.5 py-0.5 text-[9.5px] xl:text-[10px] uppercase tracking-wider font-bold text-[#FAF5EB] border border-[#FAF5EB]/30 bg-[#3D0C12] hover:bg-[#FAF5EB] hover:text-[#240609] rounded-full transition-all shadow-xs whitespace-nowrap"
                  >
                    Admin
                  </Link>
                </div>
              )}

              {/* Currency Selector */}
              <div ref={currencyDropdownRef} className="relative hidden sm:block shrink-0">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex items-center space-x-1 text-[11px] xl:text-xs font-bold text-[#FAF5EB] hover:text-white transition-colors px-2 py-1.5 rounded-lg border border-[#4A1017] hover:border-[#FAF5EB]/50 bg-[#3D0C12] shadow-xs cursor-pointer whitespace-nowrap"
                  aria-label="Select Currency"
                >
                  <span suppressHydrationWarning className="text-[#FAF5EB]">{selectedCurrency}</span>
                  <svg className={`w-3.5 h-3.5 text-[#FAF5EB] transition-transform duration-200 ${isCurrencyDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isCurrencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      data-lenis-prevent="true"
                      className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-[#2B070B] border border-[#4A1017] shadow-[0_20px_45px_rgba(0,0,0,0.5)] rounded-2xl z-[100] flex flex-col p-1.5 space-y-0.5 text-white"
                    >
                      {currencies.map((currency) => {
                        const isSelected = selectedCurrency === currency.code;
                        return (
                          <button
                            key={`${currency.country}-${currency.code}`}
                            type="button"
                            onClick={() => handleCurrencyChange(currency.code, currency.country)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs uppercase tracking-wider text-left transition-all rounded-xl cursor-pointer ${isSelected ? "text-white font-bold bg-[#4A1017]" : "text-[#D8C9C5] hover:bg-[#3D0C12] hover:text-white"
                              }`}
                          >
                            <span className="font-semibold">{currency.symbol} - {currency.code}</span>
                            <span className="text-[11px] text-[#A89895] font-normal normal-case ml-2 truncate">
                              {currency.label}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Trigger (Desktop: right side; Mobile: on left of logo) */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery("");
                }}
                className="hidden lg:flex p-2 text-[#FAF5EB] hover:text-white hover:bg-[#3D0C12] transition-colors rounded-lg border border-transparent hover:border-[#4A1017] cursor-pointer"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist (Mobile & Desktop) */}
              <Link
                href="/wishlist"
                className="flex p-2 text-[#FAF5EB] hover:text-white hover:bg-[#3D0C12] transition-colors rounded-lg border border-transparent hover:border-[#4A1017] relative cursor-pointer"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-[#FAF5EB] hover:text-white transition-colors rounded-lg border border-[#4A1017] hover:border-[#FAF5EB] bg-[#3D0C12] relative cursor-pointer shadow-xs"
                aria-label="Shopping Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FAF5EB] text-[#240609] text-[9.5px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Account Profile Icon (Desktop) */}
              <Link
                href="/account"
                className="hidden lg:flex items-center p-2 text-[#FAF5EB] hover:text-white hover:bg-[#3D0C12] transition-colors rounded-lg border border-transparent hover:border-[#4A1017]"
                aria-label="My Account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 🌟 4. LIVE SEARCH OVERLAY (Royal Maroon & Gold) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 w-full bg-[#2A080C]/98 backdrop-blur-2xl border-b border-[#4A1017] shadow-2xl overflow-hidden z-50 text-white"
              >
                <div className="max-w-3xl mx-auto px-6 py-8">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for bespoke carpets, silk weaves, styles..."
                      aria-label="Search for carpets, colors, styles"
                      className="w-full bg-transparent border-b-2 border-[#FAF5EB]/50 text-2xl md:text-3xl font-serif text-white placeholder-[#D8C9C5]/50 focus:outline-none pb-3 focus:border-[#FAF5EB]"
                    />
                    {isSearching && (
                      <div className="absolute right-2 bottom-4 w-5 h-5 border-2 border-[#FAF5EB] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  <div className="mt-6">
                    {searchQuery.length < 1 ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#D8C9C5]">
                        <span className="font-bold uppercase tracking-widest text-[10px] text-[#FAF5EB]">Curated:</span>
                        <span className="hover:text-white cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Hand Tufted")}>Hand Tufted</span>
                        <span className="text-[#FAF5EB]/40">•</span>
                        <span className="hover:text-white cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Shaggy")}>Shaggy</span>
                        <span className="text-[#FAF5EB]/40">•</span>
                        <span className="hover:text-white cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Jute")}>Jute</span>
                        <span className="text-[#FAF5EB]/40">•</span>
                        <span className="hover:text-white cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Irregular")}>Irregular</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 [scrollbar-width:thin] scrollbar-thumb-[#4A1017]">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/product/${item.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-4 p-3 bg-[#3D0C12] hover:bg-[#4A1017] border border-[#4A1017] hover:border-[#FAF5EB]/40 rounded-2xl shadow-xs transition-all"
                          >
                            <div className="w-16 h-16 bg-[#240609] rounded-xl overflow-hidden shrink-0 relative border border-[#4A1017]">
                              {item.images?.[0] && (
                                <Image src={item.images[0]} alt={item.name} fill sizes="64px" className="object-cover" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#FAF5EB]/70 uppercase tracking-widest font-bold">{item.category}</span>
                              <span className="text-base font-serif text-[#FAF5EB] font-semibold">{item.name}</span>
                            </div>
                            <div className="ml-auto text-[#FAF5EB] font-bold text-sm">{formatPrice(item.price, 1)}</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-[#D8C9C5]">
                        No handcrafted rugs found for &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* 🌟 5. MOBILE NAVIGATION DRAWER (Deep Emerald & Gold) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#240609] text-[#FAF5EB] z-[121] shadow-2xl flex flex-col border-r border-[#4A1017] rounded-r-3xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#4A1017] flex items-center justify-between bg-[#2A080C]">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block">
                  <div className="relative h-12 w-32 shrink-0 drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                    <Image src="/nr-logo.png" alt="NR Enterprises" fill sizes="130px" priority className="object-contain object-left" />
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#3D0C12] border border-[#4A1017] flex items-center justify-center text-[#FAF5EB] hover:bg-[#FAF5EB] hover:text-[#240609] transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 bg-[#2A080C] border-b border-[#4A1017]">
                {user ? (
                  <div className="bg-[#350A10] p-3.5 rounded-2xl border border-[#4A1017] shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 aspect-square shrink-0 rounded-full bg-[#FAF5EB] text-[#240609] flex items-center justify-center font-serif text-lg font-bold uppercase overflow-hidden shadow-xs">
                        {userFullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#FAF5EB]/80 font-bold block truncate font-heading">
                          NR Enterprises Patron
                        </span>
                        <h3 className="text-sm font-serif text-white truncate font-bold leading-tight">{userFullName}</h3>
                        <p className="text-[10.5px] text-[#D8C9C5] truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account?tab=profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold bg-[#3D0C12] border border-[#4A1017] text-[#FAF5EB] hover:bg-[#FAF5EB] hover:text-[#240609] transition-all rounded-xl"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-700 hover:text-white transition-colors rounded-xl cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#350A10] p-3.5 rounded-2xl border border-[#4A1017] shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#3D0C12] border border-[#4A1017] text-[#FAF5EB] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#FAF5EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#FAF5EB]/80 font-bold block font-heading">
                          Welcome to NR Enterprises
                        </span>
                        <h3 className="text-sm font-serif text-white font-bold truncate">Sign in to Atelier</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-[10px] uppercase tracking-wider font-bold bg-[#FAF5EB] text-[#240609] rounded-xl hover:bg-white transition-colors shadow-xs"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-[10px] uppercase tracking-wider font-bold bg-[#3D0C12] border border-[#4A1017] text-[#FAF5EB] rounded-xl hover:bg-[#FAF5EB] hover:text-[#240609] transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links & Categories */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 [scrollbar-width:thin] scrollbar-thumb-[#4A1017]">
                {/* Explore Links */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#FAF5EB] font-bold font-heading">
                      Explore Atelier
                    </span>
                    <a
                      href="https://www.etsy.com/shop/AHADGLOBALRUGS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1641E] hover:bg-[#D95314] text-white text-[9.5px] font-bold uppercase tracking-wider rounded-full shadow-sm transition-colors"
                    >
                      <span>Shop on Etsy</span>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  <div className="space-y-1">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-heading text-[14px] font-semibold transition-all ${isActive
                            ? "bg-[#3D0C12] text-white border-l-2 border-[#FAF5EB] shadow-xs font-bold"
                            : "text-[#D8C9C5] hover:bg-[#350A10] hover:text-[#FAF5EB]"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FAF5EB]" />}
                            <span>{link.name}</span>
                          </div>
                          <span className={`text-xs transition-transform group-hover:translate-x-0.5 ${isActive ? "text-[#FAF5EB]" : "text-[#D8C9C5]"}`}>
                            ›
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Categories as Modern Luxury Tag Chips */}
                <div className="pt-4 border-t border-[#4A1017]">
                  <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#FAF5EB] font-bold font-heading block mb-3 px-1">
                    Shop By Category
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#350A10] border border-[#4A1017] hover:border-[#FAF5EB]/50 text-[#FAF5EB] hover:text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FAF5EB] shrink-0" />
                        <span className="whitespace-nowrap">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Currency in Mobile Menu */}
                <div className="pt-5 border-t border-[#4A1017] pb-4">
                  <label className="text-[9.5px] uppercase tracking-[0.22em] text-[#FAF5EB] font-bold font-heading block mb-2 px-1">
                    Regional Currency
                  </label>
                  <div className="relative">
                    <select
                      suppressHydrationWarning
                      value={selectedCurrency}
                      onChange={(e) => {
                        const found = currencies.find(c => c.code === e.target.value);
                        handleCurrencyChange(e.target.value, found?.country);
                      }}
                      className="w-full bg-[#350A10] border border-[#4A1017] text-[#FAF5EB] text-xs font-bold py-3 pl-4 pr-10 rounded-xl shadow-xs outline-none focus:border-[#FAF5EB] appearance-none cursor-pointer transition-colors"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#240609] text-[#FAF5EB]">
                          {c.label} — {c.symbol} ({c.code})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FAF5EB] text-xs">
                      ▾
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🌟 6. CART DRAWER (Deep Royal Maroon Glass & Ivory Accent) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF8F5] text-[#2B070B] shadow-2xl z-[101] flex flex-col border-l border-[#4A1017]/20 sm:rounded-l-3xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#4A1017]/15 flex justify-between items-center bg-white">
                <h2 className="text-xl font-serif text-[#2B070B] font-semibold">
                  Your Atelier Bag <span className="text-[#8C6B38] text-sm font-sans font-normal">({cartItems.length})</span>
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF5EB] border border-[#4A1017]/20 text-[#2B070B] hover:bg-[#2B070B] hover:text-[#FAF5EB] transition-all cursor-pointer"
                  aria-label="Close Cart"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto [scrollbar-width:thin] scrollbar-thumb-[#4A1017]/30">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="w-20 h-20 bg-[#FAF5EB] border border-[#4A1017]/20 rounded-full flex items-center justify-center text-[#2B070B] mb-6 shadow-xs">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold font-sans text-[#2B070B] mb-2">Your shopping bag is empty</h3>
                    <p className="text-sm text-[#5A4E42] mb-8">Discover our handcrafted masterpieces made with heirloom artistry.</p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/collections");
                      }}
                      className="bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white px-8 py-3.5 text-xs tracking-widest uppercase font-bold transition-all rounded-full shadow-md cursor-pointer"
                    >
                      Explore Collections
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 bg-white p-4 rounded-2xl border border-[#4A1017]/15 shadow-xs relative">
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="absolute top-2.5 right-2.5 text-[#5A4E42] hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="w-20 h-20 bg-[#FAF8F5] rounded-xl overflow-hidden shrink-0 relative border border-[#4A1017]/15 p-1 flex items-center justify-center">
                          {item.image &&
                            (item.image.startsWith("data:") ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                            ))}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          {item.isCustom ? (
                            <span className="bg-[#4A1017] text-[#FAF5EB] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full self-start mb-1">
                              CUSTOM ORDER
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8C6B38] uppercase tracking-[0.1em] font-bold">{item.category}</span>
                          )}
                          <span className="text-sm text-[#2B070B] font-bold font-sans leading-tight mb-1 truncate">{item.name}</span>
                          <span className="text-xs text-[#5A4E42]">Size: {item.size}{item.color ? ` • Color: ${item.color}` : ""}</span>
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="text-xs text-[#8C6B38]">Qty: {item.quantity}</span>
                            <span className="text-sm font-bold text-[#2B070B]">{formatPrice(item.price, item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-[#4A1017]/15">
                <div className="flex justify-between mb-2 text-[#2B070B] font-bold text-lg font-serif">
                  <span>Subtotal</span>
                  <span className="text-[#2B070B]">{formatPrice(cartSubtotalINR)}</span>
                </div>
                <p className="text-xs text-[#5A4E42] mb-4 text-center">Shipping & taxes calculated at checkout</p>
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white py-4 text-xs tracking-[0.2em] uppercase font-bold transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg"
                >
                  Proceed To Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}