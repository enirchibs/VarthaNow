import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  MessageCircle, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  X, 
  User, 
  ArrowLeft,
  CheckCircle,
  Tag,
  Camera,
  Image as ImageIcon,
  Gift
} from "lucide-react";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";

export interface MahilaItem {
  id: string;
  seller_name: string;
  category: string;
  title: string;
  description: string;
  price: string;
  locality: string;
  contact: string;
  image: string;
  created_at: string;
}

const MAHILA_CATEGORIES = [
  { 
    id: "all", 
    label: "🌸 అన్నీ (All Products & Services)", 
    icon: "🌸", 
    subhead: "అన్ని మహిళా ఉత్పత్తులు & హోమ్ బిజినెస్ సేవలు" 
  },
  { 
    id: "food_catering", 
    label: "🍲 ఇంటి తయారీ ఆహారం & క్యాటరింగ్", 
    icon: "🍲", 
    subhead: "అప్పడాలు, వడియాలు, పచ్చళ్లు, కారం పొడులు, పిండి వంటలు, స్నాక్స్, స్వీట్లు, ఇంటి భోజనం, హోమ్ కేటరింగ్",
    subItems: ["అప్పడాలు & వడియాలు", "ఇంటి పచ్చళ్లు", "కారం పొడులు", "పిండి వంటలు & స్నాక్స్", "ఇంటి స్వీట్లు", "ఇంటి భోజనం & హోమ్ కేటరింగ్"]
  },
  { 
    id: "boutique_handmade", 
    label: "👗 బట్టలు, బుటిక్ & హ్యాండ్మేడ్", 
    icon: "👗", 
    subhead: "చీరలు, డ్రెస్సులు, బ్లౌజులు, కుర్తీలు, పిల్లల దుస్తులు, బుటిక్ ఉత్పత్తులు, టైలరింగ్, బ్లౌజ్ స్టిచింగ్, ఎంబ్రాయిడరీ, హ్యాండ్మేడ్ వస్తువులు",
    subItems: ["పట్టు చీరలు & డ్రెస్సులు", "కుర్తీలు & బ్లౌజులు", "పిల్లల దుస్తులు", "బుటిక్ ఉత్పత్తులు", "టైలరింగ్ & ఎంబ్రాయిడరీ", "హ్యాండ్మేడ్ వస్తువులు"]
  },
  { 
    id: "beauty_services", 
    label: "💄 బ్యూటీ & వ్యక్తిగత సేవలు", 
    icon: "💄", 
    subhead: "బ్యూటీ పార్లర్, మేకప్, మెహందీ, హెయిర్ & బ్యూటీ services",
    subItems: ["బ్యూటీ పార్లర్ సేవలు", "బ్రైడల్ మేకప్", "మెహందీ డిజైన్", "హెయిర్ & బ్యూటీ కేర్"]
  },
  { 
    id: "home_decor", 
    label: "🧺 ఇంటి & అలంకరణ ఉత్పత్తులు", 
    icon: "🧺", 
    subhead: "కొవ్వొత్తులు, సబ్బులు, బ్యాగులు, హోమ్ డెకర్, హ్యాండ్క్రాఫ్ట్స్",
    subItems: ["హ్యాండ్‌మేడ్ సబ్బులు & కొవ్వొత్తులు", "ఫ్యాన్సీ బ్యాగులు", "హోమ్ డెకర్ & హ్యాండ్క్రాఫ్ట్స్"]
  },
  { 
    id: "women_farmers", 
    label: "🌾 మహిళా రైతు ఉత్పత్తులు", 
    icon: "🌾", 
    subhead: "కూరగాయలు, పండ్లు, పూలు, తేనె, పసుపు, మసాలాలు, ఆర్గానిక్ ఉత్పత్తులు",
    subItems: ["ఫ్రెష్ కూరగాయలు & పండ్లు", "పూలు & ఆర్గానిక్ తేనె", "స్వచ్ఛమైన పసుపు & మసాలాలు", "సేంద్రీయ ఉత్పత్తులు"]
  },
  { 
    id: "services_classes", 
    label: "📚 మహిళల సేవలు & తరగతులు", 
    icon: "📚", 
    subhead: "ట్యూషన్, కుకింగ్ క్లాసులు, క్రాఫ్ట్ క్లాసులు, బ్యూటీ ట్రైనింగ్, ఇతర నైపుణ్య సేవలు",
    subItems: ["హోమ్ ట్యూషన్స్", "కుకింగ్ & బేకింగ్ క్లాసులు", "క్రాఫ్ట్ క్లాసులు", "బ్యూటీ ట్రైనింగ్"]
  },
  { 
    id: "women_businesses", 
    label: "💼 మహిళా వ్యాపారాలు", 
    icon: "💼", 
    subhead: "హోమ్ బిజినెస్, రీసెల్లింగ్, చిన్న వ్యాపారాలు, ఇతర ఉత్పత్తులు & సేవలు",
    subItems: ["హోమ్ బిజినెస్ ఉత్పత్తులు", "రీసెల్లింగ్ వ్యాపారాలు", "చిన్న తరహా ఉత్పత్తులు & సేవలు"]
  }
];

