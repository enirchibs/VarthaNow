import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import { trendingSearches } from "@/lib/categories";
import { useLanguage } from "@/hooks/useLanguage";

export function SearchBox({ query, onQuery }: { query: string; onQuery: (value: string) => void }) {
  const { lang } = useLanguage();
  const currentTrending = trendingSearches[lang];

  return (
    <section className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={
            lang === "te" ? "తెలుగు వార్తలు సెర్చ్ చేయండి..." :
            lang === "en" ? "Search news articles..." :
            lang === "hi" ? "समाचार खोजें..." :
            lang === "ta" ? "செய்திகளைத் தேடுங்கள்..." :
            "ಸುದ್ದಿ ಲೇಖನಗಳನ್ನು ಹುಡುಕಿ..."
          }
          className="pl-11"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {currentTrending.map((item: string) => (
          <button key={item} onClick={() => onQuery(item)} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-bold">
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
