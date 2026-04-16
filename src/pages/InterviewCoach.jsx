import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/ui-custom/PageHeader';
import PremiumGate from '../components/premium/PremiumGate';
import VoiceInput from '../components/voice/VoiceInput';
import { useSpeech } from '../components/voice/VoiceOutput';
import { useSimpleMode } from '../components/settings/SimpleMode';

export default function InterviewCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);
  const { speak, stop } = useSpeech();
  const { isSimpleMode } = useSimpleMode();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setInput(prev => prev + ' ' + transcript);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }

    // Initial greeting
    const greeting = "Hello! I'm your AI Interview Coach. Tell me about the role you're interviewing for, and I'll help you practice.";
    setMessages([{ role: 'assistant', content: greeting }]);
    if (isSimpleMode) {
      speak(greeting);
    }

    return () => {
      if (recognition) recognition.stop();
      stop();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Voice input not supported');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      toast.success('Listening...');
    }
    setIsListening(!isListening);
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
        .join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an experienced technical interviewer conducting a realistic mock interview. Your goal is to help the candidate improve.

Conversation so far:
${conversationHistory}

Instructions:
- Ask one focused interview question at a time
- If the candidate just introduced a role, ask a relevant behavioral or technical question
- If they answered a question, provide brief constructive feedback (1-2 sentences) then ask the next question
- Vary question types: behavioral (STAR), technical, situational
- Be encouraging but professional
- Keep responses concise and conversational
- Never break character as an interviewer

Respond as the interviewer:`,
        model: 'gemini_3_flash'
      });

      const assistantMessage = { role: 'assistant', content: result };
      setMessages(prev => [...prev, assistantMessage]);

      if (isSpeaking) {
        speak(result);
      }
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const btnClass = isSimpleMode ? "h-16 text-xl px-8" : "";
  const textClass = isSimpleMode ? "text-xl" : "text-base";
  const inputClass = isSimpleMode ? "min-h-[120px] text-xl" : "min-h-[80px]";

  return (
    <PremiumGate>
      <div>
        <PageHeader
          title="AI Interview Coach"
          subtitle="Practice interviews with voice-enabled AI feedback"
          icon={Mic}
        />

        <Card className={`flex flex-col ${isSimpleMode ? 'p-8' : 'p-6'}`} style={{ height: '70vh' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-800'
                    } ${isSimpleMode ? 'text-xl p-6' : ''}`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size={isSimpleMode ? "lg" : "default"}
                onClick={toggleListening}
                className={btnClass}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isSimpleMode && <span className="ml-2">{isListening ? 'Stop' : 'Speak'}</span>}
              </Button>
              <Button
                variant="outline"
                size={isSimpleMode ? "lg" : "default"}
                onClick={toggleSpeaking}
                className={btnClass}
              >
                {isSpeaking ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5" />}
                {isSimpleMode && <span className="ml-2">Voice {isSpeaking ? 'On' : 'Off'}</span>}
              </Button>
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isSimpleMode ? "Type or speak your answer..." : "Type your response or use voice input..."}
                className={inputClass}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`${btnClass} ${isSimpleMode ? 'w-24' : ''}`}
                size={isSimpleMode ? "lg" : "default"}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        <div className={`mt-4 ${isSimpleMode ? 'text-xl' : 'text-sm'} text-slate-500 text-center`}>
          💡 Tip: Enable voice mode and practice speaking your answers out loud for the most realistic experience
        </div>
      </div>
    </PremiumGate>
  );
}