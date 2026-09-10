const ITEMS = [
  { icon: "🏢", title: "Registered operator", sub: "Parthrahi Smartcab Solutions LLP · Startup India (DPIIT)" },
  { icon: "🧭", title: "Tour manager on every yatra", sub: "A ParthRahi manager travels with the group from first day to last" },
  { icon: "🍛", title: "Sattvic meals & clean stays", sub: "Pure-veg breakfast & dinner, hand-picked hotels near the temples" },
  { icon: "💬", title: "Real people on WhatsApp", sub: "One number for booking, pickup and on-trip help — someone always answers" },
];

export default function TrustBand({ compact = false }) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {ITEMS.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl border border-amber-200/12 bg-amber-950/20 p-4 transition-all duration-300 hover:bg-amber-900/25 hover:-translate-y-1"
        >
          <div className="text-2xl mb-2" aria-hidden="true">{it.icon}</div>
          <p className="text-sm font-semibold text-amber-50">{it.title}</p>
          <p className="text-[12px] text-amber-100/60 mt-0.5 leading-snug">{it.sub}</p>
        </div>
      ))}
    </div>
  );
}
