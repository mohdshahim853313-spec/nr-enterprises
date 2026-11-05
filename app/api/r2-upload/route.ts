import { NextRequest, NextResponse } from "next/server";

// Cloudflare R2 Configuration with Environment Fallbacks
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "4fc87588e31c447f26579ef025832963";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "af598e80d0c53ce2d94c264f47ac8fc3";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "e9a07da94f427b9552aaf15bb32841663be8bf8de296cc8a275b8ba7bd4de991";
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "nr-enterprises-images";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-2e34993142914e8e88a0050bb9e323a1.r2.dev";

// ============================================================================
// 🌟 Native Web Crypto AWS SigV4 Signer (100% Cloudflare Workers / Edge Safe)
// Eliminates @aws-sdk/client-s3 and avoids all [unenv] fs.readFile crashes!
// ============================================================================

async function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let bytes: Uint8Array;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    bytes = data;
  } else {
    bytes = new Uint8Array(data);
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: Uint8Array | ArrayBuffer, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data)
  );
  return new Uint8Array(signature);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<Uint8Array> {
  const kDate = await hmacSha256(new TextEncoder().encode("AWS4" + key), dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

// 🌟 Upload Object directly to R2 using S3 REST API (Pure Fetch)
async function putObjectToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Uint8Array;
  contentType: string;
}) {
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET_NAME}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await sha256Hex(body);

  const headersToSign: Record<string, string> = {
    "cache-control": "public, max-age=31536000, immutable",
    "content-length": body.byteLength.toString(),
    "content-type": contentType,
    "host": host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headersToSign).sort().join(";");
  const canonicalHeaders = Object.keys(headersToSign)
    .sort()
    .map((k) => `${k}:${headersToSign[k]}\n`)
    .join("");

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSignatureKey(SECRET_ACCESS_KEY, dateStamp, "auto", "s3");
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      ...headersToSign,
      Authorization: authHeader,
    },
    body: body as unknown as BodyInit,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudflare R2 returned ${res.status}: ${errorText}`);
  }

  return true;
}

// 🌟 Delete Object directly from R2 using S3 REST API (Pure Fetch)
async function deleteObjectFromR2(key: string) {
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET_NAME}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await sha256Hex("");

  const headersToSign: Record<string, string> = {
    "host": host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headersToSign).sort().join(";");
  const canonicalHeaders = Object.keys(headersToSign)
    .sort()
    .map((k) => `${k}:${headersToSign[k]}\n`)
    .join("");

  const canonicalRequest = [
    "DELETE",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSignatureKey(SECRET_ACCESS_KEY, dateStamp, "auto", "s3");
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      ...headersToSign,
      Authorization: authHeader,
    },
  });

  return res.ok;
}

// Helper: Extract object key from a full URL
function extractKeyFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      return pathname.startsWith("/") ? pathname.substring(1) : pathname;
    }
    return url;
  } catch {
    return null;
  }
}

// 🌟 POST: Upload Image directly to Cloudflare R2
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. If oldUrl exists and belongs to R2, automatically delete old image to save space
    if (oldUrl && (oldUrl.includes(".r2.dev") || oldUrl.includes("r2.cloudflarestorage.com"))) {
      const oldKey = extractKeyFromUrl(oldUrl);
      if (oldKey) {
        try {
          await deleteObjectFromR2(oldKey);
          console.log(`🗑️ [R2 Auto-Delete] Deleted old image: ${oldKey}`);
        } catch (delErr) {
          console.warn("[R2 Auto-Delete] Could not delete old file:", delErr);
        }
      }
    }

    // 2. Read file buffer directly without any Node native binary (100% Cloudflare Workers compatible)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let contentType = file.type || "image/webp";
    let extension = "webp";

    if (file.type === "image/svg+xml" || file.name?.toLowerCase().endsWith(".svg")) {
      contentType = "image/svg+xml";
      extension = "svg";
    } else if (file.type === "image/gif" || file.name?.toLowerCase().endsWith(".gif")) {
      contentType = "image/gif";
      extension = "gif";
    } else if (file.type === "image/png" && !file.name?.toLowerCase().endsWith(".webp")) {
      contentType = "image/png";
      extension = "png";
    } else if (file.type === "image/jpeg" && !file.name?.toLowerCase().endsWith(".webp")) {
      contentType = "image/jpeg";
      extension = "jpg";
    }

    const originalName = file.name || "image";
    const cleanBaseName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-")
      .replace(/\.[^/.]+$/, "");

    const uniqueKey = `${cleanBaseName}-${Date.now()}.${extension}`;

    // 3. Upload directly to Cloudflare R2 via Pure Web SigV4 Fetch
    await putObjectToR2({
      key: uniqueKey,
      body: bytes,
      contentType,
    });

    const fileUrl = `${PUBLIC_URL.replace(/\/+$/, "")}/${uniqueKey}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      key: uniqueKey,
    });
  } catch (error: any) {
    console.error("[R2 Upload Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload to Cloudflare R2" },
      { status: 500 }
    );
  }
}

// 🌟 DELETE: Delete Image from Cloudflare R2
export async function DELETE(req: NextRequest) {
  try {
    const { url, key } = await req.json();
    const targetKey = key || extractKeyFromUrl(url);

    if (!targetKey) {
      return NextResponse.json({ error: "No key or URL provided" }, { status: 400 });
    }

    await deleteObjectFromR2(targetKey);

    return NextResponse.json({
      success: true,
      message: `Deleted ${targetKey} from R2`,
    });
  } catch (error: any) {
    console.error("[R2 Delete Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete from Cloudflare R2" },
      { status: 500 }
    );
  }
}
