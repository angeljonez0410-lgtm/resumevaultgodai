import React from 'react';
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  hard_skills: "bg-blue-50 text-blue-700 border-blue-200",
  soft_skills: "bg-purple-50 text-purple-700 border-purple-200",
  tools: "bg-emerald-50 text-emerald-700 border-emerald-200",
  qualifications: "bg-amber-50 text-amber-700 border-amber-200",
  industry_terms: "bg-rose-50 text-rose-700 border-rose-200",
};

const categoryLabels = {
  hard_skills: "Hard Skills",
  soft_skills: "Soft Skills",
  tools: "Tools & Technologies",
  qualifications: "Qualifications",
  industry_terms: "Industry Terms",
};

export default function KeywordBadges({ keywords }) {
  if (!keywords) return null;

  let parsed;
  try {
    parsed = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
  } catch {
    return <p className="text-slate-500 text-sm">Could not parse keywords.</p>;
  }

  return (
    <div className="space-y-5">
      {Object.entries(parsed).map(([category, items]) => {
        if (!Array.isArray(items) || items.length === 0) return null;
        return (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {categoryLabels[category] || category.replace(/_/g, ' ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((kw, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={`${categoryColors[category] || 'bg-slate-50 text-slate-700 border-slate-200'} text-xs px-3 py-1 font-medium`}
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}