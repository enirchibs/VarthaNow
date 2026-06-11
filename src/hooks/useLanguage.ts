import { useEffect, useState } from "react";

export type Language = "te" | "en" | "hi" | "ta" | "kn";

const STORAGE_KEY = "varthanow-language";
const EVENT_NAME = "varthanow-language-change";

export function getActiveLanguage(): Language {
  return "te"; // restricted to Telugu only
}

export function setActiveLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.warn("Failed to write language to localStorage:", e);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: lang }));
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(getActiveLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
