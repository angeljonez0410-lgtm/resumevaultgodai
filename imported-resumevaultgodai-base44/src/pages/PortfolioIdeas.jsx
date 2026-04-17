import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Lightbulb, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import PremiumGate from '../components/premium/PremiumGate';

const difficultyColor = {
  Beginner: 'bg-green-50 text-green-700 border-green-200',
  Intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
  Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
};

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex gap-3 items-start pr-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-50 text-amber-600 text-sm font-bold flex items-center justify-center mt-0.5">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-1">{project.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{project.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.difficulty && (
                  <Badge variant="outline" className={`text-[10px] font-medium ${difficultyColor[project.difficulty] || 'bg-slate-50 text-slate-600'}`}>
                    {project.difficulty}
                  </Badge>
                )}
                {(project.tech_stack || []).slice(0, 3).map(t => (
                  <Badge key={t} variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                {project.problem_solved && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Problem It Solves</p>
                    <p className="text-sm text-slate-700">{project.problem_solved}</p>
                  </div>
                )}
                {project.key_features && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Key Features to Build</p>
                    <ul className="text-sm text-slate-700 list-disc ml-4 space-y-1">
                      {project.key_features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
                {project.why_impressive && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-1">⭐ Why This Impresses Recruiters</p>
                    <p className="text-xs text-amber-700">{project.why_impressive}</p>
                  </div>
                )}
                {project.estimated_time && (
                  <p className="text-xs text-slate-400">⏱ Estimated Time: {project.estimated_time}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function PortfolioIdeasContent() {
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState([]);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });
  const profile = profiles[0];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 6 impressive portfolio project ideas for a job seeker.

Target Role: ${jobTitle}
Industry: ${industry || 'General Tech'}
Skill Level: ${skillLevel}
Current Skills: ${skills || profile?.skills || 'Not specified'}

Generate portfolio projects that will impress hiring managers for this specific role.
Each project should be realistic, completable, and highly relevant to what recruiters look for.`,
        response_json_schema: {
          type: "object",
          properties: {
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  problem_solved: { type: "string" },
                  key_features: { type: "array", items: { type: "string" } },
                  tech_stack: { type: "array", items: { type: "string" } },
                  difficulty: { type: "string" },
                  estimated_time: { type: "string" },
                  why_impressive: { type: "string" }
                }
              }
            }
          }
        }
      });
      setProjects(result.projects || []);
    }
  });

  return (
    <div>
      <PageHeader
        title="Portfolio Project Ideas"
        subtitle="Get AI-curated project ideas that will impress hiring managers for your target role"
        icon={Lightbulb}
      />
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold text-amber-700">
          <Zap className="w-3 h-3" /> Premium Feature
        </span>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-slate-600">Target Role</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Full Stack Developer" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Industry (optional)</Label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech, Healthcare, E-commerce" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (0–1 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (2–4 years)</SelectItem>
                <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-slate-600">Your Skills</Label>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={profile?.skills ? profile.skills.slice(0, 40) + '...' : 'e.g. React, Node.js, Python'} className="mt-1" />
          </div>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!jobTitle.trim() || generateMutation.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Portfolio Ideas
        </Button>
      </Card>

      {generateMutation.isPending && <LoadingState message="Generating portfolio project ideas..." />}

      {projects.length > 0 && !generateMutation.isPending && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 font-medium mb-2">Click any project to see the full details and implementation guide.</p>
          {projects.map((p, i) => <ProjectCard key={i} project={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function PortfolioIdeas() {
  return (
    <PremiumGate featureName="Portfolio Project Ideas" description="Get AI-curated portfolio project ideas tailored to your target role that will impress hiring managers.">
      <PortfolioIdeasContent />
    </PremiumGate>
  );
}