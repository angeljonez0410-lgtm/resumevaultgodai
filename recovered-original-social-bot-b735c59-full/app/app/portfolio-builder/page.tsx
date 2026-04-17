"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Globe, Sparkles, Copy, ExternalLink } from "lucide-react";

export default function PortfolioBuilderPage() {
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const generate = async () => {
    if (!fullName.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portfolio-builder", fullName, title, bio, skills, projects }),
      });
      const data = await res.json();
      setHtml(data.html);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portfolio Builder</h1>
          <p className="text-sm text-slate-500">Generate a professional HTML portfolio page</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="label">Full Name *</label><input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" /></div>
          <div><label className="label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Full Stack Developer" /></div>
        </div>
        <div className="mb-4"><label className="label">Bio</label><textarea className="input min-h-[80px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief professional bio..." /></div>
        <div className="mb-4"><label className="label">Skills</label><input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, Python, AWS..." /></div>
        <div className="mb-5">
          <label className="label">Projects</label>
          <textarea className="input min-h-[100px] resize-y" value={projects} onChange={(e) => setProjects(e.target.value)} placeholder="List 2-3 projects with descriptions..." />
        </div>
        <button onClick={generate} disabled={!fullName.trim() || loading} className="btn-primary gap-2 disabled:opacity-50">
          {loading ? "Building portfolio..." : <><Sparkles className="w-5 h-5" /> Generate Portfolio</>}
        </button>
      </div>

      {html && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Your Portfolio</h3>
            <div className="flex gap-2">
              <button onClick={downloadHtml} className="btn text-sm bg-blue-600 text-white hover:bg-blue-700 gap-1"><ExternalLink className="w-4 h-4" /> Download HTML</button>
              <button onClick={() => { navigator.clipboard.writeText(html); alert("Copied!"); }} className="btn-secondary text-sm gap-1"><Copy className="w-4 h-4" /> Copy Code</button>
              <button onClick={() => setPreviewOpen(!previewOpen)} className="btn-secondary text-sm">
                {previewOpen ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>

          {previewOpen && (
            <div className="card mb-6 overflow-hidden" style={{ height: "600px" }}>
              <iframe srcDoc={html} className="w-full h-full border-0" title="Portfolio Preview" sandbox="allow-scripts" />
            </div>
          )}

          <div className="card p-6">
            <h4 className="font-semibold text-slate-700 mb-3">HTML Source Code</h4>
            <pre className="bg-slate-900 text-green-400 rounded-xl p-4 overflow-auto text-xs max-h-[400px]">{html}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
