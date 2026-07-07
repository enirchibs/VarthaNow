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
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`;
  const hasSourceLink = isRealPublisherUrl((post as any).source_article_url);

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_8px_24px_rgba(37,99,235,0.06)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(37,99,235,0.14)] hover:-translate-y-0.5">
      {/* 1 ── Image banner */}
      <Link to={`/news/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
          {post.og_image ? (
            <img
              src={post.og_image}
              alt={post.title}
              loading={priority ? "eager" : "lazy"}
              referrerPolicy="no-referrer"
              className="size-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl">
              VaartaNow
            </div>
          )}

          {/* Subtle bottom gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          {/* Category Badge — top left */}
          <div className="absolute left-3 top-3 z-10">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wide ${categoryColor(post.category)}`}>
              {categoryLabel(post.category)}
            </span>
          </div>

          {/* Breaking badge — top right (only if featured) */}
          {post.featured && (
            <div className="absolute right-3 top-3 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wide animate-pulse">
                🔴 BREAKING
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* 2 ── Content */}
      <div className="space-y-2.5 p-4">
        {/* Headline */}
        <Link to={`/news/${post.slug}`} className="block">
          <h2 className="text-base md:text-[1.05rem] font-black leading-snug text-[hsl(var(--foreground))] line-clamp-2 hover:text-[hsl(var(--primary))] transition-colors duration-200">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt preview — key Inshorts/Dailyhunt feature */}
        {post.excerpt && (
          <p className="text-[0.82rem] leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Source link — copyright compliance */}
        {hasSourceLink && (
          <a
            href={(post as any).source_article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-2.5" />
            {post.author_name} లో చదవండి
          </a>
        )}

        {/* 3 ── Metadata + Actions */}
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/40 pt-2.5 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Source chip */}
            <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 dark:bg-blue-400/10 px-1.5 py-0.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {post.source_logo ? (
                <img
                  src={post.source_logo}
                  alt={post.author_name}
                  width={12}
                  height={12}
                  className="rounded-sm object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : null}
              {post.author_name}
              <span className="text-[10px]">✓</span>
            </span>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <span>{timeAgo(post.published_at)}</span>
            {post.reading_time_min > 0 && (
              <>
                <span className="text-gray-300 dark:text-zinc-700">·</span>
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="size-2.5" />
                  {post.reading_time_min} min
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bookmark — Supabase synced */}
            <Button
              variant="ghost"
              className="h-7 w-7 rounded-full p-0 hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label={bookmarked ? "Remove bookmark" : "Save article"}
              onClick={(e) => { e.preventDefault(); toggleBookmark(post.slug); }}
            >
              {bookmarked
                ? <BookmarkCheck className="size-3.5 fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" />
                : <Bookmark className="size-3.5" />
              }
            </Button>
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-105"
              aria-label="WhatsApp share"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="size-3.5" />
            </a>
            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="grid h-7 w-7 place-items-center rounded-full bg-sky-500 text-white transition-transform hover:scale-105"
              aria-label="Telegram share"
              onClick={(e) => e.stopPropagation()}
            >
              <Send className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
