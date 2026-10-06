import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { useLanguage } from "../lib/i18n/LanguageContext";
import useYatras from "../lib/useYatras";
import { btnPrimary, btnSecondary } from "../lib/theme";
import { getDefaultFaqs } from "../lib/yatraContent";
import { formatCurrency, formatDate, durationLabel, nextDeparture, startingPrice, discountOriginalPrice } from "../lib/format";
import YatraCard from "../components/yatra/YatraCard";
import HowItWorks from "../components/yatra/HowItWorks";
import TrustBand from "../components/yatra/TrustBand";
import SeatsLeftBadge from "../components/yatra/SeatsLeftBadge";
import { AccordionItem } from "../components/yatra/Accordion";
import { SacredKicker, SectionHeader } from "../components/yatra/SacredOrnaments";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";
const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

// Simple line icons for the journey-type tiles (stroke = currentColor).
const TypeIcon = ({ kind }) => {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true" {...common}>
      {kind === "spiritual" && (
        <>
          <path d="M12 2.5l1.6 3.2H10.4L12 2.5z" />
          <path d="M8 9.5h8M9 5.7h6l1 3.8H8l1-3.8z" />
          <path d="M6 21V12.5h12V21M4 21h16M10.5 21v-4.5a1.5 1.5 0 0 1 3 0V21" />
        </>
      )}
      {kind === "leisure" && (
        <>
          <circle cx="17" cy="6.5" r="2.2" />
          <path d="M2.5 17l5.5-7 4 5 2.5-3 5 5" />
          <path d="M3 20.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1" />
        </>
      )}
      {kind === "adventure" && (
        <>
          <path d="M2.5 20.5L10 7l3.5 6 2-3 6 10.5h-19z" />
          <path d="M8.2 10.2L10 12l1.6-1.8" />
          <path d="M10 7V3.5l3 1-3 1" />
        </>
      )}
      {kind === "group" && (
        <>
          <circle cx="8" cy="8" r="2.6" />
          <circle cx="16.5" cy="9" r="2.2" />
          <path d="M3 19.5c0-3 2.2-5 5-5s5 2 5 5" />
          <path d="M13.5 15.2c.9-.6 1.9-.9 3-.9 2.4 0 4 1.8 4 4.4" />
        </>
      )}
    </svg>
  );
};

