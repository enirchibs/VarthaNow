import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBookmarks } from "@/hooks/useBookmarks";

export interface ViralVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  channel: string;
  source_icon: string;
  clip: string;
  published_at: string;
}

export function useViralVideos(limit = 10) {
  const [videos, setVideos] = useState<ViralVideo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use bookmarks as a proxy for "interests"
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    let mounted = true;
    
    async function fetchVideos() {
      setLoading(true);
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch recent viral videos
        const { data, error } = await supabase
          .from("viral_videos")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        let fetchedVideos: ViralVideo[] = data || [];
        
        // --- PERSONALIZATION LOGIC ---
        // We will score the videos based on user interests (bookmarks)
        // to bubble up the most relevant ones.
        
        // 1. Extract interest keywords from bookmarks (which are slugs)
        const interestKeywords = new Set<string>();
        bookmarks.forEach(slug => {
          const words = slug.toLowerCase().split("-");
          words.forEach(w => {
            if (w.length > 3) interestKeywords.add(w);
          });
        });
        
        const now = Date.now();
        fetchedVideos.sort((a, b) => {
           const timeA = new Date(a.published_at || now).getTime();
           const timeB = new Date(b.published_at || now).getTime();
           const ageHoursA = Math.max(0, (now - timeA) / (1000 * 3600));
           const ageHoursB = Math.max(0, (now - timeB) / (1000 * 3600));

           let scoreA = (ageHoursA <= 24 ? 300 - ageHoursA * 10 : Math.max(0, 50 - ageHoursA)) + Math.random() * 5;
           let scoreB = (ageHoursB <= 24 ? 300 - ageHoursB * 10 : Math.max(0, 50 - ageHoursB)) + Math.random() * 5;
           
           const titleA = a.title.toLowerCase();
           const titleB = b.title.toLowerCase();
           const descA = (a.description || "").toLowerCase();
           const descB = (b.description || "").toLowerCase();
           
           // Boost score if it matches user interests
           interestKeywords.forEach(kw => {
              if (titleA.includes(kw) || descA.includes(kw)) scoreA += 15;
              if (titleB.includes(kw) || descB.includes(kw)) scoreB += 15;
           });
           
           return scoreB - scoreA; // Descending order
        });
        
        if (mounted) {
          setVideos(fetchedVideos.slice(0, limit));
        }
      } catch (err) {
        console.error("Error fetching viral videos:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    fetchVideos();
    
    return () => {
      mounted = false;
    };
  }, [bookmarks, limit]);

  return { videos, loading };
}

