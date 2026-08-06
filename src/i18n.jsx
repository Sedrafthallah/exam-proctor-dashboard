import { useState, useEffect } from "react";
import { LanguageContext, translations } from "./i18n-context";

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = (key) => translations[locale][key] || key;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
