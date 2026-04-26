import EventsSection from "./EventsSection";
import BookRideSection from "./BookRideSection";
import { useEffect, useState } from "react";
import Silk from "./Silk";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroDone(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

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
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0";

  const btnSecondary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-white/40 text-white whitespace-nowrap cursor-pointer transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0";

  return (
    <div className="relative w-screen min-h-screen bg-black text-white overflow-x-hidden">

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
            <p className="mt-4 text-sm text-slate-200/80">Reliable rides, professionally delivered</p>
          </div>
        </div>
      </div>

      {/* ✅ SINGLE GLOBAL SILK BACKGROUND — loaded once, fixed behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk speed={10} scale={1.3} color="#2552cd" noiseIntensity={1} rotation={0} />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className={`transition-all duration-900 ease-out ${introDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* 🔮 HERO */}
      <div id="home" className="relative min-h-screen w-screen overflow-hidden">

        {/* Navbar */}
        <nav className="fixed top-0 left-0 z-50 w-full px-6 md:px-14 py-5 flex items-center justify-between bg-black/10 backdrop-blur-md border-b border-white/10">
          <div
            onClick={() => scrollTo("home")}
            className="text-lg md:text-xl font-semibold tracking-wide cursor-pointer"
          >
            ParthRahi
          </div>

          <ul className="hidden md:flex gap-10 text-sm">
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

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 z-40"
          >
            <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-20 flex flex-col items-center justify-center gap-10 text-xl transition-transform duration-500 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="cursor-pointer hover:scale-110 transition"
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <section className="relative z-10 flex items-center min-h-screen px-6 md:px-16 pt-28 md:pt-0">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-center">

              <div className="text-white text-center md:text-left space-y-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                  PARTHRAHI MOBILITY
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                  Book Your Ride
                  <br /> with ParthRahi
                </h1>

                <p className="text-sm sm:text-base text-white/80 max-w-md mx-auto md:mx-0">
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
                  <a href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi" target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                    Download Our App
                  </a>
                </div>
              </div>

              <div className="flex justify-center pt-10 pb-16 md:pb-0 md:pt-0">
                <div className="relative w-[160px] h-[160px] sm:w-[210px] sm:h-[210px] md:w-[300px] md:h-[300px] transition-all duration-500 hover:scale-120">
                  <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl"></div>
                  <div className="absolute inset-0 rounded-full border border-white/20"></div>
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

    <EventsSection />


      {/* 🚗 BOOK A RIDE */}
      <BookRideSection />

      {/* Divider */}
      <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* 🟣 ABOUT */}
      <section id="about" className="relative py-28 px-6 md:px-16 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto">

          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-3">About Us</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">A Trusted Mobility Platform</h2>
            <p className="text-white/70 mt-6 max-w-xl mx-auto">
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
                className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-xl text-center transition hover:bg-white/10 hover:-translate-y-1"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-white/60">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Why We Built ParthRahi</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                ParthRahi was created to simplify everyday transportation by
                connecting passengers with trusted drivers through a technology-powered platform.
              </p>
              <p className="text-white/70 leading-relaxed">
                Founded by <strong>Aashish Kumar</strong>, the goal is to build
                a modern transportation ecosystem that benefits both riders and drivers.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:bg-white/10 transition">
                <h4 className="font-semibold text-white mb-2">Our Mission</h4>
                <p className="text-sm text-white/70">
                  Provide reliable, affordable transportation by connecting
                  riders with verified drivers quickly and safely.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:bg-white/10 transition">
                <h4 className="font-semibold text-white mb-2">Our Vision</h4>
                <p className="text-sm text-white/70">
                  Become a trusted mobility platform that transforms how people travel in cities.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="max-w-3xl mx-auto rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-6 md:p-8">
              <p className="text-white/60 text-xs uppercase tracking-[0.25em] text-center mb-2">Customer Support</p>
              <h3 className="text-xl md:text-2xl font-semibold text-white text-center mb-6">Talk To Our Team</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Primary Support", number: "8252224027" },
                  { label: "Alternate Support", number: "9296218764" },
                ].map((contact) => (
                  <div
                    key={contact.number}
                    className="rounded-xl border border-white/10 bg-black/25 p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-white/45">{contact.label}</p>
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

              <p className="text-center text-white/80 text-sm md:text-base mt-6">
                Email: <span className="font-semibold text-white">parthrahiofficial@gmail.com</span>
              </p>
            </div>
          </div>


        </div>
      </section>


      {/* 👤 FOUNDER */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden border-t border-white/10">

        <div className="relative z-10 max-w-7xl mx-auto">

          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3">Founder</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Meet the Founder</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-5xl mx-auto">

            <div className="flex justify-center md:justify-end">
              <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] transition-all duration-500 hover:scale-105">
                <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl"></div>
                <div className="absolute inset-0 rounded-full border border-white/20"></div>
                <img
                  src="/founder.png"
                  alt="Founder - Aashish Kumar"
                  className="relative z-10 w-full h-full object-cover rounded-full border border-sky-400/60 shadow-[0_0_50px_rgba(80,160,255,0.35)]"
                />
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-semibold text-white">Aashish Kumar</h3>
              <p className="text-sm text-white/60 uppercase tracking-[0.2em]">Founder, ParthRahi</p>
              <p className="text-white/70 leading-relaxed">
                ParthRahi was built with a simple vision — to make everyday
                transportation reliable, affordable and accessible for everyone.
                Our goal is to connect passengers with trusted drivers while
                creating new opportunities for local communities.
              </p>
              <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-xl">
                <p className="text-white/80 italic">
                  "Transportation should be simple, transparent and safe for
                  everyone. ParthRahi is built to bring that change."
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20">LLP Registered</span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20">Startup India</span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20">Verified Drivers</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ⭐ FEATURES */}
      <section id="features" className="relative min-h-[80vh] py-24 px-6 md:px-16 flex items-center overflow-hidden border-t border-white/10">

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
            Why Choose ParthRahi
          </h2>
          <p className="text-center text-white/70 max-w-2xl mx-auto mb-16">
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
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-xl"
              >
                <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
                <p className="text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER / CONTACT */}
      <footer id="contact" className="relative overflow-hidden border-t border-white/10">

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-20 grid gap-12 md:grid-cols-4">

          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-wide text-white">ParthRahi</h3>
            <p className="text-sm text-white/70">
              Technology-driven ride booking platform providing Car, Bike and Auto rides.
            </p>
            <p className="text-sm text-white/60">
              Support: <br />
                        <a href="tel:8252224027" className="hover:text-white cursor-pointer hover:underline transition">8252224027</a> <br />
                        <a href="tel:9296218764" className="hover:text-white cursor-pointer hover:underline transition">9296218764</a>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase text-white/80">Company</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                { label: "About",    id: "about"    },
                { label: "Features", id: "features" },
                { label: "Book",     id: "book"     },
                { label: "Contact",  id: "contact"  },
              ].map((item) => (
                <li
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="hover:text-white hover:translate-x-1 transition cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase text-white/80">Riders</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li onClick={() => scrollTo("book")}     className="hover:text-white hover:translate-x-1 transition cursor-pointer">Book a Ride</li>
              <li onClick={() => scrollTo("book")}     className="hover:text-white hover:translate-x-1 transition cursor-pointer">Become a Driver</li>
              <li onClick={() => scrollTo("features")} className="hover:text-white hover:translate-x-1 transition cursor-pointer">Safety Guidelines</li>
              <li onClick={() => scrollTo("contact")}  className="hover:text-white hover:translate-x-1 transition cursor-pointer">Help & Support</li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-sm font-semibold uppercase text-white/80">Get Started</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollTo("book")} className={btnPrimary}>
                Book Ride
              </button>
              <a href="https://play.google.com/store/apps/details?id=com.parthrahi.parthrahi" target="_blank" rel="noopener noreferrer" className={btnSecondary}>Download App</a>
            </div>

          <div className="flex gap-5 pt-2">
            {[
              { name: "Instagram", icon: "📷", url: "https://www.instagram.com/parthrahiofficial/" },
              { name: "YouTube", icon: "▶", url: "https://youtube.com/in/yourusername" },
              { name: "Facebook", icon: "f", url: "https://facebook.com/in/yourusername" }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/60 hover:text-white hover:scale-110 cursor-pointer transition inline-flex items-center gap-1"
              >
                <span aria-hidden="true">{social.icon}</span>
                {social.name}
              </a>
            ))}
          </div>

          </div>

        </div>

        <div className="relative z-10 border-t border-white/10 py-6 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Parthrahi Smartcab Solutions LLP.</p>
          <div className="flex gap-6">
            <span  onClick={() => window.open("https://parthrahi-backend.web.app/privacy", "_blank")} className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span onClick={() => window.open("https://parthrahi-backend.web.app/privacy", "_blank")} className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>

      </footer>

      </div>

    </div>
  );
}

export default App;