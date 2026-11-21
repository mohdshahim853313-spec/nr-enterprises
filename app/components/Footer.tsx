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
      { label: "Our Story", href: "/legacy" },
      { label: "Artisanal Process", href: "/process" },
      { label: "Blogs", href: "/blog" },
    ],
  },
  {
    title: "Client Care",
    id: "client-care",
    links: [
      { label: "Contact Concierge", href: "/contact" },
      { label: "Follow on Instagram", href: "https://www.instagram.com/nr_enterprises7" },
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
    <footer className="bg-[#240609] pt-8 md:pt-12 pb-16 md:pb-10 border-t border-[#4A1017] text-[#D8C9C5]">
      <div className="w-full px-3.5 sm:px-5 md:px-10 max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 mb-6 md:mb-8 text-left">
          
          {/* Brand & Heritage */}
          <div className="pb-4 md:pb-0 border-b border-[#4A1017] md:border-b-0">
            <Link href="/" className="inline-block mb-4 group cursor-pointer" aria-label="NR Enterprises Home">
              <div className="relative h-16 sm:h-20 w-44 sm:w-52 shrink-0 drop-shadow-[0_2px_16px_rgba(232,200,106,0.35)] transition-transform group-hover:scale-105 duration-200">
                <Image
                  src="/nr-logo.png"
                  alt="NR Enterprises"
                  fill
                  sizes="(max-width: 640px) 176px, 208px"
                  quality={95}
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* Direct Contact Information (Shifted Up for Sleek, Compact Height) */}
            <div className="space-y-2.5">
              <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-[#FAF5EB]">
                Atelier Concierge
              </div>
              <div className="text-sm sm:text-[15px] text-[#FAF5EB] font-medium leading-snug">
                NR Enterprises, Bhadohi, UP - Carpet City
              </div>
              <div className="space-y-1.5 pt-1 text-sm sm:text-[15px]">
                <a
                  href="https://wa.me/919151452441"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#FAF5EB] hover:text-[#25D366] transition-colors"
                >
                  <span className="font-bold text-[#FAF5EB]">WhatsApp:</span>
                  <span>+91 9151452441</span>
                </a>
                <a
                  href="tel:+916394472035"
                  className="flex items-center gap-1.5 text-[#FAF5EB] hover:text-white transition-colors"
                >
                  <span className="font-bold text-[#FAF5EB]">Phone:</span>
                  <span>+91 6394472035</span>
                </a>
                <a
                  href="mailto:nasimshah2441@gmail.com"
                  className="flex items-center gap-1.5 text-[#FAF5EB] hover:text-white transition-colors"
                >
                  <span className="font-bold text-[#FAF5EB]">Email:</span>
                  <span>nasimshah2441@gmail.com</span>
                </a>
                <a
                  href="https://www.instagram.com/nr_enterprises7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#FAF5EB] hover:text-[#E4405F] transition-colors group/insta"
                >
                  <span className="font-bold text-[#FAF5EB]">Instagram:</span>
                  <span className="group-hover/insta:underline">@nr_enterprises7</span>
                </a>
              </div>

              {/* Instagram Follow Badge */}
              <div className="pt-2">
                <a
                  href="https://www.instagram.com/nr_enterprises7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#833ab4]/25 via-[#fd1d1d]/25 to-[#fcb045]/25 hover:from-[#833ab4]/40 hover:via-[#fd1d1d]/40 hover:to-[#fcb045]/40 border border-[#E1306C]/40 text-[#FAF5EB] text-xs font-semibold transition-all hover:scale-105 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 text-[#E1306C]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Follow @nr_enterprises7</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Accordion Dropdowns (< md) */}
          <div className="md:hidden flex flex-col divide-y divide-[#4A1017] border-b border-[#4A1017] -mt-2">
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
                    <span className="text-[#FAF5EB] font-bold tracking-widest uppercase text-xs">
                      {sec.title}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center bg-[#3D0C12] text-[#FAF5EB] border border-[#4A1017] transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-[#4A1017] text-white" : ""
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
                          className="text-[13.5px] text-[#D8C9C5] hover:text-white transition-colors font-medium py-1"
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
            <div key={sec.id} className="hidden md:flex flex-col space-y-3 text-sm text-[#D8C9C5]">
              <span className="text-[#FAF5EB] font-bold tracking-widest uppercase mb-2 text-xs">
                {sec.title}
              </span>
              {sec.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-white transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

        </div>

        {/* Payment Methods & Secure Checkout Bar */}
        <div className="w-full py-6 border-t border-[#4A1017] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#D8C9C5]">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#3D0C12] text-[#FAF5EB] border border-[#4A1017]">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <span className="font-bold tracking-wider uppercase text-[11px] text-[#FAF5EB]">
              100% Secure Checkout
            </span>
            <span className="text-[#FAF5EB]/40">•</span>
            <span className="text-[11px] text-[#D8C9C5]">
              Powered by Razorpay &amp; Payoneer
            </span>
          </div>
          <div className="brightness-90 hover:brightness-100 transition-all">
            <PaymentMethods />
          </div>
        </div>

        {/* Bottom Copyright & Heritage Motto */}
        <div className="w-full pt-6 border-t border-[#4A1017] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#D8C9C5] text-center md:text-left">
          <div className="font-medium tracking-wide">
            © 2026 NR ENTERPRISES ATELIER. ALL RIGHTS RESERVED.
          </div>
          <div className="text-[11px] tracking-widest uppercase font-bold text-[#FAF5EB]">
            CRAFTED WITH CARE IN BHADOHI, INDIA
          </div>
        </div>
      </div>
    </footer>
  );
}
