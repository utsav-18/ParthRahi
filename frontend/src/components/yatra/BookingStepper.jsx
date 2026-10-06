import { useLanguage } from "../../lib/i18n/LanguageContext";

// Numbered-circle + connector-line indicator, matching BookRideSection.jsx:221-233.
export default function BookingStepper({ step, steps = ["Traveller Details", "Payment"] }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {steps.map((_, idx) => {
          const s = idx + 1;
          return (
            <div key={s} className="flex items-center gap-1.5 sm:gap-2 flex-1 last:flex-initial">
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step >= s ? "bg-gradient-to-br from-gold-200 to-gold-400 text-navy-950" : "bg-cream/15 text-gold-200/70"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < steps.length && (
                <div className={`h-px flex-1 ${step > s ? "bg-gold-300/70" : "bg-cream/20"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs uppercase tracking-wide text-gold-200/70">
        {t("bookingStepper.stepOf", { n: step, total: steps.length })} <span className="text-cream">{steps[step - 1]}</span>
      </p>
    </div>
  );
}
