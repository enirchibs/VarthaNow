import React from "react";
import { 
  CheckCircle2, 
  Share2, 
  Bookmark, 
  Bell, 
  ArrowRight, 
  Search, 
  Home, 
  Clock, 
  X 
} from "lucide-react";
import type { ServiceProvider } from "@/types/services";

interface ServiceSuccessModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onViewMoreSameCategory: () => void;
  onSearchOtherServices: () => void;
  onBackToHome: () => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
}

export function ServiceSuccessModal({
  provider,
  isOpen,
  onClose,
  onViewMoreSameCategory,
  onSearchOtherServices,
  onBackToHome,
  onToggleBookmark,
  isBookmarked
}: ServiceSuccessModalProps) {
  if (!isOpen || !provider) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${provider.name} - మన అడ్డా`,
          text: `నేను మన అడ్డా ద్వారా ${provider.name} (${provider.subcategory_name_te}) ని సంప్రదించాను.`,
          url: window.location.href
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("లింక్ కాపీ చేయబడింది!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Close Button */}
        <div className="p-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content (Screen 8 in Reference Image) */}
        <div className="p-5 pt-0 text-center space-y-4 overflow-y-auto">
          
          {/* Big Green Success Checkmark */}
          <div className="size-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="size-12 stroke-[2.5px]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              మీ అభ్యర్థన పంపబడింది!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400">{provider.name}</span> కు మీ సందేశం పంపబడింది.
            </p>
          </div>

          {/* Quick Actions: Share, Save, Reminder */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Share2 className="size-4 text-blue-500" />
              <span className="text-[10px]">షేర్ చేయండి</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(provider.id)}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Bookmark className={`size-4 ${isBookmarked ? "text-blue-600 fill-blue-600" : "text-amber-500"}`} />
              <span className="text-[10px]">{isBookmarked ? "సేవ్డ్" : "సేవ్ చేయండి"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert("రిమైండర్ సెట్ చేయబడింది!");
              }}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Bell className="size-4 text-purple-500" />
              <span className="text-[10px]">గుర్తు చేయండి</span>
            </button>
          </div>

          {/* "ఇంకా కావాలా?" Section (Screen 8 in Reference Image) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-left">
            <span className="text-xs font-black text-slate-900 dark:text-white block px-1">
              ఇంకా కావాలా? (Next Actions)
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={onViewMoreSameCategory}
                className="w-full p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60 text-xs font-black text-blue-700 dark:text-blue-300 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>ఇంకా {provider.subcategory_name_te}లే చూడండి</span>
                </span>
                <ArrowRight className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={onSearchOtherServices}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search className="size-4 text-emerald-500" />
                  <span>ఇతర సేవలు వెతుక్కోండి</span>
                </span>
                <ArrowRight className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Home className="size-4 text-rose-500" />
                  <span>హోమ్ కు వెళ్ళండి</span>
                </span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
