import React, { useState, useEffect } from "react";
import { 
  Search, 
  Mic, 
  MicOff, 
  MapPin, 
  Compass, 
  Wrench, 
  Home, 
  Car, 
  Tractor, 
  Truck, 
  HardHat, 
  Sparkles, 
  Scissors, 
  GraduationCap, 
  PartyPopper, 
  HeartPulse, 
  FileText, 
  Package, 
  Dog, 
  Store,
  ChevronRight,
  ShieldCheck,
  Zap,
  Droplets,
  Wind,
  Tv,
  Users
} from "lucide-react";
import type { ServiceCategoryItem } from "@/types/services";
import { speechService } from "@/lib/speech-service";

interface ServicesHomeViewProps {
  categories: ServiceCategoryItem[];
  selectedMode: "services" | "rentals";
  onSelectMode: (mode: "services" | "rentals") => void;
  onSelectCategory: (category: ServiceCategoryItem) => void;
  onSelectDirectNeed: (needQuery: string, categoryId?: string) => void;
  onSearch: (query: string) => void;
  locationName: string;
  selectedRadius: number;
  onSelectRadius: (radius: number) => void;
  onOpenLocationPicker: () => void;
  onOpenPostService: () => void;
}

const ROTATING_PLACEHOLDERS = [
  "ఎలక్ట్రీషియన్ (Electrician)...",
  "ప్లంబర్ (Plumber)...",
  "ట్రాక్టర్ దుక్కి (Tractor)...",
  "AC / TV రిపేర్ (Technician)...",
  "కార్ డ్రైవర్ (Driver)...",
  "పెయింటర్ (Painter)...",
  "బైక్ మెకానిక్ (Mechanic)...",
  "వంట మాస్టర్ (Catering)...",
  "మేసన్ / తాపీ పని (Mason)...",
  "హోమ్ ట్యూషన్ (Tuition)..."
];

// Low-literacy "మీకు ఏం కావాలి?" visual options
const VISUAL_NEEDS = [
  { id: "need_home", icon: "🛠️", title: "ఇంట్లో పని చేయించాలి", query: "ఇంటి పనులు", catId: "home_services", bg: "from-amber-500/10 to-orange-500/10 border-amber-300 dark:border-amber-700/60" },
  { id: "need_farm", icon: "🚜", title: "వ్యవసాయం / యంత్రం", query: "వ్యవసాయం", catId: "agriculture_farm", bg: "from-emerald-500/10 to-teal-500/10 border-emerald-300 dark:border-emerald-700/60" },
  { id: "need_transport", icon: "🚗", title: "వాహనం / డ్రైవర్", query: "డ్రైవర్", catId: "transport_drivers", bg: "from-blue-500/10 to-indigo-500/10 border-blue-300 dark:border-blue-700/60" },
  { id: "need_repair", icon: "🔧", title: "రిపేర్ చేయాలి", query: "రిపేర్", catId: "repairs_technicians", bg: "from-sky-500/10 to-blue-500/10 border-sky-300 dark:border-sky-700/60" },
  { id: "need_construction", icon: "🏗️", title: "నిర్మాణ పని", query: "నిర్మాణం", catId: "construction_labour", bg: "from-yellow-500/10 to-amber-500/10 border-yellow-300 dark:border-yellow-700/60" },
  { id: "need_events", icon: "🎉", title: "ఫంక్షన్ ఏర్పాటు", query: "ఫంక్షన్", catId: "events_functions", bg: "from-rose-500/10 to-pink-500/10 border-rose-300 dark:border-rose-700/60" },
  { id: "need_tuition", icon: "👨‍🏫", title: "టీచర్ / ట్యూషన్", query: "ట్యూషన్", catId: "education_training", bg: "from-indigo-500/10 to-purple-500/10 border-indigo-300 dark:border-indigo-700/60" },
  { id: "need_cleaning", icon: "🧹", title: "ఇంటిపని / క్లీనింగ్", query: "క్లీనింగ్", catId: "cleaning_help", bg: "from-teal-500/10 to-cyan-500/10 border-teal-300 dark:border-teal-700/60" },
  { id: "need_beauty", icon: "💇", title: "బ్యూటీ / సెలూన్", query: "బ్యూటీ", catId: "beauty_personal", bg: "from-pink-500/10 to-rose-500/10 border-pink-300 dark:border-pink-700/60" },
  { id: "need_doc", icon: "📄", title: "డాక్యుమెంట్ పని", query: "డాక్యుమెంట్", catId: "professional_doc", bg: "from-slate-500/10 to-zinc-500/10 border-slate-300 dark:border-slate-700/60" }
];

