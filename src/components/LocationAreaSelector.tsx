import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  X
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
  preferCityOrTown?: boolean;
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
  placeholder = "ఉదా: ఆనందపురం, కూకట్‌పల్లి, విజయవాడ... (Anandapuram, Kukatpally, Vijayawada...)",
  required = false,
  preferCityOrTown = false
}: LocationAreaSelectorProps) {
  const [isAreaConfirmed, setIsAreaConfirmed] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
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

  // Select suggestion (shows complete address, sets red border and confirmation remark)
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

  // 🎯 One-Tap Mobile Location & GPS Detection
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsErrorMsg("");

    try {
      const result: DetailedAreaResult | null = await detectDetailedGPSArea();
      
      if (result && (result.city_town || result.formatted_address)) {
        let areaStr = preferCityOrTown
          ? (result.city_town || result.suburb_village || result.district_mandal || result.formatted_address)
          : result.formatted_address;

        // 🌐 Ensure conversion into Telugu if any English text remains
        if (/[a-zA-Z]/.test(areaStr)) {
          areaStr = await convertAreaToTelugu(areaStr);
        }
        setQuery(areaStr);
        onChange(areaStr);
        setIsAreaConfirmed(true);
        setShowDropdown(false);
        setShowGpsModal(false);
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

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onChange("");
                  setIsAreaConfirmed(false);
                  setSuggestions([]);
                  setShowDropdown(false);
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
        {isAreaConfirmed ? (
          <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-red-500 pointer-events-none z-20 animate-pulse" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-blue-600 pointer-events-none z-20" />
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
          placeholder={placeholder}
          className={`w-full h-11 pl-10 pr-10 rounded-xl text-xs font-bold outline-none transition relative z-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal ${
            isAreaConfirmed
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
              setIsAreaConfirmed(false);
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 z-20"
            title="Clear text"
          >
            <X className="size-3.5" />
          </button>
        ) : null}

        {/* Live Suggestions Dropdown (Triggers on 2+ Telugu / 3+ English chars) */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl space-y-1 max-h-64 overflow-y-auto animate-in fade-in duration-150">
            <div className="px-2 py-1.5 text-[10.5px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-extrabold text-slate-800 dark:text-slate-100">సూచించిన ప్రాంతాలు (Location Suggestions)</span>
              </span>
              <span className="text-[9.5px] text-blue-600 dark:text-blue-400 font-black">తెలుగు / English</span>
            </div>

            {suggestions.length > 0 ? (
              suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectArea(sug)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-2.5 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <MapPin className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate leading-tight">{renderHighlightedText(sug, query)}</span>
                </button>
              ))
            ) : !isSearching ? (
              <div className="px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                ప్రాంతం వివరాలు కనుగొనబడలేదు. దయచేసి గ్రామం/పట్టణం సరిగ్గా టైప్ చేయండి లేదా GPS ఉపయోగించండి.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Remark Banner: Place Identified, Proceed Further */}
      {isAreaConfirmed && (
        <div className="text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-300 dark:border-red-800 flex items-center justify-between gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="size-4 text-red-600 shrink-0" />
            <span className="truncate">🎯 ప్రాంతం గుర్తించబడింది, దయచేసి ముందుకు కొనసాగండి</span>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-600 text-white shrink-0">
            గుర్తించబడింది
          </span>
        </div>
      )}

      {/* 2. 🎯 Option to Detect via Mobile Location / GPS */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="w-full h-10 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
          title="Detect my current location using Mobile Location or GPS"
        >
          {isDetectingGPS ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              <span>లొకేషన్ / GPS ద్వారా గుర్తిస్తోంది...</span>
            </>
          ) : (
            <>
              <Navigation className="size-4 text-yellow-300" />
              <span>🎯 నా ప్రస్తుత ప్రాంతం గుర్తించండి (Location / GPS)</span>
            </>
          )}
        </button>
      </div>

      {/* ⚠️ MOBILE LOCATION / GPS ENABLE GUIDANCE MODAL */}
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
                  {gpsErrorMsg.includes("పర్మిషన్") ? "లొకేషన్ పర్మిషన్ అవసరం!" : "మొబైల్ Location / GPS ఆన్ చేయండి"}
                </h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  {gpsErrorMsg.includes("పర్మిషన్") ? "Location Permission Needed" : "Enable Mobile Location / GPS"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {gpsErrorMsg}
            </p>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 space-y-2 text-[11px]">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                📍 {gpsErrorMsg.includes("పర్మిషన్") ? "పర్మిషన్ అనుమతించడానికి సూచనలు:" : "మొబైల్‌లో ఆన్ చేయడానికి సూచనలు:"}
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
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
                    <li className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
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


