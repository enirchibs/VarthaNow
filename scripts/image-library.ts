import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "node:crypto";
import { BUCKET, ensureBucket } from "./lib/news-images";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — manage the tagged photo library used for news images
//
//  Add a photo (resized to ≤1600px WebP and stored in the news-images bucket):
//    npx tsx scripts/image-library.ts add --file=photos/cbn-1.jpg --kind=person \
//      --label="N. Chandrababu Naidu" --tags="cbn,chandrababu naidu,chandrababu,naidu" \
//      --credit="AP CMO press release" --license=govt-press-release --focus=top
//
//  kinds:  person | place | topic | category   (category tags = category slug, e.g. "cricket")
//  focus:  which part of the photo to keep when cropping: left | center | right | top
//
//  List / disable:
//    npx tsx scripts/image-library.ts list [--tag=cbn]
//    npx tsx scripts/image-library.ts disable --id=<uuid>
// ═══════════════════════════════════════════════════════════════════

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
}
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function add() {
  const file = arg("file"), kind = arg("kind"), label = arg("label"), credit = arg("credit");
  const tags = (arg("tags") ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (!file || !kind || !label || !credit || !tags.length) throw new Error("add needs --file --kind --label --tags --credit");
  if (!["person", "place", "topic", "category"].includes(kind)) throw new Error("--kind must be person | place | topic | category");

  const webp = await sharp(fs.readFileSync(file)).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const name = `${tags[0].replace(/[^a-z0-9]+/g, "-")}-${createHash("sha1").update(webp).digest("hex").slice(0, 8)}.webp`;
  const storagePath = `library/${kind}/${name}`;

  await ensureBucket(supabase);
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, webp, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
  if (upErr) throw new Error(`upload: ${upErr.message}`);
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

  const { data, error } = await supabase.from("image_library").insert({
    kind, label, tags, storage_path: storagePath, public_url: publicUrl, credit,
    license: arg("license") ?? "own", focus: arg("focus") ?? "center",
  }).select("id").single();
  if (error) throw new Error(`save: ${error.message}`);
  console.log(`added ${kind} "${label}" (${path.basename(file)}) → ${data.id}\n  tags: ${tags.join(", ")}`);
}

async function list() {
  let q = supabase.from("image_library").select("*").order("kind");
  const tag = arg("tag");
  if (tag) q = q.contains("tags", [tag.toLowerCase()]);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  for (const r of data) {
    const aiTag = r.is_ai_generated ? "[AI]" : "[REAL]";
    const code = r.asset_code || r.id.slice(0, 8);
    console.log(`${r.active ? " " : "x"} ${aiTag} ${r.kind.padEnd(8)} ${r.label.padEnd(32)} used ${String(r.times_used).padStart(3)}  [${(r.tags || []).slice(0, 6).join(", ")}]  ${code}`);
  }
  console.log(`${data.length} photo(s)`);
}

async function disable() {
  const id = arg("id");
  if (!id) throw new Error("disable needs --id");
  const { error } = await supabase.from("image_library").update({ active: false }).or(`id.eq.${id},asset_code.eq.${id}`);
  if (error) throw new Error(error.message);
  console.log(`disabled ${id}`);
}

async function search() {
  const queryStr = process.argv.slice(3).join(" ").trim();
  if (!queryStr) throw new Error("search needs a query: npx tsx scripts/image-library.ts search <query>");

  const rawTokens = queryStr.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean);
  const { data, error } = await supabase
    .from("image_library")
    .select("*")
    .eq("active", true);

  if (error) throw new Error(error.message);
  if (!data?.length) {
    console.log("No images found in library.");
    return;
  }

  // Scoring algorithm
  const scored = data.map((item) => {
    let score = 0;
    const allTags = (item.tags || []).map((t: string) => t.toLowerCase());
    const labelLower = (item.label || "").toLowerCase();
    const codeLower = (item.asset_code || "").toLowerCase();
    const teluguKws = (item.keywords_te || []).map((t: string) => t.toLowerCase());

    for (const token of rawTokens) {
      if (codeLower === token || codeLower.includes(token)) score += 10;
      if (labelLower.includes(token)) score += 5;
      if (allTags.includes(token)) score += 4;
      else if (allTags.some((t: string) => t.includes(token))) score += 2;
      if (teluguKws.includes(token)) score += 4;
      else if (teluguKws.some((t: string) => t.includes(token))) score += 2;
    }

    return { item, score };
  });

  const matches = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || a.item.times_used - b.item.times_used);

  if (!matches.length) {
    console.log(`No results found matching: "${queryStr}"`);
    return;
  }

  console.log(`\nSearch results for: "${queryStr}" (${matches.length} matches)\n${"─".repeat(75)}`);
  for (const { item, score } of matches.slice(0, 20)) {
    const aiTag = item.is_ai_generated ? "[AI]" : "[REAL]";
    const code = item.asset_code || item.id.slice(0, 8);
    console.log(`${aiTag} ${item.kind.toUpperCase().padEnd(8)} ${item.label} (Code: ${code}, Score: ${score})`);
    console.log(`     Tags:   ${(item.tags || []).slice(0, 8).join(", ")}`);
    console.log(`     Credit: ${item.credit} | URL: ${item.public_url}\n`);
  }
}

const command = process.argv[2];
({ add, list, disable, search } as Record<string, () => Promise<void>>)[command]?.().catch((e) => {
  console.error(e.message);
  process.exit(1);
}) ?? console.log("usage: image-library.ts add | list | disable | search  (see header for options)");

