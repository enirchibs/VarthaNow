import React, { useState } from "react";
import { 
  Search, 
  Mic, 
  MicOff, 
  Flame, 
  Sparkles, 
  Smartphone, 
  Headphones, 
  Backpack, 
  Tractor, 
  Home, 
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { speechService, type SpeechRecognitionResult } from "@/lib/speech-service";

interface DealsFirstScreenProps {
  onSearch: (query: string, maxPrice?: number) => void;
  onSelectBudget: (budget: number) => void;
  onSelectCollection: (category: string, maxPrice?: number) => void;
}

const BUDGET_PILLS = [
  { label: "₹250 లోపు", value: 250 },
  { label: "₹500 లోపు", value: 500 },
  { label: "₹1,000 లోపు", value: 1000 },
  { label: "₹2,500 లోపు", value: 2500 },
  { label: "₹5,000 లోపు", value: 5000 },
  { label: "₹10,000 లోపు", value: 10000 }
];

export const DealsFirstScreen: React.FC<DealsFirstScreenProps> = ({
  onSearch,
  onSelectBudget,
  onSelectCollection
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert("మీ బ్రౌజర్‌లో మైక్రోఫోన్ సౌకర్యం అందుబాటులో లేదు. దయచేసి టైప్ చేయండి.");
      return;
    }

    setIsListening(true);
    speechService.startListening(
      "te-IN",
      (result: SpeechRecognitionResult) => {
        if (result.transcript && result.transcript.trim()) {
          setSearchInput(result.transcript);
          if (result.isFinal) {
            setIsListening(false);
            onSearch(result.transcript);
          }
        }
      },
      (error) => {
        console.warn("Voice search error:", error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const budgetNum = customBudget ? parseInt(customBudget, 10) : undefined;
      onSearch(searchInput.trim(), budgetNum);
    }
  };

  const handleApplyCustomBudget = () => {
    const val = parseInt(customBudget, 10);
    if (val && val > 0) {
      onSelectBudget(val);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. Welcoming Hero Greeting */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200 text-xs sm:text-sm font-black mb-3">
          <Flame className="size-4 text-orange-600 fill-orange-600" />
          <span>మన అడ్డా డీల్స్ • తక్కువ ధరలో మంచి డీల్</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
          ఏం కొనాలనుకుంటున్నారు?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-semibold text-xs sm:text-base max-w-lg mx-auto">
          మీకు కావాల్సిన వస్తువు పేరు చెప్పండి లేదా మీ బడ్జెట్ ఎంచుకోండి. Amazon & Flipkartలలో తక్కువ ధర డీల్స్ చూపిస్తాము.
        </p>
      </div>

      {/* 2. Main Search Bar with Telugu Voice Search */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-zinc-900 border-2 border-orange-300/80 dark:border-zinc-700 focus-within:border-orange-500 transition">
          <Search className="absolute left-4 size-5 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="మొబైల్, హెడ్‌ఫోన్, బ్యాగ్‌ప్యాక్, స్ప్రేయర్ పంప్, టార్చ్ లైట్..."
            className="w-full pl-12 pr-28 py-4 rounded-2xl bg-transparent text-slate-900 dark:text-white placeholder-slate-400 font-bold text-sm sm:text-base outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`size-10 rounded-xl flex items-center justify-center transition ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-orange-100 hover:text-orange-600"
              }`}
              title="తెలుగులో మాట్లాడి వెతకండి"
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-600/20 active:scale-95 transition"
            >
              వెతకండి
            </button>
          </div>
        </div>

        {isListening && (
          <p className="mt-2 text-center text-xs font-black text-orange-600 animate-pulse">
            🎙️ వింటున్నాము... "10 వేల లోపు మొబైల్", "500 లోపు ఇయర్ ఫోన్లు" అని చెప్పండి...
          </p>
        )}
      </form>

      {/* 3. Budget Selector: 💰 నా బడ్జెట్ */}
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/90 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900 rounded-3xl p-4 sm:p-5 border border-amber-200/80 dark:border-zinc-800 mb-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💰</span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              నా బడ్జెట్ (Set Your Budget)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            మీ బడ్జెట్ పరిధిలోని ఉత్తమ డీల్స్ మాత్రమే చూపిస్తాము
          </span>
        </div>

        {/* Budget Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {BUDGET_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => onSelectBudget(pill.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300/80 dark:border-zinc-700 text-slate-900 dark:text-white font-black text-xs hover:bg-orange-500 hover:text-white hover:border-orange-500 transition shadow-2xs cursor-pointer active:scale-95"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Custom budget input */}
        <div className="flex items-center gap-2 max-w-xs">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              placeholder="వేరే బడ్జెట్ టైప్ చేయండి (ఉదా: 7500)"
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCustomBudget}
            className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition active:scale-95 shrink-0"
          >
            చూడండి
          </button>
        </div>
      </div>

      {/* 4. Popular Deals Shortcuts Grid */}
      <div className="mb-8">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <Sparkles className="size-4 text-orange-500" />
          <span>🔥 ప్రముఖ డీల్స్ విభాగాలు (Popular Deals)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Mobiles under 10k */}
          <button
            type="button"
            onClick={() => onSelectCollection("mobiles", 10000)}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-md group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Smartphone className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              📱 మొబైల్స్ ₹10,000 లోపు
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
              Samsung, Redmi బడ్జెట్ ఫోన్లు
            </p>
          </button>

          {/* Headphones under 500 */}
          <button
            type="button"
            onClick={() => onSelectCollection("audio", 500)}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-md group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Headphones className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              🎧 హెడ్‌ఫోన్లు ₹500 లోపు
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
              boAt, Boult బాస్ ఇయర్ ఫోన్లు
            </p>
          </button>

          {/* Student Essentials */}
          <button
            type="button"
            onClick={() => onSelectCollection("student", 1000)}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-md group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Backpack className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              🎒 స్టూడెంట్ అవసరాలు
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
              బ్యాగ్‌ప్యాక్స్, స్టేషనరీ, బుక్స్
            </p>
          </button>

          {/* Farmer Useful Products */}
          <button
            type="button"
            onClick={() => onSelectCollection("farmer")}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-md group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Tractor className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              👨‍🌾 రైతులకు ఉపయోగపడేవి
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
              స్ప్రేయర్స్, టార్చ్‌లు, పనిముట్లు
            </p>
          </button>

          {/* Useful Home Products */}
          <button
            type="button"
            onClick={() => onSelectCollection("home", 1000)}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-md group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Home className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              🏠 ఇంటికి ఉపయోగపడేవి
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
              చాపర్, ఎమర్జెన్సీ లైట్లు, కిచెన్
            </p>
          </button>

          {/* Electronics under 1000 */}
          <button
            type="button"
            onClick={() => onSelectCollection("electronics", 1000)}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-md group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Zap className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              🔌 ఎలక్ట్రానిక్స్ ₹1,000 లోపు
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
              పవర్ బ్యాంక్స్, చార్జర్స్, కేబుల్స్
            </p>
          </button>
        </div>
      </div>

      {/* 5. Trust & Transparency Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20">
          <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-black text-slate-900 dark:text-white">100% నిజమైన ధరలు</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              అమెజాన్, ఫ్లిప్‌కార్ట్‌లలో వాస్తవంగా ఉన్న ధరలను మాత్రమే పోల్చి చూపిస్తాము.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20">
          <CheckCircle2 className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-black text-slate-900 dark:text-white">నకిలీ ఆఫర్లు ఉండవు</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              కృత్రిమ కౌంట్‌డౌన్ టైమర్లు లేదా తప్పుడు డిస్కౌంట్లు మేము ప్రదర్శించము.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20">
          <Sparkles className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-black text-slate-900 dark:text-white">సురక్షిత మర్చంట్ కొనుగోలు</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              చెల్లింపులు మరియు డెలివరీ నేరుగా Amazon లేదా Flipkartలోనే జరుగుతాయి.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
