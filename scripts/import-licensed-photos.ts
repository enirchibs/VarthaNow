import * as fs from "fs";
import * as path from "path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { BUCKET } from "./lib/news-images";
import { slugify, type Candidate, type PublicFigure } from "./photo-sources/types";
import { politeFetch, searchCommons, type Skip } from "./photo-sources/wikimedia";
import { searchFlickr } from "./photo-sources/flickr";
import { findFigure, readFolder, readUrl } from "./photo-sources/manual";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — licensed real photos of public figures (npm run photos)
//
//  npm run photos -- fetch --person="N. Chandrababu Naidu" --source=wikimedia --limit=5
//  npm run photos -- fetch --group=cinema --source=wikimedia --limit=3      (politics|cinema|sports|business|international|all)
//  npm run photos -- import-folder --dir=imports/pib
//  npm run photos -- import-url --url=<page> --person="..." --source="PIB" --terms="<where reuse terms were checked>"
//  npm run photos -- report
//  add --dry to see what would be imported without downloading anything;
//  add --max-faces=N to change the group-photo cut-off (default 4);
//  add --no-godl to skip Indian government photos under GODL-India (accepted by default, attribution required).
//
//  Every photo is stored with its source, author, licence and attribution, and starts as
//  review_status = 'pending': nothing is used on the site until an admin approves it.
// ═══════════════════════════════════════════════════════════════════

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
}
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const DRY = process.argv.includes("--dry");
const MAX_FACES = Number(arg("max-faces") ?? 4);
if (process.argv.includes("--no-godl")) process.env.PHOTO_ALLOW_GODL = "false";
const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const GEMINI_KEY = process.env.GEMINI_API_KEY, GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const figures: PublicFigure[] = JSON.parse(fs.readFileSync("scripts/config/public-figures.json", "utf8")).people;

type Review = { keywords_en: string[]; keywords_te: string[]; focus: string; faces_visible: number; has_text_or_watermark: boolean; suitable_for_news_thumbnail: boolean; reason: string };
type Imported = { person: string; source: string; id: string; url: string; attribution: string; license: string; share_alike: boolean; notes: Review | null; source_url: string };
const imported: Imported[] = [];
const skipped: Skip[] = [];

