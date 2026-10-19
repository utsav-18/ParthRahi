const express = require('express');
const Yatra = require('../models/Yatra');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const Enquiry = require('../models/Enquiry');
const Testimonial = require('../models/Testimonial');
const { requireAdmin } = require('../middleware/auth');
const { buildHindiTranslation } = require('../utils/translateYatra');
const { reconcileYatraSeats } = require('../utils/reconcileSeats');

const router = express.Router();

router.use(requireAdmin);

// Admin must not be able to save a negative, NaN, zero, or non-numeric seat
// price — Number(...) turns invalid input (e.g. "" or "abc") into NaN, which
// fails the isFinite check below.
const isValidPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

// Sleeper price is optional: empty/null means "not set" (sleeper berths then
// fall back to the normal seat price). Normalises the empty case to null so
// clearing the field in the admin form actually removes the old value.
const isBlankPrice = (value) => value == null || String(value).trim() === '';
const normalizeSleeperPrice = (price) => {
  if (price && isBlankPrice(price.sleeperSeat)) price.sleeperSeat = null;
};
const isValidSleeperPrice = (value) => isBlankPrice(value) || isValidPrice(value);

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Validates an admin-submitted seatLayout (the physical bus for one yatra)
// and returns an error message, or null when it is fine. Shared by create and
// update so both apply the same rules:
//  - every entry has a unique seatId and a label;
//  - totalSeats is the number of BOOKABLE seats — a 'blocked' entry (driver
//    gap, staircase) is a placeholder, not a seat. If the form omits
//    totalSeats it is derived from the layout.
// An empty layout keeps the automatic S1…Sn seats (see getLayout in
// bookingRoutes), so totalSeats is free in that case.
const validateSeatLayout = (body) => {
  if (!Array.isArray(body.seatLayout) || !body.seatLayout.length) return null;
  const seatIds = body.seatLayout.map((seat) => String(seat.seatId || '').trim());
  if (seatIds.some((seatId) => !seatId) || new Set(seatIds).size !== seatIds.length) {
    return 'Seat IDs must be present and unique';
  }
  if (body.seatLayout.some((seat) => !String(seat.label || '').trim())) return 'Every seat needs a label';
  const bookableCount = body.seatLayout.filter((seat) => seat.type !== 'blocked').length;
  if (!bookableCount) return 'The seat layout has no bookable seats';
  if (body.totalSeats == null || body.totalSeats === '') body.totalSeats = bookableCount;
  if (Number(body.totalSeats) !== bookableCount) {
    return `Total seats (${body.totalSeats}) must equal the number of bookable seats in the layout (${bookableCount})`;
  }
  return null;
};

// Auto-translate the yatra's text to Hindi so the site can show it the
// moment an admin saves — best-effort, never blocks the save on failure.
const attachHindiTranslation = async (body) => {
  try {
    body.translations = { hi: await buildHindiTranslation(body) };
  } catch (err) {
    console.error('Auto-translate yatra error:', err.message);
  }
};

// ── Yatras ────────────────────────────────────────────────
router.get('/yatras', async (req, res) => {
  try {
    const yatras = await Yatra.find().sort({ createdAt: -1 });

    const confirmedCounts = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $project: {
          yatraId: 1,
          seatCount: {
            $cond: {
              if: { $and: [{ $isArray: '$seatIds' }, { $gt: [{ $size: '$seatIds' }, 0] }] },
              then: { $size: '$seatIds' },
              else: { $ifNull: ['$numberOfSeats', 0] },
            },
          },
        },
      },
      {
        $group: {
          _id: '$yatraId',
          totalBooked: { $sum: '$seatCount' },
        },
      },
    ]);

    const countMap = new Map();
    for (const item of confirmedCounts) {
      countMap.set(String(item._id), item.totalBooked);
    }

    const bulkOps = [];
    for (const y of yatras) {
      const actual = countMap.get(String(y._id)) || 0;
      if (y.seatsBooked !== actual) {
        y.seatsBooked = actual;
        bulkOps.push({
          updateOne: {
            filter: { _id: y._id },
            update: { $set: { seatsBooked: actual } },
          },
        });
      }
    }
    if (bulkOps.length > 0) {
      await Yatra.bulkWrite(bulkOps);
    }

    res.json({ yatras });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load yatras' });
  }
});

