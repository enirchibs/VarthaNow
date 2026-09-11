import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Check, RefreshCw, Sparkles, Building2 } from "lucide-react";
import { 
  detectDetailedGPSArea, 
  searchAreaAutocomplete, 
  PRELOADED_AP_TS_LOCATIONS 
} from "@/lib/location-detector";

interface LocationAreaSelectorProps {
  value: string;
  onChange: (area: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const POPULAR_PILLS = [
  "విశాఖపట్నం (Visakhapatnam)",
  "మధురవాడ (Madhurawada)",
  "గాజువాక (Gajuwaka)",
  "ఎంవీపీ కాలనీ (MVP Colony)",
  "విజయవాడ (Vijayawada)",
  "హైదరాబాద్ (Hyderabad)",
  "తిరుపతి (Tirupati)",
  "గుంటూరు (Guntur)",
  "రాజమండ్రి (Rajahmundry)",
  "కాకినాడ (Kakinada)"
];

export function LocationAreaSelector({
  value,
  onChange,
  label = "ప్రాంతం / ఏరియా (Select Area, Mandal, Village or Street)",
  placeholder = "గ్రామం, మండలం, వీధి లేదా నగరం ఎంచుకోండి...",
  required = false
}: LocationAreaSelectorProps) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal query with prop value
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Autocomplete as user types
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setGpsSuccessMsg("");

    if (val.trim().length >= 2) {
      setShowDropdown(true);
      const results = await searchAreaAutocomplete(val);
      setSuggestions(results);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Select suggestion
  const handleSelectArea = (areaStr: string) => {
    setQuery(areaStr);
    onChange(areaStr);
    setShowDropdown(false);
    setSuggestions([]);
  };

  // 🎯 One-Tap GPS Detection
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsSuccessMsg("");

    try {
      const detailedLoc = await detectDetailedGPSArea();
      if (detailedLoc && detailedLoc.formatted_address) {
        const areaStr = detailedLoc.formatted_address;
        setQuery(areaStr);
        onChange(areaStr);
        setGpsSuccessMsg("🎯 నా ప్రస్తుత ప్రాంతం విజయవంతంగా గుర్తించబడింది!");
        setShowDropdown(false);
      } else {
        setGpsSuccessMsg("GPS అందుబాటులో లేదు. దయచేసి టైప్ చేయండి.");
      }
    } catch (err) {
      console.warn("GPS error:", err);
      setGpsSuccessMsg("GPS లోపం. దయచేసి ప్రాంతాన్ని ఎంచుకోండి.");
    } finally {
      setIsDetectingGPS(false);
    }
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}

      {/* 🎯 Detect GPS Button & Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="h-11 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-70"
          title="Detect my current location using GPS"
        >
          {isDetectingGPS ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              <span>గుర్తిస్తోంది...</span>
            </>
          ) : (
            <>
              <Navigation className="size-4 text-yellow-300" />
              <span>🎯 ప్రస్తుత ప్రాంతం (Detect GPS)</span>
            </>
          )}
        </button>

        <div className="relative flex-1">
          <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-blue-600 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholder}
            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600 transition"
            required={required}
          />
        </div>
      </div>

      {/* GPS Success Notification */}
      {gpsSuccessMsg && (
        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Check className="size-3.5" />
          <span>{gpsSuccessMsg}</span>
        </div>
      )}

      {/* Live Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-2xl space-y-1 max-h-60 overflow-y-auto animate-in fade-in duration-200">
          <div className="px-2 py-1 text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] tracking-wider flex items-center gap-1 border-b border-[hsl(var(--border))]/50 mb-1">
            <Sparkles className="size-3 text-blue-500" />
            <span>సూచించిన ప్రాంతాలు (Location Suggestions)</span>
          </div>

          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectArea(sug)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 transition flex items-center gap-2"
            >
              <MapPin className="size-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{sug}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular Quick Select Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
        <span className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase shrink-0">ముఖ్య ప్రాంతాలు:</span>
        {POPULAR_PILLS.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handleSelectArea(pill)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 transition ${
              query === pill
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-[hsl(var(--muted))]/40 border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-blue-500"
            }`}
          >
            {pill.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
