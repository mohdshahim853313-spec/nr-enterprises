import { supabase } from "@/lib/supabase";
import CollectionsClient from "./CollectionsClient";
import { DEFAULT_FILTER_SETTINGS } from "@/lib/filterConfig";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  let pageContent = null;
  let filterConfig = DEFAULT_FILTER_SETTINGS;
  let initialProducts: any[] = [];

  try {
    const [contentRes, filtersRes, productsRes] = await Promise.all([
      supabase.from("site_content").select("data").eq("id", "collections").maybeSingle(),
      supabase.from("site_content").select("data").eq("id", "filter_settings").maybeSingle(),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);

    if (contentRes?.data?.data) {
      pageContent = contentRes.data.data;
    }

    if (filtersRes?.data?.data) {
      filterConfig = {
        types: filtersRes.data.data.types || DEFAULT_FILTER_SETTINGS.types,
        materials: filtersRes.data.data.materials || DEFAULT_FILTER_SETTINGS.materials,
        colors: filtersRes.data.data.colors || DEFAULT_FILTER_SETTINGS.colors,
        patterns: filtersRes.data.data.patterns || DEFAULT_FILTER_SETTINGS.patterns,
        shapes: filtersRes.data.data.shapes || DEFAULT_FILTER_SETTINGS.shapes,
      };
    }

    if (productsRes?.data) {
      initialProducts = productsRes.data;
    }
  } catch (err) {
    console.error("Error loading collections server content:", err);
  }

  return (
    <CollectionsClient
      initialPageContent={pageContent}
      initialFilterConfig={filterConfig}
      initialProducts={initialProducts}
    />
  );
}