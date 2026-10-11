import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Clapperboard, ExternalLink, Radio, RotateCcw, Send, Square, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { categories } from "@/lib/categories";
import { Button, Input } from "@/components/ui";
import { NewsStudio, SCROLL_SPEEDS, STUDIO_BACKGROUNDS, TICKER_LABELS, backgroundSwatch, type PresenterSide, type StudioSettings } from "@/lib/news-studio";

/** Latest published VaartaNow headlines, for the studio's headlines ticker. */
export function useLatestHeadlines(limit = 12) {
  const [titles, setTitles] = useState<string[]>([]);
  useEffect(() => {
    supabase?.from("blog_posts").select("title").eq("published", true).order("published_at", { ascending: false }).limit(limit)
      .then(({ data }) => setTitles((data ?? []).map((r) => r.title as string)));
  }, [limit]);
  return titles;
}

// ═══════════════════════════════════════════════════════════════════
//  Live Studio: an editor records a standalone video bulletin in the
//  virtual studio and publishes it straight to the site as a video
//  article (no review step; admins and editors only, enforced by RLS).
// ═══════════════════════════════════════════════════════════════════

const MEDIA_BUCKET = "news-media";
const MAX_SECONDS = 360; // 6 min at ~1 Mbps stays under the 60 MB bucket limit

const pickMime = () =>
  ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
    .find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";

const slugify = (s: string) => `live-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 8)}${s ? "" : ""}`;

