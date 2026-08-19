import React, { useState } from "react";
import { 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  AlertCircle, 
  Briefcase, 
  Smartphone, 
  Car, 
  Home, 
  Sprout, 
  Wrench, 
  MapPin, 
  Check, 
  Send, 
  X,
  Phone,
  Tag
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type PostCategoryType = 
  | "news" 
  | "complaint" 
  | "job" 
  | "mobile" 
  | "vehicle" 
  | "property" 
  | "agriculture" 
  | "service";

interface PostCategoryItem {
  id: PostCategoryType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

const POST_CATEGORIES: PostCategoryItem[] = [
  {
    id: "news",
    title: "వార్తలు పోస్ట్ చేయండి",
    subtitle: "స్థానిక వార్తలు పోస్ట్ చేయండి, సమాజానికి దోహదపడండి",
    icon: FileText,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-400/10"
  },
  {
    id: "complaint",
    title: "ఫిర్యాదు పోస్ట్ చేయండి",
    subtitle: "రోడ్లు, డ్రైనేజీ, కరెంట్ సమస్యలను అధికారుల దృష్టికి తీసుకెళ్లండి",
    icon: AlertCircle,
    iconColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-400/10"
  },
  {
    id: "job",
    title: "ఉద్యోగం (వెతకండి / పోస్ట్ చేయండి)",
    subtitle: "ఉద్యోగాలు వెతకండి లేదా మీ దగ్గర జాబ్స్ ఉంటే పోస్ట్ చేసి నిరుద్యోగులకు సహాయపడండి",
    icon: Briefcase,
    iconColor: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-500/10 dark:bg-sky-400/10"
  },
  {
    id: "mobile",
    title: "మొబైల్ (కొనండి / అమ్మండి)",
    subtitle: "మొబైల్, ల్యాప్‌టాప్స్, ఎలక్ట్రానిక్స్ స్థానికంగా కొనండి లేదా అమ్మండి",
    icon: Smartphone,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-400/10"
  },
  {
    id: "vehicle",
    title: "వాహనం (కొనండి / అమ్మండి)",
    subtitle: "బైక్స్, కార్లు స్థానికంగా కొనండి లేదా అమ్మండి",
    icon: Car,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-400/10"
  },
  {
    id: "property",
    title: "ప్రాపర్టీ (కొనండి / అమ్మండి)",
    subtitle: "ఇల్లు, ప్లాట్లు, రూమ్స్ అద్దెకు ఇవ్వండి లేదా అమ్మండి",
    icon: Home,
    iconColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-400/10"
  },
  {
    id: "agriculture",
    title: "వ్యవసాయం (కొనండి / అమ్మండి)",
    subtitle: "రైతుల పంటలు, బియ్యం, పల్లి, పప్పులు, చింతపండు రైతు ధరకు అమ్మండి/కొనండి",
    icon: Sprout,
    iconColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10 dark:bg-green-400/10"
  },
  {
    id: "service",
    title: "స్థానిక సేవలు (కొనండి / అమ్మండి)",
    subtitle: "ఎలక్ట్రీషియన్, ప్లంబర్, డ్రైవర్, మొబైల్/ల్యాప్‌టాప్ రిపేర్, ట్యూషన్ సేవలు పొందండి/అందించండి",
    icon: Wrench,
    iconColor: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-500/10 dark:bg-teal-400/10"
  }
];

const ANDHRA_LOCALITIES = [
  "విశాఖపట్నం (Visakhapatnam)",
  "గాజువాక (Gajuwaka)",
  "మధురవాడ (Madhurawada)",
  "ఎంవీపీ కాలనీ (MVP Colony)",
  "విజయవాడ (Vijayawada)",
  "హైదరాబాద్ (Hyderabad)",
  "తిరుపతి (Tirupati)",
  "అమరావతి (Amaravati)",
  "వరంగల్ (Warangal)",
  "గుంటూరు (Guntur)",
  "నెల్లూరు (Nellore)",
  "కాకినాడ (Kakinada)",
  "ఇతర ప్రాంతం (Other Area)"
];

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { lang } = useLanguage();
  const [selectedArea, setSelectedArea] = useState<string>("విశాఖపట్నం (Visakhapatnam)");
  const [selectedCategory, setSelectedCategory] = useState<PostCategoryType | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCategory = (catId: PostCategoryType) => {
    setSelectedCategory(catId);
    setSuccessMessage(null);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCategory || submitting) return;

    setSubmitting(true);
    const newPost = {
      id: `post_${Date.now()}`,
      category: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      price: price.trim() || undefined,
      contact: contactNumber.trim() || undefined,
      area: selectedArea,
      created_at: new Date().toISOString()
    };

    try {
      // Save locally
      const existing = JSON.parse(localStorage.getItem("vaartanow_user_classifieds") || "[]");
      localStorage.setItem("vaartanow_user_classifieds", JSON.stringify([newPost, ...existing]));

      // Optionally save to Supabase if connected
      if (supabase) {
        try {
          await supabase.from("properties").insert({
            title: newPost.title,
            property_type: newPost.category,
            location: newPost.area,
            price: newPost.price || "Contact for price",
            contact_phone: newPost.contact
          });
        } catch (e) {
          console.warn("Supabase insert error:", e);
        }
      }

      setSuccessMessage("మీ పోస్ట్ విజయవంతంగా ప్రచురించబడింది!");
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedCategory(null);
        setTitle("");
        setDescription("");
        setPrice("");
        setContactNumber("");
        onClose();
      }, 2000);
    } catch (err) {
      console.warn("Post submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryObj = POST_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden">
        
        {/* Header (Matching Screenshot Exactly) */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 p-4 sm:p-5 bg-[hsl(var(--card))] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedCategory) {
                  setSelectedCategory(null);
                } else {
                  onClose();
                }
              }}
              className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[hsl(var(--foreground))] tracking-tight">
                స్థానిక పోస్ట్ సృష్టించండి
              </h2>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                కొన్ని సెకన్లలో మొత్తం నగరానికి చేరుకోండి
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* Area Selector */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-3.5 space-y-1.5">
            <label className="text-xs font-black text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
              <MapPin className="size-3.5 text-blue-600 dark:text-blue-400" />
              మీ ఏరియా ఎంచుకోండి (Select Area)
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2 px-3 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {ANDHRA_LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* SUCCESS MESSAGE BANNER */}
          {successMessage && (
            <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center font-black text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 animate-in zoom-in-95">
              <Check className="size-4 text-emerald-500" />
              {successMessage}
            </div>
          )}

          {/* CATEGORY LIST (8 CATEGORIES ORDERED TOP TO BOTTOM MATCHING REQUEST) */}
          {!selectedCategory ? (
            <div className="space-y-2.5">
              {POST_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] transition-all duration-200 flex items-center justify-between gap-3 shadow-xs group cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`size-11 shrink-0 rounded-2xl ${cat.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                        <IconComponent className={`size-5.5 ${cat.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[hsl(var(--foreground))] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] leading-snug line-clamp-1">
                          {cat.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="size-4.5 text-[hsl(var(--muted-foreground))] group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          ) : (
            /* SELECTED CATEGORY FORM */
            <form onSubmit={handleSubmitPost} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 rounded-2xl bg-[hsl(var(--muted))] p-3 border border-[hsl(var(--border))]">
                {currentCategoryObj && (
                  <>
                    <currentCategoryObj.icon className={`size-5 ${currentCategoryObj.iconColor}`} />
                    <span className="text-xs font-black text-[hsl(var(--foreground))]">
                      {currentCategoryObj.title}
                    </span>
                  </>
                )}
              </div>

              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  శీర్షిక / వివరణ శీర్షిక (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    selectedCategory === "news" ? "ఉదా: మీ ఏరియా వార్త శీర్షిక..." :
                    selectedCategory === "complaint" ? "ఉదా: డ్రైనేజీ రోడ్డు సమస్య వివరాలు..." :
                    selectedCategory === "job" ? "ఉదా: స్థానిక షాపులో బిల్లింగ్ ఆపరేటర్ కావాలి..." :
                    selectedCategory === "mobile" ? "ఉదా: iPhone 13 / Samsung Galaxy గుడ్ కండిషన్..." :
                    selectedCategory === "vehicle" ? "ఉదా: Hero Splendor 2022 మోడల్ అమ్మకానికి..." :
                    selectedCategory === "property" ? "ఉదా: 2BHK ఇల్లు అద్దెకు (మధురవాడ)..." :
                    selectedCategory === "agriculture" ? "ఉదా: బియ్యం 25kg బస్తా / వేరుశనగ పంట..." :
                    "ఉదా: ఎలక్ట్రీషియన్ / ప్లంబర్ సేవలు అవసరం..."
                  }
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price / Salary Field if applicable */}
              {(selectedCategory === "job" || selectedCategory === "mobile" || selectedCategory === "vehicle" || selectedCategory === "property" || selectedCategory === "agriculture" || selectedCategory === "service") && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                    {selectedCategory === "job" ? "జీతం (Salary / Month)" : "ధర (Price / Rates)"}
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="ఉదా: ₹15,000 / Negotiation"
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Phone Contact */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--foreground))] flex items-center gap-1">
                  <Phone className="size-3.5 text-emerald-500" />
                  ఫోన్ / వాట్సాప్ నంబర్ (Contact Number)
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="ఉదా: 9876543210"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  పూర్తి వివరాలు (Full Description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="వివరాలు స్పష్టంగా రాయండి..."
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="flex-1 py-2.5 rounded-full border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                >
                  వెనుకకు (Back)
                </button>

                <button
                  type="submit"
                  disabled={!title.trim() || submitting}
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  సమర్పించండి (Post Now)
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
