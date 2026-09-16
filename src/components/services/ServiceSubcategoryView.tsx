import React, { useState } from "react";
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Wrench,
  Sparkles,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  BrickWall,
  Grid,
  Filter,
  Trash2,
  Flame,
  MoreHorizontal
} from "lucide-react";
import type { ServiceCategoryItem, ServiceSubcategoryItem } from "@/types/services";

interface ServiceSubcategoryViewProps {
  category: ServiceCategoryItem;
  subcategories: ServiceSubcategoryItem[];
  onBack: () => void;
  onSelectSubcategory: (subcategory: ServiceSubcategoryItem) => void;
}

const SUBCAT_ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  BrickWall,
  Grid,
  Filter,
  Trash2,
  Flame,
  MoreHorizontal
};

export function ServiceSubcategoryView({
  category,
  subcategories,
  onBack,
  onSelectSubcategory
}: ServiceSubcategoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = subcategories.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.name_te.toLowerCase().includes(q) ||
      sub.name_en.toLowerCase().includes(q) ||
      (sub.description_te && sub.description_te.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-12 animate-in fade-in-50">
      
      {/* 1. Header with Back Button (Matching Screen 4) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black transition active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="size-4" />
          <span>మొదటి పేజీ</span>
        </button>
        <span className="text-xs text-slate-400 font-bold">/</span>
        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
          {category.name_te}
        </span>
      </div>

      {/* 2. Visual Banner for Category (Matching Screen 4 Header Illustration) */}
      <div className="relative overflow-hidden rounded-3xl h-36 sm:h-44 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 border border-amber-300/40 dark:border-amber-700/40 shadow-sm">
        <img
          src={category.image_url}
          alt={category.name_te}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
          <span className="text-white text-lg sm:text-2xl font-black drop-shadow-md">
            {category.name_te}
          </span>
          <span className="text-amber-200 text-xs sm:text-sm font-bold">
            {category.name_en} — మీ అవసరాల కోసం నిపుణులు
          </span>
        </div>
      </div>

      {/* 3. Search Bar for Subcategory */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          placeholder="సేవ పేరు వెతకండి... (ఉదా: ఎలక్ట్రీషియన్, ప్లంబర్)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition"
        />
      </div>

      {/* 4. Subcategories Vertical List (Matching Screen 4 Layout) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
            అందుబాటులో ఉన్న సేవలు ({filtered.length})
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((sub) => {
            const IconComp = SUBCAT_ICON_MAP[sub.icon_name] || Wrench;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubcategory(sub)}
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3 text-left group min-h-[58px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail / Icon */}
                  <div className="size-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {sub.image_url ? (
                      <img
                        src={sub.image_url}
                        alt={sub.name_te}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <IconComp className="size-6 text-blue-600" />
                    )}
                  </div>

                  {/* Titles */}
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {sub.name_te}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                      {sub.name_en} {sub.description_te ? `• ${sub.description_te}` : ""}
                    </span>
                  </div>
                </div>

                <div className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition shrink-0">
                  <ChevronRight className="size-4" />
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-3xl">🔍</span>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              క్షమించండి, మీ సెర్చ్ కు తగిన సేవ కనుగొనబడలేదు.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
