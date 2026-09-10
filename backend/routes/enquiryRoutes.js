const express = require('express');
const rateLimit = require('express-rate-limit');
const Enquiry = require('../models/Enquiry');
const Yatra = require('../models/Yatra');

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many enquiries, please try again later.' },
});

// Same phone rule as server.js signup
const phoneRegex = /^(\+?[1-9]\d{0,3})?[\s-]?\d{10}$/;

// POST /api/enquiries
router.post('/', enquiryLimiter, async (req, res) => {
  const { name, phone, email, city, message, yatraSlug } = req.body;

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }
  const trimmedPhone = phone.trim();
  if (!phoneRegex.test(trimmedPhone.replace(/[\s-]/g, '')) || trimmedPhone.length > 18) {
    return res.status(400).json({ error: 'Please enter a valid mobile number' });
  }

  try {
    let yatraId;
    if (yatraSlug) {
      const yatra = await Yatra.findOne({ slug: String(yatraSlug).toLowerCase() }).select('_id');
      if (yatra) yatraId = yatra._id;
    }

    await Enquiry.create({
      yatraId,
      name: name ? String(name).trim() : undefined,
      phone: trimmedPhone,
      email: email ? String(email).trim() : undefined,
      city: city ? String(city).trim() : undefined,
      message: message ? String(message).trim() : undefined,
    });

    res.status(201).json({ message: 'Enquiry received. Our team will contact you shortly.' });
  } catch (error) {
    console.error('Create enquiry error:', error.message);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

module.exports = router;
