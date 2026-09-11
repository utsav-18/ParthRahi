import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function InclusionExclusionList({ inclusions = [], exclusions = [], notes = [] }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/50 mb-3">{t("inclusionList.included")}</p>
          <ul className="space-y-2">
            {inclusions.length ? inclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-green-500/20 border border-green-400/40 text-green-300 text-[10px] flex items-center justify-center">✓</span>
                <span>{item}</span>
              </li>
            )) : <li className="text-white/40 text-sm">{t("inclusionList.none")}</li>}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/50 mb-3">{t("inclusionList.notIncluded")}</p>
          <ul className="space-y-2">
            {exclusions.length ? exclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-[10px] flex items-center justify-center">✕</span>
                <span>{item}</span>
              </li>
            )) : <li className="text-white/40 text-sm">{t("inclusionList.none")}</li>}
          </ul>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/80 mb-2">{t("inclusionList.importantNotes")}</p>
          <ul className="space-y-1.5 text-sm text-white/70">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2"><span className="text-amber-300">•</span><span>{n}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
