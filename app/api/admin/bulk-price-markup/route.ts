import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      percent = 0,
      productIds = [],
      applyToAll = true,
      regions = ["india", "us", "everywhere_else"],
    } = body;

    const numericPercent = parseFloat(percent);
    if (isNaN(numericPercent) || numericPercent === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid non-zero markup percentage." },
        { status: 400 }
      );
    }

    const multiplier = 1 + numericPercent / 100;

    // 1. Fetch target products
    let query = supabase.from("products").select("id, name, sku, price, original_price, variants");

    if (!applyToAll && Array.isArray(productIds) && productIds.length > 0) {
      query = query.in("id", productIds);
    }

    const { data: products, error: fetchErr } = await query;

    if (fetchErr || !products) {
      throw new Error(fetchErr?.message || "Failed to load products from database");
    }

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found to update.",
        updatedCount: 0,
      });
    }

    // 2. Process and update each product
    let updatedCount = 0;
    const errors: Array<{ id: string; error: string }> = [];
    const samplePreview: any[] = [];

    for (const product of products) {
      try {
        const rawCurrentPrice = product.price ? String(product.price).replace(/[^0-9.]/g, "") : "0";
        const currentPriceNum = parseFloat(rawCurrentPrice) || 0;
        const newPriceNum = Math.round(currentPriceNum * multiplier);

        const rawOrigPrice = product.original_price
          ? String(product.original_price).replace(/[^0-9.]/g, "")
          : null;
        const origPriceNum = rawOrigPrice ? parseFloat(rawOrigPrice) : null;
        const newOrigPriceNum = origPriceNum ? Math.round(origPriceNum * multiplier) : null;

        // Recalculate variants
        let updatedVariants = product.variants;
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          updatedVariants = product.variants.map((v: any) => {
            const vPrice = parseFloat(String(v.price || "0").replace(/[^0-9.]/g, "")) || 0;
            const newVPrice = Math.round(vPrice * multiplier);

            const vBasePrice = parseFloat(String(v.base_price || v.price || "0").replace(/[^0-9.]/g, "")) || 0;
            const newVBasePrice = Math.round(vBasePrice * multiplier);

            let newVOrigPrice = v.original_price;
            if (v.original_price) {
              const vOrig = parseFloat(String(v.original_price).replace(/[^0-9.]/g, "")) || 0;
              newVOrigPrice = String(Math.round(vOrig * multiplier));
            }

            return {
              ...v,
              price: String(newVPrice),
              base_price: String(newVBasePrice),
              original_price: newVOrigPrice,
            };
          });
        }

        const updatePayload: Record<string, any> = {
          price: `₹${newPriceNum}`,
          variants: updatedVariants,
        };

        if (newOrigPriceNum) {
          updatePayload.original_price = `₹${newOrigPriceNum}`;
        }

        const { error: updateErr } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", product.id);

        if (updateErr) throw updateErr;

        updatedCount++;

        if (samplePreview.length < 3) {
          samplePreview.push({
            name: product.name,
            oldPrice: `₹${currentPriceNum}`,
            newPrice: `₹${newPriceNum}`,
            variantsCount: Array.isArray(updatedVariants) ? updatedVariants.length : 0,
          });
        }
      } catch (err: any) {
        console.error(`Failed to update product ${product.id}:`, err);
        errors.push({ id: product.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Successfully updated prices for ${updatedCount} listings (+${numericPercent}%) across India, US, and Everywhere Else!`,
      updatedCount,
      percent: numericPercent,
      regions,
      samplePreview,
      errorsCount: errors.length,
      errors: errors.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/bulk-price-markup:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update prices" },
      { status: 500 }
    );
  }
}
