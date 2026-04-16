import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from 'lucide-react';
import StripeSubscription from './StripeSubscription';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic tools',
    priceId: 'price_1TA7w8BaHsdSuPWcHsnJn3p6',
    features: [
      '2 AI resume generations per month',
      '2 AI cover letters per month',
      '2 AI follow-up emails per month',
      '2 job analyses per month',
      'Application tracker',
      'Email support'
    ],
    limitations: [
      'No mock interviews',
      'No salary tools',
      'No auto-apply'
    ],
    cta: 'Current Plan',
    highlighted: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    period: 'month',
    priceId: 'price_1TA6gZBaHsdSuPWcEjFiOz0J',
    description: 'Perfect for active job seekers',
    badge: 'Most Popular',
    features: [
      '80 AI resumes/month',
      'Unlimited cover letters',
      'Advanced ATS optimization',
      '20 mock interview sessions/month',
      'Salary negotiation templates',
      'LinkedIn profile optimizer',
      'Priority email support',
      '50 auto-applications/month'
    ],
    cta: 'Start Pro',
    highlighted: true,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 79.99,
    period: 'month',
    priceId: 'price_1TA6hwBaHsdSuPWcrnIOrk6m',
    description: 'For serious career advancement',
    badge: 'Premium',
    features: [
      'Everything in Pro (150 AI resumes/mo)',
      'Unlimited mock interviews',
      'Career coaching AI assistant',
      'Portfolio website builder',
      'Executive resume templates',
      '200 auto-applications/month',
      'Network building tools',
      '24/7 priority support'
    ],
    cta: 'Go Elite',
    highlighted: false,
    color: 'from-amber-500 to-orange-600',
    icon: Crown
  }
];

export default function SubscriptionPlans() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Subscription Plans</h2>
        <p className="text-slate-600">Recurring access to AI-powered career tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.id}
              className={`p-6 flex flex-col ${plan.highlighted ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}
            >
              {plan.badge && (
                <Badge className="w-fit mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                  {plan.badge}
                </Badge>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {Icon && <Icon className="w-5 h-5 text-amber-500" />}
                </div>
                <p className="text-sm text-slate-600">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <p className="text-sm text-green-600 font-medium mt-1">{plan.savings}</p>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="w-4 h-4 text-slate-300 mt-0.5">✗</span>
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <div className="px-4 py-2 bg-slate-100 text-slate-600 text-center rounded-lg text-sm font-medium">
                  {plan.cta}
                </div>
              ) : plan.priceId ? (
                <StripeSubscription
                  priceId={plan.priceId}
                  planName={plan.name}
                  planId={plan.id}
                  label={plan.cta}
                  onSuccess={(data) => console.log('Subscription successful:', data)}
                  className={`w-full ${plan.highlighted ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' : 'bg-slate-900 hover:bg-slate-800'} text-white`}
                />
              ) : (
                <Button disabled className="w-full bg-slate-300 text-slate-500 cursor-not-allowed">
                  Coming Soon
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}