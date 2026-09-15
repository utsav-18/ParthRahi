/**
 * One-off backfill: auto-translate every existing yatra to Hindi.
 * Needed once for yatras that were created/edited before the auto-translate
 * feature existed. Going forward, saving a yatra in the admin panel does
 * this automatically (see routes/adminRoutes.js).
 *
 * Usage: node utils/backfillTranslations.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Yatra = require('../models/Yatra');
const { buildHindiTranslation } = require('./translateYatra');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const yatras = await Yatra.find();
    console.log(`Found ${yatras.length} yatra(s)`);

    for (const yatra of yatras) {
      console.log(`Translating "${yatra.title}"...`);
      const hi = await buildHindiTranslation(yatra.toObject());
      yatra.translations = { hi };
      await yatra.save();
      console.log(`  done — title -> ${hi.title || '(unchanged)'}`);
    }

    console.log('Backfill complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exit(1);
  }
})();
