import { useState } from "react";
import api from "../../lib/api";
import { inputCls, btnAccent } from "../../lib/theme";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const phoneOk = (p) => /^(\+?[1-9]\d{0,3})?[\s-]?\d{10}$/.test(String(p).trim().replace(/[\s-]/g, ""));

export default function EnquiryForm({ yatraSlug, yatraTitle }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [serverError, setServerError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t("enquiry.errName");
    if (!phoneOk(form.phone)) errs.phone = t("enquiry.errPhone");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus("sending");
    setServerError("");
    try {
      await api.post("/api/enquiries", {
        ...form,
        yatraSlug,
        message: form.message || (yatraTitle ? `Enquiry about ${yatraTitle}` : undefined),
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setServerError(err.message);
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6 text-center">
        <p className="text-3xl mb-2">✅</p>
        <p className="text-white font-semibold">{t("enquiry.successTitle")}</p>
        <p className="text-white/60 text-sm mt-1">{t("enquiry.successDesc")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-amber-200/12 bg-amber-950/15 p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-amber-50">🙏 {t("enquiry.title")}</h3>
        <p className="text-amber-100/50 text-sm">{t("enquiry.subtitle")}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <input className={inputCls(errors.name)} placeholder={t("enquiry.namePlaceholder")} value={form.name} onChange={set("name")} />
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>
        <div className="space-y-1">
          <input className={inputCls(errors.phone)} placeholder={t("enquiry.phonePlaceholder")} inputMode="tel" value={form.phone} onChange={set("phone")} />
          {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
        </div>
        <input className={inputCls(false)} placeholder={t("enquiry.emailPlaceholder")} type="email" value={form.email} onChange={set("email")} />
        <input className={inputCls(false)} placeholder={t("enquiry.cityPlaceholder")} value={form.city} onChange={set("city")} />
      </div>

      <textarea
        className={`${inputCls(false)} min-h-[80px] resize-y`}
        placeholder={t("enquiry.messagePlaceholder")}
        value={form.message}
        onChange={set("message")}
      />

      {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

      <button type="submit" disabled={status === "sending"} className={`${btnAccent} w-full`}>
        {status === "sending" ? t("enquiry.sending") : t("enquiry.submit")}
      </button>
    </form>
  );
}
