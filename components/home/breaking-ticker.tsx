"use client";

import { Zap } from "lucide-react";
import { articles } from "@/lib/data";
import { useApp } from "@/components/providers/app-provider";
import { uiCopy } from "@/lib/i18n";

export function BreakingTicker() {
  const { language } = useApp();
  const copy = uiCopy[language] ?? uiCopy.te;
  const breaking = articles.filter((article) => article.isBreaking);
  const items = [...breaking, ...breaking];

  return (
    <section className="overflow-hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-black text-white">
          <Zap className="size-3" />
          {copy.breaking}
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-8 whitespace-nowrap text-sm font-semibold">
            {items.map((article, index) => (
              <span key={`${article.id}-${index}`} className="text-foreground/90">
                {article.headline[language]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
