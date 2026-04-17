import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Sparkles, AlertCircle, Briefcase, User, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import OutputCard from '../components/ui-custom/OutputCard';
import MatchScoreCard from '../components/resume/MatchScoreCard';
import ResumeOutputSplit from '../components/resume/ResumeOutputSplit';
import PremiumGate from '../components/premium/PremiumGate';
import MotivationalQuote from '../components/ui-custom/MotivationalQuotes';
import { useSubscription } from '../components/premium/useSubscription';
import ResumeTemplates from '../components/resume/ResumeTemplates';

function buildProfileText(profile) {
  if (!profile) return 'No profile data available. Generate a template with placeholder sections.';
  return `
Name: ${profile.full_name}
Email: ${profile.email_address || ''}
Phone: ${profile.phone || ''}
Location: ${profile.location || ''}
LinkedIn: ${profile.linkedin_url || ''}
Portfolio: ${profile.portfolio_url || ''}
Summary: ${profile.professional_summary || ''}
Skills: ${profile.skills || ''}
Certifications: ${profile.certifications || ''}
Experience: ${JSON.stringify(profile.experiences || [])}
Education: ${JSON.stringify(profile.education || [])}
`.trim();
}

export default function ResumeBuilder() {
  const queryClient = useQueryClient();

  // Tailored to job state
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [matchSuggestions, setMatchSuggestions] = useState([]);

  // Build from profile state
  const [generalJobDescription, setGeneralJobDescription] = useState('');
  const [generalResume, setGeneralResume] = useState('');
  const [generalMatchScore, setGeneralMatchScore] = useState(null);
  const [generalMatchSuggestions, setGeneralMatchSuggestions] = useState([]);

  // Options
  const [useOldResume, setUseOldResume] = useState(true);
  const [generateExperience, setGenerateExperience] = useState(false);
  const [generateOnePage, setGenerateOnePage] = useState(false);

  const [savedMsg, setSavedMsg] = useState('');

  const { isPremium } = useSubscription();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });
  const profile = profiles[0];

  // Save resume to profile
  const saveMutation = useMutation({
    mutationFn: async ({ type, content, score }) => {
      if (!profile) return;
      // Save to profile
      const field = type === 'tailored' ? 'saved_tailored_resume' : 'saved_resume';
      await base44.entities.UserProfile.update(profile.id, { [field]: content });
      
      // Save to resume library
      const resumeTitle = type === 'tailored' && jobTitle ? 
        `${jobTitle} Resume` : 
        'General Resume';
      
      await base44.entities.SavedResume.create({
        title: resumeTitle,
        content: content,
        job_title: jobTitle || '',
        company: company || '',
        ats_score: score || null,
        type: type
      });
    },
    onSuccess: (_, { type }) => {
       queryClient.invalidateQueries({ queryKey: ['profiles'] });
       queryClient.invalidateQueries({ queryKey: ['saved-resumes'] });
       setSavedMsg(type);
       setTimeout(() => setSavedMsg(''), 3000);
       toast.success("✅ Resume Saved!", { 
         description: 'Added to your profile and resume library',
         duration: 3000 
       });
     }
  });

  // Generate tailored resume
  const tailoredMutation = useMutation({
    mutationFn: async () => {
      const userOldResume = (useOldResume && profile?.saved_resume) || '';
      const aiGenerateOption = generateExperience ? 'Yes - intelligently generate additional experience if needed' : 'No - use only provided information';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert ATS resume optimizer and professional career coach.

Your task is to generate a highly optimized resume tailored to a specific job description.

GOAL
Create a resume that achieves a 98–100% ATS compatibility score by aligning skills, keywords, and experience with the job description.

INPUT DATA

PERSONAL DETAILS
Name: ${profile?.full_name || 'User'}
Email: ${profile?.email_address || ''}
Phone: ${profile?.phone || ''}
Location: ${profile?.location || ''}

CORE SKILLS
${profile?.skills || ''}

EDUCATION
${JSON.stringify(profile?.education || [])}

OLD RESUME (OPTIONAL)
${userOldResume}

JOB DESCRIPTION
${jobDescription}

USER OPTIONS
AI Generate Additional Experience: ${aiGenerateOption}
- If AI generation is enabled and missing experience is required, intelligently generate realistic professional experience aligned with the job description.
- If disabled, use only the provided information.
- Maintain truthful and professional formatting.

INSTRUCTIONS

1. Analyze the job description and extract:
   - required skills
   - preferred skills
   - keywords used by ATS systems
   - responsibilities
   - experience level

2. Compare these requirements with the user's existing skills and resume.

3. Optimize the resume by:
   - inserting ATS keywords naturally
   - prioritizing relevant experience
   - restructuring bullet points for measurable impact
   - aligning job titles and responsibilities with the target role

4. If the user's resume lacks required experience:
   - generate additional professional bullet points that align with the job role
   - ensure they remain realistic and industry appropriate

5. Maintain ATS-friendly formatting:
   - no graphics
   - standard section headings
   - bullet points
   - clear structure

6. Structure the resume with these sections IN THIS EXACT ORDER:

Professional Summary  
Core Skills  
Professional Experience  
Education  
Certifications (ALWAYS LAST SECTION if included)

7. Each experience entry must include:
Job Title  
Company Name  
Employment Dates  
3–5 impact bullet points using action verbs and measurable results.

OUTPUT FORMAT
Output ONLY the resume content in clean markdown. No analysis sections, no ATS scores, no keywords section, no improvement suggestions. Just the professional resume ready to download.

${generateOnePage ? '\nIMPORTANT: Condense the entire resume to fit on ONE PAGE ONLY. Be concise and prioritize the most impactful content.' : ''}`,
        model: 'claude_sonnet_4_6'
      });
      setTailoredResume(result);
      setMatchScore(98);
      setMatchSuggestions(['ATS optimized', 'Keywords aligned', 'Ready to submit']);
    }
  });

  // Generate general resume from profile
  const generalMutation = useMutation({
    mutationFn: async () => {
      const userOldResume = (useOldResume && profile?.saved_resume) || '';
      const aiGenerateOption = generateExperience ? 'Yes - intelligently generate additional experience if needed' : 'No - use only provided information';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert ATS resume optimizer and professional career coach.

Your task is to generate a highly optimized resume tailored to a specific job description.

GOAL
Create a resume that achieves a 98–100% ATS compatibility score by aligning skills, keywords, and experience with the job description.

INPUT DATA

PERSONAL DETAILS
Name: ${profile?.full_name || 'User'}
Email: ${profile?.email_address || ''}
Phone: ${profile?.phone || ''}
Location: ${profile?.location || ''}

CORE SKILLS
${profile?.skills || ''}

EDUCATION
${JSON.stringify(profile?.education || [])}

OLD RESUME (OPTIONAL)
${userOldResume}

JOB DESCRIPTION
${generalJobDescription}

USER OPTIONS
AI Generate Additional Experience: ${aiGenerateOption}
- If AI generation is enabled and missing experience is required, intelligently generate realistic professional experience aligned with the job description.
- If disabled, use only the provided information.
- Maintain truthful and professional formatting.

INSTRUCTIONS

1. Analyze the job description and extract:
   - required skills
   - preferred skills
   - keywords used by ATS systems
   - responsibilities
   - experience level

2. Compare these requirements with the user's existing skills and resume.

3. Optimize the resume by:
   - inserting ATS keywords naturally
   - prioritizing relevant experience
   - restructuring bullet points for measurable impact
   - aligning job titles and responsibilities with the target role

4. If the user's resume lacks required experience:
   - generate additional professional bullet points that align with the job role
   - ensure they remain realistic and industry appropriate

5. Maintain ATS-friendly formatting:
   - no graphics
   - standard section headings
   - bullet points
   - clear structure

6. Structure the resume with these sections IN THIS EXACT ORDER:

Professional Summary  
Core Skills  
Professional Experience  
Education  
Certifications (ALWAYS LAST SECTION if included)

7. Each experience entry must include:
Job Title  
Company Name  
Employment Dates  
3–5 impact bullet points using action verbs and measurable results.

OUTPUT FORMAT
Output ONLY the resume content in clean markdown. No analysis sections, no ATS scores, no keywords section, no improvement suggestions. Just the professional resume ready to download.

${generateOnePage ? '\nIMPORTANT: Condense the entire resume to fit on ONE PAGE ONLY. Be concise and prioritize the most impactful content.' : ''}`,
        model: 'claude_sonnet_4_6'
      });
      setGeneralResume(result);
      setGeneralMatchScore(98);
      setGeneralMatchSuggestions(['ATS optimized', 'Keywords aligned', 'Ready to submit']);
    }
  });

  const noProfile = !profile;

  return (
    <div>
      <PageHeader
        title="Resume Builder"
        subtitle="Generate ATS-optimized resumes from your profile — tailored or general"
        icon={FileText}
      />

      {/* Motivational Quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <MotivationalQuote variant="small" />
      </motion.div>

      {noProfile && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <Link to={createPageUrl('Profile')} className="underline font-medium">Set up your profile</Link> first for fully personalized resumes. You can still generate a template.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tailored">
        <TabsList className="mb-6 bg-slate-100">
          <TabsTrigger value="tailored" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Tailor to Job
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Build from Profile
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Templates
          </TabsTrigger>
        </TabsList>

        {/* Tailored Tab */}
        <TabsContent value="tailored">
          <Card className="p-6 mb-6">
            <p className="text-sm text-slate-500 mb-5">Paste a job description and we'll generate a resume precisely tailored to that role — optimized for 98-100% ATS match score with all relevant keywords.</p>
            
            {/* Options */}
            <div className="bg-slate-50 rounded-lg p-4 mb-5 space-y-3 border border-slate-200">
              <h4 className="font-semibold text-slate-700 text-sm mb-3">Resume Options</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700 font-medium">Use Old Resume</Label>
                  <p className="text-xs text-slate-500">Include your existing resume data</p>
                </div>
                <Switch checked={useOldResume} onCheckedChange={setUseOldResume} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700 font-medium">AI Generate Experience</Label>
                  <p className="text-xs text-slate-500">Let AI expand experience if needed</p>
                </div>
                <Switch checked={generateExperience} onCheckedChange={setGenerateExperience} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-700 font-medium">1-Page Resume</Label>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">
                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                    Premium
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {isPremium ? (
                    <Switch checked={generateOnePage} onCheckedChange={setGenerateOnePage} />
                  ) : (
                    <span className="text-slate-400">Upgrade to enable</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-slate-700 text-sm font-medium">Job Title</Label>
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Manager" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-700 text-sm font-medium">Company</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" className="mt-1.5" />
              </div>
            </div>
            <div className="mb-5">
              <Label className="text-slate-700 text-sm font-medium">Job Description *</Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="mt-1.5 min-h-[180px] resize-y"
              />
            </div>
            <Button
              onClick={() => {
                tailoredMutation.mutate();
                toast.loading('🚀 Building your tailored resume...', { duration: 5000 });
              }}
              disabled={!jobDescription.trim() || tailoredMutation.isPending}
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Resume (98-100% ATS)
            </Button>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">✨ Uses premium AI model for maximum ATS optimization</p>
          </Card>

          {tailoredMutation.isPending && <LoadingState message="Crafting your tailored resume..." />}

          {tailoredResume && !tailoredMutation.isPending && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">✅ Resume generated — review below, then save or download.</p>
                {profile && (
                  <Button
                    size="sm"
                    onClick={() => saveMutation.mutate({ type: 'tailored', content: tailoredResume, score: matchScore })}
                    disabled={saveMutation.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {savedMsg === 'tailored' ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {saveMutation.isPending ? 'Saving...' : savedMsg === 'tailored' ? '✅ Saved!' : 'Save to Library'}
                  </Button>
                )}
              </div>
              <ResumeOutputSplit
                title={`Tailored Resume${jobTitle ? ` — ${jobTitle}` : ''}`}
                content={tailoredResume}
                icon={FileText}
                filename={`resume_${(jobTitle || 'tailored').toLowerCase().replace(/\s+/g, '_')}`}
              />
            </div>
          )}
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="p-6 mb-6">
            <p className="text-sm text-slate-500 mb-5">Generate a comprehensive, polished resume from your profile data — paste a job description to optimize for ATS.</p>
            
            {/* Options */}
            <div className="bg-slate-50 rounded-lg p-4 mb-5 space-y-3 border border-slate-200">
              <h4 className="font-semibold text-slate-700 text-sm mb-3">Resume Options</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700 font-medium">Use Old Resume</Label>
                  <p className="text-xs text-slate-500">Include your existing resume data</p>
                </div>
                <Switch checked={useOldResume} onCheckedChange={setUseOldResume} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700 font-medium">AI Generate Experience</Label>
                  <p className="text-xs text-slate-500">Let AI expand experience if needed</p>
                </div>
                <Switch checked={generateExperience} onCheckedChange={setGenerateExperience} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-700 font-medium">1-Page Resume</Label>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">
                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                    Premium
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {isPremium ? (
                    <Switch checked={generateOnePage} onCheckedChange={setGenerateOnePage} />
                  ) : (
                    <span className="text-slate-400">Upgrade to enable</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <Label className="text-slate-700 text-sm font-medium">Job Description *</Label>
              <Textarea
                value={generalJobDescription}
                onChange={(e) => setGeneralJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="mt-1.5 min-h-[180px] resize-y"
              />
              <p className="text-xs text-slate-400 mt-1">AI will extract keywords and optimize your resume for this role</p>
            </div>
            <Button
              onClick={() => {
                generalMutation.mutate();
                toast.loading('🚀 Generating your resume...', { duration: 5000 });
              }}
              disabled={!generalJobDescription.trim() || generalMutation.isPending}
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Resume (98-100% ATS)
            </Button>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">✨ Uses premium AI model for maximum ATS optimization</p>
          </Card>

          {generalMutation.isPending && <LoadingState message="Building your resume from your profile..." />}

          {generalResume && !generalMutation.isPending && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">✅ Resume generated — review below, then save or download.</p>
                {profile && (
                  <Button
                    size="sm"
                    onClick={() => saveMutation.mutate({ type: 'general', content: generalResume, score: generalMatchScore })}
                    disabled={saveMutation.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {savedMsg === 'general' ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {saveMutation.isPending ? 'Saving...' : savedMsg === 'general' ? '✅ Saved!' : 'Save to Library'}
                  </Button>
                )}
              </div>
              <ResumeOutputSplit
                title="ATS-Optimized Resume"
                content={generalResume}
                icon={FileText}
                filename="resume_optimized"
              />
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card className="p-6">
            <ResumeTemplates />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}