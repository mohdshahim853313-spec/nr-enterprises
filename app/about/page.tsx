import { supabase } from "@/lib/supabase";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let aboutData = null;
  try {
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "about")
      .maybeSingle();
    if (data?.data) {
      aboutData = data.data;
    }
  } catch (err) {
    console.error("Error loading about page content on server:", err);
  }

  return <AboutClient initialData={aboutData} />;
}