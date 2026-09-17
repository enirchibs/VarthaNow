// 🔥 Mana Adda Deals (మన అడ్డా డీల్స్) Types & Data Contracts

export type MerchantId = "amazon" | "flipkart" | "tatacliq" | "croma" | "myntra" | "ajio";

export type DealLabel = 
  | "lowest_price"     // 🟢 తక్కువ ధర (Lowest Price)
  | "good_deal"        // 🔥 మంచి డీల్ (Good Deal)
  | "budget_pick"      // 💰 బడ్జెట్ పిక్ (Budget Pick)
  | "popular"          // ⭐ పాపులర్ (Popular)
  | "student_pick"     // 🎓 స్టూడెంట్ పిక్ (Student Pick)
  | "farmer_pick"      // 👨‍🌾 రైతు పిక్ (Farmer Pick)
  | "price_drop";      // ⚡ ధర తగ్గింది (Price Drop)

export type DealAudienceMode = "all" | "student" | "farmer" | "village";

// 7 Primary Navigation Tabs specified by user
export type PrimaryDealsTab = 
  | "all"              // 🔥 అన్నీ
  | "kirana"           // 🛒 నిత్యావసరాలు & కిరాణా
  | "mobiles"          // 📱 మొబైల్స్
  | "student"          // 🎓 స్టూడెంట్
  | "home"             // 🏠 ఇంటి డీల్స్
  | "farmer"           // 👨‍🌾 రైతుల డీల్స్
  | "more";            // ••• మరిన్ని

// Subcategories for Kirana / Daily Essentials
export type KiranaSubcategory = 
  | "all"
  | "kirana"           // కిరాణా (Rice, Dal, Oil, Flour, Spices)
  | "personal_care"    // Personal Care (Soap, Shampoo)
  | "cleaning"         // Cleaning
  | "kitchen"          // Kitchen Essentials
  | "baby_care"        // Baby Care
  | "pet_care"         // Pet Care
  | "household";       // Household Essentials

// Discovery Collections
export type DealCollectionType = 
  | "all"
  | "todays_deals"     // 🔥 ఈరోజు డీల్స్
  | "price_drop"       // ⚡ ధర తగ్గింది
  | "budget_deals"     // 💰 బడ్జెట్ డీల్స్
  | "good_deals"       // 🏆 మంచి డీల్స్
  | "student_deals"    // 🎓 స్టూడెంట్ డీల్స్
  | "farmer_deals"     // 👨‍🌾 రైతుల డీల్స్
  | "home_deals"       // 🏡 మన ఇంటికి
  | "kirana_deals";    // 🛒 నిత్యావసరాల డీల్స్

export interface DealCategory {
  id: string;
  slug: string;
  name_te: string;
  name_en: string;
  icon: string;
  parent_id?: string;
  sort_order: number;
}

export interface MerchantOffer {
  merchant: MerchantId;
  merchant_name: string;
  merchant_logo: string;
  product_id: string; // ASIN or FSN
  product_title: string;
  price: number;
  mrp: number;
  currency: string;
  affiliate_url: string;
  in_stock: boolean;
  shipping_info?: string;
  offer_text?: string;
  rating?: number;
  review_count?: number;
  last_checked_at: string; // ISO string
  is_lowest?: boolean;
}

export interface CanonicalProduct {
  id: string;
  brand: string;
  model: string;
  title_te: string;
  title_en: string;
  category_id: string;
  subcategory?: string;
  category_name_te: string;
  image_url: string;
  gallery?: string[];
  key_specs: string[]; // e.g. ["6GB RAM • 128GB Storage", "5000 mAh Battery"]
  lowest_price: number;
  highest_mrp: number;
  deal_label: DealLabel;
  deal_score: number; // 0 to 100
  why_this_deal: string[]; // Supported factual reasons only
  offers: MerchantOffer[];
  price_difference?: number; // Lowest vs other merchant difference
  cheaper_merchant?: MerchantId;
  previous_observed_price?: number; // For verified price drop history
  price_drop_amount?: number;
  audience_tags: DealAudienceMode[];
  is_todays_deal?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealsSearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  max_price?: number;
  min_price?: number;
  merchant?: MerchantId;
  deal_label?: DealLabel;
  audience_mode?: DealAudienceMode;
  collection?: DealCollectionType;
  sort_by?: "recommended" | "price_asc" | "price_desc" | "rating" | "savings";
}

export interface AffiliateClickEvent {
  id: string;
  canonical_product_id: string;
  product_title: string;
  merchant: MerchantId;
  price: number;
  affiliate_url: string;
  clicked_at: string;
  user_session_id: string;
}

export interface SavedDeal {
  canonical_product_id: string;
  saved_price: number;
  saved_at: string;
  notified_price_drop?: boolean;
}

export interface PriceDropAlert {
  id: string;
  canonical_product_id: string;
  product_title: string;
  target_price: number;
  current_price: number;
  contact_info: string;
  created_at: string;
  is_active: boolean;
}

export interface DealsAdminStats {
  total_products: number;
  total_clicks: number;
  clicks_today: number;
  top_merchants: { merchant: MerchantId; count: number }[];
  top_categories: { category: string; count: number }[];
  active_merchants: { id: MerchantId; name: string; status: "active" | "degraded" | "error"; last_sync: string }[];
}
