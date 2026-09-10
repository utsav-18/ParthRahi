// Fallback copy used when a yatra has no page-specific version in the database.

export const DEFAULT_FAQS = [
  {
    q: "How do I reserve a seat?",
    a: "Open a yatra, tap “Reserve Your Seat”, fill the lead traveller's details and number of seats, then pay the advance. You get a booking reference immediately and our team confirms on WhatsApp.",
  },
  {
    q: "How much advance do I pay, and when is the balance due?",
    a: "The advance is shown on each yatra (for example ₹1,000–₹3,000 per seat). The balance is payable before departure — usually 15–20 days prior. There are no booking fees or hidden charges.",
  },
  {
    q: "What is included in the price?",
    a: "Travel for the whole route, hotel stay on twin/triple sharing, daily sattvic breakfast and dinner, permits where needed, and a ParthRahi tour manager with the group. Each yatra page lists inclusions and exclusions in full.",
  },
  {
    q: "Can I cancel or change my booking?",
    a: "Yes. Every yatra page has a clear cancellation & refund policy under “Rules & Facilities”. In short: cancel early and the advance is adjustable; closer to departure a slab-based charge applies.",
  },
  {
    q: "I'm booking for my parents / a group. Can you help?",
    a: "That's most of what we do. Message us on WhatsApp with the yatra name and number of travellers and we'll hold seats, arrange the nearest pickup point and handle the paperwork.",
  },
];

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
