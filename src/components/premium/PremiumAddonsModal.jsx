import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Target, TrendingUp, Users, Calendar, MessageSquare, Mail, Briefcase, Globe, DollarSign, UserPlus, FileText, Zap, Rocket, Crown } from 'lucide-react';
import { toast } from "sonner";
import PayPalCheckout from '../pricing/PayPalCheckout';

const TIER_INFO = {
  starter: { label: 'Starter', color: 'text-blue-600', bg: 'bg-blue-50' },
  professional: { label: 'Professional', color: 'text-purple-600', bg: 'bg-purple-50' },
  premium: { label: 'Premium', color: 'text-orange-600', bg: 'bg-orange-50' },
  elite: { label: 'Elite', color: 'text-slate-800', bg: 'bg-slate-100' }
};

const PREMIUM_ADDONS = [
  // Starter Tier ($19.99 - $34.99)
  {
    id: 'resume_starter',
    name: 'Resume Starter Pack',
    price: 19.99,
    stripePrice: 'price_resume_starter',
    icon: FileText,
    description: '5 AI-optimized resumes',
    features: [
      '5 tailored resume generations',
      'ATS keyword optimization',
      'PDF & Word downloads',
      'Never expires'
    ],
    color: 'from-blue-400 to-cyan-400',
    tier: 'starter'
  },
  {
    id: 'cover_letter_basic',
    name: 'Cover Letter Essentials',
    price: 24.99,
    stripePrice: 'price_cover_letter_basic',
    icon: Mail,
    description: '10 AI cover letters',
    features: [
      '10 custom cover letters',
      'Role-specific customization',
      'Edit & regenerate',
      'Lifetime access'
    ],
    color: 'from-purple-400 to-pink-400',
    tier: 'starter'
  },
  {
    id: 'salary_intel',
    name: 'Salary Intelligence',
    price: 29.99,
    stripePrice: 'price_salary_intel',
    icon: DollarSign,
    description: 'Know your market value',
    features: [
      'Personalized salary analysis',
      'Industry benchmarking',
      'Negotiation scripts included',
      'Benefits comparison guide'
    ],
    color: 'from-green-400 to-emerald-400',
    tier: 'starter'
  },
  {
    id: 'job_alerts_basic',
    name: 'Job Alert Starter',
    price: 34.99,
    stripePrice: 'price_job_alerts_basic',
    icon: Target,
    description: '30 days of AI job matching',
    features: [
      'Daily personalized matches',
      'Email notifications',
      'Custom filters',
      '1 month access'
    ],
    color: 'from-amber-400 to-orange-400',
    tier: 'starter'
  },

  // Professional Tier ($44.99 - $79.99)
  {
    id: 'resume_professional',
    name: 'Resume Pro Pack',
    price: 44.99,
    stripePrice: 'price_resume_pro',
    icon: Sparkles,
    description: '20 professional resume rewrites',
    features: [
      '20 AI resume generations',
      'Industry-specific templates',
      'ATS score guarantee 85%+',
      'Lifetime access'
    ],
    color: 'from-violet-500 to-purple-500',
    tier: 'professional'
  },
  {
    id: 'interview_basic',
    name: 'Interview Prep Starter',
    price: 49.99,
    stripePrice: 'price_interview_basic',
    icon: MessageSquare,
    description: '15 mock interview sessions',
    features: [
      '15 AI mock interviews',
      'Real-time feedback',
      'Common questions database',
      'Performance scoring'
    ],
    color: 'from-red-400 to-rose-400',
    tier: 'professional'
  },
  {
    id: 'linkedin_optimizer',
    name: 'LinkedIn Optimizer',
    price: 59.99,
    stripePrice: 'price_linkedin_optimizer',
    icon: TrendingUp,
    description: 'Transform your LinkedIn profile',
    features: [
      'Profile headline rewrite',
      'About section optimization',
      'Skills & endorsements strategy',
      '30-day content calendar'
    ],
    color: 'from-blue-500 to-indigo-500',
    tier: 'professional'
  },
  {
    id: 'application_boost',
    name: 'Auto-Apply 100',
    price: 69.99,
    stripePrice: 'price_auto_apply_100',
    icon: Zap,
    description: '100 automated job applications',
    features: [
      '100 auto-applications',
      'Smart job targeting',
      'Application tracking',
      'Response monitoring'
    ],
    color: 'from-orange-500 to-red-500',
    tier: 'professional'
  },
  {
    id: 'network_builder',
    name: 'Network Builder',
    price: 74.99,
    stripePrice: 'price_network_builder',
    icon: Users,
    description: 'Grow your professional network',
    features: [
      'AI connection recommendations',
      'Personalized outreach messages',
      'Follow-up automation',
      'Network analytics'
    ],
    color: 'from-teal-500 to-cyan-500',
    tier: 'professional'
  },
  {
    id: 'career_coaching_month',
    name: 'Career Coach - 1 Month',
    price: 79.99,
    stripePrice: 'price_career_coach_1m',
    icon: Users,
    description: '30 days unlimited AI coaching',
    features: [
      '24/7 AI career guidance',
      'Unlimited coaching sessions',
      'Personalized action plans',
      'Interview preparation'
    ],
    color: 'from-amber-500 to-yellow-500',
    tier: 'professional'
  },

  // Premium Tier ($99.99 - $199.99)
  {
    id: 'interview_mastery',
    name: 'Interview Mastery',
    price: 99.99,
    stripePrice: 'price_interview_mastery',
    icon: MessageSquare,
    description: '50 mock interviews + analysis',
    features: [
      '50 AI mock interview sessions',
      'Video recording & analysis',
      'Company-specific prep',
      'Behavioral question training'
    ],
    color: 'from-red-500 to-pink-500',
    tier: 'premium'
  },
  {
    id: 'application_boost_pro',
    name: 'Auto-Apply Pro 250',
    price: 119.99,
    stripePrice: 'price_auto_apply_250',
    icon: Calendar,
    description: '250 premium auto-applications',
    features: [
      '250 auto-applications',
      'Priority job targeting',
      'Advanced tracking dashboard',
      'Weekly progress reports'
    ],
    color: 'from-indigo-500 to-purple-500',
    tier: 'premium'
  },
  {
    id: 'portfolio_builder',
    name: 'Portfolio Website Pro',
    price: 149.99,
    stripePrice: 'price_portfolio_pro',
    icon: Globe,
    description: 'Professional portfolio website',
    features: [
      'Custom domain included',
      'AI-designed layouts',
      'Project showcase sections',
      '1 year hosting & SSL'
    ],
    color: 'from-orange-500 to-red-500',
    tier: 'premium'
  },
  {
    id: 'career_accelerator',
    name: 'Career Accelerator',
    price: 179.99,
    stripePrice: 'price_career_accelerator',
    icon: Rocket,
    description: '90-day career transformation',
    features: [
      '50 resumes + 50 cover letters',
      '200 auto-applications',
      '30 mock interviews',
      '90 days AI coaching'
    ],
    color: 'from-purple-500 to-indigo-500',
    tier: 'premium'
  },

  // Elite Tier ($249.99 - $499.99)
  {
    id: 'executive_starter',
    name: 'Executive Essentials',
    price: 249.99,
    stripePrice: 'price_executive_starter',
    icon: Briefcase,
    description: 'Executive-level job search',
    features: [
      'Unlimited resumes & cover letters',
      '300 auto-applications',
      '50 executive mock interviews',
      '60 days coaching'
    ],
    color: 'from-slate-600 to-slate-800',
    tier: 'elite'
  },
  {
    id: 'executive_premium',
    name: 'Executive Premium',
    price: 399.99,
    stripePrice: 'price_executive_premium',
    icon: Crown,
    description: 'Complete executive package',
    features: [
      'Unlimited resumes & cover letters',
      '500 auto-applications',
      '100 mock interviews',
      '90 days priority AI coaching',
      'LinkedIn profile makeover',
      'Personal branding consultation'
    ],
    color: 'from-purple-600 to-pink-600',
    tier: 'elite'
  },
  {
    id: 'career_vip',
    name: 'Career VIP Ultimate',
    price: 499.99,
    stripePrice: 'price_career_vip',
    icon: Crown,
    description: 'The ultimate career package',
    features: [
      'Everything in Executive Premium',
      '1000 auto-applications',
      'Unlimited mock interviews',
      '6 months AI coaching',
      'Professional portfolio website',
      'Salary negotiation consulting',
      'Network building strategies'
    ],
    color: 'from-amber-600 to-orange-600',
    tier: 'elite'
  }
];

