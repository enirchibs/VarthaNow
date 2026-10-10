import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Parser from "rss-parser";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { createHash } from "node:crypto";
import * as fsSync from "fs";
import { ensureBucket, libraryTags, storyImage, type ImageKeywords } from "./lib/news-images";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — 60-word news shorts (replaces ingest + ai-queue)
//
//  Each run picks a few fresh, distinct stories from the RSS feeds, reads the
//  source article and has Gemini write an original Telugu headline + ~60-word
//  summary. Nothing is published unless the summary passes every check:
//  45–80 words, mostly Telugu script, and no copied phrasing from the source.
//  Source is credited via publisher + source_article_url (shown on the article
//  page). Publisher images are NOT reused: each story image is composed from our own
//  tagged photo library on aapstack.tech (scripts/lib/news-images.ts).
//
//    npx tsx scripts/news-shorts.ts --dry-run --max=3   # preview, writes nothing
//    npx tsx scripts/news-shorts.ts                     # publish up to 5 shorts
// ═══════════════════════════════════════════════════════════════════

try {
  const envText = fsSync.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && val && !process.env[key]) process.env[key] = val;
  }
} catch {}

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_PER_RUN = Number(arg("max") ?? 5);
const FRESH_HOURS = 6;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;
const missing = [["SUPABASE_URL", supabaseUrl], ["SUPABASE_SERVICE_ROLE_KEY", serviceKey], ["GEMINI_API_KEY", geminiKey]]
  .filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`Missing in .env: ${missing.join(", ")}`);
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const gemini = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model: MODEL });
const parser = new Parser({ timeout: 15_000, headers: { "User-Agent": "Mozilla/5.0 (compatible; VaartaNowBot/1.0)" } });

const CATEGORIES = ["andhra-pradesh", "telangana", "national", "politics", "cinema", "cricket", "business", "technology", "health", "jobs", "devotional", "vizag"];

type Feed = { url: string; category: string; publisher: string; priority_tier: number | null };
type Candidate = { title: string; link: string; publishedAt: number; feed: Feed };
type Short = { title: string; summary: string; category: string; tags: string[]; image_keywords?: ImageKeywords };

// ── text helpers ─────────────────────────────────────────────────────
const words = (s: string) => s.split(/\s+/).filter(Boolean);
const teluguRatio = (s: string) => {
  const letters = s.replace(/[\s\d\p{P}\p{S}]/gu, "");
  return letters ? (letters.match(/[ఀ-౿]/g)?.length ?? 0) / letters.length : 0;
};
const tokens = (s: string) => new Set(words(s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ")).filter((w) => w.length > 1));
const similarity = (a: string, b: string) => {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  A.forEach((t) => B.has(t) && shared++);
  return shared / Math.min(A.size, B.size);
};
// Share of the summary's 5-word phrases that appear verbatim in the source.
const copiedShare = (summary: string, source: string) => {
  const w = words(summary);
  if (w.length < 5) return 0;
  const src = words(source).join(" ");
  let hits = 0;
  for (let i = 0; i + 5 <= w.length; i++) if (src.includes(w.slice(i, i + 5).join(" "))) hits++;
  return hits / (w.length - 4);
};

// ── pipeline steps ───────────────────────────────────────────────────
async function collectCandidates(feeds: Feed[]): Promise<Candidate[]> {
  const cutoff = Date.now() - FRESH_HOURS * 3_600_000;
  const out: Candidate[] = [];
  await Promise.all(
    feeds.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items ?? []) {
          const publishedAt = Date.parse(item.isoDate || item.pubDate || "");
          if (item.title && item.link && publishedAt >= cutoff) out.push({ title: item.title.trim(), link: item.link, publishedAt, feed });
        }
      } catch (e: any) {
        console.warn(`  feed failed: ${feed.publisher} (${e.message?.slice(0, 60)})`);
      }
    })
  );
  return out;
}

async function dropKnown(candidates: Candidate[]): Promise<Candidate[]> {
  const since = new Date(Date.now() - 48 * 3_600_000).toISOString();
  const { data, error } = await supabase.from("blog_posts").select("title, source_article_url").gte("published_at", since);
  if (error) throw new Error(`load recent posts: ${error.message}`);
  const knownLinks = new Set(data.map((p) => p.source_article_url));
  const knownTitles = data.map((p) => p.title as string);
  return candidates.filter((c) => !knownLinks.has(c.link) && !knownTitles.some((t) => similarity(t, c.title) > 0.6));
}

// Few, varied stories: newest per category first, one story per topic, rotate categories.
function pick(candidates: Candidate[], max: number): Candidate[] {
  const byCategory = new Map<string, Candidate[]>();
  for (const c of candidates.sort((a, b) => (a.feed.priority_tier ?? 9) - (b.feed.priority_tier ?? 9) || b.publishedAt - a.publishedAt)) {
    byCategory.set(c.feed.category, [...(byCategory.get(c.feed.category) ?? []), c]);
  }
  const chosen: Candidate[] = [];
  const queues = [...byCategory.values()];
  while (chosen.length < max * 2 && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && !chosen.some((c) => similarity(c.title, next.title) > 0.5)) chosen.push(next);
    }
  }
  return chosen; // twice the target: some will fail the quality checks
}

