"""Playwright network layer that stands in for the Supabase-compatible backend and third-party APIs.

Every browser test gets a fresh in-memory database (support/fixtures.py), so tests are deterministic,
work offline, and can assert on exactly what the app wrote.
"""
from __future__ import annotations

import base64
import json
import time
from urllib.parse import urlsplit, parse_qs

from playwright.sync_api import BrowserContext, Route

from . import fixtures
from .postgrest import PostgREST

PNG_1PX = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)
CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS,HEAD",
    "access-control-expose-headers": "content-range,x-supabase-api-version",
}

THIRD_PARTY_JSON = {
    "api.open-meteo.com": {"current_weather": {"temperature": 31.4, "weathercode": 1}, "hourly": {"relativehumidity_2m": [68]}},
    "ipwho.is": {"success": True, "city": "Hyderabad", "region": "Telangana", "country_code": "IN",
                 "latitude": 17.385, "longitude": 78.4867},
    "api.bigdatacloud.net": {"city": "Hyderabad", "locality": "Hyderabad", "principalSubdivision": "Telangana", "countryCode": "IN"},
    "api.frankfurter.app": {"base": "USD", "rates": {"INR": 83.25, "EUR": 0.92}},
    "nominatim.openstreetmap.org": [],
    "api.geoapify.com": {"features": []},
}


def _b64url(obj) -> str:
    return base64.urlsafe_b64encode(json.dumps(obj).encode()).decode().rstrip("=")


def make_jwt(user: dict) -> str:
    now = int(time.time())
    payload = {
        "sub": user["id"], "email": user["email"], "aud": "authenticated", "role": "authenticated",
        "iat": now, "exp": now + 3600, "session_id": "test-session",
        "app_metadata": user["app_metadata"], "user_metadata": {},
    }
    return f"{_b64url({'alg': 'HS256', 'typ': 'JWT'})}.{_b64url(payload)}.c2lnbmF0dXJl"


