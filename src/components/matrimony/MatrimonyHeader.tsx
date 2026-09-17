import React from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Users, 
  UserPlus, 
  Heart, 
  Bookmark, 
  ChevronDown, 
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { MatrimonyProfile } from "@/types/matrimony";

interface MatrimonyHeaderProps {
  currentLocality: string;
  radiusKm: number;
  familyMode: boolean;
  onToggleFamilyMode: () => void;
  onOpenLocationModal: () => void;
  onOpenRegisterModal: () => void;
  userProfile: MatrimonyProfile | null;
  savedCount: number;
  interestCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MatrimonyHeader: React.FC<MatrimonyHeaderProps> = ({
  currentLocality,
  radiusKm,
  familyMode,
  onToggleFamilyMode,
  onOpenLocationModal,
  onOpenRegisterModal,
  userProfile,
  savedCount,
  interestCount,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-rose-100 dark:border-rose-950/50 shadow-xs transition-colors">
      <div className="container-shell max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Top bar: Brand + Location Badge + Family Mode + Profile */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <Link 
              to="/matrimony" 
              onClick={() => onTabChange("all")}
              className="flex items-center gap-2 group"
            >
              <div className="size-9 sm:size-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 group-hover:scale-105 transition">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    మన అడ్డా <span className="text-rose-600 dark:text-rose-400">మ్యాట్రిమోనీ</span>
                  </h1>
                  <span className="hidden xs:inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <ShieldCheck className="size-2.5" /> సురక్షితం
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  మన ప్రాంతంలో... మనకు సరిపోయే సంబంధాలు
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 📍 Location Trigger Badge */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 transition shadow-2xs text-xs font-bold"
              title="ప్రాంతం మార్చండి"
            >
              <MapPin className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-[120px] text-[11px] sm:text-xs">
                {currentLocality || "నా దగ్గర"}
              </span>
              <span className="text-[10px] text-rose-600/80 font-black hidden xs:inline">
                • {radiusKm} కి.మీ
              </span>
              <ChevronDown className="size-3 text-rose-500 shrink-0" />
            </button>

            {/* 👪 Family Assist Mode Toggle */}
            <button
              type="button"
              onClick={onToggleFamilyMode}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all text-xs font-black shadow-2xs ${
                familyMode
                  ? "bg-amber-500 text-amber-950 border-amber-600 ring-2 ring-amber-300 shadow-sm"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
              }`}
              title={familyMode ? "కుటుంబ మోడ్ ఆన్‌లో ఉంది" : "కుటుంబ మోడ్ ఆన్ చేయండి (పెద్ద అక్షరాలు, సులభమైన వివరాలు)"}
            >
              <Users className="size-3.5" />
              <span className="text-[11px] sm:text-xs">
                {familyMode ? "👪 కుటుంబ మోడ్: ఆన్" : "👪 కుటుంబ మోడ్"}
              </span>
            </button>

            {/* 👤 Profile or + Register */}
            {userProfile ? (
              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border border-slate-200 dark:border-zinc-700 transition"
                title="నా ప్రొఫైల్ వివరాలు"
              >
                <div className="size-7 rounded-full overflow-hidden bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                  {userProfile.photos && userProfile.photos[0] ? (
                    <img src={userProfile.photos[0]} alt={userProfile.name} className="size-full object-cover" />
                  ) : (
                    userProfile.name.charAt(0)
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline truncate max-w-[80px]">
                  {userProfile.name}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black shadow-md shadow-rose-600/20 active:scale-95 transition"
              >
                <UserPlus className="size-3.5" />
                <span className="text-[11px] sm:text-xs">+ ప్రొఫైల్</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Nav Tabs (All, Very Near, Interests, Saved) */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-rose-100/60 dark:border-rose-950/40 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onTabChange("all")}
            className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
              activeTab === "all"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50/70 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-rose-100"
            }`}
          >
            💍 సంబంధాలు (అన్నీ)
          </button>

          <button
            type="button"
            onClick={() => onTabChange("very_near")}
            className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1 ${
              activeTab === "very_near"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50/70 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-rose-100"
            }`}
          >
            🏠 నా దగ్గర (10 కి.మీ లోపు)
          </button>

          <button
            type="button"
            onClick={() => onTabChange("interests")}
            className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1 ${
              activeTab === "interests"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50/70 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-rose-100"
            }`}
          >
            <Heart className="size-3 text-rose-500 fill-rose-500" />
            <span>ఆసక్తులు</span>
            {interestCount > 0 && (
              <span className="size-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {interestCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("saved")}
            className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1 ${
              activeTab === "saved"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50/70 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-rose-100"
            }`}
          >
            <Bookmark className="size-3 text-amber-500 fill-amber-500" />
            <span>సేవ్ చేసినవి</span>
            {savedCount > 0 && (
              <span className="size-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
