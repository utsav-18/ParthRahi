const Yatra = require('../models/Yatra');
const Booking = require('../models/Booking');

/**
 * Calculates the exact number of reserved seats belonging to confirmed bookings for a given yatra.
 * Only 'confirmed' bookings are counted. Cancelled, pending, failed, or expired records are ignored.
 * Handles both seatIds array (multi-seat selection) and legacy numberOfSeats field.
 */
const getConfirmedSeatsForYatra = async (yatraId) => {
  const confirmedBookings = await Booking.find({
    yatraId,
    bookingStatus: 'confirmed',
  }).select('numberOfSeats seatIds').lean();

  return confirmedBookings.reduce((sum, b) => {
    const count = Array.isArray(b.seatIds) && b.seatIds.length > 0 ? b.seatIds.length : (b.numberOfSeats || 0);
    return sum + count;
  }, 0);
};

/**
 * Reconciles yatra.seatsBooked with confirmed bookings for a single yatra.
 * Updates yatra.seatsBooked in the database if it has drifted.
 */
const reconcileYatraSeats = async (yatraId) => {
  const confirmedSeats = await getConfirmedSeatsForYatra(yatraId);
  await Yatra.updateOne({ _id: yatraId }, { $set: { seatsBooked: confirmedSeats } });
  return confirmedSeats;
};

/**
 * Reconciles seatsBooked for all yatras in the database.
 * Safe to run as a migration/synchronization script.
 */
const reconcileAllYatras = async () => {
  const yatras = await Yatra.find({}, '_id seatsBooked');
  let reconciledCount = 0;
  for (const y of yatras) {
    const confirmedSeats = await getConfirmedSeatsForYatra(y._id);
    if (y.seatsBooked !== confirmedSeats) {
      await Yatra.updateOne({ _id: y._id }, { $set: { seatsBooked: confirmedSeats } });
      reconciledCount++;
    }
  }
  return reconciledCount;
};

module.exports = {
  getConfirmedSeatsForYatra,
  reconcileYatraSeats,
  reconcileAllYatras,
};
