import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — news images built from our own tagged photo library
//
//  Photos live in `image_library` (tags + credit + licence) and the public
//  `news-images` bucket on aapstack.tech. For each story we match the people,
//  places and topics Gemini extracted against the tags, take the best person
//  photo and the best place/topic photo, and compose them into one 1200×675
//  image with the Telugu headline and photo credits. The split layout and
//  title band make it read as a news graphic, not as a photo of the event.
//
//  Fallbacks: library category photo → one-time AI category illustration → none.
// ═══════════════════════════════════════════════════════════════════

export const BUCKET = "news-images";
const W = 1200, H = 675, BAND = 190;
const API = "https://generativelanguage.googleapis.com/v1beta";

export type ImageKeywords = { people?: string[]; places?: string[]; topics?: string[] };
export type LibraryPhoto = {
  id: string;
  kind: "person" | "place" | "topic" | "category";
  label: string;
  tags: string[];
  public_url: string;
  storage_path: string;
  credit: string;
  focus: string;
  times_used: number;
  is_ai_generated?: boolean;
  asset_code?: string;
  editorial_label?: string;
};
export type StoryImage = { url: string | null; path: string | null; kind: "library" | "category" | "none"; credits: string[] };

const norm = (s: string) => s.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

// ── bucket ───────────────────────────────────────────────────────────
export async function ensureBucket(supabase: SupabaseClient) {
  try {
    const { data } = await supabase.storage.getBucket(BUCKET);
    if (data) return;
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"] });
    if (error && !/exists|already|service_role/i.test(error.message)) {
      console.warn(`[Bucket Notice] createBucket: ${error.message}`);
    }
  } catch (e: any) {
    // Ignore dashboard-managed bucket restrictions
  }
}

