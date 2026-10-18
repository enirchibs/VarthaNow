"""Layout, theme, language and basic accessibility checks."""
import pytest
from playwright.sync_api import Page, expect

from support.helpers import open_page
from support.mock_backend import MockBackend

CORE = ["/", "/news/amaravati-capital-works-resume", "/category/cinema", "/search", "/jobs", "/services",
        "/health", "/login", "/about"]


def test_document_language_is_telugu(page: Page, base_url):
    open_page(page, base_url, "/", settle_ms=500)
    assert page.evaluate("document.documentElement.lang") == "te"


def test_dark_theme_toggle_persists_across_reload(page: Page, base_url):
    open_page(page, base_url, "/", settle_ms=500)
    page.get_by_role("button", name="నలుపు").first.click()
    assert page.evaluate("document.documentElement.classList.contains('dark')")
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(500)
    assert page.evaluate("document.documentElement.classList.contains('dark')"), "dark theme lost on reload"
    page.get_by_role("button", name="తెలుపు").first.click()
    assert not page.evaluate("document.documentElement.classList.contains('dark')")


@pytest.mark.parametrize("route", CORE)
def test_pages_have_title_and_description(page: Page, base_url, route):
    open_page(page, base_url, route, settle_ms=1000)
    assert page.title().strip(), f"{route} has no <title>"
    desc = page.locator("head meta[name=description]").first.get_attribute("content")
    assert desc and len(desc) > 30, f"{route} meta description missing/short: {desc!r}"


def test_core_pages_have_distinct_titles(page: Page, base_url):
    titles = {}
    for route in ["/", "/search", "/jobs", "/login", "/about", "/privacy", "/bookmarks"]:
        open_page(page, base_url, route, settle_ms=800)
        titles[route] = page.title()
    dupes = {t for t in titles.values() if list(titles.values()).count(t) > 1}
    assert not dupes, f"duplicate titles: { {r: t for r, t in titles.items() if t in dupes} }"


@pytest.mark.parametrize("route", ["/", "/news/amaravati-capital-works-resume", "/jobs"])
def test_images_have_alt_text(page: Page, base_url, route):
    open_page(page, base_url, route)
    missing = page.eval_on_selector_all("img", "els => els.filter(e => !e.hasAttribute('alt')).map(e => e.src)")
    assert not missing, f"{route}: {len(missing)} <img> without alt, e.g. {missing[:3]}"


@pytest.mark.parametrize("route", ["/", "/news/amaravati-capital-works-resume", "/search"])
def test_buttons_have_accessible_names(page: Page, base_url, route):
    open_page(page, base_url, route)
    unnamed = page.eval_on_selector_all("button", """els => els.filter(e => {
        const name = (e.getAttribute('aria-label') || e.getAttribute('title') || e.innerText || '').trim();
        const labelled = e.getAttribute('aria-labelledby');
        return !name && !labelled && e.offsetParent !== null;
    }).map(e => e.outerHTML.slice(0, 120))""")
    assert not unnamed, f"{route}: {len(unnamed)} visible buttons without a name, e.g. {unnamed[:3]}"


@pytest.mark.parametrize("width,height", [(1366, 768), (768, 1024), (360, 740)])
def test_no_horizontal_scroll_across_viewports(browser, base_url, width, height):
    ctx = browser.new_context(viewport={"width": width, "height": height}, locale="te-IN")
    MockBackend(base_url).install(ctx)
    page = ctx.new_page()
    try:
        for route in ["/", "/news/amaravati-capital-works-resume", "/jobs", "/services"]:
            open_page(page, base_url, route, settle_ms=1200)
            overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            assert overflow <= 1, f"{route} at {width}px overflows by {overflow}px"
    finally:
        ctx.close()


def test_category_nav_links_navigate(page: Page, base_url):
    open_page(page, base_url, "/", settle_ms=800)
    page.locator("nav a[href='/category/telangana']").first.click()
    expect(page).to_have_url(f"{base_url}/category/telangana")
    page.locator("a[href='/news/hyderabad-metro-phase-two']").first.wait_for(timeout=10000)


def test_legal_page_replaces_article_seo_after_client_navigation(page: Page, base_url):
    """Opening /about from an article (no full reload) must not keep the article's title/canonical/JSON-LD."""
    open_page(page, base_url, "/news/amaravati-capital-works-resume")
    assert page.locator("script#varthanow-jsonld").count() == 1
    # Client-side route change (what a footer/nav <Link> click does), no document reload.
    page.evaluate("window.history.pushState({}, '', '/about'); window.dispatchEvent(new PopStateEvent('popstate'))")
    expect(page).to_have_url(f"{base_url}/about")
    expect(page.locator("main h1").first).to_be_visible()
    page.wait_for_timeout(800)
    assert "అమరావతి" not in page.title(), page.title()
    assert "VaartaNow" in page.title()
    canonical = page.locator("head link[rel=canonical]").get_attribute("href")
    assert canonical.endswith("/about"), canonical
    og = page.locator("head meta[property='og:title']").get_attribute("content")
    assert "అమరావతి" not in og
    assert page.locator("script#varthanow-jsonld").count() == 0, "article JSON-LD left on /about"


@pytest.mark.parametrize("route", ["/about", "/contact", "/privacy", "/terms", "/disclaimer", "/customer-terms",
                                   "/provider-terms", "/provider-code-of-conduct", "/safety", "/grievance"])
def test_legal_pages_have_own_title_and_canonical(page: Page, base_url, route):
    open_page(page, base_url, route, settle_ms=600)
    assert page.title().endswith("| VaartaNow") and not page.title().startswith("VaartaNow - తెలుగు వార్తలు")
    assert page.locator("head link[rel=canonical]").get_attribute("href").endswith(route)
