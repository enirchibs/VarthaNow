import React, { useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Phone, 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  Car, 
  Home, 
  ShieldCheck, 
  Filter,
  CheckCircle2,
  ChevronRight,
  Compass
} from "lucide-react";
import type { ServiceProvider, ServiceCategoryItem, ServiceSubcategoryItem } from "@/types/services";

interface ServiceListingsViewProps {
  category?: ServiceCategoryItem | null;
  subcategory?: ServiceSubcategoryItem | null;
  searchQuery?: string;
  providers: ServiceProvider[];
  loading: boolean;
  locationName: string;
  radiusKm: number;
  onOpenLocationPicker: () => void;
  onBack: () => void;
  onSelectProvider: (provider: ServiceProvider) => void;
  onDirectCall: (provider: ServiceProvider) => void;
  onDirectWhatsApp: (provider: ServiceProvider) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (providerId: string) => void;
  onExpandRadius: (newRadius: number) => void;
}

export function ServiceListingsView({
  category,
  subcategory,
  searchQuery,
  providers,
  loading,
  locationName,
  radiusKm,
  onOpenLocationPicker,
  onBack,
  onSelectProvider,
  onDirectCall,
  onDirectWhatsApp,
  bookmarkedIds,
  onToggleBookmark,
  onExpandRadius
}: ServiceListingsViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "near" | "rating" | "price" | "available">("all");

  const title = subcategory 
    ? `${subcategory.name_te} సేవలు` 
    : searchQuery 
    ? `"${searchQuery}" సంబంధిత సేవలు` 
    : category 
    ? `${category.name_te} నిపుణులు` 
    : "స్థానిక సేవలు";

  const sortedProviders = [...providers].filter((p) => {
    if (activeFilter === "available") return p.is_available_now;
    return true;
  });

  if (activeFilter === "near") {
    sortedProviders.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  } else if (activeFilter === "rating") {
    sortedProviders.sort((a, b) => b.rating - a.rating);
  } else if (activeFilter === "price") {
    sortedProviders.sort((a, b) => (a.price_from || 0) - (b.price_from || 0));
  }

  return (
    <div className="space-y-3 pb-16 animate-in fade-in-50">
      
      {/* 1. Header Bar with Back + Location Selector (Screen 5 in Reference Image) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition shrink-0"
            title="వెనుకకు"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {title}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 truncate">
              {providers.length} మంది నిపుణులు లభ్యం
            </p>
          </div>
        </div>

        {/* Location pill */}
        <button
          type="button"
          onClick={onOpenLocationPicker}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 self-start sm:self-auto cursor-pointer transition active:scale-95 shrink-0"
        >
          <MapPin className="size-3.5 text-rose-500" />
          <span>{locationName} {radiusKm > 0 ? `• ${radiusKm} km` : "• అన్నీ"}</span>
        </button>
      </div>

      {/* 2. Filter Pills (Matching Screen 5) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: "all", label: "అన్నీ (All)" },
          { id: "near", label: "సన్నిహితంగా (Near Me)" },
          { id: "rating", label: "రేటింగ్ (Top Rated)" },
          { id: "price", label: "ధర (Lowest Price)" },
          { id: "available", label: "ఇప్పుడు అందుబాటులో" }
        ].map((f) => {
          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 3. Provider Listings Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : sortedProviders.length > 0 ? (
        <div className="space-y-3">
          {sortedProviders.map((provider) => {
            const isBookmarked = bookmarkedIds.includes(provider.id);
            return (
              <div
                key={provider.id}
                className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition duration-200 space-y-3"
              >
                {/* Top: Avatar, Name, Rating, Bookmark */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex items-start gap-3 min-w-0 cursor-pointer flex-1"
                    onClick={() => onSelectProvider(provider)}
                  >
                    {/* Avatar */}
                    <div className="size-14 sm:size-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs">
                      <img
                        src={provider.avatar_url}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                          {provider.name}
                        </h3>
                        {provider.phone_verified && (
                          <span title="Verified Phone">
                            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                          </span>
                        )}
                      </div>

                      {/* Rating & Distance */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          <span>{provider.rating}</span>
                          <span className="text-slate-400 text-[10px]">({provider.review_count})</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold truncate">
                          <MapPin className="size-3 text-rose-500 shrink-0" />
                          <span>{provider.locality}</span>
                          {provider.distance_km !== undefined && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                              • {provider.distance_km} km
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Mode & Experience */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Home className="size-3 text-blue-500" />
                          <span>ఇంటి సేవ</span>
                        </span>
                        <span>•</span>
                        <span>{provider.experience_years}+ సం. అనుభవం</span>
                        {provider.services_offered.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {provider.services_offered.slice(0, 2).join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(provider.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition active:scale-90 shrink-0"
                    title={isBookmarked ? "సేవ్ చేయబడింది" : "సేవ్ చేయండి"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="size-5 text-blue-600 fill-blue-600" />
                    ) : (
                      <Bookmark className="size-5" />
                    )}
                  </button>
                </div>

                {/* Price & Action Row (Large Phone & WhatsApp buttons matching Screen 5) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block leading-none">
                      ధర సుమారుగా
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block truncate mt-0.5">
                      {provider.price_rate_label}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDirectCall(provider)}
                      className="h-9 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
                    >
                      <Phone className="size-3.5 fill-current" />
                      <span>ఫోన్</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDirectWhatsApp(provider)}
                      className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="size-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. Rural Empty State with Auto-radius Suggestion */
        <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="size-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-3xl">
            😕
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              ఈ ప్రాంతంలో ({locationName}) {radiusKm > 0 ? `${radiusKm} km లోపు` : ""} ఇంకా నిపుణులు లేరు.
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              పరిధిని 25 km లేదా 50 km వరకు పెంచి చుట్టుపక్కల గ్రామాలు & పట్టణాల సేవలను చూడండి.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onExpandRadius(25)}
              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md cursor-pointer transition active:scale-95"
            >
              25 km వరకు చూడండి
            </button>
            <button
              type="button"
              onClick={() => onExpandRadius(50)}
              className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black cursor-pointer transition hover:bg-slate-200"
            >
              50 km పరిధి
            </button>
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer transition"
            >
              మరో ప్రాంతం ఎంచుకోండి
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
