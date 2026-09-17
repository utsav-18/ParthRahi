const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');

const BRAND_COLOR = '#b8860b'; // amber/gold, matches the site's accent
const INK = '#1f2933';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

// PDFKit's 14 built-in fonts (Helvetica etc.) only support WinAnsi/Latin-1 —
// they have no Devanagari glyphs, so any Hindi text (e.g. a yatra title) sent
// through them renders as .notdef boxes/garbage. This is the actual official
// logo asset (frontend/public/logo.svg, copied here so the backend doesn't
// depend on the frontend folder existing at deploy time) and a bundled
// Unicode font that covers both Devanagari and Latin — both are loaded
// defensively so a missing asset degrades the receipt instead of crashing it.
const UNICODE_FONT_PATH = path.join(__dirname, '../assets/fonts/NotoSansDevanagari-Regular.ttf');
const LOGO_SVG_PATH = path.join(__dirname, '../assets/images/logo.svg');
const UNICODE_FONT_AVAILABLE = fs.existsSync(UNICODE_FONT_PATH);
const LOGO_SVG = fs.existsSync(LOGO_SVG_PATH) ? fs.readFileSync(LOGO_SVG_PATH, 'utf8') : null;
if (!UNICODE_FONT_AVAILABLE) {
  console.warn('[Receipt] Unicode font missing at', UNICODE_FONT_PATH, '— non-Latin booking/yatra text may not render correctly.');
}

// Value cells hold real database content (names, yatra titles, place names)
// which may be in Hindi/Devanagari — always render those with the bundled
// Unicode font (it has full Latin coverage too). Static labels we author
// ourselves are always plain ASCII, so they keep using the standard fonts.
const valueFont = () => (UNICODE_FONT_AVAILABLE ? 'Unicode' : 'Helvetica-Bold');

const formatCurrency = (amount) => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
};

