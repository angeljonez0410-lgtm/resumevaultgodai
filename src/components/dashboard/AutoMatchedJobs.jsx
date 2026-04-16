import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, MapPin, DollarSign, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AutoMatchedJobs() {
  const [matchedJobs, setMatchedJobs] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const findJobsMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        toast.error('Please create your profile first');
        return;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI job matching assistant with real-time job market access.

TASK: Find 5-8 REAL job opportunities that match this candidate's profile (posted in last 30 days).

CANDIDATE PROFILE:
Name: ${profile.full_name}
Location: ${profile.location || 'Remote preferred'}
Skills: ${profile.skills || ''}
Experience: ${JSON.stringify(profile.experiences || [])}
Summary: ${profile.professional_summary || ''}

INSTRUCTIONS:
1. Search current job boards (LinkedIn, Indeed, Glassdoor, company sites)
2. Only return jobs posted within the last 30 days
3. Match based on skills, experience level, and location
4. Calculate match score (0-100%) based on profile alignment
5. Prioritize remote-friendly positions if no location specified

For each job provide:
- company: Real company name
- job_title: Exact title from posting
- location: City/State or "Remote"
- salary: Range if listed, else "Not specified"
- description: 2-3 sentence summary
- application_link: Real URL (Indeed, LinkedIn, company site)
- match_score: 0-100% based on skill and experience fit
- key_match_reasons: Array of 2-3 reasons why this matches (e.g., "React experience", "Remote-friendly")

Return 5-8 best matching opportunities.`,
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
                  match_score: { type: "number" },
                  key_match_reasons: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setMatchedJobs(result.jobs || []);
      toast.success(`🎯 Found ${result.jobs?.length || 0} Jobs Matched to Your Profile`, {
        description: 'Based on your skills and experience',
        duration: 4000
      });
    }
  });

  if (!profile) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">Create your profile to see auto-matched jobs</p>
            <Button variant="outline" asChild>
              <a href="/Profile">Set Up Profile</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Jobs Matched to Your Profile
          </CardTitle>
          <Button
            size="sm"
            onClick={() => findJobsMutation.mutate()}
            disabled={findJobsMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {findJobsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Jobs
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {matchedJobs.length === 0 && !findJobsMutation.isPending && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Click "Find Jobs" to discover opportunities matched to your profile
          </div>
        )}

        {findJobsMutation.isPending && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-4 border border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {matchedJobs.length > 0 && !findJobsMutation.isPending && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {matchedJobs.map((job, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">{job.job_title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{job.company}</p>
                  </div>
                  <Badge
                    className={
                      job.match_score >= 80
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : job.match_score >= 60
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }
                  >
                    {job.match_score}% Match
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {job.salary}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{job.description}</p>

                {job.key_match_reasons && job.key_match_reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.key_match_reasons.map((reason, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full"
                >
                  <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Application
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}