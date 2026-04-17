import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingState({ message = "Generating..." }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full bg-amber-200/30 animate-ping" />
      </div>
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </motion.div>
  );
}