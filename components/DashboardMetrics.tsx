"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Briefcase, CheckCircle2, FileText, Target, TrendingUp } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

type Application = {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  created_at: string;
};

type Profile = {
  full_name?: string;
  skills?: string;
  professional_summary?: string;
  experiences?: unknown[];
};

export default function DashboardMetrics() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [appsRes, profileRes] = await Promise.all([authFetch("/api/applications"), authFetch("/api/profile")]);
        if (!cancelled && appsRes.ok) setApplications(await appsRes.json());
        if (!cancelled && profileRes.ok) setProfile(await profileRes.json());
      } catch {
        /* keep dashboard usable while signed out or offline */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((app) => app.status === "interview").length;
    const offers = applications.filter((app) => app.status === "offer").length;
    const active = applications.filter((app) => !["rejected", "offer"].includes(app.status)).length;
    const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;
    const profileParts = [
      profile.full_name,
      profile.professional_summary,
      profile.skills,
      Array.isArray(profile.experiences) && profile.experiences.length > 0 ? "experience" : "",
    ].filter(Boolean).length;
    const profileScore = Math.min(100, profileParts * 25);

    return [
      { label: "Tracked Applications", value: total.toString(), detail: `${active} active`, icon: Briefcase },
      { label: "Interview Rate", value: `${responseRate}%`, detail: `${interviews} interviews, ${offers} offers`, icon: TrendingUp },
      { label: "Profile Strength", value: `${profileScore}%`, detail: profileScore >= 75 ? "ready for AI tools" : "add more profile detail", icon: FileText },
      { label: "Next Best Move", value: total ? "Follow up" : "Analyze", detail: total ? "keep momentum visible" : "start with a job post", icon: Target },
    ];
  }, [applications, profile]);

  const recent = applications.slice(0, 4);

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-3xl font-black text-[#1e2d42]">{loading ? "..." : metric.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4c542]/20 text-[#1e2d42]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-[#1e2d42]">Recent Pipeline</h2>
            <p className="text-xs text-slate-500">Newest applications from your tracker.</p>
          </div>
          <BarChart3 className="h-5 w-5 text-[#b98912]" />
        </div>
        <div className="mt-4 space-y-3">
          {recent.length > 0 ? (
            recent.map((app) => (
              <Link
                key={app.id}
                href="/app/application-tracker"
                className="block rounded-lg border border-slate-200 p-3 transition hover:border-[#f4c542] hover:bg-[#fffdf5]"
              >
                <p className="truncate text-sm font-bold text-[#1e2d42]">{app.job_title}</p>
                <p className="truncate text-xs text-slate-500">{app.company_name}</p>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  {app.status}
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <CheckCircle2 className="mb-2 h-5 w-5 text-[#b98912]" />
              Add your first role to unlock live dashboard stats.
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
