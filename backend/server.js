const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { sendOTPEmail, sendPasswordResetOTPEmail } = require('./utils/emailService');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

const User = require('./models/User');

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
  'https://parthrahi.com',
  'https://www.parthrahi.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/auth/', authLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ParthRahi backend is running' });
});

// Auth Routes
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(401).json({ error: 'Missing credential' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }

    const { sub: googleId, name, email, picture: profilePicture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) {
        return res.status(409).json({ error: 'Email already registered. Please log in with your email and password.' });
      }
      user.name = name || user.name;
      user.profilePicture = profilePicture || user.profilePicture;
      await user.save();
    } else {
      user = new User({ googleId, name, email, profilePicture, emailVerified: true });
      await user.save();
    }

    // Create session
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Authentication successful', user });
  } catch (error) {
    console.error('Google verification error:', error);
    res.status(401).json({ error: 'Google verification failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Valid name, email, and password (min 8 chars) are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(409).json({ error: 'Email already registered. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user = new User({
      name,
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      otpPurpose: 'signup',
      otpLastSentAt: new Date()
    });

    await user.save();
    await sendOTPEmail(normalizedEmail, otp);

    res.json({ message: 'Verification required. OTP sent to email.' });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification request' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many verification attempts. Please request a new OTP.' });
    }

    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp.toString(), user.otpHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const purpose = user.otpPurpose;
    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpPurpose = undefined;
    user.otpLastSentAt = undefined;
    await user.save();

    if (purpose === 'signup') {
      const jwtSecret = process.env.JWT_SECRET;
      const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      const safeUser = user.toObject();
      delete safeUser.passwordHash;
      return res.json({ message: 'Verification successful', user: safeUser });
    }
    
    res.json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(200).json({ message: 'If the email is registered and requires verification, an OTP has been sent.' });

    if (user.otpLastSentAt && (new Date() - user.otpLastSentAt) < 60000) {
      return res.status(429).json({ error: 'Please wait before requesting another OTP.' });
    }

    if (user.emailVerified && user.otpPurpose !== 'password_reset') {
      return res.status(200).json({ message: 'If the email is registered and requires verification, an OTP has been sent.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();

    if (user.otpPurpose === 'password_reset') {
      await sendPasswordResetOTPEmail(normalizedEmail, otp);
    } else {
      await sendOTPEmail(normalizedEmail, otp);
    }
    
    res.json({ message: 'If the email is registered and requires verification, an OTP has been sent.' });
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    res.status(500).json({ error: 'Server error during OTP resend' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.emailVerified) return res.status(403).json({ error: 'Email verification required', unverified: true });

    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    const genericMessage = 'If your email is registered with a password, a reset OTP has been sent.';

    if (!user || !user.passwordHash) {
      return res.json({ message: genericMessage });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpPurpose = 'password_reset';
    user.otpLastSentAt = new Date();
    await user.save();

    await sendPasswordResetOTPEmail(normalizedEmail, otp);
    res.json({ message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Valid email, OTP, and new password (min 8 chars) are required' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.otpPurpose !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset request' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many verification attempts. Please request a new OTP.' });
    }

    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp.toString(), user.otpHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpPurpose = undefined;
    user.otpLastSentAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

// Database connection & server start
const PORT = process.env.PORT || 5000;
// Fix unencoded @ in password if present in the MONGO_URI
let encodedUri = process.env.MONGO_URI;
if (encodedUri && encodedUri.includes('@') && encodedUri.indexOf('@') !== encodedUri.lastIndexOf('@')) {
  // If there are multiple @ symbols, the ones before the last one might be in the password
  const lastAt = encodedUri.lastIndexOf('@');
  const schemeAndAuth = encodedUri.substring(0, lastAt);
  const hostAndQuery = encodedUri.substring(lastAt);
  
  // Replace all @ in the auth part except the ones in the scheme (none should be there, but just in case)
  // Actually, standard mongodb+srv://username:password@cluster...
  const protocolEnd = schemeAndAuth.indexOf('://') + 3;
  const protocol = schemeAndAuth.substring(0, protocolEnd);
  const auth = schemeAndAuth.substring(protocolEnd);
  
  const fixedAuth = auth.replace(/@/g, '%40');
  encodedUri = protocol + fixedAuth + hostAndQuery;
}

mongoose.connect(encodedUri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. Check your connection string and credentials.');
    console.error('MongoDB Error:', err.message);
    process.exit(1);
  });
