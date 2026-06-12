import { useEffect, useState } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import { setMeta } from "@/lib/seo";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { Bookmark } from "lucide-react";

export function BookmarksPage() {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMeta({
      title: lang === "te" ? "భద్రపరిచిన వార్తలు | VaartaNow" : "Saved Articles | VaartaNow",
      description: "Read your bookmarked and saved news articles on VaartaNow.",
      canonical: "/bookmarks"
    });
    
    // Load saved IDs from localStorage
    const saved = localStorage.getItem("vaartanow-bookmarks");
    const savedIds = saved ? JSON.parse(saved) : [];

    if (savedIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchSavedPosts = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .in("id", savedIds);
        
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Failed to fetch bookmarked posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [lang]);

  return (
    <main className="container-shell space-y-5 py-6 min-h-[70vh]">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
        <Bookmark className="size-6 text-[hsl(var(--primary))]" />
        <h1 className="text-xl font-black">
          {lang === "te" ? "భద్రపరిచిన వార్తలు" : "Saved Articles"}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <p className="font-semibold text-sm">
            {lang === "te" ? "భద్రపరిచిన వార్తలు ఏవీ లేవు." : "No saved articles found."}
          </p>
        </div>
      ) : (
        <NewsGrid posts={posts} loading={false} />
      )}
    </main>
  );
}
