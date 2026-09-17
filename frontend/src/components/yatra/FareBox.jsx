import { formatCurrency } from "../../lib/format";
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
      {tiers.map((tier) => (
        <div
          key={tier.label}
          className="rounded-2xl p-5 text-left border border-amber-200/12 bg-[#160f06]/45"
        >
          <p className="text-xs text-amber-100/60 mb-1.5 font-medium">{tier.label}</p>
          <p className="text-2xl font-bold text-amber-50 tracking-tight">
            {formatCurrency(tier.amount, price.currency)}
          </p>
          <p className="text-[11px] text-amber-200/40 mt-0.5">{price.unit || t("fareBox.perPerson")}</p>
        </div>
      ))}
    </div>
  );
}
