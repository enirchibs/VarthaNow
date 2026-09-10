import type { NewsCategory } from "@/types/news";
import { getActiveLanguage, type Language } from "@/hooks/useLanguage";

export const categories: { slug: NewsCategory; label: Record<Language, string>; short: string; rssQuery: string }[] = [
  {
    slug: "viralshorts",
    label: {
      te: "వైరల్ షార్ట్స్",
      en: "Viral Shorts",
      hi: "वायरल शॉर्ट्स",
      ta: "வைரல் ஷார்ட்ஸ்",
      kn: "ವೈರಲ್ ಶಾರ್ಟ್ಸ್"
    },
    short: "Shorts",
    rssQuery: "viral news shorts trending video clips"
  },
  {
    slug: "devotional",
    label: {
      te: "భక్తి",
      en: "Devotional",
      hi: "भक्ति",
      ta: "பக்தி",
      kn: "ಭಕ್ತಿ"
    },
    short: "Bhakti",
    rssQuery: "panchangam rasi phalalu vastu bhakti temple"
  },
  {
    slug: "health",
    label: {
      te: "ఆరోగ్యం",
      en: "Health",
      hi: "स्वास्थ्य",
      ta: "சுகாதாரம்",
      kn: "ಆರೋಗ್ಯ"
    },
    short: "Health",
    rssQuery: "health wellness seasonal tips BP diabetes stress"
  },
  {
    slug: "andhra-pradesh",
    label: {
      te: "ఆంధ్రప్రదేశ్",
      en: "Andhra Pradesh",
      hi: "आंध प्रदेश",
      ta: "ஆந்திரப் பிரதேசம்",
      kn: "ಆಂಧ್ರಪ್ರದೇಶ್"
    },
    short: "AP",
    rssQuery: "andhra pradesh"
  },
  {
    slug: "telangana",
    label: {
      te: "తెలంగాణ",
      en: "Telangana",
      hi: "तेलंगाना",
      ta: "தெலுங்கானா",
      kn: "ತೆಲಂಗಾಣ"
    },
    short: "TG",
    rssQuery: "telangana"
  },
  {
    slug: "cricket",
    label: {
      te: "క్రికెట్",
      en: "Cricket",
      hi: "क्रिकेट",
      ta: "கிரிக்கெட்",
      kn: "ಕ್ರಿಕೆಟ್"
    },
    short: "Cricket",
    rssQuery: "cricket"
  },
  {
    slug: "politics",
    label: {
      te: "రాజకీయాలు",
      en: "Politics",
      hi: "राजनीति",
      ta: "அரசியல்",
      kn: "ರಾಜಕೀಯ"
    },
    short: "Politics",
    rssQuery: "politics"
  },
  {
    slug: "cinema",
    label: {
      te: "సినిమా",
      en: "Cinema",
      hi: "सिनेमा",
      ta: "சினிமா",
      kn: "ಸಿನಿಮಾ"
    },
    short: "Cinema",
    rssQuery: "cinema"
  },
  {
    slug: "technology",
    label: {
      te: "టెక్నాలజీ",
      en: "Technology",
      hi: "तकनीक",
      ta: "தொழில்நுட்பம்",
      kn: "ತಂತ್ರಜ್ಞಾನ"
    },
    short: "Tech",
    rssQuery: "technology"
  },
  {
    slug: "business",
    label: {
      te: "వ్యాపారం",
      en: "Business",
      hi: "व्यापार",
      ta: "வணிகம்",
      kn: "ವ್ಯಾಪಾರ"
    },
    short: "Business",
    rssQuery: "stock market sensex gold silver investment"
  },
  {
    slug: "national" as any,
    label: {
      te: "జాతీయ వార్తలు",
      en: "National News",
      hi: "राष्ट्रीय समाचार",
      ta: "தேசிய செய்திகள்",
      kn: "ರಾಷ್ಟ್ರೀಯ ಸುದ್ದಿ"
    },
    short: "National",
    rssQuery: "national news india"
  },
  {
    slug: "vizag" as any,
    label: {
      te: "విశాఖ",
      en: "Visakhapatnam",
      hi: "विशाखापट्टनम",
      ta: "விசாக்கபட்டினம்",
      kn: "ವಿಶಾಖಪಟ್ಟಣ"
    },
    short: "Vizag",
    rssQuery: "visakhapatnam vizag"
  },
  {
    slug: "jobs" as any,
    label: {
      te: "ఉద్యోగాలు",
      en: "Jobs",
      hi: "नौकरियां",
      ta: "வேலைவாய்ப்பு",
      kn: "ಉದ್ಯೋಗಗಳು"
    },
    short: "Jobs",
    rssQuery: "jobs recruitment notification"
  },
  {
    slug: "education" as any,
    label: {
      te: "విద్య",
      en: "Education",
      hi: "शिक्षा",
      ta: "கல்வி",
      kn: "ಶಿಕ್ಷಣ"
    },
    short: "Education",
    rssQuery: "education exam results"
  }
];

