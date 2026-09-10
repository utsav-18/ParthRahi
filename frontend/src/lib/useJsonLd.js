import { useEffect } from "react";

/** Inject (and clean up) a <script type="application/ld+json"> for the given object. */
export default function useJsonLd(data) {
  useEffect(() => {
    if (!data) return undefined;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, [data]);
}
