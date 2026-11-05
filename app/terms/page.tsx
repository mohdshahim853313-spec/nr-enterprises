"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "September 16, 2026";

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-3 sm:pt-4 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-semibold px-3 py-1 rounded-full bg-white border border-[#EAEAEB] inline-block mb-3 shadow-xs">
            NR Enterprises Legal & Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#2B2520] mb-4">Terms of Service</h1>
          <p className="text-sm sm:text-base text-[#7A7065] max-w-xl mx-auto font-body leading-relaxed">
            Please review the terms and conditions governing the acquisition of our handcrafted carpets and bespoke weaving services.
          </p>
          <div className="mt-4 text-xs font-heading uppercase tracking-wider text-[#7A7065] font-semibold">
            Last Updated: {lastUpdated}
          </div>
        </motion.div>

        {/* Content Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white p-7 sm:p-12 md:p-14 border border-[#EAEAEB]/80 rounded-3xl shadow-sm space-y-10 text-sm sm:text-base text-[#7A7065] font-body leading-relaxed"
        >
          
          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing our website <Link href="/" className="text-[#C19A6B] font-semibold hover:underline">nrenterprises.com</Link>, creating an account, or placing an order with <strong className="text-[#2B2520]">NR Enterprises</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              2. Artisanal Nature & Handcrafting Nuances
            </h2>
            <p>
              Each NR Enterprises carpet is hand-braided, hand-knotted, or hand-tufted by master artisans in Bhadohi, India using sustainable recycled PET (rPET) yarn, organic jute, and virgin wool.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-[#2B2520]">Dimensional Tolerance:</strong> Due to traditional hand-loom tension, physical rug dimensions may vary up to ±2% to 3% from standard specifications.</li>
              <li><strong className="text-[#2B2520]">Color & Dye Lots:</strong> Natural yarn absorption and organic dyes may create subtle tonal depths and shade variations that highlight the unique character of authentic artisanal handcrafting.</li>
              <li><strong className="text-[#2B2520]">Minor Weft Variations:</strong> Slight knots or texture variations are hallmark characteristics of genuine handmade rugs, not manufacturing defects.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              3. Bespoke & Custom Orders
            </h2>
            <p>
              Custom orders created via our Bespoke Studio or custom inquiries are tailored specifically to your dimensions, color palette, and design specifications. Once yarn dyeing and loom warp setup begins, bespoke orders cannot be cancelled or modified.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              4. Pricing, Currency & Payments
            </h2>
            <p>
              All prices are transparently displayed in your selected local currency (INR ₹, USD $, EUR €, GBP £, etc.). We reserve the right to modify prices without prior notice, provided that accepted and confirmed orders will always be honored at the agreed price.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              5. Intellectual Property
            </h2>
            <p>
              All carpet designs, photography, branding, bespoke patterns, and atelier texts are the exclusive intellectual property of <strong className="text-[#2B2520]">NR Enterprises Atelier</strong>. Any unauthorized reproduction or commercial copying is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in Bhadohi / Varanasi, Uttar Pradesh, India.
            </p>
          </section>

          <section className="pt-4 border-t border-[#EAEAEB]">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3">
              7. Questions & Customer Concierge
            </h2>
            <p>
              For any clarification regarding these terms, reach our legal desk at{" "}
              <a href="mailto:nrenterprises@gmail.com" className="text-[#C19A6B] font-semibold underline">nrenterprises@gmail.com</a>.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
