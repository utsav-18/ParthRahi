// Overlays a yatra's auto-translated Hindi text (yatra.translations.hi, filled
// in by the backend when an admin saves it — see backend/utils/translateYatra.js)
// onto the English document, so every yatra page can just render `yatra.title`
// etc. and get the right language automatically. Falls back to English for
// anything that hasn't been translated yet (e.g. content saved before this
// feature existed, or if the translation service was briefly unavailable).

const pick = (en, hi) => (hi && String(hi).trim() ? hi : en);

const localizeStringArray = (en = [], hi = []) =>
  en.map((value, i) => pick(value, hi?.[i]));

export function localizeYatra(yatra, lang) {
  if (!yatra || lang !== "hi") return yatra;
  const hi = yatra.translations?.hi;
  if (!hi) return yatra;

  return {
    ...yatra,
    title: pick(yatra.title, hi.title),
    tagline: pick(yatra.tagline, hi.tagline),
    metaTitle: pick(yatra.metaTitle, hi.metaTitle),
    metaDescription: pick(yatra.metaDescription, hi.metaDescription),
    route: localizeStringArray(yatra.route, hi.route),
    highlights: localizeStringArray(yatra.highlights, hi.highlights),
    inclusions: localizeStringArray(yatra.inclusions, hi.inclusions),
    exclusions: localizeStringArray(yatra.exclusions, hi.exclusions),
    importantNotes: localizeStringArray(yatra.importantNotes, hi.importantNotes),
    termsAndConditions: localizeStringArray(yatra.termsAndConditions, hi.termsAndConditions),
    freebies: localizeStringArray(yatra.freebies, hi.freebies),

    price: yatra.price && {
      ...yatra.price,
      unit: pick(yatra.price.unit, hi.priceUnit),
      variants: (yatra.price.variants || []).map((variant, i) => ({
        ...variant,
        label: pick(variant.label, hi.priceVariantLabels?.[i]),
      })),
    },

    quickInclusions: (yatra.quickInclusions || []).map((item, i) => ({
      ...item,
      label: pick(item.label, hi.quickInclusions?.[i]?.label),
    })),

    itinerary: (yatra.itinerary || []).map((day, i) => {
      const hiDay = hi.itinerary?.[i];
      return {
        ...day,
        title: pick(day.title, hiDay?.title),
        activities: (day.activities || []).map((act, j) => ({
          ...act,
          description: pick(act.description, hiDay?.activities?.[j]?.description),
        })),
      };
    }),

    rulesAndFacilities: (yatra.rulesAndFacilities || []).map((rule, i) => ({
      ...rule,
      title: pick(rule.title, hi.rulesAndFacilities?.[i]?.title),
      description: pick(rule.description, hi.rulesAndFacilities?.[i]?.description),
    })),

    faqs: (yatra.faqs || []).map((faq, i) => ({
      ...faq,
      q: pick(faq.q, hi.faqs?.[i]?.q),
      a: pick(faq.a, hi.faqs?.[i]?.a),
    })),
  };
}
