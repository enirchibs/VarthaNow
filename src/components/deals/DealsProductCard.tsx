import React, { useState } from "react";
import { 
  ExternalLink, 
  Bookmark, 
  Star, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ShieldCheck, 
  Tag,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import type { CanonicalProduct, MerchantOffer } from "@/types/deals";

interface DealsProductCardProps {
  product: CanonicalProduct;
  isSaved: boolean;
  onToggleSave: (product: CanonicalProduct) => void;
  onOpenCompare: (product: CanonicalProduct) => void;
  onBuyClick: (product: CanonicalProduct, offer: MerchantOffer) => void;
}

export const DealsProductCard: React.FC<DealsProductCardProps> = ({
  product,
  isSaved,
  onToggleSave,
  onOpenCompare,
  onBuyClick
}) => {
  const [showWhyDeal, setShowWhyDeal] = useState(false);

  // Find lowest price offer
  const lowestOffer = product.offers.reduce((prev, curr) => 
    curr.price < prev.price ? curr : prev, product.offers[0]
  );

  // Find other offer for comparison
  const otherOffer = product.offers.find((o) => o.merchant !== lowestOffer.merchant);

  // Savings
  const savings = product.highest_mrp - product.lowest_price;
  const savingsPercent = Math.round((savings / product.highest_mrp) * 100);

  // Deal label in Telugu
  const getDealBadge = () => {
    switch (product.deal_label) {
      case "lowest_price":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">🟢 తక్కువ ధర</span>;
      case "good_deal":
        return <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase">🔥 మంచి డీల్</span>;
      case "budget_pick":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 text-[10px] font-black uppercase">💰 బడ్జెట్ పిక్</span>;
      case "student_pick":
        return <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase">🎓 స్టూడెంట్ పిక్</span>;
      case "farmer_pick":
        return <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase">👨‍🌾 రైతు పిక్</span>;
      case "price_drop":
        return <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">⚡ ధర తగ్గింది</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-black uppercase">⭐ పాపులర్</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200/80 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-600 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Top Image Box */}
        <div className="relative w-full h-52 sm:h-56 bg-slate-50 dark:bg-zinc-800/60 p-4 flex items-center justify-center overflow-hidden">
          <img
            src={product.image_url}
            alt={product.model}
            className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
          />

          {/* Badges Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {getDealBadge()}
            {savingsPercent > 10 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-black border border-red-200 dark:border-red-800">
                {savingsPercent}% ఆదా
              </span>
            )}
          </div>

          {/* Bookmark Button Top Right */}
          <button
            type="button"
            onClick={() => onToggleSave(product)}
            className={`absolute top-3 right-3 size-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-xs z-10 ${
              isSaved
                ? "bg-amber-500 text-white"
                : "bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-slate-200 hover:bg-white"
            }`}
            title={isSaved ? "సేవ్ తొలగించండి" : "డీల్ సేవ్ చేయండి"}
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>{product.brand}</span>
            <span className="text-orange-600 dark:text-orange-400 font-extrabold">{product.category_name_te}</span>
          </div>

          {/* Title */}
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2">
            {product.title_te}
          </h3>

          {/* Key Specs Tags */}
          <div className="space-y-1 mb-3">
            {product.key_specs.slice(0, 2).map((spec, i) => (
              <div key={i} className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <span className="size-1 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{spec}</span>
              </div>
            ))}
          </div>

          {/* Ratings if available */}
          {lowestOffer.rating && (
            <div className="flex items-center gap-1.5 mb-3 text-xs">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">
                <Star className="size-2.5 fill-white" />
                <span>{lowestOffer.rating}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                ({lowestOffer.review_count?.toLocaleString("en-IN")} కొనుగోలుదారులు)
              </span>
            </div>
          )}

          {/* Price & Savings Display */}
          <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-zinc-800/60 border border-amber-200/60 dark:border-zinc-700/80 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{product.lowest_price.toLocaleString("en-IN")}
              </span>
              {product.highest_mrp > product.lowest_price && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  M.R.P: ₹{product.highest_mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Price Comparison Callout */}
            {otherOffer && product.price_difference && product.price_difference > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-amber-200/40 dark:border-zinc-700 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {lowestOffer.merchant_name}: ₹{lowestOffer.price.toLocaleString("en-IN")} | {otherOffer.merchant_name}: ₹{otherOffer.price.toLocaleString("en-IN")}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-black shrink-0">
                  🟢 {lowestOffer.merchant_name}లో ₹{product.price_difference} తక్కువ
                </span>
              </div>
            )}
          </div>

          {/* "Why this deal?" Accordion */}
          {product.why_this_deal && product.why_this_deal.length > 0 && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setShowWhyDeal(!showWhyDeal)}
                className="w-full flex items-center justify-between text-[11px] font-extrabold text-orange-600 dark:text-orange-400 py-1"
              >
                <span>🔍 ఈ డీల్ ఎందుకు మంచిది? (Why This Deal)</span>
                {showWhyDeal ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              {showWhyDeal && (
                <div className="mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1 animate-in fade-in duration-200">
                  {product.why_this_deal.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Timestamp */}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            <Clock className="size-3" />
            <span>ధర తనిఖీ చేసిన సమయం: 17 Sep 2026, 8:30 PM</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 space-y-2">
        {/* Primary CTA to the lowest price merchant */}
        <button
          type="button"
          onClick={() => onBuyClick(product, lowestOffer)}
          className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition ${
            lowestOffer.merchant === "amazon"
              ? "bg-[#FF9900] hover:bg-[#e68a00] text-black shadow-amber-500/20"
              : "bg-[#2874F0] hover:bg-[#2060c8] text-white shadow-blue-500/20"
          }`}
        >
          <span>🛒 {lowestOffer.merchant === "amazon" ? "Amazonలో కొనండి" : "Flipkartలో కొనండి"}</span>
          <ExternalLink className="size-3.5 stroke-[2.5px]" />
        </button>

        {/* Secondary: Compare Modal */}
        <button
          type="button"
          onClick={() => onOpenCompare(product)}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🆚 ధర పోల్చండి ({product.offers.length} స్టోర్లు)</span>
        </button>
      </div>
    </div>
  );
};
