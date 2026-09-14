import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  X, 
  User, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Phone, 
  ArrowLeft,
  Sparkles,
  FileText,
  FileCheck
} from "lucide-react";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";
import { addLocalJob } from "@/lib/jobs-api";
import { LocationAreaSelector } from "@/components/LocationAreaSelector";
import type { WorkMode, ContractType, ExperienceLevel } from "@/types/jobs";
import { 
  UserProfile, 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  PROFILE_EVENT_NAME 
} from "@/lib/user-profile";

interface JobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted: () => void;
}

export function JobPostModal({ isOpen, onClose, onJobPosted }: JobPostModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Employer & Job Form State (Telugu First format)
  const [employerName, setEmployerName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("IT & Software");
  const [locality, setLocality] = useState<string>("");
  const [workMode, setWorkMode] = useState<WorkMode>("On-site");
  const [contractType, setContractType] = useState<ContractType>("Full-time");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Fresher");
  const [salaryRange, setSalaryRange] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Mandatory Compliance & Terms Acceptance (Default checked = true)
  const [declarationIndependent, setDeclarationIndependent] = useState<boolean>(true);
  const [declarationTerms, setDeclarationTerms] = useState<boolean>(true);

  // OTP State (Step 2)
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Persistent User Profile Session (OLX / Upwork Style)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getStoredUserProfile());

  useEffect(() => {
    // Load pre-filled profile if available
    const syncProfile = () => {
      const active = getStoredUserProfile();
      setUserProfile(active);
      if (active && active.is_verified) {
        if (active.name && !employerName) setEmployerName(active.name);
        if (active.phone && !phone) setPhone(active.phone);
      } else {
        try {
          const savedProf = localStorage.getItem("vaartanow_employer_profile") || localStorage.getItem("vizag_employer_profile");
          if (savedProf) {
            const parsed = JSON.parse(savedProf);
            if (parsed.name && !employerName) setEmployerName(parsed.name);
            if (parsed.company && !companyName) setCompanyName(parsed.company);
            if (parsed.phone && !phone) setPhone(parsed.phone);
          }
        } catch {}
      }
    };
    if (isOpen) {
      syncProfile();
    }
    window.addEventListener(PROFILE_EVENT_NAME as any, syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME as any, syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct Job Publishing Logic
  const executePostJob = (cleanPhone: string, validName: string) => {
    // Save Persistent Profile & Employer Profile
    const profileToSave: UserProfile = {
      id: userProfile?.id || `usr_${cleanPhone}`,
      name: validName.trim(),
      phone: cleanPhone,
      is_verified: true,
      avatar_url: userProfile?.avatar_url,
      headline: userProfile?.headline || `${companyName.trim() || "ఉద్యోగ ప్రదాత"} (Employer)`,
      bio: userProfile?.bio,
      created_at: userProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveStoredUserProfile(profileToSave);
    setUserProfile(profileToSave);

    const employerProfile = {
      name: validName.trim(),
      company: companyName.trim(),
      phone: cleanPhone,
      is_verified: true
    };
    localStorage.setItem("vaartanow_employer_profile", JSON.stringify(employerProfile));
    localStorage.setItem("vizag_employer_profile", JSON.stringify(employerProfile));

    // Formatted salary string
    const formattedSalary = salaryRange.toLowerCase().includes("month") || salaryRange.toLowerCase().includes("year") || salaryRange.includes("₹")
      ? salaryRange.trim()
      : `₹${salaryRange.trim()} / month`;

    // Save Job Listing
    addLocalJob({
      title: jobTitle.trim(),
      company_name: companyName.trim(),
      location: `${locality.trim()}, AP & TS`,
      district: locality.trim(),
      state: "Andhra Pradesh",
      description_snippet: description.trim().slice(0, 140) || "ఉద్యోగానికి సంబంధించిన పూర్తి వివరాల కోసం సంప్రదించండి.",
      full_description: description.trim() || `## ఉద్యోగ వివరాలు (Job Details):\n- హోదా: ${jobTitle}\n- కంపెనీ: ${companyName}\n- ప్రాంతం: ${locality}\n- జీతం: ${formattedSalary}\n- సంప్రదించే సంఖ్య: ${cleanPhone}`,
      apply_link: `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`నమస్తే ${validName} గారు, VaartaNow లో మీరు పోస్ట్ చేసిన '${jobTitle}' ఉద్యోగానికి (${companyName}) నేను దరఖాస్తు చేసుకోవాలనుకుంటున్నాను.`)}`,
      source_platform: "VaartaNow Jobs Board",
      salary_range: formattedSalary,
      skills: [category, workMode, experienceLevel],
      tags: [category, workMode, experienceLevel, locality],
      experience_level: experienceLevel,
      work_mode: workMode,
      contract_type: contractType,
      is_featured: true,
      is_approved: true,
      is_active: true,
      employer_name: validName.trim(),
      contact_phone: cleanPhone
    });

    setLoading(false);
    onJobPosted();
    onClose();
  };

  // Step 1 Submission ➔ Trigger Twilio SMS OTP or direct publish if logged in
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerName.trim()) {
      setErrorMsg("దయచేసి మీ పేరు నమోదు చేయండి (* Name is mandatory)");
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg("దయచేసి కంపెనీ పేరు నమోదు చేయండి (Please enter company name)");
      return;
    }
    if (!jobTitle.trim()) {
      setErrorMsg("దయచేసి ఉద్యోగ శీర్షిక రాయండి (Please enter job title)");
      return;
    }
    if (!salaryRange.trim()) {
      setErrorMsg("దయచేసి జీతం వివరాలు నమోదు చేయండి (Please enter salary details)");
      return;
    }
    if (!locality.trim()) {
      setErrorMsg("దయచేసి ఉద్యోగ ప్రాంతం/లొకేషన్ నమోదు చేయండి (Please select job location)");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("దయచేసి 10-అంకెల మొబైల్ నంబర్ ఇవ్వండి (Please enter 10-digit mobile number)");
      return;
    }

    if (!declarationIndependent || !declarationTerms) {
      setErrorMsg("దయచేసి ఫారమ్ చివర ఉన్న నియమ నిబంధనలను అంగీకరించండి (Please check declaration boxes to proceed)");
      return;
    }

    // ⚡ OLX-STYLE MULTI-AD SUBMISSION:
    // If logged in, skip OTP and publish immediately!
    if (userProfile && userProfile.is_verified && userProfile.phone) {
      setLoading(true);
      setErrorMsg("");
      executePostJob(cleanPhone, employerName);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setStep(2);
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  // Step 2 Submission ➔ Verify OTP, Create Employer Profile & Add Job
  const handleVerifyOTPAndPostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6-అంకెల OTP కోడ్‌ను నమోదు చేయండి (Enter 6-digit OTP)");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(phone, otp, employerName);

    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.error || "OTP తప్పుగా ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    executePostJob(cleanPhone, employerName);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
              <span>+ ఉద్యోగ ప్రకటన పోస్ట్ చేయండి</span>
              <span className="text-xs text-slate-500 font-normal hidden sm:inline">(Post a Job)</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
              దశ {step}/2 (Step {step} of 2)
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ---------------- STEP 1: JOB DETAILS FORM (TELUGU FIRST) ---------------- */}
        {step === 1 && (
          <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
            
            {/* 🌟 Logged-in Profile Badge (OLX Multi-Ad Posting Active) */}
            {userProfile && userProfile.is_verified && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-8 rounded-full overflow-hidden border border-indigo-400 bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {userProfile.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={userProfile.name} className="size-full object-cover" />
                    ) : (
                      <span>{userProfile.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 font-black text-xs">
                      <span className="truncate">లాగిన్ అయ్యారు: {userProfile.name}</span>
                      <ShieldCheck className="size-3.5 text-indigo-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-indigo-700 font-semibold truncate">
                      +91 {userProfile.phone} • OLX తరహాలో నేరుగా పోస్ట్ చేయవచ్చు (No OTP)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-900 shrink-0">
                  OTP ఫ్రీ
                </span>
              </div>
            )}

            {/* Employer Name & Company Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 flex items-center gap-1">
                  <User className="size-3.5 text-blue-600" />
                  <span>మీ పేరు (Employer Name)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="ఉదా: సురేష్ కుమార్ (e.g. Suresh)"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800">
                  కంపెనీ / సంస్థ పేరు (Company Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ఉదా: శ్రీ విజయా ఎంటర్‌ప్రైజెస్"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800">
                ఉద్యోగ శీర్షిక (Job Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="ఉదా: Front Office Executive లేదా Delivery Driver"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Category Field */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800">
                ఉద్యోగ విభాగం (Category Dropdown) <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition"
              >
                <option value="IT & Software">💻 ఐటీ & సాఫ్ట్‌వేర్ (IT & Software)</option>
                <option value="Apprenticeship">🛠️ అప్రెంటిస్‌షిప్ (Apprenticeship Jobs)</option>
                <option value="Office & Admin">🏢 ఆఫీస్ అడ్మిన్ & అకౌంట్స్ (Office/Admin)</option>
                <option value="Sales & Marketing">📈 సేల్స్ & మార్కెటింగ్ (Sales & Marketing)</option>
                <option value="Drivers & Delivery">🚚 డ్రైవర్లు & డెలివరీ (Drivers & Delivery)</option>
                <option value="Retail & Store">🏬 రిటైల్ & స్టోర్ సిబ్బంది (Retail/Store Staff)</option>
                <option value="Teaching & Education">📚 టీచింగ్ & ఎడ్యుకేషన్ (Teaching)</option>
                <option value="Hotel & Restaurant">🍽️ హోటల్ & రెస్టారెంట్ (Hotel Staff)</option>
                <option value="Healthcare & Nursing">🏥 హెల్త్‌కేర్ & నర్సింగ్ (Healthcare)</option>
                <option value="Construction & Tech">🔧 కన్‌స్ట్రక్షన్ & టెక్నీషియన్ (Technical)</option>
                <option value="Other">🎁 ఇతర ఉద్యోగాలు (Other Jobs)</option>
              </select>
            </div>

            {/* Smart Location & Area Selector */}
            <div className="space-y-1">
              <LocationAreaSelector
                value={locality}
                onChange={setLocality}
                label="ఉద్యోగ ప్రాంతం / లొకేషన్ (Job Location / Area)"
                placeholder="ఉదా: ఆనందపురం, కూకట్‌పల్లి, విజయవాడ..."
                required={true}
              />
            </div>

            {/* Work Mode & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800">
                  పని విధానం (Work Mode) <span className="text-red-500">*</span>
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition"
                >
                  <option value="On-site">🏢 ఆఫీస్ లో (On-site)</option>
                  <option value="Remote">🏠 ఇంటి నుండి పని (Remote / WFH)</option>
                  <option value="Hybrid">🔄 హైబ్రిడ్ (Hybrid)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800">
                  అనుభవం (Experience Level)
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition"
                >
                  <option value="Fresher">🎓 ఫ్రెషర్స్ (Fresher)</option>
                  <option value="Experienced">💼 అనుభవం ఉన్నవారు (Experienced)</option>
                  <option value="Any">అందరూ దరఖాస్తు చేసుకోవచ్చు (Any)</option>
                </select>
              </div>
            </div>

            {/* Salary Range & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800">
                  జీతం / వేతనం (Salary in ₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="ఉదా: ₹18,000 - ₹25,000 / month"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800">
                  సంప్రదించే మొబైల్ (WhatsApp Phone) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800">
                ఉద్యోగ వివరాలు & అర్హతలు (Job Description)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="విద్యా అర్హతలు, పని వేళలు, కంపెనీ వివరాలు..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* AT LAST OF THE FORM: DISCLAIMER & TERMS AND CONDITIONS ACCEPTANCE (DEFAULT CHECKED) */}
            <div className="space-y-2.5 p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center gap-1.5 font-black text-indigo-950 text-xs">
                <FileCheck className="size-4 text-indigo-600" />
                <span>యాజమాన్య నిబంధనలు & చట్టపరమైన సమ్మతి (Terms & Compliance)</span>
              </div>

              {/* Declaration 1: Direct Employer */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationIndependent}
                  onChange={(e) => setDeclarationIndependent(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="text-[11px] leading-relaxed text-slate-800 font-bold">
                  <span className="text-indigo-950 font-black">1. ప్రత్యక్ష యాజమాన్య డిక్లరేషన్:</span> నేను ప్రత్యక్ష యజమానిని/అధికృత రిక్రూటర్‌నని, జాబ్ వివరాలు వాస్తవమైనవని ధృవీకరిస్తున్నాను. (Direct Employer / Genuine Job Posting)
                </div>
              </label>

              {/* Declaration 2: Terms & No Fee Policy */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationTerms}
                  onChange={(e) => setDeclarationTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="text-[11px] leading-relaxed text-slate-800 font-bold">
                  <span className="text-indigo-950 font-black">2. నిబంధనలు:</span> మేము అభ్యర్థుల నుండి ఎటువంటి నమోదు రుసుము వసూలు చేయబోమని మరియు VaartaNow{" "}
                  <Link to="/provider-terms" target="_blank" className="text-blue-600 underline font-black">
                    నిబంధనలు
                  </Link>
                  {" "}మరియు{" "}
                  <Link to="/provider-code-of-conduct" target="_blank" className="text-blue-600 underline font-black">
                    ప్రవర్తనా నియమావళి
                  </Link>
                  {" "}ని అంగీకరిస్తున్నాము.
                </div>
              </label>
            </div>

            {/* Proceed Button */}
            <button
              type="submit"
              disabled={loading || !declarationIndependent || !declarationTerms}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "ప్రక్రియ జరుగుతోంది..."
              ) : userProfile && userProfile.is_verified ? (
                "🚀 ఉద్యోగాన్ని నేరుగా ప్రచురించండి (Publish Job Directly - No OTP)"
              ) : (
                "Live SMS OTP పొందండి ➔ (Send OTP)"
              )}
            </button>

          </form>
        )}

        {/* ---------------- STEP 2: LIVE SMS OTP VERIFICATION ---------------- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTPAndPostJob} className="space-y-4 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>← వెనుకకు (Back to Job Details)</span>
            </button>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-black text-emerald-700 text-sm">
                <ShieldCheck className="size-5" />
                <span>SMS OTP Sent</span>
              </div>
              <p>📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6-అంకెల OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-emerald-600 font-bold">
                  (డెమో OTP కోడ్: <span className="font-black text-sm">{demoOtpHint}</span> లేదా 123456)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-center block">
                6-అంకెల OTP కోడ్‌ను ఇక్కడ నమోదు చేయండి (Enter 6-Digit OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & ఉద్యోగం ప్రచురించు (Verify & Post Job)"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
