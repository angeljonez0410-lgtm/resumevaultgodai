import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Globe, Palette, Code } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from '../components/ui-custom/PageHeader';
import LoadingState from '../components/ui-custom/LoadingState';
import { toast } from 'sonner';

export default function PortfolioBuilder() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [projects, setProjects] = useState('');
  const [htmlCode, setHtmlCode] = useState('');

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a complete, professional portfolio website HTML code for:

Name: ${name}
Role: ${role}
Projects: ${projects}

Generate a single-page, responsive HTML portfolio with:
- Modern design
- Hero section
- Projects showcase
- About section
- Contact form
- Mobile responsive CSS
- Professional color scheme

Return ONLY the complete HTML code, ready to save as index.html`,
        model: 'claude_sonnet_4_6'
      });
      setHtmlCode(result);
      toast.success('Portfolio generated!');
    }
  });

  const downloadHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    a.click();
    toast.success('Downloaded portfolio.html');
  };

  return (
    <div>
      <PageHeader
        title="Portfolio Website Pro"
        subtitle="AI-designed professional portfolio"
        icon={Globe}
      />

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label>Your Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <Label>Your Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Full Stack Developer" />
          </div>
          <div>
            <Label>Projects (one per line)</Label>
            <Textarea value={projects} onChange={(e) => setProjects(e.target.value)} placeholder="E-commerce Platform&#10;Mobile App&#10;SaaS Dashboard" className="h-32" />
          </div>
          <Button onClick={() => generateMutation.mutate()} disabled={!name || generateMutation.isPending}>
            <Palette className="w-4 h-4 mr-2" />
            Generate Portfolio Website
          </Button>
        </div>
      </Card>

      {generateMutation.isPending && <LoadingState message="Designing your portfolio..." />}

      {htmlCode && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Your Portfolio Code</h3>
            <Button onClick={downloadHTML}>
              <Code className="w-4 h-4 mr-2" />
              Download HTML
            </Button>
          </div>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96">
            <pre>{htmlCode}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}