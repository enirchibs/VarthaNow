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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl space-y-4 p-6 sm:p-7">

        <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <User className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[hsl(var(--foreground))]">
                అమ్మకందారు లాగిన్ (Seller Login)
              </h3>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                Login to View Your Ads 📱
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {step === "send" ? (
          <form onSubmit={handleSendOTP} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                మీ పేరు (Full Name) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ఉదా: Prasad Kumar"
                required
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                మొబైల్ నంబర్ (10-Digit Mobile Phone) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 size-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 pl-10 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "పంపుతున్నాము..." : "📩 Send SMS OTP (OTP పొందండి)"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center space-y-0.5">
              <p>📩 <strong>+91 {phone}</strong> కి OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  (డెమో OTP: <span className="font-black text-sm">{demoOtpHint}</span> లేదా 123456)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))] text-center block">
                6 అంకెల OTP నమోదు చేయండి
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ Verify & Login (లాగిన్ అవ్వండి)"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
