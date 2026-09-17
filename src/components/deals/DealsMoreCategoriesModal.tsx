import React from "react";
import { X } from "lucide-react";
import { MORE_DEAL_CATEGORIES } from "@/lib/deals/deals-api";

interface DealsMoreCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const DealsMoreCategoriesModal: React.FC<DealsMoreCategoriesModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">•••</span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                మరిన్ని కేటగిరీలు (All Categories)
              </h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                మీకు కావాల్సిన ప్రత్యేక విభాగాన్ని ఎంచుకోండి
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 19 Categories Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {MORE_DEAL_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                onSelectCategory(cat.slug);
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-left transition group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition shrink-0">
                {cat.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  {cat.name_te}
                </h4>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {cat.name_en}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-center">
          <p className="text-[11px] font-bold text-slate-500">
            అన్ని డీల్స్ Amazon & Flipkart నుండి పరిశీలించిన నిజమైన ధరలు మాత్రమే.
          </p>
        </div>
      </div>
    </div>
  );
};
