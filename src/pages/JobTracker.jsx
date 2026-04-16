import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/ui-custom/PageHeader';
import JobForm from '@/components/jobs/JobForm';
import JobCard from '@/components/jobs/JobCard';

export default function JobTracker() {
  const [showForm, setShowForm] = useState(false);
  const [optimisticJobs, setOptimisticJobs] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ created_by: user?.email }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData) => {
      return await base44.entities.Job.create(jobData);
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setOptimisticJobs(prev => prev.filter(j => j.id !== `temp-${Date.now()}`));
      setShowForm(false);
      toast.success('Job added successfully');
    },
    onError: () => {
      setOptimisticJobs(prev => prev.filter(j => !j.id.startsWith('temp-')));
      toast.error('Failed to save job');
    }
  });

  const handleAddJob = async (jobData) => {
    // Optimistic update - show card immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticJob = {
      id: tempId,
      ...jobData,
      created_date: new Date().toISOString(),
      isOptimistic: true
    };
    setOptimisticJobs(prev => [optimisticJob, ...prev]);
    
    // Then send to server
    createJobMutation.mutate(jobData);
  };

  const allJobs = [...optimisticJobs, ...jobs].reduce((acc, job) => {
    if (!acc.find(j => j.id === job.id)) {
      acc.push(job);
    }
    return acc;
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Job Tracker"
        subtitle="Track applications, match scores, and generate tailored materials"
        icon={Briefcase}
      />

      <div className="mb-8 flex gap-3">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Job
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
          <JobForm 
            onSubmit={handleAddJob}
            onCancel={() => setShowForm(false)}
            isLoading={createJobMutation.isPending}
          />
        </Card>
      )}

      {isLoading && !optimisticJobs.length ? (
        <div className="text-center py-12 text-gray-500">Loading jobs...</div>
      ) : allJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No jobs tracked yet. Add one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allJobs.map(job => (
            <JobCard key={job.id} job={job} isOptimistic={job.isOptimistic} />
          ))}
        </div>
      )}
    </div>
  );
}