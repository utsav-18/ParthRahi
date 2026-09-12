const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Yatra = require('../models/Yatra');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();
const HOLD_MINUTES = Number(process.env.SEAT_HOLD_MINUTES) || 5;
const phoneRegex = /^(\+?[1-9]\d{0,3})?[\s-]?\d{10}$/;
const bookingLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many booking attempts, please try again later.' } });

const readEnvValue = (name) => {
  const value = String(process.env[name] || '').trim();
  return value.replace(/^(['"])(.*)\1$/, '$2').trim();
};

const getRazorpayConfig = () => ({
  keyId: readEnvValue('RAZORPAY_KEY_ID'),
  keySecret: readEnvValue('RAZORPAY_KEY_SECRET'),
});

const keyPrefix = (keyId) => {
  const parts = keyId.split('_');
  return parts.length >= 2 ? `${parts[0]}_${parts[1]}_...` : ' unavailable';
};

const logRazorpayError = (context, error, keyId) => {
  const details = error?.error || error?.response?.data?.error || {};
  console.error(`${context}:`, JSON.stringify({
    httpStatus: error?.statusCode || error?.response?.status || error?.status || null,
    code: details.code || error?.code || null,
    description: details.description || error?.description || null,
    keyIdPresent: Boolean(keyId),
    keyIdPrefix: keyPrefix(keyId),
  }));
};

const publicBooking = (booking, yatra) => ({
  bookingReference: booking.bookingReference, travelerName: booking.travelerName, phone: booking.phone, email: booking.email,
  numberOfSeats: booking.numberOfSeats, seatIds: booking.seatIds, fareVariant: booking.fareVariant, totalAmount: booking.totalAmount,
  advanceAmount: booking.advanceAmount, paymentStatus: booking.paymentStatus, bookingStatus: booking.bookingStatus,
  razorpayOrderId: booking.razorpayOrderId, razorpayPaymentId: booking.razorpayPaymentId,
  yatra: yatra ? { title: yatra.title, slug: yatra.slug } : undefined,
});

const profileBooking = (booking) => ({
  bookingReference: booking.bookingReference,
  travelerName: booking.travelerName,
  seatIds: booking.seatIds || [],
  numberOfSeats: booking.numberOfSeats,
  totalAmount: booking.totalAmount,
  advanceAmount: booking.advanceAmount,
  amountPaid: booking.paymentStatus === 'paid' ? (booking.advanceAmount || booking.totalAmount || 0) : 0,
  paymentStatus: booking.paymentStatus,
  bookingStatus: booking.bookingStatus,
  razorpayPaymentId: booking.razorpayPaymentId,
  createdAt: booking.createdAt,
  yatra: booking.yatraId ? {
    title: booking.yatraId.title,
    slug: booking.yatraId.slug,
    startingPoint: booking.yatraId.startingPoint,
    route: booking.yatraId.route,
    departureDates: booking.yatraId.departureDates,
    departureTime: booking.yatraId.departureTime,
    durationDays: booking.yatraId.durationDays,
    durationNights: booking.yatraId.durationNights,
  } : null,
});

const getLayout = (yatra) => {
  if (Array.isArray(yatra.seatLayout) && yatra.seatLayout.length) return yatra.seatLayout;
  return Array.from({ length: yatra.totalSeats }, (_, i) => ({ seatId: `S${i + 1}`, label: `S${i + 1}`, row: Math.floor(i / 4) + 1, column: (i % 4) + 1, type: 'seat' }));
};

const resolveYatra = (body) => Yatra.findOne(body.yatraSlug ? { slug: String(body.yatraSlug).toLowerCase() } : { _id: body.yatraId });

const resolvePrice = (yatra, fareVariant, count) => {
  let unitPrice = yatra.price.amount;
  if (fareVariant) {
    const variant = (yatra.price.variants || []).find((item) => item.label === fareVariant);
    if (!variant) return null;
    unitPrice = variant.amount;
  }
  return { totalAmount: unitPrice * count, advanceAmount: (yatra.price.advanceAmount || 0) * count };
};

const ownerMatches = (booking, req, holdToken) => Boolean(holdToken && booking.holdToken === holdToken && (!booking.userId || (req.user && String(booking.userId) === String(req.user._id))));

const expectedPaymentAmount = (booking) => Math.round((booking.advanceAmount || booking.totalAmount) * 100);

const verifyPaymentWithRazorpay = async (booking, orderId, paymentId) => {
  const { keyId, keySecret } = getRazorpayConfig();
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(orderId),
    razorpay.payments.fetch(paymentId),
  ]);
  if (order.id !== booking.razorpayOrderId || order.receipt !== booking.bookingReference || order.amount !== expectedPaymentAmount(booking)) {
    throw Object.assign(new Error('Payment order does not match the booking'), { status: 400 });
  }
  if (payment.id !== paymentId || payment.order_id !== orderId || payment.amount !== order.amount || !['authorized', 'captured'].includes(payment.status)) {
    throw Object.assign(new Error('Payment details are not valid for this booking'), { status: 400 });
  }
};

const completePayment = async ({ booking, paymentId, orderId, signature }) => {
  const session = await mongoose.startSession();
  try {
    let confirmed;
    await session.withTransaction(async () => {
      const current = await Booking.findById(booking._id).select('+holdToken').session(session);
      if (!current) throw Object.assign(new Error('Booking not found'), { status: 404 });
      if (current.bookingStatus === 'confirmed' && current.razorpayPaymentId === paymentId) { confirmed = current; return; }
      if (current.bookingStatus !== 'pending' || current.razorpayOrderId !== orderId) throw Object.assign(new Error('Booking is no longer payable'), { status: 409 });
      const locks = await SeatLock.find({ bookingId: current._id, status: 'locked', expiresAt: { $gt: new Date() } }).session(session);
      if (locks.length !== (current.seatIds || []).length) throw Object.assign(new Error('The seat hold has expired. Please select your seats again.'), { status: 409 });
      current.paymentStatus = 'paid'; current.bookingStatus = 'confirmed'; current.paymentReferenceId = paymentId;
      current.razorpayPaymentId = paymentId; current.razorpayOrderId = orderId; current.razorpaySignature = signature;
      await current.save({ session });
      await Yatra.updateOne({ _id: current.yatraId }, { $inc: { seatsBooked: current.numberOfSeats } }).session(session);
      await SeatLock.updateMany({ bookingId: current._id }, { $set: { status: 'booked', expiresAt: null } }).session(session);
      confirmed = current;
    });
    return confirmed;
  } finally { await session.endSession(); }
};

// Legacy capacity booking remains available for historical callers. New UI uses /lock.
router.post('/', bookingLimiter, requireAuth, async (req, res) => {
  const { travelerName, phone, email, city, pickupPoint, numberOfSeats, fareVariant } = req.body;
  const seats = parseInt(numberOfSeats, 10);
  if (!travelerName || !String(travelerName).trim()) return res.status(400).json({ error: 'Traveler name is required' });
  if (!phone || !phoneRegex.test(String(phone).trim().replace(/[\s-]/g, ''))) return res.status(400).json({ error: 'A valid mobile number is required' });
  if (!Number.isInteger(seats) || seats < 1 || seats > 20) return res.status(400).json({ error: 'Number of seats must be between 1 and 20' });
  try {
    const yatra = await resolveYatra(req.body);
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    if (yatra.status !== 'published') return res.status(409).json({ error: 'Bookings are closed for this yatra' });
    const price = resolvePrice(yatra, fareVariant, seats);
    if (!price) return res.status(400).json({ error: 'Selected fare is not available' });
    const reserved = await Yatra.findOneAndUpdate({ _id: yatra._id, status: 'published', $expr: { $lte: [{ $add: ['$seatsBooked', seats] }, '$totalSeats'] } }, { $inc: { seatsBooked: seats } }, { returnDocument: 'after' });
    if (!reserved) return res.status(409).json({ error: 'Not enough seats available for this yatra' });
    try {
      const booking = await Booking.create({ yatraId: yatra._id, userId: req.user._id, travelerName: String(travelerName).trim(), phone: String(phone).trim(), email: email ? String(email).trim() : undefined, city, pickupPoint, numberOfSeats: seats, fareVariant, ...price, paymentStatus: 'pending', bookingStatus: 'pending' });
      return res.status(201).json({ message: 'Seats reserved. Complete payment to confirm your booking.', booking: publicBooking(booking, yatra) });
    } catch (error) { await Yatra.updateOne({ _id: yatra._id }, { $inc: { seatsBooked: -seats } }); throw error; }
  } catch (error) { console.error('Create legacy booking error:', error.message); return res.status(500).json({ error: 'Failed to create booking' }); }
});

router.get('/availability/:slug', optionalAuth, async (req, res) => {
  try {
    const yatra = await Yatra.findOne({ slug: String(req.params.slug).toLowerCase(), status: { $in: ['published', 'closed'] } });
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    const layout = getLayout(yatra).filter((seat) => seat.type !== 'blocked');
    const bookings = await Booking.find({ yatraId: yatra._id, bookingStatus: 'confirmed', seatIds: { $exists: true, $ne: [] } }).select('seatIds').lean();
    const booked = new Set(bookings.flatMap((booking) => booking.seatIds || []));
    const locks = await SeatLock.find({ yatraId: yatra._id, $or: [{ status: 'booked' }, { status: 'locked', expiresAt: { $gt: new Date() } }] }).select('seatId').lean();
    const locked = new Set(locks.map((lock) => lock.seatId));
    res.json({ layout, seats: layout.map((seat) => ({ seatId: seat.seatId, state: booked.has(seat.seatId) ? 'booked' : locked.has(seat.seatId) ? 'locked' : 'available' })) });
  } catch (error) { console.error('Seat availability error:', error.message); res.status(500).json({ error: 'Failed to load seat availability' }); }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id, bookingStatus: 'confirmed' })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('yatraId', 'title slug startingPoint route departureDates departureTime durationDays durationNights')
      .lean();
    res.json({ bookings: bookings.map(profileBooking) });
  } catch (error) {
    console.error('Get user bookings error:', error.message);
    res.status(500).json({ error: 'Failed to load your bookings' });
  }
});

