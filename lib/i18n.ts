import type { Language } from "@/lib/types";

export const languages: { code: Language; label: string; native: string }[] = [
  { code: "te", label: "Telugu", native: "తెలుగు" }
];

export const uiCopy = {
  te: {
    home: "హోమ్",
    shorts: "షార్ట్స్",
    local: "లోకల్",
    jobs: "జాబ్స్",
    ai: "AI",
    profile: "ప్రొఫైల్",
    breaking: "బ్రేకింగ్",
    recommended: "మీ కోసం",
    ask: "Vartha AI ని అడగండి",
    tagline: "తెలుగు ప్రజల Daily AI Updates"
  },
  en: {
    home: "Home",
    shorts: "Shorts",
    local: "Local",
    jobs: "Jobs",
    ai: "AI",
    profile: "Profile",
    breaking: "Breaking",
    recommended: "For you",
    ask: "Ask Vartha AI",
    tagline: "Daily AI Updates for Telugu people"
  },
  hi: {
    home: "होम",
    shorts: "शॉर्ट्स",
    local: "लोकल",
    jobs: "जॉब्स",
    ai: "AI",
    profile: "प्रोफाइल",
    breaking: "ब्रेकिंग",
    recommended: "आपके लिए",
    ask: "Vartha AI से पूछें",
    tagline: "तेलुगु लोगों के लिए Daily AI Updates"
  },
  ta: {
    home: "முகப்பு",
    shorts: "ஷார்ட்ஸ்",
    local: "லோக்கல்",
    jobs: "வேலைகள்",
    ai: "AI",
    profile: "சுயவிவரம்",
    breaking: "பிரேக்கிங்",
    recommended: "உங்களுக்காக",
    ask: "Vartha AI ஐ கேளுங்கள்",
    tagline: "தெலுங்கு மக்களுக்கான Daily AI Updates"
  },
  kn: {
    home: "ಮುಖಪುಟ",
    shorts: "ಶಾರ್ಟ್ಸ್",
    local: "ಲೋಕಲ್",
    jobs: "ಉದ್ಯೋಗಗಳು",
    ai: "AI",
    profile: "ಪ್ರೊಫೈಲ್",
    breaking: "ಬ್ರೇಕಿಂಗ್",
    recommended: "ನಿಮಗಾಗಿ",
    ask: "Vartha AI ಕೇಳಿ",
    tagline: "ತೆಲುಗು ಜನರಿಗೆ Daily AI Updates"
  },
  ml: {
    home: "ഹോം",
    shorts: "ഷോർട്സ്",
    local: "ലോക്കൽ",
    jobs: "ജോലികൾ",
    ai: "AI",
    profile: "പ്രൊഫൈൽ",
    breaking: "ബ്രേക്കിംഗ്",
    recommended: "നിങ്ങൾക്കായി",
    ask: "Vartha AI ചോദിക്കുക",
    tagline: "തെലുങ്ക് ജനങ്ങൾക്ക് Daily AI Updates"
  }
} satisfies Record<Language, Record<string, string>>;
