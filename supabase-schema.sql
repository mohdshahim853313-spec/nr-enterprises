-- =========================================================================
-- NR Enterprises - Complete Supabase Database Schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Project: NR Enterprises (ycykuweoprcspzwvcezw)
-- =========================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  original_name TEXT,
  sku TEXT UNIQUE,
  price TEXT NOT NULL DEFAULT '₹0',
  original_price TEXT,
  markup_percent NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'Tufted',
  shape TEXT DEFAULT 'Rectangular',
  material TEXT DEFAULT 'Pure New Zealand Wool Blend',
  color TEXT DEFAULT 'Neutral & Earthy',
  style TEXT DEFAULT 'Artisan Modern',
  pattern TEXT DEFAULT 'Textured Artisan',
  room TEXT DEFAULT 'Living Room, Bedroom, Foyer, Lounge',
  description TEXT,
  care_instructions TEXT,
  processing_type TEXT DEFAULT 'Made to Order',
  processing_time TEXT DEFAULT 'Ships in 5-8 business days',
  return_policy TEXT DEFAULT 'Returns accepted within 14 days of delivery',
  stock_quantity INTEGER DEFAULT 5,
  is_customizable BOOLEAN DEFAULT true,
  customization_surcharge NUMERIC DEFAULT 20,
  free_delivery BOOLEAN DEFAULT true,
  show_etsy BOOLEAN DEFAULT true,
  etsy_url TEXT,
  status TEXT DEFAULT 'published',
  images JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  related_products JSONB DEFAULT '[]'::jsonb,
  studio_image TEXT
);

-- 3. SITE CONTENT TABLE (for CMS sections, banners, registries, filter configs)
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. STORE SETTINGS TABLE (USD currency rate, payment keys)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  usd_rate NUMERIC DEFAULT 45.00,
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  items JSONB,
  total_amount NUMERIC,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending'
);

-- 6. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new'
);

-- 7. CUSTOM ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  email TEXT,
  phone TEXT,
  details JSONB,
  status TEXT DEFAULT 'pending'
);

-- 8. INITIAL SEED DATA
-- Default store setting (USD exchange rate: 45)
INSERT INTO public.store_settings (id, usd_rate)
VALUES (1, 45.00)
ON CONFLICT (id) DO UPDATE SET usd_rate = EXCLUDED.usd_rate;

-- Default filter settings
INSERT INTO public.site_content (id, data)
VALUES (
  'filter_settings',
  '{
    "types": ["Braided (rPET)", "Jute & Natural Fiber", "Hand-Tufted", "Flatweave & Dhurrie", "Hand-Knotted", "Shag & High Pile", "Kilim", "Modern & Minimalist"],
    "materials": ["100% Recycled PET (rPET)", "Natural Jute / Plant Fiber", "Pure New Zealand Wool", "Organic Cotton Blend", "Wool & Bamboo Silk Blend"],
    "colors": [
      {"name": "Beige & Neutral", "hex": "#E6DEC8"},
      {"name": "Rust & Terracotta", "hex": "#B85D38"},
      {"name": "Olive & Green", "hex": "#708238"},
      {"name": "Ocean Blue", "hex": "#2B4C6F"},
      {"name": "Charcoal & Grey", "hex": "#4A4A4A"},
      {"name": "Black & White", "hex": "#1A1A1A"}
    ],
    "patterns": ["3D Textured & Bubble", "Checkered & Grid", "Geometric Lines", "Solid Minimalist", "Floral & Botanical"],
    "shapes": ["Rectangular", "Round", "Oval", "Runner", "Square"]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Default collections catalog banner
INSERT INTO public.site_content (id, data)
VALUES (
  'collections',
  '{
    "hero": {
      "tag": "THE PREMIUM NR ENTERPRISES PRODUCTS",
      "title": "Artisanal Floor Sculptures",
      "description": "Browse our hand-braided rPET area rugs, runners, and custom silhouettes. 100% reversible, stain-resistant, and woven for mindful living.",
      "bgImage": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
    },
    "banner": {
      "title": "Need Custom Architectural Dimensions?",
      "description": "Every room has distinct proportions. Configure size, shape, and dual-tone cords through our bespoke studio.",
      "ctaText": "Start Custom Order",
      "ctaLink": "/customize"
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Default studio registry
INSERT INTO public.site_content (id, data)
VALUES ('studio_rug_images', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Default color variants registry
INSERT INTO public.site_content (id, data)
VALUES ('product_color_variants', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Allow Full Access for Anon and Authenticated (Web store & Admin)
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Public insert site_content" ON public.site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update site_content" ON public.site_content FOR UPDATE USING (true);

CREATE POLICY "Public read store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public insert store_settings" ON public.store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update store_settings" ON public.store_settings FOR UPDATE USING (true);

CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Public insert inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read inquiries" ON public.contact_inquiries FOR SELECT USING (true);

CREATE POLICY "Public insert custom_orders" ON public.custom_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read custom_orders" ON public.custom_orders FOR SELECT USING (true);

