import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function JobForm({ onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_description_text: '',
    application_status: 'Applied',
    match_score: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.job_title.trim()) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Company Name *</Label>
          <Input
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="e.g. Google"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Job Title *</Label>
          <Input
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Job Description</Label>
        <Textarea
          value={formData.job_description_text}
          onChange={(e) => setFormData({ ...formData, job_description_text: e.target.value })}
          placeholder="Paste the job description..."
          className="mt-1.5 min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Application Status</Label>
          <Select value={formData.application_status} onValueChange={(val) => setFormData({ ...formData, application_status: val })}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Match Score (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.match_score}
            onChange={(e) => setFormData({ ...formData, match_score: parseInt(e.target.value) || 0 })}
            placeholder="0-100"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? 'Saving...' : 'Add Job'}
        </Button>
      </div>
    </form>
  );
}