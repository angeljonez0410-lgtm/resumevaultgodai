import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Briefcase, MessageSquare, TrendingUp, Globe } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

const PRODUCTS = [
  {
    id: 'interview_mastery',
    name: 'Interview Mastery Bundle',
    price: 99.99,
    stripePrice: 'price_1QxK94BaHsdSuPWcT5U9M1sO',
    icon: MessageSquare,
    description: 'Complete interview preparation system',
    features: [
      '100 practice mock interviews',
      'Company-specific question bank',
      'Video recording & analysis',
      'Behavioral interview framework',
      'Technical interview prep',
      'Lifetime access'
    ],
    color: 'from-red-500 to-pink-600',
    badge: 'Best Seller'
  },
  {
    id: 'executive_resume',
    name: 'Executive Resume Package',
    price: 199.99,
    stripePrice: 'price_1QxK95BaHsdSuPWcV6W0P2tP',
    icon: Briefcase,
    description: 'Premium resumes for senior roles',
    features: [
      'Executive-level resume templates',
      'C-suite cover letter library',
      'LinkedIn executive optimization',
      'Personal branding consultation',
      '50 tailored resume generations',
      'Lifetime updates'
    ],
    color: 'from-slate-700 to-slate-900'
  },
  {
    id: 'salary_master',
    name: 'Salary Mastery Course',
    price: 149.99,
    stripePrice: 'price_1QxK96BaHsdSuPWcX7X1Q3uQ',
    icon: TrendingUp,
    description: 'Negotiate like a pro',
    features: [
      'Salary negotiation framework',
      'Industry-specific benchmarks',
      'Counter-offer templates',
      'Benefits package analyzer',
      'Email negotiation scripts',
      'Lifetime access'
    ],
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'portfolio_pro',
    name: 'Portfolio Website Pro',
    price: 299.99,
    stripePrice: 'price_1QxK97BaHsdSuPWcZ8Y2R4vR',
    icon: Globe,
    description: 'Stand out with a professional portfolio',
    features: [
      'AI-designed portfolio website',
      'Custom domain included (1 year)',
      'Mobile-responsive templates',
      'Project showcase sections',
      'Contact form integration',
      'Hosting & SSL included'
    ],
    color: 'from-blue-500 to-indigo-600',
    badge: 'Premium'
  }
];

export default function OneTimePurchases() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">One-Time Purchases</h2>
        <p className="text-slate-600">Lifetime access • No recurring fees • Instant delivery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          return (
            <Card key={product.id} className="p-6 hover:shadow-xl transition-all border-2 hover:border-slate-300">
              {product.badge && (
                <Badge className="w-fit mb-4 bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
                  {product.badge}
                </Badge>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">${product.price}</div>
                  <div className="text-xs text-slate-500">one-time</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{product.description}</p>

              <ul className="space-y-2.5 mb-6">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <StripeCheckout
                priceId={product.stripePrice}
                amount={product.price}
                description={product.name}
                purchaseType="addon"
                itemId={product.id}
                label="Buy Now"
                onSuccess={(order) => {
                  console.log('Purchase successful:', order);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              />
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <h3 className="font-bold text-slate-900 mb-2 text-center">Why One-Time Purchases?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-purple-600 mt-0.5" />
            <span className="text-slate-700"><span className="font-semibold">Lifetime Access:</span> Buy once, use forever</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-purple-600 mt-0.5" />
            <span className="text-slate-700"><span className="font-semibold">No Subscriptions:</span> No recurring charges</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-purple-600 mt-0.5" />
            <span className="text-slate-700"><span className="font-semibold">Instant Value:</span> Immediate access to all content</span>
          </div>
        </div>
      </div>
    </div>
  );
}