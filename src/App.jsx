import { useState } from "react";
import Prism from "./Prism";
import Silk from "./Silk";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔘 Unified button system (content-sized, pill)
  const btnPrimary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 " +
    "rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer " +
    "transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0";

  const btnSecondary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 " +
    "rounded-full border border-white/40 text-white whitespace-nowrap cursor-pointer " +
    "transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0";

  return (
    <div className="relative w-screen min-h-screen bg-black text-white overflow-x-hidden">

      {/* 🔮 HERO */}
      <div className="relative h-screen w-screen overflow-hidden">

        {/* Prism background */}
        <div className="absolute inset-0 pointer-events-none">
          <Prism
            animationType="rotate"
            timeScale={0.35}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            noise={0}
            glow={1}
            suspendWhenOffscreen={true}
          />
        </div>

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />

        {/* 🧭 NAVBAR */}
        <nav className="absolute top-0 left-0 z-30 w-full px-5 md:px-14 py-5 flex items-center justify-between animate-[fadeDown_0.8s_ease-out]">
          <div className="text-lg md:text-xl font-semibold tracking-wide">
            ParthRahi
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-10 text-sm">
            {["Home", "About", "Features", "Contact"].map(item => (
              <li
                key={item}
                className="relative cursor-pointer opacity-80 hover:opacity-100 transition
                           after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0
                           after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 z-40 cursor-pointer"
          >
            <span className={`w-6 h-0.5 bg-white transition ${menuOpen && "rotate-45 translate-y-2"}`} />
            <span className={`w-6 h-0.5 bg-white transition ${menuOpen && "opacity-0"}`} />
            <span className={`w-6 h-0.5 bg-white transition ${menuOpen && "-rotate-45 -translate-y-2"}`} />
          </button>
        </nav>

        {/* 📱 MOBILE MENU */}
        <div
          className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-20
                      flex flex-col items-center justify-center gap-8 text-lg
                      transition-transform duration-500
                      ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {["Home", "About", "Features", "Contact"].map(item => (
            <div
              key={item}
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer hover:scale-110 transition"
            >
              {item}
            </div>
          ))}
        </div>

        {/* 🌟 HERO CONTENT */}
        <section className="absolute inset-0 z-10 flex items-center justify-center px-5">
          <div className="max-w-3xl text-center">

            <p className="text-xs md:text-sm uppercase tracking-wider text-white/70 mb-3">
              Ride-Hailing Platform for Bihar
            </p>

            <h1 className="text-xl sm:text-4xl md:text-7xl font-semibold leading-tight mb-4">
              Reliable rides, built for Bihar.
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-5">
              बिहार के लिए बनाया गया, भरोसेमंद सफ़र
            </p>

            <p className="text-sm sm:text-base md:text-lg text-white/85 mb-8 max-w-2xl mx-auto">
              ParthRahi connects passengers with trusted local drivers to deliver
              safe, affordable, and transparent rides across Bihar.
            </p>

            {/* CTA */}
            <div className="flex sm:flex-row flex-col items-center gap-4 justify-center mb-8">
              <button
                onClick={() => window.open("https://trend-ride.onrender.com/", "_blank")}
                className={btnPrimary}
              >
                Book a Ride
              </button>

              <button
                onClick={() => window.open("https://parthrahi.com/driver", "_blank")}
                className={btnSecondary}
              >
                Become a Driver
              </button>
            </div>


          </div>
        </section>
      </div>

      {/* 🚀 WHY PARTHRAHI */}
      <section className="min-h-[80vh] py-24 px-6 md:px-16 bg-neutral-950 flex items-center">
        <div className="max-w-6xl mx-auto w-full">

          <h2 className="text-2xl md:text-4xl font-bold text-center mb-6">
            Why ParthRahi?
          </h2>

          <p className="text-center text-white/70 max-w-2xl mx-auto mb-16">
            Designed specifically for Bihar’s cities and towns — focused on
            safety, affordability, and empowering local drivers.
          </p>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {[
              ["Local Drivers", "Drivers from your own city who know the routes"],
              ["Fair Pricing", "No surge shocks or hidden charges"],
              ["Safety First", "Verified drivers and live ride tracking"],
              ["Regional Focus", "Built for Bihar’s transport needs"],
              ["Driver Empowerment", "Better earnings for local drivers"],
              ["Always Available", "Reliable rides, day and night"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-xl p-8 hover:-translate-y-1 transition"
              >
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-sm text-white/75">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🟣 ABOUT US */}
      <section className="relative min-h-[80vh] w-screen flex items-center overflow-hidden">

        {/* Silk background (unchanged) */}
        <div className="absolute inset-0 pointer-events-none">
          <Silk
            speed={8}
            scale={1.1}
            color="#7B7481"
            noiseIntensity={1.2}
            rotation={0}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/65 pointer-events-none" />

        {/* Content */}
        <div
          className="
            relative z-20 max-w-7xl mx-auto
            px-6 sm:px-8 md:px-16
            py-16 md:py-0
            grid gap-14 md:grid-cols-2 items-center
          "
        >

          {/* LEFT — TEXT */}
          <div className="space-y-6 animate-[fadeUp_0.8s_ease-out]">
            <p className="text-xs uppercase tracking-widest text-white/60">
              About ParthRahi
            </p>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Built for Bihar,
              <span className="block text-white/80">
                Powered by Local Trust
              </span>
            </h2>

            <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
              ParthRahi is a Bihar-first ride-hailing platform built to solve
              real local mobility problems — with fair pricing, trusted drivers,
              and transparent rides.
            </p>

            <p className="text-sm text-white/65 max-w-xl">
              Our mission is simple: empower local drivers and give passengers
              a service they can truly rely on.
            </p>

          </div>

        {/* RIGHT — LOGO / IMAGE */}
          <div className="flex justify-center md:justify-end animate-[fadeIn_1s_ease-out]">
            <div
              className="
                relative
                w-[180px] h-[180px]
                sm:w-[200px] sm:h-[200px]
                md:w-[250px] md:h-[250px]
              "
            >
              {/* 🔆 BACK SOFT BLUE */}
              <div
                className="
                  absolute -inset-5 rounded-full -z-10
                  bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_60%)]
                  blur-xl
                "
              />

              {/* 🔵 LOGO WITH REAL BLUE GLOW */}
              <img
                src="/logo.png"
                alt="ParthRahi Logo"
                className="
                  w-full h-full object-cover rounded-full
                  border border-sky-400/60
                  shadow-[0_0_0_3px_rgba(80,160,255,0.25),0_0_45px_rgba(80,160,255,0.45),0_25px_70px_rgba(0,0,0,0.7)]
                  hover:scale-[1.04]
                  transition-all duration-300
                  relative z-10
                "
              />
            </div>
          </div>


        </div>
      </section>


      {/* 🧾 FOOTER */}
      <footer className="relative bg-neutral-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-wide">
              ParthRahi
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Reliable, affordable ride-hailing built specifically for Bihar.
              Empowering local drivers, serving local communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white/80">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              {["About", "Features", "Contact", "Careers"].map(item => (
                <li
                  key={item}
                  className="hover:text-white transition cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white/80">
              For You
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="hover:text-white transition cursor-pointer">
                Book a Ride
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Become a Driver
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Safety Guidelines
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Help & Support
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-5">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Get Started
            </h4>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => window.open("https://trend-ride.onrender.com/", "_blank")}
                    className={btnPrimary}
                  >
                    Book Ride
                  </button>

                  <button className={btnSecondary}>
                    Download App
                  </button>
                </div>

            {/* Socials */}
            <div className="flex gap-4 pt-2">
              {["X", "Instagram", "LinkedIn"].map(social => (
                <span
                  key={social}
                  className="text-xs text-white/60 hover:text-white cursor-pointer transition"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} ParthRahi. Built for Bihar.
          </p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition">
              Privacy Policy
            </span>
            <span className="hover:text-white cursor-pointer transition">
              Terms of Service
            </span>
          </div>
        </div>
      </footer>


      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

export default App;
