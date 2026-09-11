import React, { useState, useMemo } from "react";
import { Sparkles, Search, Flame, Heart, Share2, Download, UserCheck, Plus, Filter, Building2, BookOpen } from "lucide-react";
import { DAILY_SHARE_CATEGORIES, getDailyShareItems, getUserCreations } from "@/lib/daily-share-api";
import { DailyShareCard } from "@/components/DailyShareCard";
import { useLanguage } from "@/hooks/useLanguage";
import { setMeta } from "@/lib/seo";

export function DailySharePage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "my_creations" | "business">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const creations = useMemo(() => getUserCreations(), [activeTab]);

  React.useEffect(() => {
    setMeta({
      title: "ఈరోజు షేర్ (Daily Share) | VaartaNow - Personalized Statuses & Quotes",
      description: "రోజువారీ శుభోదయం, మోటివేషన్, భక్తి మరియు పండుగ శుభాకాంక్షలను మీ పేరు మరియు ఫోటోతో పర్సనలైజ్ చేసుకోండి.",
      canonical: "/daily-share"
    });
  }, []);

  const items = useMemo(() => {
    let list = getDailyShareItems(selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        i.title.toLowerCase().includes(q) || 
        (i.quote_te && i.quote_te.toLowerCase().includes(q)) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <main className="container-shell space-y-4 py-3 pb-20">
      {/* 🌟 Hero Header Banner */}
      <section className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-5 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest border border-white/30">
              ✨ ఈరోజు షేర్ • DAILY SHARE
            </span>
            <h1 className="text-xl sm:text-2xl font-black leading-tight">
              {lang === "te" ? "మీ పేరు & ఫోటోతో రోజూ కొత్త వాట్సాప్ స్టేటస్!" : "Personalized Daily WhatsApp Statuses & Quotes"}
            </h1>
            <p className="text-xs font-bold text-red-100 max-w-xl">
              {lang === "te" 
                ? "శుభోదయం, మోటివేషన్, ఆధ్యాత్మికం, జోకులు మరియు పండుగ శుభాకాంక్షలను 15 సెకన్లలో పర్సనలైజ్ చేసి షేర్ చేయండి." 
                : "Create & share high-resolution daily quotes, devotional greetings & business status cards."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("my_creations")}
              className="px-4 py-2 rounded-xl bg-white text-red-600 font-black text-xs shadow-md hover:bg-yellow-100 active:scale-95 transition flex items-center gap-1.5"
            >
              <UserCheck className="size-4" />
              <span>{lang === "te" ? "నా కార్డ్స్ (My History)" : "My Creations"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[hsl(var(--border))] pb-3">
        {/* Main Tabs */}
        <div className="flex items-center gap-1.5 border border-amber-500/30 bg-[hsl(var(--muted))]/40 p-1 rounded-xl text-xs font-black">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "all" ? "bg-red-600 text-white shadow-xs" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            🔥 {lang === "te" ? "ట్రెండింగ్ షేర్స్" : "Trending Shares"}
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
            💼 {lang === "te" ? "బిజినెస్ మోడ్" : "Business Mode"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "te" ? "సూక్తులు లేదా కాటగిరీ ద్వారా వెతకండి..." : "Search quotes or categories..."}
            className="w-full text-xs font-bold pl-9 pr-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>

      {/* 30 Configurable Categories Grid Bar */}
      {activeTab === "all" && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-black transition shrink-0 border ${
              selectedCategory === "all"
                ? "bg-red-600 text-white border-red-600 shadow-xs"
                : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]/70 hover:border-red-500"
            }`}
          >
            ✨ {lang === "te" ? "అన్నీ (All 30 Categories)" : "All Categories"}
          </button>

          {DAILY_SHARE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-full text-xs font-black transition shrink-0 border ${
                selectedCategory === cat.slug
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]/70 hover:border-red-500"
              }`}
            >
              <span>{cat.emoji} {cat.title_te}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab Content 1: Main Trending Daily Share Grid */}
      {activeTab === "all" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <DailyShareCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Tab Content 2: My Creations History */}
      {activeTab === "my_creations" && (
        <div className="space-y-4">
          {creations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creations.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 space-y-2 shadow-sm">
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
                    className="w-full py-1.5 rounded-lg bg-red-600 text-white text-xs font-black block text-center shadow-xs"
                  >
                    డౌన్‌లోడ్ ⬇️
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="size-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                <UserCheck className="size-6" />
              </div>
              <h3 className="text-sm font-black">{lang === "te" ? "మీరు ఇంకా ఏ స్టేటస్ పర్సనలైజ్ చేయలేదు" : "No Creations Found Yet"}</h3>
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
                {lang === "te" ? "ట్రెండింగ్ షేర్స్ నుండి ఏదైనా కార్డ్ ఎంచుకుని 'పర్సనలైజ్' నొక్కండి." : "Pick any status card and tap 'Personalize' to create your status."}
              </p>
              <button
                onClick={() => setActiveTab("all")}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black"
              >
                {lang === "te" ? "కార్డ్స్ చూడండి" : "Explore Statuses"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Business Status Mode */}
      {activeTab === "business" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-5 text-white space-y-3">
            <h3 className="text-base font-black flex items-center gap-2">
              <Building2 className="size-5 text-amber-400" />
              <span>{lang === "te" ? "వ్యాపారవేత్తల ప్రత్యేక వాట్సాప్ స్టేటస్ మోడ్" : "Business WhatsApp Status Generator"}</span>
            </h3>
            <p className="text-xs font-bold text-slate-300 max-w-xl leading-relaxed">
              {lang === "te" 
                ? "మీ వ్యాపారం పేరు, లోగో, ఆఫర్లు మరియు ప్రమోషన్ సందేశాలతో ప్రొఫెషనల్ వాట్సాప్ బిజినెస్ కార్డ్స్ తయారు చేసుకోండి." 
                : "Create high-converting promotional WhatsApp Status graphics for your store, shop, or agency."}
            </p>
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
