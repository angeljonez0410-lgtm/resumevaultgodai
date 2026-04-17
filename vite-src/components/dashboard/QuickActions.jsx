import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Video, Users, Wand2 } from 'lucide-react';

const actions = [
  {
    label: 'New Character',
    description: 'Create a master character',
    icon: Users,
    path: '/Characters',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    label: 'Create Video',
    description: 'Generate a new video',
    icon: Video,
    path: '/Create',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  {
    label: 'Quick Generate',
    description: 'Use a scene template',
    icon: Wand2,
    path: '/Create',
    gradient: 'from-cyan-500 to-blue-600',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + idx * 0.1 }}
        >
          <Link
            to={action.path}
            className="group relative block p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-white">{action.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
            <Plus className="absolute top-4 right-4 w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}