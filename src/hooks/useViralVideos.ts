import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBookmarks } from "@/hooks/useBookmarks";
import { getShortVideos, generateDailyViralShorts } from "@/lib/shorts-api";

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
      try {
        let fetchedVideos: ViralVideo[] = [];

        if (supabase) {
          try {
            const { data, error } = await supabase
              .from("viral_videos")
              .select("*")
              .order("published_at", { ascending: false })
              .limit(50);

            if (!error && data && data.length > 0) {
              fetchedVideos = data as ViralVideo[];
            }
          } catch (e) {
            console.warn("Supabase viral_videos query failed, using daily catalog fallback:", e);
          }
        }

        // Fallback to daily catalog if Supabase returned 0 rows
        if (fetchedVideos.length === 0) {
          const items = await getShortVideos();
          fetchedVideos = items.map((v, idx) => ({
            id: v.id || `short-${idx + 1}`,
            title: v.title,
            description: v.title,
            video_url: v.link,
            thumbnail_url: v.thumbnail,
            duration: v.duration,
            channel: v.channel,
            source_icon: v.source_icon,
            clip: v.clip,
            published_at: v.published_at || new Date(Date.now() - idx * 3600000).toISOString()
          }));
        }
        
        // --- PERSONALIZATION LOGIC ---
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
           
           const titleA = (a.title || "").toLowerCase();
           const titleB = (b.title || "").toLowerCase();
           const descA = (a.description || "").toLowerCase();
           const descB = (b.description || "").toLowerCase();
           
           interestKeywords.forEach(kw => {
              if (titleA.includes(kw) || descA.includes(kw)) scoreA += 15;
              if (titleB.includes(kw) || descB.includes(kw)) scoreB += 15;
           });
           
           return scoreB - scoreA;
        });
        
        if (mounted) {
          setVideos(fetchedVideos.slice(0, limit));
        }
      } catch (err) {
        console.error("Error fetching viral videos:", err);
        const fallback = generateDailyViralShorts().map((v, idx) => ({
          id: `fb-${idx}`,
          title: v.title,
          description: v.title,
          video_url: v.link,
          thumbnail_url: v.thumbnail,
          duration: v.duration,
          channel: v.channel,
          source_icon: v.source_icon,
          clip: v.clip,
          published_at: new Date(Date.now() - idx * 3600000).toISOString()
        }));
        if (mounted) setVideos(fallback.slice(0, limit));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    fetchVideos();
    
    // ⏱️ 5-MINUTE AUTO-POLLING INTERVAL (Runs every 5 minutes = 300,000 ms)
    const fiveMinInterval = setInterval(() => {
      fetchVideos();
    }, 300000);

    // 📡 SUPABASE REALTIME SUBSCRIPTION FOR INSTANT SHORTS UPDATES
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel("viral_videos_changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "viral_videos" }, () => {
          fetchVideos();
        })
        .subscribe();
    }

    return () => {
      mounted = false;
      clearInterval(fiveMinInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [bookmarks, limit]);

  return { videos, loading };
}
