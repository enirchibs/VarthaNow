import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

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

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const youtubeApiKey = process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY!;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Supabase configuration is missing in .env!");
  process.exit(1);
}

if (!youtubeApiKey) {
  console.error("❌ YouTube API key is missing in .env!");
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
  console.log("📺 Starting Multi-Channel YouTube Shorts ingestion...");

  const searchQueries = [
    "TV9 Telugu news shorts",
    "NTV Telugu shorts",
    "ABN Telugu news shorts",
    "Telugu breaking news shorts",
    "Sakshi TV shorts"
  ];
  
  const allItems: any[] = [];
  const seenIds = new Set<string>();

  for (const query of searchQueries) {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=short&maxResults=10&order=date&key=${youtubeApiKey}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const data = await searchRes.json();
        for (const it of (data.items || [])) {
          if (it.id?.videoId && !seenIds.has(it.id.videoId)) {
            seenIds.add(it.id.videoId);
            allItems.push(it);
          }
        }
      }
    } catch (e) {
      console.warn(`Search query "${query}" failed:`, e);
    }
  }

  if (allItems.length === 0) {
    console.log("⚠️ No YouTube Short videos found.");
    return;
  }

  console.log(`Found ${allItems.length} unique shorts across channels. Fetching details...`);

  const videoIds = allItems.map((item: any) => item.id.videoId).filter(Boolean);
  const channelIds = Array.from(new Set(allItems.map((item: any) => item.snippet.channelId).filter(Boolean))) as string[];

  // Fetch video details (duration, etc.) in chunks of 50
  const videoDetailsMap = new Map();
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${chunk.join(",")}&key=${youtubeApiKey}`;
    const videosRes = await fetch(videosUrl);
    if (videosRes.ok) {
      const videosData = await videosRes.json();
      (videosData.items || []).forEach((v: any) => videoDetailsMap.set(v.id, v));
    }
  }

  // Fetch channel details (avatars)
  const channelDetailsMap = new Map();
  for (let i = 0; i < channelIds.length; i += 50) {
    const chunk = channelIds.slice(i, i + 50);
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${chunk.join(",")}&key=${youtubeApiKey}`;
    const channelsRes = await fetch(channelsUrl);
    if (channelsRes.ok) {
      const channelsData = await channelsRes.json();
      (channelsData.items || []).forEach((c: any) => {
        channelDetailsMap.set(c.id, c.snippet?.thumbnails?.default?.url);
      });
    }
  }

  // Map into viral_videos rows
  const videosToUpsert = allItems.map((item: any) => {
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
      clip: `https://www.youtube.com/shorts/${vId}`,
      published_at: item.snippet.publishedAt || new Date().toISOString()
    };
  });

  console.log(`Upserting ${videosToUpsert.length} fresh viral shorts to public.viral_videos...`);
  const { error } = await supabase.from("viral_videos").upsert(videosToUpsert, { onConflict: "id" });

  if (error) throw error;
  console.log(`✅ Successfully ingested ${videosToUpsert.length} fresh viral shorts!`);
}

fetchYoutubeShorts().then(() => process.exit(0));
