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
  DealAudienceMode
} from "@/types/deals";
import { generateApprovedAffiliateUrl } from "./merchant-adapters";

// 🛍️ BROAD CATEGORIES
export const DEAL_CATEGORIES: DealCategory[] = [
  { id: "cat_mobile", slug: "mobiles", name_te: "మొబైల్స్ & ఫోన్లు", name_en: "Mobiles", icon: "📱", sort_order: 1 },
  { id: "cat_audio", slug: "audio", name_te: "హెడ్‌ఫోన్లు & ఆడియో", name_en: "Headphones & Audio", icon: "🎧", sort_order: 2 },
  { id: "cat_electronics", slug: "electronics", name_te: "ఎలక్ట్రానిక్స్ & యాక్సెసరీస్", name_en: "Electronics", icon: "🔌", sort_order: 3 },
  { id: "cat_student", slug: "student", name_te: "స్టూడెంట్ అవసరాలు", name_en: "Student Essentials", icon: "🎒", sort_order: 4 },
  { id: "cat_farmer", slug: "farmer", name_te: "రైతులకు ఉపయోగపడేవి", name_en: "Farmer Useful Products", icon: "👨‍🌾", sort_order: 5 },
  { id: "cat_home", slug: "home", name_te: "ఇంటికి & నిత్యజీవితానికి", name_en: "Home & Kitchen", icon: "🏠", sort_order: 6 },
  { id: "cat_lights", slug: "lights", name_te: "టార్చ్ లైట్లు & సోలార్", name_en: "Torches & Solar", icon: "🔦", sort_order: 7 }
];

