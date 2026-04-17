"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Briefcase, Plus, Trash2, Edit2, X, Check } from "lucide-react";

interface Application {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_date?: string;
  notes?: string;
  salary_range?: string;
  job_url?: string;
  created_at: string;
}

const statuses = ["analyzing", "ready", "applied", "interview", "offer", "rejected"];
const statusColors: Record<string, string> = {
  analyzing: "bg-blue-50 text-blue-700",
  ready: "bg-emerald-50 text-emerald-700",
  applied: "bg-purple-50 text-purple-700",
  interview: "bg-amber-50 text-amber-700",
  offer: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function ApplicationTrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ job_title: "", company_name: "", status: "applied", salary_range: "", job_url: "", notes: "" });

  const load = async () => {
    try {
      const res = await authFetch("/api/applications");
      if (res.ok) setApps(await res.json());
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/applications");
        if (res.ok && !cancelled) setApps(await res.json());
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    if (!form.job_title.trim() || !form.company_name.trim()) return;
    if (editingId) {
      await authFetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
    } else {
      await authFetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ job_title: "", company_name: "", status: "applied", salary_range: "", job_url: "", notes: "" });
    load();
  };

  const startEdit = (app: Application) => {
    setForm({
      job_title: app.job_title,
      company_name: app.company_name,
      status: app.status,
      salary_range: app.salary_range || "",
      job_url: app.job_url || "",
      notes: app.notes || "",
    });
    setEditingId(app.id);
    setShowForm(true);
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await authFetch(`/api/applications?id=${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  const updateStatus = async (id: string, status: string) => {
    await authFetch("/api/applications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const stats = [
    { label: "Total", value: apps.length, color: "bg-slate-100 text-slate-700" },
    { label: "Applied", value: apps.filter((a) => a.status === "applied").length, color: "bg-purple-50 text-purple-700" },
    { label: "Interviews", value: apps.filter((a) => a.status === "interview").length, color: "bg-amber-50 text-amber-700" },
    { label: "Offers", value: apps.filter((a) => a.status === "offer").length, color: "bg-green-50 text-green-700" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Application Tracker</h1>
            <p className="text-sm text-slate-500">Track all your job applications</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ job_title: "", company_name: "", status: "applied", salary_range: "", job_url: "", notes: "" }); }} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card p-6 mb-6 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">{editingId ? "Edit Application" : "New Application"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="label">Job Title *</label><input className="input" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Software Engineer" /></div>
            <div><label className="label">Company *</label><input className="input" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Google" /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div><label className="label">Salary Range</label><input className="input" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="$120k-$150k" /></div>
          </div>
          <div className="mb-4"><label className="label">Job URL</label><input className="input" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." /></div>
          <div className="mb-4"><label className="label">Notes</label><textarea className="input min-h-[80px] resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." /></div>
          <button onClick={save} className="btn-primary gap-2"><Check className="w-4 h-4" /> {editingId ? "Update" : "Save"}</button>
        </div>
      )}

      {/* Table */}
      {apps.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No applications yet</p>
          <p className="text-sm text-slate-400 mt-1">Track your job applications here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Position</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Company</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{app.job_title}</td>
                  <td className="py-3 px-4 text-slate-600">{app.company_name}</td>
                  <td className="py-3 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[app.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(app)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteApp(app.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
