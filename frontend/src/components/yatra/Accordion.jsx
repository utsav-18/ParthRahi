import { useState, useId } from "react";

// Keyboard-accessible accordion item. Collapsed by default.
export function AccordionItem({ title, subtitle, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="rounded-xl border border-gold-300/15 bg-navy-900/55 backdrop-blur-sm overflow-hidden transition-colors hover:border-gold-300/30">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left cursor-pointer transition-colors hover:bg-navy-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
        >
          {badge != null && (
            <span className="shrink-0 text-xs font-bold text-gold-300 min-w-[52px]">{badge}</span>
          )}
          <span className="flex-1 min-w-0">
            <span className="block text-base font-semibold text-cream leading-snug">{title}</span>
            {subtitle && <span className="block text-sm text-cream/50 truncate">{subtitle}</span>}
          </span>
          <svg
            viewBox="0 0 16 16"
            className={`w-4 h-4 shrink-0 text-gold-300/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        hidden={!open}
        className="px-4 sm:px-5 pb-5 pt-1 text-base text-cream/75 leading-relaxed"
      >
        {children}
      </div>
    </div>
  );
}
