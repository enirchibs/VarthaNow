import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  "politics":        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60",
  "andhra-pradesh":  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
  "telangana":       "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
  "national":        "https://images.unsplash.com/photo-1532375811409-905115e3b5a9?w=800&auto=format&fit=crop&q=60",
  "international":   "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&auto=format&fit=crop&q=60",
  "business":        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
  "cricket":         "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
  "sports":          "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60",
  "cinema":          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
  "entertainment":   "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
  "technology":      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
  "jobs":            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
  "health":          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
  "education":       "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60",
  "devotional":      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=60",
  "agriculture":     "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&auto=format&fit=crop&q=60",
  "astrology":       "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=60",
  "crime":           "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=60",
  "weather":         "https://images.unsplash.com/photo-1504608524841-42584120d693?w=800&auto=format&fit=crop&q=60",
  "lifestyle":       "https://images.unsplash.com/photo-1464979681340-bdd28a61699e?w=800&auto=format&fit=crop&q=60",
};

const BLOCKED_IMAGE_HOSTS = ["t.co", "bit.ly", "tinyurl.com", "instagram.com", "facebook.com", "fb.com", "twitter.com", "x.com", "whatsapp.com", "telegram.org"];
const AI_SKIP_CATEGORIES = new Set(["weather", "stocks", "stock-prices", "gold-rates", "lottery", "astrology"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  const urlObj = new URL(req.url);
  const force = urlObj.searchParams.get("force") === "true";
  let targetCategory = urlObj.searchParams.get("category");

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body?.category) targetCategory = body.category;
    } catch {}
  }

  const stats = { totalProcessed: 0, inserted: 0, skipped: 0, failed: 0, jobsQueued: 0 };
  const errors: string[] = [];

  try {
    // 1. Query due feeds
    let query = supabase.from("rss_feeds").select("*");
    if (targetCategory) {
      query = query.eq("category", targetCategory.toLowerCase());
    }
    if (!force) {
      query = query.lte("next_fetch_time", new Date().toISOString());
    }
    const { data: feeds, error: feedsErr } = await query.limit(5); // process in small chunks of 5 feeds per edge invocation
    if (feedsErr) throw feedsErr;

    if (!feeds || feeds.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No feeds due for execution." }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    console.log(`Ingesting ${feeds.length} due feeds...`);

    for (const feed of feeds) {
      try {
        console.log(`Processing [${feed.category}] ${feed.publisher} (${feed.url})`);
        const fetchOpts: RequestInit = { headers: { "User-Agent": "VarthaNowBot/1.0" } };
        if (feed.etag) fetchOpts.headers = { ...fetchOpts.headers, "If-None-Match": feed.etag };
        if (feed.last_modified) fetchOpts.headers = { ...fetchOpts.headers, "If-Modified-Since": feed.last_modified };

        const res = await fetch(feed.url, fetchOpts);
        if (res.status === 304) {
          console.log(`Feed unmodified (304). Staggering next fetch.`);
          const newInterval = Math.min(feed.current_interval_seconds * 1.5, 86400);
          await supabase.from("rss_feeds").update({
            current_interval_seconds: newInterval,
            next_fetch_time: new Date(Date.now() + newInterval * 1000).toISOString()
          }).eq("id", feed.id);
          continue;
        }

        if (!res.ok) {
          console.error(`Feed failed with HTTP ${res.status}`);
          const newInterval = Math.min(feed.current_interval_seconds * 2, 86400);
          await supabase.from("rss_feeds").update({
            current_interval_seconds: newInterval,
            next_fetch_time: new Date(Date.now() + newInterval * 1000).toISOString(),
            consecutive_failures: (feed.consecutive_failures || 0) + 1
          }).eq("id", feed.id);
          continue;
        }

        const xml = await res.text();
        errors.push(`[${feed.publisher}] XML length: ${xml.length} chars. Preview: ${xml.slice(0, 120).replace(/\r?\n/g, " ")}`);
        const doc = new DOMParser().parseFromString(xml, "text/html");
        if (!doc) throw new Error("Could not parse RSS XML document");

        const rawElements = [...doc.querySelectorAll("item")];
        errors.push(`[${feed.publisher}] Found raw items count: ${rawElements.length}`);
        const rawItems = rawElements.map((item: any) => ({
          title: item.querySelector("title")?.textContent?.trim() ?? "",
          link: item.querySelector("link")?.textContent?.trim() ?? "",
          pubDate: item.querySelector("pubDate")?.textContent?.trim() ?? "",
          source: item.querySelector("source")?.textContent?.trim() ?? "Google News",
          enclosureUrl: item.querySelector("enclosure")?.getAttribute("url") ?? null
        })).filter(i => i.title && i.link);

        // Keep top 3 freshest items within last 48 hours to fit Edge Function time limits
        const cutoffTime = Date.now() - 48 * 60 * 60 * 1000;
        const freshItems = rawItems
          .filter(i => new Date(i.pubDate).getTime() > cutoffTime)
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, 3);

        console.log(`Found ${freshItems.length} fresh items to process out of ${rawItems.length}`);

        // Update feed polling intervals in DB
        const baseInterval = feed.current_interval_seconds || 3600;
        const nextFetchTime = new Date(Date.now() + baseInterval * 1000).toISOString();
        await supabase.from("rss_feeds").update({
          next_fetch_time: nextFetchTime,
          consecutive_failures: 0,
          last_fetched_at: new Date().toISOString(),
          etag: res.headers.get("etag"),
          last_modified: res.headers.get("last-modified")
        }).eq("id", feed.id);

        for (const item of freshItems) {
          stats.totalProcessed++;

          // Telugu check
          if (!/[\u0c00-\u0c7f]/.test(item.title)) {
            stats.skipped++;
            continue;
          }

          const baseSlug = toSlug(item.title);
          const urlHashVal = await sha256(item.link);

          // Deduplication
          const isDuplicate = await checkDuplicate(supabase, item.link, baseSlug, urlHashVal, item.title);
          if (isDuplicate) {
            stats.skipped++;
            continue;
          }

          // Resolve Google redirect
          let resolvedUrl = item.link;
          if (item.link.includes("news.google.com")) {
            resolvedUrl = await resolveGoogleRedirect(item.link);
          }

          // Extract OG image
          let chosenImageUrl = CATEGORY_PLACEHOLDERS[feed.category] || "/og-image.png";
          let storagePath: string | null = null;
          const ogImageCandidate = await scrapeOgImage(resolvedUrl, item.enclosureUrl);
          if (ogImageCandidate) {
            const upload = await uploadToStorage(supabase, ogImageCandidate, baseSlug);
            if (upload) {
              chosenImageUrl = upload.publicUrl;
              storagePath = upload.storagePath;
            }
          }

          // Ingestion details
          const rssSnippet = item.title; 
          const wordCount = rssSnippet.split(/\s+/).filter(Boolean).length;

          const importanceScore = calculateImportanceScore(item.title, feed.category, item.pubDate, feed.priority_tier);
          let aiQueueStatus = "completed";
          if (importanceScore >= 70) {
            aiQueueStatus = "pending_ai";
          } else if (importanceScore >= 40) {
            aiQueueStatus = "batch_ai";
          }

          const skipAi = AI_SKIP_CATEGORIES.has(feed.category) || wordCount < 5;

          const payload = {
            slug: baseSlug,
            title: item.title,
            excerpt: item.title,
            content: item.title,
            category: feed.category,
            tags: [feed.category, "వార్తలు"],
            meta_title: item.title,
            meta_description: item.title,
            og_image: chosenImageUrl,
            author_name: feed.publisher,
            language: "te",
            published: true,
            featured: importanceScore >= 85,
            reading_time_min: 2,
            published_at: new Date(item.pubDate).toISOString(),
            source_article_url: resolvedUrl,
            source_url: item.link,
            publisher: feed.publisher,
            thumbnail_url: chosenImageUrl,
            featured_image_url: chosenImageUrl,
            image_storage_path: storagePath,
            image_tags: [feed.category],
            content_hash: urlHashVal,
            ai_queue_status: aiQueueStatus,
            relevance_score: importanceScore,
            extraction_quality_score: 50,
            word_count: wordCount,
            image_validation_status: storagePath ? "approved" : "placeholder"
          };

          const { error: insertErr } = await supabase.from("blog_posts").insert(payload);
          if (insertErr) {
            console.error(`Insert failed for ${item.title}:`, insertErr.message);
            stats.failed++;
            continue;
          }

          stats.inserted++;

          // Create pipeline jobs
          await queuePipelineJobs(supabase, baseSlug, importanceScore, feed.priority_tier, wordCount, feed.category, skipAi);
        }
      } catch (err: any) {
        console.error(`Error processing feed ${feed.publisher}:`, err.message);
        errors.push(`[${feed.publisher}] ${err.message}`);
      }
    }

    return new Response(JSON.stringify({ ok: true, stats, errors }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Ingestion failed:", error.message);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});

// Helper Functions
function toSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `news-${Date.now()}`;
}

async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function checkDuplicate(supabase: any, url: string, slug: string, hash: string, title: string): Promise<boolean> {
  const { data: slugMatch } = await supabase.from("blog_posts").select("slug").eq("slug", slug).maybeSingle();
  if (slugMatch) return true;

  const { data: urlMatch } = await supabase.from("blog_posts").select("slug").or(`source_url.eq.${url},source_article_url.eq.${url}`).maybeSingle();
  if (urlMatch) return true;

  const { data: hashMatch } = await supabase.from("blog_posts").select("slug").eq("content_hash", hash).maybeSingle();
  if (hashMatch) return true;

  // Similarity trigger
  try {
    const { data: similar } = await supabase.rpc("find_similar_title", { q_title: title, threshold: 0.72 });
    if (similar && similar.length > 0) return true;
  } catch {}

  return false;
}

async function resolveGoogleRedirect(googleUrl: string): Promise<string> {
  try {
    const res = await fetch(googleUrl, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
    return res.url || googleUrl;
  } catch {
    return googleUrl;
  }
}

async function scrapeOgImage(resolvedUrl: string, enclosureUrl: string | null): Promise<string | null> {
  if (enclosureUrl && !BLOCKED_IMAGE_HOSTS.some(h => enclosureUrl.includes(h))) {
    return enclosureUrl;
  }
  try {
    const res = await fetch(resolvedUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const html = await res.text();
    let match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (match?.[1]) {
      let img = match[1].trim().replace(/&amp;/g, "&");
      if (img.startsWith("//")) img = "https:" + img;
      return img;
    }
  } catch {}
  return null;
}

async function uploadToStorage(supabase: any, url: string, slug: string): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();

    const fileName = `${slug}-${Date.now()}.jpg`;
    const storagePath = `article-images/${fileName}`;

    const { error } = await supabase.storage.from("news-images").upload(storagePath, buffer, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false
    });

    if (error) {
      console.error("Storage upload error:", error.message);
      return null;
    }

    const { data } = supabase.storage.from("news-images").getPublicUrl(storagePath);
    return { publicUrl: data.publicUrl, storagePath };
  } catch {
    return null;
  }
}

function calculateImportanceScore(title: string, category: string, publishedAt: string, feedPriority: number): number {
  let score = 20;
  if (feedPriority === 1) score += 35;
  else if (feedPriority === 2) score += 22;
  else if (feedPriority === 3) score += 10;

  const criticalKeywords = ["చంద్రబాబు", "రేవంత్", "జగన్", "పవన్", "కళ్యాణ్", "మోదీ", "ముఖ్యమంత్రి", "సీఎం", "CM", "ప్రధాని", "ఎన్నికలు"];
  const titleLower = title.toLowerCase();
  let kw = 0;
  for (const k of criticalKeywords) {
    if (titleLower.includes(k)) kw++;
  }
  score += Math.min(25, kw * 8);
  return Math.min(100, score);
}

function getJobPriority(importanceScore: number, priority: number): number {
  if (importanceScore >= 90) return 5;
  if (importanceScore >= 70) return 15;
  if (importanceScore >= 50) return 30;
  if (priority === 1) return 20;
  if (priority === 2) return 40;
  return 60;
}

async function queuePipelineJobs(supabase: any, slug: string, importanceScore: number, feedPriority: number, wordCount: number, category: string, skipAi: boolean) {
  const jobPriority = getJobPriority(importanceScore, feedPriority);
  const jobs = [];

  if (!skipAi) {
    jobs.push({ post_slug: slug, job_type: "rewrite", priority: jobPriority, status: "pending" });
    jobs.push({ post_slug: slug, job_type: "seo", priority: jobPriority + 5, status: "pending" });
    jobs.push({ post_slug: slug, job_type: "tags", priority: jobPriority + 10, status: "pending" });
    jobs.push({ post_slug: slug, job_type: "summary", priority: jobPriority + 15, status: "pending" });
  }

  if (importanceScore >= 60) {
    jobs.push({ post_slug: slug, job_type: "social", priority: jobPriority + 20, status: "pending", payload: { platform: "telegram" } });
  }

  if (importanceScore >= 80) {
    jobs.push({ post_slug: slug, job_type: "sitemap", priority: 5, status: "pending" });
  }

  if (jobs.length > 0) {
    await supabase.from("pipeline_jobs").insert(jobs);
  }
}
