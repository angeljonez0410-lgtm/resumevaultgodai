"use client";

<<<<<<< HEAD
export default function SocialBotLogsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Social Bot Logs</h1>
        <p className="text-gray-700">View recent activity and logs here.</p>
      </div>
    </main>
=======
import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Loader2, RefreshCw, ScrollText } from "lucide-react";

type SocialLog = {
  id: string;
  action: string;
  result: string;
  created_at: string;
};

export default function SocialBotLogsPage() {
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await authFetch("/api/logs");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to load logs");
        setLogs([]);
      } else {
        setLogs(data.logs || []);
      }
    } catch {
      setMessage("Could not connect to logs API");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-5 py-14 sm:px-8 lg:px-16 lg:py-16">
      <section className="rounded-3xl border-2 border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-10 shadow-2xl">
        <p className="text-lg font-extrabold uppercase tracking-[0.18em] text-fuchsia-300 text-center">Activity Logs</p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white text-center drop-shadow-lg uppercase">Automation History</h1>
        <p className="mt-4 max-w-3xl mx-auto text-xl leading-8 text-fuchsia-100 font-bold text-center">
          Review content generation, account linking, scheduling, and publishing activity from Zuzu.
        </p>
      </section>

      <section className="mb-10 rounded-3xl border-2 border-fuchsia-400/20 bg-slate-900/80 p-8 shadow-xl">
        <h2 className="text-2xl font-extrabold text-fuchsia-200 mb-2 uppercase tracking-tight">Log Usage Tips</h2>
        <ul className="list-disc list-inside text-lg text-fuchsia-100 font-bold space-y-1 text-left mx-auto max-w-2xl">
          <li>Check here for all automation, publishing, and account activity.</li>
          <li>Use the refresh button to see the latest actions instantly.</li>
          <li>Each log entry includes a timestamp and result summary.</li>
          <li>Use logs to debug, audit, or review Zuzu's actions.</li>
        </ul>
      </section>

      <section className="rounded-3xl border-2 border-fuchsia-400/20 bg-slate-900/80 p-10 shadow-xl">
        <div className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <ScrollText className="h-8 w-8 text-fuchsia-300" />
            <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Recent Actions</h2>
          </div>
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-white/5 px-8 py-4 text-xl font-extrabold text-slate-200 shadow-lg hover:bg-white/10"
          >
            <RefreshCw className="h-6 w-6" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-fuchsia-300" />
            <p className="text-xl text-fuchsia-100 font-bold">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-white/10 bg-slate-950/70 p-10 text-center">
            <p className="text-xl font-extrabold text-white">No activity yet</p>
            <p className="mt-2 text-lg text-fuchsia-100 font-bold">Generate content, connect accounts, or publish posts to fill the log.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {logs.map((log) => (
              <article key={log.id} className="rounded-3xl border-2 border-fuchsia-400/20 bg-slate-950/80 p-7 shadow-xl flex flex-col h-full">
                <div className="flex items-center justify-between gap-6">
                  <p className="text-xl font-extrabold text-white uppercase tracking-tight">{log.action}</p>
                  <span className="text-base text-fuchsia-400 font-bold">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-4 text-lg leading-7 text-fuchsia-100 font-bold">{log.result}</p>
              </article>
            ))}
          </div>
        )}

        {message ? <p className="mt-6 text-xl text-fuchsia-100 font-bold">{message}</p> : null}
      </section>
    </div>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  );
}
