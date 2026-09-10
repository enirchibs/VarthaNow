import { Bookmark, BookmarkCheck, Send, Share2, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { categoryLabel } from "@/lib/categories";
import { timeAgo } from "@/lib/format";
import type { BlogPost } from "@/types/news";
import { Badge, Button } from "@/components/ui";
import { useBookmarks } from "@/hooks/useBookmarks";

// ─── Helpers ────────────────────────────────────────────────────
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
  national:        "bg-red-700",
  education:       "bg-violet-600",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-blue-600";
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
export function NewsCard({ post, priority = false }: { post: BlogPost & { source_article_url?: string | null }; priority?: boolean }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(post.slug);

  const shareUrl = `${window.location.origin}/news/${post.slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`;

  const publisherLogo = (() => {
    if (post.source_logo) return post.source_logo;
    const url = (post as any).source_article_url;
    if (url) {
      try {
        const hostname = new URL(url).hostname;
        if (hostname && !hostname.includes("google.com")) {
          return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        }
      } catch {}
    }
    const name = (post.author_name || "").toLowerCase();
    if (name.includes("tv9")) return "https://www.google.com/s2/favicons?domain=tv9telugu.com&sz=64";
    if (name.includes("ntv")) return "https://www.google.com/s2/favicons?domain=ntvtelugu.com&sz=64";
    if (name.includes("sakshi")) return "https://www.google.com/s2/favicons?domain=sakshi.com&sz=64";
    if (name.includes("eenadu")) return "https://www.google.com/s2/favicons?domain=eenadu.net&sz=64";
    if (name.includes("way2news")) return "https://www.google.com/s2/favicons?domain=way2news.co&sz=64";
    if (name.includes("disha")) return "https://www.google.com/s2/favicons?domain=dishanews.in&sz=64";
    return null;
  })();

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-all duration-300 hover:shadow-md">
      {/* 1 ── Banner Image */}
      <Link to={`/news/${post.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-[hsl(var(--muted))] block">
        {post.og_image ? (
          <img
            src={post.og_image}
            alt={post.title}
            loading={priority ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl">
            VaartaNow
          </div>
        )}

        {/* Category Pill Overlay */}
        <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider ${categoryColor(post.category)} shadow-sm`}>
            {categoryLabel(post.category)}
          </span>
        </div>
      </Link>

      {/* 2 ── Content: Headline Title + Publisher/Time Footer */}
      <div className="flex flex-col flex-1 p-3 space-y-2">
        <Link to={`/news/${post.slug}`} className="block flex-1">
          <h2 className="text-xs sm:text-sm font-black leading-snug text-[hsl(var(--foreground))] line-clamp-2 hover:text-[hsl(var(--primary))] transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Footer: Publisher & Date */}
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/40 pt-2 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-1.5 min-w-0">
            {publisherLogo ? (
              <img
                src={publisherLogo}
                alt={post.author_name}
                className="size-3.5 rounded-full object-contain shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : null}
            <span className="truncate font-extrabold text-[hsl(var(--foreground))]">{post.author_name}</span>
            <span>·</span>
            <span className="shrink-0">{timeAgo(post.published_at)}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label="Save bookmark"
              onClick={(e) => { e.preventDefault(); toggleBookmark(post.slug); }}
              className="p-1 hover:text-amber-500 transition"
            >
              {bookmarked ? <BookmarkCheck className="size-3.5 fill-amber-500 text-amber-500" /> : <Bookmark className="size-3.5" />}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-emerald-600 hover:text-emerald-700 transition"
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