// ── checks ──────────────────────────────────────────────────────────
async function download(url: string): Promise<Buffer> {
  if (!/^https?:/.test(url)) return fs.readFileSync(url);
  const res = /wikimedia\.org/.test(url) ? await politeFetch(url) : await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Gemini looks at the photo for tagging and quality only. It is never asked who the person is. */
async function geminiReview(webp: Buffer, c: Candidate): Promise<Review | null> {
  if (!GEMINI_KEY) return null;
  const small = await sharp(webp).resize(768, 768, { fit: "inside" }).jpeg({ quality: 80 }).toBuffer();
  const prompt = `This photo is from ${c.source_name}. Its caption says: "${(c.event_caption ?? "").slice(0, 300)}".
Describe the photo for a news photo library. Do NOT identify any person; the caption is the only source of who is in it.
Return JSON: {"keywords_en": [5-10 lowercase words for the setting/event/objects, e.g. "podium","press conference","temple"],
"keywords_te": [3-6 Telugu words for the same], "focus": "left|center|right|top" (where the main subject is, for cropping),
"faces_visible": number, "has_text_or_watermark": true only if a watermark, logo stamp or text has been added on top of the photo (not signs or banners in the scene),
"suitable_for_news_thumbnail": true if it is a clear, neutral, well-lit photo where the main person is not unflattering, mocked or mid-blink,
"reason": "one short sentence"}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ inline_data: { mime_type: "image/jpeg", data: small.toString("base64") } }, { text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: "application/json" },
    }),
  });
  try {
    const json: any = await res.json();
    return JSON.parse(json.candidates[0].content.parts[0].text);
  } catch {
    return null;
  }
}

const unique = (a: (string | null | undefined)[]) => [...new Set(a.filter((x): x is string => !!x).map((x) => x.toLowerCase().normalize("NFC").trim()).filter(Boolean))];

// ── import one candidate ─────────────────────────────────────────────
async function importOne(c: Candidate): Promise<boolean> {
  const skip = (reason: string) => skipped.push({ person: c.person_name, title: decodeURIComponent(path.basename(c.source_url.split("?")[0])).replace(/^File:/, "").slice(0, 90), reason, source_url: c.source_url });
  if (DRY) { imported.push({ person: c.person_name, source: c.source_name, id: "(dry run)", url: c.original_url, attribution: c.attribution_text, license: c.license_name, share_alike: c.share_alike, notes: null, source_url: c.source_url }); return true; }

  const original = await download(c.original_url);
  const sha = createHash("sha256").update(original).digest("hex");
  const { data: dup } = await supabase.from("image_library").select("id").eq("original_sha256", sha).maybeSingle();
  if (dup) return (skip("duplicate (already in the library)"), false);

  let img: ReturnType<typeof sharp>, meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try { img = sharp(original).rotate(); meta = await img.metadata(); } catch { return (skip("file does not decode as an image"), false); }
  const width = ((meta.orientation ?? 1) >= 5 ? meta.height : meta.width) ?? 0; // EXIF orientations 5-8 are rotated 90°
  if (width < 800) return (skip(`too small (${width}px wide)`), false);
  const stats = await sharp(original).stats();
  if (stats.channels.slice(0, 3).every((ch) => ch.stdev < 12)) return (skip("mostly blank"), false);

  // ≤1600px, WebP, no EXIF (sharp drops metadata unless asked to keep it)
  const webp = await img.resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const out = await sharp(webp).metadata();
  const review = await geminiReview(webp, c);
  if (review?.has_text_or_watermark) return (skip(`watermark or text overlay (${review.reason})`), false);
  // a story thumbnail about one person should show that person, not a crowd
  if (review && review.faces_visible > MAX_FACES) return (skip(`group photo (${review.faces_visible} faces)`), false);

  const figure = findFigure(figures, c.person_name);
  const slug = slugify(c.person_name);
  const storagePath = `library/person/${slug}-${sha.slice(0, 8)}.webp`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, webp, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
  if (upErr) throw new Error(`upload: ${upErr.message}`);
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

  // Match keys are the person's names (and full designation) only, so the photo is picked for stories
  // about this person and never as a stand-in for a general topic.
  const names = unique([c.person_name, figure?.te, ...(figure?.aliases ?? []), ...(figure?.aliases_te ?? [])]);
  const { data, error } = await supabase.from("image_library").insert({
    kind: "person", label: c.person_name, title: c.person_name, category: "public-figures", subcategory: figure?.group ?? null,
    description: c.event_caption, tags: unique([...names, c.designation]),
    keywords_en: unique([c.person_name, ...(figure?.aliases ?? []), c.party, c.designation, ...(review?.keywords_en ?? [])]),
    keywords_te: unique([figure?.te, ...(figure?.aliases_te ?? []), ...(review?.keywords_te ?? [])]),
    person_tags: [slug], location_tags: figure?.region ? [figure.region] : [],
    storage_path: storagePath, public_url: publicUrl, credit: c.attribution_text, license: c.license_name,
    focus: ["left", "center", "right", "top"].includes(review?.focus ?? "") ? review!.focus : "top",
    is_ai_generated: false, generation_status: "uploaded", rights_status: c.share_alike ? "cc-by-sa" : "licensed",
    width: out.width, height: out.height, image_hash: sha.slice(0, 16),
    person_name: c.person_name, designation: c.designation, party: c.party, photo_date: c.photo_date, event_caption: c.event_caption,
    source_name: c.source_name, source_url: c.source_url, author: c.author, license_name: c.license_name, license_url: c.license_url,
    attribution_text: c.attribution_text, share_alike: c.share_alike, terms_note: c.terms_note ?? null,
    retrieved_at: new Date().toISOString(), review_status: "pending", review_notes: review, original_sha256: sha,
  }).select("id").single();
  if (error) { await supabase.storage.from(BUCKET).remove([storagePath]); throw new Error(`save: ${error.message}`); }
  imported.push({ person: c.person_name, source: c.source_name, id: data.id, url: publicUrl, attribution: c.attribution_text, license: c.license_name, share_alike: c.share_alike, notes: review, source_url: c.source_url });
  console.log(`  + ${c.person_name}: ${c.attribution_text}${c.share_alike ? "  [share-alike]" : ""}`);
  return true;
}

/** Import candidates in order until `want` photos are in (the rest are fallbacks for skipped ones). */
async function importAll(candidates: Candidate[], want = Infinity) {
  let got = 0;
  for (const c of candidates) {
    if (got >= want) break;
    try { if (await importOne(c)) got++; } catch (e: any) { skipped.push({ person: c.person_name, title: decodeURIComponent(path.basename(c.source_url.split("?")[0])).replace(/^File:/, "").slice(0, 90), reason: `error: ${e.message}`, source_url: c.source_url }); }
  }
}

// ── report ───────────────────────────────────────────────────────────
function writeReport(command: string) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 13);
  fs.mkdirSync("reports", { recursive: true });
  const base = `reports/licensed-photos-${stamp}`;
  fs.writeFileSync(`${base}.json`, JSON.stringify({ command, dry_run: DRY, imported, skipped }, null, 2));
  const byPerson = new Map<string, { imported: number; skipped: number }>();
  for (const i of imported) byPerson.set(i.person, { ...(byPerson.get(i.person) ?? { imported: 0, skipped: 0 }), imported: (byPerson.get(i.person)?.imported ?? 0) + 1 });
  for (const s of skipped) byPerson.set(s.person, { ...(byPerson.get(s.person) ?? { imported: 0, skipped: 0 }), skipped: (byPerson.get(s.person)?.skipped ?? 0) + 1 });
  const md = [
    `# Licensed photos — ${command}${DRY ? " (dry run)" : ""}`, "",
    `${imported.length} imported (pending review), ${skipped.length} skipped.`, "",
    "| Person | Imported | Skipped |", "|---|---|---|",
    ...[...byPerson].map(([p, n]) => `| ${p} | ${n.imported} | ${n.skipped} |`), "",
    "## Pending review", "",
    ...imported.map((i) => `- **${i.person}** — ${i.attribution} ([source](${i.source_url}))${i.share_alike ? " ⚠ share-alike: use alone" : ""}${i.notes ? ` — ${i.notes.faces_visible} face(s), ${i.notes.suitable_for_news_thumbnail ? "suitable" : "NOT suitable"}: ${i.notes.reason}` : ""}`), "",
    "## Skipped", "",
    ...skipped.map((s) => `- ${s.person} — ${s.title}: ${s.reason}`),
  ].join("\n");
  fs.writeFileSync(`${base}.md`, md);
  console.log(`\n${imported.length} imported (pending review), ${skipped.length} skipped → ${base}.md`);
}

