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

      {/* 🟣 BOOK A RIDE NOW */}
      <section className="relative h-[80vh] w-screen flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <Silk
            speed={8}
            scale={1.1}
            color="#7B7481"
            noiseIntensity={1.2}
            rotation={0}
          />
        </div>

        <div className="absolute inset-0 bg-black/65 pointer-events-none" />

        <div className="relative z-20 text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Book a Ride Now
          </h2>

          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-10">
            Get safe, affordable, and reliable rides anywhere in Bihar.
            Start your journey today.
          </p>

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
        </div>
      </section>

      {/* 🧾 FOOTER */}


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
