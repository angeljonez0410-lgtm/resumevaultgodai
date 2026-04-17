"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { DEFAULT_SOCIAL_CONTENT, type SocialContentIdea } from "@/lib/social-content";
import { Sparkles, Loader2, Save, RefreshCw, Wand2 } from "lucide-react";

// Confetti burst effect
function fireConfetti() {
  if (typeof window !== "undefined" && window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#f0abfc", "#a78bfa", "#f472b6", "#facc15", "#38bdf8", "#fff"],
    });
  }
}

export default function SocialBotContentPage() {
  const [ideas, setIdeas] = useState<SocialContentIdea[]>(DEFAULT_SOCIAL_CONTENT);
  const [loading, setLoading] = useState(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Confetti on load
    if (typeof window !== "undefined" && !window.confetti) {
      import("canvas-confetti").then((mod) => {
        window.confetti = mod.default;
        fireConfetti();
      });
    } else {
      fireConfetti();
    }
  }, []);

  const readyCount = useMemo(() => ideas.length, [ideas]);

  const generateIdeas = useCallback(async (persist = false) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await authFetch("/api/social-content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persist }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to generate content ideas");
        return;
      }

      setIdeas(data.ideas || []);
      setMessage(persist ? "Generated and queued 20 ideas" : "Generated 20 fresh content ideas");
      fireConfetti();
    } catch {
      setMessage("Could not connect to the content generator");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveIdea = useCallback(async (idea: SocialContentIdea, index: number) => {
    setSavingIndex(index);
    setMessage("");

    try {
      const res = await authFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: idea.platform,
          topic: idea.topic,
          caption: idea.caption,
          status: "draft",
          visual_prompt: idea.description,
          visual_style: "ResumeVaultGod Content Engine",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to save content idea");
        return;
      }

      setMessage(`Saved "${idea.topic}" as a draft`);
      fireConfetti();
    } catch {
      setMessage("Could not save the content idea");
    } finally {
      setSavingIndex(null);
    }
  }, []);

  return (
    <div className="relative mx-auto max-w-7xl space-y-16 px-6 py-20 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <section className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
        <p className="text-3xl font-black uppercase tracking-[0.18em] text-fuchsia-300 text-center animate-bounce">ResumeVaultGod.com Content Vault</p>
        <h1 className="mt-8 text-7xl font-black tracking-tight text-white text-center drop-shadow-2xl uppercase animate-pop">20 Ready-to-Post Ideas</h1>
        <p className="mt-8 max-w-3xl mx-auto text-3xl leading-10 text-fuchsia-100 font-extrabold text-center animate-bounce-slow">
          Use the built-in starter set or generate a fresh 20-piece content batch for Instagram, LinkedIn, Twitter/X, TikTok, Threads, YouTube, Facebook, Pinterest, and Reddit.
        </p>
      </section>

      <section className="mb-16 rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-6 uppercase tracking-tight">AI Content Generation Tips</h2>
        <ul className="list-disc list-inside text-2xl text-fuchsia-100 font-extrabold space-y-3 text-left mx-auto max-w-2xl animate-bounce-slow">
          <li>Each idea is optimized for resumevaultgod.com campaigns.</li>
          <li>Mix, match, and edit ideas for your brand voice.</li>
          <li>Use "Generate & Queue" to instantly fill your publishing pipeline.</li>
          <li>Save any idea as a draft for later scheduling.</li>
          <li>All content is ready for social platforms.</li>
        </ul>
      </section>

      <section className="grid gap-10 md:grid-cols-3">
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/60 p-10 shadow-2xl animate-pop">
          <p className="text-2xl uppercase tracking-[0.14em] text-fuchsia-300 font-black">Website</p>
          <p className="mt-6 text-4xl font-black text-white">resumevaultgod.com</p>
          <p className="mt-4 text-2xl text-fuchsia-100 font-extrabold">Every idea points back to your public brand and offer.</p>
        </div>
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/60 p-10 shadow-2xl animate-pop">
          <p className="text-2xl uppercase tracking-[0.14em] text-fuchsia-300 font-black">Ideas Ready</p>
          <p className="mt-6 text-4xl font-black text-white">{readyCount}</p>
          <p className="mt-4 text-2xl text-fuchsia-100 font-extrabold">Pre-generated cards you can save as drafts.</p>
        </div>
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/60 p-10 shadow-2xl animate-pop">
          <p className="text-2xl uppercase tracking-[0.14em] text-fuchsia-300 font-black">Publishing Flow</p>
          <p className="mt-6 text-4xl font-black text-white">Draft &rarr; Schedule &rarr; Post</p>
          <p className="mt-4 text-2xl text-fuchsia-100 font-extrabold">Use the queue when you're ready to publish.</p>
        </div>
      </section>

      <section className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
        <div className="flex flex-wrap items-center justify-between gap-10 mb-12">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight animate-pop">Content Actions</h2>
            <p className="text-2xl text-fuchsia-100 font-extrabold animate-bounce-slow">Generate more ideas or save the current set into drafts.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <button
              onClick={() => generateIdeas(false)}
              disabled={loading}
              className="inline-flex items-center gap-4 rounded-3xl bg-violet-600 px-12 py-6 text-2xl font-black text-white shadow-2xl hover:bg-violet-700 disabled:opacity-50 animate-pop"
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Wand2 className="h-8 w-8" />}
              Generate 20 Ideas
            </button>
            <button
              onClick={() => generateIdeas(true)}
              disabled={loading}
              className="inline-flex items-center gap-4 rounded-3xl border-4 border-emerald-500/40 bg-emerald-500/10 px-12 py-6 text-2xl font-black text-emerald-100 shadow-2xl hover:bg-emerald-500/15 disabled:opacity-50 animate-pop"
            >
              <Sparkles className="h-8 w-8" />
              Generate & Queue
            </button>
            <button
              onClick={() => { setIdeas(DEFAULT_SOCIAL_CONTENT); fireConfetti(); }}
              className="inline-flex items-center gap-4 rounded-3xl border-4 border-white/20 bg-white/10 px-12 py-6 text-2xl font-black text-slate-200 shadow-2xl hover:bg-white/20 animate-pop"
            >
              <RefreshCw className="h-8 w-8" />
              Reset Starter Set
            </button>
          </div>
        </div>

        {message ? <p className="mt-10 text-2xl text-fuchsia-100 font-extrabold animate-pop">{message}</p> : null}

        <div className="mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea, index) => (
            <article key={`${idea.platform}-${index}`} className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-950/80 p-10 shadow-2xl flex flex-col h-full animate-pop">
              <div className="flex items-center justify-between gap-6">
                <span className="rounded-full bg-violet-500/15 px-6 py-3 text-2xl font-black text-violet-200 uppercase tracking-tight animate-bounce">{idea.platform}</span>
                <span className="text-2xl text-fuchsia-400 font-black">#{index + 1}</span>
              </div>
              <h3 className="mt-8 text-3xl font-black text-white uppercase tracking-tight animate-pop">{idea.topic}</h3>
              <p className="mt-6 text-2xl leading-9 text-fuchsia-100 font-extrabold animate-bounce-slow">{idea.description}</p>
              <div className="mt-8 rounded-3xl border-4 border-fuchsia-400/40 bg-white/10 p-8 animate-pop">
                <p className="text-2xl uppercase tracking-[0.12em] text-fuchsia-300 font-black">Caption</p>
                <p className="mt-4 text-2xl leading-9 text-fuchsia-100 font-extrabold animate-bounce-slow">{idea.caption}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <span className="rounded-full border-4 border-fuchsia-400/40 px-6 py-3 text-2xl text-fuchsia-100 font-black animate-pop">Hook: {idea.hook}</span>
                <span className="rounded-full border-4 border-fuchsia-400/40 px-6 py-3 text-2xl text-fuchsia-100 font-black animate-pop">CTA: {idea.cta}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {idea.hashtags.map((tag) => (
                  <span key={tag} className="text-2xl text-fuchsia-400 font-black animate-bounce-slow">{tag}</span>
                ))}
              </div>
              <button
                onClick={() => void saveIdea(idea, index)}
                disabled={savingIndex === index}
                className="mt-10 inline-flex w-full items-center justify-center gap-4 rounded-3xl bg-fuchsia-600 px-12 py-6 text-2xl font-black text-white shadow-2xl hover:bg-fuchsia-700 disabled:opacity-50 animate-pop"
              >
                {savingIndex === index ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="h-8 w-8" />}
                Save Draft
              </button>
            </article>
          ))}
        </div>
      </section>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
