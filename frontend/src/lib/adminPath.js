// Secret base path for the admin area. Override with VITE_ADMIN_PATH in .env
// so the real value never lives in source control — only you know the URL.
// This is obscurity, not the actual security boundary: real access control is
// still enforced server-side by RequireAdmin / requireAdmin (ADMIN_EMAILS role
// check on every request). Hiding the link just keeps casual visitors from
// ever stumbling onto — or guessing — the admin area.
const raw = import.meta.env.VITE_ADMIN_PATH || "admin-portal";
export const ADMIN_BASE = `/${String(raw).replace(/^\/+|\/+$/g, "")}`;
