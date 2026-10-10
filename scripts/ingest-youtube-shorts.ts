import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — viral video shorts from official channels only
//
//  Reads the latest uploads of the channels in scripts/config/video-channels.json
//  (official Telugu news channels), keeps embeddable clips ≤ 90 s from the last
//  48 h with at least 5,000 views, ranks them by views, and has Gemini write a clean Telugu title and a
//  40–60 word context caption in our own words, plus a safety check (no
//  shocking, violent, adult or rumour clips). Videos play through YouTube's
//  official embed player, so the channel keeps its views and ads.
//
//    npx tsx scripts/ingest-youtube-shorts.ts --dry-run --max=3
//    npx tsx scripts/ingest-youtube-shorts.ts               # add up to 3 videos
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
    if (key && value && !process.env[key]) process.env[key] = value;
  }
} catch {}

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_PER_RUN = Number(arg("max") ?? 3);
const MAX_SECONDS = 90;
const FRESH_HOURS = 48;
const MIN_VIEWS = Number(arg("min-views") ?? 5000); // signals a genuinely popular clip

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;
const missing = [["SUPABASE_URL", supabaseUrl], ["SUPABASE_SERVICE_ROLE_KEY", serviceKey], ["YOUTUBE_API_KEY", youtubeKey], ["GEMINI_API_KEY", geminiKey]]
  .filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`Missing in .env: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl!, serviceKey!, { auth: { persistSession: false } });
const gemini = new GoogleGenerativeAI(geminiKey!).getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite" });
const { channels } = JSON.parse(fs.readFileSync("scripts/config/video-channels.json", "utf8")) as { channels: { id: string; name: string }[] };

type Video = { id: string; title: string; description: string; channel: string; channelId: string; publishedAt: string; seconds: number; views: number; thumb: string };
type Caption = { title: string; caption: string; safe: boolean; reason?: string };

const yt = async (path: string) => {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}&key=${youtubeKey}`, { signal: AbortSignal.timeout(15_000) });
  const json = (await res.json()) as any;
  if (json.error) throw new Error(`YouTube API: ${json.error.message}`);
  return json;
};
const seconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : Infinity;
};
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const words = (s: string) => s.split(/\s+/).filter(Boolean);
const teluguRatio = (s: string) => {
  const letters = s.replace(/[\s\d\p{P}\p{S}]/gu, "");
  return letters ? (letters.match(/[ఀ-౿]/g)?.length ?? 0) / letters.length : 0;
};

async function latestVideos(): Promise<Video[]> {
  const cutoff = Date.now() - FRESH_HOURS * 3_600_000;
  const ids: string[] = [];
  for (const ch of channels) {
    try {
      // Uploads playlist = "UU" + channel id without "UC"; 1 quota unit vs 100 for search.
      const list = await yt(`playlistItems?part=contentDetails&maxResults=15&playlistId=UU${ch.id.slice(2)}`);
      for (const it of list.items ?? []) if (Date.parse(it.contentDetails.videoPublishedAt) >= cutoff) ids.push(it.contentDetails.videoId);
    } catch (e: any) {
      console.warn(`  channel failed: ${ch.name} (${e.message?.slice(0, 60)})`);
    }
  }
  const videos: Video[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const res = await yt(`videos?part=snippet,contentDetails,status,statistics&id=${ids.slice(i, i + 50).join(",")}`);
    for (const v of res.items ?? []) {
      const s = seconds(v.contentDetails.duration);
      if (!v.status.embeddable || v.snippet.liveBroadcastContent !== "none" || s > MAX_SECONDS) continue;
      if (Number(v.statistics.viewCount ?? 0) < MIN_VIEWS) continue;
      videos.push({
        id: v.id, title: v.snippet.title, description: v.snippet.description ?? "", channel: v.snippet.channelTitle.trim(),
        channelId: v.snippet.channelId, publishedAt: v.snippet.publishedAt, seconds: s, views: Number(v.statistics.viewCount ?? 0),
        thumb: v.snippet.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      });
    }
  }
  return videos.sort((a, b) => b.views - a.views);
}

async function caption(v: Video): Promise<Caption> {
  const prompt = `You are a news editor at VaartaNow, a Telugu news app. A short video from the official news channel "${v.channel}" will be shown with our own caption.

From its YouTube title and description, return JSON:
- "title": a clean, factual Telugu headline (max 10 words). No hashtags, no emojis, no clickbait words like షాక్ / వైరల్ / మీరు నమ్మలేరు.
- "caption": 40 to 60 words of Telugu context in your own words: what happened, where, and why it matters. Only facts stated in the title/description.
- "safe": false if the clip is shocking, gory, violent, sexual, a personal attack, an unverified rumour or communal; otherwise true.
- "reason": short English reason when safe is false.
Return only JSON: {"title": "...", "caption": "...", "safe": true, "reason": ""}

YouTube title: ${v.title}
YouTube description: ${v.description.slice(0, 1500)}`;
  const result = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 600, responseMimeType: "application/json" },
  });
  return JSON.parse(result.response.text()) as Caption;
}

function problem(c: Caption): string | null {
  if (!c?.safe) return `unsafe: ${c?.reason || "flagged"}`;
  const n = words(c.caption ?? "").length;
  if (n < 30 || n > 75) return `caption has ${n} words`;
  if (!c.title || /#|[\u{1F300}-\u{1FAFF}]/u.test(c.title)) return "title has hashtags/emojis";
  if (teluguRatio(c.caption) < 0.6) return "caption not mainly Telugu";
  return null;
}

async function main() {
  const videos = await latestVideos();
  const { data: existing } = await supabase.from("viral_videos").select("id").in("id", videos.map((v) => v.id));
  const known = new Set((existing ?? []).map((r) => r.id));
  const fresh = videos.filter((v) => !known.has(v.id));
  console.log(`${channels.length} channels, ${videos.length} eligible clips, ${fresh.length} new${DRY_RUN ? " (dry run)" : ""}`);

  let added = 0;
  const perChannel = new Map<string, number>();
  for (const v of fresh) {
    if (added >= MAX_PER_RUN) break;
    if ((perChannel.get(v.channelId) ?? 0) >= 1) continue; // variety: one clip per channel per run
    try {
      const c = await caption(v);
      const why = problem(c);
      if (why) { console.log(`  reject (${why}): ${v.title.slice(0, 60)}`); continue; }
      const row = {
        id: v.id,
        title: c.title.trim(),
        description: c.caption.trim(),
        video_url: `https://www.youtube.com/watch?v=${v.id}`,
        clip: `https://www.youtube.com/shorts/${v.id}`,
        thumbnail_url: v.thumb,
        duration: clock(v.seconds),
        channel: v.channel,
        source_icon: `https://www.google.com/s2/favicons?domain=youtube.com&sz=64`,
        published_at: v.publishedAt,
      };
      if (DRY_RUN) console.log(`\n  ✔ ${row.title}  [${v.channel}, ${row.duration}, ${v.views.toLocaleString()} views]\n    ${row.description}`);
      else {
        const { error } = await supabase.from("viral_videos").upsert(row, { onConflict: "id" });
        if (error) throw new Error(error.message);
        console.log(`  added: ${row.title} [${v.channel}]`);
      }
      perChannel.set(v.channelId, (perChannel.get(v.channelId) ?? 0) + 1);
      added++;
    } catch (e: any) {
      console.log(`  error: ${e.message?.slice(0, 100)} — ${v.title.slice(0, 50)}`);
    }
  }
  console.log(`\nDone: ${added} video(s) ${DRY_RUN ? "ready (not saved)" : "added"}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
