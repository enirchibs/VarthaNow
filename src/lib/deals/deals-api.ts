// 🔥 Mana Adda Deals API Engine & Canonical Product Matching
import { supabase, hasSupabaseEnv } from "../supabase";
import type { 
  CanonicalProduct, 
  MerchantOffer, 
  DealsSearchFilters, 
  AffiliateClickEvent, 
  SavedDeal, 
  DealsAdminStats,
  DealCategory,
  DealAudienceMode,
  PrimaryDealsTab,
  KiranaSubcategory,
  DealCollectionType,
  PriceDropAlert
} from "@/types/deals";
import { generateApprovedAffiliateUrl } from "./merchant-adapters";

// ============================================================
// 1. PRIMARY 7 DEALS NAVIGATION TABS
// ============================================================
export interface PrimaryTabItem {
  id: PrimaryDealsTab;
  label_te: string;
  label_en: string;
  icon: string;
  category_slug?: string;
}

export const PRIMARY_DEALS_TABS: PrimaryTabItem[] = [
  { id: "all", label_te: "అన్నీ", label_en: "All Deals", icon: "🔥" },
  { id: "kirana", label_te: "నిత్యావసరాలు & కిరాణా", label_en: "Daily Essentials & Grocery", icon: "🛒", category_slug: "kirana" },
  { id: "mobiles", label_te: "మొబైల్స్", label_en: "Mobiles", icon: "📱", category_slug: "mobiles" },
  { id: "student", label_te: "స్టూడెంట్", label_en: "Student Deals", icon: "🎓", category_slug: "student" },
  { id: "home", label_te: "ఇంటి డీల్స్", label_en: "Home Deals", icon: "🏠", category_slug: "home" },
  { id: "farmer", label_te: "రైతుల డీల్స్", label_en: "Farmer Deals", icon: "👨‍🌾", category_slug: "farmer" },
  { id: "more", label_te: "మరిన్ని", label_en: "More Categories", icon: "•••" }
];

// ============================================================
// 2. KIRANA / DAILY ESSENTIALS SUBCATEGORIES
// ============================================================
export interface KiranaSubcategoryItem {
  id: KiranaSubcategory;
  label_te: string;
  label_en: string;
  icon: string;
}

export const KIRANA_SUBCATEGORIES: KiranaSubcategoryItem[] = [
  { id: "all", label_te: "అన్ని నిత్యావసరాలు", label_en: "All Grocery", icon: "🛒" },
  { id: "kirana", label_te: "కిరాణా (బియ్యం, పప్పు, నూనె)", label_en: "Kirana Staples", icon: "🍚" },
  { id: "personal_care", label_te: "పర్సనల్ కేర్ (సోపులు, షాంపూ)", label_en: "Personal Care", icon: "🧼" },
  { id: "cleaning", label_te: "క్లీనింగ్ & సర్ఫ్", label_en: "Cleaning", icon: "🧹" },
  { id: "kitchen", label_te: "కిచెన్ ఎసెన్షియల్స్", label_en: "Kitchen", icon: "🧂" },
  { id: "baby_care", label_te: "బేబీ కేర్", label_en: "Baby Care", icon: "🍼" },
  { id: "pet_care", label_te: "పెట్ కేర్", label_en: "Pet Care", icon: "🐶" },
  { id: "household", label_te: "హౌస్‌హోల్డ్", label_en: "Household", icon: "🧻" }
];

// ============================================================
// 3. MOBILE BUDGET SHORTCUTS
// ============================================================
export const MOBILE_BUDGET_SHORTCUTS = [
  { label: "₹5,000 లోపు", maxPrice: 5000, tag: "under_5k" },
  { label: "₹7,500 లోపు", maxPrice: 7500, tag: "under_7.5k" },
  { label: "₹10,000 లోపు", maxPrice: 10000, tag: "under_10k" },
  { label: "₹15,000 లోపు", maxPrice: 15000, tag: "under_15k" },
  { label: "₹20,000 లోపు", maxPrice: 20000, tag: "under_20k" },
  { label: "₹25,000 లోపు", maxPrice: 25000, tag: "under_25k" }
];

export const MOBILE_FILTER_PILLS = [
  { label: "📱 ₹5,000 లోపు మొబైల్స్", maxPrice: 5000 },
  { label: "📱 ₹10,000 లోపు మొబైల్స్", maxPrice: 10000 },
  { label: "📱 స్టూడెంట్స్ కోసం మొబైల్స్", maxPrice: 12000, audience: "student" },
  { label: "🔋 5000mAh+ బ్యాటరీ మొబైల్స్", query: "battery" }
];

// ============================================================
// 4. STUDENT BUDGET & ESSENTIAL COLLECTIONS
// ============================================================
export const STUDENT_BUDGET_SHORTCUTS = [
  { label: "₹100 లోపు", maxPrice: 100 },
  { label: "₹500 లోపు", maxPrice: 500 },
  { label: "₹1,000 లోపు", maxPrice: 1000 },
  { label: "₹5,000 లోపు", maxPrice: 5000 },
  { label: "₹10,000 లోపు", maxPrice: 10000 }
];

// ============================================================
// 5. 19 SPECIALIZED CATEGORIES FOR "••• మరిన్ని"
// ============================================================
export interface MoreCategoryItem {
  slug: string;
  name_te: string;
  name_en: string;
  icon: string;
}

