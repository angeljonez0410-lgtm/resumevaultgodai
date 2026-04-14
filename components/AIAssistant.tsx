"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || greeted) return;

    setGreeted(true);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const user = localStorage.getItem("sb_user");
    const name = user ? JSON.parse(user).email?.split("@")[0] : "there";

    setMessages([
      {
        role: "assistant",
        content: `${greeting}, ${name}! I'm ARIA, your InfluencerAI studio assistant.\n\nI can help with character concepts, image prompts, video scripts, caption packs, social strategy, and campaign ideas.\n\nWhat are we creating today?`,
      },
    ]);
  }, [isOpen, greeted]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await authFetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't process that. Try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue - please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl transition hover:scale-105 hover:shadow-2xl"
        title="ARIA AI"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">ARIA AI</h3>
            <p className="text-xs text-slate-400">Studio co-pilot</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/70 transition hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-950 p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-sm bg-violet-600 text-white"
                  : "rounded-bl-sm border border-white/5 bg-slate-900 text-slate-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-white/5 bg-slate-900 px-4 py-2.5 text-sm text-slate-400">
              Thinking...
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-white/5 bg-slate-900 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) void sendMessage();
            }}
            placeholder="Ask ARIA for prompts, scripts, captions..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-3 py-2.5 text-white transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
