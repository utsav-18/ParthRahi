import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { ADMIN_BASE } from "../lib/adminPath";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Direct admin sign-in — email + password only, no signup link, no Google
 * button, no forgot-password. On success it checks role === 'admin' itself
 * (rather than relying only on the /events route guard) so a non-admin who
 * tries this form gets a clear message instead of a silent redirect home.
 */
export default function AdminLoginModal({ isOpen, onClose }) {
  const { setUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reset the form each time the modal opens */
    if (isOpen) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setError("");
      setLoading(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const loggedInUser = res.data.user;
      if (loggedInUser.role !== "admin") {
        setError(t("adminLogin.notAdmin"));
        setLoading(false);
        return;
      }
      setUser(loggedInUser);
      onClose();
      navigate(`${ADMIN_BASE}/events`);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
  const btnClass =
    "w-full py-3 rounded-xl bg-cyan-300 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-300/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl leading-none cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <p className="text-[11px] tracking-[0.38em] uppercase text-cyan-400/90 mb-2">{t("auth.appName")}</p>
          <h2 className="text-2xl font-semibold text-white">{t("adminLogin.title")}</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("adminLogin.emailPlaceholder")}
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("adminLogin.passwordPlaceholder")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              {showPassword ? t("auth.hide") : t("auth.show")}
            </button>
          </div>
          <button type="submit" disabled={loading} className={btnClass}>
            {loading ? t("adminLogin.loggingIn") : t("adminLogin.loginBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}
