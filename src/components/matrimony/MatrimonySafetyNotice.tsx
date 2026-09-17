import React, { useState } from "react";
import { ShieldCheck, AlertOctagon, ChevronDown, ChevronUp, Lock } from "lucide-react";

export const MatrimonySafetyNotice: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-4 sm:p-5 my-8">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
              <span>🛡️ భద్రతా మార్గదర్శకాలు & మోసాల నివారణ (Safety Tips)</span>
            </h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              పెళ్లి సంబంధాలు చూసేటప్పుడు ఈ ముఖ్యమైన సూచనలు పాటించండి.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="size-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-800 dark:text-amber-200 transition"
        >
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-amber-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-200 mb-1">
              <AlertOctagon className="size-4 text-red-500 shrink-0" />
              <span>1. ఎట్టిపరిస్థితుల్లో డబ్బు పంపవద్దు</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              విదేశాల నుండి బహుమతులు, ప్రయాణ ఖర్చులు, అత్యవసర వైద్య ఖర్చులు అని డబ్బు అడిగితే వెంటనే నిరాకరించి రిపోర్ట్ చేయండి.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-amber-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-200 mb-1">
              <Lock className="size-4 text-amber-600 shrink-0" />
              <span>2. ఓటీపీ & బ్యాంక్ వివరాలు గోప్యం</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              మీ బ్యాంక్ పాస్‌వర్డ్స్, క్రెడిట్ కార్డు లేదా ఆధార్ ఓటీపీలను ఎవరితోనూ ఫోన్‌లో పంచుకోవద్దు.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-amber-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-200 mb-1">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>3. కుటుంబ సమక్షంలోనే కలవండి</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              మొదటిసారి ముఖాముఖి మాట్లాడేటప్పుడు బహిరంగ ప్రదేశంలో, మీ పెద్దలు మరియు కుటుంబ సమక్షంలోనే కలవండి.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-amber-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-200 mb-1">
              <AlertOctagon className="size-4 text-rose-500 shrink-0" />
              <span>4. అనుమానాస్పద ప్రొఫైల్స్ రిపోర్ట్ చేయండి</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              తప్పుడు సమాచారం లేదా అసభ్యకర ప్రవర్తన గమనించినట్లయితే వెంటనే "రిపోర్ట్" బటన్ ద్వారా మాకు తెలియజేయండి.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
