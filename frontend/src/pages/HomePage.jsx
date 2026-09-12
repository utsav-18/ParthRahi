import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import BookRideSection from "../BookRideSection";
import HomeYatraTeaser from "../components/HomeYatraTeaser";
import { useLanguage } from "../lib/i18n/LanguageContext";

const btnPrimary =
  "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer border border-white/70 shadow-lg shadow-white/10 transition-all duration-300 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-xl shadow-white/20 active:translate-y-0";

const btnSecondary =
  "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-slate-500 text-white whitespace-nowrap cursor-pointer bg-slate-900/40 shadow-md shadow-blue-900/30 transition-all duration-300 hover:bg-slate-700/60 hover:border-white/55 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/20 active:translate-y-0";

export default function HomePage() {
  const location = useLocation();
  const { t } = useLanguage();

  // When arriving from another route via the nav, scroll to the requested section.
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    const timer = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.state]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const aboutBadges = [
    ["🏢", t("about.llpTitle"), t("about.llpDesc")],
    ["🇮🇳", t("about.startupTitle"), t("about.startupDesc")],
    ["🛡", t("about.driverTitle"), t("about.driverDesc")],
    ["🚘", t("about.rideOptionsTitle"), t("about.rideOptionsDesc")],
  ];

  const supportContacts = [
    { label: t("about.primarySupport"), number: "8252224027" },
    { label: t("about.alternateSupport"), number: "9296218764" },
  ];

  const founderBadges = [t("founder.badgeLlp"), t("founder.badgeStartup"), t("founder.badgeVerified")];

  const features = [
    [t("features.affordableTitle"), t("features.affordableDesc")],
    [t("features.verifiedTitle"), t("features.verifiedDesc")],
    [t("features.quickTitle"), t("features.quickDesc")],
    [t("features.reliableTitle"), t("features.reliableDesc")],
  ];

  return (
    <>
      {/* HERO */}
      <div id="home" className="relative min-h-screen w-full overflow-hidden pt-[46px] md:pt-[54px]">
        <section className="relative z-10 flex items-center min-h-screen px-6 md:px-16 pt-28 md:pt-0">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-center">
              <div className="text-white text-center md:text-left space-y-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{t("hero.kicker")}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight drop-shadow-[0_8px_24px_rgba(43,101,255,0.28)]">
                  {t("hero.titleLine1")}
                  <br /> {t("hero.titleLine2")}
                </h1>
                <p className="text-sm sm:text-base text-slate-100 max-w-md mx-auto md:mx-0">
                  {t("hero.subtitle")}
                </p>
                <p className="text-green-400 text-sm">{t("hero.offer")}</p>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center md:justify-start">
                  <button onClick={() => scrollTo("book")} className={btnPrimary}>{t("hero.bookRide")}</button>
                  <a href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi" target="_blank" rel="noopener noreferrer" className={btnSecondary}>{t("hero.downloadApp")}</a>
                  <a href="https://play.google.com/store/apps/details?id=com.parthrahi.parth" target="_blank" rel="noopener noreferrer" className={btnSecondary}>{t("hero.becomeDriver")}</a>
                </div>

                {/* Secondary offering — clearly separate from rides */}
                <Link
                  to="/events"
                  className="group mt-2 inline-flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-amber-950/30 px-4 py-3 text-left transition-colors hover:bg-amber-900/40"
                >
                  <span className="text-xl shrink-0" aria-hidden="true">🕉️</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-amber-100">
                      {t("hero.newBadgeTitle")}
                    </span>
                    <span className="block text-[12px] text-amber-100/60">
                      {t("hero.newBadgeSub")}
                    </span>
                  </span>
                  <span className="ml-auto text-amber-200 group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>

              <div className="flex justify-center pt-10 pb-16 md:pb-0 md:pt-0">
                <div className="relative w-[160px] h-[160px] sm:w-[210px] sm:h-[210px] md:w-[300px] md:h-[300px] transition-all duration-500 hover:scale-120">
                  <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl" />
                  <div className="absolute inset-0 rounded-full border border-slate-600" />
                  <img
                    src="/logo.svg"
                    alt="ParthRahi Logo"
                    className="relative z-10 w-full h-full object-cover rounded-full border border-sky-400/60 shadow-[0_0_40px_rgba(80,160,255,0.5)] transition-all duration-500 hover:shadow-[0_0_70px_rgba(80,160,255,0.8)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* BOOK A RIDE */}
      <BookRideSection />

      <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* YATRA & TOURS — a distinct second offering */}
      <HomeYatraTeaser />

      <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ABOUT */}
      <section id="about" className="relative py-28 px-6 md:px-16 overflow-hidden">
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[70%] h-44 bg-[radial-gradient(circle_at_center,rgba(55,115,255,0.22),transparent_70%)] blur-2xl" />
        <div className="relative z-10 max-w-7xl mx-auto rounded-[2rem] border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-blue-500/10">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-3">{t("about.kicker")}</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">{t("about.title")}</h2>
            <p className="text-slate-200 mt-6 max-w-xl mx-auto">
              {t("about.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {aboutBadges.map(([icon, title, desc]) => (
              <div key={title} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl text-center transition-all duration-300 hover:bg-slate-700/60 hover:-translate-y-1 hover:shadow-xl shadow-blue-500/20">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-slate-300">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t("about.whyTitle")}</h3>
              <p className="text-slate-200 mb-6 leading-relaxed">
                {t("about.whyP1")}
              </p>
              <p className="text-slate-200 leading-relaxed">
                {t("about.whyP2")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-lg shadow-blue-500/15 transition-all duration-300">
                <h4 className="font-semibold text-white mb-2">{t("about.missionTitle")}</h4>
                <p className="text-sm text-slate-200">{t("about.missionDesc")}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-lg shadow-blue-500/15 transition-all duration-300">
                <h4 className="font-semibold text-white mb-2">{t("about.visionTitle")}</h4>
                <p className="text-sm text-slate-200">{t("about.visionDesc")}</p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="max-w-3xl mx-auto rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 md:p-8 shadow-xl shadow-blue-500/20">
              <p className="text-slate-300 text-xs uppercase tracking-[0.25em] text-center mb-2">{t("about.supportKicker")}</p>
              <h3 className="text-xl md:text-2xl font-semibold text-white text-center mb-6">{t("about.supportTitle")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {supportContacts.map((contact) => (
                  <div key={contact.number} className="rounded-xl border border-slate-700/50 bg-black/25 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-slate-400">{contact.label}</p>
                      <p className="text-lg font-semibold text-white">{contact.number}</p>
                    </div>
                    <button
                      onClick={() => (window.location.href = `tel:${contact.number}`)}
                      className="shrink-0 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold cursor-pointer border border-white/60 shadow-[0_4px_16px_rgba(255,255,255,0.12)] hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all duration-200"
                    >
                      {t("about.callNow")}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-center text-slate-100 text-sm md:text-base mt-6">
                {t("about.emailLabel")} <span className="font-semibold text-white">parthrahiofficial@gmail.com</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden border-t border-slate-700/50">
        <div className="pointer-events-none absolute top-16 right-[8%] w-56 h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(67,124,255,0.28),transparent_72%)] blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto rounded-[2rem] border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-blue-500/10">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300 mb-3">{t("founder.kicker")}</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">{t("founder.title")}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-5xl mx-auto">
            <div className="flex justify-center md:justify-end">
              <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] transition-all duration-500 hover:scale-105">
                <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl" />
                <div className="absolute inset-0 rounded-full border border-slate-600" />
                <img src="/founder.png" alt="Founder - Aashish Kumar" className="relative z-10 w-full h-full object-cover rounded-full border border-sky-400/60 shadow-[0_0_50px_rgba(80,160,255,0.35)]" />
              </div>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-semibold text-white">{t("founder.name")}</h3>
              <p className="text-sm text-slate-300 uppercase tracking-[0.2em]">{t("founder.role")}</p>
              <p className="text-slate-200 leading-relaxed">
                {t("founder.bio")}
              </p>
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-blue-500/15">
                <p className="text-slate-100 italic">{t("founder.quote")}</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {founderBadges.map((b) => (
                  <span key={b} className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 md:py-28 px-6 md:px-16 overflow-hidden border-t border-slate-700/50">
        <div className="pointer-events-none absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(67,124,255,0.22),transparent_72%)] blur-3xl" />
        <div className="relative z-10 site-container rounded-[2rem] border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-blue-500/10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-5 text-white">{t("features.title")}</h2>
          <p className="readable-copy text-center text-slate-200 max-w-2xl mx-auto mb-12 md:mb-14">
            {t("features.subtitle")}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {features.map(([title, desc]) => (
              <div key={title} className="h-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-2 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-xl shadow-blue-500/20">
                <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
                <p className="readable-copy text-slate-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
