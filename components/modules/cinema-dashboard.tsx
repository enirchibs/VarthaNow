import { Clapperboard, Play, Star, Tv } from "lucide-react";
import { articles } from "@/lib/data";
import { NewsCard } from "@/components/home/news-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CinemaDashboard() {
  const cinema = articles.filter((article) => article.category === "Cinema").concat(articles.slice(0, 3));

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <Clapperboard className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-[var(--font-telugu)] text-2xl font-black">టాలీవుడ్ పల్స్</h1>
            <p className="truncate text-sm text-muted-foreground">Movie news, OTT, celebrity updates, reviews and box office</p>
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        {[
          { icon: Tv, label: "OTT releases", value: "5 this week" },
          { icon: Star, label: "Box office", value: "₹82Cr weekend" },
          { icon: Play, label: "Trailers", value: "12 trending" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <Icon className="mb-4 size-5 text-primary" />
              <Badge tone="accent">{item.label}</Badge>
              <div className="mt-3 text-xl font-black">{item.value}</div>
            </div>
          );
        })}
      </section>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cinema.map((article, index) => (
          <NewsCard key={`${article.id}-cinema-${index}`} article={article} />
        ))}
      </div>
      <Button variant="secondary" className="w-full">Load more Tollywood updates</Button>
    </div>
  );
}
