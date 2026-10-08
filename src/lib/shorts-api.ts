import { supabase } from "./supabase";

export interface ShortVideoItem {
  id?: string;
  title: string;
  link: string;
  thumbnail: string;
  clip: string;
  source: string;
  source_icon: string;
  channel: string;
  duration: string;
  published_at?: string;
}

const stableClips = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
];

/** Extract a real 11-char YouTube video id from watch/shorts/embed URLs. */
export function getYoutubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  const id = match?.[2] || "";
  return /^[\w-]{11}$/.test(id) ? id : null;
}

export function isPlayableYoutubeUrl(url?: string | null): boolean {
  return Boolean(getYoutubeVideoId(url));
}

/** Prefer a real YouTube URL; otherwise fall back to the MP4 clip so Play always works. */
export function resolveViralPlayUrl(video: {
  video_url?: string;
  link?: string;
  clip?: string;
}): string {
  const primary = video.video_url || video.link || "";
  if (isPlayableYoutubeUrl(primary)) return primary;
  if (video.clip) return video.clip;
  return primary;
}

function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function ytWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

// Real YouTube IDs only — fake /shorts/slug URLs were opening as unavailable.
export function generateDailyViralShorts(): ShortVideoItem[] {
  const now = Date.now();

  const shortsCatalog = [
    {
      id: "viral-1",
      title: "\u0C24\u0C3F\u0C30\u0C41\u0C2E\u0C32 \u0C36\u0C4D\u0C30\u0C40\u0C35\u0C3E\u0C30\u0C3F \u0C2C\u0C4D\u0C30\u0C39\u0C4D\u0C2E\u0C4B\u0C24\u0C4D\u0C38\u0C35\u0C3E\u0C32\u0C41",
      youtubeId: "LXb3EKWsInQ",
      clip: stableClips[0],
      source_icon: "https://www.google.com/s2/favicons?domain=tv9telugu.com&sz=64",
      channel: "TV9 Telugu",
      duration: "0:45",
      hoursAgo: 1
    },
    {
      id: "viral-2",
      title: "\u0C0F\u0C2A\u0C40\u0C32\u0C4B \u0C2D\u0C3E\u0C30\u0C40 \u0C35\u0C30\u0C4D\u0C37\u0C3E\u0C32 \u0C39\u0C46\u0C1A\u0C4D\u0C1A\u0C30\u0C3F\u0C15",
      youtubeId: "aqz-KE-bpKQ",
      clip: stableClips[1],
      source_icon: "https://www.google.com/s2/favicons?domain=sakshi.com&sz=64",
      channel: "Sakshi TV",
      duration: "0:59",
      hoursAgo: 2
    },
    {
      id: "viral-3",
      title: "\u0C2C\u0C02\u0C17\u0C3E\u0C30\u0C02 & \u0C35\u0C46\u0C02\u0C21\u0C3F \u0C27\u0C30\u0C32 \u0C24\u0C3E\u0C1C\u0C3E \u0C05\u0C2A\u0C4D\u200C\u0C21\u0C47\u0C1F\u0C4D",
      youtubeId: "hT_nvWreIhg",
      clip: stableClips[2],
      source_icon: "https://www.google.com/s2/favicons?domain=tv5news.in&sz=64",
      channel: "TV5 News",
      duration: "0:35",
      hoursAgo: 3
    },
    {
      id: "viral-4",
      title: "\u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23 \u0C05\u0C38\u0C46\u0C02\u0C2C\u0C4D\u0C32\u0C40 \u0C38\u0C2E\u0C3E\u0C35\u0C47\u0C36\u0C3E\u0C32\u0C41",
      youtubeId: "JGwWNGJdvx8",
      clip: stableClips[3],
      source_icon: "https://www.google.com/s2/favicons?domain=v6velugu.com&sz=64",
      channel: "V6 News",
      duration: "0:50",
      hoursAgo: 4
    },
    {
      id: "viral-5",
      title: "SSMB29 movie update",
      youtubeId: "9bZkp7q19f0",
      clip: stableClips[4],
      source_icon: "https://www.google.com/s2/favicons?domain=ntvtelugu.com&sz=64",
      channel: "NTV Entertainment",
      duration: "0:42",
      hoursAgo: 5
    },
    {
      id: "viral-6",
      title: "India vs Australia cricket shorts",
      youtubeId: "60ItHLz5WEA",
      clip: stableClips[5],
      source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: "Star Sports Telugu",
      duration: "0:58",
      hoursAgo: 6
    },
    {
      id: "viral-7",
      title: "AI tech trends update",
      youtubeId: "kJQP7kiw5Fk",
      clip: stableClips[6],
      source_icon: "https://www.google.com/s2/favicons?domain=eenadu.net&sz=64",
      channel: "Eenadu Tech",
      duration: "0:48",
      hoursAgo: 7
    },
    {
      id: "viral-8",
      title: "Today rasi phalalu & divine darshan",
      youtubeId: "fJ9rUzIMcZQ",
      clip: stableClips[7],
      source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: "Bhakti TV",
      duration: "0:40",
      hoursAgo: 8
    },
    {
      id: "viral-9",
      title: "Vizag beach road tourism buzz",
      youtubeId: "OPf0YbXqDm0",
      clip: stableClips[8],
      source_icon: "https://www.google.com/s2/favicons?domain=10tv.in&sz=64",
      channel: "10TV News",
      duration: "0:38",
      hoursAgo: 9
    },
    {
      id: "viral-10",
      title: "Hyderabad IT corridor flyover launch",
      youtubeId: "RgKAFK5djSk",
      clip: stableClips[9],
      source_icon: "https://www.google.com/s2/favicons?domain=tnewstelugu.com&sz=64",
      channel: "T News",
      duration: "0:45",
      hoursAgo: 10
    },
    {
      id: "viral-11",
      title: "Amaravati capital construction update",
      youtubeId: "CevxZvSJLk8",
      clip: stableClips[0],
      source_icon: "https://www.google.com/s2/favicons?domain=abnandhrajyothy.com&sz=64",
      channel: "ABN Andhra Jyothi",
      duration: "0:55",
      hoursAgo: 11
    },
    {
      id: "viral-12",
      title: "Budget 5G smartphone launch",
      youtubeId: "2Vv-BfVoq4g",
      clip: stableClips[1],
      source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: "Tech in Telugu",
      duration: "0:52",
      hoursAgo: 12
    }
  ];

  return shortsCatalog.map((item) => ({
    id: item.id,
    title: item.title,
    link: ytWatch(item.youtubeId),
    thumbnail: ytThumb(item.youtubeId),
    clip: item.clip,
    source: "YouTube",
    source_icon: item.source_icon,
    channel: item.channel,
    duration: item.duration,
    published_at: new Date(now - item.hoursAgo * 3600000).toISOString()
  }));
}

