import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Send, Trash2, Loader2, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const GREETING_PROMPT = (name) =>
  `Greet the admin "${name}" warmly as Zurii — the Resumevault God-Mode AI. Introduce yourself in 2-3 sentences: you're here to help build the site, manage subscriptions, debug issues, and make the platform legendary. Be energetic, confident, and friendly. End with one smart suggestion about what you can help with right now.`;

const QUICK_ACTIONS = [
  'Audit codebase for refactors',
  'Help build a new feature',
  'Review Dashboard UX',
  'Show manual override users',
  'Design a new page',
  'Optimize slow queries',
  'Check for bugs',
  'What features next?',
];

export default function AdminAssistant() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const bottomRef = useRef(null);

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const isAdmin = me?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    const stored = localStorage.getItem('zurii_conv_id');
    if (stored) {
      setConversationId(stored);
      base44.agents.getConversation(stored)
        .then(conv => {
          const msgs = conv?.messages || [];
          setMessages(msgs);
          if (msgs.length > 0) setGreeted(true);
        })
        .catch(() => startNewConversation());
    } else {
      startNewConversation();
    }
  }, [isAdmin]);

  const startNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'admin_assistant',
      metadata: { name: 'Zurii Session' }
    });
    setConversationId(conv.id);
    localStorage.setItem('zurii_conv_id', conv.id);
    setMessages([]);
    setGreeted(false);
  };

  // Send greeting after conversation created
  useEffect(() => {
    if (!conversationId || greeted || !me) return;
    setGreeted(true);
    setSending(true);
    base44.agents.addMessage({ id: conversationId }, {
      role: 'user',
      content: GREETING_PROMPT(me.full_name || me.email || 'Admin'),
    }).catch(() => setSending(false));
  }, [conversationId, greeted, me]);

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending || !conversationId) return;
    setSending(true);
    setInput('');
    await base44.agents.addMessage({ id: conversationId }, { role: 'user', content: msg });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = async () => {
    localStorage.removeItem('zurii_conv_id');
    await startNewConversation();
  };

  if (loadingMe) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <ShieldCheck className="w-16 h-16 text-slate-300" />
      <p className="text-slate-500 text-lg font-medium">Admin access required</p>
    </div>
  );

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  // Hide the greeting prompt from the user side
  const displayMessages = visibleMessages.filter((m, i) => !(m.role === 'user' && i === 0 && m.content.startsWith('Greet the admin')));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1e2d42, #2a3f5f)' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#f4c542' }} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              Zurii
              <span className="text-xs font-normal px-2 py-0.5 rounded-full text-amber-700 border border-amber-200" style={{ background: 'rgba(244,197,66,0.12)' }}>
                God-Mode AI
              </span>
            </h1>
            <p className="text-xs text-slate-500">Your co-pilot for building Resumevault · Site health · User management</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="New session" className="text-slate-400 hover:text-slate-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 py-4">
        {sending && displayMessages.length === 0 && (
          <div className="flex gap-3 justify-start">
            <ZuriiAvatar />
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">Preparing...</span>
            </div>
          </div>
        )}

        {displayMessages.map((msg, i) => (
          <MessageRow key={i} msg={msg} />
        ))}

        {sending && displayMessages.length > 0 && (
          <div className="flex gap-3 justify-start">
            <ZuriiAvatar />
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}

        {displayMessages.length === 1 && !sending && (
          <div className="flex flex-wrap gap-2 pl-10 pt-4">
            {QUICK_ACTIONS.map(q => (
              <button key={q} onClick={() => send(q)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Zurii anything about your site, users, or what to build next…"
          className="flex-1"
          disabled={sending}
        />
        <Button
          onClick={() => send()}
          disabled={sending || !input.trim()}
          className="text-white"
          style={{ background: sending ? undefined : 'linear-gradient(135deg, #1e2d42, #2a3f5f)' }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ZuriiAvatar() {
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow"
      style={{ background: 'linear-gradient(135deg, #1e2d42, #2a3f5f)' }}>
      <Sparkles className="w-3.5 h-3.5" style={{ color: '#f4c542' }} />
    </div>
  );
}

function MessageRow({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <ZuriiAvatar />}
      <div className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'text-white'
          : 'bg-white border border-slate-200 text-slate-800'
      }`} style={isUser ? { background: 'linear-gradient(135deg, #1e2d42, #2a3f5f)' } : {}}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <ReactMarkdown className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic">
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}