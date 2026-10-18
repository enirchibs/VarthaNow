# VaartaNow end-to-end tests (pytest + Playwright)

## Setup (once)

```powershell
pip install -r tests/requirements.txt
python -m playwright install chromium
```

## Run

Start the app in one terminal, run the tests in another.

```powershell
# terminal 1 — production build (closest to what users get)
npm run build
npx vite preview --port 4173

# terminal 2
$env:VARTHANOW_URL = "http://localhost:4173"   # default is http://localhost:3000 (npm run dev)
python -m pytest -m "not live"                 # hermetic suite, no network needed
python -m pytest                               # + live checks (real backend, needs .env)
python -m pytest tests/e2e/test_auth.py -k admin --headed --slowmo 300   # watch one flow
```

Useful flags: `--headed`, `--slowmo 300`, `--tracing retain-on-failure` (then
`python -m playwright show-trace test-results/.../trace.zip`), `--screenshot only-on-failure`.

## Two modes

| `VARTHANOW_BACKEND` | What the browser talks to | Use for |
|---|---|---|
| `mock` (default) | `tests/e2e/support/mock_backend.py`: an in-memory PostgREST + auth emulator with fixture data (`support/fixtures.py`), canned weather/geo/FX APIs, images and ad scripts stubbed | Every PR / CI. Deterministic, offline, can assert what the app wrote |
| `live` | The real backend in `.env` | Smoke-testing production data. Tests marked `mock_only` are skipped |

Marker `live` = needs the real backend or network (`test_backend.py`). Deselect with `-m "not live"`.

Test logins (mock mode only): `admin@vaartanow.test / Admin#12345`, `editor@vaartanow.test / Editor#12345`,
`reader@vaartanow.test / Reader#12345`.

## What is covered

| File | Covers |
|---|---|
| `test_routes.py` | Every public route renders with no uncaught/console errors, mobile overflow, legacy redirects, 404 |
| `test_news.py` | Feed shows only published Telugu stories, article page + SEO (title, OG, canonical, JSON-LD), drafts never leak, categories, search (typing and `?q=`), bookmarks persist, WhatsApp share links |
| `test_auth.py` | Wrong password, empty form, sign-up, anonymous/reader denied admin, admin full console + review queue, editor without admin-only tabs, session survives reload |
| `test_jobs.py` | Only fresh + approved + active jobs listed; job category pages |
| `test_resilience.py` | Backend 500/503/offline/slow: pages degrade without crashing |
| `test_ui.py` | `lang="te"`, dark theme persists, titles/descriptions, alt text, button names, no horizontal scroll at 360/768/1366px, category nav |
| `test_pwa.py` | Manifest + icons, `sw.js`, service worker registers |
| `test_ads_readiness.py` | ads.txt, robots, sitemap, policy pages (AdSense review) |
| `test_backend.py` | `live`: real backend reachable with published posts |

Tests marked `xfail(strict=True)` document known bugs; when you fix one, that test "unexpectedly passes" and
fails the run, so remove its `xfail` mark.

## Adding a test

Add rows to `support/fixtures.py` (dates are relative to now), then assert on the UI and, if useful, on
`backend.db.log` (every request the app made) or `backend.db.tables` (what it wrote):

```python
def test_something(page, base_url, backend):
    page.goto(base_url + "/jobs")
    ...
    assert any(l["table"] == "vaartanow_jobs" for l in backend.db.log)
```

Simulate failures per test with `page.route("**/rest/v1/**", ...)` — page routes override the mock.
