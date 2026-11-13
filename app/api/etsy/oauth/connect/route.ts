import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generatePKCE, getEtsyAuthUrl } from "@/lib/etsyOAuth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/etsy/oauth/callback`;

  const { verifier, challenge } = generatePKCE();
  const state = Math.random().toString(36).substring(2, 15);

  const cookieStore = await cookies();
  cookieStore.set("etsy_pkce_verifier", verifier, {
    httpOnly: true,
    secure: protocol === "https",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 mins
    path: "/",
  });

  cookieStore.set("etsy_oauth_state", state, {
    httpOnly: true,
    secure: protocol === "https",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  const authUrl = getEtsyAuthUrl(redirectUri, challenge, state);
  return NextResponse.redirect(authUrl);
}
