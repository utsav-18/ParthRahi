import { AccordionItem } from "./Accordion";

export default function RulesAccordion({ rules = [], terms = [] }) {
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
        <AccordionItem title="Terms & Conditions" defaultOpen={false}>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            {terms.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </AccordionItem>
      )}
    </div>
  );
}
