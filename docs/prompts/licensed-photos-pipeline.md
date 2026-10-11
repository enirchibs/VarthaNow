# VaartaNow — licensed real photos of public figures: build prompt for Antigravity

> Paste everything below the line into Antigravity, opened on the `D:\websites\VarthaNow` repo.
> Run this **after** the AI image library work (`docs/prompts/image-library-pipeline.md`), which added
> `supabase/aapstack/004_image_library_ai_assets.sql`, `data/image-manifest.json` and `npm run images -- search`.

---

## Role and goal

You are working in the VaartaNow repository (React + Vite, TypeScript scripts run with `npx tsx`). Build a
pipeline that collects **legitimately licensed real photographs** of public figures (Narendra Modi,
N. Chandrababu Naidu, Pawan Kalyan, Revanth Reddy, YS Jagan Mohan Reddy, ministers, MPs, MLAs, officials)
and official event photos, records **full provenance and attribution** for each, puts them through **human
review**, and makes approved photos available to the story-image picker as `kind = 'person'` assets in the
existing `image_library` table on aapstack.tech.

Never take images from Google Images, news sites, or social media posts without a licence. Never crawl or bulk-scrape
government or party websites: those sources are imported only from URLs or files a person supplies.

## What already exists — build on it

- aapstack.tech backend (Supabase-compatible): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (`odb_svc_…`) in `.env`.
- `project_vaartanow.image_library` (001 + 004 migrations): `kind`, `label`, `tags[]`, `person_tags[]`,
  `keywords_en[]`, `keywords_te[]`, `credit`, `license`, `focus`, `public_url`, `storage_path`, `is_ai_generated`,
  `generation_status`, `active`, … RLS: public reads active rows; service role writes.
- Helper functions `is_admin()` and `phone10()` in schema `project_vaartanow` (migration 003).
- Bucket `news-images`; `scripts/lib/news-images.ts` (picker + `compose()`); `scripts/image-library.ts`
  (`add | list | disable | search`). Extend these; do not duplicate them.
- `GEMINI_API_KEY` and `GEMINI_MODEL` in `.env`. Use the exact Gemini Flash model id shown in Google AI Studio
  (for example the current "Gemini 3.x Flash"); never hard-code a guessed id.

## Rules

1. **Accepted licences only** (store the exact licence name and URL):
   - Public domain, CC0, CC BY (2.0/2.5/3.0/4.0) — usable alone and inside composed images.
   - CC BY-SA (any version) — usable **alone only**. A composed image that includes it is an adaptation and must
     itself be CC BY-SA. Set `share_alike = true`; the picker must not composite these unless
     `ALLOW_SHARE_ALIKE_COMPOSITES=true` is set.
   - Government press material (PIB, AP/Telangana I&PR, Lok Sabha/Rajya Sabha/Assembly portraits) and official
     party media releases — only after a person records the source page and confirms reuse terms in `terms_note`.
   - **Reject:** NC (non-commercial), ND (no derivatives), "fair use", "all rights reserved", unknown or missing licence.
2. **Attribution is mandatory and exact:** store `author`, `source_name`, `source_url`, `license_name`,
   `license_url` and a ready-made `attribution_text`, e.g.
   `Photo: Ministry of External Affairs via Flickr / CC BY 2.0` or
   `Photo: Jane Doe via Wikimedia Commons / CC BY-SA 4.0` or `Photo: PIB` or `Photo: I&PR Andhra Pradesh`.
3. **Identity comes from the source caption/metadata**, never from face recognition. Do not use AI to identify
   who is in a photo. Gemini may only help with tagging (rule 6).
4. **Human review before use:** every imported photo starts `review_status = 'pending'`. Only `approved` photos
   are used by the picker or shown publicly.
5. **Neutral and fair:** prefer neutral portraits or official-event photos; never pick unflattering or mocking
   shots; keep designations current (e.g. "Chief Minister of Andhra Pradesh"); aim for comparable coverage
   across parties. Party-supplied photos are promotional: use them for identification only.
