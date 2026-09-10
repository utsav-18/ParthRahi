import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import useDocumentMeta from "../lib/useDocumentMeta";
import useJsonLd from "../lib/useJsonLd";
import { yatraJsonLd } from "../lib/yatraContent";
import { btnPrimary, btnSecondary } from "../lib/theme";
import { formatCurrency } from "../lib/format";

import YatraHero from "../components/yatra/YatraHero";
import YatraGallery from "../components/yatra/YatraGallery";
import QuickInclusionsStrip from "../components/yatra/QuickInclusionsStrip";
import HighlightsList from "../components/yatra/HighlightsList";
import TripSummaryCard from "../components/yatra/TripSummaryCard";
import ItineraryAccordion from "../components/yatra/ItineraryAccordion";
import InclusionExclusionList from "../components/yatra/InclusionExclusionList";
import FareBox from "../components/yatra/FareBox";
import RulesAccordion from "../components/yatra/RulesAccordion";
import EnquiryForm from "../components/yatra/EnquiryForm";
import TestimonialCarousel from "../components/yatra/TestimonialCarousel";
import RelatedYatrasCarousel from "../components/yatra/RelatedYatrasCarousel";
import HowItWorks from "../components/yatra/HowItWorks";
import TrustBand from "../components/yatra/TrustBand";
import YatraFaq from "../components/yatra/YatraFaq";
import { SacredDivider, SacredKicker } from "../components/yatra/SacredOrnaments";

const Section = ({ id, kicker: k, hindi, title, children }) => (
  <section id={id} className="scroll-mt-28">
    {(k || title) && (
      <div className="mb-4">
        {k && <SacredKicker hindi={hindi}>{k}</SacredKicker>}
        {title && <h2 className="text-xl md:text-2xl font-bold text-amber-50 mt-1.5">{title}</h2>}
      </div>
    )}
    {children}
  </section>
);

