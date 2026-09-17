import React from "react";
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  Truck, 
  Info,
  Clock
} from "lucide-react";
import type { CanonicalProduct, MerchantOffer } from "@/types/deals";

interface DealsCompareModalProps {
  product: CanonicalProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyClick: (product: CanonicalProduct, offer: MerchantOffer) => void;
}

export const DealsCompareModal: React.FC<DealsCompareModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuyClick
}) => {
  if (!isOpen || !product) return null;

  const amazonOffer = product.offers.find((o) => o.merchant === "amazon");
  const flipkartOffer = product.offers.find((o) => o.merchant === "flipkart");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                ధర పోల్చండి (Price Comparison)
              </h3>
              <p className="text-[11px] text-slate-500">
                {product.model} • Amazon vs Flipkart
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition shadow-2xs"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Product Summary Card */}
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700">
            <img
              src={product.image_url}
              alt={product.model}
              className="size-20 sm:size-24 object-contain rounded-xl bg-white p-1 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-orange-600">{product.brand}</span>
              <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                {product.title_te}
              </h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {product.key_specs.map((spec, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-slate-200">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Callout Result Banner */}
          {product.price_difference && product.price_difference > 0 && product.cheaper_merchant && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <span>
                  🟢 {product.cheaper_merchant === "amazon" ? "Amazon" : "Flipkart"} లో ₹{product.price_difference} తక్కువగా ఉంది!
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                ఉత్తమ డీల్
              </span>
            </div>
          )}

          {/* 2 Big Merchant Comparison Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* 1. AMAZON INDIA */}
            {amazonOffer && (
              <div className={`p-4 rounded-3xl border-2 flex flex-col justify-between transition ${
                amazonOffer.is_lowest
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-300/50"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <img src={amazonOffer.merchant_logo} alt="Amazon" className="size-6 rounded-md object-contain" />
                      <span className="font-black text-sm text-slate-900 dark:text-white">Amazon India</span>
                    </div>
                    {amazonOffer.is_lowest && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                        తక్కువ ధర
                      </span>
                    )}
                  </div>

                  <div className="my-3">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      ₹{amazonOffer.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-slate-400 line-through">
                      M.R.P: ₹{amazonOffer.mrp.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-3.5 text-slate-500" />
                      <span>{amazonOffer.shipping_info || "ఉచిత డెలివరీ (Eligible)"}</span>
                    </div>
                    {amazonOffer.rating && (
                      <div className="flex items-center gap-1.5">
                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                        <span>{amazonOffer.rating} ⭐ ({amazonOffer.review_count?.toLocaleString("en-IN")} సమీక్షలు)</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBuyClick(product, amazonOffer)}
                  className="w-full py-3 rounded-2xl bg-[#FF9900] hover:bg-[#e68a00] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <span>🛒 Amazonలో కొనండి</span>
                  <ExternalLink className="size-4" />
                </button>
              </div>
            )}

            {/* 2. FLIPKART */}
            {flipkartOffer && (
              <div className={`p-4 rounded-3xl border-2 flex flex-col justify-between transition ${
                flipkartOffer.is_lowest
                  ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-600 shadow-md ring-2 ring-blue-300/50"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <img src={flipkartOffer.merchant_logo} alt="Flipkart" className="size-6 rounded-md object-contain" />
                      <span className="font-black text-sm text-slate-900 dark:text-white">Flipkart</span>
                    </div>
                    {flipkartOffer.is_lowest && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                        తక్కువ ధర
                      </span>
                    )}
                  </div>

                  <div className="my-3">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      ₹{flipkartOffer.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-slate-400 line-through">
                      M.R.P: ₹{flipkartOffer.mrp.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-3.5 text-slate-500" />
                      <span>{flipkartOffer.shipping_info || "ఉచిత డెలివరీ (Plus / Fast)"}</span>
                    </div>
                    {flipkartOffer.rating && (
                      <div className="flex items-center gap-1.5">
                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                        <span>{flipkartOffer.rating} ⭐ ({flipkartOffer.review_count?.toLocaleString("en-IN")} సమీక్షలు)</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBuyClick(product, flipkartOffer)}
                  className="w-full py-3 rounded-2xl bg-[#2874F0] hover:bg-[#2060c8] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <span>🛒 Flipkartలో కొనండి</span>
                  <ExternalLink className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Timestamp and Disclaimer Notice */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>ధరలు తనిఖీ చేసిన సమయం: 17 Sep 2026, 8:30 PM (సమయానుకూలంగా మారవచ్చు)</span>
            </div>
            <p className="text-[10px] leading-tight">
              <strong>గమనిక:</strong> మన అడ్డా విక్రేత కాదు. కొనుగోలు, పేమెంట్ మరియు డెలివరీలు పూర్తిగా అమెజాన్ లేదా ఫ్లిప్‌కార్ట్ వెబ్‌సైట్ ద్వారా మాత్రమే నిర్వహించబడతాయి.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
