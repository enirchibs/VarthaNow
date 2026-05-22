import { useEffect, useState } from "react";
import { SearchBox } from "@/components/SearchBox";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui";
import { categories, categoryLabel } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import { useInfinitePosts } from "@/hooks/usePosts";
import type { NewsCategory } from "@/types/news";
import { useLanguage } from "@/hooks/useLanguage";

export function SearchPage() {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const feed = useInfinitePosts({ query, category });

  useEffect(() => {
    const titles: Record<string, string> = {
      te: "తెలుగు వార్తల సెర్చ్ - VarthaNow",
      en: "Search News - VarthaNow",
      hi: "समाचार खोजें - VarthaNow",
      ta: "செய்திகள் தேடல் - VarthaNow",
      kn: "ಸುದ್ದಿ ಹುಡುಕಾಟ - VarthaNow"
    };
    const descriptions: Record<string, string> = {
      te: "తెలుగు వార్తలు, AP, Telangana, cinema, Vizag, jobs, cricket, politics కోసం వేగవంతమైన సెర్చ్.",
      en: "Fast search engine for AP, Telangana, cinema, Vizag, technology, jobs, cricket, and politics.",
      hi: "आंध्र प्रदेश, तेलंगाना, सिनेमा, वाइजाग, नौकरी, क्रिकेट और राजनीति के लिए तेज़ समाचार खोज इंजन।",
      ta: "ஆந்திரா, தெலுங்கானா, சினிமா, விசாகப்பட்டினம், வேலைகள், கிரிக்கெட், அரசியல் செய்திகளைத் தேடுவதற்கான விரைவான தளம்.",
      kn: "ಆಂಧ್ರಪ್ರದೇಶ್, ತೆಲಂಗಾಣ, ಸಿನಿಮಾ, ವಿಶಾಖ ಉದ್ಯೋಗಗಳು, ಕ್ರಿಕೆಟ್ ಮತ್ತು ರಾಜಕೀಯ ಸುದ್ದಿಗಳಿಗಾಗಿ ವೇಗದ ಹುಡುಕಾಟ ಎಂಜಿನ್."
    };
    setMeta({
      title: titles[lang] || titles.te,
      description: descriptions[lang] || descriptions.te,
      canonical: "/search"
    });
  }, [lang]);

  return (
    <main className="container-shell space-y-5 py-4">
      <SearchBox query={query} onQuery={setQuery} />
      <section className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          onClick={() => setCategory("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${category === "all" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}
        >
          {lang === "te" ? "అన్ని" : lang === "en" ? "All" : lang === "hi" ? "सभी" : lang === "ta" ? "அனைத்தும்" : "ಎಲ್ಲಾ"}
        </button>
        {categories.map((item) => (
          <button
            key={item.slug}
            onClick={() => setCategory(item.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${category === item.slug ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}
          >
            {categoryLabel(item.slug, lang)}
          </button>
        ))}
      </section>
      <NewsGrid posts={feed.posts} loading={feed.loading} />
      {feed.hasMore && (
        <Button onClick={feed.loadMore}>
          {lang === "te" ? "మరిన్ని ఫలితాలు" : lang === "en" ? "More Results" : lang === "hi" ? "और परिणाम" : lang === "ta" ? "மேலும் முடிவுகள்" : "ಹೆಚ್ಚಿನ ಫಲಿತಾಂಶಗಳು"}
        </Button>
      )}
    </main>
  );
}
