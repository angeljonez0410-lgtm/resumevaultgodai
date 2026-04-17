"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Mic, Sparkles, Zap } from "lucide-react";

export default function InterviewCoachPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "interview-prep", jobTitle, company, jobDescription }),
      });
      const data = await res.json();
      setQuestions(data.questions);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interview Coach</h1>
          <p className="text-sm text-slate-500">AI-powered interview preparation</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Premium</span>
      </div>

      <div className="card p-6 mb-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="label">Job Title *</label><input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" /></div>
          <div><label className="label">Company</label><input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" /></div>
        </div>
        <div className="mb-5">
          <label className="label">Job Description</label>
          <textarea className="input min-h-[120px] resize-y" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description for more targeted questions..." />
        </div>
        <button onClick={generate} disabled={!jobTitle.trim() || loading} className="btn-primary gap-2 disabled:opacity-50">
          {loading ? "Generating..." : <><Sparkles className="w-5 h-5" /> Generate Interview Questions</>}
        </button>
      </div>

      {questions && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Interview Questions &amp; Answers</h3>
          <div className="prose-resume text-slate-700 whitespace-pre-wrap text-sm">{questions}</div>
        </div>
      )}
    </div>
  );
}
