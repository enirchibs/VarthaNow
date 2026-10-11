import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2, XCircle, Save, Mic, Video, Square, RotateCcw, Upload, Trash2, ExternalLink,
  ClipboardCheck, RefreshCw, ScrollText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";
import { categories } from "@/lib/categories";
import { CitizenReportsReview } from "@/components/admin/CitizenReportsReview";

// Editorial review: pipeline articles arrive as drafts. An editor fact-checks against the
// sources, edits, can record their own voice or video reading the article, then approves
// (publishes) or rejects it.

type Draft = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  og_image: string | null;
  word_count: number | null;
  created_at: string;
  source_article_url: string | null;
  source_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  presenter_name: string | null;
};

type Mode = "audio" | "video";
const MEDIA_BUCKET = "news-media";
const MAX_RECORDING_SECONDS = 240; // keeps a 720p video well under the 60 MB bucket limit

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const pickMime = (mode: Mode) =>
  (mode === "video"
    ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
  ).find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";

/** Records the editor reading the article, with the text shown as a teleprompter. */
function Recorder({ draft, presenter, onAttached }: { draft: Draft; presenter: string; onAttached: (patch: Partial<Draft>) => void }) {
  const [mode, setMode] = useState<Mode>("audio");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [autoScroll, setAutoScroll] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveRef = useRef<HTMLVideoElement | null>(null);
  const promptRef = useRef<HTMLDivElement | null>(null);
  const previewUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  const stopStream = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => { if (liveRef.current && stream) liveRef.current.srcObject = stream; }, [stream]);

  // recording timer + hard stop
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => {
      if (s + 1 >= MAX_RECORDING_SECONDS) recorderRef.current?.stop();
      return s + 1;
    }), 1000);
    return () => clearInterval(t);
  }, [recording]);

  // gentle teleprompter scroll while recording
  useEffect(() => {
    if (!recording || !autoScroll) return;
    const t = setInterval(() => promptRef.current?.scrollBy({ top: 1 }), 60);
    return () => clearInterval(t);
  }, [recording, autoScroll]);

  async function start() {
    setError("");
    setBlob(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: mode === "video" ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      setStream(media);
      const mimeType = pickMime(mode);
      const rec = new MediaRecorder(media, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64_000,
        ...(mode === "video" ? { videoBitsPerSecond: 1_200_000 } : {}),
      });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: (rec.mimeType || mimeType || (mode === "video" ? "video/webm" : "audio/webm")).split(";")[0] }));
        setRecording(false);
        media.getTracks().forEach((t) => t.stop());
        setStream(null);
      };
      recorderRef.current = rec;
      promptRef.current?.scrollTo({ top: 0 });
      setSeconds(0);
      rec.start(1000);
      setRecording(true);
    } catch (e: any) {
      setError(e?.name === "NotAllowedError" ? "Microphone/camera permission was denied." : e?.message || "Could not start recording.");
      stopStream();
    }
  }

  async function upload() {
    if (!blob || !supabase) return;
    setBusy(true);
    setError("");
    try {
      const ext = blob.type.includes("mp4") ? (mode === "video" ? "mp4" : "m4a") : "webm";
      const path = `${draft.slug}/${mode}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (upErr) throw upErr;
      const url = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      const patch: Partial<Draft> = mode === "video" ? { video_url: url, presenter_name: presenter } : { audio_url: url, presenter_name: presenter };
      const { error: dbErr } = await supabase.from("blog_posts").update(patch).eq("id", draft.id);
      if (dbErr) throw dbErr;
      onAttached(patch);
      setBlob(null);
    } catch (e: any) {
      setError(`Upload failed: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  }

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-black text-sm">Record yourself reading this article</h4>
        <div className="flex gap-1 rounded-xl bg-[hsl(var(--muted))] p-1">
          {(["audio", "video"] as Mode[]).map((m) => (
            <button key={m} disabled={recording} onClick={() => { setMode(m); setBlob(null); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${mode === m ? "bg-white shadow text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}>
              {m === "audio" ? <Mic className="size-3.5" /> : <Video className="size-3.5" />}
              {m === "audio" ? "Voice" : "Video (face)"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* teleprompter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1"><ScrollText className="size-3.5" /> Teleprompter</span>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} /> auto-scroll</label>
          </div>
          <div ref={promptRef} className="h-64 overflow-y-auto rounded-xl bg-slate-900 p-4 text-[1.15rem] leading-[1.9] text-white">
            <p className="font-black">{draft.title}</p>
            {draft.content.split(/\n{2,}/).map((p, i) => <p key={i} className="mt-3">{p}</p>)}
          </div>
        </div>

        {/* camera / result */}
        <div className="space-y-2">
          {mode === "video" && stream && <video ref={liveRef} autoPlay muted playsInline className="aspect-video w-full rounded-xl bg-black object-cover" />}
          {mode === "audio" && recording && (
            <div className="flex h-40 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-black">
              <Mic className="mr-2 size-6 animate-pulse" /> Recording voice…
            </div>
          )}
          {previewUrl && !recording && (mode === "video"
            ? <video src={previewUrl} controls playsInline className="aspect-video w-full rounded-xl bg-black" />
            : <audio src={previewUrl} controls className="w-full" />)}
          {!stream && !previewUrl && (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] p-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Read the article aloud in a calm news voice. Max {MAX_RECORDING_SECONDS / 60} minutes. {mode === "video" ? "Face the camera in good light." : "Use a quiet room."}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {!recording && !blob && (
              <Button onClick={start} className="h-10 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700">
                {mode === "audio" ? <Mic className="mr-1.5 size-4" /> : <Video className="mr-1.5 size-4" />} Start recording
              </Button>
            )}
            {recording && (
              <Button onClick={() => recorderRef.current?.stop()} className="h-10 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white">
                <Square className="mr-1.5 size-4 fill-white" /> Stop · {mmss}
              </Button>
            )}
            {blob && !recording && (
              <>
                <Button onClick={upload} disabled={busy} className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700">
                  <Upload className="mr-1.5 size-4" /> {busy ? "Uploading…" : `Attach ${mode} (${(blob.size / 1048576).toFixed(1)} MB)`}
                </Button>
                <Button onClick={() => setBlob(null)} disabled={busy} className="h-10 rounded-xl px-4 text-xs font-bold">
                  <RotateCcw className="mr-1.5 size-4" /> Record again
                </Button>
              </>
            )}
          </div>
          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function AiDraftsReview({ editorEmail }: { editorEmail?: string }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Draft | null>(null);
  const [presenter, setPresenter] = useState(() => localStorage.getItem("vn-presenter-name") || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, category, og_image, word_count, created_at, source_article_url, source_url, audio_url, video_url, presenter_name")
      .eq("review_status", "draft")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setMessage(`Could not load drafts: ${error.message}`);
    setDrafts((data ?? []) as Draft[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { localStorage.setItem("vn-presenter-name", presenter); }, [presenter]);
  useEffect(() => {
    const d = drafts.find((x) => x.id === selectedId) ?? null;
    setEdit(d ? { ...d } : null);
  }, [selectedId, drafts]);

  const bodyWords = edit ? words(edit.content) : 0;

  async function save(extra: Record<string, unknown> = {}, done?: string) {
    if (!supabase || !edit) return;
    setSaving(true);
    setMessage("");
    const n = words(edit.content);
    const { error } = await supabase.from("blog_posts").update({
      title: edit.title.trim(),
      excerpt: edit.excerpt.trim(),
      content: edit.content.trim(),
      category: edit.category,
      meta_title: edit.title.trim(),
      meta_description: edit.excerpt.trim().slice(0, 160),
      word_count: n,
      reading_time_min: Math.max(1, Math.round(n / 180)),
      presenter_name: edit.audio_url || edit.video_url ? (presenter.trim() || edit.presenter_name) : edit.presenter_name,
      ...extra,
    }).eq("id", edit.id);
    setSaving(false);
    if (error) { setMessage(`Failed: ${error.message}`); return; }
    setMessage(done ?? "Saved");
    if (done) { setSelectedId(null); await load(); }
    else setDrafts((list) => list.map((d) => (d.id === edit.id ? { ...edit } : d)));
  }

  const now = () => new Date().toISOString();
  const approve = () => save({ review_status: "approved", published: true, published_at: now(), reviewed_at: now(), reviewed_by: editorEmail ?? null }, "Approved and published");
  const reject = () => save({ review_status: "rejected", published: false, reviewed_at: now(), reviewed_by: editorEmail ?? null }, "Rejected");

  async function removeMedia(kind: "audio" | "video") {
    if (!supabase || !edit) return;
    const patch = kind === "audio" ? { audio_url: null } : { video_url: null };
    const { error } = await supabase.from("blog_posts").update(patch).eq("id", edit.id);
    if (error) { setMessage(error.message); return; }
    setEdit({ ...edit, ...patch });
    setDrafts((list) => list.map((d) => (d.id === edit.id ? { ...d, ...patch } : d)));
  }

  return (
    <div className="space-y-4 animate-in fade-in-40 duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="size-5 text-[hsl(var(--primary))]" />
          <h3 className="font-black text-base">Review queue</h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-700">{drafts.length} drafts</span>
        </div>
        <div className="flex items-center gap-2">
          <Input value={presenter} onChange={(e) => setPresenter(e.target.value)} placeholder="Your name (shown as presenter)" className="h-10 w-56 text-xs" />
          <Button onClick={load} className="h-10 rounded-xl px-3 text-xs font-bold"><RefreshCw className={`mr-1.5 size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>
      </div>
      {message && <p className="text-xs font-bold text-emerald-700">{message}</p>}

      {!edit && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && !drafts.length && <p className="text-sm text-[hsl(var(--muted-foreground))]">No drafts waiting. New ones arrive every 3 hours.</p>}
          {drafts.map((d) => (
            <button key={d.id} onClick={() => setSelectedId(d.id)} className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] text-left hover:border-[hsl(var(--primary))]">
              {d.og_image && <img src={d.og_image} alt="" className="aspect-video w-full object-cover" loading="lazy" />}
              <div className="space-y-1 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{d.category} · {d.word_count ?? words(d.content)} words · {new Date(d.created_at).toLocaleString()}</p>
                <p className="line-clamp-2 text-sm font-black">{d.title}</p>
                <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">{d.audio_url ? "🎙 voice " : ""}{d.video_url ? "🎥 video" : ""}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {edit && (
        <div className="space-y-4 rounded-2xl border border-[hsl(var(--border))] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setSelectedId(null)} className="text-xs font-bold text-[hsl(var(--primary))]">← All drafts</button>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[edit.source_article_url, edit.source_url].filter((u, i, a) => u && a.indexOf(u) === i).map((u, i) => (
                <a key={u!} href={u!} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-[hsl(var(--muted))] px-2 py-1 font-bold">
                  <ExternalLink className="size-3" /> Source {i + 1} (fact-check)
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              <label className="block text-xs font-bold">Headline
                <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="mt-1 text-sm font-bold" />
              </label>
              <label className="block text-xs font-bold">Summary (shown on the swipe card) · {words(edit.excerpt)} words
                <textarea value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} rows={3}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm leading-relaxed" />
              </label>
              <label className="block text-xs font-bold">Article · <span className={bodyWords < 150 || bodyWords > 300 ? "text-amber-600" : ""}>{bodyWords} words</span> (blank line between paragraphs)
                <textarea value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} rows={14}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm leading-relaxed" />
              </label>
              <label className="block text-xs font-bold">Category
                <select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 text-sm">
                  {[...new Set([edit.category, ...categories.map((c) => c.slug as string)])].filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="space-y-3">
              {edit.og_image && <img src={edit.og_image} alt="" className="w-full rounded-xl" />}
              {edit.audio_url && (
                <div className="space-y-1">
                  <p className="text-xs font-bold">🎙 Attached voice{edit.presenter_name ? ` · ${edit.presenter_name}` : ""}</p>
                  <audio src={edit.audio_url} controls className="w-full" />
                  <button onClick={() => removeMedia("audio")} className="flex items-center gap-1 text-[11px] font-bold text-rose-600"><Trash2 className="size-3" /> Remove voice</button>
                </div>
              )}
              {edit.video_url && (
                <div className="space-y-1">
                  <p className="text-xs font-bold">🎥 Attached video{edit.presenter_name ? ` · ${edit.presenter_name}` : ""}</p>
                  <video src={edit.video_url} controls playsInline className="w-full rounded-xl bg-black" />
                  <button onClick={() => removeMedia("video")} className="flex items-center gap-1 text-[11px] font-bold text-rose-600"><Trash2 className="size-3" /> Remove video</button>
                </div>
              )}
            </div>
          </div>

          <Recorder draft={edit} presenter={presenter.trim() || editorEmail || "VaartaNow"} onAttached={(patch) => {
            setEdit({ ...edit, ...patch });
            setDrafts((list) => list.map((d) => (d.id === edit.id ? { ...d, ...patch } : d)));
            setMessage(patch.video_url ? "Video attached" : "Voice attached");
          }} />

          <div className="flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-3">
            <Button onClick={approve} disabled={saving || !edit.title.trim() || !edit.content.trim()} className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
              <CheckCircle2 className="mr-1.5 size-4" /> Approve & publish
            </Button>
            <Button onClick={() => save()} disabled={saving} className="h-11 rounded-xl px-5 text-sm font-bold">
              <Save className="mr-1.5 size-4" /> Save draft
            </Button>
            <Button onClick={reject} disabled={saving} className="h-11 rounded-xl px-5 text-sm font-bold text-rose-600">
              <XCircle className="mr-1.5 size-4" /> Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Review Queue: AI-written drafts and reports sent in by citizen reporters. */
export function ReviewQueueDashboard({ editorEmail }: { editorEmail?: string }) {
  const [mode, setMode] = useState<"ai" | "citizen">("ai");
  return (
    <div className="space-y-4">
      <div className="inline-flex gap-1 rounded-2xl bg-[hsl(var(--muted))] p-1">
        {([["ai", "AI drafts"], ["citizen", "Citizen reports"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className={`rounded-xl px-4 py-2 text-xs font-black ${mode === id ? "bg-white text-[hsl(var(--foreground))] shadow" : "text-[hsl(var(--muted-foreground))]"}`}>
            {label}
          </button>
        ))}
      </div>
      {mode === "ai" ? <AiDraftsReview editorEmail={editorEmail} /> : <CitizenReportsReview editorEmail={editorEmail} />}
    </div>
  );
}
