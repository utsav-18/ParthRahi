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

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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

router.post('/yatras', async (req, res) => {
  try {
    const body = { ...req.body };
    body.slug = slugify(body.slug || body.title);
    if (!body.slug) return res.status(400).json({ error: 'Title or slug is required' });
    if (!body.title || !body.startingPoint || !body.totalSeats || !body.price || !isValidPrice(body.price.normalSeat) || !isValidPrice(body.price.sleeperSeat)) {
      return res.status(400).json({ error: 'title, startingPoint, totalSeats, and positive Normal Seat / Sleeper Seat prices are required' });
    }

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

    if (body.price && (!isValidPrice(body.price.normalSeat) || !isValidPrice(body.price.sleeperSeat))) {
      return res.status(400).json({ error: 'Normal Seat and Sleeper Seat prices must be positive numbers' });
    }

    if (Array.isArray(body.seatLayout)) {
      const seatIds = body.seatLayout.map((seat) => String(seat.seatId || '').trim());
      if (seatIds.some((seatId) => !seatId) || new Set(seatIds).size !== seatIds.length) {
        return res.status(400).json({ error: 'Seat IDs must be present and unique' });
      }
      const confirmed = await Booking.find({ yatraId: req.params.id, bookingStatus: 'confirmed', seatIds: { $exists: true, $ne: [] } }).select('seatIds').lean();
      const confirmedSeats = new Set(confirmed.flatMap((booking) => booking.seatIds || []));
      const nextSeats = new Set(seatIds);
      const removed = [...confirmedSeats].filter((seatId) => !nextSeats.has(seatId));
      if (removed.length) return res.status(409).json({ error: `Cannot remove confirmed seat(s): ${removed.join(', ')}` });
      // totalSeats is bookable capacity — a 'blocked' entry (e.g. the
      // driver-side gap on a sleeper coach) is a placeholder in the physical
      // layout, not a seat anyone can book, so it must not count against it.
      const bookableCount = body.seatLayout.filter((seat) => seat.type !== 'blocked').length;
      if (body.totalSeats != null && Number(body.totalSeats) < bookableCount) return res.status(400).json({ error: 'Total seats cannot be less than the number of bookable seats in the layout' });
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
