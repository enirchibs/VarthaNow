-- ==============================================================================
-- 🔥 MANA ADDA DEALS (మన అడ్డా డీల్స్) DATABASE SCHEMA
-- Purpose: Canonical product matching, multi-merchant comparison, affiliate click tracking
-- ==============================================================================

-- 1. Deal Categories
CREATE TABLE IF NOT EXISTS public.deal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_te TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  parent_id UUID REFERENCES public.deal_categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Canonical Products
CREATE TABLE IF NOT EXISTS public.canonical_products (
  id TEXT PRIMARY KEY, -- e.g. "cp_samsung_m14"
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  title_te TEXT NOT NULL,
  title_en TEXT NOT NULL,
  category_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  key_specs JSONB DEFAULT '[]'::jsonb,
  audience_tags JSONB DEFAULT '["all"]'::jsonb,
  lowest_price NUMERIC NOT NULL,
  highest_mrp NUMERIC NOT NULL,
  deal_label TEXT NOT NULL DEFAULT 'good_deal',
  deal_score INT DEFAULT 85,
  why_this_deal JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Merchant Products (Mapping ASIN, FSN to Canonical)
CREATE TABLE IF NOT EXISTS public.merchant_products (
  id TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL, -- 'amazon', 'flipkart'
  merchant_product_id TEXT NOT NULL, -- ASIN or FSN
  sku TEXT,
  title TEXT NOT NULL,
  image_url TEXT,
  product_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  price NUMERIC NOT NULL,
  mrp NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  availability TEXT DEFAULT 'in_stock',
  rating NUMERIC DEFAULT 4.0,
  review_count INT DEFAULT 0,
  variant_attributes JSONB DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Merchant Offers
CREATE TABLE IF NOT EXISTS public.merchant_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_product_id TEXT NOT NULL REFERENCES public.merchant_products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  availability TEXT DEFAULT 'in_stock',
  offer_type TEXT,
  discount NUMERIC DEFAULT 0,
  last_checked_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Deal Rankings
CREATE TABLE IF NOT EXISTS public.deal_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_product_id TEXT NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  budget_bracket INT,
  deal_label TEXT NOT NULL,
  deal_score INT NOT NULL,
  reason TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Affiliate Clicks (Analytics & Click Tracking)
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_product_id TEXT NOT NULL,
  product_title TEXT,
  merchant TEXT NOT NULL,
  price NUMERIC,
  affiliate_url TEXT NOT NULL,
  user_session_id TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Price History (Verified Observations Only)
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_product_id TEXT NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  price NUMERIC NOT NULL,
  observed_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Saved Products
CREATE TABLE IF NOT EXISTS public.saved_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_product_id TEXT NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  user_session_id TEXT NOT NULL,
  saved_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for rapid queries
CREATE INDEX IF NOT EXISTS idx_canonical_lowest_price ON public.canonical_products (lowest_price);
CREATE INDEX IF NOT EXISTS idx_canonical_category ON public.canonical_products (category_id);
CREATE INDEX IF NOT EXISTS idx_merchant_products_canonical ON public.merchant_products (canonical_product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_merchant ON public.affiliate_clicks (merchant, clicked_at);

-- Row Level Security (RLS)
ALTER TABLE public.deal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on deal_categories"
  ON public.deal_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read on canonical_products"
  ON public.canonical_products FOR SELECT USING (true);

CREATE POLICY "Allow public read on merchant_products"
  ON public.merchant_products FOR SELECT USING (true);

CREATE POLICY "Allow public insert on affiliate_clicks"
  ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
