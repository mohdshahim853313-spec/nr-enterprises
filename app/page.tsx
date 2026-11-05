import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

function cleanData(raw: any) {
  if (!raw) return null;
  try {
    const str = JSON.stringify(raw)
      .replaceAll("scandinavian_living_room_rug-1789664963086.webp", "scandinavian_living_room_centered-1790130932889.webp")
      .replaceAll("braided_rug_patio-1790062192117.webp", "braided_rug_patio-1790142906085.webp")
      .replaceAll("cozy_reading_nook_1-1789700818344.webp", "cozy_reading_nook_1-1790142709808.webp")
      .replaceAll("photo-1631679706909-1844bbd07221-1789665033768.webp", "photo-1444362408440-274ecb6fc730-1789700907085.webp");
    return JSON.parse(str);
  } catch {
    return raw;
  }
}

export default async function Page() {
  let initialSiteData = null;
  try {
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "home")
      .maybeSingle();

    if (data && data.data) {
      initialSiteData = cleanData(data.data);
    }
  } catch (err) {
    console.error("Error fetching homepage content on server:", err);
  }

  return <HomeClient initialSiteData={initialSiteData} />;
}