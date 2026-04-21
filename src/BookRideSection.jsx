/* global google */

import { useState, useEffect, useRef } from "react";
import Silk from "./Silk";

const RATES = { auto: 17, bike: 14, car: 20 };
const RIDE_OPTIONS = [
  { value: "auto", label: "Auto Rickshaw", code: "AR", desc: "Efficient city commute" },
  { value: "bike", label: "Bike", code: "BK", desc: "Fast response for short routes" },
  { value: "car", label: "Car", code: "CR", desc: "Comfort-focused travel" },
];

function VehicleSymbol({ type, className = "w-5 h-5" }) {
  const baseProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (type === "bike") {
    return (
      <svg {...baseProps}>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M6 17l4-7h3l2 3h3" />
        <path d="M13 10l-2 4h4" />
      </svg>
    );
  }

  if (type === "auto") {
    return (
      <svg {...baseProps}>
        <path d="M4 13h16l-1.5-4.5A2 2 0 0 0 16.6 7H9" />
        <path d="M9 7L6 10v3" />
        <circle cx="8" cy="17" r="2" />
        <circle cx="16" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg {...baseProps}>
      <rect x="3" y="10" width="18" height="6" rx="2" />
      <path d="M7 10V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      <circle cx="8" cy="17" r="1.8" />
      <circle cx="16" cy="17" r="1.8" />
    </svg>
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

  const fare = distanceKm ? Math.round(distanceKm * RATES[rideType]) : null;

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
    `w-full bg-slate-900/85 border ${errors[field] ? "border-red-300/80" : "border-slate-200/35"} rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-200/70 focus:outline-none focus:border-cyan-200 focus:ring-2 focus:ring-cyan-300/25 transition-all duration-200`;

  return (
    <section id="book" className="relative py-24 px-6 md:px-16 overflow-hidden border-t border-slate-100/20">

      <div className="relative z-10 text-center mb-14">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-100/85 mb-3">ParthRahi Mobility</p>
        <h2 className="text-3xl md:text-5xl font-semibold text-white">Book Your Ride</h2>
        <p className="text-slate-100/85 mt-4 max-w-2xl mx-auto text-sm md:text-base">
          Plan a route, compare vehicle options, and place your booking with transparent pricing and verified trip details.
        </p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">

        <div className="bg-slate-900/80 border border-slate-100/25 backdrop-blur-xl rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl">

          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${step >= s ? "bg-cyan-300 text-slate-950" : "bg-slate-100/20 text-slate-200/70"}`}>{s}</div>
                <span className={`text-xs uppercase tracking-wide ${step >= s ? "text-slate-50" : "text-slate-100/65"}`}>{s === 1 ? "Trip Setup" : "Rider Profile"}</span>
                {s < 2 && <div className={`w-8 h-px mx-1 ${step > s ? "bg-cyan-200" : "bg-slate-100/25"}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-100/75 pointer-events-none">FROM</span>
              <input ref={sourceInputRef} placeholder="Enter pickup location" autoComplete="off" onFocus={ensureFieldVisibility} className={`${inputCls("source")} pl-16`} />
            </div>
            {errors.source && <p className="text-red-400 text-xs pl-1">{errors.source}</p>}
          </div>

          <button
            onClick={useCurrentLocation}
            disabled={!mapsReady || locLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-cyan-200/55 text-cyan-100 text-sm cursor-pointer hover:bg-cyan-300/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {locLoading
              ? <><span className="w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />Detecting location…</>
              : "Use current GPS location"}
          </button>

          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-100/75 pointer-events-none">TO</span>
              <input ref={destInputRef} placeholder="Enter destination" autoComplete="off" onFocus={ensureFieldVisibility} className={`${inputCls("destination")} pl-16`} />
            </div>
            {errors.destination && <p className="text-red-400 text-xs pl-1">{errors.destination}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {RIDE_OPTIONS.map(({ value, label, code, desc }) => (
              <button
                key={value}
                onClick={() => setRideType(value)}
                className={`relative flex flex-col items-center gap-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center
                  ${rideType === value
                    ? "border-cyan-300/80 bg-cyan-300/10 shadow-[0_0_22px_rgba(103,232,249,0.18)]"
                    : "border-slate-100/25 bg-slate-900/70 hover:border-slate-100/40"}`}
              >
                <span className={`w-10 h-10 rounded-md border flex items-center justify-center ${rideType === value ? "border-cyan-200 text-cyan-100 bg-cyan-300/15" : "border-slate-100/35 text-slate-100/90"}`}>
                  <VehicleSymbol type={value} className="w-5 h-5" />
                </span>
                <span className={`text-xs font-semibold ${rideType === value ? "text-cyan-100" : "text-slate-50"}`}>{label}</span>
                <span className="text-[10px] text-slate-100/70 leading-tight px-1">{desc}</span>
                {rideType === value && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-300" />}
              </button>
            ))}
          </div>

          {errors.route && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{errors.route}</p>
          )}

          <button
            onClick={calculateRoute}
            disabled={!mapsReady || loading}
            className="w-full py-3.5 rounded-lg bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating…</>
              : "Calculate Route & Estimate"}
          </button>

          {!mapsReady && (
            <p className="text-center text-slate-100/70 text-xs">
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Loading Google Maps…" : "⚠ Add VITE_GOOGLE_MAPS_API_KEY to .env"}
            </p>
          )}

          {distanceKm && fare && (
            <div className="flex items-center justify-between gap-4 bg-linear-to-r from-cyan-300/20 to-slate-300/10 border border-cyan-100/35 rounded-lg px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-md border border-cyan-300/40 bg-cyan-300/10 flex items-center justify-center text-xs font-semibold text-cyan-200">
                  <VehicleSymbol type={rideType} className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-slate-100/80 text-xs uppercase tracking-wide">Distance</p>
                  <p className="text-white font-semibold">{distanceKm} km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-100/80 text-xs uppercase tracking-wide">Estimated fare</p>
                <p className="text-2xl font-bold text-cyan-100">₹{fare}</p>
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-4 pt-2 border-t border-slate-200/10">
              <p className="text-slate-100/85 text-xs uppercase tracking-[0.18em] pt-1">Rider Details</p>

              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-100/75 pointer-events-none">NAME</span>
                  <input value={userName} onChange={(e) => setUserName(e.target.value)} onFocus={ensureFieldVisibility} placeholder="Enter full name" autoComplete="off" className={`${inputCls("userName")} pl-16`} />
                </div>
                {errors.userName && <p className="text-red-400 text-xs pl-1">{errors.userName}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-slate-100/75 pointer-events-none">PHONE</span>
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
                className="w-full py-4 rounded-lg bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_26px_rgba(16,185,129,0.22)]"
              >
                Confirm Booking on WhatsApp
              </button>

              <p className="text-center text-slate-100/70 text-[11px]">
                You will be redirected to WhatsApp to complete confirmation.
              </p>
            </div>
          )}
        </div>

        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-100/25 shadow-2xl relative" style={{ height: "520px" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            {!mapsReady && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-100/80 text-sm">Loading map…</p>
                </div>
              </div>
            )}
          </div>

          {distanceKm && (
            <div className="grid grid-cols-3 gap-3">
              {RIDE_OPTIONS.map(({ value, label, code }) => (
                <button
                  key={value}
                  onClick={() => setRideType(value)}
                  className={`p-3 rounded-lg border text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${rideType === value ? "border-cyan-200 bg-cyan-300/15" : "border-slate-100/30 bg-slate-900/70 hover:bg-slate-800/75"}`}
                >
                  <div className={`mx-auto mb-2 w-8 h-8 rounded-md border flex items-center justify-center ${rideType === value ? "border-cyan-200 text-cyan-100" : "border-slate-100/40 text-slate-100/90"}`}>
                    <VehicleSymbol type={value} className="w-4 h-4" />
                  </div>
                  <div className={`text-xs font-medium ${rideType === value ? "text-cyan-100" : "text-slate-50"}`}>{label}</div>
                  <div className={`text-sm font-bold ${rideType === value ? "text-cyan-100" : "text-slate-100/90"}`}>₹{Math.round(distanceKm * RATES[value])}</div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}