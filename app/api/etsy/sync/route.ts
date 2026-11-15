import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ETSY_API_KEY = process.env.ETSY_KEYSTRING || "z0ru4blh5n07r4rvg9zkkkfh";
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET || "gf5x1nb01d2f3ldcm79zq18qy";
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID || "67519876";
const ETSY_SHOP_NAME = process.env.ETSY_SHOP_NAME || "AHADGLOBALRUGS";

const getEtsyHeaders = () => ({
  "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
  "Accept": "application/json",
});

// Helper to determine NR Enterprises category from Etsy title & tags
function inferCategory(title: string, tags: string[] = []): string {
  const combined = (title + " " + tags.join(" ")).toLowerCase();
  if (combined.includes("tufted") || combined.includes("tuft")) return "Tufted";
  if (combined.includes("jute") || combined.includes("braided") || combined.includes("pet fiber")) return "Jute";
  if (combined.includes("flatweave") || combined.includes("dhurrie") || combined.includes("kilim")) return "Flatweave";
  if (combined.includes("knotted") || combined.includes("oriental") || combined.includes("persian")) return "Hand-Knotted";
  if (combined.includes("runner") || combined.includes("hallway")) return "Runners";
  if (combined.includes("round") || combined.includes("circle") || combined.includes("oval")) return "Round & Oval";
  if (combined.includes("abstract") || combined.includes("geometric")) return "Abstract & Modern";
  return "Tufted";
}

// Helper to infer shape
function inferShape(title: string, tags: string[] = []): string {
  const combined = (title + " " + tags.join(" ")).toLowerCase();
  if (combined.includes("round") || combined.includes("circle")) return "Round";
  if (combined.includes("oval")) return "Oval";
  if (combined.includes("runner")) return "Runner";
  if (combined.includes("square")) return "Square";
  if (combined.includes("irregular") || combined.includes("arch") || combined.includes("contour")) return "Irregular";
  return "Rectangular";
}

// Helper to infer primary color
function inferColor(title: string, tags: string[] = []): string {
  const text = (title + " " + tags.join(" ")).toLowerCase();
  if (text.includes("beige") || text.includes("neutral") || text.includes("ivory") || text.includes("cream")) return "Beige & Neutral";
  if (text.includes("blue") || text.includes("navy")) return "Blue";
  if (text.includes("green") || text.includes("sage") || text.includes("olive")) return "Green";
  if (text.includes("rust") || text.includes("terracotta")) return "Rust & Terracotta";
  if (text.includes("grey") || text.includes("gray") || text.includes("charcoal")) return "Grey";
  if (text.includes("pink") || text.includes("rose") || text.includes("blush")) return "Pink";
  if (text.includes("black")) return "Black";
  if (text.includes("white")) return "White";
  if (text.includes("brown") || text.includes("tan") || text.includes("camel")) return "Brown & Earthy";
  if (text.includes("yellow") || text.includes("mustard") || text.includes("gold")) return "Yellow & Gold";
  if (text.includes("red") || text.includes("burgundy")) return "Red";
  if (text.includes("multicolor") || text.includes("multi color") || text.includes("colorful")) return "Multicolor";
  return "Neutral & Earthy";
}

// Helper to infer style
function inferStyle(title: string, tags: string[] = []): string {
  const text = (title + " " + tags.join(" ")).toLowerCase();
  if (text.includes("scandi") || text.includes("scandinavian") || text.includes("minimalist")) return "Scandinavian & Minimalist";
  if (text.includes("modern") || text.includes("contemporary")) return "Modern Contemporary";
  if (text.includes("boho") || text.includes("bohemian")) return "Bohemian";
  if (text.includes("moroccan") || text.includes("tribal")) return "Moroccan & Tribal";
  if (text.includes("vintage") || text.includes("antique")) return "Vintage & Classic";
  if (text.includes("abstract") || text.includes("art")) return "Artistic Abstract";
  return "Artisan Modern";
}

