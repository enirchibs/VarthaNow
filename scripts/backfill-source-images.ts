import { createClient } from "@supabase/supabase-js";
import * as fsSync from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — restore article images from the original source pages
//
//  Old images stayed behind on Supabase Storage during the move to aapstack.tech.
//  For every published post without og_image, this fetches source_article_url,
//  reads its og:image / twitter:image and stores that URL. Newest posts first;
//  posts that already have an image are never touched, so re-runs are safe.
//
//    npx tsx scripts/backfill-source-images.ts --days=7     # last week only
//    npx tsx scripts/backfill-source-images.ts              # everything
//    npx tsx scripts/backfill-source-images.ts --dry-run --limit=20
// ═══════════════════════════════════════════════════════════════════

try {
  const envText = fsSync.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && val && !process.env[key]) process.env[key] = val;
  }
} catch {}

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = Number(arg("limit") ?? Infinity);
const DAYS = arg("days") ? Number(arg("days")) : null;
const CONCURRENCY = 4;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

type Post = { id: string; slug: string; source_article_url: string | null };

const META_IMAGE = /<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/i;
const CONTENT = /content=["']([^"']+)["']/i;

async function findImage(pageUrl: string): Promise<string | null> {
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VaartaNowBot/1.0)" },
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
  });
  if (!res.ok) return null;
  const html = (await res.text()).slice(0, 300_000); // og tags live in <head>
  const tag = html.match(META_IMAGE)?.[0];
  const raw = tag?.match(CONTENT)?.[1];
  if (!raw) return null;
  const url = new URL(raw.replace(/&amp;/g, "&"), pageUrl).toString();
  return url.startsWith("https://") ? url : null; // http images would be blocked on an https site
}

// The API allows ~600 requests/minute per key; back off and retry when a write is refused.
async function saveImage(id: string, image: string) {
  for (let attempt = 0; ; attempt++) {
    const { error } = await supabase.from("blog_posts").update({ og_image: image }).eq("id", id).is("og_image", null);
    if (!error) return;
    if (attempt >= 5) throw new Error(error.message);
    await new Promise((r) => setTimeout(r, 2_000 * 2 ** attempt));
  }
}

async function loadPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  for (let from = 0; posts.length < LIMIT; from += 1000) {
    let q = supabase
      .from("blog_posts")
      .select("id, slug, source_article_url")
      .eq("published", true)
      .is("og_image", null)
      .not("source_article_url", "is", null)
      .order("published_at", { ascending: false })
      .range(from, from + 999);
    if (DAYS !== null) q = q.gte("published_at", new Date(Date.now() - DAYS * 86_400_000).toISOString());
    const { data, error } = await q;
    if (error) throw new Error(`load posts: ${error.message}`);
    posts.push(...(data as Post[]));
    if (data.length < 1000) break;
  }
  return posts.slice(0, LIMIT);
}

async function main() {
  const posts = await loadPosts();
  console.log(`${posts.length} posts without an image${DRY_RUN ? " (dry run)" : ""}`);
  let found = 0, missing = 0, failed = 0, done = 0;

  const queue = [...posts];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let post = queue.shift(); post; post = queue.shift()) {
        try {
          const image = await findImage(post.source_article_url!);
          if (!image) missing++;
          else {
            if (DRY_RUN) console.log(`  ${post.slug} -> ${image}`);
            else await saveImage(post.id, image);
            found++;
          }
        } catch {
          failed++;
        }
        if (++done % 200 === 0) console.log(`  ${done}/${posts.length} — images ${found}, none ${missing}, errors ${failed}`);
      }
    })
  );
  console.log(`Done: ${found} images ${DRY_RUN ? "found" : "restored"}, ${missing} pages without og:image, ${failed} errors`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
