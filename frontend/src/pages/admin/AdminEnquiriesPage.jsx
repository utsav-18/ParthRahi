import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";
import useDocumentMeta from "../../lib/useDocumentMeta";
import { formatDate } from "../../lib/format";
import AdminShell, { adminInput } from "./AdminShell";

const STATUS = ["new", "contacted", "converted", "closed"];

export default function AdminEnquiriesPage() {
  const { id } = useParams();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useDocumentMeta({ title: "Admin — Enquiries" });

  const load = () => {
    setLoading(true);
    api
      .get(`/api/admin/yatras/${id}/enquiries`)
      .then((res) => setEnquiries(res.data.enquiries || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(load, [id]);

  const patch = async (enquiryId, status) => {
    try {
      await api.patch(`/api/admin/enquiries/${enquiryId}`, { status });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminShell title="Enquiries" back={{ to: "/admin/events", label: "Yatras" }}>
      {loading ? (
        <p className="text-white/50 py-10">Loading…</p>
      ) : error ? (
        <p className="text-red-400 py-10">{error}</p>
      ) : enquiries.length === 0 ? (
        <p className="text-white/50 py-10">No enquiries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-3">Date</th>
                <th className="text-left px-3 py-3">Name / Contact</th>
                <th className="text-left px-3 py-3">Message</th>
                <th className="text-left px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {enquiries.map((e) => (
                <tr key={e._id} className="hover:bg-white/[0.02] align-top">
                  <td className="px-3 py-3 text-white/40 text-xs whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td className="px-3 py-3">
                    <p className="text-white">{e.name || "—"}</p>
                    <p className="text-white/40 text-xs">{e.phone}{e.email ? ` · ${e.email}` : ""}{e.city ? ` · ${e.city}` : ""}</p>
                  </td>
                  <td className="px-3 py-3 text-white/70 max-w-sm">{e.message || "—"}</td>
                  <td className="px-3 py-3">
                    <select className={`${adminInput} !py-1 text-xs`} value={e.status} onChange={(ev) => patch(e._id, ev.target.value)}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
