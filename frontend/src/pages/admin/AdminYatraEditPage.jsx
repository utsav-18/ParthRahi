import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import useDocumentMeta from "../../lib/useDocumentMeta";
import AdminShell, { adminBtnPrimary, adminBtnGhost, adminInput } from "./AdminShell";
import { ADMIN_BASE } from "../../lib/adminPath";

const EMPTY = {
  title: "", slug: "", tagline: "", category: "bus",
  heroImages: [], route: [], startingPoint: "",
  seatLayout: [],
  departureDates: [], durationDays: "", durationNights: "",
  vehicleType: "", totalSeats: "", reportingTime: "", departureTime: "",
  price: { amount: "", currency: "INR", unit: "per person", advanceAmount: "", variants: [] },
  quickInclusions: [], itinerary: [],
  highlights: [], mapImageUrl: "",
  inclusions: [], exclusions: [], importantNotes: [],
  rulesAndFacilities: [], termsAndConditions: [], freebies: [], faqs: [],
  brochurePdfUrl: "", status: "draft", metaTitle: "", metaDescription: "",
};

const looksLikeImage = (s) => /^(https?:\/\/|\/).+\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(String(s || "").trim());

const Field = ({ label, children, hint }) => (
  <label className="block space-y-1">
    <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-white/30">{hint}</span>}
  </label>
);