router.get('/yatras/:id', async (req, res) => {
  try {
    const yatra = await Yatra.findById(req.params.id);
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    res.json({ yatra });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load yatra' });
  }
});

router.get('/yatras/:id/seat-locks', async (req, res) => {
  try {
    const yatra = await Yatra.findById(req.params.id).select('seatLayout totalSeats');
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    const now = new Date();
    const bookings = await Booking.find({ yatraId: yatra._id, bookingStatus: 'confirmed', seatIds: { $exists: true, $ne: [] } }).select('seatIds').lean();
    const locks = await SeatLock.find({
      yatraId: yatra._id,
      $or: [
        { status: 'permanently_locked' },
        { status: 'locked', expiresAt: { $gt: now } },
      ],
    }).select('seatId status').lean();
    const states = {};
    for (const booking of bookings) {
      for (const seatId of booking.seatIds || []) states[seatId] = 'booked';
    }
    for (const lock of locks) {
      if (states[lock.seatId] !== 'booked') states[lock.seatId] = lock.status === 'permanently_locked' ? 'permanently_locked' : 'locked';
    }
    res.json({ states });
  } catch (e) {
    console.error('Get admin seat locks error:', e.message);
    res.status(500).json({ error: 'Failed to load seat availability' });
  }
});

router.post('/yatras/:id/seat-locks', async (req, res) => {
  const normalizedSeats = Array.isArray(req.body.seatIds) ? req.body.seatIds.map((seatId) => String(seatId).trim()) : [];
  if (!normalizedSeats.length || new Set(normalizedSeats).size !== normalizedSeats.length) {
    return res.status(400).json({ error: 'Select one or more unique seats' });
  }
  try {
    const yatra = await Yatra.findById(req.params.id).select('seatLayout totalSeats');
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    const validSeats = new Set((yatra.seatLayout?.length ? yatra.seatLayout : Array.from({ length: yatra.totalSeats }, (_, i) => ({ seatId: `S${i + 1}`, type: 'seat' }))).filter((seat) => seat.type !== 'blocked').map((seat) => seat.seatId));
    if (normalizedSeats.some((seatId) => !validSeats.has(seatId))) return res.status(400).json({ error: 'One or more selected seats are invalid for this yatra' });

    const confirmed = await Booking.find({ yatraId: yatra._id, bookingStatus: 'confirmed', seatIds: { $in: normalizedSeats } }).select('seatIds').lean();
    const booked = new Set(confirmed.flatMap((booking) => booking.seatIds || []));
    if (normalizedSeats.some((seatId) => booked.has(seatId))) return res.status(409).json({ error: 'Booked seats cannot be permanently locked' });

    await SeatLock.deleteMany({ yatraId: yatra._id, seatId: { $in: normalizedSeats }, status: 'locked', expiresAt: { $lte: new Date() } });
    const activeTemporary = await SeatLock.find({ yatraId: yatra._id, seatId: { $in: normalizedSeats }, status: 'locked', expiresAt: { $gt: new Date() } }).select('seatId').lean();
    if (activeTemporary.length) return res.status(409).json({ error: `Temporarily held seats cannot be locked: ${activeTemporary.map((lock) => lock.seatId).join(', ')}` });

    await SeatLock.insertMany(normalizedSeats.map((seatId) => ({ yatraId: yatra._id, seatId, status: 'permanently_locked' })));
    res.status(201).json({ seatIds: normalizedSeats });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'One or more selected seats are no longer available. Refresh and try again.' });
    console.error('Create permanent seat locks error:', e.message);
    res.status(500).json({ error: 'Failed to permanently lock seats' });
  }
});

router.delete('/yatras/:id/seat-locks/:seatId', async (req, res) => {
  try {
    const result = await SeatLock.deleteOne({ yatraId: req.params.id, seatId: String(req.params.seatId).trim(), status: 'permanently_locked' });
    if (!result.deletedCount) return res.status(404).json({ error: 'Permanent seat lock not found' });
    res.json({ seatId: String(req.params.seatId).trim() });
  } catch (e) {
    console.error('Delete permanent seat lock error:', e.message);
    res.status(500).json({ error: 'Failed to unlock seat' });
  }
});

