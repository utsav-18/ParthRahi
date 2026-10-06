// Shared Tailwind class tokens for the whole customer site.
// Palette: deep navy base (navy-*), temple-brass gold accents (gold-*) and
// cream type — defined once in index.css @theme. Every page uses these so
// Home, Yatra list/detail, booking and footer read as one product.

const btnBase =
  'inline-flex items-center justify-center gap-2 px-6 md:px-7 py-3 rounded-full font-semibold text-sm md:text-[15px] whitespace-nowrap cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0';

// Main call-to-action — solid gold on navy.
export const btnPrimary = `${btnBase} bg-gradient-to-r from-gold-200 via-gold-300 to-gold-400 text-navy-950 shadow-[0_8px_24px_rgba(220,174,71,0.28)] hover:shadow-[0_12px_30px_rgba(220,174,71,0.4)] hover:brightness-105`;

// Secondary — translucent navy with a gold hairline.
export const btnSecondary = `${btnBase} border border-gold-300/35 text-cream bg-navy-900/50 backdrop-blur-sm hover:bg-navy-800/70 hover:border-gold-300/60`;

// Kept for forms (booking / enquiry): same gold as btnPrimary.
export const btnAccent = btnPrimary;

// Card + section shells
export const cardBase = 'rounded-2xl pr-card shadow-2xl';

export const cardHover = 'rounded-2xl pr-card pr-card-hover';

export const sectionShell =
  'relative z-10 max-w-7xl mx-auto rounded-[2rem] pr-panel px-5 py-10 md:px-10 md:py-14';

export const chip =
  'px-3 py-1.5 rounded-full bg-gold-300/10 border border-gold-300/25 text-gold-100 text-sm font-medium';

export const labelKicker =
  'text-[11px] font-semibold uppercase tracking-widest text-gold-200/60';

// Section eyebrow — gold, with an ornamental mark rendered by callers
export const kicker =
  'text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-300';

export const stepBadge =
  'shrink-0 grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 text-navy-950 font-bold text-sm shadow-[0_6px_20px_rgba(220,174,71,0.35)]';

// Frosted panel used for detail-page sections
export const panel = 'rounded-2xl pr-panel';

// Section heading sizes, shared so every page has the same hierarchy.
export const h2 = 'text-3xl md:text-4xl font-bold text-cream leading-tight tracking-tight';
export const lead = 'text-cream/70 text-base md:text-lg leading-relaxed';

// Navy form input with gold focus
export const inputCls = (hasError) =>
  `w-full bg-navy-950/70 border ${
    hasError ? 'border-red-300/80' : 'border-gold-300/20'
  } rounded-xl px-4 py-3 text-cream text-sm placeholder:text-cream/40 focus:outline-none focus:border-gold-300/70 focus:ring-2 focus:ring-gold-300/20 transition-all duration-200`;
