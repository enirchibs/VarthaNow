import React, { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Sprout, 
  Smartphone, 
  Car, 
  Home, 
  Briefcase, 
  Wrench, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Search,
  Tag
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { CreatePostModal, type PostCategoryType } from "@/components/CreatePostModal";

interface MarketItem {
  id: string;
  category: string;
  title: string;
  description: string;
  price?: string;
  contact?: string;
  area: string;
  created_at: string;
}

const MOCK_MARKET_ITEMS: MarketItem[] = [
  {
    id: "m_1",
    category: "agriculture",
    title: "రైతు ధరకు సోనా మసూరి బియ్యం (25kg బస్తా)",
    description: "సొంత పొలం నుంచి పండించిన బియ్యం బస్తాలు. హోమ్ డెలివరీ కలదు.",
    price: "₹1,350 / బస్తా",
    contact: "9848012345",
    area: "విశాఖపట్నం (Visakhapatnam)",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "m_2",
    category: "agriculture",
    title: "స్వచ్ఛమైన వేరుశనగలు & చింతపండు అమ్మకానికి",
    description: "అనంతపురం నాణ్యమైన శనగలు మరియు కొత్త చింతపండు హోల్‌సేల్ ధరలకు.",
    price: "₹120 / kg",
    contact: "9440156789",
    area: "గాజువాక (Gajuwaka)",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "m_3",
    category: "mobile",
    title: "iPhone 13 128GB - మింట్ కండిషన్",
    description: "10 నెలల వాడకం. ఒరిజినల్ బాక్స్, ఛార్జర్ కలదు. నో స్క్రాచెస్.",
    price: "₹38,500",
    contact: "9988776655",
    area: "ఎంవీపీ కాలనీ (MVP Colony)",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "m_4",
    category: "vehicle",
    title: "Hero Splendor Plus 2022 మోడల్",
    description: "ఒకే హ్యాండ్ వాడకం. మైలేజ్ 65+ kmpl. ఇన్సూరెన్స్ రన్నింగ్.",
    price: "₹52,000",
    contact: "9123456789",
    area: "మధురవాడ (Madhurawada)",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "m_5",
    category: "property",
    title: "2BHK ఫ్లాట్ అద్దెకు (ఫ్యామిలీకి)",
    description: "24/7 నీరు, లిఫ్ట్, కార్ పార్కింగ్ కలదు. ప్రధాన రోడ్డుకు దగ్గరగా.",
    price: "₹12,000 / నెల",
    contact: "9876543210",
    area: "విశాఖపట్నం (Visakhapatnam)",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "m_6",
    category: "service",
    title: "ఇంటి వద్దకే ఎలక్ట్రీషియన్ & ప్యాకేజ్డ్ ప్లంబర్ సేవలు",
    description: "అన్ని రకాల హౌస్ హోల్డ్ ఎలక్ట్రికల్ మరియు ప్లంబింగ్ వర్క్స్.",
    price: "₹299 విజిటింగ్",
    contact: "9550011223",
    area: "విశాఖపట్నం (Visakhapatnam)",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export function ManaMarketPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<MarketItem[]>(MOCK_MARKET_ITEMS);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    try {
      const userPosts = JSON.parse(localStorage.getItem("vaartanow_user_classifieds") || "[]");
      if (userPosts.length > 0) {
        setItems([...userPosts, ...MOCK_MARKET_ITEMS]);
      }
    } catch {}
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCat === "all" || item.category === selectedCat;
    const matchesQuery = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <main className="container-shell py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-[1.8rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-md">
            <ShoppingBag className="size-3.5" />
            మన స్థానిక మార్కెట్
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
            మన మార్కెట్ (Mana Market)
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-blue-100 leading-relaxed">
            మీ ఊరిలో రైతుల పంటలు (బియ్యం, పల్లి, పప్పులు), మొబైల్స్, వాహనాలు, ప్రాపర్టీ మరియు స్థానిక సేవలను స్థానికంగానే కొనండి లేదా అమ్మండి!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <PlusCircle className="size-5" />
          + ప్రకటన పోస్ట్ చేయండి
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedCat("all")}
            className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition ${
              selectedCat === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            అన్నీ (All)
          </button>
          <button
            onClick={() => setSelectedCat("agriculture")}
            className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCat === "agriculture" ? "bg-green-600 text-white shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Sprout className="size-3.5" />
            వ్యవసాయ పంటలు
          </button>
          <button
            onClick={() => setSelectedCat("mobile")}
            className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCat === "mobile" ? "bg-amber-600 text-white shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Smartphone className="size-3.5" />
            మొబైల్స్ & ఎలక్ట్రానిక్స్
          </button>
          <button
            onClick={() => setSelectedCat("vehicle")}
            className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCat === "vehicle" ? "bg-yellow-600 text-white shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Car className="size-3.5" />
            వాహనాలు
          </button>
          <button
            onClick={() => setSelectedCat("property")}
            className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCat === "property" ? "bg-red-600 text-white shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Home className="size-3.5" />
            ప్రాపర్టీ & ఇల్లు
          </button>
          <button
            onClick={() => setSelectedCat("service")}
            className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCat === "service" ? "bg-teal-600 text-white shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Wrench className="size-3.5" />
            స్థానిక సేవలు
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="వెతకండి (Search area/item)..."
            className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-2 pl-9 pr-4 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs hover:shadow-md transition-all duration-300 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 text-[10px] font-black uppercase">
                  {item.category === "agriculture" ? "🌾 వ్యవసాయం" :
                   item.category === "mobile" ? "📱 మొబైల్" :
                   item.category === "vehicle" ? "🚗 వాహనం" :
                   item.category === "property" ? "🏢 ప్రాపర్టీ" :
                   item.category === "job" ? "💼 ఉద్యోగం" :
                   item.category === "service" ? "🔧 సేవలు" : "📢 పోస్ట్"}
                </span>

                <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                  <MapPin className="size-3 text-red-500" />
                  {item.area.split(" ")[0]}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] leading-snug line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="border-t border-[hsl(var(--border))]/50 pt-3 flex items-center justify-between gap-2">
              {item.price && (
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {item.price}
                </span>
              )}

              {item.contact && (
                <a
                  href={`tel:${item.contact}`}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-xs font-black transition-all shadow-xs"
                >
                  <Phone className="size-3.5" />
                  కాల్ చేయండి
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
