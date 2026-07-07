import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import type { BlogPost } from "@/types/news";
import { timeAgo } from "@/lib/format";

// BreakingTicker v2
// - Each headline is a clickable Link → opens article
// - Marquee pauses on hover (accessibility + usability)
// - Red BREAKING badge (red = urgency, blue was wrong signal)
// - Shows time next to each headline
// - Dot separators between items

export function BreakingTicker({ posts }: { posts: BlogPost[] }) {
  const items = posts.slice(0, 8);
  if (!items.length) return null;

  return (
    <section
      className="overflow-hidden rounded-full border border-red-500/20 bg-red-500/8 dark:bg-red-500/10 px-3 py-2"
      aria-label="Breaking news ticker"
    >
      <div className="flex items-center gap-3">
        {/* Badge */}
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-sm shadow-red-600/30 animate-pulse">
          <Zap className="size-3 fill-white" />
          బ్రేకింగ్
        </span>

        {/* Scrolling strip */}
        <div
          className="min-w-0 flex-1 overflow-hidden group/ticker cursor-pointer"
          title="Hover to pause"
        >
          <div className="flex w-max gap-8 whitespace-nowrap text-sm font-bold animate-[ticker_32s_linear_infinite] group-hover/ticker:[animation-play-state:paused]">
            {[...items, ...items].map((post, index) => (
              <Link
                key={`${post.slug}-${index}`}
                to={`/news/${post.slug}`}
                className="inline-flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-red-500 inline-block" />
                <span className="hover:underline underline-offset-2">{post.title}</span>
                <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
                  {timeAgo(post.published_at)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
