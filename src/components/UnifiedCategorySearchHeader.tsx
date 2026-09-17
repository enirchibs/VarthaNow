import React, { useState, useRef, useEffect } from "react";
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  Check, 
  Crosshair, 
  RefreshCw, 
  Globe, 
  X,
  Compass
} from "lucide-react";
import { 
  detectDetailedGPSArea, 
  searchAreaAutocomplete, 
  convertAreaToTelugu,
  DetailedAreaResult
} from "@/lib/location-detector";
import { 
  isTeluguTypingActive, 
  setTeluguTypingActive, 
  TELUGU_TYPING_EVENT 
} from "@/lib/telugu-typing";
import { TeluguTypingBanner } from "./TeluguTypingBanner";

export interface UnifiedCategorySearchHeaderProps {
  moduleName: string;
  moduleBadge: string;
  tagline: string;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedAreaLocality: string;
  onSelectAreaLocality: (area: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  radiusOptions?: number[];
  extraHeaderRight?: React.ReactNode;
}

const AP_TG_CITIES = [
  "హైదరాబాద్ (Hyderabad)",
  "విశాఖపట్నం (Visakhapatnam)",
  "విజయవాడ (Vijayawada)",
  "తిరుపతి (Tirupati)",
  "వరంగల్ (Warangal)",
  "గుంటూరు (Guntur)",
  "నెల్లూరు (Nellore)",
  "కర్నూలు (Kurnool)",
  "రాజమండ్రి (Rajahmundry)",
  "కాకినాడ (Kakinada)",
  "ఖమ్మం (Khammam)",
  "నిజామాబాద్ (Nizamabad)",
  "కరీంనగర్ (Karimnagar)",
  "అనంతపురం (Anantapur)",
  "కడప (Kadapa)",
  "విజయనగరం (Vizianagaram)",
  "ఏలూరు (Eluru)",
  "ఒంగోలు (Ongole)",
  "శ్రీకాకుళం (Srikakulam)"
];

const LOCAL_TOWNS = [
  "మధురవాడ (Madhurawada, Vizag)",
  "గాజువాక (Gajuwaka, Vizag)",
  "ఎంవీపీ కాలనీ (MVP Colony, Vizag)",
  "డాబాగార్డెన్స్ (Daba Gardens, Vizag)",
  "సీతమ్మధార (Seethammadhara, Vizag)",
  "ఆనందపురం (Anandapuram)",
  "సబ్బవరం (Sabbavaram)",
  "అనకాపల్లి (Anakapalle)",
  "భీమునిపట్నం (Bheemunipatnam)",
  "పెందుర్తి (Pendurthi)",
  "బెంజ్ సర్కిల్ (Benz Circle, Vijayawada)",
  "కూకట్‌పల్లి (Kukatpally, Hyderabad)",
  "హైటెక్ సిటీ (Hitec City, Hyderabad)",
  "గచ్చిబౌలి (Gachibowli, Hyderabad)",
  "మంగళగిరి (Mangalagiri)"
];

export function UnifiedCategorySearchHeader({
  moduleName,
  moduleBadge,
  tagline,
  selectedCity,
  onSelectCity,
  selectedAreaLocality,
  onSelectAreaLocality,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  searchPlaceholder = "వెతకండి... (Search)",
  radiusKm,
  onRadiusChange,
  radiusOptions = [5, 10, 25, 50],
  extraHeaderRight
}: UnifiedCategorySearchHeaderProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [areaSuggestions, setAreaSuggestions] = useState<string[]>([]);
  const [isGPSDetecting, setIsGPSDetecting] = useState(false);
  const [isTeluguTyping, setIsTeluguTyping] = useState<boolean>(isTeluguTypingActive);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  // Sync Telugu typing state with global event
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsTeluguTyping(customEvent.detail);
    };
    window.addEventListener(TELUGU_TYPING_EVENT, handleToggle);
    return () => window.removeEventListener(TELUGU_TYPING_EVENT, handleToggle);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target as Node)) {
        setIsAreaDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Area input autocomplete
  const handleAreaInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSelectAreaLocality(val);

    const isTelugu = /[\u0C00-\u0C7F]/.test(val);
    const minChars = isTelugu ? 2 : 3;

    if (val.trim().length >= minChars) {
      try {
        const results = await searchAreaAutocomplete(val);
        setAreaSuggestions(results);
        setIsAreaDropdownOpen(results.length > 0);
      } catch (err) {
        console.warn("Area search error:", err);
      }
    } else {
      setAreaSuggestions([]);
      setIsAreaDropdownOpen(false);
    }
  };

  // 1-Tap GPS Detection
  const handleDetectGPS = async () => {
    setIsGPSDetecting(true);
    try {
      const result: DetailedAreaResult | null = await detectDetailedGPSArea();
      if (result && (result.city_town || result.formatted_address)) {
        let areaStr = result.formatted_address || result.city_town;
        if (/[a-zA-Z]/.test(areaStr)) {
          areaStr = await convertAreaToTelugu(areaStr);
        }
        onSelectAreaLocality(areaStr);
        if (result.city_town) {
          const match = AP_TG_CITIES.find((c) => c.toLowerCase().includes(result.city_town.toLowerCase()));
          if (match) {
            onSelectCity(match);
          }
        }
      }
    } catch (err) {
      console.warn("GPS detection error:", err);
    } finally {
      setIsGPSDetecting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 sm:p-5 shadow-xl border border-indigo-500/20 relative z-30 space-y-2.5">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -left-16 -top-16 size-36 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 size-36 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      {/* Row 1: Brand / Category Header & City Selector */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  {moduleName}
                </span>
              </span>
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {moduleBadge}
              </span>
            </div>
            <p className="text-[10.5px] sm:text-xs font-bold text-zinc-300">
              {tagline}
            </p>
          </div>

          {/* City / Town Selector Dropdown Pill */}
          <div className="relative" ref={cityDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-white transition active:scale-95 cursor-pointer shadow-xs"
            >
              <MapPin className="size-3.5 text-rose-400 shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-[240px]">
                {selectedCity || "అన్ని నగరాలు (All Cities)"}
              </span>
              <ChevronDown className="size-3 text-zinc-300 shrink-0" />
            </button>

            {/* City Dropdown Menu */}
            {isCityDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-indigo-500/40 shadow-2xl p-2 z-[60] text-xs text-white divide-y divide-slate-800 animate-in fade-in-50 zoom-in-95">
                {/* All Cities Option */}
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCity("అన్ని నగరాలు (All Cities)");
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-black text-xs transition cursor-pointer ${
                      selectedCity === "అన్ని నగరాలు (All Cities)" || !selectedCity
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-200 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="size-4 text-emerald-400 shrink-0" />
                      <span>🌐 అన్ని నగరాలు & ప్రాంతాలు (All Cities)</span>
                    </span>
                    {(selectedCity === "అన్ని నగరాలు (All Cities)" || !selectedCity) && (
                      <Check className="size-4 text-white shrink-0" />
                    )}
                  </button>
                </div>

                {/* 1-Tap GPS inside dropdown */}
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCityDropdownOpen(false);
                      handleDetectGPS();
                    }}
                    disabled={isGPSDetecting}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer"
                  >
                    {isGPSDetecting ? (
                      <RefreshCw className="size-4 animate-spin text-white shrink-0" />
                    ) : (
                      <Crosshair className="size-4 text-emerald-200 shrink-0" />
                    )}
                    <span>🎯 ప్రస్తుత స్థానం ఉపయోగించండి (GPS)</span>
                  </button>
                </div>

                {/* AP & TG Main Cities */}
                <div className="p-1.5 space-y-0.5">
                  <div className="text-[10px] font-black uppercase text-indigo-400 px-2 py-1 tracking-wider">
                    🏙️ AP & TG ప్రధాన నగరాలు (Main Cities)
                  </div>
                  {AP_TG_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        onSelectCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        selectedCity === city
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{city}</span>
                      {selectedCity === city && <Check className="size-3.5 text-white shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Local Towns & Mandals */}
                <div className="p-1.5 space-y-0.5">
                  <div className="text-[10px] font-black uppercase text-emerald-400 px-2 py-1 tracking-wider">
                    📍 లోకల్ టౌన్లు & మండలాలు (Towns & Mandals)
                  </div>
                  {LOCAL_TOWNS.map((town) => (
                    <button
                      key={town}
                      type="button"
                      onClick={() => {
                        onSelectCity(town);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        selectedCity === town
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{town}</span>
                      {selectedCity === town && <Check className="size-3.5 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Extra Right content (e.g. notifications or action button) */}
        {extraHeaderRight && (
          <div className="shrink-0 flex items-center gap-2">
            {extraHeaderRight}
          </div>
        )}
      </div>

      {/* Row 2: Locality / Area Search Bar with Autocomplete + 1-Tap GPS */}
      <div className="flex flex-col sm:flex-row gap-2 relative z-20">
        <div className="relative flex-1" ref={areaDropdownRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-400 shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="ఏరియా / లోకల్ పట్టణం పేరుతో వెతకండి (ఉదా: గాజువాక, మధురవాడ, కూకట్‌పల్లి...)"
              value={selectedAreaLocality}
              onChange={handleAreaInputChange}
              onFocus={() => {
                if (areaSuggestions.length > 0) setIsAreaDropdownOpen(true);
              }}
              className="w-full h-10 pl-9 pr-8 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder:text-zinc-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner transition"
            />
            {selectedAreaLocality && (
              <button
                type="button"
                onClick={() => {
                  onSelectAreaLocality("");
                  setIsAreaDropdownOpen(false);
                  setAreaSuggestions([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-full cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isAreaDropdownOpen && areaSuggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 w-full max-h-56 overflow-y-auto rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-emerald-500/40 shadow-2xl p-1.5 z-[75] text-xs text-white divide-y divide-slate-800 animate-in fade-in-50 zoom-in-95">
              <div className="px-2.5 py-1 text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                📍 సరిపోలిన ప్రాంతాలు (Matching Areas)
              </div>
              <div className="p-1 space-y-0.5">
                {areaSuggestions.map((sug, idx) => (
                  <button
                    key={`${sug}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectAreaLocality(sug);
                      setIsAreaDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold text-xs text-zinc-200 hover:bg-emerald-600/30 hover:text-white transition cursor-pointer"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-emerald-400 shrink-0" />
                      {sug}
                    </span>
                    <Check className="size-3.5 text-emerald-400 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap GPS Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isGPSDetecting}
          className="h-10 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md border border-emerald-400/30 transition cursor-pointer shrink-0 disabled:opacity-60"
          title="మీ ప్రస్తుత GPS ప్రాంతాన్ని ఆటోమేటిక్‌గా గుర్తించండి"
        >
          {isGPSDetecting ? (
            <RefreshCw className="size-4 animate-spin text-white shrink-0" />
          ) : (
            <Crosshair className="size-4 text-emerald-200 shrink-0" />
          )}
          <span>{isGPSDetecting ? "గుర్తిస్తున్నాం..." : "🎯 నా ప్రాంతం (GPS)"}</span>
        </button>
      </div>

      {/* Row 3: Keyword Search Bar */}
      <div className="relative z-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-300 pointer-events-none" />
        <input
          type="text"
          placeholder={
            isTeluguTyping
              ? "తెలుగులో వెతకండి (ఉదా: raithu + Space = రైతు)..."
              : searchPlaceholder
          }
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearchSubmit) {
              onSearchSubmit();
            }
          }}
          className="w-full h-10 pl-9 pr-32 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder:text-zinc-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner transition"
        />

        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              className="text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}

          {/* ⌨️ Telugu / English Typing Switcher Pill */}
          <button
            type="button"
            onClick={() => setTeluguTypingActive(!isTeluguTyping)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer select-none ${
              isTeluguTyping
                ? "bg-amber-500/90 border-amber-300 text-white shadow-xs"
                : "bg-white/10 border-white/20 text-zinc-300 hover:text-white"
            }`}
            title={
              isTeluguTyping
                ? "తెలుగు టైపింగ్ ఆన్ (ఇంగ్లీష్‌లో టైప్ చేసి స్పేస్ నొక్కండి). ఇంగ్లీష్ కోసం క్లిక్ చేయండి"
                : "English typing. Click for Telugu"
            }
          >
            {isTeluguTyping ? "తె ఆన్" : "En"}
          </button>

          <button
            type="button"
            onClick={() => onSearchSubmit && onSearchSubmit()}
            className="h-7 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-black tracking-wide transition active:scale-95 shadow cursor-pointer"
          >
            వెతకండి
          </button>
        </div>
      </div>

      {/* ⌨️ Telugu Typing Enabled Helper Banner */}
      <TeluguTypingBanner compact={true} className="mt-1.5" />

      {/* Row 4: Distance / Radius Filter Pills (if radius handler provided) */}
      {onRadiusChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/10 relative z-10 text-xs font-bold">
          <span className="text-[11px] text-zinc-300 flex items-center gap-1 shrink-0 mr-1">
            <Compass className="size-3.5 text-emerald-400" />
            <span>పరిధి:</span>
          </span>
          <button
            type="button"
            onClick={() => onRadiusChange(0)}
            className={`px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer shrink-0 text-[11px] font-bold ${
              radiusKm === 0
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-zinc-300"
            }`}
          >
            అన్నీ
          </button>
          {radiusOptions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRadiusChange(r)}
              className={`px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer shrink-0 text-[11px] font-bold ${
                radiusKm === r
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-zinc-300"
              }`}
            >
              {r} km లోపు
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
