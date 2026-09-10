// Shared Tailwind class tokens for the Yatra / Events module.
// The module uses a "dharmik" (devotional) palette — the site's dark base kept
// for cohesion, warmed with saffron / marigold / temple-brass gold accents.
// btnPrimary / btnSecondary stay as the site-wide pill buttons.

export const btnPrimary =
  'inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-black font-medium whitespace-nowrap cursor-pointer border border-white/70 shadow-lg shadow-white/10 transition-all duration-300 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0';

export const btnSecondary =
  'inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-amber-300/40 text-amber-50 whitespace-nowrap cursor-pointer bg-amber-950/30 shadow-md shadow-amber-900/20 transition-all duration-300 hover:bg-amber-900/40 hover:border-amber-300/60 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed';

// Devotional gold call-to-action (marigold → deep saffron)
export const btnAccent =
  'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-300 to-orange-400 hover:from-amber-200 hover:to-orange-300 text-[#3a1c02] font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 shadow-[0_6px_20px_rgba(251,191,36,0.28)]';

// Card + section shells
export const cardBase =
  'rounded-2xl bg-white/5 border border-amber-200/10 shadow-2xl';

export const cardHover =
  'rounded-2xl bg-amber-950/20 border border-amber-200/12 transition-all duration-300 hover:bg-amber-900/25 hover:-translate-y-1 hover:shadow-xl';

export const sectionShell =
  'relative z-10 max-w-7xl mx-auto rounded-[2rem] border border-amber-200/12 bg-[#160f06]/70 backdrop-blur-sm px-5 py-10 md:px-10 md:py-14 shadow-2xl shadow-amber-900/10';

export const chip =
  'px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/25 text-amber-100 text-sm font-medium';

export const labelKicker =
  'text-[11px] font-semibold uppercase tracking-widest text-amber-200/50';

// Section eyebrow — gold, with an ornamental mark rendered by callers
export const kicker =
  'text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/80';

export const stepBadge =
  'shrink-0 grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-[#3a1c02] font-bold text-sm shadow-[0_6px_20px_rgba(251,146,60,0.35)]';

// Frosted panel used for detail-page sections
export const panel =
  'rounded-2xl border border-amber-200/12 bg-[#160f06]/60 backdrop-blur-sm';

// Warm dark form input
export const inputCls = (hasError) =>
  `w-full bg-[#160f06]/85 border ${
    hasError ? 'border-red-300/80' : 'border-amber-200/18'
  } rounded-lg px-4 py-3 text-amber-50 text-sm placeholder:text-amber-200/40 focus:outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/25 transition-all duration-200`;
