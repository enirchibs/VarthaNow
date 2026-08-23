import React, { useEffect, useState } from "react";
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

export function ManaMarketPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<ClassifiedItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [profile, setProfile] = useState<SellerProfile | null>(getStoredSellerProfile());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ClassifiedItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Calculate user's total active ads count
  const myAdsCount = profile?.phone
    ? items.filter((i) => i.contact.replace(/\D/g, "") === profile.phone.replace(/\D/g, "")).length
    : 0;

  const loadMarketItems = async () => {
    setLoading(true);
    const data = await fetchClassifieds({
      category: selectedCat === "my_ads" ? "all" : selectedCat,
      searchQuery,
      statusFilter
    });

    if (selectedCat === "my_ads") {
      const myPhone = profile?.phone ? profile.phone.replace(/\D/g, "") : "";
      if (myPhone) {
        setItems(data.filter((i) => i.contact.replace(/\D/g, "") === myPhone));
      } else {
        setItems([]);
      }
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMarketItems();
  }, [selectedCat, searchQuery, statusFilter, profile]);

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
    <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

      {/* Top Profile Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--card))] p-4 rounded-3xl border border-[hsl(var(--border))] shadow-xs">
        {profile && profile.is_verified ? (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[hsl(var(--foreground))]">
                  👤 Welcome, {profile.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                +91 {profile.phone} | నా ప్రకటనలు: <span className="font-black text-blue-600 dark:text-blue-400">{myAdsCount} Active Ads</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black shrink-0">
              <User className="size-5" />
            </div>
            <div>
              <span className="text-sm font-black text-[hsl(var(--foreground))]">
                అమ్మకందారు ఖాతా (Seller Profile)
              </span>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
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
                className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCat === "my_ads" ? "bg-amber-500 text-black shadow-sm" : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                }`}
              >
                <User className="size-3.5" />
                <span>My Ads ({myAdsCount})</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-full text-xs font-bold border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-600 transition flex items-center gap-1.5 cursor-pointer"
                title="Logout"
              >
                <LogOut className="size-3.5" />
                <span>లాగ్‌అవుట్</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <LogIn className="size-4" />
              <span>Login to View Your Ads 📱</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-[2.2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
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
            className={`px-4 py-3 rounded-full text-xs font-black transition-all cursor-pointer ${
              selectedCat === "my_ads" ? "bg-amber-400 text-black shadow-md" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
            }`}
          >
            👤 నా ప్రకటనలు (My Ads: {myAdsCount})
          </button>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <PlusCircle className="size-5 text-blue-600" />
            + అమ్మకం / ప్రకటన పోస్ట్ చేయండి
          </button>
        </div>
      </div>

      {/* Category Pills Filter Bar (Includes Dedicated "My Ads 👤" Tab) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "అన్నీ (All)", icon: ShoppingBag, color: "bg-blue-600" },
            { id: "my_ads", label: `My Ads 👤 (${myAdsCount})`, icon: User, color: "bg-amber-500" },
            { id: "electronics", label: "📱 ఎలక్ట్రానిక్స్", icon: Smartphone, color: "bg-indigo-600" },
            { id: "furniture", label: "🛋️ ఫర్నిచర్", icon: Home, color: "bg-purple-600" },
            { id: "vehicles", label: "🚗 వాహనాలు", icon: Car, color: "bg-amber-600" },
            { id: "property", label: "🏢 ప్రాపర్టీ & ఇల్లు", icon: Home, color: "bg-red-600" },
            { id: "services", label: "🔧 స్థానిక సేవలు", icon: Wrench, color: "bg-teal-600" },
            { id: "jobs", label: "💼 ఉద్యోగాలు", icon: Briefcase, color: "bg-emerald-600" },
            { id: "other", label: "🎁 ఇతర / ఉచితం", icon: Gift, color: "bg-pink-600" }
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
                className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? `${cat.color} text-white shadow-md`
                    : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--card))] p-3.5 rounded-2xl border border-[hsl(var(--border))]">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              <Filter className="size-3.5" />
              స్థితి:
            </span>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                statusFilter === "all" ? "bg-blue-600 text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              అన్నీ
            </button>
            <button
              onClick={() => setStatusFilter("available")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                statusFilter === "available" ? "bg-emerald-600 text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              🟢 అందుబాటులో ఉన్నాయి
            </button>
            <button
              onClick={() => setStatusFilter("sold")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                statusFilter === "sold" ? "bg-red-600 text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              🔴 అమ్మేసాము
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="వెతకండి (Search mobile, bike, area)..."
              className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-2 pl-9 pr-4 text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* OLX-Style Hyperlocal Grid */}
      {selectedCat === "my_ads" && items.length === 0 ? (
        <div className="p-12 text-center rounded-[2rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
          <div className="size-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="size-7" />
          </div>
          <h3 className="text-lg font-black text-[hsl(var(--foreground))]">
            మీరు ఇంకా ఏ ప్రకటనలను ప్రచురించలేదు (No Posted Ads Yet)
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
            మీ వద్ద ఉన్న మొబైల్స్, వాహనాలు, ఫర్నిచర్ లేదా సేవలను ఇప్పుడే ఉచితంగా ప్రకటన పోస్ట్ చేయండి!
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-6 py-3 rounded-full bg-blue-600 text-white text-xs font-black shadow-lg hover:bg-blue-700 transition cursor-pointer"
          >
            + పోస్ట్ చేయండి (Post Your First Ad)
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
  );
}
