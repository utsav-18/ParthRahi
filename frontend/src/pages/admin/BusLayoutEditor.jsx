import { useMemo, useState } from "react";
import SeatMap from "../../components/yatra/SeatMap";
import {
  countLayout,
  fallbackLayout,
  generateSection,
  groupLayout,
  isBookable,
  normalizeLayout,
  toggleBlocked,
} from "../../lib/seatLayout";
import { adminBtnGhost, adminBtnPrimary, adminInput } from "./AdminShell";

// Admin editor for the bus used by ONE yatra. It edits the yatra's
// `seatLayout` array directly (the same data the customer SeatMap renders and
// the backend prices/locks against) — there is no separate "bus template".
//
// A bus is built from sections: each section sits on a deck (single deck, or
// lower/upper for a double-decker) and is either Seater or Sleeper, with its
// own rows × seats-per-row. Sections on the same deck are drawn side by side
// with the aisle between them, e.g. Sleeper | Seater on a lower deck, or
// Seater | Seater for a 2 + 2 coach.

const DECK_OPTIONS = [
  { value: "main", label: "Single deck" },
  { value: "lower", label: "Lower deck" },
  { value: "upper", label: "Upper deck" },
];
const deckName = (deck) => DECK_OPTIONS.find((d) => d.value === deck)?.label || deck;

const EMPTY_SECTION = { deck: "main", berthType: "seater", rows: "10", perRow: "2", lastRow: "", prefix: "S", start: "" };

// Next unused number for a prefix, so "S" continues S23, S24… after S1–S22.
function nextNumber(layout, prefix) {
  let max = 0;
  for (const seat of layout) {
    const id = String(seat.seatId || "");
    if (!id.startsWith(prefix)) continue;
    const rest = id.slice(prefix.length);
    if (/^\d+$/.test(rest)) max = Math.max(max, Number(rest));
  }
  return max + 1;
}

