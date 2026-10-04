import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
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
import { useLanguage } from "@/hooks/useLanguage";
import { markArticleAsRead } from "@/lib/read-tracker";
import { stripFAQ, timeAgo } from "@/lib/format";
import type { BlogPost } from "@/types/news";

export const SWIPE_FEED_STORAGE_KEY = "vaartanow-swipe-feed";

interface Way2NewsSwiperProps {
  posts: BlogPost[];
  initialSlug?: string;
  onClose: () => void;
  onActiveChange?: (post: BlogPost) => void;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function plainBody(post: BlogPost): string {
  const raw = stripFAQ(post.content || post.excerpt || "");
  return raw
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>~]/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
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

function publisherAvatar(post: BlogPost): string | null {
  if (post.source_logo) return post.source_logo;
  const name = (post.author_name || "").toLowerCase();
  const map: Record<string, string> = {
    tv9: "tv9telugu.com",
    ntv: "ntvtelugu.com",
    sakshi: "sakshi.com",
    eenadu: "eenadu.net",
    way2news: "way2news.co",
    disha: "dishanews.in",
    abp: "telugu.abplive.com",
    v6: "v6velugu.com",
  };
  for (const [key, domain] of Object.entries(map)) {
    if (name.includes(key)) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  return null;
}

function NewsSwipeCard({
  post,
  index,
  total,
  isActive,
  showBack,
  onClose,
  lang,
}: {
  post: BlogPost;
  index: number;
  total: number;
  isActive: boolean;
  showBack: boolean;
  onClose: () => void;
  lang: string;
}) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

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
    try {
      const comments = localStorage.getItem(`vaartanow-comments-${post.slug}`);
      setCommentCount(comments ? JSON.parse(comments).length : 2 + (post.title.length % 6));
    } catch {
      setCommentCount(2);
    }
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
    const text = `*${post.title}*\n\n${post.excerpt || ""}\n\n👉 ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareNative = async () => {
    const url = `${window.location.origin}/news/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const avatar = publisherAvatar(post);
  const body = plainBody(post);
  const shortCode = post.slug.slice(0, 8);

  return (
    <section
      data-swipe-index={index}
      className="relative mx-auto flex h-[100dvh] w-full max-w-[480px] shrink-0 snap-start snap-always flex-col overflow-hidden bg-white"
    >
      {/* Media */}
      <div className="relative h-[38%] min-h-[200px] w-full shrink-0 overflow-hidden bg-slate-900">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35" />

        {showBack && (
          <button
            onClick={onClose}
            className="absolute left-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-black/35 ring-2 ring-white/70 backdrop-blur-sm">
            <Play className="ml-0.5 size-7 fill-white text-white" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3">
          <div className="flex min-w-0 items-center gap-2">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="size-10 shrink-0 rounded-full border-2 border-white object-cover shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-white bg-red-600 text-sm font-black text-white shadow">
                {(post.author_name || "V").charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white drop-shadow">
                {post.author_name || "VaartaNow"}
              </p>
              <p className="truncate text-[11px] font-semibold text-white/85">
                {lang === "te" ? "రిపోర్టర్ · VaartaNow" : "Reporter · VaartaNow"}
              </p>
            </div>
          </div>
          <div className="flex max-w-[46%] flex-col items-end gap-1">
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              vn.now/{shortCode}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/90">
              <MapPin className="size-3" />
              {lang === "te" ? "తెలుగు న్యూస్" : "Telugu News"}
            </span>
          </div>
        </div>
      </div>

      {/* Story text */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-4">
        <h1 className="text-[1.15rem] font-black leading-snug tracking-tight text-[#1f2937] sm:text-[1.35rem]">
          {post.title}
        </h1>
        <div className="mt-3 whitespace-pre-wrap text-[0.95rem] font-medium leading-[1.7] text-[#334155] sm:text-[1.02rem]">
          {body || post.excerpt}
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatClock(post.published_at)}
          </span>
          <span>
            {index + 1} of {total} Pages
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
            <button className="flex flex-col items-center gap-0.5 active:scale-95" aria-label="Comments">
              <MessageSquare className="size-5" />
              <span className="text-[11px] font-bold">{commentCount}</span>
            </button>
            <button className="active:scale-95" aria-label="More">
              <MoreVertical className="size-5" />
            </button>
            <button onClick={shareNative} className="active:scale-95" aria-label="Share">
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Way2NewsSwiper({
  posts,
  initialSlug,
  onClose,
  onActiveChange,
}: Way2NewsSwiperProps) {
  const { lang } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastReportedSlug = useRef<string>("");
  const startIndex = useMemo(() => {
    if (!initialSlug) return 0;
    const idx = posts.findIndex((p) => p.slug === initialSlug);
    return idx >= 0 ? idx : 0;
  }, [initialSlug, posts]);

  const [activeIndex, setActiveIndex] = useState(startIndex);

  // Lock page scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Jump to starting card once
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || posts.length === 0) return;
    const target = el.querySelector<HTMLElement>(`[data-swipe-index="${startIndex}"]`);
    if (target) {
      el.scrollTo({ top: target.offsetTop, behavior: "auto" });
      setActiveIndex(startIndex);
    }
  }, [startIndex, posts.length]);

  // Track which card is in view
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.55)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.swipeIndex);
        if (Number.isNaN(idx)) return;
        setActiveIndex(idx);
        const post = posts[idx];
        if (post && post.slug !== lastReportedSlug.current) {
          lastReportedSlug.current = post.slug;
          onActiveChange?.(post);
        }
      },
      { root, threshold: [0.55, 0.75] }
    );

    root.querySelectorAll("[data-swipe-index]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [posts, onActiveChange]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(posts.length - 1, index));
    const target = el.querySelector<HTMLElement>(`[data-swipe-index="${clamped}"]`);
    if (target) {
      el.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    }
  }, [posts.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, onClose, scrollToIndex]);

  if (!posts.length) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white">
        <p className="text-sm font-bold text-slate-500">
          {lang === "te" ? "వార్తలు లేవు" : "No articles available"}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-[#0f172a]">
      <div
        ref={scrollerRef}
        className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {posts.map((post, index) => (
          <NewsSwipeCard
            key={post.slug}
            post={post}
            index={index}
            total={posts.length}
            isActive={index === activeIndex}
            showBack={index === activeIndex}
            onClose={onClose}
            lang={lang}
          />
        ))}
      </div>

      {/* Swipe hint */}
      {activeIndex < posts.length - 1 && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 animate-bounce text-white/70 sm:bottom-28">
          <div className="flex flex-col items-center gap-0.5 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-md">
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

/** Persist feed list so /news/:slug can open as a vertical swipe deck */
export function saveSwipeFeed(posts: BlogPost[], startSlug: string) {
  try {
    sessionStorage.setItem(
      SWIPE_FEED_STORAGE_KEY,
      JSON.stringify({
        startSlug,
        posts: posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          category: p.category,
          tags: p.tags,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
          og_image: p.og_image,
          author_name: p.author_name,
          source_logo: p.source_logo,
          language: p.language,
          published: p.published,
          featured: p.featured,
          reading_time_min: p.reading_time_min,
          published_at: p.published_at,
        })),
      })
    );
  } catch {}
}

export function loadSwipeFeed(): { posts: BlogPost[]; startSlug: string } | null {
  try {
    const raw = sessionStorage.getItem(SWIPE_FEED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.posts?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
