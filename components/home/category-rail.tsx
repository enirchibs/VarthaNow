"use client";

import { motion } from "framer-motion";
import { categories } from "@/lib/constants";

export function CategoryRail({ active, onChange }: { active: string; onChange: (category: string) => void }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2">
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className="relative shrink-0 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition data-[active=true]:text-primary-foreground"
            data-active={isActive}
          >
            {isActive && (
              <motion.span
                layoutId="category-active"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 430, damping: 30 }}
              />
            )}
            <span className="relative">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
