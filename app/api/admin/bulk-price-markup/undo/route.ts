import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getValidEtsyAccessToken } from "@/lib/etsyOAuth";

const ETSY_KEYSTRING = process.env.ETSY_KEYSTRING || "z0ru4blh5n07r4rvg9zkkkfh";
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET || "gf5x1nb01d2f3ldcm79zq18qy";
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID || "67519876";

/**
 * GET: Retrieve price update history / latest undoable snapshot
 */
export async function GET() {
  try {
    const { data: histDoc } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "price_markup_history")
      .maybeSingle();

    const snapshots = Array.isArray(histDoc?.data?.snapshots) ? histDoc.data.snapshots : [];

    const summaries = snapshots.map((s: any) => ({
      id: s.id,
      timestamp: s.timestamp,
      description: s.description,
      percent: s.percent,
      productsCount: s.productsCount || (s.products ? s.products.length : 0),
      products: Array.isArray(s.products)
        ? s.products.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            image: p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : ""),
            old_price: p.old_price || p.price,
            new_price: p.new_price || p.price,
          }))
        : [],
    }));

    return NextResponse.json({
      success: true,
      hasHistory: summaries.length > 0,
      latestSnapshot: summaries[0] || null,
      history: summaries,
    });
  } catch (error: any) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch price history" },
      { status: 500 }
    );
  }
}

/**
 * POST: Undo/Revert previous price change on Website and live on Etsy
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { snapshotId } = body;

    // 1. Fetch history from site_content
    const { data: histDoc, error: fetchErr } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "price_markup_history")
      .maybeSingle();

    if (fetchErr) {
      throw new Error(`Failed to load history: ${fetchErr.message}`);
    }

    const snapshots = Array.isArray(histDoc?.data?.snapshots) ? histDoc.data.snapshots : [];
    if (snapshots.length === 0) {
      return NextResponse.json(
        { success: false, error: "Koi previous price snapshot nahi mila jise undo kiya ja sake." },
        { status: 404 }
      );
    }

    const targetSnapshot = snapshotId
      ? snapshots.find((s: any) => s.id === snapshotId)
      : snapshots[0];

    if (!targetSnapshot || !Array.isArray(targetSnapshot.products) || targetSnapshot.products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Target snapshot empty ya unavailable hai." },
        { status: 404 }
      );
    }

    // 2. Retrieve valid Etsy OAuth token to revert live Etsy shop
    let etsyToken: string | null = null;
    try {
      etsyToken = await getValidEtsyAccessToken();
    } catch (e) {
      console.warn("Could not retrieve Etsy token during undo:", e);
    }

    let restoredCount = 0;
    let etsyRestoredCount = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // 3. Revert each product back to its snapshot state
    for (const prod of targetSnapshot.products) {
      try {
        const updatePayload: Record<string, any> = {
          price: prod.price,
          variants: prod.variants,
        };
        if (prod.original_price) {
          updatePayload.original_price = prod.original_price;
        }

        const { error: upErr } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", prod.id);

        if (upErr) throw upErr;
        restoredCount++;

        // Live Revert on Etsy Shop
        if (etsyToken && prod.sku && prod.sku.startsWith("ETSY-")) {
          const etsyListingId = prod.sku.replace("ETSY-", "");
          try {
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
                // Map snapshot variant sizes to previous prices
                const variantPriceMap = new Map<string, number>();
                if (Array.isArray(prod.variants)) {
                  prod.variants.forEach((v: any) => {
                    const p = parseFloat(String(v.price || "0").replace(/[^0-9.]/g, "")) || 0;
                    if (v.size && p > 0) {
                      variantPriceMap.set(v.size.trim().toLowerCase(), p);
                    }
                  });
                }

                const restoredBaseNum =
                  parseFloat(String(prod.price || "0").replace(/[^0-9.]/g, "")) || 5000;

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
                    let targetPriceNum = restoredBaseNum;
                    for (const pv of p.property_values || []) {
                      for (const val of pv.values || []) {
                        const matched = variantPriceMap.get((val || "").trim().toLowerCase());
                        if (matched) {
                          targetPriceNum = matched;
                          break;
                        }
                      }
                    }

                    const div = o.price?.divisor || 100;
                    return {
                      price: {
                        amount: Math.round(targetPriceNum * div),
                        divisor: div,
                        currency_code: o.price?.currency_code || "INR",
                      },
                      quantity: o.quantity || 5,
                      is_enabled: o.is_enabled !== undefined ? o.is_enabled : true,
                      readiness_state_id: o.readiness_state_id,
                    };
                  }),
                }));

                const putRes = await fetch(
                  `https://openapi.etsy.com/v3/application/listings/${etsyListingId}/inventory`,
                  {
                    method: "PUT",
                    headers: {
                      "x-api-key": `${ETSY_KEYSTRING}:${ETSY_SHARED_SECRET}`,
                      Authorization: `Bearer ${etsyToken}`,
                      "Content-Type": "application/json",
                      Accept: "application/json",
                    },
                    body: JSON.stringify({ products: productsPayload }),
                  }
                );

                if (putRes.ok) etsyRestoredCount++;
              } else {
                // Simple listing without variations
                const restoredBaseNum =
                  parseFloat(String(prod.price || "0").replace(/[^0-9.]/g, "")) || 5000;
                const patchRes = await fetch(
                  `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/${etsyListingId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "x-api-key": `${ETSY_KEYSTRING}:${ETSY_SHARED_SECRET}`,
                      Authorization: `Bearer ${etsyToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ price: restoredBaseNum }),
                  }
                );
                if (patchRes.ok) etsyRestoredCount++;
              }
            }
          } catch (etsyErr: any) {
            console.warn(`Could not revert Etsy price for listing ${etsyListingId}:`, etsyErr.message);
          }
        }
      } catch (itemErr: any) {
        errors.push({ id: prod.id, error: itemErr.message });
      }
    }

    // 4. Remove this reverted snapshot from site_content history
    const remainingSnapshots = snapshots.filter((s: any) => s.id !== targetSnapshot.id);
    await supabase.from("site_content").upsert({
      id: "price_markup_history",
      data: {
        snapshots: remainingSnapshots,
        last_reverted_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Undo Success! Restored ${restoredCount} listings (${etsyRestoredCount} live on Etsy Shop) back to normal original prices!`,
      restoredCount,
      etsyRestoredCount,
      revertedSnapshot: {
        id: targetSnapshot.id,
        description: targetSnapshot.description,
        timestamp: targetSnapshot.timestamp,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/bulk-price-markup/undo:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to undo price changes" },
      { status: 500 }
    );
  }
}
