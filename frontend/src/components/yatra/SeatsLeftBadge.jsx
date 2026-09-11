import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function SeatsLeftBadge({ seatsLeft, totalSeats, className = "" }) {
  const { t } = useLanguage();
  const left = Math.max(0, Number(seatsLeft ?? 0));
  const total = Number(totalSeats ?? 0);
  const soldOut = left <= 0;
  const low = !soldOut && total > 0 && left / total <= 0.2;

  const tone = soldOut
    ? "bg-red-500/15 border-red-400/30 text-red-300"
    : low
    ? "bg-amber-500/15 border-amber-400/30 text-amber-300"
    : "bg-green-500/15 border-green-400/30 text-green-300";

  const label = soldOut
    ? t("seats.soldOut")
    : total
    ? t("seats.ofTotal", { left, total })
    : t("seats.leftOnly", { left });

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${tone} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${soldOut ? "bg-red-400" : low ? "bg-amber-400 animate-pulse" : "bg-green-400 animate-pulse"}`} />
      {label}
    </span>
  );
}
