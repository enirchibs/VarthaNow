import React, { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import { 
  isTeluguTypingActive, 
  setTeluguTypingActive, 
  TELUGU_TYPING_EVENT 
} from "@/lib/telugu-typing";

interface TeluguTypingBannerProps {
  className?: string;
  compact?: boolean;
  exampleText?: string;
}

export const TeluguTypingBanner: React.FC<TeluguTypingBannerProps> = ({
  className = "",
  compact = false,
  exampleText = "ఇంగ్లీష్‌లో టైప్ చేసి స్పేస్ నొక్కండి (ఉదా: raithu + Space = రైతు | mla = ఎమ్మెల్యే)"
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(isTeluguTypingActive);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsEnabled(customEvent.detail);
    };
    window.addEventListener(TELUGU_TYPING_EVENT, handleToggle);
    return () => window.removeEventListener(TELUGU_TYPING_EVENT, handleToggle);
  }, []);

  const handleToggle = () => {
    setTeluguTypingActive(!isEnabled);
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 text-[11px] shadow-2xs ${className}`}>
        <div className="flex items-center gap-1.5 truncate">
          <Keyboard className="size-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
            {isEnabled ? "తెలుగు టైపింగ్ ఆన్ (raithu + Space = రైతు)" : "English Typing Mode"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer select-none shrink-0 ${
            isEnabled
              ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-amber-300 shadow-xs"
              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-zinc-700"
          }`}
        >
          {isEnabled ? "తెలుగు [తె] ఆన్" : "English [En]"}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-amber-50/95 dark:bg-amber-950/40 border border-amber-300/90 dark:border-amber-800 text-xs shadow-2xs transition-all ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="size-8 sm:size-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Keyboard className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-xs sm:text-sm">
              తెలుగు టైపింగ్ అందుబాటులో ఉంది
            </span>
            {isEnabled && (
              <span className="size-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-bold truncate">
            {exampleText}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer select-none shrink-0 ${
          isEnabled
            ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-amber-300 shadow-md shadow-orange-500/20 active:scale-95"
            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-200"
        }`}
        title="తెలుగు / ఇంగ్లీష్ టైపింగ్ మార్చండి (Ctrl + G)"
      >
        {isEnabled ? "తెలుగు [తె] ఆన్" : "English [En]"}
      </button>
    </div>
  );
};
