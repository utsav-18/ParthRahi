import { useLanguage } from "../../lib/i18n/LanguageContext";

const DECK_ORDER = ["lower", "upper"];

// Fluid sizing for the multi-deck bus chart. Seats are flex children (not
// fixed pixel boxes), bounded by a min/max so they never get crushed on
// small screens or stretched absurdly on huge ones. Every panel's flex-grow
// is weighted by its own column count, so a 2-column "Sleeper" panel and a
// 2-column "Seater" panel always divide their deck's width identically —
// that's what keeps Lower deck (Sleeper+Seater) and Upper deck
// (Sleeper+Sleeper) the same width without any fixed-pixel bookkeeping.
// Sleeper berths are physically bigger than seater seats on a real coach, so
// they get their own (larger) size range; height is a fixed responsive
// value rather than aspect-ratio, so it can never balloon unexpectedly.
const SLEEPER_SIZE = { minWidth: 40, maxWidth: 64, heightClass: "h-16 sm:h-20", textClass: "text-[11px] sm:text-sm" };
const SEATER_SIZE = { minWidth: 32, maxWidth: 48, heightClass: "h-12 sm:h-14", textClass: "text-[9px] sm:text-[11px]" };
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

// ── Legacy flat grid (no deck/panel metadata on the seats) ──────────────
const flatSeatButtonClasses = (state) =>
  `flex items-center justify-center text-xs font-semibold transition ${
    state === "selected"
      ? "bg-amber-300 text-black border-amber-100 cursor-pointer"
      : state === "available"
      ? "text-amber-50 border-amber-200/25 hover:border-amber-200 hover:bg-amber-300/10 cursor-pointer"
      : state === "booked"
      ? "bg-white/10 text-white/30 border-white/10 cursor-not-allowed"
      : "bg-red-400/10 text-red-200/40 border-red-300/20 cursor-not-allowed"
  }`;

function FlatSeatMap({ layout, states, selectedSet, onToggle, t }) {
  const rows = [...new Set(layout.map((seat) => seat.row))].sort((a, b) => a - b);
  return (
    <div className="rounded-xl border border-amber-200/12 bg-black/10 p-3 sm:p-4 space-y-2 overflow-x-auto">
      <div className="text-center text-[10px] uppercase tracking-[0.2em] text-amber-100/35 mb-3">{t("seatMap.front")}</div>
      {rows.map((row) => (
        <div key={row} className="flex justify-center gap-2 min-w-62.5">
          {layout
            .filter((seat) => seat.row === row)
            .sort((a, b) => a.column - b.column)
            .map((seat) => {
              const state = selectedSet.has(seat.seatId) ? "selected" : states[seat.seatId] || "available";
              return (
                <button
                  key={seat.seatId}
                  type="button"
                  disabled={state === "booked" || state === "locked"}
                  onClick={() => onToggle(seat.seatId, state)}
                  aria-label={`${seat.label} ${state}`}
                  className={`h-10 w-12 sm:w-14 rounded-lg border ${flatSeatButtonClasses(state)}`}
                >
                  {seat.label}
                </button>
              );
            })}
        </div>
      ))}
    </div>
  );
}

// ── Multi-deck bus chart (seats carry deck/panel/berthType) ─────────────
const sectionedSeatClasses = (state) =>
  state === "selected"
    ? "border-amber-500 bg-amber-400 text-slate-900 cursor-pointer"
    : state === "booked"
    ? "border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed"
    : state === "locked"
    ? "border-red-200 bg-red-50 text-red-300 cursor-not-allowed"
    : "border-emerald-400 bg-white text-slate-700 hover:bg-emerald-50 cursor-pointer";

function SeatCell({ seat, state, onToggle, berthType }) {
  const size = sizeFor(berthType);
  const cellStyle = { flex: "1 1 0%", minWidth: size.minWidth, maxWidth: size.maxWidth };

  if (seat.type === "blocked") {
    return (
      <div
        aria-hidden="true"
        style={cellStyle}
        className={`${size.heightClass} rounded-md border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400`}
      >
        <BlockedIcon className="w-1/3 h-1/3" />
      </div>
    );
  }

  const isSleeper = berthType === "sleeper";
  const barClass = state === "selected" ? "bg-white/70" : state === "available" ? "bg-emerald-300" : "bg-current opacity-30";
  const glyphClass = state === "selected" ? "text-white/45" : state === "available" ? "text-emerald-200" : "text-current opacity-20";

  return (
    <button
      type="button"
      disabled={state === "booked" || state === "locked"}
      onClick={() => onToggle(seat.seatId, state)}
      aria-label={`${seat.label} ${state}`}
      style={cellStyle}
      className={`${sectionedSeatClasses(state)} ${size.heightClass} ${size.textClass} relative border-2 rounded-md flex flex-col items-center justify-center leading-none font-bold transition overflow-hidden`}
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

const formatSeatPrice = (amount) => (Number.isFinite(Number(amount)) ? `₹${Number(amount).toLocaleString("en-IN")}` : null);

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
      {priceLabel && <span className="text-[10px] sm:text-xs font-semibold opacity-80">{priceLabel} / seat</span>}
    </div>
  );
}

