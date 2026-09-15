/**
 * Best-effort machine translation (English → target language) using
 * MyMemory's free translation API — no API key required.
 * https://mymemory.translated.net/doc/spec.php
 *
 * Every function here fails soft: on any error it returns '' / the
 * original strings, so a translation hiccup never blocks saving a yatra
 * or breaks the page — the site just falls back to showing English.
 *
 * Set TRANSLATE_CONTACT_EMAIL in .env (any address you control, e.g. the
 * one already public on the site) to raise MyMemory's daily free quota
 * from 5,000 to 50,000 words/day. Optional — translation still works
 * without it, just with a lower daily ceiling.
 */

const CONTACT_EMAIL = String(process.env.TRANSLATE_CONTACT_EMAIL || '').trim();

/** True if the string already has Devanagari characters in it. */
function containsDevanagari(text) {
  return /[ऀ-ॿ]/.test(String(text || ''));
}

async function translateRaw(text, targetLang) {
  const clean = String(text || '').trim();
  if (!clean) return '';
  // Some yatra content is authored directly in Hindi/mixed script (dharmik
  // theme). Running that back through EN->HI translation doesn't skip it —
  // MyMemory "translates" it anyway and mangles it. Treat already-Hindi text
  // as already localized and leave it alone.
  if (targetLang === 'hi' && containsDevanagari(clean)) return '';
  try {
    const params = new URLSearchParams({ q: clean, langpair: `en|${targetLang}` });
    if (CONTACT_EMAIL) params.set('de', CONTACT_EMAIL);
    const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return '';
    const data = await res.json();
    if (data?.responseStatus && Number(data.responseStatus) !== 200) return '';
    const translated = data?.responseData?.translatedText || '';
    // MyMemory sometimes just echoes the input back untranslated when it has
    // no good match — treat that as "not translated" rather than showing it.
    if (!translated || translated.trim().toLowerCase() === clean.toLowerCase()) return '';
    return translated;
  } catch (err) {
    console.error('Translate error:', err.message);
    return '';
  }
}

/** Translate a single string. Returns '' on failure (never throws). */
async function translateText(text, targetLang = 'hi') {
  return translateRaw(text, targetLang);
}

/**
 * Translate a list of strings with a small worker pool (a few requests in
 * flight at once, not all at once) so a full yatra's worth of text finishes
 * in a reasonable time without hammering the free API. Returns an array the
 * same length as the input, with '' for any entry that couldn't be translated.
 */
async function translateBatch(strings, targetLang = 'hi', concurrency = 5) {
  const items = (strings || []).map((s) => String(s || '').trim());
  const result = items.map(() => '');
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const i = cursor++;
      if (items[i]) result[i] = await translateRaw(items[i], targetLang);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) || 0 }, worker);
  await Promise.all(workers);
  return result;
}

module.exports = { translateText, translateBatch, containsDevanagari };
