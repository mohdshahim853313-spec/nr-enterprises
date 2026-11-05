import { supabase } from "@/lib/supabase";
import LegacyClient from "./LegacyClient";

export const dynamic = "force-dynamic";

export default async function LegacyPage() {
  let legacyData = null;
  try {
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "legacy")
      .maybeSingle();
    if (data?.data) {
      legacyData = data.data;
    }
  } catch (err) {
    console.error("Error loading legacy page content on server:", err);
  }

  return <LegacyClient initialData={legacyData} />;
}