// Source credits for a story: which outlets' reports it was written from, shown at the end of the
// short card and the full article with the outlet's small site icon, its name and a link to the original.
// Only names, site icons and links are shown — never the outlet's photos (copyright).
import type { BlogPost } from "@/types/news";

export type SourceCredit = { name: string; url: string; domain: string; logo: string | null };

/** Readable names for outlets we read. Matched on the article link's domain (subdomains included). */
const PUBLISHERS: Record<string, string> = {
  "tv9telugu.com": "TV9 Telugu",
  "ntvtelugu.com": "NTV Telugu",
  "sakshi.com": "Sakshi",
  "eenadu.net": "Eenadu",
  "andhrajyothy.com": "Andhra Jyothy",
  "abplive.com": "ABP Desam",
  "v6velugu.com": "V6 Velugu",
  "dishadaily.com": "Disha",
  "ntnews.com": "Namasthe Telangana",
  "10tv.in": "10TV",
  "tv5news.in": "TV5 News",
  "hmtvlive.com": "hmtv",
  "prajasakti.com": "Prajasakti",
  "manatelangana.news": "Mana Telangana",
  "bigtvlive.com": "BIG TV",
  "idreampost.com": "iDream Post",
  "vaartha.com": "Vaartha",
  "telugu360.com": "Telugu360",
  "oneindia.com": "Oneindia",
  "news18.com": "News18",
  "asianetnews.com": "Asianet News",
  "samayam.com": "Samayam",
  "hindustantimes.com": "Hindustan Times",
  "bbc.com": "BBC News",
  "thehindu.com": "The Hindu",
  "indiatimes.com": "Times of India",
  "deccanchronicle.com": "Deccan Chronicle",
  "newindianexpress.com": "The New Indian Express",
  "pib.gov.in": "PIB",
};

/**
 * Outlets that asked us not to show their logo: they are credited by name and link only.
 * Add the domain here (e.g. "example.com") — one line, no database change.
 */
export const NAME_ONLY_SOURCES = new Set<string>([]);

/** Links that do not identify the real outlet (aggregator redirects) or are our own. */
const UNRESOLVED = /(^|\.)(news\.google\.com|google\.com|feedburner\.com|feedproxy\.google\.com|t\.co|varthanow\.pages\.dev|vaartanow\.com)$/i;

const bareDomain = (host: string) => host.toLowerCase().replace(/^(www|m|amp|mobile)\./, "");

function publisherFor(domain: string): { key: string; name: string } {
  const key = Object.keys(PUBLISHERS)
    .sort((a, b) => b.length - a.length)
    .find((d) => domain === d || domain.endsWith(`.${d}`));
  return key ? { key, name: PUBLISHERS[key] } : { key: domain, name: domain };
}

export function sourceCredit(url: string | null | undefined): SourceCredit | null {
  if (!url) return null;
  let host: string;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    host = bareDomain(u.hostname);
  } catch {
    return null;
  }
  if (!host || UNRESOLVED.test(host)) return null;
  const { key, name } = publisherFor(host);
  const nameOnly = NAME_ONLY_SOURCES.has(key) || NAME_ONLY_SOURCES.has(host);
  return { name, url, domain: key, logo: nameOnly ? null : `https://www.google.com/s2/favicons?domain=${key}&sz=64` };
}

/** Up to three credits, one per outlet, in the order the pipeline saved them. */
export function sourceCredits(post: Pick<BlogPost, "source_article_url" | "source_url">): SourceCredit[] {
  const out: SourceCredit[] = [];
  for (const url of [post.source_article_url, post.source_url]) {
    const credit = sourceCredit(url);
    if (credit && !out.some((c) => c.url === credit.url || c.domain === credit.domain)) out.push(credit);
  }
  return out.slice(0, 3);
}
