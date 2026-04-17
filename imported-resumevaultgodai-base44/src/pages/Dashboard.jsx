import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  Search, FileText, Mail, Send, Briefcase, TrendingUp,
  ArrowRight, Star, Zap, Mic, DollarSign, Map, Lightbulb, Crown, ShoppingBag, CreditCard
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSubscription } from '../components/premium/useSubscription';
import PremiumAddonsModal from '../components/premium/PremiumAddonsModal';
import { useStaleWhileRevalidate } from '../components/hooks/useStaleWhileRevalidate';

import QuickStartBanner from '../components/onboarding/QuickStartBanner';
import WelcomeBanner from '../components/onboarding/WelcomeBanner';
import AutoMatchedJobs from '../components/dashboard/AutoMatchedJobs';
import CreditBalance from '../components/dashboard/CreditBalance';
import SubscriptionStatus from '../components/dashboard/SubscriptionStatus';
import MotivationalQuote from '../components/ui-custom/MotivationalQuotes';

const quickActions = [
  { title: 'Analyze Job', desc: 'Extract ATS keywords from a job posting', icon: Search, page: 'JobAnalyzer', color: 'from-blue-500 to-blue-600' },
  { title: 'Build Resume', desc: 'Generate a tailored resume', icon: FileText, page: 'ResumeBuilder', color: 'from-emerald-500 to-emerald-600' },
  { title: 'Cover Letter', desc: 'Write a compelling cover letter', icon: Mail, page: 'CoverLetter', color: 'from-purple-500 to-purple-600' },
  { title: 'Follow-Up', desc: 'Craft a professional follow-up email', icon: Send, page: 'FollowUpEmail', color: 'from-amber-500 to-orange-600' },
  { title: 'PayPal Setup', desc: 'Set up PayPal payments in 7 easy steps', icon: CreditCard, page: 'PayPalSetup', color: 'from-indigo-500 to-indigo-600' },
];

const premiumActions = [
  { title: 'Mock Interview', desc: 'Practice with AI-generated questions', icon: Mic, page: 'MockInterview' },
  { title: 'Salary Negotiation', desc: 'Ready-to-use negotiation scripts', icon: DollarSign, page: 'SalaryNegotiation' },
  { title: 'Career Roadmap', desc: 'Step-by-step plan to your goals', icon: Map, page: 'CareerRoadmap' },
  { title: 'Portfolio Ideas', desc: 'Impress recruiters with standout projects', icon: Lightbulb, page: 'PortfolioIdeas' },
];

const statusConfig = {
  analyzing: { label: 'Analyzing', color: 'bg-blue-50 text-blue-700' },
  ready: { label: 'Ready', color: 'bg-emerald-50 text-emerald-700' },
  applied: { label: 'Applied', color: 'bg-purple-50 text-purple-700' },
  interview: { label: 'Interview', color: 'bg-amber-50 text-amber-700' },
  offer: { label: 'Offer', color: 'bg-green-50 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700' },
};

