import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Video, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import AIBadge from '../ai/AIBadge';

const statusColors = {
  draft: 'bg-slate-500/10 text-slate-400',
  ready: 'bg-emerald-500/10 text-emerald-400',
  training: 'bg-amber-500/10 text-amber-400',
};

export default function CharacterCard({ character, onEdit, onDelete, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="group relative rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden hover:border-violet-500/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <AIBadge position="top-right" size="sm" />
        {character.master_image_url ? (
          <img
            src={character.master_image_url}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/10">{character.name?.[0] || '?'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        {/* Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="w-8 h-8 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
              <DropdownMenuItem onClick={() => onEdit(character)} className="text-slate-300 focus:text-white focus:bg-white/5">
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(character)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusColors[character.status] || statusColors.draft} border-0 text-xs`}>
            {character.status || 'draft'}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{character.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500 capitalize">{character.style || 'photorealistic'} · {character.gender || 'unset'}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Video className="w-3 h-3" />
            {character.generation_count || 0}
          </div>
        </div>
      </div>
    </motion.div>
  );
}