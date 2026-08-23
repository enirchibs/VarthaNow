import React, { useState, useEffect } from "react";
import { 
  X, 
  User,
  ShoppingBag, 
  Phone, 
  ShieldCheck, 
  Camera, 
  Image as ImageIcon,
  Tag,
  Gift,
  ArrowLeft,
  Upload
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

  // Form State (Telugu First + English Format)
  const [sellerName, setSellerName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [locality, setLocality] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isFree, setIsFree] = useState<boolean>(false);
  const [offerDiscount, setOfferDiscount] = useState<string>("");
  const [freeBonusItems, setFreeBonusItems] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

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

  // Image Upload Handler (Camera & Gallery File Selection)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Submission ➔ Trigger Live Twilio SMS OTP Code
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim()) {
      setErrorMsg("దయచేసి మీ పూర్తి పేరు నమోదు చేయండి (Please enter your full name)");
      return;
    }
    if (!category) {
      setErrorMsg("దయచేసి ఒక విభాగాన్ని ఎంచుకోండి (Please select a category)");
      return;
    }
    if (!locality) {
      setErrorMsg("దయచేసి ఒక ప్రాంతాన్ని ఎంచుకోండి (Please select a locality)");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("దయచేసి ప్రకటన శీర్షిక రాయండి (Please enter an ad title)");
      return;
    }
    if (!isFree && !price.trim()) {
      setErrorMsg("దయచేసి ధర నమోదు చేయండి (Please enter price in ₹)");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("దయచేసి 10-అంకెల వాట్సాప్ మొబైల్ నంబర్ ఇవ్వండి (10-digit WhatsApp phone)");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Invoke Twilio SMS API via send-otp Edge Function / Supabase Auth
    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setStep(2); // Advance to Step 2 of 2
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  // Step 2 Submission ➔ Verify 6-Digit OTP & Save Classified to Supabase
  const handleVerifyOTPAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6-అంకెల OTP కోడ్‌ను నమోదు చేయండి (Enter 6-digit OTP)");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(phone, otp, sellerName);

    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.error || "OTP కోడ్ తప్పుగా ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
      return;
    }

    // Default HD cover based on category if no photo selected
    const catType = (category as ClassifiedCategory) || "other";
    const defaultImg = catType === "electronics" ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" :
                       catType === "vehicles" ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" :
                       catType === "furniture" ? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" :
                       catType === "property" ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" :
                       catType === "services" ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" :
                       "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";

    const finalPrice = isFree ? "ఉచితం (Free)" : (price.startsWith("₹") ? price.trim() : `₹${price.trim()}`);

    await addClassifiedItem({
      seller_name: sellerName.trim(),
      category: catType,
      title: title.trim(),
      description: description.trim() || "ఏలాంటి సమస్య లేదు. నాణ్యమైన వస్తువు. (Good condition)",
      price: finalPrice,
      locality: locality.trim(),
      contact: phone.replace(/\D/g, ""),
      images: imageUrl.trim() ? [imageUrl.trim()] : [defaultImg],
      offer_discount: offerDiscount.trim() || undefined,
      free_items: freeBonusItems.trim() || (isFree ? "ఉచిత వస్తువు (Free Item)" : undefined)
    });

    setLoading(false);
    onPostSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

        {/* Modal Header Bar (Telugu First + English) */}
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-black text-white">
              + ఉచిత ప్రకటన పోస్ట్ చేయండి <span className="text-xs text-gray-400 font-normal">(Post a Classified Ad)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30">
              దశ {step}/2 (Step {step} of 2)
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-[#1f2937] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ---------------- STEP 1: AD DETAILS FORM (TELUGU FIRST FORMAT) ---------------- */}
        {step === 1 && (
          <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
            
            {/* Field 1: మీ పూర్తి పేరు (Your Full Name) * */}
            <div className="space-y-1">
              <label className="font-extrabold text-gray-200 flex items-center gap-1">
                <User className="size-3.5 text-[#2563eb]" />
                మీ పూర్తి పేరు (Your Full Name) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="ఉదా: రమేష్ (e.g. Ramesh)"
                required
                className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Field 2 & 3: Category & Locality Side by Side (Telugu First) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  విభాగం (Category Dropdown) <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
                >
                  <option value="">విభాగాన్ని ఎంచుకోండి (Select a Category)</option>
                  <option value="electronics">📱 ఎలక్ట్రానిక్స్ & మొబైల్స్ (Electronics)</option>
                  <option value="furniture">🛋️ ఫర్నిచర్ (Furniture & Appliances)</option>
                  <option value="vehicles">🚗 వాహనాలు & బైక్‌లు (Vehicles & Bikes)</option>
                  <option value="property">🏢 ప్రాపర్టీ & ఇల్లు (Property & Real Estate)</option>
                  <option value="services">🔧 స్థానిక సేవలు (Services & Repairs)</option>
                  <option value="jobs">💼 ఉద్యోగాలు (Jobs & Careers)</option>
                  <option value="agriculture">🌾 వ్యవసాయం & రైతు పంటలు (Agriculture & Crops)</option>
                  <option value="other">🎁 ఇతర / ఉచిత వస్తువులు (Other & Free Items)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-200 flex items-center justify-between">
                  <span>ప్రాంతం (Locality Dropdown) <span className="text-red-400">*</span></span>
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
                >
                  <option value="">ప్రాంతాన్ని ఎంచుకోండి (Select a Locality)</option>
                  <option value="ఎంవీపీ కాలనీ (MVP Colony)">ఎంవీపీ కాలనీ (MVP Colony)</option>
                  <option value="మధురవాడ (Madhurawada)">మధురవాడ (Madhurawada)</option>
                  <option value="గాజువాక (Gajuwaka)">గాజువాక (Gajuwaka)</option>
                  <option value="విశాఖపట్నం (Visakhapatnam)">విశాఖపట్నం (Visakhapatnam)</option>
                  <option value="గచ్చిబౌలి (Gachibowli)">గచ్చిబౌలి (Gachibowli, Hyderabad)</option>
                  <option value="హైదరాబాద్ (Hyderabad)">హైదరాబాద్ (Hyderabad)</option>
                  <option value="విజయవాడ (Vijayawada)">విజయవాడ (Vijayawada)</option>
                  <option value="గుంటూరు (Guntur)">గుంటూరు (Guntur)</option>
                  <option value="తిరుపతి (Tirupati)">తిరుపతి (Tirupati)</option>
                  <option value="వరంగల్ (Warangal)">వరంగల్ (Warangal)</option>
                </select>
              </div>

            </div>

            {/* Field 4: Ad Title */}
            <div className="space-y-1">
              <label className="font-extrabold text-gray-200">
                ప్రకటన శీర్షిక (Ad Title) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="మీరు ఏమి అమ్ముతున్నారు / అందిస్తున్నారు? (What are you selling/offering?)"
                required
                className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Field 5: Description */}
            <div className="space-y-1">
              <label className="font-extrabold text-gray-200">
                వివరణ (Description Textarea)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="మీ ప్రకటన గురించి మరిన్ని వివరాలు వ్రాయండి... (More details about your ad...)"
                className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Fields 6 & 7: Bordered Box Container (Special Offer & Free Bonus) */}
            <div className="p-3 rounded-2xl border border-[#1f2937] bg-[#030712]/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1">
                  <Tag className="size-3 text-amber-400" />
                  ఆఫర్ / తగ్గింపు Tag <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  placeholder="ఉదా: 25% OFF లేదా పండుగ ధమాకా (e.g. 25% OFF)"
                  className="w-full rounded-xl border border-[#1f2937] bg-[#111827] p-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-teal-400 flex items-center gap-1">
                  <Gift className="size-3 text-teal-400" />
                  ఉచిత బోనస్ వస్తువులు <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={freeBonusItems}
                  onChange={(e) => setFreeBonusItems(e.target.value)}
                  placeholder="ఉదా: కవర్ & ఛార్జర్ ఉచితం (e.g. Includes charger & case)"
                  className="w-full rounded-xl border border-[#1f2937] bg-[#111827] p-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
            </div>

            {/* Field 8: Add Photos (Camera & Gallery Input) */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-gray-200">
                ఫోటో లింక్ / Camera Input <span className="text-gray-400 font-normal">(Photo Upload)</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                
                {/* 📷 Open Camera Button Box */}
                <label className="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[#2563eb]/50 hover:bg-[#2563eb]/10 transition cursor-pointer group bg-[#030712]/40">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <Camera className="size-6 text-[#2563eb] group-hover:scale-110 transition mb-1" />
                  <span className="text-[11px] font-black text-blue-400">కెమెరా తెరవండి (Open Camera)</span>
                </label>

                {/* 🖼️ Gallery Button Box */}
                <label className="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-500/50 hover:bg-emerald-500/10 transition cursor-pointer group bg-[#030712]/40">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <ImageIcon className="size-6 text-emerald-400 group-hover:scale-110 transition mb-1" />
                  <span className="text-[11px] font-black text-emerald-400">గ్యాలరీ (Gallery)</span>
                </label>

              </div>

              {/* Photo preview or URL input fallback */}
              {imageUrl ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#1f2937] mt-2">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="లేదా ఫోటో లింక్ ఇక్కడ పేస్ట్ చేయండి (https://...)"
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] mt-1"
                />
              )}
            </div>

            {/* Field 9 & 10: Price & Contact Number Side by Side (Telugu First) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div className="space-y-1">
                <label className="font-extrabold text-gray-200 flex items-center justify-between">
                  <span>ధర (Price in ₹) <span className="text-red-400">*</span></span>
                  <label className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#16a34a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded text-[#16a34a] focus:ring-[#16a34a]"
                    />
                    ఉచితం (Free)
                  </label>
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isFree}
                  placeholder={isFree ? "ఉచితం (Free)" : "3000"}
                  required={!isFree}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-gray-200">
                  సంప్రదించే సంఖ్య (Contact Number - WhatsApp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7207550499"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

            </div>

            {/* Primary Action Button (Telugu First format as shown in image) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
            >
              {loading ? "SMS OTP పంపుతున్నాము..." : "కొనసాగించు ➔ Live Twilio SMS OTP పొందండి"}
            </button>

          </form>
        )}

        {/* ---------------- STEP 2: LIVE TWILIO SMS OTP VERIFICATION (TELUGU FIRST) ---------------- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTPAndPublish} className="space-y-4 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>← వెనుకకు (Back to Edit Ad Details)</span>
            </button>

            <div className="p-4 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/30 text-xs font-bold text-emerald-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-black text-[#16a34a] text-sm">
                <ShieldCheck className="size-5" />
                <span>Twilio SMS OTP Sent</span>
              </div>
              <p>📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6-అంకెల OTP పంపబడింది.</p>
              {demoOtpHint && (
                <p className="text-[10px] text-emerald-400">
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
                className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[#1f2937] bg-[#030712] p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#16a34a] hover:bg-emerald-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
            >
              {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & ప్రకటన ప్రచురించు (Verify & Publish)"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
