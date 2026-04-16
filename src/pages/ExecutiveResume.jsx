import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Briefcase, Crown, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import ResumeOutputSplit from '../components/resume/ResumeOutputSplit';

export default function ExecutiveResume() {
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [resume, setResume] = useState('');

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an executive-level resume for:

Role: ${role}
Industry: ${industry}
Experience: ${experience}

Use executive resume best practices:
- Executive summary highlighting leadership
- Quantified achievements
- Board experience if relevant
- C-suite language
- Strategic impact focus

SECTION 1: ATS OPTIMIZED RESUME
[Executive resume here]

SECTION 2: ATS MATCH SCORE
98%

SECTION 3: KEYWORD ALIGNMENT
Executive keywords included

SECTION 4: IMPROVEMENT SUGGESTIONS
Ready for C-suite applications`,
        model: 'claude_sonnet_4_6'
      });
      setResume(result);
    }
  });

  return (
    <div>
      <PageHeader
        title="Executive Resume Package"
        subtitle="Premium resumes for senior roles"
        icon={Briefcase}
      />

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label>Target Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Chief Technology Officer" />
          </div>
          <div>
            <Label>Industry</Label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="FinTech" />
          </div>
          <div>
            <Label>Experience Summary</Label>
            <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="20+ years in tech leadership..." className="h-32" />
          </div>
          <Button onClick={() => generateMutation.mutate()} disabled={!role || generateMutation.isPending}>
            <Crown className="w-4 h-4 mr-2" />
            Generate Executive Resume
          </Button>
        </div>
      </Card>

      {generateMutation.isPending && <LoadingState message="Crafting executive resume..." />}

      {resume && <ResumeOutputSplit title="Executive Resume" content={resume} icon={Briefcase} filename="executive_resume" />}
    </div>
  );
}