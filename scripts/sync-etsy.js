const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const ETSY_API_KEY = process.env.ETSY_KEYSTRING || "z0ru4blh5n07r4rvg9zkkkfh";
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET || "gf5x1nb01d2f3ldcm79zq18qy";
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID || "67519876";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const getEtsyHeaders = () => ({
  "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
  Accept: "application/json",
});

function inferCategory(title = "", tags = []) {
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

function inferShape(title = "", tags = []) {
  const combined = (title + " " + tags.join(" ")).toLowerCase();
  if (combined.includes("round") || combined.includes("circle")) return "Round";
  if (combined.includes("oval")) return "Oval";
  if (combined.includes("runner")) return "Runner";
  if (combined.includes("square")) return "Square";
  if (combined.includes("irregular") || combined.includes("arch") || combined.includes("contour")) return "Irregular";
  return "Rectangular";
}

function inferColor(title = "", tags = []) {
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

function inferStyle(title = "", tags = []) {
  const text = (title + " " + tags.join(" ")).toLowerCase();
  if (text.includes("scandi") || text.includes("scandinavian") || text.includes("minimalist")) return "Scandinavian & Minimalist";
  if (text.includes("modern") || text.includes("contemporary")) return "Modern Contemporary";
  if (text.includes("boho") || text.includes("bohemian")) return "Bohemian";
  if (text.includes("moroccan") || text.includes("tribal")) return "Moroccan & Tribal";
  if (text.includes("vintage") || text.includes("antique")) return "Vintage & Classic";
  if (text.includes("abstract") || text.includes("art")) return "Artistic Abstract";
  return "Artisan Modern";
}

function inferPattern(title = "", tags = []) {
  const text = (title + " " + tags.join(" ")).toLowerCase();
  if (text.includes("bubble") || text.includes("pebble") || text.includes("bobble") || text.includes("3d")) return "3D Textured & Bubble";
  if (text.includes("checkered") || text.includes("checker") || text.includes("cross grid") || text.includes("grid")) return "Checkered & Grid";
  if (text.includes("geometric") || text.includes("line")) return "Geometric Lines";
  if (text.includes("solid") || text.includes("plain")) return "Solid Minimalist";
  if (text.includes("floral") || text.includes("botanical")) return "Floral & Botanical";
  return "Textured Artisan";
}

function cleanTitle(fullTitle = "") {
  if (!fullTitle) return "Handcrafted Artisan Rug";
  const parts = fullTitle.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 0 && parts[0].length >= 12 && parts[0].length <= 70) {
    return parts[0];
  }
  const words = fullTitle.split(" ");
  if (words.length <= 8) return fullTitle.trim();
  return words.slice(0, 8).join(" ").trim();
}

const STANDARD_SIZES = [
  { size: "3 x 5 ft", multiplier: 1.0 },
  { size: "4 x 6 ft", multiplier: 1.6 },
  { size: "5 x 8 ft", multiplier: 2.6 },
  { size: "6 x 9 ft", multiplier: 3.5 },
  { size: "8 x 10 ft", multiplier: 5.2 },
  { size: "9 x 12 ft", multiplier: 7.0 },
];

async function main() {
  console.log("==================================================");
  console.log("   NR Enterprises: Clear Dummy Products & Sync Etsy Live ");
  console.log("==================================================");

  // 1. Delete all dummy products from Supabase
  console.log("\n🧹 1. Cleaning up old dummy listings...");
  const { data: existing, error: fetchErr } = await supabase
    .from("products")
    .select("id, sku, name");

  if (fetchErr) {
    console.error("Error fetching existing products:", fetchErr);
    process.exit(1);
  }

  const dummyIds = existing.filter((p) => !p.sku || !p.sku.startsWith("ETSY-")).map((p) => p.id);
  console.log(`Found ${dummyIds.length} dummy products to clean.`);

  if (dummyIds.length > 0) {
    // Delete in batches of 20
    for (let i = 0; i < dummyIds.length; i += 20) {
      const batch = dummyIds.slice(i, i + 20);
      const { error: delErr } = await supabase.from("products").delete().in("id", batch);
      if (delErr) {
        console.error("Error deleting batch:", delErr);
      }
    }
    console.log(`✅ Cleaned ${dummyIds.length} dummy products!`);
  }

  // 2. Fetch all active listings from Etsy (bidirectional merge to exceed 100 limit)
  console.log("\n📦 2. Fetching active listings from Etsy shop (ID: " + ETSY_SHOP_ID + ")...");
  
  // Parse optional CLI markup: e.g. node scripts/sync-etsy.js --markup=20
  const markupArg = process.argv.find((a) => a.startsWith("--markup="));
  const markupPercent = markupArg
    ? parseFloat(markupArg.split("=")[1]) || 0
    : parseFloat(process.env.MARKUP_PERCENT || "0");
  const markupMultiplier = markupPercent > 0 ? 1 + markupPercent / 100 : 1;
  if (markupPercent > 0) {
    console.log(`📈 Applying Price Markup: +${markupPercent}% (Multiplier: ${markupMultiplier})`);
  }

  const listingsMap = new Map();

  // Batch 1: Newest 100 (DESC)
  const resDesc = await fetch(
    `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100&sort_on=created&sort_order=desc`,
    { headers: getEtsyHeaders() }
  );

  let totalShopCount = 0;
  if (resDesc.ok) {
    const dataDesc = await resDesc.json();
    totalShopCount = dataDesc.count || 0;
    (dataDesc.results || []).forEach((item) => listingsMap.set(item.listing_id, item));
  } else {
    const errText = await resDesc.text();
    console.error("Etsy API Error (DESC):", errText);
  }

  // Batch 2: If shop has > 100 listings, fetch oldest listings (ASC)
  if (totalShopCount > 100) {
    try {
      const resAsc = await fetch(
        `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100&sort_on=created&sort_order=asc`,
        { headers: getEtsyHeaders() }
      );
      if (resAsc.ok) {
        const dataAsc = await resAsc.json();
        (dataAsc.results || []).forEach((item) => listingsMap.set(item.listing_id, item));
      }
    } catch (err) {
      console.warn("Could not fetch ASC batch for Etsy:", err.message);
    }
  }

  const listings = Array.from(listingsMap.values()).sort(
    (a, b) => (b.original_creation_timestamp || b.created_timestamp || 0) - (a.original_creation_timestamp || a.created_timestamp || 0)
  );

  console.log(`Found total ${listings.length} active listings on Etsy (out of ${totalShopCount} in shop)!`);

  // 3. Process each listing
  console.log("\n🔄 3. Syncing listings with HD photos, variants & metadata into Supabase...");
  let synced = 0;
  let failed = 0;

  // Retrieve Etsy OAuth token for /inventory access (Option B: clone exact variations & prices)
  const { data: tokenDoc } = await supabase
    .from("site_content")
    .select("data")
    .eq("id", "etsy_oauth_tokens")
    .maybeSingle();
  let etsyToken = tokenDoc?.data?.access_token || null;
  if (etsyToken) {
    console.log("🔑 Etsy OAuth Token detected: Enabling 1:1 Live Variation & Inventory Dropdown Cloning!");
  } else {
    console.log("⚠️ No Etsy OAuth Token found in Supabase site_content, using standard size fallback.");
  }

  for (let idx = 0; idx < listings.length; idx++) {
    const listing = listings[idx];
    const progress = `[${idx + 1}/${listings.length}]`;
    const sku = `ETSY-${listing.listing_id}`;
    const rawBasePrice = listing.price?.amount
      ? Math.round(listing.price.amount / listing.price.divisor)
      : 5000;
    const basePriceNum = Math.round(rawBasePrice * markupMultiplier);
    const originalPriceNum = Math.round(basePriceNum * 1.5); // 33% discount display

    try {
      // Fetch HD images
      let imageUrls = [];
      const imgRes = await fetch(
        `https://openapi.etsy.com/v3/application/listings/${listing.listing_id}/images`,
        { headers: getEtsyHeaders() }
      );
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        imageUrls = (imgData.results || []).map((i) => i.url_fullxfull || i.url_570xN);
      }

      const category = inferCategory(listing.title, listing.tags);
      const shape = inferShape(listing.title, listing.tags);
      const style = inferStyle(listing.title, listing.tags);
      const pattern = inferPattern(listing.title, listing.tags);
      const cleanedTitle = cleanTitle(listing.title);

      const primaryMaterial =
        Array.isArray(listing.materials) && listing.materials.length > 0
          ? listing.materials.join(", ")
          : "100% Pure New Zealand Wool & Natural Cotton Backing";

      // Option B: Fetch exact variation dropdown and individual prices from Etsy /inventory
      let variants = [];
      let detectedSizes = [];
      const detectedColors = [];

      if (etsyToken) {
        try {
          const invRes = await fetch(
            `https://openapi.etsy.com/v3/application/listings/${listing.listing_id}/inventory`,
            {
              headers: {
                "x-api-key": `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`,
                Authorization: `Bearer ${etsyToken}`,
                Accept: "application/json",
              },
            }
          );
          if (invRes.ok) {
            const invData = await invRes.json();
            if (Array.isArray(invData.products) && invData.products.length > 0) {
              const sizeMap = new Map();
              const colorSet = new Set();

              for (const prod of invData.products) {
                if (prod.is_deleted) continue;
                const off =
                  (prod.offerings || []).find((o) => !o.is_deleted && o.is_enabled) ||
                  prod.offerings?.[0];
                if (!off) continue;

                const offPrice = off.price
                  ? Math.round(off.price.amount / off.price.divisor)
                  : rawBasePrice;

                let sizeName = "";
                for (const pv of prod.property_values || []) {
                  const pName = (pv.property_name || "").toLowerCase();
                  if (pName.includes("color")) {
                    (pv.values || []).forEach((val) => {
                      if (val && val.trim()) colorSet.add(val.trim());
                    });
                  } else {
                    if (pv.values && pv.values.length > 0 && pv.values[0]?.trim()) {
                      sizeName = pv.values[0].trim();
                    }
                  }
                }

                if (!sizeName && prod.property_values?.[0]?.values?.[0]) {
                  sizeName = prod.property_values[0].values[0].trim();
                }

                if (sizeName) {
                  if (!sizeMap.has(sizeName) || offPrice > 0) {
                    sizeMap.set(sizeName, { price: offPrice, sku: prod.sku || undefined });
                  }
                }
              }

              if (colorSet.size > 0) {
                detectedColors.push(...Array.from(colorSet));
              }

              if (sizeMap.size > 0) {
                variants = Array.from(sizeMap.entries()).map(([sz, info], vIdx) => {
                  const scaledPrice = Math.max(1, Math.round(info.price * markupMultiplier));
                  const scaledOrigPrice = Math.round(scaledPrice * 1.5);
                  return {
                    size: sz,
                    dimensions: sz.replace(/ ft runner| ft| runner/gi, "").trim(),
                    unit: "ft",
                    price: String(scaledPrice),
                    base_price: String(scaledPrice),
                    original_price: String(scaledOrigPrice),
                    markup_percent: Math.round((markupMultiplier - 1) * 100),
                    discount_percent: 33,
                    sku: info.sku || `${sku}-${vIdx + 1}`,
                  };
                });
                detectedSizes = variants.map((v) => v.size);
              }
            }
          }
        } catch (invErr) {
          console.warn(`Could not fetch inventory for listing ${listing.listing_id}:`, invErr.message);
        }
      }

      // Fallback only if no variants found from Etsy inventory
      if (variants.length === 0) {
        variants = STANDARD_SIZES.map((s) => ({
          size: s.size,
          dimensions: s.size.replace(" ft", ""),
          unit: "ft",
          price: String(Math.round(basePriceNum * s.multiplier)),
          base_price: String(Math.round(basePriceNum * s.multiplier)),
          original_price: String(Math.round(originalPriceNum * s.multiplier)),
          markup_percent: 50,
          discount_percent: 33,
        }));
        detectedSizes = STANDARD_SIZES.map((s) => s.size);
      }

      // Lowest variant price becomes base catalog display price (e.g. ₹1,685+)
      const minVariantPrice = variants.length > 0
        ? Math.min(...variants.map((v) => parseFloat(String(v.price).replace(/[^0-9.]/g, "")) || basePriceNum))
        : basePriceNum;
      const minOrigPrice = Math.round(minVariantPrice * 1.5);

      const productPayload = {
        name: cleanedTitle,
        original_name: listing.title,
        sku: sku,
        price: `₹${minVariantPrice}`,
        original_price: `₹${minOrigPrice}`,
        discount_percent: 33,
        markup_percent: Math.round((markupMultiplier - 1) * 100),
        category: category,
        shape: shape,
        color: detectedColors.length > 0 ? detectedColors.join(", ") : inferColor(listing.title, listing.tags),
        style: style,
        pattern: pattern,
        room: "Living Room, Bedroom, Foyer, Lounge",
        material: primaryMaterial,
        description:
          listing.description ||
          `Handcrafted artisanal rug by master weavers at NR Enterprises. Features premium plush texture, artisanal finishing, and sustainable natural fibers.`,
        care_instructions:
          "Vacuum regularly with suction-only mode. Rotate periodically for even wear. Spot clean spills immediately with a damp cloth and mild wool-friendly solution. Professional rug cleaning recommended.",
        sizes: detectedSizes,
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
        created_at: new Date(
          (listing.original_creation_timestamp || listing.created_timestamp || Date.now() / 1000) * 1000
        ).toISOString(),
      };

      if (detectedColors.length > 0) {
        productPayload.color_variants = detectedColors.map((c, cIdx) => ({
          color: c,
          image: imageUrls[cIdx] || imageUrls[0] || "",
        }));
      }

      if (imageUrls.length > 0) {
        productPayload.images = imageUrls;
      }

      // Check if product already exists
      const { data: existingProd } = await supabase
        .from("products")
        .select("id")
        .eq("sku", sku)
        .maybeSingle();

      if (existingProd?.id) {
        const { error: updErr } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", existingProd.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from("products")
          .insert(productPayload);
        if (insErr) throw insErr;
      }

      synced++;
      console.log(
        `${progress} ✅ Synced: "${cleanedTitle.slice(0, 35)}..." (${imageUrls.length} imgs, ₹${basePriceNum}, ${color})`
      );

      // Brief throttle to avoid hitting Etsy rate limits
      await new Promise((r) => setTimeout(r, 200));
    } catch (itemErr) {
      failed++;
      console.error(`${progress} ❌ Error syncing listing ${listing.listing_id}:`, itemErr.message);
    }
  }

  console.log("\n==================================================");
  console.log(`🎉 Sync Completed!`);
  console.log(`  Total listings processed: ${listings.length}`);
  console.log(`  Successfully synced:     ${synced}`);
  console.log(`  Failed:                  ${failed}`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
