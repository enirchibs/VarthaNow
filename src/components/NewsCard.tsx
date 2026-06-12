import { Bookmark, Send, Share2 } from "lucide-react";
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
    <article className="group overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_12px_30px_rgba(37,99,235,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)]">
      {/* 1. Image Banner */}
      <Link to={`/news/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
          {post.og_image ? (
            <img
              src={post.og_image}
              alt={post.title}
              loading={priority ? "eager" : "lazy"}
              referrerPolicy="no-referrer"
              className="size-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl">
              VaartaNow
            </div>
          )}
          
          {/* Category Badge on Top-Left */}
          <div className="absolute left-3 top-3 z-10">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-extrabold text-[10px] tracking-wide uppercase px-2.5 py-1">
              {categoryLabel(post.category)}
            </Badge>
          </div>
        </div>
      </Link>
      
      {/* 2. Headline & Metadata (Dailyhunt Style - Below Image) */}
      <div className="space-y-3 p-4">
        {/* Headline Title */}
        <Link to={`/news/${post.slug}`} className="block">
          <h2 className="text-base md:text-lg font-black leading-snug text-[hsl(var(--foreground))] line-clamp-2 hover:text-[hsl(var(--primary))] transition-colors duration-300">
            {post.title}
          </h2>
        </Link>
        
        {/* Metadata and Action Section */}
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/40 pt-3 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Source chip with favicon logo */}
            <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 dark:bg-blue-400/10 px-1.5 py-0.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {post.source_logo ? (
                <img
                  src={post.source_logo}
                  alt={post.author_name}
                  width={12}
                  height={12}
                  className="rounded-sm object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : null}
              {post.author_name}
              <span className="text-[10px]">✓</span>
            </span>
            <span className="text-gray-300 dark:text-zinc-700">·</span>
            <span>{timeAgo(post.published_at)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-7 w-7 rounded-full p-0 hover:bg-[hsl(var(--muted))]" aria-label="Save post">
              <Bookmark className="size-3.5" />
            </Button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-105" aria-label="WhatsApp share">
              <Share2 className="size-3.5" />
            </a>
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center rounded-full bg-blue-500 text-white transition-transform hover:scale-105" aria-label="Telegram share">
              <Send className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
