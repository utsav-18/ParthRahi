import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Silk from "../Silk";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../lib/i18n/LanguageContext";
import LoginModal from "../LoginModal";
import ConfirmLogoutModal from "../ConfirmLogoutModal";
import ProfileModal from "../ProfileModal";
import AdminLoginModal from "./AdminLoginModal";
import WhatsAppFab from "./WhatsAppFab";
import AnnouncementBar from "./AnnouncementBar";
import LanguageSwitcher from "./LanguageSwitcher";

const btnSecondary =
  "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-slate-500 text-white whitespace-nowrap cursor-pointer bg-slate-900/40 shadow-md shadow-blue-900/30 transition-all duration-300 hover:bg-slate-700/60 hover:border-white/55 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/20 active:translate-y-0";

const btnPrimary =
  "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer border border-white/70 shadow-lg shadow-white/10 transition-all duration-300 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-xl shadow-white/20 active:translate-y-0";

export default function Layout() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const onEvents = location.pathname.startsWith("/events");

  const navItems = [
    { label: t("nav.home"), id: "home" },
    { label: t("nav.bookRide"), id: "book" },
    { label: t("nav.yatra"), id: "events" },
    { label: t("nav.about"), id: "about" },
    { label: t("nav.features"), id: "features" },
    { label: t("nav.contact"), id: "contact" },
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Homepage sections are scroll targets; from another route we navigate home first.
  const goToSection = (id) => {
    setMenuOpen(false);
    if (id === "events") {
      navigate("/events");
      return;
    }
    if (id === "home" && !onHome) {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!onHome) {
      navigate("/", { state: { scrollTo: id } });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* Intro splash */}
      <div
        className={`fixed inset-0 z-80 pointer-events-none transition-opacity duration-700 ${introDone ? "opacity-0" : "opacity-100"}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,82,205,0.42),transparent_60%)]" />
        <div className="relative h-full w-full flex items-center justify-center">
          <div className={`text-center transition-all duration-700 ${introDone ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            <p className="text-[11px] tracking-[0.38em] uppercase text-slate-300/90">ParthRahi</p>
            <h1 className="mt-3 text-3xl md:text-5xl font-semibold text-white">Mobility Platform</h1>
            <p className="mt-4 text-sm text-slate-200">Reliable rides, professionally delivered</p>
          </div>
        </div>
      </div>

      {/* Single global Silk background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk speed={12} scale={1.3} color="#2552cd" noiseIntensity={1} rotation={0} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="aura-blob aura-blob-one" />
        <div className="aura-blob aura-blob-two" />
        <div className="aura-blob aura-blob-three" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,11,27,0.18),rgba(8,11,27,0.48)_60%,rgba(2,4,10,0.82))]" />
      </div>

      <div className={`relative z-10 transition-opacity duration-900 ease-out ${introDone ? "opacity-100" : "opacity-0"}`}>
        {/* Announcement bar + Navbar (stacked, fixed to top together) */}
        <div className="fixed top-0 inset-x-0 z-50">
        <AnnouncementBar onVisibilityChange={setAnnounceOpen} />
        <nav className="w-full px-6 md:px-14 py-5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div
            onClick={() => goToSection("home")}
            className="text-lg md:text-xl font-semibold tracking-wide cursor-pointer"
          >
            ParthRahi
          </div>

          <ul className="hidden md:flex gap-10 text-base">
            {navItems.map((item) => (
              <li
                key={item.id}
                onClick={() => goToSection(item.id)}
                className={`relative cursor-pointer transition after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full ${
                  (item.id === "events" && onEvents) || (item.id === "home" && onHome)
                    ? "opacity-100 after:w-full"
                    : "opacity-80 hover:opacity-100 after:w-0"
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            {!loading &&
              (user ? (
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setIsProfileOpen(true)}
                    className="group relative flex items-center gap-3 py-1 px-2 -ml-2 rounded-full hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all duration-200 cursor-pointer"
                    title="View Profile"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name || "Profile"}
                        className="w-9 h-9 rounded-full border border-cyan-400/40 group-hover:border-cyan-400 object-cover shadow-sm transition-colors"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 group-hover:border-cyan-300 text-white font-semibold text-sm flex items-center justify-center shadow-sm transition-colors">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-white max-w-[130px] truncate group-hover:text-cyan-300 transition-colors">
                        {user.name || user.email?.split("@")[0]}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLogoutOpen(true)}
                    className="cursor-pointer ml-1 text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-lg px-2.5 py-1.5 transition-all"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsLoginOpen(true)} className={btnSecondary}>
                  {t("nav.login")}
                </button>
              ))}
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="cursor-pointer text-xs text-slate-500 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 rounded-lg px-2.5 py-1.5 transition-all"
              title={t("adminLogin.title")}
            >
              {t("nav.admin")}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex flex-col gap-1.5 z-[70]"
            >
              <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </nav>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden transition-opacity duration-300 ease-out will-change-opacity ${
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 bottom-0 w-[75vw] max-w-[320px] bg-slate-900/95 border-l border-slate-700/50 shadow-2xl z-[45] flex flex-col ${announceOpen ? "pt-[116px]" : "pt-[84px]"} px-6 md:hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ul className="flex flex-col gap-2">
            {navItems.map((item, i) => (
              <li
                key={item.id}
                style={{ transitionDelay: menuOpen ? `${100 + i * 50}ms` : "0ms" }}
                className={`transition-all duration-400 ease-out will-change-transform ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
              >
                <button
                  onClick={() => goToSection(item.id)}
                  className="w-full text-left py-4 text-[17px] font-medium text-white border-b border-white/5 hover:text-cyan-300 hover:border-slate-600 active:scale-[0.98] transition-all"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-white/10 pt-6">
            {!loading &&
              (user ? (
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => {
                      setIsProfileOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 cursor-pointer py-1.5 px-2 -ml-2 rounded-xl hover:bg-slate-800/60 active:scale-[0.98] transition-all"
                    title="View Profile"
                  >
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full border border-cyan-400/40 object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 text-white font-semibold text-sm flex items-center justify-center shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white hover:text-cyan-300 transition-colors">{user.name || user.email?.split("@")[0]}</span>
                      <span className="text-xs text-slate-400 truncate max-w-[140px]">{user.email}</span>
                    </div>
                  </div>
                  <button onClick={() => { setIsLogoutOpen(true); setMenuOpen(false); }} className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider">
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="cursor-pointer w-full py-3 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 active:scale-[0.98] transition-all"
                >
                  {t("nav.login")}
                </button>
              ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                setIsAdminLoginOpen(true);
              }}
              className="cursor-pointer w-full mt-3 py-2.5 rounded-xl border border-slate-700/60 text-slate-500 hover:text-cyan-300 hover:border-cyan-500/40 font-medium text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              {t("nav.admin")}
            </button>
          </div>

          <div className="mt-auto mb-10 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 text-center">{t("nav.readyToTravel")}</p>
            <button
              onClick={() => goToSection("book")}
              className="w-full py-3.5 rounded-xl bg-cyan-300 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-300/20 active:scale-[0.98] transition-all"
            >
              {t("footer.bookARide")}
            </button>
          </div>
        </div>

        {/* Page content — nudged down when the announcement bar is visible */}
        <div className={announceOpen ? "pt-8" : ""}>
          <Outlet context={{ openLogin: () => setIsLoginOpen(true) }} />
        </div>

        {/* Footer / Contact */}
        <footer id="contact" className="relative overflow-x-hidden border-t border-slate-700/50">
          <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 w-[72%] h-48 bg-[radial-gradient(circle_at_center,rgba(62,120,255,0.2),transparent_72%)] blur-3xl" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-20 rounded-t-[2rem] border-x border-t border-slate-700/50 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.6),rgba(15,23,42,0.9))] backdrop-blur-sm shadow-[0_-22px_70px_rgba(25,60,160,0.16)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.15fr_0.85fr_0.85fr_1.15fr] gap-12 xl:gap-10">
              <div className="min-w-0 space-y-5">
                <h3 className="text-xl font-semibold tracking-wide text-white">ParthRahi</h3>
                <p className="text-sm leading-6 text-slate-300 max-w-xs">
                  {t("footer.description")}
                </p>
                <div className="pt-1">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">{t("footer.support")}</p>
                  <div className="space-y-1">
                    <a href="tel:8252224027" className="block text-sm text-slate-300 hover:text-white hover:underline transition">8252224027</a>
                    <a href="tel:9296218764" className="block text-sm text-slate-300 hover:text-white hover:underline transition">9296218764</a>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-semibold mb-6 uppercase tracking-wider text-slate-400">{t("footer.company")}</h4>
                <ul className="space-y-4 text-sm text-slate-300">
                  {[
                    { label: t("footer.about"), id: "about" },
                    { label: t("footer.yatraTours"), id: "events" },
                    { label: t("footer.book"), id: "book" },
                    { label: t("footer.contact"), id: "contact" },
                  ].map((item) => (
                    <li key={item.id} onClick={() => goToSection(item.id)} className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer">
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-semibold mb-6 uppercase tracking-wider text-slate-400">{t("footer.riders")}</h4>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li onClick={() => goToSection("book")} className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer">{t("footer.bookARide")}</li>
                  <li onClick={() => goToSection("events")} className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer">{t("footer.yatraTours")}</li>
                  <li onClick={() => goToSection("features")} className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer">{t("footer.safetyGuidelines")}</li>
                  <li onClick={() => goToSection("contact")} className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer">{t("footer.helpSupport")}</li>
                </ul>
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-semibold mb-6 uppercase tracking-wider text-slate-400">{t("footer.getStarted")}</h4>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={() => goToSection("book")} className={`${btnPrimary} w-full`}>{t("footer.bookRide")}</button>
                  <a href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi" target="_blank" rel="noopener noreferrer" className={`${btnSecondary} w-full text-center`}>{t("footer.downloadApp")}</a>
                  <a href="https://play.google.com/store/apps/details?id=com.parthrahi.parth" target="_blank" rel="noopener noreferrer" className={`${btnSecondary} w-full text-center`}>{t("footer.driveWithUs")}</a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-700/50">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 text-center mb-4">{t("footer.followUs")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {[
                  { name: t("footer.instagram"), detail: t("footer.instagramDetail"), logo: "/Insta-logo.png", url: "https://www.instagram.com/parthrahiofficial/" },
                  { name: t("footer.youtube"), detail: t("footer.youtubeDetail"), logo: "/youtube-logo.webp", url: "https://www.youtube.com/@parthrahimobility" },
                  { name: t("footer.facebook"), detail: t("footer.facebookDetail"), logo: "/facebook-logo.png", url: "https://www.facebook.com/profile.php?id=61579536731846" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3.5 flex items-center justify-between gap-3 transition-all duration-300 hover:bg-white/[0.08] hover:border-slate-500 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(31,74,190,0.24)]"
                    aria-label={`${t("footer.open")} ${social.name}`}
                  >
                    <span className="min-w-0 flex items-center gap-3">
                      <span aria-hidden="true" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                        <img src={social.logo} alt={social.name} className="w-[120%] h-[120%] object-contain drop-shadow-md" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white group-hover:text-white">{social.name}</span>
                        <span className="block text-[11px] text-slate-400 truncate group-hover:text-slate-200">{social.detail}</span>
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-100 transition">{t("footer.open")}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-slate-700/50">
            <div className="max-w-6xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p className="text-center sm:text-left">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
              <div className="flex items-center gap-6">
                <span onClick={() => window.open("https://parthrahi-backend.web.app/privacy", "_blank")} className="hover:text-white cursor-pointer transition">{t("footer.privacyPolicy")}</span>
                <span onClick={() => window.open("https://parthrahi-backend.web.app/privacy", "_blank")} className="hover:text-white cursor-pointer transition">{t("footer.termsOfService")}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {onEvents && <WhatsAppFab />}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} />
      <ConfirmLogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={logout} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </div>
  );
}
