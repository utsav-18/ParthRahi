import { formatCurrency, discountOriginalPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n/LanguageContext";

// Purely informational — there's no fare "choice" to make anymore. A seat's
// price is fixed by its type (Normal vs Sleeper), decided when the customer
// clicks a seat on the seat map, not upfront. This just shows the two
// admin-configured prices so a visitor knows what to expect before booking.
export default function FareBox({ price = {} }) {
  const { t } = useLanguage();
  const tiers = [
    { label: t("fareBox.normalSeat"), amount: price.normalSeat },
    { label: t("fareBox.sleeperSeat"), amount: price.sleeperSeat },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {tiers.map((tier) => {
        const original = discountOriginalPrice(tier.amount);
        return (
          <div
            key={tier.label}
            className="rounded-2xl p-5 text-left border border-amber-200/12 bg-[#160f06]/45"
          >
            <p className="text-xs text-amber-100/60 mb-1.5 font-medium">{tier.label}</p>
            {original && (
              <p className="text-sm text-amber-200/40 line-through leading-none">{formatCurrency(original, price.currency)}</p>
            )}
            <p className="text-2xl font-bold text-amber-50 tracking-tight">
              {formatCurrency(tier.amount, price.currency)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-amber-200/40">{price.unit || t("fareBox.perPerson")}</p>
              {original && <span className="text-[10px] font-bold text-green-400">{t("fareBox.discountOff")}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
