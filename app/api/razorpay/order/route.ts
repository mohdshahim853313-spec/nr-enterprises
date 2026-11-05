import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt, notes } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // 1. Get Razorpay credentials (priority: site_content -> store_settings -> env variables)
    let key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    let key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    try {
      const { data: contentData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "payment_settings")
        .maybeSingle();

      if (contentData?.data?.razorpay_key_id) key_id = contentData.data.razorpay_key_id;
      if (contentData?.data?.razorpay_key_secret) key_secret = contentData.data.razorpay_key_secret;
    } catch (e) {
      // ignore
    }

    if (!key_id || !key_secret) {
      try {
        const { data: settings } = await supabase
          .from("store_settings")
          .select("razorpay_key_id, razorpay_key_secret")
          .eq("id", 1)
          .maybeSingle();

        if (settings?.razorpay_key_id) key_id = settings.razorpay_key_id;
        if (settings?.razorpay_key_secret) key_secret = settings.razorpay_key_secret;
      } catch (dbErr) {
        console.warn("Could not fetch razorpay settings from database:", dbErr);
      }
    }

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { 
          error: "Razorpay keys are not configured yet. Please configure Razorpay Key ID & Secret in the Admin Panel or environment variables." 
        }, 
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    // Razorpay requires amount in subunits (e.g. paise for INR, cents for USD)
    const subunitAmount = Math.round(Number(amount) * 100);

    const options = {
      amount: subunitAmount,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
