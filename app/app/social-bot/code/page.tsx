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
import { Code2, Copy, FileDiff, Loader2, Sparkles } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

export default function SocialBotCodePage() {
  const [task, setTask] = useState("Add a new dashboard card to the social bot hub");
  const [language, setLanguage] = useState("TypeScript");
  const [outputMode, setOutputMode] = useState<"code" | "patch">("code");
  const [filePath, setFilePath] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [bridgeSecret, setBridgeSecret] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [copiedBridgeHeader, setCopiedBridgeHeader] = useState(false);

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

  const generateCode = async () => {
    setLoading(true);
    setMessage("");
    setApplyMessage("");

    try {
      const res = await authFetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, language, filePath, context, outputMode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to generate code");
        return;
      }

      setResult(data.response || "");
      setMessage("Code generated");
      fireConfetti();
    } catch {
      setMessage("Could not connect to code assistant");
    } finally {
      setLoading(false);
    }
  };

  const applyPatchLocally = async () => {
    setApplying(true);
    setApplyMessage("");

    try {
      const res = await fetch("/api/code-bridge/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bridgeSecret.trim() ? { "x-code-bridge-secret": bridgeSecret.trim() } : {}),
        },
        body: JSON.stringify({ patch: result }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApplyMessage(data.error || "Failed to apply patch");
        return;
      }

      setApplyMessage(data.message || "Patch applied locally");
    } catch {
      setApplyMessage("Could not reach the local code bridge");
    } finally {
      setApplying(false);
    }
  };

  const copyBridgeHeader = async () => {
    if (!bridgeSecret.trim()) {
      setApplyMessage("Add a bridge secret first, then copy the header helper.");
      return;
    }

    const header = `x-code-bridge-secret: ${bridgeSecret.trim()}`;
    await navigator.clipboard.writeText(header);
    setCopiedBridgeHeader(true);
    setTimeout(() => setCopiedBridgeHeader(false), 1800);
    setApplyMessage("Bridge header copied");
  };

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="relative mx-auto max-w-7xl space-y-16 px-6 py-20 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <section className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
        <p className="text-3xl font-black uppercase tracking-[0.18em] text-fuchsia-300 text-center animate-bounce">Codex Assistant</p>
        <h1 className="mt-8 text-7xl font-black tracking-tight text-white text-center drop-shadow-2xl uppercase animate-pop">Write Code from Inside Zuzu</h1>
        <p className="mt-8 max-w-3xl mx-auto text-3xl leading-10 text-fuchsia-100 font-extrabold text-center animate-bounce-slow">
          Describe the change you want, paste context, and Codex will draft code or a ready-to-apply patch.
        </p>
      </section>

      <section className="mb-16 rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-6 uppercase tracking-tight">Usage Tips</h2>
        <ul className="list-disc list-inside text-2xl text-fuchsia-100 font-extrabold space-y-3 text-left mx-auto max-w-2xl animate-bounce-slow">
          <li>Describe your feature or bug fix in detail for best results.</li>
          <li>Paste relevant code context to improve accuracy.</li>
          <li>Use Patch mode for ready-to-apply diffs.</li>
          <li>Apply patches locally in development with the bridge.</li>
          <li>Copy code or patch output with one click.</li>
        </ul>
      </section>

      <section className="grid gap-14 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
          <div className="space-y-8">
            <label className="space-y-3">
              <span className="text-2xl font-black text-slate-300">Task</span>
              <textarea
                value={task}
                onChange={(event) => setTask(event.target.value)}
                className="min-h-32 w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none placeholder:text-slate-500 animate-pop"
                placeholder="Describe the feature or bug fix..."
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-3">
                <span className="text-2xl font-black text-slate-300">Language</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none animate-pop"
                >
                  <option>TypeScript</option>
                  <option>JavaScript</option>
                  <option>TSX</option>
                  <option>JSX</option>
                  <option>SQL</option>
                  <option>Markdown</option>
                </select>
              </label>
              <label className="space-y-3">
                <span className="text-2xl font-black text-slate-300">Output</span>
                <select
                  value={outputMode}
                  onChange={(event) => setOutputMode(event.target.value as "code" | "patch")}
                  className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none animate-pop"
                >
                  <option value="code">Code</option>
                  <option value="patch">Patch</option>
                </select>
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-3">
                <span className="text-2xl font-black text-slate-300">Target file</span>
                <input
                  value={filePath}
                  onChange={(event) => setFilePath(event.target.value)}
                  className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none placeholder:text-slate-500 animate-pop"
                  placeholder="app/app/social-bot/code/page.tsx"
                />
              </label>
              <div className="flex items-end">
                <div className="rounded-2xl border-2 border-violet-500/30 bg-violet-500/10 px-6 py-4 text-xl leading-7 text-violet-100 animate-pop">
                  Patch mode returns a clean diff you can apply locally. In development, you can send it to the localhost-only bridge below.
                </div>
              </div>
            </div>

            {isDevelopment && outputMode === "patch" ? (
              <div className="rounded-2xl border-2 border-white/20 bg-slate-950/80 p-6 animate-pop">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <label className="flex-1 space-y-3">
                    <span className="text-2xl font-black text-slate-300">Local bridge secret</span>
                    <input
                      value={bridgeSecret}
                      onChange={(event) => setBridgeSecret(event.target.value)}
                      className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none placeholder:text-slate-500 animate-pop"
                      placeholder="Optional x-code-bridge-secret value"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={copyBridgeHeader}
                    className="inline-flex items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 px-6 py-4 text-2xl font-black text-slate-200 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 animate-pop"
                    disabled={!bridgeSecret.trim()}
                  >
                    {copiedBridgeHeader ? "Copied" : "Copy bridge header"}
                  </button>
                </div>
                <p className="mt-4 text-xl leading-7 text-slate-500 animate-pop">
                  Works only in development on localhost. If your bridge uses a secret, paste it here and use the copied header in any local request tool.
                </p>
              </div>
            ) : null}

            <label className="space-y-3">
              <span className="text-2xl font-black text-slate-300">Context</span>
              <textarea
                value={context}
                onChange={(event) => setContext(event.target.value)}
                className="min-h-44 w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none placeholder:text-slate-500 animate-pop"
                placeholder="Paste relevant file snippets or implementation notes..."
              />
            </label>

            <button
              onClick={generateCode}
              disabled={loading || !task.trim()}
              className="inline-flex items-center gap-4 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-12 py-6 text-3xl font-black text-white transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50 animate-pop"
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Sparkles className="h-8 w-8" />}
              {loading ? "Generating..." : outputMode === "patch" ? "Generate Patch" : "Generate Code"}
            </button>

            {outputMode === "patch" ? (
              <button
                onClick={applyPatchLocally}
                disabled={!result.trim() || applying}
                className="ml-6 inline-flex items-center gap-4 rounded-3xl border-4 border-emerald-500/40 bg-emerald-500/10 px-12 py-6 text-3xl font-black text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50 animate-pop"
              >
                {applying ? <Loader2 className="h-8 w-8 animate-spin" /> : <FileDiff className="h-8 w-8" />}
                {applying ? "Applying..." : "Apply Locally"}
              </button>
            ) : null}

            {message ? <p className="text-2xl text-slate-400 animate-pop">{message}</p> : null}
            {applyMessage ? <p className="text-2xl text-emerald-300 animate-pop">{applyMessage}</p> : null}
          </div>
        </div>

        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
          <div className="flex items-center justify-between gap-8 mb-10">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight animate-pop">Output</h2>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              disabled={!result}
              className="inline-flex items-center gap-4 rounded-3xl border-4 border-white/20 bg-white/10 px-12 py-6 text-3xl font-black text-slate-200 shadow-2xl hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 animate-pop"
            >
              <Copy className="h-8 w-8" />
              Copy {outputMode === "patch" ? "patch" : "code"}
            </button>
          </div>
          <div className="mt-10 rounded-3xl border-4 border-fuchsia-400/40 bg-slate-950 p-10 animate-pop">
            {result ? (
              <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap text-2xl leading-9 text-fuchsia-100 font-black animate-pop">
                {result}
              </pre>
            ) : (
              <div className="py-32 text-center text-3xl text-fuchsia-400 font-black animate-pop">
                {outputMode === "patch" ? (
                  <FileDiff className="mx-auto mb-8 h-16 w-16 text-fuchsia-600" />
                ) : (
                  <Code2 className="mx-auto mb-8 h-16 w-16 text-fuchsia-600" />
                )}
                Your Codex response will appear here.
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
