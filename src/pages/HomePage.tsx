import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Newspaper, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle,
  MapPin,
  Sparkles,
  Filter,
  RefreshCw,
  BookmarkCheck
} from "lucide-react";
import { BreakingTicker } from "@/components/BreakingTicker";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui";
import { setMeta } from "@/lib/seo";
import { useHomeData, useInfinitePosts } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";
import { Way2NewsSwiper } from "@/components/Way2NewsSwiper";
import { detectGPSLocation, getCachedGPSLocation } from "@/lib/location-detector";
import { getUserInterests } from "@/lib/interest-tracker";
import { useBookmarks } from "@/hooks/useBookmarks";
import { demoPosts } from "@/lib/demo-data";
import { categoryLabel } from "@/lib/categories";

const CITIES = [
  "Hyderabad",
  "Vijayawada",
  "Visakhapatnam",
  "Tirupati",
  "Amaravati",
  "Warangal",
  "Guntur",
  "Kurnool",
  "Kakinada",
  "Rajahmundry"
];

export function HomePage() {
  const { lang } = useLanguage();
  const { featured, trending } = useHomeData();
  const { bookmarks } = useBookmarks();
  
  // Local state for personalization & location
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    return getCachedGPSLocation()?.city || "Hyderabad";
  });
  const [feedMode, setFeedMode] = useState<"all" | "personalized" | "location">("all");
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    setUserInterests(getUserInterests());
  }, []);

  // Fetch articles for the homepage feed (20-25 articles minimum per fetch)
  const feed = useInfinitePosts(undefined, {
    userLocation: selectedLocation,
    userInterests: userInterests,
    userBookmarks: bookmarks,
    feedMode: feedMode
  });

  const [isSwiperOpen, setIsSwiperOpen] = useState(false);

  const numSlides = useMemo(() => Math.floor(Math.random() * 3) + 4, []); // 4 to 6 slides
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = useMemo(() => feed.posts.slice(0, numSlides), [feed.posts, numSlides]);

  // Ensure AT LEAST 9 articles are ALWAYS displayed in the main grid
  const displayGridPosts = useMemo(() => {
    if (!feed.posts || feed.posts.length === 0) return [];

    let gridList = feed.posts.slice(numSlides);

    if (gridList.length < 9 && feed.posts.length >= 9) {
      gridList = feed.posts;
    }

    if (gridList.length < 9) {
      const combined = [...gridList];
      for (const item of demoPosts) {
        if (combined.length >= 9) break;
        if (!combined.some((p) => p.slug === item.slug)) {
          combined.push(item);
        }
      }
      gridList = combined;
    }

    return gridList;
  }, [feed.posts, numSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const currentSlide = slides[activeSlide];

  // Handle Refresh & Shuffle Feed action
  const handleRefreshShuffle = () => {
    setIsRefreshing(true);
    feed.refreshFeed();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Handle GPS location detection
  const handleDetectGPS = async () => {
    const loc = await detectGPSLocation();
    if (loc && loc.city) {
      setSelectedLocation(loc.city);
    }
  };

  // Multi-Language Translations for feed headers
  const translations = {
    title: {
      te: "మీ వార్తలు",
      en: "Your News",
      hi: "आपके समाचार",
      ta: "உங்கள் செய்திகள்",
      kn: "ನಿಮ್ಮ ಸುದ್ದಿ"
    },
    allNews: {
      te: "🌐 తాజా వార్తలు",
      en: "🌐 All News",
      hi: "🌐 सभी समाचार",
      ta: "🌐 அனைத்து செய்திகள்",
      kn: "🌐 ಎಲ್ಲಾ ಸುದ್ದಿ"
    },
    forYou: {
      te: "🌟 మీ ఆసక్తులు",
      en: "🌟 For You",
      hi: "🌟 आपके लिए",
      ta: "🌟 உங்களுக்காக",
      kn: "🌟 ನಿಮಗಾಗಿ"
    },
    nearYou: {
      te: "📍 మీ ప్రాంతం",
      en: "📍 Near You",
      hi: "📍 आपके पास",
      ta: "📍 உங்கள் அருகில்",
      kn: "📍 ನಿಮ್ಮ ಹತ್ತಿರ"
    },
    shuffleBtn: {
      te: "🔀 వార్తలను మార్చండి",
      en: "🔀 Refresh & Shuffle",
      hi: "🔀 रीफ्रेश और फेरबदल",
      ta: "🔀 புதுப்பித்து மாற்றுக",
      kn: "🔀 ಮರುಹೊಂದಿಸಿ"
    }
  };

  useEffect(() => {
    const pageTitle = `${translations.title[lang] || translations.title.te} | VaartaNow - Telugu AI News`;
    const descriptions: Record<string, string> = {
      te: "తాజా తెలుగు వార్తలు, బ్రేకింగ్ వార్తలు మరియు అప్‌డేట్స్.",
      en: "Multilingual AI news feed covering latest news in real-time.",
      hi: "सभी विषयों पर ताज़ा समाचार और ब्रेकिंग अपडेट।",
      ta: "முக்கிய செய்திகள் மற்றும் உடனுக்குடன் செய்திகள்.",
      kn: "ಬ್ರೇಕಿಂಗ್ ಸುದ್ದಿಗಳು ಮತ್ತು ಇತ್ತೀಚಿನ ನವೀಕರಣಗಳು."
    };
    setMeta({
      title: pageTitle,
      description: descriptions[lang] || descriptions.te,
      canonical: "/"
    });
  }, [lang]);

  return (
    <main className="container-shell space-y-2 py-1 sm:py-2">
      <BreakingTicker posts={trending.length ? trending : feed.posts} />
      
      {slides.length > 0 && currentSlide && (
        <section className="grid gap-2.5 lg:grid-cols-[2fr_1fr]">
          {/* 📸 Clean Flash Cards Image Gallery with Smooth Shimmer & Soft Shadow */}
          <div className="relative aspect-[21/9] sm:aspect-[21/9] max-h-[210px] sm:max-h-[250px] w-full overflow-hidden rounded-[1.6rem] bg-slate-900 shadow-lg hover:shadow-2xl transition-all duration-500 group/slider flex flex-col justify-between border border-[hsl(var(--border))]/50">
            <Link to={`/news/${currentSlide.slug}`} className="absolute inset-0 size-full overflow-hidden">
              {currentSlide.og_image ? (
                <img
                  key={currentSlide.slug}
                  src={currentSlide.og_image}
                  alt={currentSlide.title}
                  referrerPolicy="no-referrer"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover/slider:scale-105 animate-in fade-in duration-500"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white font-black text-3xl">
                  VaartaNow
                </div>
              )}

              {/* Gentle Glass Light Shimmer Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/slider:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              {/* Gradient Overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
            </Link>

              {/* Top Badges Bar */}
              <div className="relative z-10 p-2 sm:p-3 flex items-center justify-between pointer-events-none">
                {/* Category badge — top left */}
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white border-2 border-white/90 ring-2 ring-red-500/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  {categoryLabel(currentSlide.category)}
                </span>

                <div className="flex items-center gap-2">
                  {/* Breaking badge — top right (only if featured) */}
                  {currentSlide.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider animate-pulse shadow-md">
                      🔴 BREAKING
                    </span>
                  )}

                  {/* Circular Index counter badge */}
                  <div className="bg-white/95 dark:bg-zinc-900/95 border-2 border-red-600 rounded-full size-7 sm:size-8 flex items-center justify-center text-[10px] font-black text-red-600 dark:text-red-400 shadow-lg pointer-events-auto">
                    {activeSlide + 1}/{slides.length}
                  </div>
                </div>
              </div>

              {/* Navigation Chevrons */}
              <button
                onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all duration-200 border border-white/20 shadow-xl active:scale-95 hover:scale-110 cursor-pointer backdrop-blur-md"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all duration-200 border border-white/20 shadow-xl active:scale-95 hover:scale-110 cursor-pointer backdrop-blur-md"
                aria-label="Next slide"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Bottom Content Area: Headline + Time + Overlay Pagination Dots */}
              <div className="relative z-10 p-2 sm:p-4 pt-6 text-left pointer-events-none space-y-1">
                <Link to={`/news/${currentSlide.slug}`} className="block pointer-events-auto group/title">
                  <h2 className="text-sm sm:text-lg font-black leading-snug text-white drop-shadow-md transition-colors duration-300 group-hover/title:text-red-300 line-clamp-1">
                    {currentSlide.title}
                  </h2>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-white/80 flex items-center gap-2">
                    <span>{new Date(currentSlide.published_at).toLocaleTimeString("te-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    {currentSlide.reading_time_min ? <span>· {currentSlide.reading_time_min} min read</span> : null}
                  </p>
                </Link>

                {/* Dots indicator floating cleanly over image bottom overlay */}
                <div className="flex items-center justify-center gap-1 pt-0.5 pointer-events-auto">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer ${
                        activeSlide === idx 
                          ? "w-5 bg-red-600" 
                          : "w-1.5 bg-white/50 hover:bg-white/90"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          {/* 📰 Beside Flashcards: Top headlines */}
          <div className="hidden lg:flex flex-col rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-red-600" />
              <h3 className="text-sm font-black text-red-600 dark:text-red-500 uppercase tracking-wider">
                {translations.title[lang] || translations.title.te}
              </h3>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-red-600" />
            </div>

            <ul className="space-y-2.5 flex-1 pr-1 overflow-y-auto max-h-[220px] no-scrollbar">
              {slides.map((post) => (
                <li key={post.slug} className="border-b border-[hsl(var(--border))]/40 pb-2 last:border-0 last:pb-0">
                  <Link to={`/news/${post.slug}`} className="flex items-start gap-2.5 group">
                    <span className="mt-1.5 size-1.5 shrink-0 bg-red-600 dark:bg-red-500 transition-transform group-hover:scale-110 shadow-sm" />
                    <span className="text-xs font-extrabold text-[hsl(var(--foreground))] group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-1 leading-snug">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 🏷️ MIDDLE FILTER TABS STRIP (COMPACT NO WHITE GAPS) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 my-0.5 whitespace-nowrap">
        {/* All News / Latest News Tab */}
        <button
          onClick={() => setFeedMode("all")}
          className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-black transition-all active:scale-95 cursor-pointer whitespace-nowrap border-2 ${
            feedMode === "all"
              ? "bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30"
              : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-red-500 hover:text-red-600"
          }`}
        >
          🌐 {translations.allNews[lang] || translations.allNews.te}
        </button>

        {/* Unread Tab */}
        <button
          onClick={() => setFeedMode("personalized")}
          className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-black transition-all active:scale-95 cursor-pointer whitespace-nowrap border-2 ${
            feedMode === "personalized"
              ? "bg-amber-500 text-white border-amber-300 shadow-md shadow-amber-500/30"
              : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-amber-500 hover:text-amber-600"
          }`}
        >
          👁️ {lang === "te" ? "చూడనివి" : "Unread"}
        </button>

        {/* Near You / Location Selector Tab */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setFeedMode("location");
              setShowLocationPicker(!showLocationPicker);
            }}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1 whitespace-nowrap border-2 ${
              feedMode === "location"
                ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30"
                : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            <MapPin className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>📍 {selectedLocation || (lang === "te" ? "మీ ప్రాంతం" : "Near You")}</span>
          </button>

          {/* Location Selector Dropdown */}
          {showLocationPicker && (
            <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-xl z-50 animate-in fade-in duration-200">
              <div className="text-[10px] font-black text-[hsl(var(--muted-foreground))] px-2 py-1 uppercase tracking-wider flex justify-between items-center">
                <span>Select Location</span>
                <button onClick={handleDetectGPS} className="text-[9px] text-blue-500 hover:underline">Auto-GPS</button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 mt-1 no-scrollbar">
                {["Hyderabad", "Vijayawada", "Visakhapatnam", "Tirupati", "Guntur", "Warangal", "Nellore", "Kakinada", "Rajahmundry", "Kurnool", "Anantapur", "Karimnagar", "Khammam", "Nizamabad"].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedLocation(city);
                      setShowLocationPicker(false);
                      setFeedMode("location");
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl font-bold transition flex items-center justify-between ${
                      selectedLocation === city ? "bg-red-600 text-white" : "hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedLocation === city && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <NewsGrid posts={displayGridPosts} loading={feed.loading} />
          
          {feed.hasMore && (
            <div className="flex justify-center">
              <Button onClick={feed.loadMore} disabled={feed.loading} className="rounded-full px-6 font-black">
                {feed.loading ? (
                  lang === "te" ? "లోడ్ అవుతోంది..." : lang === "en" ? "Loading..." : lang === "hi" ? "लोड हो रहा है..." : lang === "ta" ? "ஏற்றப்படுகிறது..." : "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
                ) : (
                  lang === "te" ? "మరిన్ని వార్తలు" : lang === "en" ? "More News" : lang === "hi" ? "और खबरें" : lang === "ta" ? "மேலும் செய்திகள்" : "ಹೆಚ್ಚಿನ ಸುದ್ದಿ"
                )}
              </Button>
            </div>
          )}
        </div>
        
        <aside className="space-y-4">
          <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-black">
              <TrendingUp className="size-4 text-emerald-500" />
              {lang === "te" && "ట్రెండింగ్"}
              {lang === "en" && "Trending"}
              {lang === "hi" && "ट्रेंडिंग"}
              {lang === "ta" && "டிரெண்டிங்"}
              {lang === "kn" && "ಟ್ರೆಂಡಿಂಗ್"}
            </h3>
            <div className="space-y-3">
              {trending.map((post) => (
                <Link key={post.slug} to={`/news/${post.slug}`} className="block border-b border-[hsl(var(--border))] pb-3 last:border-0 last:pb-0">
                  <div className="line-clamp-2 text-sm font-black">{post.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* Way2News style Swiper Cards Deck Overlay */}
      {isSwiperOpen && (
        <Way2NewsSwiper 
          posts={feed.posts} 
          onClose={() => setIsSwiperOpen(false)} 
        />
      )}
    </main>
  );
}
