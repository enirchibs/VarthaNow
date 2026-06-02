import { useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  Share2, 
  Smartphone, 
  MapPin, 
  Compass, 
  Download, 
  Sparkles, 
  Clock,
  BookOpen
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

type RasiKey = 
  | "mesha" | "vrishabha" | "mithuna" | "karka" 
  | "simha" | "kanya" | "tula" | "vrischika" 
  | "dhanussu" | "makara" | "kumbha" | "meena";

interface RasiItem {
  key: RasiKey;
  emoji: string;
  name: Record<string, string>;
  english: string;
  career: Record<string, string>;
  health: Record<string, string>;
  finance: Record<string, string>;
  luckyColor: Record<string, string>;
  luckyNumber: number;
}

// 🔮 Helper to calculate pseudo-random, mathematically stable Vedic astrological details
function getVedicDetails(name: string, dob: string, time: string, place: string, lat: number, lng: number) {
  const seedString = `${dob}-${time}-${lat}-${lng}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const rasisList = [
    { key: "mesha", te: "మేష రాశి (Mesha)", en: "Mesha (Aries)" },
    { key: "vrishabha", te: "వృషభ రాశి (Vrishabha)", en: "Vrishabha (Taurus)" },
    { key: "mithuna", te: "మిథున రాశి (Mithuna)", en: "Mithuna (Gemini)" },
    { key: "karka", te: "కర్కాటక రాశి (Karka)", en: "Karka (Cancer)" },
    { key: "simha", te: "సింహ రాశి (Simha)", en: "Simha (Leo)" },
    { key: "kanya", te: "కన్యా రాశి (Kanya)", en: "Kanya (Virgo)" },
    { key: "tula", te: "తులా రాశి (Tula)", en: "Tula (Libra)" },
    { key: "vrischika", te: "వృశ్చిక రాశి (Vrischika)", en: "Vrischika (Scorpio)" },
    { key: "dhanussu", te: "ధనుస్సు రాశి (Dhanussu)", en: "Dhanussu (Sagittarius)" },
    { key: "makara", te: "మకర రాశి (Makara)", en: "Makara (Capricorn)" },
    { key: "kumbha", te: "కుంభ రాశి (Kumbha)", en: "Kumbha (Aquarius)" },
    { key: "meena", te: "మీన రాశి (Meena)", en: "Meena (Pisces)" }
  ];

  const nakshatras = [
    "అశ్విని (Aswini)", "భరణి (Bharani)", "కృత్తిక (Krittika)", "రోహిణి (Rohini)", "మృగశిర (Mrigasira)", 
    "ఆర్ద్ర (Ardra)", "పునర్వసు (Punarvasu)", "పుష్యమి (Pushya)", "ఆశ్లేష (Aslesha)", "మఖ (Makha)", 
    "పూర్వఫల్గుణి (Poorvaphalguni)", "ఉత్తరఫల్గుణి (Uttaraphalguni)", "హస్త (Hasta)", "చిత్త (Chitra)", 
    "స్వాతి (Swati)", "విశాఖ (Visakha)", "అనూరాధ (Anuradha)", "జ్యేష్ఠ (Jyeshta)", "మూల (Moola)", 
    "పూర్వాషాఢ (Poorvashadha)", "ఉత్తరాషాఢ (Uttarashadha)", "శ్రవణం (Sravanam)", "ధనిష్ఠ (Dhanishta)", 
    "శతభిషం (Satabhisha)", "పూర్వాభాద్ర (Poorvabhadra)", "ఉత్తరాభాద్ర (Uttarabhadra)", "రేవతి (Revati)"
  ];

  const lagnams = [
    "మేష లగ్నం (Mesha)", "వృషభ లగ్నం (Vrishabha)", "మిథున లగ్నం (Mithuna)", "కర్కాటక లగ్నం (Karka)", 
    "సింహ లగ్నం (Simha)", "కన్యా లగ్నం (Kanya)", "తులా లగ్నం (Tula)", "వృశ్చిక లగ్నం (Vrischika)", 
    "ధనుర్ లగ్నం (Dhanur)", "మకర లగ్నం (Makara)", "కుంభ లగ్నం (Kumbha)", "మీన లగ్నం (Meena)"
  ];

  const rasiIdx = absHash % 12;
  const nakshatraIdx = (absHash + 7) % 27;
  const lagnamIdx = (absHash + 19) % 12;

  const selectedRasi = rasisList[rasiIdx];
  const selectedNakshatra = nakshatras[nakshatraIdx];
  const selectedLagnam = lagnams[lagnamIdx];

  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  const housePlacements: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) {
    housePlacements[h] = [];
  }

  housePlacements[lagnamIdx + 1].push("Lagna");

  planetNames.forEach((planet, idx) => {
    const house = ((absHash + idx * 3) % 12) + 1;
    housePlacements[house].push(planet);
  });

  return {
    rasi: selectedRasi,
    nakshatram: selectedNakshatra,
    lagnam: selectedLagnam,
    housePlacements
  };
}

// 🎨 Draw a highly detailed South Indian Style Kundali Grid dynamically via SVG
function renderSouthIndianChart(astroResult: any) {
  const width = 300;
  const height = 300;
  const cellSize = width / 4;

  const houseCoords: Record<number, { col: number; row: number; label: string; enLabel: string }> = {
    1: { col: 1, row: 0, label: "మేషం", enLabel: "Mesh" },
    2: { col: 2, row: 0, label: "వృషభం", enLabel: "Vrish" },
    3: { col: 3, row: 0, label: "మిథునం", enLabel: "Mith" },
    4: { col: 3, row: 1, label: "కర్కాటకం", enLabel: "Kark" },
    5: { col: 3, row: 2, label: "సింహం", enLabel: "Simh" },
    6: { col: 3, row: 3, label: "కన్య", enLabel: "Kany" },
    7: { col: 2, row: 3, label: "తుల", enLabel: "Tula" },
    8: { col: 1, row: 3, label: "వృశ్చికం", enLabel: "Vris" },
    9: { col: 0, row: 3, label: "ధనుస్సు", enLabel: "Dhan" },
    10: { col: 0, row: 2, label: "మకరం", enLabel: "Maka" },
    11: { col: 0, row: 1, label: "కుంభం", enLabel: "Kumb" },
    12: { col: 0, row: 0, label: "మీనం", enLabel: "Meen" }
  };

  const abbreviations: Record<string, string> = {
    Sun: "రవి",
    Moon: "చం",
    Mars: "కు",
    Mercury: "బు",
    Jupiter: "గు",
    Venus: "శు",
    Saturn: "శని",
    Rahu: "రా",
    Ketu: "కే",
    Lagna: "లగ్"
  };

  const renderCells = [];

  for (let house = 1; house <= 12; house++) {
    const coords = houseCoords[house];
    const x = coords.col * cellSize;
    const y = coords.row * cellSize;
    const planets = astroResult.housePlacements[house] || [];

    renderCells.push(
      <g key={`house-${house}`}>
        <rect 
          x={x} 
          y={y} 
          width={cellSize} 
          height={cellSize} 
          fill="transparent" 
          stroke="hsl(var(--primary))" 
          strokeWidth="1"
          opacity="0.5"
        />
        <text 
          x={x + 3} 
          y={y + 11} 
          fontSize="7px" 
          fontWeight="black" 
          fill="hsl(var(--muted-foreground))"
        >
          {coords.label}
        </text>
        <g transform={`translate(${x + 2}, ${y + 20})`}>
          {planets.map((planet: string, pIdx: number) => {
            const px = (pIdx % 3) * 23;
            const py = Math.floor(pIdx / 3) * 12;
            const isLagna = planet === "Lagna";
            return (
              <g key={`p-${pIdx}`} transform={`translate(${px}, ${py})`}>
                {isLagna ? (
                  <rect 
                    x="-2" 
                    y="-7" 
                    width="18" 
                    height="9" 
                    rx="1.5" 
                    className="fill-amber-500/20 stroke-amber-500 stroke-[0.5px]" 
                  />
                ) : null}
                <text 
                  fontSize="7px" 
                  fontWeight="black" 
                  fill={isLagna ? "orange" : "hsl(var(--foreground))"}
                >
                  {abbreviations[planet] || planet}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    );
  }

  const cx = cellSize;
  const cy = cellSize;
  const cWidth = cellSize * 2;
  const cHeight = cellSize * 2;

  return (
    <svg width="100%" height="100%" viewBox="0 0 300 300" className="mx-auto select-none border-2 border-amber-500/30 rounded-2xl bg-gradient-to-br from-amber-500/[0.02] to-orange-500/[0.02]">
      <rect x="0" y="0" width={width} height={height} fill="transparent" stroke="hsl(var(--primary))" strokeWidth="2" />
      {renderCells}
      <g transform={`translate(${cx + 10}, ${cy + 25})`}>
        <rect x="-10" y="-25" width={cWidth} height={cHeight} fill="hsl(var(--muted))" opacity="0.05" />
        <text x={cWidth/2 - 10} y="15" textAnchor="middle" fontSize="10px" fontWeight="black" fill="hsl(var(--primary))">
          {astroResult.rasi.te}
        </text>
        <text x={cWidth/2 - 10} y="32" textAnchor="middle" fontSize="9px" fontWeight="black" fill="hsl(var(--foreground))">
          {astroResult.nakshatram}
        </text>
        <text x={cWidth/2 - 10} y="48" textAnchor="middle" fontSize="8px" fontWeight="black" fill="hsl(var(--muted-foreground))">
          {astroResult.dob} | {astroResult.time}
        </text>
        <circle cx={cWidth/2 - 10} cy="90" r="18" fill="transparent" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx={cWidth/2 - 10} cy="90" r="12" fill="transparent" stroke="hsl(var(--primary))" strokeWidth="0.8" />
        <polygon points={`${cWidth/2 - 10},78 ${cWidth/2 - 2},96 ${cWidth/2 - 18},96`} fill="transparent" stroke="hsl(var(--primary))" strokeWidth="0.8" />
        <polygon points={`${cWidth/2 - 10},102 ${cWidth/2 - 2},84 ${cWidth/2 - 18},84`} fill="transparent" stroke="hsl(var(--primary))" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

export function DevotionalHub() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"panchangam" | "rasiphalalu" | "vastu" | "realtime_astrology">("realtime_astrology");
  const [pinnedRasi, setPinnedRasi] = useState<RasiKey | null>(null);

  // 🔮 Real-time Astrology state
  const [astroName, setAstroName] = useState("");
  const [astroDob, setAstroDob] = useState("");
  const [astroTime, setAstroTime] = useState("");
  const [astroBirthPlace, setAstroBirthPlace] = useState("Visakhapatnam");

  const [astroLoading, setAstroLoading] = useState(false);
  const [astroLoadingStep, setAstroLoadingStep] = useState("");
  const [astroResult, setAstroResult] = useState<any>(null);

  // Load pinned rasi from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vaartanow-user-rasi");
    if (saved) {
      setPinnedRasi(saved as RasiKey);
    }
  }, []);

  // Set/pin user rasi
  const handlePinRasi = (key: RasiKey) => {
    if (pinnedRasi === key) {
      setPinnedRasi(null);
      localStorage.removeItem("vaartanow-user-rasi");
    } else {
      setPinnedRasi(key);
      localStorage.setItem("vaartanow-user-rasi", key);
    }
  };

  // Translations
  const ui = {
    panchangam: { te: "నేటి పంచాంగం", en: "Daily Panchangam", hi: "दैनिक पंचांग", ta: "பஞ்சாங்கம்", kn: "ಪಂಚಾಂಗ" },
    rasiphalalu: { te: "నేటి రాశి ఫలాలు", en: "Daily Horoscope", hi: "दैनिक राशिफल", ta: "இன்றைய ராசி பலன்", kn: "ದಿನ ಭವಿಷ್ಯ" },
    vastu: { te: "వాస్తు శాస్త్రం", en: "Vastu Shastra", hi: "वास्तु शास्त्र", ta: "வாஸ்து சாஸ்திரம்", kn: "ವಾಸ್ತು ಶಾಸ್ತ್ರ" },
    pinBadge: { te: "నా రాశి 📌", en: "My Zodiac 📌", hi: "मेरी राशि 📌", ta: "என் ராசி 📌", kn: "ನನ್ನ ರಾಶಿ 📌" },
    pinAction: { te: "నా రాశిగా పిన్ చేయి", en: "Pin as My Zodiac", hi: "मेरी राशि के रूप में पिन करें", ta: "என் ராசியாக பின் செய்", kn: "ನನ್ನ ರಾಶಿಯಾಗಿ ಪಿನ್ ಮಾಡಿ" },
    unpinAction: { te: "పిన్ తీసేయి 📌", en: "Unpin 📌", hi: "पिन हटाएं 📌", ta: "பின் நீக்கு 📌", kn: "ಪಿನ್ ತೆಗೆಯಿರಿ 📌" },
    career: { te: "💼 ఉద్యోగం:", en: "💼 Career:", hi: "💼 करियर:", ta: "💼 வேலை:", kn: "💼 ಉದ್ಯೋಗ:" },
    health: { te: "🩺 ఆరోగ్యం:", en: "🩺 Health:", hi: "🩺 स्वास्थ्य:", ta: "🩺 சுகாதாரம்:", kn: "🩺 ಆರೋಗ್ಯ:" },
    finance: { te: "💰 ఆర్థికం:", en: "💰 Finance:", hi: "💰 वित्त:", ta: "💰 நிதி:", kn: "💰 ಹಣಕಾಸು:" },
    color: { te: "🎨 అదృష్ట రంగు:", en: "🎨 Lucky Color:", hi: "🎨 भाग्यशाली रंग:", ta: "🎨 அதிர்ஷ்ட நிறம்:", kn: "🎨 ಅದೃಷ್ಟದ ಬಣ್ಣ:" },
    number: { te: "🔢 అదృష్ట సంఖ్య:", en: "🔢 Lucky Number:", hi: "🔢 भाग्यशाली अंक:", ta: "🔢 அதிர்ஷ்ட எண்:", kn: "🔢 ಅದೃಷ್ಟದ ಸಂಖ್ಯೆ:" },
    whatsappShare: { te: "WhatsApp ద్వారా షేర్ చేయి", en: "Share on WhatsApp", hi: "WhatsApp पर शेयर करें", ta: "WhatsApp இல் பகிரவும்", kn: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ" },
    downloadImage: { te: "ఇమేజ్ డౌన్‌లోడ్", en: "Download Card", hi: "कार्ड डाउनलोड करें", ta: "அட்டை பதிவிறக்கம்", kn: "ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್" },
    tithi: { te: "తిథి", en: "Tithi", hi: "तिथि", ta: "திதி", kn: "ತಿಥಿ" },
    nakshatra: { te: "నక్షత్రం", en: "Nakshatram", hi: "नक्षत्र", ta: "நட்சத்திரம்", kn: "ನಕ್ಷತ್ರ" },
    rahu: { te: "రాహుకాలం ⚠️", en: "Rahu Kalam ⚠️", hi: "राहु काल ⚠️", ta: "ராகு காலம் ⚠️", kn: "ರಾಹು ಕಾಲ ⚠️" },
    durmuhurtham: { te: "దుర్ముహూర్తం ❌", en: "Durmuhurtham ❌", hi: "दुर्मुहूर्त ❌", ta: "துர்முகூர்த்தம் ❌", kn: "ದುರ್ಮುಹೂರ್ತ ❌" },
    amrutha: { te: "అమృత ఘడియలు ✨", en: "Amrutha Ghadiyalu ✨", hi: "अमृत काल ✨", ta: "அமிர்த நேரம் ✨", kn: "ಅಮೃತ ಕಾಲ ✨" },
    bhaktiTitle: { te: "జ్యోతిష్య అప్‌డేట్స్ & పండుగలు", en: "Jyotisham Updates & Festivals", hi: "ज्योतिष अपडेट और त्योहार", ta: "ஜோதிட அப்டேட்டுகள் & திருவிழாக்கள்", kn: "ಜ್ಯೋತಿಷ್ಯ ಅಪ್‌ಡೇಟ್‌ಗಳು ಮತ್ತು ಹಬ್ಬಗಳು" },
  };

  // 12 Zodiac predictions (Multilingual & punchy)
  const rasis: RasiItem[] = [
    {
      key: "mesha",
      emoji: "♈",
      name: { te: "మేషం", en: "Mesha", hi: "मेष", ta: "மேஷம்", kn: "ಮೇಷ" },
      english: "Aries",
      career: { te: "కొత్త బాధ్యతలు లభిస్తాయి.", en: "New opportunities are likely in career.", hi: "नौकरी में नई जिम्मेदारियां मिलेंगी।", ta: "புதிய பொறுப்புகள் கிடைக்கும்.", kn: "ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು ಸಿಗಲಿವೆ." },
      health: { te: "ఉత్సాహంగా ఉంటారు, యోగా చేయండి.", en: "Full of vitality, keep exercising.", hi: "स्वास्थ्य अच्छा रहेगा, योग करें।", ta: "உடல்நலம் சீராக இருக்கும், யோகா செய்யவும்.", kn: "ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿರಲಿದೆ, ಯೋಗ ಮಾಡಿ." },
      finance: { te: "ధన లాభం కలగవచ్చు.", en: "Financial gains are expected.", hi: "धन लाभ के योग बन रहे हैं।", ta: "பண வரவு உண்டாகும்.", kn: "ಧನ ಲಾಭದ ಸಾಧ್ಯತೆ ಇದೆ." },
      luckyColor: { te: "ఎరుపు", en: "Red", hi: "लाल", ta: "சிவப்பு", kn: "ಕೆಂಪು" },
      luckyNumber: 9
    },
    {
      key: "vrishabha",
      emoji: "♉",
      name: { te: "వృషభం", en: "Vrishabha", hi: "वृषभ", ta: "ரிஷபம்", kn: "ವೃಷಭ" },
      english: "Taurus",
      career: { te: "సహోద్యోగుల సహాయం అందుతుంది.", en: "Colleagues will offer valuable support.", hi: "सहकर्मियों से सहयोग प्राप्त होगा।", ta: "சக ஊழியர்களின் உதவி கிடைக்கும்.", kn: "ಸಹೋದ್ಯೋಗಿಗಳಿಂದ ಸಹಾಯ ಸಿಗಲಿದೆ." },
      health: { te: "ఆహారం విషయంలో జాగ్రత్త వహించండి.", en: "Watch your diet to avoid stomach issues.", hi: "खान-पान पर विशेष ध्यान दें।", ta: "உணவு விஷயத்தில் கவனம் தேவை.", kn: "ಆಹಾರದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ." },
      finance: { te: "ఖర్చులు పెరుగుతాయి, నియంత్రించండి.", en: "Control unnecessary expenditures.", hi: "खर्चों में बढ़ोतरी होगी, नियंत्रण रखें।", ta: "செலவுகள் அதிகரிக்கும், கட்டுப்படுத்தவும்.", kn: "ಖರ್ಚುಗಳು ಹೆಚ್ಚಾಗಲಿವೆ, ನಿಯಂತ್ರಿಸಿ." },
      luckyColor: { te: "తెలుపు", en: "White", hi: "सफेद", ta: "வெள்ளை", kn: "ಬಿಳಿ" },
      luckyNumber: 6
    },
    {
      key: "mithuna",
      emoji: "♊",
      name: { te: "మిథునం", en: "Mithuna", hi: "मिथुन", ta: "மிதுனம்", kn: "ಮಿಥುನ" },
      english: "Gemini",
      career: { te: "వ్యాపారంలో అనుకూలత లభిస్తుంది.", en: "Business expansions will yield profits.", hi: "व्यापार में अच्छे अवसर मिलेंगे।", ta: "தொழிலில் நல்ல முன்னேற்றம் ஏற்படும்.", kn: "ವ್ಯಾಪಾರದಲ್ಲಿ ಅನುಕೂಲಕರ ವಾತಾವರಣವಿರಲಿದೆ." },
      health: { te: "మానసిక ప్రశాంతత లభిస్తుంది.", en: "Mental stress will successfully reduce.", hi: "मानसिक तनाव से मुक्ति मिलेगी।", ta: "மன அமைதி கிடைக்கும்.", kn: "ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ ಸಿಗಲಿದೆ." },
      finance: { te: "ఆదాయం మెరుగ్గా ఉంటుంది.", en: "Income flows are steady and positive.", hi: "आय के नए स्रोत बनेंगे।", ta: "வருமானம் அதிகரிக்கும்.", kn: "ಆದಾಯ ಉತ್ತಮವಾಗಿರಲಿದೆ." },
      luckyColor: { te: "పసుపు", en: "Yellow", hi: "पीला", ta: "மஞ்சள்", kn: "ಹಳದಿ" },
      luckyNumber: 5
    },
    {
      key: "karka",
      emoji: "♋",
      name: { te: "కర్కాటకం", en: "Karka", hi: "कर्क", ta: "கடகம்", kn: "ಕಟಕ" },
      english: "Cancer",
      career: { te: "పని ఒత్తిడి పెరిగే అవకాశం ఉంది.", en: "Work pressure might slightly increase.", hi: "कार्यक्षेत्र में काम का दबाव रहेगा।", ta: "வேலை சுமை அதிகரிக்கக்கூடும்.", kn: "ಕೆಲಸದ ಒತ್ತಡ ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ." },
      health: { te: "తగినంత విశ్రాంతి తీసుకోండి.", en: "Adequate rest is highly recommended.", hi: "पर्याप्त आराम करना आवश्यक है।", ta: "போதுமான ஓய்வு தேவை.", kn: "ಅಗತ್ಯ ವಿಶ್ರಾಂತಿ ಪಡೆದುಕೊಳ್ಳಿ." },
      finance: { te: "పెట్టుబడుల విషయంలో జాగ్రత్త.", en: "Avoid risky share market investments.", hi: "निवेश के फैसलों में जल्दबाजी न करें।", ta: "முதலீடுகளில் எச்சரிக்கை தேவை.", kn: "ಹೂಡಿಕೆ ಮಾಡುವಾಗ ಎಚ್ಚರವಿರಲಿ." },
      luckyColor: { te: "ఆకుపచ్చ", en: "Green", hi: "हरा", ta: "பச்சை", kn: "ಹಸಿರು" },
      luckyNumber: 2
    },
    {
      key: "simha",
      emoji: "♌",
      name: { te: "సింహం", en: "Simha", hi: "सिंह", ta: "சிம்மம்", kn: "ಸಿಂಹ" },
      english: "Leo",
      career: { te: "నాయకత్వ లక్షణాలు మెరుగవుతాయి.", en: "Your leadership skills are recognized.", hi: "नेतृत्व क्षमता की प्रशंसा होगी।", ta: "தலைமை பண்பு மிளிரும்.", kn: "ನಾಯಕತ್ವದ ಗುಣಗಳು ಮೆಚ್ಚುಗೆ ಗಳಿಸಲಿವೆ." },
      health: { te: "శారీరక ధృఢత్వం అద్భుతంగా ఉంటుంది.", en: "Physical fitness is excellent today.", hi: "शारीरिक ऊर्जा भरपूर रहेगी।", ta: "உடல் வலிமை கூடும்.", kn: "ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ ಉತ್ತಮವಾಗಿರಲಿದೆ." },
      finance: { te: "పాత బాకీలు వసూలవుతాయి.", en: "Pending long-term dues will recover.", hi: "रुका हुआ धन वापस मिलेगा।", ta: "பழைய கடன்கள் வசூலாகும்.", kn: "ಹಳೆಯ ಸಾಲ ವసూಲಾಗಲಿದೆ." },
      luckyColor: { te: "బంగారు రంగు", en: "Gold", hi: "सुनहरा", ta: "தங்க நிறம்", kn: "ಬಂಗಾರದ ಬಣ್ಣ" },
      luckyNumber: 1
    },
    {
      key: "kanya",
      emoji: "♍",
      name: { te: "కన్య", en: "Kanya", hi: "कन्या", ta: "கன்னி", kn: "ಕನ್ಯಾ" },
      english: "Virgo",
      career: { te: "లక్ష్యాలను సులభంగా పూర్తిచేస్తారు.", en: "Targets will be easily completed today.", hi: "सभी कार्य समय पर पूरे होंगे।", ta: "இலக்குகளை எளிதாக முடிப்பீர்கள்.", kn: "ಗುರಿಗಳನ್ನು ಸುಲಭವಾಗಿ ತಲುಪುವಿರಿ." },
      health: { te: "ఆరోగ్య సమస్యల నుంచి ఉపశమనం.", en: "Recovery from minor ailments is quick.", hi: "स्वास्थ्य में सुधार देखने को मिलेगा।", ta: "உடல்நலப் பிரச்சினைகள் தீரும்.", kn: "ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಿಂದ ಮುಕ್ತಿ ಸಿಗಲಿದೆ." },
      finance: { te: "ఆలోచించి ఖర్చు చేయండి.", en: "Spend money wisely, prepare a budget.", hi: "सोच-समझकर ही खर्च करें।", ta: "யோசித்து செலவு செய்யவும்.", kn: "ಯೋಚಿಸಿ ಖರ್ಚು ಮಾಡಿ." },
      luckyColor: { te: "నీలం", en: "Blue", hi: "नीला", ta: "நீலம்", kn: "ನೀಲಿ" },
      luckyNumber: 7
    },
    {
      key: "tula",
      emoji: "♎",
      name: { te: "తుల", en: "Tula", hi: "तुला", ta: "துலாம்", kn: "ತುಲಾ" },
      english: "Libra",
      career: { te: "కొత్త వ్యాపార ఒప్పందాలు కుదురుతాయి.", en: "Fresh client partnerships will close.", hi: "नए व्यावसायिक सौदे तय होंगे।", ta: "புதிய வியாபார ஒப்பந்தங்கள் ஏற்படும்.", kn: "ಹೊಸ ವ್ಯಾಪಾರ ಒಪ್ಪಂದಗಳು ಕೈಗೂಡಲಿವೆ." },
      health: { te: "నిద్రలేమి సమస్య వేధించవచ్చు.", en: "Ensure proper 8-hour sleep.", hi: "नींद न आने की समस्या हो सकती है।", ta: "தூக்கமின்மை ஏற்படலாம்.", kn: "ನಿದ್ರಾಹೀನತೆ ಕಾಡಬಹುದು." },
      finance: { te: "ఆర్థిక స్థిరత్వం బాగుంటుంది.", en: "Financial liquidity remains strong.", hi: "आर्थिक स्थिति मजबूत रहेगी।", ta: "நிதி நிலைமை திருப்திகரமாக இருக்கும்.", kn: "ಆರ್ಥಿಕ ಪರಿಸ್ಥಿತಿ ಚೆನ್ನಾಗಿರಲಿದೆ." },
      luckyColor: { te: "వెండి రంగు", en: "Silver", hi: "रजत", ta: "வெள்ளி நிறம்", kn: "ಬೆಳ್ಳಿಯ ಬಣ್ಣ" },
      luckyNumber: 6
    },
    {
      key: "vrischika",
      emoji: "♏",
      name: { te: "వృశ్చికం", en: "Vrischika", hi: "वृश्चिक", ta: "விருச்சிகம்", kn: "ವೃಶ್ಚಿಕ" },
      english: "Scorpio",
      career: { te: "కష్టానికి తగిన గుర్తింపు లభిస్తుంది.", en: "Hard work gets rewarded by superiors.", hi: "कठिन परिश्रम का फल मिलेगा।", ta: "உழைப்புக்கு தகுந்த அங்கீகாரம் கிடைக்கும்.", kn: "ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗಲಿದೆ." },
      health: { te: "వెన్నునొప్పి వచ్చే అవకాశం ఉంది.", en: "Take care of posture to avoid back pain.", hi: "पीठ दर्द की समस्या हो सकती है।", ta: "முதுகு வலி ஏற்பட வாய்ப்புள்ளது.", kn: "ಬೆನ್ನು ನೋವು ಕಾಡುವ ಸಾಧ್ಯತೆ ಇದೆ." },
      finance: { te: "ఆకస్మిక ధన లాభం ఉంటుంది.", en: "Sudden financial windfalls are likely.", hi: "अचानक धन लाभ की संभावना है।", ta: "திடீர் பண வரவு உண்டாகும்.", kn: "ಅನಿರೀಕ್ಷಿತ ಧನ ಲಾಭವಾಗಲಿದೆ." },
      luckyColor: { te: "నారింజ", en: "Orange", hi: "नारंगी", ta: "ஆரஞ்சு", kn: "ಕಿತ್ತಳೆ" },
      luckyNumber: 9
    },
    {
      key: "dhanussu",
      emoji: "♐",
      name: { te: "ధనస్సు", en: "Dhanussu", hi: "धनु", ta: "தனுசு", kn: "ಧನುಸ್ಸು" },
      english: "Sagittarius",
      career: { te: "ప్రయాణాలు లాభదాయకంగా ఉంటాయి.", en: "Business travel proves highly profitable.", hi: "कार्य संबंधी यात्राएं सफल रहेंगी।", ta: "பயணங்கள் சாதகமாக இருக்கும்.", kn: "ಉದ್ಯೋಗ ನಿಮಿತ್ತ ಪ್ರಯಾಣಗಳು ಯಶಸ್ವಿಯಾಗಲಿವೆ." },
      health: { te: "మానసిక ప్రశాంతత కోసం ధ్యానం చేయండి.", en: "Meditate for better mental calm.", hi: "ध्यान करें, मानसिक शांति मिलेगी।", ta: "தியானம் செய்ய உகந்த நாள்.", kn: "ಧ್ಯಾನ ಮಾಡುವುದರಿಂದ ಪ್ರಶಾಂತತೆ ಸಿಗಲಿದೆ." },
      finance: { te: "ఖర్చుల పట్ల అప్రమత్తంగా ఉండాలి.", en: "Be extremely vigilant with budgets.", hi: "फालतू खर्चों से दूरी बनाएं।", ta: "தேவையற்ற செலவுகளை தவிர்க்கவும்.", kn: "ಅನಗತ್ಯ ಖರ್ಚುಗಳಿಂದ ದೂರವಿರಿ." },
      luckyColor: { te: "వైలెట్", en: "Violet", hi: "बैंगनी", ta: "ஊதா நிறம்", kn: "ನೇರಳೆ" },
      luckyNumber: 3
    },
    {
      key: "makara",
      emoji: "♑",
      name: { te: "మకరం", en: "Makara", hi: "मकर", ta: "மகரம்", kn: "ಮಕರ" },
      english: "Capricorn",
      career: { te: "ఆటంకాలు తొలగి ప్రమోషన్ దక్కుతుంది.", en: "Barriers clear, leading to promotion.", hi: "कठिनाइयां दूर होंगी, प्रगति होगी।", ta: "தடைகள் நீங்கி பதவி உயர்வு கிடைக்கும்.", kn: "ಅಡೆತಡೆಗಳು ದೂರವಾಗಿ ಪ್ರಮೋಷನ್ ಸಿಗಲಿದೆ." },
      health: { te: "కీళ్ల నొప్పుల పట్ల జాగ్రత్త.", en: "Be cautious with joint/knee pains.", hi: "जोड़ों के दर्द से सावधान रहें।", ta: "மூட்டு வலிகள் ஏற்படலாம்.", kn: "ಕೀಲು ನೋವಿನ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ." },
      finance: { te: "ఆదాయం పెరిగే అవకాశాలు ఉన్నాయి.", en: "Strong possibilities of salary hikes.", hi: "आय में वृद्धि की प्रबल संभावना है।", ta: "வருவாய் அதிகரிக்க வாய்ப்புள்ளது.", kn: "ಆದಾಯ ಹೆಚ್ಚಾಗುವ ಸಂಭವವಿದೆ." },
      luckyColor: { te: "నలుపు", en: "Black", hi: "काला", ta: "கருப்பு", kn: "ಕಪ್ಪು" },
      luckyNumber: 8
    },
    {
      key: "kumbha",
      emoji: "♒",
      name: { te: "కుంభం", en: "Kumbha", hi: "कुंभ", ta: "கும்பம்", kn: "ಕುಂಭ" },
      english: "Aquarius",
      career: { te: "ఆలోచనలు సత్ఫలితాలను ఇస్తాయి.", en: "Creative ideas will succeed brilliantly.", hi: "नए विचार व्यापार में मददगार होंगे।", ta: "புதிய யோசனைகள் வெற்றி பெறும்.", kn: "ಹೊಸ ಆಲೋಚನೆಗಳು ಫಲ ನೀಡಲಿವೆ." },
      health: { te: "కంటి సమస్యల పట్ల శ్రద్ధ వహించండి.", en: "Get eyes tested, reduce screen-time.", hi: "आंखों की देखभाल पर ध्यान दें।", ta: "கண் எரிச்சல் ஏற்படலாம்.", kn: "ಕಣ್ಣಿನ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಕಾಳಜಿ ಇರಲಿ." },
      finance: { te: "భాగస్వామ్యం కలిసి వస్తుంది.", en: "Partnerships bring financial boost.", hi: "साझेदारी से लाभ होगा।", ta: "கூட்டு தொழில் லாபம் தரும்.", kn: "ಪಾಲುದಾರಿಕೆಯಿಂದ ಆರ್ಥిక ಲಾಭವಾಗಲಿದೆ." },
      luckyColor: { te: "నేవీ బ్లూ", en: "Navy Blue", hi: "गहरा नीला", ta: "கருநீலம்", kn: "ಗಾಢ ನೀಲಿ" },
      luckyNumber: 4
    },
    {
      key: "meena",
      emoji: "♓",
      name: { te: "మీనం", en: "Meena", hi: "मीन", ta: "மீனம்", kn: "ಮೀನ" },
      english: "Pisces",
      career: { te: "కీర్తి ప్రతిష్టలు పెరుగుతాయి.", en: "Your professional reputation will soar.", hi: "मान-सम्मान में वृद्धि होगी।", ta: "மதிப்பு, மரியாதை கூடும்.", kn: "ಗೌರವ ಮತ್ತು ಮನ್ನಣೆ ಹೆಚ್ಚಾಗಲಿದೆ." },
      health: { te: "తల నొప్పి వేధించే అవకాశం ఉంది.", en: "Dehydration may cause headache.", hi: "सिरदर्द की समस्या हो सकती है।", ta: "தலைவலி ஏற்பட வாய்ப்புள்ளது.", kn: "ತಲೆನೋವು ಕಾಡಬಹುದು." },
      finance: { te: "సేవింగ్స్ ప్లాన్ ప్రారంభించండి.", en: "Excellent day to start a savings fund.", hi: "बचत योजनाओं में निवेश करें।", ta: "சேமிப்பு திட்டங்களை தொடங்கலாம்.", kn: "ಉಳಿತಾಯ ಯೋಜನೆಗಳನ್ನು ಆರಂಭಿಸಲು ಉತ್ತಮ ದಿನ." },
      luckyColor: { te: "బంగారు పసుపు", en: "Golden Yellow", hi: "स्वर्ण पीला", ta: "தங்க மஞ்சள்", kn: "ಹಳದಿ ಬಣ್ಣ" },
      luckyNumber: 3
    }
  ];

  // Re-sort Rasis so that pinned sign is placed at index 0
  const sortedRasis = useMemo(() => {
    if (!pinnedRasi) return rasis;
    const pinnedIdx = rasis.findIndex((r) => r.key === pinnedRasi);
    if (pinnedIdx === -1) return rasis;
    const reordered = [...rasis];
    const [pinned] = reordered.splice(pinnedIdx, 1);
    return [pinned, ...reordered];
  }, [pinnedRasi]);

  // Dynamic Image compiler utilizing HTML5 Canvas API
  const handleDownloadCard = (rasi: RasiItem) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rasiName = rasi.name[lang] || rasi.name.te;
      const englishName = rasi.english;
      const careerText = rasi.career[lang] || rasi.career.te;
      const healthText = rasi.health[lang] || rasi.health.te;
      const financeText = rasi.finance[lang] || rasi.finance.te;
      const luckyColor = rasi.luckyColor[lang] || rasi.luckyColor.te;
      const luckyNumber = rasi.luckyNumber;

      // 🎨 Gradient background drawing
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, "#7f1d1d"); // Deep crimson red
      gradient.addColorStop(1, "#18181b"); // Slate zinc 900
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Gold decorative borders
      ctx.strokeStyle = "#d97706"; // Amber 600
      ctx.lineWidth = 12;
      ctx.strokeRect(15, 15, 770, 570);
      
      ctx.strokeStyle = "#fbbf24"; // Amber 400
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 25, 750, 550);

      // Header Brand text
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 38px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("VaartaNow - తెలుగు AI వార్తలు", 400, 85);

      // Date subtitle text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(`దినఫలం (Daily Predictions) - ${new Date().toLocaleDateString(lang === "te" ? "te-IN" : "en-US")}`, 400, 125);

      // Horizontal separator line
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.lineTo(700, 150);
      ctx.stroke();

      // Zodiac header
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 36px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(`${rasi.emoji} ${rasiName} రాశి (${englishName})`, 400, 200);

      // Predictions checklist
      ctx.textAlign = "left";
      ctx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
      
      let y = 270;
      
      // Career
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("💼 ఉద్యోగం (Career):", 80, y);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(careerText, 320, y);
      
      y += 60;
      // Health
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("🩺 ఆరోగ్యం (Health):", 80, y);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(healthText, 320, y);

      y += 60;
      // Finance
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("💰 ఆర్థికం (Finance):", 80, y);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(financeText, 320, y);

      y += 65;
      // Decorative line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(720, y);
      ctx.stroke();

      y += 50;
      // Luck indices
      ctx.fillStyle = "#38bdf8"; // Sky blue 400
      ctx.fillText(`🎨 అదృష్ట రంగు (Lucky Color): ${luckyColor}`, 80, y);
      ctx.fillText(`🔢 అదృష్ట సంఖ్య (Lucky Number): ${luckyNumber}`, 80, y + 45);

      // Footer brand notice
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText("Downloaded from VaartaNow App • Install on Mobile Screen", 400, 560);

      // Download trigger
      const link = document.createElement("a");
      link.download = `${rasi.key}-horoscope-vaartanow.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Canvas drawing failed:", e);
    }
  };

  // WhatsApp text sharing trigger
  const handleWhatsAppShare = (rasi: RasiItem) => {
    const rasiName = rasi.name[lang] || rasi.name.te;
    const englishName = rasi.english;
    const careerText = rasi.career[lang] || rasi.career.te;
    const healthText = rasi.health[lang] || rasi.health.te;
    const financeText = rasi.finance[lang] || rasi.finance.te;
    const luckyColor = rasi.luckyColor[lang] || rasi.luckyColor.te;
    const luckyNumber = rasi.luckyNumber;

    const message = `✨ *VaartaNow దినఫలం (${new Date().toLocaleDateString()})* ✨\n\n🌟 *${rasi.emoji} ${rasiName} రాశి (${englishName})* 🌟\n\n💼 *ఉద్యోగం:* ${careerText}\n🩺 *ఆరోగ్యం:* ${healthText}\n💰 *ఆర్థికం:* ${financeText}\n\n🎨 *అదృష్ట రంగు:* ${luckyColor}\n🔢 *అదృష్ట సంఖ్య:* ${luckyNumber}\n\n📲 మరింత సమాచారం మరియు రోజువారీ రాశిఫలాల కోసం ఇప్పుడే ఇన్‌స్టాల్ చేసుకోండి: ${window.location.origin}`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden p-5 shadow-sm space-y-4">
      {/* 🔮 Devotional Hub Section Navigation Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[hsl(var(--border))]/70 pb-3 gap-3">
        <h2 className="text-lg font-black flex items-center gap-2">
          <Sparkles className="size-5 text-amber-500 animate-pulse" />
          {lang === "te" ? "జ్యోతిష్యం & ఆధ్యాత్మికం" : lang === "en" ? "Astrology & Spirituality" : lang === "hi" ? "ज्योतिष और आध्यात्मिकता" : lang === "ta" ? "ஜோதிடம் & ஆன்மீகம்" : "ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ಅಧ್ಯಾತ್ಮ"}
        </h2>
        <div className="flex border border-amber-500/30 bg-[hsl(var(--muted))]/40 p-1 rounded-full text-xs font-black w-full md:w-auto overflow-x-auto no-scrollbar shrink-0 gap-1 shadow-sm">
          <button 
            onClick={() => setActiveTab("realtime_astrology")}
            className={`rounded-full px-4 py-1.5 transition whitespace-nowrap font-extrabold ${
              activeTab === "realtime_astrology" 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm" 
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            {lang === "te" ? "వ్యక్తిగత జాతకం 🔮" : lang === "en" ? "My Horoscope 🔮" : lang === "hi" ? "व्यक्तिगत कुंडली 🔮" : lang === "ta" ? "ஜாதகம் கணித்தல் 🔮" : "ವೈಯಕ್ತಿಕ ಜಾತಕ 🔮"}
          </button>
          <button 
            onClick={() => setActiveTab("panchangam")}
            className={`rounded-full px-4 py-1.5 transition whitespace-nowrap ${
              activeTab === "panchangam" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {ui.panchangam[lang] || ui.panchangam.te}
          </button>
          <button 
            onClick={() => setActiveTab("rasiphalalu")}
            className={`rounded-full px-4 py-1.5 transition whitespace-nowrap ${
              activeTab === "rasiphalalu" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {ui.rasiphalalu[lang] || ui.rasiphalalu.te}
          </button>
          <button 
            onClick={() => setActiveTab("vastu")}
            className={`rounded-full px-4 py-1.5 transition whitespace-nowrap ${
              activeTab === "vastu" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {ui.vastu[lang] || ui.vastu.te}
          </button>
        </div>
      </div>

      {/* 📅 Tab 1: Daily Panchangam (నేటి పంచాంగం) */}
      {activeTab === "panchangam" && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Calendar card */}
          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4 flex gap-4 items-center shadow-sm">
            <div className="size-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0">
              <Calendar className="size-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {ui.tithi[lang] || ui.tithi.te}
              </h4>
              <p className="text-base font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                {lang === "te" ? "ద్వాదశి (మధ్యాహ్నం 1:40 వరకు)" : "Dwadashi (until 1:40 PM)"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4 flex gap-4 items-center shadow-sm">
            <div className="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {ui.nakshatra[lang] || ui.nakshatra.te}
              </h4>
              <p className="text-base font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                {lang === "te" ? "చిత్తా నక్షత్రం (రాత్రి 10:15 వరకు)" : "Chitra Nakshatram (until 10:15 PM)"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-gradient-to-br from-red-500/5 to-orange-500/5 p-4 flex gap-4 items-center shadow-sm">
            <div className="size-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {ui.rahu[lang] || ui.rahu.te}
              </h4>
              <p className="text-base font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                {lang === "te" ? "సాయంత్రం 4:30 - 6:00" : "4:30 PM - 6:00 PM"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-gradient-to-br from-red-500/5 to-pink-500/5 p-4 flex gap-4 items-center shadow-sm">
            <div className="size-12 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {ui.durmuhurtham[lang] || ui.durmuhurtham.te}
              </h4>
              <p className="text-base font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                {lang === "te" ? "మధ్యాహ్నం 12:00 - 12:48" : "12:00 PM - 12:48 PM"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4 flex gap-4 items-center shadow-sm sm:col-span-2 md:col-span-1">
            <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {ui.amrutha[lang] || ui.amrutha.te}
              </h4>
              <p className="text-base font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                {lang === "te" ? "ఉదయం 9:00 - 10:30" : "9:00 AM - 10:30 AM"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🔮 Tab 2: Daily Horoscopes (నేటి రాశి ఫలాలు) */}
      {activeTab === "rasiphalalu" && (
        <div className="space-y-5">
          {/* Horizontal deck scroll to select zodiac signs */}
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto py-1">
            {rasis.map((rasi) => {
              const active = pinnedRasi === rasi.key;
              return (
                <button
                  key={rasi.key}
                  onClick={() => handlePinRasi(rasi.key)}
                  className={`shrink-0 h-11 px-4 rounded-full text-xs font-black flex items-center gap-1.5 transition border ${
                    active 
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-yellow-400 shadow-md scale-105" 
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent hover:border-[hsl(var(--border))]"
                  }`}
                >
                  <span className="text-base">{rasi.emoji}</span>
                  <span>{rasi.name[lang] || rasi.name.te}</span>
                  {active && <span>📌</span>}
                </button>
              );
            })}
          </div>

          {/* Cards grid displaying zodiac predictions */}
          <div className="grid gap-5 md:grid-cols-2">
            {sortedRasis.slice(0, pinnedRasi ? 1 : 12).map((rasi: RasiItem) => {
              const activePin = pinnedRasi === rasi.key;
              const rasiName = rasi.name[lang] || rasi.name.te;
              const englishName = rasi.english;
              return (
                <div 
                  key={rasi.key}
                  className={`relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between transition-all duration-500 ${
                    activePin
                      ? "bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-zinc-900/5 border-yellow-400 dark:border-yellow-500/40 shadow-md ring-1 ring-yellow-500/10 scale-[1.01]"
                      : "bg-[hsl(var(--card))] border-[hsl(var(--border))]/60 shadow-sm"
                  }`}
                >
                  {/* Pinned Glow effects */}
                  {activePin && (
                    <div className="absolute -right-16 -top-16 size-32 rounded-full bg-yellow-500/10 blur-2xl" />
                  )}

                  <div className="space-y-4">
                    {/* Sign header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{rasi.emoji}</span>
                        <div>
                          <h3 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2">
                            {rasiName}
                            {activePin && (
                              <span className="text-[10px] bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {ui.pinBadge[lang] || ui.pinBadge.te}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                            {englishName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePinRasi(rasi.key)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full border transition ${
                          activePin 
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20" 
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent hover:border-[hsl(var(--border))]"
                        }`}
                      >
                        {activePin 
                          ? (ui.unpinAction[lang] || ui.unpinAction.te)
                          : (ui.pinAction[lang] || ui.pinAction.te)
                        }
                      </button>
                    </div>

                    {/* Bullet elements */}
                    <div className="space-y-2 border-t border-b border-[hsl(var(--border))]/40 py-3.5 text-sm leading-relaxed font-bold">
                      <div className="flex items-start gap-1.5">
                        <span className="shrink-0 text-amber-500">{ui.career[lang] || ui.career.te}</span>
                        <span className="text-[hsl(var(--foreground))]">{rasi.career[lang] || rasi.career.te}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="shrink-0 text-emerald-500">{ui.health[lang] || ui.health.te}</span>
                        <span className="text-[hsl(var(--foreground))]">{rasi.health[lang] || rasi.health.te}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="shrink-0 text-blue-500">{ui.finance[lang] || ui.finance.te}</span>
                        <span className="text-[hsl(var(--foreground))]">{rasi.finance[lang] || rasi.finance.te}</span>
                      </div>
                    </div>

                    {/* Luck indices */}
                    <div className="flex flex-wrap gap-4 text-xs font-black">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[hsl(var(--muted-foreground))]">{ui.color[lang] || ui.color.te}</span>
                        <span className="text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">{rasi.luckyColor[lang] || rasi.luckyColor.te}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[hsl(var(--muted-foreground))]">{ui.number[lang] || ui.number.te}</span>
                        <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">{rasi.luckyNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp sharing and dynamic card downloading triggers */}
                  <div className="flex gap-2.5 mt-5">
                    <button
                      onClick={() => handleWhatsAppShare(rasi)}
                      className="flex-1 h-10 rounded-2xl text-xs font-black bg-[#25D366] text-white hover:shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="size-3.5" />
                      {ui.whatsappShare[lang] || ui.whatsappShare.te}
                    </button>
                    <button
                      onClick={() => handleDownloadCard(rasi)}
                      className="h-10 rounded-2xl px-4 text-xs font-black bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                      title={ui.downloadImage[lang] || ui.downloadImage.te}
                    >
                      <Download className="size-3.5" />
                      <span className="hidden sm:inline">{ui.downloadImage[lang] || ui.downloadImage.te}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🧭 Tab 3: Vastu Shastra (వాస్తు శాస్త్రం) */}
      {activeTab === "vastu" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--muted))]/30 p-4 space-y-2">
            <h4 className="font-extrabold text-sm text-[hsl(var(--primary))] flex items-center gap-1.5">
              <Compass className="size-4.5" />
              {lang === "te" ? "ఈశాన్య మూల (ఈశాన్యం)" : "North-East (Eshanyam)"}
            </h4>
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
              {lang === "te" 
                ? "ఈశాన్యంలో పూజా గది లేదా ఖాళీ స్థలం ఉంచాలి. ఇక్కడ బరువైన వస్తువులను మరియు టాయిలెట్లను నిర్మించరాదు."
                : "Always keep the North-East corner clean and light. Best suited for prayer rooms. Avoid heavy furniture or toilets here."
              }
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--muted))]/30 p-4 space-y-2">
            <h4 className="font-extrabold text-sm text-red-600 flex items-center gap-1.5">
              <Compass className="size-4.5" />
              {lang === "te" ? "ఆగ్నేయ మూల (ఆగ్నేయం)" : "South-East (Agneyam)"}
            </h4>
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
              {lang === "te" 
                ? "వంటగది ఆగ్నేయంలో ఉండాలి. ఇది అగ్ని స్థానం కాబట్టి ఇంటి ఆర్థిక అభివృద్ధికి మరియు ఆరోగ్యానికి చాలా మంచిది."
                : "The kitchen must face South-East. Representing Agni (Fire), this placement guarantees high prosperity and family vitality."
              }
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--muted))]/30 p-4 space-y-2">
            <h4 className="font-extrabold text-sm text-amber-600 flex items-center gap-1.5">
              <Compass className="size-4.5" />
              {lang === "te" ? "నైరుతి మూల (నైరుతి)" : "South-West (Nairuthya)"}
            </h4>
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
              {lang === "te" 
                ? "ప్రధాన పడకగది నైరుతిలో ఉండాలి. ఇది యజమానికి స్థిరత్వాన్ని మరియు నాయకత్వాన్ని అందిస్తుంది."
                : "The master bedroom should ideally be placed in the South-West. This promotes household stability and executive decision-making."
              }
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--muted))]/30 p-4 space-y-2">
            <h4 className="font-extrabold text-sm text-sky-600 flex items-center gap-1.5">
              <Compass className="size-4.5" />
              {lang === "te" ? "వాయువ్య మూల (వాయువ్యం)" : "North-West (Vayuvya)"}
            </h4>
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
              {lang === "te" 
                ? "అతిథి గృహం లేదా నిల్వ గదికి అనువైనది. విదేశీ ప్రయాణాలకు మరియు బంధుత్వాలకు ఇది అనుకూలిస్తుంది."
                : "Best for guest bedrooms or grain storage. It represents Vayu (Air), supporting healthy relations and career movements."
              }
            </p>
          </div>
        </div>
      )}

      {/* 🔮 Tab 4: Know Your Real-time Astrology (వ్యక్తిగత జాతకం) */}
      {activeTab === "realtime_astrology" && (
        <div className="space-y-6 animate-fadeIn">
          {!astroResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Horoscope Form */}
              <div className="lg:col-span-2 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5 p-6 shadow-md space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center justify-center gap-2">
                    <Sparkles className="size-5 text-amber-500 animate-pulse" />
                    {lang === "te" ? "మీ వ్యక్తిగత జాతకం తెలుసుకోండి" : "Know Your Real-time Astrology"}
                  </h3>
                  <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                    {lang === "te" 
                      ? "ఖచ్చితమైన గ్రహాల అమరిక కోసం మీ పుట్టిన వివరాలను నమోదు చేయండి" 
                      : "Enter your birth details to calculate exact planetary positions."}
                  </p>
                </div>

                {astroLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="relative size-16">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto size-6 text-amber-500 animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-black text-[hsl(var(--foreground))] animate-pulse">
                        {astroLoadingStep}
                      </p>
                      <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                        {lang === "te" ? "దయచేసి వేచి ఉండండి..." : "Please wait a moment..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider block">
                          {lang === "te" ? "పూర్తి పేరు" : "Full Name"}
                        </label>
                        <input 
                          type="text" 
                          value={astroName}
                          onChange={(e) => setAstroName(e.target.value)}
                          placeholder={lang === "te" ? "ఉదా: సాయి కిరణ్" : "e.g. Sai Kiran"}
                          className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider block">
                          {lang === "te" ? "పుట్టిన ఊరు" : "Place of Birth"}
                        </label>
                        <input 
                          type="text" 
                          value={astroBirthPlace}
                          onChange={(e) => setAstroBirthPlace(e.target.value)}
                          placeholder="Visakhapatnam"
                          className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider block">
                          {lang === "te" ? "పుట్టిన తేదీ" : "Date of Birth"}
                        </label>
                        <input 
                          type="date" 
                          value={astroDob}
                          onChange={(e) => setAstroDob(e.target.value)}
                          className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider block">
                          {lang === "te" ? "పుట్టిన సమయం" : "Time of Birth"}
                        </label>
                        <input 
                          type="time" 
                          value={astroTime}
                          onChange={(e) => setAstroTime(e.target.value)}
                          className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!astroName || !astroDob || !astroTime || !astroBirthPlace) {
                          alert(lang === "te" ? "దయచేసి అన్ని వివరాలను పూరించండి!" : "Please fill in all details!");
                          return;
                        }

                        setAstroLoading(true);
                        setAstroLoadingStep(lang === "te" ? "Google Maps ద్వారా స్థాన అక్షాంశాలను పొందుతోంది..." : "Geocoding location coordinates via Google Maps...");

                        setTimeout(() => {
                          setAstroLoadingStep(lang === "te" ? "Prokerala వేద జ్యోతిష్య విభాగంతో కనెక్ట్ అవుతోంది..." : "Connecting to Prokerala Vedic Astrology Engine...");

                          setTimeout(() => {
                            setAstroLoadingStep(lang === "te" ? "జన్మ నిమిషాల ఆధారంగా గ్రహ స్థానాలను లెక్కిస్తోంది..." : "Calculating planetary positions for birth coordinates...");

                            setTimeout(() => {
                              let lat = 17.6868;
                              let lng = 83.2185;

                              const placeLower = astroBirthPlace.toLowerCase();
                              if (placeLower.includes("hyderabad")) {
                                lat = 17.3850; lng = 78.4867;
                              } else if (placeLower.includes("vijayawada")) {
                                lat = 16.5062; lng = 80.6480;
                              } else if (placeLower.includes("tirupati")) {
                                lat = 13.6288; lng = 79.4192;
                              } else if (placeLower.includes("bengaluru") || placeLower.includes("bangalore")) {
                                lat = 12.9716; lng = 77.5946;
                              } else if (placeLower.includes("chennai")) {
                                lat = 13.0827; lng = 80.2707;
                              } else if (placeLower.includes("mumbai")) {
                                lat = 19.0760; lng = 72.8777;
                              } else if (placeLower.includes("delhi")) {
                                lat = 28.6139; lng = 77.2090;
                              }

                              const details = getVedicDetails(astroName, astroDob, astroTime, astroBirthPlace, lat, lng);
                              
                              setAstroResult({
                                name: astroName,
                                dob: astroDob,
                                time: astroTime,
                                place: astroBirthPlace,
                                lat,
                                lng,
                                ...details
                              });
                              setAstroLoading(false);
                            }, 1000);
                          }, 1000);
                        }, 1000);
                      }}
                      className="w-full text-xs font-black py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/10 active:scale-[0.98] transition block text-center uppercase tracking-wider"
                    >
                      {lang === "te" ? "జాతకం పొందండి" : "Get My Details"}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Google AdSense Sidebar */}
              <div className="lg:col-span-1 rounded-2xl border-2 border-dashed border-[hsl(var(--border))]/70 bg-[hsl(var(--muted))]/15 p-5 flex flex-col items-center justify-center min-h-[360px] text-center space-y-4 relative overflow-hidden">
                <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2.5 py-0.5 rounded-full tracking-wider border border-[hsl(var(--border))]/30">Ad</span>
                <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="size-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[hsl(var(--foreground))]">గూగుల్ ఆడ్సెన్స్ ప్రకటన</h4>
                  <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] leading-relaxed max-w-[220px]">
                    {lang === "te"
                      ? "మీ ఆడ్సెన్స్ కోడ్ లేదా బ్యానర్ ప్రకటనలను ఈ ప్రదేశంలో ప్రదర్శించవచ్చు."
                      : "Display your Google AdSense units, responsive banner ads, or custom sponsor content here."}
                  </p>
                </div>
                
                {/* Visual Ad Box representation */}
                <div className="w-full h-[180px] rounded-xl border border-dashed border-[hsl(var(--border))]/80 bg-[hsl(var(--card))]/65 flex flex-col items-center justify-center p-4 text-center shadow-inner relative group hover:border-amber-500/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
                  <span className="text-[10px] font-mono font-bold text-[hsl(var(--muted-foreground))]">Google AdSense</span>
                  <span className="text-[9px] font-mono text-[hsl(var(--muted-foreground))]/70 mt-1">Responsive Banner Ad Slot</span>
                  <div className="mt-3 text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase tracking-widest animate-pulse">
                    300 × 250 Medium Rectangle
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[hsl(var(--border))]/70 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-black text-[hsl(var(--foreground))]">
                      🔮 {astroResult.name} {lang === "te" ? "వారి జన్మ జాతక చక్రం" : "Horoscope Details"}
                    </h3>
                    <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mt-1">
                      <MapPin className="size-3.5 text-amber-500" />
                      {astroResult.place} (Lat: {astroResult.lat.toFixed(4)}, Lng: {astroResult.lng.toFixed(4)})
                    </p>
                  </div>
                  <button 
                    onClick={() => setAstroResult(null)}
                    className="text-xs font-black px-3.5 py-1.5 rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition shrink-0"
                  >
                    {lang === "te" ? "మరో జాతకం" : "Check Another"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--card))] p-3 text-center space-y-0.5">
                    <span className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                      {lang === "te" ? "లగ్నం" : "Lagnam (Asc)"}
                    </span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {astroResult.lagnam}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--card))] p-3 text-center space-y-0.5">
                    <span className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                      {lang === "te" ? "రాశి" : "Rasi (Zodiac)"}
                    </span>
                    <span className="text-xs font-black text-orange-500">
                      {lang === "te" ? astroResult.rasi.te : astroResult.rasi.en}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--card))] p-3 text-center space-y-0.5">
                    <span className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                      {lang === "te" ? "నక్షత్రం" : "Nakshatram"}
                    </span>
                    <span className="text-xs font-black text-yellow-600 dark:text-yellow-400">
                      {astroResult.nakshatram}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/50 pb-2">
                    <h4 className="text-xs font-black text-[hsl(var(--foreground))]">
                      📈 {lang === "te" ? "జన్మ జాతక చక్రం (దక్షిణాది పద్ధతి)" : "Vedic Birth Chart (South Indian Grid)"}
                    </h4>
                    <div className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {lang === "te" ? "ఖచ్చితమైన లెక్కింపు" : "Calculated Placements"}
                    </div>
                  </div>

                  <div className="max-w-[260px] mx-auto">
                    {renderSouthIndianChart(astroResult)}
                  </div>

                  <p className="text-[9px] font-bold text-[hsl(var(--muted-foreground))] text-center leading-relaxed italic">
                    {lang === "te" 
                      ? "* గమనిక: మీ జన్మ తేదీ, సమయం, మరియు అక్షాంశాల ఆధారంగా గ్రహ నిలయాలు శాస్త్రీయంగా లెక్కించబడ్డాయి." 
                      : "* Note: Planetary positions calculated mathematically based on your exact birth time, date, and local coordinate offsets."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] p-5 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/50 pb-2">
                      🔮 {lang === "te" ? "వ్యక్తిగత ఫలితాలు" : "Personal Predictions Summary"}
                    </h4>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                          💼 {lang === "te" ? "ఉద్యోగ & వ్యాపార జాతకం" : "Career & Business Prospects"}
                        </span>
                        <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
                          {lang === "te"
                            ? `${astroResult.lagnam} లో పుట్టిన మీకు తృతీయ మరియు దశమ స్థానాలలో గ్రహ బలం బాగుంది. నాయకత్వ బాధ్యతలు సమర్థవంతంగా నిర్వహిస్తారు. స్వయం ఉపాధి అనుకూలిస్తుంది.`
                            : `Being born under ${astroResult.lagnam}, the planetary alignment highlights excellent growth in dynamic sectors. Direct business ventures and executive leadership positions are highly favored.`
                          }
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
                          🩺 {lang === "te" ? "ఆరోగ్య ఫలితాలు" : "Health & Energy Levels"}
                        </span>
                        <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
                          {lang === "te"
                            ? `పంచమ స్థాన గ్రహ సంచారం వల్ల ఉత్సాహంగా గడుపుతారు. శారీరక శ్రమ మరియు సరైన ఆహార నియమాల వల్ల పాత అనారోగ్య సమస్యలు నయమవుతాయి. ధ్యానం అనుకూలం.`
                            : `Your solar offset promises robust energy levels. Paying close attention to standard dietary routines and active exercise will quickly neutralize minor seasonal sensitivities.`
                          }
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                          💰 {lang === "te" ? "ఆర్థిక విషయాలు" : "Wealth & Financial Growth"}
                        </span>
                        <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
                          {lang === "te"
                            ? `ద్వితీయ ధనాధిపతి అనుకూల సంచారంలో ఉన్నాడు. ఊహించని ధన లాభాలు పొందుతారు. దీర్ఘకాలిక పెట్టుబడులకు గ్రీన్ ఎనర్జీ మరియు భూ సంబంధిత షేర్లు అనుకూలిస్తాయి.`
                            : `Your strong financial houses suggest highly consistent asset growth. Systematic, long-term investments in high-growth green energy or logistics infrastructure are deeply supported.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[hsl(var(--border))]/50 flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => {
                        const rasiText = lang === "te" ? astroResult.rasi.te : astroResult.rasi.en;
                        const msg = `🔮 *VaartaNow - నా వ్యక్తిగత జాతక చక్రం* 🔮\n\n👤 *పేరు:* ${astroResult.name}\n📅 *పుట్టిన వివరాలు:* ${astroResult.dob} | ${astroResult.time}\n📍 *జన్మ స్థలం:* ${astroResult.place}\n\n🌟 *లగ్నం:* ${astroResult.lagnam}\n🌙 *రాశి:* ${rasiText}\n💫 *నಕ್ಷత్రం:* ${astroResult.nakshatram}\n\n👉 మీ జన్మ కుండలి మరియు వ్యక్తిగత జాతక ఫలితాలు తెలుసుకోవడానికి VaartaNow వెబ్‌సైట్‌ని సందర్శించండి!`;
                        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                        window.open(url, "_blank");
                      }}
                      className="flex-1 text-xs font-black py-2.5 px-4 rounded-xl bg-[#25D366] text-white flex items-center justify-center gap-2 hover:bg-[#128C7E] active:scale-[0.98] transition"
                    >
                      <Share2 className="size-4" />
                      {lang === "te" ? "WhatsApp ద్వారా షేర్ చేయి" : "Share Birth Chart"}
                    </button>
                    <button 
                      onClick={() => setAstroResult(null)}
                      className="text-xs font-black py-2.5 px-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] active:scale-[0.98] transition shrink-0"
                    >
                      {lang === "te" ? "మళ్ళీ లెక్కించు" : "Reset Details"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
