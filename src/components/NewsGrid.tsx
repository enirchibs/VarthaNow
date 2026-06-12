import type { BlogPost } from "@/types/news";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui";

export function NewsGrid({ posts, loading }: { posts: BlogPost[]; loading?: boolean }) {
  if (loading && !posts.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-96" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-1.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <NewsCard key={post.slug} post={post} priority={index === 0} />
      ))}
    </div>
  );
}
