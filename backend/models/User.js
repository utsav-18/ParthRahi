const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  profilePicture: {
    type: String
  },
  passwordHash: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  otpHash: {
    type: String
  },
  otpExpiresAt: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpPurpose: {
    type: String // 'signup' or 'password_reset'
  },
  otpLastSentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
