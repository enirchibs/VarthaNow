import React, { useState, useEffect, useRef } from "react";
import { 
  Flame, 
  ShoppingCart, 
  Smartphone, 
  GraduationCap, 
  Home, 
  Tractor, 
  MoreHorizontal,
  Sparkles,
  ChevronRight
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const farmerTabRef = useRef<HTMLButtonElement>(null);
  const userInteractionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isInitialHighlight, setIsInitialHighlight] = useState(true);
  const [isFarmerHighlighted, setIsFarmerHighlighted] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);

  // 🔄 Exact Timed Movement Cycle:
  // 1. Highlight for 10 seconds initially
  // 2. Move right until "రైతుల డీల్స్" (Farmer Deals)
  // 3. Highlight "రైతుల డీల్స్"
  // 4. Return to start
  // 5. Wait for 30 seconds, then repeat!
  useEffect(() => {
    let initialTimer: NodeJS.Timeout;
    let flowTimer: NodeJS.Timeout;
    let cycleTimer: NodeJS.Timeout;
    let isCancelled = false;

    const startMoveRightFlow = () => {
      if (isCancelled || isPausedByUser) return;
      setIsInitialHighlight(false);

      if (tabsContainerRef.current && farmerTabRef.current) {
        const container = tabsContainerRef.current;
        const farmerEl = farmerTabRef.current;

        // Smoothly scroll right until farmer tab is centered/in view
        const targetScroll = farmerEl.offsetLeft - (container.clientWidth - farmerEl.clientWidth) / 2;
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });

        // Highlight "రైతుల డీల్స్"
        setIsFarmerHighlighted(true);

        // Showcase farmer deals for 4.5 seconds, then return to start
        flowTimer = setTimeout(() => {
          if (isCancelled) return;
          setIsFarmerHighlighted(false);
          container.scrollTo({ left: 0, behavior: "smooth" });

          // "once one flow done.. wait for 30 secionds.. then start move .."
          cycleTimer = setTimeout(() => {
            if (!isCancelled && !isPausedByUser) {
              startMoveRightFlow();
            }
          }, 30000); // 30 seconds pause
        }, 4500);
      }
    };

    // 10 seconds initial highlight
    initialTimer = setTimeout(() => {
      startMoveRightFlow();
    }, 10000); // 10 seconds highlight

    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
      clearTimeout(flowTimer);
      clearTimeout(cycleTimer);
      if (userInteractionTimerRef.current) {
        clearTimeout(userInteractionTimerRef.current);
      }
    };
  }, [isPausedByUser]);

  // Handle user manual touch / interaction so auto-scroll doesn't fight the user
  const handleUserTouchOrScroll = () => {
    setIsPausedByUser(true);
    if (userInteractionTimerRef.current) clearTimeout(userInteractionTimerRef.current);
    // After 30 seconds of inactivity, resume auto-move capability
    userInteractionTimerRef.current = setTimeout(() => {
      setIsPausedByUser(false);
    }, 30000);
  };

  const getTabIcon = (tabId: PrimaryDealsTab, isFarmerHighlight: boolean) => {
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
        return (
          <Tractor className={`size-4.5 sm:size-5 transition-colors ${
            isFarmerHighlight ? "text-white animate-bounce" : "text-teal-600"
          }`} />
        );
      case "more":
        return <MoreHorizontal className="size-4.5 sm:size-5 text-purple-600" />;
    }
  };

  const handleTabClick = (tab: PrimaryTabItem) => {
    handleUserTouchOrScroll();
    if (tab.id === "more") {
      onOpenMoreCategories();
    } else {
      onSelectTab(tab.id);
    }
  };

  return (
    <div className="w-full mb-5 sm:mb-6 space-y-1.5">
      {/* Visual cue banner: When in 10-second highlight or Farmer highlight */}
      <div className="flex items-center justify-between px-1 text-[11px] font-black">
        {isInitialHighlight ? (
          <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 animate-pulse">
            <Sparkles className="size-3 text-orange-500" />
            <span>🔥 అన్ని ప్రముఖ కేటగిరీల డీల్స్ (All Categories)</span>
          </span>
        ) : isFarmerHighlighted ? (
          <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 animate-bounce">
            <Sparkles className="size-3 text-teal-500" />
            <span>👨‍🌾 రైతుల డీల్స్ ఇక్కడ చూడండి (Farmer Deals)</span>
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            కేటగిరీ ఎంచుకోండి:
          </span>
        )}

        {/* Subtle Right-scroll indicator */}
        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold flex items-center gap-0.5">
          <span>కుడివైపునకు జరపండి</span>
          <ChevronRight className="size-3 text-orange-600 dark:text-orange-400 animate-pulse" />
        </span>
      </div>

      {/* 1. Horizontally Scrollable 7 Large Pill-Style Tabs */}
      <div 
        ref={tabsContainerRef}
        onWheel={handleUserTouchOrScroll}
        onTouchStart={handleUserTouchOrScroll}
        onMouseDown={handleUserTouchOrScroll}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 px-0.5 -mx-1 sm:mx-0 scroll-smooth"
      >
        {PRIMARY_DEALS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isFarmer = tab.id === "farmer";
          const isThisFarmerHighlighted = isFarmer && isFarmerHighlighted;
          const isThisInitialHighlighted = tab.id === "all" && isInitialHighlight && isActive;

          return (
            <button
              key={tab.id}
              ref={isFarmer ? farmerTabRef : undefined}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl whitespace-nowrap font-black text-xs sm:text-sm tracking-tight transition-all duration-300 shrink-0 cursor-pointer select-none relative ${
                isThisFarmerHighlighted
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-600/40 ring-4 ring-teal-400 scale-[1.06] border-2 border-teal-300 animate-pulse"
                  : isActive
                  ? `bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/25 ring-2 ring-orange-500/50 scale-[1.02] ${
                      isThisInitialHighlighted ? "ring-4 ring-orange-400/80 shadow-lg shadow-orange-500/40 animate-pulse" : ""
                    }`
                  : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200/90 dark:border-zinc-800 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-zinc-800/80 shadow-2xs"
              }`}
            >
              <span className="shrink-0">{getTabIcon(tab.id, isThisFarmerHighlighted)}</span>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-black flex items-center gap-1">
                  {tab.label_te}
                  {isThisFarmerHighlighted && (
                    <span className="size-2 rounded-full bg-yellow-300 animate-ping" />
                  )}
                </span>
                {tab.label_en && tab.id !== "all" && tab.id !== "more" && (
                  <span className={`text-[9px] font-bold mt-0.5 opacity-80 ${
                    isThisFarmerHighlighted ? "text-teal-100 font-extrabold" : isActive ? "text-orange-100" : "text-slate-500"
                  }`}>
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
                onClick={() => {
                  handleUserTouchOrScroll();
                  onSelectKiranaSubcategory(sub.id);
                }}
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
                onClick={() => {
                  handleUserTouchOrScroll();
                  onSelectBudgetShortcut(sc.maxPrice);
                }}
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
                onClick={() => {
                  handleUserTouchOrScroll();
                  onSelectBudgetShortcut(sc.maxPrice);
                }}
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
