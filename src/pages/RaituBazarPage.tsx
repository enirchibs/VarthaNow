import React, { useState, useMemo } from "react";
import { 
  Sprout, 
  Tractor, 
  Coins, 
  Warehouse, 
  Landmark, 
  MapPin, 
  Phone, 
  MessageCircle, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  Truck,
  HardHat
} from "lucide-react";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";

export interface RaituAgriItem {
  id: string;
  seller_name: string;
  section: "crops" | "inputs" | "livestock" | "equipment" | "market" | "services" | "storage" | "info";
  sub_category: string;
  title: string;
  village: string;
  price_rate: string;
  description: string;
  contact: string;
  image: string;
  created_at: string;
}

const AGRI_SECTIONS = [
  {
    id: "crops",
    title: "🌾 పంటలు (Crops & Produce)",
    subhead: "కూరగాయలు · పండ్లు · ధాన్యాలు · పప్పుధాన్యాలు · మసాలా పంటలు · సేంద్రీయ పంటలు",
    subCategories: ["కూరగాయలు", "పండ్లు", "ధాన్యాలు (వరి/గోధుమ)", "పప్పుధాన్యాలు", "మసాలా పంటలు", "సేంద్రీయ పంటలు (Organic)"]
  },
  {
    id: "inputs",
    title: "🌱 ఇన్పుట్లు (Agri Inputs & Feeds)",
    subhead: "విత్తనాలు · ఎరువులు · పురుగుమందులు · పశువుల మేత",
    subCategories: ["విత్తనాలు (Seeds)", "ఎరువులు (Fertilizers)", "పురుగుమందులు (Pesticides)", "పశువుల మేత (Cattle Feed)"]
  },
  {
    id: "livestock",
    title: "🐄 పశుసంవర్ధక (Livestock & Animals)",
    subhead: "పశువులు · కోళ్లు · మేకలు · గొర్రెలు · చేపలు · పశువైద్యం",
    subCategories: ["పాడి ఆవులు/గేదెలు", "కోళ్లు (Poultry)", "మేకలు & గొర్రెలు", "చేపలు/రొయ్యల పెంపకం", "పశువైద్యం (Vet Care)"]
  },
  {
    id: "equipment",
    title: "🚜 పరికరాలు (Farm Machinery & Rental)",
    subhead: "ట్రాక్టర్ · ప్రొక్లైనర్/JCB · కోత యంత్రం · నాటు యంత్రం · రోటావేటర్ · పంపులు · ట్రాలీ",
    subCategories: ["ట్రాక్టర్ (Tractor)", "ప్రొక్లైనర్/JCB", "కోత యంత్రం (Harvester)", "నాటు యంత్రం", "రోటావేటర్ & పంపులు", "ట్రాక్టర్ ట్రాలీ"]
  },
  {
    id: "market",
    title: "💰 మార్కెట్ (Market Prices & Direct Buyers)",
    subhead: "పంట ధరలు · పంట అమ్మకం · పంట కొనుగోలు · రైతు మార్కెట్ · ప్రత్యక్ష కొనుగోలుదారులు",
    subCategories: ["పంట అమ్మకం", "పంట కొనుగోలు", "రైతు మార్కెట్ లైవ్ ధరలు", "ప్రత్యక్ష కొనుగోలుదారులు (Buyers)"]
  },
  {
    id: "services",
    title: "👷 రైతు సేవలు (Farm Labour & Services)",
    subhead: "కూలీలు · దున్నడం · నాట్లు · కోత · స్ప్రేయింగ్ · యంత్రాల అద్దె",
    subCategories: ["వ్యవసాయ కూలీలు", "దున్నడం (Ploughing)", "నాట్లు వర్క్", "స్ప్రేయింగ్ సేవలు", "యంత్రాల అద్దె"]
  },
  {
    id: "storage",
    title: "🏬 నిల్వ & రవాణా (Storage & Transport)",
    subhead: "గోదాములు · కోల్డ్ స్టోరేజ్ · ట్రాన్స్పోర్ట్",
    subCategories: ["కోల్డ్ స్టోరేజ్ (Cold Storage)", "గోదాములు (Godowns)", "వరి/పంటల ట్రాన్స్పోర్ట్ లారీలు"]
  },
  {
    id: "info",
    title: "🏛️ రైతు సమాచారం (Govt Schemes & Experts)",
    subhead: "వాతావరణం · ప్రభుత్వ పథకాలు · రుణాలు · బీమా · వ్యవసాయ నిపుణుల సలహాలు",
    subCategories: ["వాతావరణ సమాచారం", "ప్రభుత్వ పథకాలు (Schemes)", "రైతు రుణాలు & బీమా", "వ్యవసాయ నిపుణుల సలహాలు"]
  }
];

