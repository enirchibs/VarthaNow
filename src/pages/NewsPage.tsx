import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, Share2 } from "lucide-react";
import type { BlogPost } from "@/types/news";
import { getPostBySlug, getTrendingPosts } from "@/lib/news-api";
import { categoryLabel } from "@/lib/categories";
import { markdownToHtml, timeAgo } from "@/lib/format";
import { postStructuredData, setMeta } from "@/lib/seo";
import { Badge } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";

export function NewsPage() {
  const { lang } = useLanguage();
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
      <main className="container-shell py-6 text-sm font-bold">
        {lang === "te" ? "లోడ్ అవుతోంది..." : lang === "en" ? "Loading..." : lang === "hi" ? "लोड हो रहा है..." : lang === "ta" ? "ஏற்றப்படுகிறது..." : "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."}
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

  return (
    <main className="container-shell grid gap-5 py-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="p-4 md:p-6">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[hsl(var(--primary))]">
            <ArrowLeft className="size-4" />
            {lang === "te" ? "హోమ్" : lang === "en" ? "Home" : lang === "hi" ? "होम" : lang === "ta" ? "முகப்பு" : "ಮುಖಪುಟ"}
          </Link>
          <div className="block">
            <Badge>{categoryLabel(post.category, lang)}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-[hsl(var(--muted-foreground))]">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-[hsl(var(--muted-foreground))]">
            {/* Source with logo */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-2.5 py-1 text-xs font-black text-blue-600 dark:text-blue-400 tracking-wide">
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
              <span className="text-sm">✓</span>
            </span>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <span>{timeAgo(post.published_at)}</span>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <span>
              {post.reading_time_min} {lang === "te" ? "నిమిషాల పఠనం" : lang === "en" ? "min read" : lang === "hi" ? "మినీ పఠనం" : lang === "ta" ? "நிமிட வாசிப்பு" : "ನಿಮಿಷ ಓದುವಿಕೆ"}
            </span>
          </div>
        </div>
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
        <div className="article-content px-4 py-6 md:px-8">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[hsl(var(--border))] p-4">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-bold">
              #{tag}
            </span>
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
              <Share2 className="size-4" />
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
  );
}
