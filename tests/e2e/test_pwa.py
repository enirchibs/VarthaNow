"""Installable-app plumbing: manifest, icons, service worker."""
import json
from urllib.request import urlopen

from playwright.sync_api import Page


def _get(url):
    with urlopen(url, timeout=10) as r:
        return r.status, r.headers.get("content-type", ""), r.read()


def test_manifest_is_valid_and_icons_exist(base_url):
    status, _, body = _get(base_url + "/manifest.webmanifest")
    assert status == 200
    m = json.loads(body)
    assert m.get("name") and m.get("short_name") and m.get("start_url")
    assert m.get("display") in ("standalone", "fullscreen", "minimal-ui")
    sizes = {i.get("sizes") for i in m.get("icons", [])}
    assert {"192x192", "512x512"} <= sizes, f"icon sizes: {sizes}"
    for icon in m["icons"]:
        src = icon["src"] if icon["src"].startswith("/") else "/" + icon["src"]
        st, ctype, data = _get(base_url + src)
        assert st == 200 and len(data) > 100, f"icon {src} missing"


def test_service_worker_script_is_served(base_url):
    status, ctype, body = _get(base_url + "/sw.js")
    assert status == 200 and "javascript" in ctype
    assert b"fetch" in body


def test_index_links_manifest_and_theme_color(page: Page, base_url):
    page.goto(base_url + "/", wait_until="domcontentloaded")
    assert page.locator("head link[rel=manifest]").count() == 1
    assert page.locator("head meta[name=theme-color]").count() >= 1


def test_service_worker_registers(browser, base_url):
    ctx = browser.new_context(service_workers="allow")  # the default test context blocks service workers
    try:
        page = ctx.new_page()
        page.goto(base_url + "/", wait_until="load")
        page.wait_for_timeout(2500)
        scope = page.evaluate("navigator.serviceWorker.getRegistration().then(r => r ? r.scope : null)")
        assert scope == base_url + "/", f"service worker not registered (scope={scope})"
    finally:
        ctx.close()
