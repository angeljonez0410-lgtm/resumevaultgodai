import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileAISuggestions({ profile, formData, onApplySuggestion }) {
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const missingFields = [
    !formData.professional_summary && 'Professional Summary',
    !formData.skills && 'Skills',
    formData.experiences.length === 0 && 'Work Experience',
  ].filter(Boolean);

  if (missingFields.length === 0) return null;

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this professional profile, provide brief AI suggestions to complete missing sections:

Name: ${formData.full_name}
Current Skills: ${formData.skills || '(empty)'}
Education: ${JSON.stringify(formData.education)}
Experience: ${formData.experiences.length > 0 ? 'Has experience' : '(empty)'}
Summary: ${formData.professional_summary || '(empty)'}

Provide 2-3 specific, actionable suggestions to improve this profile. Format as bullet points.`,
        model: 'gpt_5_mini'
      });
      setSuggestions(result);
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <button
        onClick={() => {
          if (!expanded) handleGenerateSuggestions();
          setExpanded(!expanded);
        }}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-900">AI Profile Suggestions</span>
          <span className="text-xs text-blue-700">Missing {missingFields.length} field(s)</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          {loading ? (
            <p className="text-sm text-blue-700">Generating suggestions...</p>
          ) : suggestions ? (
            <p className="text-sm text-blue-900 whitespace-pre-wrap">{suggestions}</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}