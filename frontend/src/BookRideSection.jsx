/* global google */

import { useState, useEffect, useRef } from "react";
import Silk from "./Silk";

const RATES = {
  auto:      { baseFare: 40, costPerKm: 10, minimumFare: 80 },
  bike:      { baseFare: 30, costPerKm: 7,  minimumFare: 50 },
  cab:       { baseFare: 60, costPerKm: 15, minimumFare: 120 },
  erickshaw: { baseFare: 35, costPerKm: 8,  minimumFare: 55 },
};

const calculateFare = (type, km) => {
  const { baseFare, costPerKm, minimumFare } = RATES[type];
  const raw = baseFare + km * costPerKm;
  return Math.round(Math.max(raw, minimumFare));
};

// Each vehicle gets its own accent so the options are distinguishable at a glance,
// not just by the selection outline.
const RIDE_OPTIONS = [
  {
    value: "auto",
    label: "Auto",
    desc: "3-seater comfort",
    accent: { ring: "border-amber-300/80", bg: "bg-amber-300/12", glow: "shadow-[0_0_22px_rgba(252,211,77,0.18)]", icon: "text-amber-200", iconBox: "border-amber-200 bg-amber-300/15" },
  },
  {
    value: "bike",
    label: "Bike",
    desc: "Fastest in traffic",
    accent: { ring: "border-sky-300/80", bg: "bg-sky-300/12", glow: "shadow-[0_0_22px_rgba(125,211,252,0.18)]", icon: "text-sky-200", iconBox: "border-sky-200 bg-sky-300/15" },
  },
  {
    value: "cab",
    label: "Cab",
    desc: "4-seater, AC ride",
    accent: { ring: "border-violet-300/80", bg: "bg-violet-300/12", glow: "shadow-[0_0_22px_rgba(196,181,253,0.18)]", icon: "text-violet-200", iconBox: "border-violet-200 bg-violet-300/15" },
  },
  {
    value: "erickshaw",
    label: "E-Rickshaw",
    desc: "Eco-friendly hop",
    accent: { ring: "border-emerald-300/80", bg: "bg-emerald-300/12", glow: "shadow-[0_0_22px_rgba(110,231,183,0.18)]", icon: "text-emerald-200", iconBox: "border-emerald-200 bg-emerald-300/15" },
  },
];

// Distinct, filled-style silhouettes so vehicles read clearly even at small sizes,
// instead of similar-looking outline glyphs.
function VehicleSymbol({ type, className = "w-6 h-6" }) {
  const logos = {
    auto: "/auto-logo.png",
    bike: "/bike-logo.png",
    cab: "/cab-logo.png",
    erickshaw: "/e-riksha-logo.png",
  };

  return (
    <img
      src={logos[type]}
      alt={type}
      className={`object-contain drop-shadow-md ${className}`}
      aria-hidden="true"
    />
  );
}

