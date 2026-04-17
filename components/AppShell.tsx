"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
<<<<<<< HEAD
import { useState, useEffect } from "react";
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
  { name: "Social Bot", path: "/app/social-bot", icon: Bot },
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

// Admin emails (should match server-side)
// ...existing code for advanced AppShell with all navigation, hooks, and logic...
    }
    setIsAdmin(email && ADMIN_EMAILS.includes(email.toLowerCase()));
  }, []);

  const isActive = (path: string) => {
    if (path === "/app") return pathname === "/app";
    return pathname.startsWith(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("sb_refresh_token");
    localStorage.removeItem("sb_user");
    router.push("/login");
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
=======
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? "lg:w-[72px]" : "lg:w-64";
  const isActive = (path: string) => (path === "/app" ? pathname === "/app" : pathname.startsWith(path));

  const handleSignOut = async () => {
    await getSupabaseBrowser().auth.signOut();
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("sb_refresh_token");
    localStorage.removeItem("sb_user");
    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-slate-950 transition-all duration-300 ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/5 px-5">
          <Link href="/app" className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!collapsed ? (
              <span className="truncate text-lg font-semibold tracking-tight text-white">InfluencerAI</span>
            ) : null}
          </Link>
          <button className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sidebar-scroll">
          {navItems.map((item) => {
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
<<<<<<< HEAD
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
=======
                key={`${item.label}-${item.path}`}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active ? "bg-violet-500/15 text-violet-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active ? <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-violet-500" /> : null}
                <Icon className={`h-5 w-5 shrink-0 ${active ? "text-violet-400" : ""}`} />
                {!collapsed ? <span className="min-w-0 truncate text-sm font-medium">{item.label}</span> : null}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
              </Link>
            );
          })}
        </nav>

<<<<<<< HEAD
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

        {/* Admin Nav (only for admins) */}
        {isAdmin && (
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
        )}

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
=======
        <div className="px-3 pb-4">
          <div className={`rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 ${collapsed ? "p-2" : "p-3"}`}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 shrink-0 text-violet-400" />
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">Credits</p>
                  <p className="truncate text-sm font-semibold text-white">250 remaining</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleSignOut}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed ? <span>Sign Out</span> : null}
          </button>
        </div>

        <button
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-400 transition hover:text-white lg:flex"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-white/5 bg-slate-950/95 px-4 backdrop-blur lg:hidden">
        <button className="rounded-lg p-2 text-slate-300" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/app" className="ml-auto flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold">InfluencerAI</span>
        </Link>
      </header>

      <main className={`min-h-screen pt-14 transition-all duration-300 lg:pt-0 ${collapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}>
        {children}
      </main>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    </div>
  );
}
