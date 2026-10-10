import { createClient } from "@supabase/supabase-js";
import * as fsSync from "fs";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — news-images bucket cleanup (Storage API; SQL deletes free no space)
//
//  Deletes images that are BOTH older than --days AND no longer used by any
//  blog_posts / articles / viral_videos row. Run cleanup-database.sql first so
//  images of deleted articles become unreferenced.
//
//    npx tsx scripts/cleanup-storage.ts              # dry run: report only
//    npx tsx scripts/cleanup-storage.ts --apply      # delete
//    npx tsx scripts/cleanup-storage.ts --days=60    # change age threshold (default 90)
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

const BUCKET = "news-images";
const APPLY = process.argv.includes("--apply");
const DAYS = Number(process.argv.find((a) => a.startsWith("--days="))?.split("=")[1] ?? 90);
const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("❌ Needs SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

type StoredFile = { path: string; size: number; createdAt: number };

async function listAll(prefix = ""): Promise<StoredFile[]> {
  const files: StoredFile[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`list "${prefix}": ${error.message}`);
    if (!data?.length) break;
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...(await listAll(path))); // folder
      else files.push({ path, size: Number(item.metadata?.size ?? 0), createdAt: Date.parse(item.created_at) });
    }
    if (data.length < 1000) break;
  }
  return files;
}

// Every image URL still used by content, reduced to its path inside the bucket.
async function referencedPaths(): Promise<Set<string>> {
  const refs = new Set<string>();
  const marker = `/${BUCKET}/`;
  const sources: [string, string][] = [
    ["blog_posts", "og_image"],
    ["articles", "image_url"],
    ["viral_videos", "thumbnail_url"],
  ];
  for (const [table, column] of sources) {
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from(table).select(column).range(from, from + 999);
      if (error) {
        console.warn(`  ⚠️  ${table}.${column}: ${error.message} (skipped)`);
        break;
      }
      for (const row of data as unknown as Record<string, string | null>[]) {
        const url = row[column];
        const i = url?.indexOf(marker) ?? -1;
        if (url && i >= 0) refs.add(decodeURIComponent(url.slice(i + marker.length).split("?")[0]));
      }
      if (data.length < 1000) break;
    }
  }
  return refs;
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function main() {
  console.log(`🧹 ${BUCKET} cleanup — ${APPLY ? "APPLY" : "DRY RUN"}, older than ${DAYS} days`);
  const [files, refs] = await Promise.all([listAll(), referencedPaths()]);
  const doomed = files.filter((f) => f.createdAt < cutoff && !refs.has(f.path));

  const total = files.reduce((s, f) => s + f.size, 0);
  const freed = doomed.reduce((s, f) => s + f.size, 0);
  console.log(`  files in bucket: ${files.length} (${mb(total)})`);
  console.log(`  still referenced: ${refs.size}`);
  console.log(`  to delete: ${doomed.length} (${mb(freed)})`);
  doomed.slice(0, 10).forEach((f) => console.log(`    - ${f.path}`));

  if (!APPLY) {
    console.log("  Dry run only. Re-run with --apply to delete.");
    return;
  }
  for (let i = 0; i < doomed.length; i += 1000) {
    const batch = doomed.slice(i, i + 1000).map((f) => f.path);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) throw new Error(`remove batch ${i / 1000 + 1}: ${error.message}`);
    console.log(`  🗑️  deleted ${Math.min(i + 1000, doomed.length)}/${doomed.length}`);
  }
  console.log(`✅ Freed about ${mb(freed)}`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
