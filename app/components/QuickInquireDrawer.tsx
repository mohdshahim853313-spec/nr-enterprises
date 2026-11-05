"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useScrollDirection } from "@/lib/useScrollDirection";

export default function QuickInquireDrawer() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Custom Rug Sizing & Quotes");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Listen to open-quick-inquire custom event from anywhere in the app
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail) {
        if (customEvent.detail.subject) setSubject(customEvent.detail.subject);
        if (customEvent.detail.message) setMessage(customEvent.detail.message);
      }
      setIsSuccess(false);
      setErrorMessage("");
      setIsOpen(true);
    };

    window.addEventListener("open-quick-inquire", handleOpen);
    return () => window.removeEventListener("open-quick-inquire", handleOpen);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setErrorMessage("Please provide your email address and message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: name.trim() || "Patron",
          lastName: "",
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to send inquiry. Please try again.");
      }

      setIsSuccess(true);
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to deliver inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Contact Action Button (Synchronized with bottom nav animation) */}
      <aside
        aria-label="Contact Atelier"
        className={`fixed bottom-20 lg:bottom-6 right-3.5 sm:right-6 z-[85] print:hidden transition-transform duration-300 ease-in-out ${
          scrollDirection === "down" ? "translate-y-[130px]" : "translate-y-0"
        } ${pathname === "/contact" ? "hidden" : ""}`}
      >
        <Link
          href="/contact"
          className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#2B2520] hover:bg-[#3A332C] text-[#FAF8F5] rounded-full border border-[#C19A6B]/50 shadow-[0_8px_24px_rgba(43,37,32,0.32)] hover:shadow-[0_12px_30px_rgba(43,37,32,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open Contact Page"
          title="Contact Atelier"
        >
          {/* Soft inner glow ring */}
          <span className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />

          {/* Luxury Message Icon */}
          <svg
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#C19A6B] transition-transform duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>

          {/* Hover Tooltip (Desktop) */}
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-full bg-[#2B2520] text-[#FAF8F5] text-[11px] font-heading font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-md border border-[#C19A6B]/30 hidden sm:block">
            Contact Atelier
          </span>
        </Link>
      </aside>

      {/* Modal / Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Inquire Card */}
          <div className="relative w-full sm:max-w-md bg-[#FAF8F5] border border-[#E5DDD2] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#2B2520] text-[#FAF8F5] p-5 sm:p-6 relative flex items-start justify-between border-b border-[#3A332C]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C19A6B]/20 text-[#C19A6B] text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-[#C19A6B]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]"></span>
                  Atelier Concierge Desk
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FAF8F5]">
                  Quick Inquire
                </h3>
                <p className="text-xs text-[#DFD8CC] mt-0.5 leading-relaxed">
                  Direct message to our Bhadohi loom team & design specialists.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-[#E8F8EE] text-[#1B7042] flex items-center justify-center mx-auto mb-4 border border-[#BDE8CC]">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-heading font-bold text-lg text-[#2B2520] mb-2">
                    Inquiry Received
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B6054] leading-relaxed max-w-sm mx-auto mb-6">
                    Thank you! Your inquiry has been forwarded directly to our master weavers and concierge. A specialist will reply to{" "}
                    <span className="font-bold text-[#2B2520]">{email}</span> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setIsOpen(false);
                    }}
                    className="w-full py-3 rounded-full bg-[#2B2520] text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#3A332C] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#6B6054] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD8CC] focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] text-xs sm:text-sm text-[#2B2520] outline-none transition-all placeholder:text-[#AAA095]"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#6B6054] mb-1.5">
                      Email Address <span className="text-[#C19A6B]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com (Where we'll send our reply)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD8CC] focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] text-xs sm:text-sm text-[#2B2520] outline-none transition-all placeholder:text-[#AAA095]"
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#6B6054] mb-1.5">
                      Topic / Requirement
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD8CC] focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] text-xs sm:text-sm text-[#2B2520] outline-none transition-all cursor-pointer"
                    >
                      <option value="Custom Rug Sizing & Quotes">Custom Rug Sizing & Quotes</option>
                      <option value="Product & Material Inquiry">Product & Material Inquiry</option>
                      <option value="Wool / Color Swatch Sample Request">Wool / Color Swatch Sample Request</option>
                      <option value="Interior Designer / Trade Bulk Inquiry">Interior Designer / Trade Bulk Inquiry</option>
                      <option value="Order Tracking & Support">Order Tracking & Support</option>
                      <option value="General Concierge Assistance">General Concierge Assistance</option>
                    </select>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-[#6B6054] mb-1.5">
                      Message / Requirement <span className="text-[#C19A6B]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about dimensions, specific designs, or any questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD8CC] focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] text-xs sm:text-sm text-[#2B2520] outline-none transition-all placeholder:text-[#AAA095] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-full font-heading font-bold text-xs uppercase tracking-wider bg-[#2B2520] hover:bg-[#C19A6B] text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending to Atelier...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Inquiry to Atelier</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A63] pt-1">
                    <svg className="w-3.5 h-3.5 text-[#1B7042]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No phone number required • Reply sent to your email</span>
                  </div>
                </form>
              )}

              {/* Atelier Direct Contact Details & Full Page Link */}
              <div className="mt-5 pt-4 border-t border-[#E5DDD2]/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-heading font-bold uppercase tracking-wider text-[#8C7A63]">
                  <span>Direct Contact</span>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="text-[#C19A6B] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Full Contact Page →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a
                    href="mailto:nrenterprises@gmail.com"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DFD8CC] text-[#2B2520] hover:border-[#C19A6B] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#C19A6B] flex items-center justify-center shrink-0 border border-[#E5DDD2]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-[#8C7A63] uppercase tracking-wider font-semibold">Email Directly</div>
                      <div className="text-xs font-semibold text-[#2B2520] truncate">nrenterprises@gmail.com</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DFD8CC] text-[#2B2520]">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#C19A6B] flex items-center justify-center shrink-0 border border-[#E5DDD2]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-[#8C7A63] uppercase tracking-wider font-semibold">Loom Atelier</div>
                      <div className="text-xs font-semibold text-[#2B2520] truncate">Bhadohi, UP, India</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
