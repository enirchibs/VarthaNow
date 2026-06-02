"use client";

import { Activity, Bot, Megaphone, Newspaper, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { articles, notifications } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  const metrics = [
    { label: "Articles", value: "12.8k", icon: Newspaper },
    { label: "Users", value: "84k", icon: Users },
    { label: "Realtime", value: "1.9k", icon: Activity },
    { label: "AI moderated", value: "99.2%", icon: Bot }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <ShieldAlert className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black">VaartaNow Admin</h1>
            <p className="truncate text-sm text-muted-foreground">Moderation, ingestion, notifications, analytics and ads</p>
          </div>
          <Button>
            <Megaphone className="size-4" />
            Push Alert
          </Button>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <Icon className="mb-4 size-5 text-primary" />
              <div className="text-2xl font-black">{metric.value}</div>
              <div className="text-sm font-bold text-muted-foreground">{metric.label}</div>
            </div>
          );
        })}
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="size-5 text-primary" />
            <h2 className="text-lg font-black">Scraped queue</h2>
          </div>
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-[var(--font-telugu)] text-sm font-black">{article.headline.te}</div>
                  <div className="text-xs text-muted-foreground">{article.source} · Duplicate score 0.08</div>
                </div>
                <Badge tone={article.isBreaking ? "default" : "muted"}>{article.category}</Badge>
                <Button size="sm">Approve</Button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="text-lg font-black">Trending topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Cyclone", "AP welfare", "Tollywood OTT", "Vizag jobs", "Cricket live"].map((topic) => (
                <Badge key={topic} tone="accent">{topic}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              <h2 className="text-lg font-black">Notification center</h2>
            </div>
            <div className="space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className="rounded-2xl bg-muted p-3">
                  <div className="text-sm font-black">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.type} · {item.priority}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
