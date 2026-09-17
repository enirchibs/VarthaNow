import React from "react";
import { 
  Flame, 
  ShoppingCart, 
  Smartphone, 
  GraduationCap, 
  Home, 
  Tractor, 
  MoreHorizontal
} from "lucide-react";
import { 
  PRIMARY_DEALS_TABS, 
  KIRANA_SUBCATEGORIES, 
  MOBILE_BUDGET_SHORTCUTS, 
  STUDENT_BUDGET_SHORTCUTS,
  type PrimaryTabItem
} from "@/lib/deals/deals-api";
import type { PrimaryDealsTab, KiranaSubcategory } from "@/types/deals";

interface DealsPrimaryNavProps {
  activeTab: PrimaryDealsTab;
  onSelectTab: (tab: PrimaryDealsTab) => void;
  activeKiranaSubcategory?: KiranaSubcategory;
  onSelectKiranaSubcategory?: (sub: KiranaSubcategory) => void;
  onSelectBudgetShortcut?: (budget: number) => void;
  selectedBudget?: number;
  onOpenMoreCategories: () => void;
}

export const DealsPrimaryNav: React.FC<DealsPrimaryNavProps> = ({
  activeTab,
  onSelectTab,
  activeKiranaSubcategory = "all",
  onSelectKiranaSubcategory,
  onSelectBudgetShortcut,
  selectedBudget,
  onOpenMoreCategories
}) => {
  const getTabIcon = (tabId: PrimaryDealsTab) => {
    switch (tabId) {
      case "all":
        return <Flame className="size-4.5 sm:size-5 text-orange-500 fill-orange-500" />;
      case "kirana":
        return <ShoppingCart className="size-4.5 sm:size-5 text-emerald-600" />;
      case "mobiles":
        return <Smartphone className="size-4.5 sm:size-5 text-blue-600" />;
      case "student":
        return <GraduationCap className="size-4.5 sm:size-5 text-indigo-600" />;
      case "home":
        return <Home className="size-4.5 sm:size-5 text-amber-600" />;
      case "farmer":
        return <Tractor className="size-4.5 sm:size-5 text-teal-600" />;
      case "more":
        return <MoreHorizontal className="size-4.5 sm:size-5 text-purple-600" />;
    }
  };

  const handleTabClick = (tab: PrimaryTabItem) => {
    if (tab.id === "more") {
      onOpenMoreCategories();
    } else {
      onSelectTab(tab.id);
    }
  };

  return (
    <div className="w-full mb-5 sm:mb-6">
      {/* 1. Horizontally Scrollable 7 Large Pill-Style Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 -mx-1 sm:mx-0">
        {PRIMARY_DEALS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl whitespace-nowrap font-black text-xs sm:text-sm tracking-tight transition-all duration-200 shrink-0 cursor-pointer select-none ${
                isActive
                  ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/25 ring-2 ring-orange-500/50 scale-[1.02]"
                  : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200/90 dark:border-zinc-800 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-zinc-800/80 shadow-2xs"
              }`}
            >
              <span className="shrink-0">{getTabIcon(tab.id)}</span>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-black">{tab.label_te}</span>
                {tab.label_en && tab.id !== "all" && tab.id !== "more" && (
                  <span className={`text-[9px] font-bold mt-0.5 opacity-80 ${isActive ? "text-orange-100" : "text-slate-500"}`}>
                    {tab.label_en}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Subcategory & Shortcut Filter Chips Bar for the Active Tab */}
      {activeTab === "kirana" && onSelectKiranaSubcategory && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            విభాగాలు:
          </span>
          {KIRANA_SUBCATEGORIES.map((sub) => {
            const isSubActive = activeKiranaSubcategory === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectKiranaSubcategory(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSubActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <span>{sub.icon} {sub.label_te}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "mobiles" && onSelectBudgetShortcut && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            బడ్జెట్:
          </span>
          {MOBILE_BUDGET_SHORTCUTS.map((sc, idx) => {
            const isBudgetActive = selectedBudget === sc.maxPrice;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectBudgetShortcut(sc.maxPrice)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isBudgetActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "student" && onSelectBudgetShortcut && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            స్టూడెంట్ బడ్జెట్:
          </span>
          {STUDENT_BUDGET_SHORTCUTS.map((sc, idx) => {
            const isBudgetActive = selectedBudget === sc.maxPrice;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectBudgetShortcut(sc.maxPrice)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isBudgetActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
