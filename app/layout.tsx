import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans, Lato, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import Footer from "./components/Footer";
import SmoothScroll from "./SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import ResponsiveReloader from "./components/ResponsiveReloader";
import PaymentMethods from "./components/PaymentMethods";
import QuickInquireDrawer from "./components/QuickInquireDrawer";
import TopProgressBar from "./components/TopProgressBar";
import { CurrencyProvider } from "../context/CurrencyContext";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta", 
  display: "swap" 
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap"
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif", 
  display: "swap" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair", 
  display: "swap" 
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nrenterprises.com"),
  title: {
    default: "NR Enterprises | Masterpiece Carpets & Handcrafted Rugs",
    template: "%s | NR Enterprises",
  },
  description: "Where Tradition Meets Tomorrow. Handcrafted area rugs, carpets, hallway runners, and bespoke silhouettes woven directly from the Carpet City of Bhadohi.",
  keywords: [
    "NR Enterprises",
    "handmade rugs",
    "hand-knotted carpets",
    "tufted rugs",
    "jute rugs",
    "flatweave dhurries",
    "braided carpets",
    "Bhadohi rugs",
    "sustainable carpets",
    "custom runners",
    "area rugs",
  ],
  authors: [{ name: "NR Enterprises" }],
  creator: "NR Enterprises",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nrenterprises.com",
    siteName: "NR Enterprises",
    title: "NR Enterprises | Masterpiece Carpets & Handcrafted Rugs",
    description: "Where Tradition Meets Tomorrow. Handcrafted area rugs, carpets, hallway runners, and bespoke silhouettes from Bhadohi.",
    images: [
      {
        url: "/logo.png",
        width: 160,
        height: 160,
        alt: "NR Enterprises Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "NR Enterprises | Masterpiece Carpets & Handcrafted Rugs",
    description: "Handcrafted luxury carpets and artisanal rugs direct from Bhadohi, India.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/icon.png"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "lQMG1y0ZyMJNIhA_lPp9xh41fjKa3sGEHdupg6Qtrd0",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://nrenterprises.com/#organization",
      name: "NR Enterprises",
      url: "https://nrenterprises.com",
      logo: "https://nrenterprises.com/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "Worldwide",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://nrenterprises.com/#website",
      url: "https://nrenterprises.com",
      name: "NR Enterprises",
      publisher: {
        "@id": "https://nrenterprises.com/#organization",
      },
    },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let initialCurrency = "USD";
  let initialUsdRate = 83.5;
  try {
    const cookieStore = await cookies();
    const curr = cookieStore.get("user_currency")?.value;
    if (curr) initialCurrency = curr;
    const rate = cookieStore.get("cached_usd_rate")?.value;
    if (rate) {
      const parsed = parseFloat(rate);
      if (!isNaN(parsed) && parsed > 0) initialUsdRate = parsed;
    }
  } catch {}

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="preconnect" href="https://qjpjltaiazwybhsmnkve.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://qjpjltaiazwybhsmnkve.supabase.co" />
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="" />
        <link rel="preload" as="image" href="/logo.png" type="image/png" fetchPriority="high" />
        {/* Pre-hydration sync script to eliminate any currency flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('user_currency');
                  if (saved && !document.cookie.includes('user_currency=')) {
                    document.cookie = 'user_currency=' + encodeURIComponent(saved) + '; path=/; max-age=31536000; SameSite=Lax';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Prevent ghost image dragging / copying across the website */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  window.addEventListener('dragstart', function(e) {
                    var target = e.target;
                    if (!target) return;
                    if (typeof target.closest === 'function' && target.closest('[draggable="true"]')) {
                      return;
                    }
                    if (target.tagName === 'IMG' || target.tagName === 'PICTURE' || (typeof target.closest === 'function' && target.closest('img, picture'))) {
                      e.preventDefault();
                    }
                  }, { capture: true, passive: false });
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics (GA4) - lazyOnload so main thread is 100% free for instant button clicks */}
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-TMBV1DFTDK"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TMBV1DFTDK', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body 
        suppressHydrationWarning
        className={`${jakarta.variable} ${lato.variable} ${cormorant.variable} ${playfair.variable} font-sans min-h-screen flex flex-col bg-[#F8F9FA] text-[#1F1A17] selection:bg-[#C19A6B] selection:text-white`}
      >
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <CurrencyProvider initialCurrency={initialCurrency} initialUsdRate={initialUsdRate}>
          <ResponsiveReloader />
          <SmoothScroll>
            <ScrollToTop />
            <Navbar />
            <main className="flex-grow pb-20 lg:pb-0">{children}</main>

            <Footer />

            {/* Floating Luxury Quick Inquire Concierge Drawer */}
            <QuickInquireDrawer />

            {/* Pinned Mobile Bottom Navigation Bar */}
            <MobileBottomNav />
          </SmoothScroll>
        </CurrencyProvider>
      </body>
    </html>
  );
}