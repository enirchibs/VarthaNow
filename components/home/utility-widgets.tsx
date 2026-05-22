import { Gauge, IndianRupee, CloudSun, Fuel, Wind } from "lucide-react";
import { utilityMetrics } from "@/lib/constants";

const icons = [CloudSun, IndianRupee, IndianRupee, Fuel, Fuel, Gauge, Wind];

export function UtilityWidgets() {
  return (
    <section className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-2">
      {utilityMetrics.map((metric, index) => {
        const Icon = icons[index] ?? Gauge;
        return (
          <div key={metric.label} className="min-w-[9rem] rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">{metric.label}</span>
              <span className="grid size-8 place-items-center rounded-full bg-muted">
                <Icon className="size-4 text-primary" />
              </span>
            </div>
            <div className="text-xl font-black">{metric.value}</div>
            <div className="mt-1 truncate text-xs text-muted-foreground">{metric.delta}</div>
          </div>
        );
      })}
    </section>
  );
}
