import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
try {
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && value) process.env[key] = value;
  }
} catch {}

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const youtubeApiKey = process.env.VITE_YOUTUBE_API_KEY!;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Supabase configuration is missing in .env!");
  process.exit(1);
}

if (!youtubeApiKey) {
  console.error("❌ VITE_YOUTUBE_API_KEY is missing in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

function parseISO8601Duration(durationStr: string): string {
  const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return "0:30";
  const hours = parseInt(matches[1] || "0");
  const minutes = parseInt(matches[2] || "0");
  const seconds = parseInt(matches[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function fetchYoutubeShorts() {
  console.log("📺 Starting YouTube Shorts ingestion...");
  
  try {
    // 1. Search for Telugu news shorts
    const searchQuery = "Telugu news shorts";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=short&maxResults=15&order=date&key=${youtubeApiKey}`;
    
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const errText = await searchRes.text();
      throw new Error(`YouTube search failed: ${searchRes.status} - ${errText}`);
    }
    
    const searchData = await searchRes.json();
    const items = searchData.items || [];
    
    if (items.length === 0) {
      console.log("⚠️ No YouTube Short videos found in search results.");
      return;
    }
    
    console.log(`Found ${items.length} videos. Fetching details...`);
    const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean);
    const channelIds = Array.from(new Set(items.map((item: any) => item.snippet.channelId).filter(Boolean))) as string[];
    
    // 2. Fetch video details (duration, etc.)
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(",")}&key=${youtubeApiKey}`;
    const videosRes = await fetch(videosUrl);
    if (!videosRes.ok) {
      throw new Error(`YouTube videos details fetch failed: ${videosRes.status}`);
    }
    const videosData = await videosRes.json();
    const videoDetailsMap = new Map(videosData.items?.map((v: any) => [v.id, v]));
    
    // 3. Fetch channel details (avatars)
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(",")}&key=${youtubeApiKey}`;
    const channelsRes = await fetch(channelsUrl);
    if (!channelsRes.ok) {
      console.warn("⚠️ Failed to fetch channel details, will use fallback channel icons.");
    }
    const channelsData = await channelsRes.json();
    const channelDetailsMap = new Map(channelsData.items?.map((c: any) => [c.id, c.snippet?.thumbnails?.default?.url]));
    
    // 4. Map into viral_videos rows
    const videosToUpsert = items.map((item: any) => {
      const vId = item.id.videoId;
      const detail = videoDetailsMap.get(vId) as any;
      const durationISO = detail?.contentDetails?.duration || "PT30S";
      const durationFormatted = parseISO8601Duration(durationISO);
      
      const channelId = item.snippet.channelId;
      const channelIcon = channelDetailsMap.get(channelId) || "https://www.google.com/s2/favicons?domain=youtube.com&sz=64";
      
      return {
        id: vId,
        title: item.snippet.title || "Telugu News Short",
        description: item.snippet.description || "",
        video_url: `https://www.youtube.com/shorts/${vId}`,
        thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
        duration: durationFormatted,
        channel: item.snippet.channelTitle || "News Channel",
        source_icon: channelIcon,
        clip: `https://www.youtube.com/shorts/${vId}`, // The iframe player will load this
        published_at: item.snippet.publishedAt || new Date().toISOString()
      };
    });
    
    console.log(`Upserting ${videosToUpsert.length} videos to public.viral_videos...`);
    const { error } = await supabase.from("viral_videos").upsert(videosToUpsert, { onConflict: "id" });
    
    if (error) {
      throw error;
    }
    
    console.log("✅ YouTube Shorts ingested successfully!");
  } catch (error: any) {
    console.error("❌ Error during YouTube Shorts ingestion:", error.message || error);
  }
}

fetchYoutubeShorts().then(() => process.exit(0));
