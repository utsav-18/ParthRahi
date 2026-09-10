const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Yatra', index: true }, // null => agency-wide
  name: { type: String, trim: true },
  city: { type: String, trim: true },
  photoUrl: { type: String, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  message: { type: String, trim: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
