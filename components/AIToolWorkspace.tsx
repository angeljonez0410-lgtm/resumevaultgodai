"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, Loader2, RotateCcw, Sparkles } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const storageKey = useMemo(() => `resumevault-ai-tool:${action}`, [action]);
  const missingRequired = fields.filter((field) => field.required && !values[field.name]?.trim());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { values?: Record<string, string>; result?: string };
      if (parsed.values) setValues((prev) => ({ ...prev, ...parsed.values }));
      if (parsed.result) setResult(parsed.result);
    } catch {
      /* ignore stale local drafts */
    }
  }, [storageKey]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify({ values, result }));
    }, 250);
    return () => window.clearTimeout(id);
  }, [result, storageKey, values]);

  async function runTool() {
    if (missingRequired.length > 0) {
      setError(`Add ${missingRequired.map((field) => field.label).join(", ")} before running this tool.`);
      return;
    }

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

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadResult() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ai-output"}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function resetTool() {
    setValues(Object.fromEntries(fields.map((field) => [field.name, field.options?.[0]?.value || ""])));
    setResult("");
    setError("");
    localStorage.removeItem(storageKey);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b98912]">{eyebrow}</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1e2d42]">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <button
            onClick={resetTool}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
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
          {missingRequired.length > 0 ? (
            <p className="mt-4 rounded-lg bg-[#fff8e1] px-3 py-2 text-xs font-semibold text-[#8a6400]">
              Required: {missingRequired.map((field) => field.label).join(", ")}
            </p>
          ) : null}
          <button
            onClick={runTool}
            disabled={loading || missingRequired.length > 0}
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
            <div className="flex items-center gap-2">
              <button
                onClick={downloadResult}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                onClick={copyResult}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="min-h-[520px] whitespace-pre-wrap p-5 text-sm leading-7 text-slate-700">
            {result || "Your result will appear here. Add the job details, resume notes, or profile context on the left to start."}
          </div>
        </section>
      </div>
    </div>
  );
}
