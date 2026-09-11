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
 * Slim dismissible strip that sits above the navbar, promoting the Yatra module.
 * Rides stay the site's main message — this only announces the new tours section.
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
    <div className="relative w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-[#2a1400]">
      <button
        type="button"
        onClick={() => navigate("/events")}
        className="w-full flex items-center justify-center gap-2 px-10 py-1.5 text-[12px] sm:text-[13px] font-medium cursor-pointer hover:brightness-[1.03] transition"
      >
        <span aria-hidden="true">🕉️</span>
        <span>
          <span className="font-semibold">{t("announcement.badge")}</span> {t("announcement.text")}
        </span>
        <span className="hidden sm:inline underline underline-offset-2">{t("announcement.cta")}</span>
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("announcement.dismiss")}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-full text-[#2a1400]/70 hover:text-[#2a1400] hover:bg-black/10 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
