import { SacredKicker, SectionHeader } from "./SacredOrnaments";
import { useLanguage } from "../../lib/i18n/LanguageContext";

/**
 * "How booking works" explainer.
 * variant="full"    → titled section with 4 step cards (home + list page)
 * variant="compact" → slim 4-step strip (detail / booking pages)
 */
export default function HowItWorks({ variant = "full" }) {
  const { t } = useLanguage();

  const steps = [
    { icon: "🧭", title: t("howItWorks.step1Title"), body: t("howItWorks.step1Body") },
    { icon: "📝", title: t("howItWorks.step2Title"), body: t("howItWorks.step2Body") },
    { icon: "💳", title: t("howItWorks.step3Title"), body: t("howItWorks.step3Body") },
    { icon: "🙏", title: t("howItWorks.step4Title"), body: t("howItWorks.step4Body") },
  ];

  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-gold-300/15 bg-navy-900/45 p-4 sm:p-5">
        <SacredKicker>{t("howItWorks.kicker")}</SacredKicker>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-gold-300/10 border border-gold-300/35 text-gold-200 text-xs font-bold">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-cream leading-tight">{s.title}</p>
                <p className="text-[12px] text-cream/50 mt-0.5 leading-snug">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <section className="relative">
      <SectionHeader
        kicker={t("howItWorks.fullKicker")}
        hindi="सरल व पारदर्शी"
        title={t("howItWorks.title")}
        subtitle={t("howItWorks.subtitle")}
      />

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative pr-card pr-card-hover rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 text-navy-950 font-bold shadow-[0_6px_20px_rgba(220,174,71,0.35)]">
                {i + 1}
              </span>
              <span className="text-2xl" aria-hidden="true">{s.icon}</span>
            </div>
            <p className="text-cream font-semibold text-lg">{s.title}</p>
            <p className="text-cream/60 text-sm mt-2 leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
