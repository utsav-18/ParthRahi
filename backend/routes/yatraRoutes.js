const express = require('express');
const Yatra = require('../models/Yatra');
const Testimonial = require('../models/Testimonial');

const router = express.Router();

// GET /api/yatras — public listing (published only)
// filters: ?category=bus&destination=Varanasi&upcoming=true
router.get('/', async (req, res) => {
  try {
    const { category, destination, upcoming } = req.query;
    const query = { status: 'published' };

    if (category) query.category = category;
    if (destination) {
      query.$or = [
        { route: { $regex: destination, $options: 'i' } },
        { startingPoint: { $regex: destination, $options: 'i' } },
      ];
    }
    if (upcoming === 'true') {
      query.departureDates = { $elemMatch: { $gte: new Date() } };
    }

    const yatras = await Yatra.find(query).sort({ createdAt: -1 });
    res.json({ yatras }); // toJSON virtuals add seatsLeft
  } catch (error) {
    console.error('List yatras error:', error.message);
    res.status(500).json({ error: 'Failed to load yatras' });
  }
});

// GET /api/yatras/:slug — public detail
router.get('/:slug', async (req, res) => {
  try {
    const yatra = await Yatra.findOne({
      slug: String(req.params.slug).toLowerCase(),
      status: { $in: ['published', 'closed'] },
    });

    if (!yatra) return res.status(404).json({ error: 'Yatra not found' });
    res.json({ yatra });
  } catch (error) {
    console.error('Get yatra error:', error.message);
    res.status(500).json({ error: 'Failed to load yatra' });
  }
});

// GET /api/yatras/:slug/testimonials — yatra-specific + featured agency-wide
router.get('/:slug/testimonials', async (req, res) => {
  try {
    const yatra = await Yatra.findOne({ slug: String(req.params.slug).toLowerCase() }).select('_id');
    const filters = [{ isFeatured: true, yatraId: null }];
    if (yatra) filters.push({ yatraId: yatra._id });

    const testimonials = await Testimonial.find({ $or: filters })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error.message);
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

module.exports = router;