async function uploadWebp(supabase: SupabaseClient, path: string, webp: Buffer): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, webp, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`upload ${path}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ── library ──────────────────────────────────────────────────────────
// Tags that say nothing about a story ("people", or "andhra pradesh" which every photo carries)
// would match almost any photo, e.g. a farmer picture on a film story. They are never used to pick.
const GENERIC_TAGS = new Set(["people", "person", "persons", "man", "woman", "men", "women", "public", "citizens", "news", "general", "places", "place", "india", "indian"]);
const GENERIC_SHARE = 0.2;
let genericCache: { at: number; tags: Set<string> } | null = null;

async function genericTags(supabase: SupabaseClient): Promise<Set<string>> {
  if (genericCache && Date.now() - genericCache.at < 10 * 60_000) return genericCache.tags;
  const { data } = await supabase.from("image_library").select("tags").eq("active", true);
  const rows = data ?? [];
  const counts = new Map<string, number>();
  for (const r of rows) for (const t of new Set((r.tags as string[]).map(norm))) counts.set(t, (counts.get(t) ?? 0) + 1);
  const tags = new Set(GENERIC_TAGS);
  for (const [t, n] of counts) if (rows.length >= 20 && n / rows.length > GENERIC_SHARE) tags.add(t);
  genericCache = { at: Date.now(), tags };
  return tags;
}

/** Specific active tags, so Gemini picks keywords that exist in the library and actually distinguish photos. */
export async function libraryTags(supabase: SupabaseClient): Promise<string[]> {
  const [{ data }, generic] = await Promise.all([supabase.from("image_library").select("tags").eq("active", true), genericTags(supabase)]);
  return [...new Set((data ?? []).flatMap((r) => r.tags as string[]))].filter((t) => !generic.has(norm(t))).sort();
}

function best(rows: LibraryPhoto[], kinds: LibraryPhoto["kind"][], wanted: string[], preferReal = false): LibraryPhoto | undefined {
  const keys = new Set(wanted.map(norm));
  const candidates = rows
    .filter((r) => kinds.includes(r.kind) && r.tags.some((t) => keys.has(norm(t))))
    .sort((a, b) => {
      // If preferReal, rank non-AI assets first
      if (preferReal) {
        const aReal = a.is_ai_generated ? 1 : 0;
        const bReal = b.is_ai_generated ? 1 : 0;
        if (aReal !== bReal) return aReal - bReal;
      }
      return a.times_used - b.times_used; // least used first
    });
  return candidates[0];
}

export async function pickPhotos(supabase: SupabaseClient, kw: ImageKeywords): Promise<LibraryPhoto[]> {
  const generic = await genericTags(supabase);
  const specific = (list?: string[]) => (list ?? []).map(norm).filter((t) => t && !generic.has(t));
  kw = { people: specific(kw.people), places: specific(kw.places), topics: specific(kw.topics) };
  const all = [...kw.people!, ...kw.places!, ...kw.topics!];
  if (!all.length) return [];
  const { data, error } = await supabase
    .from("image_library")
    .select("id, kind, label, tags, public_url, storage_path, credit, focus, times_used, is_ai_generated, asset_code, editorial_label")
    .eq("active", true)
    .overlaps("tags", all);

  if (error || !data?.length) return [];
  const rows = data as LibraryPhoto[];

  // 1. Prefer licensed real person photo
  const person = best(rows, ["person"], kw.people ?? [], true);
  const place = best(rows, ["place"], kw.places ?? []);
  // a topic ("health") may be illustrated by any kind of photo (e.g. a doctor filed as "person")
  const topic = best(rows, ["topic", "category"], kw.topics ?? []) ??
    best(rows.filter((r) => r.id !== person?.id && r.id !== place?.id), ["person", "place"], kw.topics ?? []);

  // Selection precedence:
  // 1. Person (licensed real) + Place or Topic
  // 2. Two scenes (Place + Topic)
  // 3. Single scene (Person or Place or Topic)
  if (person && (place || topic)) {
    return [person, place || topic!];
  }
  if (place && topic) {
    return [place, topic];
  }
  const single = person || place || topic;
  return single ? [single] : [];
}

async function markUsed(supabase: SupabaseClient, photos: LibraryPhoto[]) {
  for (const p of photos) await supabase.from("image_library").update({ times_used: p.times_used + 1, last_used_at: new Date().toISOString() }).eq("id", p.id);
}

// ── composing ────────────────────────────────────────────────────────
const fetchImage = async (url: string) => Buffer.from(await (await fetch(url, { signal: AbortSignal.timeout(20_000) })).arrayBuffer());
const position = (focus: string) => ({ left: "left", right: "right", top: "top" } as Record<string, string>)[focus] ?? "centre";

/** Approximate rendered width in em: Telugu combining signs are narrow, base letters wide. */
function emWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x0c00 && c <= 0x0c04) || (c >= 0x0c3c && c <= 0x0c56) || c === 0x0c62 || c === 0x0c63) w += 0.25;
    else if (c >= 0x0c05 && c <= 0x0c7f) w += 0.78;
    else if (ch === " ") w += 0.3;
    else w += 0.58;
  }
  return w;
}

const TEXT_WIDTH = W - 96;

/** Wrap a headline into at most 2 lines that fit the image width at the given font size. */
function wrap(title: string, fontSize = 46): string[] {
  const maxEm = TEXT_WIDTH / fontSize;
  const lines: string[] = [];
  let line = "";
  for (const word of title.split(/\s+/)) {
    if (emWidth((line + " " + word).trim()) > maxEm && line) { lines.push(line); line = word; }
    else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines.length > 2 ? [lines[0], lines[1].replace(/[\s.…]+$/, "") + "…"] : lines.map((l) => l.replace(/\.{2,}$/, ""));
}

function overlaySvg(title: string, credits: string[], split: boolean, hasAi: boolean): Buffer {
  // one line at 52px if it fits, otherwise up to two lines at 46px
  const one = wrap(title, 52);
  const fontSize = one.length === 1 ? 52 : 46;
  const lines = one.length === 1 ? one : wrap(title, 46);
  const font = "Noto Sans Telugu, Nirmala UI, Gautami, sans-serif";
  const text = lines.map((l, i) => `<text x="48" y="${H - BAND + 78 + i * (fontSize + 14)}" font-size="${fontSize}" font-weight="700" fill="#fff" font-family="${font}">${escapeXml(l)}</text>`).join("");

  const aiBadge = hasAi
    ? `<g>
        <rect x="${W - 200}" y="28" rx="8" width="168" height="34" fill="#0b1020" fill-opacity="0.85" stroke="#334155" stroke-width="1.2"/>
        <text x="${W - 116}" y="51" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="middle" font-family="${font}">ప్రతీకాత్మక చిత్రం (AI)</text>
      </g>`
    : "";

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="0.35" stop-color="#0b1020" stop-opacity="0.85"/><stop offset="1" stop-color="#0b1020" stop-opacity="0.95"/></linearGradient></defs>
  ${split ? `<rect x="${W / 2 - 3}" y="0" width="6" height="${H - BAND + 40}" fill="#fff"/>` : ""}
  <rect x="0" y="${H - BAND - 60}" width="${W}" height="${BAND + 60}" fill="url(#g)"/>
  <rect x="32" y="28" rx="10" width="188" height="44" fill="#dc2626"/>
  <text x="126" y="58" font-size="24" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial, sans-serif">VaartaNow</text>
  ${aiBadge}
  ${text}
  <text x="${W - 32}" y="${H - 18}" font-size="16" fill="#cbd5e1" text-anchor="end" font-family="${font}">${escapeXml("ఫోటోలు: " + credits.join(", "))}</text>
</svg>`);
}

export async function compose(photos: LibraryPhoto[], title: string): Promise<Buffer> {
  const split = photos.length === 2;
  const tileW = split ? W / 2 : W;
  const tiles = await Promise.all(
    photos.map(async (p, i) => ({
      input: await sharp(await fetchImage(p.public_url)).resize(tileW, H, { fit: "cover", position: position(p.focus) }).toBuffer(),
      left: i * tileW,
      top: 0,
    }))
  );

  const hasAi = photos.some((p) => p.is_ai_generated || p.credit?.toLowerCase().includes("ai"));
  const creditsList = [...new Set(photos.map((p) => (p.is_ai_generated && !p.credit ? "VaartaNow AI" : p.credit)))];
  if (hasAi && !creditsList.some((c) => /ai/i.test(c))) {
    creditsList.push("VaartaNow AI");
  }

  return sharp({ create: { width: W, height: H, channels: 3, background: "#0b1020" } })
    .composite([...tiles, { input: overlaySvg(title, creditsList, split, hasAi), left: 0, top: 0 }])
    .webp({ quality: 80 })
    .toBuffer();
}