// Icon component lookup
const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Wrench,
  Car,
  Tractor,
  Truck,
  HardHat,
  Sparkles,
  Scissors,
  GraduationCap,
  PartyPopper,
  HeartPulse,
  FileText,
  Package,
  Dog,
  Store,
  Zap,
  Droplets,
  Wind,
  Tv,
  Users
};

export function ServicesHomeView({
  categories,
  selectedMode,
  onSelectMode,
  onSelectCategory,
  onSelectDirectNeed,
  onSearch,
  locationName,
  selectedRadius,
  onSelectRadius,
  onOpenLocationPicker,
  onOpenPostService
}: ServicesHomeViewProps) {
  const [searchInput, setSearchInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // Rotate search placeholder every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  // Voice Search via Web Speech API (Telugu & English)
  const handleVoiceSearch = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert("మీ బ్రౌజర్ లో వాయిస్ సెర్చ్ అందుబాటులో లేదు. దయచేసి టైప్ చేయండి.");
      return;
    }

    setIsListening(true);
    speechService.startListening(
      "te-IN",
      (res) => {
        if (res.transcript) {
          setSearchInput(res.transcript);
          if (res.isFinal) {
            setIsListening(false);
            onSearch(res.transcript);
          }
        }
      },
      (err) => {
        console.warn("Voice search error:", err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in-50">
      
      {/* 🌟 1. HERO BANNER (Matching Reference Image Screen 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 shadow-lg border border-emerald-500/40">
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-25 sm:opacity-40">
          <svg className="w-48 h-48 sm:w-64 sm:h-64" viewBox="0 0 200 200" fill="currentColor">
            <path d="M45,-60C58,-50,68,-37,73,-21C78,-5,78,13,71,28C64,43,50,55,34,63C18,71,-1,75,-19,72C-37,69,-54,59,-65,45C-76,31,-81,13,-77,-4C-73,-21,-60,-37,-45,-47C-30,-57,-15,-61,1,-62C17,-63,32,-70,45,-60Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1.5 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10.5px] font-black backdrop-blur-xs">
              <span>🌾 మన ఊరి నిపుణులు</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black leading-tight tracking-tight">
              మీకు ఏ సేవ కావాలి?
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-bold leading-relaxed">
              ఇంటి పనుల నుండి వ్యవసాయ పనుల వరకు.. మన ఊరిలోనే, మన వాళ్లే!
            </p>
          </div>

          {/* Cheerful Friendly Character Avatar Illustration */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="size-16 sm:size-20 rounded-full bg-white/20 border-2 border-white/60 p-1 shadow-md backdrop-blur-xs flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">👨‍🌾</span>
            </div>
            <span className="text-[10px] font-black text-emerald-100 mt-1">మన సేవలు</span>
          </div>
        </div>
      </div>

      {/* 🔍 2. PRIMARY SEARCH BAR WITH VOICE (Matching Reference Screen 1) */}
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder={isListening ? "చెప్పండి.. వింటున్నాము..." : ROTATING_PLACEHOLDERS[placeholderIndex]}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition"
            />
          </div>

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`size-11 rounded-2xl flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer shadow-xs ${
              isListening
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100"
            }`}
            title="వాయిస్ తో వెతకండి (Voice Search)"
          >
            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          {/* Search Action Button */}
          <button
            type="submit"
            className="h-11 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-black shadow-md transition cursor-pointer shrink-0"
          >
            వెతకండి
          </button>
        </form>
      </div>

      {/* 🔄 3. MODE SWITCHER: [ సేవలు (Services) ] [ రెంటల్స్ (Rentals) ] */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => onSelectMode("services")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedMode === "services"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Wrench className="size-4" />
          <span>సేవలు (Services)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("rentals")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedMode === "rentals"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Tractor className="size-4" />
          <span>రెంటల్స్ / అద్దెకు (Rentals)</span>
        </button>
      </div>

      {/* 🛠️ 4. "మీకు ఏం కావాలి?" (What Do You Need?) VISUAL RAIL (FOR LOW-LITERACY USERS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>మీకు ఏం కావాలి?</span>
            <span className="text-[10px] font-bold text-slate-500">(1-ట్యాప్ ఎంపిక)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {VISUAL_NEEDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDirectNeed(item.query, item.catId)}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl bg-gradient-to-br ${item.bg} border flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 📍 5. NEAR ME QUICK RADIUS BAR */}
      <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="size-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              📍 నా దగ్గర సేవలు ({locationName})
            </span>
            <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
              పరిధి ఎంచుకోండి (Radius)
            </span>
          </div>
        </div>

        {/* Radius Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { label: "5 km", val: 5 },
            { label: "10 km", val: 10 },
            { label: "25 km", val: 25 },
            { label: "50 km", val: 50 },
            { label: "100 km", val: 100 }
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => onSelectRadius(r.val)}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer shrink-0 active:scale-95 ${
                selectedRadius === r.val
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="text-[11px] font-black text-blue-600 dark:text-blue-400 underline ml-1 shrink-0 cursor-pointer"
          >
            మార్చండి
          </button>
        </div>
      </div>

      {/* 🏷️ 6. SERVICE CATEGORIES GRID (15 BROAD CATEGORIES - Screen 3 in Reference Image) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>సేవల వర్గాలు</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              మీకు కావలసిన సేవను ఎంచుకోండి
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPostService}
            className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            + మీ సేవను చేర్చండి
          </button>
        </div>

        {/* 2-Column Responsive Pastel Grid (Matching Screen 3) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon_name] || Wrench;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`p-3.5 rounded-3xl ${cat.color_bg} ${cat.color_border || "border border-slate-200/60 dark:border-slate-800/60"} text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col justify-between min-h-[110px] group`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`size-11 rounded-2xl bg-white dark:bg-slate-900/80 flex items-center justify-center ${cat.color_text} shadow-xs group-hover:scale-110 transition`}>
                    <IconComp className="size-6 stroke-[2.2px]" />
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block leading-tight">
                    {cat.name_te}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block leading-none">
                    {cat.name_en}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌾 7. VILLAGE DEVELOPMENT BANNER (Matching bottom banner in image) */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>🏡 మన ఊరు - మన గ్రామం... మన అభివృద్ధి</span>
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
            గ్రామం | పట్టణం | నగరం ఎక్కడున్నా... మీ అవసరాలు మన అడ్డా!
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPostService}
          className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shrink-0 shadow-xs cursor-pointer active:scale-95 transition"
        >
          ఉచిత నమోదు
        </button>
      </div>

      {/* ⚠️ 8. SAFETY & PLATFORM DISCLAIMER */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-black text-slate-700 dark:text-slate-300">
          <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
          <span>గమనిక (Important Notice):</span>
        </div>
        <p className="leading-relaxed">
          Mana Adda సేవలను అందించదు. ఈ ప్రొఫైల్లోని సమాచారం సంబంధిత వ్యక్తి/వ్యాపారి అందించినది. సేవ తీసుకునే ముందు ధర, పని, గుర్తింపు మరియు ఇతర వివరాలను స్వయంగా నిర్ధారించుకోండి.
        </p>
      </div>

    </div>
  );
}
