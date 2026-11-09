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
    bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  },
  banner: {
    title: "Need Custom Architectural Dimensions?",
    description: "Every room has distinct proportions. Configure size, shape, and dual-tone cords through our bespoke studio.",
    ctaText: "Start Custom Order",
    ctaLink: "/customize",
  },
};
