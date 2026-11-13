"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            NR Enterprises Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#2B2520] mb-4">Privacy Policy</h1>
          <p className="text-sm sm:text-base text-[#7A7065] max-w-xl mx-auto font-body leading-relaxed">
            Your trust is the foundation of our craft. Learn how we safeguard your personal data across our atelier platform.
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
              1. Introduction
            </h2>
            <p>
              Welcome to <strong className="text-[#2B2520]">NR Enterprises</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring your personal information is handled with the highest standards of safety, discretion, and compliance. This Privacy Policy outlines our practices regarding data collection, usage, sharing, and protection when you visit or make a purchase from{" "}
              <Link href="/" className="text-[#C19A6B] hover:underline font-semibold">nrenterprises.com</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              2. Information We Collect
            </h2>
            <div className="space-y-3">
              <p>We collect information to provide you with seamless bespoke rug curation, secure transactions, and personalized customer care:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-[#2B2520]">Identity & Contact Data:</strong> Name, shipping address, billing address, email address, phone number, and bespoke customization requirements.
                </li>
                <li>
                  <strong className="text-[#2B2520]">Account & Authentication Data:</strong> Password hashes, login timestamps, and profile metadata (including Google OAuth sign-in profile name and verified email).
                </li>
                <li>
                  <strong className="text-[#2B2520]">Payment & Transaction Data:</strong> Transaction references, currency preference, and order details. <em>Note: Sensitive credit/debit card numbers are securely handled directly by authorized payment gateways (Razorpay, Payoneer) and never stored on our servers.</em>
                </li>
                <li>
                  <strong className="text-[#2B2520]">Technical & Usage Data:</strong> IP address, browser type, device information, pages viewed, and session analytics to optimize site performance.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To fulfill and deliver your rug orders, bespoke weaves, and sample swatches.</li>
              <li>To provide order tracking updates, loom progress notifications, and invoices.</li>
              <li>To respond promptly to customer concierge inquiries and bespoke design consultations.</li>
              <li>To securely authenticate and maintain your NR Enterprises patron account.</li>
              <li>To prevent fraudulent transactions and maintain platform security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              4. Third-Party Services & Integration
            </h2>
            <p>We work only with reputable, industry-certified service providers to power our platform:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-[#2B2520]">Supabase:</strong> Encrypted cloud database and secure authentication provider.</li>
              <li><strong className="text-[#2B2520]">Razorpay & Payoneer:</strong> PCI-DSS compliant payment gateways for domestic and international checkouts.</li>
              <li><strong className="text-[#2B2520]">Logistics Partners:</strong> Trusted courier networks (DHL, FedEx, Blue Dart, Delhivery) strictly for physical delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              5. Data Security & Storage
            </h2>
            <p>
              We implement industry-standard AES-256 encryption, HTTPS SSL protocols, and row-level security policies. Your data is restricted only to authorized personnel directly involved in crafting and delivering your carpets.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3 pb-2 border-b border-[#EAEAEB]">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, rectify, or request the deletion of your personal data stored with us at any time. You may also opt out of any marketing newsletters by clicking the unsubscribe link or contacting our team.
            </p>
          </section>

          <section className="pt-4 border-t border-[#EAEAEB]">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] mb-3">
              7. Contact Our Atelier Privacy Concierge
            </h2>
            <p>
              If you have any questions or requests regarding this Privacy Policy, please reach out to our team:
            </p>
            <div className="mt-4 p-5 bg-[#FAFAFA] border border-[#EAEAEB] rounded-2xl text-xs sm:text-sm space-y-1">
              <p className="font-heading font-semibold text-[#2B2520]">NR Enterprises Atelier</p>
              <p>Bhadohi, Uttar Pradesh, 221401, India</p>
              <p>Email: <a href="mailto:nasimshah2441@gmail.com" className="text-[#C19A6B] font-semibold underline">nasimshah2441@gmail.com</a></p>
              <p>Concierge Desk: <span className="text-[#2B2520] font-semibold">Available via Website Quick Inquire & Email</span></p>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
