import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY")!;

    if (!supabaseUrl || !serviceRole || !youtubeApiKey) {
      return new Response(JSON.stringify({ error: "Missing backend configuration secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or YOUTUBE_API_KEY)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false }
    });

    console.log("📺 Starting Edge-based Daily Trending Videos ingestion...");

    // 1. Fetch daily trending videos in India (regionCode=IN, chart=mostPopular)
    const trendingUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&regionCode=IN&maxResults=5&key=${youtubeApiKey}`;
    
    const trendingRes = await fetch(trendingUrl);
    if (!trendingRes.ok) {
      const errText = await trendingRes.text();
      throw new Error(`YouTube trending fetch failed: ${trendingRes.status} - ${errText}`);
    }
    
    const trendingData = await trendingRes.json();
    const items = trendingData.items || [];
    
    if (items.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No trending videos found.", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const videosToUpsert = [];
    
    // Process top 2 trending videos. Wait 2 minutes (120 seconds) between each video processing
    // to respect the API delay requirement and stay within the 150-second Edge Function execution timeout.
    const targetItems = items.slice(0, 2);

    for (let i = 0; i < targetItems.length; i++) {
      const item = targetItems[i];
      const vId = item.id;
      if (!vId) continue;

      if (i > 0) {
        console.log(`Waiting 2 minutes (120 seconds) before retrieving channel details for next video (video ID: ${vId})...`);
        await delay(120 * 1000);
      }

      // Fetch channel details for avatar
      const channelId = item.snippet.channelId;
      let channelIcon = "https://www.google.com/s2/favicons?domain=youtube.com&sz=64";
      if (channelId) {
        const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${youtubeApiKey}`;
        const channelsRes = await fetch(channelsUrl);
        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          channelIcon = channelsData.items?.[0]?.snippet?.thumbnails?.default?.url || channelIcon;
        }
      }

      const durationISO = item.contentDetails?.duration || "PT30S";
      const durationFormatted = parseISO8601Duration(durationISO);

      videosToUpsert.push({
        id: vId,
        title: item.snippet.title || "Trending YouTube Video",
        description: item.snippet.description || "",
        video_url: `https://www.youtube.com/watch?v=${vId}`,
        thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
        duration: durationFormatted,
        channel: item.snippet.channelTitle || "Trending Channel",
        source_icon: channelIcon,
        clip: `https://www.youtube.com/watch?v=${vId}`,
        published_at: item.snippet.publishedAt || new Date().toISOString()
      });
    }

    if (videosToUpsert.length > 0) {
      console.log(`Upserting ${videosToUpsert.length} videos to public.viral_videos...`);
      const { error } = await supabase.from("viral_videos").upsert(videosToUpsert, { onConflict: "id" });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, message: `Successfully processed and ingested ${videosToUpsert.length} trending videos.`, count: videosToUpsert.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("❌ Error during Edge YouTube Trending Ingestion:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