export default function Dashboard() {
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const { isPremium } = useSubscription();

  const handleQuickAction = (actionTitle) => {
    toast.success(`Opening ${actionTitle}`, { description: 'Loading your AI tools...', duration: 2000 });
  };

  const handleOpenAddons = () => {
    toast('🛍️ Premium Add-Ons', { description: 'Loading available add-ons...', duration: 2000 });
    setShowAddonsModal(true);
  };

  // SWR Pattern: Load from cache instantly, refresh in background
  const { data: applicationsData, isStale } = useStaleWhileRevalidate(
    'dashboard_applications',
    () => base44.entities.JobApplication.list('-created_date', 5),
    { ttl: 5 * 60 * 1000 }
  );

  const applications = applicationsData || [];
  const recentApps = applications.slice(0, 5);
  const totalApps = applications.length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const appliedCount = applications.filter(a => ['applied', 'interview', 'offer'].includes(a.status)).length;

  return (
    <div>
      <WelcomeBanner />
      <QuickStartBanner />
      
      {/* Stats Line */}
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest">
          ⚡ Beat the ATS in 60 seconds • God-Mode Your Job Hunt
        </p>
      </div>

      {/* Upgrade Banner (only for non-premium) */}
      {!isPremium && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Unlock 4 premium AI tools</p>
              <p className="text-slate-400 text-xs mt-0.5">Mock Interview · Salary Negotiation · Career Roadmap · Portfolio Ideas</p>
            </div>
          </div>
          <Link to={createPageUrl('Pricing')}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold flex-shrink-0 whitespace-nowrap">
              <Zap className="w-4 h-4 mr-1.5" /> Upgrade Now
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Account Status & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-10">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CreditBalance />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SubscriptionStatus />
          </motion.div>
        </div>
        
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Applications', value: totalApps, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active Applications', value: appliedCount, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Interviews', value: interviewCount, icon: Star, color: 'text-amber-600 bg-amber-50' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-5 hover:shadow-md transition-shadow h-full">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="mb-8">
        <MotivationalQuote variant="inline" />
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {quickActions.map((action, i) => (
             <motion.div key={action.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
               <Link to={createPageUrl(action.page)} onClick={() => handleQuickAction(action.title)}>
                 <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-slate-200">
                   <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-sm`}>
                     <action.icon className="w-5 h-5 text-white" />
                   </div>
                   <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
                   <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
                   <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all mt-3" />
                 </Card>
               </Link>
             </motion.div>
           ))}
         </div>
      </div>

      {/* Auto-Matched Jobs */}
      <div className="mb-10">
        <AutoMatchedJobs />
      </div>

      {/* Another Motivational Quote */}
      <div className="mb-8">
        <MotivationalQuote variant="small" />
      </div>

      {/* Premium Tools */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Premium Tools
          </h2>
          {!isPremium && (
            <Link to={createPageUrl('Pricing')} className="text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center gap-1">
              Unlock all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {premiumActions.map((action, i) => (
             <motion.div key={action.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.08 }}>
               <Link to={createPageUrl(action.page)} onClick={() => handleQuickAction(action.title)}>
                 <Card className={`p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-amber-100 bg-gradient-to-br from-amber-50/30 to-orange-50/20 ${isPremium ? 'hover:shadow-lg' : 'opacity-80 hover:opacity-100 hover:shadow-md'}`}>
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-sm">
                     <action.icon className="w-5 h-5 text-white" />
                   </div>
                   <div className="flex items-start justify-between mb-1">
                     <h3 className="font-semibold text-slate-800">{action.title}</h3>
                     {!isPremium && <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />}
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
                   <ArrowRight className="w-4 h-4 text-amber-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all mt-3" />
                 </Card>
               </Link>
             </motion.div>
           ))}
         </div>
      </div>

      {/* Recent Applications */}
      {recentApps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Applications</h2>
          <Card className="divide-y divide-slate-100 overflow-hidden">
            {recentApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{app.job_title}</p>
                    <p className="text-xs text-slate-400">{app.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className={`${statusConfig[app.status]?.color || 'bg-slate-50 text-slate-600'} text-[10px] font-medium border-0`}>
                    {statusConfig[app.status]?.label || app.status}
                  </Badge>
                  <span className="text-[10px] text-slate-300 hidden sm:block">
                    {app.created_date ? format(new Date(app.created_date), 'MMM d') : ''}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Premium Add-ons Banner */}
      <Card className="p-6 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(220,35%,25%)] border-0 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[hsl(var(--accent))]" />
              Premium Add-Ons
            </h3>
            <p className="text-white/80 text-sm">
              Boost your job search with one-time purchases
            </p>
          </div>
          <Button 
            onClick={handleOpenAddons}
            className="bg-[hsl(var(--accent))] hover:bg-[hsl(45,95%,50%)] text-[hsl(var(--primary))] font-semibold"
          >
            Browse Add-Ons
          </Button>
        </div>
      </Card>

      <PremiumAddonsModal open={showAddonsModal} onClose={() => setShowAddonsModal(false)} />
    </div>
  );
}