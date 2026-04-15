"use client";

import { useState, useRef, useEffect } from "react";
import { authFetch } from "../lib/auth-fetch";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Greeting when chat opens
  useEffect(() => {
    if (isOpen && !greeted) {
      setGreeted(true);
      const hour = new Date().getHours();
      let timeGreeting = "Hey";
      if (hour < 12) timeGreeting = "Good morning";
      else if (hour < 17) timeGreeting = "Good afternoon";
      else timeGreeting = "Good evening";

      const user = localStorage.getItem("sb_user");
      const name = user ? JSON.parse(user).email?.split("@")[0] : "bestie";

      setMessages([
        {
          role: "assistant",
          content: `${timeGreeting}, ${name}! ✨\n\nIt's your girl Aria — ready to run your socials today. What are we working on?\n\nI can:\n• Create & schedule posts for any platform\n• Plan your content calendar\n• Change how many times you post per day\n• Write captions that hit different\n• Check your stats\n\nJust tell me what you need, love! 💜`,
        },
      ]);
    }
  }, [isOpen, greeted]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const user = localStorage.getItem("sb_user");
      const userName = user ? JSON.parse(user).email?.split("@")[0] : undefined;

      const res = await authFetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          userName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Hmm, something went wrong. Try again? 💜" },
        ]);
      } else {
        let reply = data.reply;
        // Show action confirmations
        if (data.actions?.length) {
          const actionSummary = data.actions
            .map((a: { success: boolean; action: string; error?: string }) =>
              a.success ? `✅ ${a.action} completed` : `❌ ${a.action} failed: ${a.error}`
            )
            .join("\n");
          reply += `\n\n${actionSummary}`;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Couldn't connect right now. Try again in a sec! 💜" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center text-2xl z-50 animate-pulse"
        title="Chat with Aria"
      >
        ✦
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[36rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">✦</div>
          <div>
            <h3 className="font-bold text-sm">Aria</h3>
            <p className="text-xs text-indigo-200">Your Social Media Bestie</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-indigo-200 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-500">
              ✨ Aria is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Talk to Aria..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
