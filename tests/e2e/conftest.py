import os
import pytest

from support.mock_backend import MockBackend

BASE_URL = os.environ.get("VARTHANOW_URL", "http://localhost:3000")
# "mock" (default): browser tests run against an in-memory backend — deterministic, works offline.
# "live": browser tests hit the real backend configured in .env (use for smoke-testing production data).
BACKEND_MODE = os.environ.get("VARTHANOW_BACKEND", "mock").lower()


def pytest_configure(config):
    config.addinivalue_line("markers", "live: needs the real backend / network (deselect with -m 'not live')")
    config.addinivalue_line("markers", "mock_only: relies on fixture data, skipped when VARTHANOW_BACKEND=live")


def pytest_collection_modifyitems(config, items):
    if BACKEND_MODE == "live":
        skip = pytest.mark.skip(reason="relies on mocked fixture data")
        for item in items:
            if "mock_only" in item.keywords:
                item.add_marker(skip)


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    # Optional: point at a specific Chromium build (e.g. CI or a sandbox without Playwright's download).
    # Fake camera + microphone so recorder tests run without hardware or permission prompts.
    args = ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"]
    path = os.environ.get("CHROMIUM_PATH")
    if not path:
        return {**browser_type_launch_args, "args": args}
    return {**browser_type_launch_args, "executable_path": path, "args": args + ["--no-sandbox", "--disable-gpu"]}


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    # Mobile-first: the app is a phone news reader like Inshorts/Way2News.
    return {
        **browser_context_args,
        "viewport": {"width": 390, "height": 844},
        "is_mobile": True,
        "has_touch": True,
        "locale": "te-IN",
        "timezone_id": "Asia/Kolkata",
    }


@pytest.fixture(autouse=True)
def backend(request, base_url):
    """In mock mode, every browser test gets a fresh MockBackend installed on its context."""
    if BACKEND_MODE != "mock" or "page" not in request.fixturenames:
        yield None
        return
    mock = MockBackend(base_url)
    mock.install(request.getfixturevalue("context"))
    yield mock


@pytest.fixture
def errors(page):
    """Collect uncaught page errors and console errors for the current test."""
    collected = {"page": [], "console": []}
    page.on("pageerror", lambda exc: collected["page"].append(str(exc)))
    page.on(
        "console",
        lambda msg: collected["console"].append(msg.text) if msg.type == "error" else None,
    )
    return collected


@pytest.fixture(autouse=True)
def _short_timeouts(request):
    if "page" in request.fixturenames:
        page = request.getfixturevalue("page")
        page.set_default_timeout(10_000)
        page.set_default_navigation_timeout(20_000)
    yield
