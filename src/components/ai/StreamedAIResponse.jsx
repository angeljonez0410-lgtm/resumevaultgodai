import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Streamed AI Response Component
 * Shows AI text as it arrives, character-by-character for feel of instant feedback
 */
export default function StreamedAIResponse({ text, isStreaming = false, speed = 5 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100 / speed); // Adjust speed (higher = faster)

      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex, speed]);

  return (
    <div className="space-y-2">
      <div className="prose prose-sm max-w-none">
        {displayedText}
        {isStreaming && <span className="animate-pulse">▌</span>}
      </div>
      {isStreaming && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  );
}