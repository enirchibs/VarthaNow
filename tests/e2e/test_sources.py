"""Source credits: outlet name, small site icon and link to the original report — never the outlet's photo."""
import re

import pytest
from playwright.sync_api import Page, expect

from support.helpers import dismiss_prompts, open_page

pytestmark = pytest.mark.mock_only

EENADU = "https://www.eenadu.net/telugu-news/andhra-pradesh/amaravati-works/0700/125000001"
SAKSHI = "https://www.sakshi.com/telugu-news/andhra-pradesh/amaravati-capital-2026"
TV9 = "https://tv9telugu.com/entertainment/pushpa-3-shooting-update-1234567.html"


def _credits(page: Page):
    return page.locator("[aria-label='Source credits']")


def test_card_credits_both_sources_with_icons_and_links(page: Page, base_url):
    open_page(page, base_url, "/category/andhra-pradesh")
    block = _credits(page).first
    expect(block).to_be_visible()
    expect(block).to_contain_text("మూలం (Source):")
    expect(block).to_contain_text("పూర్తి కథనం")
    for url, name, domain in ((EENADU, "Eenadu", "eenadu.net"), (SAKSHI, "Sakshi", "sakshi.com")):
        link = block.locator(f"a[href='{url}']")
        expect(link).to_contain_text(name)
        assert link.get_attribute("target") == "_blank"
        assert "noopener" in (link.get_attribute("rel") or "")
        icon = link.locator("img")
        assert f"domain={domain}" in icon.get_attribute("src")
        assert icon.get_attribute("alt") == ""  # decorative: the name is right next to it


def test_google_news_redirect_is_not_credited(page: Page, base_url):
    open_page(page, base_url, "/category/cinema")
    block = _credits(page).first
    expect(block.locator(f"a[href='{TV9}']")).to_contain_text("TV9 Telugu")
    expect(block.locator("a[href*='news.google.com']")).to_have_count(0)
    expect(block.locator("a")).to_have_count(1)


def test_story_without_sources_shows_no_credits(page: Page, base_url):
    open_page(page, base_url, "/category/business")
    expect(page.locator("main").first).to_contain_text("సెన్సెక్స్ రికార్డు స్థాయికి")
    expect(_credits(page)).to_have_count(0)


def test_story_photo_is_never_from_the_source_outlet(page: Page, base_url):
    open_page(page, base_url, "/category/andhra-pradesh")
    srcs = page.eval_on_selector_all("main img", "els => els.map(e => e.src)")
    leaked = [s for s in srcs if re.search(r"eenadu\.net|sakshi\.com", s) and "s2/favicons" not in s]
    assert not leaked, leaked


def test_article_page_lists_full_source_links(page: Page, base_url):
    open_page(page, base_url, "/news/amaravati-capital-works-resume")
    dismiss_prompts(page)
    page.get_by_role("button", name="పూర్తి కథనం").first.click()
    sheet_credits = page.locator("article [aria-label='Source credits']")
    expect(sheet_credits).to_be_visible()
    expect(sheet_credits).to_contain_text(EENADU)
    expect(sheet_credits).to_contain_text(SAKSHI)


def test_disclaimer_explains_credits_and_logos(page: Page, base_url):
    open_page(page, base_url, "/disclaimer", settle_ms=600)
    main = page.locator("main").first
    expect(main).to_contain_text("Sources, Credits and Publisher Logos")
    expect(main).to_contain_text("not affiliated with")
    expect(main).to_contain_text("we do not reuse publishers")
