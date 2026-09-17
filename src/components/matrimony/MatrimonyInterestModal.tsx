import React, { useState } from "react";
import { X, Heart, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import type { MatrimonyProfile } from "@/types/matrimony";

interface MatrimonyInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: MatrimonyProfile | null;
  onConfirmSend: (targetId: string, senderName: string, message: string) => void;
}

export const MatrimonyInterestModal: React.FC<MatrimonyInterestModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  onConfirmSend
}) => {
  const [senderName, setSenderName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("🌸 మీ ప్రొఫైల్ మా కుటుంబానికి నచ్చింది. మాట్లాడుకోవడానికి ఆసక్తిగా ఉన్నాము.");

  if (!isOpen || !targetProfile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSend(targetProfile.id, senderName.trim() || "కుటుంబ సభ్యులు", selectedTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
              <Heart className="size-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                సంబంధం ఆసక్తి పంపండి
              </h3>
              <p className="text-[11px] text-slate-500">
                {targetProfile.name} ({targetProfile.age} సం., {targetProfile.village_town})
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
          <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200">
            <p className="font-bold leading-relaxed">
              ఈ ప్రొఫైల్ మా కుటుంబానికి నచ్చిందని తెలియజేయడానికి ఆసక్తి పంపవచ్చు. అవతలి కుటుంబం కూడా ఆమోదించిన తర్వాత ఇరువైపులా వివరాలు పంచుకోవచ్చు.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              మీ పేరు లేదా కుటుంబం పేరు
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="ఉదా: రావుల కుటుంబం / శ్రీనివాస్"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-xs font-bold outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              గౌరవప్రదమైన సందేశం ఎంచుకోండి
            </label>
            <div className="space-y-1.5">
              {[
                "🌸 మీ ప్రొఫైల్ మా కుటుంబానికి నచ్చింది. మాట్లాడుకోవడానికి ఆసక్తిగా ఉన్నాము.",
                "🏡 మా అబ్బాయి/అమ్మాయి వివరాలు కూడా పరిశీలించగలరు.",
                "✨ మీ అనుకూల సమయంలో వివరాలు తెలియజేయండి."
              ].map((msg) => (
                <button
                  key={msg}
                  type="button"
                  onClick={() => setSelectedTemplate(msg)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition ${
                    selectedTemplate === msg
                      ? "bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-100"
                      : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Heart className="size-4 fill-white" />
              <span>❤️ సంబంధం ఆసక్తి పంపండి</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
