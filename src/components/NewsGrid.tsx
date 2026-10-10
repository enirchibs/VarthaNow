import { useEffect, useState } from "react";
import type { BlogPost } from "@/types/news";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui";

export function NewsGrid({
  posts,
  loading,
}: {
  posts: BlogPost[];
  loading?: boolean;
  /** Accepted for compatibility; the grid never pads with demo or duplicate articles. */
  fillMinimum?: boolean;
}) {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate spotlight focus through the 4 top articles every 3.5 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  if (loading && !posts.length) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-[1.4rem]" />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-[1.4rem] border border-dashed border-border p-8 text-center text-sm font-bold text-muted-foreground">
        ప్రస్తుతం వార్తలు అందుబాటులో లేవు. కొద్దిసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 gap-2.5 sm:gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {posts.map((post, index) => (
        <div 
          key={`${post.slug}-${index}`} 
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
          style={{ animationDelay: `${(index % 8) * 70}ms` }}
        >
          <NewsCard 
            post={post} 
            priority={index === 0} 
            isSpotlight={index === spotlightIndex}
            feedPosts={posts}
          />
        </div>
      ))}
    </div>
  );
}
