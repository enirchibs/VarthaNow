import React, { useState, useMemo } from "react";
import { 
  Wrench, 
  MapPin, 
  Phone, 
  MessageCircle, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Calendar, 
  Clock,
  ArrowLeft,
  Truck,
  HardHat,
  Tractor,
  PartyPopper
} from "lucide-react";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";

export interface ServiceRentalItem {
  id: string;
  provider_name: string;
  category: "workers" | "farm_machines" | "construction" | "events" | "other_services";
  service_type: string;
  village: string;
  price_rate: string;
  machine_details?: string;
  available_days: string;
  description: string;
  contact: string;
  image: string;
  created_at: string;
}

const SERVICE_GROUPS = [
  {
    id: "workers",
    title: "👷 పనివాళ్లు (Workers & Technicians)",
    icon: HardHat,
    items: [
      "🚰 Plumber — ప్లంబర్",
      "⚡ Electrician — ఎలక్ట్రీషియన్",
      "🧱 Mason — మేస్త్రీ",
      "🧱 Tiles Mesthri — టైల్స్ & మార్బుల్ మేస్త్రీ",
      "🪚 Carpenter (Wood Work) — వుడ్ వర్క్ కార్పెంటర్",
      "👨‍🏭 Welding — వెల్డింగ్ వర్క్",
      "🎨 Painter — పెయింటర్ (పుట్టీ & కలరింగ్)",
      "🛖 False Ceiling — ఫాల్స్ సీలింగ్ వర్క్ (POP/Gypsum/PVC)",
      "🧹 Cleaning — క్లీనింగ్",
      "👩‍🏫 Tuition — ట్యూషన్"
    ]
  },
  {
    id: "farm_machines",
    title: "🚜 వ్యవసాయ యంత్రాలు (Farm Machines & Rentals)",
    icon: Tractor,
    items: [
      "🚜 Tractor — ట్రాక్టర్",
      "🏗️ Proclainer / Excavator — ప్రొక్లైనర్ / ఎక్స్కవేటర్",
      "🌾 కోత యంత్రం — Harvesting Machine",
      "🌱 నాట్లు వేసే యంత్రం — Planting Machine",
      "💧 ఉడుపు / నీటి యంత్రం — Irrigation/Pump Machine",
      "🚜 Rotavator — రోటవేటర్",
      "🌾 Paddy / Crop Cutter — క్రాప్ కట్టర్",
      "🚛 Tractor Trolley — ట్రాక్టర్ ట్రాలీ"
    ]
  },
  {
    id: "construction",
    title: "🏗️ నిర్మాణ సేవలు (Construction & Equipment)",
    icon: Wrench,
    items: [
      "🏗️ JCB / Excavator — జేసీబీ",
      "🚧 Earthmover — ఎర్త్‌మూవర్",
      "🧱 Concrete Mixer — కాంక్రీట్ మిక్సర్",
      "🏗️ Crane — క్రేన్",
      "🚛 Tipper — టిప్పర్",
      "🧱 Tiles & Marble — టైల్స్ మేస్త్రీ వర్క్",
      "👨‍🏭 Welding — ఐరన్ గ్రిల్స్ & ఆర్క్ వెల్డింగ్",
      "🛖 Ceiling — POP & PVC ఫాల్స్ సీలింగ్",
      "👷 Construction Workers — కన్‌స్ట్రక్షన్ వర్కర్స్"
    ]
  },
  {
    id: "events",
    title: "🎪 కార్యక్రమాల సేవలు (Event & Function Services)",
    icon: PartyPopper,
    items: [
      "⛺ Samiyana — శామియానా / టెంట్లు",
      "🪑 Chairs & Tables — కుర్చీలు & టేబుళ్లు",
      "🎤 Sound System — సౌండ్ సిస్టమ్",
      "💡 Lighting — లైటింగ్",
      "🎉 Decoration — డెకరేషన్",
      "🍽️ Catering — కేటరింగ్",
      "📸 Photography — ఫోటోగ్రఫీ"
    ]
  },
  {
    id: "other_services",
    title: "🔧 ఇతర స్థానిక సేవలు (Other Local Services)",
    icon: Truck,
    items: [
      "🛵 Mechanic — బైక్ మెకానిక్",
      "📱 Mobile Repair — మొబైల్ రిపేర్",
      "💻 Computer Service — కంప్యూటర్ సర్వీస్",
      "🚗 Car/Auto Service — కార్/ఆటో సర్వీస్",
      "🔑 Key Maker — కీ మేకర్",
      "❄️ AC/Fridge Repair — ఏసీ/ఫ్రిజ్ రిపేర్",
      "🚚 Transport — ట్రాన్స్‌పోర్ట్",
      "🚛 Goods Vehicle — గూడ్స్ వాహనం"
    ]
  }
];

