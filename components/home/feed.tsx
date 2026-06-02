"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { articles } from "@/lib/data";
import { CategoryRail } from "@/components/home/category-rail";
import { NewsCard } from "@/components/home/news-card";
import { BreakingTicker } from "@/components/home/breaking-ticker";
import { UtilityWidgets } from "@/components/home/utility-widgets";
import { MonetizationStrip } from "@/components/home/monetization-strip";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers/app-provider";
import { uiCopy } from "@/lib/i18n";

export function Feed() {
  const [activeCategory, setActiveCategory] = useState("Latest");
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useApp();
  const copy = uiCopy[language] ?? uiCopy.te;

  const visibleArticles = useMemo(() => {
    const base = activeCategory === "Latest" ? articles : articles.filter((article) => article.category === activeCategory);
    return [...base, ...articles].slice(0, 9);
  }, [activeCategory]);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="space-y-5">
      <BreakingTicker />
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[var(--font-poppins)] text-2xl font-black">VaartaNow</h1>
            <p className="truncate font-[var(--font-telugu)] text-sm text-muted-foreground">{copy.tagline}</p>
          </div>
          <Button variant="secondary" size="iconSm" onClick={refresh} aria-label="Pull to refresh">
            <motion.span animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8 }}>
              <RefreshCw className="size-4" />
            </motion.span>
          </Button>
        </div>
      </section>
      <CategoryRail active={activeCategory} onChange={setActiveCategory} />
      <UtilityWidgets />
      <MonetizationStrip />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleArticles.map((article, index) => (
          <NewsCard key={`${article.id}-${index}`} article={article} priority={index === 0} />
        ))}
      </div>
    </div>
  );
}
