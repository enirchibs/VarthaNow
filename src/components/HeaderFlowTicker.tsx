import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useWeather } from "@/hooks/useWeather";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { calculatePanchangam } from "@/lib/panchangam";
import { getCachedGPSLocation } from "@/lib/location-detector";

export function HeaderFlowTicker() {
  const { lang } = useLanguage();
  const { weather } = useWeather(lang);
  const { rates } = useExchangeRate();
  const [isPaused, setIsPaused] = useState(false);

  // Live Panchangam calculation
  const today = new Date();
  const panchangam = calculatePanchangam(today);
  const cachedGps = getCachedGPSLocation();

  // Weather location display
  const weatherCity = cachedGps?.city || weather?.city || (lang === "te" ? "విశాఖపట్నం" : "Visakhapatnam");
  const weatherTemp = weather?.temp ? `${weather.temp}°C` : "31°C";
  const weatherCond = weather?.condition || "⛅ పాక్షిక మేఘావృతం";

  // Gold rate calculation (10 grams)
  const gold22k = rates?.goldPerGram22k ? (rates.goldPerGram22k * 10).toLocaleString("en-IN") : "71,450";
  const gold24k = rates?.goldPerGram24k ? (rates.goldPerGram24k * 10).toLocaleString("en-IN") : "77,950";

  // All ticker items requested by the user
  const tickerItems = [
    {
      id: "breaking",
      badge: "తాజా వార్తలు",
      badgeColor: "bg-red-600 text-white",
      icon: "🔴",
      text: "తాజా వార్తలు, తక్షణం: ఆంధ్రప్రదేశ్ & తెలంగాణ ఎప్పటికప్పుడు తాజా సమాచారం!",
      link: "/"
    },
    {
      id: "weather",
      badge: "వాతావరణం (GPS)",
      badgeColor: "bg-sky-600 text-white",
      icon: "⛅",
      text: `${weatherCity}: ${weatherTemp} · ${weatherCond}`,
      link: "/health"
    },
    {
      id: "gold",
      badge: "బంగారం ధర",
      badgeColor: "bg-amber-500 text-black",
      icon: "🪙",
      text: `22K ₹${gold22k}/10గ్రా | 24K ₹${gold24k}/10గ్రా`,
      link: "/category/business"
    },
    {
      id: "sensex",
      badge: "సెన్సెక్స్ & నిఫ్టీ",
      badgeColor: "bg-emerald-600 text-white",
      icon: "📈",
      text: "సెన్సెక్స్: 81,420.50 (+312.40) ▲ | నిఫ్టీ: 24,845.20 (+92.15) ▲",
      link: "/category/business"
    },
    {
      id: "jobs",
      badge: "స్థానిక ఉద్యోగాలు",
      badgeColor: "bg-indigo-600 text-white",
      icon: "💼",
      text: "స్థానిక ఉద్యోగాలు: AP & తెలంగాణలో 100+ తాజా ప్రైవేట్, ఐటీ & ప్రభుత్వ ఉద్యోగాలు!",
      link: "/jobs"
    },
    {
      id: "shorts",
      badge: "వైరల్ షార్ట్స్",
      badgeColor: "bg-orange-600 text-white",
      icon: "🔥",
      text: "వైరల్ షార్ట్స్: నేటి ట్రెండింగ్ వీడియోలు & వైరల్ రీల్స్ చూడండి",
      link: "/category/viralshorts"
    },
    {
      id: "whatsapp",
      badge: "వాట్సాప్ స్టేటస్ ఫోటో",
      badgeColor: "bg-emerald-500 text-black",
      icon: "✨",
      text: "వాట్సాప్ స్టేటస్ ఫోటో: డైలీ సుప్రభాతం, భక్తి & స్ఫూర్తిదాయక ఫొటోలు డౌన్‌లోడ్ చేసుకోండి",
      link: "/daily-share"
    },
    {
      id: "jathakam",
      badge: "రియల్ టైమ్ జాతకము",
      badgeColor: "bg-purple-600 text-white",
      icon: "🔮",
      text: `రియల్ టైమ్ జాతకము: నేడు ${panchangam.tithi.te} · ${panchangam.nakshatra.te} · నేటి రాశిఫలాలు`,
      link: "/category/jathakam"
    },
    {
      id: "health",
      badge: "ఆరోగ్యం",
      badgeColor: "bg-teal-600 text-white",
      icon: "🏥",
      text: "ఆరోగ్యం: రోజువారీ వంటింటి చిట్కాలు, ఆహార సూచనలు & AI డాక్టర్ గైడ్",
      link: "/health"
    }
  ];

  // Repeat items for seamless continuous flowing marquee loop
  const flowSequence = [...tickerItems, ...tickerItems];

  return (
    <div
      className="w-full relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-900/90 border-y border-amber-500/20 dark:border-zinc-800/80 py-1 select-none transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      <div
        className="animate-ticker-flow flex items-center gap-4 sm:gap-6"
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {flowSequence.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            to={item.link}
            className="inline-flex items-center gap-1.5 shrink-0 text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-zinc-100 hover:text-red-600 dark:hover:text-amber-400 transition-colors py-0.5 group"
          >
            <span
              className={`text-[8.5px] sm:text-[9.5px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0 shadow-2xs ${item.badgeColor}`}
            >
              {item.badge}
            </span>
            <span className="text-xs shrink-0">{item.icon}</span>
            <span className="truncate max-w-[280px] sm:max-w-none group-hover:underline underline-offset-2">
              {item.text}
            </span>
            <span className="text-zinc-400 dark:text-zinc-600 font-normal ml-2 sm:ml-4 select-none">
              •
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
