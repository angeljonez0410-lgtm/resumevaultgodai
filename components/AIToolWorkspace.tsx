"use client";

import { useState } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

type Field = {
  name: string;
  label: string;
  placeholder: string;
  type?: "input" | "textarea" | "select";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
};

export default function AIToolWorkspace({
  title,
  eyebrow,
  description,
  action,
  resultKey,
  fields,
  cta = "Generate",
}: {
  title: string;
  eyebrow: string;
  description: string;
  action: string;
  resultKey: string;
  fields: Field[];
  cta?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.options?.[0]?.value || ""]))
  );
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runTool() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...values }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The AI tool could not finish. Try again.");
        return;
      }

      const next = data[resultKey] ?? data.analysis ?? data.email ?? data.letter ?? data.resume ?? data.jobs;
      setResult(typeof next === "string" ? next : JSON.stringify(next, null, 2));
    } catch {
      setError("Connection issue. Check your session and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b98912]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1e2d42]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Inputs</h2>
          <div className="mt-5 space-y-4">
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                {field.type === "select" ? (
                  <select
                    value={values[field.name] || ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/25"
                  >
                    {(field.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={values[field.name] || ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    placeholder={field.placeholder}
                    className="min-h-[140px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/25"
                  />
                ) : (
                  <input
                    value={values[field.name] || ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/25"
                  />
                )}
              </label>
            ))}
          </div>
          {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button
            onClick={runTool}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e2d42] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2a3f5f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#f4c542]" />}
            {loading ? "Working..." : cta}
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-[#1e2d42]">AI Output</h2>
              <p className="text-xs text-slate-500">Review, copy, and refine before sending.</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              disabled={!result}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <div className="min-h-[520px] whitespace-pre-wrap p-5 text-sm leading-7 text-slate-700">
            {result || "Your result will appear here. Add the job details, resume notes, or profile context on the left to start."}
          </div>
        </section>
      </div>
    </div>
  );
}
