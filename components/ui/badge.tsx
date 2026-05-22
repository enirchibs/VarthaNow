import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "accent" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        tone === "default" && "bg-primary text-primary-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        tone === "muted" && "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
