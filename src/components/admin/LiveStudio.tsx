import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Clapperboard, Download, ExternalLink, Radio, RotateCcw, Send, Square, X, Youtube } from "lucide-react";
import { youtubeDetails } from "@/lib/youtube-details";
import { youtubeIdOf } from "@/lib/videos-api";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { categories } from "@/lib/categories";
import { Button, Input } from "@/components/ui";
import { CITIZEN_BACKGROUNDS, NewsStudio, SCROLL_SPEEDS, STUDIO_BACKGROUNDS, TICKER_LABELS, backgroundSwatch, type PresenterSide, type StudioSettings } from "@/lib/news-studio";

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

/**
 * staff:   editors/admins publish straight to the site.
 * citizen: an appointed citizen journalist records with citizen graphics and sends it as a citizen
 *          report; an editor reviews it before anything is published.
 */
export function LiveStudio({ editorEmail, mode = "staff", reporter }: {
  editorEmail?: string | null;
  mode?: "staff" | "citizen";
  reporter?: { id: string; name: string; area?: string | null };
}) {
  const citizen = mode === "citizen";
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("local");
  const [kind, setKind] = useState<"news" | "issue">("news");
  const [area, setArea] = useState(reporter?.area ?? "");
  const [presenter, setPresenter] = useState(() => {
    if (reporter?.name) return reporter.name;
    try { return localStorage.getItem("vn-presenter-name") || ""; } catch { return ""; }
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [poster, setPoster] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [published, setPublished] = useState<{ slug: string; title: string } | null>(null);
  const [studio, setStudio] = useState<StudioSettings>(citizen
    ? { background: "vizag-window", logo: true, clock: true, strap: true, ticker: true, live: false, breaking: false, vnTicker: false, desk: false, speed: 0.6,
        tickerLabel: "సిటిజన్ రిపోర్ట్", tickerText: "", presenter: "", strapLine: "", breakingText: "", citizen: true }
    : { background: "studio-red", logo: true, clock: true, strap: true, ticker: true, live: true, breaking: true, vnTicker: true, desk: true, speed: 0.6,
        tickerLabel: TICKER_LABELS[0], tickerText: "", presenter: "", strapLine: "", breakingText: "" });
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
    presenter: presenter || (citizen ? "సిటిజన్ రిపోర్టర్" : "VaartaNow"),
    strapLine: studio.strapLine || (citizen ? `సిటిజన్ రిపోర్టర్${area ? ` · ${area}` : ""}` : headline || "VaartaNow ప్రతినిధి"),
    tickerText: studio.tickerText || headline || "VaartaNow తెలుగు వార్తలు",
    breakingText: studio.breakingText || headline,
    headlines,
  };
  useEffect(() => { studioRef.current?.update(effective); });
  useEffect(() => { if (!citizen) try { localStorage.setItem("vn-presenter-name", presenter); } catch { /* private mode */ } }, [presenter, citizen]);
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

  // manual YouTube route: download, upload to the VaartaNow channel yourself, paste the link
  const [slug, setSlug] = useState(() => slugify(""));
  const [ytLink, setYtLink] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const ytId = youtubeIdOf(ytLink.trim());
  const yt = youtubeDetails({ slug, title: headline || "VaartaNow వార్తలు", excerpt: summary, category, tags: ["live", "video"], presenter });
  const copy = (key: string, value: string) => {
    void navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  /** Citizen: upload the recording (or use the YouTube link) and file it as a citizen report for review. */
  const sendForReview = async () => {
    if (!supabase || !reporter || (!blob && !ytId)) return;
    if (!headline.trim()) return setError("హెడ్‌లైన్ రాయండి.");
    if (summary.trim().length < 10) return setError("ఏమి జరిగిందో కనీసం ఒక వాక్యం రాయండి.");
    setBusy(true);
    setError("");
    try {
      const folder = `reports/${reporter.id}/${Date.now()}`;
      const up = async (path: string, b: Blob) => {
        const { error: e } = await supabase!.storage.from(MEDIA_BUCKET).upload(path, b, { contentType: b.type, cacheControl: "31536000" });
        if (e) throw e;
        return supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      };
      const media: { url: string; type: "image" | "video" }[] = [];
      media.push({ type: "video", url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : await up(`${folder}/video-0.${blob!.type.includes("mp4") ? "mp4" : "webm"}`, blob!) });
      if (poster) media.push({ type: "image", url: await up(`${folder}/photo-0.jpg`, poster) });
      const { error: e } = await supabase.from("citizen_reports").insert({
        kind, title: headline.trim(), description: summary.trim(), area: area.trim() || null, media,
        reporter_id: reporter.id, reporter_name: presenter.trim() || reporter.name,
      });
      if (e) throw e;
      setPublished({ slug: "", title: headline.trim() });
      setBlob(null); setPoster(null); setHeadline(""); setSummary(""); setYtLink(""); setSlug(slugify(""));
      closeCamera();
    } catch (e: any) {
      setError(`పంపడం కుదరలేదు: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (citizen) return sendForReview();
    if (!supabase || (!blob && !ytId)) return;
    if (!headline.trim()) return setError("Headline is required.");
    setBusy(true);
    setError("");
    try {
      const ext = blob?.type.includes("mp4") ? "mp4" : "webm";
      const up = async (path: string, b: Blob) => {
        const { error: e } = await supabase!.storage.from(MEDIA_BUCKET).upload(path, b, { contentType: b.type, cacheControl: "31536000" });
        if (e) throw e;
        return supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      };
      const video_url = ytId ? `https://www.youtube.com/watch?v=${ytId}` : await up(`live/${slug}.${ext}`, blob!);
      const og_image = poster ? await up(`live/${slug}.jpg`, poster) : ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
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
      setBlob(null); setPoster(null); setHeadline(""); setSummary(""); setYtLink(""); setSlug(slugify(""));
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
          <CheckCircle2 className="size-5" /> {citizen ? `సమీక్షకు పంపబడింది: ${published.title}. ఎడిటర్ ఆమోదం తర్వాత ప్రచురితమవుతుంది.` : `Published: ${published.title}`}
          {!citizen && <Link to={`/news/${published.slug}`} target="_blank" className="flex items-center gap-1 underline">Open <ExternalLink className="size-3.5" /></Link>}
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
                  <Send className="mr-1.5 size-4" /> {busy ? (citizen ? "పంపుతోంది…" : "Publishing…") : citizen ? "సమీక్షకు పంపండి" : ytId ? "Publish with YouTube link" : `Publish now (${(blob.size / 1048576).toFixed(1)} MB)`}
                </Button>
                <a href={previewUrl ?? undefined} download={`${slug}.${blob.type.includes("mp4") ? "mp4" : "webm"}`}
                  className="inline-flex h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white">
                  <Download className="mr-1.5 size-4" /> Download video
                </a>
                <Button onClick={() => setBlob(null)} disabled={busy} variant="secondary" className="h-11 rounded-xl px-4 text-sm font-bold"><RotateCcw className="mr-1.5 size-4" /> Discard</Button>
              </>
            )}
          </div>
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          {/* YouTube: upload yourself, then publish with the link (nothing stored on our server) */}
          <div className="space-y-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-black"><Youtube className="size-4 text-red-600" /> YouTube ద్వారా ప్రచురించండి</p>
            <ol className="list-decimal space-y-0.5 pl-5 text-[11.5px] text-[hsl(var(--muted-foreground))]">
              <li>రికార్డ్ చేసి <b>Download video</b> నొక్కండి</li>
              <li><a href="https://studio.youtube.com" target="_blank" rel="noreferrer" className="font-bold text-red-600 underline">YouTube Studio</a>లో అప్‌లోడ్ చేయండి; కింది టైటిల్, వివరణ, ట్యాగ్‌లు కాపీ చేయండి</li>
              <li>YouTube లింక్ పేస్ట్ చేసి <b>Publish with YouTube link</b> నొక్కండి. వార్త బ్యానర్‌పై ప్లే బటన్ వస్తుంది</li>
            </ol>
            {([["title", "Title", yt.title], ["description", "Description", yt.description], ["tags", "Tags", yt.tags]] as const).map(([key, label, value]) => (
              <div key={key} className="flex items-start gap-2 rounded-lg bg-[hsl(var(--card))] p-2">
                <span className="w-20 shrink-0 text-[11px] font-black text-[hsl(var(--muted-foreground))]">{label}</span>
                <p className={`min-w-0 flex-1 whitespace-pre-wrap text-[11.5px] ${key === "description" ? "max-h-24 overflow-y-auto" : "line-clamp-2"}`}>{value}</p>
                <button type="button" onClick={() => copy(key, value)} className="shrink-0 rounded-md bg-[hsl(var(--muted))] px-2 py-1 text-[10.5px] font-bold">{copied === key ? "Copied ✓" : "Copy"}</button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Input value={ytLink} onChange={(e) => setYtLink(e.target.value)} placeholder="https://youtu.be/..." className="h-9 min-w-[220px] flex-1 rounded-lg text-xs" />
              {!blob && (
                <Button onClick={publish} disabled={busy || !ytId} className="h-9 rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700">
                  <Youtube className="mr-1.5 size-4" /> {busy ? "…" : citizen ? "YouTube లింక్‌తో సమీక్షకు పంపండి" : "Publish with YouTube link"}
                </Button>
              )}
            </div>
            {ytLink.trim() && !ytId && <p className="text-[11px] font-bold text-red-600">That is not a YouTube video link.</p>}
          </div>

          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {citizen
              ? `మీరు స్వయంగా చూసిన, నిజమైన సమాచారం మాత్రమే చెప్పండి. ఎడిటర్ సమీక్ష తర్వాతే వీడియో ప్రచురితమవుతుంది. గరిష్టం ${MAX_SECONDS / 60} నిమిషాలు.`
              : `Published immediately as a video article, without review. Only say what you have verified; the article shows your name as presenter. Max ${MAX_SECONDS / 60} minutes.`}
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
              {citizen ? (
                <select value={kind} onChange={(e) => setKind(e.target.value as "news" | "issue")} className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-2 text-sm font-bold">
                  <option value="news">స్థానిక వార్త</option>
                  <option value="issue">ప్రజా సమస్య</option>
                </select>
              ) : (
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-2 text-sm font-bold">
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label.te}</option>)}
                </select>
              )}
              <Input value={presenter} onChange={(e) => setPresenter(e.target.value)} placeholder={citizen ? "మీ పేరు" : "Presenter name"} className="h-10 rounded-xl text-sm" />
              {citizen && <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="ప్రాంతం (ఉదా: గాజువాక, విశాఖ)" className="col-span-2 h-10 rounded-xl text-sm" />}
            </div>
          </div>

          <div className={`${card} space-y-3`}>
            <h3 className="flex items-center gap-1.5 text-sm font-black"><Clapperboard className="size-4 text-red-600" /> Studio</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {(citizen ? CITIZEN_BACKGROUNDS : STUDIO_BACKGROUNDS).map((b) => (
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
              {(citizen
                ? ([["logo", "సిటిజన్ రిపోర్ట్ బ్యాడ్జ్"], ["clock", "తేదీ & సమయం"], ["strap", "పేరు స్ట్రాప్"], ["desk", "డెస్క్ ముందు"], ["ticker", "స్క్రోలింగ్ టెక్స్ట్"]] as const)
                : ([["live", "LIVE badge"], ["logo", "VaartaNow logo"], ["clock", "Date & time"], ["strap", "Name strap"], ["desk", "Sit at news desk"], ["breaking", "Breaking (top right)"], ["ticker", "News ticker"], ["vnTicker", "VaartaNow headlines"]] as const)
              ).map(([k, label]) => (
                <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={!!studio[k]} onChange={(e) => set(k, e.target.checked)} className="accent-red-600" /> {label}</label>
              ))}
            </div>
            {studio.ticker && (
              <div className="space-y-1.5">
                {!citizen && <select value={studio.tickerLabel} onChange={(e) => set("tickerLabel", e.target.value)} className="h-9 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs font-bold">
                  {TICKER_LABELS.map((l) => <option key={l}>{l}</option>)}
                </select>}
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
