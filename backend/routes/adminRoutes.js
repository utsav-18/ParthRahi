const express = require('express');
const Yatra = require('../models/Yatra');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Testimonial = require('../models/Testimonial');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAdmin);

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// ── Yatras ────────────────────────────────────────────────
router.get('/yatras', async (req, res) => {
  try {
    const yatras = await Yatra.find().sort({ createdAt: -1 });
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
    if (!body.title || !body.startingPoint || !body.totalSeats || !body.price || body.price.amount == null) {
      return res.status(400).json({ error: 'title, startingPoint, totalSeats and price.amount are required' });
    }

    const exists = await Yatra.findOne({ slug: body.slug });
    if (exists) return res.status(409).json({ error: 'A yatra with this slug already exists' });

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

    if (body.slug) {
      const clash = await Yatra.findOne({ slug: body.slug, _id: { $ne: req.params.id } });
      if (clash) return res.status(409).json({ error: 'Another yatra already uses this slug' });
    }

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

    const wasCancelled = booking.bookingStatus === 'cancelled';

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (advancePaid != null) booking.advancePaid = advancePaid;
    if (paymentReferenceId != null) booking.paymentReferenceId = paymentReferenceId;
    if (notes != null) booking.notes = notes;

    // Release seats when a booking transitions into cancelled.
    if (!wasCancelled && booking.bookingStatus === 'cancelled') {
      await Yatra.updateOne(
        { _id: booking.yatraId },
        { $inc: { seatsBooked: -booking.numberOfSeats } }
      );
      await Yatra.updateOne(
        { _id: booking.yatraId, seatsBooked: { $lt: 0 } },
        { $set: { seatsBooked: 0 } }
      );
    }
    // Re-hold seats if a cancelled booking is reactivated.
    if (wasCancelled && booking.bookingStatus !== 'cancelled') {
      await Yatra.updateOne(
        { _id: booking.yatraId },
        { $inc: { seatsBooked: booking.numberOfSeats } }
      );
    }

    await booking.save();
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
