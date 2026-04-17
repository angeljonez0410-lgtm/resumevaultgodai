import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, Copy, CheckCircle2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function GeminiAssistant({ mode, onClose, onApply }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: getModeWelcome(mode),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getModeWelcome(m) {
    const welcomes = {
      character_description: "Hi! I'm here to help you create a detailed character description. Tell me about the character you want to create - their style, personality, appearance, or any specific vibe you're going for. I'll help you develop it into a vivid description perfect for AI avatar generation.",
      prompt_optimization: "Ready to optimize your character description into a powerful AI image generation prompt! Paste your character details and I'll transform them into a detailed, model-friendly prompt with specific visual keywords.",
      outfit_suggestion: "Let's find the perfect outfits for your character! Share your character description and I'll suggest 3 outfit variations that would look amazing for content creation and social media.",
    };
    return welcomes[m] || "How can I help you create your AI avatar?";
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await fetch('/api/geminiAssistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, mode }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Assistant failed');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl h-[600px] rounded-2xl bg-slate-950 border border-white/10 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">Gemini Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-violet-500/20 text-white border border-violet-500/30'
                        : 'bg-slate-900 text-slate-100 border border-white/5'
                    }`}
                  >
                    <ReactMarkdown
                      className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="text-sm leading-relaxed mb-1">{children}</p>,
                        ul: ({ children }) => <ul className="text-sm list-disc pl-4 mb-1">{children}</ul>,
                        ol: ({ children }) => <ol className="text-sm list-decimal pl-4 mb-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/5 p-4 space-y-3">
          {lastMessage?.role === 'assistant' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(lastMessage.content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="border-white/10 text-slate-300 hover:bg-white/5 gap-1.5 flex-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </Button>
              {onApply && (
                <Button
                  size="sm"
                  onClick={() => onApply(lastMessage.content)}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-1.5 flex-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Use This
                </Button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={loading}
              className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
