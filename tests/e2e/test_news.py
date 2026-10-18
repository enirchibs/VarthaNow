"""News reading flows against fixture data: feed, article page, SEO, categories, search, bookmarks."""
import json
import os
import re
from urllib.parse import unquote

import pytest
from playwright.sync_api import Page, expect

from support.helpers import ARTICLE_LINKS, article_hrefs, assert_no_page_errors, meta, open_page

pytestmark = pytest.mark.mock_only

PUBLISHED = {"amaravati-capital-works-resume", "hyderabad-metro-phase-two", "pushpa-three-shooting-update",
             "india-wins-vizag-test", "tirumala-darshan-tickets"}


def test_home_feed_shows_published_telugu_stories_only(page: Page, base_url, backend, errors):
    open_page(page, base_url, "/")
    page.locator(ARTICLE_LINKS).first.wait_for()
    hrefs = article_hrefs(page)
    assert PUBLISHED & {h.removeprefix("/news/") for h in hrefs}, f"no fixture stories on home: {hrefs}"
    assert "/news/draft-unpublished-story" not in hrefs
    assert "/news/english-only-story" not in hrefs
    html = page.content()
    assert "XDRAFTX" not in html and "XENGLISHX" not in html
    feed_reads = [l for l in backend.db.log if l["table"] == "blog_posts" and l["method"] == "GET"]
    assert feed_reads and all(("published", "eq.true") in l["params"] for l in feed_reads if ("slug" not in dict(l["params"])))
    assert_no_page_errors(errors)


def _main_text(page: Page) -> str:
    return page.locator("main").first.inner_text()


TITLES = {
    "amaravati": "అమరావతి రాజధాని పనులు మళ్లీ ప్రారంభం",
    "metro": "హైదరాబాద్ మెట్రో రెండో దశకు ఆమోదం",
    "pushpa": "‘పుష్ప 3’ షూటింగ్ అప్‌డేట్ & విడుదల తేదీ",
    "cricket": "విశాఖ టెస్టులో భారత్ ఘన విజయం",
    "tirumala": "తిరుమల దర్శనం టికెట్ల విడుదల",
    "sensex": "సెన్సెక్స్ రికార్డు స్థాయికి",
}


def test_html_entities_are_decoded_in_titles_and_body(page: Page, base_url):
    open_page(page, base_url, "/category/cinema")
    expect(page.locator("main").first).to_contain_text(TITLES["pushpa"])
    text = _main_text(page)
    leftovers = [e for e in ("&#8216;", "& 8216;", "&#8217;", "& 8217;", "&amp;") if e in text]
    assert not leftovers, f"raw/mangled HTML entities shown to readers: {leftovers}"


def test_opening_a_story_shows_it_with_seo_tags(page: Page, base_url, errors):
    open_page(page, base_url, "/")
    link = page.locator("a[href='/news/amaravati-capital-works-resume']:visible").first
    link.click()
    expect(page).to_have_url(f"{base_url}/news/amaravati-capital-works-resume")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title(TITLES["amaravati"])
    expect(page.locator("#root")).to_contain_text(TITLES["amaravati"])

    assert meta(page, "property", "og:title") == TITLES["amaravati"]
    assert (meta(page, "name", "description") or "").startswith("అమరావతి")
    assert meta(page, "property", "og:image"), "article has no og:image"
    canonical = page.locator("head link[rel=canonical]").get_attribute("href")
    assert canonical and canonical.endswith("/news/amaravati-capital-works-resume")
    # Canonical uses VITE_SITE_URL when set at build time, else the serving origin.
    allowed = {base_url.rstrip("/"), os.environ.get("VARTHANOW_SITE_URL", "").rstrip("/")} - {""}
    assert any(canonical.startswith(o) for o in allowed), f"unexpected canonical origin: {canonical}"

    blocks = page.eval_on_selector_all("script[type='application/ld+json']", "els => els.map(e => e.textContent)")
    flat = json.dumps([json.loads(b) for b in blocks], ensure_ascii=False)
    assert "NewsArticle" in flat, f"no NewsArticle JSON-LD: {flat[:300]}"
    assert_no_page_errors(errors)


def test_unpublished_story_url_does_not_leak_draft(page: Page, base_url):
    open_page(page, base_url, "/news/draft-unpublished-story", settle_ms=2500)
    assert "XDRAFTX" not in page.content()
    assert "ప్రచురించని డ్రాఫ్ట్" not in page.title()


def test_category_page_shows_only_that_category(page: Page, base_url, backend):
    open_page(page, base_url, "/category/cinema")
    expect(page.locator("main").first).to_contain_text(TITLES["pushpa"])
    assert TITLES["sensex"] not in _main_text(page)
    reads = [dict(l["params"]) for l in backend.db.log if l["table"] == "blog_posts"]
    assert any("cinema" in r.get("category", "") for r in reads), reads


