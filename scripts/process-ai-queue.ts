import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as crypto from "crypto";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — AI Queue Worker v2.0
//  Reads from pipeline_jobs table (independent per job type)
//  Gemini Flash-Lite → Flash → OpenRouter → OpenAI → Claude → Skip
//  Content SHA256 cache to avoid duplicate AI calls
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

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════
//  AI PROVIDER ABSTRACTION — Multi-provider with automatic fallback
// ═══════════════════════════════════════════════════════════════════

async function callGemini(prompt: string, model: string): Promise<string> {
  if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");
  const genAI = new GoogleGenerativeAI(geminiKey);
  const m = genAI.getGenerativeModel({ model });
  const result = await m.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.25, maxOutputTokens: 2048 }
  });
  return result.response.text().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function callOpenRouter(prompt: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not configured");
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(30_000)
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "{}";
}


async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(30_000)
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "{}";
}

async function callClaude(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt + "\nOutput ONLY raw JSON format." }],
      temperature: 0.25
    }),
    signal: AbortSignal.timeout(30_000)
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "{}";
}

// ── Rate limiter: Free tier = 10 req/min → 1 req/6s to be safe ──
let lastAiCallAt = 0;
const AI_MIN_GAP_MS = 7000; // 7 seconds between calls = ~8 req/min (safe under 10)

async function rateLimitedDelay() {
  const now = Date.now();
  const wait = AI_MIN_GAP_MS - (now - lastAiCallAt);
  if (wait > 0) {
    console.log(`    ⏱️  Rate limit pause: ${Math.round(wait / 1000)}s`);
    await delay(wait);
  }
  lastAiCallAt = Date.now();
}

// Parse retryDelay seconds from a Gemini 429 error message
function parseRetryDelay(errorMessage: string): number {
  const match = errorMessage.match(/retryDelay.*?(\d+)s/);
  if (match) return parseInt(match[1]) * 1000 + 2000; // add 2s buffer
  const match2 = errorMessage.match(/retry in (\d+\.?\d*)s/i);
  if (match2) return Math.ceil(parseFloat(match2[1])) * 1000 + 2000;
  return 65000; // default: wait 65s on unknown 429
}