export const TELUGU_CATEGORY_MAP: Record<string, string> = {
  politics:        "రాజకీయాలు",
  "andhra-pradesh":"ఆంధ్రప్రదేశ్",
  telangana:       "తెలంగాణ",
  cricket:         "క్రికెట్",
  cinema:          "సినిమా",
  technology:      "టెక్నాలజీ",
  business:        "వ్యాపారం",
  health:          "ఆరోగ్యం",
  devotional:      "భక్తి",
  viralshorts:     "వైరల్ షార్ట్స్",
  vizag:           "విశాఖ",
  jobs:            "ఉద్యోగాలు",
  national:        "జాతీయ వార్తలు",
  education:       "విద్య",
};

export function categoryLabel(category: string, lang?: Language): string {
  const activeLang = lang ?? getActiveLanguage();
  const lowerCat = (category || "").toLowerCase().trim();
  const catObj = categories.find((item) => item.slug === lowerCat || item.slug === category);
  
  if (catObj && catObj.label[activeLang]) {
    return catObj.label[activeLang];
  }
  
  if (activeLang === "te" && TELUGU_CATEGORY_MAP[lowerCat]) {
    return TELUGU_CATEGORY_MAP[lowerCat];
  }
  
  // Hardcoded Telugu safety fallback for any unmapped category
  if (activeLang === "te") {
    if (lowerCat === "national" || lowerCat === "india") return "జాతీయ వార్తలు";
    if (lowerCat === "politics") return "రాజకీయాలు";
    if (lowerCat === "cinema" || lowerCat === "movies") return "సినిమా";
    if (lowerCat === "cricket" || lowerCat === "sports") return "క్రికెట్";
    if (lowerCat === "technology" || lowerCat === "tech") return "టెక్నాలజీ";
    if (lowerCat === "business" || lowerCat === "finance") return "వ్యాపారం";
    if (lowerCat === "health") return "ఆరోగ్యం";
    if (lowerCat === "devotional") return "భక్తి";
    if (lowerCat === "jobs") return "ఉద్యోగాలు";
    if (lowerCat === "vizag") return "విశాఖ";
  }

  return category;
}

/**
 * Intelligent keyword-based auto-classifier that detects exact category from title, excerpt & content
 */
