import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Clock,
  MapPin,
  MessageSquare,
  MoreVertical,
  Play,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { useBookmarks } from "@/hooks/useBookmarks";
import { markArticleAsRead } from "@/lib/read-tracker";
import { categoryLabel, detectCategoryFromTitleAndContent } from "@/lib/categories";
import { stripFAQ, timeAgo } from "@/lib/format";
import type { BlogPost } from "@/types/news";
import { Skeleton } from "@/components/ui";

const FLIP_MIN_WORDS = 70;
const FLIP_MAX_WORDS = 80;
const FLIP_TARGET_WORDS = 75;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function cleanFlipText(input: string): string {
  return stripFAQ(input || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>~|#]/g, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortNewsFlipBody(post: BlogPost): string {
  const excerpt = cleanFlipText(post.excerpt || "");
  const content = cleanFlipText(post.content || "");
  let source = excerpt;
  if (excerpt.split(/\s+/).filter(Boolean).length < FLIP_MIN_WORDS && content) {
    const rest = content.startsWith(excerpt) ? content.slice(excerpt.length) : content;
    source = `${excerpt} ${rest}`.replace(/\s+/g, " ").trim();
  }
  if (!source) source = content;

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length <= FLIP_MAX_WORDS) return words.join(" ");

  let cut = FLIP_TARGET_WORDS;
  for (let i = FLIP_MIN_WORDS - 1; i < Math.min(FLIP_MAX_WORDS, words.length); i++) {
    if (/[।.!?…]["'”’)]?$/.test(words[i])) {
      cut = i + 1;
      break;
    }
  }
  cut = Math.min(Math.max(cut, FLIP_MIN_WORDS), FLIP_MAX_WORDS, words.length);
  const clipped = words.slice(0, cut).join(" ");
  return words.length > cut ? `${clipped}…` : clipped;
}

function formatClock(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return timeAgo(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return timeAgo(dateStr);
  }
}

function SnapCard({
  post,
  index,
  total,
  isActive,
  lang,
}: {
  post: BlogPost;
  index: number;
  total: number;
  isActive: boolean;
  lang: Language;
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(post.slug);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const category = detectCategoryFromTitleAndContent(post);
  const body = shortNewsFlipBody(post);

  useEffect(() => {
    if (!isActive) return;
    markArticleAsRead(post.slug);
    setLiked(localStorage.getItem(`vaartanow-liked-${post.slug}`) === "true");
    setDisliked(localStorage.getItem(`vaartanow-disliked-${post.slug}`) === "true");
    setLikeCount(
      parseInt(localStorage.getItem(`vaartanow-likes-count-${post.slug}`) || "", 10) ||
        18 + (post.title.length % 40)
    );
    setDislikeCount(
      parseInt(localStorage.getItem(`vaartanow-dislikes-count-${post.slug}`) || "", 10) ||
        1 + (post.slug.length % 5)
    );
  }, [isActive, post.slug, post.title.length]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next && disliked) {
      setDisliked(false);
      setDislikeCount((c) => Math.max(0, c - 1));
      localStorage.setItem(`vaartanow-disliked-${post.slug}`, "false");
    }
    const nextCount = next ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(nextCount);
    localStorage.setItem(`vaartanow-liked-${post.slug}`, String(next));
    localStorage.setItem(`vaartanow-likes-count-${post.slug}`, String(nextCount));
  };

  const toggleDislike = () => {
    const next = !disliked;
    setDisliked(next);
    if (next && liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      localStorage.setItem(`vaartanow-liked-${post.slug}`, "false");
    }
    const nextCount = next ? dislikeCount + 1 : Math.max(0, dislikeCount - 1);
    setDislikeCount(nextCount);
    localStorage.setItem(`vaartanow-disliked-${post.slug}`, String(next));
    localStorage.setItem(`vaartanow-dislikes-count-${post.slug}`, String(nextCount));
  };

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/news/${post.slug}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`*${post.title}*\n\n${body}\n\n👉 ${url}`)}`,
      "_blank"
    );
  };

  return (
    <article
      data-snap-index={index}
      className="relative mx-auto flex h-full w-full max-w-[520px] flex-col overflow-hidden rounded-none bg-white shadow-sm sm:rounded-2xl sm:border sm:border-slate-200"
    >
      <div className="relative h-[36%] min-h-[180px] w-full shrink-0 overflow-hidden bg-slate-900">
        {post.og_image ? (
          <img
            src={post.og_image}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-2xl font-black text-white">
            VaartaNow
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
            {categoryLabel(category, lang)}
          </span>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-black/35 ring-2 ring-white/70">
            <Play className="ml-0.5 size-6 fill-white text-white" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white drop-shadow">
              {post.author_name || "VaartaNow"}
            </p>
            <p className="truncate text-[11px] font-semibold text-white/85">
              <MapPin className="mr-0.5 inline size-3" />
              {lang === "te" ? "తెలుగు న్యూస్" : "Telugu News"}
            </p>
          </div>
          <button
            onClick={() => toggleBookmark(post.slug)}
            className="grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md active:scale-95"
            aria-label="Bookmark"
          >
            {bookmarked ? (
              <BookmarkCheck className="size-4 fill-amber-400 text-amber-400" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-4">
        <h2 className="text-[1.12rem] font-black leading-snug text-[#1f2937] sm:text-[1.3rem]">
          {post.title}
        </h2>
        <p className="mt-3 text-[0.97rem] font-medium leading-[1.75] text-[#334155] sm:text-[1.04rem]">
          {body || post.excerpt}
        </p>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-2 pt-2">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatClock(post.published_at)}
          </span>
          <span>
            {index + 1} / {total}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-4 pl-1 text-slate-600">
            <button
              onClick={toggleLike}
              className={`flex flex-col items-center gap-0.5 active:scale-95 ${liked ? "text-blue-600" : ""}`}
            >
              <ThumbsUp className={`size-5 ${liked ? "fill-current" : ""}`} />
              <span className="text-[11px] font-bold">{likeCount}</span>
            </button>
            <button
              onClick={toggleDislike}
              className={`flex flex-col items-center gap-0.5 active:scale-95 ${disliked ? "text-rose-600" : ""}`}
            >
              <ThumbsDown className={`size-5 ${disliked ? "fill-current" : ""}`} />
              <span className="text-[11px] font-bold">{dislikeCount}</span>
            </button>
          </div>

          <button
            onClick={shareWhatsApp}
            className="flex -translate-y-1 flex-col items-center gap-0.5 active:scale-95"
            aria-label="Share on WhatsApp"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_6px_16px_rgba(37,211,102,0.45)] ring-4 ring-white">
              <WhatsAppIcon className="size-7" />
            </span>
            <span className="text-[10px] font-black tracking-wide text-slate-700">SHARE</span>
          </button>

          <div className="flex items-center gap-4 pr-1 text-slate-600">
            <button className="flex flex-col items-center gap-0.5" aria-label="Comments">
              <MessageSquare className="size-5" />
              <span className="text-[11px] font-bold">—</span>
            </button>
            <button aria-label="More">
              <MoreVertical className="size-5" />
            </button>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/news/${post.slug}`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: post.title, text: post.excerpt, url });
                  } catch {}
                } else {
                  await navigator.clipboard.writeText(url);
                }
              }}
              aria-label="Share"
            >
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

