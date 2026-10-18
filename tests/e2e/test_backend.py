"""Backend health: fails loudly when Supabase is down or restricted (e.g. over quota)."""
import json
import pytest
import os
import re
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def _env():
    vals = dict(os.environ)
    env_file = Path(__file__).resolve().parents[2] / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)", line)
            if m and m.group(1) not in vals:
                vals[m.group(1)] = m.group(2).strip().strip("'\"")
    return vals


@pytest.mark.live
def test_supabase_blog_posts_reachable():
    env = _env()
    url, key = env.get("VITE_SUPABASE_URL"), env.get("VITE_SUPABASE_ANON_KEY")
    assert url and key, "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set"
    req = Request(
        f"{url}/rest/v1/blog_posts?select=slug&published=eq.true&limit=1",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    try:
        with urlopen(req, timeout=15) as res:
            rows = json.loads(res.read())
    except HTTPError as e:
        raise AssertionError(f"Supabase returned {e.code}: {e.read()[:300]!r}") from None
    assert rows, "Supabase is up but has no published blog_posts"
