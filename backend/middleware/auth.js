const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isAdminEmail = (email) => !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());

// Loads the authenticated user from the JWT cookie onto req.user.
// Mirrors the inline logic used in server.js /api/auth/me and /api/auth/phone.
const requireAuth = async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Keep the admin allow-list authoritative even for older sessions.
    if (isAdminEmail(user.email) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid session' });
  }
};

const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// Optional auth: attaches req.user when a valid session exists, never blocks.
const optionalAuth = async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) req.user = user;
  } catch (_) {
    // ignore — treat as anonymous
  }
  next();
};

module.exports = { requireAuth, requireAdmin, optionalAuth, isAdminEmail, ADMIN_EMAILS };
