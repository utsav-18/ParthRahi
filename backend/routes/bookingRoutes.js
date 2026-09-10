const express = require('express');
const rateLimit = require('express-rate-limit');
const Yatra = require('../models/Yatra');
const Booking = require('../models/Booking');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many booking attempts, please try again later.' },
});

const phoneRegex = /^(\+?[1-9]\d{0,3})?[\s-]?\d{10}$/;

// POST /api/bookings — reserve seats (payment handled out-of-band)
router.post('/', bookingLimiter, optionalAuth, async (req, res) => {
  const {
    yatraSlug, yatraId: yatraIdRaw,
    travelerName, phone, email, city, pickupPoint,
    numberOfSeats, fareVariant,
  } = req.body;

  const seats = parseInt(numberOfSeats, 10);
  if (!travelerName || !String(travelerName).trim()) {
    return res.status(400).json({ error: 'Traveler name is required' });
  }
  if (!phone || !phoneRegex.test(String(phone).trim().replace(/[\s-]/g, ''))) {
    return res.status(400).json({ error: 'A valid mobile number is required' });
  }
  if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
    return res.status(400).json({ error: 'Number of seats must be between 1 and 20' });
  }

  try {
    const baseQuery = yatraSlug
      ? { slug: String(yatraSlug).toLowerCase() }
      : { _id: yatraIdRaw };

    const yatra = await Yatra.findOne(baseQuery);
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    if (yatra.status !== 'published') {
      return res.status(409).json({ error: 'Bookings are closed for this yatra' });
    }

    // Resolve fare
    let unitPrice = yatra.price.amount;
    if (fareVariant && Array.isArray(yatra.price.variants)) {
      const v = yatra.price.variants.find((x) => x.label === fareVariant);
      if (v && typeof v.amount === 'number') unitPrice = v.amount;
    }
    const totalAmount = unitPrice * seats;
    const advanceAmount = (yatra.price.advanceAmount || 0) * seats;

    // Atomic seat reservation — safe without transactions (single-doc update).
    const reserved = await Yatra.findOneAndUpdate(
      {
        _id: yatra._id,
        status: 'published',
        $expr: { $lte: [{ $add: ['$seatsBooked', seats] }, '$totalSeats'] },
      },
      { $inc: { seatsBooked: seats } },
      { returnDocument: 'after' }
    );

    if (!reserved) {
      return res.status(409).json({ error: 'Not enough seats available for this yatra' });
    }

    let booking;
    try {
      booking = await Booking.create({
        yatraId: yatra._id,
        userId: req.user ? req.user._id : undefined,
        travelerName: String(travelerName).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : undefined,
        city: city ? String(city).trim() : undefined,
        pickupPoint: pickupPoint ? String(pickupPoint).trim() : undefined,
        numberOfSeats: seats,
        fareVariant: fareVariant || undefined,
        totalAmount,
        advanceAmount,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
      });
    } catch (err) {
      // Roll back the seat hold if booking creation failed.
      await Yatra.updateOne({ _id: yatra._id }, { $inc: { seatsBooked: -seats } });
      throw err;
    }

    res.status(201).json({
      message: 'Seats reserved. Complete the advance payment to confirm your booking.',
      booking: {
        bookingReference: booking.bookingReference,
        travelerName: booking.travelerName,
        numberOfSeats: booking.numberOfSeats,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        yatra: { title: yatra.title, slug: yatra.slug },
      },
    });
  } catch (error) {
    console.error('Create booking error:', error && error.stack ? error.stack : error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/:bookingReference — confirmation lookup (reference is the secret)
router.get('/:bookingReference', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.bookingReference })
      .populate('yatraId', 'title slug startingPoint departureDates durationDays durationNights');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error.message);
    res.status(500).json({ error: 'Failed to load booking' });
  }
});

module.exports = router;
