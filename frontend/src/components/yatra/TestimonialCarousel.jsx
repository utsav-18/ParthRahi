import { useState } from "react";

export default function TestimonialCarousel({ testimonials = [] }) {
  const [i, setI] = useState(0);
  if (!testimonials.length) return null;

  const t = testimonials[i];
  const go = (dir) => setI((c) => (c + dir + testimonials.length) % testimonials.length);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start gap-4">
        {t.photoUrl ? (
          <img src={t.photoUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/15 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white font-semibold flex items-center justify-center shrink-0">
            {(t.name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{t.name}</p>
            {t.city && <span className="text-white/40 text-xs">· {t.city}</span>}
          </div>
          <div className="text-amber-300 text-sm">{"★".repeat(Math.round(t.rating || 5))}</div>
          <p className="text-white/75 text-sm mt-2 leading-relaxed">"{t.message}"</p>
        </div>
      </div>

      {testimonials.length > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex gap-1.5">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Testimonial ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-amber-300" : "w-1.5 bg-white/20"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} className="w-8 h-8 rounded-full border border-white/15 text-white/70 hover:bg-white/10 cursor-pointer" aria-label="Previous">‹</button>
            <button onClick={() => go(1)} className="w-8 h-8 rounded-full border border-white/15 text-white/70 hover:bg-white/10 cursor-pointer" aria-label="Next">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