const INITIAL_MAHILA_ITEMS: MahilaItem[] = [
  {
    id: "m-1",
    seller_name: "లక్ష్మి దేవి (Lakshmi Devi)",
    category: "food_catering",
    title: "స్వచ్ఛమైన కొత్త ఆవకాయ పచ్చడి (Traditional Avakaya Pickle)",
    description: "అప్పడాలు, వడియాలు, పచ్చళ్లు, కారం పొడులు. నూనె లేకుండా సంప్రదాయ పద్ధతిలో తయారుచేసిన స్వచ్ఛమైన ఆంధ్రా ఆవకాయ పచ్చడి.",
    price: "₹350 / kg",
    locality: "మధురవాడ (Madhurawada, Vizag)",
    contact: "9876543210",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "m-2",
    seller_name: "సునీత (Sunitha Home Foods)",
    category: "food_catering",
    title: "నల్లకారం, కందిపొడి & ఇంటి పిండి వంటలు (Authentic Karam Podi & Snacks)",
    description: "కారం పొడులు, పిండి వంటలు, స్నాక్స్, స్వీట్లు. రోటిలో దంచిన ఘుమఘుమలాడే పప్పుల కారం పొడి & ఇడ్లీ కారం పొడి.",
    price: "₹180 / 500g",
    locality: "గాజువాక (Gajuwaka, Vizag)",
    contact: "9876543211",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "m-3",
    seller_name: "రాధా కుమారి (Radha Creations)",
    category: "boutique_handmade",
    title: "మంగళగిరి పట్టు చీరలు & డ్రెస్సులు (Handcrafted Mangalagiri Sarees)",
    description: "చీరలు, డ్రెస్సులు, బ్లౌజులు, కుర్తీలు, బుటిక్ ఉత్పత్తులు. నేరుగా చేనేత కార్మికుల వద్ద నుండి స్వచ్ఛమైన పట్టు చీరలు.",
    price: "₹2,500",
    locality: "ఎంవీపీ కాలనీ (MVP Colony, Vizag)",
    contact: "9876543212",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "m-4",
    seller_name: "శ్రీలత (Sreelatha Tailors & Embroidery)",
    category: "boutique_handmade",
    title: "మహిళల డిజైనర్ బ్లౌజ్ స్టిచింగ్ & ఎంబ్రాయిడరీ (Blouse Stitching)",
    description: "టైలరింగ్, బ్లౌజ్ స్టిచింగ్, ఎంబ్రాయిడరీ, హ్యాండ్మేడ్ వస్తువులు. మగ్గం వర్క్ & ఫ్యాన్సీ బ్లౌజ్ స్టిచింగ్ తక్కువ ధరలో డోర్ డెలివరీతో.",
    price: "₹400 ప్రారంభం",
    locality: "విజయవాడ (Vijayawada)",
    contact: "9876543213",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "m-5",
    seller_name: "అనురాధ (Anu Beauty & Spa)",
    category: "beauty_services",
    title: "హోమ్ బ్యూటీ పార్లర్ & బ్రైడల్ మేకప్ సేవలు (Beauty & Makeup Services)",
    description: "బ్యూటీ పార్లర్, మేకప్, మెహందీ, హెయిర్ & బ్యూటీ services. మహిళల డోర్‌స్టెప్ బ్యూటీ సర్వీసెస్ & బ్రైడల్ మేకప్.",
    price: "₹500 ప్రారంభం",
    locality: "గచ్చిబౌలి (Gachibowli, Hyderabad)",
    contact: "9876543214",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "m-6",
    seller_name: "పద్మావతి (Padma Tuitions & Classes)",
    category: "services_classes",
    title: "1 నుండి 10వ తరగతి హోమ్ ట్యూషన్స్ & నైపుణ్య తరగతులు",
    description: "ట్యూషన్, కుకింగ్ క్లాసులు, క్రాఫ్ట్ క్లాసులు, బ్యూటీ ట్రైనింగ్, ఇతర నైపుణ్య సేవలు. మ్యాథ్స్, సైన్స్ & ఇంగ్లీష్ ప్రత్యేక శ్రద్ధతో.",
    price: "₹1,500 / month",
    locality: "హైదరాబాద్ (Hyderabad)",
    contact: "9876543215",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  }
];

