from __future__ import annotations

from playwright.sync_api import Page, expect

ARTICLE_LINKS = "a[href^='/news/']"


def open_page(page: Page, base_url: str, path: str, settle_ms: int = 1500):
    page.goto(base_url + path, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(settle_ms)


def article_hrefs(page: Page) -> set[str]:
    return set(page.eval_on_selector_all(ARTICLE_LINKS, "els => els.map(e => e.getAttribute('href'))"))


def login(page: Page, base_url: str, email: str, password: str, next_path: str | None = None):
    open_page(page, base_url, "/login" + (f"?next={next_path}" if next_path else ""), settle_ms=500)
    page.locator("main input[type=email]").fill(email)
    page.locator("main input[type=password]").fill(password)
    page.locator("main form button[type=submit]").click()


def meta(page: Page, attr: str, name: str) -> str | None:
    loc = page.locator(f"head meta[{attr}='{name}']")
    return loc.first.get_attribute("content") if loc.count() else None


def assert_no_page_errors(errors):
    assert errors["page"] == [], f"uncaught errors: {errors['page']}"


def dismiss_prompts(page: Page):
    """Close the location (GPS) prompt that floats over the bottom of the page, if it is showing."""
    close = page.get_by_role("button", name="Close GPS prompt")
    if close.count() and close.first.is_visible():
        close.first.click()
