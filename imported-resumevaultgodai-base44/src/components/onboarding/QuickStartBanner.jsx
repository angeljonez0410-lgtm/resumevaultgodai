import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickStartBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('quickstart_dismissed');
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('quickstart_dismissed', 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-amber-300" />
                <h3 className="text-xl font-bold">Welcome to ApplyAI! 🎉</h3>
              </div>
              <p className="text-white/90 mb-4 text-sm leading-relaxed">
                Get started in 3 simple steps: Complete your profile → Paste a job description → Generate tailored resumes & cover letters instantly with AI
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to={createPageUrl('Profile')}>
                  <Button variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-white/90">
                    Set Up Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('FAQ')}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}