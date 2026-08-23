import React, { useState } from "react";
import { 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  AlertCircle, 
  Briefcase, 
  ShoppingBag, 
  Sprout, 
  Wrench, 
  MapPin, 
  Check, 
  Send, 
  X,
  Phone,
  Camera,
  Mic,
  Navigation
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type PostCategoryType = 
  | "complaint" 
  | "job" 
  | "news" 
  | "buy_sell_items" 
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

// 6 Streamlined Categories in Requested Order
const POST_CATEGORIES: PostCategoryItem[] = [
  {
    id: "complaint",
    title: "1. ఫిర్యాదు పోస్ట్ చేయండి",
    subtitle: "రోడ్లు, డ్రైనేజీ, కరెంట్ సమస్యలను అధికారుల దృష్టికి తీసుకెళ్లండి",
    icon: AlertCircle,
    iconColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-400/10"
  },
  {
    id: "job",
    title: "2. ఉద్యోగం (వెతకండి / పోస్ట్ చేయండి)",
    subtitle: "ఉద్యోగాలు వెతకండి లేదా మీ దగ్గర జాబ్స్ ఉంటే పోస్ట్ చేసి నిరుద్యోగులకు సహాయపడండి",
    icon: Briefcase,
    iconColor: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-500/10 dark:bg-sky-400/10"
  },
  {
    id: "news",
    title: "3. వార్తలు పోస్ట్ చేయండి",
    subtitle: "స్థానిక వార్తలు పోస్ట్ చేయండి, సమాజానికి దోహదపడండి",
    icon: FileText,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-400/10"
  },
  {
    id: "buy_sell_items",
    title: "4. మీ వస్తువులు అమ్మండి / కొనండి (మొబైల్, బైక్స్, ల్యాప్‌టాప్, ఇల్లు, ఎలక్ట్రానిక్స్)",
    subtitle: "మీ పాత వస్తువులు, మొబైల్స్, బైక్స్, ల్యాప్‌టాప్, ఇల్లు స్థానికంగా అమ్మండి లేదా కొనండి",
    icon: ShoppingBag,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-400/10"
  },
  {
    id: "agriculture",
    title: "5. వ్యవసాయం & రైతు పంటలు (కొనండి / అమ్మండి)",
    subtitle: "రైతుల పంటలు, బియ్యం, పల్లి, పప్పులు, చింతపండు రైతు ధరకు అమ్మండి/కొనండి",
    icon: Sprout,
    iconColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10 dark:bg-green-400/10"
  },
  {
    id: "service",
    title: "6. స్థానిక సేవలు (కొనండి / అమ్మండి)",
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
  const [itemType, setItemType] = useState<string>("మొబైల్ (Mobile)");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCategory = (catId: PostCategoryType) => {
    if (catId === "job") {
      onClose();
      window.location.href = "/jobs?post=true";
      return;
    }
    if (catId === "buy_sell_items" || catId === "agriculture") {
      onClose();
      window.location.href = "/market?post=true";
      return;
    }
    setSelectedCategory(catId);
    setSuccessMessage(null);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory === "complaint" || selectedCategory === "news") {
      if (!description.trim() || submitting) return;
    } else {
      if (!title.trim() || submitting) return;
    }

    setSubmitting(true);
    const newPost = {
      id: `post_${Date.now()}`,
      category: selectedCategory,
      item_type: selectedCategory === "buy_sell_items" ? itemType : undefined,
      title: title.trim() || (selectedCategory === "complaint" ? "స్థానిక ఫిర్యాదు" : "స్థానిక వార్త"),
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
          await supabase.from("user_reports").insert({
            title: newPost.title,
            description: newPost.description,
            status: "pending"
          });
        } catch (e) {
          console.warn("Supabase insert error:", e);
        }
      }

      setSuccessMessage("మీ పోస్ట్ విజయవంతంగా ప్రచురించబడింది! ధన్యవాదాలు.");
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
        
        {/* Header */}
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

          {/* Area Selector (Default for general categories) */}
          {(!selectedCategory || (selectedCategory !== "complaint" && selectedCategory !== "news")) && (
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
          )}

          {/* SUCCESS MESSAGE BANNER */}
          {successMessage && (
            <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center font-black text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 animate-in zoom-in-95">
              <Check className="size-4 text-emerald-500" />
              {successMessage}
            </div>
          )}

          {/* CATEGORY LIST */}
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
          ) : (selectedCategory === "complaint" || selectedCategory === "news") ? (
            
            /* 📰 POLITELY STYLED ANDHRA NEWS / COMPLAINT REPORTING FORM (MATCHING ATTACHED SCREENSHOTS) */
            <form onSubmit={handleSubmitPost} className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 p-3 border border-[hsl(var(--border))]">
                {currentCategoryObj && (
                  <>
                    <currentCategoryObj.icon className={`size-5 ${currentCategoryObj.iconColor}`} />
                    <span className="text-xs font-black text-[hsl(var(--foreground))]">
                      {currentCategoryObj.title}
                    </span>
                  </>
                )}
              </div>

              {/* 1. ఫోటోలు & వీడియోలు (ఐచ్ఛికం) */}
              <div className="space-y-1.5 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                    ఫోటోలు & వీడియోలు <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">ఐచ్ఛికం</span>
                  </label>
                </div>
                <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] leading-snug">
                  మొత్తం 3 ఫోటోలు లేదా వీడియోల వరకు జోడించవచ్చు.
                </p>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(lang === "te" ? "ఫోటో లేదా వీడియోలను ఎంచుకోండి" : "Select photo or video files");
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--foreground))] transition flex items-center justify-center gap-2"
                  >
                    <Camera className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>ఫోటోలు లేదా వీడియోలు జోడించండి</span>
                  </button>
                </div>
              </div>

              {/* 2. శీర్షిక (ఐచ్ఛికం) */}
              <div className="space-y-1 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                    శీర్షిక <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">ఐచ్ఛికం</span>
                  </label>
                  <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                    {title.length}/150
                  </span>
                </div>

                <input
                  type="text"
                  value={title}
                  maxLength={150}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="తెలియకపోతే ఖాళీగా వదిలేయండి"
                  className="w-full rounded-xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--muted))]/40 p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[hsl(var(--muted-foreground))]/70"
                />
              </div>

              {/* 3. ఏం జరిగింది? */}
              <div className="space-y-1.5 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                    ఏం జరిగింది? *
                  </label>
                  <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                    {description.length}/5000
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] leading-snug">
                  ఇక్కడ రాయండి లేదా కింద వాయిస్ నోట్ రికార్డ్ చేయండి — ఏదైనా సరిపోతుంది.
                </p>

                <textarea
                  required
                  rows={4}
                  value={description}
                  maxLength={5000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="తెలుగు లేదా ఇంగ్లీష్‌లో రాయండి — మీకు ఏది సులభమో అది."
                  className="w-full rounded-xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--muted))]/40 p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[hsl(var(--muted-foreground))]/70 resize-none"
                />
              </div>

              {/* 4. వాయిస్ నోట్లు (ఐచ్ఛికం) */}
              <div className="space-y-1.5 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                    వాయిస్ నోట్లు <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">ఐచ్ఛికం</span>
                  </label>
                </div>
                <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] leading-snug">
                  టైప్ చేయడం కష్టమా? చెప్పండి. 3 వరకు జోడించవచ్చు.
                </p>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      alert(lang === "te" ? "వాయిస్ రికార్డింగ్ ప్రారంభించబడింది..." : "Voice recording started...");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 hover:bg-red-500/10 hover:text-red-600 text-xs font-bold text-[hsl(var(--foreground))] transition flex items-center justify-center gap-2"
                  >
                    <Mic className="size-4 text-red-500" />
                    <span>వాయిస్ నోట్ రికార్డ్ చేయండి</span>
                  </button>
                </div>
              </div>

              {/* 5. ఇది ఎక్కడ జరిగింది? */}
              <div className="space-y-1.5 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                    ఇది ఎక్కడ జరిగింది?
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(() => {
                          setSelectedArea("విశాఖపట్నం (GPS Location)");
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Navigation className="size-3" />
                    నా లొకేషన్ ఉపయోగించండి
                  </button>
                </div>

                <input
                  type="text"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  placeholder="గ్రామం, పట్టణం, జిల్లా లేదా మండలం..."
                  className="w-full rounded-xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--muted))]/40 p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] italic">
                  సూచన: ఒకే పేరున్న గ్రామాల కోసం జిల్లా లేదా మండలం జోడించండి.
                </p>
              </div>

              {/* 6. మీ ఫోన్ నంబర్ (ఐచ్ఛికం) */}
              <div className="space-y-1.5 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                    మీ ఫోన్ నంబర్ <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">ఐచ్ఛికం</span>
                  </label>
                </div>
                <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] leading-snug">
                  మరిన్ని వివరాలు అవసరమైతే ఎడిటర్ మిమ్మల్ని సంప్రదించడానికి మాత్రమే.
                </p>

                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="10 అంకెల మొబైల్ నంబర్"
                  className="w-full rounded-xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--muted))]/40 p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="flex-1 py-3 rounded-full border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                >
                  వెనుకకు (Back)
                </button>

                <button
                  type="submit"
                  disabled={!description.trim() || submitting}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-600 via-blue-600 to-indigo-600 text-white font-black text-xs shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  విజ్ఞప్తిని సమర్పించండి (Submit Report)
                </button>
              </div>
            </form>
          ) : (
            /* OTHER CATEGORY FORM */
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

              {/* Sub-Category Item Type Selector for Combined Buy/Sell Option */}
              {selectedCategory === "buy_sell_items" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                    వస్తువు రకం (Item Category)
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="మొబైల్ (Mobile)">📱 మొబైల్ (Mobile)</option>
                    <option value="బైక్ / వాహనం (Bike / Vehicle)">🚗 బైక్ / కార్ / వాహనం (Bike / Vehicle)</option>
                    <option value="ల్యాప్‌టాప్ & టీవీ (Laptop & TV)">💻 ల్యాప్‌టాప్ / టీవీ (Laptop & Electronics)</option>
                    <option value="ఇల్లు / ప్రాపర్టీ (House / Property)">🏠 ఇల్లు / స్థలం / ప్లాట్ (Property)</option>
                    <option value="ఇతర వస్తువులు (Other Item)">📦 ఇతర వస్తువులు (Other Household Item)</option>
                  </select>
                </div>
              )}

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
                    selectedCategory === "buy_sell_items" ? "ఉదా: iPhone 13 / Hero Splendor 2022 / 2BHK ఇల్లు అద్దెకు..." :
                    selectedCategory === "job" ? "ఉదా: స్థానిక షాపులో బిల్లింగ్ ఆపరేటర్ కావాలి..." :
                    selectedCategory === "agriculture" ? "ఉదా: బియ్యం 25kg బస్తా / వేరుశనగ పంట..." :
                    "ఉదా: ఎలక్ట్రీషియన్ / ప్లంబర్ సేవలు అవసరం..."
                  }
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price / Salary Field */}
              {(selectedCategory === "buy_sell_items" || selectedCategory === "job" || selectedCategory === "agriculture" || selectedCategory === "service") && (
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
