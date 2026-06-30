import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useBirthLocation, LocationSuggestion } from "@/hooks/useBirthLocation";

interface BirthLocationSelectorProps {
  lang: string;
  onSelect: (loc: LocationSuggestion | null) => void;
  selectedLocation: LocationSuggestion | null;
}

export function BirthLocationSelector({ lang, onSelect, selectedLocation }: BirthLocationSelectorProps) {
  const {
    query,
    suggestions,
    isLoading,
    error,
    handleSearch,
    resolveLocationDetails,
    setQuery,
    setSuggestions
  } = useBirthLocation(lang);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial or reset location to local query text
  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.location_name);
    } else {
      setQuery("");
    }
  }, [selectedLocation, setQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectSuggestion = async (index: number) => {
    const rawSuggestion = suggestions[index];
    if (!rawSuggestion) return;

    setIsOpen(false);
    setActiveIndex(-1);
    
    const resolved = await resolveLocationDetails(rawSuggestion);
    setQuery(resolved.location_name);
    onSelect(resolved);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectSuggestion(activeIndex);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setActiveIndex(-1);
    
    if (!value) {
      onSelect(null);
    }
    handleSearch(value);
  };

  const isTe = lang === "te";
  const label = isTe ? "పుట్టిన స్థలం" : "Birth Location";
  const placeholder = isTe 
    ? "జన్మ గ్రామం, పట్టణం, నగరం లేదా జిల్లా ద్వారా వెతకండి" 
    : "Search Birth Village, Town, City or District";
  const helperLabel = isTe ? "ఉదాహరణలు:" : "Examples:";
  const examples = ["Visakhapatnam", "Madhurawada", "Gajuwaka", "Rajahmundry", "Hyderabad", "Bengaluru"];

  return (
    <div ref={containerRef} className="space-y-1.5 relative w-full">
      <label className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider block">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full text-xs font-bold pl-9.5 pr-9.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
          aria-autocomplete="list"
          aria-controls="location-suggestions-list"
          aria-expanded={isOpen}
        />
        
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
          <Search className="size-4" />
        </div>

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && query.trim().length >= 2 && (
        <div 
          id="location-suggestions-list"
          role="listbox"
          className="absolute z-[999] left-0 right-0 top-[calc(100%+4px)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl shadow-lg max-h-60 overflow-y-auto no-scrollbar overflow-x-hidden animate-fadeIn"
        >
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const active = idx === activeIndex;
              
              // Format display text - Location Name, with District and State underneath
              const districtText = item.district 
                ? `${item.district}${item.district.toLowerCase().includes("district") ? "" : " District"}` 
                : "";
              const locationParts = [districtText, item.state].filter(Boolean);
              const subtext = locationParts.join(", ");
              
              return (
                <div
                  key={idx}
                  role="option"
                  aria-selected={active}
                  onClick={() => selectSuggestion(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex gap-3 items-center px-4 py-3 cursor-pointer select-none transition min-h-[44px] ${
                    active ? "bg-amber-500/10 text-[hsl(var(--foreground))]" : "text-[hsl(var(--foreground))]/90"
                  }`}
                >
                  <MapPin className={`size-4.5 shrink-0 ${active ? "text-amber-500" : "text-[hsl(var(--muted-foreground))]"}`} />
                  <div className="text-left w-full overflow-hidden">
                    <p className="text-xs font-extrabold truncate">{item.location_name}</p>
                    {subtext && <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold truncate mt-0.5">{subtext}</p>}
                  </div>
                  {item.is_cached && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                      {isTe ? "సేవ్ చేయబడింది" : "Cached"}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            !isLoading && (
              <div className="px-4 py-4 text-center text-xs font-bold text-[hsl(var(--muted-foreground))]">
                {isTe ? "ఫలితాలు కనుగొనబడలేదు" : "No results found"}
              </div>
            )
          )}
        </div>
      )}

      {/* Examples helper text */}
      <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] leading-normal block">
        <span className="font-extrabold text-amber-600/90 mr-1">{helperLabel}</span>
        {examples.join(", ")}
      </span>
      
      {error && (
        <span className="text-[10px] font-bold text-red-500 block">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
