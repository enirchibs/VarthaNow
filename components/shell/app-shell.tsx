"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Bot, Search } from "lucide-react";
import { BottomNav } from "@/components/shell/bottom-nav";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers/app-provider";
import { uiCopy } from "@/lib/i18n";
import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useApp();
  const copy = uiCopy[language] ?? uiCopy.te;
  const isShorts = pathname === "/shorts";

  return (
    <div className="min-h-screen">
      {!isShorts && (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/84 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-black text-white shadow-glow">V</span>
              <span className="min-w-0">
                <span className="block truncate font-[var(--font-poppins)] text-lg font-bold leading-tight">VarthaNow</span>
                <span className="block truncate font-[var(--font-telugu)] text-[11px] text-muted-foreground">
                  {copy.tagline}
                </span>
              </span>
            </Link>
            <Button variant="glass" size="iconSm" aria-label="Search">
              <Search className="size-4" />
            </Button>
            <LanguageSwitcher />
            <Button asChild variant="glass" size="iconSm" aria-label="Notifications">
              <Link href="/profile">
                <Bell className="size-4" />
              </Link>
            </Button>
          </div>
        </header>
      )}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={isShorts ? "min-h-screen" : "mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-4 md:pb-10"}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!isShorts && (
        <Link
          href="/ai"
          className="fixed bottom-24 right-4 z-40 inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow transition hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
          aria-label={copy.ask}
        >
          <Bot className="size-5" />
        </Link>
      )}
      <BottomNav />
    </div>
  );
}
