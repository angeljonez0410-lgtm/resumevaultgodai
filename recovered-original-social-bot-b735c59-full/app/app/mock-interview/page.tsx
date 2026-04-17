"use client";

import { useState, useRef } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Mic, Sparkles, Send, Zap, ChevronRight } from "lucide-react";

const sampleQuestions = [
  "Tell me about yourself.",
  "What is your greatest strength?",
  "Why do you want to work here?",
  "Describe a challenging project you worked on.",
  "Where do you see yourself in 5 years?",
  "Tell me about a time you failed.",
  "How do you handle conflict?",
  "What makes you unique?",
];

export default function MockInterviewPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scoresRef = useRef<string[]>([]);

  const start = () => {
    if (!jobTitle.trim()) return;
    setStarted(true);
    setCurrentQ(0);
    scoresRef.current = [];
    setFeedback("");
    setAnswer("");
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mock-interview",
          question: sampleQuestions[currentQ],
          answer,
          jobTitle,
        }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      scoresRef.current = [...scoresRef.current, data.feedback];
    } catch { /* ignore */ }
    setLoading(false);
  };

  const nextQuestion = () => {
    if (currentQ < sampleQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setAnswer("");
      setFeedback("");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mock Interview</h1>
          <p className="text-sm text-slate-500">Practice with AI feedback and scoring</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Premium</span>
      </div>

      {!started ? (
        <div className="card p-6 mt-6">
          <p className="text-sm text-slate-500 mb-4">Enter your target role and practice answering 8 common interview questions. AI will score your answers and provide feedback.</p>
          <div className="mb-5"><label className="label">Job Title *</label><input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" /></div>
          <button onClick={start} disabled={!jobTitle.trim()} className="btn-primary gap-2 disabled:opacity-50"><Sparkles className="w-5 h-5" /> Start Mock Interview</button>
        </div>
      ) : (
        <div className="mt-6">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {sampleQuestions.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition ${i < currentQ ? "bg-green-500" : i === currentQ ? "bg-amber-500" : "bg-slate-200"}`} />
            ))}
          </div>

          <div className="card p-6 mb-6">
            <p className="text-xs text-slate-500 mb-1">Question {currentQ + 1} of {sampleQuestions.length}</p>
            <h2 className="text-lg font-semibold text-slate-800 mb-5">{sampleQuestions[currentQ]}</h2>
            <textarea className="input min-h-[150px] resize-y mb-4" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here... be specific and use examples." />
            {!feedback ? (
              <button onClick={submitAnswer} disabled={!answer.trim() || loading} className="btn-primary gap-2 disabled:opacity-50">
                {loading ? "Evaluating..." : <><Send className="w-4 h-4" /> Submit Answer</>}
              </button>
            ) : (
              <div>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-4">
                  <h3 className="font-semibold text-slate-700 mb-3">AI Feedback</h3>
                  <div className="prose-resume text-slate-700 whitespace-pre-wrap text-sm">{feedback}</div>
                </div>
                {currentQ < sampleQuestions.length - 1 ? (
                  <button onClick={nextQuestion} className="btn-primary gap-2">Next Question <ChevronRight className="w-4 h-4" /></button>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-800 font-semibold">🎉 Interview Complete!</p>
                    <p className="text-sm text-green-700 mt-1">You answered all {sampleQuestions.length} questions. Great practice!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
