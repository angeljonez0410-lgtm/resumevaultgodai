import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, ArrowUpRight, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../premium/useSubscription';

export default function SubscriptionStatus() {
  const { currentTier, productTier, isManualOverride, isPremium, isElite, isPro, isLoading, subscription } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const addons = subscription?.premium_addons ? subscription.premium_addons.split(',').filter(Boolean) : [];

  // Determine display tier — Premium Elite override takes priority
  const isPremiumElite = productTier === 'Premium Elite' || isElite;

  const tierConfig = {
    free: {
      name: 'Free Plan',
      color: 'from-slate-500 to-slate-700',
      textColor: 'text-slate-600',
      icon: Zap,
      description: '2 AI tasks per month',
      cta: 'Upgrade to Pro'
    },
    pro: {
      name: 'Pro Plan',
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      icon: Zap,
      description: '80 AI resumes/month + full suite',
      cta: 'Manage Plan'
    },
    elite: {
      name: isPremiumElite ? 'Premium Elite' : 'Elite Plan',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      icon: Crown,
      description: isPremiumElite ? 'God-Mode: All features unlocked' : 'All premium features unlocked',
      cta: 'Manage Plan'
    }
  };

  const displayTier = isPremiumElite ? 'elite' : currentTier;
  const config = tierConfig[displayTier] || tierConfig.free;
  const Icon = config.icon;

  return (
    <Card className="border-2 bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
          <Icon className={`w-5 h-5 ${config.textColor}`} />
          Your Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`bg-gradient-to-r ${config.color} text-white border-0 text-sm px-3 py-1`}>
              {config.name}
            </Badge>

          </div>
          <p className="text-sm text-slate-600 mt-2">{config.description}</p>
        </div>

        {addons.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-900 mb-2 uppercase tracking-wide">Premium Add-ons:</p>
            <div className="flex flex-wrap gap-1.5">
              {addons.map((addon) => (
                <Badge key={addon} variant="outline" className="text-xs border-purple-300 text-purple-700">
                  {addon.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {displayTier === 'free' ? (
            <Link to="/Pricing" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {config.cta}
              </Button>
            </Link>
          ) : (
            <Link to="/ManageSubscription" className="flex-1">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                {config.cta}
              </Button>
            </Link>
          )}
        </div>

        {displayTier === 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              🎯 <span className="font-semibold">Upgrade to Pro</span> for 80 AI resumes, cover letters, and more!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}