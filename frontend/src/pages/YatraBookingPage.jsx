import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../AuthContext";
import useDocumentMeta from "../lib/useDocumentMeta";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { btnAccent, btnSecondary, inputCls } from "../lib/theme";
import { formatCurrency, formatDate, nextDeparture } from "../lib/format";
import BookingStepper from "../components/yatra/BookingStepper";
import FareBox from "../components/yatra/FareBox";
import SeatMap from "../components/yatra/SeatMap";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918252224027";
const phoneOk = (p) => /^(\+?[1-9]\d{0,3})?[\s-]?\d{10}$/.test(String(p).trim().replace(/[\s-]/g, ""));

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = resolve;
  script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
  document.body.appendChild(script);
});

export default function YatraBookingPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { openLogin } = useOutletContext();
  const { t } = useLanguage();
  const STEPS = [t("booking.stepTraveller"), t("booking.stepPayment"), t("booking.stepConfirmed")];
  const [yatra, setYatra] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ travelerName: "", phone: "", email: "", city: "", pickupPoint: "", fareVariant: "" });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState(null);
  const [serverClockOffset, setServerClockOffset] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [reservationExpired, setReservationExpired] = useState(false);
  const [activeHold, setActiveHold] = useState(null);
  const holdStorageKey = `parthrahi:yatra-hold:${slug}`;

  useDocumentMeta({ title: yatra ? `Book — ${yatra.title}` : "Book your seat" });

  const refreshSeats = () => api.get(`/api/bookings/availability/${slug}`).then((res) => setAvailability(res.data));
  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/api/yatras/${slug}`), api.get(`/api/bookings/availability/${slug}`)])
      .then(([yatraRes, seatsRes]) => {
        if (!active) return;
        const loaded = yatraRes.data.yatra;
        setYatra(loaded); setAvailability(seatsRes.data);
        setForm((current) => ({ ...current, fareVariant: loaded.price?.variants?.[0]?.label || "", pickupPoint: loaded.startingPoint || "" }));
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    const timer = setInterval(() => { if (active) api.get(`/api/bookings/availability/${slug}`).then((res) => setAvailability(res.data)).catch(() => {}); }, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({ ...current, travelerName: current.travelerName || user.name || "", phone: current.phone || user.phone || "", email: current.email || user.email || "" }));
    if (selectedSeats.length) {
      api.get(`/api/bookings/availability/${slug}`).then((res) => {
        setAvailability(res.data);
        const states = Object.fromEntries((res.data.seats || []).map((seat) => [seat.seatId, seat.state]));
        const unavailable = selectedSeats.filter((seatId) => states[seatId] !== "available");
        if (unavailable.length) {
          setSelectedSeats((current) => current.filter((seatId) => !unavailable.includes(seatId)));
          setServerError(`Sorry, seat${unavailable.length > 1 ? "s" : ""} ${unavailable.join(", ")} is no longer available. Please select another seat.`);
        }
      }).catch(() => {});
    }
  }, [user, selectedSeats, slug]);

  useEffect(() => {
    if (!user || activeHold) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(holdStorageKey) || "null");
      if (!saved?.booking?.bookingReference || !saved.holdToken || !saved.expiresAt) return;
      const expiresAt = Date.parse(saved.expiresAt);
      const serverNow = Date.parse(saved.serverNow || saved.expiresAt);
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() + (serverNow - Date.now())) {
        sessionStorage.removeItem(holdStorageKey);
        return;
      }
      setActiveHold(saved);
      setSelectedSeats(saved.booking.seatIds || []);
      setReservationExpiresAt(expiresAt);
      setServerClockOffset(Number.isFinite(serverNow) ? serverNow - Date.now() : 0);
      setStep(2);
    } catch {
      sessionStorage.removeItem(holdStorageKey);
    }
  }, [user, activeHold, holdStorageKey]);

  useEffect(() => {
    if (!reservationExpiresAt) {
      setRemainingSeconds(null);
      return undefined;
    }

    const updateRemaining = () => {
      const seconds = Math.max(0, Math.ceil((reservationExpiresAt - (Date.now() + serverClockOffset)) / 1000));
      setRemainingSeconds(seconds);
      if (seconds === 0) {
        setReservationExpiresAt(null);
        setActiveHold(null);
        sessionStorage.removeItem(holdStorageKey);
        setReservationExpired(true);
        setSelectedSeats([]);
        setStep(1);
        setServerError("Your seat reservation has expired. The 5-minute reservation period has ended. These seats may now be available to other users. Please select seats again.");
        api.get(`/api/bookings/availability/${slug}`).then((res) => setAvailability(res.data)).catch(() => {});
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [reservationExpiresAt, serverClockOffset, slug, holdStorageKey]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const unitPrice = useMemo(() => yatra?.price?.variants?.find((item) => item.label === form.fareVariant)?.amount ?? yatra?.price?.amount ?? 0, [yatra, form.fareVariant]);
  const totalAmount = unitPrice * selectedSeats.length;
  const dueNow = (yatra?.price?.advanceAmount || 0) * selectedSeats.length || totalAmount;
  const seatStates = Object.fromEntries((availability?.seats || []).map((seat) => [seat.seatId, seat.state]));
  const countdownLabel = remainingSeconds == null
    ? ""
    : `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const validateStep1 = () => {
    if (!user) {
      setServerError("Please log in or create an account before reserving a seat.");
      openLogin();
      return false;
    }
    const next = {};
    if (!form.travelerName.trim()) next.travelerName = t("booking.errTravellerName");
    if (!phoneOk(form.phone)) next.phone = t("booking.errPhone");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = t("booking.errEmail");
    if (!selectedSeats.length) next.seats = "Please select at least one available seat.";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const createSeatHold = async () => {
    const hold = await api.post("/api/bookings/lock", { yatraSlug: slug, seatIds: selectedSeats, ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim ? value.trim() : value])), });
    const { booking, holdToken, expiresAt, serverNow } = hold.data;
    const expiration = Date.parse(expiresAt);
    setReservationExpiresAt(expiration);
    setServerClockOffset(Date.parse(serverNow) - Date.now());
    setReservationExpired(false);
    const savedHold = { booking, holdToken, expiresAt, serverNow };
    setActiveHold(savedHold);
    sessionStorage.setItem(holdStorageKey, JSON.stringify(savedHold));
  };

  const goToPayment = async () => {
    if (!validateStep1()) return;
    setSubmitting(true);
    setServerError("");
    try {
      await createSeatHold();
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSelectedSeats([]);
      setServerError(error.message);
      refreshSeats().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const beginPayment = async () => {
    setSubmitting(true); setServerError("");
    let holdCreated = false;
    try {
      let booking;
      let holdToken;
      let orderRes;
      if (activeHold && remainingSeconds > 0) {
        ({ booking, holdToken } = activeHold);
        if (activeHold.order?.orderId) orderRes = { data: activeHold.order };
        holdCreated = true;
      } else {
        await createSeatHold();
        ({ booking, holdToken } = JSON.parse(sessionStorage.getItem(holdStorageKey)));
        holdCreated = true;
      }
      if (!orderRes) {
        try {
          orderRes = await api.post("/api/bookings/order", { bookingReference: booking.bookingReference, holdToken });
        } catch (error) {
          setSelectedSeats([]);
          setActiveHold(null);
          setReservationExpiresAt(null);
          sessionStorage.removeItem(holdStorageKey);
          await refreshSeats().catch(() => {});
          throw error;
        }
        const currentHold = JSON.parse(sessionStorage.getItem(holdStorageKey) || "{}");
        const savedHold = { ...currentHold, booking, holdToken, order: orderRes.data };
        setActiveHold(savedHold);
        sessionStorage.setItem(holdStorageKey, JSON.stringify(savedHold));
      }
      await loadRazorpay();
      const payment = new window.Razorpay({
        key: orderRes.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "ParthRahi",
        description: yatra.title,
        order_id: orderRes.data.orderId,
        prefill: { name: form.travelerName, email: form.email, contact: form.phone },
        theme: { color: "#f6c453" },
        handler: async (response) => {
          try {
            const verified = await api.post("/api/bookings/verify", { bookingReference: booking.bookingReference, holdToken, ...response });
            sessionStorage.removeItem(holdStorageKey);
            setActiveHold(null); setReservationExpiresAt(null);
            setConfirmation(verified.data.booking); setStep(3); window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (error) { setServerError(error.message); }
          finally { setSubmitting(false); }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      payment.open();
    } catch (error) {
      setServerError(holdCreated && error.message.includes("seat hold has been released")
        ? error.message
        : error.message);
      setSubmitting(false);
      if (!holdCreated) {
        setSelectedSeats([]);
        refreshSeats().catch(() => {});
      }
    }
  };

  if (loading) return <div className="yatra-experience min-h-screen flex items-center justify-center pt-24"><div className="w-10 h-10 rounded-full border-2 border-amber-200/20 border-t-amber-300 animate-spin" /></div>;
  if (loadError || !yatra) return <div className="min-h-screen flex flex-col items-center justify-center gap-3 pt-24 px-6 text-center"><p className="text-2xl font-semibold text-amber-50">{t("booking.unableToLoad")}</p><Link to="/events" className={btnSecondary}>{t("booking.backToAll")}</Link></div>;

  return <div className="relative z-10 yatra-experience pt-48 md:pt-56 pb-20 px-4 sm:px-6 md:px-16">
    <div className="max-w-3xl mx-auto">
      <nav className="text-xs text-amber-200/40 mb-4"><Link to="/events" className="hover:text-amber-200/70">{t("booking.yatras")}</Link><span className="mx-1.5">/</span><Link to={`/events/${yatra.slug}`} className="hover:text-amber-200/70">{yatra.title}</Link><span className="mx-1.5">/</span><span className="text-amber-100/60">{t("booking.book")}</span></nav>
      <h1 className="text-2xl md:text-3xl font-bold text-amber-50 mb-4">🪔 {t("booking.reserveSeat")}</h1>
      <div className="flex items-center gap-4 rounded-2xl border border-amber-200/12 bg-[#160f06]/70 p-3 sm:p-4 mb-5 overflow-hidden">{yatra.heroImages?.[0] && <img src={yatra.heroImages[0]} alt="" className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0" />}<div className="min-w-0"><p className="text-sm sm:text-base font-semibold text-amber-50 leading-tight truncate">{yatra.title}</p><p className="text-xs text-amber-100/50 mt-1">{nextDeparture(yatra.departureDates) ? `🗓 ${formatDate(nextDeparture(yatra.departureDates))}` : t("booking.tbaDates")}{yatra.startingPoint ? ` · 📍 ${yatra.startingPoint}` : ""}</p><p className="text-xs text-amber-300/80 mt-0.5">{availability?.seats?.filter((seat) => seat.state === "available").length ?? yatra.seatsLeft} {t("booking.seatsLeft")}</p></div></div>
      <div className="rounded-2xl border border-amber-200/15 bg-[#160f06]/85 p-5 sm:p-7 space-y-6"><BookingStepper step={step} steps={STEPS} />
        {step === 1 && <div className="space-y-4"><p className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">{t("booking.travellerDetailsLabel")}</p>{reservationExpired && <div className="rounded-xl border border-red-300/25 bg-red-400/6 p-4 text-sm text-red-100"><p className="font-semibold">Your seat reservation has expired.</p><p className="mt-1 text-red-100/75">The 5-minute reservation period has ended. Please select seats again to continue.</p><button type="button" onClick={() => { setReservationExpired(false); setServerError(""); refreshSeats().catch(() => {}); }} className="mt-3 text-red-100 underline underline-offset-2">Choose Seats Again</button></div>}<div className="grid sm:grid-cols-2 gap-3"><div className="space-y-1 sm:col-span-2"><input className={inputCls(errors.travelerName)} placeholder={t("booking.leadTravellerName")} value={form.travelerName} onChange={set("travelerName")} />{errors.travelerName && <p className="text-red-400 text-xs">{errors.travelerName}</p>}</div><div className="space-y-1"><input className={inputCls(errors.phone)} placeholder={t("booking.mobileNumber")} inputMode="tel" value={form.phone} onChange={set("phone")} />{errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}</div><div className="space-y-1"><input className={inputCls(errors.email)} placeholder={t("booking.emailOptional")} type="email" value={form.email} onChange={set("email")} />{errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}</div><input className={inputCls(false)} placeholder={t("booking.cityOptional")} value={form.city} onChange={set("city")} /><input className={inputCls(false)} placeholder={t("booking.pickupPoint")} value={form.pickupPoint} onChange={set("pickupPoint")} /></div>{yatra.price?.variants?.length > 1 && <FareBox price={yatra.price} selectedVariant={form.fareVariant} onSelectVariant={(label) => setForm((current) => ({ ...current, fareVariant: label }))} />}<div className="space-y-2"><p className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">Choose your seats</p><SeatMap layout={availability?.layout} states={seatStates} selected={selectedSeats} onChange={(nextSeats) => { if (activeHold) return; setSelectedSeats(nextSeats); setReservationExpired(false); setServerError(""); }} />{errors.seats && <p className="text-red-400 text-xs">{errors.seats}</p>}</div>{serverError && <p className="text-red-400 text-sm">{serverError}</p>}<div className="rounded-xl bg-amber-400/[0.04] border border-amber-200/12 p-4 text-sm space-y-1.5"><div className="flex items-center justify-between text-amber-100/70"><span>{t("booking.totalFare", { seats: selectedSeats.length, unit: formatCurrency(unitPrice) })}</span><span className="text-amber-50 font-semibold">{formatCurrency(totalAmount)}</span></div><div className="flex items-center justify-between text-amber-100 border-t border-amber-200/12 pt-1.5"><span>{yatra.price?.advanceAmount ? t("booking.payNowReserveAdvance") : t("booking.payNowReserve")}</span><span className="font-semibold">{formatCurrency(dueNow)}</span></div></div><button onClick={goToPayment} disabled={submitting || Boolean(activeHold)} className={`${btnAccent} w-full`}>{submitting ? "Reserving seats…" : t("booking.continueToPayment")}</button></div>}
        {step === 2 && <div className="space-y-4"><p className="text-amber-200/70 text-xs uppercase tracking-[0.18em]">{t("booking.paymentLabel")}</p>{remainingSeconds != null && <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-4 text-center"><p className="text-sm text-amber-100">Your selected seats are temporarily reserved for you. Please complete your payment within the remaining time to confirm your seats.</p><p className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-200/60">Reservation expires in</p><p className="mt-1 text-4xl font-semibold tabular-nums text-amber-200">{countdownLabel}</p><p className="mt-2 text-xs text-amber-100/55">If the reservation expires before payment is completed, the seats will be released and may become available to other users.</p></div>}<div className="rounded-xl border border-amber-200/12 bg-amber-400/[0.04] p-4 space-y-2 text-sm"><div className="flex justify-between text-amber-100/70"><span>{t("booking.traveller")}</span><span className="text-amber-50">{form.travelerName}</span></div><div className="flex justify-between text-amber-100/70"><span>{t("booking.seats")}</span><span className="text-amber-50">{selectedSeats.join(", ")}</span></div><div className="flex justify-between text-amber-100/70"><span>{t("booking.totalFareLabel")}</span><span className="text-amber-50">{formatCurrency(totalAmount)}</span></div><div className="flex justify-between border-t border-amber-200/12 pt-2 text-amber-100 font-semibold"><span>{t("booking.amountDueNow")}</span><span>{formatCurrency(dueNow)}</span></div></div>{serverError && <p className="text-red-400 text-sm">{serverError}</p>}<div className="flex gap-3"><button onClick={() => setStep(1)} className={`${btnSecondary} flex-1`}>{t("booking.back")}</button><button onClick={beginPayment} disabled={submitting || (remainingSeconds != null && remainingSeconds <= 0)} className={`${btnAccent} flex-1`}>{submitting ? "Opening secure checkout…" : "Pay securely"}</button></div><p className="text-center text-amber-200/40 text-[11px]">Payment is verified securely by ParthRahi before seats are confirmed.</p></div>}
        {step === 3 && confirmation && <div className="text-center space-y-4 py-4"><p className="text-4xl">🙏</p><h2 className="text-xl font-bold text-amber-50">Booking confirmed</h2><p className="text-amber-100/60 text-sm">Your payment was verified and your seats are now booked.</p><div className="inline-block rounded-xl border border-amber-300/25 bg-amber-400/[0.06] px-6 py-3"><p className="text-[10px] uppercase tracking-widest text-amber-200/40">{t("booking.bookingReference")}</p><p className="text-2xl font-bold text-amber-200 tracking-wider select-all">{confirmation.bookingReference}</p></div><div className="text-sm text-amber-100/70 max-w-sm mx-auto space-y-1 text-left rounded-xl border border-amber-200/12 bg-amber-400/[0.03] p-4"><div className="flex justify-between"><span>{t("booking.yatra")}</span><span className="text-amber-50">{confirmation.yatra?.title}</span></div><div className="flex justify-between"><span>{t("booking.seats")}</span><span className="text-amber-50">{confirmation.seatIds?.join(", ")}</span></div><div className="flex justify-between"><span>{t("booking.totalFareLabel")}</span><span className="text-amber-50">{formatCurrency(confirmation.totalAmount)}</span></div><div className="flex justify-between"><span>{t("booking.status")}</span><span className="text-green-300 capitalize">{confirmation.bookingStatus}</span></div></div><div className="flex flex-col sm:flex-row gap-3 justify-center pt-2"><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi ParthRahi, my confirmed booking is ${confirmation.bookingReference}. Yatra: ${confirmation.yatra?.title}. Traveller: ${confirmation.travelerName}. Seats: ${confirmation.seatIds?.join(", ")}. Amount: ₹${confirmation.totalAmount}. Payment: ${confirmation.razorpayPaymentId || "verified"}.`)}`} target="_blank" rel="noopener noreferrer" className={btnAccent}>💬 Send confirmation on WhatsApp</a><Link to={`/events/${slug}`} className={btnSecondary}>{t("booking.backToYatra")}</Link></div></div>}
      </div>
    </div>
  </div>;
}