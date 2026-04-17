import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { MessageSquare, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import { toast } from 'sonner';

export default function InterviewMastery() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [questions, setQuestions] = useState('');

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive interview preparation package for:
        
Job Title: ${jobTitle}
Company: ${company}

Provide:
1. 20 company-specific interview questions
2. Model answers for each question
3. STAR method frameworks
4. Technical questions (if applicable)
5. Behavioral interview tips
6. Red flags to avoid`,
        model: 'claude_sonnet_4_6'
      });
      setQuestions(result);
      toast.success('Interview prep generated!');
    }
  });

  return (
    <div>
      <PageHeader
        title="Interview Mastery Bundle"
        subtitle="AI-powered interview preparation"
        icon={MessageSquare}
      />

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" />
          </div>
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={!jobTitle || generateMutation.isPending}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Interview Prep
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Preparing your interview questions..." />}

      {questions && (
        <Card className="p-6">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap">
            {questions}
          </div>
        </Card>
      )}
    </div>
  );
}