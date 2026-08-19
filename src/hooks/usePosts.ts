import { useCallback, useEffect, useState } from "react";
import {
  getFeaturedPosts,
  getPosts,
  getTrendingPosts,
  getFavoritePosts,
  PAGE_SIZE,
  type PersonalizationOptions
} from "@/lib/news-api";
import type { BlogPost, SearchFilters } from "@/types/news";
import { useLanguage } from "@/hooks/useLanguage";
import { getUserInterests } from "@/lib/interest-tracker";
import { getCachedGPSLocation } from "@/lib/location-detector";

export function useInfinitePosts(
  filters?: Partial<SearchFilters>,
  customOptions?: PersonalizationOptions
) {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic shuffle seed state
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());

  // Automatically fetch stored location and interests if not provided
  const currentLocation = customOptions?.userLocation ?? getCachedGPSLocation()?.city ?? "Hyderabad";
  const currentInterests = customOptions?.userInterests ?? getUserInterests();

  const options: PersonalizationOptions = {
    shuffleSeed: customOptions?.shuffleSeed ?? shuffleSeed,
    userLocation: currentLocation,
    userInterests: currentInterests,
    userBookmarks: customOptions?.userBookmarks ?? [],
    feedMode: customOptions?.feedMode ?? "all"
  };

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [filters?.query, filters?.category, lang, options.shuffleSeed, options.feedMode, options.userLocation]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPosts(page, { ...filters, language: lang }, options)
      .then((items) => {
        if (!mounted) return;
        setPosts((current) => (page === 0 ? items : [...current, ...items]));
        setHasMore(items.length >= PAGE_SIZE);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, filters?.query, filters?.category, lang, options.shuffleSeed, options.feedMode, options.userLocation]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((value) => value + 1);
  }, [loading, hasMore]);

  const refreshFeed = useCallback(() => {
    setPosts([]);
    setPage(0);
    setShuffleSeed(Date.now());
  }, []);

  return { posts, loading, hasMore, error, loadMore, refreshFeed, shuffleSeed };
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

export function useFavoritePosts(categoriesList: string[], filters?: Partial<SearchFilters>) {
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
  }, [categoriesList, filters?.query, lang]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    if (categoriesList.length === 0) {
      setPosts([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    getFavoritePosts(page, categoriesList, lang)
      .then((items) => {
        if (!mounted) return;
        setPosts((current) => (page === 0 ? items : [...current, ...items]));
        setHasMore(items.length >= PAGE_SIZE);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [page, categoriesList, filters?.query, lang]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((value) => value + 1);
  }, [loading, hasMore]);

  return { posts, loading, hasMore, error, loadMore };
}
