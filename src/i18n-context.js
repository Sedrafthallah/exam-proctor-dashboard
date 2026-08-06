import { createContext, useContext } from "react";

export const LanguageContext = createContext();

export const translations = {
  en: {
    dashboard: "Dashboard",
  },
  ar: {
    dashboard: "لوحة التحكم",
  },
};

export const useLanguage = () => useContext(LanguageContext);
