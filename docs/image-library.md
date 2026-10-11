# VaartaNow AI Image Library & Photo Management

This guide documents the architecture, database schema, batch generation pipeline, CLI commands, and admin UI for VaartaNow's news image library.

---

## Architecture Overview

VaartaNow uses a hybrid photo library architecture:
1. **Licensed Real Photos:** Official government press-release photos (e.g. AP CMO, Ministers, Dignitaries), verified public domain, or owned photos added via CLI.
2. **AI-Generated News Scenes:** 500+ copyright-safe, realistic editorial news scenes generated via Gemini Image models representing places, infrastructure, civic events, occupations, and generic news scenarios.
3. **Automated Composition Engine (`scripts/lib/news-images.ts`):** Automatically selects the best matching real person photo + AI place/topic scene, composites them into a 16:9 news banner with Telugu headline band and credits, and applies the official symbolic disclaimer `ప్రతీకాత్మక చిత్రం (AI)`.

---

## Database Schema (`project_vaartanow.image_library`)

Applied via `supabase/aapstack/004_image_library_ai_assets.sql`:

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary Key |
| `asset_code` | `text unique` | Unique code (e.g. `PLC-INF-0001`, `EVT-POL-0001`) |
| `kind` | `text` | `person` \| `place` \| `topic` \| `category` |
| `label` | `text` | Display title |
| `tags` | `text[]` | Single matching column (union of all English/Telugu tags) |
| `keywords_en` | `text[]` | English keywords |
| `keywords_te` | `text[]` | Telugu keywords (e.g. `రైతులు`, `విశాఖపట్నం`) |
| `storage_path` | `text` | Path inside `news-images` bucket |
| `public_url` | `text` | CDN public URL |
| `credit` | `text` | Photo credit (`VaartaNow AI` for AI assets) |
| `license` | `text` | `ai-generated` \| `govt-press-release` \| `own` \| `licensed` |
| `is_ai_generated` | `boolean` | `true` for AI scenes, `false` for real photos |
| `editorial_label` | `text` | `ప్రతీకాత్మక చిత్రం (AI)` |
| `generation_status`| `text` | `pending` \| `generated` \| `uploaded` \| `failed` \| `duplicate` |
| `prompt` | `text` | Generation prompt |
| `image_hash` | `text` | 64-bit dHash for near-duplicate detection |

---

## 1. Batch Generation Pipeline

### Generating the Manifest
To regenerate or inspect the 512+ image specifications:
```bash
npm run manifest
```
Specifications are output to `data/image-manifest.json`.

### Running the Batch Worker
```bash
# Dry run simulation (checks manifest, validation, mock storage)
npm run image-gen -- --dry-run --limit=5

# Generate a specific category
npm run image-gen -- --category=places --limit=20

# Run with custom batch size & concurrency
npm run image-gen -- --batch=10 --concurrency=2

# Retry previously failed generations
npm run image-gen -- --retry-failed
```

### Resumability & Duplication Detection
- Before generating, the worker verifies both the database (`image_library`) and `data/image-generation-state.json`. If an asset is already `uploaded`, it is skipped automatically.
- Images undergo 64-bit dHash calculation (Hamming distance $\le 6$). Near-duplicates are marked `duplicate` and skipped to preserve library diversity.

---

## 2. Searching & Managing Photos via CLI

### Searching the Library
Search across English keywords, Telugu keywords, asset codes, and titles:
```bash
# Search for farmers / agriculture
npm run images -- search "farmers"
npm run images -- search "రైతులు"

# Search for places
npm run images -- search "Vizag beach"
npm run images -- search "విశాఖపట్నం బీచ్"
npm run images -- search "Hyderabad metro"

# Search for leaders (finds licensed photos)
npm run images -- search "CBN"
npm run images -- search "Pawan Kalyan"
```

### Adding a Licensed Real Photo
To add an official press release or licensed real person photo:
```bash
npm run images -- add \
  --file=photos/cbn-press-meet.jpg \
  --kind=person \
  --label="N. Chandrababu Naidu" \
  --tags="cbn,chandrababu naidu,chandrababu,cm,chief minister,ఆంధ్రప్రదేశ్ ముఖ్యమంత్రి,చంద్రబాబు" \
  --credit="AP CMO Press Release" \
  --license=govt-press-release \
  --focus=top
```

### Listing & Disabling Assets
```bash
# List assets filtered by tag
npm run images -- list --tag=vizag

# Disable an asset by ID or asset code
npm run images -- disable --id=PLC-INF-0007
```

---

## 3. Reading Generation Reports

Every execution of `npm run image-gen` generates detailed reports in the `reports/` folder:
- **JSON Report:** `reports/image-generation-YYYYMMDD-HHmm.json` (machine-readable run metrics, category breakdown, model ID, and failure diagnostics).
- **Markdown Summary:** `reports/image-generation-YYYYMMDD-HHmm.md` (summary table of uploaded, duplicate, failed, and skipped assets).

---

## 4. Admin UI ("Images" Tab)

Access the Admin Dashboard at `/admin` (Authorized Editors only):
1. Navigate to the **Image Library** tab.
2. Filter by **Kind** (`place`, `topic`, `person`, `category`), **Source** (`AI ప్రతీకాత్మక` vs `Licensed Real`), or **Category**.
3. Search in real-time by Telugu keywords, English terms, or asset codes.
4. Click any card to inspect high-resolution WebP previews, copy CDN URLs, examine generation prompts, and verify tag mappings.
