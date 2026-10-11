import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Clock, FileText, Image as ImageIcon, Megaphone,
  Newspaper, RefreshCw, Rss, TrendingDown, TrendingUp, Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { categoryLabel } from "@/lib/categories";

// ═══════════════════════════════════════════════════════════════════
//  Newsroom overview: the admin landing page. One screen that answers
//  "what needs me now?" — review queue, feed health, today's output and
//  the AI pipeline — from live database numbers.
// ═══════════════════════════════════════════════════════════════════

export type OverviewTarget = "review" | "feeds" | "images" | "queue" | "articles";

type FeedLite = { id: string; url: string; publisher: string; category: string; consecutive_failures: number; last_fetched_at: string | null };
type JobStats = { pending: number; processing: number; done: number; failed: number; dead: number };
type PostRow = { slug: string; title: string; category: string; published: boolean; published_at: string | null; created_at: string; review_status: string | null; ai_assisted: boolean | null; author_name: string | null };
type ReportRow = { id: string; title: string | null; description: string; kind: string; area: string | null; status: string; created_at: string; reporter_name: string | null };

export type NewsroomCounts = { drafts: number; reports: number; photos: number; applications: number };

/** Counts for the sidebar badges and the overview cards. */
export function useNewsroomCounts(refreshKey: string | number = 0): NewsroomCounts {
  const [counts, setCounts] = useState<NewsroomCounts>({ drafts: 0, reports: 0, photos: 0, applications: 0 });
  useEffect(() => {
    if (!supabase) return;
    const db = supabase;
    const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
    Promise.all([
      count(db.from("blog_posts").select("id", { count: "exact", head: true }).eq("review_status", "draft")),
      count(db.from("citizen_reports").select("id", { count: "exact", head: true }).eq("status", "pending")),
      count(db.from("image_library").select("id", { count: "exact", head: true }).eq("review_status", "pending")),
      count(db.from("citizen_journalist_applications").select("id", { count: "exact", head: true }).eq("status", "pending")),
    ]).then(([drafts, reports, photos, applications]) => setCounts({ drafts, reports, photos, applications })).catch(() => {});
  }, [refreshKey]);
  return counts;
}

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};
const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0);
const CATEGORY_COLORS = ["#dc2626", "#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#65a30d"];

