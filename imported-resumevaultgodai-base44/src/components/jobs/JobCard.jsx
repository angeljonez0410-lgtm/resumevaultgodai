import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Zap, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  'Applied': 'bg-blue-100 text-blue-800',
  'Interview': 'bg-amber-100 text-amber-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export default function JobCard({ job, isOptimistic }) {
  const [showDescription, setShowDescription] = useState(false);
  const queryClient = useQueryClient();

  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Job.delete(job.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted');
    },
  });

  const handleGenerate = async () => {
    // TODO: Trigger generation workflow
    toast.info('Resume generation coming soon');
  };

  return (
    <Card className={`transition-all ${isOptimistic ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              {job.job_title}
            </CardTitle>
            <CardDescription>{job.company_name}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {job.match_score > 0 && (
              <Badge variant="outline" className="bg-green-50">
                <Zap className="w-3 h-3 mr-1" />
                {job.match_score}%
              </Badge>
            )}
            <Badge className={statusColors[job.application_status]}>
              {job.application_status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {job.job_description_text && (
          <div>
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showDescription ? '▼' : '▶'} Job Description
            </button>
            {showDescription && (
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {job.job_description_text}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isOptimistic}
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Resume
          </Button>
          <Button
            onClick={() => deleteJobMutation.mutate()}
            variant="outline"
            size="sm"
            disabled={deleteJobMutation.isPending || isOptimistic}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isOptimistic && (
            <span className="text-xs text-gray-500 flex items-center ml-auto">Saving...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}