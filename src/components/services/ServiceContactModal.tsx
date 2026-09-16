import React, { useState } from "react";
import { 
  X, 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Send, 
  ShieldAlert,
  CheckCircle2
} from "lucide-react";
import type { ServiceProvider } from "@/types/services";

interface ServiceContactModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageSentSuccess: (provider: ServiceProvider) => void;
}

export function ServiceContactModal({
  provider,
  isOpen,
  onClose,
  onMessageSentSuccess
}: ServiceContactModalProps) {
  const [customMessage, setCustomMessage] = useState("");

  if (!isOpen || !provider) return null;

  const defaultMessage = customMessage || `హాయ్, నాకు ${provider.locality} లో ${provider.subcategory_name_te} సేవ కావాలి. మీరు రాగలరా?`;

  const handleMakeCall = () => {
    window.location.href = `tel:${provider.phone}`;
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(defaultMessage);
    const phone = provider.whatsapp || provider.phone;
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    // Open WhatsApp
    window.open(`https://wa.me/${formattedPhone}?text=${encodedText}`, "_blank");
    
    // Advance to Success screen (Screen 8)
    onMessageSentSuccess(provider);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>వెనుకకు</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body (Screen 7 in Reference Image) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100">
          
          {/* Provider Profile Summary */}
          <div className="text-center space-y-1.5">
            <div className="size-20 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-blue-600/40 p-0.5 shadow-md">
              <img
                src={provider.avatar_url}
                alt={provider.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {provider.name}
            </h2>

            <p className="text-xs font-black text-blue-600 dark:text-blue-400">
              +91 {provider.phone}
            </p>

            {provider.phone_verified && (
              <div className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <ShieldCheck className="size-3.5" />
                <span>Verified Phone</span>
              </div>
            )}
          </div>

          {/* Big Direct Call & WhatsApp Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleMakeCall}
              className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Phone className="size-4 fill-current" />
              <span>ఫోన్ చేయండి</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <MessageCircle className="size-4 fill-current" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Quick Pre-filled Message Generator */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
              వాట్సాప్ సందేశం (WhatsApp Message):
            </label>
            <textarea
              rows={3}
              value={customMessage || defaultMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner resize-none"
            />
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>మెసేజ్ పంపండి</span>
            </button>
          </div>

          {/* Safety Notice Box (Screen 7 in Reference Image) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-rose-600 dark:text-rose-400">
              <ShieldAlert className="size-4 shrink-0" />
              <span>గమనించండి (Notice):</span>
            </div>
            <ul className="space-y-1 font-bold text-[10.5px]">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span>ఇది ఒక సమాచార వేదిక మాత్రమే.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span>సేవల నాణ్యతకు మేము బాధ్యత వహించము.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span>చెల్లింపు నేరుగా సేవకులకు చేయండి.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">•</span>
                <span>మీ భద్రత కోసం ముందుగా వివరాలు చూడండి.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