export const MORE_DEAL_CATEGORIES: MoreCategoryItem[] = [
  { slug: "laptops_computers", name_te: "ల్యాప్టాప్స్ & కంప్యూటర్స్", name_en: "Laptops & Computers", icon: "💻" },
  { slug: "audio", name_te: "హెడ్ఫోన్స్ & ఆడియో", name_en: "Headphones & Audio", icon: "🎧" },
  { slug: "tv_appliances", name_te: "TV & Appliances", name_en: "TV & Appliances", icon: "📺" },
  { slug: "kitchen", name_te: "కిచెన్", name_en: "Kitchen", icon: "🍳" },
  { slug: "fashion", name_te: "ఫ్యాషన్", name_en: "Fashion", icon: "👕" },
  { slug: "footwear", name_te: "షూస్ & ఫుట్వేర్", name_en: "Shoes & Footwear", icon: "👟" },
  { slug: "beauty", name_te: "బ్యూటీ & పర్సనల్ కేర్", name_en: "Beauty & Personal Care", icon: "💄" },
  { slug: "kids", name_te: "పిల్లల వస్తువులు", name_en: "Kids & Toys", icon: "🧸" },
  { slug: "books", name_te: "బుక్స్", name_en: "Books", icon: "📚" },
  { slug: "electronics", name_te: "ఎలక్ట్రానిక్స్", name_en: "Electronics", icon: "🔌" },
  { slug: "chargers_powerbanks", name_te: "చార్జర్స్ & పవర్ బ్యాంక్స్", name_en: "Chargers & Power Banks", icon: "🔋" },
  { slug: "tools_hardware", name_te: "టూల్స్ & హార్డ్వేర్", name_en: "Tools & Hardware", icon: "🛠️" },
  { slug: "auto", name_te: "కార్ & బైక్ యాక్సెసరీస్", name_en: "Car & Bike Accessories", icon: "🚗" },
  { slug: "fitness", name_te: "ఫిట్నెస్ & స్పోర్ట్స్", name_en: "Fitness & Sports", icon: "🏋️" },
  { slug: "pet_care", name_te: "పెట్ కేర్", name_en: "Pet Care", icon: "🐶" },
  { slug: "gifts", name_te: "గిఫ్ట్స్", name_en: "Gifts", icon: "🎁" },
  { slug: "travel", name_te: "ట్రావెల్", name_en: "Travel", icon: "🧳" },
  { slug: "solar_energy", name_te: "సోలార్ & ఎనర్జీ", name_en: "Solar & Energy", icon: "☀️" },
  { slug: "lighting", name_te: "లైటింగ్", name_en: "Lighting", icon: "💡" }
];

export const DEAL_CATEGORIES: DealCategory[] = [
  { id: "cat_kirana", slug: "kirana", name_te: "నిత్యావసరాలు & కిరాణా", name_en: "Daily Essentials & Grocery", icon: "🛒", sort_order: 1 },
  { id: "cat_mobile", slug: "mobiles", name_te: "మొబైల్స్", name_en: "Mobiles", icon: "📱", sort_order: 2 },
  { id: "cat_student", slug: "student", name_te: "స్టూడెంట్ డీల్స్", name_en: "Student Deals", icon: "🎓", sort_order: 3 },
  { id: "cat_home", slug: "home", name_te: "ఇంటి డీల్స్", name_en: "Home Deals", icon: "🏠", sort_order: 4 },
  { id: "cat_farmer", slug: "farmer", name_te: "రైతుల డీల్స్", name_en: "Farmer Deals", icon: "👨‍🌾", sort_order: 5 },
  ...MORE_DEAL_CATEGORIES.map((m, idx) => ({
    id: `cat_${m.slug}`,
    slug: m.slug,
    name_te: m.name_te,
    name_en: m.name_en,
    icon: m.icon,
    sort_order: 6 + idx
  }))
];

// ============================================================
// 6. DISCOVERY COLLECTIONS
// ============================================================
export interface DealCollectionItem {
  id: DealCollectionType;
  label_te: string;
  icon: string;
}

export const DEAL_COLLECTIONS_LIST: DealCollectionItem[] = [
  { id: "todays_deals", label_te: "ఈరోజు డీల్స్", icon: "🔥" },
  { id: "price_drop", label_te: "ధర తగ్గింది", icon: "⚡" },
  { id: "budget_deals", label_te: "బడ్జెట్ డీల్స్", icon: "💰" },
  { id: "good_deals", label_te: "మంచి డీల్స్", icon: "🏆" },
  { id: "student_deals", label_te: "స్టూడెంట్ డీల్స్", icon: "🎓" },
  { id: "farmer_deals", label_te: "రైతుల డీల్స్", icon: "👨‍🌾" },
  { id: "home_deals", label_te: "మన ఇంటికి", icon: "🏡" },
  { id: "kirana_deals", label_te: "నిత్యావసరాల డీల్స్", icon: "🛒" }
];

// ============================================================
// 7. BUDGET FINDER STEPS
// ============================================================
export const BUDGET_FINDER_STEPS = [100, 500, 1000, 2500, 5000, 10000, 25000];