router.post('/lock', bookingLimiter, requireAuth, async (req, res) => {
  const { seatIds, travelerName, phone, email, city, pickupPoint, fareVariant } = req.body;
  if (!Array.isArray(seatIds) || seatIds.length < 1 || seatIds.length > 20) return res.status(400).json({ error: 'Select between 1 and 20 seats' });
  const normalizedSeats = seatIds.map((seat) => String(seat).trim());
  if (new Set(normalizedSeats).size !== normalizedSeats.length) return res.status(400).json({ error: 'Duplicate seats are not allowed' });
  if (!travelerName || !String(travelerName).trim()) return res.status(400).json({ error: 'Traveler name is required' });
  if (!phone || !phoneRegex.test(String(phone).trim().replace(/[\s-]/g, ''))) return res.status(400).json({ error: 'A valid mobile number is required' });
  try {
    const yatra = await resolveYatra(req.body);
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    if (yatra.status !== 'published') return res.status(409).json({ error: 'Bookings are closed for this yatra' });
    const validSeats = new Set(getLayout(yatra).filter((seat) => seat.type !== 'blocked').map((seat) => seat.seatId));
    if (normalizedSeats.some((seat) => !validSeats.has(seat))) return res.status(400).json({ error: 'One or more selected seats are invalid for this yatra' });
    const price = resolvePrice(yatra, fareVariant, normalizedSeats.length);
    if (!price) return res.status(400).json({ error: 'Selected fare is not available' });
    const holdToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    const booking = new Booking({ yatraId: yatra._id, userId: req.user._id, travelerName: String(travelerName).trim(), phone: String(phone).trim(), email: email ? String(email).trim() : undefined, city, pickupPoint, numberOfSeats: normalizedSeats.length, seatIds: normalizedSeats, fareVariant, ...price, holdToken, paymentStatus: 'pending', bookingStatus: 'pending' });
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // MongoDB's TTL monitor is asynchronous. Remove only expired temporary
        // locks for these requested seats before relying on the unique index.
        await SeatLock.deleteMany({
          yatraId: yatra._id,
          seatId: { $in: normalizedSeats },
          status: 'locked',
          expiresAt: { $lte: new Date() },
        }, { session });
        await booking.save({ session });
        await SeatLock.insertMany(normalizedSeats.map((seatId) => ({ yatraId: yatra._id, seatId, bookingId: booking._id, userId: req.user?._id, holdToken, expiresAt })), { session });
      });
    } catch (error) {
      if (error?.code === 11000) return res.status(409).json({ error: 'One or more selected seats are no longer available. Please refresh and choose again.' });
      throw error;
    } finally { await session.endSession(); }
    res.status(201).json({
      booking: publicBooking(booking, yatra),
      holdToken,
      expiresAt: expiresAt.toISOString(),
      serverNow: new Date().toISOString(),
    });
  } catch (error) { console.error('Lock seats error:', error.message); res.status(error.status || 500).json({ error: error.status ? error.message : 'Failed to hold seats' }); }
});

