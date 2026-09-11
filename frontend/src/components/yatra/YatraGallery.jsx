import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

// Adapted from the Lightbox / HotelGallery pattern in EventsSection.jsx,
// generalised to accept a plain list of image URLs.

function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const containerRef = useRef(null);
  const startXRef = useRef(null);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e) => { startXRef.current = e.touches[0].clientX; };
    const onEnd = (e) => {
      if (startXRef.current === null) return;
      const diff = e.changedTouches[0].clientX - startXRef.current;
      if (Math.abs(diff) > 50) (diff < 0 ? next() : prev());
      startXRef.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div
        ref={containerRef}
        className="relative w-full md:w-auto md:max-w-2xl bg-[#0f1623] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
            {current + 1} / {images.length}
          </span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 border border-white/15 text-white/70 text-sm flex items-center justify-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5" aria-label="Close">×</button>
        </div>
        <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden bg-black/40" style={{ aspectRatio: "16/10" }}>
          {images.map((src, i) => (
            <img key={src + i} src={src} alt={`Photo ${i + 1}`} draggable={false} className="absolute inset-0 w-full h-full object-cover select-none" style={{ opacity: i === current ? 1 : 0, transition: "opacity 0.3s ease" }} />
          ))}
          {images.length > 1 && (
            <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center cursor-pointer" onClick={prev} aria-label="Previous">‹</button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center cursor-pointer" onClick={next} aria-label="Next">›</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function YatraGallery({ images = [], title = "" }) {
  const { t } = useLanguage();
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el || list.length < 2) return;
    let startX = null;
    const onStart = (e) => { startX = e.touches[0].clientX; };
    const onEnd = (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        setActive((c) => (diff < 0 ? (c + 1) % list.length : (c - 1 + list.length) % list.length));
      }
      startX = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [list.length]);

  if (!list.length) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center text-white/25 text-4xl" style={{ aspectRatio: "16/10" }}>
        🛕
      </div>
    );
  }

  return (
    <>
      {lightbox !== null && <Lightbox images={list} index={lightbox} onClose={() => setLightbox(null)} />}

      <div>
        <div
          ref={galleryRef}
          className="relative w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 cursor-zoom-in"
          style={{ aspectRatio: "16/10" }}
          onClick={() => setLightbox(active)}
        >
          {list.map((src, i) => (
            <img key={src + i} src={src} alt={`${title} photo ${i + 1}`} draggable={false} className="absolute inset-0 w-full h-full object-cover select-none" style={{ opacity: i === active ? 1 : 0, transition: "opacity 0.35s ease" }} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-3 right-3">
            <span className="text-white/60 text-[10px] bg-black/40 px-2 py-0.5 rounded-full border border-white/10">{t("gallery.tapToExpand")}</span>
          </div>
          {list.length > 1 && (
            <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/20 text-white text-lg hidden md:flex items-center justify-center cursor-pointer hover:bg-black/60" onClick={(e) => { e.stopPropagation(); setActive((c) => (c - 1 + list.length) % list.length); }} aria-label="Previous">‹</button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/20 text-white text-lg hidden md:flex items-center justify-center cursor-pointer hover:bg-black/60" onClick={(e) => { e.stopPropagation(); setActive((c) => (c + 1) % list.length); }} aria-label="Next">›</button>
            </>
          )}
        </div>

        {list.length > 1 && (
          <div className="flex gap-2 mt-2">
            {list.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActive(i)}
                className="relative flex-1 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{ aspectRatio: "4/3", borderColor: i === active ? "rgba(252,211,77,0.85)" : "rgba(255,255,255,0.08)" }}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
                {i !== active && <div className="absolute inset-0 bg-black/40" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
