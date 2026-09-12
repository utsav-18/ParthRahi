import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";
import useDocumentMeta from "../../lib/useDocumentMeta";
import { formatCurrency, formatDate } from "../../lib/format";
import AdminShell, { adminInput } from "./AdminShell";
import { ADMIN_BASE } from "../../lib/adminPath";

const PAYMENT = ["pending", "partial", "paid"];
const BOOKING = ["pending", "confirmed", "cancelled"];

export default function AdminBookingsPage() {
  const { id } = useParams();
  const [bookings, setBookings] = useState([]);
  const [yatra, setYatra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useDocumentMeta({ title: "Admin — Bookings" });

  const load = () => {
    setLoading(true);
    api
      .get(`/api/admin/yatras/${id}/bookings`)
      .then((res) => {
        setBookings(res.data.bookings || []);
        setYatra(res.data.yatra);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const patch = async (bookingId, body) => {
    setSavingId(bookingId);
    try {
      await api.patch(`/api/admin/bookings/${bookingId}`, body);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminShell
      title={yatra ? `Bookings — ${yatra.title}` : "Bookings"}
      back={{ to: `${ADMIN_BASE}/events`, label: "Yatras" }}
    >
      {yatra && (
        <p className="text-white/50 text-sm mb-4">
          Seats: <span className="text-white">{yatra.seatsBooked} / {yatra.totalSeats}</span> reserved ·{" "}
          {bookings.length} booking record(s)
        </p>
      )}

      {loading ? (
        <p className="text-white/50 py-10">Loading…</p>
      ) : error ? (
        <p className="text-red-400 py-10">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="text-white/50 py-10">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[1050px]">
            <thead className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-3">Ref / Date</th>
                <th className="text-left px-3 py-3">Traveller</th>
                <th className="text-left px-3 py-3">Seats</th>
                <th className="text-left px-3 py-3">Amount</th>
                <th className="text-left px-3 py-3">Payment</th>
                <th className="text-left px-3 py-3">Razorpay</th>
                <th className="text-left px-3 py-3">Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {bookings.map((b) => (
                <tr key={b._id} className={`hover:bg-white/[0.02] ${savingId === b._id ? "opacity-50" : ""}`}>
                  <td className="px-3 py-3">
                    <p className="text-cyan-200 font-mono text-xs">{b.bookingReference}</p>
                    <p className="text-white/40 text-xs">{formatDate(b.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-white">{b.travelerName}</p>
                    <p className="text-white/40 text-xs">{b.phone}{b.city ? ` · ${b.city}` : ""}</p>
                    <p className="text-white/30 text-xs">{b.email || "No email"}</p>
                  </td>
                  <td className="px-3 py-3 text-white/70">{b.seatIds?.length ? b.seatIds.join(", ") : "Legacy booking — seat information unavailable"}{b.fareVariant ? ` · ${b.fareVariant}` : ""}</td>
                  <td className="px-3 py-3 text-white/70">
                    {formatCurrency(b.totalAmount)}
                    <span className="block text-white/40 text-xs">adv {formatCurrency(b.advanceAmount)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className={`${adminInput} !py-1 text-xs`}
                      value={b.paymentStatus}
                      onChange={(e) => patch(b._id, { paymentStatus: e.target.value })}
                    >
                      {PAYMENT.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-white/40 text-xs font-mono">{b.razorpayPaymentId || b.paymentReferenceId || "—"}<span className="block">{b.razorpayOrderId || "—"}</span></td>
                  <td className="px-3 py-3">
                    <select
                      className={`${adminInput} !py-1 text-xs`}
                      value={b.bookingStatus}
                      onChange={(e) => patch(b._id, { bookingStatus: e.target.value })}
                    >
                      {BOOKING.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-white/30 text-xs mt-3">
        Setting a booking to <b>cancelled</b> releases its seats back to the pool.
      </p>
    </AdminShell>
  );
}
