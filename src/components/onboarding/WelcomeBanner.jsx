import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('welcomeBannerDismissed') === 'true';
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const handleDismiss = () => {
    localStorage.setItem('welcomeBannerDismissed', 'true');
    setDismissed(true);
  };

  if (dismissed || !user) return null;

  const firstName = user.full_name?.split(' ')[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-lg"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
      
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome, {firstName}! 👋
            </h2>
            <p className="text-white/80 text-sm">Let's get you started with ApplyAI</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
            Quick Start Guide
          </h3>
          <ul className="space-y-2 text-sm text-white/90 mb-4">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-300" />
              <span><strong>Set up your profile</strong> — Add your work experience, skills, and education</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-300" />
              <span><strong>Analyze a job</strong> — Paste any job description to extract ATS keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-300" />
              <span><strong>Generate documents</strong> — Create tailored resumes, cover letters, and follow-up emails</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-300" />
              <span><strong>Track applications</strong> — Keep everything organized in one place</span>
            </li>
          </ul>
          <p className="text-xs text-white/70 italic">
            💡 Tip: Start by analyzing a real job posting you're interested in — it'll show you exactly what keywords to include!
          </p>
        </div>
      </div>
    </motion.div>
  );
}