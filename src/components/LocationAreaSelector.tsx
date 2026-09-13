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
  Languages
} from "lucide-react";
import { 
  detectDetailedGPSArea, 
  searchAreaAutocomplete, 
  convertAreaToTelugu,
  DetailedAreaResult
} from "@/lib/location-detector";

interface LocationAreaSelectorProps {
  value: string;
  onChange: (area: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

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
              className="text-blue-600 dark:text-blue-400 font-black bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded shadow-xs"
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
  label = "ప్రాంతం / ఏరియా / గ్రామం / మండలం (Area / Village / Mandal)",
  placeholder = "గ్రామం, మండలం లేదా పట్టణం పేరు టైప్ చేయండి (తెలుగు లేదా English)...",
  required = false
}: LocationAreaSelectorProps) {
  const [isGpsSelected, setIsGpsSelected] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState("");
  
  // GPS Error Modal state
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState("");

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

  // 🔍 Instant Autocomplete when user types in Telugu (2+ chars) or English (3+ chars)
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setGpsSuccessMsg("");
    setIsGpsSelected(false);

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

  // Select suggestion
  const handleSelectArea = (areaStr: string) => {
    setQuery(areaStr);
    onChange(areaStr);
    setIsGpsSelected(false);
    setShowDropdown(false);
    setSuggestions([]);
  };

  // 🎯 One-Tap GPS Detection
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsSuccessMsg("");
    setGpsErrorMsg("");

    try {
      const result: DetailedAreaResult | null = await detectDetailedGPSArea();
      
      if (result && result.formatted_address) {
        let areaStr = result.formatted_address;
        // 🌐 Ensure conversion into Telugu if English text remains
        if (!/[\u0C00-\u0C7F]/.test(areaStr)) {
          areaStr = await convertAreaToTelugu(areaStr);
        }
        setQuery(areaStr);
        onChange(areaStr);
        setIsGpsSelected(true);
        setGpsSuccessMsg(`🎯 నా ప్రస్తుత ప్రాంతం గుర్తించబడింది: ${areaStr}`);
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

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2 shrink-0">
            {query && /[a-zA-Z]/.test(query) && (
              <button
                type="button"
                onClick={async () => {
                  const te = await convertAreaToTelugu(query);
                  if (te && te !== query) {
                    setQuery(te);
                    onChange(te);
                  }
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
                title="Convert location name to Telugu"
              >
                <Languages className="size-3" />
                <span>తెలుగులోకి మార్చు</span>
              </button>
            )}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onChange("");
                  setIsGpsSelected(false);
                  setSuggestions([]);
                  setShowDropdown(false);
                  setGpsSuccessMsg("");
                }}
                className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                క్లియర్ (Clear)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. 🔍 First: Search Area by Name */}
      <div className="relative">
        {isGpsSelected ? (
          <Navigation className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-red-500 pointer-events-none z-20 animate-pulse" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-blue-600 pointer-events-none z-20" />
        )}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
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
          placeholder={placeholder}
          className={`w-full h-11 pl-10 pr-10 rounded-xl text-xs font-bold outline-none transition relative z-10 text-slate-900 dark:text-slate-100 ${
            isGpsSelected
              ? "border-2 border-red-500 ring-4 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20 shadow-sm"
              : "border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          }`}
          required={required}
        />
        {isSearching ? (
          <RefreshCw className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-blue-500 animate-spin z-20" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              setIsGpsSelected(false);
              setSuggestions([]);
              setShowDropdown(false);
              setGpsSuccessMsg("");
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 z-20"
            title="Clear text"
          >
            <X className="size-3.5" />
          </button>
        ) : null}

        {/* Live Suggestions Dropdown (Triggers on 2+ Telugu / 3+ English chars) */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-[hsl(var(--border))] bg-white dark:bg-slate-900 p-2 shadow-2xl space-y-1 max-h-60 overflow-y-auto animate-in fade-in duration-150">
            <div className="px-2 py-1 text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] tracking-wider flex items-center justify-between border-b border-[hsl(var(--border))]/50 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-blue-500" />
                <span>సూచించిన ప్రాంతాలు (Location Suggestions)</span>
              </span>
              <span className="text-[9px] text-blue-500 font-bold">తెలుగు / English</span>
            </div>

            {suggestions.length > 0 ? (
              suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectArea(sug)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 transition flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="size-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{renderHighlightedText(sug, query)}</span>
                </button>
              ))
            ) : !isSearching ? (
              <div className="px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                ప్రాంతం వివరాలు కనుగొనబడలేదు. దయచేసి గ్రామం/పట్టణం సరిగ్గా టైప్ చేయండి లేదా GPS ఉపయోగించండి.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* GPS Selected Notification Badge */}
      {isGpsSelected && (
        <div className="text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-xl border border-red-300 dark:border-red-800 flex items-center justify-between gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 truncate">
            <Navigation className="size-3.5 text-red-600 shrink-0 animate-pulse" />
            <span className="truncate">🎯 GPS ద్వారా ప్రాంతం నిర్ధారించబడింది</span>
          </div>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-red-600 text-white shrink-0">
            GPS
          </span>
        </div>
      )}

      {/* 2. 🎯 Option to Detect via GPS */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="w-full h-10 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
          title="Detect my current location using GPS"
        >
          {isDetectingGPS ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              <span>GPS ద్వారా గుర్తిస్తోంది...</span>
            </>
          ) : (
            <>
              <Navigation className="size-4 text-yellow-300" />
              <span>🎯 నా ప్రస్తుత ప్రాంతం గుర్తించండి (Detect GPS)</span>
            </>
          )}
        </button>
      </div>

      {/* GPS Success Notification */}
      {gpsSuccessMsg && (
        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-200">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span className="truncate">{gpsSuccessMsg}</span>
        </div>
      )}

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


