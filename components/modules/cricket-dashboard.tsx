import { Activity, CalendarDays, Radio, Trophy } from "lucide-react";
import { articles } from "@/lib/data";
import { NewsCard } from "@/components/home/news-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CricketDashboard() {
  const cricket = articles.filter((article) => article.category === "Cricket").concat(articles.slice(0, 3));

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <Trophy className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-[var(--font-telugu)] text-2xl font-black">క్రికెట్ లైవ్</h1>
            <p className="truncate text-sm text-muted-foreground">Scores, schedules, highlights and Telugu AI commentary</p>
          </div>
        </div>
      </section>
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <Badge>LIVE</Badge>
          <Button size="sm" variant="secondary">
            <Radio className="size-4" />
            Telugu AI commentary
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: Activity, label: "IND", value: "152/3", sub: "16.4 overs" },
            { icon: Trophy, label: "Target", value: "188", sub: "36 from 20" },
            { icon: CalendarDays, label: "Next", value: "Final", sub: "May 22" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-3xl bg-muted p-4">
                <Icon className="mb-4 size-5 text-primary" />
                <div className="text-xs font-black text-muted-foreground">{item.label}</div>
                <div className="text-2xl font-black">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.sub}</div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cricket.map((article, index) => (
          <NewsCard key={`${article.id}-cricket-${index}`} article={article} />
        ))}
      </div>
    </div>
  );
}
