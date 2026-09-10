export default function HighlightsList({ highlights = [] }) {
  if (!highlights.length) return null;
  return (
    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {highlights.map((h, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-amber-100/85">
          <span className="shrink-0 mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-amber-400/15 border border-amber-300/35 text-amber-200 text-[11px]">
            ✦
          </span>
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}
