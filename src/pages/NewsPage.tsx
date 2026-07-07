import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, Instagram, MessageCircle, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import type { BlogPost } from "@/types/news";
import { getPostBySlug, getTrendingPosts } from "@/lib/news-api";
import { categoryLabel } from "@/lib/categories";
import { markdownToHtml, timeAgo } from "@/lib/format";
import { postStructuredData, setMeta } from "@/lib/seo";
import { Badge } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";
import { ReadingProgress } from "@/components/ReadingProgress";
import { useBookmarks } from "@/hooks/useBookmarks";

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
      <main className="container-shell py-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <div className="skeleton h-5 w-24 rounded-full" />
            <div className="skeleton h-9 w-full rounded-xl" />
            <div className="skeleton h-9 w-3/4 rounded-xl" />
            <div className="skeleton aspect-video w-full rounded-2xl" />
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-4 w-full rounded" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="container-shell py-6 text-lg font-black">
        {lang === "te" ? "కథనం కనబడలేదు." : lang === "en" ? "Article not found." : lang === "hi" ? "लेख नहीं मिला।" : lang === "ta" ? "கட்டுரை காணப்படவில்லை." : "ಲೇಖನ ಕಂಡುಬಂದಿಲ್ಲ."}
      </main>
    );
  }

  const shareUrl = `${window.location.origin}/news/${post.slug}`;
  const bookmarked = isBookmarked(post.slug);
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

  return (
    <>
      <ReadingProgress />
      <main className="container-shell grid gap-5 py-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="p-4 md:p-6">
          {/* Back + Breadcrumb */}
          <div className="mb-4 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-[hsl(var(--primary))]">
              <ArrowLeft className="size-4" />
              {lang === "te" ? "హోమ్" : lang === "en" ? "Home" : lang === "hi" ? "होम" : lang === "ta" ? "முகப்பு" : "ಮುಖಪುಟ"}
            </Link>

            {/* Font size controls */}
            <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1">
              <button
                onClick={() => setFontSize("small")}
                className={`rounded-full px-2 py-0.5 text-[9px] font-black transition ${ fontSize === "small" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]" }`}
                aria-label="Small font"
              >A</button>
              <button
                onClick={() => setFontSize("medium")}
                className={`rounded-full px-2 py-0.5 text-[11px] font-black transition ${ fontSize === "medium" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]" }`}
                aria-label="Medium font"
              >A</button>
              <button
                onClick={() => setFontSize("large")}
                className={`rounded-full px-2 py-0.5 text-[14px] font-black transition ${ fontSize === "large" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]" }`}
                aria-label="Large font"
              >A</button>
            </div>
          </div>
          <div className="block">
            <Badge>{categoryLabel(post.category, lang)}</Badge>
          </div>
          <h1 className="mt-4 text-2xl font-black leading-tight md:text-4xl">{post.title}</h1>
          <p className="mt-3 text-base leading-8 text-[hsl(var(--muted-foreground))]">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            {/* Source with logo */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-wide">
              {post.source_logo ? (
                <img
                  src={post.source_logo}
                  alt={post.author_name}
                  width={16}
                  height={16}
                  className="rounded object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <span className="size-4 rounded bg-blue-500 grid place-items-center text-white text-[8px] font-black">
                  {post.author_name.charAt(0).toUpperCase()}
                </span>
              )}
              {post.author_name}
              <span className="text-[10px]">✓</span>
            </span>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <span>{timeAgo(post.published_at)}</span>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <span>
              {post.reading_time_min} {lang === "te" ? "నిమిషాల పఠనం" : lang === "en" ? "min read" : lang === "hi" ? "మినీ పఠనం" : lang === "ta" ? "நிமிட வாசிப்பு" : "ನಿಮಿಷ ಓದುವಿಕೆ"}
            </span>
          </div>
          {/* Share + Bookmark bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-b border-[hsl(var(--border))]/50 py-2.5">
            <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] mr-1">
              {lang === "te" ? "షేర్:" : "Share:"}
            </span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}\n${shareUrl}`)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200"
              target="_blank" rel="noreferrer"
            >
              <MessageCircle className="size-3.5 fill-current" /> WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all duration-200"
              target="_blank" rel="noreferrer"
            >
              <Send className="size-3.5" /> Telegram
            </a>
            <button
              onClick={shareToInstagram}
              className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-500 hover:text-white transition-all duration-200"
            >
              <Instagram className="size-3.5" /> Instagram
            </button>
            {/* Bookmark */}
            <button
              onClick={() => toggleBookmark(post.slug)}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 ${ bookmarked ? "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))]/15 hover:text-[hsl(var(--primary))]" }`}
            >
              {bookmarked
                ? <><BookmarkCheck className="size-3.5" /> {lang === "te" ? "సేవ్ అయింది" : "Saved"}</>
                : <><Bookmark className="size-3.5" /> {lang === "te" ? "సేవ్ చేయి" : "Save"}</>}
            </button>
          </div>

          {/* Read Original Article link (copyright compliance) */}
          {hasSourceLink && (
            <a
              href={(post as any).source_article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/10 hover:text-[hsl(var(--primary))] transition-all duration-200"
            >
              <ExternalLink className="size-3.5" />
              {lang === "te" ? `మూల వార్త: ${post.author_name} లో చదవండి` : `Read original at ${post.author_name}`}
            </a>
          )}
        </div>
        <div className="relative w-full">
          {(() => {
            const ytId = (() => {
              const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/i;
              const match = post.content?.match(youtubeRegex) || post.excerpt?.match(youtubeRegex) || post.slug?.match(youtubeRegex);
              return match ? match[1] : null;
            })();
            
            if (ytId) {
              return (
                <div className="relative aspect-video w-full overflow-hidden bg-black shadow-inner border-y border-[hsl(var(--border))]/50">
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
              <img src={post.og_image} alt={post.title} referrerPolicy="no-referrer" className="max-h-[32rem] w-full object-cover animate-in fade-in duration-500" />
            ) : null;
          })()}
          
          {/* Floating Share Buttons on top of image/video banner */}
          <div className="absolute right-3 top-3 z-10 flex gap-2">
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}\n${shareUrl}`)}`}
              className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-emerald-500 hover:scale-105"
              target="_blank"
              rel="noreferrer"
              title="Share on WhatsApp"
            >
              <MessageCircle className="size-3.5 fill-current" />
            </a>
            <button 
              onClick={shareToInstagram}
              className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-pink-500 hover:scale-105"
              title="Share on Instagram"
            >
              <Instagram className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="article-content px-4 py-6 md:px-8">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[hsl(var(--border))] p-4">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            to={`/search?q=${encodeURIComponent(tag)}`}
            className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-bold hover:bg-[hsl(var(--primary))]/15 hover:text-[hsl(var(--primary))] transition-colors"
          >
            #{tag}
          </Link>
        ))}
        </div>
      </article>

      <aside className="space-y-4">
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="mb-3 font-black">
            {lang === "te" && "షేర్ చేయండి"}
            {lang === "en" && "Share"}
            {lang === "hi" && "शेयर करें"}
            {lang === "ta" && "பகிர்"}
            {lang === "kn" && "ಹಂಚಿಕೊಳ್ಳಿ"}
          </h2>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`} className="grid size-11 place-items-center rounded-full bg-emerald-500 text-white" target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} className="grid size-11 place-items-center rounded-full bg-blue-500 text-white" target="_blank" rel="noreferrer">
              <Send className="size-4" />
            </a>
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
          AdSense 300x600
        </div>
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="mb-3 font-black">
            {lang === "te" && "ఇంకా చదవండి"}
            {lang === "en" && "Read More"}
            {lang === "hi" && "और पढ़ें"}
            {lang === "ta" && "மேலும் படிக்க"}
            {lang === "kn" && "ಹೆಚ್ಚು ಓದಿ"}
          </h2>
          <div className="space-y-3">
            {related.map((item) => (
              <Link key={item.slug} to={`/news/${item.slug}`} className="block border-b border-[hsl(var(--border))] pb-3 text-sm font-black last:border-0 last:pb-0">
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
