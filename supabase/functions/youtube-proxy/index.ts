import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY") || Deno.env.get("VITE_YOUTUBE_API_KEY")!;

    if (!supabaseUrl || !serviceRole || !youtubeApiKey) {
      return new Response(JSON.stringify({ error: "Missing backend configuration secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or YOUTUBE_API_KEY)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false }
    });

    console.log("📺 Starting Edge-based Telugu News Shorts Ingestion...");

    // 1. Search for fresh Telugu news shorts ordered by latest date
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
      return new Response(JSON.stringify({ ok: true, message: "No shorts found.", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean);
    const channelIds = Array.from(new Set(items.map((item: any) => item.snippet.channelId).filter(Boolean))) as string[];

    // 2. Fetch video details (duration, etc.) in batch
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(",")}&key=${youtubeApiKey}`;
    const videosRes = await fetch(videosUrl);
    const videosData = videosRes.ok ? await videosRes.json() : { items: [] };
    const videoDetailsMap = new Map((videosData.items || []).map((v: any) => [v.id, v]));

    // 3. Fetch channel details in batch
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(",")}&key=${youtubeApiKey}`;
    const channelsRes = await fetch(channelsUrl);
    const channelsData = channelsRes.ok ? await channelsRes.json() : { items: [] };
    const channelDetailsMap = new Map((channelsData.items || []).map((c: any) => [c.id, c.snippet?.thumbnails?.default?.url]));

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
        clip: `https://www.youtube.com/shorts/${vId}`,
        published_at: item.snippet.publishedAt || new Date().toISOString()
      };
    });

    if (videosToUpsert.length > 0) {
      console.log(`Upserting ${videosToUpsert.length} viral shorts to public.viral_videos...`);
      const { error } = await supabase.from("viral_videos").upsert(videosToUpsert, { onConflict: "id" });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      message: `Successfully ingested ${videosToUpsert.length} fresh viral shorts.`, 
      count: videosToUpsert.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("❌ Error during YouTube Shorts Ingestion:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
