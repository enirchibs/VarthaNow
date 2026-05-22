"use client";

import { useState } from "react";
import { Check, Languages } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers/app-provider";
import { languages } from "@/lib/i18n";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useApp();
  const current = languages.find((item) => item.code === language) ?? languages[0];

  return (
    <div className="relative">
      <Button variant="glass" size="sm" onClick={() => setOpen((value) => !value)} aria-label="Change language">
        <Languages className="size-4" />
        <span className="hidden sm:inline">{current.native}</span>
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="glass absolute right-0 top-12 z-50 w-52 rounded-3xl p-2 shadow-soft"
          >
            {languages.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setLanguage(item.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-semibold hover:bg-muted"
              >
                <span>
                  <span className="block">{item.native}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </span>
                {item.code === language && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
