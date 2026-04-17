"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Send, Sparkles, Copy } from "lucide-react";

const emailTypes = [
  { value: "after-application", label: "After Submitting Application" },
  { value: "after-interview", label: "After Interview" },
  { value: "no-response", label: "No Response Follow-Up" },
  { value: "after-rejection", label: "After Rejection" },
  { value: "after-offer", label: "After Receiving Offer" },
];

export default function FollowUpEmailPage() {
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  const [type, setType] = useState("after-application");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/profile");
        if (res.ok && !cancelled) setProfile(await res.json());
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "follow-up-email",
          type,
          jobTitle,
          company,
          fullName: profile?.full_name || "",
          context,
        }),
      });
      const data = await res.json();
      setEmail(data.email);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Follow-Up Email</h1>
          <p className="text-sm text-slate-500">Craft a professional follow-up email</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="mb-4">
          <label className="label">Email Type</label>
          <div className="flex flex-wrap gap-2">
            {emailTypes.map((t) => (
              <button key={t.value} onClick={() => setType(t.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${type === t.value ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Job Title</label>
            <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Developer" />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" />
          </div>
        </div>
        <div className="mb-5">
          <label className="label">Additional Context</label>
          <textarea className="input min-h-[100px] resize-y" value={context} onChange={(e) => setContext(e.target.value)} placeholder="Any additional details (interviewer name, specific points discussed, etc.)..." />
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary gap-2 disabled:opacity-50">
          {loading ? "Generating..." : <><Sparkles className="w-5 h-5" /> Generate Email</>}
        </button>
      </div>

      {email && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Your Follow-Up Email</h3>
            <button onClick={() => { navigator.clipboard.writeText(email); alert("Copied!"); }} className="btn-secondary text-sm gap-1">
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="prose-resume text-slate-700 whitespace-pre-wrap text-sm">{email}</div>
        </div>
      )}
    </div>
  );
}
