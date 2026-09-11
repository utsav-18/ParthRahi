import { AccordionItem } from "./Accordion";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function RulesAccordion({ rules = [], terms = [] }) {
  const { t } = useLanguage();
  const hasRules = rules.length > 0;
  const hasTerms = terms.length > 0;
  if (!hasRules && !hasTerms) return null;

  return (
    <div className="flex flex-col gap-2">
      {rules.map((rule, i) => (
        <AccordionItem key={i} title={rule.title} defaultOpen={false}>
          <p className="text-white/75 whitespace-pre-line">{rule.description}</p>
        </AccordionItem>
      ))}

      {hasTerms && (
        <AccordionItem title={t("rules.termsAndConditions")} defaultOpen={false}>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            {terms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
        </AccordionItem>
      )}
    </div>
  );
}
