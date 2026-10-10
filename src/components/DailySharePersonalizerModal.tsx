import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Sparkles,
  User,
  Pencil,
  MoreVertical,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { DailyShareItem } from "@/types/daily-share";
import { saveUserCreation } from "@/lib/daily-share-api";
import { useLanguage } from "@/hooks/useLanguage";
import { fileToCompressedDataUrl } from "@/lib/image-compression";

interface DailySharePersonalizerModalProps {
  item: DailyShareItem;
  isOpen: boolean;
  onClose: () => void;
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function DailySharePersonalizerModal({ item, isOpen, onClose }: DailySharePersonalizerModalProps) {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const isVideoTemplate = Boolean(item.video_url || item.content_type === "video");

  const [userName, setUserName] = useState(item.default_user_name || "Srini");
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userVideoUrl, setUserVideoUrl] = useState<string | null>(null);
  const [userVideoFile, setUserVideoFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderedDataUrl, setRenderedDataUrl] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

  const activeVideoSrc = userVideoUrl || item.video_url || null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(lang === "te" ? "దయచేసి ఇమేజ్ ఫైల్ ఎంచుకోండి" : "Please choose an image file");
      return;
    }
    void fileToCompressedDataUrl(file, { maxDimension: 1080 }).then(setUserPhotoUrl);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      void fileToCompressedDataUrl(file, { maxDimension: 1080 }).then((url) => {
        setUserPhotoUrl(url);
        setUserVideoUrl(null);
        setUserVideoFile(null);
      });
      return;
    }

    if (file.type.startsWith("video/")) {
      if (userVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(userVideoUrl);
      const blobUrl = URL.createObjectURL(file);
      setUserVideoFile(file);
      setUserVideoUrl(blobUrl);
      return;
    }

    alert(lang === "te" ? "ఇమేజ్ లేదా వీడియో మాత్రమే అప్‌లోడ్ చేయండి" : "Upload an image or video only");
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setRendering(true);
    const width = 720;
    const height = 1280;
    canvas.width = width;
    canvas.height = height;

    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = item.image_url;

    bgImage.onload = () => {
      const scale = Math.max(width / bgImage.width, height / bgImage.height);
      const x = width / 2 - (bgImage.width / 2) * scale;
      const y = height / 2 - (bgImage.height / 2) * scale;
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);

      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, "rgba(0,0,0,0.15)");
      vignette.addColorStop(0.45, "rgba(0,0,0,0.05)");
      vignette.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Top leaf band
      ctx.fillStyle = "rgba(34, 120, 60, 0.55)";
      ctx.fillRect(0, 0, width, 48);
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.ellipse(28 + i * 52, 34, 22, 14, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "rgba(46, 160, 67, 0.9)" : "rgba(22, 101, 52, 0.85)";
        ctx.fill();
      }

      const drawGarland = (gx: number) => {
        for (let i = 0; i < 18; i++) {
          const gy = 70 + i * 64;
          ctx.beginPath();
          ctx.arc(gx, gy, 16, 0, Math.PI * 2);
          ctx.fillStyle = i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#ef4444" : "#f8fafc";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(gx + (i % 2 === 0 ? 18 : -18), gy + 28, 10, 0, Math.PI * 2);
          ctx.fillStyle = "#22c55e";
          ctx.fill();
        }
      };
      drawGarland(36);
      drawGarland(width - 36);

      const quote = item.quote_te || item.title;
      ctx.textAlign = "center";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(30, 64, 175, 0.85)";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Segoe UI', system-ui, sans-serif";

      const words = quote.split(" ");
      let line = "";
      const lines: string[] = [];
      for (let n = 0; n < words.length; n++) {
        const testLine = `${line}${words[n]} `;
        if (ctx.measureText(testLine).width > width - 140 && n > 0) {
          lines.push(line.trim());
          line = `${words[n]} `;
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());
      lines.slice(0, 4).forEach((l, idx) => {
        const yy = 340 + idx * 56;
        ctx.strokeText(l, width / 2, yy);
        ctx.fillText(l, width / 2, yy);
      });

      const finishWithAvatar = (avatarSrc: string | null) => {
        const avatarSize = 168;
        const avatarX = 78;
        const avatarY = height - 290;
        const cx = avatarX + avatarSize / 2;
        const cy = avatarY + avatarSize / 2;

        const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 150);
        glow.addColorStop(0, "rgba(236, 72, 153, 0.75)");
        glow.addColorStop(0.55, "rgba(168, 85, 247, 0.35)");
        glow.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#f472b6";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, avatarSize / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();

        const drawNameAndSave = () => {
          ctx.textAlign = "center";
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 48px 'Segoe UI', system-ui, sans-serif";
          ctx.shadowColor = "rgba(0,0,0,0.65)";
          ctx.shadowBlur = 10;
          ctx.fillText(userName || "VaartaNow", width / 2, height - 70);
          ctx.shadowBlur = 0;

          ctx.font = "bold 18px sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.fillText("VaartaNow Daily Share", width / 2, height - 28);

          setRenderedDataUrl(canvas.toDataURL("image/png"));
          setRendering(false);
        };

        if (!avatarSrc) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
          ctx.beginPath();
          ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 28px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("📷", cx, cy + 10);
          drawNameAndSave();
          return;
        }

        const avatarImg = new Image();
        avatarImg.crossOrigin = "anonymous";
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          const aScale = Math.max(avatarSize / avatarImg.width, avatarSize / avatarImg.height);
          const aw = avatarImg.width * aScale;
          const ah = avatarImg.height * aScale;
          ctx.drawImage(avatarImg, cx - aw / 2, cy - ah / 2, aw, ah);
          ctx.restore();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
          ctx.stroke();

          drawNameAndSave();
        };
        avatarImg.onerror = drawNameAndSave;
        avatarImg.src = avatarSrc;
      };

      finishWithAvatar(userPhotoUrl);
    };

    bgImage.onerror = () => {
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Template unavailable", width / 2, height / 2);
      setRendering(false);
    };
  }, [item.image_url, item.quote_te, item.title, userName, userPhotoUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => renderCanvas(), 150);
    return () => clearTimeout(t);
  }, [isOpen, renderCanvas]);

  useEffect(() => {
    return () => {
      if (userVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(userVideoUrl);
    };
  }, [userVideoUrl]);

  if (!isOpen) return null;

  const persistCreation = (dataUrl: string) => {
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

  const handleDownload = async () => {
    if (activeVideoSrc && (userVideoFile || item.video_url)) {
      try {
        if (userVideoFile) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(userVideoFile);
          link.download = userVideoFile.name || `${item.slug}-status.mp4`;
          link.click();
          return;
        }
        const res = await fetch(activeVideoSrc!);
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${item.slug}-vaartanow.mp4`;
        link.click();
      } catch {
        window.open(activeVideoSrc!, "_blank");
      }
      return;
    }

    if (!renderedDataUrl) return;
    persistCreation(renderedDataUrl);
    const link = document.createElement("a");
    link.download = `${item.slug}-personalized-vaartanow.png`;
    link.href = renderedDataUrl;
    link.click();
  };

  const handleWhatsAppShare = async () => {
    setShareBusy(true);
    try {
      const shareUrl = `${window.location.origin}/daily-share#${item.slug}`;
      const text = `✨ *${item.title}* ✨\n\n"${item.quote_te || item.title}"\n\n— ${userName}\n\n📲 VaartaNow Daily Share: ${shareUrl}`;

      if (activeVideoSrc && navigator.share) {
        try {
          let file = userVideoFile;
          if (!file) {
            const res = await fetch(activeVideoSrc);
            const blob = await res.blob();
            file = new File([blob], `${item.slug}.mp4`, { type: blob.type || "video/mp4" });
          }
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: item.title, text });
            return;
          }
        } catch {
          // fall through
        }
      }

      if (renderedDataUrl && navigator.share) {
        try {
          const res = await fetch(renderedDataUrl);
          const blob = await res.blob();
          const file = new File([blob], `${item.slug}.png`, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            persistCreation(renderedDataUrl);
            await navigator.share({ files: [file], title: item.title, text });
            return;
          }
        } catch {
          // fall through
        }
      }

      await handleDownload();
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/90 sm:p-3 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg bg-black sm:rounded-3xl overflow-hidden shadow-2xl max-h-[100dvh] sm:max-h-[94vh] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-xl bg-gradient-to-br from-pink-500 to-amber-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-white truncate">
                {lang === "te" ? "వాట్సాప్ స్టేటస్ టెంప్లేట్" : "WhatsApp Status Template"}
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 truncate">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 bg-zinc-950 flex items-center justify-center">
          <div className="relative aspect-[9/16] h-full max-h-[min(72vh,720px)] w-auto max-w-full overflow-hidden bg-black">
            {activeVideoSrc ? (
              <video
                key={activeVideoSrc}
                src={activeVideoSrc}
                poster={item.thumbnail_url || item.image_url}
                controls
                playsInline
                loop
                className="absolute inset-0 size-full object-cover"
              />
            ) : renderedDataUrl ? (
              <img src={renderedDataUrl} alt="Status preview" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-xs font-bold">{rendering ? "Rendering…" : "Loading template…"}</p>
              </div>
            )}

            {activeVideoSrc && (
              <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="pointer-events-auto relative size-20 rounded-full overflow-hidden border-4 border-pink-400 shadow-[0_0_24px_rgba(236,72,153,0.8)] bg-zinc-900"
                  >
                    {userPhotoUrl ? (
                      <img src={userPhotoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-2xl">📷</span>
                    )}
                  </button>
                  <div className="pointer-events-auto flex-1 pb-1">
                    <p className="text-white text-lg font-black drop-shadow-lg">{userName || "Your Name"}</p>
                    <p className="text-white/80 text-[11px] font-bold line-clamp-2">{item.quote_te}</p>
                  </div>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {showEditor && (
          <div className="shrink-0 border-t border-white/10 bg-zinc-900 px-3 py-3 space-y-3 max-h-[34vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black py-2.5 active:scale-95 transition"
              >
                <ImageIcon className="size-4" />
                {lang === "te" ? "ఫోటో అప్‌లోడ్" : "Upload Photo"}
              </button>
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black py-2.5 active:scale-95 transition"
              >
                <Video className="size-4" />
                {lang === "te" ? "వీడియో అప్‌లోడ్" : "Upload Video"}
              </button>
            </div>

            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaUpload}
            />

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <User className="size-3.5" />
                {lang === "te" ? "మీ పేరు" : "Your Name"}
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="ఉదా: Srini"
                className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-white/10 bg-black text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            {isVideoTemplate && (
              <p className="text-[10px] font-bold text-violet-300">
                {lang === "te"
                  ? "🎥 వీడియో స్టేటస్ — Share నొక్కి WhatsAppకు పంపండి లేదా మీ వీడియో అప్‌లోడ్ చేయండి."
                  : "🎥 Video status — Share to WhatsApp or upload your own video."}
              </p>
            )}
          </div>
        )}

        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black border-t border-white/10">
          <button
            onClick={handleWhatsAppShare}
            disabled={shareBusy}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black text-sm py-3 shadow-lg active:scale-[0.98] transition disabled:opacity-60"
          >
            <WhatsAppGlyph className="size-5" />
            {shareBusy ? "…" : "Share"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-black text-sm px-4 py-3 active:scale-[0.98] transition"
          >
            <Download className="size-4" />
            Download
          </button>
          <button
            onClick={() => setShowEditor((v) => !v)}
            className="size-11 rounded-xl bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
            title="Edit"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={onClose}
            className="size-11 rounded-xl bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
            title="Close"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
