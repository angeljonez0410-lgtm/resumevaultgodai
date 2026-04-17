"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { FileText, Sparkles, Zap, Copy } from "lucide-react";

export default function InterviewMasteryPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!company.trim() || !jobTitle.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "interview-mastery", company, jobTitle, jobDescription }),
      });
      const data = await res.json();
      setQuestions(data.questions);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interview Mastery</h1>
          <p className="text-sm text-slate-500">20 company-specific questions with model answers</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Premium</span>
      </div>

      <div className="card p-6 mb-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="label">Company *</label><input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" /></div>
          <div><label className="label">Job Title *</label><input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" /></div>
        </div>
        <div className="mb-5">
          <label className="label">Job Description (optional)</label>
          <textarea className="input min-h-[100px] resize-y" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste JD for more targeted questions..." />
        </div>
        <button onClick={generate} disabled={!company.trim() || !jobTitle.trim() || loading} className="btn-primary gap-2 disabled:opacity-50">
          {loading ? "Generating 20 questions..." : <><Sparkles className="w-5 h-5" /> Generate 20 Questions</>}
        </button>
      </div>

      {questions && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">{company} Interview Questions</h3>
            <button onClick={() => { navigator.clipboard.writeText(questions); alert("Copied!"); }} className="btn-secondary text-sm gap-1"><Copy className="w-4 h-4" /> Copy All</button>
          </div>
          <div className="prose-resume text-slate-700 whitespace-pre-wrap text-sm">{questions}</div>
        </div>
      )}
    </div>
  );
}
