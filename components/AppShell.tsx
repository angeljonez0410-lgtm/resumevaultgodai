"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  BarChart3,
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileArchive,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  SearchCheck,
  Send,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/auto-apply", label: "Auto Apply", icon: Send },
  { path: "/app/job-analyzer", label: "Job Analyzer", icon: SearchCheck },
  { path: "/app/resume-builder", label: "Resume Builder", icon: FileText },
  { path: "/app/resume-library", label: "Resume Library", icon: FileArchive },
  { path: "/app/cover-letter", label: "Cover Letter", icon: ClipboardCheck },
  { path: "/app/follow-up-email", label: "Follow-Up Email", icon: Mail },
  { path: "/app/profile", label: "My Profile", icon: Briefcase },
  { path: "/app/application-tracker", label: "Application Tracker", icon: ClipboardCheck },
  { path: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/app/pricing", label: "Pricing", icon: Zap },
  { path: "/app/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/app/admin-users", label: "Admin Users", icon: Users },
  { path: "/app/admin-ai", label: "Admin AI Assistant", icon: Bot },
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#2c3d58] bg-[#1e2d42] text-white transition-all duration-300 ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[76px] items-center border-b border-white/10 px-5">
          <Link href="/app" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f4c542]">
              <Sparkles className="h-5 w-5 text-[#1e2d42]" />
            </div>
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold leading-5 text-white">ResumeVault</span>
                <span className="block truncate text-xs font-semibold text-[#f4c542]">God-Mode Job Hunt</span>
              </span>
            ) : null}
          </Link>
          <button className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {!collapsed ? (
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f4c542]">ResumevaultGodAI</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Beat the ATS in 60 seconds and God-Mode your job hunt.
            </p>
          </div>
        ) : null}

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
                  active ? "bg-[#f4c542] text-[#1e2d42] shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active ? <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#1e2d42]" /> : null}
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed ? <span className="min-w-0 truncate text-sm font-medium">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className={`rounded-xl border border-[#f4c542]/30 bg-white/10 ${collapsed ? "p-2" : "p-3"}`}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 shrink-0 text-[#f4c542]" />
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-300">ATS Power</p>
                  <p className="truncate text-sm font-semibold text-white">250 remaining</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleSignOut}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed ? <span>Sign Out</span> : null}
          </button>
        </div>

        <button
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-slate-500 shadow transition hover:text-slate-900 lg:flex"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button className="rounded-lg p-2 text-slate-700" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/app" className="ml-auto flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4c542]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-[#1e2d42]">ResumeVaultGodAI</span>
        </Link>
      </header>

      <main className={`min-h-screen pt-14 transition-all duration-300 lg:pt-0 ${collapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}>
        <div className="mx-auto min-h-screen max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
