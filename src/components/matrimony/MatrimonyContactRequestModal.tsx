import React, { useState } from "react";
import { X, Phone, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import type { MatrimonyProfile } from "@/types/matrimony";

interface MatrimonyContactRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: MatrimonyProfile | null;
  onConfirmRequest: (targetId: string, name: string, phone: string) => void;
}

export const MatrimonyContactRequestModal: React.FC<MatrimonyContactRequestModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  onConfirmRequest
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("తల్లిదండ్రులు");

  if (!isOpen || !targetProfile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.");
      return;
    }
    onConfirmRequest(targetProfile.id, `${name.trim() || "కుటుంబ సభ్యులు"} (${relation})`, phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
              <Phone className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                ఫోన్ & సంప్రదింపు వివరాల కోసం రిక్వెస్ట్
              </h3>
              <p className="text-[11px] text-slate-500">
                {targetProfile.name} • {targetProfile.village_town}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <Lock className="size-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              <strong>గోప్యతా హామీ:</strong> అవతలి కుటుంబం మీ రిక్వెస్ట్‌ను ఆమోదించిన తర్వాతే ఇరు కుటుంబాల ఫోన్ నంబర్లు పరస్పరం భాగస్వామ్యం చేయబడతాయి.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              మీ పేరు (Your Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ఉదా: వెంకటేశ్వరరావు"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-xs font-bold outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              సంబంధం / బంధుత్వం (Relation)
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-xs font-bold outline-none focus:border-indigo-500"
            >
              <option value="తల్లిదండ్రులు">తల్లిదండ్రులు (Parents)</option>
              <option value="స్వయంగా">స్వయంగా (Self)</option>
              <option value="సోదరుడు/సోదరి">సోదరుడు / సోదరి (Sibling)</option>
              <option value="బంధువు">బంధువు (Relative)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              మీ మొబైల్ నంబర్ (Your Mobile Number)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-slate-400">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="9848012345"
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-mono text-xs font-bold outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Phone className="size-4" />
              <span>📞 రిక్వెస్ట్ పంపండి</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
