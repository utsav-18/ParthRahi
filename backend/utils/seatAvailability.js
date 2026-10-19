const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');

const getLayout = (yatra) => {
  if (Array.isArray(yatra.seatLayout) && yatra.seatLayout.length) return yatra.seatLayout;
  return Array.from({ length: yatra.totalSeats }, (_, i) => ({
    seatId: `S${i + 1}`,
    label: `S${i + 1}`,
    row: Math.floor(i / 4) + 1,
    column: (i % 4) + 1,
    type: 'seat',
  }));
};

async function getSeatAvailability(yatra) {
  const layout = getLayout(yatra);
  const bookableLayout = layout.filter((seat) => seat.type !== 'blocked');
  const [bookings, locks] = await Promise.all([
    Booking.find({
      yatraId: yatra._id,
      bookingStatus: 'confirmed',
      seatIds: { $exists: true, $ne: [] },
    }).select('seatIds').lean(),
    SeatLock.find({
      yatraId: yatra._id,
      $or: [
        { status: 'booked' },
        { status: 'permanently_locked' },
        { status: 'locked', expiresAt: { $gt: new Date() } },
      ],
    }).select('seatId status').lean(),
  ]);

  const booked = new Set(bookings.flatMap((booking) => booking.seatIds || []));
  const permanent = new Set(locks.filter((lock) => lock.status === 'permanently_locked').map((lock) => lock.seatId));
  const locked = new Set(locks.filter((lock) => lock.status === 'locked').map((lock) => lock.seatId));
  const seats = bookableLayout.map((seat) => ({
    seatId: seat.seatId,
    state: booked.has(seat.seatId) ? 'booked'
      : permanent.has(seat.seatId) ? 'permanently_locked'
        : locked.has(seat.seatId) ? 'locked'
          : 'available',
  }));

  return {
    layout,
    seats,
    totalBookableCount: bookableLayout.length,
    availableCount: seats.filter((seat) => seat.state === 'available').length,
  };
}

module.exports = { getLayout, getSeatAvailability };
