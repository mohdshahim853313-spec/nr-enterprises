import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Initialize Supabase Admin Client using Service Role Key
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycykuweoprcspzwvcezw.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "hero-slides";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const originalName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, "_") : "image.webp";
    const ext = path.extname(originalName) || ".webp";
    const baseName = path.basename(originalName, ext);
    const fileName = `${folder}/${Date.now()}-${baseName}${ext}`;

    const supabaseAdmin = getSupabaseAdmin();

    // 🌟 Strategy 1: Upload directly to Supabase Storage 'site-assets' bucket
    if (supabaseAdmin) {
      try {
        const contentType = file.type || (ext === ".webp" ? "image/webp" : "image/jpeg");
        const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
          .from("site-assets")
          .upload(fileName, buffer, {
            contentType,
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: pubData } = supabaseAdmin.storage
            .from("site-assets")
            .getPublicUrl(uploadData.path);

          if (pubData?.publicUrl) {
            console.log(`[Upload Image] Uploaded to Supabase Storage: ${pubData.publicUrl}`);
            return NextResponse.json({
              success: true,
              url: pubData.publicUrl,
              storage: "supabase",
            });
          }
        } else {
          console.warn("[Upload Image] Supabase Storage upload error:", uploadErr);
        }
      } catch (sbErr) {
        console.warn("[Upload Image] Supabase upload failed, falling back to local:", sbErr);
      }
    }

    // 🌟 Strategy 2: Fallback to local /public/uploads/
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadsDir, { recursive: true });
      const localFileName = `${Date.now()}-${baseName}${ext}`;
      const localFilePath = path.join(uploadsDir, localFileName);
      await writeFile(localFilePath, buffer);

      const localPublicUrl = `/uploads/${folder}/${localFileName}`;
      console.log(`[Upload Image] Uploaded locally: ${localPublicUrl}`);
      return NextResponse.json({
        success: true,
        url: localPublicUrl,
        storage: "local",
      });
    } catch (localErr: any) {
      console.error("[Upload Image] Local fallback failed:", localErr);
      return NextResponse.json(
        { success: false, error: "Upload failed on both Supabase and local storage: " + localErr.message },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[Upload Image API Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

