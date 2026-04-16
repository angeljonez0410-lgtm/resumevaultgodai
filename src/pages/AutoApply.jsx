import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, DollarSign, Briefcase, Sparkles, Save, ExternalLink, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import { useSubscription } from '../components/premium/useSubscription';
import PremiumGate from '../components/premium/PremiumGate';
import ApplicationPackage from '../components/autoapply/ApplicationPackage';
import { ProgressSteps } from '../components/ui/progress-steps';

export default function AutoApply() {
  const { isPremium } = useSubscription();
  
  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('Remote');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [skills, setSkills] = useState('');
  
  // Results state
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [applicationPackage, setApplicationPackage] = useState(null);

  // Search for jobs
  const searchMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI job search assistant with access to real-time job market data.

TASK: Search for REAL job opportunities posted in the last 30 days matching these criteria:

Job Title: ${jobTitle}
Location: ${location}
Work Type: ${workType}
Salary Range: ${salaryMin ? `$${salaryMin}k` : 'Not specified'} - ${salaryMax ? `$${salaryMax}k` : 'Not specified'}
Experience Level: ${experienceLevel}
Required Skills: ${skills}

INSTRUCTIONS:
1. Search current job boards (LinkedIn, Indeed, Glassdoor, company career pages)
2. Only return jobs posted within the last 30 days
3. Verify companies and positions are real
4. Include actual application URLs when available
5. Calculate match score based on skills alignment and requirements

For each job provide:
- company: Real company name
- job_title: Exact job title from posting
- location: City, State or "Remote"
- salary: Actual salary range if listed, or "Not specified"
- description: 2-3 sentences from actual job description
- application_link: Real application URL (Indeed, LinkedIn, company site)
- match_score: 0-100% based on skill fit

Return 5-8 current, accurate job opportunities.`,
        add_context_from_internet: true,
        model: 'gemini_3_pro',
        response_json_schema: {
          type: "object",
          properties: {
            jobs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  job_title: { type: "string" },
                  location: { type: "string" },
                  salary: { type: "string" },
                  description: { type: "string" },
                  application_link: { type: "string" },
                  match_score: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      const jobCount = result.jobs?.length || 0;
      setJobs(result.jobs || []);
      toast.success(`🎯 Found ${jobCount} Matching Jobs`, {
        description: 'Click "Analyze Match" to see compatibility',
        duration: 3000
      });
    }
  });

  // Analyze job match
  const analyzeMutation = useMutation({
    mutationFn: async (job) => {
      const user = await base44.auth.me();
      const profile = await base44.entities.UserProfile.filter({ created_by: user.email });
      const userProfile = profile?.[0];

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert job matching AI.

Compare the user's skills and resume with the job description.

User Profile:
Name: ${userProfile?.full_name || 'Not provided'}
Skills: ${userProfile?.skills || skills}
Experience: ${JSON.stringify(userProfile?.experiences || [])}
Education: ${JSON.stringify(userProfile?.education || [])}

Job Details:
Company: ${job.company}
Title: ${job.job_title}
Description: ${job.description}

Analyze and return:
- Match Score (0-100%)
- Matching Skills (list)
- Missing Skills (list)
- Recommended Resume Changes (3-5 specific suggestions)

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            match_score: { type: "number" },
            matching_skills: { type: "array", items: { type: "string" } },
            missing_skills: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSelectedJob(job);
      setJobAnalysis(result);
      toast.success('✅ Analysis Complete', {
        description: `${result.match_score}% match • ${result.matching_skills?.length || 0} matching skills`,
        duration: 3000
      });
    }
  });

  // Save job to tracker
  const saveMutation = useMutation({
    mutationFn: async (job) => {
      await base44.entities.JobApplication.create({
        job_title: job.job_title,
        company_name: job.company,
        job_description: job.description,
        status: 'analyzing',
        notes: `Auto Apply - Match Score: ${job.match_score}%\nSalary: ${job.salary}\nLocation: ${job.location}`
      });
      toast.success('💾 Saved to Tracker', {
        description: `${job.job_title} at ${job.company}`,
        duration: 2500
      });
    }
  });

  // Generate application package (resume + cover letter + prep)
  const generatePackageMutation = useMutation({
    mutationFn: async (job) => {
      const user = await base44.auth.me();
      const profile = await base44.entities.UserProfile.filter({ created_by: user.email });
      const userProfile = profile?.[0];

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert ATS resume optimizer and professional career writer.

Prepare a complete job application package.

USER PROFILE:
Name: ${userProfile?.full_name || user.full_name}
Email: ${userProfile?.email_address || user.email}
Phone: ${userProfile?.phone || ''}
Location: ${userProfile?.location || ''}
Skills: ${userProfile?.skills || skills}
Professional Summary: ${userProfile?.professional_summary || ''}
Experience: ${JSON.stringify(userProfile?.experiences || [])}
Education: ${JSON.stringify(userProfile?.education || [])}

JOB DETAILS:
Company: ${job.company}
Title: ${job.job_title}
Description: ${job.description}
Location: ${job.location}

TASK 1: TAILORED RESUME
Create an ATS-optimized resume tailored to this specific job.
- Extract ATS keywords from job description
- Rewrite bullet points to match the role
- Use measurable achievements
- Ensure ATS compatibility
- Professional format

TASK 2: COVER LETTER
Generate a personalized, professional cover letter.
Structure:
- Opening: introduce applicant and express interest
- Body 1: highlight relevant experience and achievements
- Body 2: explain alignment with company/role
- Closing: confident call to action

TASK 3: INTERVIEW TALKING POINTS
Provide 5-7 key talking points for interviews:
- Your strongest relevant achievements
- How you solve problems the company faces
- Questions to ask the interviewer

TASK 4: APPLICATION CHECKLIST
Create a pre-submission checklist with 6-8 items:
- Document preparation
- Application review steps
- Follow-up actions

Also calculate an ATS Match Score (0-100%).

Return in JSON format with proper structure.`,
        response_json_schema: {
          type: "object",
          properties: {
            resume: { type: "string" },
            cover_letter: { type: "string" },
            key_talking_points: { type: "array", items: { type: "string" } },
            checklist: { type: "array", items: { type: "string" } },
            ats_score: { type: "number" }
          }
        },
        model: 'claude_sonnet_4_6'
      });

      setApplicationPackage(result);
      
      // Save to tracker
      await base44.entities.JobApplication.create({
        job_title: job.job_title,
        company_name: job.company,
        job_description: job.description,
        generated_resume: result.resume,
        generated_cover_letter: result.cover_letter,
        status: 'ready',
        notes: `Auto Apply Package\nATS Score: ${result.ats_score}%\nMatch Score: ${job.match_score}%\nSalary: ${job.salary}\nLocation: ${job.location}`
      });

      toast.success('🎉 Application Package Ready!', {
        description: `ATS Score: ${result.ats_score}% • Resume, cover letter & interview prep included`,
        duration: 5000
      });
    }
  });

  // Mark as applied
  const markAppliedMutation = useMutation({
    mutationFn: async (job) => {
      // Update status in tracker
      const user = await base44.auth.me();
      const applications = await base44.entities.JobApplication.filter({
        job_title: job.job_title,
        company_name: job.company,
        created_by: user.email
      });
      
      if (applications.length > 0) {
        await base44.entities.JobApplication.update(applications[0].id, {
          status: 'applied'
        });
      }

      toast.success('📤 Marked as Applied', {
        description: 'Opening application link...',
        duration: 2500
      });
      window.open(job.application_link, '_blank');
    }
  });

  const canSearch = jobTitle.trim() && location.trim();

  // Calculate current step
  const currentStep = useMemo(() => {
    if (applicationPackage) return 4;
    if (jobAnalysis) return 3;
    if (jobs.length > 0) return 2;
    return 1;
  }, [jobs, jobAnalysis, applicationPackage]);

  const steps = ['Search', 'Select Job', 'Analysis', 'Package'];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Auto Apply"
        subtitle="Find matching jobs and prepare optimized applications automatically"
        icon={Target}
      />

      <PremiumGate
        feature="Auto Apply"
        description="Search for jobs, get match analysis, and prepare application packages automatically."
      >
        {/* Progress Indicator */}
        <ProgressSteps steps={steps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Job Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Job Title *</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Location *</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Work Type</Label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min Salary ($k)</Label>
                    <Input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="80"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Max Salary ($k)</Label>
                    <Input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="120"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry">Entry Level</SelectItem>
                      <SelectItem value="Mid">Mid Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skills</Label>
                  <Textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, React, SQL, AWS..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={() => searchMutation.mutate()}
                  disabled={!canSearch || searchMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                  size="lg"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Matching Jobs
                </Button>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {searchMutation.isPending && <LoadingState message="Searching for matching jobs..." />}

            {jobs.length > 0 && !searchMutation.isPending && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">Found {jobs.length} Jobs</h3>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Live Results
                  </Badge>
                </div>

                {jobs.map((job, idx) => (
                  <Card key={idx} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-slate-800">{job.job_title}</h4>
                        <p className="text-sm text-slate-600">{job.company}</p>
                      </div>
                      <Badge
                        className={
                          job.match_score >= 80
                            ? 'bg-green-100 text-green-800'
                            : job.match_score >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }
                      >
                        {job.match_score}% Match
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </div>
                      )}
                      <p className="text-sm text-slate-600 mt-2">{job.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => analyzeMutation.mutate(job)}
                        disabled={analyzeMutation.isPending}
                        className="gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Analyze Match
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveMutation.mutate(job)}
                        disabled={saveMutation.isPending}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Job
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="gap-2"
                      >
                        <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          Apply
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {analyzeMutation.isPending && <LoadingState message="Analyzing job match..." />}

            {/* Job Analysis */}
            {jobAnalysis && selectedJob && !analyzeMutation.isPending && (
              <Card className="p-6 mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Match Analysis: {selectedJob.job_title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-600">Match Score</span>
                        <span className="text-2xl font-bold text-indigo-600">{jobAnalysis.match_score}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${jobAnalysis.match_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-indigo-200">
                    <p className="text-sm font-medium text-slate-600 mb-2">Quick Stats</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Matching Skills:</span>
                        <span className="font-semibold text-green-600">{jobAnalysis.matching_skills?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Missing Skills:</span>
                        <span className="font-semibold text-amber-600">{jobAnalysis.missing_skills?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-sm text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jobAnalysis.matching_skills?.map((skill, i) => (
                        <Badge key={i} className="bg-green-100 text-green-800">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h4 className="font-semibold text-sm text-amber-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jobAnalysis.missing_skills?.map((skill, i) => (
                        <Badge key={i} variant="outline" className="border-amber-300 text-amber-700">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mt-4 border border-indigo-200">
                  <h4 className="font-semibold text-sm text-indigo-800 mb-3">Resume Optimization Tips</h4>
                  <ul className="space-y-2">
                    {jobAnalysis.recommendations?.map((rec, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => generatePackageMutation.mutate(selectedJob)}
                    disabled={generatePackageMutation.isPending}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Application Package
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={selectedJob.application_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </a>
                  </Button>
                </div>
              </Card>
            )}

            {generatePackageMutation.isPending && <LoadingState message="Preparing your application package..." />}

            {/* Application Package */}
            {applicationPackage && selectedJob && !generatePackageMutation.isPending && (
              <div className="mt-6">
                <ApplicationPackage
                  packageData={applicationPackage}
                  job={selectedJob}
                  onApply={() => markAppliedMutation.mutate(selectedJob)}
                />
              </div>
            )}
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}