// Every row in a panel spans the panel's full content width; its cells are
// flex-1 so a row with a different seat count (the odd 3-seat back row on an
// otherwise 2-across panel) just divides that same width into smaller
// shares instead of making the whole panel wider — no per-row pixel math
// needed, the browser does the compression via flexbox.
function Row({ seats, berthType, states, selectedSet, onToggle }) {
  return (
    <div style={{ display: "flex", gap: SEAT_GAP, width: "100%", justifyContent: "center" }}>
      {seats.map((seat) => {
        const state = selectedSet.has(seat.seatId) ? "selected" : states[seat.seatId] || "available";
        return <SeatCell key={seat.seatId} seat={seat} state={state} onToggle={onToggle} berthType={berthType} />;
      })}
    </div>
  );
}

function mostCommon(numbers) {
  const counts = new Map();
  for (const n of numbers) counts.set(n, (counts.get(n) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function panelMinWidth(columnCount, berthType) {
  const { minWidth } = sizeFor(berthType);
  return columnCount * minWidth + (columnCount - 1) * SEAT_GAP + PANEL_PAD_X * 2;
}

function Panel({ seats, berthType, states, selectedSet, onToggle, t, columnCount, price }) {
  const rows = [...new Set(seats.map((seat) => seat.row))].sort((a, b) => a - b);
  const rowGroups = rows.map((row) => seats.filter((seat) => seat.row === row).sort((a, b) => a.column - b.column));
  const count = seats.filter((seat) => seat.type !== "blocked").length;

  return (
    <div
      style={{ flex: `${columnCount} 1 0%`, minWidth: panelMinWidth(columnCount, berthType), paddingLeft: PANEL_PAD_X, paddingRight: PANEL_PAD_X, paddingTop: PANEL_PAD_Y, paddingBottom: PANEL_PAD_Y }}
      className="flex flex-col items-center gap-3"
    >
      <PanelHeader berthType={berthType} count={count} price={price} t={t} />
      <div style={{ display: "flex", flexDirection: "column", gap: ROW_GAP, width: "100%" }}>
        {rowGroups.map((group, i) => (
          <Row key={rows[i]} seats={group} berthType={berthType} states={states} selectedSet={selectedSet} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

function panelColumnCount(panelSeats) {
  const rows = [...new Set(panelSeats.map((seat) => seat.row))];
  return mostCommon(rows.map((row) => panelSeats.filter((seat) => seat.row === row).length));
}

function Deck({ deckName, panels, states, selectedSet, onToggle, t, prices }) {
  const isLower = deckName === "lower";
  const columnCounts = panels.map((panel) => panelColumnCount(panel.seats));
  const totalColumns = columnCounts.reduce((a, b) => a + b, 0);
  const deckMinWidth = panels.reduce((sum, panel, i) => sum + panelMinWidth(columnCounts[i], panel.berthType), 0) + DECK_PAD * 2;

  return (
    // width: 100% keeps the deck full-width when stacked (mobile, flex-col —
    // flex-basis only governs the vertical main axis there, not width); the
    // md breakpoint hands sizing back to the row-axis flex-grow weighting.
    <div style={{ flex: `${totalColumns} 1 0%`, minWidth: deckMinWidth }} className="w-full md:w-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div style={{ padding: DECK_PAD }} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
            {deckName === "lower" ? t("seatMap.lowerDeck") : deckName === "upper" ? t("seatMap.upperDeck") : deckName}
          </h4>
          {isLower && (
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              <SteeringWheelIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </span>
          )}
        </div>
        <div className="flex items-start divide-x divide-slate-100 rounded-xl border border-slate-100">
          {panels.map((panel, i) => (
            <Panel
              key={i}
              seats={panel.seats}
              berthType={panel.berthType}
              states={states}
              selectedSet={selectedSet}
              onToggle={onToggle}
              t={t}
              columnCount={columnCounts[i]}
              price={panel.berthType === "sleeper" ? prices?.sleeper : prices?.normal}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// e.g. "Lower Deck Sleeper — 12 Berths" / "Upper Deck Right — 12 Berths"
// (falls back to Left/Right when a deck has two panels of the same berth
// type), matching the reference's four-caption footer strip.
function panelCaption(deck, panel, panelIndex, t) {
  const deckLabel = deck.deckName === "lower" ? t("seatMap.lowerDeck") : deck.deckName === "upper" ? t("seatMap.upperDeck") : deck.deckName;
  const sameTypeSiblings = deck.panels.filter((p) => p.berthType === panel.berthType).length;
  const qualifier = sameTypeSiblings > 1 ? (panelIndex === 0 ? t("seatMap.left") : t("seatMap.right")) : panel.berthType === "sleeper" ? t("seatMap.sleeper") : t("seatMap.seater");
  const unit = panel.berthType === "sleeper" ? t("seatMap.berths") : t("seatMap.seatsUnit");
  const count = panel.seats.filter((seat) => seat.type !== "blocked").length;
  return { title: `${deckLabel} ${qualifier}`, value: `${count} ${unit}` };
}

function SectionedSeatMap({ layout, states, selectedSet, onToggle, t, prices }) {
  const deckNames = [...new Set(layout.map((seat) => seat.deck).filter(Boolean))].sort((a, b) => {
    const ai = DECK_ORDER.indexOf(a);
    const bi = DECK_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const decks = deckNames.map((deckName) => {
    const deckSeats = layout.filter((seat) => seat.deck === deckName);
    const panelNums = [...new Set(deckSeats.map((seat) => seat.panel ?? 0))].sort((a, b) => a - b);
    const panels = panelNums.map((panelNum) => {
      const seats = deckSeats.filter((seat) => (seat.panel ?? 0) === panelNum);
      const berthType = seats.find((seat) => seat.type !== "blocked")?.berthType || "seater";
      return { seats, berthType };
    });
    return { deckName, panels };
  });

  const allPanels = decks.flatMap((deck) => deck.panels);
  const sleeperCount = allPanels
    .filter((panel) => panel.berthType === "sleeper")
    .reduce((sum, panel) => sum + panel.seats.filter((seat) => seat.type !== "blocked").length, 0);
  const seaterCount = allPanels
    .filter((panel) => panel.berthType !== "sleeper")
    .reduce((sum, panel) => sum + panel.seats.filter((seat) => seat.type !== "blocked").length, 0);

  return (
    // Fully fluid: decks are flex children weighted by their own column
    // count, so they naturally divide whatever width is available (no fixed
    // pixel total, no per-deck scrollbar). Mobile stacks them vertically
    // (Lower, then Upper); desktop places them side by side.
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-5 space-y-4">
      <div className="flex flex-col md:flex-row" style={{ gap: DECK_GAP }}>
        {decks.map((deck) => (
          <Deck key={deck.deckName} deckName={deck.deckName} panels={deck.panels} states={states} selectedSet={selectedSet} onToggle={onToggle} t={t} prices={prices} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {decks.flatMap((deck) =>
          deck.panels.map((panel, i) => {
            const { title, value } = panelCaption(deck, panel, i, t);
            const isSleeper = panel.berthType === "sleeper";
            return (
              <div key={`${deck.deckName}-${i}`} className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5">
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
          {t("seatMap.totalPassengers", { sleeper: sleeperCount, seater: seaterCount, total: sleeperCount + seaterCount })}
        </span>
      </div>
    </div>
  );
}

// ── Legend + state colours shared with the sectioned map above ──────────
const legendSwatchClasses = {
  available: "border-2 border-emerald-400 bg-white",
  selected: "bg-amber-400 border-2 border-amber-500",
  locked: "bg-red-50 border-2 border-red-200",
  booked: "bg-slate-100 border-2 border-slate-200",
};

export default function SeatMap({ layout = [], states = {}, selected = [], onChange, prices }) {
  const { t } = useLanguage();
  const selectedSet = new Set(selected);

  const isSectioned = layout.some((seat) => seat.deck);

  const legend = [
    ["available", t("seatMap.available")],
    ["selected", t("seatMap.selected")],
    ["locked", t("seatMap.unavailable")],
    ["booked", t("seatMap.booked")],
  ];

  const toggle = (seatId, state) => {
    if (state === "booked" || state === "locked") return;
    onChange(selectedSet.has(seatId) ? selected.filter((id) => id !== seatId) : [...selected, seatId]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-amber-100/60">
        {legend.map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <i
              className={`w-3 h-3 rounded-sm ${
                isSectioned
                  ? legendSwatchClasses[key]
                  : key === "available"
                  ? "border border-amber-200/30"
                  : key === "selected"
                  ? "bg-amber-300 border border-amber-200"
                  : key === "booked"
                  ? "bg-white/15 border border-white/10"
                  : "bg-red-400/20 border border-red-300/30"
              }`}
            />
            {label}
          </span>
        ))}
      </div>

      {isSectioned ? (
        <SectionedSeatMap layout={layout} states={states} selectedSet={selectedSet} onToggle={toggle} t={t} prices={prices} />
      ) : (
        <FlatSeatMap layout={layout} states={states} selectedSet={selectedSet} onToggle={toggle} t={t} />
      )}

      <p className="text-xs text-amber-100/45">
        {selected.length ? t("seatMap.selectedCount", { n: selected.length, seats: selected.join(", ") }) : t("seatMap.chooseHint")}
      </p>
    </div>
  );
}
