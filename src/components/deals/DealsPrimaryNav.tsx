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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const userInteractionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

  // tourStep:
  //  0  => "all" (10s initial highlight)
  //  1  => "kirana" (~1.8s)
  //  2  => "mobiles" (~1.8s)
  //  3  => "student" (~1.8s)
  //  4  => "home" (~1.8s)
  //  5  => "farmer" (~1.8s)
  //  6  => "more" (~2.5s) (End of category tabs)
  // -1  => Idle / 30s pause after flow completes
  const [tourStep, setTourStep] = useState<number>(0);
  const [isPausedByUser, setIsPausedByUser] = useState(false);

  // 🔄 Step-by-step tour across tabs:
  // 1. Highlight "అన్నీ" for 10 seconds initially
  // 2. Step through each category: కిరాణా -> మొబైల్స్ -> స్టూడెంట్ -> ఇంటి డీల్స్ -> రైతుల డీల్స్ -> మరిన్ని
  // 3. Once flow reaches end, return to start
  // 4. Wait 30 seconds
  // 5. Repeat flow!
  useEffect(() => {
    if (isPausedByUser) return;

    if (tourStep === 0) {
      // Highlight "అన్నీ" for 10 seconds
      if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
      tourTimerRef.current = setTimeout(() => {
        setTourStep(1); // Proceed to index 1: kirana
      }, 10000); // 10 seconds highlight
    } else if (tourStep >= 1 && tourStep < PRIMARY_DEALS_TABS.length) {
      // Step sequentially to next category tab
      const targetEl = tabRefs.current[tourStep];
      const container = tabsContainerRef.current;
      if (container && targetEl) {
        const targetScroll = targetEl.offsetLeft - (container.clientWidth - targetEl.clientWidth) / 2;
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
      }

      // 1.8s per tab, 2.5s for the final tab
      const isLastTab = tourStep === PRIMARY_DEALS_TABS.length - 1;
      const stepDuration = isLastTab ? 2500 : 1800;

      tourTimerRef.current = setTimeout(() => {
        if (isLastTab) {
          // Flow done: return to start and transition to 30s idle wait
          if (tabsContainerRef.current) {
            tabsContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
          }
          setTourStep(-1);
        } else {
          setTourStep((prev) => prev + 1);
        }
      }, stepDuration);
    } else if (tourStep === -1) {
      // "once one flow done.. wait for 30 secionds.. then start move .."
      tourTimerRef.current = setTimeout(() => {
        setTourStep(0); // Start cycle again with 10s highlight on 'all'
      }, 30000); // 30 seconds pause
    }

    return () => {
      if (tourTimerRef.current) {
        clearTimeout(tourTimerRef.current);
      }
    };
  }, [tourStep, isPausedByUser]);

  // Handle user manual touch / interaction so auto-scroll doesn't fight the user
  const handleUserTouchOrScroll = () => {
    setIsPausedByUser(true);
    setTourStep(-1); // Immediately clear tour highlight
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    if (userInteractionTimerRef.current) clearTimeout(userInteractionTimerRef.current);

    // After 30 seconds of user inactivity, resume auto-move capability
    userInteractionTimerRef.current = setTimeout(() => {
      setIsPausedByUser(false);
      setTourStep(0);
    }, 30000);
  };

  const getTabIcon = (tabId: PrimaryDealsTab, isHighlighted: boolean) => {
    const iconClass = `size-4.5 sm:size-5 transition-colors ${
      isHighlighted ? "text-white animate-bounce" : ""
    }`;

    switch (tabId) {
      case "all":
        return (
          <Flame
            className={`size-4.5 sm:size-5 ${
              isHighlighted ? "text-white fill-white animate-bounce" : "text-orange-500 fill-orange-500"
            }`}
          />
        );
      case "kirana":
        return <ShoppingCart className={`${iconClass} ${!isHighlighted ? "text-emerald-600" : ""}`} />;
      case "mobiles":
        return <Smartphone className={`${iconClass} ${!isHighlighted ? "text-blue-600" : ""}`} />;
      case "student":
        return <GraduationCap className={`${iconClass} ${!isHighlighted ? "text-indigo-600" : ""}`} />;
      case "home":
        return <Home className={`${iconClass} ${!isHighlighted ? "text-amber-600" : ""}`} />;
      case "farmer":
        return <Tractor className={`${iconClass} ${!isHighlighted ? "text-teal-600" : ""}`} />;
      case "more":
        return <MoreHorizontal className={`${iconClass} ${!isHighlighted ? "text-purple-600" : ""}`} />;
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
      {/* Visual cue banner: When highlighting 'all' or stepping through categories */}
      <div className="flex items-center justify-between px-1 text-[11px] font-black">
        {tourStep === 0 ? (
          <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 animate-pulse">
            <Sparkles className="size-3 text-orange-500" />
            <span>🔥 అన్ని ప్రముఖ కేటగిరీల డీల్స్ (All Categories)</span>
          </span>
        ) : tourStep > 0 && tourStep < PRIMARY_DEALS_TABS.length ? (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 animate-pulse">
            <Sparkles className="size-3 text-amber-500" />
            <span>
              👉 {PRIMARY_DEALS_TABS[tourStep].icon} {PRIMARY_DEALS_TABS[tourStep].label_te} ({PRIMARY_DEALS_TABS[tourStep].label_en})
            </span>
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            కేటగిరీ ఎంచుకోండి:
          </span>
        )}

        {/* Right-scroll indicator */}
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
        {PRIMARY_DEALS_TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const isTourHighlighted = tourStep === idx;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl whitespace-nowrap font-black text-xs sm:text-sm tracking-tight transition-all duration-300 shrink-0 cursor-pointer select-none relative ${
                isTourHighlighted
                  ? "bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 ring-4 ring-orange-400 scale-[1.06] border-2 border-amber-300 animate-pulse z-10"
                  : isActive
                  ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/25 ring-2 ring-orange-500/50 scale-[1.02]"
                  : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200/90 dark:border-zinc-800 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-zinc-800/80 shadow-2xs"
              }`}
            >
              <span className="shrink-0">{getTabIcon(tab.id, isTourHighlighted)}</span>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-black flex items-center gap-1">
                  {tab.label_te}
                  {isTourHighlighted && (
                    <span className="size-2 rounded-full bg-yellow-300 animate-ping" />
                  )}
                </span>
                {tab.label_en && tab.id !== "all" && tab.id !== "more" && (
                  <span className={`text-[9px] font-bold mt-0.5 opacity-80 ${
                    isTourHighlighted ? "text-amber-100 font-extrabold" : isActive ? "text-orange-100" : "text-slate-500"
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
