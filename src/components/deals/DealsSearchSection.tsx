import React, { useState, useEffect } from "react";
import { Search, Mic, MicOff, ArrowRight } from "lucide-react";
import { speechService, type SpeechRecognitionResult } from "@/lib/speech-service";
import { parseNaturalDealsQuery, type InterpretedDealsQuery } from "@/lib/deals/deals-api";
import { 
  isTeluguTypingActive, 
  setTeluguTypingActive, 
  TELUGU_TYPING_EVENT 
} from "@/lib/telugu-typing";
import { TeluguTypingBanner } from "@/components/TeluguTypingBanner";

interface DealsSearchSectionProps {
  onSearch: (query: string, category?: string, maxPrice?: number) => void;
  currentQuery?: string;
}

export const DealsSearchSection: React.FC<DealsSearchSectionProps> = ({
  onSearch,
  currentQuery = ""
}) => {
  const [inputVal, setInputVal] = useState(currentQuery);
  const [isListening, setIsListening] = useState(false);
  const [interpreted, setInterpreted] = useState<InterpretedDealsQuery | null>(null);
  const [isTeluguTyping, setIsTeluguTyping] = useState<boolean>(isTeluguTypingActive);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsTeluguTyping(customEvent.detail);
    };
    window.addEventListener(TELUGU_TYPING_EVENT, handleToggle);
    return () => window.removeEventListener(TELUGU_TYPING_EVENT, handleToggle);
  }, []);

  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (val.trim().length >= 3) {
      const interp = parseNaturalDealsQuery(val);
      if (interp.category || interp.max_price) {
        setInterpreted(interp);
      } else {
        setInterpreted(null);
      }
    } else {
      setInterpreted(null);
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert("మీ బ్రౌజర్‌లో వాయిస్ సర్చ్ అందుబాటులో లేదు. దయచేసి టైప్ చేయండి.");
      return;
    }

    setIsListening(true);
    speechService.startListening(
      "te-IN",
      (result: SpeechRecognitionResult) => {
        if (result.transcript && result.transcript.trim()) {
          setInputVal(result.transcript);
          const interp = parseNaturalDealsQuery(result.transcript);
          setInterpreted(interp);
          if (result.isFinal) {
            setIsListening(false);
            onSearch(result.transcript, interp.category, interp.max_price);
          }
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      const interp = parseNaturalDealsQuery(inputVal.trim());
      onSearch(inputVal.trim(), interp.category, interp.max_price);
    }
  };

  const handleApplyInterpreted = () => {
    if (interpreted) {
      onSearch(inputVal.trim(), interpreted.category, interpreted.max_price);
      setInterpreted(null);
    }
  };

  return (
    <div className="w-full mb-5 sm:mb-6">
      {/* Title */}
      <div className="text-center sm:text-left mb-2">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          🔍 ఏం కొనాలనుకుంటున్నారు?
        </h2>
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center shadow-md rounded-2xl bg-white dark:bg-zinc-900 border-2 border-orange-300 dark:border-zinc-700 focus-within:border-orange-500 transition">
          <Search className="absolute left-4 size-5 text-slate-400" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              isTeluguTyping 
                ? "తెలుగులో వెతకండి (ఉదా: raithu + Space = రైతు)..." 
                : "మొబైల్, బియ్యం, హెడ్ఫోన్, ల్యాప్టాప్..."
            }
            className="w-full pl-12 pr-32 sm:pr-36 py-3 sm:py-3.5 rounded-2xl bg-transparent text-slate-900 dark:text-white placeholder-slate-400 font-bold text-xs sm:text-sm outline-none"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {/* ⌨️ Telugu / English Switcher */}
            <button
              type="button"
              onClick={() => setTeluguTypingActive(!isTeluguTyping)}
              className={`px-2 py-1 rounded-xl text-[10px] sm:text-xs font-black border transition cursor-pointer select-none ${
                isTeluguTyping
                  ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-amber-300 shadow-xs"
                  : "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300"
              }`}
              title={
                isTeluguTyping
                  ? "తెలుగు టైపింగ్ ఆన్. ఇంగ్లీష్ కోసం క్లిక్ చేయండి"
                  : "English typing. Click for Telugu"
              }
            >
              {isTeluguTyping ? "తె ఆన్" : "En"}
            </button>

            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`size-9 rounded-xl flex items-center justify-center transition ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-orange-100 hover:text-orange-600"
              }`}
              title="తెలుగులో మాట్లాడి వెతకండి"
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs active:scale-95 transition cursor-pointer"
            >
              వెతకండి
            </button>
          </div>
        </div>

        {isListening && (
          <p className="mt-2 text-center text-xs font-black text-orange-600 animate-pulse">
            🎙️ వింటున్నాము... "10 వేల లోపు మొబైల్", "బియ్యం" అని చెప్పండి...
          </p>
        )}
      </form>

      {/* ⌨️ Telugu Typing Enabled Helper Banner */}
      <TeluguTypingBanner className="mt-2" />

      {/* Natural Language Interpretation Preview Badge (Section 11) */}
      {interpreted && (interpreted.interpreted_category_te || interpreted.interpreted_budget_te) && (
        <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-amber-800 dark:text-amber-300 font-extrabold">
              మీరు వెతుకుతున్నది:
            </span>
            <div className="flex items-center gap-1.5">
              {interpreted.interpreted_category_te && (
                <span className="px-2 py-0.5 rounded-lg bg-orange-600 text-white font-black">
                  {interpreted.interpreted_category_te}
                </span>
              )}
              {interpreted.interpreted_budget_te && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-black">
                  💰 {interpreted.interpreted_budget_te}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyInterpreted}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] hover:opacity-90 transition active:scale-95 cursor-pointer ml-auto"
          >
            <span>డీల్స్ చూపించండి</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
};
