import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Zap, 
  Calendar, 
  TrendingUp, 
  Crown, 
  Plus,
  Check,
  ArrowUpRight,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import StripeSubscription from '../components/pricing/StripeSubscription';
import StripeCheckout from '../components/pricing/StripeCheckout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 29.99,
    period: 'month',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: ['Unlimited AI resumes', 'Unlimited cover letters', '20 mock interviews/month', '50 auto-applications/month'],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'elite_monthly',
    name: 'Elite',
    price: 79.99,
    period: 'month',
    priceId: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID,
    features: ['Everything in Pro', 'Unlimited mock interviews', 'Career coaching AI', '200 auto-applications/month'],
    color: 'from-amber-500 to-orange-600',
    icon: Crown
  }
];

const CREDIT_PACKS = [
  { id: 'credits_50', credits: 50, price: 9.99, priceId: 'price_credits_50' },
  { id: 'credits_150', credits: 150, price: 24.99, priceId: 'price_credits_150', popular: true },
  { id: 'credits_400', credits: 400, price: 59.99, priceId: 'price_credits_400' },
];

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: subscription, isLoading: loadingSub } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      const subs = await base44.entities.UserSubscription.filter({});
      return subs[0] || null;
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['creditTransactions'],
    queryFn: async () => {
      const txs = await base44.entities.CreditTransaction.filter({}, '-created_date', 20);
      return txs || [];
    }
  });

  const tier = subscription?.subscription_status || 'free';
  const credits = subscription?.credits_balance || 0;
  const subscriptionId = subscription?.subscription_id;

  // Calculate renewal date (30 days from last update for monthly plans)
  const renewalDate = subscription?.updated_date 
    ? moment(subscription.updated_date).add(30, 'days').format('MMM D, YYYY')
    : 'N/A';

  const tierConfig = {
    free: { name: 'Free Plan', color: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700' },
    pro: { name: 'Pro Plan', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    elite: { name: 'Elite Plan', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Subscription</h1>
        <p className="text-slate-600">Manage your subscription, credits, and billing information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge className={`${tierConfig[tier].badge} text-sm px-3 py-1 font-semibold`}>
                  {tierConfig[tier].name}
                </Badge>
                {tier !== 'free' && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-600">Subscription ID</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{subscriptionId || 'N/A'}</p>
                  </div>
                )}
              </div>
              {tier === 'free' ? (
                <div className="pt-2">
                  <p className="text-sm text-slate-600 mb-3">Upgrade to unlock unlimited AI tools</p>
                  <Link to="/Pricing">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/ManageSubscription">
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Renewal Date */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Renewal Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {tier === 'free' ? '—' : renewalDate}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {tier === 'free' 
                    ? 'No active subscription' 
                    : 'Your plan will automatically renew'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Balance */}
        <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              AI Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">{credits}</span>
                  <span className="text-sm text-slate-600">credits</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">Available for AI features</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Buy Credits
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      Purchase Credit Packs
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {CREDIT_PACKS.map((pack) => (
                      <Card key={pack.id} className={`${pack.popular ? 'ring-2 ring-amber-500' : ''}`}>
                        <CardContent className="p-4 text-center space-y-3">
                          {pack.popular && (
                            <Badge className="bg-amber-500 text-white">Popular</Badge>
                          )}
                          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900">{pack.credits}</p>
                            <p className="text-xs text-slate-500">Credits</p>
                          </div>
                          <p className="text-xl font-bold text-slate-900">${pack.price}</p>
                          <StripeCheckout
                            priceId={pack.priceId}
                            amount={pack.price}
                            description={`${pack.credits} Credits`}
                            purchaseType="credits"
                            itemId={pack.id}
                            label="Purchase"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Plans */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Upgrade Your Plan
          </CardTitle>
          <CardDescription>Choose a plan that fits your job search needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = tier === plan.id.split('_')[0];
              
              return (
                <Card key={plan.id} className={`${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-slate-900">{plan.name} Plan</h3>
                          {Icon && <Icon className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                          <span className="text-slate-500">/{plan.period}</span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <Button disabled className="w-full bg-slate-100 text-slate-500">
                        Current Plan
                      </Button>
                    ) : plan.priceId ? (
                      <StripeSubscription
                        priceId={plan.priceId}
                        planName={plan.name}
                        planId={plan.id}
                        label="Pay with Card"
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold`}
                      />
                    ) : (
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Transaction History
            </CardTitle>
            <CardDescription>Your recent credit transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {tx.transaction_type === 'purchase' && (
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      {tx.transaction_type === 'usage' && (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      {tx.transaction_type === 'bonus' && (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{tx.description}</p>
                        <p className="text-sm text-slate-500">
                          {moment(tx.created_date).format('MMM D, YYYY h:mm A')}
                        </p>
                        {tx.feature_used && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {tx.feature_used}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.credits_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.credits_amount > 0 ? '+' : ''}{tx.credits_amount}
                      </p>
                      <p className="text-sm text-slate-500">
                        Balance: {tx.balance_after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}