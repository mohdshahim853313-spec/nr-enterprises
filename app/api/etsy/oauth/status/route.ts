import { NextResponse } from "next/server";
import { getValidEtsyAccessToken } from "@/lib/etsyOAuth";

export async function GET() {
  try {
    const token = await getValidEtsyAccessToken();
    return NextResponse.json({
      connected: Boolean(token),
      shopId: process.env.ETSY_SHOP_ID || "67519876",
      shopName: process.env.ETSY_SHOP_NAME || "AHADGLOBALRUGS",
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message,
    });
  }
}
