import { useState, useEffect } from "react";
import Prism from "./Prism";
import Silk from "./Silk";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const btnPrimary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0";

  const btnSecondary =
    "inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-white/40 text-white whitespace-nowrap cursor-pointer transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0";

  return (
    <div className="relative w-screen min-h-screen bg-black text-white overflow-x-hidden">

{/* 🔮 HERO */}
<div className="relative min-h-screen w-screen overflow-hidden">

  {/* Background */}
  <div className="absolute inset-0 pointer-events-none">
    {isMobile ? (
      <Silk speed={10} scale={1.3} color="#132B6B" noiseIntensity={1} rotation={0} />
    ) : (
      <Prism
        animationType="rotate"
        timeScale={0.7}
        height={3.5}
        baseWidth={5.5}
        scale={3.6}
        noise={0}
        glow={1.2}
        suspendWhenOffscreen={true}
      />
    )}
  </div>

  <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

  {/* Navbar */}
  <nav className="absolute top-0 left-0 z-30 w-full px-6 md:px-14 py-5 flex items-center justify-between bg-black/10 backdrop-blur-md border-b border-white/10">
    <div className="text-lg md:text-xl font-semibold tracking-wide">
      ParthRahi
    </div>

    <ul className="hidden md:flex gap-10 text-sm">
      {["Home","About","Features","Contact"].map((item)=>(
        <li
          key={item}
          className="relative cursor-pointer opacity-80 hover:opacity-100 transition after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
        >
          {item}
        </li>
      ))}
    </ul>

    <button
      onClick={()=>setMenuOpen(!menuOpen)}
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
    {["Home","About","Features","Contact"].map((item)=>(
      <div key={item} onClick={()=>setMenuOpen(false)} className="cursor-pointer hover:scale-110 transition">
        {item}
      </div>
    ))}
  </div>

  {/* Hero Content */}
  <section className="relative z-10 flex items-center min-h-screen px-6 md:px-16 pt-28 md:pt-0">

    <div className="max-w-7xl mx-auto w-full">

      <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-center">

        {/* Text */}
        <div className="text-white text-center md:text-left space-y-5">

          <p className="text-xs uppercase tracking-[0.25em] text-white/60">
            PARTHRAHI MOBILITY
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            Book Your Ride
            <br/> with ParthRahi
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-md mx-auto md:mx-0">
            Fast, affordable, and reliable rides for your everyday travel.
            Book Car, Bike, or Auto rides in seconds and reach your destination safely.
          </p>

          <p className="text-green-400 text-sm">
            Special Offer: Get up to 20% OFF on your rides
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center md:justify-start">

            <button
              onClick={()=>window.open("https://trend-ride.onrender.com/","_blank")}
              className={btnPrimary}
            >
              Book a Ride
            </button>

            <button
              onClick={()=>window.open("https://parthrahi.com/driver","_blank")}
              className={btnSecondary}
            >
              Become a Driver
            </button>

          </div>

        </div>

        {/* Logo */}
        <div className="flex justify-center pt-10 pb-16 md:pb-0 md:pt-0">

          <div className="relative w-[160px] h-[160px] sm:w-[210px] sm:h-[210px] md:w-[280px] md:h-[280px] transition-all duration-500 hover:scale-110">

            <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(80,160,255,0.35),transparent_65%)] blur-2xl"></div>

            <div className="absolute inset-0 rounded-full border border-white/20"></div>

            <img
              src="/logo.svg"
              alt="ParthRahi Logo"
              className="relative z-10 w-full h-full object-cover rounded-full border border-sky-400/60 shadow-[0_0_40px_rgba(80,160,255,0.35)] transition-all duration-500 hover:shadow-[0_0_70px_rgba(80,160,255,0.8)]"
            />

          </div>

        </div>

      </div>

    </div>

  </section>

</div>

{/* Divider */}
<div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>