export function MahilaMarketPage() {
  const [items, setItems] = useState<MahilaItem[]>(() => {
    try {
      const saved = localStorage.getItem("vaartanow_mahila_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MAHILA_ITEMS;
  });

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("post") === "true") {
      setIsPostModalOpen(true);
    }
  }, [location.search]);

  const [step, setStep] = useState<1 | 2>(1);
  const [sellerName, setSellerName] = useState<string>("");
  const [category, setCategory] = useState<string>("food_catering");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [locality, setLocality] = useState<string>("మధురవాడ (Madhurawada)");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [offerDiscount, setOfferDiscount] = useState<string>("");
  const [freeBonusItems, setFreeBonusItems] = useState<string>("");
  const [isFree, setIsFree] = useState<boolean>(false);

  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");
  const [loadingSMS, setLoadingSMS] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCat !== "all" && item.category !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSeller = item.seller_name.toLowerCase().includes(q);
        const matchesLoc = item.locality.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSeller && !matchesLoc) return false;
      }
      return true;
    });
  }, [items, selectedCat, searchQuery]);

  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim() || !title.trim() || !price.trim() || !phone.trim()) {
      setErrorMsg("దయచేసి అన్ని అవసరమైన వివరాలను భర్తీ చేయండి (* Required)");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("దయచేసి 10-అంకెల వాట్సాప్ మొబైల్ నంబర్ ఇవ్వండి");
      return;
    }

    setLoadingSMS(true);
    setErrorMsg("");

    const res = await sendSMSOTP(cleanPhone);
    setLoadingSMS(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setStep(2);
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  const handleVerifyAndPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6-అంకెల OTP కోడ్‌ను నమోదు చేయండి");
      return;
    }

    setLoadingSMS(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(phone, otp, sellerName);

    if (!verifyRes.success) {
      setLoadingSMS(false);
      setErrorMsg(verifyRes.error || "OTP తప్పుగా ఉంది.");
      return;
    }

    const defaultCover = "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80";

    const newItem: MahilaItem = {
      id: `mahila-${Date.now()}`,
      seller_name: sellerName.trim(),
      category,
      title: title.trim(),
      description: description.trim() || "స్వచ్ఛమైన హోమ్‌మేడ్ ఉత్పత్తి.",
      price: price.startsWith("₹") ? price.trim() : `₹${price.trim()}`,
      locality: locality.trim(),
      contact: phone.replace(/\D/g, ""),
      image: imageUrl.trim() || defaultCover,
      created_at: new Date().toISOString()
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem("vaartanow_mahila_items", JSON.stringify(updated));

    setLoadingSMS(false);
    setIsPostModalOpen(false);
    setStep(1);
    setTitle("");
    setPrice("");
    setDescription("");
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-16">
      <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

        {/* Hero Section Banner */}
        <div className="rounded-[2.2rem] bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black backdrop-blur-md">
              🌸 VaartaNow Women Entrepreneur Portal
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              మహిళా మార్కెట్ (Mahila Market)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-rose-100 leading-relaxed">
              ఇంటి పచ్చళ్ళు, కారం పొడి, పసుపు, పిండి వంటలు, స్వీట్లు, హ్యాండ్మేడ్ వస్తువులు, చీరలు, టైలరింగ్ & బ్యూటీ సేవలు — మహిళా వ్యాపారుల డిజిటల్ వేదిక!
            </p>
          </div>

          <div className="z-10">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white text-rose-700 hover:bg-rose-50 px-6 py-3.5 text-xs sm:text-sm font-black transition-all shadow-xl active:scale-95 cursor-pointer min-h-[46px]"
            >
              <PlusCircle className="size-5 text-rose-700" />
              + పోస్ట్ చేయండి (Post Your Product)
            </button>
          </div>
        </div>

        {/* Categories Filter Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MAHILA_CATEGORIES.map((cat) => {
              const isSel = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`rounded-full px-4 py-2.5 text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95 ${
                    isSel
                      ? "bg-rose-600 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="వెతకండి (పచ్చళ్ళు, కారం పొడి, చీరలు, టైలరింగ్, ట్యూషన్స్)..."
              className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-sm min-h-[46px]"
            />
          </div>
        </div>

        {/* 7 BROAD CATEGORIES VISUAL SHOWCASE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-black text-rose-600 uppercase tracking-wider flex items-center gap-2">
            <span>🌸 మహిళా మార్కెట్ — 7 ముఖ్యమైన విభాగాలు (7 Broad Categories)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MAHILA_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCat === cat.id
                    ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/50"
                    : "bg-slate-50 border-slate-200 hover:border-rose-400 hover:bg-rose-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">{cat.label}</h4>
                </div>

                <p className="text-[10px] text-slate-600 font-semibold line-clamp-2 leading-relaxed">
                  {cat.subhead}
                </p>

                {cat.subItems && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cat.subItems.slice(0, 3).map((sub, sIdx) => (
                      <span key={sIdx} className="text-[9px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                        {sub}
                      </span>
                    ))}
                    {cat.subItems.length > 3 && (
                      <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full">
                        +{cat.subItems.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const cleanPhone = item.contact.replace(/\D/g, "");
            const whatsappMsg = `Hi ${item.seller_name}, I saw your item '${item.title}' (${item.price}) on VaartaNow Mahila Market and want to buy.`;
            const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <div
                key={item.id}
                className="rounded-[1.8rem] border border-slate-200 bg-white text-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase shadow-sm">
                    🌸 మహిళా వ్యాపారి
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-rose-600">
                        {item.price}
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1">
                        <MapPin className="size-3.5 text-rose-500" />
                        {item.locality.split(" ")[0]}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 pt-1">
                      <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                      <span className="truncate">👤 {item.seller_name} <strong className="text-emerald-600">✓ Verified</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex-1 py-2.5 rounded-full bg-[#16a34a] hover:bg-emerald-600 text-white text-xs font-black transition flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Phone className="size-4" />
                      <span>కాల్ చేయండి</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <MessageCircle className="size-4" />
                      <span>వాట్సాప్</span>
                    </a>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* 2-STEP LIVE SMS VERIFIED POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
                  <span>+ మహిళా మార్కెట్‌లో పోస్ట్ చేయండి</span>
                  <span className="text-xs text-slate-500 font-normal hidden sm:inline">(Women Market Ad)</span>
                </h3>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                  దశ {step}/2 (Step {step} of 2)
                </span>
              </div>

              <button
                onClick={() => setIsPostModalOpen(false)}
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

            {/* STEP 1: DETAILS */}
            {step === 1 && (
              <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
                
                {/* Field 1: మీ పూర్తి పేరు */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1">
                    <User className="size-3.5 text-rose-600" />
                    <span>మహిళా పారిశ్రామికవేత్త పేరు (Entrepreneur Name)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="ఉదా: లక్ష్మి దేవి (e.g. Lakshmi Devi)"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>

                {/* Field 2 & 3: Category & Locality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">
                      విభాగం (Category Dropdown) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition"
                    >
                      <option value="food_catering">🍲 ఇంటి తయారీ ఆహారం & క్యాటరింగ్</option>
                      <option value="boutique_handmade">👗 బట్టలు, బుటిక్ & హ్యాండ్మేడ్</option>
                      <option value="beauty_services">💄 బ్యూటీ & వ్యక్తిగత సేవలు</option>
                      <option value="home_decor">🧺 ఇంటి & అలంకరణ ఉత్పత్తులు</option>
                      <option value="women_farmers">🌾 మహిళా రైతు ఉత్పత్తులు</option>
                      <option value="services_classes">📚 మహిళల సేవలు & తరగతులు</option>
                      <option value="women_businesses">💼 మహిళా వ్యాపారాలు</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">
                      ప్రాంతం (Locality Dropdown) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition"
                    >
                      <option value="మధురవాడ (Madhurawada)">మధురవాడ (Madhurawada)</option>
                      <option value="గాజువాక (Gajuwaka)">గాజువాక (Gajuwaka)</option>
                      <option value="ఎంవీపీ కాలనీ (MVP Colony)">ఎంవీపీ కాలనీ (MVP Colony)</option>
                      <option value="విశాఖపట్నం (Visakhapatnam)">విశాఖపట్నం (Visakhapatnam)</option>
                      <option value="హైదరాబాద్ (Hyderabad)">హైదరాబాద్ (Hyderabad)</option>
                      <option value="విజయవాడ (Vijayawada)">విజయవాడ (Vijayawada)</option>
                      <option value="గుంటూరు (Guntur)">గుంటూరు (Guntur)</option>
                      <option value="తిరుపతి (Tirupati)">తిరుపతి (Tirupati)</option>
                    </select>
                  </div>
                </div>

                {/* Field 4: Product / Service Title */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800">
                    ఉత్పత్తి / సేవ పేరు (Ad Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="మీరు ఏమి అమ్ముతున్నారు? ఉదా: ఆవకాయ పచ్చడి 1kg లేదా Pattu Saree"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>

                {/* Field 5: Description */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800">
                    వివరణ (Description Textarea)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="ఉత్పత్తి తయారీ విధానం, క్వాలిటీ మరియు ఆర్డర్ సూచనల పూర్తి వివరాలు వ్రాయండి..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>

                {/* Fields 6 & 7: Optional Perks Box */}
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
                      <Tag className="size-3 text-amber-600" />
                      ఆఫర్ / తగ్గింపు Tag <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={offerDiscount}
                      onChange={(e) => setOfferDiscount(e.target.value)}
                      placeholder="ఉదా: 20% OFF లేదా పండుగ స్పెషల్"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                      <Gift className="size-3 text-emerald-600" />
                      ఉచిత బోనస్ / శాంపిల్ <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={freeBonusItems}
                      onChange={(e) => setFreeBonusItems(e.target.value)}
                      placeholder="ఉదా: ఉచిత స్వీట్ శాంపిల్ / కవర్ ఉచితం"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Field 8: Photo Upload */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    ఫోటో లింక్ / Camera Input <span className="text-slate-500 font-normal">(Photo Upload)</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/60 hover:bg-rose-100/70 transition cursor-pointer group shadow-sm">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <Camera className="size-6 text-rose-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-[11px] font-black text-rose-700">కెమెరా తెరవండి (Open Camera)</span>
                    </label>

                    <label className="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 transition cursor-pointer group shadow-sm">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <ImageIcon className="size-6 text-emerald-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-[11px] font-black text-emerald-700">గ్యాలరీ (Gallery)</span>
                    </label>
                  </div>

                  {imageUrl ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 mt-2 shadow-sm">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-black transition cursor-pointer"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 mt-1 transition"
                    />
                  )}
                </div>

                {/* Field 9 & 10: Price & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800 flex items-center justify-between">
                      <span>ధర (Price in ₹) <span className="text-red-500">*</span></span>
                      <label className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFree}
                          onChange={(e) => setIsFree(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        ఉచితం (Free Demo)
                      </label>
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isFree}
                      placeholder={isFree ? "ఉచితం (Free)" : "ఉదా: 350"}
                      required={!isFree}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">
                      సంప్రదించే సంఖ్య (Contact Number - WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingSMS}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:via-pink-700 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-rose-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
                >
                  {loadingSMS ? "SMS OTP పంపుతున్నాము..." : "కొనసాగించు ➔ Live SMS OTP పొందండి"}
                </button>

              </form>
            )}

            {/* STEP 2: SMS OTP VERIFICATION */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndPost} className="space-y-4 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>← వెనుకకు (Back to Details)</span>
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
                    6-అంకెల OTP కోడ్‌ను ఇక్కడ నమోదు చేయండి
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
                  disabled={loadingSMS}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
                >
                  {loadingSMS ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & పోస్ట్ ప్రచురించు"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
