import React, { useState } from "react";
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Loader2, 
  X, 
  Check, 
  ArrowLeft,
  Navigation
} from "lucide-react";
import { detectDetailedGPSArea, convertAreaToTelugu } from "@/lib/location-detector";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  currentRadius: number;
  onSelectLocation: (location: string, radius: number, lat?: number, lon?: number) => void;
}

const POPULAR_NEARBY_LOCALITIES = [
  { name_te: "విశాఖపట్నం", name_en: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name_te: "సబ్బవరం", name_en: "Sabbavaram", lat: 17.7946, lon: 83.1362 },
  { name_te: "మధురవాడ", name_en: "Madhurawada", lat: 17.8184, lon: 83.3512 },
  { name_te: "గాజువాక", name_en: "Gajuwaka", lat: 17.6908, lon: 83.2082 },
  { name_te: "అనకాపల్లి", name_en: "Anakapalle", lat: 17.6913, lon: 83.0039 },
  { name_te: "భీమునిపట్నం", name_en: "Bheemunipatnam", lat: 17.8914, lon: 83.4542 },
  { name_te: "పెందుర్తి", name_en: "Pendurthi", lat: 17.8306, lon: 83.2014 },
  { name_te: "విజయవాడ", name_en: "Vijayawada", lat: 16.5062, lon: 80.648 },
  { name_te: "గుంటూరు", name_en: "Guntur", lat: 16.3067, lon: 80.4365 },
  { name_te: "తిరుపతి", name_en: "Tirupati", lat: 13.6288, lon: 79.4192 },
  { name_te: "హైదరాబాద్", name_en: "Hyderabad", lat: 17.385, lon: 78.4867 }
];

export function LocationPickerModal({
  isOpen,
  onClose,
  currentLocation,
  currentRadius,
  onSelectLocation
}: LocationPickerModalProps) {
  const [selectedLocality, setSelectedLocality] = useState(currentLocation);
  const [selectedRadius, setSelectedRadius] = useState(currentRadius);
  const [searchInput, setSearchInput] = useState("");
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsError(null);
    try {
      const area = await detectDetailedGPSArea();
      if (area) {
        let detected = area.city_town || area.suburb_village || area.district_mandal || "విశాఖపట్నం";
        if (/[a-zA-Z]/.test(detected)) {
          detected = await convertAreaToTelugu(detected);
        }
        setSelectedLocality(detected);
        if (area.lat && area.lon) {
          onSelectLocation(detected, selectedRadius, area.lat, area.lon);
          onClose();
        }
      }
    } catch {
      setGpsError("GPS గుర్తించలేకపోయాము. దయచేసి క్రింది జాబితా నుండి ఎంచుకోండి.");
    } finally {
      setIsDetectingGPS(false);
    }
  };

  const filteredLocalities = POPULAR_NEARBY_LOCALITIES.filter((loc) => {
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase();
    return (
      loc.name_te.toLowerCase().includes(q) ||
      loc.name_en.toLowerCase().includes(q)
    );
  });

  const handleConfirm = () => {
    const match = POPULAR_NEARBY_LOCALITIES.find(
      (l) => l.name_te === selectedLocality || l.name_en.toLowerCase() === selectedLocality.toLowerCase()
    );
    onSelectLocation(selectedLocality, selectedRadius, match?.lat, match?.lon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>గ్రామం ఎంచుకోండి</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100">
          
          {/* Title & Graphic Illustration */}
          <div className="text-center space-y-1">
            <div className="size-14 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <MapPin className="size-8 stroke-[2.2px] text-rose-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              ఎక్కడ సేవ కావాలి?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              మీ గ్రామం లేదా పట్టణం ఎంచుకోండి, సమీప నిపుణులను కనుగొనండి
            </p>
          </div>

          {/* 1-Tap GPS Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetectingGPS}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition cursor-pointer disabled:opacity-60"
          >
            {isDetectingGPS ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Crosshair className="size-4" />
            )}
            <span>
              {isDetectingGPS ? "లొకేషన్ గుర్తిస్తున్నాం..." : "నా ప్రస్తుత స్థానం ఉపయోగించండి (GPS)"}
            </span>
          </button>

          {gpsError && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 text-center font-bold">
              {gpsError}
            </p>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-black text-slate-400">
              లేదా
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="గ్రామం / పట్టణం పేరు వెతకండి..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-11 pl-9 pr-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Nearby / Popular Localities List */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              ఈ ప్రాంతాలు (Nearby)
            </p>
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              {filteredLocalities.map((loc) => {
                const isSelected = selectedLocality === loc.name_te;
                return (
                  <button
                    key={loc.name_en}
                    type="button"
                    onClick={() => setSelectedLocality(loc.name_te)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <MapPin className={`size-3.5 shrink-0 ${isSelected ? "text-white" : "text-emerald-500"}`} />
                      <span>{loc.name_te} ({loc.name_en})</span>
                    </span>
                    {isSelected && <Check className="size-4 shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Radius Section (Screen 2 matching screenshot) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                ఎంత దూరంలో? (Distance Radius)
              </span>
              <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                {selectedRadius > 0 ? `${selectedRadius} కి.మీ` : "అన్నీ"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "5 km", val: 5 },
                { label: "10 km", val: 10 },
                { label: "25 km", val: 25 },
                { label: "50 km", val: 50 },
                { label: "100 km", val: 100 }
              ].map((r) => {
                const isRSelected = selectedRadius === r.val;
                return (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setSelectedRadius(r.val)}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                      isRSelected
                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Confirmation Action */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="size-4" />
            <span>ఈ స్థానంలో చూపించు</span>
          </button>
        </div>

      </div>
    </div>
  );
}
