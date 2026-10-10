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
//  Each run asks Gemini to pair fresh headlines from two DIFFERENT outlets that
//  report the same event, reads both articles and writes ONE original Telugu
//  article of 60–100 words from the combined facts (details the sources disagree
//  on are left out). Stories covered by only one outlet fill any remaining slots.
//  Nothing is published unless it passes every check: 60–100 words, mostly
//  Telugu, no copied phrasing from either source, and no outlet names. Articles
//  are bylined "VaartaNow Desk"; source links are stored for fact-checking but
//  not shown. Publisher images are NOT reused: each story image is composed from
//  our own tagged photo library on aapstack.tech (scripts/lib/news-images.ts).
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
type Job = { sources: Candidate[] }; // 2 outlets on the same event, or 1 when no pair was found

const MIN_WORDS = 60, MAX_WORDS = 100;

// Outlet names must never appear in our articles (English and Telugu spellings).
const OUTLETS = ["tv9", "tv 9", "etv", "ntv", "sakshi", "eenadu", "andhra jyothy", "andhrajyothy", "abn", "hmtv", "v6", "10tv", "10 tv",
  "abp", "way2news", "disha", "namasthe telangana", "prajasakti", "mana telangana", "big tv", "bigtv", "idream", "mahaa", "raj news", "tv5", "t news",
  "టీవీ9", "టీవీ 9", "ఈటీవీ", "ఎన్టీవీ", "సాక్షి", "ఈనాడు", "ఆంధ్రజ్యోతి", "ఏబీఎన్", "వీ6", "ఏబీపీ", "దిశ", "నమస్తే తెలంగాణ", "ప్రజాశక్తి", "టీవీ5", "హెచ్ఎంటీవీ"];

// Horoscopes, astrology and recipe/beauty filler are not news.
const SKIP_TOPICS = /రాశి|రాశుల|వారఫల|దినఫల|జాతకం|పంచాంగం|horoscope|astrolog|zodiac|rashi|recipe|beauty tips/i;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (text: string, name: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(name)}($|[^\\p{L}\\p{N}])`, "u").test(text);

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
  const { data, error } = await supabase.from("blog_posts").select("title, source_article_url, source_url").gte("published_at", since);
  if (error) throw new Error(`load recent posts: ${error.message}`);
  const knownLinks = new Set(data.flatMap((p: any) => [p.source_article_url, p.source_url]).filter(Boolean));
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

/** "NTV AP" and "NTV Sports" are one newsroom: compare outlets by their first word. */
const outletOf = (publisher: string) => publisher.toLowerCase().trim().split(/\s+/)[0];

/** Ask Gemini which fresh headlines from different outlets report the same event. */
async function pairStories(candidates: Candidate[], maxPairs: number): Promise<[Candidate, Candidate][]> {
  const list = [...candidates].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 150);
  if (list.length < 2) return [];
  const prompt = `Below are recent Telugu/English news headlines, one per line as "index | outlet | headline".
Find pairs of headlines from DIFFERENT outlets (different first word in the outlet name) that report the SAME specific event (same people, place and happening).
Prefer important news (government, Andhra Pradesh, Telangana, national, business, sports, cinema).
Skip horoscopes, astrology, recipes, beauty tips, quizzes, ads and gossip.
Return only JSON {"pairs": [[i, j], ...]} with at most ${maxPairs} pairs, most newsworthy first; use each index at most once.

${list.map((c, i) => `${i} | ${c.feed.publisher} | ${c.title}`).join("\n")}`;
  const r = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: "application/json" },
  });
  const used = new Set<number>();
  const pairs: [Candidate, Candidate][] = [];
  for (const [i, j] of (JSON.parse(r.response.text()).pairs ?? []) as number[][]) {
    const a = list[i], b = list[j];
    if (!a || !b || i === j || used.has(i) || used.has(j) || outletOf(a.feed.publisher) === outletOf(b.feed.publisher)) continue;
    used.add(i); used.add(j); pairs.push([a, b]);
  }
  return pairs;
}

async function writeArticle(sources: { headline: string; text: string }[], knownTags: string[], feedback?: string): Promise<Short> {
  const many = sources.length > 1;
  const prompt = `You are a news editor at VaartaNow, a Telugu news app.
