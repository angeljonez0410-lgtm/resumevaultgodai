"use client";

import { useEffect } from "react";

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

export default function SocialBotPostsPage() {
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

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 p-0 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <div className="max-w-4xl mx-auto py-24 px-8">
        <h1 className="text-7xl font-black mb-10 text-white drop-shadow-2xl uppercase tracking-tight animate-pop text-center">Social Posts</h1>
        <p className="text-3xl text-fuchsia-100 font-black mb-16 text-center animate-bounce-slow">View and schedule your social posts here.</p>
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop text-center">
          <p className="text-2xl text-fuchsia-200 font-black">Coming soon: unified post management, queue, and analytics!</p>
        </div>
      </div>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </main>
  );
}
