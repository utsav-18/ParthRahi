import { useState, useId } from "react";
import { formatDate } from "../../lib/format";
import { useLanguage } from "../../lib/i18n/LanguageContext";

function DayCard({ day, index, defaultOpen }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const num = day.dayNumber ?? index + 1;

  return (
    <div className="relative pl-11 sm:pl-14">
      {/* timeline rail */}
      <span className="absolute left-[18px] sm:left-[22px] top-11 bottom-0 w-px bg-gold-300/15" aria-hidden="true" />
      <span className="absolute left-0 top-1.5 grid place-items-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 text-navy-950 text-sm font-bold shadow-[0_4px_14px_rgba(220,174,71,0.3)]">
        {num}
      </span>

      <div className="rounded-xl border border-gold-300/15 bg-navy-900/60 overflow-hidden shadow-lg shadow-black/10">
        <h3 className="m-0">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-panel`}
            id={`${id}-btn`}
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left cursor-pointer transition-colors hover:bg-gold-300/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
          >
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gold-300/75">
                {t("itinerary.day", { n: num })}{day.date ? ` · ${formatDate(day.date)}` : ""}
              </span>
              <span className="block text-base sm:text-lg font-semibold text-cream truncate">{day.title || t("itinerary.day", { n: num })}</span>
            </span>
            <svg
              viewBox="0 0 16 16"
              className={`w-4 h-4 shrink-0 text-gold-200/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </h3>
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} hidden={!open} className="px-4 sm:px-5 pb-5 pt-1 space-y-4">
          {day.image && (
            <img
              src={day.image}
              alt={day.title || `Day ${num}`}
              loading="lazy"
              className="w-full h-40 sm:h-48 object-cover rounded-lg border border-gold-300/15"
            />
          )}
          {day.activities?.length ? (
            <ul className="flex flex-col gap-3">
              {day.activities.map((act, j) => (
                <li key={j} className="flex items-start gap-3">
                  <span className="text-base leading-none shrink-0 mt-0.5">{act.icon || "•"}</span>
                  <div className="min-w-0">
                    {act.time && (
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gold-300">{act.time}</span>
                    )}
                    <span className="block text-cream/75 text-base leading-relaxed">{act.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/50 text-sm">{t("itinerary.detailsTba")}</p>
          )}
          {day.stayNight && (
            <p className="text-sm text-gold-200/60 border-t border-gold-300/15 pt-3">
              🛏️ {t("itinerary.night")} <span className="text-cream/80">{day.stayNight}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryAccordion({ itinerary = [] }) {
  if (!itinerary.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {itinerary.map((day, i) => (
        <DayCard key={day.dayNumber ?? i} day={day} index={i} defaultOpen={i === 0} />
      ))}
    </div>
  );
}
