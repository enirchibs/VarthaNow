import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useBirthLocation } from "@/hooks/useBirthLocation";

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
  const { location } = useBirthLocation(); // Example for location

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
        // We will score the videos based on user interests (bookmarks) and location
        // to bubble up the most relevant ones.
        
        // 1. Extract interest keywords from bookmarks (e.g. titles or categories)
        const interestKeywords = new Set<string>();
        bookmarks.forEach(bm => {
          if (bm.category) interestKeywords.add(bm.category.toLowerCase());
          const words = bm.title.toLowerCase().split(/\s+/);
          words.forEach(w => {
             if (w.length > 3) interestKeywords.add(w);
          });
        });
        
        const locKeyword = location?.city?.toLowerCase() || "";
        
        fetchedVideos.sort((a, b) => {
           let scoreA = Math.random() * 10; // Base randomness
           let scoreB = Math.random() * 10;
           
           const titleA = a.title.toLowerCase();
           const titleB = b.title.toLowerCase();
           const descA = (a.description || "").toLowerCase();
           const descB = (b.description || "").toLowerCase();
           
           // Boost score if it matches user interests
           interestKeywords.forEach(kw => {
              if (titleA.includes(kw) || descA.includes(kw)) scoreA += 50;
              if (titleB.includes(kw) || descB.includes(kw)) scoreB += 50;
           });
           
           // Boost score if it matches user location
           if (locKeyword) {
              if (titleA.includes(locKeyword) || descA.includes(locKeyword)) scoreA += 100;
              if (titleB.includes(locKeyword) || descB.includes(locKeyword)) scoreB += 100;
           }
           
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
  }, [bookmarks, location, limit]);

  return { videos, loading };
}
