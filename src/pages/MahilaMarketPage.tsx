import React, { useState, useEffect, useMemo } from "react";
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
  Tag
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
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);

  // Form State (2-Step Live SMS Verified Post Modal)
  const [step, setStep] = useState<1 | 2>(1);
  const [sellerName, setSellerName] = useState<string>("");
  const [category, setCategory] = useState<string>("food_catering");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [locality, setLocality] = useState<string>("మధురవాడ (Madhurawada)");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // OTP State
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

  // Handle Step 1 Proceed
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

  // Handle Step 2 Verify OTP & Publish Listing
  const handleVerifyOTPAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6-అంకెల OTP కోడ్‌ను నమోదు చేయండి");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(phone, otp, sellerName);

    if (!verifyRes.success) {
      setLoading(false);
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

    setLoading(false);
    setIsPostModalOpen(false);
    setStep(1);
    setTitle("");
    setPrice("");
    setDescription("");
  };

  return (
    <div className="bg-[#030712] text-white min-h-screen pb-16">
      <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

        {/* Hero Section Banner */}
        <div className="rounded-[2.2rem] bg-gradient-to-r from-pink-700 via-rose-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
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

        {/* 11 Specialized Categories Filter Bar */}
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
                      : "bg-[#111827] border border-[#1f2937] text-gray-300 hover:bg-[#1f2937]"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="వెతకండి (పచ్చళ్ళు, కారం పొడి, చీరలు, టైలరింగ్, ట్యూషన్స్)..."
              className="w-full rounded-full border border-[#1f2937] bg-[#111827] py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[46px]"
            />
          </div>
        </div>

        {/* 🌸 7 BROAD CATEGORIES VISUAL SHOWCASE WITH SUB-CATEGORIES */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-3xl p-4 sm:p-6 space-y-4">
          <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <span>🌸 మహిళా మార్కెట్ — 7 ముఖ్యమైన విభాగాలు (7 Broad Categories)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MAHILA_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCat === cat.id
                    ? "bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50"
                    : "bg-[#030712] border-[#1f2937] hover:border-rose-500/50 hover:bg-[#111827]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h4 className="text-xs font-black text-white leading-tight">{cat.label}</h4>
                </div>

                <p className="text-[10px] text-gray-400 font-semibold line-clamp-2 leading-relaxed">
                  {cat.subhead}
                </p>

                {cat.subItems && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cat.subItems.slice(0, 3).map((sub, sIdx) => (
                      <span key={sIdx} className="text-[9px] font-bold bg-[#1f2937] text-rose-200 px-2 py-0.5 rounded-full border border-rose-900/30">
                        {sub}
                      </span>
                    ))}
                    {cat.subItems.length > 3 && (
                      <span className="text-[9px] font-bold bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded-full">
                        +{cat.subItems.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Cards Grid (3 Columns Desktop, 2 Tablet, 1 Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const cleanPhone = item.contact.replace(/\D/g, "");
            const whatsappMsg = `Hi ${item.seller_name}, I saw your item '${item.title}' (${item.price}) on VaartaNow Mahila Market and want to buy.`;
            const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <div
                key={item.id}
                className="rounded-[1.8rem] border border-[#1f2937] bg-[#111827] text-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
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
                      <span className="text-xl font-black text-rose-400">
                        {item.price}
                      </span>
                      <span className="text-[11px] font-extrabold text-gray-400 flex items-center gap-1">
                        <MapPin className="size-3.5 text-rose-500" />
                        {item.locality.split(" ")[0]}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs font-semibold text-gray-300 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 pt-1">
                      <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                      <span className="truncate">👤 {item.seller_name} <strong className="text-emerald-400">✓ Verified</strong></span>
                    </div>
                  </div>

                  {/* Actions (Call & WhatsApp) */}
                  <div className="border-t border-[#1f2937] pt-3 flex items-center justify-between gap-2">
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

      {/* 2-STEP LIVE SMS VERIFIED POST MODAL FOR MAHILA MARKET */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-white">
                  + మహిళా మార్కెట్‌లో పోస్ట్ చేయండి <span className="text-xs text-gray-400 font-normal">(Post Listing)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600/20 text-rose-400 border border-rose-600/30">
                  దశ {step}/2
                </span>
              </div>

              <button
                onClick={() => setIsPostModalOpen(false)}
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

            {/* STEP 1: PRODUCT & SELLER DETAILS */}
            {step === 1 && (
              <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
                
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    మీ పేరు (Entrepreneur / Seller Name) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="ఉదా: లక్ష్మి దేవి"
                    required
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      విభాగం (Select Category) <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500 cursor-pointer"
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
                    <label className="font-extrabold text-gray-200">
                      ప్రాంతం (Locality) <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500 cursor-pointer"
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

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    ఉత్పత్తి / సేవ పేరు (Product / Service Title) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ఉదా: కొత్త ఆవకాయ పచ్చడి లేదా మంగళగిరి పట్టు చీరలు"
                    required
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      ధర (Price in ₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="ఉదా: 350 / kg"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500"
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
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    వివరణ (Description)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="ఉత్పత్తి తయారీ విధానం, క్వాలిటీ మరియు ఆర్డర్ సూచనలు..."
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    ఫోటో లింక్ (Image URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
                >
                  {loading ? "SMS OTP పంపుతున్నాము..." : "కొనసాగించు ➔ Live SMS OTP పొందండి"}
                </button>

              </form>
            )}

            {/* STEP 2: SMS OTP VERIFICATION */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTPAndPublish} className="space-y-4 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>← వెనుకకు (Back to Details)</span>
                </button>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-black text-rose-400 text-sm">
                    <ShieldCheck className="size-5" />
                    <span>SMS OTP Sent</span>
                  </div>
                  <p>📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6-అంకెల OTP పంపబడింది.</p>
                  {demoOtpHint && (
                    <p className="text-[10px] text-rose-400">
                      (డెమో OTP కోడ్: <span className="font-black text-sm">{demoOtpHint}</span> లేదా 123456)
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200 text-center block">
                    6-అంకెల OTP కోడ్‌ను ఇక్కడ నమోదు చేయండి
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[#1f2937] bg-[#030712] p-3.5 text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
                >
                  {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & పోస్ట్ ప్రచురించు"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
