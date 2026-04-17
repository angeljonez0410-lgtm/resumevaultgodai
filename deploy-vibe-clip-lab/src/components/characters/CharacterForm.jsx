import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, Sparkles, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import GeminiAssistant from '../ai/GeminiAssistant';
import { toast } from 'sonner';
import { upsertLocalCharacter } from '@/lib/local-characters';

export default function CharacterForm({ open, onClose, character, onSave }) {
  const [form, setForm] = useState(character || {
    name: '',
    description: '',
    gender: 'female',
    style: 'photorealistic',
    ethnicity: '',
    age_range: '25-35',
    master_image_url: '',
    status: 'draft',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [geminiMode, setGeminiMode] = useState(null);
  const [generatingCharacter, setGeneratingCharacter] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, master_image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (character?.id && !character.id.startsWith('local-')) {
        await base44.entities.Character.update(character.id, form);
      } else if (!character?.id) {
        await base44.entities.Character.create(form);
      } else {
        throw new Error('Local character');
      }
    } catch {
      upsertLocalCharacter({
        ...form,
        id: character?.id,
        status: 'ready',
      });
      toast.success('Character saved locally');
    }
    setSaving(false);
    onSave();
    onClose();
  };

  const generateResumeVaultCharacter = async () => {
    setGeneratingCharacter(true);
    try {
      const response = await invokeGemini({
        mode: 'resumevault_character',
        prompt: `Create a realistic AI spokesperson character for ResumeVaultGod.com.

Current form context:
- Name: ${form.name || 'create a strong original name'}
- Gender: ${form.gender}
- Age range: ${form.age_range}
- Ethnicity or cultural look: ${form.ethnicity || 'open and inclusive'}
- Visual style: photorealistic

The character should represent an AI job hunt command center: ATS resumes, cover letters, interview prep, salary scripts, career roadmaps, and application tracking.

Return one polished character description only. Include face, hair, wardrobe, posture, expression, personality, brand vibe, and a short image-generation direction. Keep it realistic, professional, confident, trustworthy, and built for social media videos/images.`
      });

      const aiText = response?.data?.response || response?.response;
      if (!aiText) throw new Error(response?.data?.error || 'No Gemini character returned');

      setForm(prev => ({
        ...prev,
        style: 'photorealistic',
        description: aiText,
      }));
      toast.success('Realistic ResumeVaultGod character generated');
    } catch (error) {
      const fallbackDescription = `${form.name || 'A realistic ResumeVaultGod AI spokesperson'} is a photorealistic career coach and job-search guide for ResumeVaultGod.com. They have a polished, approachable face, clear confident eye contact, natural skin texture, and a calm expression that feels trustworthy on camera. Their wardrobe is modern professional: a tailored blazer, clean neutral shirt, minimal accessories, and subtle brand accents that work across LinkedIn, TikTok, YouTube Shorts, and Instagram Reels.

The character's personality is direct, helpful, and motivating. They explain ATS resumes, cover letters, interview prep, application tracking, salary scripts, and career roadmaps in a practical way for job seekers who want faster callbacks. Visual direction: realistic studio lighting, modern workspace, laptop nearby, clean background, cinematic depth of field, no distorted hands, no text artifacts.`;
      setForm(prev => ({
        ...prev,
        style: 'photorealistic',
        description: fallbackDescription,
      }));
      toast.success('Gemini is unavailable, so a realistic local character brief was created');
    } finally {
      setGeneratingCharacter(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            {character?.id ? 'Edit Character' : 'Create Character'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Image upload */}
          <div>
            <Label className="text-slate-300 text-xs">Master Image</Label>
            <div className="mt-2 relative">
              {form.master_image_url ? (
                <div className="relative w-full aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden">
                  <img src={form.master_image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, master_image_url: '' }))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/30 cursor-pointer transition-colors bg-slate-900/50">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">{uploading ? 'Uploading...' : 'Upload reference image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-xs">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Luna Martinez"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm(prev => ({ ...prev, gender: v }))}>
                <SelectTrigger className="bg-slate-900 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non_binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-xs">Style</Label>
              <Select value={form.style} onValueChange={(v) => setForm(prev => ({ ...prev, style: v }))}>
                <SelectTrigger className="bg-slate-900 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="photorealistic">Photorealistic</SelectItem>
                  <SelectItem value="stylized">Stylized</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="3d_render">3D Render</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Age Range</Label>
              <Select value={form.age_range} onValueChange={(v) => setForm(prev => ({ ...prev, age_range: v }))}>
                <SelectTrigger className="bg-slate-900 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="18-25">18–25</SelectItem>
                  <SelectItem value="25-35">25–35</SelectItem>
                  <SelectItem value="35-45">35–45</SelectItem>
                  <SelectItem value="45+">45+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-300 text-xs">Ethnicity</Label>
            <Input
              value={form.ethnicity}
              onChange={(e) => setForm(prev => ({ ...prev, ethnicity: e.target.value }))}
              placeholder="e.g. Hispanic, East Asian"
              className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-slate-300 text-xs">Description</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={generateResumeVaultCharacter}
                  disabled={generatingCharacter}
                  className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 gap-1.5 h-auto py-0.5 px-2 text-xs"
                >
                  <Wand2 className="w-3 h-3" /> {generatingCharacter ? 'Generating...' : 'ResumeVault Character'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setGeminiMode('character_description'); setGeminiOpen(true); }}
                  className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 gap-1.5 h-auto py-0.5 px-2 text-xs"
                >
                  <Wand2 className="w-3 h-3" /> Gemini Helper
                </Button>
              </div>
            </div>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the character's look, personality, vibe..."
              className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 mt-1 h-20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white"
            >
              {saving ? 'Saving...' : character?.id ? 'Update' : 'Create Character'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <AnimatePresence>
        {geminiOpen && (
          <GeminiAssistant
            mode={geminiMode}
            onClose={() => setGeminiOpen(false)}
            onApply={(text) => {
              if (geminiMode === 'character_description') {
                setForm(prev => ({ ...prev, description: text }));
              }
              setGeminiOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </Dialog>
  );
}

async function invokeGemini(payload) {
  try {
    return await base44.functions.invoke('geminiAssistant', payload);
  } catch (error) {
    const message = error?.message || '';
    if (!message.includes('404') && !/not found/i.test(message)) throw error;
  }

  const response = await fetch('/api/gemini-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Gemini assistant failed');
  return { data };
}
