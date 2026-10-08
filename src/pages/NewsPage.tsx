import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BlogPost } from "@/types/news";
import { getPostBySlug, getTrendingPosts } from "@/lib/news-api";
import { postStructuredData, setMeta } from "@/lib/seo";
import { useLanguage } from "@/hooks/useLanguage";
import { trackArticleView } from "@/lib/interest-tracker";
import { markArticleAsRead } from "@/lib/read-tracker";
import { Way2NewsSwiper, loadSwipeFeed } from "@/components/Way2NewsSwiper";

export function NewsPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  // Hydrate deck immediately from sessionStorage so swipe feed is ready on first paint
  const [deck, setDeck] = useState<BlogPost[]>(() => {
    const cached = loadSwipeFeed();
    if (cached?.posts?.length) return cached.posts;
    return [];
  });
  const [loading, setLoading] = useState(true);
  const skipFetchRef = useRef(false);
  const deckRef = useRef<BlogPost[]>(deck);
  deckRef.current = deck;

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }

    let mounted = true;
    setLoading(true);

    const cached = loadSwipeFeed();
    const cachedDeck = cached?.posts?.length ? cached.posts : null;

    // Show full feed right away while network fetch resolves
    if (cachedDeck?.length) setDeck(cachedDeck);

    Promise.all([getPostBySlug(slug), getTrendingPosts(30, lang)])
      .then(([item, trending]) => {
        if (!mounted) return;
        setPost(item);

        // Never collapse to a single article — keep grid/trending deck for swipe
        const existing = deckRef.current;
        if (cachedDeck?.length) {
          if (item && !cachedDeck.some((p) => p.slug === item.slug)) {
            setDeck([item, ...cachedDeck]);
          } else {
            setDeck(cachedDeck);
          }
        } else if (existing.length > 1) {
          setDeck(existing);
        } else if (item) {
          const others = trending.filter((entry) => entry.slug !== item.slug);
          setDeck([item, ...others]);
        } else {
          setDeck(trending);
        }

        if (item) {
          setMeta({
            title: item.meta_title || item.title,
            description: item.meta_description || item.excerpt,
            canonical: `/news/${item.slug}`,
            image: item.og_image,
            structuredData: postStructuredData(item),
          });
          try {
            trackArticleView(item.title, item.category);
            markArticleAsRead(slug);
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

  const swipePosts = useMemo(() => {
    if (deck.length) return deck;
    return post ? [post] : [];
  }, [deck, post]);

  const handleActiveChange = useCallback(
    (active: BlogPost) => {
      // Only update URL after a real user swipe — never replace the opened article
      if (!active?.slug || active.slug === slug) return;
      skipFetchRef.current = true;
      setPost(active);
      navigate(`/news/${active.slug}`, { replace: true });
      setMeta({
        title: active.meta_title || active.title,
        description: active.meta_description || active.excerpt,
        canonical: `/news/${active.slug}`,
        image: active.og_image,
        structuredData: postStructuredData(active),
      });
      try {
        trackArticleView(active.title, active.category);
        markArticleAsRead(active.slug);
      } catch {}
    },
    [navigate, slug]
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#eef1f4]">
        <div className="w-full max-w-[480px] space-y-3 px-4">
          <div className="skeleton aspect-video w-full rounded-none" />
          <div className="skeleton h-6 w-4/5 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-3/4 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!post && !swipePosts.length) {
    return (
      <main className="container-shell py-10 text-center text-lg font-black">
        {lang === "te" ? "కథనం కనబడలేదు." : "Article not found."}
        <div className="mt-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-red-600 px-5 py-2 text-xs font-black text-white"
          >
            {lang === "te" ? "హోమ్‌కు వెళ్ళండి" : "Go Home"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <Way2NewsSwiper
      posts={swipePosts}
      initialSlug={slug || post?.slug}
      onClose={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
      }}
      onActiveChange={handleActiveChange}
    />
  );
}
