"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, BriefcaseBusiness, Home, MapPin, PlaySquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/app-provider";
import { uiCopy } from "@/lib/i18n";

export function BottomNav() {
  const pathname = usePathname();
  const { language } = useApp();
  const copy = uiCopy[language] ?? uiCopy.te;
  const items = [
    { href: "/", label: copy.home, icon: Home },
    { href: "/shorts", label: copy.shorts, icon: PlaySquare },
    { href: "/local", label: copy.local, icon: MapPin },
    { href: "/jobs", label: copy.jobs, icon: BriefcaseBusiness },
    { href: "/ai", label: copy.ai, icon: Bot }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg px-3 safe-bottom md:hidden">
      <div className="glass grid grid-cols-5 rounded-full p-2 shadow-soft">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex h-12 items-center justify-center rounded-full text-muted-foreground transition",
                active && "text-primary-foreground"
              )}
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="bottom-active"
                  className="absolute inset-0 rounded-full bg-primary shadow-glow"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative flex flex-col items-center gap-0.5">
                <Icon className="size-4" />
                <span className="max-w-[3.6rem] truncate text-[10px] font-bold">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
