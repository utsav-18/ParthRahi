import { useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import useDocumentMeta from "../lib/useDocumentMeta";
import { localizeYatra } from "../lib/localizeYatra";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { btnPrimary, btnSecondary } from "../lib/theme";
import YatraCard from "../components/yatra/YatraCard";
import HowItWorks from "../components/yatra/HowItWorks";
import TrustBand from "../components/yatra/TrustBand";
import { AccordionItem } from "../components/yatra/Accordion";
import { SacredKicker, MandalaBackdrop, SectionHeader } from "../components/yatra/SacredOrnaments";
import { getDefaultFaqs } from "../lib/yatraContent";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";

export default function YatraListPage() {
  const { t, lang } = useLanguage();
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [destination, setDestination] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const rawYatrasRef = useRef([]);

  const CATEGORIES = [
    { value: "", label: t("yatraList.allJourneys") },
    { value: "bus", label: t("yatraList.bySleeperBus") },
  ];

  useDocumentMeta({
    title: t("yatraList.kicker"),
    description:
      "Book guided pilgrimages and leisure group tours with ParthRahi — comfortable travel, hotel stays, planned meals and day-wise itineraries. Choose your seat online and pay securely.",
    image: yatras[0]?.heroImages?.[0],
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (upcomingOnly) params.upcoming = "true";
    api
      .get("/api/yatras", { params })
      .then((res) => {
        if (!active) return;
        rawYatrasRef.current = res.data.yatras || [];
        setYatras(rawYatrasRef.current.map((y) => localizeYatra(y, lang)));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- language changes are handled by the effect below, not a refetch
  }, [category, upcomingOnly]);

  // Re-apply the Hindi/English overlay instantly when the language switcher changes.
  useEffect(() => {
    if (rawYatrasRef.current.length) setYatras(rawYatrasRef.current.map((y) => localizeYatra(y, lang)));
  }, [lang]);

  const filtered = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (!q) return yatras;
    return yatras.filter(
      (y) =>
        y.title?.toLowerCase().includes(q) ||
        y.startingPoint?.toLowerCase().includes(q) ||
        (y.route || []).some((r) => r.toLowerCase().includes(q))
    );
  }, [yatras, destination]);

  return (
    <div className="relative z-10 yatra-experience pb-20 md:pb-28">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pt-16 md:pt-20 pb-14 md:pb-20">
        <MandalaBackdrop className="left-1/2 -translate-x-1/2 top-10 w-[560px] h-[560px] max-w-[120vw]" />

        <div className="relative site-container max-w-4xl text-center">
          <SacredKicker hindi="तीर्थ और एडवेंचर टूर" center>{t("yatraList.kicker")}</SacredKicker>
          <h1 className="text-[2.1rem] leading-[1.12] sm:text-5xl md:text-6xl font-bold text-cream mt-5 tracking-tight">
            {t("yatraList.title1")}{" "}
            <span className="bg-gradient-to-r from-gold-100 via-gold-300 to-gold-400 bg-clip-text text-transparent">{t("yatraList.title2")}</span>
          </h1>
          <p className="text-cream/70 mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t("yatraList.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="#journeys" className={btnPrimary}>{t("yatraList.browse")} ↓</a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi ParthRahi, I'd like help choosing a yatra.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={btnSecondary}
            >
              💬 {t("yatraList.askWhatsapp")}
            </a>
          </div>
        </div>
      </header>

      <div className="site-container space-y-20 md:space-y-28">
        {/* ── Journeys ─────────────────────────────────────── */}
        <section id="journeys" className="mt-6 sm:mt-8 md:mt-10 pr-panel rounded-[2rem] px-4 py-8 sm:px-6 md:px-10 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <SacredKicker hindi="आगामी प्रस्थान">{t("yatraList.upcomingKicker")}</SacredKicker>
              <h2 className="text-3xl md:text-4xl font-bold text-cream mt-3">{t("yatraList.chooseTitle")}</h2>
            </div>
            <p className="text-gold-200/70 text-sm">
              {filtered.length === 1 ? t("yatraList.journeyAvailable") : t("yatraList.journeysAvailable", { n: filtered.length })}
            </p>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-gold-300/15 bg-navy-950/50 p-3 sm:p-4 flex flex-col lg:flex-row gap-3 mb-8 items-stretch lg:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:pb-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={category === c.value}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
                    category === c.value
                      ? "bg-gold-300 text-navy-950 border-gold-300 font-semibold"
                      : "bg-navy-900/50 border-gold-300/25 text-cream/75 hover:border-gold-300/50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t("yatraList.searchPlaceholder")}
              aria-label={t("yatraList.searchPlaceholder")}
              className="flex-1 min-w-0 bg-navy-950/70 border border-gold-300/20 rounded-xl px-4 py-3 text-cream text-base placeholder:text-cream/40 focus:outline-none focus:border-gold-300/70 focus:ring-2 focus:ring-gold-300/20"
            />
            <label className="flex items-center gap-2 text-sm text-cream/75 shrink-0 cursor-pointer px-1">
              <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} className="accent-gold-400 w-4 h-4" />
              {t("yatraList.upcomingOnly")}
            </label>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-gold-300/10 bg-navy-900/45 h-96 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-300 text-center py-16">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-cream/55">
              <p className="text-4xl mb-3" aria-hidden="true">🧭</p>
              <p className="text-cream/80">{t("yatraList.noMatch")}</p>
              <p className="text-sm mt-1">{t("yatraList.noMatchHint")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((y) => (
                <YatraCard key={y._id || y.slug} yatra={y} />
              ))}
            </div>
          )}
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <HowItWorks variant="full" />

        {/* ── Trust ────────────────────────────────────────── */}
        <section>
          <SectionHeader kicker={t("yatraDetail.whyKicker")} hindi="हम पर भरोसा क्यों" title={t("yatraDetail.whyTitle")} />
          <div className="mt-10">
            <TrustBand />
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto w-full">
          <SectionHeader kicker={t("yatraList.faqKicker")} hindi="जानने योग्य" title={t("yatraList.faqTitle")} />
          <div className="mt-10 flex flex-col gap-2.5">
            {getDefaultFaqs(t).map((f) => (
              <AccordionItem key={f.q} title={f.q}>
                <p className="text-cream/70 leading-relaxed">{f.a}</p>
              </AccordionItem>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-gold-300/30 bg-gradient-to-br from-navy-800/80 via-navy-900/75 to-navy-950/80 backdrop-blur-md px-6 py-12 md:px-12 md:py-14 text-center shadow-[0_30px_80px_rgba(2,6,20,0.5)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,199,107,0.16),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-cream">{t("yatraList.ctaTitle")}</h2>
            <p className="text-cream/70 mt-3 max-w-xl mx-auto text-sm md:text-base">
              {t("yatraList.ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi ParthRahi, please help me plan a yatra.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btnPrimary}
              >
                💬 {t("yatraList.chatCta")}
              </a>
              <a href="tel:8252224027" className={btnSecondary}>{t("yatraList.callCta")}</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
