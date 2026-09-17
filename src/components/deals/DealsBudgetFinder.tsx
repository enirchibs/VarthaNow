import React, { useState } from "react";
import { BUDGET_FINDER_STEPS } from "@/lib/deals/deals-api";

interface DealsBudgetFinderProps {
  selectedBudget?: number;
  onSelectBudget: (budget: number) => void;
  onClearBudget: () => void;
  matchedCount?: number;
}

export const DealsBudgetFinder: React.FC<DealsBudgetFinderProps> = ({
  selectedBudget,
  onSelectBudget,
  onClearBudget,
  matchedCount
}) => {
  const [customInput, setCustomInput] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (val && val > 0) {
      onSelectBudget(val);
      setCustomInput("");
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/90 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900 rounded-3xl p-4 sm:p-5 border border-amber-200/80 dark:border-zinc-800 mb-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-base">💰</span>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            మీ బడ్జెట్ ఎంత? (Set Your Budget)
          </h3>
        </div>

        {/* Live Matched Count Feedback (Section 12) */}
        {selectedBudget && matchedCount !== undefined ? (
          <span className="text-xs font-black text-orange-600 dark:text-orange-400 animate-in fade-in">
            ₹{selectedBudget.toLocaleString("en-IN")} లోపు మీ కోసం {matchedCount} డీల్స్
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-500">
            మీ బడ్జెట్ పరిధిలోని ఆఫర్లు మాత్రమే చూడండి
          </span>
        )}
      </div>

      {/* Button Grid: ₹100, ₹500, ₹1,000, ₹2,500, ₹5,000, ₹10,000, ₹25,000 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {BUDGET_FINDER_STEPS.map((step) => {
          const isSelected = selectedBudget === step;
          return (
            <button
              key={step}
              type="button"
              onClick={() => (isSelected ? onClearBudget() : onSelectBudget(step))}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs ${
                isSelected
                  ? "bg-orange-600 text-white border border-orange-600 shadow-sm"
                  : "bg-white dark:bg-zinc-800 border border-amber-300/80 dark:border-zinc-700 text-slate-900 dark:text-white hover:bg-orange-500 hover:text-white hover:border-orange-500"
              }`}
            >
              ₹{step.toLocaleString("en-IN")} లోపు
            </button>
          );
        })}

        {selectedBudget && (
          <button
            type="button"
            onClick={onClearBudget}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 underline transition cursor-pointer"
          >
            తొలగించండి
          </button>
        )}
      </div>

      {/* Custom budget input */}
      <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 max-w-xs">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
          <input
            type="number"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="కస్టమ్ బడ్జెట్ (ఉదా: 3500)"
            className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold outline-none focus:border-orange-500"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition active:scale-95 shrink-0 cursor-pointer"
        >
          చూడండి
        </button>
      </form>
    </div>
  );
};
