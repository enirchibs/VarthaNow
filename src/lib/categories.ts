import type { NewsCategory } from "@/types/news";
import { getActiveLanguage, type Language } from "@/hooks/useLanguage";

export const categories: { slug: NewsCategory; label: Record<Language, string>; short: string; rssQuery: string }[] = [
  {
    slug: "andhra-pradesh",
    label: {
      te: "ఆంధ్రప్రదేశ్",
      en: "Andhra Pradesh",
      hi: "आंध्र प्रदेश",
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
    slug: "vizag",
    label: {
      te: "విశాఖ",
      en: "Vizag",
      hi: "वाइजाग",
      ta: "விசாகப்பட்டினம்",
      kn: "ವಿಶಾಖಪಟ್ಟಣಂ"
    },
    short: "Vizag",
    rssQuery: "vizag"
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
    slug: "jobs",
    label: {
      te: "ఉద్యోగాలు",
      en: "Jobs",
      hi: "नौकरियां",
      ta: "வேலைகள்",
      kn: "ಉದ್ಯೋಗಗಳು"
    },
    short: "Jobs",
    rssQuery: "jobs"
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
  }
];

export function categoryLabel(category: string, lang?: Language) {
  const activeLang = lang ?? getActiveLanguage();
  return categories.find((item) => item.slug === category)?.label[activeLang] ?? category;
}

export const trendingSearches: Record<Language, string[]> = {
  te: ["ఏపీ వార్తలు", "Vizag jobs", "తెలుగు సినిమా", "cricket live", "తెలంగాణ రాజకీయాలు"],
  en: ["AP News", "Vizag jobs", "Telugu cinema", "cricket live", "Telangana politics"],
  hi: ["एपी न्यूज", "वाइजाग जॉब्स", "बॉलीवुड सिनेमा", "क्रिकेट लाइव", "राजनीति"],
  ta: ["ஆந்திரா செய்திகள்", "விசாகப்பட்டினம் வேலைகள்", "தமிழ் சினிமா", "கிரிக்கெட் லைவ்", "அரசியல்"],
  kn: ["ಆಂಧ್ರ ಸುದ್ದಿ", "ವಿಶಾಖ ಉದ್ಯೋಗಗಳು", "ಕನ್ನಡ ಸಿನಿಮಾ", "ಕ್ರಿಕೆಟ್ ಲೈವ್", "ರಾಜಕೀಯ"]
};
