import { DailyShareCategory, DailyShareItem, UserCreation, DailyShareCategorySlug } from "@/types/daily-share";

// 30 Configurable Categories for Daily Share
export const DAILY_SHARE_CATEGORIES: DailyShareCategory[] = [
  { id: "cat-1", slug: "motivational", title_te: "మోటివేషన్", title_en: "Motivational", emoji: "🔥", color: "from-amber-500 to-red-600" },
  { id: "cat-2", slug: "spiritual", title_te: "ఆధ్యాత్మికం", title_en: "Spiritual", emoji: "🕉️", color: "from-amber-600 to-yellow-600" },
  { id: "cat-3", slug: "good-morning", title_te: "శుభోదయం", title_en: "Good Morning", emoji: "🌅", color: "from-yellow-400 to-orange-500" },
  { id: "cat-4", slug: "good-night", title_te: "శుభరాాత్రి", title_en: "Good Night", emoji: "🌙", color: "from-indigo-600 to-purple-800" },
  { id: "cat-5", slug: "telugu-quotes", title_te: "తెలుగు సూక్తులు", title_en: "Telugu Quotes", emoji: "📜", color: "from-rose-500 to-red-700" },
  { id: "cat-6", slug: "life-quotes", title_te: "జీవిత సూక్తులు", title_en: "Life Quotes", emoji: "🌱", color: "from-emerald-500 to-teal-700" },
  { id: "cat-7", slug: "success", title_te: "విజయం", title_en: "Success", emoji: "🏆", color: "from-blue-600 to-indigo-700" },
  { id: "cat-8", slug: "friendship", title_te: "స్నేహం", title_en: "Friendship", emoji: "🤝", color: "from-sky-400 to-blue-600" },
  { id: "cat-9", slug: "love", title_te: "ప్రేమ", title_en: "Love", emoji: "💖", color: "from-pink-500 to-rose-600" },
  { id: "cat-10", slug: "family", title_te: "కుటుంబం", title_en: "Family", emoji: "👨‍👩‍👧‍👦", color: "from-teal-500 to-emerald-600" },
  { id: "cat-11", slug: "jokes", title_te: "జోకులు", title_en: "Funny / Jokes", emoji: "😂", color: "from-yellow-500 to-amber-600" },
  { id: "cat-12", slug: "birthday", title_te: "జన్మదిన శుభాకాంక్షలు", title_en: "Birthday", emoji: "🎂", color: "from-purple-500 to-pink-600" },
  { id: "cat-13", slug: "anniversary", title_te: "పెళ్లిరోజు శుభాకాంక్షలు", title_en: "Anniversary", emoji: "💍", color: "from-rose-400 to-pink-600" },
  { id: "cat-14", slug: "wedding", title_te: "వివాహ శుభాకాంక్షలు", title_en: "Wedding", emoji: "💒", color: "from-amber-400 to-rose-500" },
  { id: "cat-15", slug: "congratulations", title_te: "అభినందనలు", title_en: "Congratulations", emoji: "🎉", color: "from-blue-500 to-cyan-600" },
  { id: "cat-16", slug: "festival", title_te: "పండుగ శుభాకాంక్షలు", title_en: "Festival", emoji: "🪔", color: "from-amber-500 to-red-600" },
  { id: "cat-17", slug: "devotional", title_te: "భక్తి సమయం", title_en: "Devotional", emoji: "🚩", color: "from-orange-500 to-amber-700" },
  { id: "cat-18", slug: "positive-thoughts", title_te: "సానుకూల ఆలోచనలు", title_en: "Positive Thoughts", emoji: "✨", color: "from-emerald-400 to-teal-600" },
  { id: "cat-19", slug: "business", title_te: "వ్యాపార సూక్తులు", title_en: "Business", emoji: "💼", color: "from-slate-700 to-slate-900" },
  { id: "cat-20", slug: "students", title_te: "విద్యార్థుల ప్రేరణ", title_en: "Students", emoji: "🎓", color: "from-blue-600 to-indigo-800" },
  { id: "cat-21", slug: "career", title_te: "ఉద్యోగ మార్గదర్శనం", title_en: "Career", emoji: "🚀", color: "from-violet-600 to-indigo-700" },
  { id: "cat-22", slug: "health-wellness", title_te: "ఆరోగ్య చిట్కాలు", title_en: "Health & Wellness", emoji: "🍎", color: "from-green-500 to-emerald-700" },
  { id: "cat-23", slug: "national-days", title_te: "జాతి దినోత్సవాలు", title_en: "National Days", emoji: "🇮🇳", color: "from-orange-500 via-white to-green-600" },
  { id: "cat-24", slug: "andhra-pradesh", title_te: "ఆంధ్రప్రదేశ్ విశేషాలు", title_en: "Andhra Pradesh", emoji: "🏛️", color: "from-amber-600 to-orange-700" },
  { id: "cat-25", slug: "visakhapatnam", title_te: "వైజాగ్ షేర్స్", title_en: "Visakhapatnam", emoji: "🌊", color: "from-cyan-500 to-blue-700" },
  { id: "cat-26", slug: "trending-telugu", title_te: "ట్రెండింగ్ తెలుగు", title_en: "Trending Telugu", emoji: "⚡", color: "from-red-500 to-rose-700" },
  { id: "cat-27", slug: "kids", title_te: "పిల్లల నీతి కథలు", title_en: "Kids", emoji: "🎈", color: "from-pink-400 to-purple-500" },
  { id: "cat-28", slug: "women", title_te: "మహిళల స్ఫూర్తి", title_en: "Women Empowerment", emoji: "🌺", color: "from-rose-500 to-pink-600" },
  { id: "cat-29", slug: "parents", title_te: "తల్లిదండ్రుల ప్రేమ", title_en: "Parents", emoji: "🙏", color: "from-amber-500 to-yellow-600" },
  { id: "cat-30", slug: "inspirational-stories", title_te: "స్ఫూర్తిదాయక కథలు", title_en: "Inspirational Stories", emoji: "📖", color: "from-indigo-500 to-blue-700" }
];

