export default function EventsSection() {

  const days = [
    { day: "Day 1", date: "Mar 29", plan: "Dumraon → Varanasi Darshan" },
    { day: "Day 2", date: "Mar 30", plan: "Vindhyachal Darshan" },
    { day: "Day 3", date: "Mar 31", plan: "Ayodhya Darshan" },
    { day: "Day 4", date: "Apr 1",  plan: "Full Day Mathura & Vrindavan · Departure 8:00 PM → Dumraon" },
    { day: "Day 5", date: "Apr 2",  plan: "Return to Dumraon, Buxar" },
  ];

  const inclusions = [
    ["🚌", "AC Bus Service"],
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

        {/* ── Section Header ── */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-white/50 mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
            Latest Events
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Upcoming Tour 🚌
          </h2>
          <p className="text-white/50 text-sm">by ParthRahi Mobility</p>
        </div>

        {/* ── Main Card ── */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl">

          {/* ── Card Header ── */}
          <div className="relative px-6 sm:px-8 py-6 border-b border-white/10 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">
                  धार्मिक तीर्थ यात्रा
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Tirth Yatra 2026
                </h3>
                <p className="text-white/60 text-sm mt-1.5 flex items-center gap-2">
                  <span>📅 29 March – 2 April 2026</span>
                  <span className="text-white/30">·</span>
                  <span>5 Days / 4 Nights</span>
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-400/30 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-300 text-xs font-semibold tracking-wide">
                  Booking Open
                </span>
              </div>
            </div>
          </div>

          {/* ── Card Body ── */}
          <div className="p-5 sm:p-8 flex flex-col gap-8">

            {/* ── TOP ROW: Destinations + Day Plan | Video ── */}
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">

              {/* LEFT: Destinations + Day Plan + Starting Point */}
              <div className="flex flex-col gap-6 min-w-0">

                {/* Destinations */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
                    तीर्थ स्थान — Destinations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destinations.map((place) => (
                      <span
                        key={place}
                        className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-200 text-sm font-medium"
                      >
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
                      <div
                        key={day}
                        className="flex items-start gap-3 rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors duration-200"
                      >
                        <div className="flex flex-col items-center pt-0.5 shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-1 ${i === 0 ? "bg-indigo-400" : "bg-white/30"}`} />
                          {i < days.length - 1 && (
                            <div className="w-px flex-1 min-h-[18px] bg-white/10 mt-1" />
                          )}
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
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">
                      Starting Point
                    </p>
                    <p className="text-white font-semibold text-sm">Dumraon, Buxar, Bihar</p>
                  </div>
                </div>

              </div>

              {/* RIGHT: Video */}
              <div className="flex flex-col items-center gap-3 w-full md:w-[300px] shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 self-start md:self-auto">
                  Day-wise Plan Video
                </p>
                <div className="w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black/50 aspect-[9/16] shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/mqSZdw1amg4?autoplay=1&mute=1&loop=1&playlist=mqSZdw1amg4&controls=1&rel=0&modestbranding=1"
                    title="Tirth Yatra 2026 Day-wise Plan"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-white/25 text-[10px] text-center leading-relaxed max-w-[260px]">
                  Tap to play / pause · full screen available
                </p>
              </div>

            </div>

            {/* ── BOTTOM ROW: Pricing + Inclusions — full width ── */}
            <div className="border-t border-white/[0.06] pt-7 grid md:grid-cols-2 gap-8">

              {/* Pricing */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
                  मूल्य — Pricing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative rounded-2xl p-5 text-center overflow-hidden border border-blue-400/20 bg-gradient-to-b from-blue-900/30 to-blue-900/10">
                    <p className="text-xs text-blue-300/80 mb-2 font-medium">Non-AC Room</p>
                    <p className="text-3xl font-bold text-white tracking-tight">₹5,500</p>
                    <p className="text-xs text-white/40 mt-1">per person</p>
                  </div>
                  <div className="relative rounded-2xl p-5 text-center overflow-hidden border border-indigo-400/20 bg-gradient-to-b from-indigo-900/30 to-indigo-900/10">
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

          </div>

          {/* ── Footer CTA ── */}
          <div className="border-t border-white/[0.07] px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.02]">
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

        {/* ── Tagline ── */}
        <p className="text-center text-white/35 text-sm mt-8 italic">
          "सीमित सीटें उपलब्ध हैं — जल्दी बुक करें!" &nbsp;·&nbsp; Limited seats available, book fast!
        </p>

      </div>
    </section>
  );
}