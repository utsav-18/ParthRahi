import { useEffect, useRef, useState, useCallback } from "react";

// ── Hotel images ───────────────────────────────────────────
const hotelImages = [
  { src: "/hot1.jpeg", label: "Deluxe Room" },
  { src: "/hot2.jpeg", label: "Premium Room" },
  { src: "/hot3.jpeg", label: "Attached Bathroom" },
];

// ── Lightbox ───────────────────────────────────────────────
function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const startX = useRef(null);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  // Passive touch for lightbox swipe
  const startXRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e) => { startXRef.current = e.touches[0].clientX; };
    const onEnd = (e) => {
      if (startXRef.current === null) return;
      const diff = e.changedTouches[0].clientX - startXRef.current;
      if (Math.abs(diff) > 50) diff < 0 ? next() : prev();
      startXRef.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full md:w-auto md:max-w-lg bg-[#0f1623] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
            {images[current].label}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 border border-white/15 text-white/70 text-sm flex items-center justify-center"
          >×</button>
        </div>

        {/* Image */}
        <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden bg-black/40" style={{ aspectRatio: "4/3" }}>
          {images.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.label}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{ opacity: i === current ? 1 : 0, transition: "opacity 0.3s ease" }}
            />
          ))}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center"
            onClick={prev}
          >‹</button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center"
            onClick={next}
          >›</button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 px-4 pb-5">
          {images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setCurrent(i)}
              className="relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200"
              style={{
                aspectRatio: "4/3",
                borderColor: i === current ? "rgba(129,140,248,0.9)" : "rgba(255,255,255,0.08)",
              }}
            >
              <img src={img.src} alt={img.label} className="w-full h-full object-cover" draggable={false} />
              {i !== current && <div className="absolute inset-0 bg-black/40" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hotel Gallery ──────────────────────────────────────────
function HotelGallery() {
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const galleryRef = useRef(null);

  // Passive touch for swipe
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    let startX = null;
    const onStart = (e) => { startX = e.touches[0].clientX; };
    const onEnd = (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) setActive((c) => (c + 1) % hotelImages.length);
        else setActive((c) => (c - 1 + hotelImages.length) % hotelImages.length);
      }
      startX = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          images={hotelImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
          🏨 Hotel Rooms
        </p>

        {/* Main image */}
        <div
          ref={galleryRef}
          className="relative w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 cursor-zoom-in"
          style={{ aspectRatio: "4/3" }}
          onClick={() => setLightboxIndex(active)}
        >
          {hotelImages.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.label}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{ opacity: i === active ? 1 : 0, transition: "opacity 0.35s ease" }}
            />
          ))}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Label */}
          <div className="absolute bottom-3 left-4">
            <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full border border-white/10">
              {hotelImages[active].label}
            </span>
          </div>

          {/* Hint */}
          <div className="absolute top-3 right-3">
            <span className="text-white/50 text-[10px] bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
              tap to expand
            </span>
          </div>

          {/* Desktop arrows only */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/20 text-white text-lg hidden md:flex items-center justify-center hover:bg-black/60 transition"
            onClick={(e) => { e.stopPropagation(); setActive((c) => (c - 1 + hotelImages.length) % hotelImages.length); }}
          >‹</button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/20 text-white text-lg hidden md:flex items-center justify-center hover:bg-black/60 transition"
            onClick={(e) => { e.stopPropagation(); setActive((c) => (c + 1) % hotelImages.length); }}
          >›</button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 mt-2">
          {hotelImages.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setActive(i)}
              className="relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200"
              style={{
                aspectRatio: "4/3",
                borderColor: i === active ? "rgba(129,140,248,0.8)" : "rgba(255,255,255,0.08)",
              }}
            >
              <img src={img.src} alt={img.label} className="w-full h-full object-cover" draggable={false} />
              {i !== active && <div className="absolute inset-0 bg-black/40" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── YouTube embed — lazy loaded only when visible ──────────
function YouTubeEmbed({ onUnmute, muted }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Only initialize YouTube player when section scrolls into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;

    const initPlayer = () => {
      if (playerRef.current) return; // already init
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: "mqSZdw1amg4",
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: "mqSZdw1amg4",
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => e.target.playVideo(),
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [loaded]);

  const handleUnmute = () => {
    if (playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      onUnmute();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-xl" style={{ aspectRatio: "9/16" }}>
      {loaded ? (
        <>
          <div id="yt-player" className="w-full h-full" />
          {muted && (
            <button
              onClick={handleUnmute}
              className="absolute inset-0 flex flex-col items-center justify-end pb-10 gap-2 bg-black/30 cursor-pointer w-full"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.63 3.63a1 1 0 0 0 0 1.41L7.29 8.7 7 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91a1 1 0 1 0 .76 1.85 8.1 8.1 0 0 0 2.45-1.55l1.15 1.15a1 1 0 0 0 1.41-1.41L5.05 3.63a1 1 0 0 0-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53A9.9 9.9 0 0 0 21 12c0-4.28-2.68-7.93-6.5-9.36a1 1 0 0 0-.67 1.88C16.72 5.7 19 8.65 19 12zm-9-6.71v1.88l2 2V6a1 1 0 0 0-1.71-.71L10 6.59v-.3z"/>
                  </svg>
                </div>
                <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                  Tap to Unmute
                </span>
              </div>
            </button>
          )}
        </>
      ) : (
        // Placeholder shown before lazy load
        <div className="w-full h-full flex items-center justify-center bg-black/40">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      )}
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────
export default function EventsSection() {
  const [muted, setMuted] = useState(true);

  const days = [
    { day: "Day 1", plan: "Dumraon → Varanasi Darshan" },
    { day: "Day 2", plan: "Vindhyachal Darshan" },
    { day: "Day 3", plan: "Ayodhya Darshan" },
    { day: "Day 4", plan: "Full Day Mathura & Vrindavan · Departure 8:00 PM → Dumraon" },
    { day: "Day 5", plan: "Return to Dumraon, Buxar" },
  ];

  const inclusions = [
    ["🚌", "Comfortable Bus Service"],
    ["🍳", "Morning Breakfast"],
    ["🍽️", "Dinner Included"],
    ["🏨", "Hotel Stay"],
    ["🏥", "24/7 Medical"],
    ["✅", "Verified Drivers"],
  ];

  const destinations = [
    "🛕 Varanasi",
    "⛰️ Vindhyachal",
    "🏯 Ayodhya",
    "🪔 Mathura",
    "🌿 Vrindavan",
  ];

  return (
    <section
      id="events"
      className="relative py-24 px-4 sm:px-8 md:px-16 overflow-hidden border-t border-white/10"
    >
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-white/50 mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
            Latest Events
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Upcoming Tour 🚌
          </h2>
          <p className="text-white/50 text-sm">by ParthRahi Mobility</p>
        </div>

        {/* Main Card — no backdrop-blur on mobile (major perf cause) */}
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.04)" }}>

          {/* Card Header */}
          <div className="relative px-6 sm:px-8 py-6 border-b border-white/10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to right, rgba(30,58,138,0.4), rgba(49,46,129,0.3), rgba(88,28,135,0.4))" }} />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">धार्मिक तीर्थ यात्रा</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Tirth Yatra 2026</h3>
                <p className="text-white/60 text-sm mt-1.5 flex flex-wrap items-center gap-2">
                  {/* <span>📅 29 March – 2 April 2026</span> */}
                  <span className="text-white/30">·</span>
                  <span>5 Days / 4 Nights</span>
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-400/30 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="text-green-300 text-xs font-semibold tracking-wide">Booking Open</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-8 flex flex-col gap-8">

            {/* TOP ROW */}
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">

              {/* Left */}
              <div className="flex flex-col gap-6 min-w-0">

                {/* Destinations */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
                    तीर्थ स्थान — Destinations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destinations.map((place) => (
                      <span key={place} className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-200 text-sm font-medium">
                        {place}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day-wise Plan */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
                    Day-wise Plan
                  </p>
                  <div className="flex flex-col gap-2">
                    {days.map(({ day, date, plan }, i) => (
                      <div key={day} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.06]">
                        <div className="flex flex-col items-center pt-0.5 shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-1 ${i === 0 ? "bg-indigo-400" : "bg-white/30"}`} />
                          {i < days.length - 1 && <div className="w-px flex-1 min-h-[18px] bg-white/10 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-indigo-300 shrink-0">{day}</span>
                            <span className="text-xs text-white/35 shrink-0">{date}</span>
                          </div>
                          <p className="text-sm text-white/80 leading-snug">{plan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Starting Point */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-xl shrink-0">📍</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Starting Point</p>
                    <p className="text-white font-semibold text-sm">Dumraon, Buxar, Bihar</p>
                  </div>
                </div>

              </div>

              {/* Right: Video — lazy loaded */}
              <div className="flex flex-col items-center gap-3 w-full md:w-[300px] shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 self-start md:self-auto">
                  Day-wise Plan Video
                </p>
                <YouTubeEmbed muted={muted} onUnmute={() => setMuted(false)} />
                <p className="text-white/25 text-[10px] text-center leading-relaxed max-w-[260px]">
                  {muted ? "Playing muted · tap overlay to enable audio" : "🔊 Audio on · use controls to pause"}
                </p>
              </div>

            </div>

            {/* BOTTOM ROW: Pricing + Inclusions */}
            <div className="border-t border-white/[0.06] pt-7 grid md:grid-cols-2 gap-8">

              {/* Pricing */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
                  मूल्य — Pricing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative rounded-2xl p-5 text-center overflow-hidden border border-blue-400/20"
                    style={{ background: "linear-gradient(to bottom, rgba(30,64,175,0.3), rgba(30,64,175,0.1))" }}>
                    <p className="text-xs text-blue-300/80 mb-2 font-medium">Non-AC Room</p>
                    <p className="text-3xl font-bold text-white tracking-tight">₹5,500</p>
                    <p className="text-xs text-white/40 mt-1">per person</p>
                  </div>
                  <div className="relative rounded-2xl p-5 text-center overflow-hidden border border-indigo-400/20"
                    style={{ background: "linear-gradient(to bottom, rgba(67,56,202,0.3), rgba(67,56,202,0.1))" }}>
                    <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                      Premium
                    </div>
                    <p className="text-xs text-indigo-300/80 mb-2 font-medium">AC Room</p>
                    <p className="text-3xl font-bold text-white tracking-tight">₹6,500</p>
                    <p className="text-xs text-white/40 mt-1">per person</p>
                  </div>
                </div>
              </div>

              {/* Inclusions */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
                  सुविधाएं — Inclusions
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {inclusions.map(([icon, label]) => (
                    <div key={label} className="flex items-center gap-2.5 text-sm text-white/70">
                      <span className="text-base leading-none shrink-0">{icon}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Hotel Gallery */}
            <div className="border-t border-white/[0.06] pt-7">
              <HotelGallery />
            </div>

          </div>

          {/* Footer CTA */}
          <div className="border-t border-white/[0.07] px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-white/40 text-xs mb-1">
                अधिक जानकारी के लिए संपर्क करें — For more info contact:
              </p>
              <p className="text-white font-bold text-lg tracking-wide">
                📞 8252224027 &nbsp;/&nbsp; 7903993870
              </p>
            </div>
            <a
              href="https://wa.me/918252224027?text=Hi%20I%20want%20to%20book%20my%20seat%20for%20Tirth%20Yatra%202026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-white text-black text-sm font-bold whitespace-nowrap transition-all duration-200 hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
            >
              <span>💬</span> Book Your Seat Now
            </a>
          </div>

        </div>

        {/* Tagline */}
        <p className="text-center text-white/35 text-sm mt-8 italic">
          "सीमित सीटें उपलब्ध हैं — जल्दी बुक करें!" &nbsp;·&nbsp; Limited seats available, book fast!
        </p>

      </div>
    </section>
  );
}