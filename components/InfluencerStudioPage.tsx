import Link from "next/link";
import type { ElementType } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type StudioAction = {
  label: string;
  description: string;
  href: string;
};

export default function InfluencerStudioPage({
  title,
  eyebrow,
  description,
  icon: Icon = Sparkles,
  gradient = "from-violet-500 to-fuchsia-500",
  actions = [],
}: {
  title: string;
  eyebrow: string;
  description: string;
  icon?: ElementType;
  gradient?: string;
  actions?: StudioAction[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm sm:p-8">
        <div className={`absolute right-0 top-0 h-48 w-48 translate-x-14 -translate-y-14 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">{eyebrow}</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
          </div>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group block rounded-2xl border border-white/5 bg-slate-900/40 p-5 transition hover:border-violet-500/25 hover:bg-slate-900/70"
          >
            <p className="text-sm font-semibold text-white">{action.label}</p>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{action.description}</p>
            <ArrowRight className="mt-5 h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-300" />
          </Link>
        ))}
      </section>
    </div>
  );
}
