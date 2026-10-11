import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Film, Image as ImageIcon, Mic, Newspaper, RefreshCw, Sparkles, Upload, Users, Youtube } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { categories, categoryLabel } from "@/lib/categories";
import { compressImage, extensionFor } from "@/lib/image-compression";
import { Button, Input } from "@/components/ui";
import { ImageLibraryAdminDashboard } from "@/components/admin/ImageLibraryAdminDashboard";
import { VideoNewsAdminDashboard } from "@/components/admin/VideoNewsAdminDashboard";

// ═══════════════════════════════════════════════════════════════════
//  Admin galleries: images (library + article images), images made in
//  ChatGPT (uploaded by an editor), and every video on the site.
// ═══════════════════════════════════════════════════════════════════

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string; icon: typeof ImageIcon; count?: number }[] }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-[hsl(var(--muted))]/60 p-1">
      {options.map((o) => {
        const Icon = o.icon;
        const on = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${on ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}
          >
            <Icon className="size-4" />
            {o.label}
            {o.count != null && <span className="rounded-full bg-[hsl(var(--muted))] px-1.5 font-mono text-[10px]">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

// ── Image gallery ───────────────────────────────────────────────────
type ArticleImage = { slug: string; title: string; category: string; og_image: string; published: boolean; review_status: string | null; created_at: string; image_validation_status: string | null; image_credits: { attribution_text: string }[] | null };

function ArticleImages() {
  const [rows, setRows] = useState<ArticleImage[] | null>(null);
  const [category, setCategory] = useState("all");
  useEffect(() => {
    supabase?.from("blog_posts").select("slug, title, category, og_image, published, review_status, created_at, image_validation_status, image_credits")
      .not("og_image", "is", null).order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setRows((data ?? []) as ArticleImage[]));
  }, []);
  if (!rows) return <p className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading article images…</p>;
  const cats = [...new Set(rows.map((r) => r.category))];
  const shown = rows.filter((r) => category === "all" || r.category === category);
  const source = (s: string | null) => ({ library: "Library photo", generated: "New AI image", category: "Category image" } as Record<string, string>)[s ?? ""] ?? "Uploaded";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[hsl(var(--muted-foreground))]">{shown.length} images used on articles</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="ml-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-1.5 font-bold">
          <option value="all">All categories</option>
          {cats.map((c) => <option key={c} value={c}>{categoryLabel(c, "te")}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {shown.map((r) => (
          <a key={r.slug} href={r.og_image} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-lg">
            <div className="relative aspect-video bg-zinc-900">
              <img src={r.og_image} alt={r.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
              <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-black ${r.published ? "bg-emerald-600 text-white" : r.review_status === "rejected" ? "bg-red-600 text-white" : "bg-amber-400 text-black"}`}>
                {r.published ? "Published" : r.review_status === "rejected" ? "Rejected" : "Draft"}
              </span>
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-bold leading-snug">{r.title}</p>
              <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">{categoryLabel(r.category, "te")} · {source(r.image_validation_status)} · {fmt(r.created_at)}</p>
              {!!r.image_credits?.length && <p className="line-clamp-1 text-[10.5px] text-[hsl(var(--muted-foreground))]">{r.image_credits.map((c) => c.attribution_text).join(" · ")}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function ImageGallery({ editorEmail }: { editorEmail?: string | null }) {
  const [view, setView] = useState<"library" | "articles">("library");
  return (
    <div className="space-y-5">
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { id: "library", label: "Photo library (AI + licensed)", icon: ImageIcon },
          { id: "articles", label: "Article images", icon: Newspaper },
        ]}
      />
      {view === "library" ? <ImageLibraryAdminDashboard editorEmail={editorEmail} /> : <ArticleImages />}
    </div>
  );
}

// ── ChatGPT gallery ─────────────────────────────────────────────────
const UPLOAD_BUCKET = "news-media";

export function ChatGptGallery({ editorEmail }: { editorEmail?: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("general");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [reload, setReload] = useState(0);

  const pick = (f: File | null) => {
    setFile(f);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return f ? URL.createObjectURL(f) : null; });
  };

  const upload = async () => {
    if (!supabase || !file) return;
    const tagList = [...new Set(tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];
    if (!title.trim() || tagList.length < 2) { setNote({ ok: false, text: "Add a title and at least 2 keywords, so the news picker can find this image." }); return; }
    setBusy(true);
    setNote(null);
    try {
      const image = await compressImage(file, { maxDimension: 1600 });
      const path = `gallery/chatgpt/${Date.now()}.${extensionFor(image)}`;
      const { error: upErr } = await supabase.storage.from(UPLOAD_BUCKET).upload(path, image, { contentType: image.type, cacheControl: "31536000" });
      if (upErr) throw upErr;
      const public_url = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("image_library").insert({
        kind: "topic", label: title.trim(), title: title.trim(), category, tags: [...tagList, category], keywords_en: tagList,
        storage_path: `${UPLOAD_BUCKET}/${path}`, public_url, credit: "VaartaNow AI (ChatGPT)", license: "ai-generated",
        focus: "center", is_ai_generated: true, generation_provider: "openai", generation_model: "chatgpt",
        generation_status: "uploaded", editorial_label: "ప్రతీకాత్మక చిత్రం (AI)", review_status: "approved",
        reviewed_by: editorEmail ?? null, reviewed_at: new Date().toISOString(), rights_status: "commercial-editorial",
      });
      if (error) { await supabase.storage.from(UPLOAD_BUCKET).remove([path]); throw error; }
      setNote({ ok: true, text: `Added "${title.trim()}". Stories about ${tagList.slice(0, 3).join(", ")} can now use it.` });
      pick(null); setTitle(""); setTags(""); setReload((n) => n + 1);
    } catch (e: any) {
      setNote({ ok: false, text: `Upload failed: ${e.message ?? e}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-black"><Sparkles className="size-5 text-emerald-600" /> Add an image made in ChatGPT</h2>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Create the image in ChatGPT, download it and upload it here. It is labelled “ప్రతీకాత్మక చిత్రం (AI)” on stories.
          Use scenes and objects only: no real person's face, no logos, no text in the image.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
          <label className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:border-emerald-500">
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1"><Upload className="size-5" /> Choose image</span>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          </label>
          <div className="grid gap-2.5">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. Farmers harvesting paddy in Godavari fields" className="h-10 rounded-xl text-sm" />
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Keywords, comma separated: paddy, harvest, farmer, godavari" className="h-10 rounded-xl text-sm" />
            <div className="flex flex-wrap gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 text-sm font-bold">
                <option value="general">General</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label.te} · {c.label.en}</option>)}
              </select>
              <Button onClick={upload} disabled={!file || busy} className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700">
                {busy ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />} Add to gallery
              </Button>
            </div>
            {note && <p className={`text-xs font-bold ${note.ok ? "text-emerald-600" : "text-red-600"}`}>{note.text}</p>}
          </div>
        </div>
      </section>
      <ImageLibraryAdminDashboard key={reload} editorEmail={editorEmail} provider="openai" emptyText="No ChatGPT images yet. Upload the first one above." />
    </div>
  );
}

// ── Video gallery ───────────────────────────────────────────────────
type Recording = { slug: string; title: string; category: string; video_url: string | null; audio_url: string | null; presenter_name: string | null; published: boolean; created_at: string };
type CitizenVideo = { id: string; title: string | null; description: string; status: string; reporter_name: string | null; area: string | null; created_at: string; media: { url: string; type: string }[]; voice_url?: string | null };

export function VideoGallery() {
  const [view, setView] = useState<"shorts" | "recordings" | "citizen">("recordings");
  const [recordings, setRecordings] = useState<Recording[] | null>(null);
  const [citizen, setCitizen] = useState<CitizenVideo[] | null>(null);

  useEffect(() => {
    supabase?.from("blog_posts").select("slug, title, category, video_url, audio_url, presenter_name, published, created_at")
      .or("video_url.not.is.null,audio_url.not.is.null").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setRecordings((data ?? []) as Recording[]));
    supabase?.from("citizen_reports").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setCitizen(((data ?? []) as CitizenVideo[]).filter((r) => r.media?.some((m) => m.type === "video") || r.voice_url)));
  }, []);

  const empty = (text: string) => <p className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">{text}</p>;
  const isYoutube = (u: string) => /youtube\.com|youtu\.be/.test(u);

  return (
    <div className="space-y-5">
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { id: "recordings", label: "Editor video & voice", icon: Mic, count: recordings?.length },
          { id: "citizen", label: "Citizen videos", icon: Users, count: citizen?.length },
          { id: "shorts", label: "YouTube shorts", icon: Youtube },
        ]}
      />

      {view === "shorts" && <VideoNewsAdminDashboard />}

      {view === "recordings" && (!recordings ? <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p> : !recordings.length
        ? empty("No recordings yet. In the Review Queue, open an AI draft and record your voice or video reading it; it appears here.")
        : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recordings.map((r) => (
              <div key={r.slug} className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
                {r.video_url ? (
                  isYoutube(r.video_url)
                    ? <a href={r.video_url} target="_blank" rel="noreferrer" className="flex aspect-video items-center justify-center bg-black text-white"><Film className="size-8" /></a>
                    : <video src={r.video_url} controls preload="metadata" playsInline className="aspect-video w-full bg-black" />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-rose-50 dark:bg-rose-950/30"><Mic className="size-10 text-rose-500" /></div>
                )}
                <div className="space-y-2 p-3">
                  <Link to={`/news/${r.slug}`} className="line-clamp-2 text-sm font-bold hover:underline">{r.title}</Link>
                  <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                    {categoryLabel(r.category, "te")} · {r.presenter_name ? `read by ${r.presenter_name}` : "editor"} · {r.published ? "published" : "draft"} · {fmt(r.created_at)}
                  </p>
                  {r.audio_url && <audio src={r.audio_url} controls preload="none" className="w-full" />}
                </div>
              </div>
            ))}
          </div>
        ))}

      {view === "citizen" && (!citizen ? <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p> : !citizen.length
        ? empty("No citizen videos yet. Videos and voice notes sent with citizen reports appear here.")
        : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {citizen.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
                {r.media.filter((m) => m.type === "video").slice(0, 1).map((m) => <video key={m.url} src={m.url} controls preload="metadata" playsInline className="aspect-video w-full bg-black" />)}
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-sm font-bold">{r.title || r.description}</p>
                  <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">{[r.reporter_name, r.area, r.status, fmt(r.created_at)].filter(Boolean).join(" · ")}</p>
                  {r.voice_url && <audio src={r.voice_url} controls preload="none" className="w-full" />}
                  {r.media.filter((m) => m.type === "video").length > 1 && (
                    <p className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]"><ExternalLink className="size-3" /> {r.media.filter((m) => m.type === "video").length - 1} more video(s) in the citizen report</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
