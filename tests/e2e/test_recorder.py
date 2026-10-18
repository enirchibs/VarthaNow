"""Video recorder: choosing a camera (e.g. OBS Virtual Camera) and microphone in Live Studio."""
import re

import pytest
from playwright.sync_api import Page, expect

from support.helpers import login, open_page

pytestmark = pytest.mark.mock_only

# Chromium's fake camera, renamed so the page sees a virtual camera (same deviceId, so it really opens).
RENAME_FAKE_CAMERA = """
(() => {
  const md = navigator.mediaDevices;
  const original = md.enumerateDevices.bind(md);
  md.enumerateDevices = async () => (await original()).map((d) =>
    d.kind === 'videoinput' && d.label
      ? { deviceId: d.deviceId, groupId: d.groupId, kind: d.kind, label: 'OBS Virtual Camera', toJSON() { return this; } }
      : d);
})();
"""


def _open_live_studio(page: Page, base_url):
    page.set_viewport_size({"width": 1366, "height": 900})  # admin sidebar is hidden on phones
    login(page, base_url, "admin@vaartanow.test", "Admin#12345")
    expect(page).not_to_have_url(f"{base_url}/login")
    open_page(page, base_url, "/admin")
    page.get_by_text("Live Studio", exact=True).first.click()
    expect(page.get_by_role("button", name="Open camera & studio")).to_be_visible()


def _active_camera_id(page: Page) -> str:
    return page.evaluate("""() => {
        const v = [...document.querySelectorAll('video')].find(v => v.srcObject && v.srcObject.getVideoTracks().length);
        return v ? v.srcObject.getVideoTracks()[0].getSettings().deviceId : null;
    }""")


def test_virtual_camera_can_be_chosen_and_is_used(page: Page, base_url):
    page.add_init_script(RENAME_FAKE_CAMERA)
    _open_live_studio(page, base_url)
    page.get_by_role("button", name="Open camera & studio").click()
    camera = page.get_by_label("Camera", exact=True)
    expect(camera.locator("option", has_text="OBS Virtual Camera")).to_have_count(1)

    camera.select_option(label="OBS Virtual Camera")
    chosen = camera.input_value()
    assert page.evaluate("localStorage.getItem('vn-camera-id')") == chosen
    expect(page.get_by_text("Virtual camera: its picture is used as is")).to_be_visible()
    # choosing OBS switches the studio to "Camera as is" by itself (graphics only, no cut-out)
    expect(page.locator("button[title='Camera as is']")).to_have_class(re.compile(r"\bborder-red-600\b"))
    page.wait_for_function("id => [...document.querySelectorAll('video')].some(v => v.srcObject && "
                           "v.srcObject.getVideoTracks()[0]?.getSettings().deviceId === id)", arg=chosen)
    assert _active_camera_id(page) == chosen

    expect(page.get_by_role("button", name="Start recording")).to_be_enabled()


def test_missing_saved_camera_falls_back_to_default(page: Page, base_url):
    page.add_init_script("localStorage.setItem('vn-camera-id', 'unplugged-camera-id')")
    _open_live_studio(page, base_url)
    page.get_by_role("button", name="Open camera & studio").click()
    expect(page.get_by_role("button", name="Start recording")).to_be_visible()
    assert page.evaluate("localStorage.getItem('vn-camera-id')") is None
    expect(page.get_by_label("Camera", exact=True)).to_have_value("")
