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
  Send,
  ArrowLeft
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
  const [step, setStep] = useState<1 | 2>(1);

  // Form State (Step 1: Ad Details)
  const [sellerName, setSellerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [category, setCategory] = useState<ClassifiedCategory>("electronics");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isFree, setIsFree] = useState<boolean>(false);
  const [offerDiscount, setOfferDiscount] = useState<string>("");
  const [freeBonusItems, setFreeBonusItems] = useState<string>("");
  const [locality, setLocality] = useState<string>("మధురవాడ (Madhurawada, Vizag)");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  // OTP State (Step 2: Live SMS OTP Verification)
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const currentProf = getStoredSellerProfile();
    setProfile(currentProf);
    if (currentProf) {
      if (currentProf.name) setSellerName(currentProf.name);
      if (currentProf.phone) setPhone(currentProf.phone);
    }
    setStep(1);
    setErrorMsg("");
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1 Submission ➔ Trigger Twilio SMS OTP
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim()) {
      setErrorMsg("దయచేసి అమ్మకందారు పేరు (Seller Name) నమోదు చేయండి.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("దయచేసి ప్రకటన శీర్షిక (Listing Title) రాయండి.");
      return;
    }
    if (!isFree && !price.trim()) {
      setErrorMsg("దయచేసి ధర (Price in ₹) నమోదు చేయండి.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి (10-digit Mobile Number).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Invoke Twilio SMS API via send-otp Edge Function
    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setStep(2); // Advance to Step 2: Live SMS OTP Verification
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  // Step 2 Submission ➔ Verify 6-Digit OTP & Save Classified to Supabase
  const handleVerifyOTPAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6 అంకెల OTP ని నమోదు చేయండి.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(phone, otp, sellerName);

    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.error || "OTP తప్పుగా ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
      return;
    }

    // On OTP Verification Success:
    // 1. Save Seller Profile to vizag_user_profile & vaartanow_user_profile in LocalStorage
    // 2. Publish Classified to Supabase public.classifieds table
    const finalPrice = isFree ? "ఉచితం (Free Item)" : `₹${price.replace(/[^\d.,]/g, "")}`;
    const defaultImg = category === "electronics" ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" :
                       category === "vehicles" ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" :
                       category === "furniture" ? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" :
                       category === "property" ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" :
                       category === "services" ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" :
                       "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";

    await addClassifiedItem({
      seller_name: sellerName.trim(),
      category,
      title: title.trim(),
      description: description.trim() || "ఏలాంటి సమస్య లేదు. నాణ్యమైన వస్తువు.",
      price: finalPrice,
      locality,
      contact: phone.replace(/\D/g, ""),
      images: imageUrl.trim() ? [imageUrl.trim()] : [defaultImg],
      offer_discount: offerDiscount.trim() || undefined,
      free_items: freeBonusItems.trim() || (isFree ? "ఉచిత వస్తువు (Free Bonus)" : undefined)
    });

    setLoading(false);
    onPostSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl space-y-4 p-6 sm:p-8 max-h-[92vh] overflow-y-auto no-scrollbar">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[hsl(var(--foreground))]">
                {step === 1 ? "+ Post Your Ad Free (ఉచిత ప్రకటన)" : "📩 Live Twilio SMS OTP Verification"}
              </h3>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {step === 1 ? "దశ 1/2: ప్రకటన వివరాలు (Step 1: Ad Details)" : "దశ 2/2: SMS OTP ధృవీకరణ (Step 2: Verification)"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ---------------- STEP 1: AD DETAILS FORM ---------------- */}
        {step === 1 && (
          <form onSubmit={handleProceedToOTP} className="space-y-4">
            
            {/* Seller Name & Phone Number */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  అమ్మకందారు పేరు (Seller Name) *
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="ఉదా: Prasad Kumar"
                  required
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  10-అంకెల మొబైల్ నంబర్ (Phone) *
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
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                ప్రకటన శీర్షిక (Listing Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ఉదా: Samsung Galaxy S22 Ultra లేదా సోనా మసూరి బియ్యం బస్తాలు"
                required
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                విభాగం (Category Dropdown) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClassifiedCategory)}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="electronics">📱 ఎలక్ట్రానిక్స్ (Electronics)</option>
                <option value="furniture">🛋️ ఫర్నిచర్ (Furniture)</option>
                <option value="vehicles">🚗 వాహనాలు (Vehicles)</option>
                <option value="property">🏢 ప్రాపర్టీ & ఇల్లు (Property)</option>
                <option value="services">🔧 స్థానిక సేవలు (Services)</option>
                <option value="jobs">💼 ఉద్యోగాలు (Jobs)</option>
                <option value="other">🎁 ఇతర / ఉచితం (Other / Free)</option>
              </select>
            </div>

            {/* Price & Free Item Checkbox */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))] flex items-center justify-between">
                  <span>ధర (Price in ₹) *</span>
                  <label className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    ఉచితం (Free)
                  </label>
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isFree}
                  placeholder={isFree ? "ఉచితం (Free)" : "35000"}
                  required={!isFree}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Locality Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  ప్రాంతం (Locality Dropdown) *
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="మధురవాడ (Madhurawada, Vizag)">మధురవాడ (Madhurawada)</option>
                  <option value="గాజువాక (Gajuwaka, Vizag)">గాజువాక (Gajuwaka)</option>
                  <option value="ఎంవీపీ కాలనీ (MVP Colony, Vizag)">ఎంవీపీ కాలనీ (MVP Colony)</option>
                  <option value="విశాఖపట్నం (Visakhapatnam)">విశాఖపట్నం (Visakhapatnam)</option>
                  <option value="హైదరాబాద్ (Hyderabad)">హైదరాబాద్ (Hyderabad)</option>
                  <option value="గచ్చిబౌలి (Gachibowli, Hyderabad)">గచ్చిబౌలి (Gachibowli)</option>
                  <option value="విజయవాడ (Vijayawada)">విజయవాడ (Vijayawada)</option>
                  <option value="గుంటూరు (Guntur)">గుంటూరు (Guntur)</option>
                  <option value="తిరుపతి (Tirupati)">తిరుపతి (Tirupati)</option>
                  <option value="వరంగల్ (Warangal)">వరంగల్ (Warangal)</option>
                </select>
              </div>
            </div>

            {/* Offer Discount & Free Bonus Items */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  ఆఫర్ / తగ్గింపు Tag (Optional)
                </label>
                <input
                  type="text"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  placeholder="ఉదా: 25% OFF"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  ఉచిత బోనస్ వస్తువులు (Optional)
                </label>
                <input
                  type="text"
                  value={freeBonusItems}
                  onChange={(e) => setFreeBonusItems(e.target.value)}
                  placeholder="ఉదా: Includes charger & case"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                వివరణ (Description Textarea)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="వస్తువు కండిషన్, వారంటీ వివరాలు, పిక్‌అప్ సూచనలు..."
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo Input */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                ఫోటో లింక్ / Camera Input (Photo Upload)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Next Step Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "SMS OTP పంపుతున్నాము..." : "కొనసాగించు ➔ Live Twilio SMS OTP పొందండి"}
            </button>

          </form>
        )}

        {/* ---------------- STEP 2: LIVE TWILIO SMS OTP VERIFICATION ---------------- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTPAndPublish} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>వెనుకకు (Edit Ad Details)</span>
            </button>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                <ShieldCheck className="size-5" />
                <span>Twilio SMS OTP Sent</span>
              </div>
              <p>📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6 అంకెల OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  (డెమో OTP కోడ్: <span className="font-black text-sm">{demoOtpHint}</span> లేదా 123456)
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[hsl(var(--foreground))] text-center block">
                6-అంకెల OTP ని ఇక్కడ నమోదు చేయండి (Enter 6-Digit OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3.5 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & ప్రకటన ప్రచురించు (Verify & Publish)"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
