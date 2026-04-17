import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Wand2, Video, Mic, Shirt, RectangleHorizontal, Clock, ArrowRight, Sparkles } from 'lucide-react';
import SceneTemplates from '../components/create/SceneTemplates';
import { useNavigate } from 'react-router-dom';

const steps = ['Scene', 'Character', 'Details', 'Review'];

export default function Create() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    scene_template: '',
    character_id: '',
    character_name: '',
    script: '',
    voice_style: 'natural_female',
    outfit_description: '',
    aspect_ratio: '9:16',
    duration: '10s',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCreate = async () => {
    setCreating(true);
    const project = await base44.entities.Project.create({
      ...form,
      status: 'draft',
      credits_used: 0,
    });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setCreating(false);
    navigate('/Projects');
  };

  const canProceed = () => {
    if (step === 0) return !!form.scene_template;
    if (step === 1) return !!form.character_id;
    if (step === 2) return !!form.title;
    return true;
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Wand2 className="w-7 h-7 text-violet-400" />
          Create Video
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Design your AI influencer video step by step</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, idx) => (
          <React.Fragment key={s}>
            <button
              onClick={() => idx < step && setStep(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                idx === step
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : idx < step
                  ? 'bg-white/5 text-white cursor-pointer hover:bg-white/10'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                idx < step ? 'bg-violet-500 text-white' : idx === step ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {idx + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {idx < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Choose a Scene</h2>
            <SceneTemplates selected={form.scene_template} onSelect={(v) => updateForm('scene_template', v)} />
            {form.scene_template === 'custom' && (
              <div className="mt-4">
                <Label className="text-slate-300 text-xs">Custom Scene Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Describe the scene in detail..."
                  className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1 h-24 resize-none"
                />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Select Character</h2>
            {characters.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-white/5">
                <p className="text-slate-400 text-sm mb-3">No characters created yet</p>
                <Button onClick={() => navigate('/Characters')} variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
                  Create a Character First
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      updateForm('character_id', char.id);
                      updateForm('character_name', char.name);
                    }}
                    className={`relative rounded-xl overflow-hidden border transition-all ${
                      form.character_id === char.id
                        ? 'border-violet-500 ring-2 ring-violet-500/30'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="aspect-[3/4]">
                      {char.master_image_url ? (
                        <img src={char.master_image_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white/10">{char.name?.[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <p className="absolute bottom-3 left-3 text-sm font-medium text-white">{char.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Video Details</h2>

            <div>
              <Label className="text-slate-300 text-xs">Project Title</Label>
              <Input
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g. Summer Outfit Reel"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs flex items-center gap-1.5">
                  <RectangleHorizontal className="w-3.5 h-3.5" /> Aspect Ratio
                </Label>
                <Select value={form.aspect_ratio} onValueChange={(v) => updateForm('aspect_ratio', v)}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="9:16">9:16 (Reels/TikTok)</SelectItem>
                    <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Duration
                </Label>
                <Select value={form.duration} onValueChange={(v) => updateForm('duration', v)}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="5s">5 seconds</SelectItem>
                    <SelectItem value="10s">10 seconds</SelectItem>
                    <SelectItem value="15s">15 seconds</SelectItem>
                    <SelectItem value="30s">30 seconds</SelectItem>
                    <SelectItem value="60s">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-xs flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5" /> Outfit Description
              </Label>
              <Input
                value={form.outfit_description}
                onChange={(e) => updateForm('outfit_description', e.target.value)}
                placeholder="e.g. White crop top, blue jeans, sneakers"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Script (for lip-sync)
              </Label>
              <Textarea
                value={form.script}
                onChange={(e) => updateForm('script', e.target.value)}
                placeholder="Type what the character should say..."
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1 h-24 resize-none"
              />
            </div>

            {form.script && (
              <div>
                <Label className="text-slate-300 text-xs">Voice Style</Label>
                <Select value={form.voice_style} onValueChange={(v) => updateForm('voice_style', v)}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="natural_female">Natural Female</SelectItem>
                    <SelectItem value="natural_male">Natural Male</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-6">Review & Generate</h2>
            <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Title</p>
                  <p className="text-sm text-white font-medium mt-0.5">{form.title || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Character</p>
                  <p className="text-sm text-white font-medium mt-0.5">{form.character_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Scene</p>
                  <p className="text-sm text-white font-medium mt-0.5 capitalize">{form.scene_template?.replace(/_/g, ' ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Format</p>
                  <p className="text-sm text-white font-medium mt-0.5">{form.aspect_ratio} · {form.duration}</p>
                </div>
                {form.outfit_description && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Outfit</p>
                    <p className="text-sm text-white font-medium mt-0.5">{form.outfit_description}</p>
                  </div>
                )}
                {form.script && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Script</p>
                    <p className="text-sm text-white font-medium mt-0.5">{form.script}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Estimated credits</span>
                  <span className="text-white font-semibold">~15 credits</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <Button
          variant="ghost"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="text-slate-400 hover:text-white hover:bg-white/5"
        >
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {creating ? 'Creating...' : 'Generate Video'}
          </Button>
        )}
      </div>
    </div>
  );
}