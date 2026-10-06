import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function TrustBand() {
  const { t } = useLanguage();
  const items = [
    { icon: "🏢", title: t("trustBand.item1Title"), sub: t("trustBand.item1Sub") },
    { icon: "🧭", title: t("trustBand.item2Title"), sub: t("trustBand.item2Sub") },
    { icon: "🍛", title: t("trustBand.item3Title"), sub: t("trustBand.item3Sub") },
    { icon: "💬", title: t("trustBand.item4Title"), sub: t("trustBand.item4Sub") },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="pr-card pr-card-hover rounded-2xl p-5 flex gap-4 items-start">
          <span className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-gold-300/10 border border-gold-300/25 text-xl" aria-hidden="true">
            {it.icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cream">{it.title}</p>
            <p className="text-[13px] text-cream/60 mt-1 leading-snug">{it.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
