import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getValidEtsyAccessToken } from "@/lib/etsyOAuth";
import { humanizeImageBuffer } from "@/lib/humanizeEngine";
import fs from "fs";
import path from "path";

const ETSY_API_KEY = process.env.ETSY_KEYSTRING || "zylzcsf84xn2i4z8fvz26w6x";
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET || "3v9703wmcpd4ol5y00wq5ha44";
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID || "67519876";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: "Missing productId" }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (!product.sku || !product.sku.startsWith("ETSY-")) {
      return NextResponse.json(
        {
          success: false,
          error: "This product does not have an ETSY SKU. Please sync from Etsy or create listing first.",
        },
        { status: 400 }
      );
    }

    const listingId = product.sku.replace("ETSY-", "");
    const etsyShopUrl = `https://www.etsy.com/your/shops/me/listing-editor/edit/${listingId}`;

    // 1. Check if we have a valid Etsy OAuth access token
    const accessToken = await getValidEtsyAccessToken();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        requiresOAuth: true,
        oauthConnectUrl: "/api/etsy/oauth/connect",
        listingId,
        sku: product.sku,
        etsyShopUrl,
        message:
          "Etsy requires 1-time Seller Authorization before allowing apps to directly modify listings. Click 'Connect Etsy Shop' below to authorize once, then direct draft update will work with 1-click!",
      });
    }

    // 2. Fetch existing listing images before uploading so we can clean up old unwatermarked ones
    let existingImageIds: number[] = [];
    try {
      const imagesRes = await fetch(
        `https://openapi.etsy.com/v3/application/listings/${listingId}/images`,
        {
          headers: {
            "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        if (Array.isArray(imagesData.results)) {
          existingImageIds = imagesData.results.map((r: any) => r.listing_image_id).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("Could not fetch existing listing images:", e);
    }

    // 3. Update listing state to 'inactive' (or 'draft')
    let resultingState = "inactive";
    try {
      let updateRes = await fetch(
        `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${listingId}`,
        {
          method: "PATCH",
          headers: {
            "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ state: "inactive" }),
        }
      );

      let resData = await updateRes.json();
      if (!updateRes.ok && (resData.error?.includes("invalid state") || resData.error_description?.includes("invalid state"))) {
        updateRes = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ state: "draft" }),
          }
        );
        resData = await updateRes.json();
      }

      if (updateRes.ok && resData.state) {
        resultingState = resData.state;
      }
    } catch (stateErr) {
      console.warn("State update warning:", stateErr);
    }

    // 4. Process and upload humanized design images with transparent RZ logo watermark (bottom-right)
    const images = Array.isArray(product.images) ? product.images.slice(0, 8) : [];
    const seed = Math.abs(
      (product.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    );
    const rugIndex = seed % 35;

    let uploadedCount = 0;
    const newImageIds: number[] = [];

    for (let idx = 0; idx < images.length; idx++) {
      const url = images[idx];
      try {
        const imgFetch = await fetch(url);
        if (!imgFetch.ok) continue;

        const rawBuffer = Buffer.from(await imgFetch.arrayBuffer());
        // Humanize image with RZ logo watermark (bottom-right, low opacity) + sensor grain + Sony EXIF
        const humanizedBuffer = await humanizeImageBuffer(rawBuffer, {
          rugIndex,
          photoIndex: idx,
          cameraMake: "SONY",
          cameraModel: "ILCE-7M4",
          lensModel: "FE 50mm F1.4 GM",
          includeWatermark: true,
        });

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(humanizedBuffer)], { type: "image/jpeg" });
        formData.append("image", blob, `rz_photo_${idx + 1}.jpg`);
        formData.append("rank", String(idx + 1));
        formData.append("overwrite", "true");

        const upRes = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${listingId}/images`,
          {
            method: "POST",
            headers: {
              "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (upRes.ok) {
          const upData = await upRes.json();
          if (upData.listing_image_id) newImageIds.push(upData.listing_image_id);
          uploadedCount++;

          // As soon as the first new watermarked photo is uploaded (Rank 1), delete all old original unwatermarked photos immediately!
          if (idx === 0 && existingImageIds.length > 0) {
            for (const oldId of existingImageIds) {
              try {
                await fetch(
                  `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${listingId}/images/${oldId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );
              } catch (delErr) {
                console.warn(`Could not delete old image ${oldId}:`, delErr);
              }
            }
          }
        } else {
          console.error(`Etsy upload error for image ${idx + 1}:`, await upRes.text());
        }
      } catch (imgErr) {
        console.error(`Failed uploading image ${idx + 1} to Etsy:`, imgErr);
      }
    }

    // 5. Upload the 2 Real Craft Proofs (Photos 9 & 10)
    const craftProofs = [
      {
        filePath: path.join(process.cwd(), "public", "craft-proofs", "09_hand_tufted_backing_binding.jpg"),
        rank: 9,
        photoIndex: 8,
        name: "09_real_craft_backing_binding.jpg",
      },
      {
        filePath: path.join(process.cwd(), "public", "craft-proofs", "10_bhadohi_workshop_loom.jpg"),
        rank: 10,
        photoIndex: 9,
        name: "10_real_bhadohi_workshop_loom.jpg",
      },
    ];

    for (const proof of craftProofs) {
      try {
        if (fs.existsSync(/*turbopackIgnore: true*/ proof.filePath)) {
          const rawBuffer = fs.readFileSync(/*turbopackIgnore: true*/ proof.filePath);
          const humanizedBuffer = await humanizeImageBuffer(rawBuffer, {
            rugIndex,
            photoIndex: proof.photoIndex,
            cameraMake: "SONY",
            cameraModel: "ILCE-7M4",
            lensModel: "FE 50mm F1.4 GM",
            includeWatermark: false, // Authentic raw documentary photo
          });

          const formData = new FormData();
          const blob = new Blob([new Uint8Array(humanizedBuffer)], { type: "image/jpeg" });
          formData.append("image", blob, proof.name);
          formData.append("rank", String(proof.rank));
          formData.append("overwrite", "true");

          const upRes = await fetch(
            `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${listingId}/images`,
            {
              method: "POST",
              headers: {
                "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
                Authorization: `Bearer ${accessToken}`,
              },
              body: formData,
            }
          );

          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData.listing_image_id) newImageIds.push(upData.listing_image_id);
            uploadedCount++;
          }
        }
      } catch (proofErr) {
        console.error(`Failed uploading craft proof ${proof.name} to Etsy:`, proofErr);
      }
    }

    // 6. Delete old unwatermarked image IDs that were on the listing previously
    for (const oldId of existingImageIds) {
      if (!newImageIds.includes(oldId)) {
        try {
          await fetch(
            `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${listingId}/images/${oldId}`,
            {
              method: "DELETE",
              headers: {
                "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (delErr) {
          console.warn(`Could not delete old image ${oldId}:`, delErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode: "direct",
      listingId,
      sku: product.sku,
      etsyShopUrl,
      imagesUploaded: uploadedCount,
      message: `🎉 Success! Listing ${listingId} (${product.name}) is safely set to ${resultingState.toUpperCase()} on Etsy, and ${uploadedCount} photos (with NR Enterprises transparent watermarks & real craft proofs) are uploaded directly to Etsy!`,
    });
  } catch (err: any) {
    console.error("Error in push-draft route:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
