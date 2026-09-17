import React from "react";
import { Flame, Sparkles } from "lucide-react";

interface DealsBudgetCollectionsProps {
  onSelectCollection: (category?: string, maxPrice?: number) => void;
}

const COLLECTIONS = [
  { label: "🔥 ₹199 లోపు వస్తువులు", maxPrice: 199, desc: "చిన్న హోమ్ & కిచెన్ అవసరాలు" },
  { label: "🔥 ₹499 లోపు బడ్జెట్ డీల్స్", maxPrice: 499, desc: "ఇయర్ ఫోన్లు, గాడ్జెట్లు, టార్చ్‌లు" },
  { label: "🔥 ₹999 లోపు ఎలక్ట్రానిక్స్", maxPrice: 999, category: "electronics", desc: "పవర్ బ్యాంక్స్, బ్లూటూత్ స్పీకర్లు" },
  { label: "📱 ₹10,000 లోపు మొబైల్స్", maxPrice: 10000, category: "mobiles", desc: "Samsung, Redmi, Realme స్మార్ట్‌ఫోన్లు" },
  { label: "🎧 ₹500 లోపు హెడ్‌ఫోన్లు", maxPrice: 500, category: "audio", desc: "boAt, Boult బాస్ హెడ్‌సెట్లు" },
  { label: "🎒 ₹1,000 లోపు స్టూడెంట్ బ్యాగ్‌లు", maxPrice: 1000, category: "student", desc: "కాలేజ్ & స్కూల్ బ్యాగ్‌ప్యాక్స్" },
  { label: "👨‍🌾 రైతులకు పనికొచ్చే పనిముట్లు", category: "farmer", desc: "స్ప్రేయర్స్, వ్యవసాయ టూల్స్" },
  { label: "🏠 ఇంటికి నిత్య జీవిత వస్తువులు", category: "home", maxPrice: 1000, desc: "చాపర్స్, ఎమర్జెన్సీ లైట్లు" }
];

export const DealsBudgetCollections: React.FC<DealsBudgetCollectionsProps> = ({
  onSelectCollection
}) => {
  return (
    <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="size-4 text-orange-500 fill-orange-500" />
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
          ప్రత్యేక బడ్జెట్ కలెక్షన్లు (Special Budget Collections)
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {COLLECTIONS.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectCollection(c.category, c.maxPrice)}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-orange-500 text-left transition shadow-2xs hover:shadow-xs group cursor-pointer"
          >
            <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-orange-600 transition truncate">
              {c.label}
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {c.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
