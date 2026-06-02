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
    slug: "devotional",
    label: {
      te: "జ్యోతిష్యం & ఆధ్యాత్మికం",
      en: "Astrology & Spirituality",
      hi: "ज्योतिष और आध्यात्मिकता",
      ta: "ஜோதிடம் & ஆன்மீகம்",
      kn: "ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ಅಧ್ಯಾತ್ಮ"
    },
    short: "Jyotisham",
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
  }
];

export function categoryLabel(category: string, lang?: Language) {
  const activeLang = lang ?? getActiveLanguage();
  return categories.find((item) => item.slug === category)?.label[activeLang] ?? category;
}

export const trendingSearches: Record<Language, string[]> = {
  te: ["ఏపీ వార్తలు", "హెల్త్ టిప్స్", "షేర్ మార్కెట్", "నేటి రాశిఫలాలు", "తెలంగాణ వార్తలు"],
  en: ["AP News", "Health Tips", "Share Market", "Daily Horoscopes", "Telangana News"],
  hi: ["एपी न्यूज", "स्वास्थ्य टिप्स", "शेयर बाजार", "दैनिक राशिफल", "राजनीति"],
  ta: ["ஆந்திரா செய்திகள்", "சுகாதார குறிப்புகள்", "பங்குச் சந்தை", "ராசி பலன்", "அரசியல்"],
  kn: ["ಆಂಧ್ರ ಸುದ್ದಿ", "ಆರೋಗ್ಯ ಸಲಹೆಗಳು", "ಷೇರು ಮಾರುಕಟ್ಟೆ", "ರಾಶಿ ಭವಿಷ್ಯ", "ರಾಜಕೀಯ"]
};
