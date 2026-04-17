import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import OutputCard from '../components/ui-custom/OutputCard';

export default function FollowUpEmail() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [emailType, setEmailType] = useState('post_application');
  const [additionalContext, setAdditionalContext] = useState('');
  const [email, setEmail] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });

  const profile = profiles[0];

  const typeLabels = {
    post_application: 'After submitting application (1-2 weeks)',
    post_interview: 'After an interview (within 24 hours)',
    no_response: 'No response follow-up (2-3 weeks)',
    thank_you: 'Thank you note after interview',
    networking: 'Networking follow-up',
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a professional follow-up email for a job application.

## Details
- Email Type: ${emailType} (${typeLabels[emailType]})
- Job Title: ${jobTitle}
- Company: ${company}
- Recipient: ${recipientName || 'Hiring Manager'}
- Sender: ${profile?.full_name || '[Your Name]'}
- Additional Context: ${additionalContext || 'None'}

## Instructions
1. Write a ${emailType === 'post_interview' || emailType === 'thank_you' ? 'warm and grateful' : 'professional and concise'} email
2. Include a clear subject line (format: **Subject:** ...)
3. Keep it brief (3-5 short paragraphs max)
4. Show genuine interest in the position
5. ${emailType === 'post_interview' ? 'Reference specific topics discussed in the interview' : 'Briefly restate your value proposition'}
6. Include a professional sign-off
7. Be respectful of their time
8. End with a clear next step or question

Output in clean markdown format with the subject line at the top.`,
        model: 'claude_sonnet_4_6'
      });
      setEmail(result);
      toast.success('Follow-up email generated!');
    }
  });

  return (
    <div>
      <PageHeader
        title="Follow-Up Email"
        subtitle="Craft professional follow-up emails that get responses"
        icon={Send}
      />

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
            <Label className="text-slate-700 text-sm font-medium">Recipient Name (optional)</Label>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Jane Smith" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-slate-700 text-sm font-medium">Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="post_application">Post-Application Follow-Up</SelectItem>
                <SelectItem value="post_interview">Post-Interview Follow-Up</SelectItem>
                <SelectItem value="no_response">No Response Follow-Up</SelectItem>
                <SelectItem value="thank_you">Thank You Note</SelectItem>
                <SelectItem value="networking">Networking Follow-Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-slate-700 text-sm font-medium">Additional Context (optional)</Label>
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any specific details — topics discussed in interview, key points you want to mention, etc."
            className="mt-1.5 min-h-[100px] resize-y"
          />
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!jobTitle.trim() || !company.trim() || generateMutation.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Email
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Writing your follow-up email..." />}

      {email && !generateMutation.isPending && (
        <OutputCard title="Your Follow-Up Email" content={email} icon={Send} />
      )}
    </div>
  );
}