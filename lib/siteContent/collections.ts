/**
 * 🌟 NR Enterprises Collections Catalog Content Configuration
 * 
 * Aap is file ke andar kisi bhi text, heading, tag, description, ya hero background image URL
 * ko direct change kar sakte hain. AI ko direct yeh file dekar bhi modify karwa sakte hain.
 * Change karne ke baad Admin Panel (/admin/content) me jaakar
 * "⚡ Publish Codebase Text" par click karein to yeh live Supabase par publish ho jayega.
 */

export const collectionsContent = {
  hero: {
    tag: "THE PREMIUM NR ENTERPRISES PRODUCTS",
    title: "Artisanal Floor Sculptures",
    description: "Browse our hand-braided rPET area rugs, runners, and custom silhouettes. 100% reversible, stain-resistant, and woven for mindful living.",
    bgImage: "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev/image-d3001c-is-high-quality-logo-ko-business-card-mockup-par-l-1792210320018.webp",
  },
  banner: {
    title: "Need Custom Architectural Dimensions?",
    description: "Every room has distinct proportions. Configure size, shape, and dual-tone cords through our bespoke studio.",
    ctaText: "Start Custom Order",
    ctaLink: "/customize",
  },
};
