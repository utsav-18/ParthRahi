import { useLanguage } from "../lib/i18n/LanguageContext";

/** EN / हिं toggle pill. Used in the desktop navbar and the mobile drawer. */
export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Choose language / भाषा चुनें"
      className={`inline-flex items-center rounded-full border border-slate-600 bg-slate-900/60 p-0.5 text-xs font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
          lang === "en" ? "bg-white text-black" : "text-slate-300 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("hi")}
        aria-pressed={lang === "hi"}
        className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
          lang === "hi" ? "bg-white text-black" : "text-slate-300 hover:text-white"
        }`}
      >
        हिं
      </button>
    </div>
  );
}
