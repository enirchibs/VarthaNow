import { useCallback, useEffect, useState } from "react";
import { getFeaturedPosts, getPosts, getTrendingPosts } from "@/lib/news-api";
import type { BlogPost, SearchFilters } from "@/types/news";
import { useLanguage } from "@/hooks/useLanguage";

export function useInfinitePosts(filters?: Partial<SearchFilters>) {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [filters?.query, filters?.category, lang]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPosts(page, { ...filters, language: lang })
      .then((items) => {
        if (!mounted) return;
        setPosts((current) => (page === 0 ? items : [...current, ...items]));
        setHasMore(items.length >= 9);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, filters?.query, filters?.category, lang]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((value) => value + 1);
  }, [loading, hasMore]);

  return { posts, loading, hasMore, error, loadMore };
}

export function useHomeData() {
  const { lang } = useLanguage();
  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [trending, setTrending] = useState<BlogPost[]>([]);

  useEffect(() => {
    Promise.all([getFeaturedPosts(4, lang), getTrendingPosts(6, lang)]).then(([featuredItems, trendingItems]) => {
      setFeatured(featuredItems);
      setTrending(trendingItems);
    });
  }, [lang]);

  return { featured, trending };
}
