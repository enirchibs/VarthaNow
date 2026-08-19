import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Instagram, 
  MessageCircle, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  Clock,
  Share2
} from "lucide-react";
import type { BlogPost } from "@/types/news";
import { getPostBySlug, getTrendingPosts } from "@/lib/news-api";
import { categoryLabel } from "@/lib/categories";
import { markdownToHtml, timeAgo, getOpenEndedQuestion } from "@/lib/format";
import { postStructuredData, setMeta } from "@/lib/seo";
import { Badge } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";
import { ReadingProgress } from "@/components/ReadingProgress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { trackArticleView } from "@/lib/interest-tracker";

// Category pill colors mapping
const CATEGORY_COLORS: Record<string, string> = {
  politics:        "bg-red-600",
  "andhra-pradesh":"bg-orange-600",
  telangana:       "bg-yellow-600",
  cricket:         "bg-green-600",
  cinema:          "bg-pink-600",
  technology:      "bg-blue-600",
  business:        "bg-emerald-700",
  health:          "bg-teal-600",
  devotional:      "bg-amber-600",
  viralshorts:     "bg-rose-600",
  vizag:           "bg-cyan-600",
  jobs:            "bg-indigo-600",
};

function formatPublishDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return timeAgo(dateStr);
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
    const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${time} · ${date}`;
  } catch {
    return timeAgo(dateStr);
  }
}

export function NewsPage() {
  const { lang } = useLanguage();
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(() => {
    return (localStorage.getItem("vaartanow-font-size") as any) || "medium";
  });
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    let mounted = true;
    setLoading(true);
    Promise.all([getPostBySlug(slug), getTrendingPosts(4, lang)])
      .then(([item, trending]) => {
        if (!mounted) return;
        setPost(item);
        setRelated(trending.filter((entry) => entry.slug !== slug));
        if (item) {
          setMeta({
            title: item.meta_title || item.title,
            description: item.meta_description || item.excerpt,
            canonical: `/news/${item.slug}`,
            image: item.og_image,
            structuredData: postStructuredData(item)
          });
          try {
            trackArticleView(item.title, item.category);
          } catch (e) {
            console.warn("Failed to track view:", e);
          }
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug, lang]);

  useEffect(() => {
    localStorage.setItem("vaartanow-font-size", fontSize);
    document.documentElement.classList.remove("article-font-small", "article-font-medium", "article-font-large");
    document.documentElement.classList.add(`article-font-${fontSize}`);
    return () => {
      document.documentElement.classList.remove(`article-font-${fontSize}`);
    };
  }, [fontSize]);

  useEffect(() => {
    if (!post) return;
    try {
      const viewsRaw = localStorage.getItem("vaartanow-category-views");
      const views = viewsRaw ? JSON.parse(viewsRaw) : {};
      views[post.category] = (views[post.category] || 0) + 1;
      localStorage.setItem("vaartanow-category-views", JSON.stringify(views));
    } catch (e) {
      console.error("Failed to track category view:", e);
    }
  }, [post]);

  if (loading) {
    return (
      <main className="container-shell py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <div className="skeleton aspect-video w-full rounded-[1.8rem]" />
            <div className="skeleton h-5 w-28 rounded-full" />
            <div className="skeleton h-10 w-full rounded-xl" />
            <div className="skeleton h-6 w-3/4 rounded-xl" />
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-4 w-full rounded-lg" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="container-shell py-10 text-lg font-black text-center">
        {lang === "te" ? "కథనం కనబడలేదు." : lang === "en" ? "Article not found." : lang === "hi" ? "लेख नहीं मिला।" : lang === "ta" ? "கட்டுரை காணப்படவில்லை." : "ಲೇಖನ ಕಂಡುಬಂದಿಲ್ಲ."}
      </main>
    );
  }

  const shareUrl = `${window.location.origin}/news/${post.slug}`;
  const bookmarked = isBookmarked(post.slug);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}\n${shareUrl}`)}`;

  const hasSourceLink = (() => {
    const url = (post as any).source_article_url;
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname;
      return !hostname.includes("news.google.com") && !hostname.includes("google.com/url");
    } catch { return false; }
  })();

  const shareToInstagram = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(lang === "te" ? "లింక్ కాపీ చేయబడింది! మీరు దాన్ని ఇన్‌స్టాగ్రామ్‌లో షేర్ చేయవచ్చు." : "Link copied to clipboard! You can share it on Instagram.");
      } catch (err) {
        console.error("Failed to copy link: ", err);
      }
    }
  };

  const formattedDate = formatPublishDate(post.published_at);
  const categoryBg = CATEGORY_COLORS[post.category] || "bg-blue-600";

  return (
    <>
      <ReadingProgress />
      <main className="container-shell grid gap-5 py-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="overflow-hidden rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-all duration-300">
          
          {/* 📸 1. BANNER IMAGE AT THE VERY TOP (WITH SUBTLE ZOOM ANIMATION & FLOATING BRAND ICONS) */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] max-h-[30rem] overflow-hidden bg-black group/banner">
            {(() => {
              const ytId = (() => {
                const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/i;
                const match = post.content?.match(youtubeRegex) || post.excerpt?.match(youtubeRegex) || post.slug?.match(youtubeRegex);
                return match ? match[1] : null;
              })();

              if (ytId) {
                return (
                  <div className="relative size-full overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                      title={post.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                    />
                  </div>
                );
              }

              return post.og_image ? (
                <img
                  src={post.og_image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover/banner:scale-105 animate-in fade-in zoom-in-95 duration-500"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white font-black text-3xl">
                  VaartaNow
                </div>
              );
            })()}

            {/* Gradient Overlays for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

            {/* Top Left: Floating Back Navigation Arrow */}
            <div className="absolute left-3.5 top-3.5 z-20">
              <Link
                to="/"
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/80 hover:scale-105 active:scale-95 transition-all"
                aria-label="Back to home"
              >
                <ArrowLeft className="size-5 sm:size-5.5" />
              </Link>
            </div>

            {/* Top Right: Floating WhatsApp & Instagram Buttons with Brand Logo Colors */}
            <div className="absolute right-3.5 top-3.5 z-20 flex items-center gap-2">
              {/* WhatsApp (Brand Green) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg border border-white/30 hover:scale-110 active:scale-95 transition-all"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
              >
                <MessageCircle className="size-4.5 sm:size-5 fill-current" />
              </a>

              {/* Instagram (Brand Gradient) */}
              <button
                onClick={shareToInstagram}
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white shadow-lg border border-white/30 hover:scale-110 active:scale-95 transition-all"
                aria-label="Share on Instagram"
                title="Share on Instagram"
              >
                <Instagram className="size-4.5 sm:size-5" />
              </button>

              {/* Bookmark Save */}
              <button
                onClick={() => toggleBookmark(post.slug)}
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/80 hover:scale-105 active:scale-95 transition-all"
                aria-label={bookmarked ? "Remove bookmark" : "Save article"}
                title={bookmarked ? "Saved" : "Save Article"}
              >
                {bookmarked ? (
                  <BookmarkCheck className="size-4.5 text-yellow-400 fill-yellow-400" />
                ) : (
                  <Bookmark className="size-4.5" />
                )}
              </button>
            </div>

            {/* Bottom Overlay: Category Pill Badge */}
            <div className="absolute left-4 bottom-4 z-20">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider shadow-md backdrop-blur-sm border border-white/20 ${categoryBg}`}>
                {categoryLabel(post.category, lang)}
              </span>
            </div>
          </div>

          {/* 📰 2. HEADLINE + SOURCE LOGO + DATE & TIME (RIGHT BELOW BANNER IMAGE) */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4">
            
            {/* Headline Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-snug sm:leading-tight text-[hsl(var(--foreground))] tracking-tight">
              {post.title}
            </h1>

            {/* Source Publisher Logo + Author + Date & Time Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[hsl(var(--border))]/60 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-2.5">
                {/* Source Publisher Logo (e.g. TV9, NTV, Disha, Way2News, VarthaNow) */}
                <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 border border-[hsl(var(--border))]/50">
                  {post.source_logo ? (
                    <img
                      src={post.source_logo}
                      alt={post.author_name}
                      width={20}
                      height={20}
                      className="size-5 rounded-full object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <span className="size-5 rounded-full bg-blue-600 text-white font-black text-[10px] grid place-items-center uppercase">
                      {post.author_name.charAt(0)}
                    </span>
                  )}
                  <span className="font-extrabold text-[hsl(var(--foreground))] text-xs">
                    {post.author_name}
                  </span>
                  <span className="text-blue-500 font-bold text-xs">✓</span>
                </div>

                <span className="text-gray-300 dark:text-zinc-700">•</span>

                {/* Date & Time */}
                <span className="font-bold text-xs text-[hsl(var(--muted-foreground))]">
                  {formattedDate}
                </span>

                {post.reading_time_min > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-zinc-700 hidden sm:inline">•</span>
                    <span className="hidden sm:inline-flex items-center gap-1 font-bold text-xs">
                      <Clock className="size-3 text-indigo-500" />
                      {post.reading_time_min} {lang === "te" ? "నిమి పఠనం" : "min read"}
                    </span>
                  </>
                )}
              </div>

              {/* Font Size Selector (A A A) */}
              <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1 shrink-0">
                <button
                  onClick={() => setFontSize("small")}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black transition ${ fontSize === "small" ? "bg-[hsl(var(--primary))] text-white shadow-sm" : "text-[hsl(var(--muted-foreground))]" }`}
                  aria-label="Small font"
                >A</button>
                <button
                  onClick={() => setFontSize("medium")}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-black transition ${ fontSize === "medium" ? "bg-[hsl(var(--primary))] text-white shadow-sm" : "text-[hsl(var(--muted-foreground))]" }`}
                  aria-label="Medium font"
                >A</button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`rounded-full px-2 py-0.5 text-[14px] font-black transition ${ fontSize === "large" ? "bg-[hsl(var(--primary))] text-white shadow-sm" : "text-[hsl(var(--muted-foreground))]" }`}
                  aria-label="Large font"
                >A</button>
              </div>
            </div>

            {/* Read Original Source Link Button (Copyright & Publisher Compliance) */}
            {hasSourceLink && (
              <div className="pt-1">
                <a
                  href={(post as any).source_article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/10 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/30 transition-all duration-200"
                >
                  <ExternalLink className="size-3.5 text-blue-500" />
                  <span>
                    {lang === "te" ? `మూల వార్త: ${post.author_name} లో చదవండి` : `Read original story at ${post.author_name}`}
                  </span>
                </a>
              </div>
            )}

            {/* 📝 3. NEWS ARTICLE BODY CONTENT */}
            <div className="article-content pt-3">
              {post.content ? (
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
              ) : (
                <p className="text-base md:text-lg leading-relaxed text-[hsl(var(--foreground))] whitespace-pre-wrap">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* 🤔 SINGLE HIGHLIGHT INTERESTING OPEN-ENDED QUESTION CARD */}
            <div className="my-6 rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-4 sm:p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="size-10 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  🤔
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                    {lang === "te" ? "ఆలోచించదగిన ముఖ్యమైన ప్రశ్న" : "Key Thought-Provoking Question"}
                  </h3>
                  <p className="text-sm sm:text-base font-extrabold text-[hsl(var(--foreground))] leading-relaxed italic">
                    "{getOpenEndedQuestion(post.title, post.content || post.excerpt, post.category, lang)}"
                  </p>
                </div>
              </div>
            </div>

            {/* Hashtag Chips */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-[hsl(var(--border))]/50 pt-4 mt-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))]/15 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <h2 className="mb-3 font-black text-base">
              {lang === "te" && "షేర్ చేయండి"}
              {lang === "en" && "Share Story"}
              {lang === "hi" && "షేర్ కరెం"}
              {lang === "ta" && "பகிர்"}
              {lang === "kn" && "ಹಂಚಿಕೊಳ್ಳಿ"}
            </h2>
            <div className="flex items-center gap-3">
              <a 
                href={whatsappUrl} 
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#25D366] text-white font-bold text-xs shadow-md hover:opacity-95 transition" 
                target="_blank" 
                rel="noreferrer"
              >
                <MessageCircle className="size-4 fill-current" /> WhatsApp
              </a>
              <button 
                onClick={shareToInstagram} 
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition"
              >
                <Instagram className="size-4" /> Instagram
              </button>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <h2 className="mb-3 font-black text-base">
              {lang === "te" && "ఇంకా చదవండి"}
              {lang === "en" && "Read More"}
              {lang === "hi" && "और पढ़ें"}
              {lang === "ta" && "மேலும் படிக்க"}
              {lang === "kn" && "ಹೆಚ್ಚು ಓದಿ"}
            </h2>
            <div className="space-y-3.5">
              {related.map((item) => (
                <Link key={item.slug} to={`/news/${item.slug}`} className="block border-b border-[hsl(var(--border))]/50 pb-3 text-sm font-black hover:text-[hsl(var(--primary))] transition-colors last:border-0 last:pb-0">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