6. **No endorsement or false context:** a photo must never imply a person endorses a product or attended an event
   they did not attend. Composed images always carry the attribution credits.
7. **Takedown:** if a rights holder objects, `npm run images -- disable --id=…` with a recorded reason; the
   picker stops using it immediately.

## 1. Migration — `supabase/aapstack/005_licensed_photo_provenance.sql`

Safe to run twice; applied by the project owner in the aapstack.tech dashboard SQL editor. Add to `image_library`:
`person_name text`, `designation text`, `party text`, `photo_date date`, `event_caption text`,
`source_name text`, `source_url text`, `author text`, `license_name text`, `license_url text`,
`attribution_text text`, `share_alike boolean not null default false`, `terms_note text`,
`retrieved_at timestamptz`, `review_status text not null default 'approved'`
(`pending|approved|rejected`; existing rows stay approved), `reviewed_by text`, `reviewed_at timestamptz`,
`takedown_reason text`, `original_sha256 text unique`.

Update the public read policy so only `active and review_status = 'approved'` rows are visible to anon users.
Add `create policy "Admins review images" on image_library for update to authenticated using (is_admin()) with check (is_admin());`
so a signed-in admin can approve/reject from the admin UI. Inserts stay service-role only.

## 2. Source adapters — `scripts/photo-sources/`

Common output for every adapter: a candidate `{ person_name, designation, party, original_url, source_url,
source_name, author, license_name, license_url, share_alike, photo_date, event_caption }`.

1. **`wikimedia.ts` (automatic).** MediaWiki API on `commons.wikimedia.org`: search the File namespace by person
   name; for each result request `prop=imageinfo&iiprop=url|extmetadata|size|sha1&iiurlwidth=1600`. Read
   `LicenseShortName`, `LicenseUrl`, `Artist` (strip HTML), `Credit`, `ImageDescription`, `DateTimeOriginal`.
   Keep only accepted licences (rule 1). Skip images below 800 px wide. Send a descriptive `User-Agent` with a
   contact email (Wikimedia policy), at most 1 request per second.
2. **`flickr.ts` (automatic, optional).** Needs `FLICKR_API_KEY`. `flickr.photos.search` with
   `license=4,5,7,8,9,10` (CC BY, CC BY-SA, no known restrictions, US Gov, PDM, CC0) and an **allowlist of
   official account IDs** in `scripts/config/flickr-accounts.json` (government/summit accounts the user confirms).
   Use `flickr.photos.getInfo` for owner name and licence; build the attribution from them.
3. **`manual.ts` (PIB, AP/TS I&PR, Parliament/Assembly portraits, party media cells).** No crawling. Import from:
   - `imports/<source>/<file>.jpg` + `<file>.json` sidecar written by a person:
     `{ "person_name", "designation", "party", "source_name": "PIB", "source_url": "<page the photo came from>",
        "photo_date", "event_caption", "terms_note": "<where the reuse terms were checked>", "received_via": "website|whatsapp|telegram|email" }`
   - or a single URL the user passes (`npm run photos -- import-url --url=… --source=PIB …`): fetch that one page and
     its main image only.
   Credit format: `Photo: PIB`, `Photo: I&PR Andhra Pradesh`, `Photo: I&PR Telangana`, `Photo: Lok Sabha`,
   `Photo: TDP Media Cell`, `Photo: Jana Sena Media Wing`, etc.

## 3. Importer — `scripts/import-licensed-photos.ts` (`npm run photos`)

Commands: `fetch --person="N. Chandrababu Naidu" --source=wikimedia|flickr --limit=10`, `import-folder --dir=imports/pib`,
`import-url …`, `report`.
For each candidate:
1. Download the original; compute SHA-256; skip if `original_sha256` already exists.
2. Validate: decodes, ≥ 800 px wide, not mostly blank, no large watermark/text overlay (Gemini check, step 4).
3. Convert with `sharp` (auto-rotate, ≤ 1600 px long edge, WebP q≈82); keep EXIF out of the stored file.
4. **Gemini (tagging only)** with the image + source caption, return JSON:
   `{ "keywords_en": [...], "keywords_te": [...], "focus": "left|center|right|top", "faces_visible": n,
      "has_text_or_watermark": bool, "suitable_for_news_thumbnail": bool, "reason": "..." }`.
   Telugu names must be correct (e.g. చంద్రబాబు నాయుడు, పవన్ కళ్యాణ్, నరేంద్ర మోదీ, రేవంత్ రెడ్డి). Gemini must
   not be asked who the person is; `person_name` comes from the source.
