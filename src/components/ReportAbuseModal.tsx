import React, { useState } from "react";
import { AlertOctagon, ShieldAlert, CheckCircle2, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { recordAuditEvent } from "@/lib/safety-compliance";
import { Link } from "react-router-dom";
import { TeluguTypingBanner } from "@/components/TeluguTypingBanner";

interface ReportAbuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProviderName?: string;
  targetMobile?: string;
  targetListingId?: string;
}

const REPORT_CATEGORIES = [
  { id: "suspected_theft", label: "దొంగతనం అనుమానం (Suspected Theft)" },
  { id: "fraud_scam", label: "మోసం లేదా దగా (Fraud / Scam)" },
  { id: "property_damage", label: "ఆస్తి నష్టం (Property Damage)" },
  { id: "threat_violence", label: "బెదిరింపు లేదా హింస (Threat / Violence)" },
  { id: "harassment", label: "వేధింపులు (Harassment)" },
  { id: "fake_identity", label: "నకిలీ గుర్తింపు (Fake Identity)" },
  { id: "misrepresentation", label: "తప్పుడు సమాచారం (Misrepresentation)" },
  { id: "unauthorized_access", label: "అనధికారిక ప్రవేశం (Unauthorized Access)" },
  { id: "unsafe_behaviour", label: "అసురక్షిత ప్రవర్తన (Unsafe Behaviour)" },
  { id: "prohibited_goods_services", label: "నిషిద్ధ వస్తువులు లేదా సేవలు (Prohibited Items)" },
  { id: "spam", label: "స్పామ్ లేదా నకిలీ పోస్ట్ (Spam / Fake Post)" },
  { id: "other", label: "ఇతర సమస్య (Other)" }
];

export function ReportAbuseModal({
  isOpen,
  onClose,
  targetProviderName = "",
  targetMobile = "",
  targetListingId = ""
}: ReportAbuseModalProps) {
  const [category, setCategory] = useState<string>("fraud_scam");
  const [description, setDescription] = useState<string>("");
  const [reporterName, setReporterName] = useState<string>("");
  const [reporterPhone, setReporterPhone] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    const complaintRecord = {
      id: `rep_${Date.now()}`,
      listing_id: targetListingId || undefined,
      reported_provider_name: targetProviderName,
      reported_mobile: targetMobile,
      reporter_name: reporterName.trim() || "Anonymous Seeker",
      reporter_mobile: reporterPhone.trim(),
      complaint_category: category,
      description: description.trim(),
      status: "pending",
      created_at: new Date().toISOString()
    };

    // Save locally
    try {
      const existing = JSON.parse(localStorage.getItem("vaartanow_safety_complaints") || "[]");
      existing.unshift(complaintRecord);
      localStorage.setItem("vaartanow_safety_complaints", JSON.stringify(existing));
    } catch {}

    // Save to Supabase
    if (supabase) {
      try {
        await supabase.from("safety_complaints").insert(complaintRecord);
      } catch (e) {
        console.warn("Supabase complaint save notice:", e);
      }
    }

    recordAuditEvent({
      event_type: "complaint_created",
      entity_id: complaintRecord.id,
      entity_type: "safety_complaint",
      metadata: { category, reported_provider_name: targetProviderName }
    });

    setSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-[#0f172a] text-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertOctagon className="size-6" />
            <h3 className="font-black text-lg text-white">ఫిర్యాదు / రిపోర్ట్ (Report Concern)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
          >
            ✕ మూసివేయి
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-black text-white">మీ ఫిర్యాదు నమోదు చేయబడింది</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ధన్యవాదాలు. మా ట్రస్ట్ & సేఫ్టీ టీమ్ ఈ రిపోర్ట్‌ను పరిశీలిస్తుంది. అత్యవసర భద్రతా సమస్య అయితే దయచేసి స్థానిక పోలీసులను (డయల్ 112 / 100) సంప్రదించండి.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-xs font-bold"
            >
              సరే (Close)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* ⌨️ Telugu Typing Helper Banner */}
            <TeluguTypingBanner compact={true} className="mb-2 text-slate-900" />

            {targetProviderName && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                రిపోర్ట్ చేయబడుతున్న ప్రొవైడర్: <strong className="text-white">{targetProviderName}</strong>
                {targetMobile && ` (${targetMobile})`}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-300">సమస్య రకం (Category) *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {REPORT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">పూర్తి వివరాలు (Description) *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                placeholder="ఏం జరిగిందో స్పష్టంగా వివరించండి..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">మీ పేరు (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="మీ పేరు"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">మీ మొబైల్ నంబర్ (Optional)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="సంప్రదించడానికి మొబైల్"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
              ⚠️ అత్యవసర భౌతిక భద్రతా లేదా క్రిమినల్ ముప్పు ఉంటే, వెంటనే స్థానిక అత్యవసర సేవల నంబర్ <strong>112</strong> కు కాల్ చేయండి.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <Send className="size-4" />
              <span>{submitting ? "పంపుతున్నాము..." : "రిపోర్ట్ పంపండి (Submit Report)"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

// Standalone Report Abuse Page
export function ReportAbusePage() {
  return (
    <main className="container-shell py-8 max-w-2xl space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 text-white space-y-4 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-red-400 flex items-center gap-2">
          <AlertOctagon className="size-8" />
          <span>భద్రతా ఫిర్యాదు & రిపోర్ట్ (Trust & Safety Report)</span>
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          VaartaNow ప్లాట్‌ఫారమ్‌లో ఏదైనా అనుమానాస్పద, మోసపూరిత లేదా అసురక్షిత ప్రవర్తనను ఎదుర్కొంటే ఇక్కడ తెలియజేయండి. మీ వివరాలు గోప్యంగా ఉంచబడతాయి.
        </p>

        <ReportAbuseModal isOpen={true} onClose={() => {}} />
      </div>
    </main>
  );
}
