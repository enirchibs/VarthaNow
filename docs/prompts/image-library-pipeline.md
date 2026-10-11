# VaartaNow — AI news image library: build prompt for Antigravity

> Paste everything below the line into Antigravity, opened on the `D:\websites\VarthaNow` repo.

---

## Role and goal

You are working in the VaartaNow repository (React + Vite front end, TypeScript scripts run with `npx tsx`).
Build a **resumable, batch-based pipeline** that generates **500+ original, reusable news images** with a
Gemini image model, stores them in VaartaNow's existing photo library on **aapstack.tech**, and makes them
searchable by English/Telugu keyword, person, place, occupation and category.

Do **not** create all images in one request. Do **not** scrape or download images from news sites, Google
Images or social media. Never write a fake URL or mark an asset "uploaded" until the file is really stored.

## What already exists — build on it, do not duplicate it

- **Backend:** aapstack.tech (OwnDatabase, Supabase-compatible). Use `@supabase/supabase-js` as usual.
  Project URL: `SUPABASE_URL=https://aapstack.tech/p/e027be62-50a9-4e4d-9341-afc64689762b`.
  Server-side key: `SUPABASE_SERVICE_ROLE_KEY` (must start with `odb_svc_`). Gemini key: `GEMINI_API_KEY`.
  Read all keys from `.env` only. Never hard-code, print or commit keys.
- **Table `project_vaartanow.image_library`** (see `supabase/aapstack/001_image_library.sql`): `kind`
  (`person|place|topic|category`), `label`, `tags text[]` (lowercase match keys), `storage_path`, `public_url`,
  `credit`, `license`, `focus`, `times_used`, `active`. RLS: public can read active rows; only the service role writes.
- **Bucket `news-images`** (public), created by `ensureBucket()` in `scripts/lib/news-images.ts`.
- **`scripts/lib/news-images.ts`** already picks photos by tag overlap and composes the story image
  (two photos side by side + Telugu headline band + credits). **Extend it; do not rewrite it.**
- **`scripts/image-library.ts`** — CLI to add licensed real photos (`npm run images -- add ...`). Keep it working.
- **`scripts/news-shorts.ts`** asks Gemini for `image_keywords {people, places, topics}` per story and calls
  `storyImage()`. The new assets must be found by that same matching.

## Hard rules for content

1. **No AI depictions of real, identifiable people.** Do not generate CBN, Pawan Kalyan, Narendra Modi or any
   real politician, official, actor or athlete. In a news app, an AI image of a real leader can be mistaken for
   a real photo of a real event. Real people come **only** from licensed photos added with `scripts/image-library.ts`
   (for example official CMO/government press-release photos), and `compose()` combines them with AI scenes.
2. Political and civic scenes use **generic, non-identifiable people**: crowds, podium from behind, silhouettes,
   hands raising, officials seen from a distance. No party flags, symbols, colours that identify a party, no
   fake government seals or insignia.
3. No text of any kind inside images: no headlines, letters, numbers, logos, watermarks, signatures, fake newspapers or UI.
4. Real places may be shown as **recognisable but illustrative** (e.g. "RK Beach, Visakhapatnam at sunset").
   Unbuilt or planned infrastructure (e.g. Bhogapuram airport terminal) must be labelled **conceptual** in metadata.
5. Every AI asset gets `is_ai_generated = true` and `editorial_label = 'ప్రతీకాత్మక చిత్రం (AI)'`.
   When `compose()` uses any AI asset, it must print that label small in a corner of the final image.
6. Before generating, confirm in Google AI Studio that the chosen model's current terms allow commercial use
   of generated images, and record the exact model id and generation date on every asset.

## Model adapter

- Model id comes from `GEMINI_IMAGE_MODEL` in `.env` (e.g. the current Gemini Flash image model listed in AI Studio).
  If unset, call `GET https://generativelanguage.googleapis.com/v1beta/models` and pick an image-capable
  `generateContent` model (name contains `image`, prefer non-preview "flash"). Log which model was used.
- Call `models/{model}:generateContent` with `generationConfig.responseModalities: ["IMAGE"]` and, if the model
  supports it, an aspect-ratio setting of 16:9. Read the image from `candidates[0].content.parts[].inlineData`.
- Put the provider call behind an interface (`generate(prompt, aspectRatio) → Buffer`) so another provider can be added later.

