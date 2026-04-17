"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import AIAssistant from "@/components/AIAssistant";

export default function AIAssistantPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="text-sm text-slate-600 mt-2">
          Use the chat widget (bottom-right). This page exists for legacy links like <code>/AIAssistant</code>.
        </p>
        <p className="text-sm text-slate-600 mt-2">
          For Codex code generation, go to{" "}
          <Link href="/app/social-bot/code" className="font-semibold text-slate-900 underline">
            Social Bot → Code Assistant
          </Link>
          .
        </p>
      </div>
      <AIAssistant defaultOpen />
    </AppShell>
  );
}
