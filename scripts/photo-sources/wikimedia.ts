// Wikimedia Commons: search the File namespace for a person and keep only freely licensed photos
// whose own title or description names that person (identity comes from the caption, never from faces).
import { attribution, captionNames, classifyLicence, stripHtml, type Candidate, type PublicFigure } from "./types";

const API = "https://commons.wikimedia.org/w/api.php";
// Wikimedia asks automated clients for a descriptive User-Agent with a way to reach the operator.
export const USER_AGENT = process.env.PHOTO_IMPORT_USER_AGENT || "VaartaNowPhotoImporter/1.0 (https://vaartanow.com; editorial photo library)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;

/** At most one request per second to Wikimedia. */
export async function politeFetch(url: string, init: RequestInit = {}) {
  const wait = lastCall + 1000 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  return fetch(url, { ...init, headers: { "User-Agent": USER_AGENT, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(30_000) });
}

export type Skip = { person: string; title: string; reason: string; source_url?: string };

export async function searchCommons(person: PublicFigure, limit: number, skipped: Skip[]): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: "query", format: "json", formatversion: "2", generator: "search",
    gsrsearch: `${person.commons_search ?? `"${person.name}"`} filetype:bitmap`, gsrnamespace: "6", gsrlimit: String(Math.min(50, limit * 6)),
    prop: "imageinfo", iiprop: "url|extmetadata|size|mime", iiurlwidth: "1600", iiextmetadatalanguage: "en",
    iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription|DateTimeOriginal|NonFree|ObjectName",
  });
  const res = await politeFetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`commons search ${res.status}`);
  const pages: any[] = ((await res.json()) as any).query?.pages ?? [];
  pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const out: Candidate[] = [];
  for (const page of pages) {
    if (out.length >= limit) break;
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const title: string = page.title;
    const skip = (reason: string) => skipped.push({ person: person.name, title, reason, source_url: info?.descriptionurl });
    if (!info) { skip("no image info"); continue; }
    if (!/image\/(jpeg|png|webp)/.test(info.mime)) { skip(`type ${info.mime}`); continue; }
    if ((info.width ?? 0) < 800) { skip(`too small (${info.width}px wide)`); continue; }
    if (String(meta.NonFree?.value ?? "").toLowerCase() === "true") { skip("marked non-free"); continue; }

    const description = stripHtml(meta.ImageDescription?.value);
    const caption = `${title.replace(/^File:/, "").replace(/\.[a-z]+$/i, "")} ${stripHtml(meta.ObjectName?.value)} ${description}`;
    if (!captionNames(person, caption)) { skip("title/description does not name the person"); continue; }

    const licence = classifyLicence(meta.LicenseShortName?.value, meta.LicenseUrl?.value);
    if (!licence.ok) { skip(licence.reason); continue; }

    const author = stripHtml(meta.Artist?.value).slice(0, 160) || null;
    const date = String(meta.DateTimeOriginal?.value ?? "").match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
    out.push({
      person_name: person.name, designation: person.designation, party: person.party,
      original_url: info.thumburl ?? info.url, source_url: info.descriptionurl, source_name: "Wikimedia Commons",
      author, license_name: licence.name, license_url: licence.url, share_alike: licence.shareAlike,
      photo_date: date, event_caption: (description || title.replace(/^File:/, "")).slice(0, 500),
      attribution_text: attribution(author, "Wikimedia Commons", licence.name),
    });
  }
  return out;
}
