"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogBySlugOrId, getRelatedBlogs, fetchBlogsFromSupabase, BlogPost } from "@/lib/blogsData";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBlogsFromSupabase().then((data) => {
      setBlogsList(data || []);
      setIsLoading(false);
    });
  }, []);

  const blog = getBlogBySlugOrId(resolvedParams.slug, blogsList);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center pt-32 pb-32 text-center">
        <div className="w-10 h-10 border-2 border-[#4A1017] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-heading uppercase tracking-widest text-[#5A4E42] font-semibold">Loading Journal Article...</p>
      </div>
    );
  }

  if (!blog) {
    notFound();
  }

  const relatedBlogs = getRelatedBlogs(blog.slug || blog.id, blogsList, 2);

  const authorName = typeof blog.author === "string" ? blog.author : blog.author?.name || "NR Enterprises Editorial";
  const authorRole = typeof blog.author === "object" ? blog.author?.role : "Atelier & Design Team";
  const featuredImg = blog.featuredImage || "https://qjpjltaiazwybhsmnkve.supabase.co/storage/v1/object/public/product-images/site-1788885350236-wdp51.webp";
  const category = blog.category || "Design & Styling";
  const readTime = blog.readTime || "5 min read";
  const publishDate = blog.publishDate || "Latest Edition";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <article className="min-h-screen bg-[#FAF8F5] text-[#2B070B] pt-3 sm:pt-4 pb-20 sm:pb-28">
      {/* 🌟 BREADCRUMB & HEADER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-[#8C6B38] font-medium mb-6">
          <Link href="/" className="hover:text-[#2B070B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#2B070B] transition-colors">
            Journal
          </Link>
          <span>/</span>
          <span className="text-[#8C6B38] truncate max-w-[200px] sm:max-w-xs">{category}</span>
        </nav>

        {/* Category & Read Time */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-heading uppercase tracking-wider text-[#5A4E42] font-semibold mb-4">
          <span className="px-3.5 py-1 rounded-none bg-[#FAF5EB] text-[#2B070B] border border-[#4A1017]/30 shadow-xs">
            {category}
          </span>
          <span>•</span>
          <span>{readTime}</span>
          <span>•</span>
          <span>{publishDate}</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-[#2B070B] tracking-tight leading-[1.15] mb-4">
          {blog.title}
        </h1>

        {blog.subtitle && (
          <p className="font-body text-base sm:text-lg text-[#5A4E42] leading-relaxed mb-6">
            {blog.subtitle}
          </p>
        )}

        {/* Author Byline & Share */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#4A1017]/15 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-[#2B070B] text-[#FAF5EB] border border-[#4A1017] flex items-center justify-center font-heading text-base font-bold shadow-xs">
              {authorName[0]}
            </div>
            <div>
              <p className="text-sm font-heading font-semibold text-[#2B070B]">{authorName}</p>
              <p className="text-xs font-body text-[#5A4E42]">{authorRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs font-heading font-semibold px-4 py-2 rounded-none border border-[#4A1017]/30 bg-white text-[#2B070B] hover:border-[#4A1017] hover:text-[#8C6B38] transition-colors shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? "Link Copied!" : "Share Story"}
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 HERO FEATURED IMAGE */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="relative h-72 sm:h-96 md:h-[480px] w-full rounded-none overflow-hidden border border-[#4A1017]/30 shadow-md">
          <Image
            src={featuredImg}
            alt={blog.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* 🌟 ARTICLE BODY */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Intro Excerpt Callout */}
        {blog.excerpt && (
          <div className="p-6 sm:p-7 bg-white rounded-none border border-[#4A1017]/25 mb-10 text-base sm:text-lg text-[#2B070B] font-body leading-relaxed shadow-xs">
            "{blog.excerpt}"
          </div>
        )}

        {/* 1. DIRECT AI & ADMIN RICH HTML CONTENT RENDERING */}
        {blog.contentHtml ? (
          <div
            className="blog-rich-content text-[#2B2520] leading-relaxed font-body text-base sm:text-lg space-y-6 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:text-[#2B2520] [&_h2]:pt-6 [&_h2]:pb-2 [&_h2]:font-bold [&_h3]:font-heading [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:text-[#C19A6B] [&_h3]:pt-4 [&_h3]:font-semibold [&_h4]:font-heading [&_h4]:text-lg [&_h4]:text-[#2B2520] [&_p]:leading-relaxed [&_blockquote]:my-6 [&_blockquote]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#C19A6B] [&_blockquote]:font-body [&_blockquote]:text-lg [&_blockquote]:sm:text-xl [&_blockquote]:text-[#2B2520] [&_blockquote]:italic [&_blockquote]:bg-white [&_blockquote]:py-4 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:shadow-xs [&_ul]:space-y-2 [&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:space-y-2 [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:text-base [&_li]:text-[#7A7065] [&_strong]:font-bold [&_strong]:text-[#2B2520] [&_b]:font-bold [&_b]:text-[#2B2520] [&_em]:italic [&_i]:italic [&_u]:underline [&_u]:decoration-[#C19A6B] [&_u]:underline-offset-4 [&_a]:text-[#C19A6B] [&_a]:underline [&_a]:font-medium [&_a:hover]:text-[#2B2520] [&_a]:transition-colors [&_img]:rounded-2xl [&_img]:my-8 [&_img]:w-full [&_img]:max-h-[500px] [&_img]:object-cover [&_img]:border [&_img]:border-[#EAEAEB] [&_img]:shadow-sm [&_hr]:my-10 [&_hr]:border-[#EAEAEB]"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />
        ) : blog.content ? (
          /* 2. PLAIN TEXT / PARAGRAPH RENDERING */
          <div className="space-y-6 text-[#2B2520] leading-relaxed font-body text-base sm:text-lg whitespace-pre-line">
            {blog.content}
          </div>
        ) : blog.sections && blog.sections.length > 0 ? (
          /* 3. STRUCTURED SECTIONS RENDERING */
          <div className="space-y-10 sm:space-y-12 text-[#2B2520] leading-relaxed font-body text-base sm:text-lg">
            {blog.sections.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                {sec.heading && (
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#2B2520] tracking-tight pt-4">
                    {sec.heading}
                  </h2>
                )}

                {sec.subheading && (
                  <h3 className="font-heading font-semibold text-lg sm:text-xl text-[#C19A6B]">
                    {sec.subheading}
                  </h3>
                )}

                <p className="leading-relaxed text-[#7A7065]">{sec.content}</p>

                {sec.quote && (
                  <blockquote className="my-6 pl-5 border-l-2 border-[#C19A6B] font-body text-lg sm:text-xl text-[#2B2520] italic bg-white py-4 rounded-r-2xl shadow-xs">
                    “{sec.quote}”
                  </blockquote>
                )}

                {sec.tip && (
                  <div className="my-6 p-5 rounded-2xl bg-white border border-[#EAEAEB] text-sm text-[#7A7065] shadow-xs">
                    <strong className="text-[#C19A6B] font-heading uppercase tracking-wider block mb-1 font-semibold">
                      💡 Artisan Pro-Tip
                    </strong>
                    {sec.tip}
                  </div>
                )}

                {sec.list && sec.list.length > 0 && (
                  <ul className="space-y-2 my-4 pl-2">
                    {sec.list.map((item, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2.5 text-base text-[#7A7065]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B] mt-2.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : null}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="pt-10 mt-12 border-t border-[#EAEAEB]">
            <h4 className="text-xs font-heading uppercase tracking-wider text-[#7A7065] font-semibold mb-3">
              Article Topics & Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-heading font-semibold bg-white text-[#2B2520] px-3.5 py-1.5 rounded-full border border-[#EAEAEB] shadow-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Curated Products Mentioned */}
        {blog.relatedProducts && blog.relatedProducts.length > 0 && (
          <div className="my-12 p-6 sm:p-8 bg-white rounded-none border border-[#4A1017]/25 shadow-sm">
            <span className="text-[10px] font-heading uppercase tracking-widest text-[#8C6B38] px-3 py-1 rounded-none bg-[#FAF5EB] inline-block mb-2 font-semibold border border-[#4A1017]/30">
              Curated from this story
            </span>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#2B070B] mb-4">
              Explore Rugs Inspired by This Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blog.relatedProducts.map((prod, pIdx) => (
                <Link
                  key={pIdx}
                  href={prod.link}
                  className="group flex items-center justify-between p-4 bg-[#FAF8F5] rounded-none border border-[#4A1017]/20 hover:border-[#4A1017] transition-all"
                >
                  <div>
                    <p className="text-sm font-heading font-semibold text-[#2B070B] group-hover:text-[#8C6B38] transition-colors">
                      {prod.title}
                    </p>
                    <span className="text-xs font-body text-[#5A4E42]">{prod.tag}</span>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#8C6B38] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🌟 RELATED ARTICLES */}
      {relatedBlogs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-[#4A1017]/15">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-heading uppercase tracking-wider text-[#8C6B38] font-semibold">
                More from Journal
              </span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#2B070B]">
                Recommended Reading
              </h3>
            </div>
            <Link
              href="/blog"
              className="text-xs font-heading font-semibold text-[#8C6B38] hover:text-[#2B070B] hover:underline uppercase tracking-wider"
            >
              View All Articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {relatedBlogs.map((rel) => {
              const relImg = rel.featuredImage || "https://qjpjltaiazwybhsmnkve.supabase.co/storage/v1/object/public/product-images/site-1788885350236-wdp51.webp";
              return (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug || rel.id}`}
                  className="bg-white p-5 sm:p-6 shadow-sm hover:shadow-[0_22px_45px_rgba(74,16,23,0.38)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between rounded-none border border-[#4A1017]/20"
                >
                  <div className="flex flex-col flex-grow">
                    <div className="overflow-hidden relative mb-5 rounded-none bg-[#EAEAEB] aspect-[16/10] flex items-center justify-center border border-[#4A1017]/15">
                      <Image
                        src={relImg}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#2B070B]/90 backdrop-blur-sm text-[#FAF5EB] font-heading text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-none font-semibold shadow-xs border border-[#4A1017]">
                          {rel.category || "Journal"}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-heading uppercase tracking-wider text-[#8C6B38] font-semibold mb-2 block">
                      {rel.readTime || "5 min read"} • {rel.publishDate || "Latest Edition"}
                    </span>
                    <h4 className="text-lg sm:text-xl font-heading font-bold text-[#2B070B] group-hover:text-[#8C6B38] transition-colors leading-snug mb-2 line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="font-body text-[#5A4E42] text-xs sm:text-sm mb-5 leading-relaxed line-clamp-3">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#4A1017]/15 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[#8C6B38] font-heading font-bold">
                    <span>Read Story</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
