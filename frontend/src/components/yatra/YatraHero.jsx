import { Link } from "react-router-dom";
import { btnPrimary } from "../../lib/theme";
import SeatsLeftBadge from "./SeatsLeftBadge";
import { SacredDivider } from "./SacredOrnaments";
import { formatCurrency, durationLabel, formatDate, nextDeparture, startingPrice, discountOriginalPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function YatraHero({ yatra }) {
  const { t } = useLanguage();
  const bg = yatra.heroImages?.[0];
  const dep = nextDeparture(yatra.departureDates);
  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const soldOut = seatsLeft <= 0 || yatra.status !== "published";
  const duration = durationLabel(yatra.durationDays, yatra.durationNights);
  const actualPrice = startingPrice(yatra.price);
  const originalPrice = discountOriginalPrice(actualPrice);

  return (
    // hero-fill: the hero (image + overlay) covers the whole viewport below the
    // navbar; the content block stays as-is, centred vertically within it.
    <header className="hero-fill relative overflow-hidden border-b border-gold-300/15 flex flex-col justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 -z-10">
        {bg ? (
          <img src={bg} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/35 to-transparent" />
      </div>

      <div className="relative site-container pt-16 md:pt-20 pb-12 md:pb-16">
        <nav className="text-xs text-gold-200/60 mb-5">
          <Link to="/events" className="hover:text-cream">{t("yatraDetail.yatras")}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-cream/80">{yatra.title}</span>
        </nav>

        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-300/15 border border-gold-300/35 text-cream">
              {t("yatraCard.by")} {t(`categories.${yatra.category}`)}
            </span>
            {duration && (
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-navy-950/50 border border-gold-300/25 text-cream/80">
                {duration}
              </span>
            )}
            <SeatsLeftBadge seatsLeft={seatsLeft} totalSeats={yatra.totalSeats} />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-cream leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {yatra.title}
          </h1>
          {yatra.tagline && (
            <p className="text-cream/80 mt-3 text-base md:text-lg leading-relaxed">{yatra.tagline}</p>
          )}

          {yatra.route?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {yatra.route.map((r) => (
                <span key={r} className="px-3 py-1 rounded-full bg-navy-950/50 border border-gold-300/25 text-cream text-xs">
                  {r}
                </span>
              ))}
            </div>
          )}

          <SacredDivider className="mt-6 max-w-sm" />

          <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold-200/60">{t("yatraDetail.from")}</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                {originalPrice && (
                  <span className="text-base text-gold-200/40 line-through">{formatCurrency(originalPrice, yatra.price?.currency)}</span>
                )}
                <p className="text-3xl font-bold text-cream">{formatCurrency(actualPrice, yatra.price?.currency)}</p>
                {originalPrice && <span className="text-xs font-bold text-green-400">{t("yatraDetail.discountOff")}</span>}
              </div>
              <p className="text-[11px] text-gold-200/50">{yatra.price?.unit || t("yatraDetail.perPerson")}</p>
            </div>
            <div className="text-base text-cream/80">
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
