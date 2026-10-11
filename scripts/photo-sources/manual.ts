// Government and party press photos (PIB, I&PR Andhra Pradesh / Telangana, Lok Sabha, party media cells).
// Never crawled: a person supplies the file (with a JSON sidecar) or one page URL, and records where the
// reuse terms were checked. Credit is the issuing office, e.g. "Photo: PIB".
import * as fs from "fs";
import * as path from "path";
import { attribution, stripHtml, type Candidate, type PublicFigure } from "./types";
import { politeFetch, type Skip } from "./wikimedia";

type Sidecar = {
  person_name: string; designation?: string; party?: string; source_name: string; source_url: string;
  photo_date?: string; event_caption?: string; terms_note: string; received_via?: string;
  author?: string; license_name?: string; license_url?: string;
};

const PROMOTIONAL = /media cell|media wing|party office|campaign/i;

function fromSidecar(s: Sidecar, original: string, figure?: PublicFigure): Candidate {
  const licenseName = s.license_name ?? (PROMOTIONAL.test(s.source_name) ? "Party media release" : "Government press release");
  return {
    person_name: figure?.name ?? s.person_name, designation: s.designation ?? figure?.designation ?? null, party: s.party ?? figure?.party ?? null,
    original_url: original, source_url: s.source_url, source_name: s.source_name, author: s.author ?? null,
    license_name: licenseName, license_url: s.license_url ?? null, share_alike: false,
    photo_date: s.photo_date ?? null, event_caption: s.event_caption ?? null,
    terms_note: [s.terms_note, s.received_via ? `received via ${s.received_via}` : ""].filter(Boolean).join("; "),
    attribution_text: attribution(s.author ?? null, s.source_name, licenseName),
  };
}

/** imports/<source>/<file>.jpg + <file>.json written by a person. */
export function readFolder(dir: string, figures: PublicFigure[], skipped: Skip[]): Candidate[] {
  const out: Candidate[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const sidecarPath = path.join(dir, file.replace(/\.[a-z]+$/i, ".json"));
    const skip = (reason: string) => skipped.push({ person: "?", title: file, reason });
    if (!fs.existsSync(sidecarPath)) { skip("no .json sidecar next to the photo"); continue; }
    const s: Sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf8"));
    const missing = (["person_name", "source_name", "source_url", "terms_note"] as const).filter((k) => !s[k]);
    if (missing.length) { skip(`sidecar is missing ${missing.join(", ")}`); continue; }
    const figure = findFigure(figures, s.person_name);
    out.push(fromSidecar(s, path.join(dir, file), figure));
  }
  return out;
}

/** One page a person passes in: fetch that page only and take its main (og:image) photo. */
export async function readUrl(url: string, opts: { person: string; source: string; terms: string; date?: string }, figures: PublicFigure[]): Promise<Candidate> {
  const html = await (await politeFetch(url)).text();
  const meta = (prop: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"))?.[1];
  const image = meta("og:image") ?? meta("twitter:image");
  if (!image) throw new Error("the page has no og:image; download the photo and use import-folder with a sidecar instead");
  const caption = stripHtml(meta("og:description") ?? meta("og:title") ?? "");
  const figure = findFigure(figures, opts.person);
  return fromSidecar({ person_name: opts.person, source_name: opts.source, source_url: url, terms_note: opts.terms, photo_date: opts.date, event_caption: caption.slice(0, 500) },
    new URL(image, url).toString(), figure);
}

export function findFigure(figures: PublicFigure[], name: string): PublicFigure | undefined {
  const n = name.toLowerCase().replace(/\./g, "").trim();
  return figures.find((f) => [f.name, ...f.aliases].some((a) => a.toLowerCase().replace(/\./g, "").trim() === n));
}
