/**
 * Create (or update) a permanent admin account directly in the database —
 * no signup form, no OTP email needed.
 *
 * Usage:  node utils/createAdmin.js <email> <password> [display name]
 * Example: node utils/createAdmin.js owner@parthrahi.com "Parthrahi@123" ParthRahi Owner
 *
 * Connects using MONGO_URI from .env, so it targets whichever database that
 * file points at (local Mongo or your Atlas cluster).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function main() {
  const [, , emailArg, passwordArg, ...nameParts] = process.argv;
  const email = String(emailArg || '').toLowerCase().trim();
  const password = String(passwordArg || '');
  const name = nameParts.join(' ') || 'ParthRahi Owner';

  if (!email || !email.includes('@') || password.length < 8) {
    console.error('Usage: node utils/createAdmin.js <email> <password min 8 chars> [display name]');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, passwordHash, emailVerified: true, role: 'admin' } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  console.log(`Admin account ready — email: ${user.email}, role: ${user.role}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
