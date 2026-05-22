"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark, Heart, MessageCircle, Share2, Volume2 } from "lucide-react";
import { articles } from "@/lib/data";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { compactNumber, timeAgo } from "@/lib/utils";
import { useState } from "react";

export function ShortsFeed() {
  const { language } = useApp();
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <div className="relative h-screen overflow-y-auto snap-feed bg-sky-950 text-white">
      <div className="fixed left-4 right-4 top-4 z-30 flex items-center justify-between">
        <Button asChild variant="glass" size="iconSm" aria-label="Back home">
          <Link href="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black backdrop-blur-xl">Shorts</div>
      </div>
      {articles.concat(articles).map((article, index) => (
        <section key={`${article.id}-${index}`} className="snap-card relative h-screen overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.headline[language]}
            fill
            priority={index < 2}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-950 via-sky-950/35 to-sky-900/20" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.75 }}
            transition={{ duration: 0.26 }}
            className="absolute inset-x-0 bottom-24 z-10 space-y-4 px-4 md:mx-auto md:max-w-xl"
          >
            <div className="flex items-center gap-2">
              <Badge tone={article.isBreaking ? "default" : "accent"}>{article.category}</Badge>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-xl">
                {article.source} · {timeAgo(article.publishedAt)}
              </span>
            </div>
            <h1 className="font-[var(--font-telugu)] text-3xl font-black leading-tight md:text-5xl">
              {article.headline[language]}
            </h1>
            <p className="font-[var(--font-telugu)] text-base leading-7 text-white/82">
              {article.oneMinute[language]}
            </p>
          </motion.div>
          <div className="absolute bottom-28 right-4 z-20 flex flex-col gap-3">
            <Button
              variant={liked[article.id] ? "default" : "glass"}
              size="icon"
              onClick={() => setLiked((value) => ({ ...value, [article.id]: !value[article.id] }))}
              aria-label="React"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={String(Boolean(liked[article.id]))}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.7 }}
                >
                  <Heart className={liked[article.id] ? "size-5 fill-current" : "size-5"} />
                </motion.span>
              </AnimatePresence>
            </Button>
            <span className="text-center text-xs font-bold">{compactNumber(article.reactions)}</span>
            <Button variant="glass" size="icon" aria-label="AI voice">
              <Volume2 className="size-5" />
            </Button>
            <Button variant="glass" size="icon" aria-label="Comments">
              <MessageCircle className="size-5" />
            </Button>
            <Button variant="glass" size="icon" aria-label="Bookmark">
              <Bookmark className="size-5" />
            </Button>
            <Button variant="glass" size="icon" aria-label="Share">
              <Share2 className="size-5" />
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
