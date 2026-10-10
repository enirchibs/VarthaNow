import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "node:crypto";
import { BUCKET, ensureBucket } from "./lib/news-images";
import type { ImageSpec } from "./generate-manifest";

// ═══════════════════════════════════════════════════════════════════
//  VaartaNow — AI News Image Library Batch Generator
//
//  Options:
//    --category=<category>     Filter specs by category (e.g. politics, places, people, scenes, general)
//    --limit=<N>               Process at most N specs
//    --batch=<size>            Batch size (default: 10)
//    --concurrency=<N>         Concurrent operations (default: 2)
//    --dry-run                 Simulate generation & checks without API calls / uploads
//    --retry-failed            Attempt re-generating specs previously marked as 'failed'
// ═══════════════════════════════════════════════════════════════════

// Load .env
for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) {
    process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
  }
}

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

const categoryFilter = arg("category");
const limitArg = arg("limit") ? parseInt(arg("limit")!, 10) : undefined;
const batchSize = parseInt(arg("batch") || "10", 10);
const concurrency = parseInt(arg("concurrency") || "2", 10);
const delaySec = parseInt(arg("delay") || "0", 10);
const isDryRun = hasFlag("dry-run");
const retryFailed = hasFlag("retry-failed");

const STATE_FILE = path.resolve("data", "image-generation-state.json");
const MANIFEST_FILE = path.resolve("data", "image-manifest.json");
const REPORTS_DIR = path.resolve("reports");

interface GenerationState {
  last_run_at: string;
  total_uploaded: number;
  assets: Record<
    string,
    {
      status: "pending" | "generated" | "uploaded" | "failed" | "duplicate";
      updated_at: string;
      reason?: string;
      model?: string;
      public_url?: string;
      image_hash?: string;
    }
  >;
}

// ── Provider Interface ─────────────────────────────────────────────
export interface ImageGeneratorProvider {
  name: string;
  model: string;
  generate(prompt: string, aspectRatio: "16:9" | "1:1"): Promise<Buffer>;
}

export class GeminiImageProvider implements ImageGeneratorProvider {
  name = "gemini";
  model: string;
  private apiKey: string;

  constructor(apiKey: string, preferredModel?: string) {
    this.apiKey = apiKey;
    this.model = preferredModel || "imagen-3.0-generate-002";
  }

  static async create(apiKey: string, customModel?: string): Promise<GeminiImageProvider> {
    if (customModel) {
      console.log(`[Model Adapter] Using configured Gemini model: ${customModel}`);
      return new GeminiImageProvider(apiKey, customModel);
    }

    try {
      console.log("[Model Adapter] Querying Gemini models API for image generation model...");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = (await res.json()) as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
        const models = data.models || [];
        const imageModel =
          models.find((m) => m.name.includes("imagen-3") || (m.name.includes("image") && !m.name.includes("preview"))) ||
          models.find((m) => m.name.includes("imagen") || m.name.includes("image")) ||
          models.find((m) => m.name.includes("flash") && m.supportedGenerationMethods?.includes("generateContent"));

        if (imageModel) {
          const resolvedName = imageModel.name.replace(/^models\//, "");
          console.log(`[Model Adapter] Auto-discovered image model: ${resolvedName}`);
          return new GeminiImageProvider(apiKey, resolvedName);
        }
      }
    } catch (e: any) {
      console.warn(`[Model Adapter] Model discovery query failed: ${e.message}. Using default.`);
    }

    return new GeminiImageProvider(apiKey, "imagen-3.0-generate-002");
  }

