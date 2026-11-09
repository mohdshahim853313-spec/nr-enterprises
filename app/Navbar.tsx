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
        {/* 🌟 1. TOP ANNOUNCEMENT STRIP (Royal Emerald & Imperial Gold Accent) */}
        <div className="w-full bg-[#06140E] text-[#E5C378] text-[11px] sm:text-xs py-1.5 px-4 tracking-wider uppercase flex items-center justify-center text-center relative border-b border-[#D4AF37]/20 font-medium">
          <div className="w-full md:w-auto font-heading tracking-widest flex items-center justify-center gap-2">
            <span>GET 25% OFF FOR YOUR FIRST ORDER.</span>
            <Link href="/signup" className="underline font-bold text-[#F3E5AB] hover:text-white transition-colors">
              SIGN UP NOW
            </Link>
          </div>
        </div>

        {/* 🌟 2. ULTRA-CLEAN GLASSMORPHISM FLOATING HEADER (Single-Tier Modern Atelier) */}
        <header
          ref={headerRef}
          className="w-full bg-[#0A1F17]/95 backdrop-blur-xl border-b border-[#D4AF37]/25 shadow-[0_12px_36px_rgba(2,15,10,0.5)] transition-all duration-300"
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] sm:h-[76px] flex items-center justify-between gap-3 lg:gap-6">
            
            {/* Left: Mobile Burger + Luxury Brand Monogram & Name */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#E5C378] hover:text-white transition-colors rounded-lg border border-[#D4AF37]/25 hover:border-[#D4AF37] bg-[#0F2A1E]/60 cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>

              <Link
                href="/"
                className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-left select-none shrink-0"
                aria-label="NR Enterprises Atelier Home"
              >
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0 drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105 duration-200">
                  <Image
                    src="/logo.png"
                    alt="NR Enterprises Logo"
                    fill
                    sizes="48px"
                    priority
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className={`text-lg sm:text-xl lg:text-[22px] tracking-wide font-serif font-bold leading-none bg-gradient-to-r from-[#FFF5D6] via-[#E8C86A] to-[#D4AF37] bg-clip-text text-transparent group-hover:brightness-110 transition-all ${playfair.className}`}>
                    NR Enterprises
                  </span>
                  <span className="hidden sm:block text-[8.5px] uppercase tracking-[0.26em] text-[#D4AF37]/80 font-sans font-semibold mt-1">
                    Bespoke Carpet Atelier
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Sleek Single-Line Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center justify-center space-x-5 xl:space-x-7 text-[11.5px] xl:text-[12.5px] tracking-[0.14em] font-bold font-sans uppercase">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1.5 transition-colors duration-200 group ${
                      isActive ? "text-[#F3E5AB]" : "text-[#D3E3DA] hover:text-[#F3E5AB]"
                    }`}
                  >
                    <span>{link.name}</span>
                    <span
                      className={`absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#B8860B] via-[#F3E5AB] to-[#B8860B] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)] transition-all duration-300 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}

              {dynamicCurrentPage && (
                <Link
                  href={dynamicCurrentPage.href}
                  className="relative py-1.5 transition-colors duration-200 text-[#F3E5AB] font-bold"
                >
                  <span>{dynamicCurrentPage.name}</span>
                  <span className="absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#B8860B] via-[#F3E5AB] to-[#B8860B] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)] w-full opacity-100" />
                </Link>
              )}
            </nav>

            {/* Right: Currency Switcher, Search, Wishlist, Cart, Account */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-[#E4EDE8] shrink-0">
              
              {/* Admin Dev Pill */}
              {mounted && isLocalhost && (
                <div className="hidden sm:flex items-center mr-0.5">
                  <Link
                    href="/admin"
                    className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold text-[#F3E5AB] border border-[#D4AF37]/50 bg-[#0F2A1E]/80 hover:bg-[#D4AF37] hover:text-[#0A1F17] rounded-full transition-all"
                  >
                    Admin
                  </Link>
                </div>
              )}

              {/* Currency Selector */}
              <div ref={currencyDropdownRef} className="relative hidden sm:block">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex items-center space-x-1 text-xs font-bold text-[#E4EDE8] hover:text-[#F3E5AB] transition-colors p-1.5 rounded-lg border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 bg-[#0F2A1E]/40"
                  aria-label="Select Currency"
                >
                  <span suppressHydrationWarning className="text-[#F3E5AB]">{selectedCurrency}</span>
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
                      className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-[#0A1F17]/98 backdrop-blur-xl border border-[#D4AF37]/35 shadow-[0_20px_45px_rgba(0,0,0,0.6)] rounded-2xl z-[100] flex flex-col p-1.5 space-y-0.5 [scrollbar-width:thin] scrollbar-thumb-[#D4AF37]/40"
                    >
                      {currencies.map((currency) => {
                        const isSelected = selectedCurrency === currency.code;
                        return (
                          <button
                            key={`${currency.country}-${currency.code}`}
                            type="button"
                            onClick={() => handleCurrencyChange(currency.code, currency.country)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs uppercase tracking-wider text-left transition-all rounded-xl cursor-pointer ${
                              isSelected ? "text-[#F3E5AB] font-bold bg-[#0F2A1E] border border-[#D4AF37]/35 shadow-sm" : "text-[#D3E3DA] hover:bg-[#0F2A1E]/60 hover:text-white"
                            }`}
                          >
                            <span className="font-semibold">{currency.symbol} - {currency.code}</span>
                            <span className="text-[11px] text-[#A6C0B3] font-normal normal-case ml-2 truncate">
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
                className="p-2 text-[#E4EDE8] hover:text-[#F3E5AB] transition-colors rounded-lg border border-transparent hover:border-[#D4AF37]/30 hover:bg-[#0F2A1E]/50 cursor-pointer"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-[#E4EDE8] hover:text-[#F3E5AB] transition-colors rounded-lg border border-transparent hover:border-[#D4AF37]/30 hover:bg-[#0F2A1E]/50 relative"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-[#E4EDE8] hover:text-[#F3E5AB] transition-colors rounded-lg border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 bg-[#0F2A1E]/40 relative cursor-pointer"
                aria-label="Shopping Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] text-[#0A1F17] text-[9.5px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)]">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Account Profile Icon (Desktop) */}
              <Link
                href="/account"
                className="hidden lg:flex items-center p-2 text-[#E4EDE8] hover:text-[#F3E5AB] transition-colors rounded-lg border border-transparent hover:border-[#D4AF37]/30 hover:bg-[#0F2A1E]/50"
                aria-label="My Account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 🌟 4. LIVE SEARCH OVERLAY (Deep Emerald & Radiant Gold Glass) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 w-full bg-[#0A1F17]/98 backdrop-blur-2xl border-b border-[#D4AF37]/35 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 text-white"
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
                      className="w-full bg-transparent border-b-2 border-[#D4AF37] text-2xl md:text-3xl font-serif text-white placeholder-[#8FAD9F]/60 focus:outline-none pb-3"
                    />
                    {isSearching && (
                      <div className="absolute right-2 bottom-4 w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  <div className="mt-6">
                    {searchQuery.length < 1 ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#A6C0B3]">
                        <span className="font-bold uppercase tracking-widest text-[10px] text-[#F3E5AB]">Curated:</span>
                        <span className="hover:text-[#F3E5AB] cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Hand Tufted")}>Hand Tufted</span>
                        <span className="text-[#D4AF37]/40">•</span>
                        <span className="hover:text-[#F3E5AB] cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Shaggy")}>Shaggy</span>
                        <span className="text-[#D4AF37]/40">•</span>
                        <span className="hover:text-[#F3E5AB] cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Jute")}>Jute</span>
                        <span className="text-[#D4AF37]/40">•</span>
                        <span className="hover:text-[#F3E5AB] cursor-pointer font-medium transition-colors" onClick={() => setSearchQuery("Irregular")}>Irregular</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 [scrollbar-width:thin] scrollbar-thumb-[#D4AF37]/40">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/product/${item.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-4 p-3 bg-[#0F2A1E]/80 hover:bg-[#143B2A] border border-[#D4AF37]/25 hover:border-[#D4AF37] rounded-2xl shadow-md transition-all"
                          >
                            <div className="w-16 h-16 bg-[#06140E] rounded-xl overflow-hidden shrink-0 relative border border-[#D4AF37]/20">
                              {item.images?.[0] && (
                                <Image src={item.images[0]} alt={item.name} fill sizes="64px" className="object-cover" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#F3E5AB] uppercase tracking-widest font-bold">{item.category}</span>
                              <span className="text-base font-serif text-white font-semibold">{item.name}</span>
                            </div>
                            <div className="ml-auto text-[#F3E5AB] font-bold text-sm">{formatPrice(item.price, 1)}</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !isSearching && <div className="text-[#8FAD9F] py-4 text-center">No results found for &ldquo;{searchQuery}&rdquo;.</div>
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
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#081912] text-[#E4EDE8] z-[121] shadow-2xl flex flex-col border-r border-[#D4AF37]/30"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#0A1F17]">
                <div className="flex items-center space-x-2.5">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image src="/logo.png" alt="NR Enterprises Logo" fill sizes="32px" priority className="object-contain" />
                  </div>
                  <div>
                    <span className={`text-xl font-serif font-bold text-white leading-none ${playfair.className}`}>NR Enterprises</span>
                    <span className="text-[8.5px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold block mt-0.5 font-heading">Bespoke Atelier</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#0F2A1E] border border-[#D4AF37]/30 flex items-center justify-center text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A1F17] transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 bg-[#0A1F17] border-b border-[#D4AF37]/20">
                {user ? (
                  <div className="bg-gradient-to-br from-[#0F2A1E] to-[#06140E] p-3.5 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 aspect-square shrink-0 rounded-full bg-[#D4AF37] text-[#0A1F17] flex items-center justify-center font-serif text-lg font-bold uppercase overflow-hidden shadow-sm">
                        {userFullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold block truncate font-heading">
                          NR Enterprises Patron
                        </span>
                        <h3 className="text-sm font-serif text-white truncate font-bold leading-tight">{userFullName}</h3>
                        <p className="text-[10.5px] text-[#A6C0B3] truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account?tab=profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold bg-[#0A1F17] border border-[#D4AF37]/40 text-[#F3E5AB] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1F17] transition-all rounded-xl"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold bg-red-950/60 border border-red-700/50 text-red-200 hover:bg-red-700 hover:text-white transition-colors rounded-xl cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#0F2A1E] to-[#06140E] p-3.5 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#0A1F17] border border-[#D4AF37]/40 text-[#F3E5AB] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#F3E5AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold block font-heading">
                          Welcome to NR Enterprises
                        </span>
                        <h3 className="text-sm font-serif text-white font-bold truncate">Sign in to Atelier</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-[10px] uppercase tracking-wider font-bold bg-[#D4AF37] text-[#0A1F17] rounded-xl hover:bg-[#F3E5AB] transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-[10px] uppercase tracking-wider font-bold bg-[#0A1F17] border border-[#D4AF37]/40 text-[#F3E5AB] rounded-xl hover:border-[#D4AF37] transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links & Categories */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 [scrollbar-width:thin] scrollbar-thumb-[#D4AF37]/30">
                {/* Explore Links */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold font-heading">
                      Explore Atelier
                    </span>
                    <a
                      href="https://www.etsy.com/shop/NREnterprises"
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
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-heading text-[14px] font-semibold transition-all ${
                            isActive
                              ? "bg-[#0F2A1E] text-[#F3E5AB] border-l-2 border-[#D4AF37] shadow-sm font-bold"
                              : "text-[#DCEAE3] hover:bg-[#0F2A1E]/60 hover:text-[#F3E5AB]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                            <span>{link.name}</span>
                          </div>
                          <span className={`text-xs transition-transform group-hover:translate-x-0.5 ${isActive ? "text-[#F3E5AB]" : "text-[#709586]"}`}>
                            ›
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Categories as Modern Luxury Tag Chips */}
                <div className="pt-4 border-t border-[#D4AF37]/20">
                  <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold font-heading block mb-3 px-1">
                    Shop By Category
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F2A1E]/80 border border-[#D4AF37]/25 hover:border-[#D4AF37] text-[#E4EDE8] hover:text-[#F3E5AB] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70 shrink-0" />
                        <span className="whitespace-nowrap">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Currency in Mobile Menu */}
                <div className="pt-5 border-t border-[#D4AF37]/20 pb-4">
                  <label className="text-[9.5px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold font-heading block mb-2 px-1">
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
                      className="w-full bg-[#0F2A1E] border border-[#D4AF37]/35 text-[#F3E5AB] text-xs font-bold py-3 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-[#D4AF37] appearance-none cursor-pointer transition-colors"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#0A1F17] text-white">
                          {c.label} — {c.symbol} ({c.code})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#F3E5AB] text-xs">
                      ▾
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🌟 6. CART DRAWER (Deep Emerald Glass & Radiant Gold Accent) */}
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A1F17] text-[#E4EDE8] shadow-2xl z-[101] flex flex-col border-l border-[#D4AF37]/30 sm:rounded-l-3xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#D4AF37]/20 flex justify-between items-center bg-[#06140E]">
                <h2 className="text-xl font-serif text-[#F3E5AB] font-semibold">
                  Your Atelier Bag <span className="text-[#A6C0B3] text-sm font-sans font-normal">({cartItems.length})</span>
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0F2A1E] border border-[#D4AF37]/30 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A1F17] transition-all cursor-pointer"
                  aria-label="Close Cart"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto [scrollbar-width:thin] scrollbar-thumb-[#D4AF37]/40">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="w-20 h-20 bg-[#0F2A1E] border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#F3E5AB] mb-6 shadow-md">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold font-sans text-white mb-2">Your shopping bag is empty</h3>
                    <p className="text-sm text-[#A6C0B3] mb-8">Discover our handcrafted masterpieces made with heirloom artistry.</p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/collections");
                      }}
                      className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0A1F17] px-8 py-3.5 text-xs tracking-widest uppercase font-bold hover:brightness-110 transition-all rounded-full shadow-lg cursor-pointer"
                    >
                      Explore Collections
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 bg-[#0F2A1E]/90 p-4 rounded-2xl border border-[#D4AF37]/25 shadow-md relative">
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="absolute top-2 right-2 text-[#A6C0B3] hover:text-red-400 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="w-20 h-20 bg-[#06140E] rounded-xl overflow-hidden shrink-0 relative border border-[#D4AF37]/25 p-1 flex items-center justify-center">
                          {item.image &&
                            (item.image.startsWith("data:") ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                            ))}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          {item.isCustom ? (
                            <span className="bg-[#D4AF37] text-[#0A1F17] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full self-start mb-1">
                              CUSTOM ORDER
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#F3E5AB] uppercase tracking-[0.1em] font-bold">{item.category}</span>
                          )}
                          <span className="text-sm text-white font-bold font-sans leading-tight mb-1 truncate">{item.name}</span>
                          <span className="text-xs text-[#A6C0B3]">Size: {item.size}{item.color ? ` • Color: ${item.color}` : ""}</span>
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="text-xs text-[#A6C0B3]">Qty: {item.quantity}</span>
                            <span className="text-sm font-bold text-[#F3E5AB]">{formatPrice(item.price, item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#06140E] border-t border-[#D4AF37]/20">
                <div className="flex justify-between mb-2 text-[#F3E5AB] font-bold text-lg font-serif">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotalINR)}</span>
                </div>
                <p className="text-xs text-[#A6C0B3] mb-4 text-center">Shipping & taxes calculated at checkout</p>
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] text-[#0A1F17] py-4 text-xs tracking-[0.2em] uppercase font-bold hover:brightness-110 transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
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