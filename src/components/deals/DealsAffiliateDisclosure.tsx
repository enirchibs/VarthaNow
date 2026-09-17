import React from "react";
import { ShieldCheck, Info } from "lucide-react";

export const DealsAffiliateDisclosure: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-2">
        <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 text-xs">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>అనుబంధ ప్రకటన & గోప్యతా విధానం (Affiliate & Merchant Disclosure)</span>
        </div>

        <p className="text-[11px]">
          <strong>అమెజాన్ & ఫ్లిప్‌కార్ట్ అనుబంధ భాగస్వామ్యం:</strong> మన అడ్డా (Mana Adda) ఒక ఉచిత ప్రాడక్ట్ డిస్కవరీ మరియు కంపేరిజన్ ప్లాట్‌ఫారమ్ మాత్రమే. మీరు మా వెబ్‌సైట్‌లోని లింక్‌ల ద్వారా Amazon India లేదా Flipkartలో వస్తువులు కొనుగోలు చేసినప్పుడు, మన అడ్డాకు స్వల్ప అఫిలియేట్ కమిషన్ లభించవచ్చు. దీని వలన మీరు చెల్లించే వస్తువుల ధరలో ఎటువంటి మార్పు ఉండదు.
        </p>

        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          * Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. Mana Adda is a participant in the Amazon Associates Program. All prices, discounts, and product availability are subject to change on the merchant's platform. Returns, cancellations, and customer support are handled solely by the respective merchant.
        </p>
      </div>
    </footer>
  );
};