function Panel({ title, right, children, className = "" }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm ${className}`}>
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
        <h3 className="text-sm font-black">{title}</h3>
        <div className="flex-1" />
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Kpi({ label, value, sub, delta, color, icon: Icon, onClick }: {
  label: string; value: string | number; sub?: string; delta?: number | null; color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; onClick?: () => void;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default"
    >
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))]">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
          <Icon className="size-4" style={{ color }} />
        </span>
      </div>
      <div className="mt-2 text-3xl font-black leading-none tracking-tight">{value}</div>
      <div className="mt-2.5 flex min-h-[18px] items-center gap-1 text-xs font-semibold">
        {delta != null && (
          <span className={`flex items-center gap-1 font-mono ${up ? "text-emerald-600" : "text-red-600"}`}>
            {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="font-normal text-[hsl(var(--muted-foreground))]">{sub}</span>}
      </div>
    </button>
  );
}

export function NewsroomOverview({ feeds, jobStats, counts, onNavigate, refreshKey = 0 }: {
  feeds: FeedLite[]; jobStats: JobStats; counts: NewsroomCounts; onNavigate: (tab: OverviewTarget) => void; refreshKey?: number;
}) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reporters, setReporters] = useState(0);
  const [library, setLibrary] = useState({ total: 0, licensed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;
    setLoading(true);
    const since = new Date(Date.now() - 14 * DAY).toISOString();
    Promise.all([
      db.from("blog_posts").select("slug, title, category, published, published_at, created_at, review_status, ai_assisted, author_name")
        .or(`created_at.gte.${since},published_at.gte.${since}`).order("created_at", { ascending: false }).limit(2000),
      db.from("citizen_reports").select("id, title, description, kind, area, status, created_at, reporter_name")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(500),
      db.from("citizen_reporters").select("user_id", { count: "exact", head: true }).eq("status", "active"),
      db.from("image_library").select("id", { count: "exact", head: true }).eq("active", true).eq("review_status", "approved"),
      db.from("image_library").select("id", { count: "exact", head: true }).eq("active", true).eq("review_status", "approved").eq("is_ai_generated", false),
    ]).then(([p, r, rep, lib, real]) => {
      setPosts((p.data ?? []) as PostRow[]);
      setReports((r.data ?? []) as ReportRow[]);
      setReporters(rep.count ?? 0);
      setLibrary({ total: lib.count ?? 0, licensed: real.count ?? 0 });
    }).finally(() => setLoading(false));
  }, [refreshKey]);

  const s = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    const yesterday = today - DAY;
    const pubAt = (p: PostRow) => (p.published && p.published_at ? new Date(p.published_at).getTime() : null);
    const publishedToday = posts.filter((p) => (pubAt(p) ?? 0) >= today).length;
    const publishedYesterday = posts.filter((p) => { const t = pubAt(p); return t != null && t >= yesterday && t < today; }).length;

    // last 14 days: AI drafts written vs articles published, per day
    const days = Array.from({ length: 14 }, (_, i) => {
      const start = today - (13 - i) * DAY;
      const inDay = (t: number | null) => t != null && t >= start && t < start + DAY;
      return {
        label: new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        published: posts.filter((p) => inDay(pubAt(p))).length,
        drafted: posts.filter((p) => p.ai_assisted && inDay(new Date(p.created_at).getTime())).length,
      };
    });

    // published per category, last 7 days
    const weekAgo = today - 6 * DAY;
    const byCat = new Map<string, number>();
    for (const p of posts) if ((pubAt(p) ?? 0) >= weekAgo) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);
    const cats = [...byCat].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const catTotal = cats.reduce((n, [, c]) => n + c, 0) || 1;

    // AI pipeline, last 24 hours
    const dayAgo = Date.now() - DAY;
    const ai = posts.filter((p) => p.ai_assisted && new Date(p.created_at).getTime() >= dayAgo);
    const pipeline = [
      { stage: "Feeds working", n: feeds.filter((f) => !f.consecutive_failures).length },
      { stage: "AI drafts written", n: ai.length },
      { stage: "Waiting for review", n: ai.filter((p) => p.review_status === "draft").length },
      { stage: "Approved", n: ai.filter((p) => p.review_status === "approved").length },
      { stage: "Published", n: ai.filter((p) => p.published).length },
    ];
    const rejected24h = ai.filter((p) => p.review_status === "rejected").length;

    // citizen reporters, last 7 days
    const week = reports.filter((r) => new Date(r.created_at).getTime() >= weekAgo);
    const decided = week.filter((r) => r.status !== "pending");
    const approvalRate = decided.length ? Math.round((week.filter((r) => r.status === "approved").length / decided.length) * 100) : null;

    const failing = feeds.filter((f) => f.consecutive_failures > 0).sort((a, b) => b.consecutive_failures - a.consecutive_failures);
    const waiting = [
      ...posts.filter((p) => p.review_status === "draft").map((p) => ({ key: p.slug, kind: "AI draft", title: p.title, meta: categoryLabel(p.category, "te"), at: p.created_at })),
      ...reports.filter((r) => r.status === "pending").map((r) => ({ key: r.id, kind: r.kind === "issue" ? "Citizen · issue" : "Citizen · news", title: r.title || r.description.slice(0, 90), meta: [r.reporter_name, r.area].filter(Boolean).join(" · "), at: r.created_at })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

    return { publishedToday, publishedYesterday, days, cats, catTotal, pipeline, rejected24h, week, approvalRate, failing, waiting };
  }, [posts, reports, feeds]);

  const maxDay = Math.max(1, ...s.days.map((d) => Math.max(d.published, d.drafted)));
  const maxPipe = Math.max(1, ...s.pipeline.map((p) => p.n));
  const waitingTotal = counts.drafts + counts.reports + counts.applications;
  const healthy = s.failing.length === 0 && jobStats.failed + jobStats.dead === 0;

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Published today" value={s.publishedToday} delta={pct(s.publishedToday, s.publishedYesterday)} sub="vs yesterday" color="#dc2626" icon={Newspaper} onClick={() => onNavigate("articles")} />
        <Kpi label="Waiting for review" value={waitingTotal} sub={`${counts.drafts} AI drafts · ${counts.reports} citizen${counts.applications ? ` · ${counts.applications} applications` : ""}`} color="#d97706" icon={Clock} onClick={() => onNavigate("review")} />
        <Kpi label="Feeds working" value={`${feeds.length - s.failing.length}/${feeds.length}`} sub={s.failing.length ? `${s.failing.length} failing` : "all healthy"} color={s.failing.length ? "#dc2626" : "#059669"} icon={Rss} onClick={() => onNavigate("feeds")} />
        <Kpi label="Photos to review" value={counts.photos} sub={`${library.licensed} licensed · ${library.total} in library`} color="#2563eb" icon={ImageIcon} onClick={() => onNavigate("images")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* 14-day chart */}
        <Panel
          title="Articles · last 14 days"
          right={
            <span className="flex items-center gap-3 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-red-600" />Published</span>
              <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-red-200" />AI drafts</span>
            </span>
          }
        >
          <div className="flex h-44 items-end gap-1.5">
            {s.days.map((d, i) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.label}: ${d.published} published, ${d.drafted} AI drafts`}>
                <div className="flex h-36 w-full items-end justify-center gap-0.5">
                  <div className="w-1/2 rounded-t bg-red-200 dark:bg-red-900/60" style={{ height: `${(d.drafted / maxDay) * 100}%` }} />
                  <div className={`w-1/2 rounded-t ${i === s.days.length - 1 ? "bg-red-600" : "bg-red-500/80"}`} style={{ height: `${(d.published / maxDay) * 100}%` }} />
                </div>
                <span className={`font-mono text-[9.5px] text-[hsl(var(--muted-foreground))] ${i % 2 ? "hidden sm:block" : ""}`}>{d.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* by category */}
        <Panel title="Published by category · 7 days">
          {s.cats.length === 0 ? (
            <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">{loading ? "Loading…" : "Nothing published this week yet."}</p>
          ) : (
            <div className="space-y-3">
              {s.cats.map(([cat, n], i) => (
                <div key={cat} className="flex items-center gap-2.5">
                  <span className="w-28 truncate text-[13px] font-semibold" title={cat}>{categoryLabel(cat, "te")}</span>
                  <div className="h-2 flex-1 rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full rounded-full" style={{ width: `${(n / s.catTotal) * 100}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-bold">{n}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* pipeline funnel */}
      <Panel
        title="AI news pipeline · last 24 hours"
        right={
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${healthy ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
            {healthy ? "Healthy" : "Needs attention"}
          </span>
        }
      >
        <div className="grid grid-cols-3 gap-y-5 sm:flex sm:items-stretch">
          {s.pipeline.map((p, i) => (
            <div key={p.stage} className="flex flex-1 items-center">
              <div className="flex-1 text-center">
                <div className="text-2xl font-black">{p.n}</div>
                <div className="mt-0.5 text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">{p.stage}</div>
                <div className="mx-auto mt-2 h-1.5 w-4/5 rounded-full bg-red-600" style={{ opacity: Math.max(0.15, p.n / maxPipe) }} />
              </div>
              {i < s.pipeline.length - 1 && <ChevronRight className="hidden size-4 shrink-0 text-[hsl(var(--muted-foreground))] sm:block" />}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
          The pipeline runs every 3 hours and saves drafts only; nothing is published without your approval.
          {s.rejected24h > 0 && ` ${s.rejected24h} draft(s) rejected in the last 24 h.`}
        </p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* needs attention */}
        <Panel
          title="Needs your attention"
          right={
            <button onClick={() => onNavigate("review")} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:underline">
              Open review queue <ArrowRight className="size-3.5" />
            </button>
          }
        >
          {s.waiting.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-[hsl(var(--muted-foreground))]">
              <CheckCircle2 className="size-8 text-emerald-500" />
              {loading ? "Loading…" : "All caught up: nothing is waiting."}
            </div>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {s.waiting.map((w) => (
                <li key={w.key}>
                  <button onClick={() => onNavigate("review")} className="flex w-full items-start gap-3 py-2.5 text-left hover:bg-[hsl(var(--muted))]/40">
                    <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black ${w.kind === "AI draft" ? "bg-violet-500/15 text-violet-600" : "bg-amber-500/15 text-amber-700"}`}>{w.kind}</span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-bold">{w.title}</span>
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{[w.meta, ago(w.at)].filter(Boolean).join(" · ")}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="grid gap-5">
          {/* citizen reporters */}
          <Panel title="Citizen reporters">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <Users className="mx-auto mb-1 size-4 text-amber-600" />
                <div className="text-xl font-black">{reporters}</div>
                <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Appointed</div>
              </div>
              <div>
                <Megaphone className="mx-auto mb-1 size-4 text-blue-600" />
                <div className="text-xl font-black">{s.week.length}</div>
                <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Reports · 7 days</div>
              </div>
              <div>
                <CheckCircle2 className="mx-auto mb-1 size-4 text-emerald-600" />
                <div className="text-xl font-black">{s.approvalRate == null ? "—" : `${s.approvalRate}%`}</div>
                <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Approval rate</div>
              </div>
            </div>
          </Panel>

          {/* feeds and jobs */}
          <Panel
            title="Feeds & background jobs"
            right={
              <button onClick={() => onNavigate(s.failing.length ? "feeds" : "queue")} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:underline">
                Details <ArrowRight className="size-3.5" />
              </button>
            }
          >
            <div className="mb-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-2"><div className="text-lg font-black text-[hsl(var(--foreground))]">{jobStats.pending + jobStats.processing}</div>Jobs pending</div>
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-2"><div className="text-lg font-black text-[hsl(var(--foreground))]">{jobStats.done}</div>Completed</div>
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-2"><div className={`text-lg font-black ${jobStats.failed + jobStats.dead ? "text-red-600" : "text-[hsl(var(--foreground))]"}`}>{jobStats.failed + jobStats.dead}</div>Failed</div>
            </div>
            {s.failing.length === 0 ? (
              <p className="flex items-center gap-2 text-xs font-semibold text-emerald-600"><CheckCircle2 className="size-4" /> All {feeds.length} feeds fetched without errors.</p>
            ) : (
              <ul className="space-y-1.5">
                {s.failing.slice(0, 4).map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="size-3.5 shrink-0 text-red-500" />
                    <span className="font-bold">{f.publisher}</span>
                    <span className="min-w-0 flex-1 truncate text-[hsl(var(--muted-foreground))]">{f.url}</span>
                    <span className="font-mono text-red-600">{f.consecutive_failures}×</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
        <RefreshCw className="size-3" /> Live from the database. Use “Sync Data” to refresh. <FileText className="ml-2 size-3" /> Counts cover the last 14 days.
      </p>
    </div>
  );
}
