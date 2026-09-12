// Fallback copy used when a yatra has no page-specific version in the database.
// Built from the active-language dictionary, so it switches with the site language.
export function getDefaultFaqs(t) {
  return [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    q: t(`yatraFaq.q${n}`),
    a: t(`yatraFaq.a${n}`),
  }));
}

// JSON-LD structured data so search engines and link previews understand the trip.
export function yatraJsonLd(yatra, url) {
  if (!yatra) return null;
  const nextDate = [...(yatra.departureDates || [])]
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b)
    .find((d) => d >= new Date());

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: yatra.title,
    description: yatra.metaDescription || yatra.tagline,
    image: (yatra.heroImages || []).filter(Boolean).slice(0, 6),
    url,
    touristType: "Pilgrimage / group tour",
    itinerary: (yatra.itinerary || []).map((d, i) => ({
      "@type": "ListItem",
      position: d.dayNumber || i + 1,
      item: { "@type": "TouristAttraction", name: d.title || `Day ${d.dayNumber || i + 1}` },
    })),
    offers: {
      "@type": "Offer",
      price: yatra.price?.amount,
      priceCurrency: yatra.price?.currency || "INR",
      availability:
        (yatra.seatsLeft ?? 1) > 0 && yatra.status === "published"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      ...(nextDate ? { validFrom: nextDate.toISOString() } : {}),
    },
    provider: {
      "@type": "TravelAgency",
      name: "ParthRahi",
      url: "https://parthrahi.com",
    },
  };
}
