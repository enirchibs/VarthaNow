import type { BlogPost } from "@/types/news";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui";

export function NewsGrid({ posts, loading }: { posts: BlogPost[]; loading?: boolean }) {
  if (loading && !posts.length) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 sm:h-48 w-full rounded-[1.6rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post, index) => (
        <NewsCard key={post.slug} post={post} priority={index === 0} />
      ))}
    </div>
  );
}
