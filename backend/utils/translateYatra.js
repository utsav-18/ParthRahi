const { translateBatch } = require('./translate');

// Free machine translation is unreliable for short proper nouns — a place
// name can match noise in MyMemory's translation memory and come back as
// nonsense (e.g. "Namchi" -> "कार्चीworld. kgm"). Known route stops get a
// hand-checked Hindi name instead of going through the API at all.
const KNOWN_PLACE_NAMES_HI = {
  patna: 'पटना',
  siliguri: 'सिलीगुड़ी',
  gangtok: 'गंगटोक',
  'nathula pass': 'नाथूला दर्रा',
  namchi: 'नामची',
  darjeeling: 'दार्जिलिंग',
  mirik: 'मिरिक',
  guwahati: 'गुवाहाटी',
  shillong: 'शिलांग',
  cherrapunji: 'चेरापूंजी',
  dumraon: 'डुमरांव',
  ujjain: 'उज्जैन',
  omkareshwar: 'ओंकारेश्वर',
  sehore: 'सीहोर',
  'khatu shyam': 'खाटू श्याम',
};

function lookupPlaceName(value) {
  return KNOWN_PLACE_NAMES_HI[String(value || '').trim().toLowerCase()] || null;
}

/**
 * Auto-translate the customer-facing text of a yatra (English → Hindi) so the
 * site can show it automatically once the language switcher is set to Hindi.
 * Best-effort: any translation failure just leaves that field blank in the
 * result, and the frontend falls back to the English text for it.
 *
 * `doc` is a plain object shaped like the Yatra schema (the request body an
 * admin is saving). Returns an object matching the `translations.hi` schema.
 */
async function buildHindiTranslation(doc) {
  // Flatten every translatable string into one list, remembering how to
  // write each result back into the nested output shape.
  const strings = [];
  const setters = [];
  const add = (value, setter) => {
    strings.push(value);
    setters.push(setter);
  };

  const out = {
    title: '', tagline: '',
    route: [], highlights: [],
    quickInclusions: [],
    itinerary: [],
    inclusions: [], exclusions: [], importantNotes: [],
    rulesAndFacilities: [],
    termsAndConditions: [], freebies: [],
    faqs: [],
    priceUnit: '',
    metaTitle: '', metaDescription: '',
  };

  add(doc.title, (v) => { out.title = v; });
  add(doc.tagline, (v) => { out.tagline = v; });
  add(doc.metaTitle, (v) => { out.metaTitle = v; });
  add(doc.metaDescription, (v) => { out.metaDescription = v; });
  add(doc.price?.unit, (v) => { out.priceUnit = v; });

  (doc.route || []).forEach((val, i) => {
    out.route[i] = '';
    const known = lookupPlaceName(val);
    if (known) {
      out.route[i] = known;
    } else {
      add(val, (v) => {
        // A correctly transliterated place name should be pure Devanagari.
        // Stray Latin letters mean MyMemory matched noise — discard rather
        // than show garbage; the frontend falls back to the English name.
        out.route[i] = /[a-zA-Z]/.test(v) ? '' : v;
      });
    }
  });
  (doc.highlights || []).forEach((val, i) => {
    out.highlights[i] = '';
    add(val, (v) => { out.highlights[i] = v; });
  });
  (doc.inclusions || []).forEach((val, i) => {
    out.inclusions[i] = '';
    add(val, (v) => { out.inclusions[i] = v; });
  });
  (doc.exclusions || []).forEach((val, i) => {
    out.exclusions[i] = '';
    add(val, (v) => { out.exclusions[i] = v; });
  });
  (doc.importantNotes || []).forEach((val, i) => {
    out.importantNotes[i] = '';
    add(val, (v) => { out.importantNotes[i] = v; });
  });
  (doc.termsAndConditions || []).forEach((val, i) => {
    out.termsAndConditions[i] = '';
    add(val, (v) => { out.termsAndConditions[i] = v; });
  });
  (doc.freebies || []).forEach((val, i) => {
    out.freebies[i] = '';
    add(val, (v) => { out.freebies[i] = v; });
  });
  (doc.quickInclusions || []).forEach((item, i) => {
    out.quickInclusions[i] = { label: '' };
    add(item?.label, (v) => { out.quickInclusions[i].label = v; });
  });
  (doc.rulesAndFacilities || []).forEach((rule, i) => {
    out.rulesAndFacilities[i] = { title: '', description: '' };
    add(rule?.title, (v) => { out.rulesAndFacilities[i].title = v; });
    add(rule?.description, (v) => { out.rulesAndFacilities[i].description = v; });
  });
  (doc.faqs || []).forEach((faq, i) => {
    out.faqs[i] = { q: '', a: '' };
    add(faq?.q, (v) => { out.faqs[i].q = v; });
    add(faq?.a, (v) => { out.faqs[i].a = v; });
  });
  (doc.itinerary || []).forEach((day, i) => {
    out.itinerary[i] = { title: '', activities: [] };
    add(day?.title, (v) => { out.itinerary[i].title = v; });
    (day?.activities || []).forEach((act, j) => {
      out.itinerary[i].activities[j] = { description: '' };
      add(act?.description, (v) => { out.itinerary[i].activities[j].description = v; });
    });
  });

  if (!strings.some((s) => String(s || '').trim())) return out;

  const translated = await translateBatch(strings, 'hi');
  translated.forEach((value, i) => setters[i](value));
  return out;
}

module.exports = { buildHindiTranslation };
