import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { humanizeImageBuffer } from "@/lib/humanizeEngine";
import fs from "fs";
import path from "path";
// @ts-ignore
import JSZip from "jszip";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const sku = searchParams.get("sku");

    if (!productId && !sku) {
      return NextResponse.json({ success: false, error: "Missing productId or sku" }, { status: 400 });
    }

    let query = supabase.from("products").select("*");
    if (productId) query = query.eq("id", productId);
    else if (sku) query = query.eq("sku", sku);

    const { data: product, error } = await query.maybeSingle();

    if (error || !product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const images = Array.isArray(product.images) ? product.images.slice(0, 8) : [];
    const zip = new JSZip();

    const seed = Math.abs(
      (product.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    );
    const rugIndex = seed % 35;

    // Process and add design images (up to 8) to zip with micro-grain, Sony A7 IV EXIF, and Luxury Studio Watermark
    for (let idx = 0; idx < images.length; idx++) {
      const url = images[idx];
      try {
        const res = await fetch(url);
        if (res.ok) {
          const rawBuffer = Buffer.from(await res.arrayBuffer());
          const humanized = await humanizeImageBuffer(rawBuffer, {
            rugIndex,
            photoIndex: idx,
            cameraMake: "SONY",
            cameraModel: "ILCE-7M4",
            lensModel: "FE 50mm F1.4 GM",
            includeWatermark: true,
          });
          const padIdx = String(idx + 1).padStart(2, "0");
          zip.file(`${padIdx}_photo_${product.sku || "rug"}.jpg`, humanized);
        }
      } catch (imgErr) {
        console.warn(`Failed to process image ${idx + 1}:`, imgErr);
      }
    }

    // Pillar 2: The 2 Fixed Real Process Proofs (Photos #9 and #10)
    const craftProofs = [
      {
        fileName: `09_real_craft_backing_binding_${product.sku || "rug"}.jpg`,
        localPath: path.join(process.cwd(), "public", "craft-proofs", "09_hand_tufted_backing_binding.jpg"),
        photoIndex: 8,
      },
      {
        fileName: `10_real_bhadohi_workshop_loom_${product.sku || "rug"}.jpg`,
        localPath: path.join(process.cwd(), "public", "craft-proofs", "10_bhadohi_workshop_loom.jpg"),
        photoIndex: 9,
      },
    ];

    for (const proof of craftProofs) {
      try {
        if (fs.existsSync(/*turbopackIgnore: true*/ proof.localPath)) {
          const rawBuffer = fs.readFileSync(/*turbopackIgnore: true*/ proof.localPath);
          const humanized = await humanizeImageBuffer(rawBuffer, {
            rugIndex,
            photoIndex: proof.photoIndex,
            cameraMake: "SONY",
            cameraModel: "ILCE-7M4",
            lensModel: "FE 50mm F1.4 GM",
            includeWatermark: false, // Authentic raw documentary photo
          });
          zip.file(proof.fileName, humanized);
        }
      } catch (proofErr) {
        console.warn(`Failed to attach craft proof ${proof.fileName}:`, proofErr);
      }
    }

    // Add listing_info.txt
    const infoText = `=====================================================
  NR ENTERPRISES ATELIER - ETSY LISTING READY PACK
=====================================================

Title:
${product.original_name || product.name}

SKU:
${product.sku}

Price:
${product.price} (Original MRP: ${product.original_price || "₹7,500"})

Category:
${product.category || "Tufted"}

Primary Shape:
${product.shape || "Rectangular"}

Material:
${product.material || "100% Pure New Zealand Wool & Natural Cotton Backing"}

Care Instructions:
${product.care_instructions || "Vacuum regularly with suction-only mode. Spot clean spills immediately with mild wool-friendly solution."}

Tags (Copy & Paste for Etsy):
${Array.isArray(product.tags) ? product.tags.join(", ") : "wool rug, handmade rug, artisan carpet, custom rug"}

Sizes & Variants:
${Array.isArray(product.variants) ? product.variants.map((v: any) => `- ${v.size}: ₹${v.price}`).join("\n") : "- Standard: ₹5,000"}

Description:
${product.description || "Handcrafted artisanal rug by master weavers at NR Enterprises atelier in Bhadohi."}

=====================================================
  PILLAR 1: SONY DSLR SENSOR PROFILES INJECTED:
  Camera: SONY ILCE-7M4 (Sony Alpha A7 IV)
  Lens: Sony FE 50mm F1.4 GM
  Shutter: 1/160s • ISO: 200/400 • Metering: Pattern • sRGB
  Location: Bhadohi, Uttar Pradesh, India (25°23'N, 82°34'E)
  Watermark: NR Enterprises Official Atelier Logo (Bottom-Right, 60% Opacity)
  Procedural 2.8% Analog Sensor Grain Injected.

  PILLAR 2: 2 REAL ATELIER CRAFT PROOFS INCLUDED:
  Photo #09: Hand-Tufted Wool Backing & Binding (Macro Detail)
  Photo #10: Bhadohi Atelier Loom & Tufting Workshop Setup
  (Real documentary photos establishing artisan authenticity against Etsy AI flags)
=====================================================
`;
    zip.file("listing_info.txt", infoText);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const cleanSku = (product.sku || "product").replace(/[^a-zA-Z0-9_-]/g, "");

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${cleanSku}_etsy_safe_pack.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("Error generating zip pack:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
