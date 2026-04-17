"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";
import {
  Search, FileText, Mail, Send, Briefcase, TrendingUp,
  ArrowRight, Star, Zap, Mic, DollarSign, Map, Lightbulb, Crown
} from "lucide-react";

const quickActions = [
  { title: "Analyze Job", desc: "Extract ATS keywords from a job posting", icon: Search, page: "/app/job-analyzer", color: "from-blue-500 to-blue-600" },
  { title: "Build Resume", desc: "Generate a tailored resume", icon: FileText, page: "/app/resume-builder", color: "from-emerald-500 to-emerald-600" },
  { title: "Cover Letter", desc: "Write a compelling cover letter", icon: Mail, page: "/app/cover-letter", color: "from-purple-500 to-purple-600" },
  { title: "Follow-Up", desc: "Craft a professional follow-up email", icon: Send, page: "/app/follow-up-email", color: "from-amber-500 to-orange-600" },
];

const premiumActions = [
  { title: "Mock Interview", desc: "Practice with AI-generated questions", icon: Mic, page: "/app/interview-coach" },
  { title: "Salary Negotiation", desc: "Ready-to-use negotiation scripts", icon: DollarSign, page: "/app/salary-negotiation" },
  { title: "Career Roadmap", desc: "Step-by-step plan to your goals", icon: Map, page: "/app/career-roadmap" },
  { title: "Portfolio Ideas", desc: "Impress recruiters with standout projects", icon: Lightbulb, page: "/app/portfolio-ideas" },
];

const statusColors: Record<string, string> = {
  analyzing: "bg-blue-50 text-blue-700",
  ready: "bg-emerald-50 text-emerald-700",
  applied: "bg-purple-50 text-purple-700",
  interview: "bg-amber-50 text-amber-700",
  offer: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const quotes = [
  "Your resume is the key — let AI sharpen it to perfection.",
  "Every application is a step closer. Keep going.",
  "ATS can't stop a God-Mode resume.",
  "The best time to apply was yesterday. The next best is now.",
  "Career success is built one tailored resume at a time.",
];

export default function DashboardPage() {
  const [applications, setApplications] = useState<Record<string, string | number>[]>([]);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/applications");
        if (res.ok && !cancelled) setApplications(await res.json());
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalApps = applications.length;
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const appliedCount = applications.filter((a) =>
    ["applied", "interview", "offer"].includes(a.status as string)
  ).length;

  const stats = [
    { label: "Total Applications", value: totalApps, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { label: "Active Applications", value: appliedCount, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Interviews", value: interviewCount, icon: Star, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div>
      {/* Tagline */}
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest">
          ⚡ Beat the ATS in 60 seconds • God-Mode Your Job Hunt
        </p>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Unlock 4 premium AI tools</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Mock Interview · Salary Negotiation · Career Roadmap · Portfolio Ideas
            </p>
          </div>
        </div>
        <Link href="/app/pricing">
          <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap">
            <Zap className="w-4 h-4" /> Upgrade Now
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Quote */}
      <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 text-center">
        <p className="text-sm text-amber-800 italic">&ldquo;{quote}&rdquo;</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.page} href={action.page} className="block">
                <div className="card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-slate-200">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Premium Tools */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Premium Tools
          </h2>
          <Link href="/app/pricing" className="text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center gap-1">
            Unlock all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {premiumActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.page} href={action.page} className="block">
                <div className="card p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-amber-100 bg-gradient-to-br from-amber-50/30 to-orange-50/20 hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>
            <Link href="/app/application-tracker" className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-4 font-medium text-slate-800">{app.job_title as string}</td>
                    <td className="py-3 px-4 text-slate-600">{app.company_name as string}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status as string] || "bg-gray-100 text-gray-600"}`}>
                        {(app.status as string) || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
