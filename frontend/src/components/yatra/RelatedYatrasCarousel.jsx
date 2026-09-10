import YatraCard from "./YatraCard";

export default function RelatedYatrasCarousel({ yatras = [] }) {
  if (!yatras.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:thin]">
      {yatras.map((y) => (
        <div key={y._id || y.slug} className="w-[260px] shrink-0 snap-start">
          <YatraCard yatra={y} />
        </div>
      ))}
    </div>
  );
}
