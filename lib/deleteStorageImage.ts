import { supabase } from "@/lib/supabase";

/**
 * Supabase Storage ya Local public/uploads folder me se file name nikaal kar
 * permanent delete karta hai.
 */
export async function deleteStorageImage(imageUrl: string, bucket = "product-images") {
  if (!imageUrl || typeof imageUrl !== "string") return;

  try {
    // 1. Agar local codebase file hai (/uploads/... ya http://localhost:3000/uploads/...)
    if (imageUrl.includes("/uploads/") || imageUrl.startsWith("uploads/") || imageUrl.startsWith("/uploads/")) {
      await fetch("/api/upload-local", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      }).catch((err) => {
        console.warn("Local storage delete request failed:", err);
      });
      return;
    }

    // 2. Agar Cloudflare R2 bucket ki file hai
    if (imageUrl.includes(".r2.dev") || imageUrl.includes("r2.cloudflarestorage.com")) {
      console.log(`🗑️ Deleting old image from Cloudflare R2: ${imageUrl}`);
      await fetch("/api/r2-upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      }).catch((err) => {
        console.warn("R2 delete request failed:", err);
      });
      return;
    }

    // 3. Agar Supabase storage bucket ki file hai
    if (!imageUrl.includes(bucket)) return;

    // URL me se filename nikaalein (query params ko hatakar)
    const cleanUrl = imageUrl.split("?")[0];
    const fileName = cleanUrl.split(`/${bucket}/`)[1];

    if (!fileName) return;

    console.log(`🗑️ Deleting old image from Supabase: ${fileName}`);

    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      console.warn("Storage deletion warning:", error.message);
    } else {
      console.log(`✅ Successfully deleted from storage: ${fileName}`);
    }
  } catch (err: any) {
    console.warn("Failed to delete old image:", err.message);
  }
}