// ============================================================
// 8. AUTHENTIC CANONICAL PRODUCTS
// ============================================================
export const SEED_CANONICAL_PRODUCTS: CanonicalProduct[] = [
  // --- 🛒 DAILY ESSENTIALS & KIRANA ---
  {
    id: "cp_daawat_basmati_rice",
    brand: "Daawat",
    model: "Rozana Super Basmati Rice (5kg)",
    title_te: "దావత్ రోజానా సూపర్ బాస్మతి బియ్యం (5 కేజీలు • పొడవాటి గింజలు)",
    title_en: "Daawat Rozana Super Basmati Rice, 5kg",
    category_id: "kirana",
    subcategory: "kirana",
    category_name_te: "నిత్యావసరాలు & కిరాణా",
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "5kg ప్యాక్ • స్వచ్ఛమైన బాస్మతి సువాసన",
      "ప్రతిరోజూ అన్నం, బిర్యానీ, పులావ్‌కి అనువైనది",
      "వండిన తర్వాత పొడవుగా మరియు విడివిడిగా వస్తుంది"
    ],
    lowest_price: 399,
    highest_mrp: 499,
    deal_label: "lowest_price",
    deal_score: 96,
    why_this_deal: [
      "ప్రతిరోజూ వాడే నిత్యావసరాలలో బడ్జెట్ బెస్ట్ సెల్లర్",
      "Flipkart కంటే Amazonలో ₹30 తక్కువ ధర",
      "ఉచిత ఇంటి డెలివరీ అందుబాటులో ఉంది"
    ],
    price_difference: 30,
    cheaper_merchant: "amazon",
    previous_observed_price: 440,
    price_drop_amount: 41,
    audience_tags: ["all", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B00NWRU9D2",
        product_title: "Daawat Rozana Super Basmati Rice 5kg",
        price: 399,
        mrp: 499,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B00NWRU9D2"),
        in_stock: true,
        shipping_info: "ఉచిత డెలివరీ",
        rating: 4.3,
        review_count: 54000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "GROFH87UHG",
        product_title: "DAAWAT Rozana Super Basmati Rice (5 kg)",
        price: 429,
        mrp: 499,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/daawat-rozana-super-basmati-rice-5-kg/p/itm123"),
        in_stock: true,
        shipping_info: "ఉచిత డెలివరీ",
        rating: 4.2,
        review_count: 32000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_fortune_sunflower_oil",
    brand: "Fortune",
    model: "Sunlite Refined Sunflower Oil (5 Litre Can)",
    title_te: "ఫార్చ్యూన్ సన్‌లైట్ సన్‌ఫ్లవర్ నూనె (5 లీటర్ల క్యాన్ • విటమిన్ A & D)",
    title_en: "Fortune Sunlite Refined Sunflower Oil, 5L Can",
    category_id: "kirana",
    subcategory: "kirana",
    category_name_te: "నిత్యావసరాలు & కిరాణా",
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "5 లీటర్ల సౌకర్యవంతమైన క్యాన్",
      "విటమిన్ A, D, E పుష్కలంగా ఉంటాయి",
      "లైట్ మరియు ఆరోగ్యకరమైన వంట నూనె"
    ],
    lowest_price: 649,
    highest_mrp: 799,
    deal_label: "good_deal",
    deal_score: 93,
    why_this_deal: [
      "కుటుంబానికి 1 నెల సరిపడా 5L క్యాన్",
      "Amazon కంటే Flipkartలో ₹20 తక్కువ ధర",
      "మార్కెట్ ఎం.ఆర్.పి కంటే ₹150 ఆదా"
    ],
    price_difference: 20,
    cheaper_merchant: "flipkart",
    previous_observed_price: 690,
    price_drop_amount: 41,
    audience_tags: ["all", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "EDOFC2345",
        product_title: "Fortune Sunlite Refined Sunflower Oil Can (5 L)",
        price: 649,
        mrp: 799,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/fortune-sunlite-sunflower-oil-5l/p/itm555"),
        in_stock: true,
        rating: 4.4,
        review_count: 67000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B00K5N4K9G",
        product_title: "Fortune Sunlite Refined Sunflower Oil, 5L Can",
        price: 669,
        mrp: 799,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B00K5N4K9G"),
        in_stock: true,
        rating: 4.4,
        review_count: 85000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_aashirvaad_atta_10kg",
    brand: "Aashirvaad",
    model: "Shudh Chakki Whole Wheat Atta (10kg)",
    title_te: "ఆశీర్వాద్ చక్కీ గోధుమ పిండి (10 కేజీలు • 100% స్వచ్ఛమైన గోధుమలు)",
    title_en: "Aashirvaad Superior MP Whole Wheat Chakki Atta, 10kg",
    category_id: "kirana",
    subcategory: "kirana",
    category_name_te: "నిత్యావసరాలు & కిరాణా",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "10kg సేవింగ్స్ ప్యాక్",
      "మెత్తని మరియు రుచికరమైన రొట్టెలు/చపాతీలు",
      "హై ఫైబర్ మరియు సహజ పోషకాలు"
    ],
    lowest_price: 429,
    highest_mrp: 495,
    deal_label: "budget_pick",
    deal_score: 95,
    why_this_deal: [
      "తెలుగు రాష్ట్రాల్లో అత్యధికంగా అమ్ముడవుతున్న గోధుమ పిండి",
      "Flipkart కంటే Amazonలో ₹20 తక్కువ ధర",
      "భారీ 10kg ప్యాక్ నేరుగా ఇంటి వద్దకే డెలివరీ"
    ],
    price_difference: 20,
    cheaper_merchant: "amazon",
    audience_tags: ["all", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B00NWRU9AA",
        product_title: "Aashirvaad Superior MP Atta 10kg",
        price: 429,
        mrp: 495,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B00NWRU9AA"),
        in_stock: true,
        rating: 4.5,
        review_count: 110000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "ATTA12345",
        product_title: "AASHIRVAAD Superior MP Atta (10 kg)",
        price: 449,
        mrp: 495,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/aashirvaad-atta-10kg/p/itm987"),
        in_stock: true,
        rating: 4.4,
        review_count: 82000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_dettol_soaps_pack",
    brand: "Dettol",
    model: "Original Germ Protection Bathing Soap (Pack of 5 x 125g)",
    title_te: "డెట్టాల్ ఒరిజినల్ బాతింగ్ సోప్ (5 సోపుల ప్యాక్ • 125 గ్రాములు ప్రతిదీ)",
    title_en: "Dettol Original Germ Protection Bathing Soap Bar, 125g (Pack of 5)",
    category_id: "kirana",
    subcategory: "personal_care",
    category_name_te: "నిత్యావసరాలు & కిరాణా",
    image_url: "https://images.unsplash.com/photo-1607006314605-aac70a5c4e09?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "5 పెద్ద సోపుల సూపర్ సేవింగ్స్ కాంబో",
      "99.9% క్రిముల నుండి రక్షణ",
      "చర్మానికి తేమ మరియు రక్షణ"
    ],
    lowest_price: 249,
    highest_mrp: 310,
    deal_label: "lowest_price",
    deal_score: 97,
    why_this_deal: [
      "₹250 లోపు మొత్తం కుటుంబానికి సరిపడా సోపులు",
      "సూపర్ మార్కెట్ ధర కంటే ₹60 ఆదా",
      "Flipkart కంటే Amazonలో ₹16 తక్కువ ధర"
    ],
    price_difference: 16,
    cheaper_merchant: "amazon",
    audience_tags: ["all", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B00NWSOAP",
        product_title: "Dettol Original Bathing Soap 125g Pack of 5",
        price: 249,
        mrp: 310,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B00NWSOAP"),
        in_stock: true,
        rating: 4.4,
        review_count: 94000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "SOAPFK123",
        product_title: "Dettol Original Soap (5 x 125 g)",
        price: 265,
        mrp: 310,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/dettol-original-soap-pack-of-5/p/itm543"),
        in_stock: true,
        rating: 4.3,
        review_count: 48000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // --- 📱 MOBILES ---
  {
    id: "cp_itel_a70",
    brand: "itel",
    model: "A70 (4GB RAM • 64GB)",
    title_te: "ఐటెల్ A70 (4GB ర్యామ్ • 64GB స్టోరేజ్ • 5000 mAh బ్యాటరీ)",
    title_en: "itel A70 Brilliant Gold (4GB RAM, 64GB Storage) 5000 mAh Battery",
    category_id: "mobiles",
    category_name_te: "మొబైల్స్",
    image_url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "₹5,000 లోపు 64GB మెమరీ ఫోన్",
      "5000 mAh భారీ బ్యాటరీ",
      "ఫింగర్‌ప్రింట్ సెన్సార్ & ఫేస్ అన్‌లాక్",
      "6.6 అంగుళాల బిగ్ డిస్ప్లే"
    ],
    lowest_price: 4999,
    highest_mrp: 7999,
    deal_label: "budget_pick",
    deal_score: 97,
    why_this_deal: [
      "₹5,000 లోపు లభించే ఏకైక 4GB/64GB స్మార్ట్‌ఫోన్",
      "తల్లిదండ్రులకు మరియు గ్రామీణ వినియోగదారులకు బెస్ట్ ఎంపిక",
      "Amazon కంటే Flipkartలో ₹100 తక్కువ ధర"
    ],
    price_difference: 100,
    cheaper_merchant: "flipkart",
    previous_observed_price: 5499,
    price_drop_amount: 500,
    audience_tags: ["all", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "MOBITEL70",
        product_title: "itel A70 (Brilliant Gold, 64 GB)",
        price: 4999,
        mrp: 7999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/itel-a70-gold-64gb/p/itm111"),
        in_stock: true,
        rating: 4.1,
        review_count: 14500,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B0CNP77M9",
        product_title: "itel A70 (4GB RAM, 64GB Storage)",
        price: 5099,
        mrp: 7999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B0CNP77M9"),
        in_stock: true,
        rating: 4.0,
        review_count: 11200,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_samsung_m04",
    brand: "Samsung",
    model: "Galaxy M04 (4GB RAM • 64GB)",
    title_te: "శాంసంగ్ గెలాక్సీ M04 (4GB ర్యామ్ • 64GB మెమరీ • 5000 mAh బ్యాటరీ)",
    title_en: "Samsung Galaxy M04 Light Green, 4GB RAM, 64GB Storage",
    category_id: "mobiles",
    category_name_te: "మొబైల్స్",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "4GB RAM • 64GB Storage (Expandable 1TB)",
      "5000 mAh భారీ బ్యాటరీ",
      "13MP డ్యూయల్ రియర్ కెమెరా",
      "6.5 అంగుళాల HD+ డిస్ప్లే"
    ],
    lowest_price: 7999,
    highest_mrp: 11999,
    deal_label: "lowest_price",
    deal_score: 94,
    why_this_deal: [
      "₹10,000 లోపు నమ్మకమైన బ్రాండ్ ఫోన్",
      "Flipkart కంటే Amazonలో ₹300 తక్కువ ధర",
      "5000 mAh బ్యాటరీతో రోజంతా చార్జింగ్ వస్తుంది"
    ],
    price_difference: 300,
    cheaper_merchant: "amazon",
    previous_observed_price: 8499,
    price_drop_amount: 500,
    audience_tags: ["all", "student", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B0BN4F52K8",
        product_title: "Samsung Galaxy M04 (4GB RAM, 64GB)",
        price: 7999,
        mrp: 11999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B0BN4F52K8"),
        in_stock: true,
        shipping_info: "ఉచిత డెలివరీ (Free Delivery)",
        rating: 4.1,
        review_count: 24850,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "MOBGKG7M2GYV7GYG",
        product_title: "SAMSUNG Galaxy M04 (Light Green, 64 GB)",
        price: 8299,
        mrp: 11999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/samsung-galaxy-m04-light-green-64-gb/p/itm12345"),
        in_stock: true,
        rating: 4.2,
        review_count: 18400,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_poco_m6_5g",
    brand: "POCO",
    model: "M6 5G (6GB RAM • 128GB)",
    title_te: "పోకో M6 5G (6GB ర్యామ్ • 128GB స్టోరేజ్ • 5G స్మార్ట్‌ఫోన్)",
    title_en: "POCO M6 5G Orion Blue, 6GB RAM, 128GB Storage, Dimensity 6100+",
    category_id: "mobiles",
    category_name_te: "మొబైల్స్",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "₹10,000 లోపు అసలైన 5G స్మార్ట్‌ఫోన్",
      "MediaTek Dimensity 6100+ 5G ప్రాసెసర్",
      "50MP AI కెమెరా • 5000 mAh బ్యాటరీ",
      "90Hz స్మూత్ డిస్ప్లే"
    ],
    lowest_price: 9999,
    highest_mrp: 13999,
    deal_label: "good_deal",
    deal_score: 95,
    why_this_deal: [
      "₹10,000 లోపు ఫాస్ట్ 5G ఇంటర్నెట్ సపోర్ట్ చేసే ఫోన్",
      "Amazon కంటే Flipkartలో ₹200 తక్కువ ధర",
      "స్టూడెంట్స్ కోసం ఆన్‌లైన్ క్లాసులు మరియు గేమింగ్‌కి బెస్ట్"
    ],
    price_difference: 200,
    cheaper_merchant: "flipkart",
    previous_observed_price: 10499,
    price_drop_amount: 500,
    audience_tags: ["all", "student"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "MOBPOCOM6",
        product_title: "POCO M6 5G (Orion Blue, 128 GB, 6 GB RAM)",
        price: 9999,
        mrp: 13999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/poco-m6-5g-128gb/p/itm999"),
        in_stock: true,
        rating: 4.3,
        review_count: 42000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B0CQX45",
        product_title: "POCO M6 5G (6GB RAM, 128GB Storage)",
        price: 10199,
        mrp: 13999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B0CQX45"),
        in_stock: true,
        rating: 4.2,
        review_count: 28000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // --- 🎓 STUDENT DEALS ---
  {
    id: "cp_boat_bassheads_100",
    brand: "boAt",
    model: "Bassheads 100 Wired Earphones with Mic",
    title_te: "బోట్ బాస్‌హెడ్స్ 100 ఇయర్ ఫోన్లు (మైక్ తో సహా • సూపర్ బాస్)",
    title_en: "boAt Bassheads 100 in Ear Wired Earphones with Mic",
    category_id: "student",
    subcategory: "audio",
    category_name_te: "స్టూడెంట్ డీల్స్",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "సూపర్ బాస్ సౌండ్ (10mm డైనమిక్ డ్రైవర్లు)",
      "ఇన్-లైన్ మైక్రోఫోన్ (కాలింగ్ కోసం)",
      "టాంగిల్ ఫ్రీ కేబుల్ (చిక్కుపడదు)",
      "3.5mm ఆడియో జాక్ సపోర్ట్"
    ],
    lowest_price: 349,
    highest_mrp: 999,
    deal_label: "student_pick",
    deal_score: 98,
    why_this_deal: [
      "₹500 లోపు నెం.1 బెస్ట్ సెల్లింగ్ ఇయర్ ఫోన్",
      "Flipkart కంటే Amazonలో ₹50 తక్కువ ధర",
      "ఆన్‌లైన్ క్లాసులు, పాటలు వినడానికి అనువైనది"
    ],
    price_difference: 50,
    cheaper_merchant: "amazon",
    previous_observed_price: 399,
    price_drop_amount: 50,
    audience_tags: ["all", "student", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B071Z8M4KX",
        product_title: "boAt Bassheads 100 in Ear Wired Earphones with Mic(Black)",
        price: 349,
        mrp: 999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B071Z8M4KX"),
        in_stock: true,
        rating: 4.1,
        review_count: 385000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "ACCEZ9Q2KGFYFHFZ",
        product_title: "boAt BassHeads 100 Wired Headset with Mic",
        price: 399,
        mrp: 999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/boat-bassheads-100-wired-headset/p/itme9876"),
        in_stock: true,
        rating: 4.2,
        review_count: 210000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_student_backpack_32l",
    brand: "American Tourister",
    model: "32 Litre Casual College / School Backpack",
    title_te: "అమెరికన్ టూరిస్టర్ 32 లీటర్ల కాలేజ్ బ్యాగ్‌ప్యాక్ (వాటర్ రెసిస్టెంట్)",
    title_en: "American Tourister 32L Casual Backpack for College & Work",
    category_id: "student",
    subcategory: "bags",
    category_name_te: "స్టూడెంట్ డీల్స్",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "32 లీటర్ల విశాలమైన సామర్థ్యం (3 కంపార్ట్‌మెంట్లు)",
      "ల్యాప్‌టాప్ పాకెట్ మరియు బాటిల్ హోల్డర్",
      "వాటర్ రెసిస్టెంట్ మన్నికైన క్లాత్",
      "1 సంవత్సరం ఇంటర్నేషనల్ వారంటీ"
    ],
    lowest_price: 899,
    highest_mrp: 2200,
    deal_label: "student_pick",
    deal_score: 93,
    why_this_deal: [
      "కాలేజ్ & స్కూల్ స్టూడెంట్స్‌కి నంబర్ 1 బ్రాండ్",
      "Amazon కంటే Flipkartలో ₹50 తక్కువ ధర",
      "ఎం.ఆర్.పి పై 59% భారీ తగ్గింపు"
    ],
    price_difference: 50,
    cheaper_merchant: "flipkart",
    previous_observed_price: 999,
    price_drop_amount: 100,
    audience_tags: ["all", "student"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "BKPFK777GGYY",
        product_title: "American Tourister 32 L Backpack (Blue)",
        price: 899,
        mrp: 2200,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/american-tourister-backpack/p/itm5555"),
        in_stock: true,
        rating: 4.3,
        review_count: 48000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B089K8L66Z",
        product_title: "American Tourister 32 L Casual Backpack",
        price: 949,
        mrp: 2200,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B089K8L66Z"),
        in_stock: true,
        rating: 4.2,
        review_count: 36000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_sandisk_64gb_usb",
    brand: "SanDisk",
    model: "Ultra 64GB USB 3.0 Pen Drive (Speed up to 130MB/s)",
    title_te: "శాన్‌డిస్క్ 64GB పెన్ డ్రైవ్ (USB 3.0 • హై స్పీడ్ డేటా ట్రాన్స్‌ఫర్)",
    title_en: "SanDisk Ultra 64GB USB 3.0 Pen Drive",
    category_id: "student",
    subcategory: "accessories",
    category_name_te: "స్టూడెంట్ డీల్స్",
    image_url: "https://images.unsplash.com/photo-1618761714958-0abbbc12dd40?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "64GB భారీ స్టోరేజ్ (సినిమాలు, ప్రాజెక్టులు, నోట్స్)",
      "USB 3.0 హై స్పీడ్ (130 MB/s వరకు వేగం)",
      "5 సంవత్సరాల తయారీదారు వారంటీ"
    ],
    lowest_price: 429,
    highest_mrp: 950,
    deal_label: "budget_pick",
    deal_score: 96,
    why_this_deal: [
      "₹500 లోపు ఒరిజినల్ శాన్‌డిస్క్ పెన్ డ్రైవ్",
      "Flipkart కంటే Amazonలో ₹20 తక్కువ ధర",
      "కాలేజ్ స్టూడెంట్స్ ప్రాజెక్ట్ ఫైల్స్ మరియు డేటా కోసం అనువైనది"
    ],
    price_difference: 20,
    cheaper_merchant: "amazon",
    audience_tags: ["all", "student"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B00NWUSB64",
        product_title: "SanDisk Ultra 64GB USB 3.0 Pen Drive",
        price: 429,
        mrp: 950,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B00NWUSB64"),
        in_stock: true,
        rating: 4.4,
        review_count: 125000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "USBFK64GB",
        product_title: "SanDisk Ultra 64 GB Pen Drive",
        price: 449,
        mrp: 950,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/sandisk-ultra-64gb/p/itm123"),
        in_stock: true,
        rating: 4.3,
        review_count: 85000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // --- 👨‍🌾 FARMER DEALS ---
  {
    id: "cp_farmer_battery_sprayer",
    brand: "KisanKraft",
    model: "16 Litre Battery Sprayer Pump",
    title_te: "కిసాన్ క్రాఫ్ట్ 16 లీటర్ల బ్యాటరీ స్ప్రేయర్ పంప్ (వ్యవసాయం & గార్డెనింగ్)",
    title_en: "KisanKraft 16L Battery Operated Agricultural Knapsack Sprayer",
    category_id: "farmer",
    category_name_te: "రైతుల డీల్స్",
    image_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "16 లీటర్ల హెవీ డ్యూటీ ట్యాంక్",
      "12V 8Ah రీచార్జబుల్ బ్యాటరీ (ఒక ఛార్జ్‌తో 20 ట్యాంకులు)",
      "రెగ్యులేటర్ కంట్రోల్ & 4 రకాల నాజిల్స్",
      "తేలికపాటి బరువుతో భుజాలపై మోయడం సులువు"
    ],
    lowest_price: 2799,
    highest_mrp: 4200,
    deal_label: "farmer_pick",
    deal_score: 95,
    why_this_deal: [
      "రైతులకు శ్రమ తగ్గించే బ్యాటరీ స్ప్రేయర్",
      "Flipkart కంటే Amazonలో ₹200 తక్కువ ధర",
      "మందులు, ఎరువులు మరియు పంట రక్షణకు అనువైనది"
    ],
    price_difference: 200,
    cheaper_merchant: "amazon",
    previous_observed_price: 2999,
    price_drop_amount: 200,
    audience_tags: ["all", "farmer", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B07P8J889L",
        product_title: "KisanKraft 16-Litre Battery Knapsack Sprayer",
        price: 2799,
        mrp: 4200,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B07P8J889L"),
        in_stock: true,
        rating: 4.2,
        review_count: 6500,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "SPRFK8882L",
        product_title: "KisanKraft 16 L Knapsack Sprayer (Battery Operated)",
        price: 2999,
        mrp: 4200,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/kisankraft-16l-sprayer/p/itmspray1"),
        in_stock: true,
        rating: 4.1,
        review_count: 4200,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_kisan_led_torch",
    brand: "Havells",
    model: "Rechargeable Long Range LED Torch (Up to 1 KM Beam)",
    title_te: "హావెల్స్ లాంగ్ రేంజ్ రీచార్జబుల్ LED టార్చ్ లైట్ (రాత్రి పొలం కాపలాకు బెస్ట్)",
    title_en: "Havells Heavy Duty Long Range Rechargeable LED Torch Light",
    category_id: "farmer",
    category_name_te: "రైతుల డీల్స్",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "1 కిలోమీటర్ దూరం వరకు వెలుతురు",
      "హెవీ రీచార్జబుల్ బ్యాటరీ (8 గంటల బ్యాకప్)",
      "వాటర్‌ప్రూఫ్ మరియు రఫ్ యూజ్ బాడీ",
      "రాత్రి వేళ పొలం తిరగడానికి మరియు గ్రామాల్లో అత్యవసరం"
    ],
    lowest_price: 499,
    highest_mrp: 999,
    deal_label: "lowest_price",
    deal_score: 96,
    why_this_deal: [
      "₹500 లోపు అత్యుత్తమ లాంగ్ రేంజ్ టార్చ్",
      "Amazon కంటే Flipkartలో ₹50 తక్కువ ధర",
      "రైతులు మరియు పల్లెటూరి ఇళ్లకు అత్యవసర వస్తువు"
    ],
    price_difference: 50,
    cheaper_merchant: "flipkart",
    previous_observed_price: 599,
    price_drop_amount: 100,
    audience_tags: ["all", "farmer", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "TORCHFK499",
        product_title: "Havells Long Range Rechargeable LED Torch",
        price: 499,
        mrp: 999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/havells-led-torch/p/itm777"),
        in_stock: true,
        rating: 4.3,
        review_count: 19800,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B07TORCH99",
        product_title: "Havells Heavy Duty Rechargeable LED Torch",
        price: 549,
        mrp: 999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B07TORCH99"),
        in_stock: true,
        rating: 4.2,
        review_count: 14200,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // --- 🏠 HOME DEALS ---
  {
    id: "cp_pigeon_handy_chopper",
    brand: "Pigeon",
    model: "Handy Vegetable Chopper (3 Stainless Steel Blades)",
    title_te: "పీజియన్ హ్యాండీ వెజిటబుల్ చాపర్ (3 బ్లేడ్లు • కూరగాయలు క్షణాల్లో కట్ చేయండి)",
    title_en: "Pigeon by Stovekraft Handy Mini Plastic Chopper with 3 Blades",
    category_id: "home",
    subcategory: "kitchen",
    category_name_te: "ఇంటి డీల్స్",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "విద్యుత్ అవసరం లేదు (సులభమైన పుల్-కార్డ్ సిస్టమ్)",
      "3 పదునైన స్టెయిన్‌లెస్ స్టీల్ బ్లేడ్లు",
      "ఉల్లిపాయలు, టమాటాలు, మిర్చిని 5 సెకన్లలో కట్ చేస్తుంది",
      "ఈజీ క్లీనింగ్ మరియు ఫుడ్-గ్రేడ్ ప్లాస్టిక్"
    ],
    lowest_price: 199,
    highest_mrp: 545,
    deal_label: "lowest_price",
    deal_score: 99,
    why_this_deal: [
      "₹200 లోపు ప్రతి వంటింటికీ అత్యంత ఉపయోగపడే వస్తువు",
      "Flipkart కంటే Amazonలో ₹30 తక్కువ ధర",
      "భారతదేశంలో 3 లక్షలకు పైగా పాజిటివ్ రేటింగ్స్"
    ],
    price_difference: 30,
    cheaper_merchant: "amazon",
    previous_observed_price: 249,
    price_drop_amount: 50,
    audience_tags: ["all", "village"],
    is_todays_deal: true,
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B01LWYWF19",
        product_title: "Pigeon by Stovekraft Handy Mini Plastic Chopper with 3 Blades",
        price: 199,
        mrp: 545,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B01LWYWF19"),
        in_stock: true,
        rating: 4.3,
        review_count: 320000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "CHPFK2345",
        product_title: "Pigeon Handy Mini Chopper 3 Blades",
        price: 229,
        mrp: 545,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/pigeon-mini-chopper/p/itmchop1"),
        in_stock: true,
        rating: 4.3,
        review_count: 180000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },
  {
    id: "cp_wipro_emergency_light",
    brand: "Wipro",
    model: "Coral Rechargeable Emergency LED Lantern (3000 mAh)",
    title_te: "విప్రో కోరల్ రీచార్జబుల్ ఎమర్జెన్సీ లైట్ (పవర్ కట్ సమయంలో 8 గంటల వెలుతురు)",
    title_en: "Wipro Coral Rechargeable Emergency LED Lantern, 3000 mAh",
    category_id: "home",
    subcategory: "lighting",
    category_name_te: "ఇంటి డీల్స్",
    image_url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
    key_specs: [
      "3000 mAh లిథియం అయాన్ బ్యాటరీ",
      "పవర్ కట్ అయినప్పుడు ఆటోమేటిక్‌గా ఆన్ అవుతుంది",
      "8 గంటల నిరంతర బ్రైట్ ఎమర్జెన్సీ వెలుతురు",
      "తేలికైనది, హ్యాండిల్‌తో సులువుగా పట్టుకోవచ్చు"
    ],
    lowest_price: 799,
    highest_mrp: 1390,
    deal_label: "good_deal",
    deal_score: 94,
    why_this_deal: [
      "గ్రామీణ ప్రాంతాల్లో తరచుగా వచ్చే కరెంట్ కోతలకు బెస్ట్ పరిష్కారం",
      "Flipkart కంటే Amazonలో ₹80 తక్కువ ధర",
      "విప్రో 1 సంవత్సరం విశ్వసనీయమైన వారంటీ"
    ],
    price_difference: 80,
    cheaper_merchant: "amazon",
    previous_observed_price: 899,
    price_drop_amount: 100,
    audience_tags: ["all", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B079D8965",
        product_title: "Wipro Coral Rechargeable Emergency Lantern",
        price: 799,
        mrp: 1390,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B079D8965"),
        in_stock: true,
        rating: 4.2,
        review_count: 24000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "EMRFL7890",
        product_title: "Wipro Coral Rechargeable Emergency Lantern",
        price: 879,
        mrp: 1390,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/wipro-emergency-light/p/itm5678"),
        in_stock: true,
        rating: 4.1,
        review_count: 16000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  }
];

// LocalStorage Keys
const STORAGE_DEALS_SAVED = "mana_adda_saved_deals";
const STORAGE_DEALS_CLICKS = "mana_adda_affiliate_clicks";
const STORAGE_DEALS_ALERTS = "mana_adda_price_alerts";

// ============================================================
// 9. TELUGU & ENGLISH NATURAL LANGUAGE QUERY INTERPRETER
// ============================================================
export interface InterpretedDealsQuery {
  rawQuery: string;
  category?: string;
  subcategory?: string;
  max_price?: number;
  audience_mode?: DealAudienceMode;
  interpreted_category_te?: string;
  interpreted_budget_te?: string;
}

export function parseNaturalDealsQuery(query: string): InterpretedDealsQuery {
  const result: InterpretedDealsQuery = { rawQuery: query };
  const lower = query.toLowerCase().trim();

  // 1. Budget extraction
  if (/(\d+)\s*వేల\s*(?:లోపు|వరకు)/i.test(lower)) {
    const match = lower.match(/(\d+)\s*వేల/i);
    if (match && match[1]) {
      result.max_price = parseInt(match[1], 10) * 1000;
      result.interpreted_budget_te = `₹${result.max_price.toLocaleString("en-IN")} లోపు`;
    }
  } else if (/(\d+)\s*k/i.test(lower)) {
    const match = lower.match(/(\d+)\s*k/i);
    if (match && match[1]) {
      result.max_price = parseInt(match[1], 10) * 1000;
      result.interpreted_budget_te = `₹${result.max_price.toLocaleString("en-IN")} లోపు`;
    }
  } else {
    const priceMatch = lower.match(/(?:under|below|లోపు|వరకు|కంటే తక్కువ)\s*₹?\s*(\d+)/i) || 
                       lower.match(/₹?\s*(\d+)\s*(?:under|below|లోపు|వరకు)/i);
    if (priceMatch && priceMatch[1]) {
      result.max_price = parseInt(priceMatch[1], 10);
      result.interpreted_budget_te = `₹${result.max_price.toLocaleString("en-IN")} లోపు`;
    }
  }

  // 2. Category identification
  if (/బియ్యం|వరి|రైస్|rice|నూనె|ఆయిల్|oil|పప్పు|dal|పిండి|atta|సబ్బు|సోప్|soap|షాంపూ|shampoo|కిరాణా|kirana|grocery|నిత్యావసరాలు|వాష్|సర్ఫ్|surf/i.test(lower)) {
    result.category = "kirana";
    result.interpreted_category_te = "🛒 నిత్యావసరాలు & కిరాణా";
    if (/బియ్యం|రైస్|rice|పప్పు|dal|నూనె|oil|పిండి|atta/i.test(lower)) {
      result.subcategory = "kirana";
    } else if (/సబ్బు|సోప్|soap|షాంపూ|shampoo/i.test(lower)) {
      result.subcategory = "personal_care";
    } else if (/సర్ఫ్|క్లీనింగ్|surf|detergent|cleaning/i.test(lower)) {
      result.subcategory = "cleaning";
    }
  } else if (/మొబైల్|ఫోన్|ఫోన్లు|mobile|phone|smartphone|శాంసంగ్|రెడ్మి|samsung|redmi|poco|realme/i.test(lower)) {
    result.category = "mobiles";
    result.interpreted_category_te = "📱 మొబైల్స్";
  } else if (/హెడ్‌ఫోన్|హెడ్ఫోన్|ఇయర్ ఫోన్|స్పీకర్|audio|headphone|earphone|sound/i.test(lower)) {
    result.category = "student";
    result.subcategory = "audio";
    result.interpreted_category_te = "🎧 హెడ్ఫోన్స్ & ఆడియో";
  } else if (/రైతు|స్ప్రేయర్|పొలం|వ్యవసాయం|farmer|agriculture|sprayer|pump|టార్చ్|torch/i.test(lower)) {
    result.category = "farmer";
    result.audience_mode = "farmer";
    result.interpreted_category_te = "👨‍🌾 రైతుల డీల్స్";
  } else if (/స్టూడెంట్|కాలేజ్|స్కూల్|పుస్తకం|బ్యాగ్|student|school|college|backpack|ల్యాప్‌టాప్|laptop/i.test(lower)) {
    result.category = "student";
    result.audience_mode = "student";
    result.interpreted_category_te = "🎓 స్టూడెంట్ డీల్స్";
  } else if (/ఇంటి|కిచెన్|చాపర్|లైట్|ఫ్యాన్|ఎమర్జెన్సీ|home|kitchen|chopper|fan/i.test(lower)) {
    result.category = "home";
    result.interpreted_category_te = "🏠 ఇంటి డీల్స్";
  }

  return result;
}

// ============================================================
// 10. SEARCH CANONICAL PRODUCTS
// ============================================================
export async function searchCanonicalProducts(filters: DealsSearchFilters): Promise<{
  products: CanonicalProduct[];
  total: number;
}> {
  let list = [...SEED_CANONICAL_PRODUCTS];

  // Audience Mode Filter
  if (filters.audience_mode && filters.audience_mode !== "all") {
    list = list.filter((p) => p.audience_tags.includes(filters.audience_mode!));
  }

  // Category Filter
  if (filters.category && filters.category !== "all") {
    list = list.filter((p) => p.category_id === filters.category);
  }

  // Subcategory Filter
  if (filters.subcategory && filters.subcategory !== "all") {
    list = list.filter((p) => p.subcategory === filters.subcategory);
  }

  // Collection Filter
  if (filters.collection && filters.collection !== "all") {
    if (filters.collection === "todays_deals") {
      list = list.filter((p) => p.is_todays_deal);
    } else if (filters.collection === "price_drop") {
      list = list.filter((p) => (p.price_drop_amount && p.price_drop_amount > 0) || p.deal_label === "price_drop");
    } else if (filters.collection === "budget_deals") {
      list = list.filter((p) => p.lowest_price <= 500);
    } else if (filters.collection === "good_deals") {
      list = list.filter((p) => p.deal_score >= 94);
    } else if (filters.collection === "student_deals") {
      list = list.filter((p) => p.category_id === "student" || p.audience_tags.includes("student"));
    } else if (filters.collection === "farmer_deals") {
      list = list.filter((p) => p.category_id === "farmer" || p.audience_tags.includes("farmer"));
    } else if (filters.collection === "home_deals") {
      list = list.filter((p) => p.category_id === "home");
    } else if (filters.collection === "kirana_deals") {
      list = list.filter((p) => p.category_id === "kirana");
    }
  }

  // Max Budget Filter
  if (filters.max_price && filters.max_price > 0) {
    list = list.filter((p) => p.lowest_price <= filters.max_price!);
  }

  // Min Budget Filter
  if (filters.min_price && filters.min_price > 0) {
    list = list.filter((p) => p.lowest_price >= filters.min_price!);
  }

  // Free-text query
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.title_te.toLowerCase().includes(q) ||
        p.title_en.toLowerCase().includes(q) ||
        p.key_specs.some((spec) => spec.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (filters.sort_by === "price_asc") {
    list.sort((a, b) => a.lowest_price - b.lowest_price);
  } else if (filters.sort_by === "price_desc") {
    list.sort((a, b) => b.lowest_price - a.lowest_price);
  } else if (filters.sort_by === "savings") {
    list.sort((a, b) => (b.highest_mrp - b.lowest_price) - (a.highest_mrp - a.lowest_price));
  } else {
    list.sort((a, b) => b.deal_score - a.deal_score);
  }

  return {
    products: list,
    total: list.length
  };
}

// ============================================================
// 11. RECORD AFFILIATE CLICK
// ============================================================
export function recordAffiliateClick(
  canonicalProduct: CanonicalProduct,
  merchantOffer: MerchantOffer
): { affiliateUrl: string } {
  const sessionId = typeof window !== "undefined" ? (sessionStorage.getItem("deals_session_id") || `sess_${Date.now()}`) : "sess_default";
  if (typeof window !== "undefined") {
    sessionStorage.setItem("deals_session_id", sessionId);
  }

  const clickEvent: AffiliateClickEvent = {
    id: `clk_${Date.now()}`,
    canonical_product_id: canonicalProduct.id,
    product_title: canonicalProduct.model,
    merchant: merchantOffer.merchant,
    price: merchantOffer.price,
    affiliate_url: merchantOffer.affiliate_url,
    clicked_at: new Date().toISOString(),
    user_session_id: sessionId
  };

  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(STORAGE_DEALS_CLICKS);
      const existing: AffiliateClickEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(STORAGE_DEALS_CLICKS, JSON.stringify([clickEvent, ...existing.slice(0, 100)]));
    } catch {}
  }

  if (hasSupabaseEnv && supabase) {
    Promise.resolve(supabase.from("affiliate_clicks").insert([clickEvent]))
      .catch((e: any) => {
        console.warn("Could not persist affiliate click:", e);
      });
  }

  return { affiliateUrl: merchantOffer.affiliate_url };
}

// ============================================================
// 12. SAVED DEALS HANDLERS
// ============================================================
export function getSavedDealIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DEALS_SAVED);
    const list: SavedDeal[] = raw ? JSON.parse(raw) : [];
    return list.map((s) => s.canonical_product_id);
  } catch {
    return [];
  }
}

