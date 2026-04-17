import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const templates = [
  { id: 'walking_city', label: 'City Walk', emoji: '🏙️', desc: 'Walking through urban streets' },
  { id: 'coffee_shop', label: 'Coffee Shop', emoji: '☕', desc: 'Casual café vibes' },
  { id: 'product_showcase', label: 'Product Show', emoji: '📦', desc: 'Holding & presenting a product' },
  { id: 'talking_head', label: 'Talking Head', emoji: '🎙️', desc: 'Speaking to camera' },
  { id: 'outdoor_nature', label: 'Nature', emoji: '🌿', desc: 'Outdoor natural setting' },
  { id: 'gym_fitness', label: 'Fitness', emoji: '💪', desc: 'Gym or workout scene' },
  { id: 'luxury_lifestyle', label: 'Luxury', emoji: '✨', desc: 'High-end lifestyle' },
  { id: 'office_professional', label: 'Office', emoji: '💼', desc: 'Professional setting' },
  { id: 'custom', label: 'Custom', emoji: '🎨', desc: 'Describe your own scene' },
];

export default function SceneTemplates({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {templates.map((t, idx) => (
        <motion.button
          key={t.id}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          onClick={() => onSelect(t.id)}
          className={cn(
            "relative p-4 rounded-xl border text-left transition-all duration-200",
            selected === t.id
              ? "border-violet-500 bg-violet-500/10"
              : "border-white/5 bg-slate-900/30 hover:border-white/10 hover:bg-slate-900/50"
          )}
        >
          {selected === t.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <span className="text-2xl">{t.emoji}</span>
          <p className="text-sm font-medium text-white mt-2">{t.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
        </motion.button>
      ))}
    </div>
  );
}