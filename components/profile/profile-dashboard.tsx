"use client";

import { Bell, Bookmark, Clock3, Heart, Moon, Radio, Settings, UserRound } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/data";

export function ProfileDashboard() {
  const { darkMode, setDarkMode } = useApp();
  const stats = [
    { label: "Saved", value: "42", icon: Bookmark },
    { label: "Liked", value: "128", icon: Heart },
    { label: "Topics", value: "16", icon: Radio },
    { label: "History", value: "2.4h", icon: Clock3 }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-3xl bg-primary text-white shadow-glow">
            <UserRound className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-black">Vartha Reader</h1>
            <p className="truncate text-sm text-muted-foreground">Following Vizag, AP politics, Cinema, Cricket</p>
          </div>
          <Button variant="secondary" size="iconSm" aria-label="Settings">
            <Settings className="size-4" />
          </Button>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <Icon className="mb-4 size-5 text-primary" />
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-sm font-bold text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </section>
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="size-5 text-primary" />
            <h2 className="text-lg font-black">Dark mode</h2>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative h-8 w-14 rounded-full bg-muted p-1 data-[active=true]:bg-primary"
            data-active={darkMode}
            aria-label="Toggle dark mode"
          >
            <span className="block size-6 rounded-full bg-white transition data-[active=true]:translate-x-6" data-active={darkMode} />
          </button>
        </div>
      </section>
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <h2 className="text-lg font-black">Notifications</h2>
        </div>
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-2xl bg-muted p-3">
              <div className="text-sm font-black">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
