import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, TrendingUp } from "lucide-react";
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
  const hero = featured[0] ?? feed.posts[0];

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

      {hero && (
        <section className="overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_12px_30px_rgba(37,99,235,0.08)]">
          <Link to={`/news/${hero.slug}`} className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative aspect-[16/10] bg-[hsl(var(--muted))] lg:aspect-auto">
              {hero.og_image && <img src={hero.og_image} alt={hero.title} className="size-full object-cover" />}
            </div>
            <div className="flex flex-col justify-center p-5 md:p-7">
              <span className="mb-3 inline-flex w-fit rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">
                {lang === "te" && "ఫీచర్డ్"}
                {lang === "en" && "Featured"}
                {lang === "hi" && "विशेष"}
                {lang === "ta" && "சிறப்பு"}
                {lang === "kn" && "ವಿಶೇಷ"}
              </span>
              <h1 className="text-3xl font-black leading-tight md:text-4xl">{hero.title}</h1>
              <p className="mt-3 text-base leading-7 text-[hsl(var(--muted-foreground))]">{hero.excerpt}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-black text-[hsl(var(--primary))]">
                {lang === "te" && "పూర్తి కథనం చదవండి"}
                {lang === "en" && "Read Full Story"}
                {lang === "hi" && "पूरी कहानी पढ़ें"}
                {lang === "ta" && "முழு செய்தியையும் படிக்க"}
                {lang === "kn" && "ಪೂರ್ಣ ವರದಿ ಓದಿ"}
                <ArrowRight className="size-4" />
              </div>
            </div>
          </Link>
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