export function toggleSaveDeal(product: CanonicalProduct): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_DEALS_SAVED);
    const existing: SavedDeal[] = raw ? JSON.parse(raw) : [];
    const isSaved = existing.some((s) => s.canonical_product_id === product.id);

    let updated: SavedDeal[];
    if (isSaved) {
      updated = existing.filter((s) => s.canonical_product_id !== product.id);
    } else {
      updated = [
        {
          canonical_product_id: product.id,
          saved_price: product.lowest_price,
          saved_at: new Date().toISOString()
        },
        ...existing
      ];
    }
    localStorage.setItem(STORAGE_DEALS_SAVED, JSON.stringify(updated));
    return !isSaved;
  } catch {
    return false;
  }
}

// ============================================================
// 13. PRICE DROP ALERTS
// ============================================================
export function savePriceDropAlert(alert: {
  canonical_product_id: string;
  product_title: string;
  target_price: number;
  current_price: number;
  contact_info: string;
}): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_DEALS_ALERTS);
    const existing: PriceDropAlert[] = raw ? JSON.parse(raw) : [];
    const newAlert: PriceDropAlert = {
      id: `alt_${Date.now()}`,
      ...alert,
      created_at: new Date().toISOString(),
      is_active: true
    };
    localStorage.setItem(STORAGE_DEALS_ALERTS, JSON.stringify([newAlert, ...existing]));
    return true;
  } catch {
    return false;
  }
}

