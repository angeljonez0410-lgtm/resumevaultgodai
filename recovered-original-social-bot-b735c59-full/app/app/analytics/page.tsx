"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { TrendingUp, Briefcase, Star, FileText, Target } from "lucide-react";

export default function AnalyticsPage() {
  const [apps, setApps] = useState<Record<string, string | number>[]>([]);

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

  const total = apps.length;
  const applied = apps.filter((a) => a.status === "applied").length;
  const interviews = apps.filter((a) => a.status === "interview").length;
  const offers = apps.filter((a) => a.status === "offer").length;
  const rejected = apps.filter((a) => a.status === "rejected").length;
  const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;

  // Company breakdown
  const companyMap: Record<string, number> = {};
  apps.forEach((a) => {
    const c = (a.company_name as string) || "Unknown";
    companyMap[c] = (companyMap[c] || 0) + 1;
  });
  const topCompanies = Object.entries(companyMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Status breakdown for "chart"
  const statusData = [
    { label: "Applied", count: applied, color: "bg-purple-500", pct: total > 0 ? (applied / total) * 100 : 0 },
    { label: "Interviews", count: interviews, color: "bg-amber-500", pct: total > 0 ? (interviews / total) * 100 : 0 },
    { label: "Offers", count: offers, color: "bg-green-500", pct: total > 0 ? (offers / total) * 100 : 0 },
    { label: "Rejected", count: rejected, color: "bg-red-500", pct: total > 0 ? (rejected / total) * 100 : 0 },
  ];

  const stats = [
    { label: "Total Applications", value: total, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { label: "Response Rate", value: `${responseRate}%`, icon: Target, color: "text-emerald-600 bg-emerald-50" },
    { label: "Interviews", value: interviews, icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "Offers", value: offers, icon: FileText, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-500">Track your job hunt performance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Status Breakdown</h3>
          <div className="space-y-4">
            {statusData.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">{s.label}</span>
                  <span className="text-sm font-bold text-slate-800">{s.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${s.color} h-2.5 rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Top Companies</h3>
          {topCompanies.length === 0 ? (
            <p className="text-sm text-slate-400">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {topCompanies.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