// Hero card: the soonest upcoming departure, using that journey's own cover
// photo. Falls back to the brand emblem when nothing is published yet.
function FeaturedJourney({ yatra, t }) {
  if (!yatra) {
    return (
      <div className="pr-panel rounded-3xl p-8 md:p-10 text-center">
        <img src="/logo.svg" alt="ParthRahi" className="w-24 h-24 mx-auto rounded-2xl border border-gold-300/30 shadow-[0_0_40px_rgba(220,174,71,0.18)]" />
        <p className="mt-6 text-xl font-semibold text-cream">{t("home.featuredFallbackTitle")}</p>
        <p className="mt-2 text-sm text-cream/60 max-w-xs mx-auto">{t("home.featuredFallbackDesc")}</p>
        <a href={waLink("Hi ParthRahi, when is your next yatra / tour?")} target="_blank" rel="noopener noreferrer" className={`${btnSecondary} mt-6`}>
          💬 {t("home.ctaWhatsapp")}
        </a>
      </div>
    );
  }

  const cover = yatra.heroImages?.[0];
  const dep = nextDeparture(yatra.departureDates);
  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const duration = durationLabel(yatra.durationDays, yatra.durationNights);
  // Same "from" price and UI-only 30% OFF reference as the listing card and
  // detail hero (lib/format.js) — display only, never used for payment.
  const actualPrice = startingPrice(yatra.price);
  const originalPrice = discountOriginalPrice(actualPrice);

  return (
    <Link
      to={`/events/${yatra.slug}`}
      className="group block rounded-3xl overflow-hidden border border-gold-300/25 bg-navy-900/60 shadow-[0_30px_80px_rgba(2,6,20,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/50"
    >
      <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-navy-950 overflow-hidden">
        {cover ? (
          <img src={cover} alt={yatra.title} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <img src="/logo.svg" alt="" className="w-20 h-20 rounded-2xl opacity-70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-gold-300 text-navy-950">
            {t("home.nextDeparture")}
          </span>
          <span className="rounded-full bg-navy-950/75 backdrop-blur-sm">
            <SeatsLeftBadge seatsLeft={seatsLeft} totalSeats={yatra.totalSeats} />
          </span>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-cream leading-snug line-clamp-2">{yatra.title}</h3>
          <p className="mt-2 text-sm text-cream/75 flex flex-wrap gap-x-4 gap-y-1">
            {dep && <span>🗓 {formatDate(dep)}</span>}
            {duration && <span>⏱ {duration}</span>}
            {yatra.startingPoint && <span className="truncate max-w-full">📍 {yatra.startingPoint}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-t border-gold-300/15">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-gold-200/60">{t("yatraCard.from")}</p>
          <div className="flex items-baseline gap-x-2 gap-y-0.5 flex-wrap mt-1">
            {originalPrice && (
              <span className="text-sm text-gold-200/40 line-through">{formatCurrency(originalPrice, yatra.price?.currency)}</span>
            )}
            <span className="text-2xl font-bold text-cream leading-none">{formatCurrency(actualPrice, yatra.price?.currency)}</span>
            {originalPrice && <span className="text-xs font-bold text-green-400">{t("yatraCard.discountOff")}</span>}
          </div>
        </div>
        <span className="text-sm font-semibold text-gold-200 group-hover:text-gold-100 transition-colors">{t("home.viewJourney")}</span>
      </div>
    </Link>
  );
}

// Journeys with a future departure first (soonest at the top), then the rest.
function sortBySoonestDeparture(yatras) {
  const now = Date.now();
  return yatras
    .map((y) => ({ y, dep: nextDeparture(y.departureDates) }))
    .sort((a, b) => {
      const aFuture = Boolean(a.dep && a.dep.getTime() >= now);
      const bFuture = Boolean(b.dep && b.dep.getTime() >= now);
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      return (a.dep?.getTime() ?? Infinity) - (b.dep?.getTime() ?? Infinity);
    })
    .map(({ y }) => y);
}

export default function HomePage() {
  const location = useLocation();
  const { t } = useLanguage();
  const { yatras, loading } = useYatras();

  // When arriving from another route via the nav, scroll to the requested
  // section — once the journey cards above it have loaded, so the target
  // doesn't move after the scroll position was computed.
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target || loading) return;
    const timer = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.state, loading]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const upcoming = useMemo(() => sortBySoonestDeparture(yatras), [yatras]);
  const featured = upcoming[0] || null;

  const heroPoints = [t("home.heroPoint1"), t("home.heroPoint2"), t("home.heroPoint3")];

  const journeyTypes = [
    { kind: "spiritual", title: t("home.typeSpiritualTitle"), desc: t("home.typeSpiritualDesc") },
    { kind: "leisure", title: t("home.typeLeisureTitle"), desc: t("home.typeLeisureDesc") },
    { kind: "adventure", title: t("home.typeAdventureTitle"), desc: t("home.typeAdventureDesc") },
    { kind: "group", title: t("home.typeGroupTitle"), desc: t("home.typeGroupDesc") },
  ];

  const features = [
    ["01", t("home.feature1Title"), t("home.feature1Desc")],
    ["02", t("home.feature2Title"), t("home.feature2Desc")],
    ["03", t("home.feature3Title"), t("home.feature3Desc")],
    ["04", t("home.feature4Title"), t("home.feature4Desc")],
  ];

  const aboutBadges = [
    [t("about.llpTitle"), t("about.llpDesc")],
    [t("about.startupTitle"), t("about.startupDesc")],
    [t("about.driverTitle"), t("about.driverDesc")],
    [t("about.managerTitle"), t("about.managerDesc")],
  ];

  const supportContacts = [
    { label: t("about.primarySupport"), number: "8252224027" },
    { label: t("about.alternateSupport"), number: "9296218764" },
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="home" className="relative min-h-[calc(100svh-var(--site-header-h))] flex items-center pt-12 md:pt-16 pb-16 md:pb-20">
        <div className="site-container grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <SacredKicker center={false}>{t("home.heroKicker")}</SacredKicker>
            <h1 className="mt-5 text-[2.1rem] leading-[1.12] sm:text-5xl md:text-6xl font-bold text-cream tracking-tight">
              {t("home.heroTitle1")}{" "}
              <span className="bg-gradient-to-r from-gold-100 via-gold-300 to-gold-400 bg-clip-text text-transparent">
                {t("home.heroTitle2")}
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-cream/75 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("home.heroSub")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/events" className={btnPrimary}>{t("home.heroExplore")} →</Link>
              <button type="button" onClick={() => scrollTo("how")} className={btnSecondary}>{t("home.heroHow")}</button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start text-sm text-cream/70">
              {heroPoints.map((p) => (
                <li key={p} className="inline-flex items-center gap-2">
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-gold-300/15 border border-gold-300/40 text-gold-200 text-[10px]">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full max-w-md sm:max-w-lg mx-auto lg:max-w-none">
            {loading ? (
              <div className="rounded-3xl border border-gold-300/15 bg-navy-900/40 aspect-[4/3] animate-pulse" />
            ) : (
              <FeaturedJourney yatra={featured} t={t} />
            )}
          </div>
        </div>
      </section>

      <div className="pr-rule site-container" />

      {/* ── JOURNEY TYPES ────────────────────────────────────── */}
      <section id="explore" className="pr-section">
        <div className="site-container">
          <SectionHeader kicker={t("home.typesKicker")} title={t("home.typesTitle")} subtitle={t("home.typesSub")} />
          <div className="mt-10 md:mt-12 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {journeyTypes.map((type) => (
              <Link
                key={type.kind}
                to="/events"
                className="group pr-card pr-card-hover rounded-2xl p-4 sm:p-6 flex flex-col"
              >
                <span className="grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gold-300/10 border border-gold-300/30 text-gold-200 transition-colors group-hover:bg-gold-300/20">
                  <TypeIcon kind={type.kind} />
                </span>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-cream leading-snug">{type.title}</h3>
                <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-cream/60 leading-relaxed flex-1">{type.desc}</p>
                <span className="mt-4 sm:mt-5 text-sm font-semibold text-gold-300 group-hover:text-gold-200 transition-colors">{t("home.typesCta")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING JOURNEYS ────────────────────────────────── */}
      <section id="upcoming" className="pr-section pt-0 md:pt-0">
        <div className="site-container">
          <div className="pr-panel rounded-[2rem] px-5 py-10 md:px-10 md:py-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <SectionHeader align="left" kicker={t("home.upcomingKicker")} title={t("home.upcomingTitle")} subtitle={t("home.upcomingSub")} />
              <Link to="/events" className={`${btnSecondary} self-start md:self-auto shrink-0`}>{t("home.viewAll")} →</Link>
            </div>

            <div className="mt-10">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-2xl border border-gold-300/10 bg-navy-900/40 h-96 animate-pulse" />
                  ))}
                </div>
              ) : upcoming.length ? (
                // With fewer than three journeys, keep cards at their natural width and
                // centred instead of leaving an empty column.
                <div
                  className={`grid gap-5 mx-auto ${
                    upcoming.length === 1 ? "max-w-md" : upcoming.length === 2 ? "sm:grid-cols-2 max-w-4xl" : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {upcoming.slice(0, 3).map((y) => (
                    <YatraCard key={y._id || y.slug} yatra={y} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-gold-300/15 bg-navy-900/40 p-10 text-center text-cream/60 text-sm">
                  {t("home.noUpcoming")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW BOOKING WORKS ────────────────────────────────── */}
      <section id="how" className="pr-section pt-0 md:pt-0">
        <div className="site-container">
          <HowItWorks variant="full" />
        </div>
      </section>

      <div className="pr-rule site-container" />

      {/* ── WHY PARTHRAHI + TRUST ────────────────────────────── */}
      <section id="features" className="pr-section">
        <div className="site-container">
          <SectionHeader kicker={t("home.whyKicker")} title={t("home.whyTitle")} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([num, title, desc]) => (
              <div key={num} className="pr-card pr-card-hover rounded-2xl p-6">
                <span className="text-sm font-bold tracking-widest text-gold-300">{num}</span>
                <h3 className="mt-3 text-lg font-semibold text-cream">{title}</h3>
                <p className="mt-2 text-sm text-cream/65 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <SacredKicker center>{t("home.trustKicker")}</SacredKicker>
            <div className="mt-6">
              <TrustBand />
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT + FOUNDER ──────────────────────────────────── */}
      <section id="about" className="pr-section pt-0 md:pt-0">
        <div className="site-container">
          <div className="pr-panel rounded-[2rem] px-5 py-10 md:px-12 md:py-14">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <SectionHeader align="left" kicker={t("about.kicker")} title={t("about.title")} subtitle={t("about.subtitle")} />
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {aboutBadges.map(([title, desc]) => (
                    <div key={title} className="rounded-xl border border-gold-300/15 bg-navy-950/40 p-4">
                      <p className="text-sm font-semibold text-cream">{title}</p>
                      <p className="text-xs text-cream/55 mt-1 leading-snug">{desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-4 text-cream/70 leading-relaxed">
                  <p>{t("about.whyP1")}</p>
                  <p>{t("about.whyP2")}</p>
                </div>
                <div className="mt-8 grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gold-300/15 bg-navy-950/40 p-5">
                    <h4 className="font-semibold text-gold-200 mb-1.5">{t("about.missionTitle")}</h4>
                    <p className="text-sm text-cream/65 leading-relaxed">{t("about.missionDesc")}</p>
                  </div>
                  <div className="rounded-xl border border-gold-300/15 bg-navy-950/40 p-5">
                    <h4 className="font-semibold text-gold-200 mb-1.5">{t("about.visionTitle")}</h4>
                    <p className="text-sm text-cream/65 leading-relaxed">{t("about.visionDesc")}</p>
                  </div>
                </div>
              </div>

              {/* Founder */}
              <div className="rounded-2xl border border-gold-300/20 bg-navy-950/45 p-6 md:p-8">
                <SacredKicker>{t("founder.kicker")}</SacredKicker>
                <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <div className="shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600">
                    <img src="/founder.png" alt={t("founder.name")} className="w-full h-full object-cover rounded-full bg-navy-900" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-semibold text-cream">{t("founder.name")}</h3>
                    <p className="text-xs text-gold-200/70 uppercase tracking-[0.2em] mt-1">{t("founder.role")}</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                      {[t("founder.badgeLlp"), t("founder.badgeStartup"), t("founder.badgeVerified")].map((b) => (
                        <span key={b} className="text-[11px] px-2.5 py-1 rounded-full bg-gold-300/10 border border-gold-300/25 text-gold-100">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-cream/70 leading-relaxed">{t("founder.bio")}</p>
                <blockquote className="mt-6 border-l-2 border-gold-300/60 pl-4 text-cream/90 italic leading-relaxed">
                  {t("founder.quote")}
                </blockquote>

                {/* Founder's certificate — opens full size in a new tab */}
                <figure className="mt-8">
                  <figcaption className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">
                    {t("founder.certTitle")}
                  </figcaption>
                  <a
                    href="/Certificate.jpeg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl overflow-hidden border border-gold-300/25 bg-navy-950/60 transition-all hover:border-gold-300/50 hover:-translate-y-0.5"
                    title={t("founder.certOpen")}
                  >
                    <img
                      src="/Certificate.jpeg"
                      alt={t("founder.certAlt")}
                      width="1123"
                      height="794"
                      loading="lazy"
                      className="w-full h-auto object-contain"
                    />
                  </a>
                  <p className="mt-2 text-xs text-cream/50">{t("founder.certCaption")}</p>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="pr-section pt-0 md:pt-0">
        <div className="site-container max-w-3xl">
          <SectionHeader kicker={t("home.faqKicker")} title={t("home.faqTitle")} />
          <div className="mt-10 flex flex-col gap-2.5">
            {getDefaultFaqs(t).map((f) => (
              <AccordionItem key={f.q} title={f.q}>
                <p className="text-cream/70 leading-relaxed">{f.a}</p>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="pb-20 md:pb-28">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[2rem] border border-gold-300/30 bg-gradient-to-br from-navy-800/80 via-navy-900/75 to-navy-950/80 backdrop-blur-md px-6 py-12 md:px-14 md:py-16 text-center shadow-[0_30px_80px_rgba(2,6,20,0.5)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,199,107,0.18),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-cream">{t("home.ctaTitle")}</h2>
              <p className="mt-4 text-cream/70 max-w-xl mx-auto">{t("home.ctaDesc")}</p>
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                <Link to="/events" className={btnPrimary}>{t("home.ctaExplore")} →</Link>
                <a href={waLink("Hi ParthRahi, please help me choose a yatra / tour.")} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                  💬 {t("home.ctaWhatsapp")}
                </a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-cream/60">
                {supportContacts.map((c) => (
                  <a key={c.number} href={`tel:${c.number}`} className="hover:text-gold-200 transition-colors">
                    {c.label}: <span className="text-cream font-medium">{c.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
