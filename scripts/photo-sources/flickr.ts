// Flickr: freely licensed photos from an allowlist of official accounts only (scripts/config/flickr-accounts.json).
import * as fs from "fs";
import { attribution, captionNames, classifyLicence, type Candidate, type PublicFigure } from "./types";
import type { Skip } from "./wikimedia";

const API = "https://api.flickr.com/services/rest/";
// Flickr licence ids: 4 CC BY 2.0, 5 CC BY-SA 2.0, 7 no known copyright restrictions, 8 US Government work,
// 9 CC0, 10 Public Domain Mark. (CC 4.0 ids 11+ are the same licences in newer versions.)
const LICENCES: Record<string, { name: string; url: string | null }> = {
  "4": { name: "CC BY 2.0", url: "https://creativecommons.org/licenses/by/2.0/" },
  "5": { name: "CC BY-SA 2.0", url: "https://creativecommons.org/licenses/by-sa/2.0/" },
  "7": { name: "Public domain", url: "https://www.flickr.com/commons/usage/" },
  "8": { name: "Public domain", url: "http://www.usa.gov/copyright.shtml" },
  "9": { name: "CC0 1.0", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
  "10": { name: "Public domain", url: "https://creativecommons.org/publicdomain/mark/1.0/" },
  "11": { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
  "12": { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
};

type Account = { id: string; name: string; note?: string };

export function flickrAccounts(): Account[] {
  const file = "scripts/config/flickr-accounts.json";
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")).accounts ?? []) : [];
}

async function call(method: string, params: Record<string, string>) {
  const q = new URLSearchParams({ method, api_key: process.env.FLICKR_API_KEY!, format: "json", nojsoncallback: "1", ...params });
  const res = await fetch(`${API}?${q}`, { signal: AbortSignal.timeout(30_000) });
  const json: any = await res.json();
  if (json.stat !== "ok") throw new Error(`flickr ${method}: ${json.message}`);
  return json;
}

export async function searchFlickr(person: PublicFigure, limit: number, skipped: Skip[]): Promise<Candidate[]> {
  if (!process.env.FLICKR_API_KEY) throw new Error("FLICKR_API_KEY is not set in .env");
  const accounts = flickrAccounts();
  if (!accounts.length) throw new Error("no official accounts in scripts/config/flickr-accounts.json; add the ones you have checked");
  const out: Candidate[] = [];
  for (const account of accounts) {
    if (out.length >= limit) break;
    const found = await call("flickr.photos.search", {
      user_id: account.id, text: person.name, license: Object.keys(LICENCES).join(","), per_page: String(limit * 4),
      extras: "license,owner_name,date_taken,url_l,url_o,o_dims,description",
    });
    for (const p of found.photos?.photo ?? []) {
      if (out.length >= limit) break;
      const page = `https://www.flickr.com/photos/${p.owner}/${p.id}/`;
      const skip = (reason: string) => skipped.push({ person: person.name, title: p.title, reason, source_url: page });
      const caption = `${p.title} ${p.description?._content ?? ""}`;
      if (!captionNames(person, caption)) { skip("title/description does not name the person"); continue; }
      const lic = LICENCES[String(p.license)];
      const licence = lic ? classifyLicence(lic.name, lic.url) : ({ ok: false, reason: `flickr licence id ${p.license}` } as const);
      if (!licence.ok) { skip(licence.reason); continue; }
      const url = p.url_l ?? p.url_o;
      if (!url) { skip("no large size available"); continue; }
      const info = await call("flickr.photos.getInfo", { photo_id: p.id });
      const author = info.photo?.owner?.realname || info.photo?.owner?.username || account.name;
      out.push({
        person_name: person.name, designation: person.designation, party: person.party,
        original_url: url, source_url: page, source_name: "Flickr", author,
        license_name: licence.name, license_url: licence.url, share_alike: licence.shareAlike,
        photo_date: (p.datetaken ?? "").slice(0, 10) || null, event_caption: caption.slice(0, 500),
        attribution_text: attribution(author, "Flickr", licence.name),
      });
    }
  }
  return out;
}