const INITIAL_AGRI_ITEMS: RaituAgriItem[] = [
  {
    id: "r-1",
    seller_name: "అప్పిరెడ్డి (Farmer Appi Reddy)",
    section: "crops",
    sub_category: "ధాన్యాలు (వరి/గోధుమ)",
    title: "BPT 5204 సన్నా వరి ధాన్యం (BPT Fine Rice Paddy Bulk Sale)",
    description: "స్వచ్ఛమైన ఆర్గానిక్ పద్ధతిలో పండించిన కొత్త సన్నా వరి ధాన్యం 50 బస్తాలు అమ్మకానికి సిద్ధంగా ఉంది.",
    price_rate: "₹2,150 / 75kg బస్తా",
    village: "ఆనందపురం (Anandapuram, Vizag)",
    contact: "9876543210",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "r-2",
    seller_name: "మల్లయ్య ట్రాక్టర్ అద్దె (Mallayya Tractor Rental)",
    section: "equipment",
    sub_category: "ట్రాక్టర్ (Tractor)",
    title: "Mahindra 575 DI ట్రాక్టర్ & రోటావేటర్ అద్దెకు",
    description: "పొలం దుక్కి దున్నడం, రోటావేటర్ వేయడం మరియు కంబైన్డ్ హార్వెస్టింగ్ అద్దె సేవలు.",
    price_rate: "₹1,400 / day",
    village: "తడేపల్లిగూడెం (Tadepalligudem)",
    contact: "9876543211",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "r-3",
    seller_name: "శ్రీనివాస్ పాడి ఫార్మ్ (Srinivas Dairy Farm)",
    section: "livestock",
    sub_category: "పాడి ఆవులు/గేదెలు",
    title: "ముర్రా జాతి పాలు ఇచ్చే నల్ల గేదె (HF Cross Murrah Buffalo)",
    description: "రోజుకి 14 లీటర్ల పాలు ఇచ్చే ఈత పశువు. పూర్తి టీకాలు వేయబడినది.",
    price_rate: "₹68,000",
    village: "గుంటూరు (Guntur Rural)",
    contact: "9876543212",
    image: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "r-4",
    seller_name: "రైతు సేవ కేంద్రం (Agri Inputs Center)",
    section: "inputs",
    sub_category: "విత్తనాలు (Seeds)",
    title: "హైబ్రిడ్ టమోటా & మిర్చి విత్తనాలు (Certified Hybrid Seeds)",
    description: "తెగులు నిరోధక శక్తి కలిగిన అత్యధిక దిగుబడి ఇచ్చే సర్టిఫైడ్ హైబ్రిడ్ విత్తనాలు.",
    price_rate: "₹450 / Packet",
    village: "మంగళగిరి (Mangalagiri)",
    contact: "9876543213",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "r-5",
    seller_name: "లక్ష్మీ వెంకటేశ్వర కోల్డ్ స్టోరేజ్ (LVK Cold Storage)",
    section: "storage",
    sub_category: "కోల్డ్ స్టోరేజ్ (Cold Storage)",
    title: "మిర్చి, చింతపండు & పసుపు నిల్వ కోల్డ్ స్టోరేజ్",
    description: "రైతుల పంట ఉత్పత్తుల భద్రత కోసం 24/7 ఉష్ణోగ్రత నియంత్రిత కోల్డ్ స్టోరేజ్ సదుపాయం.",
    price_rate: "₹60 / బస్తా / నెల",
    village: "మిర్చి యార్డ్ (Guntur Mirchi Yard)",
    contact: "9876543214",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  }
];

