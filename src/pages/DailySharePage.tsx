import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, UserCheck, Building2 } from "lucide-react";
import { DAILY_SHARE_CATEGORIES, getDailyShareItems, getUserCreations } from "@/lib/daily-share-api";
import { DailyShareCard } from "@/components/DailyShareCard";
import { WhatsAppStatusTemplate } from "@/components/WhatsAppStatusTemplate";
import { useLanguage } from "@/hooks/useLanguage";
import { setMeta } from "@/lib/seo";
import type { DailyShareItem } from "@/types/daily-share";

export function DailySharePage() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeTab, setActiveTab] = useState<"all" | "my_creations" | "business">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState<DailyShareItem | null>(null);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const creations = useMemo(() => getUserCreations(), [activeTab]);

  const items = useMemo(() => {
    let list = getDailyShareItems(selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.quote_te && i.quote_te.toLowerCase().includes(q)) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Keep the WhatsApp status template (Shiva / video) as the featured maker on this page
  useEffect(() => {
    const pool = items.length ? items : getDailyShareItems("all");
    const preferred =
      pool.find((i) => i.id === "ds-shiva-001") ||
      pool.find((i) => i.id === "ds-video-gemini-001") ||
      pool.find((i) => i.personalization_enabled) ||
      pool[0] ||
      null;
    setFeatured(preferred);
  }, [items]);

  useEffect(() => {
    setMeta({
      title: "వాట్సాప్ స్టేటస్ ఫోటో | VaartaNow Daily Share",
      description: "మీ ఫోటో & పేరుతో WhatsApp status template — upload image/video and share.",
      canonical: "/daily-share",
    });
  }, []);

  return (
    <main className="container-shell space-y-4 py-3 pb-20">
      {/* Featured WhatsApp template — always on this page */}
      {featured && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <h1 className="text-sm sm:text-base font-black text-[hsl(var(--foreground))]">
              {lang === "te" ? "📱 వాట్సాప్ స్టేటస్ టెంప్లేట్" : "📱 WhatsApp Status Template"}
            </h1>
            <span className="text-[10px] font-black text-pink-600 dark:text-pink-400">
              {lang === "te" ? "ఫోటో / వీడియో అప్‌లోడ్ చేయండి" : "Upload photo / video"}
            </span>
          </div>
          <WhatsAppStatusTemplate key={featured.id} item={featured} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[hsl(var(--border))] pb-3">
        <div className="flex items-center gap-1.5 border border-amber-500/30 bg-[hsl(var(--muted))]/40 p-1 rounded-xl text-xs font-black">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "all" ? "bg-red-600 text-white shadow-xs" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            🔥 {lang === "te" ? "ట్రెండింగ్" : "Trending"}
          </button>
          <button
            onClick={() => setActiveTab("my_creations")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "my_creations" ? "bg-red-600 text-white shadow-xs" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            📂 {lang === "te" ? "నా క్రియేషన్స్" : "My Creations"} ({creations.length})
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "business" ? "bg-slate-800 text-white shadow-xs" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            💼 {lang === "te" ? "బిజినెస్" : "Business"}
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "te" ? "సూక్తులు వెతకండి..." : "Search quotes..."}
            className="w-full text-xs font-bold pl-9 pr-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>

      {/* Category pills */}
      {activeTab === "all" && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition shrink-0 border ${
                selectedCategory === "all"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
              }`}
            >
              ✨ {lang === "te" ? "మీ కోసం" : "For You"}
            </button>
            {[
              { slug: "devotional", emoji: "🙏", te: "భక్తి", en: "Bhakti" },
              { slug: "good-night", emoji: "😴", te: "గుడ్ నైట్", en: "Good Night" },
              { slug: "good-morning", emoji: "☀️", te: "గుడ్ మార్నింగ్", en: "Good Morning" },
              { slug: "motivational", emoji: "💪", te: "మోటివేషన్", en: "Motivation" },
              { slug: "life-quotes", emoji: "🌱", te: "జీవిత సత్యం", en: "Life Truth" },
              { slug: "trending-telugu", emoji: "🎥", te: "వీడియో", en: "Video" },
            ].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  const next = getDailyShareItems(cat.slug)[0];
                  if (next) setFeatured(next);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition shrink-0 border ${
                  selectedCategory === cat.slug
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
                }`}
              >
                {cat.emoji} {lang === "te" ? cat.te : cat.en}
              </button>
            ))}
          </div>

          <details className="text-xs font-black text-[hsl(var(--muted-foreground))]">
            <summary className="cursor-pointer select-none px-1 py-1 hover:text-red-600">
              {lang === "te" ? "మరిన్ని కేటగిరీలు ▾" : "More Categories ▾"}
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DAILY_SHARE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition border ${
                    selectedCategory === cat.slug
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-[hsl(var(--card))] border-[hsl(var(--border))]/70"
                  }`}
                >
                  {cat.emoji} {cat.title_te}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

      {activeTab === "all" && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            {lang === "te" ? "మరిన్ని టెంప్లేట్లు" : "More templates"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <DailyShareCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "my_creations" && (
        <div className="space-y-4">
          {creations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creations.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 space-y-2 shadow-sm"
                >
                  <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black">
                    <img src={c.renderedDataUrl} alt={c.title} className="size-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black truncate">{c.title}</h4>
                    <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                      {new Date(c.created_at).toLocaleDateString()} • {c.options.userName}
                    </p>
                  </div>
                  <a
                    href={c.renderedDataUrl}
                    download={`my-status-${c.id}.png`}
                    className="w-full py-1.5 rounded-lg bg-red-600 text-white text-xs font-black block text-center"
                  >
                    డౌన్‌లోడ్ ⬇️
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="py-8 text-center space-y-2 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="size-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                  <UserCheck className="size-6" />
                </div>
                <h3 className="text-sm font-black">
                  {lang === "te" ? "ఇంకా సేవ్ చేసిన స్టేటస్ లేదు" : "No saved statuses yet"}
                </h3>
                <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
                  {lang === "te"
                    ? "పైన ఉన్న టెంప్లేట్‌లో ఫోటో అప్‌లోడ్ చేసి Share / Download నొక్కండి."
                    : "Use the template above — upload your photo, then Share or Download."}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black"
                >
                  {lang === "te" ? "టెంప్లేట్‌కు వెళ్ళండి" : "Go to template"}
                </button>
              </div>
              {featured && <WhatsAppStatusTemplate key={`empty-${featured.id}`} item={featured} />}
            </div>
          )}
        </div>
      )}

      {activeTab === "business" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-5 text-white space-y-3">
            <h3 className="text-base font-black flex items-center gap-2">
              <Building2 className="size-5 text-amber-400" />
              <span>{lang === "te" ? "బిజినెస్ వాట్సాప్ స్టేటస్" : "Business WhatsApp Status"}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getDailyShareItems("business").map((item) => (
              <DailyShareCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
