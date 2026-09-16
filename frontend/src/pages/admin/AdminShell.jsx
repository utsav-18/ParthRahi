import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ADMIN_BASE } from "../../lib/adminPath";
import { useAuth } from "../../AuthContext";

export default function AdminShell({ title, actions, children, back }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isYatrasActive = location.pathname === `${ADMIN_BASE}/events` || (location.pathname.startsWith(`${ADMIN_BASE}/events/`) && !location.pathname.endsWith("/new"));
  const isNewYatraActive = location.pathname === `${ADMIN_BASE}/events/new`;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col">
      {/* Dedicated Admin Header */}
      <header className="w-full bg-slate-950/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand + Badge + Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link to={`${ADMIN_BASE}/events`} className="flex items-center gap-2.5 group">
              <span className="text-lg font-bold tracking-wide text-white group-hover:text-cyan-300 transition-colors">
                ParthRahi
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Admin
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to={`${ADMIN_BASE}/events`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isYatrasActive
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Yatras
              </Link>
              <Link
                to={`${ADMIN_BASE}/events/new`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isNewYatraActive
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                + New Yatra
              </Link>
            </nav>
          </div>

          {/* Right: Actions (Public site, Admin user, Logout) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
              title="Open public website in a new tab"
            >
              <span>View Website</span>
              <span className="text-white/40 text-[10px]">↗</span>
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-xs font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-xs text-white/80 max-w-[140px] truncate font-medium">
                {user?.name || user?.email || "Admin"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              title="Logout from Admin Panel"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle admin navigation"
              className="p-2 rounded-lg border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 py-4 space-y-3">
            <nav className="flex flex-col gap-1">
              <Link
                to={`${ADMIN_BASE}/events`}
                onClick={() => setMobileNavOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isYatrasActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Yatras
              </Link>
              <Link
                to={`${ADMIN_BASE}/events/new`}
                onClick={() => setMobileNavOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isNewYatraActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                + New Yatra
              </Link>
              <Link
                to="/events"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white flex items-center justify-between"
              >
                <span>View Website</span>
                <span className="text-white/40 text-xs">↗</span>
              </Link>
            </nav>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-xs font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <span className="text-xs text-white/80 max-w-[150px] truncate">
                  {user?.name || user?.email || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-2.5 py-1.5 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
          <Link to={`${ADMIN_BASE}/events`} className="hover:text-white/70 transition-colors">Admin</Link>
          {back && (
            <>
              <span>/</span>
              <Link to={back.to} className="hover:text-white/70 transition-colors">{back.label}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-white/70 truncate max-w-[200px] sm:max-w-none">{title}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
          {actions && <div className="flex gap-2 flex-wrap items-center">{actions}</div>}
        </div>

        {children}
      </main>
    </div>
  );
}

export const adminBtn =
  "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors";
export const adminBtnPrimary = `${adminBtn} bg-cyan-300 text-slate-950 hover:bg-cyan-200`;
export const adminBtnGhost = `${adminBtn} border border-white/15 text-white/80 hover:bg-white/10`;
export const adminInput =
  "w-full bg-slate-900/85 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-300/60";