{/* WHY PARTHRAHI */}
<section className="relative min-h-[80vh] py-24 px-6 md:px-16 flex items-center overflow-hidden border-t border-white/10">

  <div className="absolute inset-0 pointer-events-none">
    <Silk speed={10} scale={1.3} color="#132B6B" noiseIntensity={1} rotation={0}/>
  </div>

  <div className="absolute inset-0 bg-black/70 pointer-events-none" />

  <div className="relative z-10 max-w-6xl mx-auto w-full">

    <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
      Why Choose ParthRahi
    </h2>

    <p className="text-center text-white/70 max-w-2xl mx-auto mb-16">
      A technology-driven mobility platform designed to make everyday travel simple, affordable, and reliable for riders and drivers.
    </p>

    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">

      {[
        ["Affordable Pricing","Transparent and fair pricing for every ride."],
        ["Verified Drivers","All drivers go through identity verification."],
        ["Quick Booking","Book rides in seconds through a simple platform."],
        ["Reliable Service","Safe and dependable transportation."]
      ].map(([title,desc])=>(
        <div key={title} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-xl">
          <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
          <p className="text-sm text-white/70">{desc}</p>
        </div>
      ))}

    </div>

  </div>
</section>

{/* Divider */}
<div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>


{/* FOOTER */}
<footer className="relative overflow-hidden border-t border-white/10">

  <div className="absolute inset-0 pointer-events-none">
    <Silk speed={10} scale={1.3} color="#132B6B" noiseIntensity={1} rotation={0}/>
  </div>

  <div className="absolute inset-0 bg-black/80 pointer-events-none"></div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-20 grid gap-12 md:grid-cols-4">

    <div className="space-y-4">
      <h3 className="text-xl font-semibold tracking-wide text-white">ParthRahi</h3>
      <p className="text-sm text-white/70">
        Technology-driven ride booking platform providing Car, Bike and Auto rides.
      </p>
      <p className="text-sm text-white/60">
        Support: 8252224027 <br/> 9296218764
      </p>
    </div>

    <div>
      <h4 className="text-sm font-semibold mb-4 uppercase text-white/80">Company</h4>
      <ul className="space-y-3 text-sm text-white/70">
        {["About","Services","Safety","Contact"].map(item=>(
          <li key={item} className="hover:text-white hover:translate-x-1 transition cursor-pointer">
            {item}
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="text-sm font-semibold mb-4 uppercase text-white/80">Riders</h4>
      <ul className="space-y-3 text-sm text-white/70">
        <li className="hover:text-white hover:translate-x-1 transition cursor-pointer">Book a Ride</li>
        <li className="hover:text-white hover:translate-x-1 transition cursor-pointer">Become a Driver</li>
        <li className="hover:text-white hover:translate-x-1 transition cursor-pointer">Safety Guidelines</li>
        <li className="hover:text-white hover:translate-x-1 transition cursor-pointer">Help & Support</li>
      </ul>
    </div>

    <div className="space-y-5">
      <h4 className="text-sm font-semibold uppercase text-white/80">Get Started</h4>

      <div className="flex flex-col sm:flex-row gap-4">

        <button
          onClick={()=>window.open("https://trend-ride.onrender.com/","_blank")}
          className={btnPrimary}
        >
          Book Ride
        </button>

        <button className={btnSecondary}>
          Download App
        </button>

      </div>

      <div className="flex gap-5 pt-2">
        {["X","Instagram","LinkedIn"].map((social)=>(
          <span key={social} className="text-xs text-white/60 hover:text-white hover:scale-110 cursor-pointer transition">
            {social}
          </span>
        ))}
      </div>
    </div>

  </div>

  <div className="relative z-10 border-t border-white/10 py-6 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
    <p>© {new Date().getFullYear()} Parthrahi Smartcab Solutions LLP.</p>
    <div className="flex gap-6">
      <span className="hover:text-white cursor-pointer">Privacy Policy</span>
      <span className="hover:text-white cursor-pointer">Terms of Service</span>
    </div>
  </div>

</footer>

    </div>
  );
}

export default App;