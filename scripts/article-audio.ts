import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — Telugu audio for articles ("వార్తలు వినండి")
//
//  Reads published articles that have no audio yet with a Gemini Telugu
//  voice, converts it to a small MP3 (ffmpeg) and stores it in
//  news-media/tts/<slug>.mp3 → blog_posts.tts_audio_url. Generated once
//  per article; every reader replays the same file. Articles where an
//  editor recorded their own voice (audio_url) are skipped.
//
//  npm run audio                 newest articles without audio (default 12)
//  npm run audio -- --max=40     more at once
//  npm run audio -- --slug=<slug>  one article (re-generates)
// ═══════════════════════════════════════════════════════════════════

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
}
const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const MAX = Number(arg("max") ?? 12);
const MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts";
const VOICE = process.env.GEMINI_TTS_VOICE || "Kore";
const BUCKET = "news-media";
const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

/** Plain text to read: headline, then the body without markdown, capped so a reading stays ~3 minutes. */
function script(title: string, content: string) {
  const body = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>|]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  let text = `${title.trim()}.\n${body}`;
  if (text.length > 2600) text = `${text.slice(0, 2600).replace(/[^.!?।\n]*$/, "")}`;
  return text;
}

async function speak(text: string): Promise<Buffer> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Read this Telugu news article aloud in a calm, clear news-reader voice. Read only the text:\n\n${text}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      }),
      signal: AbortSignal.timeout(180_000),
    });
    const json: any = await res.json().catch(() => ({}));
    const data = json.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data)?.inlineData;
    if (data) return Buffer.from(data.data, "base64");
    console.log(`  tts attempt ${attempt} failed: ${json.error?.message ?? res.status}`);
    await new Promise((r) => setTimeout(r, 4000 * attempt));
  }
  throw new Error("no audio returned");
}

/** WAV (or raw 24 kHz PCM) → 48 kbps mono MP3: about 360 KB per minute. */
function toMp3(audio: Buffer): Buffer {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vn-tts-"));
  const wav = audio.subarray(0, 4).toString() === "RIFF";
  const input = path.join(dir, wav ? "in.wav" : "in.pcm");
  const output = path.join(dir, "out.mp3");
  fs.writeFileSync(input, audio);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...(wav ? [] : ["-f", "s16le", "-ar", "24000", "-ac", "1"]), "-i", input, "-c:a", "libmp3lame", "-b:a", "48k", "-ac", "1", output]);
  const mp3 = fs.readFileSync(output);
  fs.rmSync(dir, { recursive: true, force: true });
  return mp3;
}

async function main() {
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); } catch { throw new Error("ffmpeg is required (apt-get install ffmpeg)"); }
  const slug = arg("slug");
  let q = supabase.from("blog_posts").select("id, slug, title, content").eq("published", true).eq("language", "te");
  q = slug ? q.eq("slug", slug) : q.is("tts_audio_url", null).is("audio_url", null).order("published_at", { ascending: false }).limit(MAX);
  const { data: posts, error } = await q;
  if (error) throw new Error(error.message);
  console.log(`${posts?.length ?? 0} article(s) need audio`);
  let done = 0;
  for (const p of posts ?? []) {
    try {
      const text = script(p.title, p.content ?? "");
      if (text.length < 40) { console.log(`  skip (too short): ${p.slug}`); continue; }
      const mp3 = toMp3(await speak(text));
      const file = `tts/${p.slug}.mp3`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(file, mp3, { contentType: "audio/mpeg", upsert: true, cacheControl: "31536000" });
      if (upErr) throw new Error(upErr.message);
      const url = `${supabase.storage.from(BUCKET).getPublicUrl(file).data.publicUrl}?v=${Date.now().toString(36)}`;
      const { error: dbErr } = await supabase.from("blog_posts").update({ tts_audio_url: url }).eq("id", p.id);
      if (dbErr) throw new Error(dbErr.message);
      done++;
      console.log(`  ✔ ${p.title.slice(0, 60)} (${(mp3.length / 1024).toFixed(0)} KB)`);
    } catch (e: any) {
      console.log(`  ✖ ${p.slug}: ${e.message?.slice(0, 120)}`);
    }
  }
  console.log(`Done: ${done} audio file(s)`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