## 1. Database migration — `supabase/aapstack/004_image_library_ai_assets.sql`

Extend `image_library` (do not create a second table). Add, all nullable unless stated:
`asset_code text unique`, `title`, `category`, `subcategory`, `description`, `prompt`, `negative_prompt`,
`keywords_en text[] default '{}'`, `keywords_te text[] default '{}'`, `location_tags text[] default '{}'`,
`person_tags text[] default '{}'`, `topic_tags text[] default '{}'`, `image_style`, `aspect_ratio`,
`generation_provider`, `generation_model`, `generation_status text default 'uploaded'`
(`pending|generated|uploaded|failed|duplicate`), `is_ai_generated boolean not null default false`,
`editorial_label`, `rights_status`, `prompt_hash text`, `image_hash text`, `width int`, `height int`,
`updated_at timestamptz default now()`. Add GIN indexes on `tags`, `keywords_te`, `keywords_en`.
Keep `tags` as the **single matching column**: it must contain every lowercase English keyword, Telugu keyword,
person, place and topic tag of the asset, so the existing picker finds it.
The file is applied by the project owner in the aapstack.tech dashboard SQL editor — write it so it is safe to
run twice (`add column if not exists`, `create index if not exists`).

## 2. Manifest — `data/image-manifest.json`

Generate **at least 500 unique specifications** (write them with a script, not by hand), plus one 1:1 tile per
news category (`andhra-pradesh, telangana, vizag, national, politics, cinema, cricket, business, technology,
health, jobs, devotional`). Each spec:

```json
{
  "asset_code": "PLC-VZG-0007",
  "kind": "place",
  "category": "places", "subcategory": "visakhapatnam-beach",
  "title": "RK Beach at sunrise with walkers",
  "prompt": "…full prompt…",
  "negative_prompt": "text, letters, logo, watermark, identifiable real person, party flag",
  "keywords_en": ["vizag", "visakhapatnam", "beach", "rk beach"],
  "keywords_te": ["విశాఖపట్నం", "బీచ్", "ఆర్కే బీచ్"],
  "location_tags": ["visakhapatnam", "andhra pradesh"],
  "person_tags": [], "topic_tags": ["tourism", "weather"],
  "intended_topics": ["vizag", "tourism"],
  "image_style": "realistic editorial photograph style",
  "aspect_ratio": "16:9", "focus": "center",
  "conceptual": false
}
```

Distribution (100 each):
1. **Political & civic events, no real people** — assembly hall, press conference podium (from behind),
   rally crowds, voting queue, ballot box, government office, protest (peaceful), welfare scheme distribution,
   minister's convoy (no faces), collectorate, panchayat meeting.
2. **People, professions & community life** — farmers, fishermen, weavers, auto drivers, teachers, students,
   doctors/nurses, police, IT employees, street vendors, women self-help groups, elders, festivals (Sankranti,
   Bathukamma, Ugadi). Generic, non-identifiable individuals.
3. **Places & infrastructure (AP/TS)** — Visakhapatnam (RK Beach, Kailasagiri, Rushikonda, Simhachalam, Araku,
   fishing harbour, port, steel plant area, railway station, airport), Bhogapuram (airport construction —
   conceptual), Hyderabad (HITEC City, Charminar, metro, ORR, offices), Vijayawada, Amaravati, Rajahmundry,
   Tirupati, Srikakulam, Kakinada, Warangal, Karimnagar. Vary time of day, season, weather, angle.
4. **Combination scenes, no real leaders** — e.g. farmers + paddy fields + irrigation canal; fishermen + coastal
   village + boats; students + laptops + classroom; police + school children + road-safety awareness; women
   entrepreneurs + local market; citizens + metro station; passengers + airport terminal; workers + construction site.
5. **General news topics & backgrounds** — weather (rain, cyclone, heatwave), budget/economy, gold, fuel prices,
   cricket stadium, cinema shoot, health/hospital, education results, jobs/recruitment, technology, crime scene tape
   (no gore), road accident aftermath (no injured people), courts (exterior), elections, devotional/temples.

Prompt template (fill per spec, keep variety in angle, light, season, action and background):
`"{title}. {scene details}. {location details}. Editorial news photograph style, natural light, 16:9 landscape,
main subject centred with calm space in the lower third for a headline. Generic people only, faces not
identifiable. No text, letters, numbers, logos, watermarks, flags or insignia."`

