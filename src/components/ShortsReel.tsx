import { useEffect, useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui";
import { getVideos, type VideoItem } from "@/lib/videos-api";

/**
 * Vertical short-video reel: one card per screen, swipe/scroll to the next.
 * Videos come only from official channels with our own Telugu context
 * (scripts/ingest-youtube-shorts.ts). When ads are enabled later, they belong
 * between cards, never on or over the player.
 */
export function ShortsReel() {
  const [videos, setVideos] = useState<VideoItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    getVideos(30).then((list) => alive && setVideos(list));
    return () => {
      alive = false;
    };
  }, []);

  if (!videos) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="aspect-[9/16] max-h-[70vh] w-full rounded-[1.4rem]" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="mx-auto max-w-md rounded-[1.4rem] border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
        ప్రస్తుతం వీడియోలు అందుబాటులో లేవు. కొద్దిసేపటి తర్వాత మళ్ళీ చూడండి.
      </div>
    );
  }

  return (
    <section className="mx-auto max-h-[calc(100vh-9rem)] max-w-md snap-y snap-mandatory space-y-4 overflow-y-auto pb-4 no-scrollbar" aria-label="వైరల్ వీడియోలు">
      {videos.map((video) => (
        <div key={video.id} className="snap-start">
          <VideoCard video={video} />
        </div>
      ))}
    </section>
  );
}
