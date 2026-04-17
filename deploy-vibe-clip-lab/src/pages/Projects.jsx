import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Play, Plus, Trash2, Clock, CheckCircle2, Loader2, AlertCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIBadge from '../components/ai/AIBadge';
import VideoPlayer from '../components/media/VideoPlayer';
import { asArray } from '@/lib/arrays';

const statusConfig = {
  draft: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Draft' },
  generating: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Generating', spin: true },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
};

export default function Projects() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: projectsResponse = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const projects = asArray(projectsResponse);
  const filtered = projects.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id) => {
    await base44.entities.Project.delete(id);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage all your video generations</p>
        </div>
        <Link to="/Create">
          <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="bg-slate-900/50 border-white/10 text-white pl-10 placeholder:text-slate-500"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-slate-900/50 border border-white/5">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">All</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">Completed</TabsTrigger>
            <TabsTrigger value="generating" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">Generating</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs data-[state=active]:bg-slate-500/20 data-[state=active]:text-slate-300">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No projects found</h3>
          <p className="text-slate-400 text-sm">Create a new video project to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filtered.map((project, idx) => {
              const status = statusConfig[project.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="bg-slate-900/30 rounded-2xl border border-white/5 p-6 hover:border-violet-500/20 transition-all">
                    {project.video_url ? (
                      <>
                        <VideoPlayer videoUrl={project.video_url} projectTitle={project.title} />
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {project.character_name || 'No character'} · {project.duration || '10s'}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge className={`${status.bg} ${status.color} border-0 text-xs`}>
                              <StatusIcon className={`w-3 h-3 mr-1 ${status.spin ? 'animate-spin' : ''}`} />
                              {status.label}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(project.id)}
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 w-8 h-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="aspect-video relative bg-slate-800 rounded-xl overflow-hidden group mb-4">
                        <AIBadge position="top-right" size="sm" />
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                            <Play className="w-10 h-10 text-violet-400/40" />
                          </div>
                        )}
                        <Badge className={`absolute top-3 left-3 ${status.bg} ${status.color} border-0 text-xs`}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${status.spin ? 'animate-spin' : ''}`} />
                          {status.label}
                        </Badge>
                      </div>
                    )}
                    {!project.video_url && (
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white truncate">{project.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {project.character_name || 'No character'} · {project.scene_template?.replace(/_/g, ' ') || 'Custom'}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(project.id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 w-8 h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
