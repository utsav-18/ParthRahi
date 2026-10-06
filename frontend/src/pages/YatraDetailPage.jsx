import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import useDocumentMeta from "../lib/useDocumentMeta";
import useJsonLd from "../lib/useJsonLd";
import { yatraJsonLd } from "../lib/yatraContent";
import { localizeYatra } from "../lib/localizeYatra";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { btnPrimary, btnSecondary } from "../lib/theme";
import { formatCurrency, startingPrice } from "../lib/format";

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
import { SacredKicker, SectionHeader } from "../components/yatra/SacredOrnaments";

const Section = ({ id, kicker: k, hindi, title, children, className = "" }) => (
  <section id={id} className={`pr-panel rounded-2xl p-5 sm:p-6 md:p-8 ${className}`}>
    {(k || title) && (
      <div className="mb-6">
        {k && <SacredKicker hindi={hindi}>{k}</SacredKicker>}
        {title && <h2 className="text-2xl md:text-3xl font-bold text-cream mt-3 leading-tight">{title}</h2>}
      </div>
    )}
    {children}
  </section>
);

export default function YatraDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [yatra, setYatra] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rawYatraRef = useRef(null);
  const rawRelatedRef = useRef([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(`/api/yatras/${slug}`)
      .then((res) => {
        if (!active) return;
        rawYatraRef.current = res.data.yatra;
        setYatra(localizeYatra(res.data.yatra, lang));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    api.get(`/api/yatras/${slug}/testimonials`).then((r) => active && setTestimonials(r.data.testimonials || [])).catch(() => {});
    api.get("/api/yatras").then((r) => {
      if (!active) return;
      rawRelatedRef.current = r.data.yatras || [];
      setRelated(rawRelatedRef.current.map((y) => localizeYatra(y, lang)));
    }).catch(() => {});

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- language changes are handled by the effect below, not a refetch
  }, [slug]);

  // Re-apply the Hindi/English overlay instantly when the language switcher
  // changes, without refetching from the server.
  useEffect(() => {
    if (rawYatraRef.current) setYatra(localizeYatra(rawYatraRef.current, lang));
    if (rawRelatedRef.current.length) setRelated(rawRelatedRef.current.map((y) => localizeYatra(y, lang)));
  }, [lang]);

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold-300/25 border-t-gold-300 animate-spin" />
      </div>
    );
  }

  if (error || !yatra) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-2xl font-semibold text-cream">{t("yatraDetail.notFoundTitle")}</p>
        <p className="text-cream/50 text-sm">{error || t("yatraDetail.notFoundDesc")}</p>
        <Link to="/events" className={`${btnSecondary} mt-2`}>{t("yatraDetail.backToAll")}</Link>
      </div>
    );
  }

  const seatsLeft = yatra.seatsLeft ?? Math.max(0, (yatra.totalSeats || 0) - (yatra.seatsBooked || 0));
  const soldOut = seatsLeft <= 0 || yatra.status !== "published";
  const relatedYatras = related.filter((y) => y.slug !== yatra.slug).slice(0, 6);
  const galleryImages = (yatra.heroImages || []).filter(Boolean);

  return (
    <div className="relative z-10 yatra-experience pb-28 lg:pb-24">
      <YatraHero yatra={yatra} />

      <div className="site-container pt-8 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 items-start">
          {/* Booking card — first on mobile, sticky sidebar on desktop */}
          <aside className="lg:order-last lg:sticky lg:top-[calc(var(--site-header-h)+1rem)]">
            <TripSummaryCard yatra={yatra} />
          </aside>

          {/* Main column */}
          <div className="min-w-0 space-y-6 md:space-y-8">
            {yatra.highlights?.length > 0 && (
              <Section id="highlights" kicker={t("yatraDetail.highlightsKicker")} hindi="यात्रा की विशेषताएँ" title={t("yatraDetail.highlightsTitle")}>
                <HighlightsList highlights={yatra.highlights} />
                {yatra.quickInclusions?.length > 0 && (
                  <div className="mt-6">
                    <QuickInclusionsStrip items={yatra.quickInclusions} />
                  </div>
                )}
                {yatra.freebies?.length > 0 && (
                  <div className="mt-6 rounded-xl border border-green-400/25 bg-green-500/[0.07] px-4 py-3 text-sm text-green-200">
                    🎁 <span className="font-medium">{t("yatraDetail.includedFree")}</span> {yatra.freebies.join(" · ")}
                  </div>
                )}
              </Section>
            )}

            {galleryImages.length > 1 && (
              <Section id="gallery" kicker={t("yatraDetail.galleryKicker")} hindi="झलक" title={t("yatraDetail.galleryTitle")}>
                <YatraGallery images={galleryImages} title={yatra.title} />
              </Section>
            )}

            <Section id="itinerary" kicker={t("yatraDetail.itineraryKicker")} hindi="दिन-प्रतिदिन" title={t("yatraDetail.itineraryTitle")}>
              <ItineraryAccordion itinerary={yatra.itinerary} />
              {yatra.mapImageUrl && (
                <div className="mt-6 rounded-xl overflow-hidden border border-gold-300/15 bg-navy-950/40">
                  <img src={yatra.mapImageUrl} alt={`Route map — ${yatra.title}`} loading="lazy" className="w-full h-auto object-contain" />
                </div>
              )}
            </Section>

            <Section id="inclusions" kicker={t("yatraDetail.inclusionsKicker")} hindi="शुल्क में क्या है" title={t("yatraDetail.inclusionsTitle")}>
              <InclusionExclusionList inclusions={yatra.inclusions} exclusions={yatra.exclusions} notes={yatra.importantNotes} />
            </Section>

            <Section id="fare" kicker={t("yatraDetail.fareKicker")} hindi="पारदर्शी शुल्क" title={t("yatraDetail.fareTitle")}>
              <FareBox price={yatra.price} />
              <div className="mt-4 rounded-xl border border-gold-300/15 bg-gold-300/[0.05] p-4 text-sm text-cream/75">
                <p className="text-cream font-medium mb-1">{t("yatraDetail.reservingTitle")}</p>
                <p className="leading-relaxed">{t("yatraDetail.reservingHint")}</p>
              </div>
              <div className="mt-6">
                <HowItWorks variant="compact" />
              </div>
            </Section>

            {(yatra.rulesAndFacilities?.length > 0 || yatra.termsAndConditions?.length > 0) && (
              <Section id="rules" kicker={t("yatraDetail.rulesKicker")} hindi="नियम व सुविधाएँ" title={t("yatraDetail.rulesTitle")}>
                <RulesAccordion rules={yatra.rulesAndFacilities} terms={yatra.termsAndConditions} />
              </Section>
            )}

            <Section id="faq" kicker={t("yatraDetail.faqKicker")} hindi="अक्सर पूछे जाने वाले प्रश्न" title={t("yatraDetail.faqTitle")}>
              <YatraFaq faqs={yatra.faqs} />
            </Section>

            {testimonials.length > 0 && (
              <Section id="testimonials" kicker={t("yatraDetail.testimonialsKicker")} hindi="यात्रियों के अनुभव" title={t("yatraDetail.testimonialsTitle")}>
                <TestimonialCarousel testimonials={testimonials} />
              </Section>
            )}

            <section id="enquiry">
              <EnquiryForm yatraSlug={yatra.slug} yatraTitle={yatra.title} />
            </section>
          </div>
        </div>

        {/* Full-width bands below the two-column area */}
        <div className="mt-16 md:mt-20 space-y-16 md:space-y-20">
          <section>
            <SectionHeader kicker={t("yatraDetail.whyKicker")} hindi="हम पर भरोसा क्यों" title={t("yatraDetail.whyTitle")} />
            <div className="mt-10">
              <TrustBand />
            </div>
          </section>

          {relatedYatras.length > 0 && (
            <section id="related">
              <SectionHeader align="left" kicker={t("yatraDetail.relatedKicker")} hindi="और यात्राएँ" title={t("yatraDetail.relatedTitle")} />
              <div className="mt-8">
                <RelatedYatrasCarousel yatras={relatedYatras} />
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-950/90 backdrop-blur-md border-t border-gold-300/20 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gold-200/60">{t("yatraDetail.from")}</p>
          <p className="text-lg font-bold text-cream leading-none mt-0.5">{formatCurrency(startingPrice(yatra.price), yatra.price?.currency)}</p>
        </div>
        {soldOut ? (
          <span className={`${btnPrimary} opacity-50`}>{t("yatraDetail.soldOut")}</span>
        ) : (
          <button onClick={() => navigate(`/events/${yatra.slug}/book`)} className={btnPrimary}>
            {t("yatraDetail.reserveSeat")}
          </button>
        )}
      </div>
    </div>
  );
}
