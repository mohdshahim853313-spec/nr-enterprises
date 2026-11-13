import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCameraSettings } from "@/lib/humanizeEngine";
import { getValidEtsyAccessToken } from "@/lib/etsyOAuth";

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

    const images = Array.isArray(product.images) ? product.images : [];
    // Compute simulated shoot index based on created timestamp or ID
    const seed = Math.abs(
      (product.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    );
    const rugIndex = seed % 35;

    const photoPreviews = images.map((imgUrl: string, idx: number) => {
      const cameraInfo = getCameraSettings(rugIndex, idx);
      const isHero = idx === 0;
      return {
        index: idx + 1,
        imgUrl,
        label: isHero ? "Hero Shot" : `Angle / Detail #${idx + 1}`,
        camera: cameraInfo.camera,
        lens: cameraInfo.lens,
        shootDate: cameraInfo.shootDate,
        shutter: cameraInfo.shutter.fraction,
        aperture: cameraInfo.aperture.fStop,
        iso: cameraInfo.iso,
        gps: cameraInfo.gps,
        hasGrainOverlay: true,
        hasWatermark: true,
        watermarkLogo: "/watermark-logo.png",
        watermarkPosition: "Bottom-Right (Low Opacity)",
        isCraftProof: false,
      };
    });

    // Append Pillar 2: The 2 Fixed Real Process Proofs
    const proof9Settings = getCameraSettings(rugIndex, 8);
    photoPreviews.push({
      index: photoPreviews.length + 1,
      imgUrl: "/craft-proofs/09_hand_tufted_backing_binding.jpg",
      label: "Photo #9 • Real Craft Proof: Wool Backing & Binding (Macro Detail)",
      camera: "SONY ILCE-7M4",
      lens: "FE 50mm F1.4 GM",
      shootDate: proof9Settings.shootDate,
      shutter: "1/160s",
      aperture: "f/2.8",
      iso: 200,
      gps: "Bhadohi, Uttar Pradesh, India (25°23'N, 82°34'E)",
      hasGrainOverlay: true,
      hasWatermark: false,
      isCraftProof: true,
    });

    const proof10Settings = getCameraSettings(rugIndex, 9);
    photoPreviews.push({
      index: photoPreviews.length + 1,
      imgUrl: "/craft-proofs/10_bhadohi_workshop_loom.jpg",
      label: "Photo #10 • Real Craft Proof: Bhadohi Atelier Loom & Workshop Setup",
      camera: "SONY ILCE-7M4",
      lens: "FE 50mm F1.4 GM",
      shootDate: proof10Settings.shootDate,
      shutter: "1/125s",
      aperture: "f/2.0",
      iso: 400,
      gps: "Bhadohi, Uttar Pradesh, India (25°23'N, 82°34'E)",
      hasGrainOverlay: true,
      hasWatermark: false,
      isCraftProof: true,
    });

    const accessToken = await getValidEtsyAccessToken();

    return NextResponse.json({
      success: true,
      isEtsyConnected: !!accessToken,
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        original_name: product.original_name || product.name,
        price: product.price,
        original_price: product.original_price,
        category: product.category,
        shape: product.shape,
        material: product.material,
        description: product.description,
        tags: product.tags || [],
        sizes: product.sizes || [],
        variants: product.variants || [],
        etsy_url: product.etsy_url,
      },
      photos: photoPreviews,
      totalPhotos: photoPreviews.length,
    });
  } catch (err: any) {
    console.error("Error in etsy-pack preview:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
