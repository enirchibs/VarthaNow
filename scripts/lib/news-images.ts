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
/** All active tags, so Gemini can pick keywords that actually exist in the library. */
export async function libraryTags(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("image_library").select("tags").eq("active", true);
  return [...new Set((data ?? []).flatMap((r) => r.tags as string[]))].sort();
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

async function pickPhotos(supabase: SupabaseClient, kw: ImageKeywords): Promise<LibraryPhoto[]> {
  const all = [...(kw.people ?? []), ...(kw.places ?? []), ...(kw.topics ?? [])].map(norm).filter(Boolean);
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
  const topic = best(rows, ["topic", "category"], kw.topics ?? []);

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

/** Wrap a Telugu headline into at most 2 lines (approximate width by character count). */
function wrap(title: string, maxChars = 44): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of title.split(/\s+/)) {
    if ((line + " " + word).trim().length > maxChars && line) { lines.push(line); line = word; }
    else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines.length > 2 ? [lines[0], lines[1].replace(/[\s.…]+$/, "") + "…"] : lines.map((l) => l.replace(/\.{2,}$/, ""));
}

function overlaySvg(title: string, credits: string[], split: boolean, hasAi: boolean): Buffer {
  const lines = wrap(title);
  const fontSize = lines.length > 1 ? 46 : 52;
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
  const model = process.env.GEMINI_IMAGE_MODEL;
  if (!model) return null; // only generate when an image model is configured
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
  const url = await generatedCategoryImage(supabase, opts.category, opts.apiKey);
  return url ? { url, path: `categories/${opts.category}.webp`, kind: "category", credits: [] } : { url: null, path: null, kind: "none", credits: [] };
}
