"""The site must stay usable (no crash, header and navigation present) when the backend misbehaves."""
import json
import time

import pytest
from playwright.sync_api import Page, Route, expect

from support.helpers import open_page

pytestmark = pytest.mark.mock_only

ROUTES = ["/", "/news/amaravati-capital-works-resume", "/category/telangana", "/search?q=test", "/jobs", "/bookmarks"]


def _fail(status):
    def handler(route: Route):
        route.fulfill(status=status, headers={"access-control-allow-origin": "*", "content-type": "application/json"},
                      body=json.dumps({"message": "simulated outage", "code": "TEST"}))
    return handler


@pytest.mark.parametrize("status", [500, 503])
@pytest.mark.parametrize("route", ROUTES)
def test_backend_errors_do_not_crash_pages(page: Page, base_url, errors, route, status):
    page.route("**/rest/v1/**", _fail(status))   # page routes win over the context-level mock
    open_page(page, base_url, route)
    assert errors["page"] == [], f"{route} crashed: {errors['page']}"
    expect(page.locator("img[alt='VaartaNow']").first).to_be_visible()
    assert "XDRAFTX" not in page.content()


@pytest.mark.parametrize("route", ["/", "/news/amaravati-capital-works-resume"])
def test_network_failure_does_not_crash_pages(page: Page, base_url, errors, route):
    page.route("**/rest/v1/**", lambda r: r.abort("internetdisconnected"))
    open_page(page, base_url, route)
    assert errors["page"] == [], f"{route} crashed: {errors['page']}"
    expect(page.locator("img[alt='VaartaNow']").first).to_be_visible()


def test_slow_backend_still_renders_feed(page: Page, base_url, backend):
    def slow(route: Route):
        time.sleep(2)
        route.fallback()
    page.route("**/rest/v1/blog_posts**", slow)
    page.goto(base_url + "/", wait_until="domcontentloaded")
    page.locator("a[href^='/news/']").first.wait_for(timeout=20000)
