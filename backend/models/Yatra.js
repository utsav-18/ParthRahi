const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, trim: true },
  description: { type: String, trim: true },
  icon: { type: String, trim: true },
}, { _id: false });

const itineraryDaySchema = new mongoose.Schema({
  dayNumber: { type: Number },
  date: { type: Date },
  title: { type: String, trim: true },
  image: { type: String, trim: true },       // photo of the place visited that day
  stayNight: { type: String, trim: true },   // where the group stays that night
  activities: { type: [activitySchema], default: [] },
}, { _id: false });

const faqSchema = new mongoose.Schema({
  q: { type: String, trim: true },
  a: { type: String, trim: true },
}, { _id: false });

const fareVariantSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  amount: { type: Number },
}, { _id: false });

const quickInclusionSchema = new mongoose.Schema({
  icon: { type: String, trim: true },
  label: { type: String, trim: true },
}, { _id: false });

const ruleSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
}, { _id: false });

const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  row: { type: Number, required: true, min: 1 },
  column: { type: Number, required: true, min: 1 },
  type: { type: String, enum: ['seat', 'aisle', 'blocked'], default: 'seat' },
}, { _id: false });

const yatraSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  category: { type: String, enum: ['bus', 'train', 'flight', 'international'], default: 'bus' },
  heroImages: { type: [String], default: [] },

  route: { type: [String], default: [] },
  startingPoint: { type: String, required: true, trim: true },
  departureDates: { type: [Date], default: [] },

  highlights: { type: [String], default: [] },   // punchy "why this yatra" bullets
  mapImageUrl: { type: String, trim: true },      // static route map image

  durationDays: { type: Number },
  durationNights: { type: Number },

  vehicleType: { type: String, trim: true },
  totalSeats: { type: Number, required: true, min: 1 },
  seatsBooked: { type: Number, default: 0, min: 0 },
  seatLayout: { type: [seatSchema], default: [] },

  reportingTime: { type: String, trim: true },
  departureTime: { type: String, trim: true },

  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    unit: { type: String, default: 'per person' },
    advanceAmount: { type: Number },
    variants: { type: [fareVariantSchema], default: [] },
  },

  quickInclusions: { type: [quickInclusionSchema], default: [] },
  itinerary: { type: [itineraryDaySchema], default: [] },

  inclusions: { type: [String], default: [] },
  exclusions: { type: [String], default: [] },
  importantNotes: { type: [String], default: [] },

  rulesAndFacilities: { type: [ruleSchema], default: [] },
  termsAndConditions: { type: [String], default: [] },
  freebies: { type: [String], default: [] },
  faqs: { type: [faqSchema], default: [] },

  brochurePdfUrl: { type: String, trim: true },

  status: { type: String, enum: ['draft', 'published', 'closed', 'completed'], default: 'draft', index: true },

  metaTitle: { type: String, trim: true },
  metaDescription: { type: String, trim: true },
}, { timestamps: true });

yatraSchema.virtual('seatsLeft').get(function () {
  return Math.max(0, (this.totalSeats || 0) - (this.seatsBooked || 0));
});

yatraSchema.set('toJSON', { virtuals: true });
yatraSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Yatra', yatraSchema);
