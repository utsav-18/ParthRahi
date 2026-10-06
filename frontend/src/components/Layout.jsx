import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import Silk from "../Silk";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../lib/i18n/LanguageContext";
import LoginModal from "../LoginModal";
import ConfirmLogoutModal from "../ConfirmLogoutModal";
import ProfileModal from "../ProfileModal";
import AdminLoginModal from "./AdminLoginModal";
import AnnouncementBar from "./AnnouncementBar";
import LanguageSwitcher from "./LanguageSwitcher";
import { ADMIN_BASE } from "../lib/adminPath";
import { btnSecondary } from "../lib/theme";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";

function Avatar({ user, size = "w-9 h-9" }) {
  return user.profilePicture ? (
    <img
      src={user.profilePicture}
      alt={user.name || "Profile"}
      className={`${size} rounded-full border border-gold-300/40 object-cover`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-gold-200 to-gold-500 text-navy-950 font-semibold text-sm flex items-center justify-center`}>
      {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "U"}
    </div>
  );
}

function Brand({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 cursor-pointer shrink-0">
      <img src="/logo.svg" alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-gold-300/30" />
      <span className="text-lg md:text-xl font-semibold tracking-wide text-cream">ParthRahi</span>
    </button>
  );
}

export default function Layout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const onEvents = location.pathname.startsWith("/events");
  const onAdmin = location.pathname.startsWith(ADMIN_BASE);

  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(onAdmin);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const headerRef = useRef(null);
  const { user, loading, logout } = useAuth();

  const navItems = [
    { label: t("nav.home"), id: "home" },
    { label: t("nav.yatra"), id: "events" },
    { label: t("nav.about"), id: "about" },
    { label: t("nav.features"), id: "features" },
    { label: t("nav.contact"), id: "contact" },
  ];

  useEffect(() => {
    if (introDone) return undefined;
    const timer = window.setTimeout(() => setIntroDone(true), 1200);
    return () => window.clearTimeout(timer);
  }, [introDone]);

  // Publish the fixed header's real height as --site-header-h (see index.css)
  // so <main>, anchor scrolling, sticky elements and the mobile drawer all
  // clear it exactly — whatever the breakpoint, language, or whether the
  // announcement bar is shown. Layout effect: measured before first paint.
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (onAdmin || !header) return undefined;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--site-header-h", `${Math.round(header.getBoundingClientRect().height)}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--site-header-h");
    };
  }, [onAdmin]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Homepage sections are scroll targets; from another route we navigate home first.
  // "contact" is the footer, which exists on every page, so it scrolls in place.
  const goToSection = (id) => {
    setMenuOpen(false);
    if (id === "events") {
      navigate("/events");
      return;
    }
    if (id === "contact") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
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
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const isActive = (id) => (id === "events" && onEvents) || (id === "home" && onHome);

  return (
    <div className="relative w-full min-h-screen bg-navy-950 text-cream overflow-x-clip">
      {/* Intro splash */}
      {!onAdmin && (
        <div
          className={`fixed inset-0 z-80 pointer-events-none transition-opacity duration-700 ${introDone ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-navy-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,199,107,0.16),transparent_55%)]" />
          <div className="relative h-full w-full flex items-center justify-center">
            <div className={`text-center transition-all duration-700 ${introDone ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
              <img src="/logo.svg" alt="" className="w-16 h-16 mx-auto rounded-2xl border border-gold-300/40" />
              <p className="mt-5 text-[11px] tracking-[0.38em] uppercase text-gold-300">{t("intro.kicker")}</p>
              <h1 className="mt-3 text-3xl md:text-5xl font-semibold text-cream">{t("intro.title")}</h1>
              <p className="mt-4 text-sm text-cream/70">{t("intro.sub")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Single global Silk background — the ParthRahi signature. Only a light
          navy wash sits on top so the silk stays visible behind every page;
          sections use translucent panels rather than opaque fills. */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk speed={10} scale={1.3} color="#2b4fb5" noiseIntensity={1} rotation={0} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,25,0.38)_0%,rgba(4,9,25,0.5)_55%,rgba(4,9,25,0.68)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(234,199,107,0.08),transparent_55%)]" />
      </div>

      <div className={`relative z-10 transition-opacity duration-700 ease-out ${introDone ? "opacity-100" : "opacity-0"}`}>
        {!onAdmin && (
          <>
            {/* Announcement bar + Navbar (stacked, fixed to top together) */}
            <div ref={headerRef} className="fixed top-0 inset-x-0 z-50">
              <AnnouncementBar />
              <nav className="w-full bg-navy-950/75 backdrop-blur-xl border-b border-gold-300/15 shadow-[0_8px_30px_rgba(2,6,20,0.35)]">
                <div className="site-container h-16 md:h-[72px] flex items-center justify-between gap-4">
                  <Brand onClick={() => goToSection("home")} />

                  <ul className="hidden lg:flex items-center gap-8 text-[15px]">
                    {navItems.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => goToSection(item.id)}
                          className={`relative py-1 cursor-pointer transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold-300 after:transition-all after:duration-300 hover:after:w-full ${
                            isActive(item.id) ? "text-cream after:w-full" : "text-cream/70 hover:text-cream after:w-0"
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="hidden lg:flex items-center gap-3">
                    <LanguageSwitcher />
                    {!loading &&
                      (user ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsProfileOpen(true)}
                            className="group flex items-center gap-2.5 py-1 pl-1 pr-3 rounded-full border border-transparent hover:border-gold-300/25 hover:bg-navy-800/50 transition-all cursor-pointer"
                            title={t("nav.viewProfile")}
                          >
                            <Avatar user={user} />
                            <span className="text-sm font-medium text-cream max-w-[120px] truncate group-hover:text-gold-200 transition-colors">
                              {user.name || user.email?.split("@")[0]}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsLogoutOpen(true)}
                            className="cursor-pointer text-xs text-cream/50 hover:text-red-300 border border-cream/15 hover:border-red-400/40 rounded-lg px-2.5 py-1.5 transition-all"
                          >
                            {t("nav.logout")}
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setIsLoginOpen(true)} className={`${btnSecondary} !px-5 !py-2.5`}>
                          {t("nav.login")}
                        </button>
                      ))}
                    <button
                      type="button"
                      onClick={() => setIsAdminLoginOpen(true)}
                      className="cursor-pointer text-[11px] text-cream/40 hover:text-gold-200 border border-cream/10 hover:border-gold-300/35 rounded-lg px-2 py-1.5 transition-all"
                      title={t("adminLogin.title")}
                    >
                      {t("nav.admin")}
                    </button>
                  </div>

                  <div className="lg:hidden flex items-center gap-3">
                    <LanguageSwitcher />
                    <button
                      type="button"
                      onClick={() => setMenuOpen(!menuOpen)}
                      aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                      aria-expanded={menuOpen}
                      className="relative z-[70] w-10 h-10 grid place-items-center rounded-full border border-gold-300/25 bg-navy-900/60 cursor-pointer"
                    >
                      <span className="flex flex-col gap-1.5">
                        <span className={`block w-5 h-0.5 bg-cream transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-5 h-0.5 bg-cream transition ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-5 h-0.5 bg-cream transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                      </span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            {/* Mobile Menu Overlay */}
            <div
              className={`fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-[40] lg:hidden transition-opacity duration-300 ease-out ${
                menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu Drawer */}
            <div
              className={`fixed top-0 right-0 bottom-0 w-[82vw] max-w-[340px] bg-navy-900/97 border-l border-gold-300/15 shadow-2xl z-[45] flex flex-col overflow-y-auto pt-[calc(var(--site-header-h)+0.75rem)] px-6 lg:hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <ul className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <li
                    key={item.id}
                    style={{ transitionDelay: menuOpen ? `${100 + i * 50}ms` : "0ms" }}
                    className={`transition-all duration-400 ease-out ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                  >
                    <button
                      type="button"
                      onClick={() => goToSection(item.id)}
                      className={`w-full text-left py-4 text-[17px] font-medium border-b border-cream/5 transition-colors cursor-pointer ${
                        isActive(item.id) ? "text-gold-200" : "text-cream hover:text-gold-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-cream/10 pt-6">
                {!loading &&
                  (user ? (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(true);
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer py-1.5 px-2 -ml-2 rounded-xl hover:bg-navy-800/60 transition-all min-w-0 text-left"
                        title={t("nav.viewProfile")}
                      >
                        <Avatar user={user} size="w-10 h-10" />
                        <span className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-cream truncate">{user.name || user.email?.split("@")[0]}</span>
                          <span className="text-xs text-cream/50 truncate">{user.email}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogoutOpen(true);
                          setMenuOpen(false);
                        }}
                        className="cursor-pointer shrink-0 text-xs font-semibold text-cream/50 hover:text-cream uppercase tracking-wider"
                      >
                        {t("nav.logout")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setIsLoginOpen(true);
                      }}
                      className={`${btnSecondary} w-full`}
                    >
                      {t("nav.login")}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsAdminLoginOpen(true);
                  }}
                  className="cursor-pointer w-full mt-3 py-2.5 rounded-xl border border-cream/10 text-cream/40 hover:text-gold-200 hover:border-gold-300/35 font-medium text-xs uppercase tracking-wider transition-all"
                >
                  {t("nav.admin")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Page content starts below the fixed header (.site-main pads by
            --site-header-h). The admin area has its own sticky header in
            AdminShell, so it gets no public-header offset. */}
        {onAdmin ? (
          <Outlet context={{ openLogin: () => setIsLoginOpen(true) }} />
        ) : (
          <main className="site-main">
            <Outlet context={{ openLogin: () => setIsLoginOpen(true) }} />
          </main>
        )}

        {/* Footer / Contact */}
        {!onAdmin && (
          <footer id="contact" className="relative border-t border-gold-300/20 bg-navy-950/70 backdrop-blur-md">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent" />
            <div className="site-container py-14 md:py-16">
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
                {/* Brand */}
                <div className="col-span-2 lg:col-span-1 min-w-0 space-y-5">
                  <Brand onClick={() => goToSection("home")} />
                  <p className="text-sm leading-6 text-cream/60 max-w-sm">{t("footer.description")}</p>
                  <div className="flex gap-2.5">
                    {[
                      { name: t("footer.instagram"), logo: "/Insta-logo.png", url: "https://www.instagram.com/parthrahiofficial/" },
                      { name: t("footer.youtube"), logo: "/youtube-logo.webp", url: "https://www.youtube.com/@parthrahimobility" },
                      { name: t("footer.facebook"), logo: "/facebook-logo.png", url: "https://www.facebook.com/profile.php?id=61579536731846" },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("footer.open")} ${social.name}`}
                        title={social.name}
                        className="w-10 h-10 grid place-items-center rounded-full border border-gold-300/20 bg-navy-900/70 transition-all hover:-translate-y-0.5 hover:border-gold-300/50"
                      >
                        <img src={social.logo} alt="" className="w-7 h-7 object-contain" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Explore */}
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold mb-5 uppercase tracking-[0.2em] text-gold-300">{t("footer.explore")}</h4>
                  <ul className="space-y-3.5 text-sm text-cream/70">
                    <li><Link to="/events" className="hover:text-gold-200 transition-colors">{t("footer.allTours")}</Link></li>
                    <li><button type="button" onClick={() => goToSection("how")} className="hover:text-gold-200 transition-colors cursor-pointer text-left">{t("footer.howBooking")}</button></li>
                    <li><button type="button" onClick={() => goToSection("faq")} className="hover:text-gold-200 transition-colors cursor-pointer text-left">{t("footer.faq")}</button></li>
                  </ul>
                </div>

                {/* Company */}
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold mb-5 uppercase tracking-[0.2em] text-gold-300">{t("footer.company")}</h4>
                  <ul className="space-y-3.5 text-sm text-cream/70">
                    <li><button type="button" onClick={() => goToSection("about")} className="hover:text-gold-200 transition-colors cursor-pointer text-left">{t("footer.about")}</button></li>
                    <li><button type="button" onClick={() => goToSection("features")} className="hover:text-gold-200 transition-colors cursor-pointer text-left">{t("footer.whyUs")}</button></li>
                    <li><a href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi" target="_blank" rel="noopener noreferrer" className="hover:text-gold-200 transition-colors">{t("footer.downloadApp")} ↗</a></li>
                    <li><a href="https://play.google.com/store/apps/details?id=com.parthrahi.parth" target="_blank" rel="noopener noreferrer" className="hover:text-gold-200 transition-colors">{t("footer.driveWithUs")} ↗</a></li>
                  </ul>
                </div>

                {/* Contact */}
                <div className="col-span-2 lg:col-span-1 min-w-0">
                  <h4 className="text-xs font-semibold mb-5 uppercase tracking-[0.2em] text-gold-300">{t("footer.getInTouch")}</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-cream/45 mb-1">{t("footer.support")}</p>
                      <a href="tel:8252224027" className="block text-cream/80 hover:text-gold-200 transition-colors">8252224027</a>
                      <a href="tel:9296218764" className="block text-cream/80 hover:text-gold-200 transition-colors">9296218764</a>
                    </div>
                    <a href="mailto:parthrahiofficial@gmail.com" className="block text-cream/80 hover:text-gold-200 transition-colors break-all">
                      parthrahiofficial@gmail.com
                    </a>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi ParthRahi, I have a question about your tours.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnSecondary} !px-5 !py-2.5 mt-2`}
                    >
                      💬 {t("footer.whatsapp")}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gold-300/10">
              <div className="site-container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/45">
                <p className="text-center sm:text-left">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
                <div className="flex items-center gap-6">
                  <a href="https://parthrahi-backend.web.app/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">{t("footer.privacyPolicy")}</a>
                  <a href="https://parthrahi-backend.web.app/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">{t("footer.termsOfService")}</a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} />
      <ConfirmLogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={logout} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </div>
  );
}
