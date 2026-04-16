import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mic, Sparkles, Zap, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import PremiumGate from '../components/premium/PremiumGate';

function QuestionCard({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const getFeedback = async () => {
    if (!userAnswer.trim()) return;
    setLoadingFeedback(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert interview coach. Evaluate this interview answer.

Question: ${question.question}
Candidate's Answer: ${userAnswer}

Provide:
## Strengths
What they did well.

## Areas to Improve
Specific, actionable improvements.

## Model Answer
A strong sample answer using STAR format if applicable. Keep it concise.

## Score
Give a score out of 10 with one sentence explanation.`,
    });
    setFeedback(result);
    setLoadingFeedback(false);
  };

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex gap-3 items-start pr-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-slate-800 text-sm leading-relaxed">{question.question}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mt-1 inline-block">{question.type}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
              {question.tip && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                  <span className="font-semibold">💡 Tip: </span>{question.tip}
                </div>
              )}
              <Textarea
                placeholder="Type your answer here to get AI feedback..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <Button
                size="sm"
                onClick={getFeedback}
                disabled={!userAnswer.trim() || loadingFeedback}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {loadingFeedback ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                Get AI Feedback
              </Button>
              {feedback && (
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200">
                  {feedback}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function MockInterviewContent() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [interviewType, setInterviewType] = useState('mixed');
  const [questions, setQuestions] = useState([]);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });
  const profile = profiles[0];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 8 realistic interview questions for this role.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Interview Type: ${interviewType}
Candidate Background: ${profile?.professional_summary || 'Not provided'}

Return 8 questions covering: behavioral, situational, technical, and role-specific.
For each question include a short tip on how to approach it.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  type: { type: "string" },
                  tip: { type: "string" }
                }
              }
            }
          }
        }
      });
      setQuestions(result.questions || []);
    }
  });

  return (
    <div>
      <PageHeader
        title="Mock Interview Simulator"
        subtitle="Practice with AI-generated questions tailored to your role"
        icon={Mic}
      />
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold text-amber-700">
          <Zap className="w-3 h-3" /> Premium Feature
        </span>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-slate-600">Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                <SelectItem value="behavioral">Behavioral Only</SelectItem>
                <SelectItem value="technical">Technical Only</SelectItem>
                <SelectItem value="situational">Situational Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-sm text-slate-600">Job Description (optional)</Label>
          <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description for more targeted questions..." className="mt-1 min-h-[100px]" />
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!jobTitle.trim() || generateMutation.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Interview Questions
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Preparing your mock interview..." />}

      {questions.length > 0 && !generateMutation.isPending && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 font-medium mb-2">Click each question to expand, type your answer, and get AI feedback.</p>
          {questions.map((q, i) => <QuestionCard key={i} question={q} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function MockInterview() {
  return (
    <PremiumGate featureName="Mock Interview Simulator" description="Practice with AI-generated, role-specific interview questions and get instant feedback on your answers.">
      <MockInterviewContent />
    </PremiumGate>
  );
}