"""A tiny in-memory PostgREST emulator — just enough of the query language supabase-js sends.

Supports: select (columns ignored, rows returned whole), eq/neq/gt/gte/lt/lte/like/ilike/in/is/cs,
not.<op>, or=(...), order, limit/offset, single-object Accept header, count headers,
insert/upsert (POST), update (PATCH), delete (DELETE).
"""
from __future__ import annotations

import copy
import json
import re
import uuid
from datetime import datetime
from urllib.parse import parse_qsl

RESERVED = {"select", "order", "limit", "offset", "or", "and", "on_conflict", "columns"}


def _coerce(raw: str):
    if raw == "true":
        return True
    if raw == "false":
        return False
    if raw == "null":
        return None
    if raw.startswith('"') and raw.endswith('"'):
        return raw[1:-1]
    return raw


def _cmp_value(cell, raw):
    """Compare a row cell with a raw filter value, coercing the filter to the cell's type."""
    value = _coerce(raw)
    if isinstance(cell, bool) or value is None or isinstance(value, bool):
        return cell, value
    if isinstance(cell, (int, float)):
        try:
            return cell, type(cell)(value)
        except (TypeError, ValueError):
            return str(cell), value
    return (None if cell is None else str(cell)), value


def _like(cell, pattern: str, ci: bool) -> bool:
    if cell is None:
        return False
    regex = "^" + "".join(".*" if ch in "%*" else re.escape(ch) for ch in pattern) + "$"
    return re.match(regex, str(cell), re.S | (re.I if ci else 0)) is not None


def _split_top(text: str) -> list[str]:
    parts, depth, cur, quoted = [], 0, "", False
    for ch in text:
        if ch == '"':
            quoted = not quoted
        if not quoted and ch == "(":
            depth += 1
        elif not quoted and ch == ")":
            depth -= 1
        if ch == "," and depth == 0 and not quoted:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    if cur:
        parts.append(cur)
    return parts


def _match(row: dict, col: str, expr: str) -> bool:
    negate = expr.startswith("not.")
    if negate:
        expr = expr[4:]
    op, _, raw = expr.partition(".")
    cell = row.get(col)
    if op in ("eq", "neq", "gt", "gte", "lt", "lte"):
        a, b = _cmp_value(cell, raw)
        try:
            res = {
                "eq": a == b, "neq": a != b,
                "gt": a is not None and a > b, "gte": a is not None and a >= b,
                "lt": a is not None and a < b, "lte": a is not None and a <= b,
            }[op]
        except TypeError:
            res = False
    elif op in ("like", "ilike"):
        res = _like(cell, raw, op == "ilike")
    elif op == "in":
        items = [_coerce(v.strip()) for v in _split_top(raw.strip("()"))]
        res = (str(cell) if not isinstance(cell, bool) else cell) in [
            (str(i) if not isinstance(i, bool) else i) for i in items
        ]
    elif op == "is":
        res = cell is _coerce(raw) or cell == _coerce(raw)
    elif op in ("cs", "ov"):
        wanted = [v.strip().strip('"') for v in raw.strip("{}[]").split(",") if v.strip()]
        have = cell or []
        res = all(w in have for w in wanted) if op == "cs" else any(w in have for w in wanted)
    else:
        res = True  # unknown operator: don't filter (fts etc.)
    return not res if negate else res


def _match_logic(row: dict, expr: str) -> bool:
    """Evaluate `(a.eq.1,b.ilike.%x%)` style or/and groups."""
    inner = expr.strip()
    if inner.startswith("(") and inner.endswith(")"):
        inner = inner[1:-1]
    return any(_match_cond(row, part) for part in _split_top(inner))


def _match_cond(row: dict, cond: str) -> bool:
    cond = cond.strip()
    if cond.startswith("and("):
        return all(_match_cond(row, p) for p in _split_top(cond[4:-1]))
    if cond.startswith("or("):
        return any(_match_cond(row, p) for p in _split_top(cond[3:-1]))
    col, _, expr = cond.partition(".")
    return _match(row, col, expr)


def _sort_key(value):
    if value is None:
        return (0, "")
    if isinstance(value, bool):
        return (1, int(value))
    if isinstance(value, (int, float)):
        return (1, value)
    return (2, str(value))


