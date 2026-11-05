// ==============================================================================
// 🌟 NR ENTERPRISES BLOGS DATABASE (EASY AI COPY-PASTE FORMAT)
// ==============================================================================
// 💡 HOW TO ADD A NEW BLOG WITH AI (ChatGPT, Claude, Gemini):
//
// 1. Copy the prompt below and send it to AI:
//
//    "Write an informative, luxury-toned blog post for NR Enterprises (a luxury hand-braided
//     rug brand from Bhadohi, India) about [YOUR TOPIC HERE].
//     Give me the output strictly in this TypeScript object format ready to paste:
//     {
//       id: [NEXT_ID_NUMBER],
//       slug: 'url-friendly-slug',
//       title: 'Catchy & Luxury Blog Title',
//       subtitle: 'Engaging subtitle explaining the key takeaway',
//       excerpt: '2-3 sentences summary of the article',
//       category: 'Design & Styling', // or 'Rug Care', 'Material Science', 'Artisan Heritage', 'Guides'
//       readTime: '5 min read',
//       publishDate: 'September 10, 2026',
//       author: 'Sahil Shahim',
//       featuredImage: 'https://images.unsplash.com/... or supabase image url',
//       tags: ['Rug Design', 'Japandi', 'Home Decor'],
//       contentHtml: \`
//         <h2>1. Heading Here</h2>
//         <p>Your paragraph text here...</p>
//         <blockquote>A memorable quote or design philosophy callout.</blockquote>
//         <h2>2. Next Heading</h2>
//         <p>More details...</p>
//         <ul>
//           <li>Key tip 1</li>
//           <li>Key tip 2</li>
//         </ul>
//       \`
//     }"
//
// 2. Paste the AI output into the `blogsData` array below with the next id (e.g. id: 1, id: 2, id: 3, id: 4...).
// 3. That's it! Your blog is instantly live at /blog and /blog/[slug] or /blog/[id]!
// ==============================================================================

export interface BlogSection {
  heading?: string;
  subheading?: string;
  content: string;
  quote?: string;
  tip?: string;
  list?: string[];
  imageUrl?: string;
  imageCaption?: string;
}

export interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  category?: string;
  readTime?: string;
  publishDate?: string;
  author?:
    | string
    | {
        name: string;
        role?: string;
        avatar?: string;
      };
  featuredImage?: string;
  isFeatured?: boolean;
  tags?: string[];
  contentHtml?: string;
  content?: string;
  sections?: BlogSection[];
  relatedProducts?: {
    title: string;
    link: string;
    tag: string;
  }[];
}

export const blogsData: BlogPost[] = [];

// ==============================================================================
// 🌟 SUPABASE DYNAMIC HELPERS
// ==============================================================================

import { supabase } from "./supabase";

export async function fetchBlogsFromSupabase(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "blogs_list")
      .maybeSingle();

    if (error) {
      console.warn("Error fetching blogs from Supabase:", error.message);
      return [];
    }

    if (data?.data?.blogs && Array.isArray(data.data.blogs)) {
      return data.data.blogs;
    }

    return [];
  } catch (err) {
    console.warn("Exception fetching blogs:", err);
    return [];
  }
}

export async function saveBlogsToSupabase(blogs: BlogPost[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("site_content").upsert({
      id: "blogs_list",
      data: { blogs },
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error saving blogs to Supabase:", err);
    return { success: false, error: err.message || "Failed to save blogs" };
  }
}

// ==============================================================================
// 🌟 SYNCHRONOUS FALLBACK HELPER FUNCTIONS
// ==============================================================================

export function getAllBlogs(sourceList: BlogPost[] = blogsData): BlogPost[] {
  return sourceList;
}

export function getBlogBySlugOrId(param: string, sourceList: BlogPost[] = blogsData): BlogPost | undefined {
  if (!param) return undefined;
  const cleanParam = param.trim().toLowerCase();
  return sourceList.find((b) => {
    const matchesSlug = b.slug?.toLowerCase() === cleanParam;
    const matchesId = b.id?.toString().toLowerCase() === cleanParam;
    return matchesSlug || matchesId;
  });
}

// Backwards-compatible alias
export function getBlogBySlug(slug: string, sourceList: BlogPost[] = blogsData): BlogPost | undefined {
  return getBlogBySlugOrId(slug, sourceList);
}

export function getRelatedBlogs(currentIdentifier: string | number, sourceList: BlogPost[] = blogsData, limit = 3): BlogPost[] {
  if (!currentIdentifier) return sourceList.slice(0, limit);
  const currentStr = currentIdentifier.toString().toLowerCase();
  return sourceList
    .filter((b) => b.slug?.toLowerCase() !== currentStr && b.id?.toString() !== currentStr)
    .slice(0, limit);
}
