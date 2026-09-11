import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Moon, Search, Sun, Home, X, Smartphone, Video, User, Bookmark, Heart, MapPin, Navigation, ShoppingBag, Megaphone, Plus, Bot, Sparkles, Sprout, Wrench, UtensilsCrossed } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { categories } from "@/lib/categories";
import { Button } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { detectGPSLocation } from "@/lib/location-detector";
import { CreatePostModal } from "@/components/CreatePostModal";
import { SmartChatbotWidget } from "@/components/SmartChatbotWidget";

const categoryEmojis: Record<string, string> = {
  viralshorts: "🔥",
  "andhra-pradesh": "🏛️",
  telangana: "🏛️",
  devotional: "🙏",
  health: "🏥",
  cricket: "🏏",
  politics: "📢",
  cinema: "🎬",
  vizag: "🌊",
  technology: "💻",
  business: "📈",
  jobs: "💼",
  jathakam: "🔮",
  national: "🌐",
  education: "🎓"
};

export function Layout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { lang, changeLanguage } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showGPSPrompt, setShowGPSPrompt] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [isNavAnimating, setIsNavAnimating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [showIdleAlertBanner, setShowIdleAlertBanner] = useState(false);

  // 📱 Mobile Pre-Sleep Idle Haptic Buzz & Category Wake-Up Effect
  useEffect(() => {
    let idleTimer: any = null;

    const resetIdleTimer = () => {
      setShowIdleAlertBanner(false);
      if (idleTimer) clearTimeout(idleTimer);

      // 20-second idle threshold before mobile screen sleeps/dims
      idleTimer = setTimeout(() => {
        // 1. Haptic vibration buzz on mobile devices
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate([140, 70, 140]);
          } catch (e) {}
        }

        // 2. Display pre-sleep wake-up banner & trigger category navigation tour
        setShowIdleAlertBanner(true);
        window.dispatchEvent(new CustomEvent("gallery_first_round_complete"));
      }, 20000);
    };

    const events = ["touchstart", "touchmove", "scroll", "click", "keydown"];
    events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, []);

  // 🎡 Serial 1-round category tour: stays 5s on each category, moves rightwards, completes ONLY 1 ROUND and stops without continuous looping
  useEffect(() => {
    let isCancelled = false;
    let timeoutId: any = null;
    let isPaused = false;

    const navEl = navRef.current;
    if (!navEl) return;

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };
    const handleTouchStart = () => { isPaused = true; };
    const handleTouchEnd = () => {
      setTimeout(() => { isPaused = false; }, 4500);
    };

    navEl.addEventListener("mouseenter", handleMouseEnter);
    navEl.addEventListener("mouseleave", handleMouseLeave);
    navEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    navEl.addEventListener("touchend", handleTouchEnd, { passive: true });

    const startNavTour = async () => {
      if (!navRef.current) return;
      const currentNavEl = navRef.current;
      const children = Array.from(currentNavEl.children) as HTMLElement[];
      if (!children || children.length <= 1) return;

      setIsNavAnimating(true);
      // Start with Mee Vaartulu (index 1), followed by Local Jobs (index 2), then categories...
      let currentIndex = 1;

      while (!isCancelled) {
        // Pause movement while user is touching or hovering over the category bar
        while (isPaused && !isCancelled) {
          await new Promise((r) => { timeoutId = setTimeout(r, 400); });
        }

        if (isCancelled) break;

        // When starting or returning to 'Mee Vaartulu' (index 1), reset scroll position cleanly
        if (currentIndex === 1) {
          currentNavEl.scrollTo({ left: 0, behavior: "auto" });
        }

        const child = children[currentIndex];

        if (child) {
          // 1. Highlight this category pill with glowing indicator & '👉 నొక్కండి' badge
          setHighlightedIndex(currentIndex);

          // 2. Smoothly scroll container rightwards to center current child pill (for items after start)
          if (currentIndex > 1) {
            const targetLeft = Math.max(0, child.offsetLeft - (currentNavEl.clientWidth / 2) + (child.clientWidth / 2));
            currentNavEl.scrollTo({ left: targetLeft, behavior: "smooth" });
          }
        }

        // 3. Human decision buffer period (5000ms / 5 seconds) for user to catch, read, think and click
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 5000);
        });

        if (isCancelled) break;

        // Move serial way rightwards: 1 (Mee Vaartalu) -> 2 (Local Jobs) -> 3 -> 4 ... -> End
        currentIndex++;
        if (currentIndex >= children.length) {
          // 🛑 ONLY ONE ROUND IS ENOUGH: Stop auto-tour after 1 pass and return smoothly to Home!
          setHighlightedIndex(null);
          currentNavEl.scrollTo({ left: 0, behavior: "smooth" });
          setIsNavAnimating(false);
          break;
        }
      }
    };

    window.addEventListener("gallery_first_round_complete", startNavTour);
    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("gallery_first_round_complete", startNavTour);
      if (navEl) {
        navEl.removeEventListener("mouseenter", handleMouseEnter);
        navEl.removeEventListener("mouseleave", handleMouseLeave);
        navEl.removeEventListener("touchstart", handleTouchStart);
        navEl.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, []);

  // 📜 Scroll to top of window automatically on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const consent = localStorage.getItem("vaartanow-cookie-consent");
    if (!consent) {
      setShowCookieConsent(true);
    }
  }, []);

  // 📍 GPS Location Permission Prompt on opening app
  useEffect(() => {
    const gpsDismissed = localStorage.getItem("vaartanow_gps_prompt_dismissed");
    const cachedGps = localStorage.getItem("varthanow_gps_location");
    if (!gpsDismissed && !cachedGps) {
      const timer = setTimeout(() => {
        setShowGPSPrompt(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
    // Prompt GPS permission immediately after installing app
    setShowGPSPrompt(true);
  };

  const handleDismissClick = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "true");
    setShowInstallBanner(false);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem("vaartanow-cookie-consent", "true");
    setShowCookieConsent(false);
  };

  const handleEnableGPS = async () => {
    setGpsLoading(true);
    try {
      const loc = await detectGPSLocation();
      localStorage.setItem("vaartanow_gps_prompt_dismissed", "true");
      setShowGPSPrompt(false);
      if (loc && loc.city) {
        // Trigger a smooth page reload so news feed re-ranks for user city
        window.location.reload();
      }
    } catch (e) {
      console.warn("GPS detection failed:", e);
      localStorage.setItem("vaartanow_gps_prompt_dismissed", "true");
      setShowGPSPrompt(false);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleDismissGPSPrompt = () => {
    localStorage.setItem("vaartanow_gps_prompt_dismissed", "true");
    setShowGPSPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center gap-3">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
            <img src="/vaartanow-logo.png" alt="VaartaNow" className="h-10 w-auto rounded-xl object-contain dark:brightness-110" />
            <span className="min-w-0">
              <span className="block truncate text-lg font-black">VaartaNow</span>
              <span className="block truncate text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {lang === "te" && "తాజా వార్తలు, తక్షణం"}
                {lang === "en" && "Multilingual Live News"}
                {lang === "hi" && "बहुभाषी ताज़ा समाचार"}
                {lang === "ta" && "பல்மொழி செய்திகள்"}
                {lang === "kn" && "ಬಹುಭಾಷಾ ಸುದ್ದಿ"}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* 🌟 Bouncing Yellow Remaining Categories dropdown for mobile */}
            <div className="relative md:hidden z-50">
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-black rounded-full bg-yellow-400 hover:bg-yellow-500 text-black shadow-[0_0_12px_rgba(250,204,21,0.4)] border border-yellow-300 animate-bounce transition-all tracking-wide shrink-0"
                style={{ animationDuration: "2s" }}
              >
                <span>➕ మరిన్ని విభాగాలు</span>
              </button>
              
              {showMoreCategories && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-3xl border-2 border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-zinc-950 p-2.5 shadow-[0_20px_45px_rgba(0,0,0,0.15)] z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="text-[9px] font-black text-yellow-800 dark:text-yellow-400 border-b border-yellow-300/40 pb-1.5 mb-1.5 uppercase tracking-widest flex items-center justify-between">
                    <span>Explore More</span>
                    <span className="size-1.5 rounded-full bg-yellow-400 animate-ping" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.slice(3).map((category) => (
                      <NavLink
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        onClick={() => setShowMoreCategories(false)}
                        className={({ isActive }) =>
                          `block text-center rounded-2xl py-1.5 px-0.5 text-[9px] font-extrabold border transition ${
                            isActive 
                              ? "bg-yellow-400 text-black border-yellow-400 shadow-sm" 
                              : "bg-white/80 dark:bg-zinc-900/80 text-yellow-950 dark:text-yellow-100 border-yellow-200/50 dark:border-zinc-800 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                          }`
                        }
                      >
                        {categoryEmojis[category.slug] ? `${categoryEmojis[category.slug]} ` : ""}{category.short}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>


            <Link to="/bookmarks" className="hidden md:inline-block">
              <Button 
                variant="secondary" 
                className="h-10 px-4 rounded-xl text-xs font-black border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              >
                {lang === "te" ? "బుక్‌మార్క్‌లు" : "Bookmarks"}
              </Button>
            </Link>
          </div>
          <Link to="/search" className="hidden md:grid size-11 place-items-center rounded-full bg-[hsl(var(--muted))]" aria-label="Search">
            <Search className="size-4" />
          </Link>
        </div>
        <nav ref={navRef} className={`container-shell no-scrollbar flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-3 pt-2.5 transition-all duration-500 ${isNavAnimating ? "ring-2 ring-red-500/50 shadow-lg shadow-red-500/10 rounded-full" : ""}`}>
          {/* Index 0: Home Button (Always Visible & Sticky on Left) */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sticky left-0 z-40 bg-[hsl(var(--background))] backdrop-blur-md shrink-0 rounded-full p-1.5 md:p-2.5 text-[9px] md:text-sm font-black transition-all duration-500 border-2 relative ${
                highlightedIndex === 0
                  ? "bg-gradient-to-r from-red-600 to-amber-500 text-white border-yellow-300 ring-4 ring-red-500/80 shadow-[0_0_24px_rgba(239,68,68,0.75)] scale-110 -translate-y-0.5 z-30"
                  : isActive
                  ? "bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30 scale-105"
                  : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-red-500 hover:text-red-600 hover:scale-105"
              }`
            }
          >
            <Home className="size-3.5 md:size-4.5" />
          </NavLink>
          
          {/* Index 1: Your News */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm font-black transition-all duration-500 border-2 relative ${
                highlightedIndex === 1
                  ? "bg-gradient-to-r from-red-600 via-amber-600 to-rose-600 text-white border-yellow-300 ring-4 ring-red-500/80 shadow-[0_0_24px_rgba(239,68,68,0.75)] scale-110 -translate-y-0.5 z-30"
                  : isActive
                  ? "bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30 scale-105"
                  : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-red-500 hover:text-red-600 hover:scale-105"
              }`
            }
          >
            <span>{lang === "te" ? "మీ వార్తలు" : lang === "en" ? "Your News" : lang === "hi" ? "आपके समाचार" : lang === "ta" ? "உங்கள் செய்திகள்" : "ನಿಮ್ಮ ಸುದ್ದಿ"}</span>
            {highlightedIndex === 1 && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-bounce border border-yellow-200 shrink-0 z-40 whitespace-nowrap">
                👉 నొక్కండి
              </span>
            )}
          </NavLink>

          {/* Index 2: Local Jobs */}
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm font-black transition-all duration-500 border-2 relative ${
                highlightedIndex === 2
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-yellow-300 ring-4 ring-indigo-500/80 shadow-[0_0_24px_rgba(79,70,229,0.75)] scale-110 -translate-y-0.5 z-30"
                  : isActive
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-105"
                  : "bg-[hsl(var(--card))] border-indigo-300/60 dark:border-indigo-800/60 text-[hsl(var(--foreground))] hover:border-indigo-500 hover:text-indigo-600 hover:scale-105"
              }`
            }
          >
            <span>{lang === "te" ? "💼 స్థానిక ఉద్యోగాలు" : lang === "en" ? "💼 Local Jobs" : lang === "hi" ? "💼 स्थानीय नौकरियां" : lang === "ta" ? "💼 உள்ளூர் வேலைகள்" : "💼 ಸ್ಥಳೀಯ ಉದ್ಯೋಗಗಳು"}</span>
            {highlightedIndex === 2 && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-bounce border border-yellow-200 shrink-0 z-40 whitespace-nowrap">
                👉 నొక్కండి
              </span>
            )}
          </NavLink>

          {/* Index 3: Daily Share (ఈరోజు షేర్) */}
          <NavLink
            to="/daily-share"
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm font-black transition-all duration-500 border-2 relative ${
                isActive
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-yellow-300 shadow-md scale-105"
                  : "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white hover:scale-105"
              }`
            }
          >
            <span>✨ {lang === "te" ? "ఈరోజు షేర్" : "Daily Share"}</span>
          </NavLink>

          {/* Dynamic Categories (Index 3 + idx) */}
          {categories.map((category, idx) => {
            const itemIndex = 3 + idx;
            const isHighlighted = highlightedIndex === itemIndex;
            return (
              <NavLink
                key={category.slug}
                to={category.slug === "health" ? "/health" : `/category/${category.slug}`}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm font-black transition-all duration-500 border-2 relative ${
                    isHighlighted
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white border-yellow-300 ring-4 ring-red-500/80 shadow-[0_0_24px_rgba(239,68,68,0.75)] scale-110 -translate-y-0.5 z-30"
                      : isActive
                      ? "bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30 scale-105"
                      : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-red-500 hover:text-red-600 hover:scale-105"
                  }`
                }
              >
                <span>{categoryEmojis[category.slug] ? `${categoryEmojis[category.slug]} ` : ""}{category.label[lang]}</span>
                {isHighlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-bounce border border-yellow-200 shrink-0 z-40 whitespace-nowrap">
                    👉 నొక్కండి
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </header>
      <Outlet />
      
      <footer className="container-shell border-t border-[hsl(var(--border))] py-8 text-sm text-[hsl(var(--muted-foreground))]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="font-black text-[hsl(var(--foreground))]">VaartaNow</div>
            <p className="mt-1 max-w-xl text-xs">
              {lang === "te" && "తాజా తెలుగు వార్తలు, 24/7 నిరంతరంగా."}
              {lang === "en" && "Live Telugu news, delivered 24/7."}
              {lang === "hi" && "ताज़ा तेलुगु समाचार, 24/7 उपलब्ध।"}
              {lang === "ta" && "தெலுங்கு செய்திகள், 24/7."}
              {lang === "kn" && "ತೆಲುಗು ಸುದ್ದಿ, 24/7."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/jobs/admin" className="text-xs bg-[hsl(var(--muted))] hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-full font-black tracking-wide uppercase transition shrink-0">
              💼 Jobs Admin
            </Link>
            <Link to="/admin" className="text-xs bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] hover:text-white px-3 py-1.5 rounded-full font-black tracking-wide uppercase transition shrink-0">
              ⚙️ Admin Panel
            </Link>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--border))]/40 mt-6 pt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold justify-center sm:justify-start">
          <Link to="/about" className="hover:text-[hsl(var(--primary))] transition">About Us</Link>
          <Link to="/contact" className="hover:text-[hsl(var(--primary))] transition">Contact Us</Link>
          <Link to="/privacy" className="hover:text-[hsl(var(--primary))] transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[hsl(var(--primary))] transition">Terms & Conditions</Link>
          <Link to="/disclaimer" className="hover:text-[hsl(var(--primary))] transition">Disclaimer</Link>
          <a href="/sitemap.xml" className="hover:text-[hsl(var(--primary))] transition" target="_blank" rel="noreferrer">Sitemap</a>
        </div>
      </footer>

      {/* 📍 Floating GPS Location Permission Prompt Banner */}
      {showGPSPrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-[9999] max-w-md animate-in fade-in slide-in-from-bottom duration-300">
          <div className="relative overflow-hidden rounded-[1.8rem] border-2 border-emerald-500/40 bg-white/95 dark:bg-zinc-950/95 p-5 shadow-[0_20px_50px_rgba(16,185,129,0.25)] backdrop-blur-xl">
            {/* Background glowing gradient */}
            <div className="absolute -right-12 -top-12 -z-10 size-32 rounded-full bg-emerald-500/20 blur-2xl" />
            
            <div className="flex items-start gap-3.5">
              <div className="size-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md animate-pulse">
                <MapPin className="size-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-black text-sm text-[hsl(var(--foreground))] truncate">
                    {lang === "te" && "📍 లోకల్ వార్తల కోసం GPSని అనుమతించండి"}
                    {lang === "en" && "📍 Enable GPS for Local News"}
                    {lang === "hi" && "📍 स्थानीय समाचार के लिए GPS सक्षम करें"}
                    {lang === "ta" && "📍 உள்ளூர் செய்திகளுக்கு GPSஐ இயக்கவும்"}
                    {lang === "kn" && "📍 ಸ್ಥಳೀಯ ಸುದ್ದಿಗಾಗಿ GPS ಸಕ್ರಿಯಗೊಳಿಸಿ"}
                  </h4>
                  <button
                    onClick={handleDismissGPSPrompt}
                    className="rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition"
                    aria-label="Close GPS prompt"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-semibold leading-relaxed">
                  {lang === "te" && "హైదరాబాద్, విజయవాడ, విశాఖపట్నం, తిరుపతి వంటి మీ ప్రాంతపు తాజా వార్తలను తక్షణమే పొందడానికి GPS లొకేషన్ అనుమతించండి."}
                  {lang === "en" && "Allow GPS location access to receive hyper-local breaking news for your city & region (Hyderabad, Vijayawada, Vizag, Tirupati, etc.)"}
                  {lang === "hi" && "अपने शहर की ताज़ा ख़बरें पाने के लिए लोकेशन की अनुमति दें।"}
                  {lang === "ta" && "உங்கள் நகரத்தின் முக்கிய செய்திகளைப் பெற இருப்பிட அணுகலை அனுமதிக்கவும்."}
                  {lang === "kn" && "ನಿಮ್ಮ ನಗರದ ಸುದ್ದಿ ಪಡೆಯಲು ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ."}
                </p>

                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    onClick={handleDismissGPSPrompt}
                    className="flex-1 h-9 rounded-full text-xs font-black transition text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
                  >
                    {lang === "te" ? "తర్వాత" : "Skip"}
                  </button>
                  <button
                    onClick={handleEnableGPS}
                    disabled={gpsLoading}
                    className="flex-1 h-9 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                  >
                    <Navigation className={`size-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
                    {gpsLoading 
                      ? (lang === "te" ? "గుర్తిస్తోంది..." : "Detecting...") 
                      : (lang === "te" ? "GPS అనుమతించు" : "Enable GPS")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Mobile Pre-Sleep Idle Wake-Up Banner with Haptic Buzz */}
      {showIdleAlertBanner && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-600 via-amber-600 to-rose-600 p-3 text-white shadow-[0_10px_35px_rgba(220,38,38,0.55)] animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
                🔔
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-200 flex items-center gap-1">
                  <span>⚡ మొబైల్ నిద్రావస్థ నివారణ (Mobile Wake Alert)</span>
                </div>
                <div className="text-xs font-black truncate leading-tight mt-0.5">
                  తాజా వార్తలు & స్థానిక ఉద్యోగాలు చూసేందుకు క్లిక్ చేయండి!
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowIdleAlertBanner(false)}
              className="size-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white shrink-0 text-xs font-black"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-4 left-4 right-4 z-[9998] max-w-md mx-auto md:left-4 md:right-auto animate-in fade-in slide-in-from-bottom duration-300">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl">
            <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
              We use cookies to personalize content, customize third-party ads (Google AdSense), and analyze web traffic. By using our site, you consent to our Privacy Policy.
            </p>
            <div className="flex gap-2.5 mt-3 justify-end">
              <Link to="/privacy" className="h-8 px-3 rounded-xl text-[10px] font-black border border-[hsl(var(--border))] flex items-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
                Read Policy
              </Link>
              <button onClick={handleAcceptCookies} className="h-8 px-4 rounded-xl text-[10px] font-black bg-[hsl(var(--primary))] text-white shadow-sm hover:shadow-indigo-500/10 active:scale-95 transition">
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating glassmorphic PWA Install Promotion Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto md:left-auto md:right-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/85 dark:bg-zinc-950/85 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-300">
            {/* Background glowing gradients */}
            <div className="absolute -left-16 -top-16 -z-10 size-32 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -right-16 -bottom-16 -z-10 size-32 rounded-full bg-indigo-500/20 blur-2xl" />
            
            <div className="flex gap-4">
              {/* App Icon */}
              <div className="relative size-14 shrink-0 rounded-2xl bg-white p-1 shadow-md border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                <img src="/icons/icon-192.svg" alt="VaartaNow Icon" className="size-full rounded-xl object-contain" />
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white font-bold border-2 border-white dark:border-zinc-950">✓</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-black text-sm text-[hsl(var(--foreground))] truncate">VaartaNow Mobile App</h4>
                  <button 
                    onClick={handleDismissClick}
                    className="rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-semibold leading-relaxed">
                  {lang === "te" && "వేగవంతమైన అనుభవం, ఆఫ్‌లైన్ రీడింగ్ కోసం ఇప్పుడే ఇన్‌స్టాల్ చేసుకోండి!"}
                  {lang === "en" && "Install VaartaNow for faster experience & offline news access!"}
                  {lang === "hi" && "तेज़ अनुभव और ऑफ़लाइन समाचारों के लिए अभी इंस्टॉल करें!"}
                  {lang === "ta" && "வேகமான அனுபவம் மற்றும் ஆஃப்லைன் செய்திகளுக்கு இப்போது நிறுவவும்!"}
                  {lang === "kn" && "ವೇಗದ ಅನುಭವ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಸುದ್ದಿಗಳಿಗಾಗಿ ಈಗಲೇ ಸ್ಥಾಪಿಸಿ!"}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    ★ 4.9 PWA
                  </span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold">
                    {lang === "te" && "ఉచితం • 2 MB"}
                    {lang === "en" && "Free • 2 MB"}
                    {lang === "hi" && "मुफ़्त • 2 MB"}
                    {lang === "ta" && "இலவசம் • 2 MB"}
                    {lang === "kn" && "ಉಚಿತ • 2 MB"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleDismissClick}
                className="flex-1 h-10 rounded-full text-xs font-black transition text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
              >
                {lang === "te" && "తర్వాత"}
                {lang === "en" && "Maybe Later"}
                {lang === "hi" && "बाद में"}
                {lang === "ta" && "பிறகு"}
                {lang === "kn" && "ನಂತರ"}
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 h-10 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <Smartphone className="size-3.5" />
                {lang === "te" && "ఇన్‌స్థాల్"}
                {lang === "en" && "Install App"}
                {lang === "hi" && "इंस्टॉल करें"}
                {lang === "ta" && "நிறுவுக"}
                {lang === "kn" && "ಸ್ಥಾಪಿಸಿ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Sticky Bottom Navigation Bar for Mobile (All Telugu Items with Middle + Post Button) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--card))/95] backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex h-16 items-center justify-around px-1">
          
          {/* 1. మన మార్కెట్ */}
          <NavLink
            to="/market"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 transition-all ${
                isActive && !location.search ? "text-blue-600 dark:text-blue-400 font-extrabold" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ShoppingBag className={`size-5 mb-0.5 ${isActive && !location.search ? "stroke-[2.5px]" : ""}`} />
                <span className="text-[10px] font-black tracking-tight leading-none text-center">
                  మన మార్కెట్
                </span>
              </>
            )}
          </NavLink>

          {/* 2. రైతు పంటలు */}
          <NavLink
            to="/raitu-bazar"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 transition-all ${
                isActive ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Sprout className={`size-5 mb-0.5 text-emerald-500 ${isActive ? "stroke-[2.5px]" : ""}`} />
                <span className="text-[10px] font-black tracking-tight leading-none text-center">
                  రైతు పంటలు
                </span>
              </>
            )}
          </NavLink>

          {/* 3. + పోస్ట్ (MIDDLE FLOATING BUTTON WITH + SYMBOL) */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-14 cursor-pointer group"
            aria-label="Create local post"
          >
            <div className="size-11 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg -mt-5 border-2 border-[hsl(var(--card))] group-hover:scale-110 active:scale-95 transition-all duration-200">
              <Plus className="size-6 stroke-[3px]" />
            </div>
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none mt-1">
              + పోస్ట్
            </span>
          </button>

          {/* 4. సేవలు & అద్దెకు */}
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 transition-all ${
                isActive ? "text-teal-600 dark:text-teal-400 font-extrabold" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Wrench className={`size-5 mb-0.5 text-teal-500 ${isActive ? "stroke-[2.5px]" : ""}`} />
                <span className="text-[10px] font-black tracking-tight leading-none text-center">
                  సేవలు & అద్దెలు
                </span>
              </>
            )}
          </NavLink>

          {/* 5. మహిళా మార్కెట్ */}
          <NavLink
            to="/mahila-market"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 transition-all ${
                isActive ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Heart className={`size-5 mb-0.5 text-rose-500 ${isActive ? "stroke-[2.5px] fill-rose-500" : ""}`} />
                <span className="text-[10px] font-black tracking-tight leading-none text-center">
                  మహిళా మార్కెట్
                </span>
              </>
            )}
          </NavLink>

        </div>
      </div>

      {/* 📝 Create Local Post Modal */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      {/* 💬 Floating Smart Assistant Chatbot Widget */}
      <SmartChatbotWidget />
    </div>
  );
}
