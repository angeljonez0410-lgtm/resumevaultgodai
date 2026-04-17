import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2, Download, Eye, Calendar, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { format } from 'date-fns';
import PageHeader from '../components/ui-custom/PageHeader';
import jsPDF from 'jspdf';

export default function ResumeLibrary() {
  const [selectedResume, setSelectedResume] = useState(null);
  const queryClient = useQueryClient();

  const { data: resumes = [] } = useQuery({
    queryKey: ['saved-resumes'],
    queryFn: () => base44.entities.SavedResume.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedResume.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resumes'] });
      toast.success('Resume deleted');
    }
  });

  const downloadPDF = (resume) => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(resume.content, 180);
    doc.text(lines, 15, 15);
    doc.save(`${resume.title.replace(/\s+/g, '_')}.pdf`);
    toast.success('Downloaded as PDF');
  };

  const downloadWord = (resume) => {
    const blob = new Blob([resume.content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.replace(/\s+/g, '_')}.doc`;
    a.click();
    toast.success('Downloaded as Word');
  };

  const typeColors = {
    tailored: 'bg-blue-100 text-blue-700',
    general: 'bg-slate-100 text-slate-700',
    executive: 'bg-purple-100 text-purple-700'
  };

  return (
    <div>
      <PageHeader
        title="Resume Library"
        subtitle="Access all your saved resumes in one place"
        icon={FileText}
      />

      <div className="grid grid-cols-1 gap-4">
        {resumes.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No saved resumes yet. Generate and save resumes to see them here.</p>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id} className="p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{resume.title}</h3>
                      {resume.job_title && (
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          {resume.job_title} {resume.company && `at ${resume.company}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={typeColors[resume.type] || typeColors.general}>
                      {resume.type}
                    </Badge>
                    {resume.ats_score && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {resume.ats_score}% ATS Match
                      </Badge>
                    )}
                    {resume.created_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(resume.created_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedResume(resume)}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(resume)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(resume.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedResume && (
        <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedResume.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-slate-50 rounded-lg p-6 whitespace-pre-wrap text-sm font-mono">
                {selectedResume.content}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => downloadPDF(selectedResume)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => downloadWord(selectedResume)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Word
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}