  async generate(prompt: string, aspectRatio: "16:9" | "1:1"): Promise<Buffer> {
    const isImagen = this.model.includes("imagen");
    const aspect = aspectRatio === "1:1" ? "1:1" : "16:9";

    const contentEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const predictEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:predict?key=${this.apiKey}`;

    if (isImagen) {
      const res = await fetch(predictEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspect,
            personGeneration: "allow_adult",
          },
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        const base64Data = json.predictions?.[0]?.bytesBase64Encoded;
        if (base64Data) {
          return Buffer.from(base64Data, "base64");
        }
        throw new Error("No predictions returned from Imagen model");
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`Imagen predict HTTP ${res.status}: ${JSON.stringify(errJson)}`);
      }
    } else {
      const res = await fetch(contentEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        const base64Data = json.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data)?.inlineData?.data;
        if (base64Data) {
          return Buffer.from(base64Data, "base64");
        }
        throw new Error("No inline image data returned from generateContent");
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`generateContent HTTP ${res.status}: ${JSON.stringify(errJson)}`);
      }
    }
  }
}

// ── Image Processing & Validation ──────────────────────────────────
export async function computeDHash(imageBuffer: Buffer): Promise<string> {
  // 9x8 greyscale dHash (64-bit difference hash)
  const { data } = await sharp(imageBuffer)
    .resize(9, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let hash = 0n;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = data[row * 9 + col];
      const right = data[row * 9 + col + 1];
      hash = (hash << 1n) | (left > right ? 1n : 0n);
    }
  }
  return hash.toString(16).padStart(16, "0");
}

export function hammingDistance(hash1: string, hash2: string): number {
  let v1 = BigInt(`0x${hash1}`);
  let v2 = BigInt(`0x${hash2}`);
  let xor = v1 ^ v2;
  let dist = 0;
  while (xor > 0n) {
    dist += Number(xor & 1n);
    xor >>= 1n;
  }
  return dist;
}

export async function validateAndFormatImage(
  rawBuffer: Buffer,
  aspectRatio: "16:9" | "1:1"
): Promise<{ buffer: Buffer; width: number; height: number; dHash: string }> {
  const targetW = aspectRatio === "1:1" ? 1024 : 1536;
  const targetH = aspectRatio === "1:1" ? 1024 : 864;

  const webpBuffer = await sharp(rawBuffer)
    .resize(targetW, targetH, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();

  // Validate size > 20 KB
  if (webpBuffer.length < 20 * 1024) {
    throw new Error(`Generated image file size too small (${(webpBuffer.length / 1024).toFixed(1)} KB < 20 KB)`);
  }

  // Validate pixel variance (not near blank / solid color)
  const stats = await sharp(webpBuffer).stats();
  const avgStdev = (stats.channels[0].stdev + stats.channels[1].stdev + stats.channels[2].stdev) / 3;
  if (avgStdev < 5.0) {
    throw new Error(`Image appears blank or solid color (pixel std dev: ${avgStdev.toFixed(2)} < 5.0)`);
  }

  const dHash = await computeDHash(webpBuffer);

  return {
    buffer: webpBuffer,
    width: targetW,
    height: targetH,
    dHash,
  };
}

// ── State Management ───────────────────────────────────────────────
function loadState(): GenerationState {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch {
      // ignore
    }
  }
  return {
    last_run_at: new Date().toISOString(),
    total_uploaded: 0,
    assets: {},
  };
}

function saveState(state: GenerationState) {
  state.last_run_at = new Date().toISOString();
  state.total_uploaded = Object.values(state.assets).filter((a) => a.status === "uploaded").length;
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

// ── Main Pipeline ──────────────────────────────────────────────────
export async function runBatchGeneration() {
  const startTime = Date.now();
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("  VaartaNow AI News Image Pipeline — Batch Generation");
  console.log("═══════════════════════════════════════════════════════════════════");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env");
  }
  if (!isDryRun && !geminiKey) {
    throw new Error("GEMINI_API_KEY or VITE_GEMINI_API_KEY is required in .env for real generation runs");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  // 1. Ensure storage bucket exists
  if (!isDryRun) {
    console.log(`[Storage] Verifying bucket '${BUCKET}' on aapstack.tech...`);
    await ensureBucket(supabase);
  }

  // 2. Load Manifest
  if (!fs.existsSync(MANIFEST_FILE)) {
    throw new Error(`Manifest file not found at ${MANIFEST_FILE}. Run 'npx tsx scripts/generate-manifest.ts' first.`);
  }
  const allSpecs: ImageSpec[] = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8"));
  console.log(`[Manifest] Loaded ${allSpecs.length} total image specifications.`);

  // 3. Filter specs
  let selectedSpecs = allSpecs;
  if (categoryFilter) {
    selectedSpecs = selectedSpecs.filter(
      (s) => s.category.toLowerCase() === categoryFilter.toLowerCase() || s.subcategory.toLowerCase() === categoryFilter.toLowerCase()
    );
    console.log(`[Filter] Filtered to ${selectedSpecs.length} specs matching category '${categoryFilter}'.`);
  }


  // 4. Load State & Database existing assets
  const state = loadState();
  console.log(`[State] Loaded state tracking ${Object.keys(state.assets).length} assets.`);

  // Fetch already uploaded asset codes from DB to ensure idempotency & resumability
  console.log("[Database] Checking existing uploaded assets in image_library...");
  const { data: dbRows, error: dbErr } = await supabase
    .from("image_library")
    .select("asset_code, generation_status, image_hash")
    .eq("active", true);

  if (dbErr && !/does not exist|column/i.test(dbErr.message)) {
    console.warn(`[Database Warning] Could not fetch existing records: ${dbErr.message}`);
  }

  const uploadedCodes = new Set<string>();
  const knownHashes = new Map<string, string>(); // hash -> asset_code

  for (const row of dbRows || []) {
    if (row.asset_code) {
      if (row.generation_status === "uploaded") {
        uploadedCodes.add(row.asset_code);
      }
      if (row.image_hash) {
        knownHashes.set(row.image_hash, row.asset_code);
      }
    }
  }

  // Also index hashes from state file
  for (const [code, info] of Object.entries(state.assets)) {
    if (info.status === "uploaded") {
      uploadedCodes.add(code);
    }
    if (info.image_hash) {
      knownHashes.set(info.image_hash, code);
    }
  }

  console.log(`[Resumability] Found ${uploadedCodes.size} already uploaded asset(s).`);

  // Filter out already uploaded specs
  let pendingSpecs = selectedSpecs.filter((spec) => {
    if (uploadedCodes.has(spec.asset_code)) return false;
    const s = state.assets[spec.asset_code];
    if (s?.status === "failed" && !retryFailed) return false;
    if (s?.status === "duplicate") return false;
    return true;
  });

  if (limitArg && limitArg > 0) {
    pendingSpecs = pendingSpecs.slice(0, limitArg);
    console.log(`[Limit] Constrained to ${pendingSpecs.length} pending specs to process in this run.`);
  }

  console.log(`[Execution] ${pendingSpecs.length} spec(s) queued for processing in this run.`);

  if (pendingSpecs.length === 0) {
    console.log("All selected specifications are already generated and uploaded! Nothing to do.");
    return;
  }

  // 5. Initialize Model Provider
  let provider: ImageGeneratorProvider;
  if (isDryRun) {
    provider = {
      name: "dry-run-mock",
      model: "dry-run-simulator",
      async generate(_p, _ar) {
        // Return dummy image with variance for dry-run simulation
        return sharp({
          create: {
            width: _ar === "1:1" ? 1024 : 1536,
            height: _ar === "1:1" ? 1024 : 864,
            channels: 3,
            noise: { type: "gaussian", mean: 128, sigma: 35 },
          },
        })
          .png()
          .toBuffer();
      },
    };
  } else {
    provider = await GeminiImageProvider.create(geminiKey!, process.env.GEMINI_IMAGE_MODEL);
  }

  // 6. Process in batches with concurrency
  const results = {
    uploaded: 0,
    failed: 0,
    duplicate: 0,
    skipped: selectedSpecs.length - pendingSpecs.length,
    failures: [] as Array<{ code: string; reason: string }>,
  };

  for (let i = 0; i < pendingSpecs.length; i += batchSize) {
    const batch = pendingSpecs.slice(i, i + batchSize);
    console.log(`\n─── Processing Batch ${Math.floor(i / batchSize) + 1} (${batch.length} items) ───`);

    // Worker queue with concurrency limit
    const queue = [...batch];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const spec = queue.shift()!;
        await processSingleSpec(spec, provider, supabase, state, knownHashes, results);
        if (delaySec > 0 && queue.length > 0) {
          console.log(`[Rate Limiting] Waiting ${delaySec}s before next image request...`);
          await new Promise((r) => setTimeout(r, delaySec * 1000));
        }
      }
    });

    await Promise.all(workers);
    saveState(state);
  }

  // 7. Write Report
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 12); // YYYYMMDDHHmm
  const reportJsonFile = path.join(REPORTS_DIR, `image-generation-${dateStr}.json`);
  const reportMdFile = path.join(REPORTS_DIR, `image-generation-${dateStr}.md`);

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const reportData = {
    run_timestamp: now.toISOString(),
    duration_seconds: durationSec,
    dry_run: isDryRun,
    model_provider: provider.name,
    model_id: provider.model,
    totals: {
      selected: selectedSpecs.length,
      processed: pendingSpecs.length,
      uploaded: results.uploaded,
      failed: results.failed,
      duplicate: results.duplicate,
      skipped: results.skipped,
    },
    failures: results.failures,
  };

  fs.writeFileSync(reportJsonFile, JSON.stringify(reportData, null, 2), "utf8");

  const mdSummary = `# VaartaNow Image Library Generation Report
**Date:** ${now.toLocaleString()}  
**Model Used:** \`${provider.model}\` (${provider.name})  
**Run Time:** ${durationSec}s  
**Dry Run:** ${isDryRun ? "Yes" : "No"}

## Summary
- **Total Selected:** ${selectedSpecs.length}
- **Successfully Uploaded:** ${results.uploaded}
- **Duplicates Detected:** ${results.duplicate}
- **Failed:** ${results.failed}
- **Already Uploaded / Skipped:** ${results.skipped}

${results.failures.length > 0 ? `## Failures\n` + results.failures.map((f) => `- **${f.code}**: ${f.reason}`).join("\n") : "✅ No generation failures."}
`;
  fs.writeFileSync(reportMdFile, mdSummary, "utf8");

  console.log("\n═══════════════════════════════════════════════════════════════════");
  console.log(`  Generation Batch Complete in ${durationSec}s`);
  console.log(`  Uploaded: ${results.uploaded} | Duplicate: ${results.duplicate} | Failed: ${results.failed} | Skipped: ${results.skipped}`);
  console.log(`  Report: ${reportMdFile}`);
  console.log("═══════════════════════════════════════════════════════════════════\n");
}

async function processSingleSpec(
  spec: ImageSpec,
  provider: ImageGeneratorProvider,
  supabase: SupabaseClient,
  state: GenerationState,
  knownHashes: Map<string, string>,
  results: {
    uploaded: number;
    failed: number;
    duplicate: number;
    skipped: number;
    failures: Array<{ code: string; reason: string }>;
  }
) {
  const code = spec.asset_code;
  const prompt = spec.prompt;
  const promptHash = createHash("sha256").update(prompt.toLowerCase().trim()).digest("hex").slice(0, 16);

  console.log(`[${code}] Generating: "${spec.title}" (${spec.category}/${spec.subcategory})...`);

  // Retry backoff logic
  let rawBuffer: Buffer | null = null;
  let attempts = 0;
  const maxAttempts = isDryRun ? 1 : 5;
  let backoffMs = 2000;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      rawBuffer = await provider.generate(prompt, spec.aspect_ratio);
      break;
    } catch (err: any) {
      const errMsg = err.message || "";
      const isRateLimitOrServer = /429|500|503|resource exhausted|overloaded|timeout/i.test(errMsg);
      const isRefusedOrBlocked = /safety|blocked|refused|prohibited|invalid argument/i.test(errMsg);

      if (isRefusedOrBlocked) {
        console.error(`  [${code}] Prompt blocked by provider safety filters: ${errMsg}`);
        state.assets[code] = {
          status: "failed",
          updated_at: new Date().toISOString(),
          reason: `Safety block: ${errMsg.slice(0, 120)}`,
        };
        results.failed++;
        results.failures.push({ code, reason: `Safety block: ${errMsg.slice(0, 120)}` });
        return;
      }

      if (isRateLimitOrServer && attempts < maxAttempts) {
        console.warn(`  [${code}] Attempt ${attempts} hit rate limit / server error (${errMsg.slice(0, 60)}). Backing off for ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
        backoffMs *= 2;
      } else {
        console.error(`  [${code}] Generation failed after ${attempts} attempts: ${errMsg}`);
        state.assets[code] = {
          status: "failed",
          updated_at: new Date().toISOString(),
          reason: errMsg.slice(0, 150),
        };
        results.failed++;
        results.failures.push({ code, reason: errMsg.slice(0, 150) });
        return;
      }
    }
  }

  if (!rawBuffer) {
    state.assets[code] = {
      status: "failed",
      updated_at: new Date().toISOString(),
      reason: "No buffer received",
    };
    results.failed++;
    return;
  }

  // Validate & Format
  let formatted: { buffer: Buffer; width: number; height: number; dHash: string };
  try {
    formatted = await validateAndFormatImage(rawBuffer, spec.aspect_ratio);
  } catch (valErr: any) {
    console.error(`  [${code}] Validation failed: ${valErr.message}`);
    state.assets[code] = {
      status: "failed",
      updated_at: new Date().toISOString(),
      reason: `Validation error: ${valErr.message}`,
    };
    results.failed++;
    results.failures.push({ code, reason: `Validation error: ${valErr.message}` });
    return;
  }

  // Near-duplicate check against known dHashes
  for (const [existingHash, existingCode] of knownHashes.entries()) {
    if (existingCode !== code) {
      const dist = hammingDistance(formatted.dHash, existingHash);
      if (dist <= 6) {
        console.warn(`  [${code}] Marked as DUPLICATE of ${existingCode} (dHash Hamming distance ${dist} <= 6). Skipping upload.`);
        state.assets[code] = {
          status: "duplicate",
          updated_at: new Date().toISOString(),
          reason: `Near-duplicate of ${existingCode} (dist=${dist})`,
          image_hash: formatted.dHash,
        };
        results.duplicate++;
        return;
      }
    }
  }

  // Upload to aapstack storage
  const storagePath = `library/ai/${spec.category}/${spec.asset_code}.webp`;
  let publicUrl = "";

  if (isDryRun) {
    publicUrl = `https://mock.aapstack.tech/storage/v1/object/public/${BUCKET}/${storagePath}`;
  } else {
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, formatted.buffer, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });

    if (upErr) {
      console.error(`  [${code}] Storage upload failed: ${upErr.message}`);
      state.assets[code] = {
        status: "failed",
        updated_at: new Date().toISOString(),
        reason: `Upload error: ${upErr.message}`,
      };
      results.failed++;
      results.failures.push({ code, reason: `Upload error: ${upErr.message}` });
      return;
    }

    publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  }

  // Combine all tags for unified matching: union of English keywords, Telugu keywords, person, location, topic tags
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
    generation_provider: provider.name,
    generation_model: provider.model,
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

  if (!isDryRun) {
    const { error: upsertErr } = await supabase.from("image_library").upsert(dbPayload, { onConflict: "asset_code" });
    if (upsertErr) {
      console.error(`  [${code}] DB upsert failed: ${upsertErr.message}`);
      state.assets[code] = {
        status: "failed",
        updated_at: new Date().toISOString(),
        reason: `DB error: ${upsertErr.message}`,
      };
      results.failed++;
      results.failures.push({ code, reason: `DB error: ${upsertErr.message}` });
      return;
    }
  }

  // Update in-memory hash cache and state
  knownHashes.set(formatted.dHash, code);
  state.assets[code] = {
    status: "uploaded",
    updated_at: new Date().toISOString(),
    model: provider.model,
    public_url: publicUrl,
    image_hash: formatted.dHash,
  };

  results.uploaded++;
  console.log(`  ✓ [${code}] Stored & tagged -> ${publicUrl}`);
}

if (process.argv[1]?.endsWith("generate-image-library.ts")) {
  runBatchGeneration().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
