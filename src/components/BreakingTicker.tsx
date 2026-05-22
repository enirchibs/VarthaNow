import { Zap } from "lucide-react";
import type { BlogPost } from "@/types/news";

export function BreakingTicker({ posts }: { posts: BlogPost[] }) {
  const items = posts.slice(0, 5);
  if (!items.length) return null;

  return (
    <section className="overflow-hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-black text-white">
          <Zap className="size-3" />
          బ్రేకింగ్
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-[ticker_28s_linear_infinite] gap-8 whitespace-nowrap text-sm font-bold">
            {[...items, ...items].map((post, index) => (
              <span key={`${post.slug}-${index}`}>{post.title}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
