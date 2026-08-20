import React, { useState } from "react";
import { 
  Globe, 
  Sparkles, 
  Volume2, 
  ArrowLeft, 
  Mic, 
  Check, 
  ArrowRight,
  Bot
} from "lucide-react";
import { TargetLanguage, getNativeComparison } from "@/lib/tutor-api";
import { speechService } from "@/lib/speech-service";

interface TranslationAndNativeViewProps {
  language: TargetLanguage;
  onBack: () => void;
}

export function TranslationAndNativeView({ language, onBack }: TranslationAndNativeViewProps) {
  const [teluguInput, setTeluguInput] = useState<string>("నాకు రేపు ఆఫీస్‌కు సెలవు కావాలి.");
  const [comparison, setComparison] = useState(getNativeComparison(teluguInput, language));

  const handleTranslate = () => {
    setComparison(getNativeComparison(teluguInput, language));
  };

  const handlePlay = (text: string) => {
    speechService.speak(text, language === "english" ? "en-US" : "hi-IN");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="size-4" />
          <span>వెనుకకు (Dashboard)</span>
        </button>

        <div className="flex items-center gap-2">
          <Globe className="size-5 text-indigo-600" />
          <span className="text-sm font-black text-[hsl(var(--foreground))]">
            Native Speaker Style & Translator
          </span>
        </div>
      </div>

      {/* SEARCH / TRANSLATION INPUT BOX */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-[hsl(var(--foreground))]">
            తెలుగు నుండి నేరుగా అనువదించండి లేదా "Native Speaker" శైలి తెలుసుకోండి
          </h3>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            ఉదాహరణ: "నాకు ఒక అనుమానం ఉంది", "నేను రేపు వస్తాను"
          </p>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={teluguInput}
            onChange={(e) => setTeluguInput(e.target.value)}
            placeholder="తెలుగులో లేదా ఇంగ్లీష్‌లో టైప్ చేయండి..."
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-4 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <button
            onClick={handleTranslate}
            className="py-3 px-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            <span>Native Speaker శైలిని చూడండి</span>
          </button>
        </div>
      </div>

      {/* COMPARISON RESULT CARD */}
      <div className="rounded-[2rem] border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 pb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 text-white px-3 py-1 text-[11px] font-black uppercase">
            💡 "How Would a Native Speaker Say This?"
          </span>
          <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
            విభాగం: {comparison.category}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Common Indian English Version */}
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2">
            <p className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 uppercase">
              సాధారణ భారతీయులు చెప్పే శైలి (Common Indian Usage):
            </p>
            <p className="text-base font-extrabold text-[hsl(var(--foreground))]">
              "{comparison.userVersion}"
            </p>
          </div>

          {/* Natural Native Speaker Version */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase">
                నాచురల్ నైపుణ్య శైలి (Natural Spoken Style):
              </p>
              <button onClick={() => handlePlay(comparison.nativeVersion)} className="text-emerald-600">
                <Volume2 className="size-4" />
              </button>
            </div>
            <p className="text-base font-extrabold text-emerald-800 dark:text-emerald-200">
              "{comparison.nativeVersion}"
            </p>
          </div>
        </div>

        {/* Telugu Explanation */}
        <div className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-2">
          <h4 className="text-xs font-black text-[hsl(var(--foreground))] flex items-center gap-1.5">
            <Bot className="size-4 text-indigo-600" />
            తెలుగులో వివరణ (Telugu Explanation):
          </h4>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
            {comparison.explanation_te}
          </p>
        </div>
      </div>

    </div>
  );
}
