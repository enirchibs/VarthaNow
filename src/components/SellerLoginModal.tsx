import React, { useState } from "react";
import { X, Phone, ShieldCheck, User } from "lucide-react";
import { sendSMSOTP, verifySellerOTP, SellerProfile } from "@/lib/classifieds-api";

interface SellerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: SellerProfile) => void;
}

export function SellerLoginModal({ isOpen, onClose, onLoginSuccess }: SellerLoginModalProps) {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("దయచేసి మీ పేరు నమోదు చేయండి (Please enter your name)");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి (10-digit Phone)");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setStep("verify");
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6 అంకెల OTP ని నమోదు చేయండి.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await verifySellerOTP(phone, otp, name);
    setLoading(false);

    if (res.success && res.profile) {
      onLoginSuccess(res.profile);
      onClose();
    } else {
      setErrorMsg(res.error || "OTP తప్పుగా ఉంది.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-slate-900 shadow-2xl space-y-4 p-6 sm:p-7">

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
              <User className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                అమ్మకందారు లాగిన్ (Seller Login)
              </h3>
              <p className="text-[10px] font-semibold text-slate-500">
                Login to View Your Ads 📱
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {step === "send" ? (
          <form onSubmit={handleSendOTP} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800">
                మీ పేరు (Full Name) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ఉదా: Prasad Kumar"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800">
                మొబైల్ నంబర్ (10-Digit Mobile Phone) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 size-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[46px] active:scale-98"
            >
              {loading ? "పంపుతున్నాము..." : "📩 Send SMS OTP (OTP పొందండి)"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 text-center">
              <div className="flex items-center justify-center gap-1 font-black text-emerald-700">
                <ShieldCheck className="size-4" />
                <span>SMS OTP Sent!</span>
              </div>
              <p className="mt-0.5 text-[11px]">📩 <strong>+91 {phone}</strong> కు OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-emerald-600 font-extrabold mt-1">
                  (డెమో OTP: <span className="font-black text-xs">{demoOtpHint}</span>)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800 text-center block">
                6-అంకెల OTP కోడ్ (Enter 6-Digit OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full text-center tracking-widest text-lg font-black rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[46px] active:scale-98"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ Verify OTP & Login"}
            </button>

            <button
              type="button"
              onClick={() => setStep("send")}
              className="w-full text-center text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              ← ఫోన్ నంబర్ మార్చండి (Change Number)
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
