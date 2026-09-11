import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import useDocumentMeta from "../../lib/useDocumentMeta";
import { formatCurrency } from "../../lib/format";
import AdminShell, { adminBtnPrimary } from "./AdminShell";
import { ADMIN_BASE } from "../../lib/adminPath";

const statusTone = {
  published: "bg-green-500/15 text-green-300 border-green-400/30",
  draft: "bg-white/10 text-white/60 border-white/20",
  closed: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  completed: "bg-slate-500/15 text-slate-300 border-slate-400/30",
};

export default function AdminYatraListPage() {
  const navigate = useNavigate();
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useDocumentMeta({ title: "Admin — Yatras" });

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/yatras")
      .then((res) => setYatras(res.data.yatras || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  const remove = async (y) => {
    if (!window.confirm(`Delete "${y.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/yatras/${y._id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminShell
      title="Yatras"
      actions={<Link to={`${ADMIN_BASE}/events/new`} className={adminBtnPrimary}>+ New Yatra</Link>}
    >
      {loading ? (
        <p className="text-white/50 py-10">Loading…</p>
      ) : error ? (
        <p className="text-red-400 py-10">{error}</p>
      ) : yatras.length === 0 ? (
        <p className="text-white/50 py-10">No yatras yet. Create the first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Seats</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {yatras.map((y) => (
                <tr key={y._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{y.title}</p>
                    <p className="text-white/40 text-xs">/{y.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-xs capitalize ${statusTone[y.status] || statusTone.draft}`}>
                      {y.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {y.seatsBooked} / {y.totalSeats}
                  </td>
                  <td className="px-4 py-3 text-white/70">{formatCurrency(y.price?.amount, y.price?.currency)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      <button onClick={() => navigate(`${ADMIN_BASE}/events/${y._id}`)} className="text-xs px-2.5 py-1 rounded-md border border-white/15 text-white/70 hover:bg-white/10 cursor-pointer">Edit</button>
                      <button onClick={() => navigate(`${ADMIN_BASE}/events/${y._id}/bookings`)} className="text-xs px-2.5 py-1 rounded-md border border-white/15 text-white/70 hover:bg-white/10 cursor-pointer">Bookings</button>
                      <button onClick={() => navigate(`${ADMIN_BASE}/events/${y._id}/enquiries`)} className="text-xs px-2.5 py-1 rounded-md border border-white/15 text-white/70 hover:bg-white/10 cursor-pointer">Enquiries</button>
                      <button onClick={() => remove(y)} className="text-xs px-2.5 py-1 rounded-md border border-red-500/30 text-red-300 hover:bg-red-500/10 cursor-pointer">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
