import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui";
import { categoryLabel } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import { useInfinitePosts } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";
import type { NewsCategory } from "@/types/news";

export function CategoryPage() {
  const { category = "andhra-pradesh" } = useParams();
  const typedCategory = category as NewsCategory;
  const feed = useInfinitePosts({ category: typedCategory });
  const { lang } = useLanguage();
  const label = categoryLabel(category, lang);

  useEffect(() => {
    const titles: Record<string, string> = {
      te: `${label} వార్తలు - VarthaNow`,
      en: `${label} News - VarthaNow`,
      hi: `${label} समाचार - VarthaNow`,
      ta: `${label} செய்திகள் - VarthaNow`,
      kn: `${label} ಸುದ್ದಿ - VarthaNow`
    };
    const descriptions: Record<string, string> = {
      te: `${label} తాజా తెలుగు వార్తలు, AI రీరైట్ కథనాలు, SEO అప్డేట్స్.`,
      en: `Latest ${label} news, AI rewrite stories, and SEO updates.`,
      hi: `${label} के नवीनतम समाचार, एआई रीराइट कहानियां और एसईओ अपडेट।`,
      ta: `${label} முக்கிய செய்திகள், ஏஐ மூலம் உருவாக்கப்பட்ட கட்டுரைகள் மற்றும் எஸ்சிஓ தகவல்கள்.`,
      kn: `${label} ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು, ಎಐ ರೀರೈಟ್ ಕಥೆಗಳು ಮತ್ತು ಎಸ್‌ಇಓ ನವೀಕರಣಗಳು.`
    };
    setMeta({
      title: titles[lang] || titles.te,
      description: descriptions[lang] || descriptions.te,
      canonical: `/category/${category}`
    });
  }, [category, label, lang]);

  return (
    <main className="container-shell space-y-5 py-4">
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h1 className="text-3xl font-black">{label}</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {lang === "te" && "Google News RSS నుంచి Gemini AI ద్వారా రూపొందించిన తాజా తెలుగు కథనాలు."}
          {lang === "en" && "Latest articles curated from Google News RSS and generated via Gemini AI."}
          {lang === "hi" && "गूगल न्यूज RSS से क्यूरेट और जेमिनी एआई द्वारा उत्पन्न नवीनतम समाचार।"}
          {lang === "ta" && "கூகுள் நியூஸ் ஆர்எஸ்எஸ் மூலம் தொகுக்கப்பட்டு ஜெமினி ஏஐ மூலம் உருவாக்கப்பட்ட முக்கிய செய்திகள்."}
          {lang === "kn" && "ಗೂಗಲ್ ನ್ಯೂಸ್ ಆರ್‌ಎಸ್‌ಎಸ್‌ನಿಂದ ಸಂಗ್ರಹಿಸಿ ಜೆಮಿನಿ ಎಐ ಮೂಲಕ ರಚಿಸಲಾದ ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು."}
        </p>
      </section>
      <NewsGrid posts={feed.posts} loading={feed.loading} />
      {feed.hasMore && (
        <div className="flex justify-center">
          <Button onClick={feed.loadMore} disabled={feed.loading}>
            {lang === "te" ? "మరిన్ని వార్తలు" : lang === "en" ? "More News" : lang === "hi" ? "और खबरें" : lang === "ta" ? "மேலும் செய்திகள்" : "ಹೆಚ್ಚಿನ ಸುದ್ದಿ"}
          </Button>
        </div>
      )}
    </main>
  );
}