export function LiveStudio({ editorEmail }: { editorEmail?: string | null }) {
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("local");
  const [presenter, setPresenter] = useState(() => { try { return localStorage.getItem("vn-presenter-name") || ""; } catch { return ""; } });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [poster, setPoster] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [published, setPublished] = useState<{ slug: string; title: string } | null>(null);
  const [studio, setStudio] = useState<StudioSettings>({
    background: "studio-red", logo: true, clock: true, strap: true, ticker: true, live: true, breaking: true, vnTicker: true, desk: true, speed: 0.6,
    tickerLabel: TICKER_LABELS[0], tickerText: "", presenter: "", strapLine: "", breakingText: "",
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const studioRef = useRef<NewsStudio | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const previewUrl = blob ? URL.createObjectURL(blob) : null;
  const headlines = useLatestHeadlines();
  const set = <K extends keyof StudioSettings>(k: K, v: StudioSettings[K]) => setStudio((st) => ({ ...st, [k]: v }));

  // the graphics follow the form: headline on the strap and ticker, presenter on the strap
  const effective: StudioSettings = {
    ...studio,
    presenter: presenter || "VaartaNow",
    strapLine: studio.strapLine || headline || "VaartaNow ప్రతినిధి",
    tickerText: studio.tickerText || headline || "VaartaNow తెలుగు వార్తలు",
    breakingText: studio.breakingText || headline,
    headlines,
  };
  useEffect(() => { studioRef.current?.update(effective); });
  useEffect(() => { try { localStorage.setItem("vn-presenter-name", presenter); } catch { /* private mode */ } }, [presenter]);
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    if (!stream || !canvasRef.current || !videoRef.current) return;
    const st = new NewsStudio(canvasRef.current, videoRef.current, effective);
    st.onStatus = setStatus;
    st.start();
    studioRef.current = st;
    return () => { st.stop(); studioRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => {
      if (s + 1 >= MAX_SECONDS) recRef.current?.stop();
      return s + 1;
    }), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const openCamera = async () => {
    setError("");
    try {
      setStream(await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      }));
    } catch (e: any) {
      setError(e?.name === "NotAllowedError" ? "Camera/microphone permission was denied." : e?.message || "Could not open the camera.");
    }
  };
  const closeCamera = () => { stream?.getTracks().forEach((t) => t.stop()); setStream(null); };

  const start = () => {
    if (!stream || !studioRef.current || !canvasRef.current) return;
    if (!headline.trim()) return setError("Write the headline first; it is shown on the ticker and the article.");
    setError("");
    setBlob(null);
    // first frame as the article's cover image
    canvasRef.current.toBlob((b) => setPoster(b), "image/jpeg", 0.85);
    const mime = pickMime();
    const rec = new MediaRecorder(studioRef.current.stream(stream.getAudioTracks()), {
      ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 1_000_000, audioBitsPerSecond: 64_000,
    });
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => {
      setBlob(new Blob(chunks.current, { type: (rec.mimeType || mime || "video/webm").split(";")[0] }));
      setRecording(false);
    };
    recRef.current = rec;
    setSeconds(0);
    rec.start(1000);
    setRecording(true);
  };

  const publish = async () => {
    if (!supabase || !blob) return;
    if (!headline.trim()) return setError("Headline is required.");
    setBusy(true);
    setError("");
    try {
      const slug = slugify(headline);
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const up = async (path: string, b: Blob) => {
        const { error: e } = await supabase!.storage.from(MEDIA_BUCKET).upload(path, b, { contentType: b.type, cacheControl: "31536000" });
        if (e) throw e;
        return supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      };
      const video_url = await up(`live/${slug}.${ext}`, blob);
      const og_image = poster ? await up(`live/${slug}.jpg`, poster) : null;
      const text = summary.trim() || headline.trim();
      const now = new Date().toISOString();
      const { error: e } = await supabase.from("blog_posts").insert({
        slug, title: headline.trim(), excerpt: text.slice(0, 300), content: text, category, tags: ["live", "video"],
        meta_title: `${headline.trim()} | VaartaNow లైవ్`, meta_description: text.slice(0, 155),
        author_name: presenter.trim() || "VaartaNow", presenter_name: presenter.trim() || null, publisher: "VaartaNow",
        language: "te", published: true, published_at: now, featured: false, video_url, og_image,
        review_status: "approved", reviewed_by: editorEmail ?? null, reviewed_at: now, ai_assisted: false,
        reading_time_min: Math.max(1, Math.round(seconds / 60)), word_count: text.split(/\s+/).filter(Boolean).length,
      });
      if (e) throw e;
      setPublished({ slug, title: headline.trim() });
      setBlob(null); setPoster(null); setHeadline(""); setSummary("");
      closeCamera();
    } catch (e: any) {
      setError(`Publishing failed: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const card = "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm";

  return (
    <div className="space-y-4">
      {published && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="size-5" /> Published: {published.title}
          <Link to={`/news/${published.slug}`} target="_blank" className="flex items-center gap-1 underline">Open <ExternalLink className="size-3.5" /></Link>
          <button onClick={() => setPublished(null)} className="ml-auto text-xs">Record another</button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        {/* stage */}
        <div className={`${card} space-y-3`}>
          <div className="relative overflow-hidden rounded-xl bg-black">
            {stream ? (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="pointer-events-none absolute h-px w-px opacity-0" />
                <canvas ref={canvasRef} className="aspect-video w-full" />
              </>
            ) : previewUrl ? (
              <video src={previewUrl} controls playsInline className="aspect-video w-full" />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 text-center text-sm text-zinc-400">
                <Radio className="size-10 text-red-500" />
                Open the camera to set up your studio, then record and publish.
              </div>
            )}
            {recording && (
              <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-black text-white">
                <span className="size-2 animate-pulse rounded-full bg-white" /> REC {mmss} / {MAX_SECONDS / 60}:00
              </span>
            )}
          </div>
          {status && <p className="text-[11px] font-bold text-amber-600">{status}</p>}
          <div className="flex flex-wrap gap-2">
            {!stream && !blob && (
              <Button onClick={openCamera} className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"><Camera className="mr-1.5 size-4" /> Open camera & studio</Button>
            )}
            {stream && !recording && (
              <Button onClick={start} className="h-11 rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700"><Radio className="mr-1.5 size-4" /> Start recording</Button>
            )}
            {recording && (
              <Button onClick={() => recRef.current?.stop()} className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"><Square className="mr-1.5 size-4 fill-white" /> Stop · {mmss}</Button>
            )}
            {stream && !recording && (
              <Button onClick={closeCamera} variant="secondary" className="h-11 rounded-xl px-4 text-sm font-bold"><X className="mr-1 size-4" /> Close camera</Button>
            )}
            {blob && !recording && (
              <>
                <Button onClick={publish} disabled={busy} className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700">
                  <Send className="mr-1.5 size-4" /> {busy ? "Publishing…" : `Publish now (${(blob.size / 1048576).toFixed(1)} MB)`}
                </Button>
                <Button onClick={() => setBlob(null)} disabled={busy} variant="secondary" className="h-11 rounded-xl px-4 text-sm font-bold"><RotateCcw className="mr-1.5 size-4" /> Discard</Button>
              </>
            )}
          </div>
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Published immediately as a video article, without review. Only say what you have verified; the article shows your name as presenter. Max {MAX_SECONDS / 60} minutes.
          </p>
        </div>

        {/* story + studio */}
        <div className="space-y-4">
          <div className={`${card} space-y-2.5`}>
            <h3 className="text-sm font-black">Story</h3>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="హెడ్‌లైన్ (తెలుగులో) *" className="h-11 rounded-xl text-[15px]" />
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="క్లుప్తంగా వివరణ (ఆర్టికల్‌లో వీడియో కింద చూపిస్తుంది)"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-[14px] outline-none focus:border-red-500" />
            <div className="grid grid-cols-2 gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-2 text-sm font-bold">
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label.te}</option>)}
              </select>
              <Input value={presenter} onChange={(e) => setPresenter(e.target.value)} placeholder="Presenter name" className="h-10 rounded-xl text-sm" />
            </div>
          </div>

          <div className={`${card} space-y-3`}>
            <h3 className="flex items-center gap-1.5 text-sm font-black"><Clapperboard className="size-4 text-red-600" /> Studio</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {STUDIO_BACKGROUNDS.map((b) => (
                <button key={b.id} type="button" onClick={() => setStudio((st) => ({ ...st, background: b.id, side: b.side ?? st.side ?? "center" }))} title={b.label}
                  className={`overflow-hidden rounded-lg border-2 ${studio.background === b.id ? "border-red-600" : "border-transparent opacity-80 hover:opacity-100"}`}>
                  <div className="aspect-video bg-cover bg-center"
                    style={b.url ? { backgroundImage: `url(${b.url})` } : { background: backgroundSwatch(b) }}>
                    {!b.url && <span className="flex h-full items-center justify-center text-[9px] font-black text-white">{b.kind === "brand" ? "VaartaNow" : b.kind === "breaking" ? "BREAKING" : b.kind === "wall" ? "News wall" : b.kind === "blur" ? "Blur" : "Camera"}</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              {([["live", "LIVE badge"], ["logo", "VaartaNow logo"], ["clock", "Date & time"], ["strap", "Name strap"], ["desk", "Sit at news desk"], ["breaking", "Breaking (top right)"], ["ticker", "News ticker"], ["vnTicker", "VaartaNow headlines"]] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={!!studio[k]} onChange={(e) => set(k, e.target.checked)} className="accent-red-600" /> {label}</label>
              ))}
            </div>
            {studio.ticker && (
              <div className="space-y-1.5">
                <select value={studio.tickerLabel} onChange={(e) => set("tickerLabel", e.target.value)} className="h-9 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs font-bold">
                  {TICKER_LABELS.map((l) => <option key={l}>{l}</option>)}
                </select>
                <Input value={studio.tickerText} onChange={(e) => set("tickerText", e.target.value)} placeholder="Ticker text (default: the headline)" className="h-9 rounded-lg text-xs" />
              </div>
            )}
            <label className="flex items-center gap-2 text-xs font-bold">
              Presenter position
              <select value={studio.side ?? "center"} onChange={(e) => set("side", e.target.value as PresenterSide)} className="h-8 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs font-bold">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              Scroll speed
              <select value={studio.speed ?? 0.6} onChange={(e) => set("speed", Number(e.target.value))} className="h-8 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs font-bold">
                {SCROLL_SPEEDS.map((sp) => <option key={sp.value} value={sp.value}>{sp.label}</option>)}
              </select>
            </label>
            {studio.breaking && <Input value={studio.breakingText ?? ""} onChange={(e) => set("breakingText", e.target.value)} placeholder="Breaking news headline (default: the headline)" className="h-9 rounded-lg text-xs font-bold" />}
            {studio.strap && <Input value={studio.strapLine} onChange={(e) => set("strapLine", e.target.value)} placeholder="Name strap second line (default: the headline)" className="h-9 rounded-lg text-xs" />}
          </div>
        </div>
      </div>
    </div>
  );
}
