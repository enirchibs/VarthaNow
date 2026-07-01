import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Activity, 
  Search, 
  Sparkles, 
  BookOpen, 
  Flame, 
  AlertTriangle, 
  ChevronRight, 
  Utensils, 
  TrendingUp, 
  Users, 
  ShieldAlert,
  Play,
  Calculator,
  Compass,
  ArrowLeft,
  MessageSquare,
  Send,
  Droplet,
  Moon,
  Smile,
  Zap,
  Info
} from "lucide-react";

// =========================================================
// MOCK DATA & SCHEMAS
// =========================================================

interface Article {
  title: string;
  desc: string;
  image: string;
  readTime: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface DiseaseData {
  titleTe: string;
  titleEn: string;
  image: string;
  symptoms: string[];
  causes: string[];
  diagnosis: string[];
  treatments: string[];
  dietEat: string[];
  dietAvoid: string[];
  lifestyle: string[];
  traditional: string[];
  scientific: string;
  emergency: string[];
  faqs: FAQ[];
}

const DISEASES: Record<string, DiseaseData> = {
  fever: {
    titleTe: "జ్వరం",
    titleEn: "Fever",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
    symptoms: ["శరీర ఉష్ణోగ్రత పెరగడం", "చలి మరియు వణుకు", "తలనొప్పి", "కండరాల నొప్పులు", "అలసట"],
    causes: ["వైరల్ ఇన్ఫెక్షన్లు", "బ్యాక్టీరియా ఇన్ఫెక్షన్లు", "శరీరంలో వాపు (Inflammation)", "వ్యాధి నిరోధక ప్రతిచర్య"],
    diagnosis: ["థర్మామీటర్ రీడింగ్", "రక్త పరీక్షలు (Blood Tests)", "మూత్ర పరీక్షలు"],
    treatments: ["విశ్రాంతి తీసుకోవడం", "ఎక్కువ ద్రవాలు తాగడం", "పారాసిటమాల్ వంటి మందులు (వైద్యుల సలహాతో)"],
    dietEat: ["తేలికపాటి గంజి", "వెచ్చని సూప్‌లు", "కొబ్బరి నీళ్లు", "తాజా పండ్ల రసాలు"],
    dietAvoid: ["మసాలా ఆహారాలు", "నూనెలో వేయించిన పదార్థాలు", "చల్లటి పానీయాలు", "జీర్ణం కావడానికి కష్టమయ్యే బరువైన ఆహారం"],
    lifestyle: ["కనీసం 8 గంటల నిద్ర", "చల్లని గదిలో విశ్రాంతి", "శరీరాన్ని శుభ్రంగా ఉంచుకోవడం"],
    traditional: ["తులసి ఆకుల కషాయం తాగడం", "నుదిటిపై తడి గుడ్డ వేయడం", "అల్లం టీ తాగడం"],
    scientific: "Fever (pyrexia) is a temporary increase in body temperature, often due to an illness. It is a sign that your body's immune system is fighting off an infection.",
    emergency: ["శ్వాస తీసుకోవడంలో ఇబ్బంది", "తీవ్రమైన తలనొప్పి మరియు మెడ పట్టేయడం", "మూర్ఛ రావడం", "103°F కన్నా ఎక్కువ జ్వరం"],
    faqs: [
      { q: "జ్వరం ఉన్నప్పుడు స్నానం చేయవచ్చా?", a: "అవును, గోరువెచ్చని నీటితో స్నానం చేయవచ్చు. ఇది శరీర ఉష్ణోగ్రతను తగ్గించడంలో సహాయపడుతుంది." },
      { q: "యాంటీబయాటిక్స్ ఎప్పుడు వాడాలి?", a: "బ్యాక్టీరియా వల్ల జ్వరం వచ్చినట్లు వైద్యులు నిర్ధారించినప్పుడు మాత్రమే యాంటీబయాటిక్స్ వాడాలి." }
    ]
  },
  gas: {
    titleTe: "గ్యాస్ సమస్య",
    titleEn: "Acidity & Gas",
    image: "https://images.unsplash.com/photo-1515442261904-6c3f72f03ded?auto=format&fit=crop&w=800&q=80",
    symptoms: ["కడుపు ఉబ్బరం", "తేన్పులు రావడం", "కడుపులో మంట", "కడుపు నొప్పి"],
    causes: ["వేగంగా తినడం", "మసాలా ఆహారాలు అధికంగా తీసుకోవడం", "కార్బోనేటేడ్ డ్రింక్స్", "జీర్ణక్రియ మందగించడం"],
    diagnosis: ["వైద్యుల క్లినికల్ పరీక్ష", "అల్ట్రాసౌండ్ అవసరమైతే"],
    treatments: ["ఆహార అలవాట్లు మార్చుకోవడం", "యాంటాసిడ్లు వాడటం", "క్రమం తప్పకుండా నడవడం"],
    dietEat: ["మజ్జిగ", "లస్సీ", "అరటిపండు", "పుదీనా రసం", "జీలకర్ర నీరు"],
    dietAvoid: ["మసాలా వంటకాలు", "ఫాస్ట్ ఫుడ్", "క్యాబేజీ, బఠానీలు వంటి గ్యాస్ కలిగించే కూరగాయలు", "కాఫీ, టీలు"],
    lifestyle: ["ఆహారాన్ని నమిలి తినడం", "భోజనం చేసిన వెంటనే పడుకోకపోవడం", "రోజూ వ్యాయామం చేయడం"],
    traditional: ["భోజనం తర్వాత సోంపు నమలడం", "గోరువెచ్చని నీటిలో కొద్దిగా వాము వేసుకుని తాగడం"],
    scientific: "Intestinal gas is a natural byproduct of digestion. Excessive accumulation of gas is usually related to dietary habits, swallowed air, or fermentation of food by gut bacteria.",
    emergency: ["తీవ్రమైన మరియు నిరంతర కడుపు నొప్పి", "రక్త వాంతులు లేదా నల్లటి మలం", "కారణం లేని బరువు తగ్గడం"],
    faqs: [
      { q: "గ్యాస్ గుండె నొప్పా ఎలా గుర్తించాలి?", a: "గుండె నొప్పి ఛాతీ మధ్యలో ఒత్తిడితో పాటు ఎడమ చేతికి వ్యాపిస్తుంది. గ్యాస్ నొప్పి సాధారణంగా పొట్ట పైభాగంలో ఉండి తేన్పులతో తగ్గుతుంది. అనుమానంగా ఉంటే వెంటనే ఈసీజీ చేయించుకోవాలి." }
    ]
  }
};

interface RemedyData {
  nameTe: string;
  nameEn: string;
  image: string;
  traditionalUse: string;
  benefits: string[];
  evidence: "High" | "Moderate" | "Limited";
  avoidWho: string[];
  consultDoctor: string;
}

const REMEDIES: Record<string, RemedyData> = {
  turmeric: {
    nameTe: "పసుపు (Turmeric)",
    nameEn: "Turmeric",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    traditionalUse: "శరీరంలో రోగ నిరోధక శక్తి పెంచడానికి, గాయాలు తగ్గించడానికి మరియు చర్మ సౌందర్యానికి సంప్రదాయబద్ధంగా పసుపును వాడుతారు.",
    benefits: ["యాంటీ ఇన్‌ఫ్లమేటరీ లక్షణాలు కలిగి ఉండడం", "యాంటీ ఆక్సిడెంట్లు పుష్కలంగా ఉండడం", "జీర్ణక్రియను మెరుగుపరచడం"],
    evidence: "High",
    avoidWho: ["పిత్తాశయ సమస్యలు (Gallstones) ఉన్నవారు", "రక్తం పలచబడే మందులు వాడేవారు"],
    consultDoctor: "శస్త్రచికిత్స జరగడానికి 2 వారాల ముందు పసుపు సప్లిమెంట్లను వాడటం ఆపాలి."
  },
  ginger: {
    nameTe: "అల్లం (Ginger)",
    nameEn: "Ginger",
    image: "https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=800&q=80",
    traditionalUse: "వాంతులు, వికారం, జలుబు, మరియు దగ్గు నివారణకు అల్లం టీ లేదా అల్లం రసాన్ని విస్తృతంగా ఉపయోగిస్తారు.",
    benefits: ["వికారం మరియు ప్రయాణ బడలిక తగ్గించడం", "కండరాల నొప్పులు ఉపశమింపచేయడం", "రక్తంలో చక్కెర స్థాయిలను క్రమబద్ధీకరించడం"],
    evidence: "High",
    avoidWho: ["తీవ్రమైన ఎసిడిటీ ఉన్నవారు", "గర్భిణీలు అధిక మోతాదులో తీసుకోకూడదు"],
    consultDoctor: "వికారం లేదా విరేచనాలు 2 రోజులకు మించి తగ్గకపోతే వైద్యుడిని సంప్రదించండి."
  }
};

export function HealthPortal() {
  const { subpage } = useParams<{ subpage?: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useState("te");

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiChat, setAiChat] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "నమస్కారం! నేను మీ VaartaNow AI ఆరోగ్య సహాయకుడిని. మీకు ఎలాంటి ఆరోగ్య సమాచారం కావాలి?" }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Health Calculators states
  const [bmiHeight, setBmiHeight] = useState("170");
  const [bmiWeight, setBmiWeight] = useState("70");
  const [bmiResult, setBmiResult] = useState<string | null>(null);

