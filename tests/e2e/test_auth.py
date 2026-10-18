"""Sign-in and role gating for the admin console (mocked auth: see support/fixtures.py USERS)."""
import pytest
from playwright.sync_api import Page, expect

from support.helpers import login, open_page

pytestmark = pytest.mark.mock_only


def test_wrong_password_shows_error_and_stays_on_login(page: Page, base_url, backend):
    login(page, base_url, "reader@vaartanow.test", "wrong-password")
    expect(page.get_by_text("Invalid login credentials")).to_be_visible()
    expect(page).to_have_url(f"{base_url}/login")
    assert backend.current_user is None


def test_empty_form_does_not_call_auth(page: Page, base_url, backend):
    open_page(page, base_url, "/login", settle_ms=300)
    page.locator("main form button[type=submit]").click()
    page.wait_for_timeout(800)
    assert not [c for c in backend.auth_calls if c["path"] == "token"]
    expect(page).to_have_url(f"{base_url}/login")


def test_sign_up_asks_user_to_confirm_email(page: Page, base_url, backend):
    open_page(page, base_url, "/login", settle_ms=300)
    page.get_by_role("button", name="కొత్త ఖాతాను సృష్టించుకోవాలా?").click()
    page.locator("main input[type=email]").fill("new.user@vaartanow.test")
    page.locator("main input[type=password]").fill("NewUser#12345")
    page.locator("main form button[type=submit]").click()
    expect(page.get_by_text("ధృవీకరణ లింక్ కోసం మీ ఈమెయిల్ చెక్ చేయండి!")).to_be_visible()
    assert any(c["path"] == "signup" and c["body"].get("email") == "new.user@vaartanow.test" for c in backend.auth_calls)


def test_anonymous_visitor_is_denied_admin(page: Page, base_url, backend):
    open_page(page, base_url, "/admin")
    expect(page.get_by_role("heading", name="Access Denied")).to_be_visible()
    admin_tables = {"rss_feeds", "pipeline_jobs", "staff_roles"}
    assert not [l for l in backend.db.log if l["table"] in admin_tables], "admin data requested before sign-in"
    page.get_by_role("button", name="Sign In to Account").click()
    expect(page).to_have_url(f"{base_url}/login")


def test_reader_can_sign_in_but_not_open_admin(page: Page, base_url, backend):
    login(page, base_url, "reader@vaartanow.test", "Reader#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    assert backend.current_user and backend.current_user["email"] == "reader@vaartanow.test"
    open_page(page, base_url, "/admin")
    expect(page.get_by_role("heading", name="Access Denied")).to_be_visible()


def test_admin_review_queue_lists_ai_draft(page: Page, base_url):
    login(page, base_url, "admin@vaartanow.test", "Admin#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    open_page(page, base_url, "/admin")
    expect(page.get_by_text("XDRAFTX").first).to_be_visible(timeout=10000)


def test_admin_gets_full_console(page: Page, base_url):
    login(page, base_url, "admin@vaartanow.test", "Admin#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    open_page(page, base_url, "/admin")
    expect(page.get_by_text("Owner · Admin").first).to_be_attached(timeout=10000)
    expect(page.get_by_text("Published today").first).to_be_visible()
    for tab in ("Review Queue", "RSS Feeds", "Users & Roles"):
        expect(page.get_by_text(tab, exact=True).first).to_be_attached()


def test_editor_gets_newsroom_without_admin_only_tabs(page: Page, base_url):
    login(page, base_url, "editor@vaartanow.test", "Editor#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    open_page(page, base_url, "/admin")
    expect(page.get_by_text("Editor", exact=True).first).to_be_attached(timeout=10000)
    expect(page.get_by_role("heading", name="Access Denied")).to_have_count(0)
    expect(page.get_by_text("Review Queue", exact=True).first).to_be_attached()
    for tab in ("RSS Feeds", "Users & Roles", "Telugu TTS Engine"):
        expect(page.get_by_text(tab, exact=True)).to_have_count(0)


def test_session_survives_reload(page: Page, base_url):
    login(page, base_url, "admin@vaartanow.test", "Admin#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    open_page(page, base_url, "/admin")
    expect(page.get_by_text("Owner · Admin").first).to_be_attached(timeout=10000)
    expect(page.get_by_text("Published today").first).to_be_visible()
    page.reload(wait_until="networkidle")
    expect(page.get_by_text("Owner · Admin").first).to_be_attached(timeout=10000)
    expect(page.get_by_text("Published today").first).to_be_visible()


def test_admin_runs_news_pipeline_on_github_not_server_functions(page: Page, base_url, backend):
    page.set_viewport_size({"width": 1366, "height": 900})  # admin sidebar is hidden on phones
    login(page, base_url, "admin@vaartanow.test", "Admin#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    open_page(page, base_url, "/admin")
    page.get_by_text("RSS Feeds", exact=True).first.click()
    run = page.get_by_role("link", name="Run news pipeline")
    expect(run).to_have_attribute("href", "https://github.com/enirchibs/VarthaNow/actions/workflows/news-pipeline.yml")
    expect(page.get_by_text("Quick Force Polls")).to_have_count(0)
    assert not [c for c in backend.function_calls if c["name"].startswith(("ingest-rss", "auto-news"))]
