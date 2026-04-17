"use client";

<<<<<<< HEAD
import { useState } from "react";
import { authFetch } from "../lib/auth-fetch";

=======
import { useMemo, useState } from "react";
import { authFetch } from "../lib/auth-fetch";

type StarterItem = {
  day: number;
  platform: "instagram" | "facebook" | "linkedin" | "twitter" | "youtube" | "pinterest" | "tiktok" | "threads" | "reddit";
  topic: string;
  caption: string;
};

const STARTER_PACK: StarterItem[] = [
  { day: 1, platform: "instagram", topic: "Resume glow-up", caption: "Day 1: Show your resume before/after and explain the 3 fixes that made it ATS-friendly." },
  { day: 2, platform: "linkedin", topic: "ATS myth busting", caption: "ATS does not hate you. It just needs clear structure, relevant keywords, and plain language." },
  { day: 3, platform: "twitter", topic: "One-line resume tip", caption: "Replace vague bullets with impact: action + metric + outcome." },
  { day: 4, platform: "tiktok", topic: "Job search confidence", caption: "A quick pep talk on why rejection is data, not a verdict." },
  { day: 5, platform: "facebook", topic: "Cover letter hook", caption: "Share 3 opening lines that feel human, specific, and recruiter-friendly." },
  { day: 6, platform: "linkedin", topic: "Interview prep", caption: "Share the 5 interview questions every candidate should rehearse before a final round." },
  { day: 7, platform: "twitter", topic: "Networking DM", caption: "A simple outreach template that feels warm instead of awkward." },
  { day: 8, platform: "instagram", topic: "Portfolio checklist", caption: "The 4 sections a portfolio needs to actually help you land interviews." },
  { day: 9, platform: "linkedin", topic: "Career change story", caption: "Reframe your pivot as a strength: transferable skills + proof of momentum." },
  { day: 10, platform: "tiktok", topic: "Common resume mistake", caption: "Stop listing duties only. Hiring teams want outcomes, not chores." },
  { day: 11, platform: "instagram", topic: "Before/after bullet", caption: "Turn a weak resume bullet into one that sounds sharp, specific, and measurable." },
  { day: 12, platform: "linkedin", topic: "Job application strategy", caption: "Apply smarter: one tailored resume, one tailored cover note, one follow-up." },
  { day: 13, platform: "twitter", topic: "Salary negotiation", caption: "You can be polite and still ask for what you're worth." },
  { day: 14, platform: "tiktok", topic: "Recruiter mindset", caption: "What recruiters are actually scanning for in the first 10 seconds." },
  { day: 15, platform: "facebook", topic: "Career win", caption: "Celebrate a small win: better keyword match, cleaner layout, stronger summary." },
  { day: 16, platform: "linkedin", topic: "LinkedIn headline", caption: "A strong headline blends role, value, and niche in one clear line." },
  { day: 17, platform: "twitter", topic: "Bullet formula", caption: "Use this formula: verb + scope + metric + result." },
  { day: 18, platform: "tiktok", topic: "First 60 seconds", caption: "What to say when interviewers ask: 'Tell me about yourself.'" },
  { day: 19, platform: "facebook", topic: "Resume summary", caption: "Your summary should sound like a confident elevator pitch, not a biography." },
  { day: 20, platform: "linkedin", topic: "Job search consistency", caption: "The job search rewards rhythm. Small daily actions beat random bursts." },
  { day: 21, platform: "threads", topic: "Follow-up email", caption: "Send the follow-up. Short, grateful, and specific always wins." },
  { day: 22, platform: "instagram", topic: "Skills section", caption: "Don't stuff your skills with fluff. Prioritize what the job description actually asks for." },
  { day: 23, platform: "linkedin", topic: "Action verbs", caption: "Swap weak wording for stronger action verbs to make experience feel decisive." },
  { day: 24, platform: "tiktok", topic: "Interview nerves", caption: "A grounding routine before interviews: breathe, review, and walk in prepared." },
  { day: 25, platform: "youtube", topic: "60-second resume walkthrough", caption: "Record a short walkthrough showing how ResumeVaultGod.com improves a real resume." },
  { day: 26, platform: "pinterest", topic: "Career cheat sheet", caption: "Create a pin with the top 5 resume mistakes and how to fix them fast." },
  { day: 27, platform: "linkedin", topic: "Personal branding", caption: "Your online presence should reinforce the story your resume tells." },
  { day: 28, platform: "twitter", topic: "Keyword alignment", caption: "The goal is not to trick ATS. The goal is to match the language of the role." },
  { day: 29, platform: "instagram", topic: "Interview answer", caption: "Record one strong answer today. Better answers come from rehearsal, not pressure." },
  { day: 30, platform: "reddit", topic: "30-day wrap-up", caption: "Close the month by reviewing what improved: resume, confidence, clarity, and consistency." },
];

