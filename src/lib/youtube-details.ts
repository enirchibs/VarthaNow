// Ready-to-paste YouTube title, description and tags for an article's video, for editors who upload
// the recording to the VaartaNow channel themselves.
import { categoryLabel } from "@/lib/categories";

export type YoutubeSource = { slug: string; title: string; content?: string | null; excerpt?: string | null; category?: string | null; tags?: string[] | null; presenter?: string | null };

const SITE = "https://varthanow.pages.dev";
const plain = (s: string) => s.replace(/^#+\s*/gm, "").replace(/[*_`>#]/g, "").replace(/[<>]/g, "").replace(/\n{2,}/g, "\n\n").trim();

export function youtubeDetails(p: YoutubeSource) {
  const title = p.title.replace(/[<>]/g, "").trim().slice(0, 100);
  const summary = plain(p.excerpt?.trim() || (p.content ?? "").split(/\n{2,}/).slice(0, 2).join("\n\n")).slice(0, 1500);
  const category = p.category ? categoryLabel(p.category, "te") : "";
  const tagList: string[] = [];
  for (const t of [...(p.tags ?? []), category, "VaartaNow", "తెలుగు వార్తలు", "Telugu News", "Andhra Pradesh", "Telangana"]) {
    const tag = (t ?? "").replace(/[<>,#]/g, "").trim();
    if (tag && !tagList.some((x) => x.toLowerCase() === tag.toLowerCase()) && tagList.join(",").length + tag.length < 480) tagList.push(tag);
  }
  const hashtags = ["#VaartaNow", "#TeluguNews", "#తెలుగువార్తలు", category ? `#${category.replace(/\s+/g, "")}` : ""].filter(Boolean).join(" ");
  const description = [
    summary,
    "",
    `పూర్తి వార్త చదవండి: ${SITE}/news/${p.slug}`,
    p.presenter && !p.presenter.includes("@") ? `ప్రజెంటర్: ${p.presenter}` : "",
    "",
    "VaartaNow — తాజా తెలుగు వార్తలు, తక్షణం.",
    hashtags,
  ].filter((line, i, all) => line || all[i - 1]).join("\n");
  return { title, description, tags: tagList.join(", ") };
}