interface VerticalSnapFeedProps {
  posts: BlogPost[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function VerticalSnapFeed({
  posts,
  loading,
  hasMore,
  onLoadMore,
}: VerticalSnapFeedProps) {
  const { lang } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const loadMoreLock = useRef(false);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.55)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.snapIndex);
        if (!Number.isNaN(idx)) setActiveIndex(idx);
      },
      { root, threshold: [0.55, 0.75] }
    );

    root.querySelectorAll("[data-snap-index]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [posts]);

  // Load more when near the end
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    if (activeIndex < posts.length - 3) {
      loadMoreLock.current = false;
      return;
    }
    if (loadMoreLock.current || loading) return;
    loadMoreLock.current = true;
    onLoadMore();
  }, [activeIndex, hasMore, loading, onLoadMore, posts.length]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(posts.length - 1, index));
      const target = el.querySelector<HTMLElement>(`[data-snap-index="${clamped}"]`);
      if (target) el.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    },
    [posts.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, scrollToIndex]);

  if (loading && !posts.length) {
    return (
      <div className="mx-auto h-[calc(100dvh-9.5rem)] w-full max-w-[520px] space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-6 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-bold text-slate-500">
        {lang === "te" ? "వార్తలు లేవు" : "No articles available"}
      </div>
    );
  }

  return (
    <div className="relative -mx-3 sm:mx-0">
      <div
        ref={scrollerRef}
        className="h-[calc(100dvh-9.5rem)] w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth bg-[#eef1f4] sm:h-[calc(100dvh-8rem)] sm:rounded-2xl"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {posts.map((post, index) => (
          <div key={post.slug} className="h-full w-full shrink-0 snap-start snap-always px-0 sm:px-2 sm:py-2">
            <SnapCard
              post={post}
              index={index}
              total={posts.length}
              isActive={index === activeIndex}
              lang={lang}
            />
          </div>
        ))}
      </div>

      {activeIndex < posts.length - 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-0.5 rounded-full bg-black/40 px-3 py-1.5 text-white backdrop-blur-md">
            <ChevronDown className="size-4" />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {lang === "te" ? "స్వైప్" : "Swipe"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
