import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CloudSun, 
  Activity, 
  Coins, 
  DollarSign, 
  Fuel, 
  Navigation, 
  Sparkles, 
  Calendar, 
  Briefcase, 
  Tv,
  ChevronRight,
  X,
  Compass,
  TrendingUp,
  MapPin
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useWeather } from "@/hooks/useWeather";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { calculatePanchangam } from "@/lib/panchangam";
import { getUpcomingFestivals } from "@/lib/festivals";
import { FUEL_PRICES, getFuelPriceForCity } from "@/lib/petrol";
import { getJobsList } from "@/lib/jobs-api";

export function DailyWidgetStrip() {
  const { lang } = useLanguage();
  const { weather, loading: weatherLoading } = useWeather(lang);
  const { rates, loading: ratesLoading } = useExchangeRate();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedFuelCity, setSelectedFuelCity] = useState("Visakhapatnam");
  const [jobsCount, setJobsCount] = useState<number>(0);
  
  // Calculate Panchangam
  const today = new Date();
  const panchangam = calculatePanchangam(today);
  const upcomingFestivals = getUpcomingFestivals(3);
  
  // Fetch live jobs count
  useEffect(() => {
    getJobsList().then(list => setJobsCount(list.length)).catch(() => setJobsCount(6));
  }, []);

  const fuelInfo = getFuelPriceForCity(selectedFuelCity);

  // Telugu labels mapping
  const labels: Record<string, Record<string, string>> = {
    weather: { te: "వాతావరణం", en: "Weather" },
    cricket: { te: "లైవ్ క్రికెట్", en: "Live Cricket" },
    gold: { te: "బంగారం ధర", en: "Gold Rate" },
    forex: { te: "కరెన్సీ రేటు", en: "USD → INR" },
    fuel: { te: "పెట్రోల్ ధర", en: "Fuel Price" },
    traffic: { te: "ట్రాఫిక్", en: "Traffic" },
    panchangam: { te: "పంచాంగం", en: "Panchangam" },
    festivals: { te: "పండుగలు", en: "Festivals" },
    jobs: { te: "ఉద్యోగాలు", en: "Jobs Hub" },
    ott: { te: "OTT రిలీజ్‌లు", en: "OTT Releases" }
  };

  const getLabel = (key: string) => labels[key][lang] || labels[key].en;

  return (
    <section className="w-full select-none" aria-label="Daily utility widgets">
      {/* Horizontally scrolling strip */}
      <div className="no-scrollbar flex w-full gap-3 overflow-x-auto snap-x snap-mandatory py-2 px-1 pb-3">
        
        {/* 1. WEATHER WIDGET */}
        <button 
          onClick={() => setActiveModal("weather")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-blue-500/10 text-blue-500">
            <CloudSun className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("weather")}</p>
            <p className="widget-value truncate">
              {weatherLoading ? "..." : `${weather?.city ?? "Vizag"} · ${weather?.temp ?? "31"}°C`}
            </p>
          </div>
        </button>

        {/* 2. CRICKET WIDGET */}
        <Link 
          to="/jobs" 
          onClick={(e) => {
            // Trigger StickyCricketWidget float opening if available
            const btn = document.querySelector(".sticky-cricket-trigger") as HTMLButtonElement | null;
            if (btn) {
              e.preventDefault();
              btn.click();
            }
          }}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-emerald-500/10 text-emerald-500 animate-pulse">
            <Activity className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("cricket")}</p>
            <p className="widget-value text-emerald-600 dark:text-emerald-400 font-extrabold truncate">
              IND 184/4 (18.2)
            </p>
          </div>
        </Link>

        {/* 3. GOLD RATE WIDGET */}
        <button 
          onClick={() => setActiveModal("gold")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-amber-500/10 text-amber-500">
            <Coins className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("gold")}</p>
            <p className="widget-value truncate">
              {ratesLoading ? "..." : `₹${rates?.goldPerGram22k ?? "7,110"} / 1g`}
            </p>
          </div>
        </button>

        {/* 4. EXCHANGE RATE WIDGET */}
        <button 
          onClick={() => setActiveModal("forex")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-indigo-500/10 text-indigo-500">
            <DollarSign className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("forex")}</p>
            <p className="widget-value truncate">
              {ratesLoading ? "..." : `$1 = ₹${rates?.usdToInr ?? "83.4"}`}
            </p>
          </div>
        </button>

        {/* 5. FUEL PRICES WIDGET */}
        <button 
          onClick={() => setActiveModal("fuel")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-rose-500/10 text-rose-500">
            <Fuel className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("fuel")}</p>
            <p className="widget-value truncate">
              {`₹${fuelInfo.petrol} (${lang === "te" ? "వైజాగ్" : "Vizag"})`}
            </p>
          </div>
        </button>

        {/* 6. TRAFFIC WIDGET */}
        <a 
          href={`https://www.google.com/maps/@17.6868,83.2185,13z/data=!5m1!1e1`}
          target="_blank"
          rel="noreferrer"
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-cyan-500/10 text-cyan-500">
            <Navigation className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("traffic")}</p>
            <p className="widget-value truncate">
              {lang === "te" ? "లైవ్ మ్యాప్స్" : "Live Map"} 🗺️
            </p>
          </div>
        </a>

        {/* 7. PANCHANGAM WIDGET */}
        <button 
          onClick={() => setActiveModal("panchangam")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-orange-500/10 text-orange-500">
            <Sparkles className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("panchangam")}</p>
            <p className="widget-value truncate">
              {lang === "te" ? panchangam.tithi.te : panchangam.tithi.en}
            </p>
          </div>
        </button>

        {/* 8. FESTIVALS WIDGET */}
        <button 
          onClick={() => setActiveModal("festivals")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-purple-500/10 text-purple-500">
            <Calendar className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("festivals")}</p>
            <p className="widget-value truncate">
              {upcomingFestivals[0] ? `${upcomingFestivals[0].emoji} ${lang === "te" ? upcomingFestivals[0].nameTe : upcomingFestivals[0].nameEn}` : "..."}
            </p>
          </div>
        </button>

        {/* 9. JOBS WIDGET */}
        <Link 
          to="/jobs" 
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-violet-500/10 text-violet-500">
            <Briefcase className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("jobs")}</p>
            <p className="widget-value text-indigo-600 dark:text-indigo-400 font-extrabold truncate">
              {jobsCount ? `${jobsCount}+ ${lang === "te" ? "ఖాళీలు" : "Vacancies"}` : "..."}
            </p>
          </div>
        </Link>

        {/* 10. OTT WIDGET */}
        <button 
          onClick={() => setActiveModal("ott")}
          className="widget-card snap-start"
        >
          <div className="widget-icon bg-pink-500/10 text-pink-500">
            <Tv className="size-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="widget-label">{getLabel("ott")}</p>
            <p className="widget-value truncate">
              {lang === "te" ? "ఈ వారం రిలీజ్స్" : "Releasing this week"}
            </p>
          </div>
        </button>

      </div>

      {/* ── INTERACTIVE DIALOG MODALS ─────────────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 dark:bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-xl animate-in scale-in duration-300">
            
            {/* Close button */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
              aria-label="Close details"
            >
              <X className="size-5" />
            </button>

            {/* 1. WEATHER POPUP */}
            {activeModal === "weather" && (
              <div className="space-y-4 text-center">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 text-3xl">
                  ☁️
                </div>
                <div>
                  <h3 className="text-lg font-black">{weather?.city ?? "Visakhapatnam"} {lang === "te" ? "వాతావరణ నివేదిక" : "Weather Report"}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Live current conditions</p>
                </div>
                <div className="grid grid-cols-2 gap-3 py-2 bg-[hsl(var(--muted))]/50 rounded-2xl border border-[hsl(var(--border))]/50">
                  <div className="p-3 border-r border-[hsl(var(--border))]/40">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))]">{lang === "te" ? "ఉష్ణోగ్రత" : "Temperature"}</span>
                    <p className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">{weather?.temp ?? "31"}°C</p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))]">{lang === "te" ? "తేమ (Humidity)" : "Humidity"}</span>
                    <p className="text-2xl font-black mt-1 text-[hsl(var(--foreground))]">{weather?.humidity ?? "65"}%</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-center text-blue-500 bg-blue-500/10 py-2 rounded-xl">
                  {weather?.condition}
                </div>
              </div>
            )}

            {/* 2. GOLD RATE POPUP */}
            {activeModal === "gold" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 text-3xl">
                    🪙
                  </div>
                  <h3 className="text-lg font-black">{lang === "te" ? "బంగారం & వెండి ధరలు" : "Gold & Silver Rates"}</h3>
                  <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                    {lang === "te" ? "ఆంధ్రా & తెలంగాణ నేటి మార్కెట్ రేట్లు" : "AP & Telangana Current Market"}
                  </p>
                </div>
                <div className="space-y-2.5 bg-[hsl(var(--muted))]/50 p-4 rounded-2xl border border-[hsl(var(--border))]/50 text-sm">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/40 pb-2">
                    <span className="font-extrabold text-[hsl(var(--foreground))]">22 క్యారెట్ల బంగారం (1g)</span>
                    <span className="font-black text-amber-600 dark:text-amber-500">₹{rates?.goldPerGram22k ?? "7,110"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/40 pb-2">
                    <span className="font-extrabold text-[hsl(var(--foreground))]">24 క్యారెట్ల బంగారం (1g)</span>
                    <span className="font-black text-amber-600 dark:text-amber-500">₹{rates?.goldPerGram24k ?? "7,750"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-[hsl(var(--foreground))]">వెండి (1g)</span>
                    <span className="font-black text-[hsl(var(--foreground))]">₹{rates?.silverPerGram ?? "92"}</span>
                  </div>
                </div>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))] text-center leading-relaxed font-semibold">
                  * ఈ రేట్లు కేవలం సమాచారం కొరకు మాత్రమే. స్థానిక జ్యువెలరీ షాపులలో ధరలు స్వల్పంగా మారవచ్చు.
                </p>
              </div>
            )}

            {/* 3. EXCHANGE RATE POPUP */}
            {activeModal === "forex" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 text-3xl">
                    💵
                  </div>
                  <h3 className="text-lg font-black">{lang === "te" ? "కరెన్సీ మార్పిడి విలువలు" : "Foreign Exchange Rates"}</h3>
                </div>
                <div className="space-y-2.5 bg-[hsl(var(--muted))]/50 p-4 rounded-2xl border border-[hsl(var(--border))]/50 text-sm">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/40 pb-2">
                    <span className="font-extrabold text-[hsl(var(--foreground))]">1 USD (అమెరికన్ డాలర్)</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">₹{rates?.usdToInr ?? "83.45"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-[hsl(var(--foreground))]">1 EUR (యూరో)</span>
                    <span className="font-black text-[hsl(var(--foreground))]">₹{rates?.eurToInr ?? "91.20"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. FUEL POPUP */}
            {activeModal === "fuel" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 text-3xl">
                    ⛽
                  </div>
                  <h3 className="text-lg font-black">{lang === "te" ? "నేటి ఇంధన ధరలు" : "Daily Fuel Prices"}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 p-1 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))]/50 text-[10px] font-black">
                  {FUEL_PRICES.map((f) => (
                    <button
                      key={f.cityEn}
                      onClick={() => setSelectedFuelCity(f.cityEn)}
                      className={`px-2.5 py-1.5 rounded-lg transition ${selectedFuelCity === f.cityEn ? 'bg-rose-500 text-white shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'}`}
                    >
                      {lang === "te" ? f.cityTe : f.cityEn}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 bg-[hsl(var(--muted))]/50 rounded-2xl border border-[hsl(var(--border))]/50 text-center">
                  <div className="p-3 border-r border-[hsl(var(--border))]/40">
                    <span className="text-[10px] uppercase font-black text-rose-600 tracking-wider">Petrol (1L)</span>
                    <p className="text-xl font-black mt-1">₹{fuelInfo.petrol}</p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase font-black text-[hsl(var(--foreground))] tracking-wider">Diesel (1L)</span>
                    <p className="text-xl font-black mt-1">₹{fuelInfo.diesel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PANCHANGAM POPUP */}
            {activeModal === "panchangam" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 text-3xl">
                    🛕
                  </div>
                  <h3 className="text-lg font-black">{lang === "te" ? "నేటి పంచాంగం" : "Daily Panchangam"}</h3>
                  <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                    {today.toLocaleDateString(lang === "te" ? "te-IN" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="space-y-2.5 bg-[hsl(var(--muted))]/50 p-4 rounded-2xl border border-[hsl(var(--border))]/50 text-xs font-bold text-[hsl(var(--muted-foreground))] divide-y divide-[hsl(var(--border))]/40">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-[hsl(var(--foreground))]">{lang === "te" ? "తిథి (Tithi)" : "Tithi"}</span>
                    <span className="text-[hsl(var(--foreground))] font-black">{lang === "te" ? panchangam.tithi.te : panchangam.tithi.en}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[hsl(var(--foreground))]">{lang === "te" ? "నక్షత్రం (Nakshatra)" : "Nakshatra"}</span>
                    <span className="text-[hsl(var(--foreground))] font-black">{lang === "te" ? panchangam.nakshatra.te : panchangam.nakshatra.en}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-red-600">{lang === "te" ? "రాహుకాలం" : "Rahukalam"}</span>
                    <span className="text-red-600 font-black">{panchangam.rahukalam}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[hsl(var(--foreground))]">{lang === "te" ? "యమగండం" : "Yamagandam"}</span>
                    <span className="text-[hsl(var(--foreground))] font-black">{panchangam.yamagandam}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[hsl(var(--foreground))]">{lang === "te" ? "వర్జ్యం (Varjyam)" : "Varjyam"}</span>
                    <span className="text-[hsl(var(--foreground))] font-black">{panchangam.varjyam}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. FESTIVALS POPUP */}
            {activeModal === "festivals" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 text-3xl">
                    📅
                  </div>
                  <h3 className="text-lg font-black">{lang === "te" ? "రాబోయే పండుగలు" : "Upcoming Festivals"}</h3>
                </div>
                <div className="space-y-2.5 bg-[hsl(var(--muted))]/50 p-4 rounded-2xl border border-[hsl(var(--border))]/50 text-xs font-bold divide-y divide-[hsl(var(--border))]/40">
                  {upcomingFestivals.map((f, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                      <span className="text-[hsl(var(--foreground))] font-black flex items-center gap-1.5">
                        <span className="text-base">{f.emoji}</span>
                        {lang === "te" ? f.nameTe : f.nameEn}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {new Date(f.date).toLocaleDateString(lang === "te" ? "te-IN" : "en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. OTT POPUP */}
            {activeModal === "ott" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 text-3xl">
                    🎬
                  </div>
                  <h3 className="text-lg font-black">{lang === "te" ? "ఈ వారం OTT రిలీజ్‌లు" : "OTT Releases This Week"}</h3>
                </div>
                <div className="space-y-2.5 bg-[hsl(var(--muted))]/50 p-4 rounded-2xl border border-[hsl(var(--border))]/50 text-xs font-bold divide-y divide-[hsl(var(--border))]/40">
                  {[
                    { title: "దేవర (Devara - Part 1)", platform: "Netflix", date: "Friday", emoji: "🔴" },
                    { title: "సరిపోదా శనివారం (Saripodhaa Sanivaaram)", platform: "Prime Video", date: "Available Now", emoji: "🔵" },
                    { title: "గేమ్ ఛేంజర్ (Game Changer)", platform: "Hotstar", date: "Coming Soon", emoji: "🟢" }
                  ].map((ott, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                      <div className="text-left">
                        <p className="text-[hsl(var(--foreground))] font-black">{ott.title}</p>
                        <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5">{ott.platform}</p>
                      </div>
                      <span className="text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded-full text-[9px]">
                        {ott.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
