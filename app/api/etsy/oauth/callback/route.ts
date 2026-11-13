import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeEtsyCode } from "@/lib/etsyOAuth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/etsy/oauth/callback`;

  if (error) {
    console.error("Etsy OAuth error from Etsy redirect:", error, errorDescription);
    return NextResponse.redirect(
      `${protocol}://${host}/admin?etsy_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${protocol}://${host}/admin?etsy_error=${encodeURIComponent("Missing authorization code from Etsy")}`
    );
  }

  const cookieStore = await cookies();
  const verifier = cookieStore.get("etsy_pkce_verifier")?.value;

  if (!verifier) {
    return NextResponse.redirect(
      `${protocol}://${host}/admin?etsy_error=${encodeURIComponent("Session expired. Please click Connect Etsy again.")}`
    );
  }

  try {
    await exchangeEtsyCode(code, verifier, redirectUri);

    // Clean up cookies
    cookieStore.delete("etsy_pkce_verifier");
    cookieStore.delete("etsy_oauth_state");

    return NextResponse.redirect(`${protocol}://${host}/admin?etsy_connected=true`);
  } catch (err: any) {
    console.error("Failed to exchange Etsy OAuth code:", err);
    return NextResponse.redirect(
      `${protocol}://${host}/admin?etsy_error=${encodeURIComponent(err.message || "Failed to exchange token")}`
    );
  }
}
