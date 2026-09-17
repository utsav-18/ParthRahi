const mongoose = require('mongoose');
const crypto = require('crypto');

const generateReference = () => {
  const raw = crypto.randomBytes(4).toString('hex').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `PR-YTR-${raw.slice(0, 5)}`;
};

const bookingSchema = new mongoose.Schema({
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Yatra', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

  bookingReference: { type: String, unique: true, index: true },

  travelerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  city: { type: String, trim: true },
  pickupPoint: { type: String, trim: true },

  numberOfSeats: { type: Number, required: true, min: 1 },
  seatIds: { type: [String], default: undefined },

  // Snapshot of the journey details as they were when this booking was made
  // (title/start/destination from the Yatra, plus the departure date the
  // customer actually picked). Deliberately NOT re-read from the live Yatra
  // document later — if an admin edits the route or the yatra gets new
  // dates, past receipts must keep showing what was really booked. Legacy
  // bookings made before this field existed will have it undefined; the
  // receipt falls back to the live Yatra doc only for those.
  journeySnapshot: {
    yatraTitle: { type: String, trim: true },
    startingPoint: { type: String, trim: true },
    destination: { type: String, trim: true },
    departureDate: { type: Date },
  },

  // Legacy field from the old food/fare-variant pricing model — no longer
  // written by new bookings, kept only so any pre-existing record (if one
  // ever had it set) still reads back cleanly.
  fareVariant: { type: String, trim: true },
  // Snapshot of the per-seat-type prices actually charged at booking time.
  // Deliberately NOT derived from the live Yatra.price on read — if the
  // admin changes prices later, this booking's receipt/summary must keep
  // showing what was actually paid.
  fareBreakdown: {
    normalSeats: { type: Number, default: 0 },
    normalSeatPrice: { type: Number, default: 0 },
    sleeperSeats: { type: Number, default: 0 },
    sleeperSeatPrice: { type: Number, default: 0 },
  },
  totalAmount: { type: Number },
  advanceAmount: { type: Number },
  advancePaid: { type: Number, default: 0 },

  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paymentReferenceId: { type: String, trim: true },
  razorpayOrderId: { type: String, trim: true, index: true },
  razorpayPaymentId: { type: String, trim: true, index: true },
  razorpaySignature: { type: String, trim: true },
  // When the payment actually completed — set once, inside completePayment(),
  // preferring Razorpay's own payment.created_at over our server clock.
  // Never the PDF-generation time; that's a completely different moment and
  // must not be confused with this.
  paidAt: { type: Date },
  holdToken: { type: String, trim: true, index: true, select: false },
  bookingStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },

  notes: { type: String, trim: true },
}, { timestamps: true });

bookingSchema.pre('validate', function () {
  if (!this.bookingReference) {
    this.bookingReference = generateReference();
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.generateReference = generateReference;