const INITIAL_SERVICES: ServiceRentalItem[] = [
  {
    id: "s-1",
    provider_name: "రమేష్ ట్రాక్టర్ సర్వీసెస్ (Ramesh Tractor Services)",
    category: "farm_machines",
    service_type: "🚜 Tractor + Rotavator + Trolley",
    village: "Anandapuram, Vizag",
    price_rate: "₹1,500 / day",
    machine_details: "Mahindra 575 DI Tractor with Rotavator Attachment",
    available_days: "ప్రతిరోజూ అందుబాటులో ఉంటుంది (All Days Available)",
    description: "పొలం దుక్కి దున్నడం, రోటవేటర్ వేయడం మరియు సరుకుల రవాణాకు ట్రాక్టర్ అద్దెకు ఇవ్వబడును.",
    contact: "9876543210",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-2",
    provider_name: "వెంకటేష్ జేసీబీ అండ్ ప్రొక్లైనర్ (Venkatesh JCB Earthmovers)",
    category: "construction",
    service_type: "🏗️ JCB 3DX Excavator",
    village: "Madhurawada, Vizag",
    price_rate: "₹1,200 / hour",
    machine_details: "JCB 3DX Heavy Excavator & Digger",
    available_days: "సోమవారం నుండి శనివారం (Mon-Sat)",
    description: "ప్లాట్ లెవెలింగ్, పునాదుల తవ్వకం, డ్రైనేజీ తవ్వకం & బిల్డింగ్ డెమోలిషన్ పనులకు జేసీబీ అద్దెకు.",
    contact: "9876543211",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-3",
    provider_name: "సురేష్ ఎలక్ట్రికల్ వర్క్స్ (Suresh Electrician)",
    category: "workers",
    service_type: "⚡ Electrician — ఎలక్ట్రీషియన్",
    village: "Gajuwaka, Vizag",
    price_rate: "₹500 / Visit",
    available_days: "అన్ని రోజులు 24x7 (Emergency Call Available)",
    description: "ఇంటి వైరింగ్, షార్ట్ సర్క్యూట్ రిపేర్, ఫ్యాన్ & లైటింగ్ ఫిట్టింగ్స్, ఇన్వర్టర్ ఇన్స్టాలేషన్.",
    contact: "9876543212",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-4",
    provider_name: "శ్రీనివాస్ పందెరి & శామియానా (Srinivas Tent House)",
    category: "events",
    service_type: "⛺ Samiyana + Chairs + Sound System",
    village: "Tadepalli, Vijayawada",
    price_rate: "₹3,500 / Event",
    available_days: "ఆర్డర్‌పై అందుబాటులో ఉంటుంది",
    description: "శుభకార్యాలకు శామియానా టెంట్లు, ప్లాస్టిక్ కుర్చీలు, టేబుళ్లు, డీజే సౌండ్ సిస్టమ్ సరసమైన ధరల్లో.",
    contact: "9876543213",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-5",
    provider_name: "రైతు కోత యంత్రం సర్వీసెస్ (Paddy Harvester Rental)",
    category: "farm_machines",
    service_type: "🌾 కోత యంత్రం — Harvesting Machine",
    village: "Guntur Rural",
    price_rate: "₹2,200 / hour",
    machine_details: "Kubota Combine Paddy Harvester",
    available_days: "పంట కాలంలో నిరంతరం అందుబాటులో ఉంటుంది",
    description: "వరి కోత, నూర్పిడి వేగంగా మరియు తక్కువ చేను నష్టంతో చేసే అధునాతన కోత యంత్రం.",
    contact: "9876543214",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-6",
    provider_name: "సత్యనారాయణ టైల్స్ మేస్త్రీ (Satyanarayana Tiles & Marble)",
    category: "workers",
    service_type: "🧱 Tiles Mesthri — టైల్స్ & మార్బుల్ మేస్త్రీ",
    village: "MVP Colony, Vizag",
    price_rate: "₹18 / sq.ft",
    available_days: "సోమ-శని (Mon-Sat)",
    description: "ఫ్లోరింగ్ టైల్స్, వాల్ టైల్స్, మార్బుల్స్ & గ్రానైట్ క్లీన్ ఫిట్టింగ్ మరియు రీప్యాచింగ్ వర్క్.",
    contact: "9876543215",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-7",
    provider_name: "శివ వెల్డింగ్ & ఆర్క్ వర్క్స్ (Shiva Welding Works)",
    category: "construction",
    service_type: "👨‍🏭 Welding — వెల్డింగ్ వర్క్ (గ్రిల్స్/గేట్లు)",
    village: "Pendurthi, Vizag",
    price_rate: "₹800 / Day",
    available_days: "అన్ని రోజులు అందుబాటులో ఉంటుంది",
    description: "ఐరన్ గేట్లు, కిటికీ గ్రిల్స్, షెడ్స్, స్టీల్ రెయిలింగ్స్ & గ్యాస్/ఆర్క్ వెల్డింగ్ స్పాట్ వర్క్.",
    contact: "9876543216",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-8",
    provider_name: "గోపి వుడ్ కార్పెంటర్ (Gopi Woodwork Carpenter)",
    category: "workers",
    service_type: "🪚 Carpenter (Wood Work) — వుడ్ వర్క్ కార్పెంటర్",
    village: "Kakinada",
    price_rate: "₹900 / Day",
    available_days: "అన్ని రోజులు",
    description: "ఇంటి డోర్స్, విండోస్, కబోర్డ్స్, టీవుడ్ ఫర్నిచర్ డిజైనింగ్ & లాక్ రిపేర్ వర్క్.",
    contact: "9876543217",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-9",
    provider_name: "రాజేష్ ఫాల్స్ సీలింగ్ వర్క్స్ (Rajesh False Ceiling)",
    category: "workers",
    service_type: "🛖 False Ceiling — ఫాల్స్ సీలింగ్ వర్క్ (POP/Gypsum/PVC)",
    village: "Vijayawada",
    price_rate: "₹55 / sq.ft",
    available_days: "అన్ని రోజులు",
    description: "ఇళ్ళు, షాపులు మరియు ఆఫీసుల కోసం మోడ్రన్ POP, జిప్సమ్ & PVC డిజైనర్ ఫాల్స్ సీలింగ్.",
    contact: "9876543218",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  }
];