function Stat({ label, value, tone = "text-cream" }) {
  return (
    <div className="rounded-lg border border-gold-300/12 bg-navy-950/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-cream/45">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function BusLayoutEditor({ layout, onChange, totalSeats, prices, savedSeatIds }) {
  const [draft, setDraft] = useState(EMPTY_SECTION);
  const [message, setMessage] = useState("");

  const counts = countLayout(layout);
  const decks = useMemo(() => groupLayout(layout), [layout]);
  const hasLayout = layout.length > 0;

  // Seat IDs present in the saved yatra but not in this draft. The backend
  // refuses the save if any of them belongs to a confirmed booking.
  const removedIds = useMemo(() => {
    const current = new Set(layout.map((seat) => seat.seatId));
    return (savedSeatIds || []).filter((id) => !current.has(id));
  }, [layout, savedSeatIds]);

  // Every edit is made on the normalized form, so a legacy plain grid becomes
  // explicit deck/section data the first time it is edited (seat IDs unchanged).
  const edit = (fn) => {
    setMessage("");
    onChange(fn(normalizeLayout(layout)));
  };

  const setSectionType = (deck, panel, berthType) =>
    edit((rows) => rows.map((seat) => (seat.deck === deck && seat.panel === panel ? { ...seat, berthType } : seat)));

  const removeSection = (deck, panel, seatCount) => {
    if (!window.confirm(`Remove this section (${seatCount} seats) from the layout?`)) return;
    edit((rows) => rows.filter((seat) => !(seat.deck === deck && seat.panel === panel)));
  };

  const addSection = () => {
    const prefix = draft.prefix.trim();
    const base = normalizeLayout(layout);
    const panel = base.filter((seat) => seat.deck === draft.deck).reduce((max, seat) => Math.max(max, (seat.panel ?? 0) + 1), 0);
    const start = draft.start === "" ? nextNumber(base, prefix) : Number(draft.start);
    const seats = generateSection({ ...draft, prefix, start, panel });
    if (!seats.length) {
      setMessage("Enter at least 1 row and 1 seat per row.");
      return;
    }
    const existing = new Set(base.map((seat) => seat.seatId));
    const clash = seats.filter((seat) => existing.has(seat.seatId)).map((seat) => seat.seatId);
    if (clash.length) {
      setMessage(`Seat IDs already in use: ${clash.slice(0, 6).join(", ")}${clash.length > 6 ? "…" : ""}. Change the prefix or start number.`);
      return;
    }
    onChange([...base, ...seats]);
    setMessage(`Added ${seats.length} ${draft.berthType} seats (${seats[0].seatId}–${seats[seats.length - 1].seatId}) to the ${deckName(draft.deck).toLowerCase()}.`);
    setDraft((d) => ({ ...d, start: "" }));
  };

  const clearAll = () => {
    if (!window.confirm("Remove every seat from this layout and start again? Nothing is saved until you press Save.")) return;
    onChange([]);
  };

  const updateSeat = (index, patch) => onChange(layout.map((seat, i) => (i === index ? { ...seat, ...patch } : seat)));

  return (
    <section className="rounded-xl border border-gold-300/12 bg-navy-900/70 p-5 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gold-200/80 font-semibold">Bus layout</p>
          <p className="text-[12px] text-cream/50 mt-1 max-w-2xl leading-relaxed">
            Describe the actual bus used for this yatra. Seater seats are charged the Normal Seat price and Sleeper berths the
            Sleeper Seat price. Total seats is set automatically from the number of bookable seats; blocked positions are not
            counted. Seat IDs that have confirmed bookings cannot be removed.
          </p>
        </div>
        {hasLayout && (
          <button type="button" onClick={clearAll} className="text-xs px-3 py-1.5 rounded-md border border-red-500/30 text-red-300 hover:bg-red-500/10 cursor-pointer">
            Start over
          </button>
        )}
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Bookable seats" value={hasLayout ? counts.bookable : totalSeats || 0} tone="text-gold-200" />
        <Stat label="Seater" value={hasLayout ? counts.seater : totalSeats || 0} />
        <Stat label="Sleeper" value={counts.sleeper} />
        <Stat label="Blocked positions" value={counts.blocked} />
      </div>

      {!hasLayout && (
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-cream/80 space-y-3">
          <p>
            No bus layout is saved for this yatra. Customers currently see an automatic layout of{" "}
            <b>{Number(totalSeats) || 0} seater seats</b> (S1–S{Number(totalSeats) || 0}), all at the Normal Seat price.
          </p>
          {Number(totalSeats) > 0 && (
            <button type="button" onClick={() => onChange(normalizeLayout(fallbackLayout(totalSeats)))} className={adminBtnGhost}>
              Start from these {Number(totalSeats)} seats (keeps IDs S1–S{Number(totalSeats)})
            </button>
          )}
          <p className="text-[12px] text-cream/50">…or build the bus from scratch with “Add a section” below.</p>
        </div>
      )}

      {removedIds.length > 0 && (
        <p className="rounded-lg border border-red-400/25 bg-red-500/[0.06] px-3 py-2 text-[12px] text-red-200">
          {removedIds.length} seat ID(s) from the saved layout are no longer in this draft ({removedIds.slice(0, 8).join(", ")}
          {removedIds.length > 8 ? "…" : ""}). Saving will be refused if any of them has a confirmed booking.
        </p>
      )}

      {/* Sections */}
      {hasLayout && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-cream/50">Sections</p>
          <div className="grid gap-2 md:grid-cols-2">
            {decks.flatMap((deck) =>
              deck.sections.map((section) => {
                const bookable = section.seats.filter(isBookable);
                const rows = new Set(section.seats.map((seat) => seat.row)).size;
                return (
                  <div key={`${deck.deck}-${section.panel}`} className="rounded-lg border border-gold-300/12 bg-navy-950/40 p-3 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                      <p className="text-sm font-semibold text-cream">
                        {deckName(deck.deck)} · section {section.panel + 1}
                      </p>
                      <p className="text-[12px] text-cream/50">
                        {bookable.length} seats · {rows} rows
                        {bookable.length ? ` · ${bookable[0].seatId}–${bookable[bookable.length - 1].seatId}` : ""}
                      </p>
                    </div>
                    <select
                      className={`${adminInput} !w-auto !py-1.5 text-xs`}
                      value={section.berthType}
                      onChange={(e) => setSectionType(deck.deck, section.panel, e.target.value)}
                      aria-label="Seat type for this section"
                    >
                      <option value="seater">Seater (Normal price)</option>
                      <option value="sleeper">Sleeper (Sleeper price)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSection(deck.deck, section.panel, bookable.length)}
                      className="text-xs px-2.5 py-1.5 rounded-md border border-red-500/30 text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add a section */}
      <div className="rounded-lg border border-gold-300/12 bg-navy-950/40 p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-cream/50">Add a section</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <label className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-cream/50">Deck</span>
            <select className={adminInput} value={draft.deck} onChange={(e) => setDraft({ ...draft, deck: e.target.value })}>
              {DECK_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-cream/50">Seat type</span>
            <select className={adminInput} value={draft.berthType} onChange={(e) => setDraft({ ...draft, berthType: e.target.value })}>
              <option value="seater">Seater</option>
              <option value="sleeper">Sleeper</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-cream/50">Rows</span>
            <input type="number" min="1" className={adminInput} value={draft.rows} onChange={(e) => setDraft({ ...draft, rows: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-cream/50">Seats per row</span>
            <input type="number" min="1" className={adminInput} value={draft.perRow} onChange={(e) => setDraft({ ...draft, perRow: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-cream/50">Last row (optional)</span>
            <input type="number" min="1" className={adminInput} placeholder="same" value={draft.lastRow} onChange={(e) => setDraft({ ...draft, lastRow: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-cream/50">ID prefix</span>
            <input className={adminInput} placeholder="S / L / U" value={draft.prefix} onChange={(e) => setDraft({ ...draft, prefix: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-cream/50">Start no.</span>
            <input type="number" min="1" className={adminInput} placeholder="auto" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={addSection} className={adminBtnPrimary}>
            + Add {Number(draft.rows) > 0 && Number(draft.perRow) > 0 ? generateSection({ ...draft, start: 1 }).length : 0} {draft.berthType} seats
          </button>
          <p className="text-[11px] text-cream/40">
            Example: a 2 + 2 seater coach is two Seater sections on the single deck. A sleeper coach is a lower deck (Sleeper + Seater)
            and an upper deck (Sleeper + Sleeper).
          </p>
        </div>
        {message && <p className="text-[12px] text-gold-200">{message}</p>}
      </div>

      {/* Preview — the customer SeatMap itself */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-cream/50">Preview (what customers see)</p>
        <p className="text-[11px] text-cream/40">Click a seat to turn it into a blocked position (driver gap, door, stairs). Click again to restore it.</p>
        <SeatMap
          mode="admin"
          layout={hasLayout ? layout : fallbackLayout(totalSeats)}
          prices={{ normal: prices?.normalSeat, sleeper: prices?.sleeperSeat || prices?.normalSeat }}
          onToggleBlocked={(seatId) => {
            if (!hasLayout) return;
            edit((rows) => toggleBlocked(rows, seatId));
          }}
        />
      </div>

      {/* Per-seat editing — the original seat table, now with deck/section/type/blocked */}
      <details className="rounded-lg border border-gold-300/12 bg-navy-950/40">
        <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wide text-cream/60">
          Edit individual seats ({layout.length} entries)
        </summary>
        <div className="px-4 pb-4 space-y-2 overflow-x-auto">
          <div className="hidden md:grid grid-cols-[1fr_1fr_70px_70px_110px_70px_110px_100px_70px] gap-2 text-[10px] uppercase tracking-wider text-cream/40 min-w-[820px]">
            <span>Seat ID</span><span>Label</span><span>Row</span><span>Column</span><span>Deck</span><span>Section</span><span>Type</span><span>Position</span><span />
          </div>
          {layout.map((seat, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-[1fr_1fr_70px_70px_110px_70px_110px_100px_70px] gap-2 md:min-w-[820px]">
              <input className={adminInput} placeholder="Seat ID" value={seat.seatId || ""} onChange={(e) => updateSeat(i, { seatId: e.target.value })} />
              <input className={adminInput} placeholder="Label" value={seat.label || ""} onChange={(e) => updateSeat(i, { label: e.target.value })} />
              <input className={adminInput} type="number" min="1" placeholder="Row" value={seat.row ?? ""} onChange={(e) => updateSeat(i, { row: e.target.value })} />
              <input className={adminInput} type="number" min="1" placeholder="Col" value={seat.column ?? ""} onChange={(e) => updateSeat(i, { column: e.target.value })} />
              <select className={adminInput} value={seat.deck || ""} onChange={(e) => updateSeat(i, { deck: e.target.value || undefined })}>
                <option value="">—</option>
                {DECK_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <input className={adminInput} type="number" min="1" placeholder="#" value={seat.panel != null ? seat.panel + 1 : ""} onChange={(e) => updateSeat(i, { panel: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value) - 1) })} />
              <select className={adminInput} value={seat.berthType === "sleeper" ? "sleeper" : "seater"} onChange={(e) => updateSeat(i, { berthType: e.target.value })}>
                <option value="seater">Seater</option>
                <option value="sleeper">Sleeper</option>
              </select>
              <select className={adminInput} value={isBookable(seat) ? "seat" : "blocked"} onChange={(e) => updateSeat(i, { type: e.target.value })}>
                <option value="seat">Seat</option>
                <option value="blocked">Blocked</option>
              </select>
              <button type="button" onClick={() => onChange(layout.filter((_, j) => j !== i))} className="px-2 rounded-md border border-red-500/30 text-red-300 text-sm cursor-pointer hover:bg-red-500/10">Remove</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...layout, { seatId: "", label: "", row: 1, column: 1, type: "seat", deck: layout[layout.length - 1]?.deck, panel: layout[layout.length - 1]?.panel, berthType: "seater" }])}
            className="text-xs text-gold-300 hover:text-gold-200 hover:underline cursor-pointer"
          >
            + Add seat
          </button>
        </div>
      </details>
    </section>
  );
}
