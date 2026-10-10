import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "node:crypto";
import { BUCKET, ensureBucket } from "./lib/news-images";
import type { ImageSpec } from "./generate-manifest";
import { computeDHash, validateAndFormatImage } from "./generate-image-library";

// Load .env
for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) {
    process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
  }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const BRAIN_DIR = path.resolve("C:\\Users\\CNE\\.gemini\\antigravity\\brain\\8feeebbe-b859-4193-a9ff-e20f7b9fa6b8");
const MANIFEST_FILE = path.resolve("data", "image-manifest.json");
const STATE_FILE = path.resolve("data", "image-generation-state.json");

async function ingestAll() {
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("  Ingesting Generated Images into aapstack.tech photo library");
  console.log("═══════════════════════════════════════════════════════════════════");

  await ensureBucket(supabase);

  const manifest: ImageSpec[] = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8"));
  const specMap = new Map<string, ImageSpec>();
  for (const s of manifest) {
    specMap.set(s.asset_code.toLowerCase().replace(/[^a-z0-9]/g, "_"), s);
    specMap.set(s.asset_code.toLowerCase(), s);
  }

  let state: any = { last_run_at: new Date().toISOString(), total_uploaded: 0, assets: {} };
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch {}
  }

  const files = fs.readdirSync(BRAIN_DIR).filter((f) => f.endsWith(".jpg"));
  console.log(`Found ${files.length} generated images in brain directory.`);

  let uploadedCount = 0;

  for (const file of files) {
    // Extract base name e.g. evt_pol_0001 from evt_pol_0001_1791562020414.jpg
    const baseCode = file.replace(/_\d+\.jpg$/, "").toLowerCase();
    const spec = specMap.get(baseCode);

    if (!spec) {
      console.warn(`No spec found for file: ${file} (base: ${baseCode})`);
      continue;
    }

    const code = spec.asset_code;
    const filePath = path.join(BRAIN_DIR, file);
    const rawBuffer = fs.readFileSync(filePath);

    console.log(`\n[${code}] Processing "${spec.title}" (${file})...`);

    // Validate & Convert
    const formatted = await validateAndFormatImage(rawBuffer, spec.aspect_ratio);

    // Upload to aapstack storage
    const storagePath = `library/ai/${spec.category}/${spec.asset_code}.webp`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, formatted.buffer, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });

    if (upErr) {
      console.error(`  Upload failed: ${upErr.message}`);
      continue;
    }

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

    // Combine all tags for unified matching
    const unifiedTags = [
      ...new Set([
        ...spec.keywords_en.map((t) => t.toLowerCase().trim()),
        ...spec.keywords_te.map((t) => t.toLowerCase().trim()),
        ...spec.person_tags.map((t) => t.toLowerCase().trim()),
        ...spec.location_tags.map((t) => t.toLowerCase().trim()),
        ...spec.topic_tags.map((t) => t.toLowerCase().trim()),
        spec.category.toLowerCase().trim(),
        spec.subcategory.toLowerCase().trim(),
      ]),
    ].filter(Boolean);

    const promptHash = createHash("sha256").update(spec.prompt.toLowerCase().trim()).digest("hex").slice(0, 16);

    const dbPayload = {
      asset_code: spec.asset_code,
      kind: spec.kind,
      label: spec.title,
      title: spec.title,
      category: spec.category,
      subcategory: spec.subcategory,
      description: spec.prompt,
      prompt: spec.prompt,
      negative_prompt: spec.negative_prompt,
      tags: unifiedTags,
      keywords_en: spec.keywords_en,
      keywords_te: spec.keywords_te,
      location_tags: spec.location_tags,
      person_tags: spec.person_tags,
      topic_tags: spec.topic_tags,
      image_style: spec.image_style,
      aspect_ratio: spec.aspect_ratio,
      storage_path: storagePath,
      public_url: publicUrl,
      credit: "VaartaNow AI",
      license: "ai-generated",
      rights_status: "commercial-editorial",
      focus: spec.focus,
      generation_provider: "gemini",
      generation_model: "gemini-3.1-flash-image",
      generation_status: "uploaded",
      is_ai_generated: true,
      editorial_label: "ప్రతీకాత్మక చిత్రం (AI)",
      prompt_hash: promptHash,
      image_hash: formatted.dHash,
      width: formatted.width,
      height: formatted.height,
      active: true,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase.from("image_library").upsert(dbPayload, { onConflict: "asset_code" });
    if (upsertErr) {
      console.error(`  Database upsert failed: ${upsertErr.message}`);
      continue;
    }

    state.assets[code] = {
      status: "uploaded",
      updated_at: new Date().toISOString(),
      model: "gemini-3.1-flash-image",
      public_url: publicUrl,
      image_hash: formatted.dHash,
    };

    uploadedCount++;
    console.log(`  ✓ Successfully uploaded & stored: ${publicUrl}`);
  }

  state.last_run_at = new Date().toISOString();
  state.total_uploaded = Object.values(state.assets).filter((a: any) => a.status === "uploaded").length;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");

  console.log(`\nIngestion complete! ${uploadedCount} images stored and live in photo library.`);
}

ingestAll().catch(console.error);
