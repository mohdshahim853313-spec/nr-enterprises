import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

import { existsSync } from "fs";

// Helper to safely remove a local uploaded file
async function safeDeleteLocalFile(fileRelativeUrl: string) {
  try {
    if (!fileRelativeUrl || typeof fileRelativeUrl !== "string") return;

    let cleanPath = fileRelativeUrl.trim();

    // If it is a full URL (http/https), parse pathname
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      try {
        const parsed = new URL(cleanPath);
        cleanPath = parsed.pathname;
      } catch {
        // Continue with raw string if URL parse fails
      }
    }

    // Strip query parameters and hash fragments (e.g. ?v=123#xyz)
    cleanPath = cleanPath.split("?")[0].split("#")[0];

    // Decode URL encodings (e.g. %20 -> space)
    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch {
      // Continue if decode fails
    }

    // Check if it targets the uploads folder
    if (!cleanPath.includes("/uploads/") && !cleanPath.includes("uploads/")) {
      return;
    }

    // Extract filename securely
    const idx = cleanPath.indexOf("uploads/");
    const subPath = cleanPath.substring(idx + "uploads/".length);
    const fileName = path.basename(subPath);

    if (!fileName || fileName === "." || fileName === "..") {
      return;
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsDir, fileName);

    // Security check: ensure path is strictly inside public/uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      console.warn(`[Local Delete Security] Blocked attempt to delete outside uploads dir: ${filePath}`);
      return;
    }

    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`🗑️ [Local Storage Auto-Delete] Successfully deleted old file: ${fileName}`);
    } else {
      console.log(`ℹ️ [Local Storage Auto-Delete] File already does not exist: ${fileName}`);
    }
  } catch (err: any) {
    console.error("❌ Failed to delete local file:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 🌟 If there is an existing local image in public/uploads, replace/delete it first
    if (oldUrl) {
      await safeDeleteLocalFile(oldUrl);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Clean and generate filename
    const originalName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, "_") : "image";
    const ext = path.extname(originalName) || ".webp";
    const baseName = path.basename(originalName, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;
    
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return the relative URL starting with /uploads/...
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      storageType: "local_codebase",
    });
  } catch (error: any) {
    console.error("Local upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save file to public directory" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const fileUrl = body.url;
    if (fileUrl) {
      await safeDeleteLocalFile(fileUrl);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