export function detectCategoryFromTitleAndContent(post: {
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
}): NewsCategory {
  const text = `${post.title || ""} ${post.excerpt || ""} ${post.content || ""}`.toLowerCase();

  // 1. Cricket / Sports (Highest precedence for matches & players)
  if (
    /cricket|match|ipl|t20|odi|indw|banw|షెఫాలీ|ఇన్నింగ్స్|వికెట్|రన్స్|క్యాప్టెన్|స్కోరు|సెంచరీ|ధోనీ|రోహిత్|కోహ్లీ|రాహుల్|గిల్|జడేజా|పాంటింగ్|గంభీర్|పిచ్|రన్ రాట్/i.test(
      text
    )
  ) {
    return "cricket";
  }

  // 2. Cinema / Entertainment / Actresses
  if (
    /cinema|tollywood|ott|movie|actor|actress|అషురెడ్డి|ashu reddy|నాని|పవన్|మహేష్|అల్లు అర్జున్|ఎన్టీఆర్|రామ్ చరణ్|ప్రభాస్|విజయ్|టాలీవుడ్|సినిమా|టీజర్|ట్రైలర్|షూటింగ్|రొమాంటిక్|బోల్డ్|గ్లామర్|హీరో|హీరోయిన్|దర్శకుడు|సినిమాలు|పోస్టర్|ఫిల్మ్/i.test(
      text
    )
  ) {
    return "cinema";
  }

  // 3. Technology / Gadgets / Google / Apps / Online Devices
  if (
    /technology|tech|gadgets|tv device|టీవీ డివైజ్|ఆన్‌లైన్|స్మార్ట్‌ఫోన్|గూగుల్|యాప్|సాంకేతికత|ఆండ్రాయిడ్|ఐఫోన్|వాట్సాప్|ఫేస్‌బుక్|AI|ఆర్డర్|పార్శిల్|అమజాన్|ఫ్లిప్‌కార్ట్|చిప్‌సెట్|సాఫ్ట్‌వేర్/i.test(
      text
    )
  ) {
    return "technology";
  }

  // 4. Business / Economy / Stocks / Banking / Agriculture Schemes
  if (
    /business|stock|sensex|nifty|gold|silver|bank|atm|debit card|రైతులు|గూగుల్ కీలక|బ్యాంకు|ఎటిఎమ్|డెబిట్ కార్డ్|ఖాతా|డిపాజిట్|రుణాలు|షేర్ మార్కెట్|సెన్సెక్స్|నిఫ్టీ|బంగారం|వెండి|లాభాలు|నష్టాలు|కంపెనీ|వ్యాపారం|పెట్టుబడులు|మ్యూచువల్ ఫండ్స్/i.test(
      text
    )
  ) {
    return "business";
  }

  // 5. Politics / Government
  if (
    /politics|election|minister|governor|assembly|రేవంత|హరీష్ రావు|జగన్|బాబు|పవన్ కళ్యాణ్|కెసిఆర్|కేటీఆర్|ఎమ్మెల్యే|ఎంపీ|మంత్రి|కాంగ్రెస్|బిజెపి|టిడిపి|వైసిపి|బిఆర్ఎస్|అసెంబ్లీ|పార్లమెంట్|రాజకీయాలు|ఎన్నికలు|పులి కాదు పిల్లి/i.test(
      text
    )
  ) {
    return "politics";
  }

  // 6. Vizag
  if (/vizag|visakhapatnam|విశాఖ|విశాఖపట్నం|గాజువాక|మధురవాడ|రుషికొండ/i.test(text)) {
    return "vizag";
  }

  // 7. Telangana
  if (/telangana|hyderabad|తెలంగాణ|హైదరాబాద్|సికింద్రాబాద్|వరంగల్|ఖమ్మం|నల్గొండ|కరీంనగర్/i.test(text)) {
    return "telangana";
  }

  // 8. Andhra Pradesh
  if (/andhra|amravati|vijayawada|ఆంధ్రప్రదేశ్|అమరావతి|విజయవాడ|గుంటూరు|తిరుపతి|కర్నూలు|నెల్లూరు|ఏపీ/i.test(text)) {
    return "andhra-pradesh";
  }

  // 9. Health
  if (/health|doctor|hospital|disease|ఆరోగ్యం|బిపి|షుగర్|డాక్టర్|మందులు|హాస్పిటల్|వ్యాధి|కరోనా|డయాబెటిస్|ఒత్తిడి/i.test(text)) {
    return "health";
  }

  // 10. Devotional / Astrology
  if (/devotional|temple|puja|bhakti|astrology|తిరుమల|శ్రీవారి|స్వామి|దేవాలయం|పూజ|వ్రతం|ఏకాదశి|పంచాంగం|రాశి ఫలాలు|భక్తి/i.test(text)) {
    return "devotional";
  }

  // 11. Jobs
  if (/jobs|recruitment|vacancy|ఉద్యోగాలు|నోటిఫికేషన్|భర్తీ|అప్లై|జాబ్స్|జీతం|పరీక్ష/i.test(text)) {
    return "jobs";
  }

  // Fallback to provided category if valid and not national, else default to politics/national
  if (post.category && post.category !== "national" && post.category !== "all") {
    return post.category as NewsCategory;
  }

  return "national" as NewsCategory;
}

export const trendingSearches: Record<Language, string[]> = {
  te: ["ఏపీ వార్తలు", "హెల్త్ టిప్స్", "షేర్ మార్కెట్", "నేటి రాశిఫలాలు", "తెలంగాణ వార్తలు"],
  en: ["AP News", "Health Tips", "Share Market", "Daily Horoscopes", "Telangana News"],
  hi: ["एपी न्यूज", "स्वास्थ्य टिप्स", "शेयर बाजार", "दैनिक राशिफल", "राजनीति"],
  ta: ["ஆந்திரா செய்திகள்", "சுகாதார குறிப்புகள்", "பங்குச் சந்தை", "ராசி பலன்", "அரசியல்"],
  kn: ["ಆಂಧ್ರ ಸುದ್ದಿ", "ಆರೋಗ್ಯ ಸಲಹೆಗಳು", "ಷೇರು ಮಾರುಕಟ್ಟೆ", "ರಾಶಿ ಭವಿಷ್ಯ", "ರಾಜಕೀಯ"]
};
