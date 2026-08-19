import type { BlogPost, NewsCategory, SearchFilters } from "@/types/news";
import { demoPosts } from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";
import { getActiveLanguage, type Language } from "@/hooks/useLanguage";

export const PAGE_SIZE = 25;

function sortPublished(posts: BlogPost[]) {
  return [...posts].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

// 🔀 Deterministic pseudo-random number generator for seed-based shuffle
function pseudoRandom(seed: number | string, str: string): number {
  let hash = typeof seed === "number" ? seed : 0;
  const s = String(seed) + str;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

export interface PersonalizationOptions {
  shuffleSeed?: number | string;
  userLocation?: string | null;
  userInterests?: string[];
  userBookmarks?: string[];
  feedMode?: "all" | "personalized" | "location";
}

export function rankAndPersonalizePosts(
  posts: BlogPost[],
  options?: PersonalizationOptions
): BlogPost[] {
  const seed = options?.shuffleSeed ?? 1;
  const loc = (options?.userLocation || "").toLowerCase();
  const interests = (options?.userInterests || []).map((i) => i.toLowerCase());
  const bookmarks = options?.userBookmarks || [];
  const mode = options?.feedMode || "all";

  // Scoring mapping for location keywords
  const locationKeywords: Record<string, string[]> = {
    hyderabad: ["hyderabad", "telangana", "hitec city", "gachibowli", "uppal"],
    secunderabad: ["hyderabad", "secunderabad", "telangana"],
    warangal: ["warangal", "telangana", "kakatiya"],
    vijayawada: ["vijayawada", "andhra-pradesh", "amaravati", "gannavaram", "benz circle"],
    visakhapatnam: ["vizag", "visakhapatnam", "andhra-pradesh", "rushikonda"],
    vizag: ["vizag", "visakhapatnam", "andhra-pradesh", "rushikonda"],
    tirupati: ["tirupati", "tirumala", "andhra-pradesh", "ttd"],
    amaravati: ["amaravati", "andhra-pradesh", "vijayawada"],
    guntur: ["guntur", "andhra-pradesh", "amaravati"],
    kurnool: ["kurnool", "andhra-pradesh"],
    kakinada: ["kakinada", "andhra-pradesh"],
    rajahmundry: ["rajahmundry", "andhra-pradesh"]
  };

  const targetLocTokens: string[] = [];
  if (loc) {
    targetLocTokens.push(loc);
    Object.entries(locationKeywords).forEach(([key, tokens]) => {
      if (loc.includes(key)) {
        targetLocTokens.push(...tokens);
      }
    });
  }

  const scored = posts.map((post) => {
    let score = 0;
    let isLocationMatch = false;
    let isInterestMatch = false;
    let isFavoriteMatch = false;

    const postText = [
      post.title,
      post.excerpt,
      post.category,
      ...post.tags
    ].join(" ").toLowerCase();

    // 1. Location match (+60 pts)
    if (targetLocTokens.length > 0) {
      const match = targetLocTokens.some((tok) => postText.includes(tok));
      if (match) {
        isLocationMatch = true;
        score += 60;
      }
    }

    // 2. Favorite / Bookmark match (+50 pts)
    if (bookmarks.includes(post.slug) || bookmarks.includes(post.category)) {
      isFavoriteMatch = true;
      score += 50;
    }

    // 3. User Interests match (+30 pts)
    if (interests.length > 0) {
      const match = interests.some((interest) => postText.includes(interest));
      if (match) {
        isInterestMatch = true;
        score += 30;
      }
    }

    // 4. Feed Mode Boosts
    if (mode === "location" && isLocationMatch) score += 100;
    if (mode === "personalized" && (isFavoriteMatch || isInterestMatch)) score += 100;

    // 5. Freshness boost (+0..20 pts)
    const hoursOld = (Date.now() - new Date(post.published_at).getTime()) / (1000 * 3600);
    const freshnessScore = Math.max(0, 20 - hoursOld);
    score += freshnessScore;

    // 6. Dynamic Shuffle pseudo-random noise (+0..35 pts)
    const noise = pseudoRandom(seed, post.slug) * 35;
    score += noise;

    return {
      post: {
        ...post,
        isLocationMatch,
        isInterestMatch,
        isFavoriteMatch
      },
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.post);
}

export async function getPosts(
  page = 0,
  filters?: Partial<SearchFilters>,
  options?: PersonalizationOptions
) {
  const activeLang = filters?.language ?? getActiveLanguage();

  if (!supabase) {
    const filtered = filterPosts(demoPosts, { ...filters, language: activeLang });
    const ranked = rankAndPersonalizePosts(filtered, options);
    return ranked.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("language", activeLang)
    .order("published_at", { ascending: false })
    .range(0, 100); // Fetch top 100 to rank & shuffle dynamically

  if (filters?.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters?.query) {
    const value = `%${filters.query}%`;
    query = query.or(`title.ilike.${value},excerpt.ilike.${value},content.ilike.${value}`);
  }

  const { data, error } = await query;
  
  if (error || !data || data.length === 0) {
    if (error) console.error("Supabase getPosts error:", error);
    const filtered = filterPosts(demoPosts, { ...filters, language: activeLang });
    const ranked = rankAndPersonalizePosts(filtered, options);
    return ranked.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }
  
  const ranked = rankAndPersonalizePosts(data as BlogPost[], options);
  return ranked.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
}

export async function getAdminPosts(page = 0, filters?: Partial<SearchFilters>) {
  const activeLang = filters?.language ?? getActiveLanguage();

  if (!supabase) {
    const filtered = filterPosts(demoPosts, { ...filters, language: activeLang });
    return sortPublished(filtered).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("language", activeLang)
    .order("published_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filters?.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters?.query) {
    const value = `%${filters.query}%`;
    query = query.or(`title.ilike.${value},excerpt.ilike.${value},content.ilike.${value}`);
  }

  const { data, error } = await query;
  
  if (error || !data || data.length === 0) {
    if (error) console.error("Supabase getAdminPosts error:", error);
    const filtered = filterPosts(demoPosts, { ...filters, language: activeLang });
    return sortPublished(filtered).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }
  
  return data as BlogPost[];
}

export async function getPostBySlug(slug: string) {
  if (!supabase) return demoPosts.find((post) => post.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Supabase getPostBySlug error:", error);
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }
  
  return data as BlogPost | null;
}

export async function getFeaturedPosts(limit = 4, lang?: Language) {
  const activeLang = lang ?? getActiveLanguage();

  if (!supabase) {
    return sortPublished(demoPosts.filter((post) => post.featured && post.language === activeLang)).slice(0, limit);
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .eq("language", activeLang)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (error) console.error("Supabase getFeaturedPosts error:", error);
    return sortPublished(demoPosts.filter((post) => post.featured && post.language === activeLang)).slice(0, limit);
  }
  
  return data as BlogPost[];
}

export async function getTrendingPosts(limit = 6, lang?: Language) {
  const activeLang = lang ?? getActiveLanguage();

  if (!supabase) {
    return sortPublished(demoPosts.filter((post) => post.language === activeLang)).slice(0, limit);
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("language", activeLang)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (error) console.error("Supabase getTrendingPosts error:", error);
    return sortPublished(demoPosts.filter((post) => post.language === activeLang)).slice(0, limit);
  }
  
  return data as BlogPost[];
}

export async function updatePost(slug: string, patch: Partial<BlogPost>) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("blog_posts").update(patch).eq("slug", slug);
  if (error) throw error;
}

export async function deletePost(slug: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
  if (error) throw error;
}

export async function createPost(post: Omit<BlogPost, "id" | "created_at" | "updated_at">) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...post,
      published_at: post.published_at || new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function getFavoritePosts(page = 0, categoriesList: string[], lang?: Language) {
  const activeLang = lang ?? getActiveLanguage();

  if (categoriesList.length === 0) return [];

  if (!supabase) {
    const filtered = demoPosts.filter((post) => post.language === activeLang && categoriesList.includes(post.category));
    return sortPublished(filtered).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("language", activeLang)
    .in("category", categoriesList)
    .order("published_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error || !data || data.length === 0) {
    if (error) console.error("Supabase getFavoritePosts error:", error);
    const filtered = demoPosts.filter((post) => post.language === activeLang && categoriesList.includes(post.category));
    return sortPublished(filtered).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  return data as BlogPost[];
}

function filterPosts(posts: BlogPost[], filters?: Partial<SearchFilters>) {
  const activeLang = filters?.language ?? getActiveLanguage();
  return posts.filter((post) => {
    if (post.language !== activeLang) return false;
    if (filters?.category && filters.category !== "all" && post.category !== filters.category) return false;
    if (!filters?.query) return true;
    const search = filters.query.toLowerCase();
    return [post.title, post.excerpt, post.content, post.category, post.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

export function categoryPath(category: NewsCategory) {
  return `/category/${category}`;
}
