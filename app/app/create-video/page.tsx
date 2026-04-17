import { useEffect } from "react";
import { Video } from "lucide-react";
import GenerationStudio from "@/components/GenerationStudio";

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

export default function CreateVideoPage() {
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
      <div className="mb-20 flex flex-col items-center text-center">
        <div className="flex items-center gap-10 mb-8">
          <Video className="h-20 w-20 text-fuchsia-400 drop-shadow-2xl animate-pulse" />
          <span className="text-7xl font-black text-fuchsia-200 drop-shadow-2xl uppercase tracking-tight animate-pop">Create Video</span>
        </div>
        <div className="text-3xl font-extrabold text-fuchsia-100 mb-6 tracking-widest uppercase animate-bounce-slow">Production Studio</div>
        <div className="text-3xl font-black text-white mb-10 drop-shadow-2xl max-w-3xl mx-auto animate-pop">Generate short-form AI influencer videos, voiceovers, scene direction, captions, and posting goals with Zuzu's advanced AI tools.</div>
        <div className="flex flex-wrap gap-8 justify-center mt-6">
          <a href="/app/characters" className="rounded-3xl bg-fuchsia-600/80 px-10 py-6 text-2xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition animate-pop">Start from Character</a>
          <a href="/app/social-media" className="rounded-3xl bg-fuchsia-600/80 px-10 py-6 text-2xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition animate-pop">Generate Caption</a>
          <a href="/app/projects" className="rounded-3xl bg-fuchsia-600/80 px-10 py-6 text-2xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition animate-pop">View Projects</a>
        </div>
      </div>
      <div className="mb-16 rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-fuchsia-200 mb-6 uppercase tracking-tight">AI Video Generation Details</h2>
          <ul className="list-disc list-inside text-2xl text-fuchsia-100 font-extrabold space-y-3 text-left mx-auto max-w-2xl animate-bounce-slow">
            <li>Describe your scene, style, and goals for best results.</li>
            <li>Supports script, voiceover, and visual direction prompts.</li>
            <li>Integrates with Zuzu Characters for persona-driven content.</li>
            <li>Instant preview and download of generated videos.</li>
            <li>Optimized for social platforms and resumevaultgod.com campaigns.</li>
          </ul>
        </div>
        <GenerationStudio defaultMode="video" />
      </div>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
