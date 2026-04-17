"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Map, Sparkles, Zap } from "lucide-react";

export default function CareerRoadmapPage() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "career-roadmap", currentRole, targetRole, industry, experienceYears, skills }),
      });
      const data = await res.json();
      setRoadmap(data.roadmap);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Career Roadmap</h1>
          <p className="text-sm text-slate-500">Get a personalized career development plan</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Premium</span>
      </div>

      <div className="card p-6 mb-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="label">Current Role</label><input className="input" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="Junior Developer" /></div>
          <div><label className="label">Target Role *</label><input className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Senior Engineer" /></div>
          <div><label className="label">Industry</label><input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology" /></div>
          <div><label className="label">Years of Experience</label><input className="input" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="3" /></div>
        </div>
        <div className="mb-5"><label className="label">Current Skills</label><textarea className="input min-h-[80px] resize-y" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="JavaScript, React, Node.js, ..." /></div>
        <button onClick={generate} disabled={!targetRole.trim() || loading} className="btn-primary gap-2 disabled:opacity-50">
          {loading ? "Generating..." : <><Sparkles className="w-5 h-5" /> Generate Roadmap</>}
        </button>
      </div>

      {roadmap && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Your Career Roadmap</h3>
          <div className="prose-resume text-slate-700 whitespace-pre-wrap text-sm">{roadmap}</div>
        </div>
      )}
    </div>
  );
}
