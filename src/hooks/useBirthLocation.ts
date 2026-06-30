import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface LocationSuggestion {
  location_name: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
  country: string;
  pin_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
  is_cached?: boolean;
}

// Helper to generate a Google Places Session Token (UUID v4 format)
const generateSessionToken = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function useBirthLocation(lang: string = "te") {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionTokenRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or retrieve Session Token
  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = generateSessionToken();
    }
    return sessionTokenRef.current;
  };

  const resetSessionToken = () => {
    sessionTokenRef.current = "";
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = val.trim();

    // Min 2 characters for text search
    if (trimmed.length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Step 1: Query Supabase locations table cache (fuzzy text matching)
        let cacheData: any[] = [];
        if (supabase) {
          const { data, error: cacheErr } = await supabase
            .from("locations")
            .select("*")
            .ilike("location_name", `%${trimmed}%`)
            .limit(8);
          
          if (!cacheErr && data && data.length > 0) {
            cacheData = data;
          }
        }

        if (cacheData.length > 0) {
          const formattedSuggestions: LocationSuggestion[] = cacheData.map((item) => ({
            location_name: item.location_name,
            village: item.village || "",
            mandal: item.mandal || "",
            district: item.district || "",
            state: item.state || "",
            country: item.country || "",
            pin_code: "",
            latitude: item.latitude,
            longitude: item.longitude,
            timezone: item.timezone,
            is_cached: true,
          }));
          setSuggestions(formattedSuggestions);
          setIsLoading(false);
          return;
        }

        // Step 2: Google Places Autocomplete API (Cost-optimized via session tokens)
        const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY || "";
        let googleSuggestions: LocationSuggestion[] = [];

        if (googleApiKey) {
          try {
            const sessionToken = getSessionToken();
            const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              trimmed
            )}&types=(regions)&language=${lang === "te" ? "te" : "en"}&key=${googleApiKey}&sessiontoken=${sessionToken}`;

            const res = await fetch(autocompleteUrl);
            if (!res.ok) throw new Error("Google API error");
            const resData = await res.json();

            if (resData.status === "OK" && resData.predictions) {
              googleSuggestions = resData.predictions.slice(0, 8).map((pred: any) => {
                const stateCountry = pred.terms.slice(-2);
                return {
                  location_name: pred.description,
                  village: pred.structured_formatting?.main_text || "",
                  mandal: "",
                  district: pred.terms[pred.terms.length - 3]?.value || "",
                  state: stateCountry[0]?.value || "",
                  country: stateCountry[1]?.value || "",
                  pin_code: "",
                  latitude: 0,
                  longitude: 0,
                  timezone: "",
                  google_place_id: pred.place_id,
                } as any;
              });
            }
          } catch (e) {
            console.warn("Google Places Autocomplete failed or CORS blocked. Falling back to Nominatim...", e);
          }
        }

        if (googleSuggestions.length > 0) {
          setSuggestions(googleSuggestions);
          setIsLoading(false);
          return;
        }

        // Step 3: OpenStreetMap Nominatim Fallback API
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&addressdetails=1&limit=8&accept-language=${lang === "te" ? "te" : "en"}`;

        const res = await fetch(nominatimUrl, {
          headers: {
            "User-Agent": "VaartaNow-Astrology/1.0",
          },
        });
        if (!res.ok) throw new Error("Nominatim API error");
        const osmData = await res.json();

        const osmSuggestions: LocationSuggestion[] = osmData.map((item: any) => {
          const addr = item.address || {};
          const village = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city || "";
          const district = addr.county || addr.district || addr.state_district || "";
          const state = addr.state || "";
          const country = addr.country || "";
          const mandal = addr.subdistrict || addr.mandal || "";

          const formattedParts = [village, district, state, country].filter(Boolean);
          const location_name = formattedParts.join(", ");

          return {
            location_name,
            village,
            mandal,
            district,
            state,
            country,
            pin_code: "",
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            timezone: "",
          };
        });

        setSuggestions(osmSuggestions);
      } catch (err: any) {
        console.error("Search failed:", err);
        setError(lang === "te" ? "స్థానాలను లోడ్ చేయడంలో విఫలమైంది" : "Failed to load locations");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const resolveLocationDetails = async (suggestion: LocationSuggestion & { google_place_id?: string }): Promise<LocationSuggestion> => {
    setIsLoading(true);
    let resolved = { ...suggestion };

    try {
      if (suggestion.google_place_id) {
        const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY || "";
        const sessionToken = getSessionToken();
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.google_place_id}&fields=geometry,address_components&key=${googleApiKey}&sessiontoken=${sessionToken}`;
        
        resetSessionToken();

        const res = await fetch(detailsUrl);
        const data = await res.json();

        if (data.status === "OK" && data.result) {
          const geom = data.result.geometry || {};
          resolved.latitude = geom.location?.lat || 0;
          resolved.longitude = geom.location?.lng || 0;

          const comps = data.result.address_components || [];
          const getComp = (types: string[]) => comps.find((c: any) => types.some(t => c.types.includes(t)))?.long_name || "";
          resolved.village = getComp(["locality", "sublocality", "neighborhood"]);
          resolved.state = getComp(["administrative_area_level_1"]);
          resolved.district = getComp(["administrative_area_level_2"]);
          resolved.country = getComp(["country"]);
          resolved.pin_code = ""; // Ensure empty for astrology
        }
      }

      if (resolved.latitude && resolved.longitude && !resolved.timezone) {
        try {
          const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY || "";
          const timestamp = Math.floor(Date.now() / 1000);
          const tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${resolved.latitude},${resolved.longitude}&timestamp=${timestamp}&key=${googleApiKey}`;
          
          const tzRes = await fetch(tzUrl);
          const tzData = await tzRes.json();
          if (tzData.status === "OK" && tzData.timeZoneId) {
            resolved.timezone = tzData.timeZoneId;
          } else {
            throw new Error("Google timezone fallback");
          }
        } catch {
          const tzRes = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${resolved.latitude}&lon=${resolved.longitude}&apiKey=free`);
          const tzData = await tzRes.json();
          resolved.timezone = tzData.features?.[0]?.properties?.timezone?.name || "Asia/Kolkata";
        }
      }

      if (supabase && resolved.latitude && resolved.longitude && !suggestion.is_cached) {
        const { data: existing } = await supabase
          .from("locations")
          .select("id, search_count")
          .eq("latitude", resolved.latitude)
          .eq("longitude", resolved.longitude)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("locations")
            .update({
              search_count: (existing.search_count || 1) + 1,
              last_used: new Date().toISOString()
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("locations").insert({
            location_name: resolved.location_name,
            village: resolved.village,
            mandal: resolved.mandal,
            district: resolved.district,
            state: resolved.state,
            country: resolved.country,
            pin_code: "",
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            timezone: resolved.timezone,
            search_count: 1,
            last_used: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error("Failed to resolve details:", err);
      if (!resolved.timezone) resolved.timezone = "Asia/Kolkata";
    } finally {
      setIsLoading(false);
    }

    return resolved;
  };

  return {
    query,
    suggestions,
    isLoading,
    error,
    handleSearch,
    resolveLocationDetails,
    setQuery,
    setSuggestions,
  };
}
