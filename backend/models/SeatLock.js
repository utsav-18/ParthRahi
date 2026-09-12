const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema({
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Yatra', required: true },
  seatId: { type: String, required: true, trim: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  holdToken: { type: String, trim: true, index: true, select: false },
  status: { type: String, enum: ['locked', 'booked'], default: 'locked', index: true },
  expiresAt: { type: Date },
}, { timestamps: true });

seatLockSchema.index({ yatraId: 1, seatId: 1 }, { unique: true });
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SeatLock', seatLockSchema);