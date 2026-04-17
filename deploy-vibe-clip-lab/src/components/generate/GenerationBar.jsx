import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PROMPT_COMMANDS = {
  image: [
    'Photorealistic ResumeVaultGod career coach at a modern desk, laptop open to an AI resume dashboard, confident job seeker energy, natural light, cinematic depth of field',
    'Realistic job seeker celebrating an interview invite after using ResumeVaultGod.com, phone in hand, clean home office, professional lighting',
    'Editorial image of an AI resume vault command center, ATS score, cover letter, interview prep, and application tracker on screens, realistic workspace',
  ],
  video: [
    'Realistic 10-second ad: stressed job seeker uploads resume to ResumeVaultGod.com, gets an ATS-ready upgrade, then smiles at an interview invite',
    'Cinematic short video: AI career coach explains how ResumeVaultGod.com turns one job description into resume bullets, cover letter, and interview plan',
    'Social media reel: before and after job hunt workflow, messy applications transform into organized ResumeVaultGod tracker and confident next steps',
  ],
};

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
      const realismPrompt = type === 'image'
        ? `Photorealistic editorial image, natural human proportions, realistic skin texture, professional lighting, sharp focus, no distorted hands, no extra fingers, no text artifacts. Scene: ${prompt.trim()}`
        : `Realistic cinematic short video, natural motion, stable camera, professional lighting, detailed environment, believable human movement, no warping, no text artifacts. Scene: ${prompt.trim()}`;
      
      if (type === 'image') {
        setProgress(30);
        response = await invokeGeneration('generateImage', '/api/generate-image', {
          prompt: realismPrompt,
          characterDescription: characterDescription,
        });
        setProgress(90);
      } else if (type === 'video') {
        setProgress(20);
        response = await invokeGeneration('generateVideo', '/api/generate-video', {
          prompt: realismPrompt,
          characterDescription: characterDescription,
          duration: '10s',
        });
        setProgress(90);
      }

      const data = response?.data || response || {};
      const imageUrl = data.imageUrl || data.url || (Array.isArray(data.output) ? data.output[0] : data.output);
      const videoUrl = data.videoUrl || data.url || data.output;
      const normalized = {
        ...data,
        imageUrl,
        videoUrl,
        duration: data.duration || '10s',
      };

      if (data.success && (type === 'image' ? imageUrl : videoUrl)) {
        setProgress(100);
        onGenerated(normalized);
        setPrompt('');
        setTimeout(() => setProgress(0), 1500);
        toast.success(`${type === 'image' ? 'Image' : 'Video'} generated successfully!`);
      } else {
        throw new Error(data.error || `${type === 'image' ? 'Image' : 'Video'} generation did not return a usable file`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      const message = error?.message || '';
      const isMissingFunction = message.includes('404') || /not found/i.test(message);
      const isMissingSecret = /token|key|configured/i.test(message);
      toast.error(
        isMissingFunction
          ? `Generation function is not published in Base44 yet. Publish ${type === 'image' ? 'generateImage' : 'generateVideo'} and retry.`
          : isMissingSecret
            ? 'Replicate token is missing. Add REPLICATE_API_TOKEN in Vercel or Base44 secrets and retry.'
            : message || 'Generation failed. Please try again.'
      );
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
            ? "e.g. realistic founder holding a laptop, modern office, natural light..." 
            : "e.g. realistic job seeker opening ResumeVaultGod.com, confident smile, cinematic motion..."}
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

      <div className="mt-3 flex flex-wrap gap-2">
        {PROMPT_COMMANDS[type].map((command) => (
          <button
            key={command}
            type="button"
            onClick={() => setPrompt(command)}
            disabled={generating || disabled}
            className="rounded-md border border-white/10 bg-slate-950/60 px-3 py-1.5 text-left text-xs text-slate-300 hover:border-violet-500/30 hover:text-white transition-colors"
          >
            {command}
          </button>
        ))}
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

async function invokeGeneration(functionName, fallbackUrl, payload) {
  try {
    return await base44.functions.invoke(functionName, payload);
  } catch (error) {
    const message = error?.message || '';
    if (!message.includes('404') && !/not found/i.test(message)) {
      throw error;
    }
  }

  const response = await fetch(fallbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `${functionName} failed`);
  }
  return { data };
}
