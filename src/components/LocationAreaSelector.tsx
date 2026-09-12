import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Building2, 
  AlertTriangle, 
  X, 
  SlidersHorizontal
} from "lucide-react";
import { 
  detectDetailedGPSArea, 
  searchAreaAutocomplete, 
  PRELOADED_AP_TS_LOCATIONS,
  AP_TS_DISTRICTS_MANDALS,
  DistrictMandalData,
  DetailedAreaResult
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
  
  // GPS Error Modal state
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState("");
  
  // Structured District -> Mandal -> Village Picker state
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedMandal, setSelectedMandal] = useState<string>("");
  const [specificVillage, setSpecificVillage] = useState<string>("");

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
    setShowDistrictPicker(false);
  };

  // 🎯 One-Tap GPS Detection with Permission Guard
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsSuccessMsg("");
    setGpsErrorMsg("");

    try {
      const result: DetailedAreaResult | null = await detectDetailedGPSArea();
      
      if (result && result.formatted_address) {
        const areaStr = result.formatted_address;
        setQuery(areaStr);
        onChange(areaStr);
        setGpsSuccessMsg("🎯 నా ప్రస్తుత ప్రాంతం విజయవంతంగా గుర్తించబడింది!");
        setShowDropdown(false);
        setShowGpsModal(false);
      } else {
        const msg = result?.error_message || "GPS సేవలు లభ్యం కాలేదు. దయచేసి పరికరంలో Location/GPS ఆన్ చేయండి.";
        setGpsErrorMsg(msg);
        setShowGpsModal(true);
      }
    } catch (err) {
      console.warn("GPS error:", err);
      setGpsErrorMsg("GPS లోపం జరిగింది. దయచేసి Location Service ఆన్ చేయండి.");
      setShowGpsModal(true);
    } finally {
      setIsDetectingGPS(false);
    }
  };

  // District Selection Handler
  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    setSelectedMandal("");
    setSpecificVillage("");
  };

  // Mandal Selection Handler
  const handleMandalChange = (mandalName: string) => {
    setSelectedMandal(mandalName);
    const formatted = specificVillage 
      ? `${specificVillage}, ${mandalName}, ${selectedDistrict.split(" ")[0]}` 
      : `${mandalName}, ${selectedDistrict.split(" ")[0]}`;
    setQuery(formatted);
    onChange(formatted);
  };

  // Specific Village/Street Handler
  const handleVillageChange = (vName: string) => {
    setSpecificVillage(vName);
    if (selectedMandal && selectedDistrict) {
      const formatted = vName 
        ? `${vName}, ${selectedMandal}, ${selectedDistrict.split(" ")[0]}` 
        : `${selectedMandal}, ${selectedDistrict.split(" ")[0]}`;
      setQuery(formatted);
      onChange(formatted);
    }
  };

  // Find mandals for current district
  const currentDistrictObj = AP_TS_DISTRICTS_MANDALS.find(
    (d) => d.district_te === selectedDistrict || d.district_en === selectedDistrict
  );

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            onClick={() => setShowDistrictPicker(!showDistrictPicker)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="size-3" />
            <span>{showDistrictPicker ? "సెర్చ్ మోడ్" : "🏛️ జిల్లా & మండలం ఎంచుకోండి"}</span>
          </button>
        </div>
      )}

      {/* 🎯 Detect GPS Button & Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="h-11 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-70 cursor-pointer"
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

      {/* Structured District -> Mandal -> Village Accordion Selector */}
      {showDistrictPicker && (
        <div className="p-3 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-black uppercase text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" />
              జిల్లా, మండలం & గ్రామం ఎంచుకోండి (Structured Selector)
            </span>
            <button 
              type="button" 
              onClick={() => setShowDistrictPicker(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Step 1: Select District */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                1. జిల్లా ఎంచుకోండి (District)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">-- జిల్లా ఎంచుకోండి --</option>
                {AP_TS_DISTRICTS_MANDALS.map((d) => (
                  <option key={d.district_en} value={d.district_te}>
                    {d.district_te}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Mandal */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                2. మండలం / టౌన్ ఎంచుకోండి (Mandal / Town)
              </label>
              <select
                value={selectedMandal}
                onChange={(e) => handleMandalChange(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="">-- మండలం ఎంచుకోండి --</option>
                {currentDistrictObj?.mandals.map((m) => (
                  <option key={m.name_en} value={m.name_te}>
                    {m.name_te}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Specific Village / Street (Optional) */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 mb-1">
              3. నిర్దిష్ట గ్రామం / వీధి / కాలనీ (Village / Street / Colony - optional)
            </label>
            <input
              type="text"
              value={specificVillage}
              onChange={(e) => handleVillageChange(e.target.value)}
              placeholder="ఉదా: గాంధీనగర్, మెయిన్ రోడ్డు..."
              disabled={!selectedMandal}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

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
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 transition flex items-center gap-2 cursor-pointer"
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
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 transition cursor-pointer ${
              query === pill
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-[hsl(var(--muted))]/40 border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-blue-500"
            }`}
          >
            {pill.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* ⚠️ GPS ENABLE GUIDANCE MODAL */}
      {showGpsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-amber-500/30 space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowGpsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  GPS Location సేవలు అవసరం!
                </h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  Enable GPS Location Services
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {gpsErrorMsg}
            </p>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 space-y-2 text-[11px]">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                📍 GPS ని ఆన్ చేయడానికి సూచనలు:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>మీ ఫోన్ పైన Quick Settings ను క్రిందికి స్వైప్ చేయండి.</li>
                <li><b>Location / GPS</b> ఐకాన్ పైన టాప్ చేసి <b>ON</b> చేయండి.</li>
                <li>మీ బ్రౌజర్‌లో <b>Allow Location Access</b> ని ఎంచుకోండి.</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGpsModal(false);
                  handleDetectGPS();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="size-4" />
                <span>మళ్ళీ ప్రయత్నించండి (Retry GPS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowGpsModal(false);
                  setShowDistrictPicker(true);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                🏛️ జిల్లా & మండలం నేరుగా ఎంచుకోండి
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

