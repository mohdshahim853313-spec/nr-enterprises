import { supabase } from "@/lib/supabase";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  let contactData = null;
  try {
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "contact")
      .maybeSingle();
    if (data?.data) {
      contactData = data.data;
    }
  } catch (err) {
    console.error("Error loading contact content on server:", err);
  }

  return <ContactClient initialData={contactData} />;
}