// Editor for a list of plain strings. `withThumb` shows an image preview per row.
function StringList({ label, items, onChange, placeholder, withThumb }) {
  return (
    <div className="space-y-2">
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      {items.map((val, i) => (
        <div key={i} className="flex gap-2 items-start">
          {withThumb && looksLikeImage(val) && (
            <img src={val} alt="" className="w-14 h-11 rounded object-cover border border-white/10 shrink-0" />
          )}
          <input
            className={adminInput}
            value={val}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-2 py-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add</button>
    </div>
  );
}

// Editor for a list of { q, a } objects
function FaqList({ items, onChange }) {
  const upd = (i, patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      <span className="text-xs uppercase tracking-wide text-white/50">FAQs (question + answer) — leave empty to use the default set</span>
      {items.map((f, i) => (
        <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
          <div className="flex gap-2">
            <input className={adminInput} placeholder="Question" value={f.q || ""} onChange={(e) => upd(i, { q: e.target.value })} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">✕</button>
          </div>
          <textarea className={`${adminInput} min-h-[64px]`} placeholder="Answer" value={f.a || ""} onChange={(e) => upd(i, { a: e.target.value })} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { q: "", a: "" }])} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add FAQ</button>
    </div>
  );
}

export default function AdminYatraEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useDocumentMeta({ title: isNew ? "Admin — New Yatra" : "Admin — Edit Yatra" });

  useEffect(() => {
    if (isNew) return;
    api
      .get(`/api/admin/yatras/${id}`)
      .then((res) => {
        const y = res.data.yatra;
        setForm({
          ...EMPTY,
          ...y,
          price: { ...EMPTY.price, ...(y.price || {}) },
          departureDates: (y.departureDates || []).map((d) => new Date(d).toISOString().slice(0, 10)),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setPrice = (patch) => setForm((f) => ({ ...f, price: { ...f.price, ...patch } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      durationDays: form.durationDays === "" ? undefined : Number(form.durationDays),
      durationNights: form.durationNights === "" ? undefined : Number(form.durationNights),
      totalSeats: Number(form.totalSeats),
      departureDates: form.departureDates.filter(Boolean).map((d) => new Date(d).toISOString()),
      highlights: (form.highlights || []).filter((s) => s && s.trim()),
      faqs: (form.faqs || []).filter((f) => f && f.q && f.q.trim() && f.a && f.a.trim()),
      price: {
        ...form.price,
        amount: Number(form.price.amount),
        advanceAmount: form.price.advanceAmount === "" ? undefined : Number(form.price.advanceAmount),
        variants: (form.price.variants || []).map((v) => ({ label: v.label, amount: Number(v.amount) })),
      },
      seatLayout: (form.seatLayout || []).filter((seat) => seat.seatId && seat.label).map((seat) => ({ ...seat, row: Number(seat.row), column: Number(seat.column), type: seat.type || "seat" })),
    };
    try {
      if (isNew) {
        const res = await api.post("/api/admin/yatras", payload);
        navigate(`${ADMIN_BASE}/events/${res.data.yatra._id}`);
      } else {
        await api.put(`/api/admin/yatras/${id}`, payload);
        navigate(`${ADMIN_BASE}/events`);
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminShell title="Edit Yatra"><p className="text-white/50 py-10">Loading…</p></AdminShell>;
  }

  return (
    <AdminShell
      title={isNew ? "New Yatra" : `Edit — ${form.title}`}
      back={{ to: `${ADMIN_BASE}/events`, label: "Yatras" }}
      actions={<button type="submit" form="yatra-form" disabled={saving} className={adminBtnPrimary}>{saving ? "Saving…" : "Save"}</button>}
    >
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      <form id="yatra-form" onSubmit={save} className="space-y-8">
        {/* Basics */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Title"><input className={adminInput} value={form.title} onChange={(e) => set({ title: e.target.value })} required /></Field>
          <Field label="Slug" hint="Leave blank to auto-generate from title"><input className={adminInput} value={form.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="tirth-yatra-2026" /></Field>
          <Field label="Tagline"><input className={adminInput} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} /></Field>
          <Field label="Category">
            <select className={adminInput} value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {["bus", "train", "flight", "international"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={adminInput} value={form.status} onChange={(e) => set({ status: e.target.value })}>
              {["draft", "published", "closed", "completed"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Starting point"><input className={adminInput} value={form.startingPoint} onChange={(e) => set({ startingPoint: e.target.value })} required /></Field>
          <Field label="Total seats"><input type="number" className={adminInput} value={form.totalSeats} onChange={(e) => set({ totalSeats: e.target.value })} required /></Field>
          <Field label="Vehicle type"><input className={adminInput} value={form.vehicleType} onChange={(e) => set({ vehicleType: e.target.value })} /></Field>
          <Field label="Duration — days"><input type="number" className={adminInput} value={form.durationDays} onChange={(e) => set({ durationDays: e.target.value })} /></Field>
          <Field label="Duration — nights"><input type="number" className={adminInput} value={form.durationNights} onChange={(e) => set({ durationNights: e.target.value })} /></Field>
          <Field label="Reporting time"><input className={adminInput} value={form.reportingTime} onChange={(e) => set({ reportingTime: e.target.value })} /></Field>
          <Field label="Departure time"><input className={adminInput} value={form.departureTime} onChange={(e) => set({ departureTime: e.target.value })} /></Field>
          <Field label="Brochure PDF URL"><input className={adminInput} value={form.brochurePdfUrl} onChange={(e) => set({ brochurePdfUrl: e.target.value })} /></Field>
          <Field label="Route map image URL" hint="Screenshot from Google My Maps, /yatra/…-map.jpg or a URL"><input className={adminInput} value={form.mapImageUrl} onChange={(e) => set({ mapImageUrl: e.target.value })} placeholder="/yatra/tirth-map.jpg" /></Field>
        </section>

        {/* Media + lists */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 grid sm:grid-cols-2 gap-6">
          <StringList label="Hero image URLs" items={form.heroImages} onChange={(v) => set({ heroImages: v })} placeholder="/yatra/kamakhya-hero.jpg or https://…" withThumb />
          <StringList label="Highlights (why this yatra)" items={form.highlights} onChange={(v) => set({ highlights: v })} placeholder="Kamakhya darshan on Nilachal Hill" />
          <StringList label="Route (stops)" items={form.route} onChange={(v) => set({ route: v })} placeholder="Varanasi" />
          <StringList label="Departure dates (YYYY-MM-DD)" items={form.departureDates} onChange={(v) => set({ departureDates: v })} placeholder="2026-03-29" />
          <StringList label="Freebies" items={form.freebies} onChange={(v) => set({ freebies: v })} placeholder="Free Rudraksha" />
          <StringList label="Inclusions" items={form.inclusions} onChange={(v) => set({ inclusions: v })} />
          <StringList label="Exclusions" items={form.exclusions} onChange={(v) => set({ exclusions: v })} />
          <StringList label="Important notes" items={form.importantNotes} onChange={(v) => set({ importantNotes: v })} />
          <StringList label="Terms & conditions" items={form.termsAndConditions} onChange={(v) => set({ termsAndConditions: v })} />
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Seat layout</p>
            <p className="text-[11px] text-white/30 mt-1">Leave empty to use automatic S1, S2… seats. Confirmed seats cannot be removed.</p>
          </div>
          {(form.seatLayout || []).map((seat, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <input className={adminInput} placeholder="Seat ID" value={seat.seatId || ""} onChange={(e) => set({ seatLayout: form.seatLayout.map((x, j) => j === i ? { ...x, seatId: e.target.value } : x) })} />
              <input className={adminInput} placeholder="Label" value={seat.label || ""} onChange={(e) => set({ seatLayout: form.seatLayout.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
              <input className={adminInput} type="number" min="1" placeholder="Row" value={seat.row ?? ""} onChange={(e) => set({ seatLayout: form.seatLayout.map((x, j) => j === i ? { ...x, row: e.target.value } : x) })} />
              <input className={adminInput} type="number" min="1" placeholder="Column" value={seat.column ?? ""} onChange={(e) => set({ seatLayout: form.seatLayout.map((x, j) => j === i ? { ...x, column: e.target.value } : x) })} />
              <button type="button" onClick={() => set({ seatLayout: form.seatLayout.filter((_, j) => j !== i) })} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ seatLayout: [...(form.seatLayout || []), { seatId: "", label: "", row: 1, column: 1, type: "seat" }] })} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add seat</button>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <div className="grid sm:grid-cols-4 gap-4">
            <Field label="Base price"><input type="number" className={adminInput} value={form.price.amount} onChange={(e) => setPrice({ amount: e.target.value })} required /></Field>
            <Field label="Currency"><input className={adminInput} value={form.price.currency} onChange={(e) => setPrice({ currency: e.target.value })} /></Field>
            <Field label="Unit"><input className={adminInput} value={form.price.unit} onChange={(e) => setPrice({ unit: e.target.value })} /></Field>
            <Field label="Advance / seat"><input type="number" className={adminInput} value={form.price.advanceAmount} onChange={(e) => setPrice({ advanceAmount: e.target.value })} /></Field>
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wide text-white/50">Fare variants</span>
            {(form.price.variants || []).map((v, i) => (
              <div key={i} className="flex gap-2">
                <input className={adminInput} placeholder="Label (e.g. AC Room)" value={v.label} onChange={(e) => setPrice({ variants: form.price.variants.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
                <input className={adminInput} type="number" placeholder="Amount" value={v.amount} onChange={(e) => setPrice({ variants: form.price.variants.map((x, j) => j === i ? { ...x, amount: e.target.value } : x) })} />
                <button type="button" onClick={() => setPrice({ variants: form.price.variants.filter((_, j) => j !== i) })} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => setPrice({ variants: [...(form.price.variants || []), { label: "", amount: "" }] })} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add variant</button>
          </div>
        </section>

        {/* Quick inclusions */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <span className="text-xs uppercase tracking-wide text-white/50">Quick inclusions (icon + label)</span>
          {form.quickInclusions.map((qi, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${adminInput} max-w-20`} placeholder="🚌" value={qi.icon} onChange={(e) => set({ quickInclusions: form.quickInclusions.map((x, j) => j === i ? { ...x, icon: e.target.value } : x) })} />
              <input className={adminInput} placeholder="Bus Travel" value={qi.label} onChange={(e) => set({ quickInclusions: form.quickInclusions.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
              <button type="button" onClick={() => set({ quickInclusions: form.quickInclusions.filter((_, j) => j !== i) })} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ quickInclusions: [...form.quickInclusions, { icon: "", label: "" }] })} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add</button>
        </section>

        {/* Itinerary */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <span className="text-xs uppercase tracking-wide text-white/50">Itinerary</span>
          {form.itinerary.map((day, di) => (
            <div key={di} className="rounded-lg border border-white/10 p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <input className={`${adminInput} max-w-24`} type="number" placeholder="Day #" value={day.dayNumber ?? ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, dayNumber: Number(e.target.value) } : x) })} />
                <input className={adminInput} placeholder="Title (e.g. Varanasi)" value={day.title || ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, title: e.target.value } : x) })} />
                <button type="button" onClick={() => set({ itinerary: form.itinerary.filter((_, j) => j !== di) })} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">Remove day</button>
              </div>
              <div className="flex gap-2 items-start">
                {looksLikeImage(day.image) && <img src={day.image} alt="" className="w-14 h-11 rounded object-cover border border-white/10 shrink-0" />}
                <input className={adminInput} placeholder="Day photo URL — /yatra/kamakhya-day02.jpg" value={day.image || ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, image: e.target.value } : x) })} />
                <input className={`${adminInput} max-w-56`} placeholder="Night stay (e.g. Hotel in Gangtok)" value={day.stayNight || ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, stayNight: e.target.value } : x) })} />
              </div>
              {(day.activities || []).map((act, ai) => (
                <div key={ai} className="flex gap-2 pl-4">
                  <input className={`${adminInput} max-w-20`} placeholder="🛕" value={act.icon || ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, activities: x.activities.map((a, k) => k === ai ? { ...a, icon: e.target.value } : a) } : x) })} />
                  <input className={`${adminInput} max-w-32`} placeholder="Time" value={act.time || ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, activities: x.activities.map((a, k) => k === ai ? { ...a, time: e.target.value } : a) } : x) })} />
                  <input className={adminInput} placeholder="Description" value={act.description || ""} onChange={(e) => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, activities: x.activities.map((a, k) => k === ai ? { ...a, description: e.target.value } : a) } : x) })} />
                  <button type="button" onClick={() => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, activities: x.activities.filter((_, k) => k !== ai) } : x) })} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => set({ itinerary: form.itinerary.map((x, j) => j === di ? { ...x, activities: [...(x.activities || []), { icon: "", time: "", description: "" }] } : x) })} className="text-xs text-cyan-300 hover:underline cursor-pointer pl-4">+ Add activity</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ itinerary: [...form.itinerary, { dayNumber: form.itinerary.length + 1, title: "", activities: [] }] })} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add day</button>
        </section>

        {/* Rules & facilities */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <span className="text-xs uppercase tracking-wide text-white/50">Rules & facilities (title + description)</span>
          {form.rulesAndFacilities.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${adminInput} max-w-48`} placeholder="Cancellation" value={r.title} onChange={(e) => set({ rulesAndFacilities: form.rulesAndFacilities.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} />
              <input className={adminInput} placeholder="Description" value={r.description} onChange={(e) => set({ rulesAndFacilities: form.rulesAndFacilities.map((x, j) => j === i ? { ...x, description: e.target.value } : x) })} />
              <button type="button" onClick={() => set({ rulesAndFacilities: form.rulesAndFacilities.filter((_, j) => j !== i) })} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ rulesAndFacilities: [...form.rulesAndFacilities, { title: "", description: "" }] })} className="text-xs text-cyan-300 hover:underline cursor-pointer">+ Add</button>
        </section>

        {/* FAQs */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <FaqList items={form.faqs || []} onChange={(v) => set({ faqs: v })} />
        </section>

        {/* SEO */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Meta title"><input className={adminInput} value={form.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} /></Field>
          <Field label="Meta description"><input className={adminInput} value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} /></Field>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={adminBtnPrimary}>{saving ? "Saving…" : "Save Yatra"}</button>
          <button type="button" onClick={() => navigate(`${ADMIN_BASE}/events`)} className={adminBtnGhost}>Cancel</button>
        </div>
      </form>
    </AdminShell>
  );
}
