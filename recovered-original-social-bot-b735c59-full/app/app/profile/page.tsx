"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { User, Save, Plus, Trash2, Briefcase, GraduationCap } from "lucide-react";

interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  year: string;
  field: string;
}

export default function ProfilePage() {
  const [tab, setTab] = useState<"personal" | "experience" | "education">("personal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Personal
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);
  // Education
  const [education, setEducation] = useState<Education[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/profile");
        if (res.ok && !cancelled) {
          const p = await res.json();
          if (p.full_name) {
            setFullName(p.full_name || "");
            setEmailAddress(p.email_address || "");
            setPhone(p.phone || "");
            setLocation(p.location || "");
            setLinkedinUrl(p.linkedin_url || "");
            setPortfolioUrl(p.portfolio_url || "");
            setSummary(p.professional_summary || "");
            setSkills(p.skills || "");
            setCertifications(p.certifications || "");
            setExperiences(p.experiences || []);
            setEducation(p.education || []);
          }
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    setSaving(true);
    await authFetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email_address: emailAddress,
        phone,
        location,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        professional_summary: summary,
        skills,
        certifications,
        experiences,
        education,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addExperience = () => setExperiences([...experiences, { title: "", company: "", start_date: "", end_date: "", description: "" }]);
  const removeExperience = (i: number) => setExperiences(experiences.filter((_, idx) => idx !== i));
  const updateExperience = (i: number, field: keyof Experience, value: string) => {
    const copy = [...experiences];
    copy[i] = { ...copy[i], [field]: value };
    setExperiences(copy);
  };

  const addEducation = () => setEducation([...education, { degree: "", school: "", year: "", field: "" }]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, field: keyof Education, value: string) => {
    const copy = [...education];
    copy[i] = { ...copy[i], [field]: value };
    setEducation(copy);
  };

  const tabs = [
    { id: "personal" as const, label: "Personal Info", icon: User },
    { id: "experience" as const, label: "Experience", icon: Briefcase },
    { id: "education" as const, label: "Education", icon: GraduationCap },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-sm text-slate-500">Manage your professional information</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${tab === t.id ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="card p-6">
        {tab === "personal" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Full Name *</label><input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" /></div>
              <div><label className="label">Email</label><input className="input" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="john@example.com" /></div>
              <div><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0123" /></div>
              <div><label className="label">Location</label><input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New York, NY" /></div>
              <div><label className="label">LinkedIn URL</label><input className="input" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div><label className="label">Portfolio URL</label><input className="input" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yoursite.com" /></div>
            </div>
            <div><label className="label">Professional Summary</label><textarea className="input min-h-[100px] resize-y" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief professional summary..." /></div>
            <div><label className="label">Skills</label><textarea className="input min-h-[80px] resize-y" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="JavaScript, React, Project Management, ..." /></div>
            <div><label className="label">Certifications</label><textarea className="input min-h-[60px] resize-y" value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="PMP, AWS Certified, ..." /></div>
          </div>
        )}

        {tab === "experience" && (
          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                <button onClick={() => removeExperience(i)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div><label className="label">Job Title</label><input className="input" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} placeholder="Software Engineer" /></div>
                  <div><label className="label">Company</label><input className="input" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Acme Inc." /></div>
                  <div><label className="label">Start Date</label><input className="input" type="month" value={exp.start_date} onChange={(e) => updateExperience(i, "start_date", e.target.value)} /></div>
                  <div><label className="label">End Date</label><input className="input" type="month" value={exp.end_date} onChange={(e) => updateExperience(i, "end_date", e.target.value)} placeholder="Present" /></div>
                </div>
                <div><label className="label">Description</label><textarea className="input min-h-[80px] resize-y" value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="Key responsibilities and achievements..." /></div>
              </div>
            ))}
            <button onClick={addExperience} className="btn-secondary gap-2"><Plus className="w-4 h-4" /> Add Experience</button>
          </div>
        )}

        {tab === "education" && (
          <div className="space-y-6">
            {education.map((edu, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                <button onClick={() => removeEducation(i)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="label">Degree</label><input className="input" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Bachelor of Science" /></div>
                  <div><label className="label">Field of Study</label><input className="input" value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} placeholder="Computer Science" /></div>
                  <div><label className="label">School</label><input className="input" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} placeholder="MIT" /></div>
                  <div><label className="label">Year</label><input className="input" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="2020" /></div>
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="btn-secondary gap-2"><Plus className="w-4 h-4" /> Add Education</button>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button onClick={save} disabled={saving} className="btn-primary gap-2 disabled:opacity-50">
            {saving ? "Saving..." : saved ? "✅ Saved!" : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </div>
      </div>
    </div>
  );
}
