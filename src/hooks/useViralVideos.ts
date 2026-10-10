import { useEffect, useState } from "react";
import { getVideos, type VideoItem } from "@/lib/videos-api";

/** Latest official-channel short videos for sidebar / swiper widgets (refreshed every 10 minutes). */
export function useViralVideos(limit = 10) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getVideos(limit).then((list) => {
        if (!alive) return;
        setVideos(list);
        setLoading(false);
      });
    load();
    const timer = setInterval(load, 10 * 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [limit]);

  return { videos, loading };
}
