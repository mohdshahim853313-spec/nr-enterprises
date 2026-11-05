import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    let studioImg = data.studio_image || data.variants?.[0]?.studio_image || null;
    let colorVariants = data.color_variants || data.variants?.[0]?.color_variants || null;

    if (!studioImg || !colorVariants) {
      try {
        const { data: contentRegs } = await supabase
          .from("site_content")
          .select("id, data")
          .in("id", ["studio_rug_images", "product_color_variants"]);

        if (contentRegs && contentRegs.length > 0) {
          const sReg = contentRegs.find((r: any) => r.id === "studio_rug_images");
          const cReg = contentRegs.find((r: any) => r.id === "product_color_variants");
          if (!studioImg && sReg?.data?.[id]) {
            studioImg = sReg.data[id];
          }
          if (!colorVariants && cReg?.data?.[id]) {
            colorVariants = cReg.data[id];
          }
        }
      } catch {}
    }

    return { ...data, studio_image: studioImg, color_variants: colorVariants || [] };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | NR Enterprises Atelier",
      description: "The requested handcrafted carpet could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const productName = product.name || "Handcrafted Carpet";
  const category = product.category || "Luxury Rug";
  const rawDesc = (product.description || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const description = rawDesc.length > 20
    ? (rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc)
    : `Explore ${productName}, an artisanal ${category} handcrafted in Bhadohi with ${product.material || "premium sustainable fibers"}. Custom sizing and white-glove global delivery available.`;

  const images: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : ["/logo.png"]);

  const ogImages = images.slice(0, 4).map((imgUrl: string) => ({
    url: imgUrl.startsWith("http") ? imgUrl : `https://nrenterprises.com${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`,
    width: 1200,
    height: 800,
    alt: `${productName} - Handcrafted NR Enterprises Carpet`,
  }));

  const canonicalUrl = `https://nrenterprises.com/product/${id}`;

  return {
    title: `${productName} — Handcrafted ${category}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: "NR Enterprises",
      title: `${productName} | Handcrafted ${category} | NR Enterprises`,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${productName} | NR Enterprises`,
      description,
      images: [ogImages[0]?.url || "https://nrenterprises.com/logo.png"],
    },
    keywords: [
      productName,
      `${category} rug`,
      "handmade carpet Bhadohi",
      product.material || "pure wool rug",
      product.style ? `${product.style} carpet` : "modern luxury rug",
      "custom size area rug",
      "sustainable handcrafted rug",
      "NR Enterprises Atelier",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // 🌟 High-Fidelity Schema.org / JSON-LD for Google Rich Snippets & Shopping
  const images: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);
  
  const absoluteImages = images.map((img: string) => 
    img.startsWith("http") ? img : `https://nrenterprises.com${img.startsWith("/") ? "" : "/"}${img}`
  );

  const rawDesc = (product.description || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const description = rawDesc || `Handcrafted ${product.category || "luxury"} carpet woven with master precision in Bhadohi.`;
  const priceNumber = Number(String(product.price || "0").replace(/[^0-9.]/g, "")) || 0;

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: absoluteImages.length > 0 ? absoluteImages : ["https://nrenterprises.com/logo.png"],
    description: description,
    sku: product.sku || product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "NR Enterprises",
    },
    category: product.category || "Carpets & Rugs",
    material: product.material || "Natural Wool & Handcrafted Fibers",
    color: product.color || undefined,
    pattern: product.pattern || undefined,
    countryOfOrigin: {
      "@type": "Country",
      name: "India",
    },
    offers: {
      "@type": "Offer",
      url: `https://nrenterprises.com/product/${id}`,
      priceCurrency: "INR",
      price: priceNumber,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock_quantity === 0 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "NR Enterprises",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://nrenterprises.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://nrenterprises.com/collections",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://nrenterprises.com/product/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient initialProduct={product} id={id} />
    </>
  );
}