import { chromium } from "playwright";

export async function scrapeSource(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: "VarthaNowBot/1.0" });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

  const items = await page.locator("article, [data-article], .story").evaluateAll((nodes) =>
    nodes.slice(0, 20).map((node) => ({
      headline: node.querySelector("h1,h2,h3")?.textContent?.trim() ?? "",
      link: (node.querySelector("a") as HTMLAnchorElement | null)?.href ?? "",
      imageUrl: (node.querySelector("img") as HTMLImageElement | null)?.src ?? ""
    }))
  );

  await browser.close();
  return items.filter((item) => item.headline && item.link);
}
