#!/usr/bin/env python3
"""Export VaartaNow from Supabase for import into aapstack.tech (OwnDatabase).

Keeps only the last 90 days of time-based data, skips fake/sample rows, caches and logs, and
leaves old images behind. Produces the plain pg_dump files that OwnDatabase's
scripts/import-supabase.py converts into a project schema.

    # needs SUPABASE_DB_PASSWORD in .env and a working Docker (pg_dump 17 runs in postgres:17-alpine)
    python scripts/migrate-to-aapstack.py --out migration/out
    python ../owndatabase/scripts/import-supabase.py --schema migration/out/schema.sql \
        --data migration/out/data.sql --target-schema project_vaartanow --project-id <id> --out migration/odb
    # then apply migration/odb/*.sql on the server (docs/import-supabase.md, step 4)
    # and finally migration/out/4_post_import.sql
"""
import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KEEP_DAYS = 90
CUTOFF = f"now() - interval '{KEEP_DAYS} days'"

# Tables whose rows are not migrated at all (caches, logs, per-session history; all rebuild on their own).
SKIP_DATA = {
    "ai_cache", "tts_audio_cache", "tts_generation_locks", "tts_usage_logs", "google_location_cache",
    "pipeline_jobs", "pipeline_failures", "audit_events", "notifications", "health_chat_history",
}

FAKE_JOB_LINKS = (
    "'https://tcs.com/careers/react-dev-1', 'https://wipro.com/careers/node-intern-hyderabad', "
    "'https://infosys.com/careers/flutter-vizag', 'mailto:careers@vaartanow.in?subject=Senior UI/UX Designer'"
)

# Row filters for the tables that grow or contain sample data. Everything else is copied whole.
FILTERS = {
    "blog_posts": f"published = true and published_at >= {CUTOFF} "
                  "and not (author_name = 'VaartaNow AI Editor' and slug ~ '^[a-z-]+-news-(te|en|hi|ta|kn)$')",
    "articles": f"created_at >= {CUTOFF}",
    "viral_videos": f"created_at >= {CUTOFF}",
    "ai_summaries": f"created_at >= {CUTOFF}",
    "gold_rates": f"fetched_at >= {CUTOFF}",
    "price_history": f"observed_at >= {CUTOFF}",
    "vaartanow_jobs": f"apply_link not in ({FAKE_JOB_LINKS}) and job_id::text not like 'local-job-%'",
    "classifieds": "id::text not like 'cf\\_%'",
    "service_providers": "id::text not like 'sp\\_%'",
}
# Rows pointing at an article that is not migrated are dropped too (data loads without FK checks).
ARTICLE_CHILD = "(article_id is null or article_id in (select id from public.articles where created_at >= {cutoff}))"


def load_env():
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)", line)
            if m and m.group(1) not in os.environ:
                os.environ[m.group(1)] = m.group(2).strip().strip("'\"")


def pg(tool: str, *args: str, stdout=None) -> str:
    """Run psql / pg_dump 17: from PG_BIN (a local PostgreSQL 17 bin folder) if set, else in a throwaway
    container. The password goes in via the environment only."""
    if os.environ.get("PG_BIN"):
        cmd = [str(Path(os.environ["PG_BIN"]) / tool), *conn_args(), *args]
    else:
        cmd = ["docker", "run", "--rm", "-i", "-e", "PGPASSWORD", "postgres:17-alpine", tool, *conn_args(), *args]
    res = subprocess.run(cmd, stdout=stdout or subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                         encoding="utf-8", env={**os.environ, "PGPASSWORD": os.environ["SUPABASE_DB_PASSWORD"]})
    if res.returncode != 0:
        sys.exit(f"❌ {tool} failed: {res.stderr.strip()[:500]}")
    return res.stdout if stdout is None else ""


def conn_args():
    ref = os.environ.get("SUPABASE_PROJECT_REF") or re.search(r"https://([a-z0-9]+)\.", os.environ["VITE_SUPABASE_URL"]).group(1)
    # Direct connection (IPv6). The pooler (aws-1-ap-southeast-2.pooler.supabase.com, user postgres.<ref>)
    # kept the old password while the project was restricted.
    host = os.environ.get("SUPABASE_DB_HOST", f"db.{ref}.supabase.co")
    user = f"postgres.{ref}" if "pooler" in host else "postgres"
    return ["-h", host, "-p", "5432", "-U", user, "-d", "postgres"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="migration/out")
    out = ROOT / ap.parse_args().out
    out.mkdir(parents=True, exist_ok=True)

    load_env()
    if not os.environ.get("SUPABASE_DB_PASSWORD"):
        sys.exit("❌ Add SUPABASE_DB_PASSWORD to .env first")

    print("1/3 schema (public) ...")
    with open(out / "schema.sql", "w", encoding="utf-8") as f:
        pg("pg_dump", "--schema-only", "--schema=public", "--no-owner", stdout=f)

    print("2/3 data (last 90 days, no fake rows / caches / logs) ...")
    tables = pg("psql", "-At", "-c",
                "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace "
                "where n.nspname = 'public' and c.relkind in ('r','p') order by 1").split()
    child_of_articles = set(pg("psql", "-At", "-c",
        "select distinct conrelid::regclass::text from pg_constraint "
        "where contype = 'f' and confrelid = to_regclass('public.articles')").replace("public.", "").split())

    report = []
    with open(out / "data.sql", "w", encoding="utf-8", newline="\n") as f:
        f.write("SET session_replication_role = replica;\n\n")
        for t in tables:
            if t in SKIP_DATA:
                report.append(f"{t:32} skipped (cache/log)")
                continue
            conds = [FILTERS[t]] if t in FILTERS else []
            if t in child_of_articles:
                conds.append(ARTICLE_CHILD.format(cutoff=CUTOFF))
            cols = pg("psql", "-At", "-c",
                      f"select string_agg(quote_ident(attname), ', ' order by attnum) from pg_attribute "
                      f"where attrelid = 'public.{t}'::regclass and attnum > 0 and not attisdropped "
                      f"and attgenerated = ''").strip()
            where = f" where {' and '.join(conds)}" if conds else ""
            rows = pg("psql", "-q", "-c", f"copy (select {cols} from public.{t}{where}) to stdout")
            f.write(f"COPY public.{t} ({cols}) FROM stdin;\n{rows}\\.\n\n")
            report.append(f"{t:32} {rows.count(chr(10)):>8} rows{'  (filtered)' if conds else ''}")
        # Sequence positions, in pg_dump's setval form so import-supabase.py rewrites them to the project schema.
        f.write(pg("psql", "-At", "-c",
                   "select format('SELECT pg_catalog.setval(%L, %s, %s);', schemaname || '.' || sequencename, "
                   "coalesce(last_value, 1), last_value is not null) from pg_sequences where schemaname = 'public'"))
    (out / "report.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("\n".join(report))

    print("3/3 post-import SQL ...")
    (out / "4_post_import.sql").write_text(
        "-- Old images stay behind on Supabase: clear links to them so the app shows its fallback image.\n"
        "SET search_path = project_vaartanow;\n"
        "update blog_posts set og_image = null where og_image like '%.supabase.co/storage/%';\n"
        "update articles set image_url = null where image_url like '%.supabase.co/storage/%';\n"
        "update viral_videos set thumbnail_url = null where thumbnail_url like '%.supabase.co/storage/%';\n",
        encoding="utf-8")
    print(f"Done: {out}")


if __name__ == "__main__":
    main()
