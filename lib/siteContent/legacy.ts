/**
 * 🌟 NR Enterprises Our Story Content Configuration
 * 
 * Aap is file ke andar Our Story page ke text, quotes, 4 stages of craftsmanship,
 * 4 weaving disciplines, comparison promise, aur CTA ko direct change kar sakte hain.
 * Change karne ke baad Admin Panel (/admin/content) me jaakar
 * "⚡ Publish Codebase Text" par click karein to yeh live Supabase par publish ho jayega.
 */

export const legacyContent = {
  hero: {
    title: "Bhadohi Heritage.",
    subtitle: "Four Centuries of Weaving Mastery, Direct to Modern Sanctuaries.",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/modern-luxury-hall-rug-1791629806105.webp",
    stats: [
      { value: "400+ Yrs", label: "Bhadohi Heritage" },
      { value: "100% Direct", label: "Master Weavers" },
      { value: "Zero", label: "Retail Markup" },
      { value: "Pure NZ Wool", label: "Natural Fibers" },
    ],
  },
  intro: {
    tag: "THE ATELIER MANIFESTO",
    quote: "NR Enterprises represents the sacred intersection of centuries-old Bhadohi loom artistry and modern architectural spatial design.",
    description: "For over four hundred years, the town of Bhadohi in Uttar Pradesh has been celebrated worldwide as India's 'Carpet City'. Here, weaving is not merely an occupation—it is an inherited ancestral language passed down through master artisan lineages. By operating as direct makers, NR Enterprises eliminates traditional international retail markups, ensuring that authentic museum-grade craftsmanship reaches your living spaces with absolute integrity.",
  },
  craftsmanship: {
    tag: "METICULOUS DISCIPLINE",
    title: "How a NR Enterprises Carpet is Born",
    subtitle: "From natural raw fleeces to hand-carved sculptural reliefs, every rug takes weeks of concentrated artisanal dedication.",
    stages: [
      {
        step: "01",
        title: "Virgin Fiber Selection",
        desc: "Pure New Zealand long-staple wool, organic golden jute, and recycled artisan fibers, hand-graded for supreme tensile softness and durability.",
        img: "/uploads/pet_fiber_yarn_hand-1789701082880.webp",
      },
      {
        step: "02",
        title: "Pit-Loom & Tufting Mastery",
        desc: "Each carpet is brought to life on traditional wooden pit looms and precision tufting stations, anchoring tens of thousands of individual woolen knots.",
        img: "/uploads/ai_rug_hand_knotted_luxury_v1.webp",
      },
      {
        step: "03",
        title: "Solar Washing & Curing",
        desc: "Textiles undergo traditional natural herb-infused washings, then sun-cure across open courtyards to lock in organic fiber luster and soft patina.",
        img: "/uploads/braided_rug_closeup-1790142830679.webp",
      },
      {
        step: "04",
        title: "Precision 3D Hand-Carving",
        desc: "Master artisans use specialized curved shearing scissors to sculpt tactile high-low bevels into the wool pile, creating three-dimensional luxury depth.",
        img: "/uploads/ai_rug_tufted_geometric_relief_v1.webp",
      },
    ],
  },
  disciplines: {
    tag: "TAILORED WEAVE MASTERY",
    title: "Our Four Weaving Disciplines",
    subtitle: "Each space commands a distinct texture. Explore the foundational loom techniques practiced in our Bhadohi atelier.",
    items: [
      {
        title: "Hand-Tufted 3D Sculpted",
        badge: "Signature Collection",
        desc: "Deep-pile architectural centerpieces sculpted by hand with New Zealand wool for unmatched underfoot plushness.",
        img: "/uploads/ai_rug_tufted_modern_minimalist_v1.webp",
        link: "/collections?category=Tufted",
      },
      {
        title: "Heritage Hand-Knotted",
        badge: "Heirloom Grade",
        desc: "Museum-quality generational carpets where every millimeter is hand-knotted to last across decades.",
        img: "/uploads/ai_rug_hand_knotted_luxury_v1.webp",
        link: "/collections?category=Hand-Knotted",
      },
      {
        title: "Artisanal Flatweave Dhurrie",
        badge: "Geometric Balance",
        desc: "Low-pile, reversible woven rugs engineered for heavy foot traffic, high durability, and effortless dining or living style.",
        img: "/uploads/ai_rug_flatweave_dhurrie_v1.webp",
        link: "/collections?category=Flatweave",
      },
      {
        title: "Natural Braided Golden Jute",
        badge: "Organic Sustainable",
        desc: "Earthy, eco-friendly sustainable fibers hand-braided and stitched into timeless rustic elegance.",
        img: "/uploads/ai_rug_artisan_jute_v1.webp",
        link: "/collections?category=Jute",
      },
    ],
  },
  promise: {
    tag: "TRANSPARENT PROVENANCE",
    title: "Direct from the Loom to Your Home",
    subtitle: "Why traditional luxury stores charge 5x-8x markup, and how NR Enterprises makes bespoke handcrafted carpets accessible.",
    retailPoints: [
      "500% to 800% importer, distributor & boutique retail markup",
      "Mass warehouse storage with months of aged inventory",
      "Unknown artisan origins with synthetic fiber blending",
    ],
    nrEnterprisesPoints: [
      "Direct weaver pricing with zero retail markups",
      "Handcrafted on-demand in Bhadohi, India with sustainable fibers",
      "100% certified fair wages and authentic craft preservation",
    ],
  },
  bespokeCta: {
    tag: "BESPOKE COMMISSION",
    title: "Commission a Sacred Piece for Your Home",
    description: "Have a custom dimensions requirement or bespoke color palette in mind? Our Bhadohi master artisans weave your personal design to life.",
    btnText: "Start Custom Sizing",
    btnLink: "/customize",
    whatsappText: "WhatsApp Concierge",
    whatsappNumber: "919151452441",
  },
};