  const [waterWeight, setWaterWeight] = useState("70");
  const [waterResult, setWaterResult] = useState<string | null>(null);

  const [ovulationCycle, setOvulationCycle] = useState("28");
  const [ovulationDate, setOvulationDate] = useState("2026-07-02");
  const [ovulationResult, setOvulationResult] = useState<string | null>(null);

  // Sync / Search Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = Object.entries(DISEASES).filter(([key, d]) => 
      key.includes(q) || 
      d.titleEn.toLowerCase().includes(q) || 
      d.titleTe.includes(q)
    ).map(([key, d]) => ({ key, ...d }));
    setSearchResults(matches);
  }, [searchQuery]);

  // AI assistant engine
  const handleAiSend = (textToSend?: string) => {
    const queryText = textToSend || aiQuery;
    if (!queryText.trim()) return;

    setAiChat(prev => [...prev, { sender: "user", text: queryText }]);
    if (!textToSend) setAiQuery("");
    setIsAiLoading(true);

    setTimeout(() => {
      let reply = "క్షమించండి, మీ ప్రశ్నకు సరిగ్గా సమాధానం కనుగొనలేకపోయాను. దయచేసి తీవ్రమైన సమస్యలకు డాక్టర్ వద్దకు వెళ్ళండి.";
      const q = queryText.toLowerCase();

      if (q.includes("fever") || q.includes("జ్వరం") || q.includes("cold") || q.includes("జలుబు")) {
        reply = "జ్వరం లేదా జలుబు సాధారణంగా వైరల్ ఇన్ఫెక్షన్ల వల్ల వస్తుంది. \n\n*లక్షణాలు:* పెరిగిన ఉష్ణోగ్రత, కండరాల నొప్పి, అలసట. \n*తీసుకోవాల్సిన జాగ్రత్తలు:* రోజంతా గోరువెచ్చని నీరు మరియు కొబ్బరి నీళ్లు తాగండి. తేలికైన గంజి ఆహారంగా తీసుకోండి. పారాసిటమాల్ 650mg వేసుకోవచ్చు. \n\n⚠ *హెచ్చరిక:* ఒకవేళ శ్వాస తీసుకోవడం ఇబ్బందిగా మారితే వెంటనే డాక్టర్‌ను కలవండి.";
      } else if (q.includes("gas") || q.includes("గ్యాస్") || q.includes("acidity")) {
        reply = "గ్యాస్ మరియు కడుపు ఉబ్బరం అధిక మసాలా వంటకాలు లేదా జీర్ణ వ్యవస్థ లోపాల వల్ల సంభవించవచ్చు. \n\n*చిట్కాలు:* ఒక గ్లాసు చల్లటి మజ్జిగ తాగడం లేదా కొద్దిగా సోంపు గింజలు నమలడం ద్వారా తక్షణ ఉపశమనం లభిస్తుంది. రాత్రి సమయంలో తేలికపాటి భోజనం చేయండి. \n\n⚠ *గమనిక:* చాతిలో విపరీతమైన మంట మరియు ఎడమ చేయి లాగడం లాంటి లక్షణాలు ఉంటే వెంటనే గుండె పరీక్ష చేయించుకోండి.";
      } else if (q.includes("cough") || q.includes("దగ్గు")) {
        reply = "దగ్గు గొంతు అలర్జీ లేదా ఇన్ఫెక్షన్ వల్ల వస్తుంది. \n\n*చిట్కాలు:* గోరువెచ్చని నీటిలో తేనె కలుపుకుని తాగడం లేదా తులసి రసం తాగడం గొంతుకు ఉపశమనం ఇస్తుంది. \n\n⚠ *హెచ్చరిక:* దగ్గు 2 వారాల కంటే ఎక్కువ ఉంటే క్షయ పరీక్ష చేయించుకోవడం అవసరం.";
      }

      setAiChat(prev => [...prev, { sender: "ai", text: reply }]);
      setIsAiLoading(false);
    }, 1200);
  };

  // Calculator Logic
  const calcBMI = () => {
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (!h || !w) return;
    const bmi = w / (h * h);
    let category = lang === "te" ? "సాధారణ బరువు" : "Normal Weight";
    if (bmi < 18.5) category = lang === "te" ? "తక్కువ బరువు" : "Underweight";
    else if (bmi >= 25 && bmi < 29.9) category = lang === "te" ? "అధిక బరువు" : "Overweight";
    else if (bmi >= 30) category = lang === "te" ? "స్థూలకాయం" : "Obese";
    
    setBmiResult(`${bmi.toFixed(1)} (${category})`);
  };

  const calcWater = () => {
    const w = parseFloat(waterWeight);
    if (!w) return;
    const lit = (w * 0.033).toFixed(1);
    setWaterResult(lang === "te" ? `ప్రతిరోజూ ${lit} లీటర్ల నీరు తాగాలి.` : `Should drink ${lit} Liters of water daily.`);
  };

  const calcOvulation = () => {
    if (!ovulationDate) return;
    const cycle = parseInt(ovulationCycle);
    const date = new Date(ovulationDate);
    // Ovulation occurs roughly 14 days before the next period
    // Safe estimate for fertile window is cycle - 14 and surrounding 4 days
    const nextPeriodDate = new Date(date.getTime() + cycle * 24 * 60 * 60 * 1000);
    const ovulationEst = new Date(nextPeriodDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    setOvulationResult(lang === "te" 
      ? `మీ అత్యంత సారవంతమైన విండో: ${ovulationEst.toLocaleDateString("te-IN")}` 
      : `Your highly fertile window: ${ovulationEst.toLocaleDateString("en-US")}`
    );
  };

  const isTe = lang === "te";

  // RENDER DYNAMIC DISEASE PAGE
  if (subpage && DISEASES[subpage]) {
    const d = DISEASES[subpage];
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <button 
            onClick={() => navigate("/health")}
            className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 active:scale-95 transition"
          >
            <ArrowLeft className="size-4" />
            {isTe ? "ఆరోగ్య కేంద్రానికి తిరిగి వెళ్ళండి" : "Back to Health Hub"}
          </button>

          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-21/9 min-h-[220px]">
            <img src={d.image} alt={d.titleEn} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 sm:p-8">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white">{d.titleTe} ({d.titleEn})</h1>
                <p className="text-white/80 text-xs sm:text-sm font-bold mt-2">{isTe ? "VaartaNow AI సమాచారం" : "VaartaNow AI Medical Information"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Content Area */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Scientific info */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-6 rounded-2xl shadow-sm space-y-3">
                <h2 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                  <Info className="size-5" />
                  {isTe ? "శాస్త్రీయ సమాచారం" : "Scientific Information"}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">{d.scientific}</p>
              </div>

              {/* Symptoms */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-6 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-base font-black text-[hsl(var(--foreground))]">{isTe ? "లక్షణాలు (Symptoms)" : "Symptoms"}</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm font-bold text-[hsl(var(--muted-foreground))]">
                  {d.symptoms.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              {/* Causes */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-6 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-base font-black text-[hsl(var(--foreground))]">{isTe ? "కారణాలు (Causes)" : "Causes"}</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm font-bold text-[hsl(var(--muted-foreground))]">
                  {d.causes.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              {/* Diet and remedies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-sm text-emerald-700">{isTe ? "తినాల్సిన ఆహారాలు" : "Foods to Eat"}</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                    {d.dietEat.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-sm text-red-700">{isTe ? "తినకూడని ఆహారాలు" : "Foods to Avoid"}</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                    {d.dietAvoid.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
              </div>

              {/* Traditional Remedies & Ayurvedic Concepts */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-base font-black text-amber-700 flex items-center gap-1.5">
                  <Compass className="size-5" />
                  {isTe ? "సంప్రదాయ గృహ వైద్యం & ఆయుర్వేద పద్ధతులు" : "Traditional Remedies & Ayurvedic Concepts"}
                </h3>
                <span className="inline-block text-[9px] bg-amber-500/10 text-amber-700 font-extrabold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider mb-2">
                  {isTe ? "సంప్రదాయ పద్ధతి మాత్రమే" : "Traditional Wellness Practice"}
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm font-bold text-[hsl(var(--muted-foreground))]">
                  {d.traditional.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              {/* Warning signs */}
              <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-base font-black text-red-600 flex items-center gap-2">
                  <AlertTriangle className="size-5 animate-pulse" />
                  {isTe ? "ఎప్పుడు డాక్టర్‌ను సంప్రదించాలి?" : "Emergency Warning Signs"}
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm font-bold text-[hsl(var(--muted-foreground))]">
                  {d.emergency.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

            </div>

            {/* Right Sidebar Area: AI Assistant */}
            <div className="space-y-6">
              
              {/* AI Chat Box */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
                <div className="bg-emerald-600 px-4 py-3 flex items-center gap-2">
                  <Sparkles className="size-4.5 text-white animate-pulse" />
                  <span className="text-xs font-black text-white">{isTe ? "AI ఆరోగ్య సహాయకుడు" : "AI Health Assistant"}</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-normal">
                  {aiChat.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 font-bold ${
                        msg.sender === "user" 
                          ? "bg-emerald-600 text-white" 
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                      }`}>
                        {msg.text.split("\n").map((t, i) => <p key={i} className="mt-0.5">{t}</p>)}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <span className="text-[10px] text-emerald-600 font-bold animate-pulse">Typing info...</span>
                    </div>
                  )}
                </div>

                {/* Pre-fill query suggestions */}
                <div className="px-4 py-2 border-t border-[hsl(var(--border))]/40 flex flex-wrap gap-1.5 bg-[hsl(var(--muted))]/10">
                  <button 
                    onClick={() => handleAiSend(isTe ? `నాకు ${d.titleTe} ఉంది` : `I have ${d.titleEn}`)}
                    className="text-[9px] font-bold bg-emerald-500/10 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-500/20 active:scale-95 transition"
                  >
                    {isTe ? `నాకు ${d.titleTe} ఉంది` : `I have ${d.titleEn}`}
                  </button>
                  <button 
                    onClick={() => handleAiSend(isTe ? "వైద్యుడిని ఎప్పుడు కలవాలి?" : "When should I see a doctor?")}
                    className="text-[9px] font-bold bg-emerald-500/10 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-500/20 active:scale-95 transition"
                  >
                    {isTe ? "ఎప్పుడు డాక్టర్‌ని కలవాలి?" : "When to see a Doctor?"}
                  </button>
                </div>

                <div className="p-3 border-t border-[hsl(var(--border))]/40 flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiSend()}
                    placeholder={isTe ? "మీ ఆరోగ్య సందేహం అడగండి..." : "Ask your health query..."}
                    className="flex-1 text-xs font-bold px-3 py-2 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--input))] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button 
                    onClick={() => handleAiSend()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white size-8 flex items-center justify-center rounded-xl transition shrink-0"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-2 text-[10px] text-amber-800 leading-normal font-bold">
                <h5 className="font-extrabold flex items-center gap-1">
                  <ShieldAlert className="size-4 shrink-0 text-amber-700" />
                  {isTe ? "ముఖ్యమైన నిరాకరణ (Disclaimer)" : "Medical Disclaimer"}
                </h5>
                <p>
                  {isTe 
                    ? "ఈ సమాచారం కేవలం విద్యా ప్రయోజనాల కోసం మాత్రమే. సంప్రదాయ గృహ చిట్కాలు లేదా ఆయుర్వేద పద్ధతులు వైద్య నిర్ధారణకు లేదా ప్రొఫెషనల్ వైద్య సలహాకు ప్రత్యామ్నాయం కావు. తీవ్రమైన లేదా అత్యవసర పరిస్థితుల్లో వెంటనే అర్హత కలిగిన డాక్టర్‌ను సంప్రదించండి."
                    : "This content is purely educational. Traditional home remedies or Ayurvedic wellness guidelines do not constitute medical diagnosis or therapy. Always consult a qualified physician for severe or lingering symptoms."
                  }
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // RENDER DYNAMIC REMEDY PAGE
  if (subpage && REMEDIES[subpage]) {
    const r = REMEDIES[subpage];
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <button 
            onClick={() => navigate("/health")}
            className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 active:scale-95 transition"
          >
            <ArrowLeft className="size-4" />
            {isTe ? "వంటింటి చిట్కాలకు తిరిగి వెళ్ళండి" : "Back to Kitchen Remedies"}
          </button>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src={r.image} alt={r.nameEn} className="w-full h-full object-cover min-h-[250px]" />
            
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-600">{r.nameTe}</h1>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border mt-2 uppercase tracking-wider ${
                  r.evidence === "High" 
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                }`}>
                  {isTe ? `శాస్త్రీయ ఆధారాల స్థాయి: ${r.evidence}` : `Scientific Evidence: ${r.evidence}`}
                </span>
                <p className="text-xs sm:text-sm font-bold text-[hsl(var(--muted-foreground))] leading-relaxed mt-4">{r.traditionalUse}</p>
              </div>

              <div className="space-y-2 border-t border-[hsl(var(--border))]/40 pt-4 text-xs font-bold">
                <p className="text-emerald-700"><span className="font-extrabold">{isTe ? "లాభాలు:" : "Benefits:"}</span> {r.benefits.join(", ")}</p>
                <p className="text-red-700"><span className="font-extrabold">{isTe ? "ఎవరు దూరంగా ఉండాలి:" : "Avoid if:"}</span> {r.avoidWho.join(", ")}</p>
                <p className="text-[hsl(var(--muted-foreground))]"><span className="font-extrabold">{isTe ? "డాక్టర్ సలహా:" : "Doctor Advice:"}</span> {r.consultDoctor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER HUB HOMEPAGE
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans relative overflow-hidden">
      
      {/* Dynamic language selector */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => setLang("te")}
          className={`text-[10px] font-black px-2.5 py-1.5 rounded-full border transition ${
            lang === "te" ? "bg-emerald-600 text-white border-transparent" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent"
          }`}
        >
          తెలుగు
        </button>
        <button 
          onClick={() => setLang("en")}
          className={`text-[10px] font-black px-2.5 py-1.5 rounded-full border transition ${
            lang === "en" ? "bg-emerald-600 text-white border-transparent" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent"
          }`}
        >
          English
        </button>
      </div>

      {/* Hero Banner Section */}
      <section className="relative min-h-[420px] bg-gradient-to-br from-emerald-950 via-teal-900 to-[hsl(var(--background))] flex items-center py-20 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden">
        {/* Glow vector backdrops */}
        <div className="absolute top-[-10%] left-[-10%] size-[360px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[360px] rounded-full bg-teal-500/10 blur-3xl" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-wider animate-fadeIn">
            <Heart className="size-3.5 text-emerald-400 animate-pulse" />
            VaartaNow AI Health Hub
          </span>
          
          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            {isTe ? "సహజంగా ఆరోగ్యంగా ఉండాలా?" : "Live Naturally Healthy & Strong"}
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-xs sm:text-base font-bold leading-relaxed">
            {isTe 
              ? "రోజూ వంటింట్లో ఉన్న పదార్థాలతో మీ ఆరోగ్యాన్ని కాపాడుకోండి. AI సహాయంతో నిమిషాల్లో ఆరోగ్య సలహాలను పొందండి."
              : "Discover evidence-based traditional wellness secrets and get dynamic answers from our AI Health assistant."
            }
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTe ? "జ్వరం, జలుబు, అసిడిటీ లేదా వంటింటి చిట్కాలు వెతకండి..." : "Search Fever, Cold, Acidity, or Remedies..."}
              className="w-full text-xs font-bold pl-11 pr-4 py-3.5 rounded-2xl border border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 size-4.5" />
            
            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-lg max-h-56 overflow-y-auto no-scrollbar">
                {searchResults.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/health/${item.key}`}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition border-b border-[hsl(var(--border))]/40 hover:bg-emerald-500/10 text-left text-xs font-bold text-[hsl(var(--foreground))]"
                  >
                    <Activity className="size-4 text-emerald-600 shrink-0" />
                    <div>
                      <p>{lang === "te" ? item.titleTe : item.titleEn}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Science backed medicine facts</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[hsl(var(--foreground))]">{isTe ? "ఆరోగ్య వర్గాలు" : "Main Health Categories"}</h2>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{isTe ? "ప్రతి రోగానికి సంబంధించిన పూర్తి సమాచారం కనుగొనండి" : "Explore evidence-based health directories"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(DISEASES).map(([key, d]) => (
            <Link
              to={`/health/${key}`}
              key={key}
              className="group bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 rounded-2xl overflow-hidden hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <div className="relative aspect-video">
                <img src={d.image} alt={d.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white text-xs font-black">{isTe ? d.titleTe : d.titleEn}</p>
                </div>
              </div>
              <div className="p-4 space-y-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                <p className="truncate">Symptoms: {d.symptoms.join(", ")}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold uppercase">
                  <span>Explore disease info</span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Kitchen Remedies Section */}
      <section className="py-12 bg-[hsl(var(--muted))]/10 border-t border-b border-[hsl(var(--border))]/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-emerald-600 flex items-center justify-center gap-2">
              <Utensils className="size-6 text-emerald-600" />
              {isTe ? "వంటింటి చిట్కాలు" : "Kitchen Remedies"}
            </h2>
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{isTe ? "మన వంటింట్లో లభించే ఔషధ గుణాలున్న వస్తువుల ఉపయోగాలు" : "Evidence levels & traditional benefits of kitchen items"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(REMEDIES).map(([key, r]) => (
              <Link
                to={`/health/${key}`}
                key={key}
                className="flex flex-col sm:flex-row gap-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-4 rounded-2xl hover:shadow-md transition active:scale-[0.99]"
              >
                <img src={r.image} alt={r.nameEn} className="w-full sm:w-32 aspect-video sm:aspect-square object-cover rounded-xl" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm font-black text-[hsl(var(--foreground))]">{isTe ? r.nameTe : r.nameEn}</h3>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold leading-relaxed line-clamp-2 mt-2">{r.traditionalUse}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/40 pt-3 text-[10px] font-black text-emerald-600">
                    <span>Evidence: {r.evidence}</span>
                    <span className="flex items-center gap-0.5">Read details <ChevronRight className="size-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wellness Hub Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-teal-700 flex items-center justify-center gap-2">
            <Compass className="size-6" />
            {isTe ? "సహజమైన జీవన శైలి (Natural Wellness)" : "Natural Wellness"}
          </h2>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{isTe ? "ఆరోగ్యకరమైన అలవాట్లతో సమతుల్య జీవనం" : "Balance your body & mind with simple wellness pillars"}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
            <Droplet className="size-8 text-blue-500 animate-bounce" />
            <h4 className="text-xs font-black">{isTe ? "హైడ్రేషన్ (Hydration)" : "Hydration"}</h4>
            <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">Keep drinking water daily</p>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
            <Moon className="size-8 text-indigo-500" />
            <h4 className="text-xs font-black">{isTe ? "నిద్ర (Sleep)" : "Sleep"}</h4>
            <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">7-8 hours quality sleep</p>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
            <Smile className="size-8 text-amber-500" />
            <h4 className="text-xs font-black">{isTe ? "ధ్యానం (Meditation)" : "Meditation"}</h4>
            <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">Calm down stress levels</p>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
            <Zap className="size-8 text-emerald-500" />
            <h4 className="text-xs font-black">{isTe ? "యోగా (Yoga)" : "Yoga"}</h4>
            <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">Stretching & flexibility</p>
          </div>
        </div>
      </section>

      {/* Interactive Calculators Section */}
      <section className="py-12 bg-emerald-950/5 border-t border-b border-[hsl(var(--border))]/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-emerald-700 flex items-center justify-center gap-2">
              <Calculator className="size-6 text-emerald-600" />
              {isTe ? "ఆరోగ్య కాలిక్యులేటర్లు" : "Health Calculators"}
            </h2>
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{isTe ? "మీ శారీరక కొలతలతో నిమిషాల్లో ఆరోగ్య స్థితిని సరిచూసుకోండి" : "Verify body indexes instantly with tools"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Calculator 1: BMI */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider">{isTe ? "బి.ఎమ్.ఐ (BMI) కాలిక్యులేటర్" : "BMI Calculator"}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] block">{isTe ? "ఎత్తు (cm)" : "Height (cm)"}</label>
                  <input 
                    type="number" 
                    value={bmiHeight} 
                    onChange={(e) => setBmiHeight(e.target.value)} 
                    className="w-full px-2.5 py-1.5 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] block">{isTe ? "బరువు (kg)" : "Weight (kg)"}</label>
                  <input 
                    type="number" 
                    value={bmiWeight} 
                    onChange={(e) => setBmiWeight(e.target.value)} 
                    className="w-full px-2.5 py-1.5 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))]"
                  />
                </div>
              </div>
              <button 
                onClick={calcBMI}
                className="w-full text-xs font-black py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition"
              >
                {isTe ? "లెక్కించు" : "Calculate"}
              </button>
              {bmiResult && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 text-center">
                  Result: {bmiResult}
                </div>
              )}
            </div>

            {/* Calculator 2: Water Intake */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider">{isTe ? "నీటి వినియోగం కాలిక్యులేటర్" : "Water Intake Calculator"}</h3>
              <div className="space-y-1 text-xs font-bold">
                <label className="text-[10px] text-[hsl(var(--muted-foreground))] block">{isTe ? "మీ బరువు (kg)" : "Your Weight (kg)"}</label>
                <input 
                  type="number" 
                  value={waterWeight} 
                  onChange={(e) => setWaterWeight(e.target.value)} 
                  className="w-full px-2.5 py-1.5 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))]"
                />
              </div>
              <button 
                onClick={calcWater}
                className="w-full text-xs font-black py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition"
              >
                {isTe ? "లెక్కించు" : "Calculate"}
              </button>
              {waterResult && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 text-center">
                  {waterResult}
                </div>
              )}
            </div>

            {/* Calculator 3: Ovulation / Fertility */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider">{isTe ? "సంతానోత్పత్తి విండో (Fertility Calculator)" : "Fertility Calculator"}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] block">{isTe ? "చక్రం (రోజులు)" : "Cycle length (Days)"}</label>
                  <input 
                    type="number" 
                    value={ovulationCycle} 
                    onChange={(e) => setOvulationCycle(e.target.value)} 
                    className="w-full px-2.5 py-1.5 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] block">{isTe ? "చివరి పీరియడ్ తేదీ" : "Last Period Date"}</label>
                  <input 
                    type="date" 
                    value={ovulationDate} 
                    onChange={(e) => setOvulationDate(e.target.value)} 
                    className="w-full px-2.5 py-1.5 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--input))]"
                  />
                </div>
              </div>
              <button 
                onClick={calcOvulation}
                className="w-full text-xs font-black py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition"
              >
                {isTe ? "సారవంతమైన తేదీ కనుగొనండి" : "Calculate"}
              </button>
              {ovulationResult && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 text-center">
                  {ovulationResult}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[hsl(var(--foreground))]">{isTe ? "వైద్యుల సలహాలు & వీడియోలు" : "Doctor Advice & Health Videos"}</h2>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{isTe ? "నిపుణులైన డాక్టర్ల సమాచారం వీక్షించండి" : "Watch informative wellness lessons"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <Play className="size-12 text-white/80 hover:text-white transition cursor-pointer" />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">3:42</span>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-xs font-black leading-snug">{isTe ? "వైరల్ జ్వరం వచ్చినప్పుడు తీసుకోవాల్సిన జాగ్రత్తలు" : "Fever & Cold Self Care Precautions"}</h4>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold">Dr. K. Srinivas (General Physician)</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <Play className="size-12 text-white/80 hover:text-white transition cursor-pointer" />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">5:15</span>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-xs font-black leading-snug">{isTe ? "అల్లం మరియు పసుపుతో గ్యాస్ సమస్యలకు నివారణ" : "Curing Acid Reflux with Kitchen Remedies"}</h4>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold">Ayurveda Acharya Swamy</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <Play className="size-12 text-white/80 hover:text-white transition cursor-pointer" />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">6:00</span>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-xs font-black leading-snug">{isTe ? "పీసీఓఎస్ (PCOS) మరియు సంతానోత్పత్తి సమస్యలు" : "Understanding PCOS & Fertility Cycles"}</h4>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold">Dr. Anjali Verma (Gynecologist & IVF Expert)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Disclaimer Banner */}
      <section className="bg-amber-500/5 border-t border-amber-500/20 py-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3 font-bold">
          <h4 className="text-xs font-extrabold text-amber-700 uppercase tracking-widest">{isTe ? "ఆరోగ్య నిరాకరణ (Medical Disclaimer)" : "Important Health Disclaimer"}</h4>
          <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            {isTe 
              ? "ఈ సైట్ లో ఇవ్వబడిన చిట్కాలు, వంటింటి చిట్కాలు మరియు సమాచారం కేవలం విద్యా ప్రయోజనాల కోసం మాత్రమే. ఇది వృత్తిపరమైన వైద్య సహాయానికి ప్రత్యామ్నాయం కాదు. ఏదైనా గృహ వైద్యం పాటించే ముందు లేదా తీవ్రమైన రోగ లక్షణాలు ఉన్నప్పుడు తప్పనిసరిగా డాక్టర్ ను సంప్రదించండి."
              : "All content, traditional remedies, and wellness details provided on this platform are for general informational purposes only. Never delay seeking professional medical treatment due to information read here."
            }
          </p>
        </div>
      </section>

    </div>
  );
}
