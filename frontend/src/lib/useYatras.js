import { useEffect, useMemo, useState } from "react";
import api from "./api";
import { localizeYatra } from "./localizeYatra";
import { useLanguage } from "./i18n/LanguageContext";

// Published yatras from the public listing endpoint, localized to the current
// site language. Fetched once; switching EN/हिं re-applies the overlay without
// a refetch (same pattern as the list/detail pages).
export default function useYatras() {
  const { lang } = useLanguage();
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/api/yatras")
      .then((r) => active && setRaw(r.data.yatras || []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const yatras = useMemo(() => raw.map((y) => localizeYatra(y, lang)), [raw, lang]);
  return { yatras, loading };
}
