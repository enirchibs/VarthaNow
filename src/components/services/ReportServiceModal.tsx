import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import type { ServiceProvider } from "@/types/services";
import { submitServiceReport } from "@/lib/services-api";

interface ReportServiceModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: "wrong_phone", label: "తప్పు ఫోన్ నంబర్ (Wrong Phone Number)" },
  { id: "fake_info", label: "తప్పుడు సమాచారం (Fake Information)" },
  { id: "misleading_price", label: "మోసపూరిత ధర (Misleading Price)" },
  { id: "fraud_concern", label: "మోసం / దగా అనుమానం (Fraud Concern)" },
  { id: "spam", label: "స్పామ్ ప్రకటన (Spam)" },
  { id: "inappropriate", label: "అనుచిత కంటెంట్ (Inappropriate Content)" }
];

export function ReportServiceModal({
  provider,
  isOpen,
  onClose
}: ReportServiceModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert("దయచేసి ఫిర్యాదు కారణాన్ని ఎంచుకోండి.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitServiceReport({
        provider_id: provider.id,
        reason,
        description,
        reporter_phone: phone,
        created_at: new Date().toISOString()
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch {
      alert("ఫిర్యాదు సమర్పించడంలో సమస్య ఎదురైంది.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="size-5" />
            <h2 className="text-sm sm:text-base font-black">
              ప్రొఫైల్ పై ఫిర్యాదు చేయండి
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="size-14 text-emerald-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              మీ ఫిర్యాదు నమోదు చేయబడింది
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              మా బృందం ఈ ప్రొఫైల్ ను సమీక్షించి తగిన చర్యలు తీసుకుంటుంది. సమాజ భద్రతకు సహకరించినందుకు ధన్యవాదాలు.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-bold text-slate-800 dark:text-slate-100">
            
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ప్రొఫైల్: <span className="font-black text-slate-900 dark:text-white">{provider.name}</span>
              </p>
            </div>

            {/* Reasons */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-black block">
                ఫిర్యాదు కారణం (Reason) *
              </label>
              <div className="space-y-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      reason === r.label
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={r.label}
                      checked={reason === r.label}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-black block">
                మరిన్ని వివరాలు (Details)
              </label>
              <textarea
                rows={3}
                placeholder="ఏం జరిగింది? మరిన్ని వివరాలు ఇక్కడ రాయండి..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Reporter Contact */}
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-black block">
                మీ మొబైల్ నంబర్ (ఐచ్ఛికం - Optional)
              </label>
              <input
                type="tel"
                placeholder="మీ ఫోన్ నంబర్..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="w-full h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>ఫిర్యాదు సమర్పించండి (Submit Report)</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
