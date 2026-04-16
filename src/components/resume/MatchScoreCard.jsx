import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function MatchScoreCard({ score, suggestions }) {
  const getScoreColor = (score) => {
    if (score >= 98) return 'text-green-600';
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 98) return 'Excellent Match!';
    if (score >= 90) return 'Great Match';
    if (score >= 80) return 'Good Match';
    return 'Needs Improvement';
  };

  const getProgressColor = (score) => {
    if (score >= 98) return 'bg-green-600';
    if (score >= 90) return 'bg-emerald-600';
    if (score >= 80) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">ATS Match Score</h3>
            <p className="text-xs text-slate-500">How well your resume matches the job</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}%</span>
            <span className={`text-sm font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</span>
          </div>
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${getProgressColor(score)} rounded-full`}
            />
          </div>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Improvement Suggestions
            </h4>
            <ul className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  {score >= 98 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {score >= 98 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              This resume is highly optimized for ATS systems and ready to submit!
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}