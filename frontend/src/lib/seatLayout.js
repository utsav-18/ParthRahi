// Shared helpers for a Yatra's `seatLayout` — the single description of the
// physical bus used by that yatra. Used by the customer SeatMap, the booking
// page and the admin bus-layout editor, so all of them agree on what a seat
// is, how it is grouped and how it is counted.
//
// A layout entry (see backend/models/Yatra.js seatSchema):
//   { seatId, label, row, column, type: 'seat' | 'blocked',
//     deck: 'lower' | 'upper' | 'main', panel: 0..n, berthType: 'seater' | 'sleeper' }
// `deck`/`panel`/`berthType` are optional — older yatras (and yatras with no
// layout at all) have plain row/column seats.

export const DECK_ORDER = ["lower", "main", "upper"];

// Same rule as the backend (bookingRoutes availability/lock and the admin
// totalSeats check): every entry except a blocked placeholder is a seat.
export const isBookable = (seat) => seat?.type !== "blocked";

export const berthOf = (seat) => (seat?.berthType === "sleeper" ? "sleeper" : "seater");

// Mirrors backend getLayout()'s fallback for a yatra saved without a layout,
// so the admin preview shows exactly the seats customers are offered.
export function fallbackLayout(totalSeats) {
  const n = Math.max(0, Number(totalSeats) || 0);
  return Array.from({ length: n }, (_, i) => ({
    seatId: `S${i + 1}`,
    label: `S${i + 1}`,
    row: Math.floor(i / 4) + 1,
    column: (i % 4) + 1,
    type: "seat",
  }));
}

/**
 * Returns a layout where every entry has deck/panel/berthType, without
 * touching seat IDs, labels or types. Layouts that already carry deck data are
 * returned as-is (berthType defaulted). A plain row/column grid is shown as a
 * single-deck coach: its columns are split into a left and right section with
 * the aisle in between (a 4-across grid becomes 2 + 2).
 */
export function normalizeLayout(layout = []) {
  if (!layout.length) return [];
  if (layout.some((seat) => seat.deck)) {
    return layout.map((seat) => ({ ...seat, deck: seat.deck || "main", panel: seat.panel ?? 0, berthType: berthOf(seat) }));
  }
  const maxCol = Math.max(...layout.map((seat) => Number(seat.column) || 1));
  const split = maxCol > 1 ? Math.ceil(maxCol / 2) : maxCol;
  return layout.map((seat) => {
    const col = Number(seat.column) || 1;
    const right = maxCol > 1 && col > split;
    return {
      ...seat,
      deck: "main",
      panel: right ? 1 : 0,
      column: right ? col - split : col,
      berthType: berthOf(seat),
    };
  });
}

export function sortDecks(names) {
  return [...names].sort((a, b) => {
    const ai = DECK_ORDER.indexOf(a);
    const bi = DECK_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

/** Groups a normalized layout into decks → sections (panels), in display order. */
export function groupLayout(layout = []) {
  const normalized = normalizeLayout(layout);
  return sortDecks([...new Set(normalized.map((seat) => seat.deck))]).map((deck) => {
    const deckSeats = normalized.filter((seat) => seat.deck === deck);
    const panelNums = [...new Set(deckSeats.map((seat) => seat.panel ?? 0))].sort((a, b) => a - b);
    return {
      deck,
      sections: panelNums.map((panel) => {
        const seats = deckSeats.filter((seat) => (seat.panel ?? 0) === panel);
        const firstSeat = seats.find(isBookable) || seats[0];
        return { panel, seats, berthType: berthOf(firstSeat) };
      }),
    };
  });
}

/** Bookable / seater / sleeper / blocked counts — blocked cells never count as seats. */
export function countLayout(layout = []) {
  const counts = { bookable: 0, seater: 0, sleeper: 0, blocked: 0 };
  for (const seat of layout) {
    if (!isBookable(seat)) {
      counts.blocked += 1;
      continue;
    }
    counts.bookable += 1;
    counts[berthOf(seat)] += 1;
  }
  return counts;
}

/**
 * Builds the entries for one section of a bus (e.g. "lower deck, sleeper,
 * 6 rows × 2"). Seats are numbered row by row: `${prefix}${start}`, … The last
 * row can hold a different number of seats (a 3- or 5-seat back bench).
 */
export function generateSection({ deck, panel, berthType, rows, perRow, lastRow, prefix = "", start = 1 }) {
  const seats = [];
  let n = Number(start) || 1;
  const rowCount = Math.max(0, Number(rows) || 0);
  const across = Math.max(0, Number(perRow) || 0);
  const back = Number(lastRow) > 0 ? Number(lastRow) : across;
  for (let r = 1; r <= rowCount; r += 1) {
    const inRow = r === rowCount ? back : across;
    for (let c = 1; c <= inRow; c += 1) {
      const id = `${prefix}${n}`;
      seats.push({ seatId: id, label: id, row: r, column: c, type: "seat", deck, panel, berthType });
      n += 1;
    }
  }
  return seats;
}

/** Converts a seat into a blocked placeholder (or back) without changing its ID. */
export function toggleBlocked(layout, seatId) {
  return layout.map((seat) =>
    seat.seatId === seatId ? { ...seat, type: isBookable(seat) ? "blocked" : "seat" } : seat
  );
}
