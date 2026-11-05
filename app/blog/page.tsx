"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBlogsFromSupabase, BlogPost } from "@/lib/blogsData";

export default function BlogIndexPage() {
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBlogsFromSupabase().then((blogs) => {
      setAllBlogs(blogs || []);
      setIsLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    allBlogs.forEach((b) => {
      if (b.category && b.category.trim()) set.add(b.category.trim());
    });
    return Array.from(set);
  }, [allBlogs]);

  const featuredBlog = useMemo(() => {
    return allBlogs.find((b) => b.isFeatured) || allBlogs[0];
  }, [allBlogs]);

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [allBlogs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#2B2520] pt-3 sm:pt-4 pb-20 sm:pb-28">
      {/* 🌟 HERO HEADER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#EAEAEB] text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-[#C19A6B] shadow-xs mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]" />
          NR Enterprises Journal & Perspectives
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-heading font-bold text-3xl sm:text-5xl md:text-6xl text-[#2B2520] tracking-tight leading-[1.12] mb-4"
        >
          Craft, Design & Conscious Living
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="font-body text-base sm:text-lg text-[#7A7065] max-w-2xl mx-auto leading-relaxed"
        >
          Curated stories on architectural interiors, organic fiber engineering, and four centuries of Bhadohi weaving heritage.
        </motion.p>
      </section>

      {/* 🌟 LOADING STATE SKELETON */}
      {isLoading && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-white rounded-3xl border border-[#EAEAEB]/70 h-80 sm:h-96 animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-heading uppercase tracking-widest text-[#7A7065] font-semibold">Loading Journal...</span>
            </div>
          </div>
        </section>
      )}

      {/* 🌟 EMPTY STATE */}
      {!isLoading && allBlogs.length === 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 my-12 text-center">
          <div className="bg-white rounded-3xl border border-[#EAEAEB] p-10 sm:p-16 shadow-xs">
            <div className="w-14 h-14 bg-[#FAFAFA] rounded-full mx-auto flex items-center justify-center text-2xl shadow-xs mb-4">
              📖
            </div>
            <h3 className="font-heading font-bold text-2xl text-[#2B2520] mb-2">Editorial Journal Updating</h3>
            <p className="font-body text-sm text-[#7A7065] leading-relaxed max-w-md mx-auto">
              New stories and craft perspectives from our Bhadohi atelier will appear here once published from the Admin Studio.
            </p>
          </div>
        </section>
      )}

      {/* 🌟 FEATURED STORY SPOTLIGHT */}
      {!isLoading && featuredBlog && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <Link
            href={`/blog/${featuredBlog.slug || featuredBlog.id}`}
            className="group block relative bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#EAEAEB]/70 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#2B2520]/5 hover:-translate-y-1"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
              {/* Framed Image Container */}
              <div className="relative lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] w-full rounded-2xl bg-[#EAEAEB] overflow-hidden flex items-center justify-center">
                <Image
                  src={featuredBlog.featuredImage || "https://qjpjltaiazwybhsmnkve.supabase.co/storage/v1/object/public/product-images/site-1788885350236-wdp51.webp"}
                  alt={featuredBlog.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Badges on Image */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="bg-[#2B2520] text-white font-heading text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-semibold shadow-sm">
                    ★ Featured Story
                  </span>
                  {featuredBlog.category && (
                    <span className="bg-white/90 backdrop-blur-sm text-[#2B2520] font-heading text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-semibold shadow-xs border border-[#EAEAEB]">
                      {featuredBlog.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Editorial Content */}
              <div className="lg:col-span-5 flex flex-col justify-between self-stretch py-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-[#7A7065] font-semibold mb-3">
                    <span>{featuredBlog.publishDate || "Latest Edition"}</span>
                    <span>•</span>
                    <span>{featuredBlog.readTime || "5 min read"}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-3xl font-heading font-bold text-[#2B2520] group-hover:text-[#C19A6B] transition-colors leading-snug mb-3">
                    {featuredBlog.title}
                  </h2>

                  <p className="font-body text-[#7A7065] text-sm lg:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 mb-6">
                    {featuredBlog.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAEAEB] flex items-center justify-between mt-auto">
                  <span className="text-xs text-[#7A7065] font-body italic">
                    By {typeof featuredBlog.author === "string" ? featuredBlog.author : featuredBlog.author?.name || "NR Enterprises Editorial"}
                  </span>

                  <span className="text-xs uppercase tracking-[0.15em] text-[#C19A6B] font-heading font-bold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    <span>Read Story</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 🌟 SEARCH & CATEGORY FILTERS */}
      {!isLoading && allBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#EAEAEB]">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-heading font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-[#2B2520] text-white shadow-sm"
                      : "bg-white text-[#7A7065] border border-[#EAEAEB] hover:border-[#2B2520] hover:text-[#2B2520]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search articles, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#EAEAEB] rounded-full px-4 py-2 pl-10 text-xs font-body focus:outline-none focus:border-[#C19A6B] transition-colors placeholder:text-[#A09384]"
              />
              <svg
                className="w-4 h-4 text-[#A09384] absolute left-3.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-xs text-[#A09384] hover:text-[#2B2520]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 🌟 BLOG CARDS GRID */}
      {!isLoading && allBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#EAEAEB]">
              <p className="font-heading font-semibold text-lg text-[#7A7065] mb-2">No articles found matching your filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-heading font-semibold uppercase tracking-wider text-[#C19A6B] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              <AnimatePresence>
                {filteredBlogs.map((blog, idx) => {
                  const author = typeof blog.author === "string" ? blog.author : blog.author?.name || "NR Enterprises Editorial";
                  const img = blog.featuredImage || "https://qjpjltaiazwybhsmnkve.supabase.co/storage/v1/object/public/product-images/site-1788885350236-wdp51.webp";
                  const linkHref = `/blog/${blog.slug || blog.id}`;

                  return (
                    <motion.article
                      key={blog.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
                      className="bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-[#2B2520]/5 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between rounded-3xl border border-[#EAEAEB]/70"
                    >
                      <div className="flex flex-col flex-grow">
                        {/* Image Container */}
                        <Link href={linkHref} className="block overflow-hidden relative mb-5 rounded-2xl bg-[#EAEAEB] aspect-[16/10] flex items-center justify-center">
                          <Image
                            src={img}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          {/* Category Pill */}
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-[#2B2520] font-heading text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold shadow-xs border border-[#EAEAEB]">
                              {blog.category || "Journal"}
                            </span>
                          </div>
                        </Link>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-[11px] font-heading font-semibold text-[#7A7065] uppercase tracking-wider mb-2">
                          <span>{blog.publishDate || "Latest Edition"}</span>
                          <span>•</span>
                          <span>{blog.readTime || "5 min read"}</span>
                        </div>

                        {/* Title */}
                        <Link href={linkHref} className="block mb-2">
                          <h3 className="text-lg sm:text-xl font-heading font-bold text-[#2B2520] group-hover:text-[#C19A6B] transition-colors leading-snug line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>

                        {/* Excerpt */}
                        <p className="font-body text-[#7A7065] text-xs sm:text-sm mb-5 leading-relaxed line-clamp-3">
                          {blog.excerpt}
                        </p>
                      </div>

                      {/* Bottom Action Link */}
                      <div className="pt-3 border-t border-[#EAEAEB] flex items-center justify-between mt-auto">
                        <span className="text-xs text-[#7A7065] font-body italic">
                          By {author}
                        </span>
                        <Link 
                          href={linkHref} 
                          className="text-xs uppercase tracking-[0.14em] text-[#C19A6B] font-heading font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          <span>Read Story</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {/* 🌟 BESPOKE CTA STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-[#2B2520] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border border-[#2B2520] shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[11px] font-heading uppercase tracking-[0.2em] text-[#C19A6B] font-semibold px-3 py-1 rounded-full border border-[#C19A6B]/30 inline-block mb-3">
              Crafted in Bhadohi, India
            </span>
            <h3 className="font-heading font-bold text-2xl sm:text-4xl text-white mb-3">
              Ready to Design Your Custom Heirloom?
            </h3>
            <p className="font-body text-sm sm:text-base text-[#FAFAFA]/80 leading-relaxed mb-6">
              Tailor dimensions to the half-foot, select your favorite silhouette, and preview dual-tone yarns in real-time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/customize"
                className="bg-[#C19A6B] text-white hover:bg-[#B89258] px-7 py-3 rounded-full text-xs font-heading uppercase tracking-wider font-semibold transition-colors shadow-sm"
              >
                Launch Custom Studio
              </Link>
              <Link
                href="/collections"
                className="bg-transparent text-white border border-white/40 hover:border-white px-7 py-3 rounded-full text-xs font-heading uppercase tracking-wider font-semibold transition-colors"
              >
                Explore In-Stock Rugs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
