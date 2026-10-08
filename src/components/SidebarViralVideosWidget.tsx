import { useState } from "react";
import { Play, Video, X } from "lucide-react";
import { useViralVideos, type ViralVideo } from "@/hooks/useViralVideos";
import { useLanguage } from "@/hooks/useLanguage";
import {
  getYoutubeVideoId,
  isPlayableYoutubeUrl,
  resolveViralPlayUrl,
} from "@/lib/shorts-api";

function openOrPlayVideo(video: ViralVideo, onPlayClip: (v: ViralVideo) => void) {
  const url = resolveViralPlayUrl(video);
  if (isPlayableYoutubeUrl(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  // MP4 / non-YouTube: play inline so the Play button always works
  if (video.clip || url) onPlayClip({ ...video, clip: video.clip || url });
}

export function SidebarViralVideosWidget({ limit = 4 }: { limit?: number }) {
  const { videos, loading } = useViralVideos(limit);
  const { lang } = useLanguage();
  const [activeClip, setActiveClip] = useState<ViralVideo | null>(null);

  if (loading && videos.length === 0) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] p-4 animate-pulse space-y-3">
        <div className="h-4 bg-[hsl(var(--muted))] rounded w-1/2" />
        <div className="h-20 bg-[hsl(var(--muted))] rounded-xl" />
        <div className="h-20 bg-[hsl(var(--muted))] rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-amber-500/5 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5">
          <h3 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <Video className="size-4 text-red-600 dark:text-red-400 animate-pulse" />
            {lang === "te" ? "🎥 తాజా వైరల్ వీడియోలు" : "🎥 Live Viral Videos"}
          </h3>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
            LIVE
          </span>
        </div>

        <div className="space-y-2.5">
          {videos.slice(0, limit).map((video) => {
            const ytId = getYoutubeVideoId(video.video_url);
            const thumb =
              video.thumbnail_url ||
              (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

            return (
              <div
                key={video.id}
                onClick={() => openOrPlayVideo(video, setActiveClip)}
                className="group relative flex gap-2.5 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-2 hover:border-red-500/40 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (ytId && !el.src.includes("hqdefault")) {
                          el.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
                        } else {
                          el.style.display = "none";
                        }
                      }}
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-white/40 text-[10px] font-black">
                      VIDEO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <div className="size-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="size-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-black text-white px-1 rounded border border-white/20">
                    {video.duration || "0:45"}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <h4 className="text-xs font-black text-[hsl(var(--foreground))] line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[hsl(var(--muted-foreground))] mt-1">
                    <img
                      src={video.source_icon}
                      alt={video.channel}
                      className="size-3.5 rounded-full border border-white/30 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="truncate">{video.channel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeClip && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActiveClip(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveClip(null)}
              className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <video
              src={activeClip.clip}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black"
            />
            <p className="px-3 py-2 text-xs font-bold text-white/90 line-clamp-2">
              {activeClip.title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
