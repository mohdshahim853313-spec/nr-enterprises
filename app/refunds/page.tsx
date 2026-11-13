"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function RefundPolicyPage() {
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
            NR Enterprises Client Assurance
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#2B2520] mb-4">Refund & Return Policy</h1>
          <p className="text-sm sm:text-base text-[#7A7065] max-w-xl mx-auto font-body leading-relaxed">
            We are dedicated to exceptional craftsmanship and patron satisfaction. Discover our clear return and refund guidelines.
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
              1. 7-Day Hassle-Free Returns (Standard Catalog Items)
            </h2>
            <p>
              For standard catalog carpets, we offer a <strong className="text-[#2B2520]">7-day return window</strong> from the date your shipment is delivered. If the rug does not suit your space, you may request a return or exchange under the following conditions:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>The carpet must be unused, unwashed, and free from any dirt, pet hair, or smoke odors.</li>
              <li>The item must be in its original packaging with all authentic NR Enterprises tags and care labels intact.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              2. Bespoke & Custom-Woven Rugs
            </h2>
            <p>
              Due to the unique yarn dyeing, personalized sizing, and artisan labor dedicated to <strong className="text-[#2B2520]">Custom Bespoke Carpets</strong>, custom pieces are final sale and non-returnable once woven, unless there is a verifiable material defect or damage incurred during transit.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              3. Damaged or Incorrect Shipments
            </h2>
            <p>
              Every shipment is carefully wrapped in weather-resistant dual-layer protective packaging. In the rare event that your package arrives damaged or you receive an incorrect item:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Please notify us within <strong className="text-[#2B2520]">48 hours</strong> of delivery with clear photographs of the packaging and damage at <a href="mailto:nasimshah2441@gmail.com" className="text-[#C19A6B] underline font-semibold">nasimshah2441@gmail.com</a>.</li>
              <li>We will arrange an immediate complimentary replacement or a 100% full refund including all shipping costs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              4. Refund Processing Timeline
            </h2>
            <p>
              Once your returned item is received and inspected at our Bhadohi atelier:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>We will send an email confirmation regarding your return approval.</li>
              <li>Approved refunds will be processed back to your original payment method (Credit/Debit Card, UPI, Net Banking, Razorpay, or Payoneer) within <strong className="text-[#2B2520]">5 to 7 business days</strong>.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-[#EAEAEB]">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3">
              5. How to Initiate a Return
            </h2>
            <p>
              To initiate a return or exchange, simply contact our concierge team:
            </p>
            <div className="mt-4 p-5 bg-[#FAFAFA] border border-[#EAEAEB] rounded-2xl text-xs sm:text-sm space-y-1">
              <p className="font-heading font-semibold text-[#2B2520]">NR Enterprises Returns Concierge</p>
              <p>Email: <a href="mailto:nasimshah2441@gmail.com" className="text-[#C19A6B] font-semibold underline">nasimshah2441@gmail.com</a></p>
              <p>Subject Line: <em>Return Request - [Your Order ID]</em></p>
              <p>Contact Form: <Link href="/contact" className="text-[#C19A6B] underline font-semibold">Visit Contact Page</Link></p>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
