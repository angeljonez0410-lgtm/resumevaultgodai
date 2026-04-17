"use client";

import { useState, useEffect } from "react";
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
import { Sparkles, UserPlus, RefreshCw, Image, Video } from "lucide-react";

const defaultPrompt = "Create a unique AI character for social content.";

export default function CharactersPage() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

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

  // Enhanced: Add a preset for resume promotion/sales
  const resumePromoPrompt = "Create an AI character designed to help promote and sell my resume, with a professional, persuasive, and trustworthy appearance. Include elements that appeal to recruiters and job seekers.";

  const handleGenerate = async (customPrompt?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt || prompt || defaultPrompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCharacters([{ url: data.url, prompt: customPrompt || prompt || defaultPrompt }, ...characters]);
      setPrompt("");
      fireConfetti();
    } catch (e) {
      setError(e.message || "Failed to generate character.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-4xl py-20 px-6 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
        <h1 className="text-7xl font-black text-fuchsia-300 flex items-center gap-6 drop-shadow-2xl uppercase tracking-tight animate-pop">
          <Sparkles className="h-14 w-14 animate-pulse" />
          AI Character Generator
        </h1>
        <button
          onClick={() => { setCharacters([]); fireConfetti(); }}
          className="flex items-center gap-4 rounded-3xl bg-fuchsia-600/90 px-10 py-5 text-3xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition animate-pop"
        >
          <RefreshCw className="h-9 w-9" />
          Clear
        </button>
      </div>
      <div className="mb-14 flex flex-col gap-6 md:flex-row">
        <input
          className="flex-1 rounded-3xl border-4 border-fuchsia-400/40 bg-slate-900/80 px-8 py-6 text-3xl font-black text-white focus:outline-none focus:ring-4 focus:ring-fuchsia-400 placeholder:text-fuchsia-400 animate-pop"
          placeholder="Describe your character (e.g. 'Professional AI recruiter, friendly, modern style')"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className="flex items-center gap-4 rounded-3xl bg-fuchsia-600/90 px-12 py-6 text-3xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition disabled:opacity-50 animate-pop"
        >
          <UserPlus className="h-9 w-9" />
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      <div className="mb-12 flex flex-col md:flex-row gap-6">
        <button
          onClick={() => handleGenerate(resumePromoPrompt)}
          disabled={loading}
          className="rounded-3xl bg-emerald-600/90 px-12 py-6 text-3xl font-black text-white shadow-2xl hover:bg-emerald-700 transition disabled:opacity-50 animate-pop"
        >
          <Sparkles className="h-9 w-9" /> Generate Resume Promo Model
        </button>
        <span className="text-2xl text-fuchsia-200 font-black flex items-center animate-bounce-slow">Create an AI model to help promote and sell your resume!</span>
      </div>
      {error && <div className="mb-8 text-3xl text-red-400 font-black animate-pop">{error}</div>}
      <div className="grid gap-12 md:grid-cols-2 mt-16">
        {characters.map((char, i) => (
          <div key={i} className="rounded-4xl bg-slate-900/90 p-10 shadow-2xl flex flex-col items-center border-4 border-fuchsia-400/40 animate-pop">
            <img src={char.url} alt="AI Character" className="rounded-3xl w-full object-cover mb-6 border-4 border-fuchsia-400/40" />
            <div className="text-fuchsia-200 text-2xl font-black mb-4 text-center animate-bounce-slow">{char.prompt}</div>
            <div className="flex gap-6 mt-4">
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-fuchsia-700/90 text-white text-2xl font-black hover:bg-fuchsia-800 transition animate-pop">
                <Image className="h-7 w-7" /> Download
              </button>
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-violet-700/90 text-white text-2xl font-black hover:bg-violet-800 transition animate-pop">
                <Video className="h-7 w-7" /> Animate
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Social API Connect Links */}
      <div className="mt-24">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-8 uppercase tracking-tight animate-pop">Connect Social APIs</h2>
        <div className="flex flex-wrap gap-6">
          <a href="/api/social-connect/meta/start?provider=facebook" className="rounded-2xl bg-blue-600 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-blue-700 transition animate-pop">Connect Facebook</a>
          <a href="/api/social-connect/meta/start?provider=instagram" className="rounded-2xl bg-pink-600 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-pink-700 transition animate-pop">Connect Instagram</a>
          <a href="/api/social-connect/linkedin/start" className="rounded-2xl bg-sky-700 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-sky-800 transition animate-pop">Connect LinkedIn</a>
          <a href="/api/social-connect/x/start" className="rounded-2xl bg-slate-800 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-slate-700 transition animate-pop">Connect X / Twitter</a>
          <a href="/api/social-connect/youtube/start" className="rounded-2xl bg-red-700 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-red-800 transition animate-pop">Connect YouTube</a>
          <a href="/api/social-connect/pinterest/start" className="rounded-2xl bg-rose-600 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-rose-700 transition animate-pop">Connect Pinterest</a>
          <a href="/api/social-connect/tiktok/start" className="rounded-2xl bg-black px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-slate-800 transition animate-pop">Connect TikTok</a>
          <a href="/api/social-connect/threads/start" className="rounded-2xl bg-black px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-slate-800 transition animate-pop">Connect Threads</a>
          <a href="/api/social-connect/reddit/start?subreddit=resumevaultgod" className="rounded-2xl bg-orange-600 px-10 py-5 text-2xl font-black text-white shadow-2xl hover:bg-orange-700 transition animate-pop">Connect Reddit</a>
        </div>
        <div className="mt-8 text-fuchsia-100 text-2xl font-black animate-bounce-slow">If you are logged in, these links will connect your social accounts automatically where possible.</div>
      </div>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