export function RaituBazarPage() {
  const [items, setItems] = useState<RaituAgriItem[]>(() => {
    try {
      const saved = localStorage.getItem("vaartanow_raitu_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AGRI_ITEMS;
  });

  const [selectedSec, setSelectedSec] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [sellerName, setSellerName] = useState<string>("");
  const [section, setSection] = useState<"crops" | "inputs" | "livestock" | "equipment" | "market" | "services" | "storage" | "info">("crops");
  const [subCategory, setSubCategory] = useState<string>("ధాన్యాలు (వరి/గోధుమ)");
  const [title, setTitle] = useState<string>("");
  const [priceRate, setPriceRate] = useState<string>("");
  const [village, setVillage] = useState<string>("ఆనందపురం (Anandapuram)");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  // OTP State
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedSec !== "all" && item.section !== selectedSec) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSeller = item.seller_name.toLowerCase().includes(q);
        const matchesVillage = item.village.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSeller && !matchesVillage) return false;
      }
      return true;
    });
  }, [items, selectedSec, searchQuery]);

  // Handle Step 1 Proceed
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim() || !title.trim() || !priceRate.trim() || !phone.trim()) {
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

    const defaultImg = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";

    const newItem: RaituAgriItem = {
      id: `raitu-${Date.now()}`,
      seller_name: sellerName.trim(),
      section,
      sub_category: subCategory,
      title: title.trim(),
      village: village.trim(),
      price_rate: priceRate.startsWith("₹") ? priceRate.trim() : `₹${priceRate.trim()}`,
      description: description.trim() || "రైతు ఉత్పత్తులు మరియు నమ్మకమైన సేవలు.",
      contact: phone.replace(/\D/g, ""),
      image: imageUrl.trim() || defaultImg,
      created_at: new Date().toISOString()
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem("vaartanow_raitu_items", JSON.stringify(updated));

    setLoading(false);
    setIsPostModalOpen(false);
    setStep(1);
    setTitle("");
    setPriceRate("");
    setDescription("");
  };

  return (
    <div className="bg-[#030712] text-white min-h-screen pb-16">
      <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

        {/* Hero Section Banner */}
        <div className="rounded-[2.2rem] bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black backdrop-blur-md">
              🌾 VaartaNow Farmer & Agriculture Portal
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              రైతు పంటలు & వ్యవసాయ మార్కెట్
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-100 leading-relaxed">
              పంటలు, ఇన్పుట్లు, పశువుల అమ్మకం, పరికరాల అద్దె, మార్కెట్ ధరలు, రైతు సేవలు, కోల్డ్ స్టోరేజ్ & ప్రభుత్వ పథకాల డిజిటల్ వేదిక!
            </p>
          </div>

          <div className="z-10">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3.5 text-xs sm:text-sm font-black transition-all shadow-xl active:scale-95 cursor-pointer min-h-[46px]"
            >
              <PlusCircle className="size-5 text-emerald-800" />
              + మీ పంటను లేదా సేవను జోడించండి
            </button>
          </div>
        </div>

        {/* 8 Main Agriculture Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGRI_SECTIONS.map((sec) => {
            const isSelected = selectedSec === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSec(isSelected ? "all" : sec.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 active:scale-95 ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg"
                    : "bg-[#111827] border-[#1f2937] text-gray-200 hover:border-emerald-500/50"
                }`}
              >
                <div>
                  <h3 className="text-sm font-black flex items-center justify-between">
                    <span>{sec.title}</span>
                    {isSelected && <CheckCircle className="size-4 text-white" />}
                  </h3>
                  <p className="text-[11px] text-gray-300 font-medium leading-relaxed mt-1">
                    {sec.subhead}
                  </p>
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block pt-1">
                  {isSelected ? "✓ ఎంపిక చేయబడింది" : "అన్వేషించండి ➔"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="వెతకండి (వరి, టమోటా, ట్రాక్టర్, పశువులు, విత్తనాలు, కోల్డ్ స్టోరేజ్, ఆనందపురం)..."
            className="w-full rounded-full border border-[#1f2937] bg-[#111827] py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]"
          />
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const cleanPhone = item.contact.replace(/\D/g, "");
            const whatsappMsg = `Hi ${item.seller_name}, I saw your Agri listing '${item.title}' (${item.price_rate}) on VaartaNow Raitu Bazar and want to buy/contact.`;
            const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <div
                key={item.id}
                className="rounded-[1.8rem] border border-[#1f2937] bg-[#111827] text-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase shadow-sm">
                    🌾 రైతు పోర్టల్
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                      <span className="text-xl font-black text-emerald-400">
                        {item.price_rate}
                      </span>
                      <span className="text-[11px] font-extrabold text-gray-400 flex items-center gap-1">
                        <MapPin className="size-3.5 text-emerald-500" />
                        {item.village}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-500/10 text-[11px] font-black text-emerald-300 inline-block">
                      {item.sub_category}
                    </div>

                    <h3 className="text-base font-black text-white leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs font-semibold text-gray-300 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 pt-1">
                      <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                      <span className="truncate">👤 {item.seller_name} <strong className="text-emerald-400">✓ Verified Farmer</strong></span>
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

      {/* 2-STEP LIVE SMS VERIFIED POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-white">
                  🌾 రైతు మార్కెట్‌లో పోస్ట్ చేయండి
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
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

            {/* STEP 1: DETAILS */}
            {step === 1 && (
              <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
                
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    మీ పేరు (Farmer / Seller Name) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="ఉదా: అప్పిరెడ్డి (Appi Reddy)"
                    required
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      వ్యవసాయ విభాగం (Agriculture Section) <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value as any)}
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="crops">🌾 పంటలు (Crops & Produce)</option>
                      <option value="inputs">🌱 ఇన్పుట్లు (Seeds & Fertilizers)</option>
                      <option value="livestock">🐄 పశుసంవర్ధక (Livestock & Animals)</option>
                      <option value="equipment">🚜 పరికరాలు (Farm Machinery)</option>
                      <option value="market">💰 మార్కెట్ (Market Buyers)</option>
                      <option value="services">👷 రైతు సేవలు (Labour & Spraying)</option>
                      <option value="storage">🏬 నిల్వ & రవాణా (Cold Storage & Trucks)</option>
                      <option value="info">🏛️ రైతు సమాచారం (Govt Schemes)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      ఉప-విభాగం (Sub Category) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="ఉదా: వరి ధాన్యం, టమోటో, ట్రాక్టర్"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    పంట / సేవ పేరు (Listing Title) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ఉదా: BPT సన్నా వరి ధాన్యం 50 బస్తాలు లేదా Mahindra 575 DI ట్రాక్టర్ అద్దెకు"
                    required
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      ధర (Rate in ₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={priceRate}
                      onChange={(e) => setPriceRate(e.target.value)}
                      placeholder="ఉదా: ₹2,150 / బస్తా"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      📍 గ్రామం / మండలం (Village / Locality) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="ఉదా: ఆనందపురం (Anandapuram)"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    📞 వాట్సాప్ మొబైల్ (WhatsApp Phone) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    వివరణ (Description)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="పంట దిగుబడి, క్వాలిటీ మరియు ఆర్డర్ సమయాల వివరాలు..."
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    📷 ఫోటో లింక్ (Photo URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>← వెనుకకు (Back to Details)</span>
                </button>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-black text-emerald-400 text-sm">
                    <ShieldCheck className="size-5" />
                    <span>SMS OTP Sent</span>
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
                    6-అంకెల OTP కోడ్‌ను ఇక్కడ నమోదు చేయండి
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[#1f2937] bg-[#030712] p-3.5 text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
                >
                  {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & ప్రచురించు"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
