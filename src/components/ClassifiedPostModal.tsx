import React, { useState, useEffect } from "react";
import { 
  X, 
  ShoppingBag, 
  Smartphone, 
  Car, 
  Home, 
  Briefcase, 
  Wrench, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Image as ImageIcon,
  Tag,
  MapPin,
  Send
} from "lucide-react";
import { 
  addClassifiedItem, 
  getStoredSellerProfile, 
  sendSMSOTP, 
  verifySellerOTP, 
  ClassifiedCategory, 
  SellerProfile 
} from "@/lib/classifieds-api";

interface ClassifiedPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess: () => void;
}

export function ClassifiedPostModal({ isOpen, onClose, onPostSuccess }: ClassifiedPostModalProps) {
  const [profile, setProfile] = useState<SellerProfile | null>(getStoredSellerProfile());
  const [step, setStep] = useState<"otp_send" | "otp_verify" | "post_form">("post_form");

  // Form State
  const [sellerName, setSellerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");

  const [category, setCategory] = useState<ClassifiedCategory>("electronics");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isFree, setIsFree] = useState<boolean>(false);
  const [offerDiscount, setOfferDiscount] = useState<string>("");
  const [locality, setLocality] = useState<string>("విశాఖపట్నం (Visakhapatnam)");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const currentProf = getStoredSellerProfile();
    setProfile(currentProf);
    if (!currentProf || !currentProf.is_verified) {
      setStep("otp_send");
    } else {
      setSellerName(currentProf.name);
      setPhone(currentProf.phone);
      setStep("post_form");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim()) {
      setErrorMsg("దయచేసి మీ పేరు నమోదు చేయండి (Please enter your name)");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrorMsg("చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి (Enter 10-digit mobile number)");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const res = await sendSMSOTP(phone);
    setLoading(false);
    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setStep("otp_verify");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const res = await verifySellerOTP(phone, otp, sellerName);
    setLoading(false);
    if (res.success && res.profile) {
      setProfile(res.profile);
      setStep("post_form");
    } else {
      setErrorMsg(res.error || "OTP తప్పుగా ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  // Step 3: Submit Classified Post Form
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("దయచేసి ప్రకటన శీర్షిక (Title) రాయండి.");
      return;
    }
    if (!locality.trim()) {
      setErrorMsg("దయచేసి మీ ప్రాంతం (Locality) ఎంచుకోండి.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const finalPrice = isFree ? "ఉచితం (Free Item)" : (price.trim() || "ధర చర్చించబడును (Negotiable)");
    const defaultImg = category === "electronics" ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" :
                       category === "vehicles" ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" :
                       category === "furniture" ? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" :
                       category === "property" ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" :
                       category === "services" ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" :
                       "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";

    await addClassifiedItem({
      seller_name: profile?.name || sellerName || "Verified Seller",
      category,
      title: title.trim(),
      description: description.trim() || "ఏలాంటి సమస్య లేదు. నాణ్యమైన వస్తువు.",
      price: finalPrice,
      locality,
      contact: profile?.phone || phone,
      images: imageUrl.trim() ? [imageUrl.trim()] : [defaultImg],
      offer_discount: offerDiscount.trim() || undefined,
      free_items: isFree ? "ఉచిత వస్తువు (Free Gift)" : undefined
    });

    setLoading(false);
    onPostSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl space-y-4 p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[hsl(var(--foreground))]">
                + అమ్మకం / ప్రకటన పోస్ట్ చేయండి
              </h3>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                VaartaNow Hyperlocal Marketplace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ---------------- STEP 1: PHONE & NAME ENTER ---------------- */}
        {step === "otp_send" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-900 dark:text-blue-200 space-y-1">
              <div className="flex items-center gap-2 font-black text-blue-600 dark:text-blue-400">
                <ShieldCheck className="size-4" />
                <span>ఖాతా దారుల రక్షణ & SMS ధృవీకరణ (Seller Verification)</span>
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                అమ్మకందారులను ధృవీకరించడానికి దయచేసి మీ వివరాలను నమోదు చేసి OTP పొందండి.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                మీ పేరు (Seller Name) *
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="ఉదా: శ్రీనివాస్ రావు"
                required
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                మొబైల్ నంబర్ (Mobile Phone) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 size-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9848012345"
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
              {loading ? "SMS పంపుతున్నాము..." : "📩 OTP పంపండి (Get 6-Digit OTP)"}
            </button>
          </form>
        )}

        {/* ---------------- STEP 2: VERIFY OTP ---------------- */}
        {step === "otp_verify" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center space-y-1">
              <p>📩 <strong>{phone}</strong> కు 6 అంకెల OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  (డెమో OTP కోడ్: <span className="font-black text-sm">{demoOtpHint}</span> లేదా 123456)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))] text-center block">
                6 అంకెల OTP ని ఇక్కడ నమోదు చేయండి
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full text-center tracking-widest text-lg font-black rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & కొనసాగించు"}
            </button>
          </form>
        )}

        {/* ---------------- STEP 3: CLASSIFIED POST FORM ---------------- */}
        {step === "post_form" && (
          <form onSubmit={handleSubmitPost} className="space-y-4">

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                విభాగం (Category) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "electronics", label: "మొబైల్స్ / ఎలక్ట్రానిక్స్", icon: Smartphone },
                  { id: "furniture", label: "ఫర్నిచర్", icon: Home },
                  { id: "vehicles", label: "వాహనాలు", icon: Car },
                  { id: "property", label: "ప్రాపర్టీ & ఇల్లు", icon: Home },
                  { id: "services", label: "స్థానిక సేవలు", icon: Wrench },
                  { id: "jobs", label: "ఉద్యోగాలు", icon: Briefcase },
                  { id: "other", label: "ఇతర / ఉచితం", icon: Gift }
                ].map((cat) => {
                  const IconC = cat.icon;
                  const isSel = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as ClassifiedCategory)}
                      className={`p-2.5 rounded-xl border text-[10px] font-black transition flex flex-col items-center gap-1 text-center cursor-pointer ${
                        isSel
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                      }`}
                    >
                      <IconC className="size-4" />
                      <span className="line-clamp-1">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                ప్రకటన శీర్షిక (Ad Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ఉదా: iPhone 13 128GB లేదా సోనా మసూరి బియ్యం బస్తాలు"
                required
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price & Free Item Checkbox */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))] flex items-center justify-between">
                  <span>ధర (Price)</span>
                  <label className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    ఉచితం (Free Item)
                  </label>
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isFree}
                  placeholder={isFree ? "ఉచితం (Free)" : "ఉదా: ₹38,500 లేదా ₹1,200 / బస్తా"}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  తగ్గింపు ఆఫర్ (Offer / Discount)
                </label>
                <input
                  type="text"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  placeholder="ఉదా: 10% తగ్గింపు లేదా నెగోషియబుల్"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Locality Selector */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                ప్రాంతం (Locality / Area) *
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="విశాఖపట్నం (Visakhapatnam)">విశాఖపట్నం (Visakhapatnam)</option>
                <option value="ఎంవీపీ కాలనీ (MVP Colony, Vizag)">ఎంవీపీ కాలనీ (MVP Colony, Vizag)</option>
                <option value="గాజువాక (Gajuwaka, Vizag)">గాజువాక (Gajuwaka, Vizag)</option>
                <option value="మధురవాడ (Madhurawada, Vizag)">మధురవాడ (Madhurawada, Vizag)</option>
                <option value="హైదరాబాద్ (Hyderabad)">హైదరాబాద్ (Hyderabad)</option>
                <option value="గచ్చిబౌలి (Gachibowli, Hyderabad)">గచ్చిబౌలి (Gachibowli, Hyderabad)</option>
                <option value="విజయవాడ (Vijayawada)">విజయవాడ (Vijayawada)</option>
                <option value="గుంటూరు (Guntur)">గుంటూరు (Guntur)</option>
                <option value="తిరుపతి (Tirupati)">తిరుపతి (Tirupati)</option>
                <option value="వరంగల్ (Warangal)">వరంగల్ (Warangal)</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                వివరణ (Detailed Description)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="వస్తువు పరిస్థితి, వాడిన కాలం, డెలివరీ లేదా పిక్‌అప్ వివరాలు రాయండి..."
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                ఫోటో లింక్ (Image URL)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "ప్రకటన ప్రచురిస్తున్నాము..." : "🚀 ప్రకటన ఉచితంగా ప్రచురించు (Publish Classified)"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
