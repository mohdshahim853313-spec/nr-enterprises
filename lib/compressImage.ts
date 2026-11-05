import imageCompression from "browser-image-compression";

export async function compressAndConvertToWebP(file: File): Promise<File> {
  // SVG images or animated files should not be compressed via canvas
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // If already high-quality WebP and under 3MB, keep original without re-compressing
  if (file.type === "image/webp" && file.size <= 3 * 1024 * 1024) {
    return file;
  }

  const options = {
    maxSizeMB: 3.5,          // Preserves razor-sharp yarn textures & carpet relief without blur
    maxWidthOrHeight: 3840,  // Up to 4K Ultra-HD resolution
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.98,    // 98% Ultra-High Quality WebP
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([compressedBlob], `${baseName}.webp`, {
      type: "image/webp",
    });
  } catch (error) {
    console.warn("Compression warning, using original file:", error);
    return file;
  }
}