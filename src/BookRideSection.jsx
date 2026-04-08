/* global google */

import { useState, useEffect, useRef } from "react";
import Silk from "./Silk";

const RATES = { auto: 17, bike: 14, car: 20 };
const RIDE_OPTIONS = [
  { value: "auto", label: "Auto", icon: "🛺",  desc: "Affordable & quick" },
  { value: "bike", label: "Bike", icon: "🏍️", desc: "Beat the traffic"   },
  { value: "car",  label: "Car",  icon: "🚗",  desc: "Comfortable ride"  },
];

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

  const inputCls = (field) =>
    `w-full bg-white/5 border ${errors[field] ? "border-red-400/60" : "border-white/10"} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-400/60 transition-all duration-200`;

  return (
    <section id="book" className="relative py-24 px-6 md:px-16 overflow-hidden border-t border-white/10">

      <div className="relative z-10 text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3">Ready to go?</p>
        <h2 className="text-3xl md:text-5xl font-bold text-white">Book Your Ride</h2>
        <p className="text-white/60 mt-4 max-w-lg mx-auto text-sm">
          Enter your pickup & drop, pick a ride type, and we'll show the fare instantly.
        </p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl">

          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s ? "bg-sky-500 text-white" : "bg-white/10 text-white/30"}`}>{s}</div>
                <span className={`text-xs ${step >= s ? "text-white/80" : "text-white/30"}`}>{s === 1 ? "Route & Ride" : "Your Details"}</span>
                {s < 2 && <div className={`w-8 h-px mx-1 ${step > s ? "bg-sky-400" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none">📍</span>
              <input ref={sourceInputRef} placeholder="Pickup location" autoComplete="off" className={`${inputCls("source")} pl-10`} />
            </div>
            {errors.source && <p className="text-red-400 text-xs pl-1">{errors.source}</p>}
          </div>

          <button
            onClick={useCurrentLocation}
            disabled={!mapsReady || locLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sky-400/30 text-sky-300 text-sm cursor-pointer hover:bg-sky-400/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {locLoading
              ? <><span className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />Fetching…</>
              : <><span>📍</span>Use my current location</>}
          </button>

          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none">🏁</span>
              <input ref={destInputRef} placeholder="Drop location" autoComplete="off" className={`${inputCls("destination")} pl-10`} />
            </div>
            {errors.destination && <p className="text-red-400 text-xs pl-1">{errors.destination}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {RIDE_OPTIONS.map(({ value, label, icon, desc }) => (
              <button
                key={value}
                onClick={() => setRideType(value)}
                className={`relative flex flex-col items-center gap-1.5 py-4 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center
                  ${rideType === value
                    ? "border-sky-400/80 bg-sky-400/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"}`}
              >
                <span className="text-2xl">{icon}</span>
                <span className={`text-xs font-semibold ${rideType === value ? "text-sky-300" : "text-white/80"}`}>{label}</span>
                <span className="text-[10px] text-white/40">{desc}</span>
                {rideType === value && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>
            ))}
          </div>

          {errors.route && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{errors.route}</p>
          )}

          <button
            onClick={calculateRoute}
            disabled={!mapsReady || loading}
            className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating…</>
              : "Calculate Route & Fare →"}
          </button>

          {!mapsReady && (
            <p className="text-center text-white/30 text-xs">
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Loading Google Maps…" : "⚠ Add VITE_GOOGLE_MAPS_API_KEY to .env"}
            </p>
          )}

          {distanceKm && fare && (
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-sky-500/10 to-blue-600/10 border border-sky-400/20 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{RIDE_OPTIONS.find(r => r.value === rideType)?.icon}</span>
                <div>
                  <p className="text-white/50 text-xs">Distance</p>
                  <p className="text-white font-semibold">{distanceKm} km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">Estimated fare</p>
                <p className="text-2xl font-bold text-sky-300">₹{fare}</p>
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <p className="text-white/50 text-xs uppercase tracking-widest pt-1">Your details</p>

              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none">👤</span>
                  <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your full name" autoComplete="off" className={`${inputCls("userName")} pl-10`} />
                </div>
                {errors.userName && <p className="text-red-400 text-xs pl-1">{errors.userName}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none">📞</span>
                  <input
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    autoComplete="off"
                    className={`${inputCls("userPhone")} pl-10`}
                  />
                </div>
                {errors.userPhone && <p className="text-red-400 text-xs pl-1">{errors.userPhone}</p>}
              </div>

              <button
                onClick={bookRide}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_30px_rgba(34,197,94,0.2)] flex items-center justify-center gap-2"
              >
                📲 Book via WhatsApp
              </button>

              <p className="text-center text-white/30 text-[11px]">
                You'll be redirected to WhatsApp to confirm your booking
              </p>
            </div>
          )}
        </div>

        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative" style={{ height: "520px" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            {!mapsReady && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-white/40 text-sm">Loading map…</p>
                </div>
              </div>
            )}
          </div>

          {distanceKm && (
            <div className="grid grid-cols-3 gap-3">
              {RIDE_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setRideType(value)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${rideType === value ? "border-sky-400/60 bg-sky-400/10" : "border-white/10 bg-white/5 hover:bg-white/8"}`}
                >
                  <div className="text-lg">{icon}</div>
                  <div className={`text-xs font-medium ${rideType === value ? "text-sky-300" : "text-white/70"}`}>{label}</div>
                  <div className={`text-sm font-bold ${rideType === value ? "text-sky-300" : "text-white/50"}`}>₹{Math.round(distanceKm * RATES[value])}</div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}