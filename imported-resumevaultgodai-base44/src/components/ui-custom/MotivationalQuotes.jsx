import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const QUOTES = [
  "Don't be \"another resume site.\" Be the site that helps people \"God-Mode\" their job hunt.",
  "Beat the ATS in 60 seconds.",
  "Your resume isn't just a document—it's your first conversation with a recruiter.",
  "The right words in the right places can open doors.",
  "In God-Mode, you don't apply to jobs. You dominate them.",
  "Every resume is a story. Make yours unforgettable.",
  "Stop applying like everyone else. Start applying like you own the room.",
  "The ATS doesn't see your potential. We help you show it.",
  "Your next job opportunity is 60 seconds away.",
  "Excellence isn't an act, it's a habit. Build the habit with Resumevault.",
];

export function MotivationalQuote({ variant = 'small' }) {
  const [quote] = React.useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 border border-amber-400/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-white text-lg md:text-xl font-semibold leading-relaxed italic">"{quote}"</p>
            <p className="text-amber-400 text-xs font-semibold mt-3 uppercase tracking-wide">Resumevault • God AI</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <p className="text-slate-600 text-sm italic flex items-start gap-2 my-4 pl-4 border-l-2 border-amber-400">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        "{quote}"
      </p>
    );
  }

  // small variant
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-3 flex gap-2">
      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-amber-900 text-xs italic">{quote}</p>
    </div>
  );
}

export default MotivationalQuote;