import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIBadge({ position = "top-right", size = "sm" }) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const positionClasses = {
    "top-right": "top-2 right-2",
    "top-left": "top-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "bottom-left": "bottom-2 left-2",
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-10`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI Generated</span>
      </div>
    </div>
  );
}