export default function YatraDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [yatra, setYatra] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch: reset state when slug changes
    setLoading(true);
    setError("");
    api
      .get(`/api/yatras/${slug}`)
      .then((res) => {
        if (!active) return;
        setYatra(res.data.yatra);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    api.get(`/api/yatras/${slug}/testimonials`).then((r) => active && setTestimonials(r.data.testimonials || [])).catch(() => {});
    api.get("/api/yatras").then((r) => active && setRelated(r.data.yatras || [])).catch(() => {});

    return () => {
      active = false;
    };
  }, [slug]);

  useDocumentMeta({
    title: yatra?.metaTitle || yatra?.title,
    description: yatra?.metaDescription || yatra?.tagline,
    image: yatra?.heroImages?.[0],
  });
  const jsonLd = useMemo(
    () => (yatra ? yatraJsonLd(yatra, typeof window !== "undefined" ? window.location.href : undefined) : null),
    [yatra]
  );
  useJsonLd(jsonLd);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-10 h-10 rounded-full border-2 border-amber-200/20 border-t-amber-300 animate-spin" />
      </div>
    );
  }

  if (error || !yatra) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 pt-24 px-6 text-center">
        <p className="text-2xl font-semibold text-amber-50">Yatra not found</p>
        <p className="text-amber-100/50 text-sm">{error || "This journey may have been closed or removed."}</p>
        <Link to="/events" className={`${btnSecondary} mt-2`}>Back to all yatras</Link>
      </div>
    );
  }

  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const soldOut = seatsLeft <= 0 || yatra.status !== "published";
  const relatedYatras = related.filter((y) => y.slug !== yatra.slug).slice(0, 6);
  const advanceHint = yatra.price?.advanceAmount
    ? `For this yatra you reserve now with ${formatCurrency(yatra.price.advanceAmount, yatra.price.currency)} per seat; the balance is due before departure.`
    : "You reserve now and our team confirms the payment details on WhatsApp.";
  const galleryImages = (yatra.heroImages || []).filter(Boolean);

  return (
    <div className="relative z-10 pb-28 lg:pb-20">
      <YatraHero yatra={yatra} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 pt-10 md:pt-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main column */}
          <div className="min-w-0 space-y-10">
            {yatra.highlights?.length > 0 && (
              <Section id="highlights" kicker="Trip highlights" hindi="यात्रा की विशेषताएँ" title="Why this yatra">
                <HighlightsList highlights={yatra.highlights} />
              </Section>
            )}

            <QuickInclusionsStrip items={yatra.quickInclusions} />

            {galleryImages.length > 1 && (
              <Section id="gallery" kicker="A glimpse" hindi="झलक" title="Photo gallery">
                <YatraGallery images={galleryImages} title={yatra.title} />
              </Section>
            )}

            {yatra.freebies?.length > 0 && (
              <div className="rounded-xl border border-green-400/20 bg-green-500/[0.06] px-4 py-3 text-sm text-green-200">
                🎁 <span className="font-medium">Included free:</span> {yatra.freebies.join(" · ")}
              </div>
            )}

            {/* Mobile summary (sidebar is hidden on small screens) */}
            <div className="lg:hidden">
              <TripSummaryCard yatra={yatra} />
            </div>

            <HowItWorks variant="compact" advanceHint={advanceHint} />

            <SacredDivider />

            <Section id="itinerary" kicker="Day by day" hindi="दिन-प्रतिदिन" title="Full itinerary">
              <ItineraryAccordion itinerary={yatra.itinerary} />
              {yatra.mapImageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-amber-200/12">
                  <img src={yatra.mapImageUrl} alt={`Route map — ${yatra.title}`} loading="lazy" className="w-full object-cover" />
                </div>
              )}
            </Section>

            <Section id="inclusions" kicker="What you pay for" hindi="शुल्क में क्या है" title="Inclusions & exclusions">
              <InclusionExclusionList
                inclusions={yatra.inclusions}
                exclusions={yatra.exclusions}
                notes={yatra.importantNotes}
              />
            </Section>

            <SacredDivider />

            <Section id="fare" kicker="Transparent pricing" hindi="पारदर्शी शुल्क" title="Fares & how to reserve">
              <FareBox price={yatra.price} />
              <div className="mt-4 rounded-xl border border-amber-200/12 bg-amber-400/[0.04] p-4 text-sm text-amber-100/75">
                <p className="text-amber-50 font-medium mb-1">Reserving your seat</p>
                <p>{advanceHint} Once you confirm, seats are held in your name and we send a booking reference on WhatsApp. No account or app needed.</p>
              </div>
            </Section>

            {(yatra.rulesAndFacilities?.length > 0 || yatra.termsAndConditions?.length > 0) && (
              <Section id="rules" kicker="The fine print, in plain words" hindi="नियम व सुविधाएँ" title="Rules & facilities">
                <RulesAccordion rules={yatra.rulesAndFacilities} terms={yatra.termsAndConditions} />
              </Section>
            )}

            <Section id="faq" kicker="Questions travellers ask" hindi="अक्सर पूछे जाने वाले प्रश्न" title="Frequently asked questions">
              <YatraFaq faqs={yatra.faqs} />
            </Section>

            <Section id="why" kicker="Why travel with us" hindi="हम पर भरोसा क्यों" title="You're in safe hands">
              <TrustBand compact />
            </Section>

            <SacredDivider />

            <Section id="enquiry">
              <EnquiryForm yatraSlug={yatra.slug} yatraTitle={yatra.title} />
            </Section>

            {testimonials.length > 0 && (
              <Section id="testimonials" kicker="Travellers' words" hindi="यात्रियों के अनुभव" title="What people say">
                <TestimonialCarousel testimonials={testimonials} />
              </Section>
            )}

            {relatedYatras.length > 0 && (
              <Section id="related" kicker="Keep exploring" hindi="और यात्राएँ" title="Other journeys">
                <RelatedYatrasCarousel yatras={relatedYatras} />
              </Section>
            )}
          </div>

          {/* Sticky sidebar (desktop) */}
          <div className="hidden lg:block">
            <TripSummaryCard yatra={yatra} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#140c03]/92 backdrop-blur-md border-t border-amber-200/15 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-amber-200/40">from</p>
          <p className="text-lg font-bold text-amber-50 leading-none">{formatCurrency(yatra.price?.amount, yatra.price?.currency)}</p>
        </div>
        {soldOut ? (
          <span className={`${btnPrimary} opacity-50`}>Sold out</span>
        ) : (
          <button onClick={() => navigate(`/events/${yatra.slug}/book`)} className={btnPrimary}>
            Reserve Your Seat
          </button>
        )}
      </div>
    </div>
  );
}
