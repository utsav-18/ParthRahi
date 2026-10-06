import { useLanguage } from "../../lib/i18n/LanguageContext";

// Small ornaments shared across the customer site.

/** Horizontal ornamental divider with a centred mark (default ॐ). */
export function SacredDivider({ mark = "ॐ", className = "" }) {
  return (
    <div className={`flex items-center gap-3 text-gold-300/70 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-300/40" />
      <span className="text-xs tracking-[0.3em]">❖</span>
      <span className="text-base font-medium">{`॥ ${mark} ॥`}</span>
      <span className="text-xs tracking-[0.3em]">❖</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-300/40" />
    </div>
  );
}

/**
 * Section eyebrow: gold rule + uppercase label. The optional Devanagari
 * sub-label is only shown on the English site — in Hindi the label itself is
 * already Hindi, so repeating it would just be noise.
 */
export function SacredKicker({ children, hindi, center = false }) {
  const { lang } = useLanguage();
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-300 flex flex-wrap items-center gap-x-2.5 gap-y-1 ${
        center ? "justify-center" : ""
      }`}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-1">
        <span className="h-px w-5 bg-gold-300/70" />
        <span className="w-1.5 h-1.5 rotate-45 bg-gold-300" />
      </span>
      <span>{children}</span>
      {hindi && lang === "en" && (
        <span className="normal-case tracking-normal text-gold-200/50 text-xs font-medium">· {hindi}</span>
      )}
    </p>
  );
}

/** Faint concentric-mandala watermark for hero backdrops. Purely decorative. */
export function MandalaBackdrop({ className = "" }) {
  return (
    <svg
      className={`pointer-events-none absolute text-gold-300/[0.08] ${className}`}
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

/** Centred section header used on Home / list pages. */
export function SectionHeader({ kicker, hindi, title, subtitle, align = "center", className = "" }) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center mx-auto" : ""} max-w-2xl ${className}`}>
      {kicker && (
        <SacredKicker hindi={hindi} center={centered}>
          {kicker}
        </SacredKicker>
      )}
      {title && <h2 className="mt-3 text-3xl md:text-4xl font-bold text-cream leading-tight tracking-tight">{title}</h2>}
      {subtitle && <p className="mt-4 text-cream/65 text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}
