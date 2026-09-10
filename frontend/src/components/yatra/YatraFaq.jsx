import { AccordionItem } from "./Accordion";
import { DEFAULT_FAQS } from "../../lib/yatraContent";

export default function YatraFaq({ faqs }) {
  const list = Array.isArray(faqs) && faqs.filter((f) => f?.q && f?.a).length
    ? faqs.filter((f) => f?.q && f?.a)
    : DEFAULT_FAQS;

  return (
    <div className="flex flex-col gap-2">
      {list.map((f, i) => (
        <AccordionItem key={i} title={f.q}>
          <p className="text-amber-100/70 leading-relaxed whitespace-pre-line">{f.a}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
