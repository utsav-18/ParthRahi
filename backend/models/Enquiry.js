const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Yatra', index: true },
  name: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  city: { type: String, trim: true },
  message: { type: String, trim: true },
  source: { type: String, default: 'yatra-detail-page', trim: true },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
