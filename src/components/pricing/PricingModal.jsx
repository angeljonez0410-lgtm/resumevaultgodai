import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Sparkles, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSubscription } from '../premium/useSubscription';

const freeFeatures = [
  'Job Description Analyzer',
  'ATS Keyword Extraction',
  'Resume Builder',
  'Cover Letter Writer',
  'Follow-Up Email Generator',
];

const proOnlyFeatures = [
  'Mock Interview Simulator',
  'Salary Negotiation Scripts',
  'Strategic Career Roadmap',
  'Portfolio Project Ideas',
  'Unlimited AI generations',
  'Priority processing',
];

const addonFeatures = [
  'Mock Interview Simulator',
  'Salary Negotiation Scripts',
  'Strategic Career Roadmap',
  'Portfolio Project Ideas',
];

export default function PricingModal({ open, onClose }) {
  const [loading, setLoading] = useState(null);
  const queryClient = useQueryClient();
  const { isPremium, hasPro } = useSubscription();

  const handleUnlock = async (type) => {
    setLoading(type);
    await base44.entities.UserSubscription.create({
      has_addon_pack: true,
      has_pro: type === 'pro',
      plan_type: type === 'pro' ? 'pro' : 'addon',
    });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    toast.success(type === 'pro' ? '🎉 Pro subscription activated!' : '🎉 Premium Add-on Pack unlocked!');
    setLoading(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-6">
          <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Upgrade ApplyAI
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-1">Unlock powerful tools to supercharge your job search</p>
        </div>

        <div className="p-6">
          <Tabs defaultValue="plans">
            <TabsList className="w-full mb-6 bg-slate-100">
              <TabsTrigger value="plans" className="flex-1">Plans</TabsTrigger>
              <TabsTrigger value="addons" className="flex-1">
                Add-ons
                <Badge className="ml-2 bg-amber-500 text-white text-[10px] border-0 py-0 px-1.5">NEW</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Plans Tab */}
            <TabsContent value="plans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free */}
                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Free</p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-slate-900">$0</span>
                      <span className="text-slate-400 text-sm mb-1">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {freeFeatures.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                </div>

                {/* Pro */}
                <div className="border-2 border-amber-400 rounded-xl p-5 relative bg-gradient-to-br from-amber-50/30 to-orange-50/20">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pro</p>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-slate-900">$19.99</span>
                      <span className="text-slate-400 text-sm mb-1">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {freeFeatures.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {proOnlyFeatures.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUnlock('pro')}
                    disabled={loading === 'pro' || hasPro}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                  >
                    {hasPro ? '✓ Active' : loading === 'pro' ? 'Activating...' : 'Get Pro'}
                  </Button>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                <Lock className="w-3 h-3 inline mr-1" />
                Connect PayPal for real payments
              </p>
            </TabsContent>

            {/* Add-ons Tab */}
            <TabsContent value="addons">
              <div className="border-2 border-amber-300 rounded-xl p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-slate-900 text-lg">Premium Add-on Pack</h3>
                    </div>
                    <p className="text-slate-500 text-sm">One-time purchase · Lifetime access</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">$5.00</div>
                    <div className="text-xs text-slate-400">one-time</div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">Unlock 4 powerful AI tools to maximize your interview success:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {addonFeatures.map(f => (
                    <div key={f} className="flex items-center gap-2.5 bg-white rounded-lg px-3 py-2.5 border border-amber-100 shadow-sm">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUnlock('addon')}
                  disabled={loading === 'addon' || isPremium}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 text-sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isPremium ? '✓ Already Unlocked' : loading === 'addon' ? 'Unlocking...' : 'Get Premium Add-on Pack — $5.00'}
                </Button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                <Lock className="w-3 h-3 inline mr-1" />
                Connect PayPal for real payments
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}