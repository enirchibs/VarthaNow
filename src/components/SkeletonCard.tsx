// SkeletonCard — shimmer placeholder matching NewsCard dimensions
// Used during loading states across homepage, category page, search

export function SkeletonCard() {
  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      {/* Image skeleton */}
      <div className="aspect-[16/10] w-full skeleton" />

      <div className="space-y-3 p-4">
        {/* Category badge skeleton */}
        <div className="skeleton h-5 w-20 rounded-full" />

        {/* Title skeleton — 2 lines */}
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-3/4 rounded-lg" />
        </div>

        {/* Excerpt skeleton — 2 lines */}
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
        </div>

        {/* Metadata bar skeleton */}
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))]/40 pt-3">
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-16 rounded-full" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton size-7 rounded-full" />
            <div className="skeleton size-7 rounded-full" />
            <div className="skeleton size-7 rounded-full" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
