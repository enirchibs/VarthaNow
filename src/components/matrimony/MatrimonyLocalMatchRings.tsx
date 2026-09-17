import React from "react";
import { Home, Building2, Globe, Sparkles } from "lucide-react";

interface MatrimonyLocalMatchRingsProps {
  activeRing: "all" | "very_near" | "nearby_towns" | "wider";
  onSelectRing: (ring: "all" | "very_near" | "nearby_towns" | "wider") => void;
  counts: {
    all: number;
    very_near: number;
    nearby_towns: number;
    wider: number;
  };
}

export const MatrimonyLocalMatchRings: React.FC<MatrimonyLocalMatchRingsProps> = ({
  activeRing,
  onSelectRing,
  counts
}) => {
  return (
    <div className="bg-gradient-to-r from-rose-50/70 via-amber-50/40 to-indigo-50/70 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900 rounded-3xl p-3 sm:p-4 border border-rose-100 dark:border-zinc-800 mb-6 shadow-2xs">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-4 text-rose-600" />
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            స్థానిక మ్యాచ్ రింగులు (Local Match Rings)
          </h4>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden xs:inline">
          దూరం ఆధారంగా విభజన
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Ring 0: All */}
        <button
          type="button"
          onClick={() => onSelectRing("all")}
          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition relative ${
            activeRing === "all"
              ? "bg-white dark:bg-zinc-800 border-rose-500 shadow-md ring-2 ring-rose-200 dark:ring-rose-900"
              : "bg-white/60 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-base">💍</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeRing === "all" ? "bg-rose-600 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
            }`}>
              {counts.all}
            </span>
          </div>
          <div className="font-black text-xs text-slate-900 dark:text-white">అన్నీ చూపించండి</div>
          <div className="text-[10px] text-slate-500 truncate">మొత్తం సంబంధాలు</div>
        </button>

        {/* Ring 1: Very Near (<10 km) */}
        <button
          type="button"
          onClick={() => onSelectRing("very_near")}
          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition relative ${
            activeRing === "very_near"
              ? "bg-white dark:bg-zinc-800 border-emerald-500 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-900"
              : "bg-white/60 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Home className="size-4 text-emerald-600" />
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeRing === "very_near" ? "bg-emerald-600 text-white" : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {counts.very_near}
            </span>
          </div>
          <div className="font-black text-xs text-slate-900 dark:text-white">🏠 నా దగ్గర (&lt; 10 కి.మీ)</div>
          <div className="text-[10px] text-slate-500 truncate">సమీప గ్రామాలు</div>
        </button>

        {/* Ring 2: Nearby Towns (10–25 km) */}
        <button
          type="button"
          onClick={() => onSelectRing("nearby_towns")}
          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition relative ${
            activeRing === "nearby_towns"
              ? "bg-white dark:bg-zinc-800 border-indigo-500 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-900"
              : "bg-white/60 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Building2 className="size-4 text-indigo-600" />
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeRing === "nearby_towns" ? "bg-indigo-600 text-white" : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
            }`}>
              {counts.nearby_towns}
            </span>
          </div>
          <div className="font-black text-xs text-slate-900 dark:text-white">🏘️ సమీప పట్టణాలు (10-25)</div>
          <div className="text-[10px] text-slate-500 truncate">మండల కేంద్రాలు</div>
        </button>

        {/* Ring 3: Wider Area (25-50+ km) */}
        <button
          type="button"
          onClick={() => onSelectRing("wider")}
          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition relative ${
            activeRing === "wider"
              ? "bg-white dark:bg-zinc-800 border-amber-500 shadow-md ring-2 ring-amber-200 dark:ring-amber-900"
              : "bg-white/60 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Globe className="size-4 text-amber-600" />
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeRing === "wider" ? "bg-amber-600 text-white" : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
            }`}>
              {counts.wider}
            </span>
          </div>
          <div className="font-black text-xs text-slate-900 dark:text-white">🌎 విశాల పరిధి (25+)</div>
          <div className="text-[10px] text-slate-500 truncate">జిల్లా అంతటా</div>
        </button>
      </div>
    </div>
  );
};
