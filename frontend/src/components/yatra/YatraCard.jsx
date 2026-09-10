import { Link } from "react-router-dom";
import SeatsLeftBadge from "./SeatsLeftBadge";
import { formatCurrency, durationLabel, nextDeparture, formatDate } from "../../lib/format";

export default function YatraCard({ yatra }) {
  const cover = yatra.heroImages?.[0];
  const dep = nextDeparture(yatra.departureDates);
  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const duration = durationLabel(yatra.durationDays, yatra.durationNights);

  return (
    <Link
      to={`/events/${yatra.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-amber-200/12 bg-[#160f06]/50 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300/35 hover:shadow-[0_20px_50px_rgba(40,20,4,0.6)]"
    >
      <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
        {/* marigold garland (toran) accent along the top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 z-10" />
        {cover ? (
          <img
            src={cover}
            alt={yatra.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-3xl">🛕</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/90 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/55 border border-amber-200/20 text-amber-50 backdrop-blur-sm">
            By {yatra.category}
          </span>
          {duration && (
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/55 border border-amber-200/20 text-amber-50 backdrop-blur-sm">
              {duration}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <SeatsLeftBadge seatsLeft={seatsLeft} totalSeats={yatra.totalSeats} />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-amber-100/70">from</p>
            <p className="text-xl font-bold text-white leading-none drop-shadow">{formatCurrency(yatra.price?.amount, yatra.price?.currency)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <h3 className="text-base font-semibold text-amber-50 leading-snug">{yatra.title}</h3>
          {yatra.tagline && <p className="text-xs text-amber-100/50 mt-1 line-clamp-2">{yatra.tagline}</p>}
        </div>

        {yatra.route?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {yatra.route.slice(0, 4).map((r) => (
              <span key={r} className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-300/20 text-amber-100 text-[11px]">
                {r}
              </span>
            ))}
            {yatra.route.length > 4 && (
              <span className="px-2 py-0.5 text-[11px] text-amber-200/40">+{yatra.route.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-amber-200/10 text-xs text-amber-100/55">
          <span>{dep ? `🗓 Next: ${formatDate(dep)}` : "🗓 Dates soon"}</span>
          {yatra.price?.advanceAmount ? (
            <span className="text-amber-200/80">₹{yatra.price.advanceAmount.toLocaleString("en-IN")} to reserve</span>
          ) : null}
        </div>

        <span className="text-center text-xs font-semibold text-amber-200 border border-amber-300/30 rounded-lg py-2 transition-colors group-hover:bg-amber-300/10">
          View details &amp; itinerary →
        </span>
      </div>
    </Link>
  );
}
