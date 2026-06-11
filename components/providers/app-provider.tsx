"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Language } from "@/lib/types";

const supportedLanguages: Language[] = ["te"];

type AppContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("te");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("varthanow-language") as Language | null;
    const storedTheme = localStorage.getItem("varthanow-theme");
    if (storedLanguage && supportedLanguages.includes(storedLanguage)) setLanguageState(storedLanguage);
    if (storedLanguage && !supportedLanguages.includes(storedLanguage)) localStorage.setItem("varthanow-language", "te");
    if (storedTheme) setDarkMode(storedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("varthanow-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    if (!supportedLanguages.includes(nextLanguage)) return;
    setLanguageState(nextLanguage);
    localStorage.setItem("varthanow-language", nextLanguage);
  };

  const value = useMemo(
    () => ({ language, setLanguage, darkMode, setDarkMode }),
    [language, darkMode]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
