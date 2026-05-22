import { Bookmark, Clock3, Send, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { categoryLabel } from "@/lib/categories";
import { timeAgo } from "@/lib/format";
import type { BlogPost } from "@/types/news";
import { Badge, Button } from "@/components/ui";

export function NewsCard({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  const shareUrl = `${window.location.origin}/news/${post.slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`;

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_12px_30px_rgba(37,99,235,0.08)]">
      <Link to={`/news/${post.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--muted))]">
          {post.og_image && (
            <img
              src={post.og_image}
              alt={post.title}
              loading={priority ? "eager" : "lazy"}
              className="size-full object-cover transition duration-500 hover:scale-105"
            />
          )}
          <div className="absolute left-3 top-3">
            <Badge>{categoryLabel(post.category)}</Badge>
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <Link to={`/news/${post.slug}`}>
          <h2 className="line-clamp-2 text-xl font-black leading-snug">{post.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{post.excerpt}</p>
        </Link>
        <div className="flex items-center gap-3 text-xs font-bold text-[hsl(var(--muted-foreground))]">
          <span>{timeAgo(post.published_at)}</span>
          <span className="flex items-center gap-1">
            <Clock3 className="size-3" />
            {post.reading_time_min} min
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" className="h-9 px-3">
            <Bookmark className="size-4" />
            సేవ్
          </Button>
          <div className="flex gap-2">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white" aria-label="WhatsApp share">
              <Share2 className="size-4" />
            </a>
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-full bg-blue-500 text-white" aria-label="Telegram share">
              <Send className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
