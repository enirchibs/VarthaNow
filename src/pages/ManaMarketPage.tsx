import React, { useEffect, useState, useMemo } from "react";
import { 
  ShoppingBag, 
  Smartphone, 
  Car, 
  Home, 
  Briefcase, 
  Wrench, 
  Gift, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Search,
  Tag,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Filter,
  CheckCircle,
  User,
  LogOut,
  UserCheck,
  LogIn
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  fetchClassifieds, 
  ClassifiedItem, 
  ClassifiedCategory,
  getStoredSellerProfile,
  saveStoredSellerProfile,
  SellerProfile
} from "@/lib/classifieds-api";
import { ClassifiedPostModal } from "@/components/ClassifiedPostModal";
import { ClassifiedDetailModal } from "@/components/ClassifiedDetailModal";
import { SellerLoginModal } from "@/components/SellerLoginModal";
import { ClassifiedCard } from "@/components/ClassifiedCard";
import { MarketplaceSeoFooter } from "@/components/MarketplaceSeoFooter";

export function ManaMarketPage() {
  const { lang } = useLanguage();
  const [allItems, setAllItems] = useState<ClassifiedItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [profile, setProfile] = useState<SellerProfile | null>(getStoredSellerProfile());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "true";
    } catch {
      return false;
    }
  });
  const [selectedDetailItem, setSelectedDetailItem] = useState<ClassifiedItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all active items
  const loadMarketItems = async () => {
    setLoading(true);
    const data = await fetchClassifieds({
      category: "all",
      searchQuery: "",
      statusFilter: "all"
    });
    setAllItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMarketItems();
  }, []);

  // Compute live category item counts dynamically from allItems
  const myPhone = profile?.phone ? profile.phone.replace(/\D/g, "") : "";
  const counts = useMemo(() => {
    const total = allItems.length;
    const myAds = myPhone ? allItems.filter((i) => i.contact.replace(/\D/g, "") === myPhone).length : 0;
    const electronics = allItems.filter((i) => i.category === "electronics").length;
    const furniture = allItems.filter((i) => i.category === "furniture").length;
    const vehicles = allItems.filter((i) => i.category === "vehicles").length;
    const property = allItems.filter((i) => i.category === "property").length;
    const services = allItems.filter((i) => i.category === "services").length;
    const buildingMaterials = allItems.filter((i) => i.category === "building_materials").length;
    const other = allItems.filter((i) => i.category === "other").length;
    return { total, myAds, electronics, furniture, vehicles, property, services, buildingMaterials, other };
  }, [allItems, myPhone]);

  // Filter items in real time based on Category, Locality, Status, and Search Query
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCat === "my_ads") {
        if (!myPhone || item.contact.replace(/\D/g, "") !== myPhone) return false;
      } else if (selectedCat !== "all" && item.category !== selectedCat) {
        return false;
      }

      // Locality filter
      if (selectedLocality !== "all") {
        const locLower = item.locality.toLowerCase();
        const selLower = selectedLocality.toLowerCase();
        if (!locLower.includes(selLower)) return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Search query matching title, description, category, locality, or seller_name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesLoc = item.locality.toLowerCase().includes(q);
        const matchesSeller = item.seller_name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesLoc && !matchesSeller) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, selectedCat, selectedLocality, statusFilter, searchQuery, myPhone]);

  const handleLogout = () => {
    localStorage.removeItem("vaartanow_user_profile");
    localStorage.removeItem("vizag_user_profile");
    setProfile(null);
    if (selectedCat === "my_ads") {
      setSelectedCat("all");
    }
  };

  const handleLoginSuccess = (newProfile: SellerProfile) => {
    setProfile(newProfile);
    saveStoredSellerProfile(newProfile);
  };

  return (
    <div className="bg-[#030712] text-white min-h-screen pb-12">
      <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

        {/* Top Profile Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-4 rounded-3xl border border-[#1f2937] shadow-xs">
          {profile && profile.is_verified ? (
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center font-black shadow-md shrink-0">
                <UserCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    👤 Welcome, {profile.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#16a34a]/20 text-[#16a34a] px-2.5 py-0.5 rounded-full border border-[#16a34a]/30">
                    <ShieldCheck className="size-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-400">
                  +91 {profile.phone} | నా ప్రకటనలు: <span className="font-black text-[#2563eb]">{counts.myAds} Active Ads</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[#2563eb]/20 text-[#2563eb] flex items-center justify-center font-black shrink-0">
                <User className="size-5" />
              </div>
              <div>
                <span className="text-sm font-black text-white">
                  అమ్మకందారు ఖాతా (Seller Profile)
                </span>
                <p className="text-xs font-semibold text-gray-400">
                  మీ పోస్టింగ్‌లను నిర్వహించడానికి లాగిన్ అవ్వండి
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {profile && profile.is_verified ? (
              <>
                <button
                  onClick={() => setSelectedCat("my_ads")}
                  className={`px-4 py-2.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95 ${
                    selectedCat === "my_ads" ? "bg-amber-500 text-black shadow-sm" : "bg-[#1f2937] text-white hover:bg-gray-800"
                  }`}
                >
                  <User className="size-4" />
                  <span>My Ads ({counts.myAds})</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-full text-xs font-bold border border-[#1f2937] text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition flex items-center gap-1.5 cursor-pointer min-h-[44px] touch-manipulation active:scale-95"
                  title="Logout"
                >
                  <LogOut className="size-4" />
                  <span>లాగ్‌అవుట్</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer min-h-[44px] touch-manipulation active:scale-95"
              >
                <LogIn className="size-4" />
                <span>Login to View Your Ads 📱</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Header Banner */}
        <div className="rounded-[2.2rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="space-y-2 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-md">
              <ShoppingBag className="size-3.5" />
              VaartaNow Hyperlocal Marketplace
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              మన మార్కెట్ (Mana Market)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-blue-100 leading-relaxed">
              మీ ఊరిలో ఎలక్ట్రానిక్స్, ఫర్నిచర్, వాహనాలు, ప్రాపర్టీ, స్థానిక సేవలు & రైతు పంటలను ఉచితంగా కొనండి లేదా అమ్మండి!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <button
              onClick={() => {
                if (!profile) {
                  setIsLoginModalOpen(true);
                } else {
                  setSelectedCat("my_ads");
                }
              }}
              className={`px-4 py-3 rounded-full text-xs font-black transition-all cursor-pointer min-h-[44px] active:scale-95 ${
                selectedCat === "my_ads" ? "bg-amber-400 text-black shadow-md" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
              }`}
            >
              👤 నా ప్రకటనలు (My Ads: {counts.myAds})
            </button>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 cursor-pointer min-h-[44px] touch-manipulation"
            >
              <PlusCircle className="size-5 text-blue-700" />
              + అమ్మకం / ప్రకటన పోస్ట్ చేయండి
            </button>
          </div>
        </div>

        {/* Category Pills Filter Bar with Live Real-Time Counts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: `అన్నీ (${counts.total})`, icon: ShoppingBag, color: "bg-[#2563eb]" },
              { id: "my_ads", label: `My Ads 👤 (${counts.myAds})`, icon: User, color: "bg-amber-500 text-black" },
              { id: "electronics", label: `📱 Electronics (${counts.electronics})`, icon: Smartphone, color: "bg-indigo-600" },
              { id: "furniture", label: `🛋️ Furniture (${counts.furniture})`, icon: Home, color: "bg-purple-600" },
              { id: "vehicles", label: `🚗 Vehicles (${counts.vehicles})`, icon: Car, color: "bg-amber-600" },
              { id: "property", label: `🏠 Property (${counts.property})`, icon: Home, color: "bg-red-600" },
              { id: "building_materials", label: `🏗️ Building Materials (${counts.buildingMaterials})`, icon: Home, color: "bg-amber-600" },
              { id: "services", label: `🔧 Services (${counts.services})`, icon: Wrench, color: "bg-teal-600" },
              { id: "other", label: `🎁 Other / Free (${counts.other})`, icon: Gift, color: "bg-pink-600" }
            ].map((cat) => {
              const isSel = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === "my_ads" && !profile) {
                      setIsLoginModalOpen(true);
                    } else {
                      setSelectedCat(cat.id);
                    }
                  }}
                  className={`rounded-full px-4 py-2.5 text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95 ${
                    isSel
                      ? `${cat.color} text-white shadow-md`
                      : "bg-[#111827] border border-[#1f2937] text-gray-300 hover:bg-[#1f2937]"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Real-Time Locality, Status & Search Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-3.5 rounded-2xl border border-[#1f2937]">
            
            {/* Locality Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-400 flex items-center gap-1">
                <MapPin className="size-4 text-red-500" />
                ప్రాంతం:
              </span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="rounded-full border border-[#1f2937] bg-[#030712] py-2 px-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer min-h-[44px]"
              >
                <option value="all">అన్ని ప్రాంతాలు (All Localities)</option>
                <option value="Madhurawada">మధురవాడ (Madhurawada)</option>
                <option value="Gajuwaka">గాజువాక (Gajuwaka)</option>
                <option value="MVP Colony">ఎంవీపీ కాలనీ (MVP Colony)</option>
                <option value="Visakhapatnam">విశాఖపట్నం (Visakhapatnam)</option>
                <option value="Gachibowli">గచ్చిబౌలి (Gachibowli)</option>
                <option value="Hyderabad">హైదరాబాద్ (Hyderabad)</option>
                <option value="Vijayawada">విజయవాడ (Vijayawada)</option>
                <option value="Guntur">గుంటూరు (Guntur)</option>
                <option value="Tirupati">తిరుపతి (Tirupati)</option>
                <option value="Warangal">వరంగల్ (Warangal)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-gray-400 flex items-center gap-1">
                <Filter className="size-3.5" />
                స్థితి:
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer min-h-[44px] ${
                  statusFilter === "all" ? "bg-[#2563eb] text-white" : "bg-[#1f2937] text-gray-400 hover:text-white"
                }`}
              >
                అన్నీ
              </button>
              <button
                onClick={() => setStatusFilter("available")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer min-h-[44px] ${
                  statusFilter === "available" ? "bg-[#16a34a] text-white" : "bg-[#1f2937] text-gray-400 hover:text-white"
                }`}
              >
                🟢 అందుబాటులో ఉన్నాయి
              </button>
              <button
                onClick={() => setStatusFilter("sold")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer min-h-[44px] ${
                  statusFilter === "sold" ? "bg-red-600 text-white" : "bg-[#1f2937] text-gray-400 hover:text-white"
                }`}
              >
                🔴 అమ్మేసాము
              </button>
            </div>

            {/* Search Box (Title, Description, Category, Locality, Seller) */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="వెతకండి (Search title, seller, area)..."
                className="w-full rounded-full border border-[#1f2937] bg-[#030712] py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* OLX-Style Hyperlocal Responsive Grid (3 Desktop, 2 Tablet, 1 Mobile) */}
        {selectedCat === "my_ads" && filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] border border-dashed border-[#1f2937] bg-[#111827] space-y-3">
            <div className="size-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="size-7" />
            </div>
            <h3 className="text-lg font-black text-white">
              మీరు ఇంకా ఏ ప్రకటనలను ప్రచురించలేదు (No Posted Ads Yet)
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              మీ వద్ద ఉన్న మొబైల్స్, వాహనాలు, ఫర్నిచర్ లేదా సేవలను ఇప్పుడే ఉచితంగా ప్రకటన పోస్ట్ చేయండి!
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-3.5 rounded-full bg-[#2563eb] text-white text-xs font-black shadow-lg hover:bg-blue-700 transition cursor-pointer min-h-[44px] active:scale-95"
            >
              + పోస్ట్ చేయండి (Post Your First Ad)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <ClassifiedCard
                key={item.id}
                item={item}
                currentSellerPhone={profile?.phone}
                onCardClick={() => setSelectedDetailItem(item)}
                onItemUpdated={loadMarketItems}
              />
            ))}
          </div>
        )}

        {/* Hyperlocal SEO Directory Footer */}
        <MarketplaceSeoFooter />

        {/* Modals */}
        <SellerLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        <ClassifiedPostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onPostSuccess={loadMarketItems}
        />

        <ClassifiedDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onStatusUpdated={() => {
            loadMarketItems();
            setSelectedDetailItem(null);
          }}
        />

      </main>
    </div>
  );
}
