import { supabase } from "./supabase";

export interface ColorVariant {
  color: string;
  image: string;
  hex?: string;
}

/**
 * 🌟 Helper function to extract color variants from any product object.
 * Checks top-level, variants[0], or fallback.
 */
export function getColorVariants(product: any): ColorVariant[] {
  if (!product) return [];
  if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
    return product.color_variants;
  }
  if (Array.isArray(product.variants?.[0]?.color_variants) && product.variants[0].color_variants.length > 0) {
    return product.variants[0].color_variants;
  }
  return [];
}

/**
 * 🌟 Helper function for AI scripts / code to programmatically save or update
 * color variations (linking colors to photos) for any product.
 */
export async function updateProductColorVariants(
  productId: string,
  colorVariants: ColorVariant[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch current product
    const { data: prod, error: fetchErr } = await supabase
      .from("products")
      .select("variants")
      .eq("id", productId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    // 2. Update variants JSONB
    const variants = Array.isArray(prod?.variants) && prod.variants.length > 0
      ? [...prod.variants]
      : [{ size: "Standard", price: "0" }];

    variants[0] = {
      ...variants[0],
      color_variants: colorVariants,
    };

    const { error: updateErr } = await supabase
      .from("products")
      .update({ variants })
      .eq("id", productId);

    if (updateErr) throw updateErr;

    // 3. Sync site_content registry
    try {
      const { data: sReg } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "product_color_variants")
        .maybeSingle();

      const registry = sReg?.data ? { ...sReg.data } : {};
      registry[productId] = colorVariants;

      await supabase.from("site_content").upsert({
        id: "product_color_variants",
        data: registry,
      });
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update color variants" };
  }
}
