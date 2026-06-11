import * as fs from "fs";

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractParagraphsText(html: string): string {
  const body = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    
  const matches = body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  const paragraphs: string[] = [];
  for (const m of matches) {
    const pText = m[1]
      .replace(/<[^>]+>/g, "") // strip tags inside p
      .replace(/\s+/g, " ")
      .trim();
    if (pText.length > 30) {
      paragraphs.push(pText);
    }
  }
  return paragraphs.join("\n\n");
}

async function decodeGoogleNewsUrl(googleUrl: string): Promise<string> {
  const response = await fetch(googleUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!response.ok) return googleUrl;
  const html = await response.text();
  const match = html.match(/<c-wiz[^>]*data-p=["']([^"']+)["']/i);
  if (!match) return googleUrl;
  let dataP = decodeHtmlEntities(match[1]);
  const cleanedJson = dataP.replace(/%\.@\./g, '["garturlreq",');
  const obj = JSON.parse(cleanedJson);
  const processedObj = [...obj.slice(0, -6), ...obj.slice(-2)];
  const fReq = [[["Fbv4je", JSON.stringify(processedObj), null, "generic"]]];
  const postBody = new URLSearchParams({ "f.req": JSON.stringify(fReq) });
  const postResponse = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://news.google.com/"
    },
    body: postBody.toString()
  });
  const resText = await postResponse.text();
  const jsonStr = resText.replace(")]}'\n\n", "");
  const parsed = JSON.parse(jsonStr);
  return JSON.parse(parsed[0][2])[1] || googleUrl;
}

async function test() {
  const testUrl = "https://news.google.com/rss/articles/CBMixAFBVV95cUxQZnh6cVd0eXBsMHBWbGxYVGxCSG10dDBfclNWSDBJbGZoWGI4ZlJLREdpQUhFbklrMUNOZ3c0UDdsQ01oMl9XMG11cnJjQVpRVUZMakw5VjltVS1vZVJHcVh0bkJuOTIyZDY1V3c3Zzg2TnVlM05CeVpRbUZhZ2xtQmhLbEZDSWlqR0pnOF8wenI0elplT1RubUJ0LS1QbnVwc01zNTRQY0VYRlpsSFk1LVNYSmQzdnJRcDMwcW5lSlJkOTAx?oc=5";
  console.log("Resolving:", testUrl);
  const resolved = await decodeGoogleNewsUrl(testUrl);
  console.log("Resolved URL:", resolved);
  
  console.log("Fetching resolved URL HTML...");
  const res = await fetch(resolved, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  });
  const html = await res.text();
  const text = extractParagraphsText(html);
  console.log("----------------------------------------");
  console.log("Extracted Paragraphs (first 1000 chars):");
  console.log(text.slice(0, 1000));
}

test();
