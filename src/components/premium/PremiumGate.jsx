import React, { useState } from 'react';
import { Lock, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSubscription } from './useSubscription';
import PricingModal from '../pricing/PricingModal';

export default function PremiumGate({ children, featureName, description }) {
  const { isPremium, isLoading } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading...</div>;
  }

  if (isPremium) return <>{children}</>;

  return (
    <>
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6 shadow-sm">
          <Lock className="w-9 h-9 text-amber-600" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold text-amber-700 mb-4">
          <Zap className="w-3 h-3" />
          Premium Feature
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{featureName}</h2>
        <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
          {description || 'This feature is available with the Premium Add-on Pack ($5 one-time) or the Pro subscription ($19.99/mo).'}
        </p>
        <Button
          onClick={() => setShowPricing(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-2.5 text-sm font-semibold shadow-md"
        >
          <Zap className="w-4 h-4 mr-2" />
          Unlock This Feature
        </Button>
      </div>
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </>
  );
}