// Helper to infer pattern
function inferPattern(title: string, tags: string[] = []): string {
  const text = (title + " " + tags.join(" ")).toLowerCase();
  if (text.includes("bubble") || text.includes("pebble") || text.includes("bobble") || text.includes("3d")) return "3D Textured & Bubble";
  if (text.includes("checkered") || text.includes("checker") || text.includes("cross grid") || text.includes("grid")) return "Checkered & Grid";
  if (text.includes("geometric") || text.includes("line")) return "Geometric Lines";
  if (text.includes("solid") || text.includes("plain")) return "Solid Minimalist";
  if (text.includes("floral") || text.includes("botanical")) return "Floral & Botanical";
  return "Textured Artisan";
}

// Clean title: Etsy titles are often keyword-stuffed strings with 10 commas.
// Keep it concise and elegant for luxury presentation.
function cleanTitle(fullTitle: string): string {
  if (!fullTitle) return "Handcrafted Artisan Rug";
  // Often separated by commas
  const parts = fullTitle.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 0 && parts[0].length >= 10 && parts[0].length <= 70) {
    return parts[0];
  }
  // Otherwise take up to first 8 words
  const words = fullTitle.split(" ");
  if (words.length <= 8) return fullTitle.trim();
  return words.slice(0, 8).join(" ").trim();
}

// Standard rug sizes and multipliers for variant generation
const STANDARD_SIZES = [
  { size: "3 x 5 ft", multiplier: 1.0 },
  { size: "4 x 6 ft", multiplier: 1.6 },
  { size: "5 x 8 ft", multiplier: 2.6 },
  { size: "6 x 9 ft", multiplier: 3.5 },
  { size: "8 x 10 ft", multiplier: 5.2 },
  { size: "9 x 12 ft", multiplier: 7.0 },
];

