import { ExternalLink } from "lucide-react";
import { sourceCredits } from "@/lib/sources";
import type { BlogPost } from "@/types/news";

/**
 * "Credits" block at the end of a story: the outlets whose reports it was written from, each with its
 * small site icon, name and a link to the original article. Renders nothing for stories without a source
 * (editor-written, citizen reports, Live Studio).
 */
export function SourceCredits({ post, full = false, strip = false }: {
  post: Pick<BlogPost, "source_article_url" | "source_url" | "review_status">;
  /** full article: each source with its complete link */
  full?: boolean;
  /** one scrollable line, for swipe cards whose text area does not scroll */
  strip?: boolean;
}) {
  const credits = sourceCredits(post);
  if (!credits.length) return null;

  if (strip) {
    return (
      <div aria-label="Source credits" className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="shrink-0 font-bold text-slate-500">మూలం (Source):</span>
        {credits.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noopener"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 font-bold text-slate-700 hover:border-slate-300">
            {c.logo && <img src={c.logo} alt="" width={14} height={14} loading="lazy" referrerPolicy="no-referrer" className="size-3.5 rounded-sm" />}
            {c.name}
            <span className="text-blue-700">· పూర్తి కథనం</span>
            <ExternalLink className="size-3" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <section aria-label="Source credits" className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-[11px] leading-snug text-slate-600">
      <p className="font-bold">మూలం (Source): ఈ వార్తకు ఆధారమైన కథనాలు</p>
      <ul className={full ? "mt-2 space-y-2" : "mt-1.5 flex flex-wrap gap-1.5"}>
        {credits.map((c) => (
          <li key={c.url} className="min-w-0">
            <a
              href={c.url}
              target="_blank"
              rel="noopener"
              className={
                full
                  ? "group flex min-w-0 items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 hover:border-slate-300"
                  : "inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 font-bold text-slate-700 hover:border-slate-300"
              }
            >
              {c.logo && (
                <img src={c.logo} alt="" width={16} height={16} loading="lazy" referrerPolicy="no-referrer"
                  className={full ? "mt-0.5 size-4 shrink-0 rounded-sm" : "size-3.5 shrink-0 rounded-sm"} />
              )}
              {full ? (
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-1.5 font-bold text-slate-800">
                    {c.name}
                    <span className="inline-flex items-center gap-0.5 text-blue-700">పూర్తి కథనం <ExternalLink className="size-3 shrink-0" /></span>
                  </span>
                  <span className="block break-all text-[10.5px] text-slate-500 group-hover:underline">{c.url}</span>
                </span>
              ) : (
                <>
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 text-blue-700">· పూర్తి కథనం</span>
                  <ExternalLink className="size-3 shrink-0" />
                </>
              )}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] text-slate-500">
        {post.review_status === "approved"
          ? "ఈ వార్తను VaartaNow తన సొంత మాటల్లో రాసి, సంపాదకులు పరిశీలించారు. పూర్తి వివరాలకు పై లింకులు చూడండి."
          : "ఈ వార్తను VaartaNow తన సొంత మాటల్లో అందించింది. పూర్తి వివరాలకు పై లింకులు చూడండి."}
      </p>
    </section>
  );
}