async function report() {
  const { data, error } = await supabase.from("image_library").select("person_name, review_status, source_name, share_alike").eq("kind", "person").not("person_name", "is", null);
  if (error) throw new Error(error.message);
  const rows = new Map<string, Record<string, number>>();
  for (const r of data ?? []) { const m = rows.get(r.person_name) ?? {}; m[r.review_status] = (m[r.review_status] ?? 0) + 1; rows.set(r.person_name, m); }
  const missing = figures.filter((f) => !rows.has(f.name)).map((f) => f.name);
  for (const [p, m] of [...rows].sort()) console.log(`${p.padEnd(32)} ${Object.entries(m).map(([k, n]) => `${k}=${n}`).join("  ")}`);
  console.log(`\n${data?.length ?? 0} licensed person photos; no photo yet for ${missing.length}: ${missing.join(", ")}`);
}

// ── commands ─────────────────────────────────────────────────────────
async function main() {
  const command = process.argv[2];
  const limit = Number(arg("limit") ?? 5);
  if (command === "fetch") {
    const source = arg("source") ?? "wikimedia";
    const group = arg("group");
    const people = arg("person") ? [findFigure(figures, arg("person")!) ?? { name: arg("person")!, te: "", aliases: [], aliases_te: [], designation: "", party: null, group: "politics", region: "" } as PublicFigure]
      : figures.filter((f) => group === "all" || f.group === group);
    if (!people.length) throw new Error("fetch needs --person=\"Name\" or --group=politics|cinema|sports|business|international|all");
    for (const person of people) {
      console.log(`${person.name} (${source})`);
      const candidates = source === "flickr" ? await searchFlickr(person, limit * 4, skipped) : await searchCommons(person, limit * 4, skipped);
      await importAll(candidates, limit);
    }
  } else if (command === "import-folder") {
    const dir = arg("dir");
    if (!dir || !fs.existsSync(dir)) throw new Error("import-folder needs --dir=imports/<source>");
    await importAll(readFolder(dir, figures, skipped));
  } else if (command === "import-url") {
    const [url, person, source, terms] = [arg("url"), arg("person"), arg("source"), arg("terms")];
    if (!url || !person || !source || !terms) throw new Error('import-url needs --url --person --source (e.g. "PIB") --terms (where the reuse terms were checked)');
    await importAll([await readUrl(url, { person, source, terms, date: arg("date") }, figures)]);
  } else if (command === "report") {
    return report();
  } else {
    throw new Error("commands: fetch | import-folder | import-url | report");
  }
  writeReport(process.argv.slice(2).join(" "));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
