"""Jobs board: only fresh, approved, active listings reach readers."""
from urllib.parse import unquote

import pytest
from playwright.sync_api import Page, expect

from support.helpers import open_page

pytestmark = pytest.mark.mock_only


def test_jobs_board_lists_only_live_jobs(page: Page, base_url, backend, errors):
    open_page(page, base_url, "/jobs", settle_ms=2500)
    expect(page.get_by_text("XJOBONE").first).to_be_visible(timeout=10000)
    expect(page.get_by_text("XJOBTWO").first).to_be_attached()
    html = page.content()
    for hidden in ("XJOBPENDING", "XJOBINACTIVE", "XJOBEXPIRED"):
        assert hidden not in html, f"{hidden} should not be listed"
    q = [dict(l["params"]) for l in backend.db.log if l["table"] == "vaartanow_jobs"]
    assert any(p.get("is_active") == "eq.true" and p.get("is_approved") == "eq.true" and "posted_date" in p for p in q), q
    assert errors["page"] == []


@pytest.mark.parametrize("route", ["/jobs/work-from-home", "/jobs/fresher-jobs", "/jobs/experienced-jobs",
                                   "/jobs/government", "/jobs/internships", "/jobs/remote-it"])
def test_job_category_pages_render(page: Page, base_url, errors, route):
    open_page(page, base_url, route)
    assert len(page.locator("#root").inner_text()) > 200
    assert errors["page"] == []