export function getPriceDropAlerts(): PriceDropAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DEALS_ALERTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================================
// 14. ADMIN ANALYTICS HELPER
// ============================================================
export function getDealsAdminStats(): DealsAdminStats {
  let clicks: AffiliateClickEvent[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_DEALS_CLICKS);
      if (raw) clicks = JSON.parse(raw);
    } catch {}
  }

  const amazonClicks = clicks.filter((c) => c.merchant === "amazon").length;
  const flipkartClicks = clicks.filter((c) => c.merchant === "flipkart").length;

  return {
    total_products: SEED_CANONICAL_PRODUCTS.length,
    total_clicks: clicks.length,
    clicks_today: clicks.length,
    top_merchants: [
      { merchant: "amazon", count: amazonClicks },
      { merchant: "flipkart", count: flipkartClicks }
    ],
    top_categories: [
      { category: "Kirana & Essentials", count: clicks.filter((c) => c.product_title.includes("Rice") || c.product_title.includes("Oil")).length },
      { category: "Mobiles", count: clicks.filter((c) => c.product_title.includes("Galaxy") || c.product_title.includes("itel")).length },
      { category: "Farmer Tools", count: clicks.filter((c) => c.product_title.includes("Sprayer")).length }
    ],
    active_merchants: [
      { id: "amazon", name: "Amazon India (Creators API)", status: "active", last_sync: "17 Sep 2026, 9:30 PM" },
      { id: "flipkart", name: "Flipkart Affiliate", status: "active", last_sync: "17 Sep 2026, 9:30 PM" }
    ]
  };
}
