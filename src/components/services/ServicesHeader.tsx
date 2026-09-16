import React, { useState, useRef, useEffect } from "react";
import { 
  MapPin, 
  ChevronDown, 
  Bell, 
  User, 
  Search, 
  Wrench,
  Sparkles 
} from "lucide-react";
import type { UserProfile } from "@/lib/user-profile";

interface ServicesHeaderProps {
  locationName: string;
  radiusKm: number;
  onOpenLocationPicker: () => void;
  onOpenSearch?: () => void;
  onOpenProfile: () => void;
  userProfile?: UserProfile | null;
}

export function ServicesHeader({
  locationName,
  radiusKm,
  onOpenLocationPicker,
  onOpenSearch,
  onOpenProfile,
  userProfile
}: ServicesHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand + Tagline */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Wrench className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-600 dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300 bg-clip-text text-transparent truncate">
                మన అడ్డా
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                సేవలు
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate hidden xs:block">
              మన ఊరి సేవలు.. ఒకే చోట
            </p>
          </div>
        </div>

        {/* Center/Right: Location Selector Pill */}
        <button
          type="button"
          onClick={onOpenLocationPicker}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-100 transition active:scale-95 cursor-pointer max-w-[170px] sm:max-w-[260px] shadow-xs"
          title="లొకేషన్ మరియు దూరం మార్చండి"
        >
          <MapPin className="size-3.5 text-rose-500 shrink-0" />
          <span className="truncate text-[11px] sm:text-xs">
            {locationName} {radiusKm > 0 ? `• ${radiusKm} km` : "• అన్నీ"}
          </span>
          <ChevronDown className="size-3 text-slate-400 shrink-0 ml-0.5" />
        </button>

        {/* Right: Notification Bell + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition active:scale-95 cursor-pointer sm:hidden"
              title="వెతకండి"
            >
              <Search className="size-4" />
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition active:scale-95 cursor-pointer"
              title="నోటిఫికేషన్లు"
            >
              <Bell className="size-4 sm:size-5" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-100 space-y-2 animate-in fade-in-50 zoom-in-95">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-black text-xs">🔔 సేవా నోటిఫికేషన్లు</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">తాజావి</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">⚡ కొత్త సర్వీస్ ప్రొవైడర్లు</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">మీ ప్రాంతంలో ఎలక్ట్రీషియన్లు మరియు ప్లంబర్లు కొత్తగా చేరారు.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-[11px] text-blue-600 dark:text-blue-400">🚜 వ్యవసాయ పరికరాల అద్దె</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">సబ్బవరం పరిధిలో ట్రాక్టర్ & హార్వెస్టర్ అద్దె సేవలు లభ్యం.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="size-8 sm:size-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-white font-black text-xs shadow-xs hover:scale-105 active:scale-95 transition overflow-hidden cursor-pointer"
            title={userProfile?.name ? userProfile.name : "ప్రొఫైల్ (Profile)"}
          >
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile" className="size-full object-cover" />
            ) : userProfile?.name ? (
              userProfile.name.charAt(0).toUpperCase()
            ) : (
              <User className="size-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
