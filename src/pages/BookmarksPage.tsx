import { useEffect, useState } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import { setMeta } from "@/lib/seo";
import { useLanguage } from "@/hooks/useLanguage";
import { useBookmarks } from "@/hooks/useBookmarks";
import { getPostBySlug } from "@/lib/news-api";
import { demoPosts } from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/types/news";
import { Bookmark } from "lucide-react";

async function fetchBookmarkedPosts(slugs: string[]): Promise<BlogPost[]> {
  if (!slugs.length) return [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .in("slug", slugs);

      if (!error && data?.length) {
        const bySlug = new Map((data as BlogPost[]).map((p) => [p.slug, p]));
        return slugs
          .map((slug) => bySlug.get(slug) || demoPosts.find((p) => p.slug === slug) || null)
          .filter(Boolean) as BlogPost[];
      }
    } catch (err) {
      console.warn("Bookmark supabase fetch failed:", err);
    }
  }

  const posts: BlogPost[] = [];
  for (const slug of slugs) {
    const demo = demoPosts.find((p) => p.slug === slug);
    if (demo) {
      posts.push(demo);
      continue;
    }
    const remote = await getPostBySlug(slug);
    if (remote) posts.push(remote);
  }
  return posts;
}

export function BookmarksPage() {
  const { lang } = useLanguage();
  const { bookmarks, syncing } = useBookmarks();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMeta({
      title: lang === "te" ? "\u0C2D\u0C26\u0C4D\u0C30\u0C2A\u0C30\u0C3F\u0C1A\u0C3F\u0C28 \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41 | VaartaNow" : "Saved Articles | VaartaNow",
      description: "Read your bookmarked and saved news articles on VaartaNow.",
      canonical: "/bookmarks",
    });
  }, [lang]);

  useEffect(() => {
    let mounted = true;

    try {
      const legacy = localStorage.getItem("vaartanow-bookmarks");
      const current = localStorage.getItem("vaartanow-bookmarks-v2");
      if (legacy && !current) {
        const parsed = JSON.parse(legacy);
        if (
          Array.isArray(parsed) &&
          parsed.every((x) => typeof x === "string" && !/^\d+$/.test(x))
        ) {
          localStorage.setItem("vaartanow-bookmarks-v2", JSON.stringify(parsed));
        }
      }
    } catch {
      // ignore bad legacy data
    }

    if (!bookmarks.length) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchBookmarkedPosts(bookmarks).then((result) => {
      if (!mounted) return;
      setPosts(result);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [bookmarks]);

  return (
    <main className="container-shell space-y-5 py-6 min-h-[70vh]">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
        <Bookmark className="size-6 text-[hsl(var(--primary))]" />
        <h1 className="text-xl font-black">
          {lang === "te" ? "\u0C2D\u0C26\u0C4D\u0C30\u0C2A\u0C30\u0C3F\u0C1A\u0C3F\u0C28 \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41" : "Saved Articles"}
        </h1>
        {bookmarks.length > 0 && (
          <span className="ml-auto text-xs font-bold text-[hsl(var(--muted-foreground))]">
            {bookmarks.length}
          </span>
        )}
      </div>

      {loading || syncing ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))] space-y-2">
          <p className="font-semibold text-sm">
            {lang === "te"
              ? "\u0C2D\u0C26\u0C4D\u0C30\u0C2A\u0C30\u0C3F\u0C1A\u0C3F\u0C28 \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41 \u0C0F\u0C35\u0C40 \u0C32\u0C47\u0C35\u0C41."
              : "No saved articles found."}
          </p>
          <p className="text-xs">
            {lang === "te"
              ? "\u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C3E \u0C15\u0C3E\u0C30\u0C4D\u0C21\u0C4D \u0C2A\u0C48 \u0C2C\u0C41\u0C15\u0C4D\u200C\u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C4D \u0C10\u0C15\u0C3E\u0C28\u0C4D \u0C28\u0C4A\u0C15\u0C4D\u0C15\u0C3F \u0C38\u0C47\u0C35\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F."
              : "Tap the bookmark icon on a news card to save it here."}
          </p>
        </div>
      ) : (
        <NewsGrid posts={posts} loading={false} fillMinimum={false} />
      )}
    </main>
  );
}