class PostgREST:
    def __init__(self, tables: dict[str, list[dict]]):
        self.tables = {k: copy.deepcopy(v) for k, v in tables.items()}
        self.rpcs: dict = {}
        self.log: list[dict] = []  # every request: method, table, params, body

    # ── reads ────────────────────────────────────────────────────
    def _filter(self, rows, params):
        out = rows
        for key, value in params:
            if key in ("or", "and"):
                fn = _match_logic if key == "or" else (lambda r, e: all(_match_cond(r, p) for p in _split_top(e.strip("()"))))
                out = [r for r in out if fn(r, value)]
            elif key not in RESERVED and "." in value:
                out = [r for r in out if _match(r, key, value)]
        return out

    def _order(self, rows, params):
        orders = [v for k, v in params if k == "order"]
        specs = [s for o in orders for s in o.split(",") if s]
        for spec in reversed(specs):
            parts = spec.split(".")
            col = parts[0]
            desc = "desc" in parts[1:]
            rows = sorted(rows, key=lambda r: _sort_key(r.get(col)), reverse=desc)
        return rows

    def handle(self, method: str, path: str, query: str, headers: dict, body: str | None):
        """Return (status, headers, json-able body or None)."""
        params = parse_qsl(query, keep_blank_values=True)
        name = path.split("/rest/v1/", 1)[1].strip("/")
        payload = json.loads(body) if body else None
        self.log.append({"method": method, "table": name, "params": params, "body": payload})
        accept = headers.get("accept", "")
        prefer = headers.get("prefer", "")

        if name.startswith("rpc/"):
            fn = self.rpcs.get(name[4:])
            result = fn(payload or dict(params)) if callable(fn) else fn
            return 200, {}, result

        rows = self.tables.setdefault(name, [])

        if method in ("GET", "HEAD"):
            matched = self._order(self._filter(rows, params), params)
            total = len(matched)
            p = dict(params)
            offset = int(p.get("offset", 0) or 0)
            limit = p.get("limit")
            if "range" in headers:
                m = re.match(r"(\d+)-(\d+)", headers["range"])
                if m:
                    offset, limit = int(m.group(1)), int(m.group(2)) - int(m.group(1)) + 1
            page = matched[offset: offset + int(limit)] if limit not in (None, "") else matched[offset:]
            extra = {"content-range": f"{offset}-{offset + max(len(page) - 1, 0)}/{total if 'count=' in prefer else '*'}"}
            if method == "HEAD":
                return 200, extra, None
            if "vnd.pgrst.object" in accept:
                if len(page) != 1:
                    return 406, extra, {"code": "PGRST116", "details": f"The result contains {len(page)} rows",
                                        "hint": None, "message": "JSON object requested, multiple (or no) rows returned"}
                return 200, extra, page[0]
            return 200, extra, page

        if method == "POST":
            new_rows = payload if isinstance(payload, list) else [payload]
            created = []
            conflict = dict(params).get("on_conflict")
            for r in new_rows:
                r = {**r}
                r.setdefault("id", str(uuid.uuid4()))
                r.setdefault("created_at", datetime.utcnow().isoformat() + "Z")
                if "resolution=merge-duplicates" in prefer and conflict:
                    keys = conflict.split(",")
                    hit = next((x for x in rows if all(x.get(k) == r.get(k) for k in keys)), None)
                    if hit:
                        hit.update(r)
                        created.append(hit)
                        continue
                rows.append(r)
                created.append(r)
            return self._write_result(201, created, accept, prefer)

        if method == "PATCH":
            hits = self._filter(rows, params)
            for r in hits:
                r.update(payload or {})
            return self._write_result(200, hits, accept, prefer)

        if method == "DELETE":
            hits = self._filter(rows, params)
            self.tables[name] = [r for r in rows if r not in hits]
            return self._write_result(200, hits, accept, prefer)

        return 405, {}, {"message": f"{method} not supported by mock"}

    @staticmethod
    def _write_result(status, rows, accept, prefer):
        if "return=representation" not in prefer:
            return (201 if status == 201 else 204), {}, None
        if "vnd.pgrst.object" in accept:
            return status, {}, rows[0] if rows else None
        return status, {}, rows
