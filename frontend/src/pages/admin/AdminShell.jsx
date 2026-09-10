import { Link } from "react-router-dom";

export default function AdminShell({ title, actions, children, back }) {
  return (
    <div className="relative z-10 pt-24 md:pt-28 pb-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
          <Link to="/admin/events" className="hover:text-white/70">Admin</Link>
          {back && (
            <>
              <span>/</span>
              <Link to={back.to} className="hover:text-white/70">{back.label}</Link>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          <div className="flex gap-2">{actions}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

export const adminBtn =
  "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors";
export const adminBtnPrimary = `${adminBtn} bg-cyan-300 text-slate-950 hover:bg-cyan-200`;
export const adminBtnGhost = `${adminBtn} border border-white/15 text-white/80 hover:bg-white/10`;
export const adminInput =
  "w-full bg-slate-900/85 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-300/60";
