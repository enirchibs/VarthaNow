import React, { useState } from "react";
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Mic, 
  MicOff, 
  Search, 
  ShieldCheck, 
  HeartHandshake, 
  Users,
  CheckCircle2
} from "lucide-react";
import type { MatrimonyGender } from "@/types/matrimony";
import { speechService } from "@/lib/speech-service";

interface MatrimonyFirstScreenProps {
  onSelectGender: (gender: MatrimonyGender) => void;
  onSelectNearMe: () => void;
  onOpenLocationModal: () => void;
  onSearchQuery: (query: string) => void;
  familyMode: boolean;
}

export const MatrimonyFirstScreen: React.FC<MatrimonyFirstScreenProps> = ({
  onSelectGender,
  onSelectNearMe,
  onOpenLocationModal,
  onSearchQuery,
  familyMode
}) => {
  const [searchInput, setSearchInput] = useState("");
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
      (result) => {
        if (result.transcript && result.transcript.trim()) {
          setSearchInput(result.transcript);
          if (result.isFinal) {
            setIsListening(false);
            onSearchQuery(result.transcript);
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
      onSearchQuery(searchInput.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Welcome Hero Greeting */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-extrabold mb-3 animate-in fade-in zoom-in duration-300">
          <Sparkles className="size-3.5" />
          <span>మన అడ్డా మ్యాట్రిమోనీ ప్రత్యేకం</span>
        </div>

        <h2 className={`font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 ${
          familyMode ? "text-2xl sm:text-4xl" : "text-xl sm:text-3xl"
        }`}>
          💍 మీకు ఎలాంటి సంబంధం కావాలి?
        </h2>

        <p className={`text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto ${
          familyMode ? "text-base sm:text-lg" : "text-sm sm:text-base"
        }`}>
          {familyMode 
            ? "మా అబ్బాయికి లేదా అమ్మాయికి సరిపోయే సంబంధాన్ని సులభంగా వెతకండి."
            : "మొదట వధువు లేదా వరుడు ఎంచుకోండి. మీ ప్రాంతం పరిధిలోని ఉత్తమ సంబంధాలు వెంటనే కనిపిస్తాయి."}
        </p>
      </div>

      {/* 2 Big Action Cards: Bride vs Groom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Looking for Bride (వధువు కోసం) */}
        <button
          type="button"
          onClick={() => onSelectGender("bride")}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/60 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-zinc-900 border-2 border-rose-200 dark:border-rose-800/80 hover:border-rose-500 dark:hover:border-rose-400 shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-rose-500/30 group-hover:scale-110 transition duration-300">
              👩
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black tracking-wide uppercase shadow-xs">
              వధువు
            </span>
          </div>

          <h3 className={`font-black text-rose-950 dark:text-rose-100 mb-1 group-hover:text-rose-600 transition ${
            familyMode ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}>
            {familyMode ? "👰 మా అబ్బాయి కోసం వధువు కావాలి" : "👩 వధువు కోసం చూస్తున్నాను"}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-rose-700/80 dark:text-rose-300/80 mb-3">
            Looking for Bride
          </p>
          <div className="flex items-center text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition">
            <span>సంబంధాలు చూడండి →</span>
          </div>
        </button>

        {/* Looking for Groom (వరుడు కోసం) */}
        <button
          type="button"
          onClick={() => onSelectGender("groom")}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-zinc-900 border-2 border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition duration-300">
              👨
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black tracking-wide uppercase shadow-xs">
              వరుడు
            </span>
          </div>

          <h3 className={`font-black text-indigo-950 dark:text-indigo-100 mb-1 group-hover:text-indigo-600 transition ${
            familyMode ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}>
            {familyMode ? "🤵 మా అమ్మాయి కోసం వరుడు కావాలి" : "👨 వరుడు కోసం చూస్తున్నాను"}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-indigo-700/80 dark:text-indigo-300/80 mb-3">
            Looking for Groom
          </p>
          <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition">
            <span>సంబంధాలు చూడండి →</span>
          </div>
        </button>
      </div>

      {/* Location Fast Actions */}
      <div className="bg-slate-50 dark:bg-zinc-900/80 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-zinc-800 mb-8">
        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
          <MapPin className="size-4 text-rose-600" />
          <span>ప్రాంతం ఆధారంగా చూడండి (Near Me & Location Selection)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onSelectNearMe}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 hover:border-rose-500 text-slate-900 dark:text-white font-extrabold text-sm shadow-2xs hover:shadow-sm transition cursor-pointer"
          >
            <Compass className="size-4 text-rose-600 animate-spin" style={{ animationDuration: "10s" }} />
            <span>📍 నా దగ్గర ఉన్న సంబంధాలు (GPS 10 కి.మీ)</span>
          </button>

          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 hover:border-rose-500 text-slate-900 dark:text-white font-extrabold text-sm shadow-2xs hover:shadow-sm transition cursor-pointer"
          >
            <MapPin className="size-4 text-indigo-600" />
            <span>🏘️ గ్రామం / పట్టణం ఎంచుకోండి</span>
          </button>
        </div>
      </div>

      {/* Voice & Text Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 size-5 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              familyMode
                ? "గ్రామం లేదా ఉద్యోగం పేరు టైప్ చేయండి (ఉదా: అనకాపల్లి, టీచర్)..."
                : "శోధించండి: అనకాపల్లి, సాఫ్ట్‌వేర్, గవర్నమెంట్ జాబ్, బి.టెక్..."
            }
            className="w-full pl-12 pr-24 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-700 focus:border-rose-500 dark:focus:border-rose-500 text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm sm:text-base outline-none shadow-sm transition"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`size-10 rounded-xl flex items-center justify-center transition ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-rose-100 hover:text-rose-600"
              }`}
              title="తెలుగులో వాయిస్ సెర్చ్ మాట్లాడండి"
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-xs transition"
            >
              వెతకండి
            </button>
          </div>
        </div>
        {isListening && (
          <p className="mt-2 text-center text-xs font-black text-rose-600 animate-pulse">
            🎙️ వింటున్నాము... "విశాఖపట్నం దగ్గర వధువు", "అనకాపల్లిలో సాఫ్ట్‌వేర్ ఇంజనీర్" అని మాట్లాడండి...
          </p>
        )}
      </form>

      {/* Trust & Safety Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20">
          <ShieldCheck className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-black text-slate-900 dark:text-white">100% నంబర్ గోప్యత</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              మీ అనుమతి లేకుండా ఎవరికీ ఫోన్ నంబర్ కనిపించదు.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20">
          <HeartHandshake className="size-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-black text-slate-900 dark:text-white">స్థానిక విశ్వసనీయత</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              మీ ఊరు మరియు సమీప మండలాల నిజమైన సంబంధాలు.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20">
          <Users className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-black text-slate-900 dark:text-white">కుటుంబ-స్నేహపూర్వకం</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              తల్లిదండ్రులు సులభంగా అర్థం చేసుకోగల సరళమైన డిజైన్.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
