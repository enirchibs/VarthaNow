import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui";
import { categoryLabel } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import { useInfinitePosts } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";
import type { NewsCategory } from "@/types/news";
import { DevotionalHub } from "@/components/DevotionalHub";
import { ShortsReel } from "@/components/ShortsReel";
import { CricketLiveScoreHub } from "@/components/CricketLiveScoreHub";
import { HealthAssistant } from "@/components/HealthAssistant";
import { Check } from "lucide-react";

// 🏢 AP & Telangana Hyperlocal & Real Estate rates tool
function LocalInteractiveTool({ category, lang }: { category: string; lang: string }) {
  const [district, setDistrict] = useState("");
  const [showPincodeStatus, setShowPincodeStatus] = useState(false);
  const districts = category === "andhra-pradesh" 
    ? ["విశాఖపట్నం (Visakhapatnam)", "విజయవాడ (Vijayawada)", "గుంటూరు (Guntur)", "తిరుపతి (Tirupati)", "కర్నూలు (Kurnool)"]
    : ["హైదరాబాద్ (Hyderabad)", "వరంగల్ (Warangal)", "నిజామాబాద్ (Nizamabad)", "ఖమ్మం (Khammam)", "కరీంనగర్ (Karimnagar)"];
  
  const properties = category === "andhra-pradesh"
    ? [
        { area: "Madhurawada, Vizag", rate: "₹5,200/sq.ft", status: "↑ 4.2% up" },
        { area: "Gajuwaka, Vizag", rate: "₹4,100/sq.ft", status: "steady" },
        { area: "Benz Circle, Vijayawada", rate: "₹7,900/sq.ft", status: "↑ 6.5% up" }
      ]
    : [
        { area: "Madhapur, Hyderabad", rate: "₹9,800/sq.ft", status: "↑ 8.1% up" },
        { area: "Gachibowli, Hyderabad", rate: "₹10,500/sq.ft", status: "↑ 9.2% up" },
        { area: "Hanamkonda, Warangal", rate: "₹3,400/sq.ft", status: "steady" }
      ];

  return (
    <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
      <div>
        <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
          {lang === "te" ? "📍 మీ స్థానిక వార్తలు" : "📍 Local News Filter"}
        </h3>
        <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
          {lang === "te" ? "మీ జిల్లాను ఎంచుకుని వార్తలను ఫిల్టర్ చేయండి" : "Select your district to filter stories"}
        </p>
      </div>

      <div className="space-y-2">
        <select 
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setShowPincodeStatus(true);
            setTimeout(() => setShowPincodeStatus(false), 2000);
          }}
          className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          <option value="">-- {lang === "te" ? "జిల్లాను ఎంచుకోండి" : "Select District"} --</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {showPincodeStatus && (
          <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 animate-pulse text-center">
            ✓ {lang === "te" ? `${district} వార్తలు లోడ్ చేయబడ్డాయి!` : `${district} stories loaded!`}
          </div>
        )}
      </div>

      <div className="border-t border-[hsl(var(--border))]/70 pt-4 space-y-3">
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
            {lang === "te" ? "🏢 రియల్ ఎస్టేట్ ధరల ట్రెండ్స్" : "🏢 Local Property Rates"}
          </h3>
          <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
            {lang === "te" ? "ప్రధాన ప్రాంతాల్లో చదరపు అడుగు ధరలు" : "Average rates per sq.ft"}
          </p>
        </div>
        <div className="space-y-2">
          {properties.map((p) => (
            <div key={p.area} className="flex justify-between items-center text-xs font-bold border-b border-[hsl(var(--border))]/40 pb-2 last:border-0 last:pb-0">
              <span className="truncate max-w-[140px] text-[hsl(var(--foreground))]">{p.area}</span>
              <div className="text-right">
                <div className="font-black">{p.rate}</div>
                <div className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ⏳ Jobs & Careers countdown tracker & syllabus PDF
function JobsInteractiveTool({ lang }: { lang: string }) {
  const [qual, setQual] = useState("");
  const [seconds, setSeconds] = useState(86400 * 5 + 3600 * 4 + 60 * 12);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const jobMatches = qual === "10th" 
    ? [{ title: "AP Post Office GDS Recruiting", date: "Apply by 30th May" }, { title: "Indian Army Agniveer Rally", date: "Apply by 12th June" }]
    : qual === "Degree"
    ? [{ title: "APPSC Group 2 Notification", date: "Apply by 15th June" }, { title: "Bank PO / Clerk Positions", date: "Apply by 28th May" }]
    : qual === "B.Tech"
    ? [{ title: "TSPSC Assistant Engineer Jobs", date: "Apply by 10th June" }, { title: "DRDO Apprentice Recruitment", date: "Apply by 5th June" }]
    : [];

  return (
    <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
      <div>
        <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
          ⏳ దరఖాస్తు గడువు (Countdown)
        </h3>
        <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
          ముగిసే ప్రభుత్వ ఉద్యోగాల దరఖాస్తు సమయం
        </p>
      </div>

      <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-center">
        <div className="text-red-600 dark:text-red-500 text-lg font-black tracking-widest font-mono">
          {formatCountdown(seconds)}
        </div>
        <div className="text-[9px] font-extrabold text-neutral-500 mt-1 uppercase">
          APPSC Group 2 Application Ends
        </div>
      </div>

      <div className="border-t border-[hsl(var(--border))]/70 pt-4 space-y-3">
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
            🎯 మీ అర్హత బట్టి ఉద్యోగాలు
          </h3>
          <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
            ఉద్యోగ అవకాశాలను ఫిల్టర్ చేయండి
          </p>
        </div>

        <select 
          value={qual}
          onChange={(e) => setQual(e.target.value)}
          className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
        >
          <option value="">-- {lang === "te" ? "అర్హత ఎంచుకోండి" : "Select Qualification"} --</option>
          <option value="10th">10th Pass / Intermediate</option>
          <option value="Degree">Degree / MBA</option>
          <option value="B.Tech">B.Tech / MCA</option>
        </select>

        {qual && (
          <div className="space-y-2 bg-[hsl(var(--muted))]/40 p-2.5 rounded-xl border border-[hsl(var(--border))]/40">
            {jobMatches.map((j) => (
              <div key={j.title} className="text-[10px] font-extrabold border-b border-[hsl(var(--border))]/40 pb-1.5 last:border-0 last:pb-0">
                <div className="text-[hsl(var(--foreground))]">{j.title}</div>
                <div className="text-red-500 mt-0.5">{j.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[hsl(var(--border))]/70 pt-4 space-y-3">
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
            📚 సిలబస్ పిడిఎఫ్ డౌన్‌లోడ్
          </h3>
          <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
            ఉచితంగా పరీక్ష సిలబస్ పిడిఎఫ్ లు
          </p>
        </div>
        <div className="space-y-2">
          <button 
            onClick={() => alert("Downloading APPSC Group 2 Syllabus PDF...")}
            className="w-full text-left py-1.5 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 text-[10px] font-black tracking-wide transition flex items-center justify-between"
          >
            <span>📥 APPSC Group 2 Syllabus</span>
            <span className="text-[8px] bg-red-500/15 text-red-600 px-1.5 rounded-full font-black uppercase">PDF</span>
          </button>
          <button 
            onClick={() => alert("Downloading TSPSC Group 1 Syllabus PDF...")}
            className="w-full text-left py-1.5 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 text-[10px] font-black tracking-wide transition flex items-center justify-between"
          >
            <span>📥 TSPSC Group 1 Syllabus</span>
            <span className="text-[8px] bg-red-500/15 text-red-600 px-1.5 rounded-full font-black uppercase">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 🗳️ Politics daily interactive micro poll
function PoliticsInteractiveTool() {
  const [voted, setVoted] = useState(false);
  const [yesVotes, setYesVotes] = useState(64);
  const [noVotes, setNoVotes] = useState(36);

  const handleVote = (ans: "yes" | "no") => {
    if (voted) return;
    setVoted(true);
    if (ans === "yes") {
      setYesVotes((v) => v + 1);
    } else {
      setNoVotes((v) => v + 1);
    }
  };

  const total = yesVotes + noVotes;
  const yesPercent = Math.round((yesVotes / total) * 100);
  const noPercent = Math.round((noVotes / total) * 100);

  return (
    <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
      <div>
        <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
          🗳️ జన స్పందన (Micro Poll)
        </h3>
        <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
          నేటి రాజకీయ అంశాలపై మీ అభిప్రాయం చెప్పండి
        </p>
      </div>

      <div className="p-3 bg-[hsl(var(--muted))]/55 rounded-2xl space-y-3 border border-[hsl(var(--border))]/50">
        <div className="text-xs font-black leading-relaxed text-[hsl(var(--foreground))]">
          "ఉచిత ఆర్టీసీ బస్సు ప్రయాణ విధానం వల్ల ప్రభుత్వంపై ఆర్థిక భారం పెరుగుతోందని మీరు భావిస్తున్నారా?"
        </div>

        {!voted ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button 
              onClick={() => handleVote("yes")}
              className="py-2 rounded-xl bg-red-600 text-white font-black text-xs transition active:scale-95 shadow-sm shadow-red-500/10"
            >
              అవును (Yes)
            </button>
            <button 
              onClick={() => handleVote("no")}
              className="py-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-black text-xs transition active:scale-95"
            >
              కాదు (No)
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-black text-[10px] text-[hsl(var(--foreground))]">
                <span>అవును (Yes): {yesPercent}%</span>
                <span>{yesVotes} ఓట్లు</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${yesPercent}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-black text-[10px] text-[hsl(var(--foreground))]">
                <span>కాదు (No): {noPercent}%</span>
                <span>{noVotes} ఓట్లు</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                <div className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all duration-500" style={{ width: `${noPercent}%` }} />
              </div>
            </div>
            <div className="text-[9px] font-extrabold text-center text-emerald-600 dark:text-emerald-400 mt-2">
              ✓ మీ ఓటు విజయవంతంగా నమోదైంది!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 🌿 Health home remedies Ayurvedic search
function HealthInteractiveTool() {
  const [symptom, setSymptom] = useState("");
  const remedies: Record<string, { te: string; en: string }> = {
    cough: {
      te: "🌿 దగ్గు చిట్కా: వేడి నీటిలో కొద్దిగా తేనె, నిమ్మరసం కలుపుకుని రోజుకు రెండు సార్లు తాగండి. అలాగే మిరియాల పొడిని తేనెతో కలిపి తీసుకుంటే ఉపశమనం లభిస్తుంది.",
      en: "🌿 Cough Remedy: Mix a teaspoon of honey and fresh lemon juice in warm water. Alternatively, take black pepper powder mixed with honey for quick relief."
    },
    hairfall: {
      te: "🍃 జుట్టు రాలడం చిట్కా: కొబ్బరి నూనెలో ఉసిరి పొడి వేసి బాగా మరిగించి వారానికి రెండు సార్లు తలకు రాసుకోండి. అలోవెరా జెల్ రాయడం వల్ల జుట్టు బలంగా తయారవుతుంది.",
      en: "🍃 Hair Fall Remedy: Heat coconut oil with gooseberry (amla) powder and apply to your scalp twice a week. Fresh aloe vera gel also strengthens roots."
    },
    migraine: {
      te: "🌻 తలనొప్పి/మైగ్రేన్ చిట్కా: అల్లం టీ తాగడం వల్ల ఉపశమనం లభిస్తుంది. నుదుటిపై చల్లని గుడ్డతో కాపడం పెట్టండి. కాంతి తక్కువగా ఉన్న ప్రశాంతమైన గదిలో విశ్రాంతి తీసుకోండి.",
      en: "🌻 Migraine Remedy: Drink fresh ginger tea to reduce inflammation. Apply a cold compress to your forehead and rest in a dark, quiet room."
    },
    digestion: {
      te: "🥛 అజీర్ణం చిట్కా: భోజనం తర్వాత కొద్దిగా వాము లేదా జీలకర్ర నమలండి. గోరువెచ్చని నీటిలో కొద్దిగా సొంటి పొడి వేసి తాగడం వల్ల జీర్ణక్రియ మెరుగుపడుతుంది.",
      en: "🥛 Indigestion Remedy: Chew a pinch of carom seeds (ajwain) or cumin seeds after meals. Warm water mixed with dry ginger powder also aids digestion."
    }
  };

  return (
    <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
      <div>
        <h3 className="font-black text-sm uppercase tracking-wider text-red-600 dark:text-red-500">
          🌿 AI ఇంటి చిట్కాలు (Home Remedies)
        </h3>
        <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
          సాధారణ ఆరోగ్య సమస్యలకు ఆయుర్వేద చిట్కాలు
        </p>
      </div>

      <div className="space-y-3">
        <select 
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
        >
          <option value="">-- ఆరోగ్య సమస్యను ఎంచుకోండి --</option>
          <option value="cough">దగ్గు & జలుబు (Cough & Cold)</option>
          <option value="hairfall">జుట్టు రాలడం (Hair Fall)</option>
          <option value="migraine">తలనొప్పి & మైగ్రేన్ (Headache & Migraine)</option>
          <option value="digestion">అజీర్ణం & గ్యాస్ (Indigestion & Gas)</option>
        </select>

        {symptom && remedies[symptom] && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-[10px] font-extrabold leading-relaxed text-emerald-800 dark:text-emerald-400 animate-in fade-in duration-300">
            {remedies[symptom].te}
            <div className="border-t border-emerald-500/15 pt-2 mt-2 text-[9px] font-semibold text-neutral-500 dark:text-neutral-400">
              {remedies[symptom].en}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { category = "andhra-pradesh" } = useParams();
  const typedCategory = category as NewsCategory;
  const feed = useInfinitePosts({ category: typedCategory });
  const { lang } = useLanguage();
  const label = categoryLabel(category, lang);

  useEffect(() => {
    const titles: Record<string, string> = {
      te: `${label} వార్తలు - VarthaNow`,
      en: `${label} News - VarthaNow`,
      hi: `${label} समाचार - VarthaNow`,
      ta: `${label} செய்திகள் - VarthaNow`,
      kn: `${label} ಸುದ್ದಿ - VarthaNow`
    };
    const descriptions: Record<string, string> = {
      te: `${label} తాజా తెలుగు వార్తలు, AI రీరైట్ కథనాలు, SEO అప్డేట్స్.`,
      en: `Latest ${label} news, AI rewrite stories, and SEO updates.`,
      hi: `${label} के नवीनतम समाचार, एआई रीराइट कहानियां और एसईओ अपडेट।`,
      ta: `${label} முக்கிய செய்திகள், ஏஐ மூலம் உருவாக்கப்பட்ட கட்டுரைகள் மற்றும் எஸ்சிஓ தகவல்கள்.`,
      kn: `${label} ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು, ಎಐ ರೀರೈಟ್ ಕಥೆಗಳು ಮತ್ತು ಎಸ್‌ಇಓ ನವೀಕರಣಗಳು.`
    };
    setMeta({
      title: titles[lang] || titles.te,
      description: descriptions[lang] || descriptions.te,
      canonical: `/category/${category}`,
      structuredData: category === "health" ? {
        "@context": "https://schema.org",
        "@type": "HealthArticle",
        "headline": titles[lang] || titles.te,
        "description": descriptions[lang] || descriptions.te,
        "image": `${import.meta.env.VITE_SITE_URL ?? "http://localhost:3000"}/icons/icon-192.svg`,
        "author": {
          "@type": "Organization",
          "name": "VarthaNow AI Health Desk"
        },
        "publisher": {
          "@type": "Organization",
          "name": "VarthaNow",
          "logo": {
            "@type": "ImageObject",
            "url": `${import.meta.env.VITE_SITE_URL ?? "http://localhost:3000"}/icons/icon-192.svg`
          }
        },
        "about": {
          "@type": "MedicalCondition",
          "name": "General Health Information"
        },
        "mainEntityOfPage": `${import.meta.env.VITE_SITE_URL ?? "http://localhost:3000"}/category/health`
      } : undefined
    });
  }, [category, label, lang]);

  return (
    <main className="container-shell space-y-5 py-4">
      {/* Category banner */}
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h1 className="text-3xl font-black">{label}</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {lang === "te" && "Google News RSS నుంచి Gemini AI ద్వారా రూపొందించిన తాజా తెలుగు కథనాలు."}
          {lang === "en" && "Latest articles curated from Google News RSS and generated via Gemini AI."}
          {lang === "hi" && "गूगल न्यूज RSS से क्यूरेट और जेमिनी एआई द्वारा उत्पन्न नवीनतम समाचार।"}
          {lang === "ta" && "கூகுள் நியூஸ் ஆர்எஸ்எஸ் மூலம் தொகுக்கப்பட்டு ஜெமினி ஏஐ மூலம் உருவாக்கப்பட்ட முக்கிய செய்திகள்."}
          {lang === "kn" && "ಗೂಗಲ್ ನ್ಯೂಸ್ ಆರ್‌ಎಸ್‌ಎಸ್‌ನಿಂದ ಸಂಗ್ರಹಿಸಿ ಜೆಮಿನಿ ಎಐ ಮೂಲಕ ರಚಿಸಲಾದ ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು."}
        </p>
      </section>

      {category === "health" && <HealthAssistant />}

      {category === "devotional" && <DevotionalHub />}

      {category === "cricket" && <CricketLiveScoreHub />}

      {category === "viralshorts" && (
        <div className="space-y-4">
          <ShortsReel />
          <div className="border-t border-[hsl(var(--border))]/50 pt-5">
            <h2 className="text-xl font-black text-[hsl(var(--foreground))]">
              {lang === "te" && "ఇతర వైరల్ కథనాలు 📰"}
              {lang === "en" && "Related Viral Stories 📰"}
              {lang === "hi" && "अन्य वायरल खबरें 📰"}
              {lang === "ta" && "பிற வைரல் செய்திகள் 📰"}
              {lang === "kn" && "ಇತರ ವೈರల్ ಸುದ್ದಿಗಳು 📰"}
            </h2>
          </div>
        </div>
      )}

      {/* Double column grid representing Sidebar for competitive visual widgets */}
      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        {/* News Feed Cards column */}
        <div className="space-y-4">
          <NewsGrid posts={feed.posts} loading={feed.loading} />
          
          {feed.hasMore && (
            <div className="flex justify-center">
              <Button onClick={feed.loadMore} disabled={feed.loading}>
                {lang === "te" ? "మరిన్ని వార్తలు" : lang === "en" ? "More News" : lang === "hi" ? "और खबरें" : lang === "ta" ? "மேலும் செய்திகள்" : "ಹೆಚ್ಚಿನ ಸುದ್ದಿ"}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Widgets column */}
        <aside className="space-y-4">
          {/* AP or Telangana tools */}
          {(category === "andhra-pradesh" || category === "telangana") && (
            <LocalInteractiveTool category={category} lang={lang} />
          )}

          {/* Jobs tools */}
          {category === "jobs" && (
            <JobsInteractiveTool lang={lang} />
          )}

          {/* Politics tools */}
          {category === "politics" && (
            <PoliticsInteractiveTool />
          )}



          {/* Fallback standard AdSense block */}
          <div className="rounded-[1.4rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
            AdSense 300x250
          </div>
        </aside>
      </section>
    </main>
  );
}