const formatDate = (value, withTime = false) => {
  if (!value) return 'To be announced';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'To be announced';
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  if (withTime) return d.toLocaleString('en-IN', { ...opts, hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', opts);
};

// LEGACY FALLBACK ONLY: bookings made before journeySnapshot existed have no
// record of which date the customer actually picked. For those (only those
// — see streamReceiptPdf below), approximate with the yatra's next upcoming
// departure date, same convention as the frontend's format.js:nextDeparture.
const legacyNextDeparture = (departureDates = []) => {
  const now = new Date();
  const dates = (departureDates || [])
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);
  const next = dates.find((d) => d >= now) || dates[dates.length - 1];
  return next ? formatDate(next) : 'Not available';
};

const row = (doc, label, value, x, y, width) => {
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(label, x, y, { width });
  doc.font(valueFont()).fontSize(10.5).fillColor(INK).text(value ?? '—', x, y + 13, { width });
};

/**
 * Streams a one-page A4 payment receipt for a confirmed booking directly to
 * an Express response. Only ever fed data already loaded from the database
 * by the caller — never trusts client input.
 */
function streamReceiptPdf(res, { booking, yatra }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ParthRahi-Receipt-${booking.bookingReference}.pdf"`);
  doc.pipe(res);

  if (UNICODE_FONT_AVAILABLE) doc.registerFont('Unicode', UNICODE_FONT_PATH);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  // ── Header ──────────────────────────────────────────────
  const LOGO_SIZE = 36;
  let brandTextX = left;
  if (LOGO_SVG) {
    // preserveAspectRatio keeps the (square) logo undistorted regardless of
    // the box it's placed in.
    SVGtoPDF(doc, LOGO_SVG, left, 46, { width: LOGO_SIZE, height: LOGO_SIZE, preserveAspectRatio: 'xMidYMid meet' });
    brandTextX = left + LOGO_SIZE + 12;
  }
  doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_COLOR).text('ParthRahi', brandTextX, 50);
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text('Guided Pilgrimage & Group Tours', brandTextX, 76);

  // No "Issued" timestamp here on purpose — PDF-generation time (i.e. whenever
  // someone happens to click download) is not the payment time and must
  // never be labelled as one. The actual payment moment is shown further
  // down, in Payment Details, from booking.paidAt.
  doc.font('Helvetica-Bold').fontSize(16).fillColor(INK).text('Payment Receipt', left, 50, { width: pageWidth, align: 'right' });

  doc.moveTo(left, 100).lineTo(left + pageWidth, 100).strokeColor(LINE).lineWidth(1).stroke();

  // ── Status + reference ─────────────────────────────────
  const paid = booking.paymentStatus === 'paid';
  doc.font('Helvetica-Bold').fontSize(11).fillColor(paid ? '#15803d' : '#b45309')
    .text(paid ? 'PAYMENT SUCCESSFUL' : String(booking.paymentStatus || '').toUpperCase() || 'PENDING', left, 116);
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Booking Reference', left, 140);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(INK).text(booking.bookingReference, left, 154);

  // ── Passenger details ───────────────────────────────────
  let y = 190;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text('Passenger Details', left, y);
  y += 20;
  const colWidth = pageWidth / 2 - 10;
  row(doc, 'Passenger Name', booking.travelerName || '—', left, y, colWidth);
  row(doc, 'Mobile Number', booking.phone || '—', left + colWidth + 20, y, colWidth);
  y += 40;
  row(doc, 'Email', booking.email || 'Not provided', left, y, pageWidth);

  // ── Journey details ─────────────────────────────────────
  // Journey info comes from booking.journeySnapshot — frozen at the moment
  // this booking was made — NOT from the live `yatra` document. An admin
  // editing the yatra's route/title/dates later must never change what a
  // past receipt shows. `yatra` (the current document) is only ever used
  // as a fallback for bookings made before this snapshot existed.
  const snapshot = booking.journeySnapshot;
  const yatraTitle = snapshot?.yatraTitle || yatra?.title || 'ParthRahi Yatra';
  const startLocation = snapshot?.startingPoint || yatra?.startingPoint || 'Not available';
  const journeyDateLabel = snapshot?.departureDate ? formatDate(snapshot.departureDate) : legacyNextDeparture(yatra?.departureDates);

  y += 45;
  doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(LINE).lineWidth(1).stroke();
  y += 16;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text('Journey Details', left, y);
  y += 20;
  row(doc, 'Yatra / Tour', yatraTitle, left, y, pageWidth);
  y += 40;
  row(doc, 'Journey Date', journeyDateLabel, left, y, colWidth);
  row(doc, 'Seats Booked', booking.seatIds?.length ? booking.seatIds.join(', ') : booking.numberOfSeats ? `${booking.numberOfSeats} seat(s)` : 'N/A', left + colWidth + 20, y, colWidth);
  y += 40;
  row(doc, 'Start Location', startLocation, left, y, colWidth);

  // ── Fare breakdown ───────────────────────────────────────
  y += 45;
  doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(LINE).lineWidth(1).stroke();
  y += 16;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text('Fare Breakdown', left, y);
  y += 22;

  // Seat-type breakdown is a snapshot taken at booking time (Booking.fareBreakdown)
  // — it always reflects what was actually charged, even if the admin has
  // since changed the Yatra's Normal/Sleeper prices. Older bookings made
  // before this field existed fall back to a plain total.
  const breakdown = booking.fareBreakdown;
  const fareRows = [];
  if (breakdown?.normalSeats) {
    fareRows.push(['Normal Seat', `${breakdown.normalSeats} × ${formatCurrency(breakdown.normalSeatPrice)} = ${formatCurrency(breakdown.normalSeats * breakdown.normalSeatPrice)}`]);
  }
  if (breakdown?.sleeperSeats) {
    fareRows.push(['Sleeper Seat', `${breakdown.sleeperSeats} × ${formatCurrency(breakdown.sleeperSeatPrice)} = ${formatCurrency(breakdown.sleeperSeats * breakdown.sleeperSeatPrice)}`]);
  }
  fareRows.push(['Total Fare', formatCurrency(booking.totalAmount)]);
  // New bookings always pay the full total (no advance/partial option), so
  // this naturally shows the full amount for them. booking.advanceAmount
  // only remains set on bookings made before advance payments were removed
  // — kept here so those older receipts still show what was actually paid.
  const amountPaid = paid ? (booking.advanceAmount || booking.totalAmount) : booking.advancePaid || 0;
  fareRows.push(['Amount Paid', formatCurrency(amountPaid)]);

  for (const [label, value] of fareRows) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(label, left, y, { width: pageWidth * 0.6 });
    doc.font(valueFont()).fontSize(10).fillColor(INK).text(value, left, y, { width: pageWidth, align: 'right' });
    y += 18;
  }

  // ── Payment details ──────────────────────────────────────
  // Payment Date & Time is booking.paidAt — set once, inside completePayment(),
  // preferring Razorpay's own payment.created_at. It is never the moment this
  // PDF happens to be generated, and never the browser/frontend clock. Older
  // paid bookings made before paidAt existed fall back to updatedAt (the
  // Mongoose save that confirmed them), which is a reasonable proxy but not
  // exact — never "Not available" for a booking that IS marked paid, since
  // that would look like the payment never happened.
  const paymentTimestamp = paid ? (booking.paidAt || booking.updatedAt) : null;
  const BOX_HEIGHT = 114;
  y += 10;
  doc.rect(left, y, pageWidth, BOX_HEIGHT).fillAndStroke('#faf7f0', LINE);
  const padY = y + 12;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Payment Details', left + 14, padY);
  row(doc, 'Payment Status', paid ? 'Paid' : booking.paymentStatus || 'Pending', left + 14, padY + 18, colWidth);
  row(doc, 'Payment Date & Time', paymentTimestamp ? formatDate(paymentTimestamp, true) : 'Not available', left + colWidth + 20, padY + 18, colWidth - 14);
  row(doc, 'Razorpay Payment ID', booking.razorpayPaymentId || 'N/A', left + 14, padY + 58, colWidth);
  row(doc, 'Razorpay Order ID', booking.razorpayOrderId || 'N/A', left + colWidth + 20, padY + 58, colWidth - 14);
  y += BOX_HEIGHT;

  y += 16;
  row(doc, 'Booking Created', formatDate(booking.createdAt, true), left, y, pageWidth);

  // ── Footer ───────────────────────────────────────────────
  const footerY = doc.page.height - doc.page.margins.bottom - 40;
  doc.moveTo(left, footerY).lineTo(left + pageWidth, footerY).strokeColor(LINE).lineWidth(1).stroke();
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(MUTED)
    .text('This is a computer-generated receipt and does not require a signature.', left, footerY + 10, { width: pageWidth, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor(MUTED)
    .text('ParthRahi · For support, contact us via the number listed on parthrahi.com', left, footerY + 22, { width: pageWidth, align: 'center' });

  doc.end();
}

module.exports = { streamReceiptPdf };
