"use client";

import Image from "next/image";
import { motion, useAnimationControls } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Share2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/types";
import { compactNumber, timeAgo } from "@/lib/utils";
import { useApp } from "@/components/providers/app-provider";
import { useState } from "react";

export function NewsCard({ article, priority = false }: { article: Article; priority?: boolean }) {
  const { language } = useApp();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const controls = useAnimationControls();

  const react = async () => {
    setLiked((value) => !value);
    await controls.start({ scale: [1, 1.18, 1], transition: { duration: 0.28 } });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-[1.7rem] border border-border bg-card shadow-soft"
      onDoubleClick={react}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={article.imageUrl}
          alt={article.headline[language]}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 44vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <Badge tone={article.isBreaking ? "default" : "accent"}>{article.category}</Badge>
          <Button size="iconSm" variant="glass" aria-label="Play AI voice">
            <Volume2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <span>{article.source}</span>
            <span>•</span>
            <span>{timeAgo(article.publishedAt)}</span>
            {article.city && (
              <>
                <span>•</span>
                <span>{article.city}</span>
              </>
            )}
          </div>
          <h2 className="font-[var(--font-telugu)] text-2xl font-black leading-tight tracking-normal">
            {article.headline[language]}
          </h2>
          <p className="font-[var(--font-telugu)] text-[15px] leading-7 text-muted-foreground">
            {article.summary[language]}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={react} variant={liked ? "default" : "secondary"} size="sm" aria-label="React">
              <motion.span animate={controls}>
                <Heart className={liked ? "size-4 fill-current" : "size-4"} />
              </motion.span>
              {compactNumber(article.reactions + (liked ? 1 : 0))}
            </Button>
            <Button variant="secondary" size="iconSm" aria-label="Comments">
              <MessageCircle className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setBookmarked((value) => !value)}
              variant={bookmarked ? "accent" : "secondary"}
              size="iconSm"
              aria-label="Bookmark"
            >
              <Bookmark className={bookmarked ? "size-4 fill-current" : "size-4"} />
            </Button>
            <Button variant="secondary" size="iconSm" aria-label="Share">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
