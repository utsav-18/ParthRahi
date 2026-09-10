import { SacredKicker } from "./SacredOrnaments";

const STEPS = [
  {
    icon: "🧭",
    title: "Browse & choose",
    body: "Open a yatra to see the full day-wise plan, what's included, the fares and the next departure dates.",
  },
  {
    icon: "📝",
    title: "Reserve your seat",
    body: "Fill in the lead traveller's details and number of seats. Your seats are held for you the moment you confirm.",
  },
  {
    icon: "💳",
    title: "Pay the advance",
    body: "Pay a small advance per seat over UPI or WhatsApp. The balance is due before departure — no hidden charges.",
  },
  {
    icon: "🙏",
    title: "Get confirmed & travel",
    body: "We confirm on WhatsApp with your booking reference, share the pickup details, and our tour manager takes it from there.",
  },
];

/**
 * "How booking works" explainer.
 * variant="full"    → titled section with 4 cards + connector line (list page)
 * variant="compact" → slim 4-step strip (detail / booking pages)
 */
export default function HowItWorks({ variant = "full", advanceHint }) {
  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-amber-200/12 bg-amber-950/15 p-4 sm:p-5">
        <SacredKicker>How booking works</SacredKicker>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-bold">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-50 leading-tight">{s.title}</p>
                <p className="text-[12px] text-amber-100/50 mt-0.5 leading-snug">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        {advanceHint && (
          <p className="mt-3 text-xs text-amber-200/80 border-t border-amber-200/10 pt-3">{advanceHint}</p>
        )}
      </div>
    );
  }

  return (
    <section className="relative">
      <div className="text-center mb-8">
        <SacredKicker hindi="सरल व पारदर्शी">Simple &amp; transparent</SacredKicker>
        <h2 className="text-2xl md:text-3xl font-bold text-amber-50 mt-2">How your yatra booking works</h2>
        <p className="text-amber-100/55 text-sm mt-2 max-w-2xl mx-auto">
          Four clear steps from choosing a journey to boarding the coach. No app download, no paperwork queues.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="relative rounded-2xl border border-amber-200/12 bg-[#160f06]/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/35"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-[#3a1c02] font-bold shadow-[0_6px_20px_rgba(251,146,60,0.35)]">
                {i + 1}
              </span>
              <span className="text-2xl" aria-hidden="true">{s.icon}</span>
            </div>
            <p className="text-amber-50 font-semibold">{s.title}</p>
            <p className="text-amber-100/55 text-sm mt-1 leading-relaxed">{s.body}</p>
            {i < STEPS.length - 1 && (
              <span className="hidden lg:block absolute top-10 -right-2 text-amber-300/25 text-lg">→</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
