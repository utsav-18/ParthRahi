import { Link } from "react-router-dom";
import { btnPrimary } from "../../lib/theme";
import SeatsLeftBadge from "./SeatsLeftBadge";
import { SacredDivider } from "./SacredOrnaments";
import { formatCurrency, durationLabel, formatDate, nextDeparture } from "../../lib/format";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function YatraHero({ yatra }) {
  const { t } = useLanguage();
  const bg = yatra.heroImages?.[0];
  const dep = nextDeparture(yatra.departureDates);
  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const soldOut = seatsLeft <= 0 || yatra.status !== "published";
  const duration = durationLabel(yatra.durationDays, yatra.durationNights);

  return (
    <header className="relative overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0 -z-10">
        {bg ? (
          <img src={bg} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#160f06]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0906] via-[#0b0906]/80 to-[#0b0906]/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0906]/85 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-16 pt-52 md:pt-64 pb-10 md:pb-14">
        <nav className="text-xs text-amber-200/60 mb-5">
          <Link to="/events" className="hover:text-amber-100">{t("yatraDetail.yatras")}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-amber-100/80">{yatra.title}</span>
        </nav>

        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-300/15 border border-amber-300/30 text-amber-100">
              {t("yatraCard.by")} {t(`categories.${yatra.category}`)}
            </span>
            {duration && (
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/40 border border-amber-200/20 text-amber-100/80">
                {duration}
              </span>
            )}
            <SeatsLeftBadge seatsLeft={seatsLeft} totalSeats={yatra.totalSeats} />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-amber-50 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {yatra.title}
          </h1>
          {yatra.tagline && (
            <p className="text-amber-100/80 mt-3 text-sm md:text-base">{yatra.tagline}</p>
          )}

          {yatra.route?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {yatra.route.map((r) => (
                <span key={r} className="px-3 py-1 rounded-full bg-black/35 border border-amber-200/20 text-amber-100 text-xs">
                  {r}
                </span>
              ))}
            </div>
          )}

          <SacredDivider className="mt-6 max-w-sm" />

          <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-200/60">{t("yatraDetail.from")}</p>
              <p className="text-3xl font-bold text-amber-50">{formatCurrency(yatra.price?.amount, yatra.price?.currency)}</p>
              <p className="text-[11px] text-amber-200/50">
                {yatra.price?.unit || t("yatraDetail.perPerson")}
                {yatra.price?.advanceAmount ? ` ${t("yatraDetail.reserveWithInline", { amount: formatCurrency(yatra.price.advanceAmount, yatra.price.currency) })}` : ""}
              </p>
            </div>
            <div className="text-sm text-amber-100/80">
              <p>📍 {yatra.startingPoint}</p>
              <p className="mt-1">🗓 {t("yatraDetail.nextDeparture")}: {dep ? formatDate(dep) : t("yatraDetail.tba")}</p>
            </div>
          </div>

          <div className="mt-6">
            {soldOut ? (
              <span className={`${btnPrimary} opacity-50 cursor-not-allowed`}>
                {yatra.status !== "published" ? t("yatraDetail.bookingClosed") : t("yatraDetail.soldOut")}
              </span>
            ) : (
              <Link to={`/events/${yatra.slug}/book`} className={btnPrimary}>
                {t("yatraDetail.reserveSeatArrow")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
