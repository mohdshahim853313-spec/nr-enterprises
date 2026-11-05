import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      );
    }

    // 1. Fetch secret key
    let key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    try {
      const { data: contentData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "payment_settings")
        .maybeSingle();

      if (contentData?.data?.razorpay_key_secret) key_secret = contentData.data.razorpay_key_secret;
    } catch (e) {
      // ignore
    }

    if (!key_secret) {
      try {
        const { data: settings } = await supabase
          .from("store_settings")
          .select("razorpay_key_secret")
          .eq("id", 1)
          .maybeSingle();

        if (settings?.razorpay_key_secret) key_secret = settings.razorpay_key_secret;
      } catch (dbErr) {
        console.warn("Could not fetch razorpay secret from database:", dbErr);
      }
    }

    if (!key_secret) {
      return NextResponse.json(
        { error: "Razorpay Key Secret is missing" },
        { status: 500 }
      );
    }

    // 2. Validate HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // 3. Save / Update order in Supabase
    if (orderDetails) {
      const finalizedOrder = {
        ...orderDetails,
        payment_status: "Paid",
        razorpay_order_id,
        razorpay_payment_id,
        paid_at: new Date().toISOString(),
      };

      try {
        await supabase.from("orders").insert(finalizedOrder);
      } catch (e) {
        console.warn("Could not insert directly into orders table:", e);
      }

      try {
        const { data: existingData } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "orders_list")
          .maybeSingle();

        const currentList = Array.isArray(existingData?.data?.list)
          ? existingData.data.list
          : [];
        const updatedList = [finalizedOrder, ...currentList];

        await supabase.from("site_content").upsert({
          id: "orders_list",
          data: { list: updatedList },
        });
      } catch (e) {
        console.warn("Could not update site_content orders_list:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
