import { Link } from "react-router-dom";
import SeatsLeftBadge from "./SeatsLeftBadge";
import { btnPrimary, btnSecondary } from "../../lib/theme";
import { formatCurrency, durationLabel, formatDate } from "../../lib/format";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";

const Row = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3 py-2">
      <span className="text-base shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-amber-200/40">{label}</p>
        <p className="text-sm text-amber-50/85">{value}</p>
      </div>
    </div>
  ) : null;

export default function TripSummaryCard({ yatra }) {
  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const soldOut = seatsLeft <= 0 || yatra.status !== "published";
  const dates = (yatra.departureDates || []).map((d) => formatDate(d)).join(", ");
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi ParthRahi, I have a question about "${yatra.title}".`
  )}`;

  return (
    <div className="lg:sticky lg:top-24 rounded-2xl border border-amber-200/15 bg-[#160f06]/85 backdrop-blur-md shadow-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-widest text-amber-200/50">🪔 Trip summary</p>
          <SeatsLeftBadge seatsLeft={seatsLeft} totalSeats={yatra.totalSeats} />
        </div>

        <div className="py-3 border-y border-amber-200/12 my-3">
          <p className="text-xs text-amber-200/40">Starting from</p>
          <p className="text-3xl font-bold text-amber-50 leading-tight">{formatCurrency(yatra.price?.amount, yatra.price?.currency)}</p>
          <p className="text-xs text-amber-200/40">{yatra.price?.unit || "per person"}</p>
          {yatra.price?.advanceAmount ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 border border-amber-300/25 px-2.5 py-1 text-[11px] text-amber-100">
              Reserve with {formatCurrency(yatra.price.advanceAmount, yatra.price.currency)} / seat
            </div>
          ) : null}
        </div>

        <Row icon="📍" label="Departure from" value={yatra.startingPoint} />
        <Row icon="🗓" label="Departure dates" value={dates || "To be announced"} />
        <Row icon="⏱" label="Duration" value={durationLabel(yatra.durationDays, yatra.durationNights)} />
        <Row icon="🚌" label="Travel" value={yatra.vehicleType} />
        <Row icon="🕗" label="Reporting / Departure" value={[yatra.reportingTime, yatra.departureTime].filter(Boolean).join(" · ")} />

        <div className="pt-4 space-y-2">
          {soldOut ? (
            <button disabled className={`${btnPrimary} w-full opacity-50 cursor-not-allowed`}>
              {yatra.status !== "published" ? "Booking closed" : "Sold out"}
            </button>
          ) : (
            <Link to={`/events/${yatra.slug}/book`} className={`${btnPrimary} w-full`}>
              Reserve Your Seat
            </Link>
          )}
          {yatra.brochurePdfUrl ? (
            <a href={yatra.brochurePdfUrl} download target="_blank" rel="noopener noreferrer" className={`${btnSecondary} w-full`}>
              Download Brochure
            </a>
          ) : null}
        </div>

        <p className="text-center text-[11px] text-amber-200/40 mt-3">
          Free to hold seats now · pay advance after
        </p>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-amber-200/12 bg-amber-400/[0.04] py-2.5 text-sm text-amber-50/80 hover:bg-amber-400/[0.08] transition-colors"
        >
          💬 Ask a question on WhatsApp
        </a>
      </div>
    </div>
  );
}
