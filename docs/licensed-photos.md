# Licensed photos of public figures

Real photos of politicians, film stars, sportspeople, business leaders and world leaders, kept in
`image_library` (`kind = 'person'`) with full provenance. Nothing is used on the site until an admin approves it.

## Accepted licences

| Licence | Use |
|---|---|
| Public domain, CC0 | Alone or in composed images |
| CC BY (2.0 – 4.0) | Alone or in composed images; credit the author |
| CC BY-SA (any version) | **Alone only** (`share_alike = true`). A composed image would have to be CC BY-SA itself; the picker combines these only if `ALLOW_SHARE_ALIKE_COMPOSITES=true` |
| GODL-India (Government Open Data Licence) | Accepted (approved 2026-10-11; `--no-godl` to skip); allows commercial use and adaptation with attribution. Most PIB / PMO / ministry photos on Wikimedia Commons use it |
| Government press material (PIB, I&PR AP / Telangana, Lok Sabha) | Manual import only, after a person checks the reuse terms (`terms_note`) |
| Party media releases | Manual import only; promotional, use for identification only |

Rejected: NC (non-commercial), ND (no derivatives), "fair use", "all rights reserved", unknown or missing licence.
Never take photos from Google Images, news sites or social media posts, and never crawl government or party sites.

## Importing

```bash
npm run photos -- fetch --person="N. Chandrababu Naidu" --source=wikimedia --limit=5
npm run photos -- fetch --group=cinema --source=wikimedia --limit=3      # politics | cinema | sports | business | international | all
npm run photos -- fetch --person="..." --source=flickr                     # needs FLICKR_API_KEY + scripts/config/flickr-accounts.json
npm run photos -- report                                                   # photos per person and who has none yet
```

Options: `--dry` (list only), `--max-faces=N` (skip group photos, default 4), `--no-godl`.

- People, Telugu names, aliases and designations live in `scripts/config/public-figures.json`. **Check designations
  before importing**; they are stored with each photo and shown in review.
- Who is in a photo comes only from the source's title / caption, which must name the person. No face recognition.
  Gemini only suggests keywords, a crop focus, and flags watermarks, group photos and unsuitable shots.
- Every import is written to `reports/licensed-photos-<date>.md|json` (imported, skipped and why).

### PIB, I&PR and party photos (manual)

Put the photo and a sidecar with the same name in `imports/<source>/`:

```
imports/pib/cbn-amaravati-2026-10-01.jpg
imports/pib/cbn-amaravati-2026-10-01.json
```

```json
{
  "person_name": "N. Chandrababu Naidu",
  "designation": "Chief Minister of Andhra Pradesh",
  "party": "TDP",
  "source_name": "PIB",
  "source_url": "https://pib.gov.in/PressReleasePage.aspx?PRID=...",
  "photo_date": "2026-10-01",
  "event_caption": "Chief Minister at the Amaravati review meeting",
  "terms_note": "PIB copyright policy page checked 2026-10-11: free reuse with credit",
  "received_via": "website"
}
```

Then `npm run photos -- import-folder --dir=imports/pib`. For a single page:
`npm run photos -- import-url --url=<page> --person="..." --source="I&PR Andhra Pradesh" --terms="..."` (fetches that page and its main image only).
Credits are the issuing office: `Photo: PIB`, `Photo: I&PR Andhra Pradesh`, `Photo: Lok Sabha`, `Photo: TDP Media Cell`.

## Reviewing

Admin → **Images** → Review: **Pending review**. Each photo shows the person (from the caption), designation,
source link, licence link, attribution and Gemini's notes. Approve it only if:

- the named person is clearly the main person in the photo;
- it is neutral (not unflattering, mocking, mid-blink) and the designation is current;
- it does not suggest an endorsement or an event the person did not attend.

Reject with a reason otherwise. Aim for comparable coverage across parties.

## How the site uses them

- The story-image picker (`scripts/lib/news-images.ts`) uses only `active` + `approved` photos, matches them on the
  person's names, prefers least-used then most recent photos, never uses a public figure as a stand-in for a general
  topic, and uses CC BY-SA photos alone.
- The composed image carries each photo's exact attribution, and the article page shows the credits under the image
  with the licence linked (`blog_posts.image_credits`).

## Takedown

If a rights holder or the person objects:

```bash
npm run images -- disable --id=<id or asset code> --reason="takedown request from ... on 2026-10-11"
```

The picker stops using it immediately. Articles already published keep their composed image; replace those by hand if needed.
