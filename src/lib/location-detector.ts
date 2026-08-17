// 🌍 GPS Geolocation Detector with caching
export interface DetectedLocation {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export async function detectGPSLocation(): Promise<DetectedLocation | null> {
  // Check cache first
  try {
    const cached = localStorage.getItem("varthanow_gps_location");
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          console.log(`Detected coordinates: lat=${latitude}, lon=${longitude}. Reverse geocoding...`);
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "VarthaNow-News-App-Personalization"
              }
            }
          );
          
          if (!response.ok) throw new Error("Geo API error");
          
          const data = await response.json();
          const address = data.address || {};
          
          const city = address.city || address.town || address.suburb || address.village || address.county || "Hyderabad";
          const state = address.state || "Telangana";
          
          const result: DetectedLocation = {
            city: city,
            state: state,
            lat: latitude,
            lon: longitude
          };
          
          localStorage.setItem("varthanow_gps_location", JSON.stringify(result));
          resolve(result);
        } catch (e) {
          console.error("Failed to reverse geocode GPS location:", e);
          resolve(null);
        }
      },
      (error) => {
        console.warn("Geolocation permission denied or error:", error.message);
        resolve(null);
      },
      { timeout: 8000 }
    );
  });
}

export function getCachedGPSLocation(): DetectedLocation | null {
  try {
    const cached = localStorage.getItem("varthanow_gps_location");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
