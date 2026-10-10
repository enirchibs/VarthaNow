import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { canonicalizeCategory, categoryLabel } from "@/lib/categories";
import { timeAgo } from "@/lib/format";
import type { BlogPost } from "@/types/news";
import { useBookmarks } from "@/hooks/useBookmarks";
import { isArticleRead, markArticleAsRead } from "@/lib/read-tracker";
import { saveSwipeFeed } from "@/components/Way2NewsSwiper";

/** Keep grid order, unique by slug, start at clicked article then continue with the next cards. */
function buildSwipeDeck(feedPosts: BlogPost[] | undefined, clicked: BlogPost): BlogPost[] {
  const raw = feedPosts?.length ? feedPosts : [clicked];
  const seen = new Set<string>();
  const unique = raw.filter((p) => {
    if (!p?.slug || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  const start = unique.findIndex((p) => p.slug === clicked.slug);
  if (start < 0) return [clicked, ...unique];
  // Clicked story first, then the next ones in the grid, then earlier ones
  return [...unique.slice(start), ...unique.slice(0, start)];
}

// ─── Helpers ────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<string, string> = {
  politics:        "bg-red-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(220,38,38,0.6)]",
  "andhra-pradesh":"bg-orange-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(234,88,12,0.6)]",
  telangana:       "bg-amber-600 border-2 border-yellow-200 text-white shadow-[0_2px_8px_rgba(217,119,6,0.6)]",
  cricket:         "bg-emerald-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(5,150,105,0.6)]",
  cinema:          "bg-pink-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(219,39,119,0.6)]",
  technology:      "bg-blue-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(37,99,235,0.6)]",
  business:        "bg-teal-700 border-2 border-white text-white shadow-[0_2px_8px_rgba(15,118,110,0.6)]",
  health:          "bg-green-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(22,163,74,0.6)]",
  devotional:      "bg-amber-700 border-2 border-yellow-300 text-white shadow-[0_2px_8px_rgba(180,83,9,0.6)]",
  viralshorts:     "bg-rose-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(225,29,72,0.6)]",
  vizag:           "bg-cyan-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(8,145,178,0.6)]",
  jobs:            "bg-indigo-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(79,70,229,0.6)]",
  national:        "bg-red-700 border-2 border-white text-white shadow-[0_2px_8px_rgba(185,28,28,0.6)]",
  education:       "bg-violet-600 border-2 border-white text-white shadow-[0_2px_8px_rgba(124,58,237,0.6)]",
};

function categoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? "bg-blue-600 border-2 border-white text-white shadow-md";
}

function isRealPublisherUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return !hostname.includes("news.google.com") && !hostname.includes("google.com/url");
  } catch {
    return false;
  }
}

// ─── Component ──────────────────────────────────────────────────
export function NewsCard({ 
  post, 
  priority = false,
  isSpotlight = false,
  feedPosts,
}: { 
  post: BlogPost & { source_article_url?: string | null }; 
  priority?: boolean;
  isSpotlight?: boolean;
  /** Full list used for vertical swipe feed after opening this card */
  feedPosts?: BlogPost[];
}) {
  const navigate = useNavigate();
  const accurateCategory = (() => {
    const stored = canonicalizeCategory(post.category);
    return stored === "all" ? post.category : stored;
  })();
  const isRead = isArticleRead(post.slug);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(post.slug);

  const shareUrl = `${window.location.origin}/news/${post.slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`;

  // Stories are written by VaartaNow from several reports, so never show a source outlet's logo.
  const publisherLogo = post.source_logo ?? null;

  const openSwipeFeed = () => {
    markArticleAsRead(post.slug);
    const deck = buildSwipeDeck(feedPosts, post);
    saveSwipeFeed(deck, post.slug);
    navigate(`/news/${post.slug}`, { state: { swipeFeed: true } });
  };

  return (
    <article
      onClick={openSwipeFeed}
      className={`group flex flex-col overflow-hidden rounded-[1.2rem] border bg-[hsl(var(--card))] transition-all duration-500 cursor-pointer relative ${
      isSpotlight 
        ? "border-red-500 ring-2 ring-red-500/60 scale-[1.02] -translate-y-1 shadow-[0_12px_28px_rgba(239,68,68,0.35)]" 
        : "border-[hsl(var(--border))] shadow-sm hover:shadow-[0_12px_28px_rgba(239,68,68,0.18)] hover:border-red-500/60 hover:ring-2 hover:ring-red-500/20 hover:-translate-y-1 active:scale-[0.98]"
    }`}>
      {/* 1 ── Banner Image */}
      <div className="relative aspect-[20/9] w-full overflow-hidden bg-[hsl(var(--muted))] block">
        {post.og_image ? (
          <img
            src={post.og_image}
            alt={post.title}
            loading={priority ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
            className={`size-full object-cover transition-transform duration-700 ease-out ${
              isSpotlight ? "scale-105" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg">
            VaartaNow
          </div>
        )}

        {/* Light Shimmer reflection sweep on hover or spotlight focus */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none ${
          isSpotlight ? "translate-x-full duration-1000" : "-translate-x-full group-hover:translate-x-full"
        }`} />

        {/* Category Pill Overlay with High-Visibility Beautiful Border */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md transition-transform group-hover:scale-105 sm:text-[11px] ${categoryStyle(accurateCategory)}`}>
            {categoryLabel(accurateCategory)}
          </span>
        </div>

        {/* 👁️ Unread Badge if article is unread */}
        {!isRead && !isSpotlight && (
          <div className="absolute right-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-600/95 border border-white/90 px-2 py-0.5 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider shadow-md backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-cyan-200 animate-ping" />
              చూడనిది
            </span>
          </div>
        )}

        {/* 🌟 Rotating Spotlight "Read Now" Badge on active card */}
        {isSpotlight && (
          <div className="absolute right-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider shadow-lg animate-pulse">
              🔥 చదవండి
            </span>
          </div>
        )}
      </div>

      {/* 2 ── Content: Headline Title + Publisher/Time Footer */}
      <div className="flex flex-col flex-1 space-y-1.5 p-2.5 sm:p-3">
        <div className="block flex-1">
          <h2 className="flex items-start justify-between gap-1 text-[13px] font-black leading-snug text-[hsl(var(--foreground))] transition-colors line-clamp-3 group-hover:text-red-600 dark:group-hover:text-red-400 sm:text-sm sm:line-clamp-2">
            <span>{post.title}</span>
            <span className="hidden shrink-0 text-[10px] text-red-600 opacity-0 transition-all duration-300 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 dark:text-red-400 sm:inline">➔</span>
          </h2>
        </div>

        {/* Footer: Publisher & Date */}
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/40 pt-1.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))] sm:text-[11px]">
          <div className="flex min-w-0 items-center gap-1">
            {publisherLogo ? (
              <img
                src={publisherLogo}
                alt={post.author_name}
                className="size-3.5 shrink-0 rounded-full object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : null}
            <span className="truncate font-extrabold text-[hsl(var(--foreground))]">{post.author_name}</span>
            <span className="shrink-0">·</span>
            <span className="shrink-0">{timeAgo(post.published_at)}</span>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              aria-label="Save bookmark"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(post.slug); }}
              className="p-1.5 hover:text-amber-500 transition"
            >
              {bookmarked ? <BookmarkCheck className="size-3.5 fill-amber-500 text-amber-500" /> : <Bookmark className="size-3.5" />}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-emerald-600 hover:text-emerald-700 transition"
              aria-label="Share on WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
