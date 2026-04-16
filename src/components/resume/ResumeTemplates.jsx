import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Sparkles, Check, Briefcase, Code, Star, GraduationCap, Palette, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import LoadingState from '../ui-custom/LoadingState';
import ResumeOutputSplit from './ResumeOutputSplit';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Professional',
    icon: Briefcase,
    color: 'border-slate-400 bg-slate-50',
    activeColor: 'border-slate-800 bg-slate-100 ring-2 ring-slate-800',
    badge: null,
    description: 'Traditional format ideal for corporate, finance, and law roles.',
    style: 'Clean, traditional layout with bold section headers, conservative fonts, and a structured chronological format. Use standard sections: Summary, Experience, Education, Skills. Professional and formal tone throughout.',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    icon: Star,
    color: 'border-blue-300 bg-blue-50',
    activeColor: 'border-blue-600 bg-blue-100 ring-2 ring-blue-600',
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'Clean, sleek layout popular in startups and tech companies.',
    style: 'Modern, clean layout with a single-column design, minimal borders, and generous whitespace. Lead with a punchy professional summary. Use concise bullet points with metrics. Minimalist headers. Emphasize impact and results over duties.',
  },
  {
    id: 'tech',
    name: 'Tech / Engineering',
    icon: Code,
    color: 'border-green-300 bg-green-50',
    activeColor: 'border-green-600 bg-green-100 ring-2 ring-green-600',
    badge: null,
    description: 'Optimized for software, data, and engineering roles.',
    style: 'Technical resume format. Add a prominent "Technical Skills" section early, listing programming languages, frameworks, tools, and platforms. Include a "Projects" section with GitHub links if available. Use quantified achievements (e.g. "reduced latency by 40%"). ATS-optimized with technical keywords.',
  },
  {
    id: 'executive',
    name: 'Executive / Senior',
    icon: Crown,
    color: 'border-amber-300 bg-amber-50',
    activeColor: 'border-amber-600 bg-amber-100 ring-2 ring-amber-600',
    badge: 'Premium Style',
    badgeColor: 'bg-amber-100 text-amber-700',
    description: 'High-impact format for C-suite, VP, and Director-level roles.',
    style: 'Executive-level resume with a powerful executive summary (3-4 sentences highlighting career achievements and leadership). Include a "Core Competencies" grid. Focus on P&L responsibility, team leadership, strategic initiatives, and board-level impact. Use strong leadership action verbs. 2-page format allowed.',
  },
  {
    id: 'creative',
    name: 'Creative / Marketing',
    icon: Palette,
    color: 'border-purple-300 bg-purple-50',
    activeColor: 'border-purple-600 bg-purple-100 ring-2 ring-purple-600',
    badge: null,
    description: 'Expressive format for marketing, design, and creative roles.',
    style: 'Creative but ATS-safe resume. Include a strong personal brand statement. Highlight campaigns, creative projects, and measurable marketing results (e.g. "grew social following by 200%"). Add portfolio URL prominently. Use engaging language while maintaining ATS compatibility.',
  },
  {
    id: 'entry',
    name: 'Entry Level / Graduate',
    icon: GraduationCap,
    color: 'border-teal-300 bg-teal-50',
    activeColor: 'border-teal-600 bg-teal-100 ring-2 ring-teal-600',
    badge: null,
    description: 'Ideal for new graduates and career starters.',
    style: 'Entry-level resume format. Lead with Education section. Highlight internships, coursework, academic projects, volunteering, and extracurriculars. Emphasize transferable skills and eagerness to learn. Include GPA if above 3.0. Keep to 1 page. Focus on potential and soft skills alongside technical abilities.',
  },
];

export default function ResumeTemplates() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedResume, setGeneratedResume] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });
  const profile = profiles[0];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const tmpl = TEMPLATES.find(t => t.id === selectedTemplate);
      if (!tmpl) return;

      const profileText = profile ? `
Name: ${profile.full_name || ''}
Email: ${profile.email_address || ''}
Phone: ${profile.phone || ''}
Location: ${profile.location || ''}
Summary: ${profile.professional_summary || ''}
Skills: ${profile.skills || ''}
Experience: ${JSON.stringify(profile.experiences || [])}
Education: ${JSON.stringify(profile.education || [])}
Certifications: ${profile.certifications || ''}
      `.trim() : 'No profile provided — generate a realistic template with placeholder sections.';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert resume writer. Generate a complete, ATS-optimized resume using the following template style.

TEMPLATE STYLE: ${tmpl.name}
STYLE INSTRUCTIONS: ${tmpl.style}

USER PROFILE DATA:
${profileText}

INSTRUCTIONS:
1. Apply the template style strictly
2. Make it ATS-friendly with proper section headings
3. Use strong action verbs and quantified achievements
4. Output a complete, ready-to-use resume in clean markdown format
5. End with: ATS Match Score estimate, Matched Keywords, and 3 Improvement Tips

OUTPUT a complete professional resume now:`,
        model: 'claude_sonnet_4_6'
      });

      setGeneratedResume(result);
    },
    onError: () => toast.error('Failed to generate resume. Please try again.'),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const tmpl = TEMPLATES.find(t => t.id === selectedTemplate);
      await base44.entities.SavedResume.create({
        title: `${tmpl?.name || 'Template'} Resume`,
        content: generatedResume,
        type: 'general',
      });
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, { saved_resume: generatedResume });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resumes'] });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      toast.success('✅ Resume saved to library!');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-1">Choose a Resume Template</h3>
        <p className="text-sm text-slate-500 mb-4">Select a style that fits your target role. AI will generate a complete resume using your profile data.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isActive = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => { setSelectedTemplate(tmpl.id); setGeneratedResume(''); }}
                className={cn(
                  'text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                  isActive ? tmpl.activeColor : tmpl.color + ' hover:border-opacity-70'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-5 h-5', isActive ? 'text-slate-900' : 'text-slate-600')} />
                    <span className="font-semibold text-sm text-slate-800">{tmpl.name}</span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{tmpl.description}</p>
                {tmpl.badge && (
                  <span className={cn('inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full', tmpl.badgeColor)}>
                    {tmpl.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTemplate && (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              generateMutation.mutate();
              toast.loading('🎨 Generating your resume...', { duration: 6000 });
            }}
            disabled={generateMutation.isPending}
            className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate {TEMPLATES.find(t => t.id === selectedTemplate)?.name} Resume
          </Button>
          <span className="text-xs text-slate-400">✨ Uses premium AI</span>
        </div>
      )}

      {generateMutation.isPending && <LoadingState message="Crafting your resume with the selected template..." />}

      {generatedResume && !generateMutation.isPending && (
        <div className="space-y-4">
          <ResumeOutputSplit
            title={`${TEMPLATES.find(t => t.id === selectedTemplate)?.name} Resume`}
            content={generatedResume}
            icon={FileText}
            filename={`resume_${selectedTemplate}`}
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {savedMsg ? <Check className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4" />}
              {savedMsg ? 'Saved!' : 'Save to Library'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}