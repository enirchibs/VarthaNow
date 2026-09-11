// 🌍 Universal Location & Area Detection Engine with GPS & Autocomplete

export interface DetectedLocation {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export interface DetailedAreaResult {
  formatted_address: string;
  suburb_village?: string;
  city_town: string;
  district_mandal?: string;
  state: string;
  pincode?: string;
  lat?: number;
  lon?: number;
}

// 🏢 Preloaded High-Priority Andhra Pradesh & Telangana Localities Database
export const PRELOADED_AP_TS_LOCATIONS: { name_te: string; name_en: string; category: string }[] = [
  // Visakhapatnam District & Mandals
  { name_te: "విశాఖపట్నం (Visakhapatnam)", name_en: "Visakhapatnam City", category: "City" },
  { name_te: "మధురవాడ (Madhurawada)", name_en: "Madhurawada, Vizag", category: "Locality / Mandal" },
  { name_te: "గాజువాక (Gajuwaka)", name_en: "Gajuwaka, Vizag", category: "Locality / Mandal" },
  { name_te: "ఎంవీపీ కాలనీ (MVP Colony)", name_en: "MVP Colony, Vizag", category: "Locality" },
  { name_te: "సీతమ్మధార (Seethammadhara)", name_en: "Seethammadhara, Vizag", category: "Locality" },
  { name_te: "జగదాంబ (Jagadamba Center)", name_en: "Jagadamba, Vizag", category: "Locality" },
  { name_te: "పెందుర్తి (Pendurthi)", name_en: "Pendurthi, Vizag", category: "Mandal / Locality" },
  { name_te: "గోపాలపట్నం (Gopalapatnam)", name_en: "Gopalapatnam, Vizag", category: "Locality" },
  { name_te: "భీమునిపట్నం (Bheemunipatnam / Bheemili)", name_en: "Bheemunipatnam (Bheemili)", category: "Town / Mandal" },
  { name_te: "స్టీల్ ప్లాంట్ / కూర్మన్నపాలెం (Steel Plant / Kurmannapalem)", name_en: "Kurmannapalem / Steel Plant", category: "Locality" },
  { name_te: "సింహాచలం (Simhachalam)", name_en: "Simhachalam, Vizag", category: "Locality" },
  { name_te: "ఆనందపురం (Anandapuram)", name_en: "Anandapuram Mandal", category: "Mandal" },
  { name_te: "పద్మనాభం (Padmanabham)", name_en: "Padmanabham Mandal", category: "Mandal" },
  { name_te: "పీఎమ్‌పాలెం (PM Palem)", name_en: "PM Palem, Vizag", category: "Locality" },
  { name_te: "రుషికొండ (Rushikonda)", name_en: "Rushikonda, Vizag", category: "Locality" },
  { name_te: "ఎండాడ (Endada)", name_en: "Endada, Vizag", category: "Locality" },
  { name_te: "ఎన్‌ఏడీ జంక్షన్ (NAD Junction)", name_en: "NAD Junction, Vizag", category: "Locality" },
  { name_te: "అక్కయ్యపాలెం (Akkayyapalem)", name_en: "Akkayyapalem, Vizag", category: "Locality" },
  { name_te: "కంచరపాలెం (Kancharapalem)", name_en: "Kancharapalem, Vizag", category: "Locality" },
  { name_te: "జ్ఞానాపురం (Gnanapuram)", name_en: "Gnanapuram, Vizag", category: "Locality" },

  // NTR / Krishna / Vijayawada
  { name_te: "విజయవాడ (Vijayawada)", name_en: "Vijayawada City", category: "City" },
  { name_te: "బెంచ్ సర్కిల్ (Benz Circle)", name_en: "Benz Circle, Vijayawada", category: "Locality" },
  { name_te: "గవర్నర్ పేట (Governorpet)", name_en: "Governorpet, Vijayawada", category: "Locality" },
  { name_te: "పటమట (Patamata)", name_en: "Patamata, Vijayawada", category: "Locality" },
  { name_te: "గుణదల (Gunadala)", name_en: "Gunadala, Vijayawada", category: "Locality" },
  { name_te: "పోరంకి (Poranki)", name_en: "Poranki, Vijayawada", category: "Locality" },
  { name_te: "ఇబ్రహీంపట్నం (Ibrahimpatnam)", name_en: "Ibrahimpatnam, Vijayawada", category: "Mandal" },
  { name_te: "గుడివాడ (Gudivada)", name_en: "Gudivada", category: "Town / Mandal" },
  { name_te: "మచిలీపట్నం (Machilipatnam)", name_en: "Machilipatnam", category: "City / Mandal" },

  // Guntur / Amaravati / Bapatla
  { name_te: "గుంటూరు (Guntur)", name_en: "Guntur City", category: "City" },
  { name_te: "బ్రోడీపేట (Brodipet)", name_en: "Brodipet, Guntur", category: "Locality" },
  { name_te: "అరుండల్ పేట (Arundelpet)", name_en: "Arundelpet, Guntur", category: "Locality" },
  { name_te: "అమరావతి (Amaravati)", name_en: "Amaravati Capital Region", category: "Capital City" },
  { name_te: "మంగళగిరి (Mangalagiri)", name_en: "Mangalagiri", category: "Town / Mandal" },
  { name_te: "తాడేపల్లి (Tadepalli)", name_en: "Tadepalli", category: "Town / Mandal" },
  { name_te: "తెనాలి (Tenali)", name_en: "Tenali", category: "Town / Mandal" },
  { name_te: "నరసరావుపేట (Narasaraopet)", name_en: "Narasaraopet", category: "Town" },
  { name_te: "బాపట్ల (Bapatla)", name_en: "Bapatla", category: "Town" },

  // Tirupati / Chittoor
  { name_te: "తిరుపతి (Tirupati)", name_en: "Tirupati City", category: "City" },
  { name_te: "అలిపిరి (Alipiri)", name_en: "Alipiri, Tirupati", category: "Locality" },
  { name_te: "ఎమ్మార్ పల్లి (MR Palle)", name_en: "MR Palle, Tirupati", category: "Locality" },
  { name_te: "చంద్రగిరి (Chandragiri)", name_en: "Chandragiri", category: "Mandal" },
  { name_te: "రేణిగుంట (Renigunta)", name_en: "Renigunta", category: "Mandal" },
  { name_te: "శ్రీకాళహస్తి (Srikalahasti)", name_en: "Srikalahasti", category: "Town" },
  { name_te: "మదనపల్లె (Madanapalle)", name_en: "Madanapalle", category: "Town" },

  // Godavari Districts (Rajahmundry, Kakinada, Eluru)
  { name_te: "రాజమండ్రి (Rajahmundry / Rajamahendravaram)", name_en: "Rajahmundry", category: "City" },
  { name_te: "దానవాయిపేట (Danavaipeta)", name_en: "Danavaipeta, Rajahmundry", category: "Locality" },
  { name_te: "మొరంపూడి (Morampudi)", name_en: "Morampudi, Rajahmundry", category: "Locality" },
  { name_te: "కాకినాడ (Kakinada)", name_en: "Kakinada City", category: "City" },
  { name_te: "సామర్లకోట (Samalkot)", name_en: "Samalkot", category: "Town" },
  { name_te: "పిఠాపురం (Pithapuram)", name_en: "Pithapuram", category: "Town" },
  { name_te: "అమలాపురం (Amalapuram)", name_en: "Amalapuram", category: "Town" },
  { name_te: "భీమవరం (Bhimavaram)", name_en: "Bhimavaram", category: "Town" },
  { name_te: "తణుకు (Tanuku)", name_en: "Tanuku", category: "Town" },
  { name_te: "ఏలూరు (Eluru)", name_en: "Eluru", category: "City" },

  // Rayalaseema & North Andhra
  { name_te: "కర్నూలు (Kurnool)", name_en: "Kurnool City", category: "City" },
  { name_te: "నంద్యాల (Nandyal)", name_en: "Nandyal", category: "City" },
  { name_te: "అనంతపురం (Anantapur)", name_en: "Anantapur", category: "City" },
  { name_te: "కడప (Kadapa)", name_en: "Kadapa City", category: "City" },
  { name_te: "విజయనగరం (Vizianagaram)", name_en: "Vizianagaram", category: "City" },
  { name_te: "శ్రీకాకుళం (Srikakulam)", name_en: "Srikakulam", category: "City" },

  // Hyderabad & Telangana
  { name_te: "హైదరాబాద్ (Hyderabad)", name_en: "Hyderabad City", category: "Metropolitan City" },
  { name_te: "బంజారా హిల్స్ (Banjara Hills)", name_en: "Banjara Hills, Hyd", category: "Locality" },
  { name_te: "జుబ్లీ హిల్స్ (Jubilee Hills)", name_en: "Jubilee Hills, Hyd", category: "Locality" },
  { name_te: "గచ్చిబౌలి (Gachibowli)", name_en: "Gachibowli, Hyd", category: "IT Hub" },
  { name_te: "హైటెక్ సిటీ (HITECH City)", name_en: "HITECH City, Hyd", category: "IT Hub" },
  { name_te: "మాదాపూర్ (Madhapur)", name_en: "Madhapur, Hyd", category: "Locality" },
  { name_te: "కూకట్‌పల్లి (Kukatpally)", name_en: "Kukatpally, Hyd", category: "Locality" },
  { name_te: "సికింద్రాబాద్ (Secunderabad)", name_en: "Secunderabad", category: "City" },
  { name_te: "అమీర్‌పేట్ (Ameerpet)", name_en: "Ameerpet, Hyd", category: "Locality" },
  { name_te: "దిల్‌సుఖ్‌నగర్ (Dilsukhnagar)", name_en: "Dilsukhnagar, Hyd", category: "Locality" },
  { name_te: "కొండాపూర్ (Kondapur)", name_en: "Kondapur, Hyd", category: "Locality" },
  { name_te: "మియాపూర్ (Miyapur)", name_en: "Miyapur, Hyd", category: "Locality" },
  { name_te: "వరంగల్ (Warangal)", name_en: "Warangal", category: "City" },
  { name_te: "కరీంనగర్ (Karimnagar)", name_en: "Karimnagar", category: "City" },
  { name_te: "ఖమ్మం (Khammam)", name_en: "Khammam", category: "City" }
];

// 🎯 Detect Current GPS Location & Reverse Geocode to detailed area string
export async function detectGPSLocation(): Promise<DetectedLocation | null> {
  try {
    const cached = localStorage.getItem("varthanow_gps_location");
    if (cached) return JSON.parse(cached);
  } catch {}

  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "VarthaNow-App" } }
          );
          
          if (!response.ok) throw new Error("Geo API error");
          const data = await response.json();
          const address = data.address || {};
          
          const city = address.city || address.town || address.suburb || address.village || address.county || "Visakhapatnam";
          const state = address.state || "Andhra Pradesh";
          
          const result: DetectedLocation = { city, state, lat: latitude, lon: longitude };
          localStorage.setItem("varthanow_gps_location", JSON.stringify(result));
          resolve(result);
        } catch (e) {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

// 🎯 Detect Detailed GPS Area (Street, Village, Mandal, City, District)
export async function detectDetailedGPSArea(): Promise<DetailedAreaResult | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "VarthaNow-Location-Detector" } }
          );

          if (!response.ok) throw new Error("GPS reverse error");
          const data = await response.json();
          const address = data.address || {};

          const suburbOrVillage = address.suburb || address.village || address.neighbourhood || address.residential || address.road;
          const cityOrTown = address.city || address.town || address.municipality || address.county;
          const mandalOrDist = address.county || address.state_district || address.district;
          const state = address.state || "Andhra Pradesh";
          const pincode = address.postcode;

          let formatted = "";
          if (suburbOrVillage && cityOrTown) {
            formatted = `${suburbOrVillage}, ${cityOrTown}`;
          } else if (cityOrTown) {
            formatted = `${cityOrTown}, ${state}`;
          } else {
            formatted = data.display_name.split(",").slice(0, 3).join(",");
          }

          const result: DetailedAreaResult = {
            formatted_address: formatted,
            suburb_village: suburbOrVillage,
            city_town: cityOrTown || "Visakhapatnam",
            district_mandal: mandalOrDist,
            state: state,
            pincode,
            lat: latitude,
            lon: longitude
          };

          resolve(result);
        } catch (err) {
          console.warn("Failed reverse geocode:", err);
          resolve(null);
        }
      },
      (error) => {
        console.warn("GPS Permission error:", error.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  });
}

