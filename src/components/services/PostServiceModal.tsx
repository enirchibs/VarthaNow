import React, { useState } from "react";
import { 
  X, 
  ArrowLeft, 
  Check, 
  Wrench, 
  Phone, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  User, 
  Building2 
} from "lucide-react";
import { SERVICE_CATEGORIES, SERVICE_SUBCATEGORIES, saveCustomService } from "@/lib/services-api";
import type { ServiceProvider, ServiceMode, PriceType } from "@/types/services";
import { LocationAreaSelector } from "@/components/LocationAreaSelector";
import { TeluguTypingBanner } from "@/components/TeluguTypingBanner";

interface PostServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: (newService: ServiceProvider) => void;
}

export function PostServiceModal({
  isOpen,
  onClose,
  onServiceCreated
}: PostServiceModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [locality, setLocality] = useState("");
  const [villageTown, setVillageTown] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(25);
  const [serviceMode, setServiceMode] = useState<ServiceMode>("both");
  const [priceType, setPriceType] = useState<PriceType>("starting_from");
  const [priceFrom, setPriceFrom] = useState("");
  const [descriptionTe, setDescriptionTe] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [workingHours, setWorkingHours] = useState("ఉదయం 8:00 - రాత్రి 8:00");

  if (!isOpen) return null;

  const currentCategory = SERVICE_CATEGORIES.find((c) => c.id === selectedCategoryId);
  const availableSubcategories = SERVICE_SUBCATEGORIES.filter(
    (s) => s.category_id === selectedCategoryId
  );
  const currentSubcategory = SERVICE_SUBCATEGORIES.find((s) => s.id === selectedSubcategoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedCategoryId || !selectedSubcategoryId || !locality) {
      alert("దయచేసి అవసరమైన అన్ని వివరాలను పూరించండి.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newService: ServiceProvider = {
        id: `sp_custom_${Date.now()}`,
        name,
        business_name: businessName || name,
        phone,
        whatsapp: phone,
        phone_verified: true,
        category_id: selectedCategoryId,
        category_name_te: currentCategory?.name_te || "ఇతర సేవలు",
        subcategory_id: selectedSubcategoryId,
        subcategory_name_te: currentSubcategory?.name_te || "సేవ",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        photos: [
          currentCategory?.image_url || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
        ],
        locality,
        village_town: villageTown || locality,
        mandal: locality,
        district: "Visakhapatnam",
        state: "Andhra Pradesh",
        lat: 17.7946,
        lon: 83.1362,
        service_radius_km: serviceRadiusKm,
        service_mode: serviceMode,
        price_type: priceType,
        price_from: priceFrom ? parseInt(priceFrom, 10) : undefined,
        price_rate_label: priceFrom ? `₹${priceFrom} నుండి` : "చర్చించదగినది",
        pricing_breakdown: [
          {
            service_name: currentSubcategory?.name_te || "జనరల్ సర్వీస్",
            price_rate: priceFrom ? `₹${priceFrom} నుండి` : "చర్చించదగినది"
          }
        ],
        services_offered: [currentSubcategory?.name_te || "సేవలు"],
        experience_years: experienceYears,
        rating: 5.0,
        review_count: 1,
        description_te: descriptionTe || `${locality} మరియు చుట్టుపక్కల ప్రాంతాల్లో నాణ్యమైన సేవలు అందించబడును.`,
        working_hours: workingHours,
        is_available_now: true,
        created_at: new Date().toISOString()
      };

      saveCustomService(newService);
      onServiceCreated(newService);
      alert("🎉 మీ సేవ మన అడ్డా లో విజయవంతంగా నమోదు చేయబడింది!");
      onClose();
    } catch (err) {
      console.warn("Failed to create service:", err);
      alert("నమోదు సమయంలో సమస్య ఎదురైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="p-1 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                మీ సేవను నమోదు చేసుకోండి
              </h2>
              <p className="text-[10px] font-bold text-slate-400">
                స్టెప్ {step} / 3 — మన అడ్డా ఉచిత రిజిస్ట్రేషన్
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-bold text-slate-800 dark:text-slate-100">
          
          {/* ⌨️ Telugu Typing Helper Banner */}
          <TeluguTypingBanner className="mb-2" />

          {/* STEP 1: Basic Profile & Contact */}
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in-50">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  మీ పూర్తి పేరు (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ఉదా: శ్రీనివాస రావు"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  మొబైల్ నంబర్ (Phone Number) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="ఉదా: 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  రకం (Type)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("individual")}
                    className={`py-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition ${
                      accountType === "individual"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <User className="size-4" />
                    <span>వ్యక్తిగత పని (Individual)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType("business")}
                    className={`py-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition ${
                      accountType === "business"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Building2 className="size-4" />
                    <span>షాప్ / వ్యాపారం (Business)</span>
                  </button>
                </div>
              </div>

              {accountType === "business" && (
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-black">
                    షాప్ లేదా వ్యాపారం పేరు (Business Name)
                  </label>
                  <input
                    type="text"
                    placeholder="ఉదా: శ్రీ లక్ష్మి ఎలక్ట్రికల్స్"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={!name || phone.length < 10}
                onClick={() => setStep(2)}
                className="w-full h-11 mt-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                తర్వాత స్టెప్ (Next) →
              </button>
            </div>
          )}

          {/* STEP 2: Service Category & Subcategory */}
          {step === 2 && (
            <div className="space-y-3 animate-in fade-in-50">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  ప్రధాన సేవ వర్గం (Category) *
                </label>
                <select
                  required
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedSubcategoryId("");
                  }}
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="">సేవ వర్గం ఎంచుకోండి...</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_te} ({cat.name_en})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryId && (
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-black">
                    ప్రత్యేక సేవ (Subcategory) *
                  </label>
                  <select
                    required
                    value={selectedSubcategoryId}
                    onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="">ఉప వర్గం ఎంచుకోండి...</option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name_te} ({sub.name_en})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  అనుభవం (సంవత్సరాలలో)
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black cursor-pointer"
                >
                  ← వెనుకకు
                </button>
                <button
                  type="button"
                  disabled={!selectedCategoryId || !selectedSubcategoryId}
                  onClick={() => setStep(3)}
                  className="w-2/3 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  లొకేషన్ & ధర (Next) →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Location, Radius & Pricing */}
          {step === 3 && (
            <div className="space-y-3 animate-in fade-in-50">
              <div className="space-y-1">
                <LocationAreaSelector
                  value={locality}
                  onChange={setLocality}
                  label="ప్రాంతం / ఏరియా / పట్టణం (Locality / Area)"
                  placeholder="ఉదా: మధురవాడ, సబ్బవరం, గాజువాక..."
                  required={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  సేవ అందించే దూరం పరిధి (Service Radius)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 25, 50, 100].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setServiceRadiusKm(r)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        serviceRadiusKm === r
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  ప్రారంభ ధర (సుమారుగా - Starting Price)
                </label>
                <input
                  type="number"
                  placeholder="ఉదా: 300"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-black">
                  మీ పని గురించి వివరణ (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="మీరు చేసే పనుల వివరాలు..."
                  value={descriptionTe}
                  onChange={(e) => setDescriptionTe(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black cursor-pointer"
                >
                  ← వెనుకకు
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !locality}
                  className="w-2/3 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  <span>సమర్పించండి (Submit)</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
