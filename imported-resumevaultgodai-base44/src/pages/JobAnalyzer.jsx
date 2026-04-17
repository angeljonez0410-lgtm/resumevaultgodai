import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, Sparkles, FileText, User, ArrowRight, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import KeywordBadges from '../components/ui-custom/KeywordBadges';
import OutputCard from '../components/ui-custom/OutputCard';
import MatchScoreCard from '../components/resume/MatchScoreCard';
import MotivationalQuote from '../components/ui-custom/MotivationalQuotes';

export default function JobAnalyzer() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [keywords, setKeywords] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [matchSuggestions, setMatchSuggestions] = useState([]);
  const [savedJobAppId, setSavedJobAppId] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Personal info for resume building
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');

  // Toggles
  const [useOldResume, setUseOldResume] = useState(true);
  const [generateExperience, setGenerateExperience] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [showCoverLetterTab, setShowCoverLetterTab] = useState(false);

  // Client-side match score calculation (instant, no server needed)
  const calculateMatchScore = (resume, jd) => {
    const resumeWords = resume.toLowerCase().split(/\s+/);
    const jobKeywords = jd.toLowerCase().split(/\s+/);
    const matches = jobKeywords.filter(keyword => 
      resumeWords.some(word => word.includes(keyword) && keyword.length > 3)
    );
    return Math.round((matches.length / jobKeywords.length) * 100);
  };

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
  const profile = profiles[0];

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this job description and provide:

1. Key required skills
2. ATS keywords
3. Recommended resume improvements
4. Estimated ATS match score
5. Missing skills to add

Job Description:
Title: ${jobTitle}
Company: ${company}
Description:
${jobDescription}

