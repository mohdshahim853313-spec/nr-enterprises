"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PaymentMethods from "./PaymentMethods";

interface FooterSection {
  title: string;
  id: string;
  links: { label: string; href: string }[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Explore",
    id: "explore",
    links: [
      { label: "All Collections", href: "/collections" },
      { label: "Hand-Braided Weaves", href: "/collections" },
      { label: "Bespoke Studio", href: "/customize" },
      { label: "Artisanal Process", href: "/process" },
      { label: "Blogs", href: "/blog" },
    ],
  },
  {
    title: "Client Care",
    id: "client-care",
    links: [
      { label: "Contact Concierge", href: "/contact" },
      { label: "My Account", href: "/account" },
      { label: "Private Wishlist", href: "/wishlist" },
      { label: "About Atelier", href: "/about" },
    ],
  },
  {
    title: "Policies & Legal",
    id: "policies-legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund & Return Policy", href: "/refunds" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export default function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <footer className="bg-[#FAF6F0] pt-12 md:pt-20 pb-20 md:pb-12 border-t border-[#F0EBE1] text-[#6B6054]">
      <div className="w-full px-3.5 sm:px-5 md:px-10 max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 mb-10 md:mb-16 text-left">
          
          {/* Brand & Heritage */}
          <div className="pb-4 md:pb-0 border-b border-[#EAE3D6] md:border-b-0">
            <Link href="/" className="inline-flex items-center space-x-3 mb-4 group cursor-pointer">
              <Image
                src="/logo.png"
                alt="NR Enterprises Logo"
                width={72}
                height={72}
                quality={90}
                className="object-contain rounded-sm w-9 h-9 transition-transform group-hover:scale-105 duration-200"
              />
              <h4 className="text-3xl text-[#2B2520] font-serif tracking-tight">NR Enterprises</h4>
            </Link>
            <p className="text-sm text-[#6B6054] leading-relaxed max-w-xs">
              Bringing the golden touch of Bhadohi&apos;s master craftsmanship directly to your modern living spaces with sustainable fibers.
            </p>
            <div className="mt-4 text-xs text-[#9E7848] font-bold tracking-wider uppercase">
              Bhadohi, Uttar Pradesh, India
            </div>

            {/* Direct Contact Information (Always Visible, Clear & Prominent) */}
            <div className="mt-6 pt-5 border-t border-[#EAE3D6] space-y-3">
              <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-[#1F1A17]">
                Contact
              </div>
              <div className="text-sm sm:text-[15px] text-[#3D352E] font-medium leading-snug">
                NR Enterprises, Bhadohi, UP - Carpet City
              </div>
              <div className="space-y-2 pt-1 text-sm sm:text-[15px]">
                <a
                  href="https://wa.me/918874585277"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#3D352E] hover:text-[#25D366] transition-colors"
                >
                  <span className="font-bold text-[#1F1A17]">WhatsApp:</span>
                  <span>+91 8874585277</span>
                </a>
                <a
                  href="tel:+918874585277"
                  className="flex items-center gap-1.5 text-[#3D352E] hover:text-[#C19A6B] transition-colors"
                >
                  <span className="font-bold text-[#1F1A17]">Phone:</span>
                  <span>+91 8874585277</span>
                </a>
                <a
                  href="mailto:nrenterprises@gmail.com"
                  className="flex items-center gap-1.5 text-[#3D352E] hover:text-[#C19A6B] transition-colors"
                >
                  <span className="font-bold text-[#1F1A17]">Email:</span>
                  <span>nrenterprises@gmail.com</span>
                </a>
                <a
                  href="https://instagram.com/nrenterprises"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#3D352E] hover:text-[#E1306C] transition-colors"
                >
                  <span className="font-bold text-[#1F1A17]">Instagram:</span>
                  <span>@nrenterprises</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Accordion Dropdowns (< md) */}
          <div className="md:hidden flex flex-col divide-y divide-[#EAE3D6] border-b border-[#EAE3D6] -mt-2">
            {FOOTER_SECTIONS.map((sec) => {
              const isOpen = !!openSections[sec.id];
              return (
                <div key={sec.id} className="py-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="w-full py-3.5 flex items-center justify-between text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[#2B2520] font-bold tracking-widest uppercase text-xs">
                      {sec.title}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center bg-[#F0EBE1] text-[#2B2520] transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-[#E5DDD2]" : ""
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-72 opacity-100 pb-3" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-col space-y-2.5 pt-1 pl-1">
                      {sec.links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="text-[13.5px] text-[#6B6054] hover:text-[#C19A6B] active:text-[#9E7848] transition-colors font-medium py-1"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Static Columns (>= md) */}
          {FOOTER_SECTIONS.map((sec) => (
            <div key={sec.id} className="hidden md:flex flex-col space-y-3 text-sm text-[#6B6054]">
              <span className="text-[#2B2520] font-bold tracking-widest uppercase mb-2 text-xs">
                {sec.title}
              </span>
              {sec.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#C19A6B] transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

        </div>

        {/* Payment Methods & Secure Checkout Bar */}
        <div className="w-full py-6 border-t border-[#EAE3D6] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#6B6054]">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E5DDD2]/70 text-[#9E7848]">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <span className="font-bold tracking-wider uppercase text-[11px] text-[#2B2520]">
              100% Secure Checkout
            </span>
            <span className="text-[#9E7848]">•</span>
            <span className="text-[11px] text-[#6B6054]">
              Powered by Razorpay &amp; Payoneer
            </span>
          </div>
          <PaymentMethods />
        </div>

        {/* Bottom Copyright & Heritage Motto */}
        <div className="w-full pt-6 border-t border-[#EAE3D6] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8C7A63] text-center md:text-left">
          <div className="font-medium tracking-wide">
            © 2026 NR ENTERPRISES ATELIER. ALL RIGHTS RESERVED.
          </div>
          <div className="text-[11px] tracking-widest uppercase font-bold text-[#9E7848]">
            CRAFTED WITH CARE IN BHADOHI, INDIA
          </div>
        </div>
      </div>
    </footer>
  );
}
