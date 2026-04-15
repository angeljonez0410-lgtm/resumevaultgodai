"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileArchive, FileText, Plus, Search, Star } from "lucide-react";

const templates = [
  { name: "ATS Master Resume", tag: "Core", updated: "Ready now", score: "98%", note: "Use this as your source of truth before tailoring." },
  { name: "Targeted Resume Draft", tag: "Role Fit", updated: "Generated per job", score: "Live", note: "Built from Job Analyzer keywords and your profile." },
  { name: "Executive Resume", tag: "Leadership", updated: "Premium", score: "95%", note: "Board-ready language, metrics, and strategic wins." },
];

export default function ResumeLibraryPage() {
  const [query, setQuery] = useState("");
  const resumes = useMemo(
    () => templates.filter((resume) => resume.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b98912]">Resume Vault</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1e2d42]">Resume Library</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Keep your master resume, tailored versions, and high-performing drafts organized before each application sprint.
            </p>
          </div>
          <Link
            href="/app/resume-builder"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e2d42] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2a3f5f]"
          >
            <Plus className="h-4 w-4 text-[#f4c542]" />
            New Resume
          </Link>
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resume versions..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/25"
          />
        </label>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {resumes.map((resume) => (
          <article key={resume.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1e2d42] text-[#f4c542]">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-[#fff5d6] px-2.5 py-1 text-xs font-bold text-[#9a6b00]">{resume.tag}</span>
            </div>
            <h2 className="mt-4 font-bold text-[#1e2d42]">{resume.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{resume.note}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                <FileArchive className="h-4 w-4" />
                {resume.updated}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#1e2d42]">
                <Star className="h-4 w-4 fill-[#f4c542] text-[#f4c542]" />
                {resume.score}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
