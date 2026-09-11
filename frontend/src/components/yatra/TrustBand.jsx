import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function TrustBand({ compact = false }) {
  const { t } = useLanguage();
  const items = [
    { icon: "🏢", title: t("trustBand.item1Title"), sub: t("trustBand.item1Sub") },
    { icon: "🧭", title: t("trustBand.item2Title"), sub: t("trustBand.item2Sub") },
    { icon: "🍛", title: t("trustBand.item3Title"), sub: t("trustBand.item3Sub") },
    { icon: "💬", title: t("trustBand.item4Title"), sub: t("trustBand.item4Sub") },
  ];

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl border border-amber-200/12 bg-amber-950/20 p-4 transition-all duration-300 hover:bg-amber-900/25 hover:-translate-y-1"
        >
          <div className="text-2xl mb-2" aria-hidden="true">{it.icon}</div>
          <p className="text-sm font-semibold text-amber-50">{it.title}</p>
          <p className="text-[12px] text-amber-100/60 mt-0.5 leading-snug">{it.sub}</p>
        </div>
      ))}
    </div>
  );
}