export const CUSTOM_SHORTS_STORAGE_KEY = "vaartanow_admin_custom_shorts_v1";

export function getCustomShortVideos(): ShortVideoItem[] {
  try {
    const data = localStorage.getItem(CUSTOM_SHORTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addShortVideo(item: Omit<ShortVideoItem, "id" | "published_at">): ShortVideoItem {
  const newItem: ShortVideoItem = {
    ...item,
    id: `short-custom-${Date.now()}`,
    published_at: new Date().toISOString()
  };

  try {
    const existing = getCustomShortVideos();
    localStorage.setItem(CUSTOM_SHORTS_STORAGE_KEY, JSON.stringify([newItem, ...existing]));
  } catch (e) {
    console.warn("Failed to store custom short video:", e);
  }

  if (supabase) {
    supabase
      .from("viral_videos")
      .insert([
        {
          title: newItem.title,
          link: newItem.link,
          thumbnail_url: newItem.thumbnail,
          video_url: newItem.link,
          clip: newItem.clip,
          channel: newItem.channel,
          duration: newItem.duration,
          published_at: newItem.published_at
        }
      ])
      .then(({ error }) => {
        if (error) console.log("Supabase insert short error note:", error.message);
      });
  }

  return newItem;
}

export function deleteShortVideo(id: string): void {
  try {
    const existing = getCustomShortVideos();
    localStorage.setItem(
      CUSTOM_SHORTS_STORAGE_KEY,
      JSON.stringify(existing.filter((i) => i.id !== id))
    );
  } catch (e) {
    console.warn("Failed to delete custom short video:", e);
  }

  if (supabase) {
    supabase.from("viral_videos").delete().eq("id", id).then(({ error }) => {
      if (error) console.log("Supabase delete short error note:", error.message);
    });
  }
}

export async function getShortVideos(_query = "telugu news"): Promise<ShortVideoItem[]> {
  const customList = getCustomShortVideos();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("viral_videos")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        const supaList = data.map((v: any, idx: number) => {
          const link = v.link || v.video_url || "";
          const ytId = getYoutubeVideoId(link);
          return {
            id: v.id || `supa-short-${idx}`,
            title: v.title,
            link,
            thumbnail:
              v.thumbnail_url ||
              v.thumbnail ||
              (ytId ? ytThumb(ytId) : ytThumb("LXb3EKWsInQ")),
            clip: v.clip || stableClips[idx % stableClips.length],
            source: v.channel || "YouTube",
            source_icon:
              v.source_icon || "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
            channel: v.channel || "YouTube Channel",
            duration: v.duration || "0:45",
            published_at: v.published_at || new Date().toISOString()
          };
        });
        return [...customList, ...supaList];
      }
    } catch (error) {
      console.warn("Failed to query Supabase viral_videos table:", error);
    }
  }

  return [...customList, ...generateDailyViralShorts()];
}