router.post('/order', requireAuth, async (req, res) => {
  const { bookingReference, holdToken } = req.body;
  if (!bookingReference || !holdToken) return res.status(400).json({ error: 'Booking hold is required' });
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Online payment is not configured' });
  try {
    const booking = await Booking.findOne({ bookingReference }).select('+holdToken').populate('yatraId');
    if (!booking || !ownerMatches(booking, req, holdToken)) return res.status(404).json({ error: 'Booking hold not found' });
    const lock = await SeatLock.findOne({ bookingId: booking._id, status: 'locked', expiresAt: { $gt: new Date() } });
    if (booking.bookingStatus !== 'pending' || !lock) return res.status(409).json({ error: 'The seat hold has expired. Please select your seats again.' });
    const amount = expectedPaymentAmount(booking);
    if (!Number.isSafeInteger(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid payment amount' });
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    let order;
    try {
      order = await razorpay.orders.create({ amount, currency: booking.yatraId.price.currency || 'INR', receipt: booking.bookingReference, notes: { bookingReference: booking.bookingReference } });
    } catch (error) {
      try {
        await SeatLock.deleteMany({
          bookingId: booking._id,
          holdToken,
          status: 'locked',
        });
      } catch (cleanupError) {
        console.error('Razorpay order failure lock cleanup error:', cleanupError.message);
      }
      logRazorpayError('Create Razorpay order error', error, keyId);
      return res.status(error?.statusCode === 401 ? 502 : 500).json({ error: 'We could not start the payment. Your seat hold has been released. Please try again.' });
    }
    booking.razorpayOrderId = order.id; await booking.save();
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      expiresAt: lock.expiresAt,
      serverNow: new Date().toISOString(),
      booking: publicBooking(booking, booking.yatraId),
    });
  } catch (error) {
    logRazorpayError('Create Razorpay order error', error, keyId);
    res.status(error?.statusCode === 401 ? 502 : 500).json({ error: 'Failed to create payment order' });
  }
});