${many ? `Below are ${sources.length} reports about the same event from different outlets. Combine their facts and write ONE` : "Read the report below and write ONE"} original news article in Telugu.

Rules:
- "summary": ${MIN_WORDS} to ${MAX_WORDS} words (aim for about 80), natural modern Telugu, entirely in your own words. Do not copy sentences or phrases from any report; rephrase every fact.
- Only facts stated in the report${many ? "s. If the reports disagree on a detail (a number, name or date), leave that detail out" : ""}. No opinions, no speculation, no clickbait, no emojis.
- Answer who, what, where, when and why it matters. Keep names, numbers and places exactly right.
- Never mention any TV channel, newspaper, website or news agency (for example TV9, ETV, NTV, Sakshi, Eenadu), and never write "according to reports".
- "title": a clear Telugu headline, at most 12 words, no clickbait.
- "category": one of ${CATEGORIES.join(", ")}.
- "tags": 3 short Telugu or English keywords.
- "image_keywords": lowercase English keywords for choosing photos from our library:
  "people" = named people in the story (never generic words like "people"), "places" = city/district/landmark, "topics" = subject (e.g. farmers, it, beach, budget).
  Prefer these existing library tags when they fit: ${knownTags.length ? knownTags.join(", ") : "(library is empty)"}.
Return only JSON: {"title": "...", "summary": "...", "category": "...", "tags": ["...", "...", "..."],
  "image_keywords": {"people": ["..."], "places": ["..."], "topics": ["..."]}}

