type FeedItem = {
  title: string;
  link: string;
  pubDate?: string;
};

export async function ingestRss(url: string): Promise<FeedItem[]> {
  const response = await fetch(url, { headers: { "User-Agent": "VarthaNowBot/1.0" } });
  const xml = await response.text();

  return [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].map((match) => {
    const item = match[0];
    return {
      title: readTag(item, "title"),
      link: readTag(item, "link"),
      pubDate: readTag(item, "pubDate")
    };
  });
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return (match?.[1] ?? match?.[2] ?? "").trim();
}