5. Upload to `news-images/library/person/<slug(person_name)>-<sha8>.webp`.
6. Insert into `image_library`: `kind='person'`, `label=person_name`, `tags` = lowercase union of name variants
   (e.g. `cbn, chandrababu naidu, chandrababu, naidu, చంద్రబాబు, చంద్రబాబు నాయుడు`), party, designation keywords,
   `keywords_en/te`, `person_tags=[slug]`, all provenance fields, `credit = attribution_text`,
   `license = license_name`, `is_ai_generated=false`, `review_status='pending'`, `retrieved_at=now()`.
7. Write `reports/licensed-photos-YYYYMMDD-HHmm.json` + `.md`: imported, skipped (duplicate / licence / size /
   watermark), pending review, per person and per source.

Seed list `scripts/config/public-figures.json`: name, Telugu name, aliases (e.g. "CBN"), designation, party,
state. Start with: Narendra Modi, N. Chandrababu Naidu, Pawan Kalyan, Nara Lokesh, A. Revanth Reddy,
YS Jagan Mohan Reddy, K. Chandrashekar Rao, K. T. Rama Rao, and AP/Telangana cabinet ministers. The user confirms
current designations before the first run.

## 4. Review UI — admin **Images** tab (extend the existing one)

- New "Pending review" filter: thumbnail, person, designation, source link (opens in new tab), licence +
  licence link, attribution text, Gemini notes (faces, watermark, suitability).
- Buttons **Approve** / **Reject (reason)** — available only to a signed-in admin (`is_admin()`); write
  `review_status`, `reviewed_by`, `reviewed_at`.
- Show a warning badge on `share_alike` photos ("cannot be combined with other images").

## 5. Picker and article display

In `scripts/lib/news-images.ts`:
- Use only `active and review_status = 'approved'` rows (RLS already enforces this for anon reads; the script
  uses the service role, so filter explicitly).
- Do not composite `share_alike` photos unless `ALLOW_SHARE_ALIKE_COMPOSITES=true`; use them alone instead.
- Prefer the most recent approved photo with the person's **current** designation; rotate by `times_used`.
- The credits line must contain each photo's exact `attribution_text`.

In the app (`src/pages/NewsPage.tsx`): under the article image show the credit line, and when a photo is CC
licensed, link the licence name to `license_url` (store `image_credits` JSON on `blog_posts` when publishing:
`[{ attribution_text, license_url, source_url }]`; add that column in migration 005).

## 6. Deliverables

1. `supabase/aapstack/005_licensed_photo_provenance.sql`.
2. `scripts/photo-sources/{wikimedia,flickr,manual}.ts`, `scripts/import-licensed-photos.ts`, `npm run photos`.
3. `scripts/config/public-figures.json`, `scripts/config/flickr-accounts.json` (empty until the user adds accounts).
4. Picker changes, admin review UI, article credit display.
5. `docs/licensed-photos.md`: accepted licences, how to add PIB / I&PR / party photos with a sidecar, how to
   review, how to handle a takedown.
6. Verification: `npx tsc --noEmit`; `npm run photos -- fetch --person="N. Chandrababu Naidu" --source=wikimedia --limit=5`;
   show the report and the 5 pending photos (with licence and attribution) to the user before importing more.

## Order of work

Migration → Wikimedia adapter + importer (5 photos, user reviews) → review UI → picker + article credits →
manual import (PIB / I&PR sidecars) → Flickr (only if the user provides a key and account allowlist) → docs.