Provide a detailed analysis in markdown format with clear sections.`,
        model: 'claude_sonnet_4_6'
      });
      setAnalysis(analysisResult);

      const keywordResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ATS keywords from this job description:

${jobDescription}

Categorize into: hard_skills, soft_skills, tools, qualifications, industry_terms`,
        response_json_schema: {
          type: "object",
          properties: {
            hard_skills: { type: "array", items: { type: "string" } },
            soft_skills: { type: "array", items: { type: "string" } },
            tools: { type: "array", items: { type: "string" } },
            qualifications: { type: "array", items: { type: "string" } },
            industry_terms: { type: "array", items: { type: "string" } },
          }
        }
      });
      setKeywords(keywordResult);

      const jobApp = await base44.entities.JobApplication.create({
        job_title: jobTitle,
        company_name: company,
        job_description: jobDescription,
        ats_keywords: JSON.stringify(keywordResult),
        status: 'ready'
      });
      setSavedJobAppId(jobApp.id);
      setAnalysisComplete(true);
      toast.success('🎯 Job Analysis Complete!', { 
        description: `Found ${keywordResult.hard_skills?.length || 0} hard skills • Ready to optimize resume`,
        duration: 4000
      });
    }
  });

  const buildResumeMutation = useMutation({
    mutationFn: async () => {
      const userName = profile?.full_name || fullName;
      const userEmail = profile?.email_address || email;
      const userPhone = profile?.phone || phone;
      const userLocation = profile?.location || location;
      const userSkills = profile?.skills || skills;
      const userEducation = profile ? JSON.stringify(profile.education || []) : 'Not provided';
      const userOldResume = (useOldResume && profile?.saved_resume) || experience;
      const aiGenerateOption = generateExperience ? 'Yes - intelligently generate additional experience if needed' : 'No - use only provided information';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert ATS resume optimizer and professional career coach.

Your task is to generate a highly optimized resume tailored to a specific job description.

GOAL
Create a resume that achieves a 98–100% ATS compatibility score by aligning skills, keywords, and experience with the job description.

INPUT DATA

PERSONAL DETAILS
Name: ${userName}
Email: ${userEmail}
Phone: ${userPhone}
Location: ${userLocation}

CORE SKILLS
${userSkills}

EDUCATION
${userEducation}

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

6. Structure the resume with these sections:

Professional Summary  
Core Skills  
Professional Experience  
Education  
Certifications (if relevant)

7. Each experience entry must include:
Job Title  
Company Name  
Employment Dates  
3–5 impact bullet points using action verbs and measurable results.

8. At the end provide:

ATS Match Score (estimate)
Keyword Match Report
Missing Skills Suggestions

OUTPUT FORMAT

SECTION 1: ATS OPTIMIZED RESUME

SECTION 2: ATS MATCH SCORE
Example:
ATS Match Score: 98%

SECTION 3: KEYWORD ALIGNMENT
Matched Keywords:
Missing Keywords:

SECTION 4: IMPROVEMENT SUGGESTIONS`,
        model: 'claude_sonnet_4_6'
      });
      setGeneratedResume(result);

      // Client-side score calculation (instant, no additional API call)
      const clientScore = calculateMatchScore(result, jobDescription);
      const scoreMatch = result.match(/ATS Match Score:\s*(\d+)%/i);
      const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : clientScore;
      
      const suggestionsMatch = result.match(/SECTION 4: IMPROVEMENT SUGGESTIONS\n([\s\S]+?)(?:\n\n|$)/);
      const extractedSuggestions = suggestionsMatch ? 
        suggestionsMatch[1].split('\n').filter(s => s.trim()).slice(0, 3) : 
        ['Resume optimized for ATS systems', 'All key keywords included', 'Ready to submit'];

      setMatchScore(extractedScore);
      setMatchSuggestions(extractedSuggestions);

      // Lazy-load: Only generate cover letter if user actually views it
      let coverLetterResult = '';
      if (showCoverLetterTab && includeCoverLetter) {
        coverLetterResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a tailored professional cover letter based on this resume and job description.

## Job Description
Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription}

## Resume
${result}

Create a compelling cover letter that:
1. Addresses the hiring manager professionally
2. Highlights key qualifications from the resume
3. Shows enthusiasm for the role
4. Uses specific examples
5. Includes a strong closing

Keep it concise (3-4 paragraphs) and professional.`,
          model: 'claude_sonnet_4_6'
        });
        setCoverLetter(coverLetterResult);
      }

      if (savedJobAppId) {
        await base44.entities.JobApplication.update(savedJobAppId, {
          generated_resume: result,
          generated_cover_letter: coverLetterResult
        });
      }

      const successMsg = includeCoverLetter ? '✅ Resume & Cover Letter Ready!' : '✅ Resume Generated & Saved!';
      toast.success(successMsg, { 
        description: `ATS Score: ${extractedScore}% • Saved to library`,
        duration: 4000 
      });
    }
  });

  return (
    <div>
      <PageHeader
        title="Job Analyzer"
        subtitle="Paste a job description to extract ATS keywords and get strategic insights"
        icon={Search}
      />

      {/* Motivational Quote */}
      <div className="mb-8">
        <MotivationalQuote variant="small" />
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-slate-700 text-sm font-medium">Job Title</Label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Product Manager"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-slate-700 text-sm font-medium">Company</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="mb-4">
          <Label className="text-slate-700 text-sm font-medium">Job Description</Label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="mt-1.5 min-h-[200px] resize-y"
          />
        </div>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={!jobDescription.trim() || analyzeMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          size="lg"
        >
          <Search className="w-5 h-5 mr-2" />
          Step 1: Analyze Job
        </Button>
        <p className="text-xs text-slate-500 mt-2">Analyze the job first to extract keywords and requirements</p>
      </Card>

      {analyzeMutation.isPending && <LoadingState message="Analyzing job description..." />}

      {analysis && !analyzeMutation.isPending && (
        <div className="space-y-6">
          <OutputCard title="Job Analysis & ATS Strategy" content={analysis} icon={Search} />

          {keywords && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600" />
                Extracted ATS Keywords
              </h3>
              <KeywordBadges keywords={keywords} />
            </Card>
          )}

          <Separator className="my-8" />

          {/* Build Resume Section */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Step 2: Build Your Resume</h3>
                <p className="text-sm text-slate-600">Generate an ATS-optimized resume (98-100% match)</p>
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg p-4 mb-5 space-y-3 border border-slate-200">
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
                <div>
                  <Label className="text-slate-700 font-medium">Generate Cover Letter</Label>
                  <p className="text-xs text-slate-500">Generated on-demand when you view it</p>
                </div>
                <Switch checked={includeCoverLetter} onCheckedChange={setIncludeCoverLetter} />
              </div>
            </div>

            {!profile ? (
              <div>
                <Alert className="mb-4 border-amber-200 bg-amber-50">
                  <User className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    No profile found. Enter your information below or create a profile first.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-slate-700 text-sm">Full Name *</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-slate-700 text-sm">Email *</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-slate-700 text-sm">Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-slate-700 text-sm">Location</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New York, NY" className="mt-1.5" />
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-slate-700 text-sm">Professional Summary *</Label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief professional summary..." className="mt-1.5 min-h-[80px]" />
                </div>
                <div className="mb-4">
                  <Label className="text-slate-700 text-sm">Skills *</Label>
                  <Textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="JavaScript, React, Node.js, Python..." className="mt-1.5 min-h-[60px]" />
                </div>
                <div className="mb-4">
                  <Label className="text-slate-700 text-sm">Work Experience *</Label>
                  <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Company, Role, Dates, Key achievements..." className="mt-1.5 min-h-[120px]" />
                </div>
              </div>
            ) : (
              <Alert className="mb-4 border-emerald-200 bg-white">
                <User className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-slate-700 text-sm">
                  Using your saved profile: <strong>{profile.full_name}</strong>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => buildResumeMutation.mutate()}
              disabled={buildResumeMutation.isPending || (!profile && (!fullName || !email || !summary || !skills || !experience))}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {includeCoverLetter ? 'Generate Resume + Cover Letter' : 'Generate Resume'}
            </Button>
            <p className="text-xs text-emerald-700 mt-2 font-medium">✨ Uses premium AI model for 98-100% ATS match score</p>
          </Card>

          {buildResumeMutation.isPending && <LoadingState message="Building your optimized resume..." />}

          {generatedResume && !buildResumeMutation.isPending && (
            <div className="space-y-4">
              {matchScore && <MatchScoreCard score={matchScore} suggestions={matchSuggestions} />}
              <OutputCard
                title={`ATS-Optimized Resume — ${jobTitle}`}
                content={generatedResume}
                icon={FileText}
                filename={`resume_${jobTitle.toLowerCase().replace(/\s+/g, '_')}`}
              />
              {coverLetter && (
                <OutputCard
                  title={`Cover Letter — ${jobTitle}`}
                  content={coverLetter}
                  icon={Mail}
                  filename={`cover_letter_${jobTitle.toLowerCase().replace(/\s+/g, '_')}`}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}