import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PayPalSubscription from '../components/pricing/PayPalSubscription';
import PageHeader from '../components/ui-custom/PageHeader';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  ArrowUpCircle,
  AlertTriangle,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

const PLAN_DETAILS = {
  free: {
    name: 'Free Plan',
    icon: Sparkles,
    color: 'bg-gray-100 text-gray-800',
    features: ['5 AI tasks/month', 'Basic resume builder', 'Limited job analysis'],
    price: '$0/month'
  },
  pro: {
    name: 'Pro Plan',
    icon: Zap,
    color: 'bg-blue-100 text-blue-800',
    features: ['Unlimited AI tasks', 'Advanced resume builder', 'Full job analysis', 'Cover letter generator'],
    price: '$19/month'
  },
  elite: {
    name: 'Elite Plan',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800',
    features: ['Everything in Pro', 'Interview coaching', 'Salary negotiation', 'Career roadmap', 'Priority support'],
    price: '$49/month'
  }
};

export default function ManageSubscription() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['userSubscription', user?.email],
    queryFn: () => base44.entities.UserSubscription.filter({ created_by: user.email }),
    enabled: !!user?.email
  });

  const subscription = subscriptions[0] || { subscription_status: 'free' };
  const currentPlan = subscription.subscription_status || 'free';
  const planDetails = PLAN_DETAILS[currentPlan];
  const PlanIcon = planDetails.icon;

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would call PayPal's cancel API
      return base44.entities.UserSubscription.update(subscription.id, {
        subscription_status: 'free',
        subscription_id: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      setShowCancelConfirm(false);
    }
  });

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowUpgrade(true);
  };

  const handleSubscriptionSuccess = async (details) => {
    if (subscription.id) {
      await base44.entities.UserSubscription.update(subscription.id, {
        subscription_status: selectedPlan,
        subscription_id: details.subscriptionID
      });
    } else {
      await base44.entities.UserSubscription.create({
        subscription_status: selectedPlan,
        subscription_id: details.subscriptionID
      });
    }
    queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
    setShowUpgrade(false);
    setSelectedPlan(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Manage Subscription"
        subtitle="View and manage your plan details"
        icon={CreditCard}
      />

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${planDetails.color}`}>
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{planDetails.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-foreground">
                  {planDetails.price}
                </CardDescription>
              </div>
            </div>
            <Badge className={planDetails.color}>Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Features */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Included Features
            </h3>
            <ul className="space-y-2">
              {planDetails.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Subscription Details */}
          {subscription.subscription_id && (
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subscription ID</span>
                <span className="font-mono text-xs">{subscription.subscription_id}</span>
              </div>
              {subscription.created_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Started
                  </span>
                  <span>{format(new Date(subscription.created_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            {currentPlan === 'free' && (
              <Button 
                onClick={() => handleUpgrade('pro')}
                className="flex-1"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
            {currentPlan === 'pro' && (
              <>
                <Button 
                  onClick={() => handleUpgrade('elite')}
                  className="flex-1"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Elite
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel Plan
                </Button>
              </>
            )}
            {currentPlan === 'elite' && (
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Upgrades */}
      {currentPlan !== 'elite' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Upgrades</h2>
          <div className="grid gap-4">
            {currentPlan === 'free' && (
              <>
                <UpgradeCard 
                  plan="pro" 
                  details={PLAN_DETAILS.pro}
                  onUpgrade={() => handleUpgrade('pro')}
                />
                <UpgradeCard 
                  plan="elite" 
                  details={PLAN_DETAILS.elite}
                  onUpgrade={() => handleUpgrade('elite')}
                  highlight
                />
              </>
            )}
            {currentPlan === 'pro' && (
              <UpgradeCard 
                plan="elite" 
                details={PLAN_DETAILS.elite}
                onUpgrade={() => handleUpgrade('elite')}
                highlight
              />
            )}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Upgrade to {PLAN_DETAILS[selectedPlan].name}</CardTitle>
              <CardDescription>
                Complete your subscription using PayPal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">You'll be charged:</p>
                <p className="text-2xl font-bold">{PLAN_DETAILS[selectedPlan].price}</p>
              </div>

              <PayPalSubscription
                planId={selectedPlan === 'pro' ? import.meta.env.VITE_PAYPAL_PRO_PLAN_ID : import.meta.env.VITE_PAYPAL_ELITE_PLAN_ID}
                planName={PLAN_DETAILS[selectedPlan].name}
                onSuccess={handleSubscriptionSuccess}
                onError={(err) => console.error('Subscription error:', err)}
              />

              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUpgrade(false);
                  setSelectedPlan(null);
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Cancel Subscription
              </CardTitle>
              <CardDescription>
                Are you sure you want to cancel your subscription?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  You'll lose access to premium features at the end of your current billing period.
                  Your subscription will automatically downgrade to the Free plan.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1"
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => cancelSubscription.mutate()}
                  disabled={cancelSubscription.isPending}
                  className="flex-1"
                >
                  {cancelSubscription.isPending ? 'Canceling...' : 'Confirm Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function UpgradeCard({ plan, details, onUpgrade, highlight }) {
  const Icon = details.icon;
  
  return (
    <Card className={highlight ? 'border-2 border-primary' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${details.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{details.name}</h3>
                <p className="text-sm text-muted-foreground">{details.price}</p>
              </div>
              <ul className="space-y-1">
                {details.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button onClick={onUpgrade} size="sm">
            Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}