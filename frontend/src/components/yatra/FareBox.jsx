import { formatCurrency } from "../../lib/format";

export default function FareBox({ price = {}, selectedVariant, onSelectVariant }) {
  const variants = Array.isArray(price.variants) && price.variants.length
    ? price.variants
    : [{ label: price.unit || "Per person", amount: price.amount }];

  const advance = price.advanceAmount;
  const selectable = Boolean(onSelectVariant);
  const cheapest = Math.min(...variants.map((v) => Number(v.amount) || Infinity));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {variants.map((v, i) => {
          const active = selectable ? selectedVariant === v.label : i === 0;
          const isValue = Number(v.amount) === cheapest && variants.length > 1;
          return (
            <button
              key={v.label + i}
              type="button"
              onClick={() => onSelectVariant?.(v.label)}
              disabled={!selectable}
              className={`relative rounded-2xl p-5 text-left overflow-hidden border transition-all duration-200 ${
                selectable ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"
              } ${
                active
                  ? "border-amber-300/55 bg-amber-300/[0.10] shadow-[0_8px_28px_rgba(251,191,36,0.16)]"
                  : "border-amber-200/12 bg-[#160f06]/45 hover:border-amber-200/25"
              }`}
            >
              {isValue && (
                <span className="absolute top-0 right-0 text-[9px] font-bold uppercase tracking-wider bg-green-400/20 text-green-200 px-2 py-0.5 rounded-bl-lg">
                  Best value
                </span>
              )}
              <p className="text-xs text-amber-100/60 mb-1.5 font-medium pr-16">{v.label}</p>
              <p className="text-2xl font-bold text-amber-50 tracking-tight">
                {formatCurrency(v.amount, price.currency)}
              </p>
              <p className="text-[11px] text-amber-200/40 mt-0.5">{price.unit || "per person"}</p>
              {active && selectable && (
                <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-amber-300 text-[#3a1c02] text-xs flex items-center justify-center">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {advance ? (
        <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">
          <span className="font-semibold">Reserve with {formatCurrency(advance, price.currency)} per seat.</span>{" "}
          The remaining balance is payable before departure. No booking fee, no card charges.
        </div>
      ) : null}
    </div>
  );
}
