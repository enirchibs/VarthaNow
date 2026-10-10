import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVideos, timeAgoTe, type VideoItem } from "@/lib/videos-api";

/**
 * Read-only view of the short-video section. Videos are added only by the pipeline
 * (scripts/ingest-youtube-shorts.ts) from the official channels listed in
 * scripts/config/video-channels.json — never from the browser.
 */
export function VideoNewsAdminDashboard() {
  const [videos, setVideos] = useState<VideoItem[] | null>(null);

  useEffect(() => {
    getVideos(50).then(setVideos);
  }, []);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm">
        <h2 className="text-lg font-black">Short videos</h2>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Added automatically every 2 hours from official channels only. To add or remove a channel, edit
          <code className="mx-1 rounded bg-[hsl(var(--muted))] px-1">scripts/config/video-channels.json</code>.
        </p>
      </div>

      {!videos ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : !videos.length ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No videos yet.</p>
      ) : (
        <ul className="divide-y divide-[hsl(var(--border))] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {videos.map((v) => (
            <li key={v.id} className="flex gap-3 p-3">
              <img src={v.thumbnail} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" loading="lazy" />
              <div className="min-w-0 text-sm">
                <Link to={`/videos/${v.id}`} className="font-bold hover:underline">{v.title}</Link>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{v.channel} · {v.duration} · {timeAgoTe(v.publishedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
