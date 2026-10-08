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
import { categoryCoverImages } from "@/lib/demo-data";
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

/** Short news flip body: keep ~70–80 words (Way2News-style brief) */
const FLIP_MIN_WORDS = 70;
const FLIP_MAX_WORDS = 80;
const FLIP_TARGET_WORDS = 75;

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
  // Prefer excerpt first, then fill from content so flips stay concise
  const excerpt = cleanFlipText(post.excerpt || "");
  const content = cleanFlipText(post.content || "");
  let source = excerpt;
  if (excerpt.split(/\s+/).filter(Boolean).length < FLIP_MIN_WORDS && content) {
    // Merge unique content after excerpt to reach 70–80 words
    const rest = content.startsWith(excerpt) ? content.slice(excerpt.length) : content;
    source = `${excerpt} ${rest}`.replace(/\s+/g, " ").trim();
  }
  if (!source) source = content;

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length <= FLIP_MAX_WORDS) return words.join(" ");

  // Cut near 75 words; prefer a sentence end between 70–80 when possible
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
  const body = shortNewsFlipBody(post);
  const shortCode = post.slug.slice(0, 8);
  const hasVideo = Boolean(post.video_url?.trim());

  return (
    <section
      data-swipe-index={index}
      className="relative mx-auto flex h-screen w-full max-w-[480px] shrink-0 snap-start snap-always flex-col overflow-hidden bg-white supports-[height:100svh]:h-[100svh]"
    >
      {/* Media — shorter on small phones so Telugu title + body stay readable */}
      <div className="relative h-[32%] min-h-[160px] max-h-[280px] w-full shrink-0 overflow-hidden bg-slate-900 sm:h-[38%] sm:min-h-[200px] sm:max-h-none">
        <img
          src={
            post.og_image ||
            categoryCoverImages[post.category] ||
            categoryCoverImages["andhra-pradesh"]
          }
          alt={post.title}
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          draggable={false}
          onError={(e) => {
            const el = e.currentTarget;
            const fallback =
              categoryCoverImages[post.category] || categoryCoverImages["andhra-pradesh"];
            if (el.src !== fallback) el.src = fallback;
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40" />

        {showBack && (
          <button
            onClick={onClose}
            className="absolute left-3 z-20 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md active:scale-95"
            style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}

        {hasVideo && (
          <button
            type="button"
            onClick={() => {
              const url = post.video_url!.trim();
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="absolute inset-0 z-[5] flex items-center justify-center"
            aria-label={lang === "te" ? "వీడియో ప్లే చేయండి" : "Play video"}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-black/45 ring-2 ring-white/70 backdrop-blur-sm active:scale-95">
              <Play className="ml-0.5 size-7 fill-white text-white" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3 sm:p-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="size-9 shrink-0 rounded-full border-2 border-white object-cover shadow sm:size-10"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-white bg-red-600 text-sm font-black text-white shadow sm:size-10">
                {(post.author_name || "V").charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-black text-white drop-shadow sm:text-sm">
                {post.author_name || "VaartaNow"}
              </p>
              <p className="truncate text-[10px] font-semibold text-white/90 sm:text-[11px]">
                {lang === "te" ? "రిపోర్టర్ · VaartaNow" : "Reporter · VaartaNow"}
              </p>
            </div>
          </div>
          <div className="flex max-w-[42%] shrink-0 flex-col items-end gap-1">
            <span className="max-w-full truncate rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-sm sm:px-2.5 sm:text-[10px]">
              vn.now/{shortCode}
            </span>
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-semibold text-white/95 sm:text-[10px]">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{lang === "te" ? "తెలుగు న్యూస్" : "Telugu News"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Story text — readable Telugu on phone; no nested scroll so swipe works */}
      <div className="min-h-0 flex-1 overflow-hidden px-4 pb-3 pt-3.5 sm:px-5 sm:pt-4">
        <h1 className="text-[1.2rem] font-black leading-[1.35] tracking-tight text-[#111827] sm:text-[1.35rem]">
          {post.title}
        </h1>
        <p className="mt-2.5 text-[1.02rem] font-medium leading-[1.7] text-[#1e293b] sm:mt-3 sm:text-[1.08rem] sm:leading-[1.75]">
          {body || post.excerpt}
        </p>
      </div>

      {/* Actions — clear tap targets + home-indicator safe area */}
      <div
        className="shrink-0 border-t border-slate-200 bg-white px-3 pt-2"
        style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatClock(post.published_at)}
          </span>
          <span className="tabular-nums">
            {index + 1} / {total}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-3 pl-0.5 text-slate-600 sm:gap-4 sm:pl-1">
            <button
              onClick={toggleLike}
              className={`flex min-w-[40px] flex-col items-center gap-0.5 py-1 active:scale-95 ${liked ? "text-blue-600" : ""}`}
            >
              <ThumbsUp className={`size-5 ${liked ? "fill-current" : ""}`} />
              <span className="text-[11px] font-bold">{likeCount}</span>
            </button>
            <button
              onClick={toggleDislike}
              className={`flex min-w-[40px] flex-col items-center gap-0.5 py-1 active:scale-95 ${disliked ? "text-rose-600" : ""}`}
            >
              <ThumbsDown className={`size-5 ${disliked ? "fill-current" : ""}`} />
              <span className="text-[11px] font-bold">{dislikeCount}</span>
            </button>
          </div>

          <button
            onClick={shareWhatsApp}
            className="flex -translate-y-0.5 flex-col items-center gap-0.5 active:scale-95"
            aria-label="Share on WhatsApp"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_6px_16px_rgba(37,211,102,0.45)] ring-4 ring-white">
              <WhatsAppIcon className="size-7" />
            </span>
            <span className="text-[10px] font-black tracking-wide text-slate-700">SHARE</span>
          </button>

          <div className="flex items-center gap-3 pr-0.5 text-slate-600 sm:gap-4 sm:pr-1">
            <button className="flex min-w-[40px] flex-col items-center gap-0.5 py-1 active:scale-95" aria-label="Comments">
              <MessageSquare className="size-5" />
              <span className="text-[11px] font-bold">{commentCount}</span>
            </button>
            <button className="flex size-10 items-center justify-center active:scale-95" aria-label="More">
              <MoreVertical className="size-5" />
            </button>
            <button
              onClick={shareNative}
              className="flex size-10 items-center justify-center active:scale-95"
              aria-label="Share"
            >
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
  const lastReportedSlug = useRef<string>(initialSlug || "");
  // Block URL sync until we have scrolled to the clicked article
  const trackingReadyRef = useRef(false);
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

  // Jump to the clicked article before the observer can rewrite the URL
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || posts.length === 0) return;

    // URL already matches the card the user swiped to — don't re-jump
    if (trackingReadyRef.current && lastReportedSlug.current === initialSlug) {
      return;
    }

    trackingReadyRef.current = false;
    const openedSlug = posts[startIndex]?.slug || initialSlug || "";
    lastReportedSlug.current = openedSlug;
    setActiveIndex(startIndex);

    const jumpToStart = () => {
      const target = el.querySelector<HTMLElement>(`[data-swipe-index="${startIndex}"]`);
      if (target) {
        el.scrollTo({ top: target.offsetTop, behavior: "auto" });
      }
    };

    jumpToStart();

    // Wait for layout + IntersectionObserver to settle on the correct card
    let cancelled = false;
    const readyTimer = window.setTimeout(() => {
      if (cancelled) return;
      jumpToStart();
      trackingReadyRef.current = true;
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
    };
  }, [startIndex, posts, initialSlug]);

  // Track which card is in view (only after initial positioning)
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!trackingReadyRef.current) return;
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
        className="h-screen w-full touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth supports-[height:100svh]:h-[100svh]"
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

      {/* Tap or swipe to open the next article — sits above action bar on phones */}
      {activeIndex < posts.length - 1 && (
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="absolute left-1/2 z-30 -translate-x-1/2 text-white"
          style={{ bottom: "max(5.5rem, calc(4.75rem + env(safe-area-inset-bottom)))" }}
          aria-label={lang === "te" ? "తర్వాతి వార్త" : "Next article"}
        >
          <div className="flex animate-bounce flex-col items-center gap-0.5 rounded-full bg-black/55 px-3.5 py-2 shadow-lg backdrop-blur-md active:scale-95">
            <ChevronDown className="size-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {lang === "te" ? "స్వైప్" : "Swipe"}
            </span>
          </div>
        </button>
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
          video_url: p.video_url,
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