${sources.map((src, i) => `Report ${i + 1} headline: ${src.headline}\nReport ${i + 1}:\n${src.text.slice(0, 4000)}`).join("\n\n")}${feedback ? `\n\nYour previous attempt was rejected: ${feedback}. Fix that and return the full JSON again.` : ""}`;
  const result = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1536, responseMimeType: "application/json" },
  });
  return JSON.parse(result.response.text()) as Short;
}

function checkArticle(s: Short, sourceTexts: string[]): string | null {
  if (!s?.title || !s?.summary) return "missing title/summary";
  const n = words(s.summary).length;
  if (n < MIN_WORDS || n > MAX_WORDS) return `summary has ${n} words`;
  if (words(s.title).length > 14) return "headline too long";
  if (SKIP_TOPICS.test(s.title)) return "astrology/filler topic";
  if (teluguRatio(s.summary) < 0.6 || teluguRatio(s.title) < 0.4) return "not mainly Telugu";
  for (const src of sourceTexts) {
    const copied = copiedShare(s.summary, src);
    if (copied > 0.15) return `copies ${(copied * 100).toFixed(0)}% of phrasing from a source`;
  }
  const text = `${s.title} ${s.summary}`.toLowerCase();
  const outlet = OUTLETS.find((o) => mentions(text, o));
  if (outlet) return `mentions outlet "${outlet}"`;
  return null;
}

async function main() {
  const { data: feeds, error } = await supabase.from("rss_feeds").select("url, category, publisher, priority_tier");
  if (error) throw new Error(`load feeds: ${error.message}`);
  const fresh = await dropKnown(await collectCandidates(feeds as Feed[]));
  const pairs = await pairStories(fresh, MAX_PER_RUN * 2);
  const paired = new Set(pairs.flat().map((c) => c.link));
  const singles = pick(fresh.filter((c) => !paired.has(c.link) && !SKIP_TOPICS.test(c.title)), MAX_PER_RUN);
  const jobs: Job[] = [...pairs.map((p) => ({ sources: p })), ...singles.map((c) => ({ sources: [c] }))];
  console.log(`${feeds.length} feeds, ${fresh.length} new stories, ${pairs.length} same-event pairs, trying ${jobs.length} for ${MAX_PER_RUN} slots${DRY_RUN ? " (dry run)" : ""}`);
  if (!DRY_RUN) await ensureBucket(supabase);
  const knownTags = await libraryTags(supabase);

  let published = 0;
  for (const job of jobs) {
    if (published >= MAX_PER_RUN) break;
    const lead = job.sources[0];
    try {
      const read = (await Promise.all(job.sources.map(async (c) => ({ c, text: await readArticle(c.link).catch(() => null) })))).filter((r) => r.text);
      if (!read.length) { console.log(`  skip (sources unreadable): ${lead.title.slice(0, 60)}`); continue; }
      const inputs = read.map((r) => ({ headline: r.c.title, text: r.text! }));
      const texts = read.map((r) => r.text!);
      let s = await writeArticle(inputs, knownTags);
      let problem = checkArticle(s, texts);
      if (problem && /words|copies/.test(problem)) {
        const reason = problem.includes("words") ? `the summary had ${words(s.summary ?? "").length} words but must have ${MIN_WORDS}-${MAX_WORDS}` : `it ${problem}; use completely different wording`;
        s = await writeArticle(inputs, knownTags, reason);
        problem = checkArticle(s, texts);
        if (!problem) console.log(`  (fixed on retry: ${reason})`);
      }
      if (problem) { console.log(`  reject (${problem}): ${lead.title.slice(0, 60)}`); continue; }

      const links = read.map((r) => r.c.link);
      const category = CATEGORIES.includes(s.category) ? s.category : lead.feed.category;
      const post = {
        slug: `${category}-${new Date().toISOString().slice(0, 10)}-${createHash("sha1").update(links.join("|")).digest("hex").slice(0, 8)}`,
        title: s.title.trim(),
        excerpt: s.summary.trim(),
        content: s.summary.trim(),
        category,
        tags: (s.tags ?? []).slice(0, 3),
        meta_title: s.title.trim(),
        meta_description: s.summary.trim().slice(0, 160),
        author_name: "VaartaNow Desk",
        publisher: "VaartaNow",
        // kept for fact-checking and corrections; never shown on the site
        source_article_url: links[0],
        source_url: links[1] ?? links[0],
        language: "te",
        published: true,
        featured: false,
        reading_time_min: 1,
        word_count: words(s.summary).length,
        ai_queue_status: "completed",
      };
      const basis = read.length > 1 ? `${read.length} sources: ${read.map((r) => r.c.feed.publisher).join(" + ")}` : `1 source: ${read[0].c.feed.publisher}`;
      if (DRY_RUN) console.log(`\n  ✔ [${category}] ${post.title}\n    ${post.excerpt}\n    (${post.word_count} words · ${basis})\n    image keywords: ${JSON.stringify(s.image_keywords ?? {})}`);
      else {
        const image = await storyImage(supabase, { slug: post.slug, title: post.title, category, keywords: s.image_keywords ?? {}, apiKey: geminiKey! });
        const { error: insertError } = await supabase.from("blog_posts").insert({
          ...post,
          og_image: image.url,
          image_storage_path: image.path,
          image_validation_status: image.kind,
        });
        if (insertError) throw new Error(insertError.message);
        console.log(`  published [${category}] ${post.title} (${post.word_count} words, ${basis}, image: ${image.kind})`);
      }
      published++;
    } catch (e: any) {
      console.log(`  error: ${e.message?.slice(0, 100)} — ${lead.title.slice(0, 50)}`);
    }
  }
  console.log(`\nDone: ${published} short(s) ${DRY_RUN ? "ready (not saved)" : "published"}`);
}

main()
  .then(() => process.exit(0)) // open keep-alive sockets would otherwise keep the run (and the CI job) alive
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
