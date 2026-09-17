import React, { useState } from "react";
import { X, BellRing, CheckCircle2 } from "lucide-react";
import type { CanonicalProduct } from "@/types/deals";
import { savePriceDropAlert } from "@/lib/deals/deals-api";

interface DealsPriceAlertModalProps {
  product: CanonicalProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DealsPriceAlertModal: React.FC<DealsPriceAlertModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!isOpen || !product) return null;

  const [targetPrice, setTargetPrice] = useState(
    Math.round(product.lowest_price * 0.9).toString()
  );
  const [contact, setContact] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(targetPrice, 10);
    if (target && target > 0) {
      savePriceDropAlert({
        canonical_product_id: product.id,
        product_title: product.model,
        target_price: target,
        current_price: product.lowest_price,
        contact_info: contact.trim() || "Local Notification"
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-amber-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
              <BellRing className="size-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                ధర తగ్గితే చెప్పండి
              </h3>
              <p className="text-[10px] font-bold text-slate-500">
                నిజమైన ధర తగ్గినప్పుడు మాత్రమే అలర్ట్ పంపుతాము
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition text-slate-500"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        {isSaved ? (
          <div className="p-8 text-center animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              ధర అలర్ట్ సెట్ చేయబడింది!
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              ధర ₹{parseInt(targetPrice, 10).toLocaleString("en-IN")} కు తగ్గిన వెంటనే నోటిఫై చేయబడుతుంది.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            {/* Product info snippet */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80">
              <img
                src={product.image_url}
                alt={product.model}
                className="size-12 object-contain rounded-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                  {product.title_te}
                </h4>
                <p className="text-xs font-extrabold text-orange-600 mt-0.5">
                  ప్రస్తుత ధర: ₹{product.lowest_price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                మీరు కోరుకుంటున్న ధర (Target Price):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* Contact Optional */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                వాట్సాప్ లేదా మొబైల్ నంబర్ (ఐచ్ఛికం):
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="ఉదా: 9876543210"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-black shadow-md shadow-orange-600/20 active:scale-95 transition cursor-pointer"
            >
              ధర అలర్ట్ సెట్ చేయండి
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
