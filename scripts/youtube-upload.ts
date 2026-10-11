import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — copy recorded article videos to the VaartaNow YouTube channel
//
//  1. Upload: published articles whose video_url is our own recording (news-media) and that are not on
//     YouTube yet are uploaded with the Telugu title, summary, a link back to the article and tags.
//  2. Check: once YouTube has processed an upload and it is public, the article's video_url switches to
//     the YouTube link (the site plays it in the card) and our copy in news-media is deleted.
//     Videos that YouTube keeps private (an API project that has not passed Google's audit yet) stay on
//     our storage, so nothing breaks.
//
//  npm run youtube              (needs YOUTUBE_CLIENT_ID / _SECRET / _REFRESH_TOKEN; see scripts/youtube-auth.ts)
//  npm run youtube -- --dry     list what would be uploaded
//  options: --max=3 (uploads per run; each costs ~1600 of the default 10 000 daily quota units)
//  env: YOUTUBE_PRIVACY=public|unlisted (default public), KEEP_LOCAL_VIDEO=true to keep our copy
// ═══════════════════════════════════════════════════════════════════

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
}
const DRY = process.argv.includes("--dry");
const MAX = Number(process.argv.find((a) => a.startsWith("--max="))?.slice(6) ?? 3);
const PRIVACY = process.env.YOUTUBE_PRIVACY === "unlisted" ? "unlisted" : "public";
const SITE = (process.env.SITE_URL || "https://varthanow.pages.dev").replace(/\/$/, "");
const BUCKET = "news-media";
const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

type Post = {
  id: string; slug: string; title: string; excerpt: string | null; category: string; tags: string[] | null;
  video_url: string | null; local_video_url: string | null; youtube_video_id: string | null; youtube_status: string | null; presenter_name: string | null;
};

async function accessToken(): Promise<string> {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID!, client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN!, grant_type: "refresh_token",
    }),
  });
  const j: any = await r.json();
  if (!j.access_token) throw new Error(`YouTube sign-in failed: ${j.error_description ?? j.error}`);
  return j.access_token;
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const noAngles = (s: string) => s.replace(/[<>]/g, "");

function metadata(p: Post) {
  const title = clip(noAngles(p.title.trim()), 100);
  const description = clip(noAngles([
    p.excerpt?.trim() ?? "",
    "",
    `పూర్తి వార్త: ${SITE}/news/${p.slug}`,
    p.presenter_name ? `ప్రజెంటర్: ${p.presenter_name}` : "",
    "",
    "VaartaNow — తాజా తెలుగు వార్తలు",
    `#VaartaNow #TeluguNews #తెలుగువార్తలు`,
  ].filter((l, i, a) => l || a[i - 1]).join("\n")), 4800);
  const tags: string[] = [];
  let len = 0;
  for (const t of [...(p.tags ?? []), "VaartaNow", "Telugu News", "తెలుగు వార్తలు", p.category]) {
    const tag = noAngles(String(t)).trim();
    if (!tag || tags.includes(tag) || len + tag.length + 3 > 480) continue;
    tags.push(tag);
    len += tag.length + 3;
  }
  return {
    snippet: { title, description, tags, categoryId: "25", defaultLanguage: "te", defaultAudioLanguage: "te" }, // 25 = News & Politics
    status: { privacyStatus: PRIVACY, selfDeclaredMadeForKids: false, embeddable: true, license: "youtube", containsSyntheticMedia: false },
  };
}

async function upload(token: string, p: Post): Promise<string> {
  const video = Buffer.from(await (await fetch(p.video_url!, { signal: AbortSignal.timeout(120_000) })).arrayBuffer());
  const type = /\.mp4(\?|$)/.test(p.video_url!) ? "video/mp4" : "video/webm";
  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": type, "X-Upload-Content-Length": String(video.length) },
    body: JSON.stringify(metadata(p)),
  });
  const location = init.headers.get("location");
  if (!location) throw new Error(`upload start failed: ${(await init.text()).slice(0, 300)}`);
  const put = await fetch(location, { method: "PUT", headers: { "Content-Type": type, "Content-Length": String(video.length) }, body: video, signal: AbortSignal.timeout(600_000) });
  const j: any = await put.json().catch(() => ({}));
  if (!j.id) throw new Error(`upload failed: ${JSON.stringify(j.error ?? j).slice(0, 300)}`);
  return j.id;
}

