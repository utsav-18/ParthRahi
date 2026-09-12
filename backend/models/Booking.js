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

  fareVariant: { type: String, trim: true },
  totalAmount: { type: Number },
  advanceAmount: { type: Number },
  advancePaid: { type: Number, default: 0 },

  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paymentReferenceId: { type: String, trim: true },
  razorpayOrderId: { type: String, trim: true, index: true },
  razorpayPaymentId: { type: String, trim: true, index: true },
  razorpaySignature: { type: String, trim: true },
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
