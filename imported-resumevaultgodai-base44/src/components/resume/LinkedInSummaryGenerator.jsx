import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Zap, Loader2, CheckCircle, Zap as ZapIcon } from 'lucide-react';
import { toast } from 'sonner';
import StreamedAIResponse from '@/components/ai/StreamedAIResponse';

export default function LinkedInSummaryGenerator({ resumeText, onSummaryGenerated }) {
  const [targetRole, setTargetRole] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 95));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!resumeText?.trim()) {
      toast.error('Please provide resume text');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setFromCache(false);

    try {
      const response = await base44.functions.invoke('generateLinkedInSummary', {
        resumeText,
        targetRole: targetRole || null,
        useCache: true
      });

      setSummary(response.data.summary);
      setFromCache(response.data.fromCache || false);
      setProcessingTime(response.data.processingTimeMs || 0);
      setProgress(100);

      if (onSummaryGenerated) {
        onSummaryGenerated(response.data.summary);
      }

      toast.success(
        response.data.fromCache 
          ? 'LinkedIn summary loaded from cache (instant)!' 
          : `LinkedIn summary generated in ${Math.round(response.data.processingTimeMs / 1000)}s!`
      );
    } catch (error) {
      toast.error('Failed to generate summary');
      console.error(error);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          LinkedIn Summary Generator
        </CardTitle>
        <CardDescription>AI-optimized summary for your LinkedIn profile</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Target Role (Optional)</label>
          <Input
            placeholder="e.g. Senior Software Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="mt-2"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !resumeText?.trim()}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Summary
            </>
          )}
        </Button>

        {isLoading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {progress < 50 ? 'Analyzing resume...' : progress < 90 ? 'Generating summary...' : 'Almost done...'}
            </p>
          </div>
        )}

        {summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                {fromCache ? 'Loaded from cache (instant)' : `Generated in ${Math.round(processingTime / 1000)}s`}
              </div>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
                {fromCache ? 'Cached' : 'Fresh'}
              </span>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-amber-50 p-4 rounded-lg border border-amber-200">
              <StreamedAIResponse text={summary} isStreaming={false} speed={8} />
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}