export const DAILY_SHARE_SEED_ITEMS: DailyShareItem[] = [
  {
    id: "ds-001",
    title: "ఉదయం లేవగానే ఈ ఒక్కటి గుర్తుపెట్టుకోండి",
    slug: "good-morning-positive-thought-1",
    category: "good-morning",
    language: "te",
    content_type: "personalized_image",
    image_url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1080&q=80",
    quote_te: "ప్రతి కొత్త రోజు ఒక నూతన ఆశతో వస్తుంది. మీ లక్ష్యం వైపు మరో అడుగు ముందుకు వేయండి. శుభోదయం! 🌅",
    quote_en: "Every new day comes with fresh hope. Take another step toward your goals. Good Morning!",
    author: "VaartaNow Quotes",
    caption: "మీ మిత్రులకు మరియు కుటుంబ సభ్యులకు పంపడానికి శుభోదయం సందేశం 🌅",
    likes_count: 1420,
    shares_count: 856,
    personalization_enabled: true,
    template_style: "festival",
    hashtags: ["#శుభోదయం", "#GoodMorning", "#VaartaNowDaily"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-002",
    title: "మీ కష్టానికి ప్రతిఫలం తప్పక లభిస్తుంది",
    slug: "motivational-success-quote-1",
    category: "motivational",
    language: "te",
    content_type: "quote",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    quote_te: "ఓటమి నిన్ను ఆపలేదు, నీ ప్రయత్నం ఆగినప్పుడే నువ్వు ఓడిపోతావు. నిరంతరం కష్టపడు! 🔥",
    quote_en: "Failure cannot stop you, you only fail when your effort stops. Keep grinding!",
    author: "వివేకానంద స్ఫూర్తి",
    caption: "ఈరోజు మిమ్మల్ని మరియు మీ స్నేహితులను ఉత్సాహపరిచే మోటివేషన్ కార్డ్ 💪",
    likes_count: 2890,
    shares_count: 1540,
    personalization_enabled: true,
    template_style: "modern",
    hashtags: ["#మోటివేషన్", "#MotivationTelugu", "#SuccessQuotes"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-003",
    title: "ఈనాటి భక్తి చింతన - శ్రీ వేంకటేశ్వర స్వామి దివ్య ఆశీస్సులు",
    slug: "spiritual-tirupati-balaji-blessings",
    category: "spiritual",
    language: "te",
    content_type: "personalized_image",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1080&q=80",
    quote_te: "ఓం నమో వేంకటేశాయ! మీ ఇంట ఆనందం, ఆరోగ్యం మరియు ఐశ్వర్యం వికసించుగాక. 🕉️🚩",
    quote_en: "Om Namo Venkatesaya! May joy, health, and prosperity blossom in your home.",
    author: "తిరుమల దివ్య సందేశం",
    caption: "భక్తిపూర్వకమైన శ్రీవారి ఆశీస్సులు అందరికీ షేర్ చేయండి 🚩",
    likes_count: 4520,
    shares_count: 3100,
    personalization_enabled: true,
    template_style: "festival",
    location: "Tirupati",
    hashtags: ["#భక్తి", "#VenkateswaraSwamy", "#SpiritualTelugu"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-004",
    title: "నవ్వుల హరివిల్లు - నేటి హాస్యం",
    slug: "jokes-telugu-fun-joke-1",
    category: "jokes",
    language: "te",
    content_type: "image",
    image_url: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1080&q=80",
    quote_te: "స్నేహితుడు: ఒరేయ్ ఎందుకు అంత ఆలోచిస్తున్నావ్?\nనేను: టీచరు నన్ను డిస్టర్బ్ చేయకు అన్నాడురా, అందుకే మాట్లాడటం లేను! 😂",
    quote_en: "Friend: Why are you thinking so hard?\nMe: Teacher said don't disturb me, so I stopped talking!",
    author: "VaartaNow Fun Zone",
    caption: "ఈరోజు ఈ సరదా జోక్ చూసి మీ స్నేహితులకు షేర్ చేయండి 😂",
    likes_count: 1980,
    shares_count: 1120,
    personalization_enabled: true,
    template_style: "classic",
    hashtags: ["#జోకులు", "#TeluguJokes", "#FunMoments"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-005",
    title: "తెలుగు పండుగ శుభాకాంక్షలు - ఉగాది / శ్రీరామనవమి",
    slug: "festival-wishes-telugu-greetings",
    category: "festival",
    language: "te",
    content_type: "personalized_image",
    image_url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1080&q=80",
    quote_te: "మీకు మరియు మీ కుటుంబ సభ్యులకు పండుగ శుభాకాంక్షలు! లక్ష్మీదేవి కటాక్షం ఎల్లవేళలా ఉండాలని కోరుకుంటున్నాము. 🪔✨",
    quote_en: "Festival Greetings to you and your family! Wishing abundant prosperity and joy.",
    author: "VaartaNow Festival Engine",
    caption: "మీ పేరు మరియు ఫోటోతో పండుగ శుభాకాంక్షలు తెలియజేయండి 🪔",
    likes_count: 5310,
    shares_count: 4200,
    personalization_enabled: true,
    template_style: "festival",
    festival: "Ugadi",
    hashtags: ["#పండుగశుభాకాంక్షలు", "#TeluguFestival", "#FestivalCard"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-006",
    title: "వైజాగ్ ఆర్కే బీచ్ అందాలు - గుడ్ మార్నింగ్ షేర్",
    slug: "visakhapatnam-vizag-rk-beach-morning",
    category: "visakhapatnam",
    language: "te",
    content_type: "personalized_image",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    quote_te: "వైజాగ్ సాగర తీరం నుంచి శుభోదయం! సాగర తరంగాల శబ్దంతో రోజంతా ఆహ్లాదకరంగా సాగాలని ఆశిస్తున్నాం. 🌊🌅",
    quote_en: "Good Morning from the shores of Vizag RK Beach! May your day be as refreshing as the ocean breeze.",
    author: "Vizag Daily Highlights",
    caption: "వైజాగ్ వాసులకు ప్రత్యేకంగా రూపకల్పన చేసిన శుభోదయం స్టేటస్ 🌊",
    likes_count: 3120,
    shares_count: 2150,
    personalization_enabled: true,
    template_style: "modern",
    location: "Visakhapatnam",
    hashtags: ["#Visakhapatnam", "#VizagRKBeach", "#VizagDaily"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-007",
    title: "వ్యాపారవేత్తల ప్రేరణ - బిజినెస్ విజయం",
    slug: "business-growth-entrepreneur-quote",
    category: "business",
    language: "te",
    content_type: "business",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80",
    quote_te: "వినియోగదారుని నమ్మకమే ప్రతి గొప్ప వ్యాపారానికి పునాది. మీ వ్యాపారం నిరంతరం అభివృద్ధి చెందాలి! 💼📈",
    quote_en: "Customer trust is the bedrock of every great business. May your enterprise grow non-stop!",
    author: "VaartaNow Business Hub",
    caption: "మీ సంస్థ పేరు, ఫోన్ నంబర్ మరియు లోగోతో వాట్సాప్ బిజినెస్ స్టేటస్ తయారు చేయండి 💼",
    likes_count: 2450,
    shares_count: 1890,
    personalization_enabled: true,
    template_style: "business",
    default_business_name: "శ్రీ లక్ష్మి ట్రేడర్స్ & ఏజెన్సీస్",
    hashtags: ["#BusinessTelugu", "#EntrepreneurWishes", "#BusinessStatus"],
    created_at: new Date().toISOString()
  },
  {
    id: "ds-008",
    title: "ప్రశాంతమైన రాత్రి - శుభరాాత్రి",
    slug: "good-night-peaceful-sleep",
    category: "good-night",
    language: "te",
    content_type: "personalized_image",
    image_url: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1080&q=80",
    quote_te: "రోజంతా పడిన కష్టాన్ని మరచిపోండి. ప్రశాంతమైన నిద్రతో రేపటి నూతన అధ్యాయానికి సన్నద్ధమవండి. శుభరాాత్రి! 🌙✨",
    quote_en: "Forget today's tiredness. Rest peacefully and wake up ready for tomorrow's new chapter. Good Night!",
    author: "VaartaNow Night Care",
    caption: "మీ ప్రియమైన వారికి శుభరాాత్రి సందేశం షేర్ చేయండి 🌙",
    likes_count: 1890,
    shares_count: 1240,
    personalization_enabled: true,
    template_style: "classic",
    hashtags: ["#శుభరాాత్రి", "#GoodNightTelugu", "#NightPeace"],
    created_at: new Date().toISOString()
  }
];

// Local storage key for saved creations & admin items
const USER_CREATIONS_STORAGE_KEY = "vaartanow_user_daily_share_creations";
const LIKED_ITEMS_STORAGE_KEY = "vaartanow_liked_daily_share_items";
export const CUSTOM_DAILY_SHARE_STORAGE_KEY = "vaartanow_admin_daily_share_items_v1";

// Admin custom daily share items helpers
export function getCustomDailyShareItems(): DailyShareItem[] {
  try {
    const data = localStorage.getItem(CUSTOM_DAILY_SHARE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addDailyShareItem(
  newItem: Omit<DailyShareItem, "id" | "created_at" | "likes_count" | "shares_count">
): DailyShareItem {
  const item: DailyShareItem = {
    ...newItem,
    id: `ds-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    likes_count: Math.floor(Math.random() * 500) + 120,
    shares_count: Math.floor(Math.random() * 300) + 40,
    created_at: new Date().toISOString(),
  };

  try {
    const existing = getCustomDailyShareItems();
    const updated = [item, ...existing];
    localStorage.setItem(CUSTOM_DAILY_SHARE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save custom daily share item:", e);
  }

  return item;
}

export function deleteDailyShareItem(id: string): void {
  try {
    const existing = getCustomDailyShareItems();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(CUSTOM_DAILY_SHARE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to delete daily share item:", e);
  }
}

// API helper functions
export function getDailyShareCategories(): DailyShareCategory[] {
  return DAILY_SHARE_CATEGORIES;
}

export function getDailyShareItems(categorySlug?: string): DailyShareItem[] {
  const customItems = getCustomDailyShareItems();
  const allItems = [...customItems, ...DAILY_SHARE_SEED_ITEMS];

  if (!categorySlug || categorySlug === "all") {
    return allItems;
  }
  return allItems.filter((item) => item.category === categorySlug);
}

export function getDailyShareBySlug(slug: string): DailyShareItem | undefined {
  const customItems = getCustomDailyShareItems();
  const allItems = [...customItems, ...DAILY_SHARE_SEED_ITEMS];
  return allItems.find((item) => item.slug === slug || item.id === slug);
}

// ⏱️ Get scheduled Daily Share item depending on hour of day
export function getTodayScheduledShare(): DailyShareItem {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 5 && currentHour < 8) {
    return DAILY_SHARE_SEED_ITEMS.find(i => i.category === "good-morning") || DAILY_SHARE_SEED_ITEMS[0];
  } else if (currentHour >= 8 && currentHour < 11) {
    return DAILY_SHARE_SEED_ITEMS.find(i => i.category === "motivational") || DAILY_SHARE_SEED_ITEMS[1];
  } else if (currentHour >= 11 && currentHour < 16) {
    return DAILY_SHARE_SEED_ITEMS.find(i => i.category === "jokes") || DAILY_SHARE_SEED_ITEMS[3];
  } else if (currentHour >= 16 && currentHour < 20) {
    return DAILY_SHARE_SEED_ITEMS.find(i => i.category === "spiritual") || DAILY_SHARE_SEED_ITEMS[2];
  } else {
    return DAILY_SHARE_SEED_ITEMS.find(i => i.category === "good-night") || DAILY_SHARE_SEED_ITEMS[7];
  }
}

// Save personalized user creation to localStorage
export function saveUserCreation(creation: UserCreation): void {
  try {
    const existing = getUserCreations();
    const updated = [creation, ...existing.filter(c => c.id !== creation.id)].slice(0, 30);
    localStorage.setItem(USER_CREATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save user creation:", e);
  }
}

export function getUserCreations(): UserCreation[] {
  try {
    const data = localStorage.getItem(USER_CREATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isItemLiked(id: string): boolean {
  try {
    const data = localStorage.getItem(LIKED_ITEMS_STORAGE_KEY);
    const list: string[] = data ? JSON.parse(data) : [];
    return list.includes(id);
  } catch {
    return false;
  }
}

export function toggleItemLike(id: string): boolean {
  try {
    const data = localStorage.getItem(LIKED_ITEMS_STORAGE_KEY);
    let list: string[] = data ? JSON.parse(data) : [];
    let nowLiked = false;

    if (list.includes(id)) {
      list = list.filter(i => i !== id);
      nowLiked = false;
    } else {
      list.push(id);
      nowLiked = true;
    }

    localStorage.setItem(LIKED_ITEMS_STORAGE_KEY, JSON.stringify(list));
    return nowLiked;
  } catch {
    return false;
  }
}
