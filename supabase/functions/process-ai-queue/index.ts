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
  const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  const stats = { processed: 0, succeeded: 0, failed: 0 };
  const targetTypes = ["rewrite", "seo", "tags", "summary", "social", "quality"];

  try {
    // Process up to 3 jobs per Edge Function invocation to avoid timeouts
    for (let run = 0; run < 3; run++) {
      const { data: jobArray, error: grabErr } = await supabase.rpc("grab_next_job", {
        target_job_types: targetTypes,
        lock_duration: "5 minutes"
      });

      if (grabErr) throw grabErr;
      if (!jobArray || jobArray.length === 0) {
        break; // No more pending jobs
      }

      const job = jobArray[0];
      stats.processed++;

      // Fetch the associated blog post details
      const { data: post, error: postErr } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", job.post_slug)
        .maybeSingle();

      if (postErr || !post) {
        console.error(`Post not found for slug: ${job.post_slug}`);
        await markJobFailed(supabase, job, "Associated blog post not found in DB");
        stats.failed++;
        continue;
      }

      console.log(`Processing job ${job.id} (${job.job_type}) for post "${post.title.slice(0, 40)}"`);

      try {
        if (job.job_type === "rewrite") {
          await handleRewrite(supabase, job, post, geminiKey);
        } else if (job.job_type === "seo") {
          await handleSeo(supabase, job, post, geminiKey);
        } else if (job.job_type === "tags") {
          await handleTags(supabase, job, post, geminiKey);
        } else if (job.job_type === "summary") {
          await handleSummary(supabase, job, post, geminiKey);
        } else if (job.job_type === "social") {
          await handleSocial(supabase, job, post, geminiKey);
        } else if (job.job_type === "quality") {
          await handleQuality(supabase, job, post);
        }

        // Mark job as done
        await supabase
          .from("pipeline_jobs")
          .update({
            status: "done",
            completed_at: new Date().toISOString(),
            error_log: null
          })
          .eq("id", job.id);

        stats.succeeded++;
      } catch (err: any) {
        console.error(`Job ${job.id} failed:`, err.message);
        await markJobFailed(supabase, job, err.message);
        stats.failed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, stats }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Queue worker iteration failed:", error.message);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});

// Helper for failure & exponential backoff scheduling
async function markJobFailed(supabase: any, job: any, errorMsg: string) {
  const retryCount = (job.retry_count || 0) + 1;
  const isDead = retryCount >= (job.max_retries || 3);
  const status = isDead ? "dead" : "failed";

  const backoffMins = Math.pow(2, retryCount) * 2;
  const scheduledAt = new Date(Date.now() + backoffMins * 60 * 1000).toISOString();

  await supabase
    .from("pipeline_jobs")
    .update({
      status,
      retry_count: retryCount,
      scheduled_at: scheduledAt,
      error_log: errorMsg
    })
    .eq("id", job.id);

  // If dead, write to dead letter failure archive
  if (isDead) {
    await supabase.from("pipeline_failures").insert({
      post_slug: job.post_slug,
      job_type: job.job_type,
      error: errorMsg,
      payload: { job_id: job.id, last_payload: job.payload }
    });

    // If rewrite died, fallback raw post to completed state so it remains visible
    if (job.job_type === "rewrite") {
      await supabase
        .from("blog_posts")
        .update({ ai_queue_status: "completed" })
        .eq("slug", job.post_slug);
    }
  }
}

// REST call helper to Gemini
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return textResponse.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Core Handlers
async function handleRewrite(supabase: any, job: any, post: any, geminiKey: string) {
  const sourceText = post.content || "";
  const wordCount = sourceText.split(/\s+/).length;
  if (wordCount < 5) {
    await supabase.from("blog_posts").update({ ai_queue_status: "completed" }).eq("slug", post.slug);
    return;
  }

  const cHash = await sha256(sourceText.trim());

  // Check cache first
  const { data: cached } = await supabase
    .from("ai_cache")
    .select("title, summary")
    .eq("content_hash", cHash)
    .maybeSingle();

  if (cached) {
    await supabase
      .from("blog_posts")
      .update({
        title: cached.title,
        content: cached.summary,
        excerpt: cached.summary,
        ai_queue_status: "rewrite_completed"
      })
      .eq("slug", post.slug);
    return;
  }

  const prompt = `You are VarthaNow, a professional Telugu news editor. Rewrite the following into an original, SEO-optimized Telugu news article.

Rules:
- Completely rewrite in natural, professional Telugu. Do NOT copy source text.
- Preserve facts, names, dates, places, and numbers accurately.
- No fake statistics or invented details.
- Use markdown with headings, short paragraphs, and bullet points only where useful.
- Include a short, highly-specific, action-oriented 1-2 question FAQ section at the end (do NOT make it generic).
- At the very bottom, include 5 to 8 relevant #hashtags.
- Title: max 12 Telugu words, compelling and factual.
- Summary/excerpt: 40-60 words.
- Content target: 60-120 words of rewritten Telugu content (Short News format).
- Return ONLY valid raw JSON (no markdown fences):

{"title":"Telugu title","summary":"40-60 word excerpt","content":"Full markdown article body"}

Source Article:
${sourceText.slice(0, 3500)}`;

  const resText = await callGemini(prompt, geminiKey);
  const parsed = JSON.parse(resText);

  const finalTitle = parsed.title || post.title;
  const finalContent = parsed.content || parsed.summary || sourceText;
  const finalExcerpt = parsed.summary || "";

  await supabase
    .from("blog_posts")
    .update({
      title: finalTitle,
      content: finalContent,
      excerpt: finalExcerpt,
      content_hash: cHash,
      ai_queue_status: "rewrite_completed"
    })
    .eq("slug", post.slug);

  // Write to AI Cache
  await supabase.from("ai_cache").insert({
    content_hash: cHash,
    title: finalTitle,
    summary: finalContent,
    category: post.category
  });
}

async function handleSeo(supabase: any, job: any, post: any, geminiKey: string) {
  const prompt = `Generate SEO metadata for a Telugu news article. Return ONLY raw JSON (no markdown):

{"meta_title": "SEO title max 60 chars in Telugu", "meta_description": "Compelling meta description max 155 chars in Telugu", "slug_suggestion": "english-slug-for-url"}

Article Title: ${post.title}
Category: ${post.category}
Content preview: ${(post.content || "").slice(0, 500)}`;

  const resText = await callGemini(prompt, geminiKey);
  const parsed = JSON.parse(resText);

  await supabase
    .from("blog_posts")
    .update({
      meta_title: (parsed.meta_title || post.title).slice(0, 70),
      meta_description: (parsed.meta_description || post.title).slice(0, 160),
      ai_queue_status: "seo_completed"
    })
    .eq("slug", post.slug);
}

async function handleTags(supabase: any, job: any, post: any, geminiKey: string) {
  const prompt = `Analyze this Telugu news article and return ONLY raw JSON (no markdown):

{"tags": ["tag1", "tag2", "tag3", "tag4", "tag5"], "keywords": ["keyword1", "keyword2", "keyword3"], "sentiment": "positive|negative|neutral", "is_breaking": true|false}

Title: ${post.title}
Category: ${post.category}
Content preview: ${(post.content || "").slice(0, 600)}`;

  const resText = await callGemini(prompt, geminiKey);
  const parsed = JSON.parse(resText);
  const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [post.category, "వาร์తలు"];

  await supabase
    .from("blog_posts")
    .update({
      tags,
      featured: parsed.is_breaking === true,
      ai_queue_status: "tags_completed"
    })
    .eq("slug", post.slug);
}

async function handleSummary(supabase: any, job: any, post: any, geminiKey: string) {
  const prompt = `Summarize this Telugu news article in exactly 90-110 Telugu words. Professional, factual tone. Return ONLY raw JSON:

{"summary": "90-110 word Telugu summary", "summary_short": "15-20 word quick headline summary"}

Title: ${post.title}
Content: ${(post.content || "").slice(0, 1200)}`;

  const resText = await callGemini(prompt, geminiKey);
  const parsed = JSON.parse(resText);

  await supabase
    .from("blog_posts")
    .update({
      excerpt: (parsed.summary || post.excerpt).slice(0, 500),
      summary_short: (parsed.summary_short || post.excerpt || "").slice(0, 120),
      summary_medium: (parsed.summary || post.excerpt || "").slice(0, 400),
      ai_queue_status: "completed"
    })
    .eq("slug", post.slug);
}

async function handleSocial(supabase: any, job: any, post: any, geminiKey: string) {
  const prompt = `Create a Telegram channel post for this Telugu news article. Return ONLY raw JSON:

{"telegram": "Telegram message with emoji, headline, 2-3 sentence summary in Telugu, and article link placeholder [LINK]", "facebook": "Facebook post text in Telugu", "twitter": "Twitter/X post max 240 chars in Telugu with #hashtags"}

Title: ${post.title}
Summary: ${post.excerpt || (post.content || "").slice(0, 400)}
Category: ${post.category}`;

  const resText = await callGemini(prompt, geminiKey);
  const parsed = JSON.parse(resText);

  // Update pipeline job payload with final captions
  await supabase
    .from("pipeline_jobs")
    .update({
      payload: {
        ...job.payload,
        telegram_caption: parsed.telegram || "",
        facebook_caption: parsed.facebook || "",
        twitter_caption: parsed.twitter || "",
        ready_to_post: true
      }
    })
    .eq("id", job.id);
}

async function handleQuality(supabase: any, job: any, post: any) {
  const content = post.content || "";
  const wordCount = content.split(/\s+/).length;
  const teluguRatio = (content.match(/[\u0C00-\u0C7F]/g) || []).length / Math.max(content.length, 1);

  let qualityScore = 10;
  if (wordCount >= 400) qualityScore += 40;
  else if (wordCount >= 200) qualityScore += 25;
  if (teluguRatio >= 0.15) qualityScore += 30;
  else if (teluguRatio > 0) qualityScore += 15;
  if (post.excerpt && post.excerpt.length >= 50) qualityScore += 10;
  if (post.meta_title && post.meta_description) qualityScore += 10;

  await supabase
    .from("blog_posts")
    .update({
      quality_score: Math.min(100, qualityScore)
    })
    .eq("slug", post.slug);
}
