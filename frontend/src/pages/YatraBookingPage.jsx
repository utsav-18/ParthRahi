import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../AuthContext";
import useDocumentMeta from "../lib/useDocumentMeta";
import { btnAccent, btnSecondary, inputCls } from "../lib/theme";
import { formatCurrency, formatDate, nextDeparture } from "../lib/format";
import BookingStepper from "../components/yatra/BookingStepper";
import FareBox from "../components/yatra/FareBox";

const STEPS = ["Traveller details", "Payment", "Confirmed"];

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";
const phoneOk = (p) => /^(\+?[1-9]\d{0,3})?[\s-]?\d{10}$/.test(String(p).trim().replace(/[\s-]/g, ""));

export default function YatraBookingPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [yatra, setYatra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    travelerName: "",
    phone: "",
    email: "",
    city: "",
    pickupPoint: "",
    numberOfSeats: 1,
    fareVariant: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useDocumentMeta({ title: yatra ? `Book — ${yatra.title}` : "Book your seat" });

  useEffect(() => {
    let active = true;
    api
      .get(`/api/yatras/${slug}`)
      .then((res) => {
        if (!active) return;
        const y = res.data.yatra;
        setYatra(y);
        setForm((f) => ({
          ...f,
          fareVariant: y.price?.variants?.[0]?.label || "",
          pickupPoint: y.startingPoint || "",
        }));
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      travelerName: f.travelerName || user.name || "",
      phone: f.phone || user.phone || "",
      email: f.email || user.email || "",
    }));
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const unitPrice = useMemo(() => {
    if (!yatra) return 0;
    const v = yatra.price?.variants?.find((x) => x.label === form.fareVariant);
    return v?.amount ?? yatra.price?.amount ?? 0;
  }, [yatra, form.fareVariant]);

  const seats = Math.max(1, parseInt(form.numberOfSeats, 10) || 1);
  const totalAmount = unitPrice * seats;
  const advanceAmount = (yatra?.price?.advanceAmount || 0) * seats;
  const dueNow = advanceAmount || totalAmount;

  const seatsLeft = yatra
    ? yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0))
    : 0;

  const validateStep1 = () => {
    const errs = {};
    if (!form.travelerName.trim()) errs.travelerName = "Enter the lead traveller's name";
    if (!phoneOk(form.phone)) errs.phone = "Enter a valid 10-digit mobile number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (seats < 1 || seats > 20) errs.numberOfSeats = "Seats must be between 1 and 20";
    if (seats > seatsLeft) errs.numberOfSeats = `Only ${seatsLeft} seat(s) left`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToPayment = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const whatsappMessage = yatra
    ? `*ParthRahi Yatra — Booking*%0A%0AYatra: ${yatra.title}%0ATraveller: ${form.travelerName}%0APhone: ${form.phone}%0ASeats: ${seats}${form.fareVariant ? `%0AFare: ${form.fareVariant}` : ""}%0ATotal: ₹${totalAmount}%0AAdvance to pay: ₹${dueNow}`
    : "";

  const reserve = async () => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await api.post("/api/bookings", {
        yatraSlug: slug,
        travelerName: form.travelerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        city: form.city.trim() || undefined,
        pickupPoint: form.pickupPoint.trim() || undefined,
        numberOfSeats: seats,
        fareVariant: form.fareVariant || undefined,
      });
      setConfirmation(res.data.booking);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-10 h-10 rounded-full border-2 border-amber-200/20 border-t-amber-300 animate-spin" />
      </div>
    );
  }

  if (loadError || !yatra) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 pt-24 px-6 text-center">
        <p className="text-2xl font-semibold text-amber-50">Unable to load this yatra</p>
        <Link to="/events" className={btnSecondary}>Back to all yatras</Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-24 md:pt-28 pb-20 px-4 sm:px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-amber-200/40 mb-4">
          <Link to="/events" className="hover:text-amber-200/70">Yatras</Link>
          <span className="mx-1.5">/</span>
          <Link to={`/events/${yatra.slug}`} className="hover:text-amber-200/70">{yatra.title}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-amber-100/60">Book</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-amber-50 mb-4">🪔 Reserve your seat</h1>

        {/* Trip summary header */}
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200/12 bg-[#160f06]/70 p-3 sm:p-4 mb-5 overflow-hidden">
          {yatra.heroImages?.[0] && (
            <img src={yatra.heroImages[0]} alt="" className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-amber-50 leading-tight truncate">{yatra.title}</p>
            <p className="text-xs text-amber-100/50 mt-1">
              {nextDeparture(yatra.departureDates) ? `🗓 ${formatDate(nextDeparture(yatra.departureDates))}` : "Dates to be announced"}
              {yatra.startingPoint ? ` · 📍 ${yatra.startingPoint}` : ""}
            </p>
            <p className="text-xs text-amber-300/80 mt-0.5">{seatsLeft} seat(s) left</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/15 bg-[#160f06]/85 p-5 sm:p-7 space-y-6">
          <BookingStepper step={step} steps={STEPS} />

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">Traveller Details</p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <input className={inputCls(errors.travelerName)} placeholder="Lead traveller full name *" value={form.travelerName} onChange={set("travelerName")} />
                  {errors.travelerName && <p className="text-red-400 text-xs">{errors.travelerName}</p>}
                </div>
                <div className="space-y-1">
                  <input className={inputCls(errors.phone)} placeholder="Mobile number *" inputMode="tel" value={form.phone} onChange={set("phone")} />
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
                </div>
                <div className="space-y-1">
                  <input className={inputCls(errors.email)} placeholder="Email (optional)" type="email" value={form.email} onChange={set("email")} />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>
                <input className={inputCls(false)} placeholder="City (optional)" value={form.city} onChange={set("city")} />
                <input className={inputCls(false)} placeholder="Pickup point" value={form.pickupPoint} onChange={set("pickupPoint")} />
              </div>

              {yatra.price?.variants?.length > 1 && (
                <div className="space-y-2">
                  <p className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">Choose fare</p>
                  <FareBox price={yatra.price} selectedVariant={form.fareVariant} onSelectVariant={(l) => setForm((f) => ({ ...f, fareVariant: l }))} />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">Number of seats</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, numberOfSeats: Math.max(1, seats - 1) }))} className="w-9 h-9 rounded-lg border border-amber-200/18 text-amber-50 text-lg cursor-pointer hover:bg-amber-400/10">−</button>
                  <span className="text-amber-50 font-semibold w-8 text-center">{seats}</span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, numberOfSeats: Math.min(20, seats + 1) }))} className="w-9 h-9 rounded-lg border border-amber-200/18 text-amber-50 text-lg cursor-pointer hover:bg-amber-400/10">+</button>
                  <span className="text-amber-200/40 text-xs ml-2">{seatsLeft} seat(s) left</span>
                </div>
                {errors.numberOfSeats && <p className="text-red-400 text-xs">{errors.numberOfSeats}</p>}
              </div>

              <div className="rounded-xl bg-amber-400/[0.04] border border-amber-200/12 p-4 text-sm space-y-1.5">
                <div className="flex items-center justify-between text-amber-100/70">
                  <span>Total fare ({seats} × {formatCurrency(unitPrice)})</span>
                  <span className="text-amber-50 font-semibold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-100 border-t border-amber-200/12 pt-1.5">
                  <span>{advanceAmount ? "Pay now to reserve (advance)" : "Pay now to reserve"}</span>
                  <span className="font-semibold">{formatCurrency(dueNow)}</span>
                </div>
              </div>

              <button onClick={goToPayment} className={`${btnAccent} w-full`}>Continue to Payment</button>
              <p className="text-center text-amber-200/40 text-[11px]">
                Next you'll see how to pay. Nothing is charged automatically — you pay us directly over UPI or WhatsApp.
              </p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">Payment</p>

              <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2.5 text-sm text-amber-100">
                Review your booking below. The moment you tap <b>Confirm Reservation</b>, {seats} seat(s) are held in your name — then you pay the advance.
              </div>

              <div className="rounded-xl border border-amber-200/12 bg-amber-400/[0.04] p-4 space-y-2 text-sm">
                <div className="flex justify-between text-amber-100/70"><span>Traveller</span><span className="text-amber-50">{form.travelerName}</span></div>
                <div className="flex justify-between text-amber-100/70"><span>Seats</span><span className="text-amber-50">{seats}{form.fareVariant ? ` · ${form.fareVariant}` : ""}</span></div>
                <div className="flex justify-between text-amber-100/70"><span>Total fare</span><span className="text-amber-50">{formatCurrency(totalAmount)}</span></div>
                <div className="flex justify-between border-t border-amber-200/12 pt-2 text-amber-100 font-semibold">
                  <span>{advanceAmount ? "Advance due now" : "Amount due now"}</span>
                  <span>{formatCurrency(dueNow)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/80 space-y-2">
                <p className="font-medium text-amber-100">How to pay</p>
                {import.meta.env.VITE_UPI_ID ? (
                  <p>Pay <b>{formatCurrency(dueNow)}</b> to UPI ID <b className="select-all">{import.meta.env.VITE_UPI_ID}</b>, then confirm below.</p>
                ) : (
                  <p>Confirm your reservation below, then complete the advance payment over WhatsApp with our team. Your seats are held for you meanwhile.</p>
                )}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-200 font-medium hover:underline"
                >
                  💬 Message us on WhatsApp
                </a>
              </div>

              {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className={`${btnSecondary} flex-1`}>Back</button>
                <button onClick={reserve} disabled={submitting} className={`${btnAccent} flex-1`}>
                  {submitting ? "Reserving…" : "Confirm Reservation"}
                </button>
              </div>
              <p className="text-center text-amber-200/40 text-[11px]">
                Confirming holds your seats. Booking is finalised once the advance payment is received.
              </p>
            </div>
          )}

          {/* STEP 3 — confirmation */}
          {step === 3 && confirmation && (
            <div className="text-center space-y-4 py-4">
              <p className="text-4xl">🙏</p>
              <h2 className="text-xl font-bold text-amber-50">Seats reserved!</h2>
              <p className="text-amber-100/60 text-sm">Keep this reference for all communication with our team.</p>

              <div className="inline-block rounded-xl border border-amber-300/25 bg-amber-400/[0.06] px-6 py-3">
                <p className="text-[10px] uppercase tracking-widest text-amber-200/40">Booking reference</p>
                <p className="text-2xl font-bold text-amber-200 tracking-wider select-all">{confirmation.bookingReference}</p>
              </div>

              <div className="text-sm text-amber-100/70 max-w-sm mx-auto space-y-1 text-left rounded-xl border border-amber-200/12 bg-amber-400/[0.03] p-4">
                <div className="flex justify-between"><span>Yatra</span><span className="text-amber-50">{confirmation.yatra?.title}</span></div>
                <div className="flex justify-between"><span>Seats</span><span className="text-amber-50">{confirmation.numberOfSeats}</span></div>
                <div className="flex justify-between"><span>Total fare</span><span className="text-amber-50">{formatCurrency(confirmation.totalAmount)}</span></div>
                <div className="flex justify-between"><span>Advance due</span><span className="text-amber-50">{formatCurrency(confirmation.advanceAmount || confirmation.totalAmount)}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="text-orange-300 capitalize">{confirmation.bookingStatus}</span></div>
              </div>

              <div className="max-w-sm mx-auto text-left rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4">
                <p className="text-amber-100 font-medium text-sm mb-2">What happens next</p>
                <ol className="space-y-1.5 text-sm text-amber-100/70">
                  <li>1. Pay the advance over WhatsApp / UPI using the button below.</li>
                  <li>2. Our team verifies payment and marks your booking <span className="text-amber-50">confirmed</span>.</li>
                  <li>3. You get the pickup point, reporting time and packing list on WhatsApp.</li>
                  <li>4. Pay the balance before departure — the tour manager takes it from there.</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi ParthRahi, I've reserved seats for ${confirmation.yatra?.title}. Booking ref: ${confirmation.bookingReference}. I'd like to complete the advance payment.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnAccent}
                >
                  💬 Pay advance on WhatsApp
                </a>
                <Link to={`/events/${slug}`} className={btnSecondary}>Back to yatra</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
