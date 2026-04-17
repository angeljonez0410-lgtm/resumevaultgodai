"use client";

import { useEffect } from "react";
import { Share2, Bot, Sparkles, Calendar, Users, Video } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { href: "/app/social-bot", label: "Social Hub", icon: Bot, desc: "All accounts, content, and logs in one place." },
  { href: "/app/content-calendar", label: "Content Calendar", icon: Calendar, desc: "View and refresh your 30-day AI content plan." },
  { href: "/app/characters", label: "Characters", icon: Users, desc: "Generate and manage AI personas for your brand." },
  { href: "/app/create-video", label: "Create Video", icon: Video, desc: "Generate AI influencer videos and voiceovers." },
];

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

export default function SocialMediaPage() {
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
    <div className="relative mx-auto max-w-5xl py-20 px-6 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <h1 className="text-7xl font-black text-fuchsia-200 drop-shadow-2xl mb-14 text-center uppercase tracking-tight flex items-center justify-center gap-6 animate-pop">
        <Share2 className="h-16 w-16 animate-pulse" />
        Social Media
      </h1>
      <div className="text-3xl text-fuchsia-100 font-extrabold text-center mb-16 max-w-3xl mx-auto animate-bounce-slow">
        Plan captions, hooks, posting angles, and platform-specific content for your AI influencer campaigns.
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        {socialLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-12 shadow-2xl flex flex-col items-center hover:scale-105 hover:shadow-fuchsia-400/40 transition-transform animate-pop"
          >
            <Icon className="h-16 w-16 text-fuchsia-300 drop-shadow-2xl mb-6 animate-bounce" />
            <div className="text-4xl font-black text-white drop-shadow-2xl mb-3 text-center uppercase tracking-wider animate-pop">{label}</div>
            <div className="text-2xl text-fuchsia-100 font-extrabold text-center animate-bounce-slow">{desc}</div>
          </Link>
        ))}
      </div>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
