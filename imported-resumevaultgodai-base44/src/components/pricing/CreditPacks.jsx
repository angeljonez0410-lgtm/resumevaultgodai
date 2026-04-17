import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Check } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

const CREDIT_PACKS = [
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 9.99,
    stripePrice: 'price_1QxK90BaHsdSuPWcE5X1V7rK',
    perCredit: 0.20,
    description: 'Perfect for trying out premium features',
    useCases: [
      '10 AI resumes',
      '5 mock interviews',
      '25 auto-applications'
    ]
  },
  {
    id: 'credits_150',
    name: '150 Credits',
    credits: 150,
    price: 24.99,
    stripePrice: 'price_1QxK91BaHsdSuPWcQ3N2Y8mL',
    perCredit: 0.17,
    description: 'Great for an active job search',
    badge: 'Save 15%',
    useCases: [
      '30 AI resumes',
      '15 mock interviews',
      '75 auto-applications'
    ],
    popular: true
  },
  {
    id: 'credits_400',
    name: '400 Credits',
    credits: 400,
    price: 59.99,
    stripePrice: 'price_1QxK92BaHsdSuPWcF2P7K9rM',
    perCredit: 0.15,
    description: 'Best value for power users',
    badge: 'Save 25%',
    useCases: [
      '80 AI resumes',
      '40 mock interviews',
      '200 auto-applications'
    ]
  },
  {
    id: 'credits_1000',
    name: '1000 Credits',
    credits: 1000,
    price: 129.99,
    stripePrice: 'price_1QxK93BaHsdSuPWcR4S8L0rN',
    perCredit: 0.13,
    description: 'Maximum savings for bulk users',
    badge: 'Save 35%',
    useCases: [
      '200 AI resumes',
      '100 mock interviews',
      '500 auto-applications'
    ]
  }
];

export default function CreditPacks() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-amber-500" />
          AI Credit Packs
        </h2>
        <p className="text-slate-600">Pay-as-you-go flexibility • Credits never expire • Use for any feature</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-900 font-medium text-center">
          💡 <span className="font-bold">How credits work:</span> 1 AI Resume = 5 credits • 1 Mock Interview = 10 credits • 1 Auto-Application = 2 credits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {CREDIT_PACKS.map((pack) => (
          <Card 
            key={pack.id}
            className={`p-5 flex flex-col ${pack.popular ? 'ring-2 ring-amber-500 shadow-lg' : 'border-slate-200'}`}
          >
            {pack.badge && (
              <Badge className="w-fit mb-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                {pack.badge}
              </Badge>
            )}

            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{pack.credits}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Credits</p>
            </div>

            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-slate-900">${pack.price}</div>
              <p className="text-xs text-slate-500 mt-1">${pack.perCredit.toFixed(2)} per credit</p>
            </div>

            <p className="text-sm text-slate-600 text-center mb-4">{pack.description}</p>

            <div className="bg-slate-50 rounded-lg p-3 mb-4 flex-grow">
              <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Example usage:</p>
              <ul className="space-y-1.5">
                {pack.useCases.map((useCase, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            <StripeCheckout
              priceId={pack.stripePrice}
              amount={pack.price}
              description={pack.name}
              purchaseType="credits"
              itemId={pack.id}
              label="Buy Credits"
              onSuccess={(order) => console.log('Credit purchase successful:', order)}
              className={`w-full ${pack.popular ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 'bg-slate-900 hover:bg-slate-800'} text-white`}
            />
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium">Credits Never Expire</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium">Use for Any Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium">No Monthly Commitment</span>
          </div>
        </div>
      </div>
    </div>
  );
}