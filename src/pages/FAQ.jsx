import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, MessageCircle, Zap, CreditCard, FileText, Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import PageHeader from '../components/ui-custom/PageHeader';

const categories = [
  {
    id: 'general',
    label: 'General',
    icon: HelpCircle,
    color: 'text-blue-600 bg-blue-50',
    faqs: [
      {
        q: 'What is ApplyAI?',
        a: 'ApplyAI is an AI-powered job application assistant that helps you land more interviews. It analyzes job descriptions, extracts ATS keywords, generates tailored resumes and cover letters, writes follow-up emails, and provides premium tools like mock interview practice, salary negotiation scripts, a career roadmap, and portfolio project ideas.'
      },
      {
        q: 'Does ApplyAI fabricate experience or skills?',
        a: 'Never. ApplyAI strictly uses only the information you provide in your profile. It reframes and highlights your real experience in a compelling way, but it will never invent achievements, skills, or companies. Your integrity is protected.'
      },
      {
        q: 'How do I get started?',
        a: 'Start by filling out your profile under "My Profile" — add your work experience, education, skills, and certifications. Then head to the Job Analyzer, paste a job description, and let the AI generate everything from your resume to follow-up emails.'
      },
      {
        q: 'Can I use ApplyAI on my phone?',
        a: 'Yes! ApplyAI is fully responsive and works great on mobile, tablet, and desktop browsers.'
      },
    ]
  },
  {
    id: 'features',
    label: 'Features',
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-50',
    faqs: [
      {
        q: 'What is ATS and why does it matter?',
        a: 'ATS (Applicant Tracking System) is software used by 99% of Fortune 500 companies to automatically filter resumes before a human ever sees them. If your resume doesn\'t contain the right keywords, it gets rejected immediately. ApplyAI extracts the exact keywords from the job description so your resume passes the ATS filter.'
      },
      {
        q: 'How does the Resume Builder work?',
        a: 'You paste the job description, and ApplyAI uses your profile data to generate a fully tailored resume. It matches your experience to the role, highlights relevant skills, uses the right keywords, and formats everything professionally — all in seconds.'
      },
      {
        q: 'Can I edit the generated content?',
        a: 'Yes! Every generated output has a copy button so you can paste it into Google Docs, Word, or any editor to make final tweaks. The AI gives you the best starting point — you refine it to perfection.'
      },
      {
        q: 'What types of follow-up emails can I generate?',
        a: 'ApplyAI can write 5 types: Post-Application Follow-Up, Post-Interview Thank You, No-Response Follow-Up, General Thank You Note, and Networking Follow-Up. Each is tailored to the specific stage of your application.'
      },
    ]
  },
  {
    id: 'premium',
    label: 'Premium & Pricing',
    icon: Zap,
    color: 'text-amber-600 bg-amber-50',
    faqs: [
      {
        q: 'What\'s included in the Premium Add-on Pack?',
        a: 'The $5 one-time Premium Add-on Pack unlocks 4 powerful tools: (1) Mock Interview Simulator — practice with role-specific questions and get AI feedback on your answers, (2) Salary Negotiation Scripts — ready-to-send email and phone scripts for any negotiation scenario, (3) Strategic Career Roadmap — personalized step-by-step plan from your current role to your target, (4) Portfolio Project Ideas — curated projects that will impress hiring managers for your target role.'
      },
      {
        q: 'What\'s the difference between the Add-on Pack and Pro?',
        a: 'The Add-on Pack ($5 one-time) unlocks the 4 premium tools with lifetime access. The Pro subscription ($19.99/mo) includes everything in the Add-on Pack plus unlimited AI generations, priority processing, and all future premium features as they\'re released.'
      },
      {
        q: 'Is the Add-on Pack really a one-time payment?',
        a: 'Yes! The $5 Premium Add-on Pack is a single, one-time purchase with lifetime access. No recurring charges, no subscriptions — you pay once and keep it forever.'
      },
      {
        q: 'Can I cancel the Pro subscription?',
        a: 'Yes, you can cancel the Pro subscription at any time. You\'ll retain access until the end of your billing period. There are no cancellation fees or long-term commitments.'
      },
    ]
  },
  {
    id: 'ai',
    label: 'AI & Quality',
    icon: MessageCircle,
    color: 'text-purple-600 bg-purple-50',
    faqs: [
      {
        q: 'How good is the AI output quality?',
        a: 'ApplyAI uses state-of-the-art large language models (including Claude and GPT-4 class models for critical tasks like resume generation). The Resume Builder specifically uses a higher-quality model to ensure the best possible output. Results are significantly better than generic ChatGPT prompts because ApplyAI uses job-application-specific prompting.'
      },
      {
        q: 'Will two people applying to the same job get the same resume?',
        a: 'No. Every resume is personalized using your specific profile data — your unique work history, achievements, skills, and experience. Two people with different profiles will get completely different resumes even for the same job posting.'
      },
      {
        q: 'How does the Mock Interview AI feedback work?',
        a: 'You type your answer to an interview question, and the AI acts as an expert interview coach. It evaluates your answer, highlights strengths, gives specific improvement tips, provides a model STAR-format answer, and scores your response out of 10.'
      },
      {
        q: 'Can I use the AI chat assistant for quick questions?',
        a: 'Yes! The floating chat button (bottom right corner) opens ApplyAI\'s career assistant, which can answer questions about your job search, resume writing tips, interview strategies, and how to use any feature in the app.'
      },
    ]
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    color: 'text-slate-600 bg-slate-50',
    faqs: [
      {
        q: 'Is my profile data secure?',
        a: 'Yes. Your profile data is stored securely and is private to your account. It is only used to generate your personalized content and is never shared with third parties or used to train AI models.'
      },
      {
        q: 'Can employers see my ApplyAI profile?',
        a: 'No. Your profile, generated resumes, cover letters, and application history are completely private. Only you can see your data.'
      },
    ]
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-4 text-left gap-4 hover:text-amber-700 transition-colors group"
      >
        <span className="font-medium text-slate-800 text-sm leading-relaxed group-hover:text-amber-700">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180 text-amber-500' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-500 leading-relaxed pb-4">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = categories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f =>
      !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => (activeCategory === 'all' || activeCategory === cat.id) && cat.faqs.length > 0);

  return (
    <div>
      <PageHeader title="Help & FAQ" subtitle="Everything you need to know about ApplyAI" icon={HelpCircle} />

      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ sections */}
      <div className="space-y-6">
        {filtered.map(cat => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800">{cat.label}</h2>
                <span className="text-xs text-slate-400 ml-auto">{cat.faqs.length} questions</span>
              </div>
              <div className="px-6">
                {cat.faqs.map((faq, i) => <FAQItem key={i} faq={faq} />)}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No results found for "{search}"</p>
            <p className="text-sm mt-1">Try a different search term or browse all categories.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center">
        <h3 className="text-white font-bold text-xl mb-2">Still have questions?</h3>
        <p className="text-slate-400 text-sm mb-4">Use the AI chat assistant (bottom right) to get instant answers about anything.</p>
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 text-amber-400 text-sm font-medium">
          <MessageCircle className="w-4 h-4" />
          Ask the AI assistant →
        </div>
      </div>
    </div>
  );
}