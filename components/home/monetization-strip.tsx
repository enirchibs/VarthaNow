import { Crown, IndianRupee, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MonetizationStrip() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-3xl border border-dashed border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-black">
          <Megaphone className="size-4 text-primary" />
          Native ad slot
        </div>
        <p className="text-sm text-muted-foreground">Ad space reserved for high-trust regional campaigns.</p>
      </div>
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-black">
          <IndianRupee className="size-4 text-primary" />
          Sponsored
        </div>
        <p className="text-sm text-muted-foreground">Coastal Mart weekend offers in Vizag and Vijayawada.</p>
      </div>
      <div className="rounded-3xl border border-accent/40 bg-accent/10 p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-black">
          <Crown className="size-4 text-accent" />
          Premium
        </div>
        <Button size="sm" variant="accent">Remove ads</Button>
      </div>
    </section>
  );
}
