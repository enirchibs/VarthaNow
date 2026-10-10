import type { BlogPost } from "@/types/news";

const siteName = "VarthaNow";
import { SITE_URL as siteUrl } from "@/lib/site";

export function setMeta({
  title,
  description,
  canonical,
  image,
  structuredData
}: {
  title: string;
  description: string;
  canonical?: string;
  image?: string | null;
  structuredData?: object;
}) {
  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", "article");
  upsertMeta("property", "og:site_name", siteName);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  if (image) {
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:image", image);
  }
  if (canonical) upsertLink("canonical", `${siteUrl}${canonical}`);
  if (structuredData) upsertJsonLd(structuredData);
}

export function postStructuredData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.meta_description,
    image: post.og_image ? [post.og_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { "@type": "Organization", name: post.author_name },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: `${siteUrl}/icons/icon-192.svg` }
    },
    mainEntityOfPage: `${siteUrl}/news/${post.slug}`
  };
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

/** schema.org VideoObject for a short-video page, so search engines understand the embedded clip. */
export function videoStructuredData(video: { id: string; title: string; caption: string; thumbnail: string; publishedAt: string; duration: string; channel: string }) {
  const [m = "0", s = "0"] = video.duration.split(":");
  upsertJsonLd({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.caption || video.title,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    ...(video.duration ? { duration: `PT${Number(m)}M${Number(s)}S` } : {}),
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    url: `${siteUrl}/videos/${video.id}`,
    publisher: { "@type": "Organization", name: video.channel },
    inLanguage: "te",
  });
}

function upsertJsonLd(data: object) {
  const id = "varthanow-jsonld";
  let element = document.getElementById(id) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}
