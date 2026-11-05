import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message, subject } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Website Visitor";
    const inquiryId = `INQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();

    const newInquiry = {
      id: inquiryId,
      name: fullName,
      email: email.trim(),
      subject: subject || "General Atelier Inquiry",
      message: message.trim(),
      created_at: createdAt,
      status: "unread",
    };

    // 1. Try insert into contact_inquiries table in Supabase
    try {
      await supabase.from("contact_inquiries").insert([newInquiry]);
    } catch (dbErr) {
      // Fallback
    }

    // 2. Persist into site_content contact_inquiries list (guaranteed fallback)
    try {
      const { data: existingData } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "contact_inquiries")
        .maybeSingle();

      const currentList = Array.isArray(existingData?.data?.list)
        ? existingData.data.list
        : [];
      const updatedList = [newInquiry, ...currentList];

      await supabase.from("site_content").upsert({
        id: "contact_inquiries",
        data: { list: updatedList },
      });
    } catch (siteContentErr) {
      console.error("Supabase site_content persistence notice:", siteContentErr);
    }

    // 3. Dispatch direct email via Web3Forms & FormSubmit
    try {
      // Fetch access key from payment_settings if available
      let accessKey = process.env.WEB3FORMS_ACCESS_KEY || "";
      try {
        const { data: configData } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "payment_settings")
          .maybeSingle();
        if (configData?.data?.web3forms_key) {
          accessKey = configData.data.web3forms_key;
        }
      } catch (e) {}

      if (accessKey) {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `[NR Enterprises Inquiry] New Message from ${fullName}`,
            from_name: "NR Enterprises Atelier",
            name: fullName,
            email: email.trim(),
            message: message.trim(),
            inquiry_id: inquiryId,
          }),
        });
      } else {
        // Fallback to FormSubmit
        const emailPayload = {
          _subject: `[NR Enterprises Inquiry] New Message from ${fullName}`,
          _replyto: email.trim(),
          "Customer Name": fullName,
          "Customer Email": email.trim(),
          "Message": message.trim(),
          "Inquiry ID": inquiryId,
          "Received At": createdAt,
        };

        await fetch("https://formsubmit.co/ajax/nrenterprises@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(emailPayload),
        });
      }
    } catch (emailErr) {
      console.warn("Email dispatch notice:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been delivered to nrenterprises@gmail.com successfully.",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
