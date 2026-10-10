import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Share2, Youtube, Newspaper } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { embedUrl, timeAgoTe, type VideoItem } from "@/lib/videos-api";

/**
 * Short-video card: thumbnail until tapped (the YouTube player is ~1 MB, so it loads only on demand),
 * then the official privacy-enhanced embed. Our Telugu headline + context sit below the player.
 */
export function VideoCard({ video, showPageLink = true }: { video: VideoItem; showPageLink?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const relatedQuery = video.title.split(/\s+/).slice(0, 3).join(" ");

  const share = () => {
    const url = `${SITE_URL}/videos/${video.id}`;
    if (navigator.share) navigator.share({ title: video.title, text: video.caption, url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
  };

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className="relative aspect-[9/16] max-h-[70vh] w-full bg-black sm:aspect-video">
        {playing ? (
          <iframe
            src={embedUrl(video.id)}
            title={video.title}
            className="absolute inset-0 size-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 size-full" aria-label={`ప్లే చేయండి: ${video.title}`}>
            <img src={video.thumbnail} alt={video.title} loading="lazy" className="size-full object-cover opacity-90 transition group-hover:opacity-100" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-red-600/90 text-white shadow-lg transition group-hover:scale-105">
                <Play className="size-8 fill-current" />
              </span>
            </span>
            {video.duration && <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-0.5 text-xs font-bold text-white">{video.duration}</span>}
          </button>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h2 className="text-lg font-black leading-snug">{video.title}</h2>
        {video.caption && <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{video.caption}</p>}
        <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
          📺 {video.channel} · {timeAgoTe(video.publishedAt)}
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs font-black">
          <Link to={`/search?q=${encodeURIComponent(relatedQuery)}`} className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5">
            <Newspaper className="size-3.5" /> సంబంధిత వార్తలు
          </Link>
          {showPageLink && (
            <Link to={`/videos/${video.id}`} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5">వివరాలు</Link>
          )}
          <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5">
            <Youtube className="size-3.5" /> YouTube లో చూడండి
          </a>
          <button type="button" onClick={share} className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5" aria-label="షేర్ చేయండి">
            <Share2 className="size-3.5" /> షేర్
          </button>
        </div>
      </div>
    </article>
  );
}