router.post('/verify', requireAuth, async (req, res) => {
  const { bookingReference, holdToken, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  if (!bookingReference || !holdToken || !orderId || !paymentId || !signature) return res.status(400).json({ error: 'Payment verification details are incomplete' });
  const { keySecret } = getRazorpayConfig();
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return res.status(400).json({ error: 'Payment verification failed' });
  try {
    const booking = await Booking.findOne({ bookingReference }).select('+holdToken');
    if (!booking || !ownerMatches(booking, req, holdToken)) return res.status(404).json({ error: 'Booking hold not found' });
    await verifyPaymentWithRazorpay(booking, orderId, paymentId);
    const confirmed = await completePayment({ booking, paymentId, orderId, signature });
    const yatra = await Yatra.findById(confirmed.yatraId);
    res.json({ message: 'Payment verified and booking confirmed', booking: publicBooking(confirmed, yatra) });
  } catch (error) { console.error('Verify payment error:', error.message); res.status(error.status || 500).json({ error: error.status ? error.message : 'Failed to confirm payment' }); }
});

// Razorpay can call this endpoint when the browser closes after payment.
router.post('/webhook', async (req, res) => {
  const webhookSecret = readEnvValue('RAZORPAY_WEBHOOK_SECRET');
  if (!webhookSecret || !req.rawBody) return res.status(503).json({ error: 'Payment webhook is not configured' });
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', webhookSecret).update(req.rawBody).digest('hex');
  if (!signature || expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return res.status(400).json({ error: 'Invalid webhook signature' });
  try {
    const payload = JSON.parse(req.rawBody.toString('utf8'));
    if (!['payment.captured', 'order.paid'].includes(payload.event)) return res.json({ received: true });
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
    const orderId = entity?.order_id || entity?.id;
    const booking = await Booking.findOne({ razorpayOrderId: orderId }).select('+holdToken');
    if (booking && entity?.amount != null && Number(entity.amount) !== expectedPaymentAmount(booking)) {
      return res.status(400).json({ error: 'Webhook payment amount does not match booking' });
    }
    if (booking) {
      let paymentId = payload.payload?.payment?.entity?.id;
      if (!paymentId) {
        const { keyId, keySecret } = getRazorpayConfig();
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const payments = await razorpay.orders.fetchPayments(orderId);
        paymentId = payments.items?.find((payment) => ['authorized', 'captured'].includes(payment.status))?.id;
      }
      if (!paymentId) return res.status(202).json({ received: true });
      await verifyPaymentWithRazorpay(booking, orderId, paymentId);
      await completePayment({ booking, paymentId, orderId, signature });
    }
    res.json({ received: true });
  } catch (error) { console.error('Payment webhook error:', error.message); res.status(500).json({ error: 'Webhook processing failed' }); }
});

router.get('/:bookingReference', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.bookingReference }).populate('yatraId', 'title slug startingPoint departureDates durationDays durationNights');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId && (!req.user || String(booking.userId) !== String(req.user._id))) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (error) { console.error('Get booking error:', error.message); res.status(500).json({ error: 'Failed to load booking' }); }
});

module.exports = router;