"""End-to-end smoke tests for every public VarthaNow route."""
import pytest
from playwright.sync_api import Page, expect

PUBLIC_ROUTES = [
    "/", "/daily-share", "/market", "/deals", "/mahila-market", "/services",
    "/raitu-bazar", "/prakatanalu", "/maatlaadu-ai", "/health", "/bookmarks",
    "/category/andhra-pradesh", "/category/telangana", "/category/cinema",
    "/search?q=test", "/login", "/jobs", "/jobs/government", "/jobs/fresher-jobs",
    "/about", "/contact", "/privacy", "/terms", "/disclaimer", "/safety",
    "/grievance", "/report-abuse", "/legal-agreements",
    "/customer-terms", "/provider-terms", "/provider-code-of-conduct", "/citizen-journalist",
    "/health/tips", "/daily-share", "/category/devotional", "/category/viralshorts",
]

# Network noise outside the app's control. Supabase availability is covered separately
# by test_backend.py so an outage shows up once, clearly, instead of failing every route.
IGNORED_CONSOLE = (
    "favicon", "ERR_BLOCKED_BY_CLIENT", "net::ERR_", "Failed to load resource",
    "supabase.co", "Supabase",
)


def _real(console_errors):
    return [e for e in console_errors if not any(s in e for s in IGNORED_CONSOLE)]


@pytest.mark.parametrize("route", PUBLIC_ROUTES)
def test_route_renders_without_errors(page: Page, base_url, errors, route):
    page.goto(base_url + route, wait_until="domcontentloaded")
    page.wait_for_timeout(2500)

    body_text = page.locator("#root").inner_text()
    assert len(body_text.strip()) > 50, f"{route} rendered (almost) blank"
    assert errors["page"] == [], f"{route} uncaught errors: {errors['page']}"
    assert _real(errors["console"]) == [], f"{route} console errors: {_real(errors['console'])}"


@pytest.mark.parametrize("route", ["/", "/category/cinema", "/jobs", "/about", "/privacy"])
def test_no_horizontal_scroll_on_mobile(page: Page, base_url, route):
    page.goto(base_url + route, wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    assert overflow <= 1, f"{route} overflows horizontally by {overflow}px"


def test_unknown_route_shows_not_found(page: Page, base_url):
    page.goto(base_url + "/this-page-does-not-exist-123", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    expect(page.locator("#root")).to_contain_text("404")


def test_unknown_article_is_not_fabricated(page: Page, base_url):
    page.goto(base_url + "/news/no-such-article-slug-xyz", wait_until="domcontentloaded")
    page.wait_for_timeout(2500)
    expect(page.locator("#root")).not_to_contain_text("VaartaNow AI Editor")


def test_search_with_no_matches_returns_no_demo_posts(page: Page, base_url):
    # Search results are cards without <a href> links, so count the per-card share buttons instead.
    page.goto(base_url + "/search?q=zzqqxxnomatch987", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    assert page.locator("main").get_by_role("button", name="Share on WhatsApp").count() == 0


def test_homepage_shows_articles_and_opens_one(page: Page, base_url, errors):
    page.goto(base_url + "/", wait_until="domcontentloaded")
    link = page.locator("a[href^='/news/']").first
    link.wait_for(timeout=15000)
    href = link.get_attribute("href")
    page.goto(base_url + href, wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    expect(page.locator("h1").first).to_be_visible()
    assert errors["page"] == []


REDIRECTS = {
    "/mahila-market": "/", "/matrimony": "/", "/raitu-bazar": "/", "/rythu-bazar": "/", "/raitu": "/",
    "/services-rental": "/services", "/sevalu-addelu": "/services",
    "/category/health": "/health", "/category/daily-share": "/daily-share", "/category/whatsapp-status": "/daily-share",
}


@pytest.mark.parametrize("old,new", REDIRECTS.items())
def test_legacy_urls_redirect(page: Page, base_url, old, new):
    page.goto(base_url + old, wait_until="domcontentloaded")
    page.wait_for_url(base_url + new, timeout=5000)


def test_404_page_sets_title(page: Page, base_url):
    page.goto(base_url + "/no/such/page", wait_until="domcontentloaded")
    page.wait_for_timeout(1000)
    assert page.title().startswith("404")


def test_vizag_section_is_folded_into_andhra_pradesh(page: Page, base_url):
    page.goto(base_url + "/category/vizag", wait_until="domcontentloaded")
    page.wait_for_url(base_url + "/category/andhra-pradesh", timeout=5000)
    page.goto(base_url + "/", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    assert page.locator("a[href='/category/vizag']").count() == 0, "Vizag still linked in the menu"
