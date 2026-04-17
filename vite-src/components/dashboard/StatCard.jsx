import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 p-6 backdrop-blur-sm"
    >
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl -translate-y-8 translate-x-8", gradient)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", gradient, "bg-opacity-20")}>
          <Icon className="w-5 h-5 text-white/80" />
        </div>
      </div>
    </motion.div>
  );
}