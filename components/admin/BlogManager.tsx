"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { compressAndConvertToWebP } from "@/lib/compressImage";
import { deleteStorageImage } from "@/lib/deleteStorageImage";
import {
  BlogPost,
  fetchBlogsFromSupabase,
  saveBlogsToSupabase,
  getAllBlogs,
} from "@/lib/blogsData";

interface BlogManagerProps {
  onClose?: () => void;
}

const DEFAULT_CATEGORIES = [
  "Design & Styling",
  "Material Science",
  "Artisan Heritage",
  "Care & Longevity",
  "Guides & Tutorials",
  "Home Decor & Living",
  "Bespoke & Custom",
];

const COLOR_PRESETS = [
  { label: "Deep Charcoal", color: "#1E1B18" },
  { label: "Warm Gold", color: "#C19A6B" },
  { label: "Bronze Ochre", color: "#8C7A63" },
  { label: "Terracotta", color: "#C05621" },
  { label: "Forest Olive", color: "#2D5A27" },
];

export default function BlogManager({ onClose }: BlogManagerProps) {
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedBlogId, setSelectedBlogId] = useState<string | number>("");
  const [viewMode, setViewMode] = useState<"wordpad" | "preview" | "code">("wordpad");

  // Custom Modal States for Link & Image insertion
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const savedSelectionRef = useRef<Range | null>(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState("");
  const [inlineImageCaption, setInlineImageCaption] = useState("");
  const [isUploadingInlineImg, setIsUploadingInlineImg] = useState(false);

  // Form State
  const initialForm = {
    title: "",
    slug: "",
    subtitle: "",
    excerpt: "",
    category: "Design & Styling",
    customCategory: "",
    readTime: "5 min read",
    publishDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    authorName: "Sahil Shahim",
    authorRole: "Head of Design, NR Enterprises",
    featuredImage: "",
    isFeatured: false,
    tags: "Japandi, Hand-Braided, Living Room",
    contentHtml: `<h2>1. The Art of Mindful Design</h2>
<p>Start writing your luxury article here directly like Microsoft Word or WordPad. Select any text and click the buttons above to format it visually!</p>

<blockquote>True luxury is felt beneath the feet before it is processed by the eye. Natural textures ground the home in tranquility.</blockquote>

<h2>2. Key Styling Secrets</h2>
<p>You can add bullet points, subheadings, clickable links, and in-article images directly without seeing any code tags.</p>

<ul>
  <li><strong>First Tip:</strong> Choose warm natural tones that complement your floor geometry.</li>
  <li><strong>Second Tip:</strong> Pair chunky braided ropes with soft linen curtains.</li>
</ul>`,
  };

  const [formData, setFormData] = useState(initialForm);
  const [pastedCodeInput, setPastedCodeInput] = useState("");
  const [isUploadingCoverImg, setIsUploadingCoverImg] = useState(false);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Load existing blogs on mount
  useEffect(() => {
    fetchBlogsFromSupabase().then((data) => {
      setBlogsList(data || []);
      setIsLoading(false);
    });
  }, []);

  // When switching to WordPad view or loading a blog, sync DOM contentEditable
  useEffect(() => {
    if (viewMode === "wordpad" && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== formData.contentHtml) {
        visualEditorRef.current.innerHTML = formData.contentHtml || "";
      }
    }
  }, [viewMode, formData.contentHtml, selectedBlogId, mode]);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const generateSlug = (titleText: string) => {
    return titleText
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (newTitle: string) => {
    if (mode === "create") {
      setFormData((prev) => ({
        ...prev,
        title: newTitle,
        slug: generateSlug(newTitle),
      }));
    } else {
      setFormData((prev) => ({ ...prev, title: newTitle }));
    }
  };

  // 🌟 Load blog in Edit mode
  const handleSelectBlogToEdit = (id: string | number) => {
    setSelectedBlogId(id);
    if (!id) {
      resetForm();
      return;
    }

    const blog = blogsList.find((b) => b.id.toString() === id.toString());
    if (blog) {
      const isCustomCat = !DEFAULT_CATEGORIES.includes(blog.category || "");
      const authorName = typeof blog.author === "string" ? blog.author : blog.author?.name || "Sahil Shahim";
      const authorRole = typeof blog.author === "object" ? blog.author?.role || "" : "Head of Design, NR Enterprises";
      const blogContent = blog.contentHtml || blog.content || "";

      const loadedForm = {
        title: blog.title || "",
        slug: blog.slug || "",
        subtitle: blog.subtitle || "",
        excerpt: blog.excerpt || "",
        category: isCustomCat ? "Custom" : blog.category || DEFAULT_CATEGORIES[0],
        customCategory: isCustomCat ? blog.category || "" : "",
        readTime: blog.readTime || "5 min read",
        publishDate: blog.publishDate || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        authorName,
        authorRole,
        featuredImage: blog.featuredImage || "",
        isFeatured: Boolean(blog.isFeatured),
        tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : typeof blog.tags === "string" ? blog.tags : "",
        contentHtml: blogContent,
      };

      setFormData(loadedForm);
      setPastedCodeInput(JSON.stringify(blog, null, 2));

      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = blogContent;
      }
      setMode("edit");
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setPastedCodeInput("");
    setSelectedBlogId("");
    setMode("create");
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = initialForm.contentHtml;
    }
  };

  // Sync contentEditable changes
  const handleEditorInput = () => {
    if (visualEditorRef.current) {
      const currentHtml = visualEditorRef.current.innerHTML;
      setFormData((prev) => ({
        ...prev,
        contentHtml: currentHtml,
      }));
    }
  };

  // 🌟 Smart Parser: Parses JS/TS object ({ id: 1, title: '...', contentHtml: `...` }), JSON, or raw HTML
  const parseAndLoadPastedCode = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      alert("Please paste your blog code first.");
      return;
    }

    try {
      let parsedObj: any = null;

      // 1. Try parsing JSON directly
      try {
        parsedObj = JSON.parse(trimmed);
      } catch (e) {}

      // 2. Try safe JS Object evaluator for TS/JS object syntax e.g. { id: 1, title: '...', contentHtml: `...` }
      if (!parsedObj) {
        try {
          let cleanJs = trimmed;
          if (cleanJs.includes("=")) {
            cleanJs = cleanJs.substring(cleanJs.indexOf("=") + 1).trim();
          }
          if (cleanJs.endsWith(";")) {
            cleanJs = cleanJs.slice(0, -1).trim();
          }
          if (cleanJs.startsWith("[") && cleanJs.endsWith("]")) {
            const arr = new Function(`return ${cleanJs}`)();
            if (Array.isArray(arr) && arr.length > 0) parsedObj = arr[0];
          } else if (cleanJs.startsWith("{") && cleanJs.endsWith("}")) {
            parsedObj = new Function(`return (${cleanJs})`)();
          }
        } catch (e) {}
      }

      // 3. Fallback to resilient RegEx extraction
      if (!parsedObj) {
        const extracted: any = {};
        const titleMatch = trimmed.match(/title\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (titleMatch) extracted.title = titleMatch[1].trim();

        const slugMatch = trimmed.match(/slug\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (slugMatch) extracted.slug = slugMatch[1].trim();

        const subMatch = trimmed.match(/subtitle\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (subMatch) extracted.subtitle = subMatch[1].trim();

        const excerptMatch = trimmed.match(/excerpt\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (excerptMatch) extracted.excerpt = excerptMatch[1].trim();

        const catMatch = trimmed.match(/category\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (catMatch) extracted.category = catMatch[1].trim();

        const readMatch = trimmed.match(/readTime\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (readMatch) extracted.readTime = readMatch[1].trim();

        const dateMatch = trimmed.match(/publishDate\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (dateMatch) extracted.publishDate = dateMatch[1].trim();

        const imgMatch = trimmed.match(/featuredImage\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (imgMatch) extracted.featuredImage = imgMatch[1].trim();

        const authorNameMatch = trimmed.match(/name\s*:\s*[`'"]([\s\S]*?)[`'"]/i) || trimmed.match(/author\s*:\s*[`'"]([\s\S]*?)[`'"],?/i);
        if (authorNameMatch) extracted.authorName = authorNameMatch[1].trim();

        const contentHtmlMatch = trimmed.match(/contentHtml\s*:\s*`([\s\S]*?)`/i) || trimmed.match(/contentHtml\s*:\s*['"]([\s\S]*?)['"],?/i) || trimmed.match(/content\s*:\s*`([\s\S]*?)`/i);
        if (contentHtmlMatch) extracted.contentHtml = contentHtmlMatch[1].trim();

        const tagsMatch = trimmed.match(/tags\s*:\s*\[([\s\S]*?)\]/i);
        if (tagsMatch) {
          extracted.tags = tagsMatch[1].split(",").map((t: string) => t.replace(/['"`\s]/g, "")).filter(Boolean).join(", ");
        }

        if (extracted.title || extracted.contentHtml || extracted.slug) {
          parsedObj = extracted;
        }
      }

      // If it's pure HTML (e.g. <h2>...</h2>)
      if (!parsedObj && trimmed.includes("<") && trimmed.includes(">")) {
        parsedObj = { contentHtml: trimmed };
      }

      if (parsedObj && typeof parsedObj === "object") {
        const isCustomCat = parsedObj.category && !DEFAULT_CATEGORIES.includes(parsedObj.category);
        const authorName = typeof parsedObj.author === "string" ? parsedObj.author : parsedObj.author?.name || parsedObj.authorName || formData.authorName;
        const authorRole = typeof parsedObj.author === "object" ? parsedObj.author?.role || "" : parsedObj.authorRole || formData.authorRole;
        const content = parsedObj.contentHtml || parsedObj.content || formData.contentHtml;
        const title = parsedObj.title || formData.title;
        const slug = parsedObj.slug || (title ? generateSlug(title) : formData.slug);
        const tags = Array.isArray(parsedObj.tags) ? parsedObj.tags.join(", ") : typeof parsedObj.tags === "string" ? parsedObj.tags : formData.tags;

        const updated = {
          title,
          slug,
          subtitle: parsedObj.subtitle || formData.subtitle,
          excerpt: parsedObj.excerpt || formData.excerpt,
          category: isCustomCat ? "Custom" : parsedObj.category || formData.category,
          customCategory: isCustomCat ? parsedObj.category : "",
          readTime: parsedObj.readTime || formData.readTime,
          publishDate: parsedObj.publishDate || formData.publishDate,
          authorName,
          authorRole,
          featuredImage: parsedObj.featuredImage || formData.featuredImage,
          isFeatured: Boolean(parsedObj.isFeatured),
          tags,
          contentHtml: content,
        };

        setFormData(updated);

        if (visualEditorRef.current) {
          visualEditorRef.current.innerHTML = content;
        }

        // Switch to WordPad visual mode
        setViewMode("wordpad");
        showNotification("✨ Code parsed successfully & loaded into WordPad Visual Editor!");
      } else {
        alert("Could not parse the pasted code. Please check that it contains valid blog properties or HTML.");
      }
    } catch (err: any) {
      alert("Error parsing blog code: " + err.message);
    }
  };

  // 🌟 WYSIWYG Formatting Commands (WordPad style)
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const formatBlock = (tagName: string) => {
    execCmd("formatBlock", `<${tagName}>`);
  };

  const saveSelection = () => {
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        setLinkText(sel.toString() || "");
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window !== "undefined" && savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  // 🌟 Open Link Modal
  const openLinkModal = () => {
    saveSelection();
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    restoreSelection();
    if (!linkUrl || linkUrl === "https://") {
      setShowLinkModal(false);
      return;
    }

    if (savedSelectionRef.current && (!savedSelectionRef.current.toString() || linkText)) {
      const textToUse = linkText || linkUrl;
      const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-[#C19A6B] underline font-medium hover:text-[#3A332C] transition-colors">${textToUse}</a>`;
      execCmd("insertHTML", html);
    } else {
      execCmd("createLink", linkUrl);
    }

    setShowLinkModal(false);
    setLinkUrl("https://");
    setLinkText("");
  };

  // 🌟 Open Image Modal
  const openImageModal = () => {
    saveSelection();
    setShowImageModal(true);
  };

  const handleInlineImageUpload = async (file: File) => {
    setIsUploadingInlineImg(true);
    try {
      const compressed = await compressAndConvertToWebP(file);
      const fileName = `blog-inline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(fileName, compressed, {
          contentType: "image/webp",
          cacheControl: "31536000",
        });

      if (uploadErr) throw uploadErr;

      const { data: publicData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setInlineImageUrl(publicData.publicUrl);
      showNotification("Image optimized to WebP and uploaded!");
    } catch (err: any) {
      showNotification("Failed to upload image: " + err.message, "error");
    } finally {
      setIsUploadingInlineImg(false);
    }
  };

  const handleApplyInlineImage = () => {
    restoreSelection();
    if (!inlineImageUrl) {
      setShowImageModal(false);
      return;
    }

    const captionHtml = inlineImageCaption
      ? `<figcaption class="text-xs text-center text-[#8C7A63] mt-2 italic font-serif">${inlineImageCaption}</figcaption>`
      : "";

    const figureHtml = `<figure class="my-8 block text-center"><img src="${inlineImageUrl}" alt="${inlineImageCaption || 'NR Enterprises Story Image'}" class="rounded-2xl mx-auto w-full max-h-[480px] object-cover border border-[#DFD8CC] shadow-sm" />${captionHtml}</figure><p><br/></p>`;

    execCmd("insertHTML", figureHtml);
    setShowImageModal(false);
    setInlineImageUrl("");
    setInlineImageCaption("");
  };

  const handleInsertQuote = () => {
    const html = `<blockquote class="my-6 pl-5 border-l-4 border-[#C19A6B] font-serif text-lg sm:text-xl text-[#1E1B18] italic bg-[#FAF5EE] py-4 pr-4 rounded-r-xl">“Type memorable design quote here...”</blockquote><p><br/></p>`;
    execCmd("insertHTML", html);
  };

  const handleInsertTip = () => {
    const html = `<div class="my-6 p-4 rounded-xl bg-[#EFE8DD] border border-[#DCD0C0] text-sm text-[#4A433E]"><strong class="text-[#7C6347] font-mono uppercase tracking-wider block mb-1">💡 Artisan Pro-Tip</strong>Add practical rug care or styling guidance here.</div><p><br/></p>`;
    execCmd("insertHTML", html);
  };

  // 🌟 Featured Cover Image Upload
  const handleFeaturedImageUpload = async (file: File) => {
    setIsUploadingCoverImg(true);
    try {
      const compressed = await compressAndConvertToWebP(file);

      // Delete old cover image if it exists
      if (formData.featuredImage) {
        await deleteStorageImage(formData.featuredImage);
      }

      let uploadedUrl: string | null = null;
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", compressed);
        if (formData.featuredImage) {
          uploadFormData.append("oldUrl", formData.featuredImage);
        }
        const res = await fetch("/api/r2-upload", {
          method: "POST",
          body: uploadFormData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          uploadedUrl = data.url;
        }
      } catch (r2Err) {
        console.warn("R2 upload error, falling back to Supabase:", r2Err);
      }

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, featuredImage: uploadedUrl }));
      } else {
        // Fallback to Supabase
        const fileName = `blog-cover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(fileName, compressed, {
            contentType: "image/webp",
            cacheControl: "31536000",
          });
        if (uploadErr) throw uploadErr;
        const { data: publicData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        setFormData((prev) => ({ ...prev, featuredImage: publicData.publicUrl }));
      }

      showNotification("Featured cover image uploaded & optimized to WebP!");
    } catch (err: any) {
      showNotification("Cover image upload failed: " + err.message, "error");
    } finally {
      setIsUploadingCoverImg(false);
    }
  };

  // 🌟 Save / Publish Blog
  const handleSaveBlog = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a Blog Title.");
      return;
    }
    if (!formData.slug.trim()) {
      alert("Please enter a URL Slug.");
      return;
    }

    const currentContent = visualEditorRef.current?.innerHTML || formData.contentHtml;
    if (!currentContent.trim() || currentContent === "<p><br></p>") {
      alert("Please write some article content in the editor.");
      return;
    }

    setIsSaving(true);

    try {
      const finalCategory =
        formData.category === "Custom"
          ? formData.customCategory.trim() || "Journal"
          : formData.category;

      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const targetId =
        mode === "edit" && selectedBlogId
          ? selectedBlogId
          : Date.now();

      const newBlogPost: BlogPost = {
        id: targetId,
        slug: formData.slug.trim().toLowerCase(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        excerpt: formData.excerpt.trim(),
        category: finalCategory,
        readTime: formData.readTime.trim() || "5 min read",
        publishDate: formData.publishDate.trim(),
        author: {
          name: formData.authorName.trim() || "Sahil Shahim",
          role: formData.authorRole.trim() || "Head of Design, NR Enterprises",
        },
        featuredImage:
          formData.featuredImage.trim() ||
          "https://qjpjltaiazwybhsmnkve.supabase.co/storage/v1/object/public/product-images/site-1788885350236-wdp51.webp",
        isFeatured: Boolean(formData.isFeatured),
        tags: tagsArray,
        contentHtml: currentContent,
      };

      let updatedList: BlogPost[] = [];

      if (mode === "create") {
        if (newBlogPost.isFeatured) {
          updatedList = [newBlogPost, ...blogsList.map((b) => ({ ...b, isFeatured: false }))];
        } else {
          updatedList = [newBlogPost, ...blogsList];
        }
      } else {
        updatedList = blogsList.map((b) => {
          if (b.id.toString() === targetId.toString() || b.slug === newBlogPost.slug) {
            return newBlogPost;
          }
          if (newBlogPost.isFeatured) {
            return { ...b, isFeatured: false };
          }
          return b;
        });
      }

      const res = await saveBlogsToSupabase(updatedList);
      if (!res.success) throw new Error(res.error);

      setBlogsList(updatedList);
      showNotification(`Article "${newBlogPost.title}" saved & published successfully!`);

      if (mode === "create") {
        setSelectedBlogId(newBlogPost.id);
        setMode("edit");
      }
    } catch (err: any) {
      showNotification("Failed to save article: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 🌟 Delete Blog
  const handleDeleteBlog = async () => {
    if (!selectedBlogId) return;
    const blog = blogsList.find((b) => b.id.toString() === selectedBlogId.toString());
    if (!blog) return;

    if (!confirm(`Are you sure you want to permanently delete "${blog.title}"?`)) {
      return;
    }

    setIsSaving(true);
    try {
      if (blog.featuredImage) {
        await deleteStorageImage(blog.featuredImage);
      }

      const updated = blogsList.filter((b) => b.id.toString() !== selectedBlogId.toString());
      const res = await saveBlogsToSupabase(updated);
      if (!res.success) throw new Error(res.error);

      setBlogsList(updated);
      showNotification(`Article and cover image deleted successfully.`);
      resetForm();
    } catch (err: any) {
      showNotification("Error deleting article: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] border-2 border-[#C19A6B]/50 rounded-sm shadow-md p-6 sm:p-8 mb-12 relative">
      {/* 🌟 HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DFD8CC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C19A6B] font-bold">
              Editorial Studio
            </span>
            <span className="bg-[#EAEAEB] text-[#3A332C] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {blogsList.length} Articles Live
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#3A332C] font-medium">
            Visual Blog & Journal Editor
          </h2>
          <p className="text-xs text-[#7A7065] mt-1 font-light">
            Write naturally like MS Word / WordPad, or paste full AI code <code className="text-[#C19A6B] font-mono">&#123; id: 1, title: '...', contentHtml: ... &#125;</code> to auto-import!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="text-xs text-[#C19A6B] hover:text-[#3A332C] font-semibold uppercase tracking-wider underline flex items-center gap-1"
          >
            <span>View Live Journal</span>
            <span>↗</span>
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#7A7065] hover:text-[#3A332C] font-bold uppercase tracking-wider px-3 py-1.5 border border-[#DFD8CC] rounded-sm hover:bg-white transition-colors"
            >
              Close ✕
            </button>
          )}
        </div>
      </div>

      {/* 🌟 STATUS NOTIFICATION */}
      {statusMessage && (
        <div
          className={`my-4 p-3.5 rounded-sm text-xs font-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🌟 MODE SWITCHER & ARTICLE SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-6 p-4 bg-white border border-[#DFD8CC] rounded-sm shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className={`px-4 py-2 text-xs uppercase font-bold tracking-wider rounded-sm transition-colors ${
              mode === "create"
                ? "bg-[#3A332C] text-white shadow-sm"
                : "bg-[#F5F5F7] text-[#7A7065] hover:text-[#3A332C] border border-[#DFD8CC]"
            }`}
          >
            + Write New Article
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("edit");
              if (blogsList.length > 0 && !selectedBlogId) {
                handleSelectBlogToEdit(blogsList[0].id);
              }
            }}
            className={`px-4 py-2 text-xs uppercase font-bold tracking-wider rounded-sm transition-colors ${
              mode === "edit"
                ? "bg-[#3A332C] text-white shadow-sm"
                : "bg-[#F5F5F7] text-[#7A7065] hover:text-[#3A332C] border border-[#DFD8CC]"
            }`}
          >
            ✏️ Edit Existing ({blogsList.length})
          </button>
        </div>

        {mode === "edit" && (
          <div className="flex-1 md:max-w-md">
            <select
              value={selectedBlogId}
              onChange={(e) => handleSelectBlogToEdit(e.target.value)}
              className="w-full bg-[#F5F5F7] border border-[#DFD8CC] text-[#3A332C] text-xs font-medium py-2.5 px-3 rounded-sm focus:outline-none focus:border-[#C19A6B]"
            >
              <option value="">-- Choose Article to Edit --</option>
              {blogsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.isFeatured ? "★ [SPOTLIGHT] " : ""}{b.title} ({b.category || "Journal"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🌟 MAIN EDITOR FORM */}
      <div className="space-y-6">
        {/* ROW 1: Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#3A332C] mb-1.5">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. The Art of Japandi: How Natural Textures Transform Modern Spaces"
              className="w-full border border-[#DFD8CC] p-3 text-sm font-serif text-[#3A332C] bg-white focus:outline-none focus:border-[#C19A6B] rounded-sm"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#3A332C] mb-1.5">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. the-art-of-japandi-rugs"
              className="w-full border border-[#DFD8CC] p-3 text-xs font-mono text-[#3A332C] bg-white focus:outline-none focus:border-[#C19A6B] rounded-sm"
            />
            <p className="text-[10px] text-[#8C7A63] mt-1 font-mono">Live at: /blog/{formData.slug || "slug"}</p>
          </div>
        </div>

        {/* ROW 2: Subtitle & Excerpt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#3A332C] mb-1.5">
              Subtitle (Tagline / Catchy hook)
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. A masterclass in blending Japanese minimalism with Scandinavian warmth."
              className="w-full border border-[#DFD8CC] p-3 text-xs text-[#3A332C] bg-white focus:outline-none focus:border-[#C19A6B] rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#3A332C] mb-1.5">
              Excerpt / Card Summary (2-3 sentences)
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Short overview shown on the blog cards and hero banner..."
              className="w-full border border-[#DFD8CC] p-3 text-xs text-[#3A332C] bg-white focus:outline-none focus:border-[#C19A6B] rounded-sm"
            />
          </div>
        </div>

        {/* ROW 3: Category, Read Time, Publish Date, Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white border border-[#DFD8CC] rounded-sm">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8C7A63] mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-[#DFD8CC] p-2 text-xs bg-[#F5F5F7] text-[#3A332C] rounded-sm focus:outline-none focus:border-[#C19A6B]"
            >
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Custom">+ Custom Category</option>
            </select>
            {formData.category === "Custom" && (
              <input
                type="text"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                placeholder="Type custom category name"
                className="w-full mt-2 border border-[#DFD8CC] p-2 text-xs bg-white text-[#3A332C] rounded-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8C7A63] mb-1">
              Read Time
            </label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              placeholder="e.g. 5 min read"
              className="w-full border border-[#DFD8CC] p-2 text-xs bg-white text-[#3A332C] rounded-sm focus:outline-none focus:border-[#C19A6B]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8C7A63] mb-1">
              Publish Date
            </label>
            <input
              type="text"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              placeholder="e.g. September 17, 2026"
              className="w-full border border-[#DFD8CC] p-2 text-xs bg-white text-[#3A332C] rounded-sm focus:outline-none focus:border-[#C19A6B]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#8C7A63] mb-1">
              Author Name & Role
            </label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="e.g. Sahil Shahim"
              className="w-full border border-[#DFD8CC] p-2 text-xs bg-white text-[#3A332C] rounded-sm focus:outline-none focus:border-[#C19A6B] mb-1.5"
            />
            <input
              type="text"
              value={formData.authorRole}
              onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
              placeholder="e.g. Head of Design, NR Enterprises"
              className="w-full border border-[#DFD8CC] p-2 text-[11px] bg-[#F5F5F7] text-[#7A7065] rounded-sm focus:outline-none focus:border-[#C19A6B]"
            />
          </div>
        </div>

        {/* ROW 4: Featured Cover Image & Spotlight Toggle */}
        <div className="p-4 bg-white border border-[#DFD8CC] rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEB] pb-3">
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-bold text-[#3A332C]">
                Featured Cover Image
              </span>
              <p className="text-[11px] text-[#7A7065]">
                Primary header cover image for the article and listing card.
              </p>
            </div>

            {/* Spotlight Hero Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F5F5F7] px-3.5 py-2 rounded-sm border border-[#DFD8CC] hover:border-[#C19A6B] select-none">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#C19A6B] cursor-pointer"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A332C]">
                ★ Spotlight Hero Story on /blog
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-24 h-24 bg-[#EAEAEB] border border-[#DFD8CC] rounded-sm overflow-hidden flex-shrink-0 relative group">
              {formData.featuredImage ? (
                <img
                  src={formData.featuredImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C7A63] uppercase font-semibold text-center p-1">
                  No Cover Image
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <label className="bg-[#3A332C] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C19A6B] transition-colors cursor-pointer shadow-sm">
                  {isUploadingCoverImg ? "Optimizing WebP..." : "Upload Cover Image"}
                  <input
                    type="file"
                    accept="image/*,.webp,.avif"
                    className="hidden"
                    disabled={isUploadingCoverImg}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFeaturedImageUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                {formData.featuredImage && (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteStorageImage(formData.featuredImage);
                      setFormData((prev) => ({ ...prev, featuredImage: "" }));
                    }}
                    className="text-xs text-red-600 hover:underline px-2 py-1 font-semibold uppercase"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8C7A63] shrink-0">Direct URL:</span>
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="Paste direct cover image URL here"
                  className="w-full border border-[#DFD8CC] px-3 py-1.5 text-xs bg-[#FAFAF8] focus:border-[#C19A6B] outline-none text-[#3A332C] rounded-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 5: Tags */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-[#3A332C] mb-1.5">
            Article Tags (Comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Japandi, Minimalism, Living Room, Sustainable, Wool Alternative"
            className="w-full border border-[#DFD8CC] p-3 text-xs text-[#3A332C] bg-white focus:outline-none focus:border-[#C19A6B] rounded-sm"
          />
        </div>

        {/* 🌟 ROW 6: WORDPAD-STYLE VISUAL RICH TEXT EDITOR & AI CODE PASTE */}
        <div className="border border-[#DFD8CC] rounded-sm bg-white overflow-hidden shadow-sm">
          {/* TAB HEADER */}
          <div className="flex items-center justify-between border-b border-[#DFD8CC] bg-[#F5F5F7] px-4 py-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("wordpad")}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                  viewMode === "wordpad"
                    ? "bg-white text-[#3A332C] shadow-sm border border-[#DFD8CC]"
                    : "text-[#7A7065] hover:text-[#3A332C]"
                }`}
              >
                📝 WordPad Visual Editor
              </button>

              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                  viewMode === "preview"
                    ? "bg-white text-[#C19A6B] shadow-sm border border-[#DFD8CC]"
                    : "text-[#7A7065] hover:text-[#3A332C]"
                }`}
              >
                👁️ Live Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("code");
                  if (!pastedCodeInput) {
                    setPastedCodeInput(formData.contentHtml);
                  }
                }}
                className={`px-3.5 py-1.5 text-xs font-bold tracking-wider rounded-sm transition-colors flex items-center gap-1.5 ${
                  viewMode === "code"
                    ? "bg-[#3A332C] text-white shadow-sm"
                    : "bg-[#EAEAEB] text-[#3A332C] hover:bg-[#3A332C] hover:text-white"
                }`}
              >
                <span>⚡</span>
                <span>Paste Full AI Code / HTML</span>
              </button>
            </div>

            <span className="text-[10px] uppercase font-mono text-[#8C7A63] hidden sm:inline">
              {viewMode === "wordpad" ? "Visual Mode" : viewMode === "code" ? "Code Import Mode" : "Preview Mode"}
            </span>
          </div>

          {/* 🌟 WORDPAD VISUAL TOOLBAR */}
          {viewMode === "wordpad" && (
            <div className="p-2.5 bg-[#FAFAFA] border-b border-[#DFD8CC] flex flex-wrap items-center gap-1.5 text-xs select-none">
              {/* Undo / Redo */}
              <button
                type="button"
                title="Undo (Ctrl+Z)"
                onClick={() => execCmd("undo")}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#EAEAEB] text-[#3A332C] font-semibold"
              >
                ↺
              </button>
              <button
                type="button"
                title="Redo (Ctrl+Y)"
                onClick={() => execCmd("redo")}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#EAEAEB] text-[#3A332C] font-semibold"
              >
                ↻
              </button>

              <div className="w-[1px] h-5 bg-[#DFD8CC] mx-1" />

              {/* Headings & Paragraph Selector */}
              <button
                type="button"
                title="Big Heading (H2)"
                onClick={() => formatBlock("h2")}
                className="px-3 py-1.5 font-serif font-bold text-sm bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors"
              >
                Heading 2
              </button>

              <button
                type="button"
                title="Medium Heading (H3)"
                onClick={() => formatBlock("h3")}
                className="px-3 py-1.5 font-serif font-bold text-xs bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors"
              >
                Heading 3
              </button>

              <button
                type="button"
                title="Normal Paragraph"
                onClick={() => formatBlock("p")}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors font-medium"
              >
                Normal
              </button>

              <div className="w-[1px] h-5 bg-[#DFD8CC] mx-1" />

              {/* Bold / Italic / Underline / Strike */}
              <button
                type="button"
                title="Bold"
                onClick={() => execCmd("bold")}
                className="px-3 py-1.5 font-bold bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors text-sm"
              >
                B
              </button>

              <button
                type="button"
                title="Italic"
                onClick={() => execCmd("italic")}
                className="px-3 py-1.5 italic font-serif bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors text-sm"
              >
                I
              </button>

              <button
                type="button"
                title="Underline"
                onClick={() => execCmd("underline")}
                className="px-3 py-1.5 underline font-semibold bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors text-sm"
              >
                U
              </button>

              <button
                type="button"
                title="Strikethrough"
                onClick={() => execCmd("strikeThrough")}
                className="px-2.5 py-1.5 line-through bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors"
              >
                S
              </button>

              <div className="w-[1px] h-5 bg-[#DFD8CC] mx-1" />

              {/* Color Presets */}
              <div className="flex items-center gap-1 bg-white border border-[#DFD8CC] px-2 py-1 rounded-xs">
                <span className="text-[10px] uppercase font-bold text-[#8C7A63] mr-1">Color:</span>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.label}
                    onClick={() => execCmd("foreColor", c.color)}
                    style={{ backgroundColor: c.color }}
                    className="w-4 h-4 rounded-full border border-black/10 hover:scale-125 transition-transform"
                  />
                ))}
              </div>

              <div className="w-[1px] h-5 bg-[#DFD8CC] mx-1" />

              {/* Text Alignments */}
              <button
                type="button"
                title="Align Left"
                onClick={() => execCmd("justifyLeft")}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#EAEAEB]"
              >
                ⇤ Left
              </button>
              <button
                type="button"
                title="Align Center"
                onClick={() => execCmd("justifyCenter")}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#EAEAEB]"
              >
                ≡ Center
              </button>

              <div className="w-[1px] h-5 bg-[#DFD8CC] mx-1" />

              {/* Bullet & Numbered Lists */}
              <button
                type="button"
                title="Bullet List"
                onClick={() => execCmd("insertUnorderedList")}
                className="px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors font-medium flex items-center gap-1"
              >
                <span>•</span>
                <span>Bullets</span>
              </button>

              <button
                type="button"
                title="Numbered List"
                onClick={() => execCmd("insertOrderedList")}
                className="px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors font-medium flex items-center gap-1"
              >
                <span>1.</span>
                <span>Numbered</span>
              </button>

              <div className="w-[1px] h-5 bg-[#DFD8CC] mx-1" />

              {/* Link Modal Button */}
              <button
                type="button"
                title="Insert Clickable Link"
                onClick={openLinkModal}
                className="px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors font-medium flex items-center gap-1"
              >
                <span>🔗</span>
                <span>Add Link</span>
              </button>

              {/* Image Modal Button */}
              <button
                type="button"
                title="Insert In-Article Image"
                onClick={openImageModal}
                className="px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors font-medium flex items-center gap-1"
              >
                <span>🖼️</span>
                <span>Add Image</span>
              </button>

              {/* Quote & Tip Blocks */}
              <button
                type="button"
                title="Insert Luxury Quote Block"
                onClick={handleInsertQuote}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors italic font-serif"
              >
                “ Quote
              </button>

              <button
                type="button"
                title="Insert Pro-Tip Callout Box"
                onClick={handleInsertTip}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors"
              >
                💡 Tip Box
              </button>

              <button
                type="button"
                title="Divider Line"
                onClick={() => execCmd("insertHorizontalRule")}
                className="px-2.5 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-[#C19A6B] hover:text-white transition-colors"
              >
                ― Line
              </button>

              <button
                type="button"
                title="Clear Formatting"
                onClick={() => execCmd("removeFormat")}
                className="px-2 py-1.5 bg-white border border-[#DFD8CC] rounded-xs hover:bg-red-50 text-red-600 font-semibold"
              >
                ✕ Clear
              </button>
            </div>
          )}

          {/* 🌟 1. WORDPAD VISUAL CONTENTEDITABLE CANVAS */}
          {viewMode === "wordpad" && (
            <div className="p-6 sm:p-10 bg-white min-h-[420px] cursor-text">
              <div
                ref={visualEditorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onBlur={handleEditorInput}
                className="outline-none focus:outline-none min-h-[360px] text-[#2C2724] leading-relaxed font-sans text-base sm:text-lg space-y-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:text-[#1E1B18] [&_h2]:font-medium [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:text-[#7C6347] [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:my-2 [&_blockquote]:my-6 [&_blockquote]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#C19A6B] [&_blockquote]:font-serif [&_blockquote]:text-lg [&_blockquote]:sm:text-xl [&_blockquote]:text-[#1E1B18] [&_blockquote]:italic [&_blockquote]:bg-[#FAF5EE] [&_blockquote]:py-4 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:space-y-1.5 [&_ol]:my-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:text-sm [&_li]:sm:text-base [&_li]:text-[#3A332C] [&_strong]:font-bold [&_strong]:text-[#1E1B18] [&_em]:italic [&_u]:underline [&_u]:decoration-[#C19A6B] [&_u]:underline-offset-4 [&_a]:text-[#C19A6B] [&_a]:underline [&_a]:font-medium [&_img]:rounded-2xl [&_img]:my-6 [&_img]:w-full [&_img]:max-h-[480px] [&_img]:object-cover [&_img]:border [&_img]:border-[#DFD8CC] [&_hr]:my-8 [&_hr]:border-[#E6DED3]"
              />
            </div>
          )}

          {/* 🌟 2. LIVE PREVIEW TAB */}
          {viewMode === "preview" && (
            <div className="p-6 sm:p-10 bg-[#FAFAFA] text-[#2C2724] border-t border-[#DFD8CC] min-h-[400px]">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="border-b border-[#E6DED3] pb-6">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C7A6B] mb-2">
                    <span className="text-[#9E744E] font-semibold">{formData.category}</span>
                    <span>•</span>
                    <span>{formData.readTime}</span>
                    <span>•</span>
                    <span>{formData.publishDate}</span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl text-[#1E1B18] font-medium leading-tight mb-2">
                    {formData.title || "Untitled Article"}
                  </h1>

                  {formData.subtitle && (
                    <p className="text-sm text-[#6C635B] font-light leading-relaxed mb-4">
                      {formData.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-3">
                    <div className="w-8 h-8 rounded-full bg-[#B58A60] text-white flex items-center justify-center font-serif text-sm font-semibold">
                      {(formData.authorName || "R")[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1E1B18]">{formData.authorName}</p>
                      <p className="text-[11px] text-[#8C7A6B]">{formData.authorRole}</p>
                    </div>
                  </div>
                </div>

                {formData.featuredImage && (
                  <div className="relative h-64 w-full rounded-xl overflow-hidden border border-[#E3D9CC]">
                    <img
                      src={formData.featuredImage}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {formData.excerpt && (
                  <div className="p-4 bg-[#F5EFE6] rounded-xl border-l-4 border-[#B58A60] text-sm text-[#4A433E] font-light leading-relaxed italic">
                    "{formData.excerpt}"
                  </div>
                )}

                <div
                  className="blog-rich-content text-[#3D3732] leading-relaxed font-light text-sm sm:text-base space-y-4 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:text-[#1E1B18] [&_h2]:pt-4 [&_h2]:pb-1 [&_h2]:font-medium [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-[#7C6347] [&_h3]:pt-3 [&_h3]:font-medium [&_p]:leading-relaxed [&_blockquote]:my-4 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B58A60] [&_blockquote]:font-serif [&_blockquote]:text-base [&_blockquote]:text-[#1E1B18] [&_blockquote]:italic [&_blockquote]:bg-[#FAF5EE]/80 [&_blockquote]:py-3 [&_blockquote]:pr-3 [&_blockquote]:rounded-r-lg [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:space-y-1.5 [&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:text-xs [&_li]:sm:text-sm [&_li]:text-[#4A433E] [&_strong]:font-bold [&_strong]:text-[#1E1B18] [&_b]:font-bold [&_b]:text-[#1E1B18] [&_em]:italic [&_i]:italic [&_u]:underline [&_u]:decoration-[#C19A6B] [&_u]:underline-offset-4 [&_a]:text-[#C19A6B] [&_a]:underline [&_a]:font-medium [&_a:hover]:text-[#3A332C] [&_img]:rounded-xl [&_img]:my-6 [&_img]:w-full [&_hr]:my-6 [&_hr]:border-[#E6DED3]"
                  dangerouslySetInnerHTML={{ __html: formData.contentHtml }}
                />

                {formData.tags && (
                  <div className="pt-6 border-t border-[#E6DED3] flex flex-wrap gap-1.5">
                    {formData.tags.split(",").map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono bg-[#EAE3D8] text-[#7C6347] px-2.5 py-0.5 rounded-full"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🌟 3. AI / CODE QUICK PASTE TAB */}
          {viewMode === "code" && (
            <div className="p-6 bg-[#FAFAF8] space-y-4">
              <div className="bg-[#FAF5EE] p-4 rounded-sm border border-[#EAEAEB]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚡</span>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-[#3A332C]">
                    AI Code / Full Object Quick Importer
                  </h4>
                </div>
                <p className="text-xs text-[#7A7065] leading-relaxed">
                  Aap ChatGPT, Claude ya Gemini se generate kiya gaya poora TypeScript/JSON object (jaise <code className="text-[#C19A6B] font-mono">&#123; id: 1, title: "...", contentHtml: `...` &#125;</code>) ya direct HTML yahan paste kar sakte hain. <strong>"Load into WordPad"</strong> button click karte hi saare boxes auto-fill ho jayenge aur WordPad me open ho jayega!
                </p>
              </div>

              <div>
                <textarea
                  rows={14}
                  value={pastedCodeInput}
                  onChange={(e) => setPastedCodeInput(e.target.value)}
                  placeholder={`Paste full code here e.g.:\n{\n  id: 5,\n  slug: 'the-art-of-braided-rugs',\n  title: 'The Art of Braided Rugs',\n  subtitle: 'Handcrafted luxury in modern living',\n  category: 'Design & Styling',\n  readTime: '5 min read',\n  publishDate: 'September 17, 2026',\n  author: 'Sahil Shahim',\n  tags: ['Japandi', 'Home Decor'],\n  contentHtml: \`\n    <h2>1. The Craft</h2>\n    <p>Article text here...</p>\n  \`\n}`}
                  className="w-full font-mono text-xs text-[#2C2724] leading-relaxed p-4 bg-white border border-[#DFD8CC] rounded-sm focus:outline-none focus:border-[#C19A6B] resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const sampleCode = `{\n  id: ${Date.now()},\n  slug: "art-of-handcrafted-living",\n  title: "The Art of Handcrafted Living: Sustainable Luxury for Modern Homes",\n  subtitle: "Explore how organic textures, zero-shed rPET fibers, and generational Bhadohi braiding transform everyday spaces.",\n  excerpt: "A guide to anchoring mindful interiors with durable, reversible, and sustainably braided floor architecture.",\n  category: "Design & Styling",\n  readTime: "5 min read",\n  publishDate: "${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}",\n  author: {\n    name: "Sahil Shahim",\n    role: "Head of Design, NR Enterprises"\n  },\n  featuredImage: "https://qjpjltaiazwybhsmnkve.supabase.co/storage/v1/object/public/product-images/site-1788885350236-wdp51.webp",\n  isFeatured: false,\n  tags: ["Japandi", "Sustainability", "Living Room", "Hand-Braided"],\n  contentHtml: \`\n    <h2>1. Organic Harmony in the Modern Home</h2>\n    <p>Mindful design begins from the foundation up. When choosing a rug, texture and tactile drape dictate the entire mood of a space.</p>\n    <blockquote>True luxury is felt beneath the feet before it is processed by the eye.</blockquote>\n    <h2>2. Why Hand-Braided Construction Matters</h2>\n    <p>Unlike tufted rugs backed by latex glue, braided rugs are completely unbacked, 100% reversible, and twice as durable.</p>\n  \`\n}`;
                    setPastedCodeInput(sampleCode);
                  }}
                  className="text-xs text-[#8C7A63] hover:text-[#3A332C] underline font-medium"
                >
                  Insert Sample AI Template
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentBlogObj = {
                        id: mode === "edit" && selectedBlogId ? selectedBlogId : Date.now(),
                        slug: formData.slug || "url-slug",
                        title: formData.title || "Blog Title",
                        subtitle: formData.subtitle || "",
                        excerpt: formData.excerpt || "",
                        category: formData.category === "Custom" ? formData.customCategory : formData.category,
                        readTime: formData.readTime || "5 min read",
                        publishDate: formData.publishDate || "",
                        author: {
                          name: formData.authorName,
                          role: formData.authorRole,
                        },
                        featuredImage: formData.featuredImage || "",
                        isFeatured: formData.isFeatured,
                        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
                        contentHtml: visualEditorRef.current?.innerHTML || formData.contentHtml,
                      };
                      navigator.clipboard.writeText(JSON.stringify(currentBlogObj, null, 2));
                      showNotification("Current article copied to clipboard as JSON object!");
                    }}
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-white border border-[#DFD8CC] text-[#3A332C] hover:bg-[#F5F5F7] rounded-sm shadow-xs"
                  >
                    📋 Copy as JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => parseAndLoadPastedCode(pastedCodeInput)}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#3A332C] text-white hover:bg-[#C19A6B] transition-colors rounded-sm shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>⚡ Load & Edit in WordPad →</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🌟 ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#DFD8CC]">
          <div className="flex items-center gap-2">
            {mode === "edit" && selectedBlogId && (
              <button
                type="button"
                onClick={handleDeleteBlog}
                disabled={isSaving}
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors rounded-sm cursor-pointer disabled:opacity-50"
              >
                Delete Article 🗑️
              </button>
            )}

            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#7A7065] hover:text-[#3A332C] px-3 py-2 font-semibold uppercase tracking-wider"
            >
              Reset Form
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {mode === "edit" && formData.slug && (
              <Link
                href={`/blog/${formData.slug}`}
                target="_blank"
                className="px-4 py-3 text-xs font-bold uppercase tracking-wider border border-[#3A332C] text-[#3A332C] hover:bg-[#3A332C] hover:text-white transition-colors rounded-sm text-center"
              >
                Preview Live URL ↗
              </Link>
            )}

            <button
              type="button"
              onClick={handleSaveBlog}
              disabled={isSaving}
              className="flex-1 sm:flex-none bg-[#C19A6B] hover:bg-[#A8855A] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition-all rounded-sm shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
            >
              {isSaving
                ? "Saving to Supabase..."
                : mode === "create"
                ? "Publish Article Live ↗"
                : "Update & Save Article ✔"}
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 4. CUSTOM INSERT LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-sm shadow-2xl border border-[#DFD8CC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEAEB] pb-3">
              <h3 className="font-serif text-lg text-[#3A332C] font-semibold flex items-center gap-2">
                <span>🔗</span>
                <span>Insert Hyperlink</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-[#8C7A63] hover:text-[#3A332C] font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1">
                Destination URL (e.g. /collections, /customize, or https://...)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://nrenterprises.com/collections"
                autoFocus
                className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-[#F5F5F7] focus:border-[#C19A6B] outline-none text-[#3A332C] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1">
                Link Text to Display
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Explore Bespoke Area Rugs"
                className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white focus:border-[#C19A6B] outline-none text-[#3A332C] rounded-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAEAEB]">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-semibold uppercase text-[#7A7065] hover:text-[#3A332C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#C19A6B] text-white hover:bg-[#3A332C] transition-colors rounded-sm shadow-sm"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 5. CUSTOM INSERT IMAGE MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-sm shadow-2xl border border-[#DFD8CC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEAEB] pb-3">
              <h3 className="font-serif text-lg text-[#3A332C] font-semibold flex items-center gap-2">
                <span>🖼️</span>
                <span>Insert In-Article Image</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-[#8C7A63] hover:text-[#3A332C] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1.5">
                  Option 1: Upload Image from Computer
                </label>
                <label className="inline-flex items-center gap-2 bg-[#3A332C] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C19A6B] transition-colors cursor-pointer shadow-sm">
                  {isUploadingInlineImg ? "Optimizing to WebP..." : "Browse Image File"}
                  <input
                    type="file"
                    accept="image/*,.webp,.avif"
                    className="hidden"
                    disabled={isUploadingInlineImg}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleInlineImageUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1">
                  Option 2: Direct Image URL
                </label>
                <input
                  type="text"
                  value={inlineImageUrl}
                  onChange={(e) => setInlineImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Supabase image URL"
                  className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-[#F5F5F7] focus:border-[#C19A6B] outline-none text-[#3A332C] rounded-sm"
                />
              </div>

              {inlineImageUrl && (
                <div className="h-32 w-full rounded-sm overflow-hidden border border-[#DFD8CC]">
                  <img src={inlineImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase font-bold text-[#8C7A63] mb-1">
                  Optional Caption / Description
                </label>
                <input
                  type="text"
                  value={inlineImageCaption}
                  onChange={(e) => setInlineImageCaption(e.target.value)}
                  placeholder="e.g. Handcrafted braiding detail from our Bhadohi loom"
                  className="w-full border border-[#DFD8CC] p-2.5 text-xs bg-white focus:border-[#C19A6B] outline-none text-[#3A332C] rounded-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAEAEB]">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-xs font-semibold uppercase text-[#7A7065] hover:text-[#3A332C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyInlineImage}
                disabled={!inlineImageUrl || isUploadingInlineImg}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#C19A6B] text-white hover:bg-[#3A332C] transition-colors rounded-sm shadow-sm disabled:opacity-50"
              >
                Insert Into Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
