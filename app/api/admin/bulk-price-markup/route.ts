import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getValidEtsyAccessToken } from "@/lib/etsyOAuth";

const ETSY_KEYSTRING = process.env.ETSY_KEYSTRING || "z0ru4blh5n07r4rvg9zkkkfh";
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET || "gf5x1nb01d2f3ldcm79zq18qy";
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID || "67519876";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      percent = 0,
      productIds = [],
      applyToAll = true,
      regions = ["india", "us", "everywhere_else"],
      syncToEtsy = true,
    } = body;

    const numericPercent = parseFloat(percent);
    if (isNaN(numericPercent) || numericPercent === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid non-zero percentage." },
        { status: 400 }
      );
    }

    const multiplier = 1 + numericPercent / 100;

    // 1. Fetch target products
    let query = supabase.from("products").select("id, name, sku, images, price, original_price, variants");

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
        etsyUpdatedCount: 0,
      });
    }

    // 2. Check if Etsy OAuth token is active for live Etsy Shop update
    let etsyToken: string | null = null;
    if (syncToEtsy) {
      try {
        etsyToken = await getValidEtsyAccessToken();
      } catch (tokenErr) {
        console.warn("Could not retrieve Etsy token:", tokenErr);
      }
    }

    // 2.5. Automatic Safety Snapshot: Store exact previous state so admin can 1-click Undo / Rollback anytime
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: `${numericPercent > 0 ? "+" : ""}${numericPercent}% on ${products.length} listing(s)`,
      percent: numericPercent,
      productsCount: products.length,
      products: products.map((p) => {
        const rawCurrentPrice = p.price ? String(p.price).replace(/[^0-9.]/g, "") : "0";
        const currentPriceNum = parseFloat(rawCurrentPrice) || 0;
        const newPriceNum = Math.max(1, Math.round(currentPriceNum * multiplier));
        const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "";
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          image: firstImg,
          old_price: `₹${currentPriceNum}`,
          new_price: `₹${newPriceNum}`,
          price: p.price,
          original_price: p.original_price,
          variants: p.variants,
        };
      }),
    };

    try {
      const { data: histDoc } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", "price_markup_history")
        .maybeSingle();

      const existingSnapshots = Array.isArray(histDoc?.data?.snapshots) ? histDoc.data.snapshots : [];
      const updatedSnapshots = [snapshot, ...existingSnapshots].slice(0, 10);

      await supabase.from("site_content").upsert({
        id: "price_markup_history",
        data: {
          snapshots: updatedSnapshots,
          last_snapshot_at: new Date().toISOString(),
        },
      });
    } catch (snapErr) {
      console.warn("Failed to save price undo snapshot:", snapErr);
    }

    // 3. Process and update each product on Website
    let updatedCount = 0;
    let etsyUpdatedCount = 0;
    const errors: Array<{ id: string; error: string }> = [];
    const samplePreview: any[] = [];

    for (const product of products) {
      try {
        const rawCurrentPrice = product.price ? String(product.price).replace(/[^0-9.]/g, "") : "0";
        const currentPriceNum = parseFloat(rawCurrentPrice) || 0;
        const newPriceNum = Math.max(1, Math.round(currentPriceNum * multiplier));

        const rawOrigPrice = product.original_price
          ? String(product.original_price).replace(/[^0-9.]/g, "")
          : null;
        const origPriceNum = rawOrigPrice ? parseFloat(rawOrigPrice) : null;
        const newOrigPriceNum = origPriceNum ? Math.max(1, Math.round(origPriceNum * multiplier)) : null;

        // Recalculate variants
        let updatedVariants = product.variants;
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          updatedVariants = product.variants.map((v: any) => {
            const vPrice = parseFloat(String(v.price || "0").replace(/[^0-9.]/g, "")) || 0;
            const newVPrice = Math.max(1, Math.round(vPrice * multiplier));

            const vBasePrice = parseFloat(String(v.base_price || v.price || "0").replace(/[^0-9.]/g, "")) || 0;
            const newVBasePrice = Math.max(1, Math.round(vBasePrice * multiplier));

            let newVOrigPrice = v.original_price;
            if (v.original_price) {
              const vOrig = parseFloat(String(v.original_price).replace(/[^0-9.]/g, "")) || 0;
              newVOrigPrice = String(Math.max(1, Math.round(vOrig * multiplier)));
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

        // 4. Live update on Etsy Shop (if token available and product has ETSY SKU)
        if (etsyToken && product.sku && product.sku.startsWith("ETSY-")) {
          const etsyListingId = product.sku.replace("ETSY-", "");
          let etsySuccess = false;

          try {
            // First check if listing has variation offerings in /inventory
            const invRes = await fetch(
              `https://openapi.etsy.com/v3/application/listings/${etsyListingId}/inventory`,
              {
                headers: {
                  "x-api-key": `${ETSY_KEYSTRING}:${ETSY_SHARED_SECRET}`,
                  Authorization: `Bearer ${etsyToken}`,
                  Accept: "application/json",
                },
              }
            );

            if (invRes.ok) {
              const invData = await invRes.json();
              if (Array.isArray(invData.products) && invData.products.length > 0) {
                const productsPayload = invData.products.map((p: any) => ({
                  sku: p.sku || "",
                  property_values: (p.property_values || []).map((pv: any) => ({
                    property_id: pv.property_id,
                    property_name: pv.property_name || "SIZE CHART",
                    value_ids: pv.value_ids,
                    values: pv.values,
                    scale_id: pv.scale_id || null,
                  })),
                  offerings: (p.offerings || []).map((o: any) => {
                    const rawPrice = o.price ? o.price.amount / o.price.divisor : 5000;
                    const scaledPrice = Math.max(1, Math.round(rawPrice * multiplier));
                    return {
                      price: scaledPrice,
                      quantity: o.quantity || 1,
                      is_enabled: o.is_enabled !== false,
                      readiness_state_id: o.readiness_state_id,
                    };
                  }),
                }));

                const putInvRes = await fetch(
                  `https://openapi.etsy.com/v3/application/listings/${etsyListingId}/inventory`,
                  {
                    method: "PUT",
                    headers: {
                      "x-api-key": `${ETSY_KEYSTRING}:${ETSY_SHARED_SECRET}`,
                      Authorization: `Bearer ${etsyToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      products: productsPayload,
                      price_on_property: invData.price_on_property || [],
                      quantity_on_property: invData.quantity_on_property || [],
                      sku_on_property: invData.sku_on_property || [],
                    }),
                  }
                );

                if (putInvRes.ok) {
                  etsySuccess = true;
                } else {
                  console.warn(`Etsy inventory PUT error for ${etsyListingId}:`, await putInvRes.text());
                }
              }
            }

            // Also update top-level price on the listing
            const patchRes = await fetch(
              `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${etsyListingId}`,
              {
                method: "PATCH",
                headers: {
                  "x-api-key": `${ETSY_KEYSTRING}:${ETSY_SHARED_SECRET}`,
                  Authorization: `Bearer ${etsyToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  price: newPriceNum,
                }),
              }
            );

            if (patchRes.ok) {
              etsySuccess = true;
            }

            if (etsySuccess) {
              etsyUpdatedCount++;
            }
          } catch (etsyErr: any) {
            console.warn(`Could not sync price to Etsy for listing ${etsyListingId}:`, etsyErr.message);
          }
        }
      } catch (err: any) {
        console.error(`Failed to update product ${product.id}:`, err);
        errors.push({ id: product.id, error: err.message });
      }
    }

    const isPositive = numericPercent > 0;
    const signLabel = isPositive ? `+${numericPercent}% Markup` : `${numericPercent}% Discount`;

    let successMsg = `🎉 Successfully updated prices for ${updatedCount} listings (${signLabel}) on website!`;
    if (etsyUpdatedCount > 0) {
      successMsg += ` Also updated ${etsyUpdatedCount} listings live on Etsy Shop!`;
    } else if (!etsyToken && syncToEtsy) {
      successMsg += ` (Note: Website is updated! To sync live to Etsy shop, please click 'Connect Etsy' once in Admin).`;
    }

    return NextResponse.json({
      success: true,
      message: successMsg,
      updatedCount,
      etsyUpdatedCount,
      etsyConnected: Boolean(etsyToken),
      percent: numericPercent,
      regions,
      samplePreview,
      snapshotId: snapshot.id,
      canUndo: true,
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
