import { useEffect, useState } from "react";

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  conditionCode: number;
  humidity: number;
}

const CACHE_KEY = "vaartanow-weather-cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CacheData {
  timestamp: number;
  data: WeatherData;
}

// Map WMO codes to Telugu/English weather conditions and emojis
function getWeatherCondition(code: number, lang: string = "te"): { text: string; emoji: string } {
  if (code === 0) return { text: lang === "te" ? "ప్రశాంతంగా" : "Sunny", emoji: "☀️" };
  if (code >= 1 && code <= 3) return { text: lang === "te" ? "పాక్షిక మేఘావృతం" : "Partly Cloudy", emoji: "⛅" };
  if (code >= 45 && code <= 48) return { text: lang === "te" ? "పొగమంచు" : "Foggy", emoji: "🌫️" };
  if (code >= 51 && code <= 67) return { text: lang === "te" ? "చినుకులు" : "Drizzle", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { text: lang === "te" ? "మంచు కురుస్తోంది" : "Snowing", emoji: "❄️" };
  if (code >= 80 && code <= 82) return { text: lang === "te" ? "వర్షం" : "Showers", emoji: "🌧️" };
  if (code >= 95 && code <= 99) return { text: lang === "te" ? "ఉరుములతో కూడిన వాన" : "Thunderstorm", emoji: "⛈️" };
  return { text: lang === "te" ? "సాధారణం" : "Cloudy", emoji: "☁️" };
}

export function useWeather(lang: "te" | "en" | "hi" | "ta" | "kn" = "te") {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`
      );
      if (!response.ok) throw new Error("Weather fetch failed");
      const data = await response.json();
      
      const temp = Math.round(data.current_weather.temperature);
      const code = data.current_weather.weathercode;
      const humidity = data.hourly?.relativehumidity_2m?.[0] ?? 60;
      const cond = getWeatherCondition(code, lang);

      const weatherData: WeatherData = {
        city: cityName,
        temp,
        condition: `${cond.emoji} ${cond.text}`,
        conditionCode: code,
        humidity
      };

      const cache: CacheData = {
        timestamp: Date.now(),
        data: weatherData
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      setWeather(weatherData);
    } catch (err) {
      console.error("Failed to load weather: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CacheData = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          setWeather(parsed.data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed reading weather cache: ", e);
    }

    // Default: Visakhapatnam
    const defaultLat = 17.6868;
    const defaultLon = 83.2185;
    const defaultCity = lang === "te" ? "విశాఖపట్నం" : "Visakhapatnam";

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using free open-meteo or fallback to general area name
          // Since reverse geocoding usually requires paid maps API, we can approximate the city by lat range
          // or just display "మొబైల్ లొకేషన్" (My Location)
          let detectedCity = lang === "te" ? "మీ ప్రాంతం" : "My Location";
          
          // Basic approximation for Andhra/Telangana major cities to make it feel magical
          const lat = Math.round(latitude * 10) / 10;
          const lon = Math.round(longitude * 10) / 10;
          
          if (lat >= 17.5 && lat <= 17.9 && lon >= 83.0 && lon <= 83.4) {
            detectedCity = lang === "te" ? "విశాఖపట్నం" : "Visakhapatnam";
          } else if (lat >= 17.2 && lat <= 17.6 && lon >= 78.2 && lon <= 78.6) {
            detectedCity = lang === "te" ? "హైదరాబాద్" : "Hyderabad";
          } else if (lat >= 16.3 && lat <= 16.7 && lon >= 80.4 && lon <= 80.8) {
            detectedCity = lang === "te" ? "విజయవాడ" : "Vijayawada";
          } else if (lat >= 16.1 && lat <= 16.5 && lon >= 81.0 && lon <= 81.4) {
            detectedCity = lang === "te" ? "గుంటూరు" : "Guntur";
          } else if (lat >= 13.5 && lat <= 13.9 && lon >= 79.2 && lon <= 79.6) {
            detectedCity = lang === "te" ? "తిరుపతి" : "Tirupati";
          }

          fetchWeather(latitude, longitude, detectedCity);
        },
        () => {
          // Geolocation error/denied: fallback to default
          fetchWeather(defaultLat, defaultLon, defaultCity);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(defaultLat, defaultLon, defaultCity);
    }
  }, [lang]);

  return { weather, loading };
}
