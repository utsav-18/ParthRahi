import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import YatraCard from "./yatra/YatraCard";
import { SacredKicker } from "./yatra/SacredOrnaments";
import { useLanguage } from "../lib/i18n/LanguageContext";

const btnGold =
  "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 text-[#3a1c02] font-semibold whitespace-nowrap cursor-pointer shadow-[0_6px_20px_rgba(251,146,60,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";

const btnGoldOutline =
  "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-amber-300/45 text-amber-100 whitespace-nowrap cursor-pointer bg-amber-950/30 transition-all duration-300 hover:bg-amber-900/40 hover:-translate-y-0.5 active:translate-y-0";

/**
 * Homepage section for the Yatra module. Deliberately uses the warm "dharmik"
 * palette (not the blue ride theme) so visitors immediately see this is a
 * separate offering — multi-day guided tours, not point-to-point rides.
 */
export default function HomeYatraTeaser() {
  const [yatras, setYatras] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;
    api
      .get("/api/yatras")
      .then((r) => active && setYatras((r.data.yatras || []).slice(0, 2)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const points = [
    ["🗓", t("homeTeaser.point1Title"), t("homeTeaser.point1Desc")],
    ["🧭", t("homeTeaser.point2Title"), t("homeTeaser.point2Desc")],
    ["💳", t("homeTeaser.point3Title"), t("homeTeaser.point3Desc")],
  ];

  return (
    <section id="yatra-teaser" className="relative py-20 md:py-28 px-6 md:px-16 overflow-hidden border-t border-amber-200/12">
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[70%] h-48 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.18),transparent_70%)] blur-2xl" />

      <div className="relative z-10 max-w-7xl mx-auto rounded-[2rem] border border-amber-200/15 bg-[#160f06]/70 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-amber-900/10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Copy */}
          <div>
            <SacredKicker hindi="ParthRahi Yatra">{t("homeTeaser.kicker")}</SacredKicker>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-50 mt-3 leading-tight">
              {t("homeTeaser.title")}
            </h2>
            <p className="text-amber-100/70 mt-4 text-sm md:text-base leading-relaxed">
              {t("homeTeaser.desc")}
            </p>

            <ul className="mt-6 space-y-2.5">
              {points.map(([icon, title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="text-lg shrink-0" aria-hidden="true">{icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-amber-50">{title}</span>
                    <span className="block text-[13px] text-amber-100/60">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/events" className={btnGold}>{t("homeTeaser.exploreCta")}</Link>
              <a href="tel:8252224027" className={btnGoldOutline}>{t("homeTeaser.talkToDesk")}</a>
            </div>
          </div>

          {/* Live cards */}
          <div className="space-y-4">
            {yatras.length > 0 ? (
              yatras.map((y) => <YatraCard key={y._id || y.slug} yatra={y} />)
            ) : (
              <div className="rounded-2xl border border-amber-200/12 bg-amber-950/15 p-8 text-center text-amber-100/50 text-sm">
                {t("homeTeaser.comingSoon")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
