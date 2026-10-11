import { useCallback, useEffect, useState } from "react";
import { embedUrl, youtubeIdOf } from "@/lib/videos-api";
import { CheckCircle2, XCircle, Phone, UserCheck, UserX, RefreshCw, MapPin, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";
import { categories } from "@/lib/categories";
import type { ReportMedia } from "@/lib/citizen-reports";

// Citizen reports (local news / public issues) waiting for an editor. Approving turns a
// report into a published article that keeps the reporter's photos, video and voice note.

type Report = {
  id: string;
  kind: "news" | "issue";
  title: string | null;
  description: string;
  area: string | null;
  media: ReportMedia[];
  voice_url: string | null;
  reporter_id: string;
  reporter_name: string | null;
  reporter_phone: string | null;
  created_at: string;
};
type Reporter = { user_id: string; name: string; status: "active" | "revoked" };

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const firstWords = (s: string, n: number) => s.split(/\s+/).filter(Boolean).slice(0, n).join(" ");

export function CitizenReportsReview({ editorEmail }: { editorEmail?: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [reporters, setReporters] = useState<Record<string, Reporter>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Report | null>(null);
  const [form, setForm] = useState({ title: "", summary: "", body: "", category: "local", byline: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [r, rep] = await Promise.all([
      supabase.from("citizen_reports").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(100),
      supabase.from("citizen_reporters").select("user_id, name, status"),
    ]);
    if (r.error) setMessage(`Could not load reports: ${r.error.message}`);
    setReports((r.data ?? []) as Report[]);
    setReporters(Object.fromEntries(((rep.data ?? []) as Reporter[]).map((x) => [x.user_id, x])));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  function openReport(r: Report) {
    const name = reporters[r.reporter_id]?.name || r.reporter_name || "పౌర రిపోర్టర్";
    setOpen(r);
    setMessage("");
    setForm({
      title: r.title || firstWords(r.description, 12),
      summary: firstWords(r.description, 45),
      body: r.description,
      category: r.kind === "issue" ? "issues" : "local",
      byline: name,
      note: "",
    });
  }

  const appointed = (r: Report) => reporters[r.reporter_id]?.status === "active";

  async function setAppointment(r: Report, active: boolean) {
    if (!supabase) return;
    const { error } = await supabase.from("citizen_reporters").upsert({
      user_id: r.reporter_id,
      name: form.byline.trim() || r.reporter_name || "Citizen reporter",
      phone: r.reporter_phone,
      area: r.area,
      status: active ? "active" : "revoked",
      appointed_by: editorEmail ?? null,
      appointed_at: new Date().toISOString(),
    });
    if (error) { setMessage(error.message); return; }
    setReporters((m) => ({ ...m, [r.reporter_id]: { user_id: r.reporter_id, name: form.byline.trim() || r.reporter_name || "", status: active ? "active" : "revoked" } }));
    setMessage(active ? "Appointed as citizen reporter" : "Reporter appointment revoked");
  }

  async function approve() {
    if (!supabase || !open) return;
    setBusy(true);
    setMessage("");
    const now = new Date().toISOString();
    const image = open.media.find((m) => m.type === "image")?.url ?? null;
    const video = open.media.find((m) => m.type === "video")?.url ?? null;
    const n = words(form.body);
    const slug = `${form.category}-${now.slice(0, 10)}-${open.id.slice(0, 8)}`;
    const name = form.byline.trim() || "పౌర రిపోర్టర్";
    const { data: post, error } = await supabase.from("blog_posts").insert({
      slug,
      title: form.title.trim(),
      excerpt: form.summary.trim(),
      content: form.body.trim(),
      category: form.category,
      tags: [open.area, open.kind === "issue" ? "ప్రజా సమస్య" : "స్థానిక వార్త"].filter(Boolean),
      meta_title: form.title.trim(),
      meta_description: form.summary.trim().slice(0, 160),
      og_image: image,
      video_url: video,
      audio_url: open.voice_url,
      presenter_name: open.voice_url || video ? name : null,
      author_name: `సిటిజన్ రిపోర్టర్ · ${name}`,
      publisher: "VaartaNow",
      language: "te",
      published: true,
      featured: false,
      review_status: "approved",
      reviewed_at: now,
      reviewed_by: editorEmail ?? null,
      ai_assisted: false,
      reading_time_min: Math.max(1, Math.round(n / 180)),
      word_count: n,
      published_at: now,
    }).select("id").single();
    if (error) { setBusy(false); setMessage(`Publish failed: ${error.message}`); return; }
    const { error: e2 } = await supabase.from("citizen_reports").update({
      status: "approved", published_post_id: post.id, reviewed_at: now, reviewed_by: editorEmail ?? null, review_note: form.note || null,
    }).eq("id", open.id);
    setBusy(false);
    if (e2) { setMessage(`Published, but report status not updated: ${e2.message}`); return; }
    setMessage(`Published: /news/${slug}`);
    setOpen(null);
    void load();
  }

  async function reject() {
    if (!supabase || !open) return;
    setBusy(true);
    const { error } = await supabase.from("citizen_reports").update({
      status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: editorEmail ?? null, review_note: form.note || null,
    }).eq("id", open.id);
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Report rejected");
    setOpen(null);
    void load();
  }

  if (open) {
    const r = open;
    return (
      <div className="space-y-4 rounded-2xl border border-[hsl(var(--border))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button onClick={() => setOpen(null)} className="text-xs font-bold text-[hsl(var(--primary))]">← All citizen reports</button>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${r.kind === "issue" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
            {r.kind === "issue" ? "ప్రజా సమస్య · Issue" : "స్థానిక వార్త · Local news"}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* what the citizen sent */}
          <div className="space-y-3">
            <div className="rounded-xl bg-[hsl(var(--muted))]/60 p-3 text-xs">
              <p className="font-black">{r.reporter_name || "Citizen"} {appointed(r) && <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">Appointed reporter</span>}</p>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-[hsl(var(--muted-foreground))]">
                {r.area && <span className="flex items-center gap-1"><MapPin className="size-3" />{r.area}</span>}
                {r.reporter_phone && <a href={`tel:${r.reporter_phone}`} className="flex items-center gap-1 font-bold text-[hsl(var(--primary))]"><Phone className="size-3" />{r.reporter_phone}</a>}
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </p>
              <div className="mt-2">
                {appointed(r)
                  ? <button onClick={() => setAppointment(r, false)} className="flex items-center gap-1 text-[11px] font-bold text-rose-600"><UserX className="size-3.5" />Revoke reporter</button>
                  : <button onClick={() => setAppointment(r, true)} className="flex items-center gap-1 text-[11px] font-bold text-emerald-700"><UserCheck className="size-3.5" />Appoint as citizen reporter</button>}
              </div>
            </div>
            {r.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {r.media.map((m) => m.type === "video"
                  ? (youtubeIdOf(m.url)
                    ? <iframe key={m.url} src={embedUrl(youtubeIdOf(m.url)!).replace("autoplay=1&", "")} title="YouTube" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full rounded-xl bg-black" />
                    : <video key={m.url} src={m.url} controls playsInline className="w-full rounded-xl bg-black" />)
                  : <a key={m.url} href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt="" className="w-full rounded-xl object-cover" /></a>)}
              </div>
            )}
            {r.voice_url && <div><p className="text-xs font-bold">🎙 Reporter's voice note</p><audio src={r.voice_url} controls className="w-full" /></div>}
            <div className="rounded-xl border border-[hsl(var(--border))] p-3 text-sm leading-relaxed">
              {r.title && <p className="mb-1 font-black">{r.title}</p>}
              <p className="whitespace-pre-wrap">{r.description}</p>
            </div>
          </div>

          {/* the article that will be published */}
          <div className="space-y-3">
            <label className="block text-xs font-bold">Headline
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 text-sm font-bold" />
            </label>
            <label className="block text-xs font-bold">Summary (swipe card) · {words(form.summary)} words
              <textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm" />
            </label>
            <label className="block text-xs font-bold">Article · {words(form.body)} words (blank line between paragraphs)
              <textarea rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm leading-relaxed" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-bold">Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-2 text-sm">
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label.te} ({c.slug})</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold">Reporter name (byline)
                <Input value={form.byline} onChange={(e) => setForm({ ...form, byline: e.target.value })} className="mt-1 h-10 text-sm" />
              </label>
            </div>
            <label className="block text-xs font-bold">Note to reporter / reason (optional)
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 h-10 text-sm" />
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={approve} disabled={busy || !form.title.trim() || !form.body.trim()} className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
                <CheckCircle2 className="mr-1.5 size-4" /> Approve & publish
              </Button>
              <Button onClick={reject} disabled={busy} className="h-11 rounded-xl px-5 text-sm font-bold text-rose-600">
                <XCircle className="mr-1.5 size-4" /> Reject
              </Button>
            </div>
            {message && <p className="text-xs font-bold text-emerald-700">{message}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-black"><Megaphone className="size-4" /> {reports.length} citizen report(s) waiting</p>
        <Button onClick={load} className="h-9 rounded-xl px-3 text-xs font-bold"><RefreshCw className={`mr-1.5 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>
      {message && <p className="text-xs font-bold text-emerald-700">{message}</p>}
      {!loading && !reports.length && <p className="text-sm text-[hsl(var(--muted-foreground))]">No citizen reports waiting.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => {
          const thumb = r.media.find((m) => m.type === "image")?.url;
          return (
            <button key={r.id} onClick={() => openReport(r)} className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] text-left hover:border-[hsl(var(--primary))]">
              {thumb && <img src={thumb} alt="" className="aspect-video w-full object-cover" loading="lazy" />}
              <div className="space-y-1 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {r.kind === "issue" ? "సమస్య" : "వార్త"} · {r.area || "—"} · {new Date(r.created_at).toLocaleString()}
                </p>
                <p className="line-clamp-2 text-sm font-black">{r.title || firstWords(r.description, 12)}</p>
                <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                  {r.reporter_name || "Citizen"}{appointed(r) ? " ✅" : ""} · {r.media.length} media{r.voice_url ? " · 🎙" : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
