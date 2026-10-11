"""Checks Google AdSense reviewers look at: policy pages, ads.txt, robots, sitemap."""
import os
import re
from urllib.request import urlopen

import pytest
from playwright.sync_api import Page

SITE = os.environ.get("VARTHANOW_SITE", "https://varthanow.pages.dev")
REQUIRED_PAGES = ["/about", "/contact", "/privacy", "/terms", "/disclaimer"]


def test_ads_txt_has_publisher(base_url):
    body = urlopen(base_url + "/ads.txt").read().decode()
    assert re.search(r"google\.com,\s*pub-\d{16},\s*DIRECT,\s*f08c47fec0942fa0", body)


def test_robots_blocks_admin_and_points_to_sitemap(base_url):
    body = urlopen(base_url + "/robots.txt").read().decode()
    assert "Disallow: /admin" in body
    assert f"Sitemap: {SITE}/sitemap.xml" in body


def test_sitemap_has_no_localhost(base_url):
    body = urlopen(base_url + "/sitemap.xml").read().decode()
    assert "localhost" not in body
    assert f"<loc>{SITE}/</loc>" in body
    assert "/search</loc>" not in body


@pytest.mark.parametrize("route", REQUIRED_PAGES)
def test_policy_pages_have_real_content(page: Page, base_url, route):
    page.goto(base_url + route, wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    assert len(page.locator("#root").inner_text()) > 800, f"{route} looks thin"


def test_footer_links_policy_pages(page: Page, base_url):
    page.goto(base_url + "/", wait_until="domcontentloaded")
    page.wait_for_timeout(2500)
    hrefs = page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))")
    for route in ["/privacy", "/about", "/contact"]:
        assert route in hrefs, f"no link to {route} on the homepage"


def test_privacy_mentions_cookies_and_google_ads(page: Page, base_url):
    page.goto(base_url + "/privacy", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    text = page.locator("#root").inner_text().lower()
    assert "cookie" in text
    assert "google" in text