class MockBackend:
    def __init__(self, app_origin: str):
        self.app_origin = app_origin.rstrip("/")
        self.db = PostgREST(fixtures.tables())
        self.db.rpcs.update({
            "my_role": lambda _args: self._current_role(),
            "search_locations": [],
            "increment_question_views": None,
        })
        self.functions: dict = {
            "gemini-proxy": {"text": "ఇది పరీక్ష కోసం AI సమాధానం.", "candidates": []},
            "cricket-scores": {"matches": []},
            "youtube-proxy": {"items": []},
        }
        self.current_user: dict | None = None
        self.unmocked: list[str] = []        # external requests we blocked
        self.function_calls: list[dict] = []
        self.auth_calls: list[dict] = []

    # ── helpers ──────────────────────────────────────────────────
    def _current_role(self):
        return (self.current_user or {}).get("role")

    def _user_json(self, email: str):
        u = fixtures.USERS[email]
        app_meta = {"provider": "email", "providers": ["email"]}
        if u["role"] == "admin":
            app_meta["role"] = "admin"
        return {"id": u["id"], "aud": "authenticated", "role": "authenticated", "email": email,
                "email_confirmed_at": "2026-01-01T00:00:00Z", "app_metadata": app_meta, "user_metadata": {},
                "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z", "identities": []}

    def _session(self, email: str):
        user = self._user_json(email)
        self.current_user = {**fixtures.USERS[email], "email": email}
        return {"access_token": make_jwt(user), "token_type": "bearer", "expires_in": 3600,
                "expires_at": int(time.time()) + 3600, "refresh_token": f"refresh-{user['id']}", "user": user}

    @staticmethod
    def _json(route: Route, status: int, body, headers: dict | None = None):
        route.fulfill(status=status, headers={**CORS, "content-type": "application/json", **(headers or {})},
                      body="" if body is None else json.dumps(body))

    # ── install ──────────────────────────────────────────────────
    def install(self, context: BrowserContext):
        context.route("**/*", self._dispatch)

    def _dispatch(self, route: Route):
        req = route.request
        url = urlsplit(req.url)
        origin = f"{url.scheme}://{url.netloc}"
        if req.method == "OPTIONS":
            return route.fulfill(status=204, headers=CORS)

        if origin == self.app_origin:
            if url.path.startswith("/api/"):
                return self._app_api(route, url)
            return route.continue_()

        if "/rest/v1/" in url.path:
            status, headers, body = self.db.handle(req.method, url.path, url.query, req.headers, req.post_data)
            return self._json(route, status, body, headers)
        if "/auth/v1/" in url.path:
            return self._auth(route, url)
        if "/functions/v1/" in url.path:
            name = url.path.split("/functions/v1/", 1)[1].strip("/")
            self.function_calls.append({"name": name, "body": req.post_data})
            return self._json(route, 200, self.functions.get(name, {}))
        if "/storage/v1/" in url.path:
            if req.method == "GET" and "/object/" in url.path:
                return route.fulfill(status=200, headers={**CORS, "content-type": "image/png"}, body=PNG_1PX)
            return self._json(route, 200, {"Key": url.path.split("/object/")[-1], "Id": "test"})

        host = url.hostname or ""
        for known, body in THIRD_PARTY_JSON.items():
            if host.endswith(known):
                return self._json(route, 200, body)

        rtype = req.resource_type
        path = url.path.lower()
        if rtype == "image" or path.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif")) or host.startswith("images."):
            return route.fulfill(status=200, headers={**CORS, "content-type": "image/png"}, body=PNG_1PX)
        if rtype == "script":
            return route.fulfill(status=200, headers={"content-type": "application/javascript"}, body="")
        if rtype == "stylesheet" or host == "fonts.googleapis.com":
            return route.fulfill(status=200, headers={"content-type": "text/css"}, body="")
        if rtype == "font" or host == "fonts.gstatic.com":
            return route.abort()
        self.unmocked.append(f"{req.method} {req.url}")
        return route.abort()

    def _app_api(self, route: Route, url):
        if url.path.startswith("/api/tts/config"):
            return self._json(route, 200, {"providers": [], "enabled": False})
        if url.path.startswith("/api/tts/usage"):
            return self._json(route, 200, {"characters": 0, "limit": 0})
        if url.path.startswith("/api/cricket"):
            return self._json(route, 200, {"matches": [], "typeMatches": []})
        return self._json(route, 404, {"error": "not mocked"})

    def _auth(self, route: Route, url):
        req = route.request
        path = url.path.split("/auth/v1/", 1)[1]
        qs = parse_qs(url.query)
        body = json.loads(req.post_data) if req.post_data else {}
        self.auth_calls.append({"path": path, "query": qs, "body": body})

        if path == "token" and qs.get("grant_type") == ["password"]:
            email = (body.get("email") or "").lower()
            user = fixtures.USERS.get(email)
            if not user or user["password"] != body.get("password"):
                return self._json(route, 400, {"code": 400, "error": "invalid_grant", "error_code": "invalid_credentials",
                                               "msg": "Invalid login credentials", "error_description": "Invalid login credentials"})
            return self._json(route, 200, self._session(email))
        if path == "token" and qs.get("grant_type") == ["refresh_token"]:
            if self.current_user:
                return self._json(route, 200, self._session(self.current_user["email"]))
            return self._json(route, 400, {"error": "invalid_grant", "msg": "Invalid Refresh Token"})
        if path == "user":
            if self.current_user:
                return self._json(route, 200, self._user_json(self.current_user["email"]))
            return self._json(route, 401, {"msg": "not logged in"})
        if path == "logout":
            self.current_user = None
            return route.fulfill(status=204, headers=CORS)
        if path in ("otp", "magiclink", "recover", "resend"):
            return self._json(route, 200, {})
        if path == "signup":
            return self._json(route, 200, {"id": "33333333-3333-4333-8333-333333333333", "email": body.get("email"),
                                           "aud": "authenticated", "role": "", "confirmation_sent_at": "2026-01-01T00:00:00Z",
                                           "app_metadata": {}, "user_metadata": {}, "identities": [{}]})
        if path == "settings":
            return self._json(route, 200, {"external": {"email": True, "google": True}, "disable_signup": False})
        return self._json(route, 404, {"msg": f"auth path {path} not mocked"})
