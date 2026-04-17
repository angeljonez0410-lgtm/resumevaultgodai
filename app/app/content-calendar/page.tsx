"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import contentData from "@/../Zuzu-30-Day-Content-Plan.md";

// Confetti burst effect
function fireConfetti() {
  if (typeof window !== "undefined" && window.confetti) {
    window.confetti({
      particleCount: 120,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#f0abfc", "#a78bfa", "#f472b6", "#facc15", "#38bdf8", "#fff"],
    });
  }
}

// Fallback: If you want to generate content dynamically, replace the import above with an API call or AI function.

const parseMarkdownTable = (markdown) => {
  // Simple parser for markdown tables (assumes standard format)
  const lines = markdown.split("\n").filter((l) => l.trim().startsWith("|"));
  const rows = lines.slice(2).map((line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim())
  );
  return rows;
};

export default function ContentCalendarPage() {
  const [content, setContent] = useState(() => parseMarkdownTable(contentData));
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setContent(parseMarkdownTable(contentData));
      setRefreshing(false);
      fireConfetti();
    }, 1000);
  };

  return (
    <div className="relative mx-auto max-w-5xl py-20 px-6 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
        <h1 className="text-7xl font-black text-fuchsia-200 flex items-center gap-6 drop-shadow-2xl uppercase tracking-tight animate-pop">
          <Sparkles className="h-16 w-16 animate-pulse" />
          30-Day AI Content Calendar
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-4 rounded-3xl bg-fuchsia-600/80 px-10 py-5 text-3xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition disabled:opacity-50 animate-bounce"
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="mb-16 rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-6 uppercase tracking-tight">AI Content Generation Tips</h2>
        <ul className="list-disc list-inside text-2xl text-fuchsia-100 font-extrabold space-y-3 text-left mx-auto max-w-2xl animate-bounce-slow">
          <li>Each prompt is tailored for resumevaultgod.com campaigns.</li>
          <li>Customize headlines and prompts for your brand voice.</li>
          <li>Use the refresh button to instantly generate a new plan.</li>
          <li>Mix and match ideas for maximum engagement.</li>
          <li>All content is optimized for social platforms.</li>
        </ul>
      </div>
      <div className="overflow-x-auto rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-10 shadow-2xl animate-pop">
        <table className="min-w-full text-left text-2xl text-fuchsia-100">
          <thead>
            <tr className="border-b-4 border-fuchsia-400/30">
              <th className="py-5 px-6 text-3xl font-black uppercase">Day</th>
              <th className="py-5 px-6 text-3xl font-black uppercase">Date</th>
              <th className="py-5 px-6 text-3xl font-black uppercase">Headline</th>
              <th className="py-5 px-6 text-3xl font-black uppercase">Prompt</th>
            </tr>
          </thead>
          <tbody>
            {content.map(([day, date, headline, prompt], i) => (
              <tr key={i} className="border-b-2 border-fuchsia-400/10 hover:bg-fuchsia-900/10 animate-bounce-slow">
                <td className="py-5 px-6 font-black text-fuchsia-200 text-2xl">{day}</td>
                <td className="py-5 px-6 text-2xl">{date}</td>
                <td className="py-5 px-6 font-extrabold text-fuchsia-100 text-2xl">{headline}</td>
                <td className="py-5 px-6 text-2xl">{prompt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