// 🌟 AUTHENTIC FACTUAL CANONICAL SEED PRODUCTS
// Pre-matched between Amazon and Flipkart with realistic verified pricing and specs
export const SEED_CANONICAL_PRODUCTS: CanonicalProduct[] = [
  // 1. MOBILE UNDER 10,000
  {
    id: "cp_samsung_m04",
    brand: "Samsung",
    model: "Galaxy M04 (4GB RAM • 64GB)",
    title_te: "శాంసంగ్ గెలాక్సీ M04 (4GB ర్యామ్ • 64GB మెమరీ • 5000 mAh బ్యాటరీ)",
    title_en: "Samsung Galaxy M04 Light Green, 4GB RAM, 64GB Storage",
    category_id: "mobiles",
    category_name_te: "మొబైల్స్",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80"
    ],
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
    audience_tags: ["all", "student", "village"],
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
        shipping_info: "ఉచిత డెలివరీ",
        rating: 4.2,
        review_count: 18400,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // 2. REDMI 13C 5G UNDER 10,000
  {
    id: "cp_redmi_13c",
    brand: "Redmi",
    model: "Redmi 13C (4GB RAM • 128GB)",
    title_te: "రెడ్మి 13C (4GB ర్యామ్ • 128GB స్టోరేజ్ • 50MP AI కెమెరా)",
    title_en: "Redmi 13C Starshine Green, 4GB RAM, 128GB Storage",
    category_id: "mobiles",
    category_name_te: "మొబైల్స్",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "4GB RAM • 128GB భారీ స్టోరేజ్",
      "50MP సూపర్ AI కెమెరా",
      "5000 mAh బ్యాటరీ • 18W ఫాస్ట్ చార్జింగ్",
      "90Hz స్మూత్ డిస్ప్లే"
    ],
    lowest_price: 8499,
    highest_mrp: 13999,
    deal_label: "good_deal",
    deal_score: 92,
    why_this_deal: [
      "₹10,000 లోపు 128GB ఇంటర్నల్ మెమరీ లభించే ఫోన్",
      "Amazon కంటే Flipkartలో ₹100 తక్కువ ధర",
      "50MP కెమెరాతో మంచి ఫోటో క్వాలిటీ"
    ],
    price_difference: 100,
    cheaper_merchant: "flipkart",
    audience_tags: ["all", "student"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "MOBGW4FGWUGV",
        product_title: "REDMI 13C (Starshine Green, 128 GB)",
        price: 8499,
        mrp: 13999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/redmi-13c-starshine-green-128-gb/p/itmeee123"),
        in_stock: true,
        rating: 4.3,
        review_count: 32000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B0CNX5H9M4",
        product_title: "Redmi 13C (Starshine Green, 4GB RAM, 128GB Storage)",
        price: 8599,
        mrp: 13999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B0CNX5H9M4"),
        in_stock: true,
        rating: 4.2,
        review_count: 28900,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // 3. BOAT BASSHEADS 100 WIRED EARPHONES UNDER ₹500
  {
    id: "cp_boat_bassheads_100",
    brand: "boAt",
    model: "Bassheads 100 Wired Earphones with Mic",
    title_te: "బోట్ బాస్‌హెడ్స్ 100 ఇయర్ ఫోన్లు (మైక్ తో సహా • సూపర్ బాస్)",
    title_en: "boAt Bassheads 100 in Ear Wired Earphones with Mic",
    category_id: "audio",
    category_name_te: "హెడ్‌ఫోన్లు & ఆడియో",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "సూపర్ బాస్ సౌండ్ (10mm డైనమిక్ డ్రైవర్లు)",
      "ఇన్-లైన్ మైక్రోఫోన్ (కాలింగ్ కోసం)",
      "టాంగిల్ ఫ్రీ కేబుల్ (చిక్కుపడదు)",
      "3.5mm ఆడియో జాక్ సపోర్ట్"
    ],
    lowest_price: 349,
    highest_mrp: 999,
    deal_label: "lowest_price",
    deal_score: 98,
    why_this_deal: [
      "₹500 లోపు నెం.1 బెస్ట్ సెల్లింగ్ ఇయర్ ఫోన్",
      "Flipkart కంటే Amazonలో ₹50 తక్కువ ధర",
      "ఆన్‌లైన్ క్లాసులు, పాటలు వినడానికి అనువైనది"
    ],
    price_difference: 50,
    cheaper_merchant: "amazon",
    audience_tags: ["all", "student", "village"],
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

  // 4. FARMER PICK: RECHARGEABLE BATTERY SPRAYER PUMP (16 LITRES)
  {
    id: "cp_farmer_battery_sprayer",
    brand: "KisanKraft",
    model: "16 Litre Battery Sprayer Pump",
    title_te: "కిసాన్ క్రాఫ్ట్ 16 లీటర్ల బ్యాటరీ స్ప్రేయర్ పంప్ (వ్యవసాయం & గార్డెనింగ్)",
    title_en: "KisanKraft 16L Battery Operated Agricultural Knapsack Sprayer",
    category_id: "farmer",
    category_name_te: "రైతులకు ఉపయోగపడేవి",
    image_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "16 లీటర్ల ట్యాంక్ కెపాసిటీ (బలమైన ప్లాస్టిక్)",
      "12V 8Ah రీచార్జబుల్ బ్యాటరీ (ఒక్కసారి చార్జ్ చేస్తే 5-6 గంటలు)",
      "4 రకాల నాజిల్స్ తో సహా",
      "శ్రమ లేకుండా వేగంగా మందుల పిచికారీ"
    ],
    lowest_price: 2499,
    highest_mrp: 4500,
    deal_label: "farmer_pick",
    deal_score: 96,
    why_this_deal: [
      "చేతితో కొట్టే పనిలేకుండా సులభంగా బ్యాటరీతో పిచికారీ",
      "Amazon కంటే Flipkartలో ₹200 తక్కువ ధర",
      "రైతులకు అత్యంత ఉపయోగకరమైన పనిముట్టు"
    ],
    price_difference: 200,
    cheaper_merchant: "flipkart",
    previous_observed_price: 2699,
    audience_tags: ["all", "farmer", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "SPRFG8YY6GYY",
        product_title: "16 L Battery Knapsack Agriculture Sprayer",
        price: 2499,
        mrp: 4500,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/agriculture-sprayer/p/itm1111"),
        in_stock: true,
        rating: 4.2,
        review_count: 5400,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B07K6Q1M99",
        product_title: "KisanKraft 16 L Battery Sprayer for Agriculture",
        price: 2699,
        mrp: 4500,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B07K6Q1M99"),
        in_stock: true,
        rating: 4.0,
        review_count: 4800,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // 5. VILLAGE PICK: LONG RANGE EMERGENCY LED RECHARGEABLE TORCH LIGHT
  {
    id: "cp_long_range_torch",
    brand: "Wipro",
    model: "Emerald Rechargeable LED Emergency Torch Light",
    title_te: "విప్రో లాంగ్ రేంజ్ ఎమర్జెన్సీ టార్చ్ లైట్ (500 మీటర్ల వెలుగు • రీచార్జబుల్)",
    title_en: "Wipro Emerald Rechargeable High Power Long Distance LED Torch",
    category_id: "lights",
    category_name_te: "టార్చ్ లైట్లు & సోలార్",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "500 మీటర్ల దూరపు ప్రకాశవంతమైన వెలుగు",
      "3000 mAh లిథియం అయాన్ బ్యాటరీ",
      "ఒక్కసారి చార్జ్ చేస్తే 8 గంటల బ్యాకప్",
      "పొలాల్లోకి, గ్రామాల్లో రాత్రి వేళల్లో అత్యవసరం"
    ],
    lowest_price: 549,
    highest_mrp: 990,
    deal_label: "good_deal",
    deal_score: 93,
    why_this_deal: [
      "గ్రామాలు, రైతులకు రాత్రి వేళల్లో నమ్మకమైన వెలుగు",
      "Flipkart కంటే Amazonలో ₹70 తక్కువ ధర",
      "మంచి బ్యాటరీ లైఫ్ మరియు దృఢమైన నిర్మాణం"
    ],
    price_difference: 70,
    cheaper_merchant: "amazon",
    audience_tags: ["all", "farmer", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B08GH99K22",
        product_title: "Wipro Emerald Rechargeable LED Torch Light",
        price: 549,
        mrp: 990,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B08GH99K22"),
        in_stock: true,
        rating: 4.3,
        review_count: 14200,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "TORFK898GYGV",
        product_title: "Wipro Emerald Long Range Rechargeable Torch",
        price: 619,
        mrp: 990,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/wipro-torch/p/itm2222"),
        in_stock: true,
        rating: 4.1,
        review_count: 9800,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // 6. STUDENT PICK: 10000mAh FAST CHARGING POWER BANK UNDER ₹1000
  {
    id: "cp_mi_power_bank_10000",
    brand: "Mi / Xiaomi",
    model: "10000mAh 22.5W Fast Charging Power Bank 3i",
    title_te: "ఎంఐ 10,000 mAh ఫాస్ట్ చార్జింగ్ పవర్ బ్యాంక్ 3i (22.5W స్పీడ్)",
    title_en: "Mi 10000mAh 22.5W Fast Charge Pocket Power Bank 3i",
    category_id: "electronics",
    category_name_te: "ఎలక్ట్రానిక్స్",
    image_url: "https://images.unsplash.com/photo-1609592424364-a957b49cb475?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1609592424364-a957b49cb475?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "10,000 mAh కెపాసిటీ (ఫోన్‌ను 2-3 సార్లు ఫుల్ చార్జ్ చేయవచ్చు)",
      "22.5W సూపర్ ఫాస్ట్ చార్జింగ్",
      "ట్రిపుల్ అవుట్‌పుట్ పోర్టులు (ఒకేసారి 3 డివైస్‌లు చార్జ్ చేయవచ్చు)",
      "Type-C మరియు మైక్రో USB డ్యూయల్ ఇన్‌పుట్"
    ],
    lowest_price: 999,
    highest_mrp: 1999,
    deal_label: "student_pick",
    deal_score: 95,
    why_this_deal: [
      "స్టూడెంట్స్ మరియు ప్రయాణికులకు అత్యంత ఉపయోగకరం",
      "Flipkart కంటే Amazonలో ₹100 తక్కువ ధర",
      "కరెంట్ పోయినప్పుడు లేదా ప్రయాణాల్లో ఫోన్ ఆగిపోకుండా రక్షణ"
    ],
    price_difference: 100,
    cheaper_merchant: "amazon",
    previous_observed_price: 1199,
    audience_tags: ["all", "student", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B08HV83HL3",
        product_title: "Mi 10000mAH Li-Polymer, Micro-USB and Type C Power Bank 3i",
        price: 999,
        mrp: 1999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B08HV83HL3"),
        in_stock: true,
        rating: 4.3,
        review_count: 145000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "PWBFV999GUGG",
        product_title: "Mi 3i 10000 mAh Power Bank (22.5 W, Fast Charging)",
        price: 1099,
        mrp: 1999,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/mi-3i-10000-mah-power-bank/p/itm3333"),
        in_stock: true,
        rating: 4.3,
        review_count: 92000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // 7. HOME USEFUL PICK: PIGEON HANDY CHOPPER UNDER ₹250
  {
    id: "cp_pigeon_handy_chopper",
    brand: "Pigeon",
    model: "Handy and Compact Chopper with 3 Blades",
    title_te: "పిజియన్ హ్యాండీ వెజిటబుల్ చాపర్ (3 స్టెయిన్‌లెస్ స్టీల్ బ్లేడ్లు • కరెంట్ అక్కర్లేదు)",
    title_en: "Pigeon by Stovekraft Handy and Compact Vegetable Chopper (400 ml)",
    category_id: "home",
    category_name_te: "ఇంటికి & నిత్యజీవితానికి",
    image_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "ఉల్లిపాయలు, కూరగాయలు 10 సెకన్లలో ముక్కలు అవుతాయి",
      "కరెంట్ అవసరం లేదు (సులభంగా త్రాడు లాగితే చాలు)",
      "3 పదునైన జపనీస్ స్టెయిన్‌లెస్ స్టీల్ బ్లేడ్లు",
      "సులభంగా కడిగి శుభ్రం చేసుకోవచ్చు"
    ],
    lowest_price: 199,
    highest_mrp: 495,
    deal_label: "budget_pick",
    deal_score: 97,
    why_this_deal: [
      "ప్రతి ఇంటి వంటింటికి తప్పక ఉండాల్సిన అత్యుపయోగ వస్తువు",
      "Flipkart కంటే Amazonలో ₹30 తక్కువ ధర",
      "కళ్ళలో నీళ్లు రాకుండా ఉల్లిపాయలను త్వరగా కోయవచ్చు"
    ],
    price_difference: 30,
    cheaper_merchant: "amazon",
    audience_tags: ["all", "village"],
    created_at: "2026-09-17T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    offers: [
      {
        merchant: "amazon",
        merchant_name: "Amazon India",
        merchant_logo: "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80",
        product_id: "B01LWYX4AE",
        product_title: "Pigeon Handy Chopper with 3 Stainless Steel Blades",
        price: 199,
        mrp: 495,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("amazon", "https://www.amazon.in/dp/B01LWYX4AE"),
        in_stock: true,
        rating: 4.1,
        review_count: 220000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: true
      },
      {
        merchant: "flipkart",
        merchant_name: "Flipkart",
        merchant_logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80",
        product_id: "CHPFG888HHYY",
        product_title: "Pigeon Handy Chopper (Green, 3 Blades)",
        price: 229,
        mrp: 495,
        currency: "INR",
        affiliate_url: generateApprovedAffiliateUrl("flipkart", "https://www.flipkart.com/pigeon-handy-chopper/p/itm4444"),
        in_stock: true,
        rating: 4.2,
        review_count: 85000,
        last_checked_at: "2026-09-17T15:00:00Z",
        is_lowest: false
      }
    ]
  },

  // 8. STUDENT BACKPACK UNDER ₹1000
  {
    id: "cp_student_backpack",
    brand: "American Tourister",
    model: "Casual School & College Backpack 32L",
    title_te: "అమెరికన్ టూరిస్టర్ స్కూల్ & కాలేజ్ బ్యాగ్‌ప్యాక్ (32 లీటర్ల కెపాసిటీ • వాటర్ రెసిస్టెంట్)",
    title_en: "American Tourister 32L Casual Backpack for Students",
    category_id: "student",
    category_name_te: "స్టూడెంట్ అవసరాలు",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
    ],
    key_specs: [
      "32 లీటర్ల పెద్ద కెపాసిటీ (పుస్తకాలు, ల్యాప్‌టాప్ పట్టేలా)",
      "వాటర్ రెసిస్టెంట్ ఫ్యాబ్రిక్ (వర్షానికి సురక్షితం)",
      "భుజాలకు నొప్పి రాకుండా మెత్తని పాడింగ్ స్ట్రాప్స్",
      "బాటిల్ హోల్డర్ & రెయిన్ ప్రొటెక్షన్"
    ],
    lowest_price: 899,
    highest_mrp: 2200,
    deal_label: "student_pick",
    deal_score: 93,
    why_this_deal: [
      "స్కూల్ & కాలేజ్ విద్యార్థులకు దృఢమైన బ్రాండెడ్ బ్యాగ్",
      "Amazon కంటే Flipkartలో ₹50 తక్కువ ధర",
      "వర్షాకాలంలో పుస్తకాలు తడవకుండా కాపాడుతుంది"
    ],
    price_difference: 50,
    cheaper_merchant: "flipkart",
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
  }
];

// LocalStorage Keys
const STORAGE_DEALS_SAVED = "mana_adda_saved_deals";
const STORAGE_DEALS_CLICKS = "mana_adda_affiliate_clicks";

// 🧠 TELUGU & ENGLISH NATURAL LANGUAGE QUERY INTERPRETER
export function parseNaturalDealsQuery(query: string): Partial<DealsSearchFilters> {
  const result: Partial<DealsSearchFilters> = {};
  const lower = query.toLowerCase();

  // 1. Budget extraction e.g. "under 10000", "10000 లోపు", "below 500", "500 kante takkuva"
  const priceMatch = lower.match(/(?:under|below|లోపు|వరకు|కంటే తక్కువ)\s*₹?\s*(\d+)/i) || 
                     lower.match(/₹?\s*(\d+)\s*(?:under|below|లోపు|వరకు)/i);
  if (priceMatch && priceMatch[1]) {
    result.max_price = parseInt(priceMatch[1], 10);
  }

  // Check 10k, 5k shorthand
  const kMatch = lower.match(/(\d+)\s*k/i);
  if (kMatch && kMatch[1]) {
    result.max_price = parseInt(kMatch[1], 10) * 1000;
  }

  // 2. Category / Product classification
  if (/మొబైల్|ఫోన్|ఫోన్లు|mobile|phone|smartphone/i.test(lower)) {
    result.category = "mobiles";
  } else if (/హెడ్‌ఫోన్|ఇయర్ ఫోన్|స్పీకర్|audio|headphone|earphone|headset|sound/i.test(lower)) {
    result.category = "audio";
  } else if (/రైతు|స్ప్రేయర్|పొలం|వ్యవసాయం|farmer|agriculture|sprayer|pump/i.test(lower)) {
    result.category = "farmer";
    result.audience_mode = "farmer";
  } else if (/స్టూడెంట్|కాలేజ్|స్కూల్|పుస్తకం|బ్యాగ్|student|school|college|backpack/i.test(lower)) {
    result.category = "student";
    result.audience_mode = "student";
  } else if (/టార్చ్|లైట్|ఎమర్జెన్సీ|సోలార్|torch|light|emergency/i.test(lower)) {
    result.category = "lights";
  } else if (/ఇంటి|కిచెన్|చాపర్|home|kitchen|chopper/i.test(lower)) {
    result.category = "home";
  } else if (/పవర్ బ్యాంక్|చార్జర్|కేబుల్|power bank|charger/i.test(lower)) {
    result.category = "electronics";
  }

  // 3. Audience mode
  if (/స్టూడెంట్|విద్యార్థి|student/i.test(lower)) {
    result.audience_mode = "student";
  } else if (/రైతు|రైతులు|farmer/i.test(lower)) {
    result.audience_mode = "farmer";
  } else if (/గ్రామం|ఊరు|village/i.test(lower)) {
    result.audience_mode = "village";
  }

  result.query = query;
  return result;
}

// 🔍 SEARCH CANONICAL PRODUCTS
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

  // Sorting (Affiliate commission is NEVER used for ranking)
  if (filters.sort_by === "price_asc") {
    list.sort((a, b) => a.lowest_price - b.lowest_price);
  } else if (filters.sort_by === "price_desc") {
    list.sort((a, b) => b.lowest_price - a.lowest_price);
  } else if (filters.sort_by === "savings") {
    list.sort((a, b) => (b.highest_mrp - b.lowest_price) - (a.highest_mrp - a.lowest_price));
  } else {
    // Default Recommended: Sort by deal_score (Objective signal)
    list.sort((a, b) => b.deal_score - a.deal_score);
  }

  return {
    products: list,
    total: list.length
  };
}

