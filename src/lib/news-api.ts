import type { BlogPost, NewsCategory, SearchFilters } from "@/types/news";
import { demoPosts } from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";
import { getActiveLanguage, type Language } from "@/hooks/useLanguage";

const PAGE_SIZE = 9;

function sortPublished(posts: BlogPost[]) {
  return [...posts].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

export async function getPosts(page = 0, filters?: Partial<SearchFilters>) {
  const activeLang = filters?.language ?? getActiveLanguage();

  if (!supabase) {
    const filtered = filterPosts(demoPosts, { ...filters, language: activeLang });
    return sortPublished(filtered).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
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
    if (error) console.error("Supabase getPosts error:", error);
    const filtered = filterPosts(demoPosts, { ...filters, language: activeLang });
    return sortPublished(filtered).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }
  
  return data as BlogPost[];
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
