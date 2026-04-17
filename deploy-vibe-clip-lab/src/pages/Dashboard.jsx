import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Video, Users, Image as ImageIcon, TrendingUp, ExternalLink, CheckCircle2, PlusCircle, Share2 } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentProjects from '../components/dashboard/RecentProjects';
import QuickActions from '../components/dashboard/QuickActions';
import { motion } from 'framer-motion';
import { asArray } from '@/lib/arrays';

const SOCIAL_CONNECTIONS_KEY = 'resumevault_social_connections_v1';

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/accounts/login/', color: 'from-pink-500 to-rose-500' },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/login', color: 'from-cyan-400 to-pink-500' },
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/login/', color: 'from-blue-500 to-blue-700' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/login', color: 'from-sky-500 to-blue-600' },
  { id: 'youtube', name: 'YouTube', url: 'https://accounts.google.com/ServiceLogin?service=youtube', color: 'from-red-500 to-red-700' },
  { id: 'twitter', name: 'X / Twitter', url: 'https://x.com/i/flow/login', color: 'from-slate-300 to-slate-500' },
  { id: 'threads', name: 'Threads', url: 'https://www.threads.net/login', color: 'from-zinc-200 to-zinc-500' },
];

function getSavedConnections() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(SOCIAL_CONNECTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function SocialLoginPanel() {
  const [connections, setConnections] = useState(() => getSavedConnections());

  useEffect(() => {
    window.localStorage.setItem(SOCIAL_CONNECTIONS_KEY, JSON.stringify(connections));
  }, [connections]);

  const toggleConnected = (platformId) => {
    setConnections(prev => ({
      ...prev,
      [platformId]: {
        connected: !prev[platformId]?.connected,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const openLogin = (platform) => {
    window.open(platform.url, '_blank', 'noopener,noreferrer');
    setConnections(prev => ({
      ...prev,
      [platform.id]: {
        connected: true,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const connectedCount = socialPlatforms.filter(platform => connections[platform.id]?.connected).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-lg border border-white/10 bg-slate-900/60 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-300" />
            Social Media Logins
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Connect accounts for posting workflows and track which channels are ready.
          </p>
        </div>
        <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 border border-emerald-500/20">
          {connectedCount}/{socialPlatforms.length} connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {socialPlatforms.map(platform => {
          const isConnected = Boolean(connections[platform.id]?.connected);

          return (
            <div key={platform.id} className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-md bg-gradient-to-br ${platform.color} flex items-center justify-center text-white font-bold`}>
                    {platform.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{platform.name}</p>
                    <p className={isConnected ? 'text-xs text-emerald-300' : 'text-xs text-slate-500'}>
                      {isConnected ? 'Marked connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                ) : (
                  <PlusCircle className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => openLogin(platform)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-slate-950 px-3 py-2 text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Login
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleConnected(platform.id)}
                  className={isConnected
                    ? 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-colors'
                    : 'rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors'
                  }
                >
                  {isConnected ? 'Disconnect' : 'Mark Ready'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: projectsResponse = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 5),
  });

  const { data: charactersResponse = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const projects = asArray(projectsResponse);
  const characters = asArray(charactersResponse);
  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalGenerated = projects.length;

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
          title="Free Generations"
          value={totalGenerated}
          subtitle="Saved projects"
          icon={ImageIcon}
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

      <div className="mb-10">
        <SocialLoginPanel />
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Projects</h2>
        <RecentProjects projects={projects} />
      </div>
    </div>
  );
}
