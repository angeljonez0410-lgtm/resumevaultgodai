import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Video, Users, Zap, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentProjects from '../components/dashboard/RecentProjects';
import QuickActions from '../components/dashboard/QuickActions';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 5),
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalCreditsUsed = projects.reduce((sum, p) => sum + (p.credits_used || 0), 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Studio</h1>
        <p className="text-slate-400 mt-1 text-sm">Create stunning AI influencer videos</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Characters"
          value={characters.length}
          subtitle="Master characters"
          icon={Users}
          gradient="bg-violet-500"
          delay={0}
        />
        <StatCard
          title="Videos"
          value={completedProjects.length}
          subtitle="Generated videos"
          icon={Video}
          gradient="bg-fuchsia-500"
          delay={0.1}
        />
        <StatCard
          title="Credits Used"
          value={totalCreditsUsed}
          subtitle="This month"
          icon={Zap}
          gradient="bg-cyan-500"
          delay={0.2}
        />
        <StatCard
          title="Success Rate"
          value={projects.length > 0 ? `${Math.round((completedProjects.length / projects.length) * 100)}%` : '—'}
          subtitle="Generation success"
          icon={TrendingUp}
          gradient="bg-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Projects</h2>
        <RecentProjects projects={projects} />
      </div>
    </div>
  );
}