/** Path of our copy inside the news-media bucket, from its public URL. */
const storagePath = (url: string) => decodeURIComponent(url.split(`/${BUCKET}/`)[1]?.split("?")[0] ?? "");

async function main() {
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET || !process.env.YOUTUBE_REFRESH_TOKEN) {
    console.log("YouTube is not connected yet (YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN); skipping.");
    return;
  }
  // 1. new recordings
  const { data: todo, error } = await supabase.from("blog_posts")
    .select("id, slug, title, excerpt, category, tags, video_url, local_video_url, youtube_video_id, youtube_status, presenter_name")
    .eq("published", true).like("video_url", `%/${BUCKET}/%`).is("youtube_video_id", null)
    .order("published_at", { ascending: false }).limit(MAX);
  if (error) throw new Error(error.message);
  console.log(`${todo?.length ?? 0} video(s) to upload`);
  if (DRY) { for (const p of todo ?? []) console.log(" ", p.slug, JSON.stringify(metadata(p as Post).snippet).slice(0, 200)); return; }
  const token = await accessToken();
  for (const p of (todo ?? []) as Post[]) {
    try {
      const id = await upload(token, p);
      await supabase.from("blog_posts").update({ youtube_video_id: id, youtube_status: "uploaded", youtube_error: null, youtube_uploaded_at: new Date().toISOString(), local_video_url: p.video_url }).eq("id", p.id);
      console.log(`  ↑ ${p.title.slice(0, 50)} → https://youtu.be/${id}`);
    } catch (e: any) {
      const quota = /quota/i.test(e.message);
      await supabase.from("blog_posts").update({ youtube_status: quota ? null : "failed", youtube_error: e.message.slice(0, 500) }).eq("id", p.id);
      console.log(`  ✖ ${p.slug}: ${e.message.slice(0, 160)}`);
      if (quota) break; // daily quota used up: try again tomorrow
    }
  }

  // 2. check processing; switch live videos to YouTube and free our storage
  const { data: pending } = await supabase.from("blog_posts")
    .select("id, slug, title, video_url, local_video_url, youtube_video_id, youtube_status")
    .in("youtube_status", ["uploaded", "processing", "private"]).not("youtube_video_id", "is", null).limit(50);
  if (!pending?.length) return;
  const ids = pending.map((p) => p.youtube_video_id).join(",");
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status,processingDetails&id=${ids}`, { headers: { Authorization: `Bearer ${token}` } });
  const items = new Map(((await r.json()) as any).items?.map((v: any) => [v.id, v]) ?? []);
  for (const p of pending as Post[]) {
    const v: any = items.get(p.youtube_video_id!);
    if (!v) { await supabase.from("blog_posts").update({ youtube_status: "failed", youtube_error: "video not found on the channel" }).eq("id", p.id); continue; }
    const { uploadStatus, privacyStatus, failureReason, rejectionReason } = v.status ?? {};
    if (uploadStatus === "failed" || uploadStatus === "rejected") {
      await supabase.from("blog_posts").update({ youtube_status: "failed", youtube_error: failureReason || rejectionReason || uploadStatus }).eq("id", p.id);
      console.log(`  ✖ YouTube ${uploadStatus}: ${p.slug} (${failureReason || rejectionReason})`);
    } else if (uploadStatus === "processed" && privacyStatus === PRIVACY) {
      await supabase.from("blog_posts").update({ video_url: `https://www.youtube.com/watch?v=${p.youtube_video_id}`, youtube_status: "live" }).eq("id", p.id);
      const local = p.local_video_url ?? p.video_url;
      if (local?.includes(`/${BUCKET}/`) && process.env.KEEP_LOCAL_VIDEO !== "true") {
        await supabase.storage.from(BUCKET).remove([storagePath(local)]);
        await supabase.from("blog_posts").update({ local_video_url: null }).eq("id", p.id);
      }
      console.log(`  ✔ live on YouTube, our copy freed: ${p.title.slice(0, 50)}`);
    } else if (uploadStatus === "processed" && privacyStatus === "private") {
      // Google keeps uploads from unaudited API projects private: keep playing our own copy
      await supabase.from("blog_posts").update({ youtube_status: "private", youtube_error: "YouTube kept the video private (API project not yet audited by Google)" }).eq("id", p.id);
    } else {
      await supabase.from("blog_posts").update({ youtube_status: "processing" }).eq("id", p.id);
    }
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
