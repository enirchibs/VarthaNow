import React, { useState, useEffect } from "react";
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
  FileText
} from "lucide-react";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";
import { addLocalJob } from "@/lib/jobs-api";
import type { WorkMode, ContractType, ExperienceLevel } from "@/types/jobs";

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
  const [locality, setLocality] = useState<string>("Visakhapatnam");
  const [workMode, setWorkMode] = useState<WorkMode>("On-site");
  const [contractType, setContractType] = useState<ContractType>("Full-time");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Fresher");
  const [salaryRange, setSalaryRange] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // OTP State (Step 2)
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // Load pre-filled employer profile if available
    try {
      const savedProf = localStorage.getItem("vaartanow_employer_profile") || localStorage.getItem("vizag_employer_profile");
      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (parsed.name) setEmployerName(parsed.name);
        if (parsed.company) setCompanyName(parsed.company);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {}
    setStep(1);
    setErrorMsg("");
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1 Submission ➔ Trigger Twilio SMS OTP
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerName.trim()) {
      setErrorMsg("దయచేసి మీ పేరు నమోదు చేయండి (Please enter your name)");
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
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("దయచేసి 10-అంకెల మొబైల్ నంబర్ ఇవ్వండి (Please enter 10-digit mobile number)");
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

    // Save Employer Profile to LocalStorage
    const employerProfile = {
      name: employerName.trim(),
      company: companyName.trim(),
      phone: phone.replace(/\D/g, ""),
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
      full_description: description.trim() || `## ఉద్యోగ వివరాలు (Job Details):\n- హోదా: ${jobTitle}\n- కంపెనీ: ${companyName}\n- ప్రాంతం: ${locality}\n- జీతం: ${formattedSalary}\n- సంప్రదించే సంఖ్య: ${phone}`,
      apply_link: `https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${employerName}, I am interested in '${jobTitle}' role at ${companyName} posted on VaartaNow Jobs.`)}`,
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
      employer_name: employerName.trim(),
      contact_phone: phone.replace(/\D/g, "")
    });

    setLoading(false);
    onJobPosted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black shadow-md">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                + ఉద్యోగం పోస్ట్ చేయండి <span className="text-xs text-gray-400 font-normal">(Post a Job Opening)</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-bold">
                దశ {step}/2 (Step {step} of 2)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-[#1f2937] transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ---------------- STEP 1: JOB DETAILS FORM (TELUGU FIRST) ---------------- */}
        {step === 1 && (
          <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
            
            {/* Employer Name & Company Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  మీ పేరు (Employer / HR Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="ఉదా: సురేష్ కుమార్ (e.g. Suresh)"
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  కంపెనీ / సంస్థ పేరు (Company Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ఉదా: శ్రీ విజయా ఎంటర్ ప్రైజెస్"
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-1">
              <label className="font-extrabold text-gray-200">
                ఉద్యోగ శీర్షిక (Job Title) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="ఉదా: Front Office Executive లేదా Delivery Driver"
                required
                className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Category & Locality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  ఉద్యోగ విభాగం (Category Dropdown) <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="IT & Software">💻 ఐటీ & సోఫ్ట్‌వేర్ (IT & Software)</option>
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

              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  ప్రాంతం (Locality Dropdown) <span className="text-red-400">*</span>
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="Visakhapatnam">విశాఖపట్నం (Visakhapatnam)</option>
                  <option value="Madhurawada">మధురవాడ (Madhurawada)</option>
                  <option value="Gajuwaka">గాజువాక (Gajuwaka)</option>
                  <option value="Gachibowli">గచ్చిబౌలి (Gachibowli)</option>
                  <option value="Hyderabad">హైదరాబాద్ (Hyderabad)</option>
                  <option value="Vijayawada">విజయవాడ (Vijayawada)</option>
                  <option value="Guntur">గుంటూరు (Guntur)</option>
                  <option value="Tirupati">తిరుపతి (Tirupati)</option>
                  <option value="Warangal">వరంగల్ (Warangal)</option>
                </select>
              </div>
            </div>

            {/* Work Mode & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  పని విధానం (Work Mode) <span className="text-red-400">*</span>
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="On-site">🏢 ఆఫీస్ లో (On-site)</option>
                  <option value="Remote">🏠 ఇంటి నుండి పని (Remote / WFH)</option>
                  <option value="Hybrid">🔄 హైబ్రిడ్ (Hybrid)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  అనుభవం (Experience Level)
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
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
                <label className="font-extrabold text-gray-200">
                  జీతం / వేతనం (Salary in ₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="ఉదా: ₹18,000 - ₹25,000 / month"
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  సంప్రదించే మొబైల్ (WhatsApp Phone) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-extrabold text-gray-200">
                ఉద్యోగ వివరాలు & అర్హతలు (Job Description)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="విద్యా అర్హతలు, పని వేళలు, కంపెనీ వివరాలు..."
                className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Proceed Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
            >
              {loading ? "SMS OTP పంపుతున్నాము..." : "కొనసాగించు ➔ Live SMS OTP పొందండి"}
            </button>

          </form>
        )}

        {/* ---------------- STEP 2: LIVE SMS OTP VERIFICATION ---------------- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTPAndPostJob} className="space-y-4 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>← వెనుకకు (Back to Job Details)</span>
            </button>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-bold text-sky-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-black text-sky-400 text-sm">
                <ShieldCheck className="size-5" />
                <span>SMS OTP Sent</span>
              </div>
              <p>📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6-అంకెల OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-sky-400">
                  (డెమో OTP కోడ్: <span className="font-black text-sm">{demoOtpHint}</span> లేదా 123456)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-gray-200 text-center block">
                6-అంకెల OTP కోడ్‌ను ఇక్కడ నమోదు చేయండి (Enter 6-Digit OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[#1f2937] bg-[#030712] p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & ఉద్యోగం ప్రచురించు (Verify & Post Job)"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
