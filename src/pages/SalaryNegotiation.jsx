import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { DollarSign, Sparkles, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import OutputCard from '../components/ui-custom/OutputCard';
import PremiumGate from '../components/premium/PremiumGate';

function SalaryNegotiationContent() {
  const [form, setForm] = useState({
    jobTitle: '',
    currentOffer: '',
    targetSalary: '',
    location: '',
    yearsExperience: '',
    scenario: 'initial_offer',
    strengths: '',
  });
  const [scripts, setScripts] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create professional salary negotiation scripts for this situation.

## Details
Job Title: ${form.jobTitle}
Current Offer: ${form.currentOffer ? `$${form.currentOffer}` : 'Not disclosed yet'}
Target Salary: ${form.targetSalary ? `$${form.targetSalary}` : 'Market rate'}
Location: ${form.location || 'Not specified'}
Years of Experience: ${form.yearsExperience}
Negotiation Scenario: ${form.scenario}
Key Strengths/Leverage: ${form.strengths || 'Not specified'}

## Output Required
Provide the following sections:

## Market Context
Brief context on typical salary ranges for this role/location and how to leverage market data.

## Negotiation Strategy
2-3 key strategic points for this specific situation.

## Script 1: Email Response
A professional email script for this scenario. Be specific and ready-to-send.

## Script 2: Phone/Video Call
A word-for-word phone script with natural phrasing. Include how to open, make the ask, and handle pushback.

## Script 3: Counteroffer
A firm but professional counteroffer script if they don't meet your target.

## If They Say No
How to negotiate non-salary compensation (equity, PTO, signing bonus, remote work).

## Key Phrases to Use
5-7 powerful phrases that signal confidence without being aggressive.

Be specific, realistic, and professional throughout.`,
      });
      setScripts(result);
    }
  });

  return (
    <div>
      <PageHeader
        title="Salary Negotiation Scripts"
        subtitle="Get data-backed, ready-to-use negotiation scripts tailored to your situation"
        icon={DollarSign}
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
            <Input value={form.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} placeholder="e.g. Senior Software Engineer" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Scenario</Label>
            <Select value={form.scenario} onValueChange={(v) => update('scenario', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="initial_offer">Responding to Initial Offer</SelectItem>
                <SelectItem value="counteroffer">Making a Counteroffer</SelectItem>
                <SelectItem value="no_offer_yet">Discussing Before Offer</SelectItem>
                <SelectItem value="promotion">Asking for a Raise/Promotion</SelectItem>
                <SelectItem value="competing_offer">Leveraging a Competing Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-slate-600">Current Offer ($)</Label>
            <Input value={form.currentOffer} onChange={(e) => update('currentOffer', e.target.value)} placeholder="e.g. 95000" type="number" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Target Salary ($)</Label>
            <Input value={form.targetSalary} onChange={(e) => update('targetSalary', e.target.value)} placeholder="e.g. 115000" type="number" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Location</Label>
            <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. San Francisco, CA" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Years of Experience</Label>
            <Input value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)} placeholder="e.g. 7" type="number" className="mt-1" />
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-sm text-slate-600">Your Key Strengths / Leverage Points</Label>
          <Textarea value={form.strengths} onChange={(e) => update('strengths', e.target.value)} placeholder="e.g. Led a team of 8, increased revenue by 40%, competing offer from another company, rare skills..." className="mt-1 min-h-[80px]" />
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!form.jobTitle.trim() || generateMutation.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Negotiation Scripts
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Crafting your negotiation scripts..." />}
      {scripts && !generateMutation.isPending && (
        <OutputCard title="Your Salary Negotiation Scripts" content={scripts} icon={DollarSign} />
      )}
    </div>
  );
}

export default function SalaryNegotiation() {
  return (
    <PremiumGate featureName="Salary Negotiation Scripts" description="Get professional, ready-to-send negotiation scripts and strategies to maximize your compensation.">
      <SalaryNegotiationContent />
    </PremiumGate>
  );
}