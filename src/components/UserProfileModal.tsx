import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  User, 
  Camera, 
  Phone, 
  ShieldCheck, 
  Check, 
  LogOut, 
  Briefcase, 
  FileText, 
  Sparkles, 
  Save, 
  AlertCircle,
  ExternalLink,
  Plus
} from "lucide-react";
import { 
  UserProfile, 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  clearStoredUserProfile, 
  SUGGESTED_HEADLINES,
  PROFILE_EVENT_NAME 
} from "@/lib/user-profile";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";
import { validateAndSanitizeFullName } from "@/lib/safety-compliance";
import { TeluguTypingBanner } from "@/components/TeluguTypingBanner";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "login";
  onLoginSuccess?: (profile: UserProfile) => void;
}

export function UserProfileModal({ isOpen, onClose, onLoginSuccess }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(getStoredUserProfile());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Logged-in editable fields
  const [name, setName] = useState<string>("");
  const [headline, setHeadline] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  // Login / OTP flow states (when unauthenticated)
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loginName, setLoginName] = useState<string>("");
  const [loginPhone, setLoginPhone] = useState<string>("");
  const [loginOtp, setLoginOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile when opened or when storage updates
  useEffect(() => {
    const current = getStoredUserProfile();
    setProfile(current);
    if (current) {
      setName(current.name || "");
      setHeadline(current.headline || "");
      setBio(current.bio || "");
      setAvatarUrl(current.avatar_url || "");
    }
  }, [isOpen]);

  // Listen for global profile events
  useEffect(() => {
    const handleProfileUpdate = (e: CustomEvent<UserProfile | null>) => {
      const updated = e.detail;
      setProfile(updated);
      if (updated) {
        setName(updated.name || "");
        setHeadline(updated.headline || "");
        setBio(updated.bio || "");
        setAvatarUrl(updated.avatar_url || "");
      }
    };

    window.addEventListener(PROFILE_EVENT_NAME as any, handleProfileUpdate);
    return () => window.removeEventListener(PROFILE_EVENT_NAME as any, handleProfileUpdate);
  }, []);

  if (!isOpen) return null;

  // Handle avatar upload via file / camera
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("దయచేసి 5MB కంటే తక్కువ సైజు ఉన్న ఫోటోను ఎంచుకోండి (Max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setErrorMsg("");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes (Logged in)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const nameCheck = validateAndSanitizeFullName(name);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || "దయచేసి చెల్లుబాటు అయ్యే పూర్తి పేరు ఇవ్వండి");
      return;
    }

    const updated: UserProfile = {
      ...profile,
      name: nameCheck.sanitized,
      headline: headline.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl || undefined,
      updated_at: new Date().toISOString()
    };

    saveStoredUserProfile(updated);
    setProfile(updated);
    setSuccessMsg("✨ ప్రొఫైల్ వివరాలు విజయవంతంగా సేవ్ చేయబడ్డాయి!");
    setErrorMsg("");
    setTimeout(() => {
      setSuccessMsg("");
    }, 2500);
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm("మీరు నిజంగా లాగౌట్ చేయాలనుకుంటున్నారా? లాగౌట్ చేస్తే తదుపరి ప్రకటనలకు OTP మళ్లీ అడగబడుతుంది.")) {
      clearStoredUserProfile();
      setProfile(null);
      setLoginStep(1);
      setLoginName("");
      setLoginPhone("");
      setLoginOtp("");
      setErrorMsg("");
      setSuccessMsg("");
      onClose();
    }
  };

  // Login: Step 1 Send OTP
  const handleSendLoginOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameCheck = validateAndSanitizeFullName(loginName);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || "దయచేసి మీ పూర్తి పేరు నమోదు చేయండి (Name is mandatory)");
      return;
    }

    const cleanPhone = loginPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setErrorMsg("దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ మొబైల్ నంబర్ ఇవ్వండి");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setLoginStep(2);
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  // Login: Step 2 Verify OTP and create profile
  const handleVerifyLoginOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtp.trim() || loginOtp.trim().length < 6) {
      setErrorMsg("దయచేసి 6-అంకెల OTP ని నమోదు చేయండి");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(loginPhone, loginOtp, loginName);
    setLoading(false);

    if (verifyRes.success) {
      const cleanPhone = loginPhone.replace(/\D/g, "").slice(-10);
      const newProfile: UserProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: loginName.trim(),
        phone: cleanPhone,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      saveStoredUserProfile(newProfile);
      setProfile(newProfile);
      setSuccessMsg("🎉 లాగిన్ విజయవంతమైంది! మీరు ఇప్పుడు ఎన్ని ప్రకటనలైనా OTP లేకుండా పోస్ట్ చేయవచ్చు.");
      
      if (onLoginSuccess) {
        onLoginSuccess(newProfile);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(verifyRes.error || "OTP తప్పుగా ఉంది. దయచేసి సరైన కోడ్‌ను నమోదు చేయండి.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
              <User className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {profile ? "నా ప్రొఫైల్ & సెట్టింగ్‌లు (My Profile)" : "యూజర్ లాగిన్ / ప్రొఫైల్ (User Login)"}
              </h3>
              <p className="text-[10.5px] font-bold text-blue-100">
                {profile ? "OLX & Upwork తరహా ప్రొఫెషనల్ ప్రొఫైల్" : "లాగిన్ అవ్వండి • బహుళ ప్రకటనలకు OTP అవసరం లేదు"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* ⌨️ Telugu Typing Helper Banner */}
          <TeluguTypingBanner compact={true} className="mb-2" />

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LOGGED IN VIEW: Full Upwork-style Profile Manager */}
          {/* ========================================================================= */}
          {profile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Profile Picture Upload & Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-[hsl(var(--border))]">
                <div className="relative group">
                  <div className="size-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile.name} className="size-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 size-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                    title="ఫోటో మార్చండి (Change Photo)"
                  >
                    <Camera className="size-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-black text-sm">
                    <span>{profile.name}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      <ShieldCheck className="size-3" />
                      ధృవీకరించబడింది
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    మొబైల్: +91 {profile.phone}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-[10px] hover:bg-blue-100 transition cursor-pointer"
                    >
                      📷 ఫోటో మార్చండి
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="px-2 py-1 rounded-lg text-slate-400 hover:text-red-500 font-bold text-[10px] transition cursor-pointer"
                      >
                        తొలగించు
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mandatory Full Name */}
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  పూర్తి పేరు (Full Legal / Display Name) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="మీ అసలు పేరు ఇవ్వండి (e.g., Sekhar V / రవి కుమార్)"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Upwork-style Professional Headline */}
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5 flex items-center justify-between">
                  <span>వృత్తి / హెడ్‌లైన్ (Professional Headline - Upwork Style)</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">సిఫార్సు చేయబడింది</span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., 10 సం. అనుభవం గల ఎలక్ట్రీషియన్ (Electrician with 10 years experience)"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                />

                {/* Suggested Headline Quick Pills */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">త్వరిత ఎంపిక (Quick Suggestions):</span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar pt-1">
                    {SUGGESTED_HEADLINES.map((sh, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHeadline(sh)}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 text-[10px] font-semibold transition cursor-pointer truncate max-w-full"
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio / About Me */}
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  మీ గురించి / సేవల వివరాలు (About Me & Experience)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="మీ అనుభవం, మీరు అందించే సేవలు, పని గంటలు లేదా వ్యాపార వివరాలను ఇక్కడ రాయండి..."
                  className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-semibold outline-none focus:border-blue-600 resize-none"
                />
              </div>

              {/* Multi-ad Posting Notice */}
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200">
                <div className="flex items-center gap-1.5 font-black text-xs mb-1">
                  <Sparkles className="size-4 text-blue-600" />
                  <span>OLX తరహా మల్టీ-యాడ్ పోస్టింగ్ యాక్టివ్‌గా ఉంది</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  మీరు లాగిన్ అయి ఉన్నంత వరకు సర్వీసెస్, ప్రాపర్టీస్, జాబ్స్ మరియు మహిళా మార్కెట్‌లో ఎన్ని ప్రకటనలైనా OTP లేకుండా నేరుగా పోస్ట్ చేయవచ్చు.
                </p>
              </div>

              {/* Actions: Save & Logout */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Save className="size-4" />
                  <span>ప్రొఫైల్ సేవ్ చేయండి (Save Profile)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-11 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="లాగౌట్ (Logout)"
                >
                  <LogOut className="size-4" />
                  <span>లాగౌట్</span>
                </button>
              </div>

            </form>
          ) : (
            /* ========================================================================= */
            /* LOGGED OUT VIEW: First-time Mobile + Mandatory Name Login */
            /* ========================================================================= */
            <div>
              {/* Explanatory Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 mb-4">
                <div className="flex items-center gap-1.5 font-black text-xs mb-1">
                  <Sparkles className="size-4 text-amber-600" />
                  <span>మొదటిసారి లాగిన్ • బహుళ ప్రకటనలకు OTP ఫ్రీ</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  మీ పేరు మరియు మొబైల్ నంబర్‌తో ఒక్కసారి లాగిన్ అవ్వండి. ఆ తర్వాత లాగౌట్ అయ్యేవరకు ప్రతి ప్రకటనకు OTP అవసరం లేకుండా నేరుగా పోస్ట్ చేసుకోవచ్చు.
                </p>
              </div>

              {loginStep === 1 ? (
                <form onSubmit={handleSendLoginOTP} className="space-y-3.5">
                  {/* Mandatory Full Name */}
                  <div>
                    <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                      మీ పూర్తి పేరు (Full Legal Name) *
                    </label>
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="e.g., Sekhar V / రాజేష్ కుమార్"
                      className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                      required
                    />
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      * మొదటిసారి లాగిన్ కోసం పేరు తప్పనిసరి (Mandatory).
                    </p>
                  </div>

                  {/* 10-digit Mobile Phone */}
                  <div>
                    <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5 flex items-center justify-between">
                      <span>మొబైల్ నంబర్ (10-Digit Mobile Phone) *</span>
                      <span className="text-[10px] text-slate-500 font-bold">భారతదేశం (+91)</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-black text-slate-500 select-none">+91</span>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full h-11 pl-12 pr-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-black outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "SMS OTP పంపుతోంది..." : "Live SMS OTP పొందండి ➔ (Send OTP)"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOTP} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      OTP పంపబడిన నంబర్: <span className="font-black text-blue-600">+91 {loginPhone}</span>
                    </p>
                    {demoOtpHint && (
                      <p className="text-[10px] font-bold text-amber-600 mt-1">
                        🔑 డెమో OTP కోడ్: <span className="font-black underline">{demoOtpHint}</span> (లేదా 123456)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                      6-అంకెల SMS OTP కోడ్ *
                    </label>
                    <input
                      type="text"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-center text-lg font-black tracking-widest outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep(1)}
                      className="h-11 px-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs font-bold transition cursor-pointer"
                    >
                      ← వెనుకకు
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "ధృవీకరిస్తోంది..." : "✅ OTP ధృవీకరించు & లాగిన్ అవ్వండి"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
