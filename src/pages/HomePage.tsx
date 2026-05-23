import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { BreakingTicker } from "@/components/BreakingTicker";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui";
import { categories } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import { useHomeData, useInfinitePosts } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";

export function HomePage() {
  const { lang } = useLanguage();
  const feed = useInfinitePosts();
  const { featured, trending } = useHomeData();
  
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

  useEffect(() => {
    const titles: Record<string, string> = {
      te: "VarthaNow - తెలుగు AI వార్తలు",
      en: "VarthaNow - Multilingual AI News",
      hi: "VarthaNow - बहुभाषी एआई समाचार",
      ta: "VarthaNow - பல்மொழி ஏஐ செய்திகள்",
      kn: "VarthaNow - ಬಹುಭಾಷಾ ಎಐ ಸುದ್ದಿ"
    };
    const descriptions: Record<string, string> = {
      te: "ఆంధ్రప్రదేశ్, తెలంగాణ, సినిమా, విశాఖ, టెక్నాలజీ, జాబ్స్, క్రికెట్ మరియు రాజకీయాల తాజా తెలుగు వార్తలు.",
      en: "Latest multilingual news updates covering Andhra Pradesh, Telangana, Cinema, Tech, Jobs, and Cricket.",
      hi: "आंध्र प्रदेश, तेलंगाना, सिनेमा, वाइजाग, तकनीक, नौकरी, क्रिकेट और राजनीति के नवीनतम समाचार।",
      ta: "ஆந்திரா, தெலுங்கானா, சினிமா, விசாகப்பட்டினம், தொழில்நுட்பம், வேலைகள் மற்றும் கிரிக்கெட் பற்றிய முக்கிய செய்திகள்.",
      kn: "ಆಂಧ್ರಪ್ರದೇಶ್, ತೆಲಂಗಾಣ, ಸಿನಿಮಾ, ವಿಶಾಖಪಟ್ಟಣಂ, ತಂತ್ರಜ್ಞಾನ, ಉದ್ಯೋಗ ಮತ್ತು ಕ್ರಿಕೆಟ್‌ನ ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು."
    };
    setMeta({
      title: titles[lang] || titles.te,
      description: descriptions[lang] || descriptions.te,
      canonical: "/"
    });
  }, [lang]);

  return (
    <main className="container-shell space-y-5 py-4">
      <BreakingTicker posts={trending.length ? trending : feed.posts} />

      {slides.length > 0 && currentSlide && (
        <section className="grid gap-4 lg:grid-cols-[1.85fr_1.15fr]">
          {/* 📸 Flash Cards Image Gallery */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[0_12px_30px_rgba(37,99,235,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(37,99,235,0.14)]">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.2rem] bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/50">
              <Link to={`/news/${currentSlide.slug}`} className="block size-full">
                {currentSlide.og_image ? (
                  <img
                    src={currentSlide.og_image}
                    alt={currentSlide.title}
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl">
                    VarthaNow
                  </div>
                )}
              </Link>

              {/* Red Outlined Circular Index Indicator (e.g. 2/7) */}
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

            {/* Slide Caption / Title */}
            <div className="mt-4 text-center px-2">
              <Link to={`/news/${currentSlide.slug}`} className="hover:text-red-600 dark:hover:text-red-500 transition-colors">
                <h2 className="text-base md:text-lg font-black leading-snug text-[hsl(var(--foreground))] line-clamp-2">
                  {currentSlide.title}
                </h2>
              </Link>
            </div>

            {/* Dots Indicator */}
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

          {/* 📰 Beside Flashcards: Latest News Headlines (తాజా వార్తలు) */}
          <div className="flex flex-col rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_12px_30px_rgba(37,99,235,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(37,99,235,0.14)]">
            {/* Elegant Header with styled red text & gradient lines */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-red-600" />
              <h3 className="text-base font-black text-red-600 dark:text-red-500 uppercase tracking-wider">
                {lang === "te" ? "తాజా వార్తలు" : "Latest Headlines"}
              </h3>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-red-600" />
            </div>

            <ul className="space-y-3.5 flex-1 pr-1 overflow-y-auto max-h-[380px] no-scrollbar">
              {slides.map((post, idx) => (
                <li key={post.slug} className="border-b border-[hsl(var(--border))]/40 pb-3 last:border-0 last:pb-0">
                  <Link to={`/news/${post.slug}`} className="flex items-start gap-3 group">
                    {/* Crimson Square Bullet */}
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

      <section className="no-scrollbar flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <Link key={category.slug} to={`/category/${category.slug}`} className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-4 py-2 text-sm font-black">
            {category.label[lang]}
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Newspaper className="size-5 text-[hsl(var(--primary))]" />
              {lang === "te" && "తాజా వార్తలు"}
              {lang === "en" && "Latest News"}
              {lang === "hi" && "ताजा खबरें"}
              {lang === "ta" && "புதிய செய்திகள்"}
              {lang === "kn" && "ಇತ್ತೀಚಿನ ಸುದ್ದಿ"}
            </h2>
          </div>
          <NewsGrid posts={feed.posts} loading={feed.loading} />
          {feed.hasMore && (
            <div className="flex justify-center">
              <Button onClick={feed.loadMore} disabled={feed.loading}>
                {feed.loading ? (
                  lang === "te" ? "ಲೋడ్ అవుతోంది..." : lang === "en" ? "Loading..." : lang === "hi" ? "लोड हो रहा है..." : lang === "ta" ? "ஏற்றப்படுகிறது..." : "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
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
    </main>
  );
}
