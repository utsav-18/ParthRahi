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
                  step >= s ? "bg-gradient-to-br from-amber-300 to-orange-400 text-[#3a1c02]" : "bg-amber-100/15 text-amber-200/70"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < steps.length && (
                <div className={`h-px flex-1 ${step > s ? "bg-amber-300/70" : "bg-amber-100/20"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs uppercase tracking-wide text-amber-200/70">
        {t("bookingStepper.stepOf", { n: step, total: steps.length })} <span className="text-amber-50">{steps[step - 1]}</span>
      </p>
    </div>
  );
}
