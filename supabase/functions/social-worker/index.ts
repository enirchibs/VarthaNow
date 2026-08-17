import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
  const telegramChannelId = Deno.env.get("TELEGRAM_CHANNEL_ID") || "";
  const siteUrl = "https://vaartanow.com";

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  const stats = { socialPosted: 0, sitemapPinged: 0 };

  try {
    // ─── 1. Process Telegram/Social Jobs ──────────────────────────────────
    const { data: socialJobs, error: socialErr } = await supabase
      .from("pipeline_jobs")
      .select("*")
      .eq("job_type", "social")
      .eq("status", "done")
      .filter("payload->ready_to_post", "eq", true)
      .order("created_at", { ascending: true })
      .limit(5);

    if (socialErr) throw socialErr;

    if (socialJobs && socialJobs.length > 0) {
      console.log(`Processing ${socialJobs.length} social post jobs...`);

      for (const job of socialJobs) {
        const { data: post, error: postErr } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", job.post_slug)
          .maybeSingle();

        if (postErr || !post || post.telegram_posted) {
          // If already posted or missing, mark job done
          await supabase.from("pipeline_jobs").delete().eq("id", job.id);
          continue;
        }

        const caption = job.payload?.telegram_caption || "";
        const formattedMsg = formatTelegramPost(post, caption, siteUrl);
        const imageUrl = post.og_image?.startsWith("http") ? post.og_image : null;

        const posted = await sendTelegramMessage(telegramBotToken, telegramChannelId, formattedMsg, imageUrl);
        if (posted) {
          await supabase.from("blog_posts").update({ telegram_posted: true }).eq("slug", post.slug);
          // Delete job to keep queue clean or update its state
          await supabase.from("pipeline_jobs").delete().eq("id", job.id);
          stats.socialPosted++;
        }
      }
    }

    // ─── 2. Process Sitemap Jobs & Pings ──────────────────────────────────
    const { data: sitemapJobs, error: sitemapErr } = await supabase
      .from("pipeline_jobs")
      .select("*")
      .eq("job_type", "sitemap")
      .eq("status", "pending")
      .limit(10);

    if (sitemapErr) throw sitemapErr;

    if (sitemapJobs && sitemapJobs.length > 0) {
      console.log(`Processing ${sitemapJobs.length} sitemap ping jobs...`);
      let shouldPing = false;

      for (const job of sitemapJobs) {
        await supabase.from("blog_posts").update({ sitemap_pinged: true }).eq("slug", job.post_slug);
        await supabase.from("pipeline_jobs").delete().eq("id", job.id);
        shouldPing = true;
        stats.sitemapPinged++;
      }

      if (shouldPing) {
        await pingSearchEngines(siteUrl);
      }
    }

    return new Response(JSON.stringify({ ok: true, stats }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Social worker execution failed:", error.message);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});

// Helper: Format Telegram Caption
function formatTelegramPost(post: any, caption: string, siteUrl: string): string {
  const articleUrl = `${siteUrl}/${post.category}/${post.slug}`;
  if (caption && caption.length > 30) {
    return caption.replace("[LINK]", articleUrl);
  }

  // Fallback caption formatter
  const categoryEmoji: Record<string, string> = {
    "politics": "🏛️", "andhra-pradesh": "🌊", "telangana": "🌿",
    "national": "🇮🇳", "business": "💹", "cricket": "🏏",
    "cinema": "🎬", "technology": "💻", "health": "⚕️",
    "education": "📚", "jobs": "💼", "devotional": "🙏"
  };
  const emoji = categoryEmoji[post.category] || "📰";
  const title = post.title.replace(/[<>&"]/g, (c: string) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c as any] || c);
  const excerpt = (post.excerpt || "").slice(0, 200).replace(/[<>&"]/g, (c: string) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c as any] || c);

  return `${emoji} <b>${title}</b>\n\n${excerpt}\n\n🔗 <a href="${articleUrl}">పూర్తిగా చదవండి</a>\n\n📲 <b>VaartaNow</b> — తెలుగు వార్తలు`;
}

// Helper: Send Telegram API
async function sendTelegramMessage(botToken: string, channelId: string, text: string, imageUrl: string | null): Promise<boolean> {
  if (!botToken || !channelId) {
    console.warn("Telegram bot token or channel ID not configured.");
    return false;
  }

  try {
    const api = `https://api.telegram.org/bot${botToken}`;

    if (imageUrl) {
      const res = await fetch(`${api}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          photo: imageUrl,
          caption: text.slice(0, 1024),
          parse_mode: "HTML"
        })
      });
      const data = await res.json();
      if (!data.ok) {
        console.warn(`Telegram sendPhoto failed: ${data.description}. Retrying with sendMessage...`);
        return await sendTelegramMessage(botToken, channelId, text, null);
      }
      return true;
    } else {
      const res = await fetch(`${api}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          text: text.slice(0, 4096),
          parse_mode: "HTML",
          disable_web_page_preview: false
        })
      });
      const data = await res.json();
      return data.ok;
    }
  } catch (err: any) {
    console.error("Telegram message delivery error:", err.message);
    return false;
  }
}

// Helper: Ping search engines
async function pingSearchEngines(siteUrl: string) {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const engines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
  ];

  for (const url of engines) {
    try {
      const res = await fetch(url, { method: "GET" });
      console.log(`Pinged search console ${url.includes("google") ? "Google" : "Bing"}: status=${res.status}`);
    } catch (e: any) {
      console.warn(`Search console ping failed:`, e.message);
    }
  }
}
