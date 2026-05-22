import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-12 rounded-full" />
      <Skeleton className="h-28 rounded-[1.8rem]" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[1.7rem] border border-border bg-card p-3 shadow-soft">
            <Skeleton className="aspect-[4/3] rounded-[1.4rem]" />
            <Skeleton className="mt-4 h-7" />
            <Skeleton className="mt-2 h-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
