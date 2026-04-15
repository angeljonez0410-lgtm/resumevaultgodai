"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  Menu,
  MessageSquare,
  Mic,
  Share2,
  Settings,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/profile", label: "Profile", icon: FileText },
  { path: "/app/application-tracker", label: "Applications", icon: Briefcase },
  { path: "/app/analytics", label: "Analytics", icon: Zap },
  { path: "/app/interview-coach", label: "Interview Coach", icon: Mic },
  { path: "/app/follow-up-email", label: "Follow-Up Email", icon: Mail },
  { path: "/app/career-roadmap", label: "Career Roadmap", icon: Map },
  { path: "/app/portfolio-builder", label: "Portfolio Builder", icon: Globe },
  { path: "/app/social-media", label: "Social Bot", icon: Share2 },
  { path: "/app/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/AIAssistant", label: "Career AI", icon: Bot },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? "lg:w-[72px]" : "lg:w-64";
  const isActive = (path: string) => (path === "/app" ? pathname === "/app" : pathname.startsWith(path));

  const handleSignOut = async () => {
    await getSupabaseBrowser().auth.signOut();
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("sb_refresh_token");
    localStorage.removeItem("sb_user");
    router.push("/login");
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
              <span className="truncate text-lg font-semibold tracking-tight text-white">ResumeVaultGodAI</span>
            ) : null}
          </Link>
          <button className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sidebar-scroll">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
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
              </Link>
            );
          })}
        </nav>

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
          <span className="text-sm font-semibold">ResumeVaultGodAI</span>
        </Link>
      </header>

      <main className={`min-h-screen pt-14 transition-all duration-300 lg:pt-0 ${collapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}>
        {children}
      </main>
    </div>
  );
}
