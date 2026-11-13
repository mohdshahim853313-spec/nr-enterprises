import crypto from "crypto";
import { supabase } from "./supabase";

const ETSY_API_KEY = process.env.ETSY_KEYSTRING || "zylzcsf84xn2i4z8fvz26w6x";
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID || "67519876";

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePKCE() {
  const verifier = base64UrlEncode(crypto.randomBytes(32));
  const hash = crypto.createHash("sha256").update(verifier).digest();
  const challenge = base64UrlEncode(hash);
  return { verifier, challenge };
}

export function getEtsyAuthUrl(redirectUri: string, challenge: string, state: string): string {
  const scopes = ["listings_r", "listings_w", "shops_r"].join(" ");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: ETSY_API_KEY,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `https://www.etsy.com/oauth/connect?${params.toString()}`;
}

export async function exchangeEtsyCode(code: string, verifier: string, redirectUri: string) {
  const tokenUrl = "https://api.etsy.com/v3/public/oauth/token";

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: ETSY_API_KEY,
      redirect_uri: redirectUri,
      code,
      code_verifier: verifier,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Failed to exchange token with Etsy");
  }

  // Save tokens to Supabase
  const expiresAt = Date.now() + (data.expires_in || 86400) * 1000;
  await saveEtsyTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
  });

  return data;
}

export async function refreshEtsyToken(refreshToken: string) {
  const tokenUrl = "https://api.etsy.com/v3/public/oauth/token";

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: ETSY_API_KEY,
      refresh_token: refreshToken,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Failed to refresh Etsy token");
  }

  const expiresAt = Date.now() + (data.expires_in || 86400) * 1000;
  await saveEtsyTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
  });

  return data;
}

export async function saveEtsyTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}) {
  const { error } = await supabase.from("site_content").upsert({
    id: "etsy_oauth_tokens",
    data: tokens,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Error saving Etsy OAuth tokens to Supabase:", error);
  }
}

export async function getValidEtsyAccessToken(): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_content")
    .select("data")
    .eq("id", "etsy_oauth_tokens")
    .maybeSingle();

  if (error || !data?.data) {
    return null;
  }

  const tokens = data.data as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  // If token is still valid (with 5 min buffer)
  if (tokens.expires_at && tokens.expires_at > Date.now() + 5 * 60 * 1000) {
    return tokens.access_token;
  }

  // If expired, attempt auto-refresh
  if (tokens.refresh_token) {
    try {
      const refreshed = await refreshEtsyToken(tokens.refresh_token);
      return refreshed.access_token;
    } catch (refreshErr) {
      console.error("Auto-refresh failed for Etsy token:", refreshErr);
      return null;
    }
  }

  return null;
}