def test_category_page_links_to_its_stories(page: Page, base_url):
    """Crawlers (and middle-click / long-press 'open in new tab') need real <a href> links to stories."""
    open_page(page, base_url, "/category/cinema")
    expect(page.locator("main").first).to_contain_text(TITLES["pushpa"])
    assert "/news/pushpa-three-shooting-update" in article_hrefs(page), "category page has no link to its story"


def test_category_headline_opens_full_story(page: Page, base_url):
    open_page(page, base_url, "/category/cinema")
    page.locator("main a[href='/news/pushpa-three-shooting-update']:visible").first.click()
    expect(page).to_have_url(f"{base_url}/news/pushpa-three-shooting-update")
    expect(page).to_have_title(TITLES["pushpa"])


def test_search_results_link_to_stories(page: Page, base_url):
    open_page(page, base_url, "/search?q=తిరుమల")
    expect(page.locator("main").first).to_contain_text(TITLES["tirumala"])
    assert "/news/tirumala-darshan-tickets" in article_hrefs(page)


def test_article_body_entities_decoded_on_article_page(page: Page, base_url):
    open_page(page, base_url, "/news/pushpa-three-shooting-update")
    text = page.locator("#root").inner_text()
    assert TITLES["pushpa"] in text
    assert not [e for e in ("&#8216;", "& 8216;", "&amp;") if e in text]


def test_search_by_typing_finds_matching_story_only(page: Page, base_url, backend):
    open_page(page, base_url, "/search")
    page.get_by_placeholder("తెలుగు వార్తలు సెర్చ్ చేయండి...").fill("మెట్రో")
    expect(page.locator("main").first).to_contain_text(TITLES["metro"])
    page.wait_for_load_state("networkidle")
    assert TITLES["amaravati"] not in _main_text(page), "unrelated story in search results"
    # sanity check for the zero-results test in test_routes.py: real results do render share buttons
    assert page.locator("main").get_by_role("button", name="Share on WhatsApp").count() >= 1
    searched = [dict(l["params"]).get("or", "") for l in backend.db.log if l["table"] == "blog_posts"]
    assert any("title.ilike" in unquote(s) and "మెట్రో" in unquote(s) for s in searched), searched


def test_search_query_in_url_is_applied(page: Page, base_url):
    open_page(page, base_url, "/search?q=తిరుమల")
    expect(page.locator("main").first).to_contain_text(TITLES["tirumala"])
    assert TITLES["cricket"] not in _main_text(page)


def test_search_with_no_matches_shows_no_stories(page: Page, base_url):
    open_page(page, base_url, "/search?q=zzqqxxnomatch987")
    text = _main_text(page)
    assert not any(t in text for t in TITLES.values()), "stories shown for a query that matches nothing"


def test_bookmark_is_saved_listed_and_survives_reload(page: Page, base_url):
    open_page(page, base_url, "/category/cricket")
    expect(page.locator("main").first).to_contain_text(TITLES["cricket"])
    page.locator("main").get_by_role("button", name=re.compile(r"^(save )?bookmark$", re.I)).first.click()
    saved = page.evaluate("JSON.parse(localStorage.getItem('vaartanow-bookmarks-v2') || '[]')")
    assert saved == ["india-wins-vizag-test"], f"stored bookmarks: {saved}"

    open_page(page, base_url, "/bookmarks")
    expect(page.locator("main").first).to_contain_text(TITLES["cricket"])
    page.reload(wait_until="networkidle")
    expect(page.locator("main").first).to_contain_text(TITLES["cricket"])


def test_bookmarked_story_that_was_unpublished_is_hidden(page: Page, base_url):
    open_page(page, base_url, "/", settle_ms=300)
    page.evaluate("localStorage.setItem('vaartanow-bookmarks-v2', JSON.stringify(['draft-unpublished-story', 'sensex-record-high']))")
    open_page(page, base_url, "/bookmarks")
    expect(page.locator("main").first).to_contain_text(TITLES["sensex"])
    assert "XDRAFTX" not in page.content()


def test_bookmarks_page_decodes_entities(page: Page, base_url):
    open_page(page, base_url, "/", settle_ms=300)
    page.evaluate("localStorage.setItem('vaartanow-bookmarks-v2', JSON.stringify(['pushpa-three-shooting-update']))")
    open_page(page, base_url, "/bookmarks")
    expect(page.locator("main").first).to_contain_text(TITLES["pushpa"])
    assert "&#8216;" not in page.locator("main").first.inner_text()


def test_empty_bookmarks_page_shows_no_stories(page: Page, base_url):
    open_page(page, base_url, "/bookmarks")
    text = _main_text(page) if page.locator("main").count() else ""
    assert not any(t in text for t in TITLES.values())


def test_whatsapp_share_links_carry_the_article_url(page: Page, base_url):
    open_page(page, base_url, "/")
    page.locator("a[href^='https://wa.me/']").first.wait_for()
    hrefs = page.eval_on_selector_all("a[href^='https://wa.me/']", "els => els.map(e => e.href)")
    assert all("/news/" in unquote(h) for h in hrefs), hrefs[:3]