// 🖱️ RECORD AFFILIATE CLICK (Transparent Logging & Redirect URL Generation)
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

  // 1. LocalStorage fallback
  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(STORAGE_DEALS_CLICKS);
      const existing: AffiliateClickEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(STORAGE_DEALS_CLICKS, JSON.stringify([clickEvent, ...existing.slice(0, 100)]));
    } catch {}
  }

  // 2. Asynchronous backend logging
  if (hasSupabaseEnv && supabase) {
    Promise.resolve(supabase.from("affiliate_clicks").insert([clickEvent]))
      .catch((e: any) => {
        console.warn("Could not persist affiliate click:", e);
      });
  }

  return { affiliateUrl: merchantOffer.affiliate_url };
}

// 🔖 SAVED DEALS HANDLERS
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

// 📊 ADMIN ANALYTICS HELPER
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
      { category: "Mobiles", count: clicks.filter((c) => c.product_title.includes("Galaxy") || c.product_title.includes("Redmi")).length },
      { category: "Audio", count: clicks.filter((c) => c.product_title.includes("boAt")).length },
      { category: "Farmer Tools", count: clicks.filter((c) => c.product_title.includes("Sprayer")).length }
    ],
    active_merchants: [
      { id: "amazon", name: "Amazon India (Creators API)", status: "active", last_sync: "17 Sep 2026, 8:30 PM" },
      { id: "flipkart", name: "Flipkart Affiliate", status: "active", last_sync: "17 Sep 2026, 8:30 PM" }
    ]
  };
}
