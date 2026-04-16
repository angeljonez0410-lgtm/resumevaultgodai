import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, CheckCircle2, Download, Copy, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

export default function ApplicationPackage({ packageData, job, onApply }) {
  const handleCopyResume = () => {
    navigator.clipboard.writeText(packageData.resume);
    toast.success("Resume copied to clipboard");
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(packageData.cover_letter);
    toast.success("Cover letter copied to clipboard");
  };

  const handleDownloadChecklist = () => {
    const text = packageData.checklist.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application_checklist_${job.company}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Checklist downloaded");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-green-900">Application Package Ready!</h3>
            <p className="text-sm text-green-700">Your tailored application materials are prepared</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{packageData.ats_score}%</div>
              <div className="text-xs text-slate-600">ATS Match Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{packageData.key_talking_points?.length || 0}</div>
              <div className="text-xs text-slate-600">Interview Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{packageData.checklist?.length || 0}</div>
              <div className="text-xs text-slate-600">Checklist Items</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={onApply} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Now
            </Button>
            <Button variant="outline" onClick={handleCopyResume}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Resume
            </Button>
            <Button variant="outline" onClick={handleCopyCoverLetter}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Cover Letter
            </Button>
            <Button variant="outline" onClick={handleDownloadChecklist}>
              <Download className="w-4 h-4 mr-2" />
              Checklist
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Tailored Resume
            </h4>
            <Badge className="bg-green-100 text-green-800">ATS Optimized</Badge>
          </div>
          <div className="prose prose-sm max-w-none max-h-[400px] overflow-y-auto bg-slate-50 rounded-lg p-4 border text-xs">
            <ReactMarkdown>{packageData.resume}</ReactMarkdown>
          </div>
        </Card>

        {/* Cover Letter */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Cover Letter
            </h4>
            <Badge className="bg-indigo-100 text-indigo-800">Personalized</Badge>
          </div>
          <div className="prose prose-sm max-w-none max-h-[400px] overflow-y-auto bg-slate-50 rounded-lg p-4 border text-xs">
            <ReactMarkdown>{packageData.cover_letter}</ReactMarkdown>
          </div>
        </Card>
      </div>

      {/* Interview Prep */}
      {packageData.key_talking_points && (
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <h4 className="font-semibold mb-3 text-purple-900">Key Interview Talking Points</h4>
          <ul className="space-y-2">
            {packageData.key_talking_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Checklist */}
      {packageData.checklist && (
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <h4 className="font-semibold mb-3 text-amber-900">Pre-Submission Checklist</h4>
          <ul className="space-y-2">
            {packageData.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <div className="w-4 h-4 border-2 border-amber-600 rounded mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}