"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Search, FileText, Mail, Send, User,
  X, Sparkles, ChevronRight, Mic, DollarSign, Map, Lightbulb,
  Zap, CreditCard, Briefcase, MessageSquare, TrendingUp,
  ArrowLeft, LogOut, Menu, Users, Bot, Shield
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "Auto Apply", path: "/app/auto-apply", icon: Zap },
  { name: "Job Analyzer", path: "/app/job-analyzer", icon: Search },
  { name: "Resume Builder", path: "/app/resume-builder", icon: FileText },
  { name: "Resume Library", path: "/app/resume-library", icon: FileText },
  { name: "Cover Letter", path: "/app/cover-letter", icon: Mail },
  { name: "Follow-Up Email", path: "/app/follow-up-email", icon: Send },
  { name: "My Profile", path: "/app/profile", icon: User },
  { name: "Application Tracker", path: "/app/application-tracker", icon: Briefcase },
  { name: "Analytics", path: "/app/analytics", icon: TrendingUp },
  { name: "Pricing", path: "/app/pricing", icon: CreditCard },
  { name: "Reviews", path: "/app/reviews", icon: MessageSquare },
];

const PREMIUM_NAV = [
  { name: "Interview Coach", path: "/app/interview-coach", icon: Mic },
  { name: "Salary Negotiation", path: "/app/salary-negotiation", icon: DollarSign },
  { name: "Career Roadmap", path: "/app/career-roadmap", icon: Map },
  { name: "Portfolio Ideas", path: "/app/portfolio-ideas", icon: Lightbulb },
];

const ADMIN_NAV = [
  { name: "Admin Users", path: "/app/admin-users", icon: Users },
  { name: "Admin AI Assistant", path: "/app/admin-ai", icon: Bot },
];

const BOTTOM_TABS = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "Analyzer", path: "/app/job-analyzer", icon: Search },
  { name: "Resumes", path: "/app/resume-library", icon: FileText },
  { name: "Profile", path: "/app/profile", icon: User },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/app") return pathname === "/app";
    return pathname.startsWith(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem("sb_access_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 border-r border-[#2a3f5f]
          transform transition-transform duration-300 ease-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ backgroundColor: "#1e2d42" }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#2a3f5f]">
          <div className="flex items-center justify-between">
            <Link href="/app" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
                style={{ backgroundColor: "#f4c542" }}
              >
                <Sparkles className="w-5 h-5" style={{ color: "#1e2d42" }} />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-tight">Resumevault</h1>
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-medium"
                  style={{ color: "#f4c542" }}
                >
                  God-Mode Job Hunt
                </p>
              </div>
            </Link>
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-[#2a3f5f]">
            <p className="text-xs text-white/80 italic leading-relaxed">
              <span style={{ color: "#f4c542" }}>⚡</span> ResumevaultGodAI — Beat the ATS in 60 seconds &amp; God-Mode your job hunt.
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto sidebar-scroll">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? "shadow-lg" : "text-[#e5e7eb] hover:bg-[#2a3f5f]"
                }`}
                style={active ? { backgroundColor: "#f4c542", color: "#1e2d42" } : {}}
              >
                <Icon className="w-[18px] h-[18px]" style={active ? { color: "#1e2d42" } : {}} />
                <span>{item.name}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Premium Nav */}
        <div className="px-4 pb-2">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/60 px-4 mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3" style={{ color: "#f4c542" }} /> Premium
          </p>
          {PREMIUM_NAV.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                  active ? "shadow-lg" : "text-[#e5e7eb] hover:bg-[#2a3f5f]"
                }`}
                style={active ? { backgroundColor: "#f4c542", color: "#1e2d42" } : {}}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  style={active ? { color: "#1e2d42" } : { color: "#f4c542" }}
                />
                <span>{item.name}</span>
                <Zap
                  className="w-3 h-3 ml-auto"
                  style={active ? { color: "#1e2d42", opacity: 0.7 } : { color: "#f4c542", opacity: 0.7 }}
                />
              </Link>
            );
          })}
        </div>

        {/* Admin Nav */}
        <div className="px-4 pb-2">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/60 px-4 mb-2 flex items-center gap-1.5">
            <Shield className="w-3 h-3" style={{ color: "#f4c542" }} /> Admin
          </p>
          {ADMIN_NAV.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                  active ? "shadow-lg" : "hover:bg-[#2a3f5f]"
                }`}
                style={active ? { backgroundColor: "#f4c542", color: "#1e2d42" } : { color: "#f4c542" }}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  style={active ? { color: "#1e2d42" } : { color: "#f4c542" }}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a3f5f] mt-2 space-y-3">
          <div
            className="rounded-xl p-4 border"
            style={{
              background: "linear-gradient(to bottom right, rgba(244,197,66,0.2), rgba(244,197,66,0.1))",
              borderColor: "rgba(244,197,66,0.3)",
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#f4c542" }}>AI-Powered</p>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Get tailored resumes, cover letters, and more.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-[#2a3f5f] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-14">
        {/* Mobile header */}
        <header
          className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: "#1e2d42" }}
        >
          <button className="text-white p-1" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          {pathname !== "/app" && (
            <button className="text-white p-1" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/app" className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f4c542" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#1e2d42" }} />
            </div>
            <span className="font-bold text-white text-sm">Resumevault</span>
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-10">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a3f5f] flex justify-around"
        style={{ backgroundColor: "#1e2d42" }}
      >
        {BOTTOM_TABS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-all ${
                active ? "text-[#f4c542]" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="truncate w-12 text-center">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
