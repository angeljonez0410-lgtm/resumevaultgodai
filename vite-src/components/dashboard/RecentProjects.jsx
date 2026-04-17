import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import AIBadge from '../ai/AIBadge';

const statusConfig = {
  draft: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Draft' },
  generating: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Generating', spin: true },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
};

export default function RecentProjects({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-8 text-center">
        <Play className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No projects yet</p>
        <p className="text-slate-500 text-xs mt-1">Create your first video to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project, idx) => {
        const status = statusConfig[project.status] || statusConfig.draft;
        const StatusIcon = status.icon;
        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={`/Projects?id=${project.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:border-violet-500/20 hover:bg-slate-900/50 transition-all duration-300 group relative"
            >
              <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative">
                <AIBadge position="top-right" size="sm" />
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                    <Play className="w-5 h-5 text-violet-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                  {project.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {project.character_name || 'No character'} · {project.duration || '10s'}
                </p>
              </div>
              <Badge variant="outline" className={`${status.bg} ${status.color} border-0 text-xs`}>
                <StatusIcon className={`w-3 h-3 mr-1 ${status.spin ? 'animate-spin' : ''}`} />
                {status.label}
              </Badge>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}