"use client";

import { useState } from "react";
import { AlertTriangle, Building2, Camera, CloudRain, MapPin, Navigation, Video, Zap } from "lucide-react";
import { featuredCities } from "@/lib/constants";
import { articles } from "@/lib/data";
import { NewsCard } from "@/components/home/news-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const areas = ["Madhurawada", "Gajuwaka", "MVP Colony", "Benz Circle", "Arundelpet", "Tiruchanur"];

export function LocalDashboard() {
  const [city, setCity] = useState("Vizag");
  const [area, setArea] = useState("Madhurawada");
  const localArticles = articles.filter((article) => article.city === city || article.category === "Weather").concat(articles.slice(0, 2));

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <MapPin className="size-5" />
          </div>
          <div>
            <h1 className="font-[var(--font-telugu)] text-2xl font-black">మీ లోకల్ ఫీడ్</h1>
            <p className="text-sm text-muted-foreground">State, city, locality based alerts and updates</p>
          </div>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto p-1">
          {featuredCities.map((item) => (
            <Button key={item} variant={city === item ? "default" : "secondary"} size="sm" onClick={() => setCity(item)}>
              {item}
            </Button>
          ))}
        </div>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto p-1">
          {areas.map((item) => (
            <button
              key={item}
              onClick={() => setArea(item)}
              className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-bold data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              data-active={area === item}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { icon: CloudRain, label: "Rain alert", value: "8 PM", tone: "high" },
          { icon: Navigation, label: "Traffic", value: "NH16 slow", tone: "medium" },
          { icon: Zap, label: "Power cut", value: "None", tone: "low" },
          { icon: Building2, label: "Openings", value: "12 new", tone: "medium" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <Icon className="size-5 text-primary" />
                <Badge tone={item.tone === "high" ? "default" : "muted"}>{city}</Badge>
              </div>
              <div className="text-sm font-bold text-muted-foreground">{item.label}</div>
              <div className="mt-1 text-xl font-black">{item.value}</div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-5 text-accent" />
          <h2 className="text-lg font-black">Community reports from {area}</h2>
        </div>
        <div className="mb-3 flex gap-2">
          <Button variant="secondary" size="sm">
            <Camera className="size-4" />
            Photo report
          </Button>
          <Button variant="secondary" size="sm">
            <Video className="size-4" />
            Short video
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["Road repair near junction", "Water tanker timing changed", "New clinic opened"].map((item) => (
            <div key={item} className="rounded-2xl bg-muted p-3 text-sm font-semibold">{item}</div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {localArticles.map((article, index) => (
          <NewsCard key={`${article.id}-local-${index}`} article={article} />
        ))}
      </div>
    </div>
  );
}
