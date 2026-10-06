import { useLanguage } from "../../lib/i18n/LanguageContext";
import { groupLayout, countLayout, isBookable } from "../../lib/seatLayout";

// One seat map for every bus. The physical arrangement comes entirely from
// the yatra's seatLayout (decks → sections → rows), as configured in the
// admin panel; this component only decides how that bus looks. The same
// component renders the customer booking chart and the admin preview
// (mode="admin"), so both always show the identical layout.
//
// Fluid sizing: seats are flex children bounded by a min/max width, so they
// never get crushed on small screens or stretched on large ones. Each
// section's flex-grow is weighted by its column count, which keeps decks with
// the same number of columns the same width. Sleeper berths are physically
// bigger than seater seats, so they get their own (larger) size range.
const SLEEPER_SIZE = { minWidth: 40, maxWidth: 64, heightClass: "h-16 sm:h-20", textClass: "text-[11px] sm:text-sm" };
const SEATER_SIZE = { minWidth: 34, maxWidth: 48, heightClass: "h-12 sm:h-14", textClass: "text-[9px] sm:text-[11px]" };
const SEAT_GAP = 8;
const ROW_GAP = 8;
const PANEL_PAD_X = 8;
const PANEL_PAD_Y = 12;
const DECK_PAD = 10;
const DECK_GAP = 16;
const sizeFor = (berthType) => (berthType === "sleeper" ? SLEEPER_SIZE : SEATER_SIZE);

function SteeringWheelIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 5.2V9.8M6.2 15.4L9.8 13.2M17.8 15.4L14.2 13.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BedIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 18V7.5M3 18h18M3 18v1.5M21 18v1.5M21 18v-6a2 2 0 0 0-2-2h-7v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4.5" y="10.5" width="6" height="3.2" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// Simplified top-down bus-seat glyph: backrest + cushion + two armrests.
function SeatGlyph({ className }) {
  return (
    <svg viewBox="0 0 40 46" className={className} fill="currentColor">
      <rect x="3" y="11" width="6" height="19" rx="3" />
      <rect x="31" y="11" width="6" height="19" rx="3" />
      <rect x="8" y="4" width="24" height="21" rx="7" />
      <rect x="6" y="23" width="28" height="16" rx="6" />
    </svg>
  );
}

function BlockedIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const seatClasses = (state) =>
  state === "selected"
    ? "border-amber-500 bg-amber-400 text-slate-900 cursor-pointer"
    : state === "booked"
    ? "border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed"
    : state === "locked"
    ? "border-red-200 bg-red-50 text-red-300 cursor-not-allowed"
    : "border-emerald-400 bg-white text-slate-700 hover:bg-emerald-50 cursor-pointer";

function SeatCell({ seat, state, onToggle, berthType, admin, t }) {
  const size = sizeFor(berthType);
  const cellStyle = { flex: "1 1 0%", minWidth: size.minWidth, maxWidth: size.maxWidth };

  // A blocked position (driver-side gap, staircase…) is never selectable by a
  // customer. In the admin preview it is a button so it can be turned back
  // into a seat.
  if (!isBookable(seat)) {
    const blockedCls = `${size.heightClass} rounded-md border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center text-slate-400`;
    return admin ? (
      <button
        type="button"
        onClick={() => onToggle(seat.seatId)}
        aria-label={`${seat.label} ${t("seatMap.blocked")}`}
        title={seat.seatId}
        style={cellStyle}
        className={`${blockedCls} cursor-pointer hover:border-slate-500`}
      >
        <BlockedIcon className="w-1/3 h-1/3" />
      </button>
    ) : (
      <div aria-hidden="true" style={cellStyle} className={blockedCls}>
        <BlockedIcon className="w-1/3 h-1/3" />
      </div>
    );
  }

  const isSleeper = berthType === "sleeper";
  const barClass = state === "selected" ? "bg-white/70" : state === "available" ? "bg-emerald-300" : "bg-current opacity-30";
  const glyphClass = state === "selected" ? "text-white/45" : state === "available" ? "text-emerald-200" : "text-current opacity-20";
  const disabled = !admin && (state === "booked" || state === "locked");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(seat.seatId, state)}
      aria-label={`${seat.label} ${t(`seatMap.${isSleeper ? "sleeper" : "seater"}`)} ${t(`seatMap.${state === "locked" ? "unavailable" : state}`)}`}
      aria-pressed={state === "selected"}
      title={admin ? seat.seatId : undefined}
      style={cellStyle}
      className={`${seatClasses(state)} ${size.heightClass} ${size.textClass} relative border-2 rounded-md flex flex-col items-center justify-center leading-none font-bold transition overflow-hidden`}
    >
      {isSleeper ? (
        <>
          <span className={`h-1.5 sm:h-2 w-1/3 rounded-sm ${barClass}`} />
          <span className="mt-1 sm:mt-1.5 leading-none">{seat.label}</span>
          <span className={`h-1 w-2/5 rounded-sm mt-1 sm:mt-1.5 ${barClass}`} />
        </>
      ) : (
        <>
          <SeatGlyph className={`absolute inset-0 w-full h-full p-1 sm:p-1.5 ${glyphClass}`} />
          <span className="relative leading-none">{seat.label}</span>
        </>
      )}
    </button>
  );
}

