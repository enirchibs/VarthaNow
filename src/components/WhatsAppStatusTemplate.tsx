import React, { useEffect, useRef, useState } from "react";
import { Download, Image as ImageIcon, Pencil, Upload, Video } from "lucide-react";
import type { DailyShareItem } from "@/types/daily-share";
import { saveUserCreation } from "@/lib/daily-share-api";
import { useLanguage } from "@/hooks/useLanguage";

/** Exact Lokal-style Shiva WhatsApp status video */
export const SHIVA_STATUS_VIDEO = "/daily-share/gemini_generated_video_434b1be3.mp4";
export const SHIVA_STATUS_POSTER = "/daily-share/shiva-status-poster.jpg";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Exact Shiva WhatsApp status template:
 * - Full video = gemini_generated_video_434b1be3.mp4
 * - Upload sits on the gold circular "second frame" (bottom-right in the video)
 */
export function WhatsAppStatusTemplate({ item }: { item: DailyShareItem }) {
  const { lang } = useLanguage();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [userName, setUserName] = useState(item.default_user_name || "Srini");
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoFile, setCustomVideoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(true);

  // Always prefer the exact Shiva status video in the main (second) media place
  const templateVideo = customVideoUrl || item.video_url || SHIVA_STATUS_VIDEO;
  const poster = item.thumbnail_url || SHIVA_STATUS_POSTER || item.image_url;

  useEffect(() => {
    return () => {
      if (customVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(customVideoUrl);
    };
  }, [customVideoUrl]);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onReplaceVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      onPhoto(e);
      return;
    }
    if (!file.type.startsWith("video/")) return;
    if (customVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(customVideoUrl);
    setCustomVideoFile(file);
    setCustomVideoUrl(URL.createObjectURL(file));
  };

  const persist = (dataUrl: string) => {
    saveUserCreation({
      id: `uc-${Date.now()}`,
      shareItemId: item.id,
      title: item.title,
      category: item.category,
      created_at: new Date().toISOString(),
      renderedDataUrl: dataUrl,
      options: { userName, userPhoto: userPhotoUrl || undefined },
    });
  };

  const downloadVideo = async () => {
    setBusy(true);
    try {
      if (customVideoFile) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(customVideoFile);
        a.download = customVideoFile.name;
        a.click();
        return;
      }
      const res = await fetch(templateVideo);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "gemini_generated_video_434b1be3.mp4";
      a.click();
    } catch {
      window.open(templateVideo, "_blank");
    } finally {
      setBusy(false);
    }
  };

  const shareWhatsApp = async () => {
    setBusy(true);
    try {
      const text = `✨ *${item.title}* ✨\n\n"${item.quote_te || item.title}"\n\n— ${userName}\n\n📲 ${window.location.origin}/daily-share`;

      if (navigator.share) {
        try {
          let file = customVideoFile;
          if (!file) {
            const res = await fetch(templateVideo);
            const blob = await res.blob();
            file = new File([blob], "gemini_generated_video_434b1be3.mp4", {
              type: blob.type || "video/mp4",
            });
          }
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: item.title, text });
            return;
          }
        } catch {
          /* fall through */
        }
      }

      // Also save a simple card snapshot of name + photo if present
      if (userPhotoUrl) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 720;
          canvas.height = 1280;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, 720, 1280);
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = userPhotoUrl;
            });
            if (img.width) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(160, 1100, 90, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, 70, 1010, 180, 180);
              ctx.restore();
            }
            ctx.fillStyle = "#fff";
            ctx.font = "bold 42px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(userName, 360, 1220);
            persist(canvas.toDataURL("image/png"));
          }
        } catch {
          /* ignore */
        }
      }

      await downloadVideo();
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
      {/* Lokal-style category chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2.5 border-b border-white/10 bg-zinc-950">
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white">
          🌱 {lang === "te" ? "జీవిత సత్యం" : "Life Truth"}
        </span>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white">
          🌸 {lang === "te" ? "ఉపదేశం" : "Advice"}
        </span>
        <span className="shrink-0 rounded-full bg-pink-600/90 px-3 py-1 text-[11px] font-black text-white">
          🎥 Shiva Status
        </span>
      </div>

      {/* Exact Shiva template video */}
      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
        <video
          ref={videoRef}
          key={templateVideo}
          src={templateVideo}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 size-full object-cover pointer-events-none"
        />

        {/*
          Align to measured circle in the 720x1280 video:
          center ~ (75.7%, 84.4%), diameter ~30% of width (inside gold rim).
          No extra border — video already draws the gold frame.
        */}
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          title={lang === "te" ? "ఈ సర్కిల్‌లో మీ ఫోటో అప్‌లోడ్ చేయండి" : "Upload your photo in this circle"}
          aria-label="Upload photo into template circle"
          className="absolute z-30 overflow-hidden rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-300 active:scale-[0.98] transition"
          style={{
            left: "75.7%",
            top: "84.4%",
            width: "29.5%",
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
            boxShadow: "none",
          }}
        >
          {userPhotoUrl ? (
            <img
              src={userPhotoUrl}
              alt="Your photo"
              className="size-full rounded-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-0.5 rounded-full bg-transparent text-[#5b21b6]">
              <span className="text-xl sm:text-2xl leading-none opacity-80">📷</span>
              <span className="text-[9px] sm:text-[10px] font-black tracking-wide text-slate-700/80">
                Upload
              </span>
            </span>
          )}
        </button>

        {!userPhotoUrl && (
          <div className="absolute z-20 left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-black text-amber-200 border border-amber-400/40 pointer-events-none">
            {lang === "te" ? "👉 బంగారు సర్కిల్‌పై ట్యాప్ చేయండి" : "👉 Tap the gold circle"}
          </div>
        )}
      </div>

      {/* Name below the video (does not cover the circle) */}
      <div className="bg-zinc-950 px-3 py-2 text-center border-t border-white/5">
        <p className="text-base font-black text-white">{userName || "Srini"}</p>
        <p className="text-[10px] font-bold text-zinc-400">VaartaNow • WhatsApp Status</p>
      </div>

      {showEdit && (
        <div className="space-y-2.5 border-t border-white/10 bg-zinc-900 px-3 py-3">
          <p className="text-[10px] font-bold text-zinc-400">
            {lang === "te"
              ? "వీడియోలోని బంగారు సర్కిల్ (కుడి వైపు) = మీ ఫోటో అప్‌లోడ్ స్థలం"
              : "Gold circle on the video (bottom-right) = your photo upload slot"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2.5 text-xs font-black text-white active:scale-95"
            >
              <ImageIcon className="size-4" />
              {lang === "te" ? "సర్కిల్‌లో ఫోటో" : "Photo in circle"}
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-xs font-black text-white active:scale-95"
            >
              <Video className="size-4" />
              {lang === "te" ? "వీడియో మార్చు" : "Replace video"}
            </button>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          <input ref={videoInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onReplaceVideo} />
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={lang === "te" ? "మీ పేరు (ఉదా: Srini)" : "Your name"}
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-white/10 bg-black px-3 py-3">
        <button
          type="button"
          onClick={shareWhatsApp}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-black text-white shadow-lg active:scale-[0.98] disabled:opacity-60"
        >
          <WhatsAppGlyph className="size-5" />
          {busy ? "…" : "Share"}
        </button>
        <button
          type="button"
          onClick={downloadVideo}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-700 px-4 py-3 text-sm font-black text-white active:scale-[0.98] disabled:opacity-60"
        >
          <Download className="size-4" />
          Download
        </button>
        <button
          type="button"
          onClick={() => setShowEdit((v) => !v)}
          className="flex size-11 items-center justify-center rounded-xl bg-zinc-800 text-white"
          title="Edit"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="flex size-11 items-center justify-center rounded-xl bg-zinc-800 text-white"
          title="Upload photo"
        >
          <Upload className="size-4" />
        </button>
      </div>
    </section>
  );
}
