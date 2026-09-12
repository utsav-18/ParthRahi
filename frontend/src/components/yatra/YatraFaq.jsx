import { AccordionItem } from "./Accordion";
import { getDefaultFaqs } from "../../lib/yatraContent";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function YatraFaq({ faqs }) {
  const { t } = useLanguage();
  const list = Array.isArray(faqs) && faqs.filter((f) => f?.q && f?.a).length
    ? faqs.filter((f) => f?.q && f?.a)
    : getDefaultFaqs(t);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {list.map((f, i) => (
        <AccordionItem key={i} title={f.q}>
          <p className="text-amber-100/70 leading-relaxed whitespace-pre-line">{f.a}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
