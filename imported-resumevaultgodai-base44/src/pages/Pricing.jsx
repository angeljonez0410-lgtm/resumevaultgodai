import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import SubscriptionPlans from '../components/pricing/SubscriptionPlans';
import CreditPacks from '../components/pricing/CreditPacks';
import OneTimePurchases from '../components/pricing/OneTimePurchases';
import PageHeader from '../components/ui-custom/PageHeader';
import MotivationalQuote from '../components/ui-custom/MotivationalQuotes';

const testimonials = [
  { name: 'Sarah K.', role: 'Software Engineer', text: 'Got 3 interviews in my first week using ResumevaultGodAI. The ATS keyword extraction is a game-changer.', stars: 5 },
  { name: 'Marcus T.', role: 'Product Manager', text: 'The salary negotiation scripts helped me negotiate $18K more than the initial offer. Worth every penny.', stars: 5 },
  { name: 'Priya M.', role: 'Data Analyst', text: 'I was applying for weeks with no responses. ResumevaultGodAI\'s tailored resumes got me callbacks within days.', stars: 5 },
  { name: 'David L.', role: 'Marketing Manager', text: 'The Interview Mastery Bundle prepared me perfectly. I walked into every interview confident and landed my dream job!', stars: 5 },
  { name: 'Jessica R.', role: 'UX Designer', text: 'Portfolio Website Builder made me stand out. Recruiters were impressed and I got 5x more profile views.', stars: 5 },
  { name: 'Alex C.', role: 'Sales Director', text: 'Executive Career Package was worth every dollar. Landed a VP role in 3 weeks with 40% salary increase.', stars: 5 },
];

const motivationalQuotes = [
  { quote: "Your next opportunity is one application away", author: "ApplyAI Community" },
  { quote: "Invest in yourself. It pays the best interest.", author: "Warren Buffett" },
  { quote: "The best time to start was yesterday. The next best time is now.", author: "Chinese Proverb" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
];

export default function Pricing() {
  return (
    <div>
      <PageHeader title="Pricing" subtitle="Multiple ways to invest in your career success" icon={Sparkles} />

      {/* Hero Tagline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <MotivationalQuote variant="hero" />
      </motion.div>

      {/* Motivational Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 bg-gradient-to-r from-[#1e2d42] to-[#2a3f5f] rounded-2xl p-8 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-[#f4c542]" />
            {motivationalQuotes[0].quote}
            <Sparkles className="w-6 h-6 text-[#f4c542]" />
          </h2>
          <p className="text-white/80 text-sm">Join 50,000+ professionals who accelerated their career with ResumevaultGodAI</p>
        </div>
      </motion.div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 text-center border border-slate-200">
          <div className="text-3xl font-bold text-[#1e2d42] mb-1">50K+</div>
          <div className="text-sm text-slate-600">Happy Users</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 text-center border border-slate-200">
          <div className="text-3xl font-bold text-[#1e2d42] mb-1">200K+</div>
          <div className="text-sm text-slate-600">Jobs Applied</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 text-center border border-slate-200">
          <div className="text-3xl font-bold text-[#1e2d42] mb-1">85%</div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl p-6 text-center border border-slate-200">
          <div className="text-3xl font-bold text-[#1e2d42] mb-1">14 Days</div>
          <div className="text-sm text-slate-600">Avg. Time to Offer</div>
        </motion.div>
      </div>

      {/* Testimonials */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Success Stories from Real Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {testimonials.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow h-full">
              <div className="flex mb-3">
                {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-[#f4c542] fill-[#f4c542]" />)}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quote Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {motivationalQuotes.slice(1).map((q, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 p-6 text-center"
          >
            <p className="text-lg font-semibold text-slate-800 mb-2 italic">"{q.quote}"</p>
            <p className="text-sm text-slate-500">- {q.author}</p>
          </motion.div>
        ))}
      </div>

      {/* Another Motivational Quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-10">
        <MotivationalQuote variant="small" />
      </motion.div>

      {/* Subscription Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-16"
      >
        <SubscriptionPlans />
      </motion.div>

      {/* Credit Packs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mb-16"
      >
        <CreditPacks />
      </motion.div>

      {/* One-Time Purchases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mb-10"
      >
        <OneTimePurchases />
      </motion.div>

      {/* Motivational Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mb-8">
        <MotivationalQuote variant="inline" />
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-gradient-to-r from-[#f4c542] to-[#e0b02f] rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold text-[#1e2d42] mb-2">Not sure which option is right for you?</h3>
        <p className="text-[#1e2d42]/80 mb-4">Start free, try credits, or go all-in with a subscription. Switch anytime.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 bg-white/30 rounded-lg text-sm font-medium text-[#1e2d42]">
            ✓ 30-day money-back guarantee
          </div>
          <div className="px-4 py-2 bg-white/30 rounded-lg text-sm font-medium text-[#1e2d42]">
            ✓ Cancel anytime
          </div>
          <div className="px-4 py-2 bg-white/30 rounded-lg text-sm font-medium text-[#1e2d42]">
            ✓ Secure Stripe payments
          </div>
        </div>
      </motion.div>
    </div>
  );
}