router.post('/yatras', async (req, res) => {
  try {
    const body = { ...req.body };
    body.slug = slugify(body.slug || body.title);
    if (!body.slug) return res.status(400).json({ error: 'Title or slug is required' });
    if (!body.title || !body.startingPoint || !body.totalSeats || !body.price || !isValidPrice(body.price.normalSeat)) {
      return res.status(400).json({ error: 'title, startingPoint, totalSeats, and a positive Normal Seat price are required' });
    }
    if (!isValidSleeperPrice(body.price.sleeperSeat)) {
      return res.status(400).json({ error: 'Sleeper Seat price must be a positive number, or left empty' });
    }
    normalizeSleeperPrice(body.price);

    const layoutError = validateSeatLayout(body);
    if (layoutError) return res.status(400).json({ error: layoutError });

    const exists = await Yatra.findOne({ slug: body.slug });
    if (exists) return res.status(409).json({ error: 'A yatra with this slug already exists' });

    await attachHindiTranslation(body);
    const yatra = await Yatra.create(body);
    res.status(201).json({ yatra });
  } catch (e) {
    console.error('Create yatra error:', e.message);
    res.status(400).json({ error: e.message || 'Failed to create yatra' });
  }
});

router.put('/yatras/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.seatsBooked; // never overwrite the live counter from the form
    if (body.slug) body.slug = slugify(body.slug);

    if (body.price) {
      if (!isValidPrice(body.price.normalSeat)) {
        return res.status(400).json({ error: 'Normal Seat price must be a positive number' });
      }
      if (!isValidSleeperPrice(body.price.sleeperSeat)) {
        return res.status(400).json({ error: 'Sleeper Seat price must be a positive number, or left empty' });
      }
      normalizeSleeperPrice(body.price);
    }

    if (Array.isArray(body.seatLayout) && (body.seatLayout.length || body.totalSeats != null)) {
      const layoutError = validateSeatLayout(body);
      if (layoutError) return res.status(400).json({ error: layoutError });
      // A seat with a confirmed booking must stay a bookable seat with the
      // same ID — it can be neither removed nor turned into a blocked position.
      // (Applies to an emptied layout too: the automatic S1…Sn seats are
      // only valid while totalSeats still covers them.)
      const confirmed = await Booking.find({ yatraId: req.params.id, bookingStatus: 'confirmed', seatIds: { $exists: true, $ne: [] } }).select('seatIds').lean();
      const confirmedSeats = new Set(confirmed.flatMap((booking) => booking.seatIds || []));
      const permanentLocks = await SeatLock.find({ yatraId: req.params.id, status: 'permanently_locked' }).select('seatId').lean();
      const permanentlyLockedSeats = new Set(permanentLocks.map((lock) => lock.seatId));
      const nextSeats = new Set(
        body.seatLayout.length
          ? body.seatLayout.filter((seat) => seat.type !== 'blocked').map((seat) => String(seat.seatId).trim())
          : Array.from({ length: Number(body.totalSeats) || 0 }, (_, i) => `S${i + 1}`)
      );
      const removed = [...confirmedSeats].filter((seatId) => !nextSeats.has(seatId));
      if (removed.length) return res.status(409).json({ error: `Cannot remove or block confirmed seat(s): ${removed.join(', ')}` });
      const removedPermanent = [...permanentlyLockedSeats].filter((seatId) => !nextSeats.has(seatId));
      if (removedPermanent.length) return res.status(409).json({ error: `Unlock permanently locked seat(s) before removing or blocking them: ${removedPermanent.join(', ')}` });
    }

    if (body.slug) {
      const clash = await Yatra.findOne({ slug: body.slug, _id: { $ne: req.params.id } });
      if (clash) return res.status(409).json({ error: 'Another yatra already uses this slug' });
    }

    await attachHindiTranslation(body);
    const yatra = await Yatra.findByIdAndUpdate(req.params.id, body, { returnDocument: 'after', runValidators: true });
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    res.json({ yatra });
  } catch (e) {
    console.error('Update yatra error:', e.message);
    res.status(400).json({ error: e.message || 'Failed to update yatra' });
  }
});

