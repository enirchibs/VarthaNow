import React, { useState } from "react";
import { 
  X, 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Car, 
  Home, 
  CheckCircle2, 
  Navigation,
  ChevronLeft,
  ChevronRight,
  Flag
} from "lucide-react";
import type { ServiceProvider } from "@/types/services";

interface ServiceProviderDetailModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onCall: (provider: ServiceProvider) => void;
  onWhatsApp: (provider: ServiceProvider) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenReport: (provider: ServiceProvider) => void;
}

export function ServiceProviderDetailModal({
  provider,
  isOpen,
  onClose,
  onCall,
  onWhatsApp,
  isBookmarked,
  onToggleBookmark,
  onOpenReport
}: ServiceProviderDetailModalProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!isOpen || !provider) return null;

  const photos = provider.photos.length > 0 ? provider.photos : [provider.avatar_url];

  const handleNextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${provider.name} - ${provider.subcategory_name_te}`,
          text: `${provider.name} - మన అడ్డా స్థానిక సేవలు: ${provider.locality}`,
          url: window.location.href
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("లింక్ కాపీ చేయబడింది!");
    }
  };

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${provider.name} ${provider.locality} ${provider.village_town}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* 1. Top Bar / Image Carousel (Screen 6 in Reference Image) */}
        <div className="relative h-60 sm:h-72 bg-slate-900 shrink-0 select-none">
          <img
            src={photos[photoIndex]}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Floating Actions on Image */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="size-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer active:scale-95"
                title="షేర్ చేయండి"
              >
                <Share2 className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => onToggleBookmark(provider.id)}
                className="size-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer active:scale-95"
                title={isBookmarked ? "సేవ్ చేయబడింది" : "సేవ్ చేయండి"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="size-5 text-blue-400 fill-blue-400" />
                ) : (
                  <Bookmark className="size-5" />
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="size-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Carousel Indicator (1/5) & Nav Chevrons */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white font-black text-xs backdrop-blur-xs">
            {photoIndex + 1}/{photos.length}
          </div>
        </div>

        {/* 2. Scrollable Body Info */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100">
          
          {/* Title Row */}
          <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {provider.name}
              </h2>
              {provider.phone_verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Verified Phone</span>
                </span>
              )}
            </div>

            {provider.business_name && (
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {provider.business_name}
              </p>
            )}

            {/* Rating & Distance */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
              <span className="inline-flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                <span>{provider.rating} ({provider.review_count} సమీక్షలు)</span>
              </span>

              <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                <MapPin className="size-3.5 text-rose-500 shrink-0" />
                <span>{provider.locality}, {provider.village_town}</span>
                {provider.distance_km !== undefined && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    - {provider.distance_km} km
                  </span>
                )}
              </span>
            </div>

            {/* Service Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <Home className="size-3.5 text-blue-500" />
                <span>ఇంటి సేవ</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <Car className="size-3.5 text-emerald-500" />
                <span>{provider.service_radius_km} km వరకు వస్తాము</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <Clock className="size-3.5 text-amber-500" />
                <span>{provider.experience_years}+ సంవత్సరాల అనుభవం</span>
              </span>
            </div>
          </div>

          {/* About & Description */}
          {provider.description_te && (
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                సేవ వివరాలు (About Service)
              </h3>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {provider.description_te}
              </p>
            </div>
          )}

          {/* Checklist of Services Offered (Screen 6 in Reference Image) */}
          {provider.services_offered.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>సేవలు (Services Offered)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {provider.services_offered.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Breakdown Table (Screen 6 in Reference Image) */}
          {provider.pricing_breakdown.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>ధరలు (సుమారుగా - Estimated Pricing)</span>
                <span className="text-[10.5px] font-bold text-slate-400">చర్చించదగినవి</span>
              </h3>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {provider.pricing_breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900/60">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.service_name}</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{item.price_rate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Working Hours */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
            <Clock className="size-4 text-blue-500 shrink-0" />
            <span className="font-bold text-slate-700 dark:text-slate-300">పని వేళలు:</span>
            <span className="font-bold text-slate-500">{provider.working_hours}</span>
          </div>

          {/* Get Directions Button */}
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Navigation className="size-4 text-blue-600" />
            <span>📍 గూగుల్ మ్యాప్స్ లో దారి చూపించండి</span>
          </button>

          {/* Safety Disclaimer (Screen 7/Product Principle) */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
              <ShieldAlert className="size-4 text-amber-600 shrink-0" />
              <span>గమనించండి (Important Safety Note)</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 font-bold leading-relaxed text-[10.5px]">
              <li>ఇది ఒక సమాచార వేదిక మాత్రమే. సేవల నాణ్యతకు Mana Adda బాధ్యత వహించదు.</li>
              <li>చెల్లింపు నేరుగా సేవకులకు మాత్రమే చేయండి (No Middleman).</li>
              <li>మీ భద్రత కోసం ముందుగా పని వివరాలు మరియు ధర నిర్ధారించుకోండి.</li>
            </ul>
          </div>

          {/* Report Profile Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => onOpenReport(provider)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <Flag className="size-3.5" />
              <span>⚠️ ఈ ప్రొఫైల్ పై ఫిర్యాదు చేయండి (Report Profile)</span>
            </button>
          </div>

        </div>

        {/* 3. Sticky Bottom Contact Bar (Screen 6 in Reference Image) */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => onCall(provider)}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Phone className="size-4 fill-current" />
            <span>ఫోన్ చేయండి</span>
          </button>

          <button
            type="button"
            onClick={() => onWhatsApp(provider)}
            className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <MessageCircle className="size-4 fill-current" />
            <span>WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
