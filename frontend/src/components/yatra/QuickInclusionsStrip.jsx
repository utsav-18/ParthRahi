export default function QuickInclusionsStrip({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className="group relative overflow-hidden rounded-2xl border border-amber-200/12 bg-[#160f06]/55 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/35"
        >
          <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-amber-400/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative mx-auto mb-2 grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-amber-300/20 to-amber-500/[0.06] border border-amber-300/20 text-xl">
            {item.icon || "✓"}
          </div>
          <p className="relative text-xs font-semibold text-amber-50">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
