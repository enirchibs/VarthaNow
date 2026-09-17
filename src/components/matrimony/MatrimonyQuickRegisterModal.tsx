import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Camera, 
  Lock, 
  ArrowRight, 
  ArrowLeft 
} from "lucide-react";
import type { 
  MatrimonyProfile, 
  MatrimonyGender, 
  ProfileFor, 
  MaritalStatus, 
  PhotoPrivacy 
} from "@/types/matrimony";
import { saveUserMatrimonyProfile } from "@/lib/matrimony-api";

interface MatrimonyQuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (profile: MatrimonyProfile) => void;
  existingProfile: MatrimonyProfile | null;
}

export const MatrimonyQuickRegisterModal: React.FC<MatrimonyQuickRegisterModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
  existingProfile
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState(existingProfile?.phone || "");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!existingProfile);

  // Step 2 Fields
  const [profileFor, setProfileFor] = useState<ProfileFor>(existingProfile?.profile_for || "self");
  const [name, setName] = useState(existingProfile?.name || "");
  const [gender, setGender] = useState<MatrimonyGender>(existingProfile?.gender || "bride");
  const [age, setAge] = useState<number>(existingProfile?.age || 25);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(existingProfile?.marital_status || "never_married");
  const [community, setCommunity] = useState(existingProfile?.community || "");

  // Step 3 Fields
  const [villageTown, setVillageTown] = useState(existingProfile?.village_town || "అనకాపల్లి");
  const [district, setDistrict] = useState(existingProfile?.district || "Visakhapatnam");
  const [education, setEducation] = useState(existingProfile?.education || "B.Tech / Degree");
  const [occupation, setOccupation] = useState(existingProfile?.occupation || "Software / Private Job");
  const [incomeRange, setIncomeRange] = useState(existingProfile?.income_range || "₹6 - 10 లక్షలు/సం.");
  const [photoUrl, setPhotoUrl] = useState(existingProfile?.photos?.[0] || "");
  const [photoPrivacy, setPhotoPrivacy] = useState<PhotoPrivacy>(existingProfile?.photo_privacy || "public");
  const [aboutTe, setAboutTe] = useState(existingProfile?.about_te || "");

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.");
      return;
    }
    setIsOtpSent(true);
    setOtp("1234"); // Auto-fill demo OTP for convenience
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setIsPhoneVerified(true);
      setStep(2);
    } else {
      alert("దయచేసి 4 అంకెల ఓటీపీ నమోదు చేయండి.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("దయచేసి పేరు నమోదు చేయండి.");
      return;
    }

    const managedByLabel = 
      profileFor === "self" ? "స్వయంగా" : 
      profileFor === "son" || profileFor === "daughter" ? "తల్లిదండ్రులు నిర్వహిస్తున్నారు" : 
      "కుటుంబ సభ్యులు నిర్వహిస్తున్నారు";

    const maritalStatusLabel = 
      maritalStatus === "never_married" ? "అవివాహితుడు/అవివాహిత" : 
      maritalStatus === "divorced" ? "విడాకులు తీసుకున్నవారు" : 
      "వితంతువు/విపత్నీకుడు";

    const maskedPhone = phone.length >= 10 ? `+91 ${phone.slice(0, 5)} *****` : "+91 98480 *****";

    const newProfile: MatrimonyProfile = {
      id: existingProfile?.id || `mp_user_${Date.now()}`,
      user_id: "usr_current",
      profile_for: profileFor,
      profile_managed_by_label_te: managedByLabel,
      name,
      gender,
      date_of_birth: "1998-01-01",
      age: Number(age) || 25,
      height: "5'4\"",
      marital_status: maritalStatus,
      marital_status_label_te: maritalStatusLabel,
      mother_tongue: "తెలుగు",
      religion: "హిందూ",
      community: community || "ఏదైనా (Caste No Bar)",
      caste_no_bar: !community,
      education,
      occupation,
      income_range: incomeRange,
      village_town: villageTown,
      district,
      state: "Andhra Pradesh",
      lat_approx: 17.6913,
      lon_approx: 83.0039,
      about_te: aboutTe || "మంచి కుటుంబం నుండి సరిపోయే సంబంధం కోసం చూస్తున్నాము.",
      photos: photoUrl ? [photoUrl] : [],
      photo_privacy: photoPrivacy,
      contact_privacy: "request_only",
      verification_level: 2,
      verification_badge_label_te: "📱 మొబైల్ వెరిఫైడ్",
      phone_masked: maskedPhone,
      phone,
      profile_completeness: 80,
      is_active: true,
      created_at: new Date().toISOString()
    };

    saveUserMatrimonyProfile(newProfile);
    onProfileCreated(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {existingProfile ? "ప్రొఫైల్ సవరించండి" : "✨ 1 నిమిషంలో ప్రొఫైల్ నమోదు"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                దశ {step} / 3: {step === 1 ? "మొబైల్ నంబర్" : step === 2 ? "ప్రాథమిక వివరాలు" : "ప్రాంతం & వృత్తి"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition shadow-2xs"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto">
          {/* STEP 1: MOBILE & OTP */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                <ShieldCheck className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  మీ ఫోన్ నంబర్ పూర్తిగా గోప్యంగా ఉంటుంది. మీ అనుమతి లేకుండా ఎవరికీ కనిపించదు.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  మొబైల్ నంబర్ (Mobile Number)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9848012345"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-mono text-sm font-bold focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              {!isOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Phone className="size-4" />
                  <span>ఓటీపీ పంపండి (Get OTP)</span>
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                      ఓటీపీ నమోదు చేయండి (Enter OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="1234"
                      className="w-full py-3 text-center tracking-widest font-mono text-xl font-black rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-rose-300 dark:border-rose-800 outline-none"
                    />
                    <span className="block text-[11px] text-emerald-600 font-bold text-center mt-1">
                      ✓ డెమో ఓటీపీ: 1234 ఆటో-ఫిల్ చేయబడింది
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>వెరిఫై చేసి ముందుకు సాగండి</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROFILE FOR, NAME, GENDER, AGE */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Profile For */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  ఎవరి కోసం సంబంధం చూస్తున్నారు? (Profile For)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "self", label: "నా కోసం" },
                    { id: "son", label: "అబ్బాయి" },
                    { id: "daughter", label: "అమ్మాయి" },
                    { id: "brother", label: "సోదరుడు" },
                    { id: "sister", label: "సోదరి" },
                    { id: "relative", label: "బంధువు" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfileFor(item.id as ProfileFor)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        profileFor === item.id
                          ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  పూర్తి పేరు (Full Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ఉదా: సురేష్ లేదా ప్రియాంక"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-sm outline-none focus:border-rose-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  లింగం (Gender)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("bride")}
                    className={`py-3 px-3 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition ${
                      gender === "bride"
                        ? "bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-200 shadow-xs"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>👩 వధువు (Bride)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("groom")}
                    className={`py-3 px-3 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition ${
                      gender === "groom"
                        ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-200 shadow-xs"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>👨 వరుడు (Groom)</span>
                  </button>
                </div>
              </div>

              {/* Age & Marital Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    వయస్సు (Age)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={60}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-sm outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    వైవాహిక స్థితి
                  </label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
                  >
                    <option value="never_married">అవివాహితుడు/అవివాహిత</option>
                    <option value="divorced">విడాకులు తీసుకున్నవారు</option>
                    <option value="widowed">వితంతువు / విపత్నీకుడు</option>
                  </select>
                </div>
              </div>

              {/* Caste / Community (Optional) */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  కులము / వర్గం (ఐచ్ఛికం - Caste No Bar అయితే ఖాళీగా వదిలేయండి)
                </label>
                <input
                  type="text"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  placeholder="ఏదైనా / కాపు / కమ్మ / రెడ్డి / యాదవ / SC / ST మొదలైనవి"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
                />
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 font-bold text-xs"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>తదుపరి (Location & Career)</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION, CAREER, PHOTO */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    గ్రామం / పట్టణం (Town/Village)
                  </label>
                  <input
                    type="text"
                    value={villageTown}
                    onChange={(e) => setVillageTown(e.target.value)}
                    placeholder="ఉదా: అనకాపల్లి"
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    జిల్లా (District)
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="ఉదా: విశాఖపట్నం"
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Education & Occupation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    చదువు (Education)
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="ఉదా: B.Tech / Degree / PG"
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    ఉద్యోగం / వృత్తి (Job)
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="ఉదా: సాఫ్ట్‌వేర్ / గవర్నమెంట్ / వ్యాపారం"
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Photo URL / Upload option */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  ఫోటో లింక్ (Photo URL - ఐచ్ఛికం)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-mono text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Photo Privacy */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  ఫోటో గోప్యత (Photo Privacy)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoPrivacy("public")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      photoPrivacy === "public"
                        ? "bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-100"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    👁️ అందరికీ కనిపించాలి (Public)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoPrivacy("request_only")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      photoPrivacy === "request_only"
                        ? "bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-100"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🔒 అనుమతి కోరితేనే (Request Only)
                  </button>
                </div>
              </div>

              {/* Short Note */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  రెండు మాటల్లో పరిచయం (Short About)
                </label>
                <textarea
                  rows={2}
                  value={aboutTe}
                  onChange={(e) => setAboutTe(e.target.value)}
                  placeholder="కుటుంబ విలువలు, అలవాట్లు లేదా మీకు ఎలాంటి సంబంధం కావాలనుకుంటున్నారో రాయండి..."
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-xs outline-none focus:border-rose-500"
                />
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 font-bold text-xs"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="size-4" />
                  <span>ప్రొఫైల్ నమోదు పూర్తి చేయండి</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
