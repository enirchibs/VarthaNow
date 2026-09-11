import React, { useState } from "react";
import { 
  BarChart3, TrendingUp, Eye, Users, Smartphone, Share2, MapPin, Activity, Clock, ShieldCheck
} from "lucide-react";

export function AnalyticsAdminDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  // Simulated live metrics based on app activities
  const metrics = {
    totalViews: timeRange === "24h" ? "42,850" : timeRange === "7d" ? "284,120" : "1,240,500",
    uniqueReaders: timeRange === "24h" ? "18,400" : timeRange === "7d" ? "112,600" : "480,200",
    dailyShareDownloads: timeRange === "24h" ? "8,920" : timeRange === "7d" ? "54,300" : "210,000",
    jobApplications: timeRange === "24h" ? "1,450" : timeRange === "7d" ? "9,800" : "42,100",
    avgReadTime: "4m 12s",
  };

  const topCategories = [
    { name: "రాజకీయాలు (Politics)", percentage: "34%", count: "96,400 views", color: "bg-red-500" },
    { name: "✨ ఈరోజు వాట్సాప్ షేర్ (Daily Share)", percentage: "22%", count: "62,500 views", color: "bg-amber-500" },
    { name: "💼 స్థానిక ఉద్యోగాలు (Local Jobs)", percentage: "18%", count: "51,100 views", color: "bg-indigo-500" },
    { name: "సినిమా (Cinema & Movies)", percentage: "12%", count: "34,000 views", color: "bg-pink-500" },
    { name: "🚩 భక్తి సమయం (Devotional)", percentage: "8%", count: "22,700 views", color: "bg-orange-500" },
    { name: "సాంకేతికత (Technology)", percentage: "6%", count: "17,420 views", color: "bg-emerald-500" },
  ];

  const locationBreakdown = [
    { city: "Visakhapatnam", count: "28.4%", users: "32,000" },
    { city: "Vijayawada", count: "24.1%", users: "27,100" },
    { city: "Hyderabad", count: "20.8%", users: "23,400" },
    { city: "Tirupati", count: "14.2%", users: "16,000" },
    { city: "Rajahmundry", count: "12.5%", users: "14,100" },
  ];

  return (
    <div className="space-y-8">
      {/* 📊 HEADER & TIMEFRAME SELECTOR */}
      <section className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Reader Analytics & Performance Dashboard</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
              Real-time reader engagement, category interest trends, daily share status downloads & job clicks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[hsl(var(--muted))] p-1 rounded-xl shrink-0">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                timeRange === range
                  ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {range === "24h" ? "Last 24 Hours" : range === "7d" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
        </div>
      </section>

      {/* 📈 KPI STAT CARDS */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <Eye className="mb-2 size-5 text-blue-500" />
          <div className="text-2xl font-black">{metrics.totalViews}</div>
          <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase mt-1">Total Pageviews</div>
        </div>

        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <Users className="mb-2 size-5 text-emerald-500" />
          <div className="text-2xl font-black">{metrics.uniqueReaders}</div>
          <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase mt-1">Unique Readers</div>
        </div>

        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <Share2 className="mb-2 size-5 text-amber-500" />
          <div className="text-2xl font-black">{metrics.dailyShareDownloads}</div>
          <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase mt-1">WhatsApp Status Shares</div>
        </div>

        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <Smartphone className="mb-2 size-5 text-indigo-500" />
          <div className="text-2xl font-black">{metrics.jobApplications}</div>
          <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase mt-1">Job Application Clicks</div>
        </div>

        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 col-span-2 md:col-span-1 shadow-sm">
          <Clock className="mb-2 size-5 text-purple-500" />
          <div className="text-2xl font-black">{metrics.avgReadTime}</div>
          <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase mt-1">Avg Session Time</div>
        </div>
      </section>

      {/* 📊 CATEGORY PERFORMANCE & CITY BREAKDOWN */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Category breakdown */}
        <div className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-500" />
            Top Reader Interest Categories
          </h3>
          <div className="space-y-3">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-black">
                  <span>{cat.name}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{cat.percentage} ({cat.count})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <MapPin className="size-5 text-red-500" />
            Top Reader Cities (AP & Telangana)
          </h3>
          <div className="space-y-3">
            {locationBreakdown.map((loc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-red-500/10 text-red-600 font-black text-xs flex items-center justify-center">{idx + 1}</span>
                  <span className="text-xs font-black">{loc.city}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black block">{loc.count}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold">{loc.users} readers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
