import React from "react";
import { Link } from "react-router-dom";
import { 
  Flame, 
  GraduationCap, 
  Tractor, 
  Home, 
  Bookmark, 
  ShieldCheck, 
  Info,
  SlidersHorizontal,
  BarChart3
} from "lucide-react";
import type { DealAudienceMode } from "@/types/deals";

interface DealsHeaderProps {
  activeMode: DealAudienceMode;
  onSelectMode: (mode: DealAudienceMode) => void;
  savedCount: number;
  onOpenSavedDeals: () => void;
  onOpenAdmin: () => void;
}

export const DealsHeader: React.FC<DealsHeaderProps> = ({
  activeMode,
  onSelectMode,
  savedCount,
  onOpenSavedDeals,
  onOpenAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-amber-200/80 dark:border-zinc-800 shadow-2xs">
      <div className="container-shell max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Tagline */}
          <Link to="/deals" className="flex items-center gap-2 group">
            <div className="size-9 sm:size-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              <Flame className="size-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  మన అడ్డా <span className="text-orange-600 dark:text-orange-400">డీల్స్</span>
                </h1>
                <span className="hidden xs:inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  <ShieldCheck className="size-2.5" /> నిజమైన ధరలు
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                తక్కువ ధరలో మంచి డీల్ • Amazon & Flipkart కంపేరిజన్
              </p>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 🔖 Saved Deals */}
            <button
              type="button"
              onClick={onOpenSavedDeals}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 font-bold text-xs transition shadow-2xs cursor-pointer"
              title="సేవ్ చేసిన డీల్స్"
            >
              <Bookmark className="size-3.5 fill-amber-500 text-amber-500" />
              <span className="text-[11px] sm:text-xs">సేవ్ చేసినవి</span>
              {savedCount > 0 && (
                <span className="size-4 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* 📊 Admin Dashboard Shortcut */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 transition"
              title="డీల్స్ అడ్మిన్ & అనలిటిక్స్"
            >
              <BarChart3 className="size-4" />
            </button>
          </div>
        </div>

        {/* Audience Mode Switcher (All, Student, Farmer, Village) */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectMode("all")}
            className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition ${
              activeMode === "all"
                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🔥 అన్ని డీల్స్ (All)
          </button>

          <button
            type="button"
            onClick={() => onSelectMode("student")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition ${
              activeMode === "student"
                ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-xs"
                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
            }`}
          >
            <GraduationCap className="size-3.5" />
            <span>🎓 స్టూడెంట్స్ (Student Deals)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode("farmer")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition ${
              activeMode === "farmer"
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <Tractor className="size-3.5" />
            <span>👨‍🌾 రైతుల కోసం (Farmer Pick)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode("village")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition ${
              activeMode === "village"
                ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
            }`}
          >
            <Home className="size-3.5" />
            <span>🏡 మన ఊరి డీల్స్ (Village Use)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
