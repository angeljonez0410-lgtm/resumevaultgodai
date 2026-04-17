"use client";

<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
=======
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

type Message = {
  role: "user" | "assistant";
  content: string;
};

<<<<<<< HEAD
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
=======
export default function AIAssistant({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
<<<<<<< HEAD
    if (isOpen && !greeted) {
      setGreeted(true);
      const hour = new Date().getHours();
      let greeting = "Hey";
      if (hour < 12) greeting = "Good morning";
      else if (hour < 17) greeting = "Good afternoon";
      else greeting = "Good evening";

      const user = localStorage.getItem("sb_user");
      const name = user ? JSON.parse(user).email?.split("@")[0] : "there";

      setMessages([
        {
          role: "assistant",
          content: `${greeting}, ${name}! 🚀\n\nI'm your ResumeVault AI Assistant — powered by GPT. I'm here to help you with anything job-search related:\n\n• Resume writing tips & ATS optimization\n• Interview preparation & mock questions\n• Cover letter advice\n• Salary negotiation strategies\n• Career guidance & job search tips\n• Explain any feature on this platform\n\nWhat can I help you with today?`,
        },
      ]);
    }
=======
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
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  }, [isOpen, greeted]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
<<<<<<< HEAD
=======

>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
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
<<<<<<< HEAD
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't process that. Try again!" },
=======

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Your session expired or you are not signed in. Please log in again, then try one more time.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't process that. Try again." },
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
<<<<<<< HEAD
        { role: "assistant", content: "Connection issue — please try again in a moment." },
=======
        { role: "assistant", content: "Connection issue - please try again in a moment." },
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
<<<<<<< HEAD
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1e2d42] to-[#2a3f5f] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center group"
        title="AI Assistant"
      >
        <MessageCircle className="w-6 h-6 group-hover:hidden" />
        <Sparkles className="w-6 h-6 hidden group-hover:block" />
=======
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl transition hover:scale-105 hover:shadow-2xl"
        title="ARIA AI"
      >
        <MessageCircle className="h-6 w-6" />
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      </button>
    );
  }

  return (
<<<<<<< HEAD
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e2d42] to-[#2a3f5f] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f4c542] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#1e2d42]" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <p className="text-xs text-slate-300">Powered by GPT • Always ready</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#1e2d42] text-white rounded-br-sm"
                  : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm"
=======
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
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
<<<<<<< HEAD
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-400 shadow-sm flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              Thinking...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
=======
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
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
<<<<<<< HEAD
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about your job search..."
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2d42] focus:border-transparent"
=======
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) void sendMessage();
            }}
            placeholder="Ask ARIA for prompts, scripts, captions..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
<<<<<<< HEAD
            className="bg-[#1e2d42] text-white px-3 py-2.5 rounded-xl hover:bg-[#2a3f5f] disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
=======
            className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-3 py-2.5 text-white transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
          </button>
        </div>
      </div>
    </div>
  );
}
