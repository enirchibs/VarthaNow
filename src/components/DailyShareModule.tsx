import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronRight, Share2, Flame, Heart, Smile } from "lucide-react";
import { DAILY_SHARE_CATEGORIES, getDailyShareItems, getTodayScheduledShare } from "@/lib/daily-share-api";
import { DailyShareCard } from "./DailyShareCard";
import { useLanguage } from "@/hooks/useLanguage";
import { DailyShareCategorySlug } from "@/types/daily-share";

export function DailyShareModule() {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const items = getDailyShareItems(activeCategory);
  const featuredItem = getTodayScheduledShare();

  return (
    <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-amber-500/5 p-3 sm:p-4 shadow-sm space-y-3 my-3">
      {/* Module Header */}
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="size-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>✨ ఈరోజు షేర్</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                DAILY SHARE
              </span>
            </h2>
            <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
              {lang === "te" ? "వాట్సాప్ స్టేటస్ మరియు షేరింగ్ కోసం రోజువారీ సందేశాలు & ఫోటోలు" : "Fresh daily shareable quotes & personalized status cards"}
            </p>
          </div>
        </div>

        <Link
          to="/daily-share"
          className="text-xs font-black text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>{lang === "te" ? "అన్నీ చూడండి" : "See All"}</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Category Pills Slider - Links to /daily-share */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <Link
          to="/daily-share"
          className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition shrink-0 bg-red-600 text-white border border-red-600 shadow-xs hover:bg-red-700"
        >
          🔥 {lang === "te" ? "అన్ని 30 విభాగాలు" : "All Categories"}
        </Link>

        {DAILY_SHARE_CATEGORIES.slice(0, 12).map((cat) => (
          <Link
            key={cat.id}
            to={`/daily-share?category=${cat.slug}`}
            className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition shrink-0 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]/70 hover:border-red-500 hover:text-red-600"
          >
            <span>{cat.emoji} {cat.title_te}</span>
          </Link>
        ))}
      </div>

      {/* Prominent Telugu Question Prompt */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-black text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
        <span>✏️ మీ పేరు మరియు ఫోటోతో వాట్సాప్ స్టేటస్ తయారు చేసుకోవాలనుకుంటున్నారా? (Add Your Name & Photo on Status?)</span>
        <Link to="/daily-share" className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
          టెంప్లేట్లు చూడండి ›
        </Link>
      </div>

      {/* Daily Share Cards Horizontal Scroll Deck */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 py-1">
        {items.map((item) => (
          <DailyShareCard key={item.id} item={item} compact={true} />
        ))}
      </div>
    </section>
  );
}
