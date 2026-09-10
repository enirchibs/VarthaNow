import { useEffect, useState } from "react";
import type { BlogPost } from "@/types/news";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui";
import { demoPosts } from "@/lib/demo-data";

export function NewsGrid({ posts, loading }: { posts: BlogPost[]; loading?: boolean }) {
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

  // Ensure AT LEAST 9 articles are ALWAYS displayed in the grid
  let displayPosts = [...posts];
  if (displayPosts.length > 0 && displayPosts.length < 9) {
    for (const dp of demoPosts) {
      if (displayPosts.length >= 9) break;
      if (!displayPosts.some((p) => p.slug === dp.slug)) {
        displayPosts.push(dp);
      }
    }
    // Duplicate posts if still under 9
    let i = 0;
    while (displayPosts.length > 0 && displayPosts.length < 9) {
      const p = displayPosts[i % displayPosts.length];
      displayPosts.push({ ...p, slug: `${p.slug}-dup-${displayPosts.length}` });
      i++;
    }
  }

  return (
    <div 
      className="grid grid-cols-2 gap-3 sm:gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayPosts.map((post, index) => (
        <div 
          key={post.slug} 
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
          style={{ animationDelay: `${(index % 8) * 70}ms` }}
        >
          <NewsCard 
            post={post} 
            priority={index === 0} 
            isSpotlight={index === spotlightIndex}
          />
        </div>
      ))}
    </div>
  );
}
