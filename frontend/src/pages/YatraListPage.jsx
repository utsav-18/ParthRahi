import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import useDocumentMeta from "../lib/useDocumentMeta";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { btnPrimary, btnSecondary } from "../lib/theme";
import YatraCard from "../components/yatra/YatraCard";
import HowItWorks from "../components/yatra/HowItWorks";
import TrustBand from "../components/yatra/TrustBand";
import { AccordionItem } from "../components/yatra/Accordion";
import { SacredDivider, SacredKicker, MandalaBackdrop } from "../components/yatra/SacredOrnaments";
import { getDefaultFaqs } from "../lib/yatraContent";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";

const HERO_IMG =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1900&q=70";

export default function YatraListPage() {
  const { t } = useLanguage();
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [destination, setDestination] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const CATEGORIES = [
    { value: "", label: t("yatraList.allJourneys") },
    { value: "bus", label: t("yatraList.bySleeperBus") },
  ];

  useDocumentMeta({
    title: t("yatraList.kicker"),
    description:
      "Book guided pilgrimage yatras and group tours with ParthRahi — comfortable travel, hotel stays, sattvic meals and day-wise itineraries. Reserve your seat online with a small advance.",
    image: HERO_IMG,
  });

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch: reset loading on filter change
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (upcomingOnly) params.upcoming = "true";
    api
      .get("/api/yatras", { params })
      .then((res) => {
        if (active) setYatras(res.data.yatras || []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, upcomingOnly]);

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
    <div className="relative z-10 pb-24">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pt-28 md:pt-36 pb-14 md:pb-20 px-4 sm:px-6 md:px-16">
        <div className="absolute inset-0 -z-10">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c1204]/80 via-[#140c03]/90 to-[#0b0a08]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.18),transparent_60%)]" />
        </div>
        <MandalaBackdrop className="left-1/2 -translate-x-1/2 top-6 w-[520px] h-[520px] max-w-[120vw]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <SacredKicker hindi="पवित्र तीर्थ यात्राएँ">{t("yatraList.kicker")}</SacredKicker>
          <h1 className="text-3xl md:text-5xl font-bold text-amber-50 mt-3 leading-tight">
            {t("yatraList.title1")}<br className="hidden sm:block" /> {t("yatraList.title2")}
          </h1>
          <p className="text-amber-100/65 mt-5 max-w-2xl mx-auto text-sm md:text-base">
            {t("yatraList.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <a href="#journeys" className={btnPrimary}>{t("yatraList.browse")}</a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi ParthRahi, I'd like help choosing a yatra.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={btnSecondary}
            >
              💬 {t("yatraList.askWhatsapp")}
            </a>
          </div>
          <SacredDivider mark="श्री" className="mt-10 max-w-md mx-auto" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 space-y-20">
        {/* ── Trust band ───────────────────────────────────── */}
        <TrustBand />

        {/* ── Journeys ─────────────────────────────────────── */}
        <section id="journeys" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <SacredKicker hindi="आगामी प्रस्थान">{t("yatraList.upcomingKicker")}</SacredKicker>
              <h2 className="text-2xl md:text-3xl font-bold text-amber-50 mt-1">{t("yatraList.chooseTitle")}</h2>
            </div>
            <p className="text-amber-200/45 text-sm">
              {filtered.length === 1 ? t("yatraList.journeyAvailable") : t("yatraList.journeysAvailable", { n: filtered.length })}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-colors ${
                    category === c.value
                      ? "bg-gradient-to-r from-amber-300 to-orange-400 text-[#3a1c02] border-amber-300 font-semibold"
                      : "border-amber-200/20 text-amber-100/70 hover:border-amber-200/40"
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
              className="flex-1 min-w-0 bg-[#160f06]/85 border border-amber-200/18 rounded-full px-4 py-2 text-amber-50 text-sm placeholder:text-amber-200/40 focus:outline-none focus:border-amber-300/70"
            />
            <label className="flex items-center gap-2 text-sm text-amber-100/70 shrink-0 cursor-pointer">
              <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} className="accent-amber-400" />
              {t("yatraList.upcomingOnly")}
            </label>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-amber-200/10 bg-amber-950/10 h-96 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400 text-center py-16">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-amber-100/50">
              <p className="text-4xl mb-3">🪔</p>
              <p>{t("yatraList.noMatch")}</p>
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

        <SacredDivider />

        {/* ── How it works ─────────────────────────────────── */}
        <HowItWorks variant="full" />

        <SacredDivider />

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-8">
            <SacredKicker hindi="जानने योग्य">{t("yatraList.faqKicker")}</SacredKicker>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-50 mt-2">{t("yatraList.faqTitle")}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {getDefaultFaqs(t).map((f) => (
              <AccordionItem key={f.q} title={f.q}>
                <p className="text-amber-100/70 leading-relaxed">{f.a}</p>
              </AccordionItem>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-amber-200/15 bg-[#160f06]/70 backdrop-blur-sm px-6 py-10 md:px-12 md:py-12 text-center shadow-2xl shadow-amber-900/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.14),transparent_65%)]" />
          <div className="relative">
            <p className="text-2xl" aria-hidden="true">🙏</p>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-50 mt-2">{t("yatraList.ctaTitle")}</h2>
            <p className="text-amber-100/65 mt-3 max-w-xl mx-auto text-sm md:text-base">
              {t("yatraList.ctaDesc")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
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
