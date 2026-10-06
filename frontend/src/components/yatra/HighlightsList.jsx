export default function HighlightsList({ highlights = [] }) {
  if (!highlights.length) return null;
  return (
    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {highlights.map((h, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-cream/85">
          <span className="shrink-0 mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-gold-300/10 border border-gold-300/35 text-gold-200 text-[11px]">
            ✦
          </span>
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}