const formatSeatPrice = (amount) =>
  amount != null && Number.isFinite(Number(amount)) && Number(amount) > 0 ? `₹${Number(amount).toLocaleString("en-IN")}` : null;

function PanelHeader({ berthType, count, price, t }) {
  const isSleeper = berthType === "sleeper";
  const priceLabel = formatSeatPrice(price);
  return (
    <div
      className={`inline-flex flex-col items-center text-center gap-0.5 rounded-lg border px-2 py-1 text-[11px] sm:text-sm font-bold ${
        isSleeper ? "border-sky-200 bg-sky-50 text-sky-700" : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {isSleeper ? <BedIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <SeatGlyph className="w-3 h-3.5 sm:w-3.5 sm:h-4 shrink-0" />}
        {isSleeper ? t("seatMap.sleeper") : t("seatMap.seater")} ({count})
      </span>
      {priceLabel && (
        <span className="text-[10px] sm:text-xs font-semibold opacity-80">
          {priceLabel} {t("seatMap.perSeat")}
        </span>
      )}
    </div>
  );
}

// Every row in a section spans the section's full width; cells are flex-1, so
// a row with a different seat count (e.g. a 3-seat back bench on a 2-across
// section) divides the same width instead of widening the section.
function Row({ seats, berthType, states, selectedSet, onToggle, admin, t }) {
  return (
    <div style={{ display: "flex", gap: SEAT_GAP, width: "100%", justifyContent: "center" }}>
      {seats.map((seat) => {
        const state = selectedSet.has(seat.seatId) ? "selected" : states[seat.seatId] || "available";
        return <SeatCell key={seat.seatId} seat={seat} state={state} onToggle={onToggle} berthType={berthType} admin={admin} t={t} />;
      })}
    </div>
  );
}

function mostCommon(numbers) {
  if (!numbers.length) return 1;
  const counts = new Map();
  for (const n of numbers) counts.set(n, (counts.get(n) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
}

function sectionColumnCount(seats) {
  const rows = [...new Set(seats.map((seat) => seat.row))];
  return mostCommon(rows.map((row) => seats.filter((seat) => seat.row === row).length));
}

function sectionMinWidth(columnCount, berthType) {
  const { minWidth } = sizeFor(berthType);
  return columnCount * minWidth + (columnCount - 1) * SEAT_GAP + PANEL_PAD_X * 2;
}

function Section({ section, columnCount, states, selectedSet, onToggle, price, admin, t }) {
  const { seats, berthType } = section;
  const rows = [...new Set(seats.map((seat) => seat.row))].sort((a, b) => a - b);
  const rowGroups = rows.map((row) => seats.filter((seat) => seat.row === row).sort((a, b) => a.column - b.column));
  const count = seats.filter(isBookable).length;

  return (
    <div
      style={{
        flex: `${columnCount} 1 0%`,
        minWidth: sectionMinWidth(columnCount, berthType),
        paddingLeft: PANEL_PAD_X,
        paddingRight: PANEL_PAD_X,
        paddingTop: PANEL_PAD_Y,
        paddingBottom: PANEL_PAD_Y,
      }}
      className="flex flex-col items-center gap-3"
    >
      <PanelHeader berthType={berthType} count={count} price={price} t={t} />
      <div style={{ display: "flex", flexDirection: "column", gap: ROW_GAP, width: "100%" }}>
        {rowGroups.map((group, i) => (
          <Row key={rows[i]} seats={group} berthType={berthType} states={states} selectedSet={selectedSet} onToggle={onToggle} admin={admin} t={t} />
        ))}
      </div>
    </div>
  );
}

const deckLabel = (deck, t) =>
  deck === "lower" ? t("seatMap.lowerDeck") : deck === "upper" ? t("seatMap.upperDeck") : deck === "main" ? t("seatMap.mainDeck") : deck;

function Deck({ deck, isFirst, states, selectedSet, onToggle, prices, admin, t }) {
  const columnCounts = deck.sections.map((section) => sectionColumnCount(section.seats));
  const totalColumns = columnCounts.reduce((a, b) => a + b, 0);
  const deckMinWidth = deck.sections.reduce((sum, section, i) => sum + sectionMinWidth(columnCounts[i], section.berthType), 0) + DECK_PAD * 2;

  return (
    // Full width when decks stack (mobile); from md up the decks sit side by
    // side, weighted by their column counts. The max width stops a small
    // single-deck coach from stretching across a wide page. Very wide buses
    // scroll inside their own deck card rather than the page.
    <div
      style={{ flex: `${totalColumns} 1 0%`, maxWidth: Math.round(deckMinWidth * 2.4) }}
      className="w-full md:w-auto min-w-0 mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      <div style={{ padding: DECK_PAD }} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900">{deckLabel(deck.deck, t)}</h4>
          {isFirst && (
            <span
              title={t("seatMap.driver")}
              aria-label={t("seatMap.driver")}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0"
            >
              <SteeringWheelIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </span>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <div className="flex items-start divide-x divide-slate-100" style={{ minWidth: deckMinWidth - DECK_PAD * 2 }}>
            {deck.sections.map((section, i) => (
              <Section
                key={section.panel}
                section={section}
                columnCount={columnCounts[i]}
                states={states}
                selectedSet={selectedSet}
                onToggle={onToggle}
                price={section.berthType === "sleeper" ? prices?.sleeper : prices?.normal}
                admin={admin}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// e.g. "Lower deck · Sleeper — 12 Berths" / "Seating · Left — 22 Seats".
// Two sections of the same type on one deck are told apart as Left/Right.
function sectionCaption(deck, section, index, t) {
  const sameType = deck.sections.filter((s) => s.berthType === section.berthType).length;
  const qualifier =
    sameType > 1
      ? index === 0
        ? t("seatMap.left")
        : index === deck.sections.length - 1
        ? t("seatMap.right")
        : `${index + 1}`
      : section.berthType === "sleeper"
      ? t("seatMap.sleeper")
      : t("seatMap.seater");
  const unit = section.berthType === "sleeper" ? t("seatMap.berths") : t("seatMap.seatsUnit");
  const count = section.seats.filter(isBookable).length;
  return { title: `${deckLabel(deck.deck, t)} · ${qualifier}`, value: `${count} ${unit}` };
}

function totalLine(counts, t) {
  if (counts.sleeper && counts.seater) return t("seatMap.totalMixed", { seater: counts.seater, sleeper: counts.sleeper, total: counts.bookable });
  if (counts.sleeper) return t("seatMap.totalSleeperOnly", { total: counts.bookable });
  return t("seatMap.totalSeatsOnly", { total: counts.bookable });
}

const legendSwatchClasses = {
  available: "border-2 border-emerald-400 bg-white",
  selected: "bg-amber-400 border-2 border-amber-500",
  locked: "bg-red-50 border-2 border-red-200",
  booked: "bg-slate-100 border-2 border-slate-200",
  blocked: "bg-slate-100 border-2 border-dashed border-slate-300",
};

/**
 * mode="book"  (default) — customer chart. `onChange(nextSelectedIds)`.
 * mode="admin" — preview in the yatra editor. Every cell is clickable and
 *                `onToggleBlocked(seatId)` turns a seat into a blocked position
 *                or back. No availability states are shown.
 */
export default function SeatMap({ layout = [], states = {}, selected = [], onChange, onToggleBlocked, prices, mode = "book", tone = "dark" }) {
  const { t } = useLanguage();
  const admin = mode === "admin";
  const selectedSet = new Set(admin ? [] : selected);
  const decks = groupLayout(layout);
  const counts = countLayout(layout);

  const legend = [
    ["available", t("seatMap.available")],
    ...(admin
      ? []
      : [
          ["selected", t("seatMap.selected")],
          ["locked", t("seatMap.unavailable")],
          ["booked", t("seatMap.booked")],
        ]),
    ...(counts.blocked ? [["blocked", t("seatMap.blocked")]] : []),
  ];

  const toggle = (seatId, state) => {
    if (admin) {
      onToggleBlocked?.(seatId);
      return;
    }
    if (state === "booked" || state === "locked") return;
    onChange(selectedSet.has(seatId) ? selected.filter((id) => id !== seatId) : [...selected, seatId]);
  };

  const mutedText = tone === "dark" ? "text-cream/60" : "text-slate-500";

  if (!decks.length) {
    return <p className={`text-sm ${mutedText}`}>{t("seatMap.noLayout")}</p>;
  }

  return (
    <div className="space-y-3">
      <div className={`flex flex-wrap gap-x-4 gap-y-2 text-xs ${mutedText}`}>
        {legend.map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <i className={`w-3 h-3 rounded-sm ${legendSwatchClasses[key]}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-start" style={{ gap: DECK_GAP }}>
          {decks.map((deck, i) => (
            <Deck key={deck.deck} deck={deck} isFirst={i === 0} states={admin ? {} : states} selectedSet={selectedSet} onToggle={toggle} prices={prices} admin={admin} t={t} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {decks.flatMap((deck) =>
            deck.sections.map((section, i) => {
              const { title, value } = sectionCaption(deck, section, i, t);
              const isSleeper = section.berthType === "sleeper";
              return (
                <div key={`${deck.deck}-${section.panel}`} className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5">
                  <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${isSleeper ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-700"}`}>
                    {isSleeper ? <BedIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <SeatGlyph className="w-3.5 h-4 sm:w-4 sm:h-4.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">{title}</span>
                    <span className="block text-xs sm:text-sm font-extrabold text-slate-900">{value}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center">
          <span className="inline-block max-w-full rounded-full sm:rounded-2xl bg-slate-900 text-white text-[11px] sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5">
            {totalLine(counts, t)}
          </span>
        </div>
      </div>

      {!admin && (
        <p className={`text-xs ${mutedText}`}>
          {selected.length ? t("seatMap.selectedCount", { n: selected.length, seats: selected.join(", ") }) : t("seatMap.chooseHint")}
        </p>
      )}
    </div>
  );
}