export default function BookRideSection() {
  const [rideType,    setRideType]    = useState("auto");
  const [source,      setSource]      = useState("");
  const [destination, setDestination] = useState("");
  const [userName,    setUserName]    = useState("");
  const [userPhone,   setUserPhone]   = useState("");
  const [distanceKm,  setDistanceKm]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [locLoading,  setLocLoading]  = useState(false);
  const [mapsReady,   setMapsReady]   = useState(false);
  const [errors,      setErrors]      = useState({});
  const [step,        setStep]        = useState(1);

  const mapRef         = useRef(null);
  const mapInstance    = useRef(null);
  const dirService     = useRef(null);
  const dirRenderer    = useRef(null);
  const sourceInputRef = useRef(null);
  const destInputRef   = useRef(null);

  useEffect(() => {
    const initMap = () => {
  if (!mapRef.current) return;
  mapInstance.current = new google.maps.Map(mapRef.current, {
    center: { lat: 25.0961, lng: 85.3131 },
    zoom: 6,
  });
  dirService.current  = new google.maps.DirectionsService();
  dirRenderer.current = new google.maps.DirectionsRenderer({
    map: mapInstance.current,
    polylineOptions: { strokeColor: "#1f45ac", strokeWeight: 4 },
  });
  if (sourceInputRef.current)
    new google.maps.places.Autocomplete(sourceInputRef.current, { componentRestrictions: { country: "in" } });
  if (destInputRef.current)
    new google.maps.places.Autocomplete(destInputRef.current, { componentRestrictions: { country: "in" } });
  setMapsReady(true);
};

    if (window.google?.maps?.Map) { initMap(); return; }

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) { console.error("Missing VITE_GOOGLE_MAPS_API_KEY in .env"); return; }

    if (document.getElementById("gmaps-script")) {
      const t = setInterval(() => { if (window.google?.maps?.Map) { clearInterval(t); initMap(); } }, 100);
      return () => clearInterval(t);
    }

    window.__bookRideMapInit = initMap;
    const script = document.createElement("script");
    script.id    = "gmaps-script";
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=__bookRideMapInit&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { delete window.__bookRideMapInit; };
  }, []);

  const fare = distanceKm ? calculateFare(rideType, distanceKm) : null;
  const activeRate = RATES[rideType];

  const calculateRoute = () => {
    const src = sourceInputRef.current?.value?.trim();
    const dst = destInputRef.current?.value?.trim();
    const errs = {};
    if (!src) errs.source      = "Enter pickup location";
    if (!dst) errs.destination = "Enter drop location";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    dirService.current.route(
      { origin: src, destination: dst, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        setLoading(false);
        if (status !== "OK") { setErrors({ route: "Could not find route. Try a nearby landmark." }); return; }
        dirRenderer.current.setDirections(result);
        const km = parseFloat((result.routes[0].legs[0].distance.value / 1000).toFixed(2));
        setDistanceKm(km);
        setSource(src); setDestination(dst); setStep(2);
      }
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        mapInstance.current?.setCenter({ lat, lng });
        mapInstance.current?.setZoom(15);
        new google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
          setLocLoading(false);
          const addr = (status === "OK" && results[0]) ? results[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          if (sourceInputRef.current) sourceInputRef.current.value = addr;
          setSource(addr);
        });
      },
      () => { setLocLoading(false); alert("Allow location access and try again."); }
    );
  };

  const bookRide = () => {
    const errs = {};
    if (!/^[A-Za-z ]{3,}$/.test(userName))  errs.userName  = "Enter valid name (letters only, min 3)";
    if (!/^[6-9]\d{9}$/.test(userPhone))     errs.userPhone = "Enter valid 10-digit mobile number";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const mapLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    const message =
`*ParthRahi – Booking Request*

Name: ${userName}
Phone: ${userPhone}

Pickup: *${source}*
Drop: *${destination}*

Ride Type: ${rideType.toUpperCase()}
Distance: *${distanceKm} km*
Fare: *₹${fare}*

Route:
${mapLink}`;
    window.open(`https://wa.me/918971654394?text=${encodeURIComponent(message)}`, "_blank");
  };

  const ensureFieldVisibility = (event) => {
    if (window.innerWidth >= 768) return;
    const field = event.target;
    window.setTimeout(() => {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const inputCls = (field) =>
    `w-full bg-slate-900/85 border ${errors[field] ? "border-red-300/80" : "border-slate-200/20"} rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-cyan-200 focus:ring-2 focus:ring-cyan-300/25 transition-all duration-200`;

  const stepLabel = step === 1 ? "Trip Setup" : "Rider Profile";

  return (
    <section id="book" className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-16 overflow-hidden border-t border-slate-100/20">

      <div className="relative z-10 text-center mb-10 sm:mb-14">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-slate-200 mb-3">ParthRahi Mobility</p>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white">Advance Booking</h2>
        <p className="text-slate-200 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm md:text-base px-2">
          Plan a route, compare vehicle options, and place your booking with transparent pricing and verified trip details.
        </p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 md:gap-8 items-start">

        <div className="bg-slate-900/95 md:bg-slate-900/85 border border-slate-100/20 backdrop-blur-none md:backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-2xl">

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-1.5 sm:gap-2 flex-1 last:flex-initial">
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${step >= s ? "bg-cyan-300 text-slate-950" : "bg-slate-100/20 text-slate-300"}`}>{s}</div>
                  {s < 2 && <div className={`h-px flex-1 sm:w-8 sm:flex-initial ${step > s ? "bg-cyan-200" : "bg-slate-100/25"}`} />}
                </div>
              ))}
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Step {step} of 2 · <span className="text-slate-50">{stepLabel}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-300 pointer-events-none">FROM</span>
                <input ref={sourceInputRef} placeholder="Enter pickup location" autoComplete="off" onFocus={ensureFieldVisibility} className={`${inputCls("source")} pl-16`} />
              </div>
              {errors.source && <p className="text-red-400 text-xs pl-1">{errors.source}</p>}
            </div>

            <button
              onClick={useCurrentLocation}
              disabled={!mapsReady || locLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-cyan-200/55 text-cyan-100 text-sm cursor-pointer hover:bg-cyan-300/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
            >
              {locLoading
                ? <><span className="w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />Detecting location…</>
                : "Use current GPS location"}
            </button>

            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-300 pointer-events-none">TO</span>
                <input ref={destInputRef} placeholder="Enter destination" autoComplete="off" onFocus={ensureFieldVisibility} className={`${inputCls("destination")} pl-16`} />
              </div>
              {errors.destination && <p className="text-red-400 text-xs pl-1">{errors.destination}</p>}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-slate-200 text-xs uppercase tracking-[0.18em]">Choose a vehicle</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {RIDE_OPTIONS.map(({ value, label, desc, accent }) => {
                const selected = rideType === value;
                const price = distanceKm ? calculateFare(value, distanceKm) : null;
                return (
                  <button
                    key={value}
                    onClick={() => setRideType(value)}
                    aria-pressed={selected}
                    className={`relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50
                      ${selected ? `${accent.ring} ${accent.bg} ${accent.glow}` : "border-slate-100/15 bg-slate-900/70 hover:border-slate-100/40"}`}
                  >
                    <span className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center overflow-hidden bg-white ${selected ? "border-[3px] " + accent.ring : "border-transparent"} transition-all duration-200`}>
                      <VehicleSymbol type={value} className="w-full h-full p-1" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[13px] sm:text-sm font-semibold truncate ${selected ? "text-white" : "text-slate-50"}`}>{label}</span>
                      <span className="block text-[10px] sm:text-[11px] text-slate-300 leading-tight truncate">{desc}</span>
                      <span className={`block text-[11px] sm:text-xs font-semibold mt-0.5 ${selected ? "text-cyan-100" : "text-slate-200"}`}>
                        {price ? `₹${price}` : `From ₹${RATES[value].baseFare}`}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 rounded-full bg-cyan-300 flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-3 h-3 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {errors.route && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{errors.route}</p>
          )}

          <button
            onClick={calculateRoute}
            disabled={!mapsReady || loading}
            className="w-full py-3.5 rounded-lg bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating…</>
              : "Calculate Route & Estimate"}
          </button>

          {!mapsReady && (
            <p className="text-center text-slate-300 text-xs">
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Loading Google Maps…" : "⚠ Add VITE_GOOGLE_MAPS_API_KEY to .env"}
            </p>
          )}

          {distanceKm && fare && (
            <div className="bg-linear-to-r from-cyan-300/20 to-slate-300/10 border border-cyan-100/35 rounded-lg px-4 sm:px-5 py-4 space-y-3">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 border-cyan-300/40 bg-white flex items-center justify-center overflow-hidden">
                    <VehicleSymbol type={rideType} className="w-full h-full p-1" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-200 text-[11px] sm:text-xs uppercase tracking-wide">Distance</p>
                    <p className="text-white font-semibold text-sm sm:text-base">{distanceKm} km</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-slate-200 text-[11px] sm:text-xs uppercase tracking-wide">Estimated fare</p>
                  <p className="text-xl sm:text-2xl font-bold text-cyan-100">₹{fare}</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 border-t border-cyan-100/20 pt-2.5">
                Base ₹{activeRate.baseFare} + ₹{activeRate.costPerKm}/km · Minimum fare ₹{activeRate.minimumFare}
              </p>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-4 pt-2 border-t border-slate-200/10">
              <p className="text-slate-200 text-xs uppercase tracking-[0.18em] pt-1">Rider Details</p>

              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-300 pointer-events-none">NAME</span>
                  <input value={userName} onChange={(e) => setUserName(e.target.value)} onFocus={ensureFieldVisibility} placeholder="Enter full name" autoComplete="off" className={`${inputCls("userName")} pl-16`} />
                </div>
                {errors.userName && <p className="text-red-400 text-xs pl-1">{errors.userName}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-300 pointer-events-none">PHONE</span>
                  <input
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onFocus={ensureFieldVisibility}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    autoComplete="off"
                    className={`${inputCls("userPhone")} pl-16`}
                  />
                </div>
                {errors.userPhone && <p className="text-red-400 text-xs pl-1">{errors.userPhone}</p>}
              </div>

              <button
                onClick={bookRide}
                className="w-full py-4 rounded-lg bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-xl shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
              >
                Confirm Booking on WhatsApp
              </button>

              <p className="text-center text-slate-300 text-[11px]">
                You will be redirected to WhatsApp to complete confirmation.
              </p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-100/15 shadow-2xl relative h-64 sm:h-80 md:h-96 lg:h-[520px]">
            <div ref={mapRef} className="w-full h-full" />
            {!mapsReady && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-200 text-sm">Loading map…</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}