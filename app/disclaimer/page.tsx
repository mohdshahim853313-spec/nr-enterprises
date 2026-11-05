"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DisclaimerPage() {
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
            NR Enterprises Atelier Disclosures
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#2B2520] mb-4">Website Disclaimer</h1>
          <p className="text-sm sm:text-base text-[#7A7065] max-w-xl mx-auto font-body leading-relaxed">
            Essential disclosures regarding handmade craftsmanship, color accuracy, and website usage.
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
              1. General Information
            </h2>
            <p>
              The information provided by <strong className="text-[#2B2520]">NR Enterprises</strong> on <Link href="/" className="text-[#C19A6B] font-semibold hover:underline">nrenterprises.com</Link> is for general informational and purchasing purposes only. All content on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding accuracy, adequacy, validity, reliability, or completeness of any information on the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              2. Handcrafted Product Variations
            </h2>
            <p>
              All carpets featured on NR Enterprises are created by skilled artisans. Because every piece is hand-knotted, hand-tufted, or flat-woven:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>No two rugs are 100% identical. Subtle differences in yarn texture, pattern symmetry, and knot density are intrinsic to artisanal textile art.</li>
              <li>Natural fibers (such as jute, wool, and recycled rPET) possess organic characteristics that evolve gracefully with use.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              3. Color Representation & Screen Display
            </h2>
            <p>
              We photograph our carpets under true-to-life studio lighting to ensure maximum color fidelity. However, physical carpet appearance may vary slightly depending on:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Your device screen brightness, color calibration (OLED, IPS, Retina), and night-mode settings.</li>
              <li>Ambient lighting in your room (warm incandescent vs. natural sunlight vs. cool LED light).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              4. External Links & Third-Party Gateways
            </h2>
            <p>
              Our website may contain links to external third-party payment gateways (Razorpay, Payoneer) or courier tracking portals. NR Enterprises does not control or assume responsibility for the content, privacy policies, or practices of any third-party websites.
            </p>
          </section>

          <section className="pt-4 border-t border-[#EAEAEB]">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3">
              5. Contact Us
            </h2>
            <p>
              If you have any questions regarding these disclosures, please contact us at{" "}
              <a href="mailto:nrenterprises@gmail.com" className="text-[#C19A6B] font-semibold underline">nrenterprises@gmail.com</a>.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
