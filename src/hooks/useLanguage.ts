import { useEffect, useState } from "react";

export type Language = "te" | "en" | "hi" | "ta" | "kn";

const STORAGE_KEY = "varthanow-language";
const EVENT_NAME = "varthanow-language-change";

export function getActiveLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "te" || stored === "en" || stored === "hi" || stored === "ta" || stored === "kn") return stored;
  return "te"; // default to Telugu
}

export function setActiveLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: lang }));
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(getActiveLanguage);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      setLang(customEvent.detail);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
    };
  }, []);

  const changeLanguage = (nextLang: Language) => {
    setActiveLanguage(nextLang);
  };

  return { lang, changeLanguage };
}
