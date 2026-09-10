import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Reset scroll on route change (except when navigating to a homepage section anchor).
export default function ScrollToTop() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (state?.scrollTo) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname, state]);
  return null;
}
