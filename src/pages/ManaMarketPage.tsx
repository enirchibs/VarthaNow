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
  CheckCircle
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  fetchClassifieds, 
  ClassifiedItem, 
  ClassifiedCategory,
  getStoredSellerProfile
} from "@/lib/classifieds-api";
import { ClassifiedPostModal } from "@/components/ClassifiedPostModal";
import { ClassifiedDetailModal } from "@/components/ClassifiedDetailModal";

export function ManaMarketPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<ClassifiedItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyMyPosts, setOnlyMyPosts] = useState<boolean>(false);

  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ClassifiedItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMarketItems = async () => {
    setLoading(true);
    const data = await fetchClassifieds({
      category: selectedCat,
      searchQuery,
      statusFilter
    });

    if (onlyMyPosts) {
      const myProf = getStoredSellerProfile();
      if (myProf && myProf.phone) {
        setItems(data.filter((i) => i.contact.replace(/\D/g, "") === myProf.phone.replace(/\D/g, "")));
      } else {
        setItems(data);
      }
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMarketItems();
  }, [selectedCat, searchQuery, statusFilter, onlyMyPosts]);

  return (
    <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

      {/* Header Banner */}
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
            onClick={() => setOnlyMyPosts(!onlyMyPosts)}
            className={`px-4 py-3 rounded-full text-xs font-black transition-all cursor-pointer ${
              onlyMyPosts ? "bg-amber-400 text-black shadow-md" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
            }`}
          >
            {onlyMyPosts ? "చూపిస్తోంది: నా ప్రకటనలు (My Posted Ads)" : "నా ప్రకటనలు (My Ads)"}
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

      {/* Category Pills Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "అన్నీ (All)", icon: ShoppingBag, color: "bg-blue-600" },
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
                onClick={() => setSelectedCat(cat.id)}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const mainImg = item.images && item.images.length > 0
            ? item.images[0]
            : "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";

          return (
            <div
              key={item.id}
              onClick={() => setSelectedDetailItem(item)}
              className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                <img
                  src={mainImg}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    item.status === "available" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}>
                    {item.status === "available" ? "🟢 Available" : "🔴 SOLD"}
                  </span>

                  {item.free_items && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white">
                      🎁 Free
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black text-white uppercase">
                  {item.category}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {item.price}
                    </span>

                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <MapPin className="size-3" />
                      {item.locality.split(" ")[0]}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[hsl(var(--foreground))] leading-snug line-clamp-2 group-hover:text-blue-600 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] line-clamp-2">
                    {item.description}
                  </p>

                  {item.offer_discount && (
                    <p className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                      🏷️ ఆఫర్: {item.offer_discount}
                    </p>
                  )}
                </div>

                {/* Seller Bar & Quick Actions */}
                <div className="border-t border-[hsl(var(--border))]/60 pt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-[hsl(var(--foreground))]">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    <span className="truncate max-w-[110px]">{item.seller_name.split(" ")[0]}</span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${item.contact}`}
                      className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-xs"
                      title="Call Seller"
                    >
                      <Phone className="size-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/91${item.contact.replace(/\D/g, "")}?text=${encodeURIComponent(`నమస్తే, VaartaNow లో మీరు పోస్ట్ చేసిన "${item.title}" గురించి వివరాలు కావాలి.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition shadow-xs"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle className="size-3.5" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modals */}
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