// ── category fallback ────────────────────────────────────────────────
const CATEGORY_SCENES: Record<string, string> = {
  "andhra-pradesh": "Andhra Pradesh: Amaravati skyline, Krishna river and Prakasam Barrage at dusk",
  telangana: "Telangana: Hyderabad skyline with Charminar and Hussain Sagar lake",
  vizag: "Visakhapatnam coastline, RK Beach road and hills over the Bay of Bengal",
  national: "India map silhouette with a Parliament-style dome and connected cities",
  politics: "Ballot box, podium and microphones in a government hall, generic crowd silhouettes",
  cinema: "Film reel, clapperboard and spotlight on a red curtain stage",
  cricket: "Cricket stadium at night under floodlights, bat, ball and stumps",
  business: "Rising market chart, rupee coins and modern office towers",
  technology: "Smartphone, circuit patterns and a glowing data network",
  health: "Stethoscope, heart symbol and fresh fruits on a clean background",
  jobs: "Briefcase, résumé and office desk with laptop",
  devotional: "Temple gopuram at sunrise with oil lamps and flowers",
};
const STYLE = "Editorial news illustration, modern flat vector style, warm Indian palette, 16:9. No text, no logos, no real person's face.";

/** One-time AI illustration per category, used only when the library has nothing for the story. */
async function generatedCategoryImage(supabase: SupabaseClient, category: string, apiKey: string): Promise<string | null> {
  const path = `categories/${category}.webp`;
  const { data: existing } = await supabase.storage.from(BUCKET).list("categories", { search: `${category}.webp` });
  if (existing?.some((f) => f.name === `${category}.webp`)) return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  // Nano Banana 2 by default; set GEMINI_IMAGE_MODEL=off to disable generated category illustrations
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
  if (model === "off") return null;
  try {
    const res = await fetch(`${API}/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${CATEGORY_SCENES[category] ?? CATEGORY_SCENES.national}. ${STYLE}` }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
      signal: AbortSignal.timeout(90_000),
    });
    const json = (await res.json()) as any;
    const data = json.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data)?.inlineData?.data;
    if (!data) throw new Error(json.error?.message ?? "no image returned");
    return await uploadWebp(supabase, path, await sharp(Buffer.from(data, "base64")).resize(W, H, { fit: "cover" }).webp({ quality: 78 }).toBuffer());
  } catch (e: any) {
    console.warn(`  category illustration (${category}) failed: ${e.message?.slice(0, 120)}`);
    return null;
  }
}

// ── entry point ──────────────────────────────────────────────────────
export async function storyImage(
  supabase: SupabaseClient,
  opts: { slug: string; title: string; category: string; keywords: ImageKeywords; apiKey: string }
): Promise<StoryImage> {
  try {
    const photos = await pickPhotos(supabase, opts.keywords);
    if (photos.length) {
      const path = `stories/${new Date().toISOString().slice(0, 7)}/${opts.slug}.webp`;
      const url = await uploadWebp(supabase, path, await compose(photos, opts.title));
      await markUsed(supabase, photos);
      return { url, path, kind: "library", credits: [...new Set(photos.map((p) => p.credit))] };
    }
    const categoryPhotos = await pickPhotos(supabase, { topics: [opts.category] });
    if (categoryPhotos.length) {
      const path = `stories/${new Date().toISOString().slice(0, 7)}/${opts.slug}.webp`;
      const url = await uploadWebp(supabase, path, await compose(categoryPhotos.slice(0, 1), opts.title));
      await markUsed(supabase, categoryPhotos.slice(0, 1));
      return { url, path, kind: "category", credits: [categoryPhotos[0].credit] };
    }
  } catch (e: any) {
    console.warn(`  library image failed: ${e.message?.slice(0, 120)}`);
  }
  const illustration = await generatedCategoryImage(supabase, opts.category, opts.apiKey);
  if (!illustration) return { url: null, path: null, kind: "none", credits: [] };
  // put the headline on the shared category illustration, like every other story image
  try {
    const photo: LibraryPhoto = {
      id: `category:${opts.category}`, kind: "category", label: opts.category, tags: [opts.category],
      public_url: illustration, storage_path: `categories/${opts.category}.webp`, credit: "VaartaNow AI",
      focus: "centre", times_used: 0, is_ai_generated: true,
    };
    const path = `stories/${new Date().toISOString().slice(0, 7)}/${opts.slug}.webp`;
    const url = await uploadWebp(supabase, path, await compose([photo], opts.title));
    return { url, path, kind: "category", credits: ["VaartaNow AI"] };
  } catch (e: any) {
    console.warn(`  category compose failed: ${e.message?.slice(0, 120)}`);
    return { url: illustration, path: `categories/${opts.category}.webp`, kind: "category", credits: [] };
  }
}
