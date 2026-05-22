"use client";

import { useMemo, useState } from "react";
import { Bookmark, BriefcaseBusiness, ExternalLink, Filter, Share2 } from "lucide-react";
import { jobs } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const filters = ["All", "Govt", "IT", "Walk-in", "Internship", "Local"];

export function JobsBoard() {
  const [filter, setFilter] = useState("All");
  const visible = useMemo(() => (filter === "All" ? jobs : jobs.filter((job) => job.type === filter)), [filter]);

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-[var(--font-telugu)] text-2xl font-black">జాబ్స్ హబ్</h1>
            <p className="truncate text-sm text-muted-foreground">Govt, IT, walk-ins, internships and local jobs</p>
          </div>
          <Button variant="secondary" size="iconSm" aria-label="Filters">
            <Filter className="size-4" />
          </Button>
        </div>
      </section>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {filters.map((item) => (
          <Button key={item} variant={filter === item ? "default" : "secondary"} size="sm" onClick={() => setFilter(item)}>
            {item}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((job) => (
          <article key={job.id} className="rounded-[1.5rem] border border-border bg-card p-4 shadow-soft">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Badge tone={job.type === "Govt" ? "accent" : "muted"}>{job.type}</Badge>
                <h2 className="mt-3 text-xl font-black">{job.title}</h2>
                <p className="text-sm font-semibold text-muted-foreground">{job.company} · {job.location}</p>
              </div>
              <Button variant="secondary" size="iconSm" aria-label="Save job">
                <Bookmark className="size-4" />
              </Button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-3">
                <div className="text-xs font-bold text-muted-foreground">Salary</div>
                <div className="font-black">{job.salary}</div>
              </div>
              <div className="rounded-2xl bg-muted p-3">
                <div className="text-xs font-bold text-muted-foreground">Deadline</div>
                <div className="font-black">{job.deadline}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <a href={job.applyUrl}>
                  Apply <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button variant="secondary" size="icon" aria-label="Share job">
                <Share2 className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