async function readArticle(url: string): Promise<string | null> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; VaartaNowBot/1.0)" }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  const dom = new JSDOM(await res.text(), { url });
  const text = new Readability(dom.window.document).parse()?.textContent?.replace(/\s+/g, " ").trim();
  return text && text.length > 300 ? text.slice(0, 6000) : null;
}

async function writeShort(source: string, c: Candidate, knownTags: string[]): Promise<Short> {
  const prompt = `You are a news editor at VaartaNow, a Telugu news app like Inshorts.
Read the source article and write ONE short news item in Telugu.

Rules:
- "summary": 55 to 65 words, natural modern Telugu, entirely in your own words. Do not copy sentences or phrases from the source.
- Only facts stated in the source. No opinions, no speculation, no clickbait, no emojis.
- Answer who, what, where and when. Keep names, numbers and places exactly right.
- "title": a clear Telugu headline, at most 12 words, no clickbait.
- "category": one of ${CATEGORIES.join(", ")}.
- "tags": 3 short Telugu or English keywords.
- "image_keywords": lowercase English keywords for choosing photos from our library:
  "people" = the main people in the story, "places" = city/district/landmark, "topics" = subject (e.g. farmers, it, beach, budget).
  Prefer these existing library tags when they fit: ${knownTags.length ? knownTags.join(", ") : "(library is empty)"}.
Return only JSON: {"title": "...", "summary": "...", "category": "...", "tags": ["...", "...", "..."],
  "image_keywords": {"people": ["..."], "places": ["..."], "topics": ["..."]}}

Source headline: ${c.title}
Source article:
${source}`;
  const result = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024, responseMimeType: "application/json" },
  });
  return JSON.parse(result.response.text()) as Short;
}

function checkShort(s: Short, source: string): string | null {
  if (!s?.title || !s?.summary) return "missing title/summary";
  const n = words(s.summary).length;
  if (n < 45 || n > 80) return `summary has ${n} words`;
  if (words(s.title).length > 14) return "headline too long";
  if (teluguRatio(s.summary) < 0.6 || teluguRatio(s.title) < 0.4) return "not mainly Telugu";
  const copied = copiedShare(s.summary, source);
  if (copied > 0.15) return `copies ${(copied * 100).toFixed(0)}% of phrasing from source`;
  return null;
}

async function main() {
  const { data: feeds, error } = await supabase.from("rss_feeds").select("url, category, publisher, priority_tier");
  if (error) throw new Error(`load feeds: ${error.message}`);
  const fresh = await dropKnown(await collectCandidates(feeds as Feed[]));
  const shortlist = pick(fresh, MAX_PER_RUN);
  console.log(`${feeds.length} feeds, ${fresh.length} new stories, trying ${shortlist.length} for ${MAX_PER_RUN} slots${DRY_RUN ? " (dry run)" : ""}`);
  if (!DRY_RUN) await ensureBucket(supabase);
  const knownTags = await libraryTags(supabase);

  let published = 0;
  for (const c of shortlist) {
    if (published >= MAX_PER_RUN) break;
    try {
      const source = await readArticle(c.link);
      if (!source) { console.log(`  skip (source unreadable): ${c.title.slice(0, 60)}`); continue; }
      const s = await writeShort(source, c, knownTags);
      const problem = checkShort(s, source);
      if (problem) { console.log(`  reject (${problem}): ${c.title.slice(0, 60)}`); continue; }

      const category = CATEGORIES.includes(s.category) ? s.category : c.feed.category;
      const post = {
        slug: `${category}-${new Date().toISOString().slice(0, 10)}-${createHash("sha1").update(c.link).digest("hex").slice(0, 8)}`,
        title: s.title.trim(),
        excerpt: s.summary.trim(),
        content: s.summary.trim(),
        category,
        tags: (s.tags ?? []).slice(0, 3),
        meta_title: s.title.trim(),
        meta_description: s.summary.trim().slice(0, 160),
        author_name: "VaartaNow Desk",
        publisher: c.feed.publisher,
        source_article_url: c.link,
        source_url: c.link,
        language: "te",
        published: true,
        featured: false,
        reading_time_min: 1,
        word_count: words(s.summary).length,
        ai_queue_status: "completed",
      };
      if (DRY_RUN) console.log(`\n  ✔ [${category}] ${post.title}\n    ${post.excerpt}\n    (${post.word_count} words · source: ${c.feed.publisher})\n    image keywords: ${JSON.stringify(s.image_keywords ?? {})}`);
      else {
        const image = await storyImage(supabase, { slug: post.slug, title: post.title, category, keywords: s.image_keywords ?? {}, apiKey: geminiKey! });
        const { error: insertError } = await supabase.from("blog_posts").insert({
          ...post,
          og_image: image.url,
          image_storage_path: image.path,
          image_validation_status: image.kind,
        });
        if (insertError) throw new Error(insertError.message);
        console.log(`  published [${category}] ${post.title} (image: ${image.kind})`);
      }
      published++;
    } catch (e: any) {
      console.log(`  error: ${e.message?.slice(0, 100)} — ${c.title.slice(0, 50)}`);
    }
  }
  console.log(`\nDone: ${published} short(s) ${DRY_RUN ? "ready (not saved)" : "published"}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
