import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Newspaper, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import { BreakingTicker } from "@/components/BreakingTicker";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui";
import { setMeta } from "@/lib/seo";
import { useHomeData, useInfinitePosts } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";
import { StickyCricketWidget } from "@/components/StickyCricketWidget";
import { Way2NewsSwiper } from "@/components/Way2NewsSwiper";

export function HomePage() {
  const { lang } = useLanguage();
  const { featured, trending } = useHomeData();
  
  // Fetch all articles for the homepage feed (just like Dailyhunt)
  const feed = useInfinitePosts();
  const [isSwiperOpen, setIsSwiperOpen] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);
  const slides = useMemo(() => feed.posts.slice(0, 7), [feed.posts]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const currentSlide = slides[activeSlide];

  // Multi-Language Translations for "మీ వార్తలు" & UX elements
  const translations = {
    title: {
      te: "మీ వార్తలు",
      en: "Your News",
      hi: "आपके समाचार",
      ta: "உங்கள் செய்திகள்",
      kn: "ನಿಮ್ಮ ಸುದ್ದಿ"
    },
    tagline: {
      te: "తాజా బ్రేకింగ్ వార్తలు మరియు కథనాల సమాహారం",
      en: "Catch up on the latest breaking news stories from all categories",
      hi: "सभी श्रेणियों की ताज़ा और ब्रेकिंग ख़बरें",
      ta: "அனைத்து பிரிவுகளின் சமீபத்திய முக்கிய செய்திகள்",
      kn: "ಎಲ್ಲಾ ವಿಭಾಗಗಳ ಇತ್ತೀಚಿನ ಪ್ರಮುಖ ಸುದ್ದಿಗಳು"
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
    <main className="container-shell space-y-5 py-4">
      <BreakingTicker posts={trending.length ? trending : feed.posts} />



      {/* 🚀 Header Banner: మీ వార్తలు (Your News) Branding */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 p-5 md:p-6 shadow-md backdrop-blur-xl">
        <div className="absolute -left-16 -top-16 -z-10 size-36 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 -z-10 size-36 rounded-full bg-red-500/10 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-black text-[hsl(var(--foreground))]">
              <Sparkles className="size-6 text-red-600 dark:text-red-500 animate-pulse" />
              {translations.title[lang] || translations.title.te}
            </h1>
            <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
              {translations.tagline[lang] || translations.tagline.te}
            </p>
          </div>
          <button
            onClick={() => setIsSwiperOpen(true)}
            className="h-11 rounded-full px-5 text-xs font-black transition flex items-center gap-2 shadow-sm bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white shadow-red-500/20 active:scale-95 duration-200 shrink-0"
          >
            <Sparkles className="size-4 animate-pulse" />
            {lang === "te" ? "కార్డ్స్ రీడర్ 📱" : "Cards Reader 📱"}
          </button>
        </div>
      </section>

      {slides.length > 0 && currentSlide && (
        <section className="grid gap-4 lg:grid-cols-[1.85fr_1.15fr]">
          {/* 📸 Flash Cards Image Gallery */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm hover:shadow-md transition duration-300">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.2rem] bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/50 group/slider">
              <Link to={`/news/${currentSlide.slug}`} className="block size-full">
                {currentSlide.og_image ? (
                  <img
                    src={currentSlide.og_image}
                    alt={currentSlide.title}
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-700 group-hover/slider:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl">
                    VaartaNow
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300" />
                
                {/* Headline overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 text-left">
                  <h2 className="text-base md:text-xl lg:text-2xl font-black leading-snug text-white drop-shadow-lg line-clamp-2 transition-colors duration-300 group-hover/slider:text-red-200">
                    {currentSlide.title}
                  </h2>
                </div>
              </Link>

              {/* Circular Index indicator */}
              <div className="absolute top-4 right-4 z-10 bg-white dark:bg-zinc-950 border-2 border-red-600 dark:border-red-500 rounded-full w-10 h-10 flex items-center justify-center text-xs font-black text-red-600 dark:text-red-500 shadow-md">
                {activeSlide + 1}/{slides.length}
              </div>

              {/* Navigation Chevrons */}
              <button
                onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 shadow-md active:scale-95 animate-fade-in"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 shadow-md active:scale-95 animate-fade-in"
                aria-label="Next slide"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlide === idx ? "w-6 bg-red-600 dark:bg-red-500" : "w-2 bg-[hsl(var(--border))]/80 dark:bg-zinc-800"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 📰 Beside Flashcards: Latest news (మీ వార్తలు) */}
          <div className="flex flex-col rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-red-600" />
              <h3 className="text-base font-black text-red-600 dark:text-red-500 uppercase tracking-wider">
                {translations.title[lang] || translations.title.te}
              </h3>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-red-600" />
            </div>

            <ul className="space-y-3.5 flex-1 pr-1 overflow-y-auto max-h-[380px] no-scrollbar">
              {slides.map((post) => (
                <li key={post.slug} className="border-b border-[hsl(var(--border))]/40 pb-3 last:border-0 last:pb-0">
                  <Link to={`/news/${post.slug}`} className="flex items-start gap-3 group">
                    <span className="mt-1.5 size-2 shrink-0 bg-red-600 dark:bg-red-500 transition-transform group-hover:scale-110 shadow-sm" />
                    <span className="text-sm font-extrabold text-[hsl(var(--foreground))] group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 leading-relaxed">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Newspaper className="size-5 text-[hsl(var(--primary))]" />
              {translations.title[lang] || translations.title.te}
            </h2>
          </div>
          
          <NewsGrid posts={feed.posts} loading={feed.loading} />
          
          {feed.hasMore && (
            <div className="flex justify-center">
              <Button onClick={feed.loadMore} disabled={feed.loading}>
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
          <div className="rounded-[1.4rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
            AdSense 300x250
          </div>
          
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