router.delete('/yatras/:id', async (req, res) => {
  try {
    const bookingCount = await Booking.countDocuments({
      yatraId: req.params.id,
      bookingStatus: { $ne: 'cancelled' },
    });
    if (bookingCount > 0) {
      return res.status(409).json({ error: `Cannot delete — ${bookingCount} active booking(s) exist. Set status to "closed" instead.` });
    }
    const yatra = await Yatra.findByIdAndDelete(req.params.id);
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    await Enquiry.deleteMany({ yatraId: req.params.id });
    res.json({ message: 'Yatra deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete yatra' });
  }
});

// ── Bookings ──────────────────────────────────────────────
router.get('/yatras/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ yatraId: req.params.id }).sort({ createdAt: -1 });
    const yatra = await Yatra.findById(req.params.id).select('title totalSeats seatsBooked');
    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });

    // Calculate confirmed reserved seats directly from actual confirmed booking records.
    // Ignores cancelled, pending, failed, expired, or temporary bookings.
    const confirmedSeats = bookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => {
        const count = Array.isArray(b.seatIds) && b.seatIds.length > 0 ? b.seatIds.length : (b.numberOfSeats || 0);
        return sum + count;
      }, 0);

    // Reconcile in DB if drifted
    if (yatra.seatsBooked !== confirmedSeats) {
      await Yatra.updateOne({ _id: yatra._id }, { $set: { seatsBooked: confirmedSeats } });
      yatra.seatsBooked = confirmedSeats;
    }

    res.json({ bookings, yatra });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(500)
      .populate('yatraId', 'title slug');
    res.json({ bookings });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

router.patch('/bookings/:id', async (req, res) => {
  try {
    const { paymentStatus, bookingStatus, advancePaid, paymentReferenceId, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (advancePaid != null) booking.advancePaid = advancePaid;
    if (paymentReferenceId != null) booking.paymentReferenceId = paymentReferenceId;
    if (notes != null) booking.notes = notes;

    // Handle seat locks for cancellations / confirmations
    if (booking.bookingStatus === 'cancelled') {
      await SeatLock.deleteMany({ bookingId: booking._id });
    } else if (booking.bookingStatus === 'confirmed' && Array.isArray(booking.seatIds) && booking.seatIds.length) {
      const clash = await Booking.findOne({
        yatraId: booking.yatraId,
        _id: { $ne: booking._id },
        bookingStatus: 'confirmed',
        seatIds: { $in: booking.seatIds },
      });
      if (clash) return res.status(409).json({ error: 'One or more seats are already confirmed in another booking' });
      const permanentLock = await SeatLock.findOne({
        yatraId: booking.yatraId,
        seatId: { $in: booking.seatIds },
        status: 'permanently_locked',
      }).select('seatId').lean();
      if (permanentLock) return res.status(409).json({ error: `Cannot confirm booking with permanently locked seat: ${permanentLock.seatId}` });

      for (const seatId of booking.seatIds) {
        await SeatLock.updateOne(
          { yatraId: booking.yatraId, seatId },
          { $set: { bookingId: booking._id, status: 'booked', expiresAt: null } },
          { upsert: true }
        );
      }
    }

    await booking.save();

    // Reconcile yatra.seatsBooked directly from confirmed bookings
    await reconcileYatraSeats(booking.yatraId);

    res.json({ booking });
  } catch (e) {
    console.error('Patch booking error:', e.message);
    res.status(400).json({ error: e.message || 'Failed to update booking' });
  }
});

// ── Enquiries ─────────────────────────────────────────────
router.get('/enquiries', async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).limit(500)
      .populate('yatraId', 'title slug');
    res.json({ enquiries });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load enquiries' });
  }
});

router.get('/yatras/:id/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ yatraId: req.params.id }).sort({ createdAt: -1 });
    res.json({ enquiries });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load enquiries' });
  }
});

router.patch('/enquiries/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { ...(status ? { status } : {}) },
      { returnDocument: 'after' }
    );
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ enquiry });
  } catch (e) {
    res.status(400).json({ error: 'Failed to update enquiry' });
  }
});

// ── Testimonials ──────────────────────────────────────────
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).populate('yatraId', 'title slug');
    res.json({ testimonials });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ testimonial });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ testimonial });
  } catch (e) {
    res.status(400).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ message: 'Testimonial deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
