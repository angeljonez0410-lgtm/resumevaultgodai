import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Copy, CheckCheck, Trash2, Bot, User, Code, Image, Video, Hash, FileText, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const QUICK_PROMPTS = [
  { icon: Hash, label: 'Website Posts', prompt: 'Create 5 social posts promoting ResumeVaultGod.com for job seekers who want better resumes, cover letters, interview prep, and application tracking.' },
  { icon: Image, label: 'Image Prompt', prompt: 'Create a photorealistic AI image prompt for ResumeVaultGod.com showing a job seeker improving their resume and getting interview-ready.' },
  { icon: Video, label: 'Video Script', prompt: 'Write a 30-second vertical video script promoting ResumeVaultGod.com as an AI job hunt command center.' },
  { icon: FileText, label: 'Caption Pack', prompt: 'Write 10 viral captions with hashtags for ResumeVaultGod.com focused on ATS resumes, cover letters, and interview prep.' },
  { icon: Zap, label: 'Growth Plan', prompt: 'Create a 14-day social media growth plan for ResumeVaultGod.com with daily post ideas and categories.' },
  { icon: Code, label: 'Debug Help', prompt: 'Help me debug this app issue step by step:' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# Hey, I'm ARIA\n\nI'm your **ResumeVaultGod AI assistant** for launch content, social posts, scripts, image prompts, video prompts, and app debugging.\n\n**What should we create or fix today?**`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (customInput) => {
    const text = (customInput || input).trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('ariaAssistant', {
        messages: newMessages.filter(m => m.role !== 'system'),
        systemContext: 'Focus on ResumeVaultGod.com, an AI job hunt command center with ATS resume help, cover letters, follow-up emails, mock interviews, salary scripts, career roadmaps, portfolio tools, and application tracking. No credits or subscription language.',
      });

      const aiText = response?.data?.response || response?.response;
      if (!aiText) throw new Error(response?.data?.error || 'No assistant response returned');

      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      const message = error?.message || 'ARIA encountered an error. Try again.';
      toast.error(message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I could not complete that request yet.\n\n**What happened:** ${message}\n\nCheck that the Base44 function is published and that the Gemini API key is configured for the app.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success('Copied!');
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `# Hey, I'm ARIA 👋\n\nChat cleared! Ready for a fresh start. What are we building today, partner?`,
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">ARIA</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">ResumeVaultGod AI Assistant · Gemini Pro</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-slate-400 hover:text-white gap-2">
          <Trash2 className="w-4 h-4" /> Clear
        </Button>
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 border-b border-white/5">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => { setInput(qp.prompt); textareaRef.current?.focus(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-all border border-white/5"
          >
            <qp.icon className="w-3 h-3" />
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-slate-700'
                  : 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] group relative ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-slate-900 border border-white/5 text-slate-100 rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-800 prose-pre:border prose-pre:border-white/10"
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(msg.content, idx)}
                    className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300 flex items-center gap-1 text-xs"
                  >
                    {copiedIdx === idx ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedIdx === idx ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-900 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/50 transition-colors">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask ARIA for posts, scripts, image prompts, launch plans, or debugging help..."
              disabled={loading}
              rows={1}
              className="border-0 bg-transparent text-white placeholder:text-slate-600 resize-none focus-visible:ring-0 text-sm p-4 min-h-[52px] max-h-[200px]"
              style={{ overflow: 'auto' }}
            />
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">ARIA · ResumeVaultGod.com content and app assistant · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
