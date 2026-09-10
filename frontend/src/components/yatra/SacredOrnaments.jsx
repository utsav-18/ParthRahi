// Small devotional ornaments shared across the Yatra module.

/** Horizontal ornamental divider with a centred mark (default ॐ). */
export function SacredDivider({ mark = "ॐ", className = "" }) {
  return (
    <div className={`flex items-center gap-3 text-amber-300/70 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/40" />
      <span className="text-xs tracking-[0.3em]">❖</span>
      <span className="text-base font-medium">{`॥ ${mark} ॥`}</span>
      <span className="text-xs tracking-[0.3em]">❖</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/40" />
    </div>
  );
}

/** Section eyebrow: a diya + gold uppercase label, optional Devanagari line. */
export function SacredKicker({ children, hindi }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/80 flex items-center gap-2">
      <span aria-hidden="true">🪔</span>
      <span>{children}</span>
      {hindi && <span className="normal-case tracking-normal text-amber-200/45 text-xs">· {hindi}</span>}
    </p>
  );
}

/** Faint concentric-mandala watermark for hero backdrops. Purely decorative. */
export function MandalaBackdrop({ className = "" }) {
  return (
    <svg
      className={`pointer-events-none absolute text-amber-300/[0.07] ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      aria-hidden="true"
    >
      {[92, 78, 62, 46, 30, 16].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} />
      ))}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI) / 12;
        return (
          <line
            key={i}
            x1={100 + 16 * Math.cos(a)}
            y1={100 + 16 * Math.sin(a)}
            x2={100 + 92 * Math.cos(a)}
            y2={100 + 92 * Math.sin(a)}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <ellipse
            key={i}
            cx={100 + 62 * Math.cos(a)}
            cy={100 + 62 * Math.sin(a)}
            rx="10"
            ry="20"
            transform={`rotate(${(i * 180) / 6} ${100 + 62 * Math.cos(a)} ${100 + 62 * Math.sin(a)})`}
          />
        );
      })}
    </svg>
  );
}