// 🔍 Search Area Autocomplete (Searches preloaded AP/TS database + live OpenStreetMap Places)
export async function searchAreaAutocomplete(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.toLowerCase().trim();

  // 1. Filter local database first
  const localMatches = PRELOADED_AP_TS_LOCATIONS
    .filter((loc) => loc.name_te.toLowerCase().includes(cleanQuery) || loc.name_en.toLowerCase().includes(cleanQuery))
    .map((loc) => loc.name_te);

  // 2. Fetch live OpenStreetMap Nominatim search results for Villages, Mandals, Streets, Towns, Cities
  let liveMatches: string[] = [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=in&limit=8`,
      { headers: { "User-Agent": "VarthaNow-Places-Search" } }
    );
    if (response.ok) {
      const data = await response.json();
      liveMatches = data.map((item: any) => {
        const parts = item.display_name.split(",");
        return parts.slice(0, 3).map((p: string) => p.trim()).join(", ");
      });
    }
  } catch (err) {
    console.warn("Live OSM search fallback:", err);
  }

  // Combine and deduplicate
  const combined = Array.from(new Set([...localMatches, ...liveMatches]));
  return combined.slice(0, 10);
}

export function getCachedGPSLocation(): DetectedLocation | null {
  try {
    const cached = localStorage.getItem("varthanow_gps_location");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
