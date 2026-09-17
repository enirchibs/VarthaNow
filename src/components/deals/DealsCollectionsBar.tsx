import React from "react";
import { DEAL_COLLECTIONS_LIST, type DealCollectionItem } from "@/lib/deals/deals-api";
import type { DealCollectionType } from "@/types/deals";

interface DealsCollectionsBarProps {
  activeCollection: DealCollectionType;
  onSelectCollection: (col: DealCollectionType) => void;
}

export const DealsCollectionsBar: React.FC<DealsCollectionsBarProps> = ({
  activeCollection,
  onSelectCollection
}) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {DEAL_COLLECTIONS_LIST.map((col) => {
          const isActive = activeCollection === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onSelectCollection(isActive ? "all" : col.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-orange-400 shadow-2xs"
              }`}
            >
              <span>{col.icon}</span>
              <span>{col.label_te}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
