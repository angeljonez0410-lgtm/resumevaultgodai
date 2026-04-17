import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GenerationBar({ type = 'image', onGenerated, disabled = false, characterDescription = '' }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setGenerating(true);
    setProgress(10);

    try {
      let response;
      
      if (type === 'image') {
        setProgress(30);
        response = await base44.functions.invoke('generateImage', {
          prompt: prompt.trim(),
          characterDescription: characterDescription,
        });
        setProgress(90);
      } else if (type === 'video') {
        setProgress(20);
        response = await base44.functions.invoke('generateVideo', {
          prompt: prompt.trim(),
          characterDescription: characterDescription,
          duration: '10s',
        });
        setProgress(90);
      }

      if (response.data.success) {
        setProgress(100);
        onGenerated(response.data);
        setPrompt('');
        setTimeout(() => setProgress(0), 1500);
        toast.success(`${type === 'image' ? 'Image' : 'Video'} generated successfully!`);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Generation failed. Please try again.');
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-slate-900/50 to-slate-900/30 border border-white/5 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">
          Generate {type === 'image' ? 'Image' : 'Video'} with AI
        </h3>
      </div>

      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !generating && handleGenerate()}
          placeholder={type === 'image' 
            ? "e.g. wearing a red dress on a beach at sunset..." 
            : "e.g. walking down a city street, waving at camera..."}
          disabled={generating || disabled}
          className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600"
        />
        <Button
          onClick={handleGenerate}
          disabled={generating || disabled || !prompt.trim()}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2 whitespace-nowrap"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">
                {progress < 50 ? 'Preparing...' : progress < 90 ? 'Processing...' : 'Finalizing...'}
              </span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </>
          )}
        </Button>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                />
              </div>
              <span className="text-xs text-slate-400 min-w-max">{progress}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {progress < 20 ? '⏳ Initializing generation...' 
                : progress < 50 ? '🎨 Creating AI model...'
                : progress < 80 ? '✨ Refining details...'
                : '🎬 Finalizing output...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}