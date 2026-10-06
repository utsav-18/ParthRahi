import { Link } from "react-router-dom";
import SeatsLeftBadge from "./SeatsLeftBadge";
import { formatCurrency, durationLabel, nextDeparture, formatDate, startingPrice, discountOriginalPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function YatraCard({ yatra }) {
  const { t } = useLanguage();
  const cover = yatra.heroImages?.[0];
  const dep = nextDeparture(yatra.departureDates);
  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const duration = durationLabel(yatra.durationDays, yatra.durationNights);
  const actualPrice = startingPrice(yatra.price);
  const originalPrice = discountOriginalPrice(actualPrice);

  return (
    <Link
      to={`/events/${yatra.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gold-300/15 bg-navy-900/70 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-300/35 hover:shadow-[0_20px_50px_rgba(18,30,60,0.55)]"
    >
      <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
        {/* marigold garland (toran) accent along the top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-500 via-gold-200 to-gold-500 z-10" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/55 border border-gold-300/25 text-cream backdrop-blur-sm">
            {t("yatraCard.by")} {t(`categories.${yatra.category}`)}
          </span>
          {duration && (
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/55 border border-gold-300/25 text-cream backdrop-blur-sm">
              {duration}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <SeatsLeftBadge seatsLeft={seatsLeft} totalSeats={yatra.totalSeats} />
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-cream/70">{t("yatraCard.from")}</p>
            {originalPrice && (
              <p className="text-xs text-cream/40 line-through leading-none">{formatCurrency(originalPrice, yatra.price?.currency)}</p>
            )}
            <p className="text-2xl font-bold text-white leading-none drop-shadow">{formatCurrency(actualPrice, yatra.price?.currency)}</p>
            {originalPrice && <p className="text-[10px] font-bold text-green-400 mt-0.5">{t("yatraCard.discountOff")}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 flex-1">
        <div>
          <h3 className="text-lg font-semibold text-cream leading-snug">{yatra.title}</h3>
          {yatra.tagline && <p className="text-sm text-cream/60 mt-1.5 line-clamp-2 leading-relaxed">{yatra.tagline}</p>}
        </div>

        {yatra.route?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {yatra.route.slice(0, 4).map((r) => (
              <span key={r} className="px-2.5 py-1 rounded-full bg-gold-300/10 border border-gold-300/35 text-cream text-xs">
                {r}
              </span>
            ))}
            {yatra.route.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-gold-200/50">+{yatra.route.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-gold-300/15 text-sm text-cream/60">
          <span>{dep ? `🗓 ${t("yatraCard.nextLabel")} ${formatDate(dep)}` : `🗓 ${t("yatraCard.datesSoon")}`}</span>
        </div>

        <span className="text-center text-sm font-semibold text-gold-200 border border-gold-300/35 rounded-lg py-2.5 transition-colors group-hover:bg-gold-300/10">
          {t("yatraCard.viewDetails")}
        </span>
      </div>
    </Link>
  );
}
