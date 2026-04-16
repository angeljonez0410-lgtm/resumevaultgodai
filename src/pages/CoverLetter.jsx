import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mail, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import OutputCard from '../components/ui-custom/OutputCard';

export default function CoverLetter() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [hiringManager, setHiringManager] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });

  const profile = profiles[0];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const profileData = profile ? `
Name: ${profile.full_name}
Email: ${profile.email_address || ''}
Phone: ${profile.phone || ''}
Location: ${profile.location || ''}
Summary: ${profile.professional_summary || ''}
Skills: ${profile.skills || ''}
Key Experience: ${JSON.stringify((profile.experiences || []).slice(0, 3))}
Education: ${JSON.stringify((profile.education || []).slice(0, 2))}
` : 'No profile data available. Use placeholder names and sections.';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a compelling, professional cover letter tailored for this job. Use ONLY the information from the candidate's profile. NEVER fabricate experience.

## Job Details
Title: ${jobTitle}
Company: ${company}
Hiring Manager: ${hiringManager || 'Hiring Manager'}
Description: ${jobDescription}

## Candidate Profile
${profileData}

## Tone: ${tone}

## Instructions
1. Address the letter to ${hiringManager || 'the Hiring Manager'}
2. Opening paragraph: Hook the reader with enthusiasm for the role and company
3. Body paragraphs: Connect the candidate's ACTUAL experience to the job requirements with specific examples
4. Highlight measurable impact and achievements from the profile
5. Show knowledge of the company (based on the job description)
6. Closing: Strong call to action
7. Keep it concise (3-4 paragraphs)
8. Use a ${tone} tone throughout
9. Include proper formatting with date, addresses, salutation, and sign-off
10. NEVER make up achievements or experiences

Output in clean markdown format.`,
        model: 'claude_sonnet_4_6'
      });
      setCoverLetter(result);
      toast.success('Cover letter generated successfully!');
    }
  });

  return (
    <div>
      <PageHeader
        title="Cover Letter Writer"
        subtitle="Create a compelling cover letter matched to the role"
        icon={Mail}
      />

      {!profile && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <Link to={createPageUrl('Profile')} className="underline font-medium">Set up your profile</Link> first for personalized cover letters.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-slate-700 text-sm font-medium">Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Manager" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-slate-700 text-sm font-medium">Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-slate-700 text-sm font-medium">Hiring Manager (optional)</Label>
            <Input value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} placeholder="e.g. Jane Smith" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-slate-700 text-sm font-medium">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="confident">Confident</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-slate-700 text-sm font-medium">Job Description</Label>
          <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." className="mt-1.5 min-h-[180px] resize-y" />
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!jobDescription.trim() || generateMutation.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Cover Letter
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Writing your cover letter..." />}

      {coverLetter && !generateMutation.isPending && (
        <OutputCard title="Your Cover Letter" content={coverLetter} icon={Mail} />
      )}
    </div>
  );
}