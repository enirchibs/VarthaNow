import os
import pytest

BASE_URL = os.environ.get("VARTHANOW_URL", "http://localhost:3000")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    # Mobile-first: the app is a phone news reader like Inshorts/Way2News.
    return {
        **browser_context_args,
        "viewport": {"width": 390, "height": 844},
        "is_mobile": True,
        "has_touch": True,
        "locale": "te-IN",
    }


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