export default function PremiumAddonsModal({ open, onClose }) {
  const [selectedTier, setSelectedTier] = useState('all');

  const filteredAddons = selectedTier === 'all' 
    ? PREMIUM_ADDONS 
    : PREMIUM_ADDONS.filter(addon => addon.tier === selectedTier);

  const groupedAddons = {
    starter: PREMIUM_ADDONS.filter(a => a.tier === 'starter'),
    professional: PREMIUM_ADDONS.filter(a => a.tier === 'professional'),
    premium: PREMIUM_ADDONS.filter(a => a.tier === 'premium'),
    elite: PREMIUM_ADDONS.filter(a => a.tier === 'elite')
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[#1e2d42] text-center">
            Premium Add-Ons Marketplace
          </DialogTitle>
          <p className="text-slate-600 text-center text-base mt-2">
            One-time purchases • Lifetime access • No subscriptions required
          </p>
        </DialogHeader>

        {/* Tier Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Button 
            onClick={() => setSelectedTier('all')}
            variant={selectedTier === 'all' ? 'default' : 'outline'}
            className="rounded-full"
          >
            All Add-ons
          </Button>
          {Object.keys(groupedAddons).map(tier => (
            <Button 
              key={tier}
              onClick={() => setSelectedTier(tier)}
              variant={selectedTier === tier ? 'default' : 'outline'}
              className="rounded-full capitalize"
            >
              {TIER_INFO[tier].label} ({groupedAddons[tier].length})
            </Button>
          ))}
        </div>

        {/* Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAddons.map((addon) => {
            const Icon = addon.icon;
            const tierInfo = TIER_INFO[addon.tier];
            return (
              <Card key={addon.id} className="p-5 hover:shadow-2xl transition-all border-2 hover:border-[#f4c542] flex flex-col">
                {/* Tier Badge */}
                <Badge className={`${tierInfo.bg} ${tierInfo.color} mb-3 w-fit text-xs font-semibold`}>
                  {tierInfo.label}
                </Badge>

                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${addon.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1e2d42]">
                      ${addon.price}
                    </div>
                    <div className="text-xs text-slate-500">one-time</div>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-[#1e2d42] mb-1">
                  {addon.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {addon.description}
                </p>

                <ul className="space-y-2 mb-4 flex-grow">
                  {addon.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <PayPalCheckout
                  amount={addon.price}
                  description={addon.name}
                  onSuccess={(order) => {
                    console.log('Purchase successful:', order);
                  }}
                >
                  <Button className="w-full bg-[#1e2d42] hover:bg-[#2a3f5f] text-white font-semibold">
                    Purchase Now
                  </Button>
                </PayPalCheckout>
              </Card>
            );
          })}
        </div>

        {/* Trust Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium">30-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium">Secure PayPal Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium">Instant Access</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}