Deduplicate before generating: normalise prompts (lowercase, collapse spaces) and drop exact duplicates;
also drop specs whose `keywords_en + subcategory` repeat more than 4 times.

## 3. Batch worker — `scripts/generate-image-library.ts` (`npm run image-gen`)

- Options: `--category=…`, `--limit=N`, `--batch=10`, `--concurrency=2`, `--dry-run`, `--retry-failed`.
- **Resumable:** before generating an asset, skip it if `image_library` already has that `asset_code` with
  `generation_status = 'uploaded'`. Keep progress in `data/image-generation-state.json` too.
- For each spec: generate → validate → convert with `sharp` to WebP (16:9 → 1536×864, 1:1 → 1024×1024,
  quality ~82) → upload to `news-images/library/ai/{category}/{asset_code}.webp` with `upsert: true` →
  upsert the `image_library` row (`kind`, `label=title`, `tags` = union of all keyword/tag arrays lowercased,
  `credit = 'VaartaNow AI'`, `license = 'ai-generated'`, `rights_status`, `generation_*`, `width/height`,
  `public_url` from `getPublicUrl`). Only then set `generation_status = 'uploaded'`.
- **Validation:** WebP decodes, dimensions correct, file > 20 KB, not a near-blank image (pixel std-dev check).
- **Near-duplicate check:** compute a 64-bit difference hash (dHash, 9×8 greyscale via sharp) and store it in
  `image_hash`; if Hamming distance ≤ 6 to an existing asset, mark `duplicate` and do not upload.
- **Retries:** exponential backoff on 429/5xx (2s, 4s, 8s … max 5 tries); a refused/blocked prompt is marked
  `failed` with the reason and never retried automatically. Never regenerate an asset that is already `uploaded`.
- **Report:** write `reports/image-generation-YYYYMMDD-HHmm.json` and a short `.md` summary:
  totals by category for uploaded / failed (with reasons) / pending / duplicate, model used, run time.

## 4. Use the assets in news images

In `scripts/lib/news-images.ts`:
- Matching keeps using `tags` overlap. Also accept Telugu keywords (Gemini may return them) — `tags` already contains them.
- Prefer, in order: licensed real `person` photo + AI/real place or topic scene; else two AI scenes (place + topic);
  else one scene; else the category tile.
- If any chosen asset has `is_ai_generated = true`, draw the label `ప్రతీకాత్మక చిత్రం (AI)` small at the top-right.
- Credits line lists real-photo credits plus `VaartaNow AI` when AI assets are used.

## 5. Search & selection interface

- Script: `npm run images -- search "CBN farmers"` → ranked results from `image_library`
  (`tags`, `keywords_te`, `asset_code`, `label`), showing kind, label, asset_code, tags and URL.
- Admin UI: a new **Images** tab in `src/pages/AdminPage.tsx` with a search box (English/Telugu/asset code),
  filters (kind, category, AI vs licensed), thumbnail grid, and per-asset details. Read-only from the browser
  (it uses the public key; RLS only exposes active rows). Show only rows with `generation_status = 'uploaded'`.
- Example searches that must work: `CBN farmers`, `చంద్రబాబు రైతులు` (finds the licensed CBN photo + farmer scenes),
  `Pawan Kalyan` (licensed photos only), `Vizag beach`, `విశాఖపట్నం బీచ్`, `Hyderabad metro`, `farmers`,
  `students`, `police`, `airport`.

## 6. Deliverables checklist

1. `data/image-manifest.json` with ≥ 500 unique specs + 12 category tiles, and the script that generates it.
2. `supabase/aapstack/004_image_library_ai_assets.sql`.
3. `scripts/generate-image-library.ts` (batch worker, provider adapter, retries, resumable state).
4. `npm run image-gen` and `npm run images -- search …` entries in `package.json`.
5. Changes to `scripts/lib/news-images.ts` (AI label, matching order).
6. Admin **Images** tab.
7. `docs/image-library.md`: how to add categories, add licensed real photos, re-run failed assets, read reports.
8. Run `npx tsc --noEmit`, then `npm run image-gen -- --dry-run --limit=5`, then a real run of `--limit=10`,
   and show the report before generating the rest.

## Order of work

Migration → manifest generator (review 20 sample specs with the user) → worker with `--dry-run` → 10 real images
(show them to the user) → remaining batches → picker changes → admin tab → docs.
