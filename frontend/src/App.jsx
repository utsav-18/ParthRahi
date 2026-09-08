import EventsSection from "./EventsSection";
import BookRideSection from "./BookRideSection";
import { useEffect, useState } from "react";
import Silk from "./Silk";
import { useAuth } from "./AuthContext";
import LoginModal from "./LoginModal";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroDone(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { label: "Home",     id: "home"     },
    { label: "Events",     id: "events"     },
    { label: "Book Ride",     id: "book"     },
    { label: "About",    id: "about"    },
    { label: "Features", id: "features" },
    { label: "Contact",  id: "contact"  },
  ];

  const btnPrimary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer border border-white/70 shadow-lg shadow-white/10 transition-all duration-300 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-xl shadow-white/20 active:translate-y-0";

  const btnSecondary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-slate-500 text-white whitespace-nowrap cursor-pointer bg-slate-900/40 shadow-md shadow-blue-900/30 transition-all duration-300 hover:bg-slate-700/60 hover:border-white/55 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/20 active:translate-y-0";

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">

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

      {/* ✅ SINGLE GLOBAL SILK BACKGROUND — loaded once, fixed behind everything */}
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

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 w-full px-6 md:px-14 py-5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div
          onClick={() => scrollTo("home")}
          className="text-lg md:text-xl font-semibold tracking-wide cursor-pointer"
        >
          ParthRahi
        </div>

        <ul className="hidden md:flex gap-10 text-base">
          {navItems.map((item) => (
            <li
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="relative cursor-pointer opacity-80 hover:opacity-100 transition after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center gap-4">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "Profile"}
                    className="w-9 h-9 rounded-full border border-cyan-400/40 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 text-white font-semibold text-sm flex items-center justify-center shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-white max-w-[140px] truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={() => setIsLogoutOpen(true)}
                  className="cursor-pointer ml-1 text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-lg px-2.5 py-1.5 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className={btnSecondary}
              >
                Login / SignUp
              </button>
            )
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="md:hidden flex flex-col gap-1.5 z-[70]"
        >
          <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

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
        className={`fixed top-0 right-0 bottom-0 w-[75vw] max-w-[320px] bg-slate-900/95 border-l border-slate-700/50 shadow-2xl z-[45] flex flex-col pt-[84px] px-6 md:hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-2">
          {navItems.map((item, i) => (
            <li 
              key={item.id} 
              style={{ transitionDelay: menuOpen ? `${100 + i * 50}ms` : '0ms' }} 
              className={`transition-all duration-400 ease-out will-change-transform ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
            >
              <button
                onClick={() => scrollTo(item.id)}
                className="w-full text-left py-4 text-[17px] font-medium text-white border-b border-white/5 hover:text-cyan-300 hover:border-slate-600 active:scale-[0.98] transition-all"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile Auth */}
        <div className="mt-8 border-t border-white/10 pt-6">
          {!loading && (
            user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full border border-cyan-400/40 object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 text-white font-semibold text-sm flex items-center justify-center shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.name || user.email?.split('@')[0]}</span>
                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
                <button onClick={() => { setIsLogoutOpen(true); setMenuOpen(false); }} className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider">Logout</button>
              </div>
            ) : (
              <button 
                onClick={() => { setMenuOpen(false); setIsLoginOpen(true); }}
                className=" cursor-pointer w-full py-3 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                Login / SignUp
              </button>
            )
          )}
        </div>

        {/* Premium Bottom Action */}
        <div className="mt-auto mb-10 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 text-center">Ready to travel?</p>
          <button 
            onClick={() => scrollTo("book")} 
            className="w-full py-3.5 rounded-xl bg-cyan-300 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-300/20 active:scale-[0.98] transition-all"
          >
            Book a Ride
          </button>
        </div>
      </div>

      {/* 🔮 HERO */}
        <div
          id="home"
          className="relative min-h-screen w-full overflow-hidden pt-[46px] md:pt-[54px]"
        >

        {/* Hero Content */}
        <section className="relative z-10 flex items-center min-h-screen px-6 md:px-16 pt-28 md:pt-0">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-center">

              <div className="text-white text-center md:text-left space-y-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                  PARTHRAHI MOBILITY
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight drop-shadow-[0_8px_24px_rgba(43,101,255,0.28)]">
                  Book Your Ride
                  <br /> with ParthRahi
                </h1>

                <p className="text-sm sm:text-base text-slate-100 max-w-md mx-auto md:mx-0">
                  Fast, affordable, and reliable rides for your everyday travel.
                  Book Car, Bike, or Auto rides in seconds and reach your destination safely.
                </p>

                <p className="text-green-400 text-sm">
                  Special Offer: Get up to 20% OFF on your rides
                </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center md:justify-start">
                      <button onClick={() => scrollTo("book")} className={btnPrimary}>
                        Book a Ride
                      </button>

                      <a
                        href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btnSecondary}
                      >
                        Download Our App
                      </a>

                      <a
                        href="https://play.google.com/store/apps/details?id=com.parthrahi.parth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btnSecondary}
                      >
                        Become a Driver 
                      </a>
                    </div>
              </div>

              <div className="flex justify-center pt-10 pb-16 md:pb-0 md:pt-0">
                <div className="relative w-[160px] h-[160px] sm:w-[210px] sm:h-[210px] md:w-[300px] md:h-[300px] transition-all duration-500 hover:scale-120">
                  <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl"></div>
                  <div className="absolute inset-0 rounded-full border border-slate-600"></div>
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

      {/* Divider */}
      <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>





    {/* <EventsSection /> */}






      {/* 🚗 BOOK A RIDE */}
      <BookRideSection />

      {/* Divider */}
      <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* 🟣 ABOUT */}
      <section id="about" className="relative py-28 px-6 md:px-16 overflow-hidden">
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[70%] h-44 bg-[radial-gradient(circle_at_center,rgba(55,115,255,0.22),transparent_70%)] blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto rounded-[2rem] border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-blue-500/10">

          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-3">About Us</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">A Trusted Mobility Platform</h2>
            <p className="text-slate-200 mt-6 max-w-xl mx-auto">
              ParthRahi connects riders with verified local drivers to deliver
              safe, affordable and reliable rides for everyday travel.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {[
              ["🏢", "LLP Registered", "Operated by Parthrahi Smartcab Solutions LLP"],
              ["🇮🇳", "Startup India", "DPIIT Recognized Startup"],
              ["🛡", "Driver Verification", "Powered by Surepass APIs"],
              ["🚘", "Ride Options", "Car • Bike • Auto"],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl text-center transition-all duration-300 hover:bg-slate-700/60 hover:-translate-y-1 hover:shadow-xl shadow-blue-500/20"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-slate-300">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Why We Built ParthRahi</h3>
              <p className="text-slate-200 mb-6 leading-relaxed">
                ParthRahi was created to simplify everyday transportation by
                connecting passengers with trusted drivers through a technology-powered platform.
              </p>
              <p className="text-slate-200 leading-relaxed">
                Founded by <strong>Aashish Kumar</strong>, the goal is to build
                a modern transportation ecosystem that benefits both riders and drivers.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-lg shadow-blue-500/15 transition-all duration-300">
                <h4 className="font-semibold text-white mb-2">Our Mission</h4>
                <p className="text-sm text-slate-200">
                  Provide reliable, affordable transportation by connecting
                  riders with verified drivers quickly and safely.
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-lg shadow-blue-500/15 transition-all duration-300">
                <h4 className="font-semibold text-white mb-2">Our Vision</h4>
                <p className="text-sm text-slate-200">
                  Become a trusted mobility platform that transforms how people travel in cities.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="max-w-3xl mx-auto rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 md:p-8 shadow-xl shadow-blue-500/20">
              <p className="text-slate-300 text-xs uppercase tracking-[0.25em] text-center mb-2">Customer Support</p>
              <h3 className="text-xl md:text-2xl font-semibold text-white text-center mb-6">Talk To Our Team</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Primary Support", number: "8252224027" },
                  { label: "Alternate Support", number: "9296218764" },
                ].map((contact) => (
                  <div
                    key={contact.number}
                    className="rounded-xl border border-slate-700/50 bg-black/25 p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-slate-400">{contact.label}</p>
                      <p className="text-lg font-semibold text-white">{contact.number}</p>
                    </div>
                    <button
                      onClick={() => (window.location.href = `tel:${contact.number}`)}
                      className="shrink-0 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold cursor-pointer border border-white/60 shadow-[0_4px_16px_rgba(255,255,255,0.12)] hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all duration-200"
                    >
                      Call Now
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-center text-slate-100 text-sm md:text-base mt-6">
                Email: <span className="font-semibold text-white">parthrahiofficial@gmail.com</span>
              </p>
            </div>
          </div>


        </div>
      </section>


      {/* 👤 FOUNDER */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden border-t border-slate-700/50">
        <div className="pointer-events-none absolute top-16 right-[8%] w-56 h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(67,124,255,0.28),transparent_72%)] blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto rounded-[2rem] border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-blue-500/10">

          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300 mb-3">Founder</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Meet the Founder</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-5xl mx-auto">

            <div className="flex justify-center md:justify-end">
              <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] transition-all duration-500 hover:scale-105">
                <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl"></div>
                <div className="absolute inset-0 rounded-full border border-slate-600"></div>
                <img
                  src="/founder.png"
                  alt="Founder - Aashish Kumar"
                  className="relative z-10 w-full h-full object-cover rounded-full border border-sky-400/60 shadow-[0_0_50px_rgba(80,160,255,0.35)]"
                />
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-semibold text-white">Aashish Kumar</h3>
              <p className="text-sm text-slate-300 uppercase tracking-[0.2em]">Founder, ParthRahi</p>
              <p className="text-slate-200 leading-relaxed">
                ParthRahi was built with a simple vision — to make everyday
                transportation reliable, affordable and accessible for everyone.
                Our goal is to connect passengers with trusted drivers while
                creating new opportunities for local communities.
              </p>
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-blue-500/15">
                <p className="text-slate-100 italic">
                  "Transportation should be simple, transparent and safe for
                  everyone. ParthRahi is built to bring that change."
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600">LLP Registered</span>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600">Startup India</span>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600">Verified Drivers</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ⭐ FEATURES */}
      <section id="features" className="relative min-h-[80vh] py-24 px-6 md:px-16 flex items-center overflow-hidden border-t border-slate-700/50">
        <div className="pointer-events-none absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(67,124,255,0.22),transparent_72%)] blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto w-full rounded-[2rem] border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-6 py-12 md:px-10 md:py-14 shadow-2xl shadow-blue-500/10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
            Why Choose ParthRahi
          </h2>
          <p className="text-center text-slate-200 max-w-2xl mx-auto mb-16">
            A technology-driven mobility platform designed to make everyday travel simple, affordable, and reliable.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["Affordable Pricing", "Transparent and fair pricing for every ride."],
              ["Verified Drivers", "All drivers go through identity verification."],
              ["Quick Booking", "Book rides in seconds through a simple platform."],
              ["Reliable Service", "Safe and dependable transportation."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-xl shadow-blue-500/20"
              >
                <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
                <p className="text-sm text-slate-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* FOOTER / CONTACT */}
<footer
  id="contact"
  className="relative overflow-x-hidden border-t border-slate-700/50"
>
  <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 w-[72%] h-48 bg-[radial-gradient(circle_at_center,rgba(62,120,255,0.2),transparent_72%)] blur-3xl" />
  {/* Main Footer */}
  <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-20 rounded-t-[2rem] border-x border-t border-slate-700/50 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.6),rgba(15,23,42,0.9))] backdrop-blur-sm shadow-[0_-22px_70px_rgba(25,60,160,0.16)]">

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.15fr_0.85fr_0.85fr_1.15fr] gap-12 xl:gap-10">

      {/* BRAND */}
      <div className="min-w-0 space-y-5">
        <h3 className="text-xl font-semibold tracking-wide text-white">
          ParthRahi
        </h3>

        <p className="text-sm leading-6 text-slate-300 max-w-xs">
          Technology-driven ride booking platform providing Car, Bike and
          Auto rides and E-rickshaw.
        </p>

        <div className="pt-1">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Support
          </p>

          <div className="space-y-1">
            <a
              href="tel:8252224027"
              className="block text-sm text-slate-300 hover:text-white hover:underline transition"
            >
              8252224027
            </a>

            <a
              href="tel:9296218764"
              className="block text-sm text-slate-300 hover:text-white hover:underline transition"
            >
              9296218764
            </a>
          </div>
        </div>
      </div>

      {/* COMPANY */}
      <div className="min-w-0">
        <h4 className="text-xs font-semibold mb-6 uppercase tracking-wider text-slate-400">
          Company
        </h4>

        <ul className="space-y-4 text-sm text-slate-300">
          {[
            { label: "About", id: "about" },
            { label: "Features", id: "features" },
            { label: "Book", id: "book" },
            { label: "Contact", id: "contact" },
          ].map((item) => (
            <li
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* RIDERS */}
      <div className="min-w-0">
        <h4 className="text-xs font-semibold mb-6 uppercase tracking-wider text-slate-400">
          Riders
        </h4>

        <ul className="space-y-4 text-sm text-slate-300">
          <li
            onClick={() => scrollTo("book")}
            className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer"
          >
            Book a Ride
          </li>

          <li
            onClick={() =>
              window.open(
                "https://play.google.com/store/apps/details?id=com.parthrahi.parth",
                "_blank"
              )
            }
            className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer"
          >
            Drive with Us
          </li>

          <li
            onClick={() => scrollTo("features")}
            className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer"
          >
            Safety Guidelines
          </li>

          <li
            onClick={() => scrollTo("contact")}
            className="w-fit hover:text-white hover:translate-x-1 transition-all cursor-pointer"
          >
            Help & Support
          </li>
        </ul>
      </div>

      {/* GET STARTED */}
      <div className="min-w-0">
        <h4 className="text-xs font-semibold mb-6 uppercase tracking-wider text-slate-400">
          Get Started
        </h4>

        <div className="flex flex-col gap-3 w-full max-w-xs">

          <button
            onClick={() => scrollTo("book")}
            className={`${btnPrimary} w-full`}
          >
            Book Ride
          </button>

          <a
            href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi"
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnSecondary} w-full text-center`}
          >
            Download App
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.parthrahi.parth"
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnSecondary} w-full text-center`}
          >
            Drive with Us
          </a>
        </div>

      </div>
    </div>

    {/* SOCIALS */}
    <div className="mt-12 pt-8 border-t border-slate-700/50">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 text-center mb-4">
        Follow Us
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {[
          {
            name: "Instagram",
            detail: "Official profile",
            logo: "/Insta-logo.png",
            url: "https://www.instagram.com/parthrahiofficial/",
          },
          {
            name: "YouTube",
            detail: "Latest videos",
            logo: "/youtube-logo.webp",
            url: "https://www.youtube.com/@parthrahimobility",
          },
          {
            name: "Facebook",
            detail: "Community updates",
            logo: "/facebook-logo.png",
            url: "https://www.facebook.com/profile.php?id=61579536731846",
          },
        ].map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3.5 flex items-center justify-between gap-3 transition-all duration-300 hover:bg-white/[0.08] hover:border-slate-500 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(31,74,190,0.24)]"
            aria-label={`Open ${social.name}`}
          >
            <span className="min-w-0 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110"
              >
                <img src={social.logo} alt={social.name} className="w-[120%] h-[120%] object-contain drop-shadow-md" />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-medium text-white group-hover:text-white">
                  {social.name}
                </span>
                <span className="block text-[11px] text-slate-400 truncate group-hover:text-slate-200">
                  {social.detail}
                </span>
              </span>
            </span>

            <span className="text-[11px] text-slate-400 group-hover:text-slate-100 transition">Open</span>
          </a>
        ))}
      </div>
    </div>
  </div>

  {/* BOTTOM BAR */}
  <div className="relative z-10 border-t border-slate-700/50">
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">

      <p className="text-center sm:text-left">
        © {new Date().getFullYear()} Parthrahi Smartcab Solutions LLP.
      </p>

      <div className="flex items-center gap-6">
        <span
          onClick={() =>
            window.open(
              "https://parthrahi-backend.web.app/privacy",
              "_blank"
            )
          }
          className="hover:text-white cursor-pointer transition"
        >
          Privacy Policy
        </span>

        <span
          onClick={() =>
            window.open(
              "https://parthrahi-backend.web.app/privacy",
              "_blank"
            )
          }
          className="hover:text-white cursor-pointer transition"
        >
          Terms of Service
        </span>
      </div>
    </div>
  </div>
</footer>

      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ConfirmLogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={logout} />
    </div>
  );
}

export default App;