>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
export default function CalendarGenerator({
  onGenerated,
}: {
  onGenerated: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [message, setMessage] = useState("");
=======
  const [savingStarterPack, setSavingStarterPack] = useState(false);
  const [message, setMessage] = useState("");
  const starterPackPreview = useMemo(() => STARTER_PACK.slice(0, 6), []);

  function addDays(base: Date, days: number) {
    const copy = new Date(base);
    copy.setDate(copy.getDate() + days);
    return copy;
  }
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

  async function handleGenerate() {
    setLoading(true);
    setMessage("");

    const res = await authFetch("/api/generate-calendar", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate calendar");
      setLoading(false);
      return;
    }

    setMessage(`Generated ${data.count} scheduled posts`);
    setLoading(false);
    await onGenerated();
  }

<<<<<<< HEAD
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">30-Day Content Calendar</h2>
      <p className="text-sm text-gray-600 mt-2">
        Generate 30 scheduled AI post ideas using your current settings.
      </p>

      <button
        onClick={handleGenerate}
        className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700"
      >
        {loading ? "Generating..." : "Generate 30-Day Calendar"}
      </button>

      {message ? <p className="mt-4 text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}
=======
  async function saveStarterPack() {
    setSavingStarterPack(true);
    setMessage("");

    try {
      const startDate = new Date();
      for (const item of STARTER_PACK) {
        const res = await authFetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: item.platform,
            topic: item.topic,
            caption: item.caption,
            status: "scheduled",
            scheduled_time: addDays(startDate, item.day).toISOString(),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed on day ${item.day}`);
        }
      }

      setMessage("Saved the 30-day starter pack to your queue");
      await onGenerated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save the starter pack");
    } finally {
      setSavingStarterPack(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
      <h2 className="text-xl font-bold text-white">30-Day Content Calendar</h2>
      <p className="mt-2 text-sm text-slate-400">
        Generate a fresh AI calendar or use the built-in starter pack that already gives you 30 days of content.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          {loading ? "Generating..." : "Generate 30-Day Calendar"}
        </button>
        <button
          onClick={saveStarterPack}
          className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 font-semibold text-violet-200 hover:bg-violet-500/15"
        >
          {savingStarterPack ? "Saving..." : "Save Starter Pack"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">Starter Pack</p>
            <p className="mt-1 text-sm text-slate-400">Pre-generated content for days 1 through 30.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {starterPackPreview.map((item) => (
            <article key={item.day} className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Day {item.day} · {item.platform}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">{item.topic}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.caption}</p>
            </article>
          ))}
        </div>

        <details className="mt-4 rounded-xl border border-white/5 bg-slate-900/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white">View all 30 days</summary>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {STARTER_PACK.map((item) => (
              <article key={item.day} className="rounded-xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">
                  Day {item.day} · {item.platform}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-white">{item.topic}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.caption}</p>
              </article>
            ))}
          </div>
        </details>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