// Dynamic provider chain: configured dynamically by environment variables
async function callAI(prompt: string, wordCount: number = 0): Promise<string> {
  const errors: string[] = [];
  
  const primaryProvider = (process.env.PRIMARY_AI_PROVIDER || "gemini").toLowerCase().trim();
  const fallbackProvider = (process.env.FALLBACK_AI_PROVIDER || "openrouter").toLowerCase().trim();

  // Order of providers to try
  const chain: string[] = [primaryProvider, fallbackProvider];
  
  // Ultimate fallbacks (append unique providers that aren't already primary/fallback)
  const allProviders = ["gemini", "openrouter", "openai", "claude"];
  for (const p of allProviders) {
    if (!chain.includes(p)) chain.push(p);
  }

  console.log(`    📋 AI Chain order: ${chain.join(" → ")}`);

  for (const provider of chain) {
    try {
      if (provider === "gemini") {
        if (!geminiKey) continue;
        const model = wordCount >= 1200 ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";
        try {
          await rateLimitedDelay();
          console.log(`    🤖 Trying Gemini (${model})...`);
          return await callGemini(prompt, model);
        } catch (e: any) {
          const msg: string = e.message || "";
          const is429 = msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota");
          if (is429) {
            const waitMs = parseRetryDelay(msg);
            console.warn(`    ⏳ Gemini rate limit. Waiting ${Math.round(waitMs / 1000)}s before retry...`);
            await delay(waitMs);
            lastAiCallAt = Date.now();
            return await callGemini(prompt, model);
          } else {
            throw e;
          }
        }
      }

      if (provider === "openrouter") {
        const key = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
        if (!key) continue;
        const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
        console.log(`    🤖 Trying OpenRouter (${model})...`);
        return await callOpenRouter(prompt);
      }

      if (provider === "openai") {
        const key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!key) continue;
        console.log(`    🤖 Trying OpenAI (gpt-4o-mini)...`);
        return await callOpenAI(prompt);
      }

      if (provider === "claude") {
        const key = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
        if (!key) continue;
        console.log(`    🤖 Trying Claude (haiku)...`);
        return await callClaude(prompt);
      }
    } catch (err: any) {
      errors.push(`${provider}: ${err.message}`);
      console.warn(`    ⚠️  Provider "${provider}" failed: ${err.message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}


// ═══════════════════════════════════════════════════════════════════
//  JOB WORKER HELPERS
// ═══════════════════════════════════════════════════════════════════

async function markJobStarted(jobId: string): Promise<void> {
  await supabase.from("pipeline_jobs").update({
    status: "processing",
    started_at: new Date().toISOString()
  }).eq("id", jobId);
}

async function markJobDone(jobId: string): Promise<void> {
  await supabase.from("pipeline_jobs").update({
    status: "done",
    completed_at: new Date().toISOString()
  }).eq("id", jobId);
}

async function markJobFailed(jobId: string, error: string, retryCount: number, maxRetries: number): Promise<void> {
  if (retryCount >= maxRetries) {
    await supabase.from("pipeline_jobs").update({
      status: "dead",
      error_log: error,
      completed_at: new Date().toISOString()
    }).eq("id", jobId);

    // Archive to dead letter queue
    await supabase.from("pipeline_failures").insert({
      post_slug: null,
      job_type: "unknown",
      error,
      payload: { job_id: jobId },
      created_at: new Date().toISOString()
    }).then(() => {}); // fire and forget
  } else {
    // Exponential backoff: 2min, 8min, 20min
    const backoffSeconds = [120, 480, 1200][retryCount] || 1200;
    const scheduledAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();
    await supabase.from("pipeline_jobs").update({
      status: "failed",
      retry_count: retryCount + 1,
      scheduled_at: scheduledAt,
      error_log: error
    }).eq("id", jobId);
    console.log(`    ♻️  Retry ${retryCount + 1}/${maxRetries} scheduled in ${backoffSeconds / 60}min`);
  }
}

async function fetchPendingJobs(jobType: string, limit = 8): Promise<any[]> {
  const { data, error } = await supabase
    .from("pipeline_jobs")
    .select("*, blog_posts(slug, title, content, excerpt, category, relevance_score, word_count, meta_title, content_hash)")
    .eq("job_type", jobType)
    .in("status", ["pending", "failed"])
    .lte("scheduled_at", new Date().toISOString())
    .order("priority", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error(`  ❌ Failed to fetch ${jobType} jobs: ${error.message}`);
    return [];
  }
  return data || [];
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER A: AI REWRITE
// ═══════════════════════════════════════════════════════════════════

async function runRewriteWorker() {
  const jobs = await fetchPendingJobs("rewrite");
  if (jobs.length === 0) { console.log("  😴 [Rewrite] No jobs pending"); return; }

  // On free tier: process max 3 rewrite jobs per pass to avoid quota burst
  const freeTierSafe = jobs.slice(0, 3);
  console.log(`  🤖 [Rewrite] Processing ${freeTierSafe.length}/${jobs.length} jobs (rate-limited pass)...`);

  for (const job of freeTierSafe) {
    const post = job.blog_posts;
    if (!post) { await markJobFailed(job.id, "Post not found", job.retry_count, job.max_retries); continue; }

    console.log(`\n  ▶ [Rewrite] "${post.title?.slice(0, 60)}..."`);
    await markJobStarted(job.id);

    const sourceText = post.content || "";
    const wordCount = post.word_count || sourceText.split(/\s+/).length;
    const category = post.category || "national";

    // Skip AI for very short content
    if (wordCount < 150) {
      console.log(`  ⚡ Too short (${wordCount} words). Marking done.`);
      await markJobDone(job.id);
      await supabase.from("blog_posts").update({ ai_queue_status: "completed", social_thumbnail_url: "completed" }).eq("slug", post.slug);
      continue;
    }

    // Check content hash cache first
    const cHash = crypto.createHash("sha256").update(sourceText.trim()).digest("hex");
    let aiTitle = "", aiContent = "", aiSummary = "", usedCache = false;

    try {
      const { data: cached } = await supabase.from("ai_cache")
        .select("title, summary").eq("content_hash", cHash).maybeSingle();
      if (cached) {
        console.log(`  ✨ Cache hit (${cHash.slice(0, 8)}...)`);
        aiTitle = cached.title;
        aiContent = cached.summary;
        aiSummary = cached.summary;
        usedCache = true;
      }
    } catch {}

    if (!usedCache) {
      try {
        const prompt = `You are VarthaNow, a professional Telugu news editor. Rewrite the following into an original, SEO-optimized Telugu news article.

Rules:
- Completely rewrite in natural, professional Telugu. Do NOT copy source text.
- No fake statistics. Factual only.
- Use markdown: headings, short paragraphs, bullet points where appropriate.
- Include a 5-question FAQ section at the end.
- Title: max 12 Telugu words, compelling and factual.
- Summary/excerpt: 50-80 words, captures the key news.
- Content: minimum 400 words of rewritten Telugu content.
- Return ONLY valid raw JSON (no markdown fences):

{"title": "Telugu title", "summary": "50-80 word excerpt", "content": "Full markdown article body"}

Source Article (${category}):
${sourceText.slice(0, 5000)}`;

        const raw = await callAI(prompt, wordCount);
        const parsed = JSON.parse(raw);
        aiTitle = parsed.title || post.title;
        aiContent = parsed.content || parsed.summary || sourceText;
        aiSummary = parsed.summary || parsed.excerpt || "";

        // Cache result
        try {
          await supabase.from("ai_cache").insert({ content_hash: cHash, title: aiTitle, summary: aiContent, category }).then(() => {});
        } catch {}
      } catch (e: any) {
        console.error(`  ❌ Rewrite failed: ${e.message}`);
        await markJobFailed(job.id, e.message, job.retry_count, job.max_retries);
        continue;
      }
    }

    await supabase.from("blog_posts").update({
      title: aiTitle || post.title,
      content: aiContent,
      excerpt: aiSummary || post.excerpt,
      content_hash: cHash,
      ai_queue_status: "rewrite_completed",
      social_thumbnail_url: "rewrite_completed",
    }).eq("slug", post.slug);

    await markJobDone(job.id);
    console.log(`  ✅ [Rewrite] Done${usedCache ? " (cached)" : ""}`);
    await delay(1200);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER B: SEO TITLE + META
// ═══════════════════════════════════════════════════════════════════

async function runSeoWorker() {
  const jobs = await fetchPendingJobs("seo");
  if (jobs.length === 0) { console.log("  😴 [SEO] No jobs pending"); return; }

  const freeTierSafe = jobs.slice(0, 3);
  console.log(`  🔍 [SEO] Processing ${freeTierSafe.length}/${jobs.length} jobs (rate-limited pass)...`);

  for (const job of freeTierSafe) {
    const post = job.blog_posts;
    if (!post) { await markJobFailed(job.id, "Post not found", job.retry_count, job.max_retries); continue; }

    console.log(`  ▶ [SEO] "${post.title?.slice(0, 60)}"`);
    await markJobStarted(job.id);

    try {
      const prompt = `Generate SEO metadata for a Telugu news article. Return ONLY raw JSON (no markdown):

{"meta_title": "SEO title max 60 chars in Telugu", "meta_description": "Compelling meta description max 155 chars in Telugu", "slug_suggestion": "english-slug-for-url"}

Article Title: ${post.title}
Category: ${post.category}
Content preview: ${(post.content || "").slice(0, 500)}`;

      const raw = await callAI(prompt);
      const parsed = JSON.parse(raw);

      await supabase.from("blog_posts").update({
        meta_title: (parsed.meta_title || post.meta_title || post.title).slice(0, 70),
        meta_description: (parsed.meta_description || post.meta_description || post.title).slice(0, 160),
        ai_queue_status: "seo_completed",
        social_thumbnail_url: "seo_completed"
      }).eq("slug", post.slug);

      await markJobDone(job.id);
      console.log(`  ✅ [SEO] Done`);
    } catch (e: any) {
      console.error(`  ❌ [SEO] Failed: ${e.message}`);
      await markJobFailed(job.id, e.message, job.retry_count, job.max_retries);
    }
    await delay(800);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER C: TAGS + CATEGORY DETECTION
// ═══════════════════════════════════════════════════════════════════

async function runTagsWorker() {
  const jobs = await fetchPendingJobs("tags");
  if (jobs.length === 0) { console.log("  😴 [Tags] No jobs pending"); return; }

  const freeTierSafe = jobs.slice(0, 3);
  console.log(`  🏷️  [Tags] Processing ${freeTierSafe.length}/${jobs.length} jobs (rate-limited pass)...`);

  for (const job of freeTierSafe) {
    const post = job.blog_posts;
    if (!post) { await markJobFailed(job.id, "Post not found", job.retry_count, job.max_retries); continue; }

    console.log(`  ▶ [Tags] "${post.title?.slice(0, 60)}"`);
    await markJobStarted(job.id);

    try {
      const prompt = `Analyze this Telugu news article and return ONLY raw JSON (no markdown):

{"tags": ["tag1", "tag2", "tag3", "tag4", "tag5"], "keywords": ["keyword1", "keyword2", "keyword3"], "sentiment": "positive|negative|neutral", "is_breaking": true|false}

Rules:
- tags: 5-8 Telugu or English tags relevant to the article
- keywords: 3-5 SEO keywords in Telugu
- sentiment: one of positive, negative, neutral
- is_breaking: true only for major urgent news

Title: ${post.title}
Category: ${post.category}
Content preview: ${(post.content || "").slice(0, 600)}`;

      const raw = await callAI(prompt);
      const parsed = JSON.parse(raw);
      const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [post.category, "వార్తలు"];

      await supabase.from("blog_posts").update({
        tags,
        featured: parsed.is_breaking === true,
        ai_queue_status: "tags_completed",
        social_thumbnail_url: "tags_completed"
      }).eq("slug", post.slug);

      await markJobDone(job.id);
      console.log(`  ✅ [Tags] ${tags.join(", ")}`);
    } catch (e: any) {
      console.error(`  ❌ [Tags] Failed: ${e.message}`);
      await markJobFailed(job.id, e.message, job.retry_count, job.max_retries);
    }
    await delay(800);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER D: TELUGU SUMMARY
// ═══════════════════════════════════════════════════════════════════

async function runSummaryWorker() {
  const jobs = await fetchPendingJobs("summary");
  if (jobs.length === 0) { console.log("  😴 [Summary] No jobs pending"); return; }

  console.log(`  📝 [Summary] Processing ${jobs.length} jobs...`);

  for (const job of jobs) {
    const post = job.blog_posts;
    if (!post) { await markJobFailed(job.id, "Post not found", job.retry_count, job.max_retries); continue; }

    console.log(`  ▶ [Summary] "${post.title?.slice(0, 60)}"`);
    await markJobStarted(job.id);

    try {
      const prompt = `Summarize this Telugu news article in exactly 50-80 Telugu words. Professional, factual tone. Return ONLY raw JSON:

{"summary": "50-80 word Telugu summary", "summary_short": "15-20 word quick headline summary"}

Title: ${post.title}
Content: ${(post.content || "").slice(0, 1200)}`;

      const raw = await callAI(prompt);
      const parsed = JSON.parse(raw);

      await supabase.from("blog_posts").update({
        excerpt: (parsed.summary || post.excerpt).slice(0, 500),
        summary_short: (parsed.summary_short || post.excerpt || "").slice(0, 120),
        summary_medium: (parsed.summary || post.excerpt || "").slice(0, 400),
        ai_queue_status: "completed",
        social_thumbnail_url: "completed"
      }).eq("slug", post.slug);

      await markJobDone(job.id);
      console.log(`  ✅ [Summary] Done → status=completed`);
    } catch (e: any) {
      console.error(`  ❌ [Summary] Failed: ${e.message}`);
      await markJobFailed(job.id, e.message, job.retry_count, job.max_retries);
    }
    await delay(800);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER E: SOCIAL CAPTION (Telegram format)
// ═══════════════════════════════════════════════════════════════════

async function runSocialWorker() {
  const jobs = await fetchPendingJobs("social", 5);
  if (jobs.length === 0) { console.log("  😴 [Social] No jobs pending"); return; }

  console.log(`  📣 [Social] Processing ${jobs.length} jobs...`);

  for (const job of jobs) {
    const post = job.blog_posts;
    if (!post) { await markJobFailed(job.id, "Post not found", job.retry_count, job.max_retries); continue; }

    console.log(`  ▶ [Social] "${post.title?.slice(0, 60)}"`);
    await markJobStarted(job.id);

    try {
      const prompt = `Create a Telegram channel post for this Telugu news article. Return ONLY raw JSON:

{"telegram": "Telegram message with emoji, headline, 2-3 sentence summary in Telugu, and article link placeholder [LINK]", "facebook": "Facebook post text in Telugu", "twitter": "Twitter/X post max 240 chars in Telugu with #hashtags"}

Title: ${post.title}
Summary: ${post.excerpt || (post.content || "").slice(0, 400)}
Category: ${post.category}`;

      const raw = await callAI(prompt);
      const parsed = JSON.parse(raw);

      // Store social captions in summary_long field (repurposed) or payload
      await supabase.from("pipeline_jobs").update({
        status: "done",
        completed_at: new Date().toISOString(),
        payload: {
          ...job.payload,
          telegram_caption: parsed.telegram || "",
          facebook_caption: parsed.facebook || "",
          twitter_caption: parsed.twitter || "",
          ready_to_post: true
        }
      }).eq("id", job.id);

      console.log(`  ✅ [Social] Captions generated`);
    } catch (e: any) {
      console.error(`  ❌ [Social] Failed: ${e.message}`);
      await markJobFailed(job.id, e.message, job.retry_count, job.max_retries);
    }
    await delay(800);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER F: QUALITY SCORER
// ═══════════════════════════════════════════════════════════════════

async function runQualityWorker() {
  const jobs = await fetchPendingJobs("quality", 10);
  if (jobs.length === 0) return;

  console.log(`  🏆 [Quality] Processing ${jobs.length} jobs...`);

  for (const job of jobs) {
    const post = job.blog_posts;
    if (!post) { await markJobDone(job.id); continue; }
    await markJobStarted(job.id);

    // Calculate quality scores without AI (rule-based)
    const content = post.content || "";
    const wordCount = content.split(/\s+/).length;
    const hasTeluguChars = /[\u0C00-\u0C7F]/.test(content);
    const teluguRatio = (content.match(/[\u0C00-\u0C7F]/g) || []).length / Math.max(content.length, 1);

    let qualityScore = 0;
    if (wordCount >= 400) qualityScore += 40;
    else if (wordCount >= 200) qualityScore += 25;
    else qualityScore += 10;
    if (teluguRatio >= 0.15) qualityScore += 30;
    else if (teluguRatio > 0) qualityScore += 15;
    else qualityScore += 20; // English articles still valid
    if (post.excerpt && post.excerpt.length >= 50) qualityScore += 15;
    if (post.meta_title && post.meta_description) qualityScore += 15;

    await supabase.from("blog_posts").update({
      quality_score: Math.min(100, qualityScore)
    }).eq("slug", post.slug);

    await markJobDone(job.id);
    await delay(100);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WORKER G: DLQ Handler — Rescue or Archive Dead Jobs
// ═══════════════════════════════════════════════════════════════════

async function runDlqWorker() {
  const { data: deadJobs, error } = await supabase
    .from("pipeline_jobs")
    .select("id, post_slug, job_type, error_log, created_at")
    .eq("status", "dead")
    .order("created_at", { ascending: true })
    .limit(20);

  if (error || !deadJobs?.length) return;

  console.log(`  ☠️  [DLQ] ${deadJobs.length} dead jobs found`);

  for (const job of deadJobs) {
    // For rewrite jobs that died: mark the article as completed with original content
    if (job.job_type === "rewrite") {
      await supabase.from("blog_posts").update({
        ai_queue_status: "completed",
        social_thumbnail_url: "completed",
        image_validation_reason: `AI rewrite failed after max retries: ${job.error_log?.slice(0, 200)}`
      }).eq("slug", job.post_slug);
    }
    // Archive and remove from active queue
    await supabase.from("pipeline_failures").insert({
      post_slug: job.post_slug,
      job_type: job.job_type,
      error: job.error_log,
      payload: { job_id: job.id }
    });
    await supabase.from("pipeline_jobs").delete().eq("id", job.id);
    console.log(`  📦 [DLQ] Archived: ${job.post_slug}/${job.job_type}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  COMPATIBILITY LAYER: Old social_thumbnail_url state machine
//  Migrates posts stuck in old queue to pipeline_jobs
// ═══════════════════════════════════════════════════════════════════

async function migrateOldQueueItems() {
  try {
    const { data: oldItems } = await supabase
      .from("blog_posts")
      .select("slug, category, content, word_count, relevance_score, social_thumbnail_url, ai_queue_status")
      .in("social_thumbnail_url", ["pending_ai", "batch_ai", "rewrite_completed", "seo_completed", "tags_completed"])
      .not("ai_queue_status", "in", '("rewrite_completed","seo_completed","tags_completed","completed")')
      .order("relevance_score", { ascending: false })
      .limit(20);

    if (!oldItems || oldItems.length === 0) return;

    console.log(`\n🔄 [Migration] Migrating ${oldItems.length} old-queue posts to pipeline_jobs...`);

    for (const post of oldItems) {
      const state = post.social_thumbnail_url;
      const score = post.relevance_score || 50;
      const wordCount = post.word_count || (post.content || "").split(/\s+/).length;
      const priority = score >= 70 ? 15 : score >= 40 ? 30 : 60;

      // Check if jobs already exist for this post
      const { data: existing } = await supabase
        .from("pipeline_jobs")
        .select("id")
        .eq("post_slug", post.slug)
        .limit(1);
      if (existing && existing.length > 0) continue;

      // Create missing jobs based on current state
      const jobs: any[] = [];
      if (state === "pending_ai" || state === "batch_ai") {
        if (wordCount >= 150) {
          jobs.push({ post_slug: post.slug, job_type: "rewrite", priority, payload: { category: post.category, word_count: wordCount } });
          jobs.push({ post_slug: post.slug, job_type: "seo", priority: priority + 5, payload: {} });
          jobs.push({ post_slug: post.slug, job_type: "tags", priority: priority + 10, payload: {} });
          jobs.push({ post_slug: post.slug, job_type: "summary", priority: priority + 15, payload: {} });
        }
      } else if (state === "rewrite_completed") {
        jobs.push({ post_slug: post.slug, job_type: "seo", priority, payload: {} });
        jobs.push({ post_slug: post.slug, job_type: "tags", priority: priority + 5, payload: {} });
        jobs.push({ post_slug: post.slug, job_type: "summary", priority: priority + 10, payload: {} });
      } else if (state === "seo_completed") {
        jobs.push({ post_slug: post.slug, job_type: "tags", priority, payload: {} });
        jobs.push({ post_slug: post.slug, job_type: "summary", priority: priority + 5, payload: {} });
      } else if (state === "tags_completed") {
        jobs.push({ post_slug: post.slug, job_type: "summary", priority, payload: {} });
      }

      if (jobs.length > 0) {
        await supabase.from("pipeline_jobs").insert(jobs);
        console.log(`  📋 Migrated: ${post.slug} (${state} → ${jobs.length} jobs)`);
      }
    }
  } catch (err: any) {
    console.warn(`⚠️  Migration error: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════

async function processAiQueue() {
  console.log("═".repeat(65));
  console.log("🤖  VaartaNow AI Queue Worker v2.0 — STARTED");
  console.log(`    ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
  console.log("═".repeat(65));

  // Migrate old-queue posts to pipeline_jobs first
  await migrateOldQueueItems();

  // Run all workers in sequence (one full pass per invocation)
  // Workers run independently — each handles its own job type
  console.log("\n[Worker A] AI Rewrite");
  await runRewriteWorker();
  await delay(1000);

  console.log("\n[Worker B] SEO Metadata");
  await runSeoWorker();
  await delay(500);

  console.log("\n[Worker C] Tags & Category");
  await runTagsWorker();
  await delay(500);

  console.log("\n[Worker D] Telugu Summary");
  await runSummaryWorker();
  await delay(500);

  console.log("\n[Worker E] Social Captions");
  await runSocialWorker();
  await delay(500);

  console.log("\n[Worker F] Quality Scoring");
  await runQualityWorker();
  await delay(200);

  console.log("\n[Worker G] Dead Letter Queue");
  await runDlqWorker();

  console.log("\n✅  AI Queue Worker pass complete.");
}

processAiQueue().catch(e => {
  console.error("💀 Fatal AI worker error:", e);
  process.exit(1);
});
