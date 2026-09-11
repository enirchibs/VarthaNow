import React, { useState } from "react";
import { Heart, Share2, Download, Sparkles, Smartphone, Edit3, MessageCircle } from "lucide-react";
import { DailyShareItem } from "@/types/daily-share";
import { isItemLiked, toggleItemLike } from "@/lib/daily-share-api";
import { DailySharePersonalizerModal } from "./DailySharePersonalizerModal";
import { useLanguage } from "@/hooks/useLanguage";

interface DailyShareCardProps {
  item: DailyShareItem;
  compact?: boolean;
}

export function DailyShareCard({ item, compact = false }: DailyShareCardProps) {
  const { lang } = useLanguage();
  const [liked, setLiked] = useState(() => isItemLiked(item.id));
  const [likesCount, setLikesCount] = useState(item.likes_count);
  const [sharesCount, setSharesCount] = useState(item.shares_count);
  const [isPersonalizerOpen, setIsPersonalizerOpen] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowLiked = toggleItemLike(item.id);
    setLiked(nowLiked);
    setLikesCount(prev => nowLiked ? prev + 1 : prev - 1);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSharesCount(prev => prev + 1);
    const shareUrl = `${window.location.origin}/daily-share#${item.slug}`;
    const message = `✨ *${item.title}* ✨\n\n"${item.quote_te || item.title}"\n\n📲 రోజువారీ తెలుగు షేర్స్ కోసం VaartaNow చూడండి: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: message,
        url: shareUrl
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  return (
    <>
      <div className={`group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] shadow-sm hover:shadow-xl hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between ${
        compact ? "min-w-[240px] max-w-[260px] shrink-0" : "w-full"
      }`}>
        {/* Top Image Preview & Quote Overlay */}
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-950">
          <img
            src={item.image_url}
            alt={item.title}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

          {/* Category Badge & VaartaNow Watermark */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600/90 text-white shadow-sm border border-white/20">
              {item.category}
            </span>
            <span className="text-[9px] font-black text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
              VaartaNow
            </span>
          </div>

          {/* Quote Text Container */}
          <div className="absolute inset-x-3 bottom-3 z-10 text-left space-y-1.5 pointer-events-none">
            <p className="text-xs sm:text-sm font-black leading-snug text-white drop-shadow-md line-clamp-3">
              "{item.quote_te || item.title}"
            </p>

            {item.author && (
              <p className="text-[10px] font-bold text-amber-400">
                — {item.author}
              </p>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-2.5 space-y-2 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]/50">
          <div className="flex items-center justify-between text-xs font-black text-[hsl(var(--muted-foreground))]">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition ${liked ? "text-rose-600 scale-105" : "hover:text-rose-500"}`}
            >
              <Heart className={`size-4 ${liked ? "fill-rose-600 stroke-rose-600" : ""}`} />
              <span className="text-[11px]">{likesCount}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-blue-500 transition"
            >
              <Share2 className="size-4" />
              <span className="text-[11px]">{sharesCount}</span>
            </button>

            {item.personalization_enabled && (
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                ✏️ పర్సనలైజ్
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => setIsPersonalizerOpen(true)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-[10px] sm:text-xs shadow-xs active:scale-95 transition flex items-center justify-center gap-1"
            >
              <Edit3 className="size-3.5" />
              <span>{lang === "te" ? "పర్సనలైజ్ ✏️" : "Personalize"}</span>
            </button>

            <button
              onClick={handleShare}
              className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] sm:text-xs shadow-xs active:scale-95 transition flex items-center justify-center gap-1"
              title="Share to WhatsApp Status"
            >
              <Smartphone className="size-3.5" />
              <span>{lang === "te" ? "వాట్సాప్" : "WhatsApp"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personalizer Modal */}
      <DailySharePersonalizerModal
        item={item}
        isOpen={isPersonalizerOpen}
        onClose={() => setIsPersonalizerOpen(false)}
      />
    </>
  );
}
