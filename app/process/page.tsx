"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    step: "01",
    phase: "Instant Notification",
    title: "Order Received at Bhadohi Workshop",
    time: "Within 5 Minutes",
    desc: "The moment your order is placed, our master craftsmen in Bhadohi receive the complete specification sheet—including exact dimensions, weave technique, color palette, and bespoke silhouette requirements.",
    badge: "Step 1 • Digital Dispatch",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    )
  },
  {
    step: "02",
    phase: "Fiber Curation",
    title: "Sourcing Grade-A Natural & Technical Fibers",
    time: "Day 1",
    desc: "We curate premium raw materials tailored to your rug type—from organic golden jute, pure New Zealand wool, and lustrous silk blends to weather-resilient eco rPET yarns that offer plush luxury and enduring durability.",
    badge: "Step 2 • Material Sourcing",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
      </svg>
    )
  },
  {
    step: "03",
    phase: "Loom Staging",
    title: "Loom Preparation & Warp Tensioning",
    time: "Day 1 - Day 2",
    desc: "Artisans meticulously set up traditional pit looms, frame looms, or precision tufting stations. Warp threads are calibrated with millimeter precision to guarantee structural integrity and exact geometric symmetry.",
    badge: "Step 3 • Loom Staging",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )
  },
  {
    step: "04",
    phase: "Master Weaving",
    title: "Handcrafted Construction & Knotting",
    time: "Day 2 - Day 3",
    desc: "Master artisans bring the rug to life using age-old techniques—hand-knotting, detailed hand-tufting, flatweaving, or braided cord construction. Every row is crafted with heritage passion passed down through generations.",
    badge: "Step 4 • Master Craftsmanship",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.07a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091.491.077 1.009-.07 1.488l-2.008 2.438" />
      </svg>
    )
  },
  {
    step: "05",
    phase: "Artisanal Inspection",
    title: "Tension Balancing, Shearing & Edge Finishing",
    time: "Day 3 - Day 4",
    desc: "Every rug undergoes rigorous planar leveling, hand-serging, and artisan shearing to ensure uniform pile height and zero edge curl. We inspect every inch for fiber density, color integrity, and tactile perfection.",
    badge: "Step 5 • Quality Assurance",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    step: "06",
    phase: "Eco Packaging & Courier",
    title: "Loom-to-Room Direct Dispatch",
    time: "Day 4 - Day 5",
    desc: "Your bespoke rug is carefully rolled, encased in protective weather-shield eco packaging, and assigned an express global tracking code. Direct from our Bhadohi looms to your doorstep with zero middleman markup.",
    badge: "Step 6 • Direct Delivery",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    )
  }
];

export default function OrderProcessTimeline() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-3 sm:pt-4 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Breadcrumb & Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-heading font-bold mb-4 hover:text-[#2B2520] transition-colors"
          >
            ← Back to NR Enterprises Home
          </Link>
          <span className="block text-[11px] uppercase tracking-[0.25em] font-heading font-semibold text-[#7A7065] mb-3">
            The Journey of Your Carpet
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-[#2B2520] mb-4 leading-tight">
            See What We Do <br />
            <span className="text-[#C19A6B] font-normal">When You Place an Order.</span>
          </h1>
          <p className="text-base md:text-lg text-[#7A7065] font-body max-w-2xl mx-auto leading-relaxed">
            Instead of shipping aged inventory off a dusty warehouse shelf, we craft every carpet made-to-order. Here is our step-by-step artisanal journey from the loom to your room:
          </p>
        </div>

        {/* Timeline Graphic Container */}
        <div className="relative">
          
          {/* Vertical Connecting Central Line */}
          <div className="absolute left-6 md:left-1/2 top-8 bottom-8 w-[2px] bg-[#EAEAEB] -translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-16">
            {steps.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  
                  {/* Center Node Circle */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#2B2520] text-white flex items-center justify-center shadow-lg border-4 border-[#FAFAFA] z-20">
                    <span className="font-heading text-sm font-bold">{item.step}</span>
                  </div>

                  {/* Content Card */}
                  <div className="ml-16 md:ml-0 md:w-1/2 md:px-8">
                    <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#EAEAEB]/80 shadow-sm hover:shadow-xl hover:shadow-[#2B2520]/5 transition-all duration-300 relative group">
                      
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] uppercase font-heading font-bold tracking-widest px-3 py-1 bg-[#FAFAFA] text-[#C19A6B] rounded-full border border-[#EAEAEB]">
                          {item.badge}
                        </span>
                        <span className="text-xs font-heading font-semibold text-[#7A7065] tracking-wider">
                          ⏱ {item.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3 text-[#2B2520]">
                        <div className="text-[#C19A6B]">
                          {item.icon}
                        </div>
                        <h3 className="text-lg sm:text-xl font-heading font-bold leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-sm font-body text-[#7A7065] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Empty Spacer on Opposite Side */}
                  <div className="hidden md:block md:w-1/2"></div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Bottom Call to Action */}
        <div className="mt-20 bg-[#2B2520] text-white p-8 md:p-14 text-center rounded-3xl shadow-xl relative overflow-hidden border border-[#2B2520]">
          <div className="relative z-10 max-w-xl mx-auto">
            <span className="text-[#C19A6B] uppercase tracking-[0.25em] text-xs font-heading font-bold block mb-3">
              Direct Artisanal Craft
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-bold mb-4 text-white">
              Ready to Order Your Bespoke Carpet?
            </h2>
            <p className="text-sm sm:text-base text-[#FAFAFA]/80 font-body leading-relaxed mb-8">
              Explore our curated collection of handcrafted area rugs, carpets, runners, and bespoke weaves crafted directly at our master looms in Bhadohi.
            </p>
            <Link
              href="/collections"
              className="inline-block bg-[#C19A6B] hover:bg-[#B89258] text-white px-8 py-3.5 text-xs uppercase tracking-[0.18em] font-heading font-bold rounded-full transition-colors duration-300 shadow-md"
            >
              Explore Collections Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}