/**
 * GET: Fetch Etsy active listings and compare with existing Supabase products
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // 1. Fetch all active listings from Etsy (bidirectional merge to exceed 100 anonymous offset limit)
    const listingsMap = new Map<number, any>();

    // Batch 1: Newest 100 listings (DESC)
    const resDesc = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100&sort_on=created&sort_order=desc`,
      { headers: getEtsyHeaders(), next: { revalidate: 30 } }
    );

    let totalShopCount = 0;
    if (resDesc.ok) {
      const dataDesc = await resDesc.json();
      totalShopCount = dataDesc.count || 0;
      (dataDesc.results || []).forEach((item: any) => listingsMap.set(item.listing_id, item));
    }

    // Batch 2: If shop has > 100 listings, fetch oldest listings (ASC) to capture all 146 without hitting offset limit
    if (totalShopCount > 100) {
      try {
        const resAsc = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100&sort_on=created&sort_order=asc`,
          { headers: getEtsyHeaders(), next: { revalidate: 30 } }
        );
        if (resAsc.ok) {
          const dataAsc = await resAsc.json();
          (dataAsc.results || []).forEach((item: any) => listingsMap.set(item.listing_id, item));
        }
      } catch (err) {
        console.warn("Could not fetch ASC batch for Etsy:", err);
      }
    }

    // Sort all combined listings by creation timestamp descending
    const etsyListings = Array.from(listingsMap.values()).sort(
      (a: any, b: any) => (b.original_creation_timestamp || b.created_timestamp || 0) - (a.original_creation_timestamp || a.created_timestamp || 0)
    );

    // 2. Fetch existing products from Supabase to check synced status and deleted status
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id, sku, etsy_url, name, price, images, status, tags, created_at");

    const syncedSkuMap = new Set((existingProducts || []).map((p) => p.sku).filter(Boolean));
    const syncedUrlMap = new Set((existingProducts || []).map((p) => p.etsy_url).filter(Boolean));
    const activeEtsyIdSet = new Set(etsyListings.map((l: any) => Number(l.listing_id)));

    // Detect products in our database that are no longer active on Etsy
    const deletedOnEtsy = (existingProducts || []).filter((p) => {
      if (!p.sku || !p.sku.startsWith("ETSY-")) return false;
      const etsyId = Number(p.sku.replace("ETSY-", ""));
      return !activeEtsyIdSet.has(etsyId);
    });

    const listingsWithStatus = etsyListings.map((item: any) => {
      const sku = `ETSY-${item.listing_id}`;
      const isSynced = syncedSkuMap.has(sku) || syncedUrlMap.has(item.url);
      const basePriceNum = item.price?.amount ? Math.round(item.price.amount / item.price.divisor) : 5000;

      return {
        listing_id: item.listing_id,
        title: item.title,
        clean_title: cleanTitle(item.title),
        price: `₹${basePriceNum}`,
        raw_price: basePriceNum,
        currency: item.price?.currency_code || "INR",
        quantity: item.quantity,
        url: item.url,
        tags: item.tags || [],
        materials: item.materials || [],
        category: inferCategory(item.title, item.tags),
        shape: inferShape(item.title, item.tags),
        is_synced: isSynced,
        created_timestamp: item.created_timestamp,
      };
    });

    return NextResponse.json({
      success: true,
      shop: {
        shop_id: ETSY_SHOP_ID,
        shop_name: ETSY_SHOP_NAME,
        shop_url: `https://www.etsy.com/shop/${ETSY_SHOP_NAME}`,
      },
      total: totalShopCount || listingsWithStatus.length,
      syncedCount: listingsWithStatus.filter((l: any) => l.is_synced).length,
      deletedOnEtsyCount: deletedOnEtsy.length,
      deletedOnEtsy: deletedOnEtsy,
      listings: listingsWithStatus,
    });
  } catch (error: any) {
    console.error("Error in GET /api/etsy/sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch Etsy listings" },
      { status: 500 }
    );
  }
}

/**
 * POST: Sync selected or all Etsy listings into Supabase products table
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingIds = [], syncAll = false, markupPercent = 0 } = body;

    // 1. Fetch listings from Etsy (bidirectional merge to cover all listings > 100)
    const listingsMap = new Map<number, any>();

    const resDesc = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100&sort_on=created&sort_order=desc`,
      { headers: getEtsyHeaders() }
    );

    let totalShopCount = 0;
    if (resDesc.ok) {
      const dataDesc = await resDesc.json();
      totalShopCount = dataDesc.count || 0;
      (dataDesc.results || []).forEach((item: any) => listingsMap.set(item.listing_id, item));
    } else {
      const errText = await resDesc.text();
      return NextResponse.json(
        { success: false, error: `Etsy API error: ${errText}` },
        { status: resDesc.status }
      );
    }

    if (totalShopCount > 100) {
      try {
        const resAsc = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100&sort_on=created&sort_order=asc`,
          { headers: getEtsyHeaders() }
        );
        if (resAsc.ok) {
          const dataAsc = await resAsc.json();
          (dataAsc.results || []).forEach((item: any) => listingsMap.set(item.listing_id, item));
        }
      } catch (err) {
        console.warn("Could not fetch ASC batch for Etsy POST sync:", err);
      }
    }

    let targetListings = Array.from(listingsMap.values());

    if (!syncAll && Array.isArray(listingIds) && listingIds.length > 0) {
      const idSet = new Set(listingIds.map(Number));
      targetListings = targetListings.filter((l: any) => idSet.has(l.listing_id));
    }

    if (targetListings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No listings selected to sync",
        syncedCount: 0,
      });
    }

    // 2. Process each listing (Fetch images and prepare product record)
    const results = [];
    const errors = [];

    const markupMultiplier = Number(markupPercent) > 0 ? (1 + Number(markupPercent) / 100) : 1;

    for (const listing of targetListings) {
      try {
        const sku = `ETSY-${listing.listing_id}`;
        const rawEtsyPrice = listing.price?.amount
          ? Math.round(listing.price.amount / listing.price.divisor)
          : 5000;
        const basePriceNum = Math.round(rawEtsyPrice * markupMultiplier);
        const originalPriceNum = Math.round(basePriceNum * 1.5); // 33% discount display

        // Fetch all images for this listing from Etsy
        let imageUrls: string[] = [];
        try {
          const imgRes = await fetch(
            `https://openapi.etsy.com/v3/application/listings/${listing.listing_id}/images`,
            { headers: getEtsyHeaders() }
          );
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            imageUrls = (imgData.results || []).map(
              (i: any) => i.url_fullxfull || i.url_570xN
            );
          }
        } catch (imgErr) {
          console.warn(`Could not fetch images for listing ${listing.listing_id}:`, imgErr);
        }

        const category = inferCategory(listing.title, listing.tags);
        const shape = inferShape(listing.title, listing.tags);
        const primaryMaterial =
          Array.isArray(listing.materials) && listing.materials.length > 0
            ? listing.materials.join(", ")
            : "Pure New Zealand Wool Blend";

        // Generate standard size variants with proportional pricing
        const variants = STANDARD_SIZES.map((s) => ({
          size: s.size,
          dimensions: s.size.replace(" ft", ""),
          unit: "ft",
          price: String(Math.round(basePriceNum * s.multiplier)),
          base_price: String(Math.round(basePriceNum * s.multiplier)),
          original_price: String(Math.round(originalPriceNum * s.multiplier)),
          markup_percent: 50,
          discount_percent: 33,
        }));

        // Check if product already exists by sku
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("sku", sku)
          .maybeSingle();

        const productPayload: Record<string, any> = {
          name: cleanTitle(listing.title),
          original_name: listing.title,
          sku: sku,
          price: `₹${basePriceNum}`,
          original_price: `₹${originalPriceNum}`,
          discount_percent: 33,
          category: category,
          shape: shape,
          material: primaryMaterial,
          color: inferColor(listing.title, listing.tags),
          style: inferStyle(listing.title, listing.tags),
          pattern: inferPattern(listing.title, listing.tags),
          room: "Living Room, Bedroom, Foyer, Lounge",
          created_at: new Date(
            (listing.original_creation_timestamp || listing.created_timestamp || Date.now() / 1000) * 1000
          ).toISOString(),
          description: listing.description || `Handcrafted artisanal rug by NR Enterprises Bhadohi atelier.`,
          care_instructions:
            "Vacuum regularly with suction only (do not use revolving beater brush). Spot clean gently with mild wool-safe detergent and cold water. Professional dry clean recommended for longevity.",
          sizes: STANDARD_SIZES.map((s) => s.size),
          variants: variants,
          stock_quantity: listing.quantity || 5,
          tags: listing.tags || [],
          status: "published",
          is_customizable: true,
          free_delivery: true,
          processing_type: "Made to Order",
          processing_time: "Ships in 5-8 business days",
          return_policy: "Returns accepted within 14 days of delivery",
          show_etsy: true,
          etsy_url: listing.url,
        };

        // Only override images if we got fresh images from Etsy
        if (imageUrls.length > 0) {
          productPayload.images = imageUrls;
        }

        if (existingProduct?.id) {
          // Update existing product
          const { error: updateErr } = await supabase
            .from("products")
            .update(productPayload)
            .eq("id", existingProduct.id);

          if (updateErr) throw updateErr;
          results.push({ id: existingProduct.id, listing_id: listing.listing_id, action: "updated" });
        } else {
          // Insert new product
          const { data: newProd, error: insertErr } = await supabase
            .from("products")
            .insert(productPayload)
            .select("id")
            .single();

          if (insertErr) throw insertErr;
          results.push({ id: newProd?.id, listing_id: listing.listing_id, action: "inserted" });
        }
      } catch (itemErr: any) {
        console.error(`Error syncing listing ${listing.listing_id}:`, itemErr);
        errors.push({ listing_id: listing.listing_id, error: itemErr.message });
      }
    }

    if (results.length === 0 && errors.length > 0) {
      const firstErr = errors[0]?.error || "Database insert failed";
      return NextResponse.json(
        {
          success: false,
          error: `Database sync failed: ${firstErr}. Supabase me 'products' table nahi mili — pehle SQL Editor me schema run karein.`,
          syncedCount: 0,
          errorsCount: errors.length,
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.length} listings from Etsy!`,
      syncedCount: results.length,
      errorsCount: errors.length,
      results,
      errors,
    });
  } catch (error: any) {
    console.error("Error in POST /api/etsy/sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync Etsy listings" },
      { status: 500 }
    );
  }
}
