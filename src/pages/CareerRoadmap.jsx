import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Map, Sparkles, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import OutputCard from '../components/ui-custom/OutputCard';
import PremiumGate from '../components/premium/PremiumGate';

function CareerRoadmapContent() {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState('2_years');
  const [additionalContext, setAdditionalContext] = useState('');
  const [roadmap, setRoadmap] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });
  const profile = profiles[0];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed, actionable career roadmap for this professional.

## Current Situation
Current Role: ${currentRole}
Target Role: ${targetRole}
Timeframe: ${timeframe.replace('_', ' ')}
Current Skills: ${profile?.skills || 'Not specified'}
Experience: ${JSON.stringify((profile?.experiences || []).slice(0, 3))}
Additional Context: ${additionalContext || 'None'}

## Required Output

## Executive Summary
Where they are now, where they want to go, and the core transformation required.

## Gap Analysis
### Skills Gap
Specific skills they need to develop.
### Experience Gap
Types of experience they're missing.
### Network Gap
What relationships they need to build.

## 90-Day Action Plan
Specific, measurable actions for the first 90 days.

## 6-Month Milestones
What should be accomplished at the 6-month mark.

## 12-Month Milestones
What should be accomplished at 12 months.

## ${timeframe === '6_months' ? '6-Month' : timeframe === '1_year' ? '1-Year' : timeframe === '2_years' ? '2-Year' : '5-Year'} Goal State
What success looks like at the target timeframe.

## Learning Resources
Top 5 specific courses, books, or certifications to pursue (with names).

## Key Metrics to Track
How to measure progress toward the goal.

## Common Pitfalls
3-4 mistakes to avoid on this career path.

Be highly specific, realistic, and actionable throughout.`,
      });
      setRoadmap(result);
    }
  });

  return (
    <div>
      <PageHeader
        title="Strategic Career Roadmap"
        subtitle="Get a detailed, step-by-step plan to reach your career goals"
        icon={Map}
      />
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold text-amber-700">
          <Zap className="w-3 h-3" /> Premium Feature
        </span>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-slate-600">Current Role / Title</Label>
            <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Junior Software Developer" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Target Role / Title</Label>
            <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Engineering Manager at a Startup" className="mt-1" />
          </div>
          <div className="md:col-span-1">
            <Label className="text-sm text-slate-600">Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6_months">6 Months</SelectItem>
                <SelectItem value="1_year">1 Year</SelectItem>
                <SelectItem value="2_years">2 Years</SelectItem>
                <SelectItem value="5_years">5 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-sm text-slate-600">Additional Context</Label>
          <Textarea value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="Any specific constraints, interests, or context that would help personalize your roadmap..." className="mt-1 min-h-[80px]" />
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!currentRole.trim() || !targetRole.trim() || generateMutation.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate My Career Roadmap
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Building your personalized career roadmap..." />}
      {roadmap && !generateMutation.isPending && (
        <OutputCard title="Your Career Roadmap" content={roadmap} icon={Map} />
      )}
    </div>
  );
}

export default function CareerRoadmap() {
  return (
    <PremiumGate featureName="Strategic Career Roadmap" description="Get a personalized, step-by-step career plan with milestones, skill gaps, and actionable next steps.">
      <CareerRoadmapContent />
    </PremiumGate>
  );
}