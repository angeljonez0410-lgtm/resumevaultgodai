"use client";

import { useState, useRef, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
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
        { role: "assistant", content: data.reply || "Sorry, I couldn't process that. Try again!" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue — please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1e2d42] to-[#2a3f5f] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center group"
        title="AI Assistant"
      >
        <MessageCircle className="w-6 h-6 group-hover:hidden" />
        <Sparkles className="w-6 h-6 hidden group-hover:block" />
      </button>
    );
  }

  return (
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
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
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
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about your job search..."
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2d42] focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#1e2d42] text-white px-3 py-2.5 rounded-xl hover:bg-[#2a3f5f] disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
