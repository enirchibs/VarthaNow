import { supabase } from "@/lib/supabase";

// Short videos from official channels (filled by scripts/ingest-youtube-shorts.ts).
// Each row carries our own Telugu headline (`title`) and context caption (`description`).
// No fallback catalog: if there are no videos, the UI shows an empty state.

export interface VideoItem {
  id: string;            // YouTube video id
  title: string;         // our Telugu headline
  caption: string;       // our 40–60 word Telugu context
  channel: string;       // credited channel
  publishedAt: string;
  duration: string;
  thumbnail: string;
  youtubeUrl: string;
}

const YT_ID = /(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([\w-]{11})/;

function toVideo(row: any): VideoItem | null {
  const id = row.id && /^[\w-]{11}$/.test(row.id) ? row.id : (row.clip || row.video_url || "").match(YT_ID)?.[1];
  if (!id || !row.title) return null;
  return {
    id,
    title: row.title,
    caption: row.description ?? "",
    channel: (row.channel ?? "").trim(),
    publishedAt: row.published_at ?? row.created_at,
    duration: row.duration ?? "",
    thumbnail: row.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

export async function getVideos(limit = 30): Promise<VideoItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("viral_videos").select("*").order("published_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("viral_videos query failed:", error);
    return [];
  }
  return (data ?? []).map(toVideo).filter((v): v is VideoItem => !!v);
}

export async function getVideo(id: string): Promise<VideoItem | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("viral_videos").select("*").eq("id", id).maybeSingle();
  if (error) console.error("viral_videos query failed:", error);
  return data ? toVideo(data) : null;
}

/** Privacy-enhanced embed, loaded only after the reader taps play. */
export const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

export function timeAgoTe(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${Math.max(mins, 1)} నిమిషాల క్రితం`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} గంటల క్రితం`;
  return `${Math.floor(hours / 24)} రోజుల క్రితం`;
}