export function ServicesRentalPage() {
  const [items, setItems] = useState<ServiceRentalItem[]>(() => {
    try {
      const saved = localStorage.getItem("vaartanow_service_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SERVICES;
  });

  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);

  // Form State for Service Posting Modal
  const [step, setStep] = useState<1 | 2>(1);
  const [providerName, setProviderName] = useState<string>("");
  const [category, setCategory] = useState<"workers" | "farm_machines" | "construction" | "events" | "other_services">("farm_machines");
  const [serviceType, setServiceType] = useState<string>("🚜 Tractor — ట్రాక్టర్");
  const [village, setVillage] = useState<string>("Anandapuram, Vizag");
  const [priceRate, setPriceRate] = useState<string>("");
  const [machineDetails, setMachineDetails] = useState<string>("");
  const [availableDays, setAvailableDays] = useState<string>("ప్రతిరోజూ (All Days)");
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
      if (selectedGroup !== "all" && item.category !== selectedGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesProvider = item.provider_name.toLowerCase().includes(q);
        const matchesType = item.service_type.toLowerCase().includes(q);
        const matchesVillage = item.village.toLowerCase().includes(q);
        if (!matchesProvider && !matchesType && !matchesVillage) return false;
      }
      return true;
    });
  }, [items, selectedGroup, searchQuery]);

  // Handle Step 1 Proceed to Live SMS OTP
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim() || !village.trim() || !priceRate.trim() || !phone.trim()) {
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

    const verifyRes = await verifySellerOTP(phone, otp, providerName);

    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.error || "OTP తప్పుగా ఉంది.");
      return;
    }

    const defaultImg = category === "farm_machines" ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" :
                       category === "construction" ? "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" :
                       category === "events" ? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" :
                       "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80";

    const newItem: ServiceRentalItem = {
      id: `service-${Date.now()}`,
      provider_name: providerName.trim(),
      category,
      service_type: serviceType,
      village: village.trim(),
      price_rate: priceRate.startsWith("₹") ? priceRate.trim() : `₹${priceRate.trim()}`,
      machine_details: machineDetails.trim() || undefined,
      available_days: availableDays.trim() || "ప్రతిరోజూ అందుబాటులో ఉంటుంది",
      description: description.trim() || "నమ్మకమైన సేవ మరియు సకాలంలో పని అందించబడును.",
      contact: phone.replace(/\D/g, ""),
      image: imageUrl.trim() || defaultImg,
      created_at: new Date().toISOString()
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem("vaartanow_service_items", JSON.stringify(updated));

    setLoading(false);
    setIsPostModalOpen(false);
    setStep(1);
    setProviderName("");
    setPriceRate("");
    setDescription("");
  };

  return (
    <div className="bg-[#030712] text-white min-h-screen pb-16">
      <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

        {/* Hero Section Banner matching requested title */}
        <div className="rounded-[2.2rem] bg-gradient-to-r from-teal-700 via-cyan-800 to-blue-900 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black backdrop-blur-md">
              <Wrench className="size-3.5" />
              Services • Workers • Machines • Equipment
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              🔧 సేవలు & అద్దెకు (Services & Rentals)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-relaxed">
              గ్రామాలు & పట్టణాల్లో పనివాళ్లు, ట్రాక్టర్లు, ప్రొక్లైనర్లు, కోత యంత్రాలు, జేసీబీ, శామియానా & స్థానిక అద్దె సేవలు!
            </p>
          </div>

          <div className="z-10">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white text-teal-700 hover:bg-teal-50 px-6 py-3.5 text-xs sm:text-sm font-black transition-all shadow-xl active:scale-95 cursor-pointer min-h-[46px]"
            >
              <PlusCircle className="size-5 text-teal-700" />
              + మీ సేవను లేదా యంత్రాన్ని జోడించండి
            </button>
          </div>
        </div>

        {/* 5 Main Group Category Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`rounded-full px-4 py-2.5 text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95 ${
                selectedGroup === "all"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-[#111827] border border-[#1f2937] text-gray-300 hover:bg-[#1f2937]"
              }`}
            >
              <span>అన్ని సేవలు (All Services)</span>
            </button>

            {SERVICE_GROUPS.map((group) => {
              const isSel = selectedGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`rounded-full px-4 py-2.5 text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95 ${
                    isSel
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-[#111827] border border-[#1f2937] text-gray-300 hover:bg-[#1f2937]"
                  }`}
                >
                  <span>{group.title}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="వెతకండి (ట్రాక్టర్, ప్లంబర్, ఎలక్ట్రీషియన్, జేసీబీ, శామియానా, ఆనందపురం)..."
              className="w-full rounded-full border border-[#1f2937] bg-[#111827] py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[46px]"
            />
          </div>
        </div>

        {/* Services & Rentals Card Grid (Requested Village Rental Format) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const cleanPhone = item.contact.replace(/\D/g, "");
            const whatsappMsg = `Hi ${item.provider_name}, I saw your service/rental listing '${item.service_type}' (${item.price_rate}) on VaartaNow Services & Rentals and want to hire.`;
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
                    alt={item.service_type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black bg-teal-600 text-white uppercase shadow-sm">
                    🔧 అద్దె & సర్వీస్
                  </span>
                </div>

                {/* Card Body formatted as requested */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    
                    {/* Header Provider & Village */}
                    <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                      <h3 className="text-base font-black text-white leading-snug truncate">
                        {item.provider_name}
                      </h3>
                      <span className="text-[11px] font-extrabold text-teal-400 flex items-center gap-1 shrink-0">
                        <MapPin className="size-3.5 text-teal-500" />
                        {item.village}
                      </span>
                    </div>

                    {/* Service Type Tag */}
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-black text-teal-300">
                      {item.service_type}
                    </div>

                    {/* Machine Details if present */}
                    {item.machine_details && (
                      <p className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                        🚜 <strong>యంత్రం వివరాలు:</strong> {item.machine_details}
                      </p>
                    )}

                    {/* Price Rate & Availability */}
                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                      <span className="text-lg font-black text-emerald-400">
                        💰 {item.price_rate}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="size-3 text-gray-400" />
                        {item.available_days}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <ShieldCheck className="size-4 text-emerald-400" />
                      <span>ధృవీకరించబడిన ప్రొవైడర్ (Verified Provider)</span>
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

        {/* BOTTOM PROMINENT ACTION BUTTON matching request */}
        <div className="p-8 text-center rounded-[2.2rem] border border-[#1f2937] bg-[#111827] space-y-3 mt-8">
          <h3 className="text-xl font-black text-white">
            మీ వద్ద కూడా ట్రాక్టర్, జేసీబీ, అద్దె యంత్రాలు లేదా సేవలు ఉన్నాయా?
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            మీ గ్రామం మరియు చుట్టుపక్కల ప్రజలకు మీ సేవలను ఉచితంగా తెలియజేయండి!
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-8 py-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-black shadow-xl transition cursor-pointer min-h-[48px] active:scale-95"
          >
            ➕ మీ సేవను లేదా యంత్రాన్ని జోడించండి (+ Add Your Service)
          </button>
        </div>

      </main>

      {/* 2-STEP LIVE SMS VERIFIED SERVICE POSTING MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-white">
                  ➕ మీ సేవను లేదా యంత్రాన్ని జోడించండి
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600/20 text-teal-400 border border-teal-600/30">
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

            {/* STEP 1: SERVICE DETAILS FORM */}
            {step === 1 && (
              <form onSubmit={handleProceedToOTP} className="space-y-3.5 text-xs">
                
                {/* 1. నేనే అందించే సేవ Category Select */}
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    నేను అందించే సేవ విభాగం (Service Category) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="farm_machines">🚜 వ్యవసాయ యంత్రాలు (Tractor, Harvester, Proclainer)</option>
                    <option value="workers">👷 పనివాళ్లు (Plumber, Electrician, Mason, Carpenter)</option>
                    <option value="construction">🏗️ నిర్మాణ సేవలు (JCB, Earthmover, Tipper, Crane)</option>
                    <option value="events">🎪 కార్యక్రమాల సేవలు (Samiyana, Sound, Catering)</option>
                    <option value="other_services">🔧 ఇతర స్థానిక సేవలు (Mechanic, Transport, AC Repair)</option>
                  </select>
                </div>

                {/* 2. యంత్రం / పని టైప్ */}
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    సేవ / యంత్రం టైప్ (Service / Machine Type) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="ఉదా: Tractor + Rotavator లేదా Plumber / ఎలక్ట్రీషియన్"
                    required
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 3. పేరు & గ్రామం / ప్రాంతం */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      పేరు (Owner / Provider Name) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      placeholder="ఉదా: రమేష్ (Ramesh)"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      📍 గ్రామం / ప్రాంతం (Village / Area) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="ఉదా: Anandapuram, Vizag"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* 4. ఫోన్ / WhatsApp & గంటకు / రోజుకు ధర */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      📞 ఫోన్ / WhatsApp (10-Digit Phone) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      💰 గంటకు / రోజుకు ధర (Rate in ₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={priceRate}
                      onChange={(e) => setPriceRate(e.target.value)}
                      placeholder="ఉదా: ₹1,500/day లేదా ₹500/hour"
                      required
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* 5. యంత్రం ఉంటే Machine Details & అందుబాటులో ఉన్న రోజులు */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      🚜 యంత్రం ఉంటే Machine Model Details
                    </label>
                    <input
                      type="text"
                      value={machineDetails}
                      onChange={(e) => setMachineDetails(e.target.value)}
                      placeholder="ఉదా: Mahindra 575 DI / JCB 3DX"
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-gray-200">
                      📅 అందుబాటులో ఉన్న రోజులు (Available Days)
                    </label>
                    <input
                      type="text"
                      value={availableDays}
                      onChange={(e) => setAvailableDays(e.target.value)}
                      placeholder="ఉదా: ప్రతిరోజూ (All Days)"
                      className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* 6. వివరాలు & ఫోటో లింక్ */}
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-200">
                    సేవల వివరాలు (Service Details)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="మీ సేవలు, అనుభవం మరియు పని సమయాల వివరాలు..."
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
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
                    className="w-full rounded-xl border border-[#1f2937] bg-[#030712] p-3 text-xs font-bold text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>← వెనుకకు (Back to Details)</span>
                </button>

                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs font-bold text-teal-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-black text-teal-400 text-sm">
                    <ShieldCheck className="size-5" />
                    <span>SMS OTP Sent</span>
                  </div>
                  <p>📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6-అంకెల OTP పంపబడింది.</p>
                  {demoOtpHint && (
                    <p className="text-[10px] text-teal-400">
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
                    className="w-full text-center tracking-widest text-xl font-black rounded-xl border border-[#1f2937] bg-[#030712] p-3.5 text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
                >
                  {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & సేవను ప్రచురించు"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
