import React, { useState } from "react";
import { X, MapPin, Compass, Search, Check } from "lucide-react";

interface MatrimonyLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocality: string;
  currentRadius: number;
  onSelectLocation: (locality: string, radius: number, lat?: number, lon?: number) => void;
}

const POPULAR_TOWNS = [
  { name: "అనకాపల్లి", en: "Anakapalle", lat: 17.6913, lon: 83.0039 },
  { name: "సబ్బవరం", en: "Sabbavaram", lat: 17.7946, lon: 83.1362 },
  { name: "పెందుర్తి", en: "Pendurthi", lat: 17.8286, lon: 83.2045 },
  { name: "గాజువాక", en: "Gajuwaka", lat: 17.6906, lon: 83.2081 },
  { name: "విశాఖపట్నం", en: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "మధురవాడ", en: "Madhurawada", lat: 17.8089, lon: 83.3512 },
  { name: "చోడవరం", en: "Chodavaram", lat: 17.8291, lon: 82.9347 },
  { name: "విజయనగరం", en: "Vizianagaram", lat: 18.1067, lon: 83.3956 },
  { name: "కాకినాడ", en: "Kakinada", lat: 16.9891, lon: 82.2475 },
  { name: "రాజమండ్రి", en: "Rajahmundry", lat: 17.0005, lon: 81.8040 },
  { name: "విజయవాడ", en: "Vijayawada", lat: 16.5062, lon: 80.6480 },
  { name: "గుంటూరు", en: "Guntur", lat: 16.3067, lon: 80.4365 },
  { name: "తిరుపతి", en: "Tirupati", lat: 13.6288, lon: 79.4192 },
  { name: "హైదరాబాద్", en: "Hyderabad", lat: 17.3850, lon: 78.4867 }
];

const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 200];

export const MatrimonyLocationModal: React.FC<MatrimonyLocationModalProps> = ({
  isOpen,
  onClose,
  currentLocality,
  currentRadius,
  onSelectLocation
}) => {
  const [selectedLocality, setSelectedLocality] = useState(currentLocality || "అనకాపల్లి");
  const [selectedRadius, setSelectedRadius] = useState(currentRadius || 25);
  const [customSearch, setCustomSearch] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("మీ డివైస్‌లో లొకేషన్ సౌకర్యం అందుబాటులో లేదు.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setSelectedLocality("నా ప్రస్తుత లొకేషన్");
        setCoords({ lat, lon });
      },
      () => {
        setIsLocating(false);
        alert("లొకేషన్ పొందలేకపోయాము. దయచేసి జాబితా నుండి పట్టణం ఎంచుకోండి.");
      },
      { timeout: 10000 }
    );
  };

  const handleTownClick = (town: typeof POPULAR_TOWNS[0]) => {
    setSelectedLocality(town.name);
    setCoords({ lat: town.lat, lon: town.lon });
  };

  const handleApply = () => {
    const loc = customSearch.trim() || selectedLocality;
    onSelectLocation(loc, selectedRadius, coords.lat, coords.lon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
              <MapPin className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                ప్రాంతం & పరిధి ఎంచుకోండి
              </h3>
              <p className="text-[11px] text-slate-500">
                సమీప గ్రామాలు, మండలాలు లేదా పట్టణాలు
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="py-4 overflow-y-auto space-y-4">
          {/* GPS Fast Action */}
          <button
            type="button"
            onClick={handleUseGps}
            disabled={isLocating}
            className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border-2 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 flex items-center justify-center gap-2 font-black text-xs transition active:scale-95"
          >
            <Compass className={`size-4 text-rose-600 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "లొకేషన్ గుర్తిస్తున్నాము..." : "📍 నా ప్రస్తుత లొకేషన్ గుర్తించండి (Auto GPS)"}</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="మండలం లేదా గ్రామం పేరు టైప్ చేయండి..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 font-bold text-xs outline-none focus:border-rose-500"
            />
          </div>

          {/* Radius Selector Pills */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
              ఎంత దూరం పరిధిలో సంబంధాలు కావాలి? (Search Radius)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRadius(r)}
                  className={`py-2 px-1 rounded-xl text-xs font-black border transition text-center ${
                    selectedRadius === r
                      ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                      : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:border-rose-400"
                  }`}
                >
                  {r} కి.మీ
                </button>
              ))}
            </div>
          </div>

          {/* Popular Local Towns */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
              ప్రముఖ పట్టణాలు & మండలాలు
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_TOWNS.map((town) => {
                const isSelected = selectedLocality === town.name;
                return (
                  <button
                    key={town.name}
                    type="button"
                    onClick={() => handleTownClick(town)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                      isSelected
                        ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100"
                        : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{town.name}</span>
                    {isSelected && <Check className="size-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Apply Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 text-white font-black text-sm shadow-md shadow-rose-600/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>సరియైన సంబంధాలు చూపించండి ({selectedLocality} • {selectedRadius} కి.మీ)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
