import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import CharacterCard from '../components/characters/CharacterCard';
import CharacterForm from '../components/characters/CharacterForm';
import { asArray } from '@/lib/arrays';
import { deleteLocalCharacter, getLocalCharacters } from '@/lib/local-characters';

export default function Characters() {
  const [showForm, setShowForm] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: charactersResponse = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      try {
        const remoteCharacters = asArray(await base44.entities.Character.list('-created_date'));
        return [...remoteCharacters, ...getLocalCharacters()];
      } catch {
        return getLocalCharacters();
      }
    },
  });

  const characters = asArray(charactersResponse);
  const filteredCharacters = characters.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (char) => {
    setEditingChar(char);
    setShowForm(true);
  };

  const handleDelete = async (char) => {
    if (char.id?.startsWith('local-')) {
      deleteLocalCharacter(char.id);
    } else {
      await base44.entities.Character.delete(char.id);
    }
    queryClient.invalidateQueries({ queryKey: ['characters'] });
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingChar(null);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Characters</h1>
          <p className="text-slate-400 mt-1 text-sm">Your master characters for consistent video generation</p>
        </div>
        <Button
          onClick={() => { setEditingChar(null); setShowForm(true); }}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> New Character
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search characters..."
          className="bg-slate-900/50 border-white/10 text-white pl-10 placeholder:text-slate-500"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCharacters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No characters yet</h3>
          <p className="text-slate-400 text-sm mb-6">Create your first AI influencer character</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white"
          >
            Create Character
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCharacters.map((char, idx) => (
            <CharacterCard
              key={char.id}
              character={char}
              onEdit={handleEdit}
              onDelete={handleDelete}
              delay={idx * 0.05}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <CharacterForm
          open={showForm}
          onClose={handleClose}
          character={editingChar}
          onSave={() => queryClient.invalidateQueries({ queryKey: ['characters'] })}
        />
      )}
    </div>
  );
}
