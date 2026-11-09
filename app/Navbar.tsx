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
    { name: "Customise Rug", href: "/customize" },
    { name: "Our Legacy", href: "/legacy" },
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
      } catch {}
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
    let currentVisible = true;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollDelta = scrollY - lastScrollY;

      // Always show at top of the page
      if (scrollY <= 80) {
        if (!currentVisible) {
          currentVisible = true;
          setIsHeaderVisible(true);
        }
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      // If search, cart, or mobile menu is open, keep navbar visible
      if (isSearchOpen || isCartOpen || isMobileMenuOpen) {
        if (!currentVisible) {
          currentVisible = true;
          setIsHeaderVisible(true);
        }
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      // 🌟 On Product Detail Page:
      // Keep header visible while user is scrolling through the right-side detail description & specifications!
      // Only allow header to slide up once both left & right columns have finished and scroll together into recommendations/footer.
      if (pathname?.startsWith("/product/")) {
        const detailsCol = document.getElementById("product-details-column");
        const stickyGallery = document.getElementById("product-sticky-gallery");
        if (detailsCol && stickyGallery) {
          const detailsRect = detailsCol.getBoundingClientRect();
          const stickyRect = stickyGallery.getBoundingClientRect();
          const isMobile = window.innerWidth < 1024;

          const isRightColumnStillScrolling = isMobile
            ? detailsRect.bottom > window.innerHeight + 80
            : detailsRect.bottom > stickyRect.bottom + 40;

          if (isRightColumnStillScrolling) {
            if (!currentVisible) {
              currentVisible = true;
              setIsHeaderVisible(true);
            }
            lastScrollY = scrollY;
            ticking = false;
            return;
          }
        }
      }

      // Scrolling Down -> Smoothly hide header once scrolled past top area
      if (scrollDelta > 8 && scrollY > 120 && currentVisible) {
        currentVisible = false;
        setIsHeaderVisible(false);
        setIsCurrencyDropdownOpen(false);
      }
      // Scrolling Up (Down to Top) -> Smoothly slide header down into view!
      else if (scrollDelta < -4 && !currentVisible) {
        currentVisible = true;
        setIsHeaderVisible(true);
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
        className={`w-full sticky top-0 z-50 transform-gpu will-change-transform transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full shadow-none"
        }`}
      >
        {/* 🌟 1. TOP ANNOUNCEMENT STRIP (Warm Luxury Espresso & Champagne Gold Tone) */}
        <div className="w-full bg-[#14110E] text-[#F5EADB] text-[11px] sm:text-xs py-2 px-4 tracking-wider uppercase flex items-center justify-center text-center relative border-b border-[#B8860B]/30">
          <div className="w-full md:w-auto font-semibold tracking-wide">
            GET 25% OFF FOR YOUR FIRST ORDER.{" "}
            <Link href="/signup" className="underline font-bold text-[#E5C158] hover:text-[#FFFFFF] transition-colors ml-1">
              SIGN UP NOW
            </Link>
          </div>
        </div>


        <header
          ref={headerRef}
          className="w-full bg-[#FCFAF6]/98 backdrop-blur-md border-b border-[#EBDCC5] shadow-xs"
        >
          {/* 🌟 2. UPPER MAIN NAV (Logo, Search/Contact, Currency, Icons) */}
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-between gap-4">
            
            {/* Left: Direct Support on Desktop, Hamburger on Mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1 text-[#3A332C] hover:text-[#B8860B] transition-colors rounded-sm"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>

              <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#6B5A49]">
                <a href="mailto:nrenterprises@gmail.com" className="flex items-center gap-1.5 hover:text-[#B8860B] transition-colors font-medium">
                  <svg className="w-3.5 h-3.5 text-[#C59B27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>nrenterprises@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Center: Luxury Brand Name & Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer text-center select-none"
              aria-label="NR Enterprises Atelier Home"
            >
              <Image
                src="/logo.png"
                alt="NR Enterprises Logo"
                width={64}
                height={64}
                quality={90}
                priority
                className="object-contain rounded-sm w-7 h-7 sm:w-8 sm:h-8 transition-transform active:scale-95 duration-150"
              />
              <div className="flex flex-col text-left">
                <span className={`text-xl sm:text-2xl lg:text-[25px] tracking-wide text-[#1C1713] group-hover:text-[#8F671E] font-semibold leading-none transition-colors ${playfair.className}`}>
                  NR Enterprises
                </span>
               
              </div>
            </Link>

            {/* Right: Currency Switcher, Search, Wishlist, Cart, Account */}
            <div className="flex items-center space-x-2 sm:space-x-3.5 text-[#2B231D]">
              
              {/* Admin Dev Pill */}
              {mounted && isLocalhost && (
                <div className="hidden sm:flex items-center mr-0.5">
                  <Link
                    href="/admin"
                    className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold text-[#8F671E] border border-[#DFCA9B] bg-[#FAF5EB] hover:border-[#B8860B] hover:text-[#14110E] hover:bg-[#D4AF37] rounded-full transition-all"
                  >
                    Admin
                  </Link>
                </div>
              )}

              {/* Currency Selector */}
              <div ref={currencyDropdownRef} className="relative hidden sm:block">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex items-center space-x-1 text-xs font-bold text-[#2B231D] hover:text-[#B8860B] transition-colors p-1"
                  aria-label="Select Currency"
                >
                  <span suppressHydrationWarning>{selectedCurrency}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isCurrencyDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white/98 backdrop-blur-md border border-[#EBDCC5] shadow-2xl rounded-2xl z-[100] flex flex-col p-1.5 space-y-0.5 divide-y-0 [scrollbar-width:thin] scrollbar-thumb-[#DFCA9B]"
                    >
                      {currencies.map((currency) => {
                        const isSelected = selectedCurrency === currency.code;
                        return (
                          <button
                            key={`${currency.country}-${currency.code}`}
                            type="button"
                            onClick={() => handleCurrencyChange(currency.code, currency.country)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs uppercase tracking-wider text-left transition-all rounded-xl cursor-pointer ${
                              isSelected ? "text-[#B8860B] font-bold bg-[#FAF5EB] shadow-2xs" : "text-[#2B2520] hover:bg-[#FAF6EE]"
                            }`}
                          >
                            <span className="font-semibold">{currency.symbol} - {currency.code}</span>
                            <span className="text-[11px] text-[#8C7A63] font-normal normal-case ml-2 truncate">
                              {currency.label}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Trigger */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery("");
                }}
                className="p-1.5 hover:text-[#B8860B] transition-colors rounded-sm cursor-pointer"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-1.5 hover:text-[#B8860B] transition-colors relative" aria-label="Wishlist">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart Button */}
              <button onClick={() => setIsCartOpen(true)} className="p-1.5 hover:text-[#B8860B] transition-colors relative cursor-pointer" aria-label="Shopping Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#14110E] text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-xs">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Account Profile Icon (Desktop) */}
              <Link href="/account" className="hidden lg:flex items-center p-1.5 hover:text-[#B8860B] transition-colors" aria-label="My Account">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 🌟 3. LOWER NAV TIER (Perfectly Centered Navigation Tabs) */}
          <div className="hidden lg:block border-t border-[#EBDCC5] bg-[#FCFAF6]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-center">
              
              {/* Centered Navigation Links */}
              <nav className="flex items-center justify-center flex-wrap space-x-7 xl:space-x-9 text-[12px] tracking-[0.14em] font-bold font-sans uppercase text-center">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`relative py-1 transition-colors duration-300 ${
                        isActive ? "text-[#B8860B] font-bold" : "text-[#524538] hover:text-[#B8860B]"
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute left-0 bottom-0 h-[2.5px] bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] rounded-full shadow-[0_2px_8px_rgba(212,175,55,0.45)] transition-all duration-300 ${
                          isActive ? "w-full opacity-100" : "w-0 opacity-0 hover:w-full"
                        }`}
                      />
                    </Link>
                  );
                })}

                {dynamicCurrentPage && (
                  <Link
                    href={dynamicCurrentPage.href}
                    className="relative py-1 transition-colors duration-300 text-[#B8860B] font-bold"
                  >
                    {dynamicCurrentPage.name}
                    <span className="absolute left-0 bottom-0 h-[2.5px] bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] rounded-full shadow-[0_2px_8px_rgba(212,175,55,0.45)] w-full opacity-100" />
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* 🌟 4. LIVE SEARCH OVERLAY */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 w-full bg-[#FCFAF6] border-b border-[#EBDCC5] shadow-2xl overflow-hidden z-50"
              >
                <div className="max-w-3xl mx-auto px-6 py-8">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for carpets, colors, styles..."
                      aria-label="Search for carpets, colors, styles"
                      className="w-full bg-transparent border-b-2 border-[#C59B27] text-2xl md:text-3xl font-serif text-[#1C1713] placeholder-[#8C7A63]/50 focus:outline-none pb-3"
                    />
                    {isSearching && (
                      <div className="absolute right-2 bottom-4 w-5 h-5 border-2 border-[#C59B27] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  <div className="mt-6">
                    {searchQuery.length < 1 ? (
                      <div className="flex items-center gap-4 text-xs text-[#8C7A63]">
                        <span className="font-bold uppercase tracking-widest text-[10px] text-[#B8860B]">Popular:</span>
                        <span className="hover:text-[#B8860B] cursor-pointer font-medium" onClick={() => setSearchQuery("Hand Tufted")}>Hand Tufted</span>
                        <span className="hover:text-[#B8860B] cursor-pointer font-medium" onClick={() => setSearchQuery("Shaggy")}>Shaggy</span>
                        <span className="hover:text-[#B8860B] cursor-pointer font-medium" onClick={() => setSearchQuery("Jute")}>Jute</span>
                        <span className="hover:text-[#B8860B] cursor-pointer font-medium" onClick={() => setSearchQuery("Irregular")}>Irregular</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/product/${item.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-4 p-3 bg-white hover:bg-[#FAF5EB] border border-[#EBDCC5] rounded-2xl shadow-2xs transition-colors"
                          >
                            <div className="w-16 h-16 bg-[#DFCA9B]/30 rounded-xl overflow-hidden shrink-0 relative">
                              {item.images?.[0] && (
                                <Image src={item.images[0]} alt={item.name} fill sizes="64px" className="object-cover" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#B8860B] uppercase tracking-widest font-bold">{item.category}</span>
                              <span className="text-base font-serif text-[#1C1713] font-semibold">{item.name}</span>
                            </div>
                            <div className="ml-auto text-[#B8860B] font-bold text-sm">{formatPrice(item.price, 1)}</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !isSearching && <div className="text-[#8C7A63] py-4 text-center">No results found for &ldquo;{searchQuery}&rdquo;.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* 🌟 5. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#F8F9FA] z-[121] shadow-2xl flex flex-col border-r border-[#EAE6DF]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#EAE6DF] flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2.5">
                  <Image src="/logo.png" alt="NR Enterprises Logo" width={64} height={64} quality={90} priority className="object-contain rounded-sm w-8 h-8" />
                  <div>
                    <span className={`text-xl font-serif font-bold text-[#2B2520] leading-none ${playfair.className}`}>NR Enterprises</span>
                    <span className="text-[8.5px] uppercase tracking-[0.25em] text-[#C19A6B] font-bold block mt-0.5 font-heading">Haute Loom</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#2B2520] hover:bg-[#2B2520] hover:text-white transition-all cursor-pointer shadow-2xs"
                  aria-label="Close menu"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Profile Card (Luxury Capsule) */}
              <div className="p-4 bg-white border-b border-[#EAE6DF]">
                {user ? (
                  <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5F2EC] p-3.5 rounded-2xl border border-[#EAE6DF] shadow-2xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 aspect-square shrink-0 rounded-full bg-[#2B2520] text-[#E5C158] flex items-center justify-center font-serif text-lg font-bold uppercase overflow-hidden shadow-xs">
                        {userFullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#C19A6B] font-bold block truncate font-heading">
                          NR Enterprises Patron
                        </span>
                        <h3 className="text-sm font-serif text-[#2B2520] truncate font-bold leading-tight">{userFullName}</h3>
                        <p className="text-[10.5px] text-[#7A7065] truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account?tab=profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold bg-white border border-[#DFD8CC] text-[#2B2520] hover:border-[#C19A6B] hover:text-[#C19A6B] transition-colors rounded-xl shadow-2xs"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold bg-[#2B2520] text-white hover:bg-red-700 transition-colors rounded-xl shadow-2xs cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5F2EC] p-3.5 rounded-2xl border border-[#EAE6DF] shadow-2xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-white border border-[#DFD8CC] text-[#C19A6B] flex items-center justify-center shadow-2xs">
                        <svg className="w-5 h-5 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#C19A6B] font-bold block font-heading">
                          Welcome to NR Enterprises
                        </span>
                        <h3 className="text-sm font-serif text-[#2B2520] font-bold truncate">Sign in to Atelier</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-[10px] uppercase tracking-wider font-bold bg-[#2B2520] text-white rounded-xl hover:bg-[#C19A6B] transition-colors shadow-2xs"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-[10px] uppercase tracking-wider font-bold bg-white border border-[#2B2520] text-[#2B2520] rounded-xl hover:border-[#C19A6B] hover:text-[#C19A6B] transition-colors shadow-2xs"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links & Categories */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 [scrollbar-width:thin] scrollbar-thumb-[#DFD8CC]">
                {/* Explore Links */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#8C7A63] font-bold font-heading">
                      Explore Atelier
                    </span>
                    <a
                      href="https://www.etsy.com/shop/NREnterprises"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1641E] hover:bg-[#D95314] text-white text-[9.5px] font-bold uppercase tracking-wider rounded-full shadow-2xs transition-colors"
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
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-heading text-[14px] font-semibold transition-all ${
                            isActive
                              ? "bg-white text-[#C19A6B] shadow-2xs font-bold"
                              : "text-[#2B2520] hover:bg-white hover:text-[#C19A6B]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]" />}
                            <span>{link.name}</span>
                          </div>
                          <span className={`text-xs transition-transform group-hover:translate-x-0.5 ${isActive ? "text-[#C19A6B]" : "text-[#B5A89A]"}`}>
                            ›
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Categories as Modern Luxury Tag Chips */}
                <div className="pt-4 border-t border-[#EAE6DF]">
                  <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#8C7A63] font-bold font-heading block mb-3 px-1">
                    Shop By Category
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#C19A6B] text-[#2B2520] hover:text-[#C19A6B] text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]/50 shrink-0" />
                        <span className="whitespace-nowrap">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Currency in Mobile Menu */}
                <div className="pt-5 border-t border-[#EAE6DF] pb-4">
                  <label className="text-[9.5px] uppercase tracking-[0.22em] text-[#8C7A63] font-bold font-heading block mb-2 px-1">
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
                      className="w-full bg-white border border-[#EAE6DF] text-[#2B2520] text-xs font-bold py-3 pl-4 pr-10 rounded-xl shadow-2xs outline-none focus:border-[#C19A6B] appearance-none cursor-pointer transition-colors"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} — {c.symbol} ({c.code})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C7A63] text-xs">
                      ▾
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🌟 6. CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F8F9FA] shadow-2xl z-[101] flex flex-col border-l border-[#DFD8CC] sm:rounded-l-3xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#DFD8CC] flex justify-between items-center bg-white">
                <h2 className="text-xl font-serif text-[#3A332C] font-semibold">
                  Your Bag <span className="text-[#8C7A63] text-sm font-sans font-normal">({cartItems.length})</span>
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EAEAEB] text-[#3A332C] hover:bg-[#C19A6B] hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Cart"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto [scrollbar-width:thin] scrollbar-thumb-[#DFD8CC]">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="w-20 h-20 bg-[#EAEAEB] rounded-full flex items-center justify-center text-[#C19A6B] mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold font-sans text-[#3A332C] mb-2">Your shopping bag is empty</h3>
                    <p className="text-sm text-[#7A7065] mb-8">Discover our handcrafted masterpieces made with heirloom artistry.</p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/collections");
                      }}
                      className="bg-[#C19A6B] text-white px-8 py-3.5 text-xs tracking-widest uppercase font-bold hover:bg-[#3A332C] transition-colors rounded-full shadow-md cursor-pointer"
                    >
                      Explore Collections
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 bg-white p-4 rounded-2xl border border-[#EAEAEB] shadow-2xs relative">
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="absolute top-2 right-2 text-[#8C7A63] hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="w-20 h-20 bg-[#F8F9FA] rounded-xl overflow-hidden shrink-0 relative border border-[#EAEAEB] p-1 flex items-center justify-center">
                          {item.image &&
                            (item.image.startsWith("data:") ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                            ))}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          {item.isCustom ? (
                            <span className="bg-[#C19A6B] text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full self-start mb-1">
                              CUSTOM ORDER
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#C19A6B] uppercase tracking-[0.1em] font-bold">{item.category}</span>
                          )}
                          <span className="text-sm text-[#3A332C] font-bold font-sans leading-tight mb-1 truncate">{item.name}</span>
                          <span className="text-xs text-[#7A7065]">Size: {item.size}{item.color ? ` • Color: ${item.color}` : ""}</span>
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="text-xs text-[#8C7A63]">Qty: {item.quantity}</span>
                            <span className="text-sm font-bold text-[#3A332C]">{formatPrice(item.price, item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-[#DFD8CC]">
                <div className="flex justify-between mb-2 text-[#3A332C] font-bold text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotalINR)}</span>
                </div>
                <p className="text-xs text-[#8C7A63] mb-4 text-center">Shipping & taxes calculated at checkout</p>
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full bg-[#3A332C] text-white py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#C19A6B] transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
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