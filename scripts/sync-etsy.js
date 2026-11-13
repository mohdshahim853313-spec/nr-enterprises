const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const ETSY_API_KEY = process.env.ETSY_KEYSTRING || "zylzcsf84xn2i4z8fvz26w6x";
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET || "3v9703wmcpd4ol5y00wq5ha44";
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

  // 2. Fetch all active listings from Etsy
  console.log("\n📦 2. Fetching active listings from Etsy shop (ID: " + ETSY_SHOP_ID + ")...");
  const etsyUrl = `https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active?limit=100`;
  const etsyRes = await fetch(etsyUrl, { headers: getEtsyHeaders() });

  if (!etsyRes.ok) {
    const errText = await etsyRes.text();
    console.error("Etsy API Error:", errText);
    process.exit(1);
  }

  const etsyData = await etsyRes.json();
  const listings = etsyData.results || [];
  console.log(`Found ${listings.length} active listings on Etsy!`);

  // 3. Process each listing
  console.log("\n🔄 3. Syncing listings with HD photos, variants & metadata into Supabase...");
  let synced = 0;
  let failed = 0;

  for (let idx = 0; idx < listings.length; idx++) {
    const listing = listings[idx];
    const progress = `[${idx + 1}/${listings.length}]`;
    const sku = `ETSY-${listing.listing_id}`;
    const basePriceNum = listing.price?.amount
      ? Math.round(listing.price.amount / listing.price.divisor)
      : 5000;
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
      const color = inferColor(listing.title, listing.tags);
      const style = inferStyle(listing.title, listing.tags);
      const pattern = inferPattern(listing.title, listing.tags);
      const cleanedTitle = cleanTitle(listing.title);

      const primaryMaterial =
        Array.isArray(listing.materials) && listing.materials.length > 0
          ? listing.materials.join(", ")
          : "100% Pure New Zealand Wool & Natural Cotton Backing";

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

      const productPayload = {
        name: cleanedTitle,
        original_name: listing.title,
        sku: sku,
        price: `₹${basePriceNum}`,
        original_price: `₹${originalPriceNum}`,
        discount_percent: 33,
        markup_percent: 50,
        category: category,
        shape: shape,
        color: color,
        style: style,
        pattern: pattern,
        room: "Living Room, Bedroom, Foyer, Lounge",
        material: primaryMaterial,
        description:
          listing.description ||
          `Handcrafted artisanal rug by master weavers at NR Enterprises. Features premium plush texture, artisanal finishing, and sustainable natural fibers.`,
        care_instructions:
          "Vacuum regularly with suction-only mode. Rotate periodically for even wear. Spot clean spills immediately with a damp cloth and mild wool-friendly solution. Professional rug cleaning recommended.",
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
        created_at: new Date(
          (listing.original_creation_timestamp || listing.created_timestamp || Date.now() / 1000) * 1000
        ).toISOString(),
      };

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
