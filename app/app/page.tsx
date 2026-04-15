import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  ClipboardCheck,
  FileArchive,
  FileText,
  Mail,
  SearchCheck,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import DashboardMetrics from "@/components/DashboardMetrics";

const tools = [
  { href: "/app/auto-apply", label: "Auto Apply", text: "Generate targeted job packs and outreach angles.", icon: Send },
  { href: "/app/job-analyzer", label: "Job Analyzer", text: "Extract ATS keywords and gaps from a role.", icon: SearchCheck },
  { href: "/app/resume-builder", label: "Resume Builder", text: "Create a role-specific ATS resume draft.", icon: FileText },
  { href: "/app/resume-library", label: "Resume Library", text: "Organize versions and winning resume assets.", icon: FileArchive },
  { href: "/app/cover-letter", label: "Cover Letter", text: "Write a tailored letter with job-fit proof.", icon: ClipboardCheck },
  { href: "/app/follow-up-email", label: "Follow-Up Email", text: "Send polished follow-ups at every stage.", icon: Mail },
  { href: "/app/application-tracker", label: "Application Tracker", text: "Keep every opportunity and next step visible.", icon: Briefcase },
  { href: "/app/analytics", label: "Analytics", text: "Track response rate, interviews, and offers.", icon: BarChart3 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p className="inline-flex rounded-full bg-[#fff5d6] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#9a6b00]">
              God-Mode Job Hunt
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-[#1e2d42] sm:text-5xl">
              ResumeVaultGodAI
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Beat the ATS in 60 seconds and run your full job hunt from one professional command center.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/app/job-analyzer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1e2d42] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a3f5f]"
              >
                <SearchCheck className="h-4 w-4 text-[#f4c542]" />
                Analyze a Job
              </Link>
              <Link
                href="/app/resume-builder"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1e2d42] transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Build Resume
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-[#f4c542]/40 bg-[#fff9e8] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f4c542]">
                <Star className="h-5 w-5 fill-[#1e2d42] text-[#1e2d42]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1e2d42]">Today&apos;s Sprint</p>
                <p className="text-xs text-slate-600">Analyze, tailor, apply, follow up.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {["Paste a job description", "Generate resume + cover letter", "Track the application", "Ask ARIA for interview prep"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#f4c542]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DashboardMetrics />

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1e2d42]">Career Command Center</h2>
            <p className="text-sm text-slate-500">Every page connects to the same profile, AI tools, tracker, and analytics flow.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#f4c542] hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e2d42] text-[#f4c542]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-[#1e2d42]">{tool.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.text}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
