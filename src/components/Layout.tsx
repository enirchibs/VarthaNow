import { Link, NavLink, Outlet } from "react-router-dom";
import { Moon, Search, Sun, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { categories } from "@/lib/categories";
import { Button } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";

export function Layout() {
  const [dark, setDark] = useState(false);
  const { lang, changeLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center gap-3">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-lg font-black text-white">V</span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black">VarthaNow</span>
              <span className="block truncate text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {lang === "te" && "తెలుగు AI వార్తలు"}
                {lang === "en" && "Multilingual AI News"}
                {lang === "hi" && "बहुभाषी एआई समाचार"}
                {lang === "ta" && "பல்மொழி ஏஐ செய்திகள்"}
                {lang === "kn" && "ಬಹುಭಾಷಾ ಎಐ ಸುದ್ದಿ"}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] p-1">
              {(["te", "en", "hi", "ta", "kn"] as const).map((code) => {
                const names: Record<string, string> = { te: "TE", en: "EN", hi: "HI", ta: "TA", kn: "KN" };
                const fullName: Record<string, string> = { te: "తెలుగు", en: "English", hi: "हिंदी", ta: "தமிழ்", kn: "ಕನ್ನಡ" };
                const active = lang === code;
                return (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    title={fullName[code]}
                    className={`rounded-full px-2.5 py-1.5 text-xs font-black transition ${
                      active
                        ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))]/50 hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    {names[code]}
                  </button>
                );
              })}
            </div>
            <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {dark ? (
                lang === "te" ? "కాంతి" : lang === "en" ? "Light" : lang === "hi" ? "लाइट" : lang === "ta" ? "ஒளி" : "ಲೈಟ್"
              ) : (
                lang === "te" ? "చీకటి" : lang === "en" ? "Dark" : lang === "hi" ? "डार्क" : lang === "ta" ? "இருள்" : "ಡಾರ್ಕ್"
              )}
            </Button>
          </div>
          <Link to="/search" className="grid size-11 place-items-center rounded-full bg-[hsl(var(--muted))]" aria-label="Search">
            <Search className="size-4" />
          </Link>
        </div>
        <nav className="container-shell no-scrollbar flex gap-2 overflow-x-auto pb-3">
          {categories.map((category) => (
            <NavLink
              key={category.slug}
              to={`/category/${category.slug}`}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                  isActive ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`
              }
            >
              {category.label[lang]}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
      <footer className="container-shell border-t border-[hsl(var(--border))] py-8 text-sm text-[hsl(var(--muted-foreground))]">
        <div className="font-black text-[hsl(var(--foreground))]">VarthaNow</div>
        <p className="mt-1">
          {lang === "te" && "గూగుల్ న్యూస్ RSS + జెమిని AI + సుపాబేస్ పోస్ట్‌గ్రేస్ తో నడిచే తెలుగు AI వార్తల వేదిక."}
          {lang === "en" && "Google News RSS + Gemini AI + Supabase PostgreSQL powered Multilingual AI news platform."}
          {lang === "hi" && "गूगल न्यूज RSS + जेमिनी एआई + सुपरबेस पोस्टग्रेस द्वारा संचालित बहुभाषी एआई समाचार मंच।"}
          {lang === "ta" && "கூகுள் நியூஸ் ஆர்எஸ்எஸ் + ஜெமினி ஏஐ + சூப்பர்பேஸ் போஸ்ட்கிரெஸ் மூலம் இயங்கும் பல்மொழி ஏஐ செய்தி தளம்."}
          {lang === "kn" && "ಗೂಗಲ್ ನ್ಯೂಸ್ ಆರ್‌ಎಸ್‌ಎಸ್ + ಜೆಮಿನಿ ಎಐ + ಸುಪರ್‌ಬೇಸ್ ಪೋಸ್ಟ್‌ಗ್ರೆಸ್ ಆಧಾರಿತ ಬಹುಭಾಷಾ ಎಐ ಸುದ್ದಿ ವೇದಿಕೆ."}
        </p>
      </footer>
    </div>
  );
}
