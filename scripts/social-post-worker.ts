import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Telegram Social Post Worker
//  Posts high-importance articles to Telegram channel automatically
//  Reads pipeline_jobs WHERE job_type='social' AND payload.ready_to_post=true
// ═══════════════════════════════════════════════════════════════════

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

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChannelId = process.env.TELEGRAM_CHANNEL_ID; // e.g. "@vaartanow" or "-1001234567890"
const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || "https://vaartanow.com";

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

// ─── Telegram API ────────────────────────────────────────────────
async function sendTelegramMessage(text: string, imageUrl?: string | null): Promise<boolean> {
  if (!telegramBotToken || !telegramChannelId) {
    console.log("  ℹ️  Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID missing)");
    return false;
  }

  try {
    const apiBase = `https://api.telegram.org/bot${telegramBotToken}`;

    if (imageUrl && imageUrl.startsWith("http")) {
      // Send photo with caption
      const res = await fetch(`${apiBase}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChannelId,
          photo: imageUrl,
          caption: text.slice(0, 1024), // Telegram caption limit
          parse_mode: "HTML",
          disable_notification: false
        }),
        signal: AbortSignal.timeout(15_000)
      });
      const data = await res.json();
      if (!data.ok) {
        console.warn(`  ⚠️  Telegram photo failed: ${data.description}. Trying text only...`);
        // Fallback to text-only if image fails
        return await sendTelegramMessage(text);
      }
      return true;
    } else {
      // Text-only message
      const res = await fetch(`${apiBase}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChannelId,
          text: text.slice(0, 4096),
          parse_mode: "HTML",
          disable_web_page_preview: false
        }),
        signal: AbortSignal.timeout(15_000)
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.description);
      return true;
    }
  } catch (err: any) {
    console.error(`  ❌ Telegram error: ${err.message}`);
    return false;
  }
}

// ─── Format Telegram message ──────────────────────────────────────
function formatTelegramPost(post: any, caption: string): string {
  const articleUrl = `${siteUrl}/${post.category}/${post.slug}`;

  // Use AI-generated caption if available, otherwise format ourselves
  if (caption && caption.length > 30) {
    return caption.replace("[LINK]", articleUrl);
  }

  // Fallback: auto-format from post data
  const categoryEmoji: Record<string, string> = {
    "politics": "🏛️", "andhra-pradesh": "🌊", "telangana": "🌿",
    "national": "🇮🇳", "business": "💹", "cricket": "🏏",
    "cinema": "🎬", "technology": "💻", "health": "⚕️",
    "education": "📚", "jobs": "💼", "devotional": "🙏",
    "agriculture": "🌾", "crime": "🚨", "breaking": "🔴",
  };
  const emoji = categoryEmoji[post.category] || "📰";

  const title = (post.title || "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] || c);
  const excerpt = (post.excerpt || "").slice(0, 200).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] || c);

  return `${emoji} <b>${title}</b>\n\n${excerpt}\n\n🔗 <a href="${articleUrl}">పూర్తిగా చదవండి</a>\n\n📲 <b>VaartaNow</b> — తెలుగు వార్తలు`;
}

// ─── Main worker ──────────────────────────────────────────────────
async function runSocialPostWorker() {
  console.log("📣  VaartaNow Social Post Worker — STARTED");

  // Fetch social jobs where captions are ready
  const { data: socialJobs, error } = await supabase
    .from("pipeline_jobs")
    .select("id, post_slug, payload, created_at")
    .eq("job_type", "social")
    .eq("status", "done")
    .filter("payload->ready_to_post", "eq", true)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error(`❌ Failed to fetch social jobs: ${error.message}`);
    return;
  }

  // Also fetch high-importance posts that haven't been posted yet (direct fallback)
  const { data: unpostedPosts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, og_image, relevance_score, published_at")
    .eq("telegram_posted", false)
    .eq("published", true)
    .gte("relevance_score", 65)
    .order("relevance_score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(5);

  const processedSlugs = new Set<string>();

  // Process social jobs with AI-generated captions
  if (socialJobs && socialJobs.length > 0) {
    console.log(`  📤 ${socialJobs.length} social jobs with AI captions ready`);

    for (const job of socialJobs) {
      const slug = job.post_slug;
      processedSlugs.add(slug);

      // Fetch the post
      const { data: post } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, category, og_image, telegram_posted")
        .eq("slug", slug)
        .maybeSingle();

      if (!post || post.telegram_posted) continue;

      const caption = job.payload?.telegram_caption || "";
      const message = formatTelegramPost(post, caption);
      const imageUrl = post.og_image?.startsWith("http") ? post.og_image : null;

      console.log(`  📤 Posting: "${post.title?.slice(0, 50)}"`);
      const sent = await sendTelegramMessage(message, imageUrl);

      if (sent) {
        await supabase.from("blog_posts").update({ telegram_posted: true }).eq("slug", slug);
        // Mark the social job as posted
        await supabase.from("pipeline_jobs").update({
          payload: { ...job.payload, telegram_posted_at: new Date().toISOString() }
        }).eq("id", job.id);
        console.log(`  ✅ Posted to Telegram: "${post.title?.slice(0, 50)}"`);
      }

      // Telegram rate limit: max 1 message per second per bot
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Process high-importance unposted articles (direct posting without AI caption)
  if (unpostedPosts && unpostedPosts.length > 0) {
    const directPosts = unpostedPosts.filter(p => !processedSlugs.has(p.slug));
    if (directPosts.length > 0) {
      console.log(`  📤 ${directPosts.length} high-importance articles to post directly`);

      for (const post of directPosts) {
        const message = formatTelegramPost(post, "");
        const imageUrl = post.og_image?.startsWith("http") ? post.og_image : null;

        console.log(`  📤 Direct posting (score=${post.relevance_score}): "${post.title?.slice(0, 50)}"`);
        const sent = await sendTelegramMessage(message, imageUrl);

        if (sent) {
          await supabase.from("blog_posts").update({ telegram_posted: true }).eq("slug", post.slug);
          console.log(`  ✅ Posted directly to Telegram`);
        }

        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  if (!socialJobs?.length && !unpostedPosts?.length) {
    console.log("  😴 No posts ready for social sharing");
  }

  console.log("✅  Social Post Worker — COMPLETE");
}

runSocialPostWorker().catch(e => {
  console.error("💀 Social worker error:", e);
  process.exit(0); // Don't crash the scheduler on social failure
});
