// Shared types and licence rules for licensed photos of public figures.

export type PublicFigure = {
  name: string;
  te: string;
  aliases: string[];
  aliases_te: string[];
  designation: string;
  party: string | null;
  group: "politics" | "cinema" | "sports" | "business" | "international";
  region: string;
  commons_search?: string;
};

/** A photo found at a source, before download and review. Identity comes from the source caption. */
export type Candidate = {
  person_name: string;
  designation: string | null;
  party: string | null;
  original_url: string;
  source_url: string;
  source_name: string;           // "Wikimedia Commons", "Flickr", "PIB", "I&PR Andhra Pradesh", ...
  author: string | null;
  license_name: string;
  license_url: string | null;
  share_alike: boolean;
  photo_date: string | null;     // yyyy-mm-dd
  event_caption: string | null;
  terms_note?: string | null;
  attribution_text: string;
};

export type LicenceVerdict = { ok: true; name: string; url: string | null; shareAlike: boolean } | { ok: false; reason: string };

const CC_URL: Record<string, string> = {
  by: "https://creativecommons.org/licenses/by/",
  "by-sa": "https://creativecommons.org/licenses/by-sa/",
};

/**
 * Accept public domain, CC0, CC BY and CC BY-SA. Reject non-commercial, no-derivatives, fair use,
 * all-rights-reserved and anything unknown. GODL-India (Indian government open data licence) is accepted
 * unless PHOTO_ALLOW_GODL=false; other government material goes through the manual route.
 */
export function classifyLicence(shortName: string | null | undefined, url?: string | null): LicenceVerdict {
  const name = (shortName ?? "").trim();
  if (!name) return { ok: false, reason: "no licence" };
  const tokens = name.toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean);
  if (tokens.includes("nc") || tokens.includes("nd") || /non.?commercial|no.?deriv|fair use|all rights reserved/i.test(name)) {
    return { ok: false, reason: `licence ${name} (non-commercial / no-derivatives / restricted)` };
  }
  if (/^cc0\b|cc zero|creative commons zero/i.test(name)) return { ok: true, name: "CC0 1.0", url: url || "https://creativecommons.org/publicdomain/zero/1.0/", shareAlike: false };
  if (/public domain|^pd\b|^pd-|publicdomain|no known copyright|united states government work/i.test(name)) {
    return { ok: true, name: "Public domain", url: url || null, shareAlike: false };
  }
  // Government Open Data Licence – India: use, adaptation and commercial use allowed with attribution.
  // Accepted by default (approved by the site owner 2026-10-11); --no-godl turns it off.
  if (/godl/i.test(name)) {
    return process.env.PHOTO_ALLOW_GODL !== "false"
      ? { ok: true, name: "GODL-India", url: url || "https://data.gov.in/government-open-data-license-india", shareAlike: false }
      : { ok: false, reason: "licence GODL-India (turned off with --no-godl)" };
  }
  const cc = name.match(/^cc[\s-]+(by(?:-sa)?)(?:[\s-]+(\d\.\d))?/i);
  if (cc) {
    const kind = cc[1].toLowerCase();
    const version = cc[2] ?? (url?.match(/\/(\d\.\d)\//)?.[1] ?? "4.0");
    return { ok: true, name: `CC ${kind.toUpperCase()} ${version}`, url: url || `${CC_URL[kind]}${version}/`, shareAlike: kind === "by-sa" };
  }
  return { ok: false, reason: `licence ${name} (not on the accepted list)` };
}

export const stripHtml = (s: string | null | undefined) =>
  (s ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\x00-\x7f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** "Photo: Jane Doe via Wikimedia Commons / CC BY-SA 4.0", or "Photo: PIB" for press material. */
export function attribution(author: string | null, sourceName: string, licenseName: string | null): string {
  const who = author && author.toLowerCase() !== sourceName.toLowerCase() ? `${author} via ${sourceName}` : sourceName;
  return licenseName && /^(cc|public domain|godl)/i.test(licenseName) ? `Photo: ${who} / ${licenseName}` : `Photo: ${who}`;
}

/** Name variants to check against a caption: the full name and aliases of two or more words / 6+ letters. */
export function identityNames(p: PublicFigure): string[] {
  return [p.name, ...p.aliases].map((n) => n.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim()).filter((n) => n.includes(" ") || n.length >= 6);
}

export function captionNames(p: PublicFigure, caption: string): boolean {
  const c = caption.toLowerCase().replace(/\./g, "").replace(/[_\s]+/g, " ");
  return identityNames(p).some((n) => c.includes(n));
}
