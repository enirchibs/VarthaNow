import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  X,
  ChevronDown,
  Globe,
  Crosshair,
  Building2
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

export interface LocationAreaSelectorProps {
  value: string;
  onChange: (area: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  preferCityOrTown?: boolean;
  variant?: "black-box" | "form-card";
}

const POPULAR_CITIES = [
  "అన్ని నగరాలు (All Cities)",
  "విశాఖపట్నం (Visakhapatnam)",
  "విజయవాడ (Vijayawada)",
  "హైదరాబాద్ (Hyderabad)",
  "తిరుపతి (Tirupati)",
  "గుంటూరు (Guntur)",
  "వరంగల్ (Warangal)",
  "రాజమండ్రి (Rajahmundry)",
  "నెల్లూరు (Nellore)",
  "కర్నూలు (Kurnool)",
  "కాకినాడ (Kakinada)",
  "ఖమ్మం (Khammam)",
  "కరీంనగర్ (Karimnagar)",
  "నిజామాబాద్ (Nizamabad)",
  "అనంతపురం (Anantapur)",
  "కడప (Kadapa)",
  "విజయనగరం (Vizianagaram)",
  "ఏలూరు (Eluru)",
  "ఒంగోలు (Ongole)",
  "శ్రీకాకుళం (Srikakulam)"
];

const LOCAL_TOWNS_MANDALS = [
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

function renderHighlightedText(text: string, highlight: string) {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;
  const q = highlight.trim();
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    if (parts.length === 1) return <span>{text}</span>;

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span
              key={i}
              className="text-emerald-400 font-black bg-emerald-950/80 px-1 py-0.5 rounded shadow-xs"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  } catch {
    return <span>{text}</span>;
  }
}

export function LocationAreaSelector({
  value,
  onChange,
  label = "ప్రాంతం / ఏరియా / గ్రామం / పట్టణం (Area / Village / Town)",
  placeholder = "ఏరియా / గ్రామం పేరు వెతకండి (ఉదా: గాజువాక, మధురవాడ, ఆనందపురం...)",
  required = false,
  preferCityOrTown = false,
  variant = "black-box"
}: LocationAreaSelectorProps) {
  const [isAreaConfirmed, setIsAreaConfirmed] = useState(Boolean(value));
  const [query, setQuery] = useState(value || "");
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (!value) return "అన్ని నగరాలు (All Cities)";
    const found = POPULAR_CITIES.find(c => value.includes(c.split(" ")[0]));
    return found || "అన్ని నగరాలు (All Cities)";
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // GPS Error Modal state
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState("");
  const [isTeluguTyping, setIsTeluguTyping] = useState<boolean>(isTeluguTypingActive);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsTeluguTyping(customEvent.detail);
    };
    window.addEventListener(TELUGU_TYPING_EVENT, handleToggle);
    return () => window.removeEventListener(TELUGU_TYPING_EVENT, handleToggle);
  }, []);

  // Sync internal state when external value changes
  useEffect(() => {
    setQuery(value || "");
    if (value) {
      setIsAreaConfirmed(true);
      const foundCity = POPULAR_CITIES.find(c => value.includes(c.split(" ")[0]));
      if (foundCity) setSelectedCity(foundCity);
    }
  }, [value]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Instant Autocomplete when user types in Telugu (2+ chars) or English (3+ chars)
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsAreaConfirmed(false);

    const isTelugu = /[\u0C00-\u0C7F]/.test(val);
    const minChars = isTelugu ? 2 : 3;

    if (val.trim().length >= minChars) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const results = await searchAreaAutocomplete(val);
        setSuggestions(results);
      } catch (err) {
        console.warn("Autocomplete search error:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  };

  // Select suggestion from autocomplete
  const handleSelectArea = async (areaStr: string) => {
    let teluguArea = areaStr;
    if (/[a-zA-Z]/.test(teluguArea)) {
      teluguArea = await convertAreaToTelugu(teluguArea);
    }
    setQuery(teluguArea);
    onChange(teluguArea);
    setIsAreaConfirmed(true);
    setShowDropdown(false);
    setSuggestions([]);
  };

  // Select City from Dropdown
  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    if (city === "అన్ని నగరాలు (All Cities)") {
      // Don't overwrite if user already has a specific locality
      if (!query) {
        onChange("");
        setIsAreaConfirmed(false);
      }
    } else {
      setQuery(city);
      onChange(city);
      setIsAreaConfirmed(true);
    }
  };

  // 🎯 One-Tap Mobile Location & GPS Detection (Single unified GPS detector, no duplicate)
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsErrorMsg("");

    try {
      const result: DetailedAreaResult | null = await detectDetailedGPSArea();
      
      if (result && (result.city_town || result.formatted_address)) {
        let areaStr = preferCityOrTown
          ? (result.city_town || result.suburb_village || result.district_mandal || result.formatted_address)
          : result.formatted_address;

        if (/[a-zA-Z]/.test(areaStr)) {
          areaStr = await convertAreaToTelugu(areaStr);
        }
        setQuery(areaStr);
        onChange(areaStr);
        setIsAreaConfirmed(true);
        setShowDropdown(false);
        setShowCityDropdown(false);
        setShowGpsModal(false);

        // Match detected city if possible
        if (result.city_town) {
          const match = POPULAR_CITIES.find(c => c.toLowerCase().includes(result.city_town.toLowerCase()));
          if (match) setSelectedCity(match);
        }
      } else {
        const msg = result?.error_message || "మొబైల్ లొకేషన్ సేవలు లభ్యం కాలేదు. దయచేసి మొబైల్‌లో Location / GPS ఆన్ చేయండి.";
        setGpsErrorMsg(msg);
        setShowGpsModal(true);
      }
    } catch (err) {
      console.warn("GPS/Location error:", err);
      setGpsErrorMsg("లొకేషన్ గుర్తించడంలో సమస్య ఏర్పడింది. దయచేసి మొబైల్ Quick Settings లో 'Location' ఆన్ చేయండి లేదా నేరుగా ఏరియా పేరు టైప్ చేయండి.");
      setShowGpsModal(true);
    } finally {
      setIsDetectingGPS(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setIsAreaConfirmed(false);
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedCity("అన్ని నగరాలు (All Cities)");
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
            >
              క్లియర్ (Clear)
            </button>
          )}
        </div>
      )}

      {/* 🌟 UNIFIED BLACK BOX LOCATION PICKER CONTAINER */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-3 sm:p-4 border border-indigo-500/30 text-white shadow-xl space-y-2.5 relative overflow-visible z-20">
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -left-10 -top-10 size-28 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="absolute -right-10 -bottom-10 size-28 rounded-full bg-emerald-500/10 blur-2xl" />
        </div>

        {/* Row 1: City / Town Selector Pill Dropdown */}
        <div className="flex items-center justify-between gap-2 relative z-30" ref={cityDropdownRef}>
          <span className="text-[11px] font-extrabold text-zinc-300 flex items-center gap-1.5 shrink-0">
            <Building2 className="size-3.5 text-indigo-400" />
            <span>నగరం / పట్టణం:</span>
          </span>

          <div className="relative flex-1 text-right">
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="inline-flex items-center justify-between gap-1.5 w-full max-w-[260px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-black text-white transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{selectedCity}</span>
              </span>
              <ChevronDown className="size-3 text-zinc-300 shrink-0" />
            </button>

            {/* City Dropdown Menu */}
            {showCityDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-h-72 overflow-y-auto rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-indigo-500/40 shadow-2xl p-2 z-[9999] text-xs text-white divide-y divide-slate-800 text-left animate-in fade-in-50 zoom-in-95">
                {/* Option 1: All Cities */}
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCity("అన్ని నగరాలు (All Cities)")}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-black text-xs transition cursor-pointer ${
                      selectedCity === "అన్ని నగరాలు (All Cities)"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-200 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="size-4 text-emerald-400 shrink-0" />
                      <span>🌐 అన్ని నగరాలు (All Cities)</span>
                    </span>
                    {selectedCity === "అన్ని నగరాలు (All Cities)" && <Check className="size-4 text-white shrink-0" />}
                  </button>
                </div>

                {/* Option 2: 1-Tap GPS inside dropdown */}
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCityDropdown(false);
                      handleDetectGPS();
                    }}
                    disabled={isDetectingGPS}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isDetectingGPS ? (
                      <RefreshCw className="size-4 animate-spin text-white shrink-0" />
                    ) : (
                      <Crosshair className="size-4 text-emerald-200 shrink-0" />
                    )}
                    <span>🎯 నా ప్రస్తుత ప్రాంతం ఉపయోగించండి (GPS)</span>
                  </button>
                </div>

                {/* Major AP & TG Cities */}
                <div className="p-1.5 space-y-0.5">
                  <div className="text-[10px] font-black uppercase text-indigo-400 px-2 py-1 tracking-wider">
                    🏙️ AP & TG ప్రధాన నగరాలు (Main Cities)
                  </div>
                  {POPULAR_CITIES.slice(1).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city)}
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

                {/* Popular Local Towns & Mandals */}
                <div className="p-1.5 space-y-0.5">
                  <div className="text-[10px] font-black uppercase text-emerald-400 px-2 py-1 tracking-wider">
                    📍 లోకల్ టౌన్లు & మండలాలు (Towns & Mandals)
                  </div>
                  {LOCAL_TOWNS_MANDALS.map((town) => (
                    <button
                      key={town}
                      type="button"
                      onClick={() => handleSelectCity(town)}
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

        {/* Row 2: Area / Locality Search Bar with Autocomplete */}
        <div className="relative z-20">
          <div className="relative">
            {isAreaConfirmed ? (
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-400 pointer-events-none z-10 animate-pulse" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-300 pointer-events-none z-10" />
            )}
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onBlur={async () => {
                if (query && !/[\u0C00-\u0C7F]/.test(query) && query.trim().length >= 3) {
                  const te = await convertAreaToTelugu(query);
                  if (te && te !== query) {
                    setQuery(te);
                    onChange(te);
                  }
                }
              }}
              onFocus={async () => {
                const isTelugu = /[\u0C00-\u0C7F]/.test(query);
                const minChars = isTelugu ? 2 : 3;
                if (query.trim().length >= minChars) {
                  setShowDropdown(true);
                  if (suggestions.length === 0) {
                    setIsSearching(true);
                    const results = await searchAreaAutocomplete(query);
                    setSuggestions(results);
                    setIsSearching(false);
                  }
                }
              }}
              placeholder={
                isTeluguTyping
                  ? "ప్రాంతం పేరు తెలుగులో టైప్ చేయండి (ఉదా: guntur + Space = గుంటూరు)..."
                  : placeholder
              }
              className={`w-full h-11 pl-9 pr-20 rounded-xl text-xs font-bold transition text-white placeholder:text-zinc-400 placeholder:font-normal focus:outline-none ${
                isAreaConfirmed
                  ? "bg-emerald-950/40 border-2 border-emerald-500/80 ring-2 ring-emerald-500/20"
                  : "bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              }`}
              required={required}
            />

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
              {/* ⌨️ Telugu / English Switcher */}
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
                    ? "తెలుగు టైపింగ్ ఆన్ (raithu + Space = రైతు). ఇంగ్లీష్ కోసం క్లిక్ చేయండి"
                    : "English typing. Click for Telugu"
                }
              >
                {isTeluguTyping ? "తె" : "En"}
              </button>

              {isSearching ? (
                <RefreshCw className="size-4 text-indigo-400 animate-spin" />
              ) : query ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
                  title="Clear text"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] rounded-2xl border border-indigo-500/40 bg-slate-900/98 backdrop-blur-xl p-2 shadow-2xl space-y-1 max-h-60 overflow-y-auto text-xs text-white animate-in fade-in duration-150 divide-y divide-slate-800">
              <div className="px-2 py-1 text-[10.5px] font-black uppercase text-indigo-300 tracking-wider flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-400" />
                  <span>సూచించిన ప్రాంతాలు (Location Suggestions)</span>
                </span>
                <span className="text-[9.5px] text-emerald-400 font-black">తెలుగు / English</span>
              </div>

              {suggestions.length > 0 ? (
                <div className="p-1 space-y-0.5">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectArea(sug)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:bg-indigo-600 hover:text-white transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate flex items-center gap-2">
                        <MapPin className="size-3.5 text-indigo-400 shrink-0" />
                        <span>{renderHighlightedText(sug, query)}</span>
                      </span>
                      <Check className="size-3.5 text-emerald-400 shrink-0 opacity-60" />
                    </button>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="px-3 py-2 text-xs font-medium text-zinc-400">
                  ప్రాంతం వివరాలు కనుగొనబడలేదు. దయచేసి గ్రామం/పట్టణం సరిగ్గా టైప్ చేయండి లేదా GPS ఉపయోగించండి.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Row 3: 1-Tap GPS Button & Confirmation Remarks */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
          {/* 1-Tap GPS Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetectingGPS}
            className="flex-1 h-9 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 border border-emerald-400/30"
            title="మీ ప్రస్తుత GPS ప్రాంతాన్ని ఆటోమేటిక్‌గా గుర్తించండి"
          >
            {isDetectingGPS ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>GPS ద్వారా గుర్తిస్తోంది...</span>
              </>
            ) : (
              <>
                <Navigation className="size-3.5 text-emerald-200" />
                <span>🎯 నా ప్రస్తుత ప్రాంతం గుర్తించండి (GPS)</span>
              </>
            )}
          </button>
        </div>

        {/* Remark Banner: Place Identified, Proceed Further */}
        {isAreaConfirmed && (
          <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 truncate">
              <Check className="size-4 text-emerald-400 shrink-0" />
              <span className="truncate">🎯 ప్రాంతం గుర్తించబడింది: <b className="text-white">{query}</b></span>
            </div>
            <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white shrink-0">
              గుర్తించబడింది ✓
            </span>
          </div>
        )}
      </div>

      {/* ⚠️ MOBILE LOCATION / GPS ENABLE GUIDANCE MODAL */}
      {showGpsModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-amber-500/40 space-y-4 relative text-white">
            <button
              type="button"
              onClick={() => setShowGpsModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  {gpsErrorMsg.includes("పర్మిషన్") ? "లొకేషన్ పర్మిషన్ అవసరం!" : "మొబైల్ Location / GPS ఆన్ చేయండి"}
                </h3>
                <p className="text-[11px] text-amber-400 font-bold">
                  {gpsErrorMsg.includes("పర్మిషన్") ? "Location Permission Needed" : "Enable Mobile Location / GPS"}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              {gpsErrorMsg}
            </p>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-[11px]">
              <div className="font-bold text-zinc-200">
                📍 {gpsErrorMsg.includes("పర్మిషన్") ? "పర్మిషన్ అనుమతించడానికి సూచనలు:" : "మొబైల్‌లో ఆన్ చేయడానికి సూచనలు:"}
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 font-medium">
                {gpsErrorMsg.includes("పర్మిషన్") ? (
                  <>
                    <li>బ్రౌజర్ అడ్రస్ బార్‌లోని <b>🔒 లాక్ (Lock) / Tune</b> ఐకాన్‌పై క్లిక్ చేయండి.</li>
                    <li><b>Permissions</b> విభాగంలో <b>Location</b> ని <b>Allow</b> చేయండి.</li>
                    <li>క్రింది 'మళ్ళీ ప్రయత్నించండి' బటన్ నొక్కండి.</li>
                  </>
                ) : (
                  <>
                    <li>
                      మొబైల్ స్క్రీన్ పైభాగం నుండి క్రిందికి స్వైప్ చేసి (Quick Settings) <b>"Location" (లొకేషన్)</b> లేదా <b>"GPS"</b> ఐకాన్ ఆన్ చేయండి.
                    </li>
                    <li className="text-[10px] text-indigo-400 font-bold">
                      (గమనిక: మొబైల్స్‌లో GPS బదులుగా "Location" అని పేరు ఉంటుంది).
                    </li>
                    <li>
                      బ్రౌజర్‌లో <b>"Allow Location"</b> లేదా <b>"While using the app"</b> ప్రాంప్ట్ వచ్చినప్పుడు అనుమతించండి.
                    </li>
                  </>
                )}
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGpsModal(false);
                  handleDetectGPS();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="size-4" />
                <span>మళ్ళీ ప్రయత్నించండి (Retry Location)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
