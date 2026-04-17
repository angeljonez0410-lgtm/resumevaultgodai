import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, Trash2, FileText, Calendar, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui-custom/PageHeader';
import { useSimpleMode } from '../components/settings/SimpleMode';

const statusColors = {
  saved: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-100 text-blue-700',
  interviewing: 'bg-amber-100 text-amber-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

export default function ApplicationTracker() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ job_title: '', company_name: '', status: 'saved', notes: '' });
  const queryClient = useQueryClient();
  const { isSimpleMode } = useSimpleMode();

  const { data: applications = [] } = useQuery({
    queryKey: ['job-applications'],
    queryFn: () => base44.entities.JobApplication.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JobApplication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application added!');
      setForm({ job_title: '', company_name: '', status: 'saved', notes: '' });
      setOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JobApplication.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Status updated');
    }
  });

  const btnClass = isSimpleMode ? "h-16 text-xl px-8" : "";
  const textClass = isSimpleMode ? "text-xl" : "text-base";
  const cardPadding = isSimpleMode ? "p-8" : "p-6";

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offers: applications.filter(a => a.status === 'offer').length,
  };

  return (
    <div>
      <PageHeader
        title="Application Tracker"
        subtitle="Track your job applications in one place"
        icon={Briefcase}
      />

      {/* Stats */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isSimpleMode ? 'mb-8' : 'mb-6'}`}>
        <Card className={cardPadding}>
          <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-500`}>Total</p>
          <p className={`${isSimpleMode ? 'text-4xl' : 'text-2xl'} font-bold text-slate-900`}>{stats.total}</p>
        </Card>
        <Card className={cardPadding}>
          <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-500`}>Applied</p>
          <p className={`${isSimpleMode ? 'text-4xl' : 'text-2xl'} font-bold text-blue-600`}>{stats.applied}</p>
        </Card>
        <Card className={cardPadding}>
          <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-500`}>Interviewing</p>
          <p className={`${isSimpleMode ? 'text-4xl' : 'text-2xl'} font-bold text-amber-600`}>{stats.interviewing}</p>
        </Card>
        <Card className={cardPadding}>
          <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-500`}>Offers</p>
          <p className={`${isSimpleMode ? 'text-4xl' : 'text-2xl'} font-bold text-green-600`}>{stats.offers}</p>
        </Card>
      </div>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={`${btnClass} bg-slate-900 hover:bg-slate-800 mb-6`}>
            <Plus className={isSimpleMode ? "w-6 h-6 mr-3" : "w-4 h-4 mr-2"} />
            Add Application
          </Button>
        </DialogTrigger>
        <DialogContent className={isSimpleMode ? "max-w-3xl" : ""}>
          <DialogHeader>
            <DialogTitle className={isSimpleMode ? "text-2xl" : ""}>New Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className={textClass}>Job Title</Label>
              <Input
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                placeholder="Senior Product Manager"
                className={isSimpleMode ? "h-16 text-xl mt-2" : "mt-1"}
              />
            </div>
            <div>
              <Label className={textClass}>Company</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Google"
                className={isSimpleMode ? "h-16 text-xl mt-2" : "mt-1"}
              />
            </div>
            <div>
              <Label className={textClass}>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className={isSimpleMode ? "h-16 text-xl mt-2" : "mt-1"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.job_title || !form.company_name}
              className={btnClass}
            >
              Add Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className={`${cardPadding} text-center`}>
            <p className={`${textClass} text-slate-400`}>No applications yet. Add your first one above!</p>
          </Card>
        ) : (
          applications.map((app) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cardPadding}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className={`${isSimpleMode ? 'text-2xl' : 'text-lg'} font-semibold text-slate-900`}>
                          {app.job_title}
                        </h3>
                        <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-500`}>{app.company_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Select
                        value={app.status}
                        onValueChange={(v) => updateMutation.mutate({ id: app.id, data: { status: v } })}
                      >
                        <SelectTrigger className={`w-40 ${isSimpleMode ? 'h-12 text-lg' : 'h-8 text-sm'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saved">Saved</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="interviewing">Interviewing</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={`${statusColors[app.status]} ${isSimpleMode ? 'px-4 py-2 text-base' : ''}`}>
                        {app.status}
                      </Badge>
                      {app.created_date && (
                        <div className={`flex items-center gap-1.5 ${isSimpleMode ? 'text-lg' : 'text-xs'} text-slate-400`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(app.created_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size={isSimpleMode ? "lg" : "icon"}
                    onClick={() => deleteMutation.mutate(app.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className={isSimpleMode ? "w-6 h-6" : "w-4 h-4"} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}