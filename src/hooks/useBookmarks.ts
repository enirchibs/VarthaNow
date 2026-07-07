import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ─── useBookmarks ────────────────────────────────────────────────
// Syncs bookmarks to Supabase `user_bookmarks` table when logged in.
// Falls back to localStorage when logged out (guest mode).
// ────────────────────────────────────────────────────────────────

const LOCAL_KEY = "vaartanow-bookmarks-v2";

function getLocalBookmarks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalBookmarks(slugs: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(slugs));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(getLocalBookmarks);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Get auth user
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!supabase || !userId) return;
    setSyncing(true);
    supabase
      .from("user_bookmarks")
      .select("post_slug")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) {
          const slugs = data.map((r: { post_slug: string }) => r.post_slug);
          setBookmarks(slugs);
          setLocalBookmarks(slugs);
        }
        setSyncing(false);
      });
  }, [userId]);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.includes(slug),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (slug: string) => {
      const already = bookmarks.includes(slug);
      const next = already
        ? bookmarks.filter((s) => s !== slug)
        : [...bookmarks, slug];

      setBookmarks(next);
      setLocalBookmarks(next);

      if (!supabase || !userId) return; // guest mode — localStorage only

      if (already) {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("post_slug", slug);
      } else {
        await supabase
          .from("user_bookmarks")
          .upsert({ user_id: userId, post_slug: slug }, { onConflict: "user_id,post_slug" });
      }
    },
    [bookmarks, userId]
  );

  return { bookmarks, isBookmarked, toggleBookmark, syncing };
}
