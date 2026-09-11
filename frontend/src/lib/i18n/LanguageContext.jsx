import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./en";
import hi from "./hi";

const DICTS = { en, hi };
const STORAGE_KEY = "pr-lang";

const LanguageContext = createContext(null);

const getByPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "hi") return saved;
    } catch {
      /* ignore */
    }
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  // t('nav.home') → looks up en/hi dictionaries by dot path, falls back to English,
  // then to the key itself. Supports {{var}} interpolation via the second argument.
  const t = useCallback(
    (key, vars) => {
      let str = getByPath(DICTS[lang], key);
      if (str == null) str = getByPath(DICTS.en, key);
      if (str == null) return key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{{${k}}}`, v);
        }
      }
      return str;
    },
    [lang]
  );

  const toggleLang = useCallback(() => setLang((l) => (l === "en" ? "hi" : "en")), []);

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, toggleLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
