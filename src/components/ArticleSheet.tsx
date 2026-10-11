import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mic, Sparkles } from "lucide-react";
import type { BlogPost } from "@/types/news";
import { embedUrl, youtubeIdOf } from "@/lib/videos-api";

/** Our own recordings (news-media bucket) play inline. */
export const isOwnMedia = (url?: string | null) => !!url && /\/news-media\//.test(url);
/** Videos the site plays itself: our recordings and those moved to the VaartaNow YouTube channel. */
export const isPlayableVideo = (url?: string | null) => isOwnMedia(url) || !!youtubeIdOf(url);

/** Full article: presenter video or image, presenter voice, every paragraph, and how it was made. */
export function ArticleSheet({ post, lang, onClose, autoPlayVideo = false }: {
  post: BlogPost;
  lang: string;
  onClose: () => void;
  autoPlayVideo?: boolean;
}) {
  const te = lang === "te";
  const paragraphs = (post.content || post.excerpt || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const video = isOwnMedia(post.video_url) ? post.video_url! : null;
  const youtubeId = video ? null : youtubeIdOf(post.video_url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex justify-center bg-black/60" onClick={onClose} role="dialog" aria-modal="true" aria-label={post.title}>
      <article
        className="relative h-full w-full max-w-[560px] overflow-y-auto bg-white"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="fixed z-10 ml-3 mt-3 flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95"
          style={{ top: "env(safe-area-inset-top)" }}
          aria-label={te ? "మూసివేయి" : "Close"}
        >
          <X className="size-5" />
        </button>

        {video ? (
          <video src={video} controls playsInline autoPlay={autoPlayVideo} poster={post.og_image ?? undefined} className="aspect-video w-full bg-black" />
        ) : youtubeId ? (
          <iframe
            src={autoPlayVideo ? embedUrl(youtubeId) : embedUrl(youtubeId).replace("autoplay=1&", "")}
            title={post.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="aspect-video w-full bg-black"
          />
        ) : post.og_image ? (
          <img src={post.og_image} alt={post.title} className="aspect-video w-full object-cover" />
        ) : null}

        {post.og_image && !!post.image_credits?.length && (
          <p className="px-5 pt-2 text-[11px] leading-snug text-slate-500">
            {post.image_credits.map((c, i) => {
              // link the licence name ("CC BY-SA 4.0") to its licence page and the rest to the photo's source page
              const m = c.attribution_text.match(/^(.*?)\s*\/\s*([^/]+)$/);
              const [who, licence] = m ? [m[1], m[2]] : [c.attribution_text, null];
              return (
                <span key={i}>
                  {i > 0 && " · "}
                  {c.source_url ? <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{who}</a> : who}
                  {licence && (
                    <>
                      {" / "}
                      {c.license_url ? <a href={c.license_url} target="_blank" rel="noopener noreferrer license" className="underline">{licence}</a> : licence}
                    </>
                  )}
                </span>
              );
            })}
          </p>
        )}

        <div className="space-y-4 px-5 pb-10 pt-5">
          <h1 className="text-[1.35rem] font-black leading-[1.4] text-[#111827]">{post.title}</h1>

          {(post.audio_url || post.tts_audio_url) && (
            <div className="rounded-2xl bg-rose-50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-black text-rose-700">
                <Mic className="size-4" />
                {te ? "వార్తలు వినండి" : "Listen to this story"}
                {post.audio_url
                  ? (post.presenter_name ? ` · ${te ? "చదివినవారు" : "read by"} ${post.presenter_name}` : "")
                  : ` · ${te ? "AI వాయిస్" : "AI voice"}`}
              </p>
              <audio src={post.audio_url || post.tts_audio_url!} controls preload="none" className="w-full" />
            </div>
          )}
          {(video || youtubeId) && post.presenter_name && (
            <p className="text-xs font-bold text-slate-500">{te ? "వీడియోలో చదివినవారు" : "Presented by"}: {post.presenter_name}</p>
          )}

          <div className="space-y-4 text-[1.05rem] leading-[1.85] text-[#1e293b]">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {post.ai_assisted && (
            <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600">
              <Sparkles className="mt-0.5 size-4 shrink-0" />
              {te
                ? "ఈ కథనాన్ని పలు వార్తా నివేదికల ఆధారంగా AI సహాయంతో రాశాం. ప్రచురణకు ముందు VaartaNow డెస్క్ వాస్తవాలను పరిశీలించి సమీక్షించింది."
                : "Written with AI assistance from multiple news reports; facts checked and reviewed by the VaartaNow desk before publishing."}
            </p>
          )}
        </div>
      </article>
    </div>,
    document.body
  );
}
