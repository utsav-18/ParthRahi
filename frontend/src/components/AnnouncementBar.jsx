import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/i18n/LanguageContext";

const STORAGE_KEY = "pr-announce-yatra-v1";

const initiallyDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // private mode / storage blocked — show it
  }
};

/**
 * Slim dismissible strip above the navbar pointing visitors at open departures.
 * Kept to a single line (truncated on narrow screens) so the fixed header
 * stays compact. Its height is measured by Layout (--site-header-h).
 * Renders nothing once dismissed (remembered per browser).
 */
export default function AnnouncementBar({ onVisibilityChange }) {
  const [show, setShow] = useState(() => !initiallyDismissed());
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    onVisibilityChange?.(show);
  }, [show, onVisibilityChange]);

  if (!show) return null;

  const dismiss = (e) => {
    e.stopPropagation();
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400 text-navy-950">
      <button
        type="button"
        onClick={() => navigate("/events")}
        className="w-full flex items-center justify-center gap-2 px-10 py-1.5 text-[12px] sm:text-[13px] font-medium cursor-pointer hover:brightness-[1.03] transition"
      >
        <span aria-hidden="true" className="shrink-0 w-1.5 h-1.5 rotate-45 bg-navy-950/70" />
        <span className="min-w-0 truncate">
          <span className="font-semibold">{t("announcement.badge")}</span> {t("announcement.text")}
        </span>
        <span className="hidden sm:inline shrink-0 underline underline-offset-2">{t("announcement.cta")}</span>
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("announcement.dismiss")}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-full text-navy-950/60 hover:text-navy-950 hover:bg-black/10 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
