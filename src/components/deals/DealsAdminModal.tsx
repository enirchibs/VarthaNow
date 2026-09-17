import React, { useState, useEffect } from "react";
import { 
  X, 
  BarChart3, 
  MousePointerClick, 
  ShoppingBag, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { getDealsAdminStats } from "@/lib/deals/deals-api";
import type { DealsAdminStats } from "@/types/deals";

interface DealsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DealsAdminModal: React.FC<DealsAdminModalProps> = ({
  isOpen,
  onClose
}) => {
  const [stats, setStats] = useState<DealsAdminStats | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStats(getDealsAdminStats());
    }
  }, [isOpen]);

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                డీల్స్ అడ్మిన్ & అనలిటిక్స్ (Deals Dashboard)
              </h3>
              <p className="text-[11px] text-slate-500">
                అఫిలియేట్ క్లిక్స్, మర్చంట్ స్టేటస్ & డేటా ఫ్రెష్‌నెస్
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-100 flex items-center justify-center text-slate-500 shadow-2xs"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <span className="text-[10.5px] font-black text-orange-900 dark:text-orange-200 uppercase">మొత్తం క్లిక్స్</span>
              <div className="text-2xl font-black text-orange-700 dark:text-orange-400 mt-1">
                {stats.total_clicks}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <span className="text-[10.5px] font-black text-blue-900 dark:text-blue-200 uppercase">ఈరోజు క్లిక్స్</span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                {stats.clicks_today}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10.5px] font-black text-emerald-900 dark:text-emerald-200 uppercase">యాక్టివ్ ప్రొడక్ట్స్</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {stats.total_products}
              </div>
            </div>
          </div>

          {/* Active Merchants Status */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-black uppercase text-slate-500 mb-2.5">
              మర్చంట్ అడాప్టర్ స్టేటస్ (Merchant Adapters)
            </h4>
            <div className="space-y-2">
              {stats.active_merchants.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span className="text-slate-900 dark:text-white">{m.name}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500">
                    సింక్: {m.last_sync}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clicks Breakdown */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-black uppercase text-slate-500 mb-2.5">
              మర్చంట్ వారీగా క్లిక్స్ (Clicks by Merchant)
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {stats.top_merchants.map((tm) => (
                <div key={tm.merchant} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-between">
                  <span className="font-bold capitalize">{tm.merchant}</span>
                  <span className="font-black text-slate-900 dark:text-white">{tm.count} క్లిక్స్</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Health & Compliance */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>అనుబంధ లింక్ ధృవీకరణ (Affiliate Integrity Verified)</span>
            </div>
            <p>
              అన్ని అఫిలియేట్ లింక్‌లు మరియు అసోసియేట్ ట్యాగ్‌లు (Amazon Creators API & Flipkart affid) సర్వర్-సైడ్ అడాప్టర్ల ద్వారా సురక్షితంగా జతచేయబడుతున్నాయి. యూజర్ క్లిక్ చేసినప్పుడు మాత్రమే డైరెక్ట్ అవుతాయి.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
