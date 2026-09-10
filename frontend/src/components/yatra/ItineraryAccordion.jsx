import { useState, useId } from "react";
import { formatDate } from "../../lib/format";

function DayCard({ day, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const num = day.dayNumber ?? index + 1;

  return (
    <div className="relative pl-12">
      {/* timeline rail */}
      <span className="absolute left-[18px] top-11 bottom-0 w-px bg-amber-200/15" aria-hidden="true" />
      <span className="absolute left-0 top-1.5 grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-[#3a1c02] text-xs font-bold shadow-[0_4px_14px_rgba(251,146,60,0.3)]">
        {num}
      </span>

      <div className="rounded-xl border border-amber-200/10 bg-[#160f06]/45 overflow-hidden">
        <h3 className="m-0">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-panel`}
            id={`${id}-btn`}
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-amber-400/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
          >
            <span className="flex-1 min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-amber-300/75">
                Day {num}{day.date ? ` · ${formatDate(day.date)}` : ""}
              </span>
              <span className="block text-sm font-semibold text-amber-50 truncate">{day.title || `Day ${num}`}</span>
            </span>
            <svg
              viewBox="0 0 16 16"
              className={`w-4 h-4 shrink-0 text-amber-200/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </h3>
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} hidden={!open} className="px-4 pb-4 pt-1 space-y-3">
          {day.image && (
            <img
              src={day.image}
              alt={day.title || `Day ${num}`}
              loading="lazy"
              className="w-full h-40 sm:h-48 object-cover rounded-lg border border-amber-200/10"
            />
          )}
          {day.activities?.length ? (
            <ul className="flex flex-col gap-3">
              {day.activities.map((act, j) => (
                <li key={j} className="flex items-start gap-3">
                  <span className="text-base leading-none shrink-0 mt-0.5">{act.icon || "•"}</span>
                  <div className="min-w-0">
                    {act.time && (
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-orange-300">{act.time}</span>
                    )}
                    <span className="block text-amber-100/75 text-sm leading-relaxed">{act.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/50 text-sm">Details to be announced.</p>
          )}
          {day.stayNight && (
            <p className="text-[12px] text-amber-200/60 border-t border-amber-200/10 pt-2">
              🛏️ Night: <span className="text-amber-100/80">{day.stayNight}</span>
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
