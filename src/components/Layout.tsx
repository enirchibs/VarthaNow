import { Link, NavLink, Outlet } from "react-router-dom";
import { Moon, Search, Sun, Home, X, Smartphone, Video, User, Bookmark, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { categories } from "@/lib/categories";
import { Button } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";

const categoryEmojis: Record<string, string> = {
  viralshorts: "🔥",
  "andhra-pradesh": "🏛️",
  telangana: "🏛️",
  devotional: "🕉️",
  health: "🏥",
  cricket: "🏏",
  politics: "📢",
  cinema: "🎬",
  vizag: "🌊",
  technology: "💻",
  business: "📈"
};

export function Layout() {
  const [dark, setDark] = useState(false);
  const { lang, changeLanguage } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

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
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const consent = localStorage.getItem("vaartanow-cookie-consent");
    if (!consent) {
      setShowCookieConsent(true);
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
  };

  const handleDismissClick = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "true");
    setShowInstallBanner(false);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem("vaartanow-cookie-consent", "true");
    setShowCookieConsent(false);
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
                {lang === "en" && "Multilingual AI News"}
                {lang === "hi" && "बहुभाषी एआई समाचार"}
                {lang === "ta" && "பல்மொழி ஏஐ செய்திகள்"}
                {lang === "kn" && "ಬಹುಭಾಷಾ ಎಐ ಸುದ್ದಿ"}
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

            <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {dark ? (
                lang === "te" ? "కాంతి" : lang === "en" ? "Light" : lang === "hi" ? "लाइट" : lang === "ta" ? "ஒளி" : "లైట్"
              ) : (
                lang === "te" ? "చీకటి" : lang === "en" ? "Dark" : lang === "hi" ? "डार्क" : lang === "ta" ? "இருள்" : "డార్క్"
              )}
            </Button>

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
        <nav className="container-shell no-scrollbar flex gap-1 md:gap-2 overflow-x-auto pb-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `shrink-0 rounded-full p-1 md:p-2.5 text-[9px] md:text-sm font-black transition ${
                isActive ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            <Home className="size-3 md:size-4.5" />
          </NavLink>
          
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `shrink-0 rounded-full px-1.5 py-0.5 md:px-4 md:py-2 text-[9px] md:text-sm font-black transition ${
                isActive ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {lang === "te" ? "మీ వార్తలు" : lang === "en" ? "Your News" : lang === "hi" ? "आपके समाचार" : lang === "ta" ? "உங்கள் செய்திகள்" : "ನಿಮ್ಮ ಸುದ್ದಿ"}
          </NavLink>

          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `shrink-0 rounded-full px-1.5 py-0.5 md:px-4 md:py-2 text-[9px] md:text-sm font-black transition ${
                isActive ? "bg-[hsl(var(--primary))] text-white shadow-sm shadow-indigo-500/15" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80 hover:text-[hsl(var(--foreground))]"
              }`
            }
          >
            {lang === "te" ? "💼 ఉద్యోగాలు" : lang === "en" ? "💼 Jobs Hub" : lang === "hi" ? "💼 जॉब्स हब" : lang === "ta" ? "💼 வேலைவாய்ப்பு" : "💼 ಉದ್ಯೋಗಗಳು"}
          </NavLink>

          {categories.map((category) => (
            <NavLink
              key={category.slug}
              to={category.slug === "health" ? "/health" : `/category/${category.slug}`}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-1.5 py-0.5 md:px-4 md:py-2 text-[9px] md:text-sm font-black transition ${
                  isActive ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`
              }
            >
              {categoryEmojis[category.slug] ? `${categoryEmojis[category.slug]} ` : ""}{category.label[lang]}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
      
      <footer className="container-shell border-t border-[hsl(var(--border))] py-8 text-sm text-[hsl(var(--muted-foreground))]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="font-black text-[hsl(var(--foreground))]">VaartaNow</div>
            <p className="mt-1 max-w-xl text-xs">
              {lang === "te" && "గూగుల్ న్యూస్ RSS + జెమిని AI + సుపాబేస్ పోస్ట్‌గ్రేస్ తో నడిచే తెలుగు AI వార్తల వేదిక."}
              {lang === "en" && "Google News RSS + Gemini AI + Supabase PostgreSQL powered Multilingual AI news platform."}
              {lang === "hi" && "गूगल न्यूज RSS + जेमिनी एआई + सुपरबेस पोस्टग्रेस द्वारा संचालित बहुभाषी एआई समाचार मंच।"}
              {lang === "ta" && "கூகுள் நியூஸ் ஆர்எஸ்எஸ் + ஜெமினி ஏஐ + சூப்பர்பேಸ್ போஸ்ட்கிரெஸ் மூலம் இயங்கும் பல்மொழி ஏஐ செய்தி தளம்."}
              {lang === "kn" && "ಗೂಗಲ್ ನ್ಯೂಸ್ ಆರ್‌ಎಸ್‌ಎಸ್ + ಜೆಮಿನಿ ಎಐ + ಸುಪರ್‌ಬೇಸ್ ಪೋಸ್ಟ್‌ಗ್ರೆಸ್ ಆಧಾರಿತ ಬಹುಭಾಷಾ ಎಐ ಸುದ್ದಿ ವೇದಿಕೆ."}
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

      {/* Sticky Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))/85] backdrop-blur-xl shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex h-16 items-center justify-around px-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <Home className={`size-6 ${isActive ? "fill-[hsl(var(--primary))]" : ""}`} />
            )}
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <Search className={`size-6 ${isActive ? "stroke-[3px]" : ""}`} />
            )}
          </NavLink>

          <NavLink
            to="/category/viralshorts"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <Video className={`size-6 ${isActive ? "fill-[hsl(var(--primary))]" : ""}`} />
            )}
          </NavLink>

          <NavLink
            to="/health"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <Heart className={`size-6 ${isActive ? "fill-[hsl(var(--primary))]" : ""}`} />
            )}
          </NavLink>

          <NavLink
            to="/bookmarks"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            {({ isActive }) => (
              <Bookmark className={`size-6 ${isActive ? "fill-[hsl(var(--primary))]" : ""}`} />
            )}
          </NavLink>
        </div>
      </div>
    </div>
  );
}
