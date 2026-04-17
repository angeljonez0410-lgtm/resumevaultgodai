import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, MapPin, Shield, FileText, MessageSquare, Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">ApplyAI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered career tools to help you land your dream job faster.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('JobAnalyzer')} className="hover:text-amber-400 transition-colors">Job Analyzer</Link></li>
              <li><Link to={createPageUrl('ResumeBuilder')} className="hover:text-amber-400 transition-colors">Resume Builder</Link></li>
              <li><Link to={createPageUrl('CoverLetter')} className="hover:text-amber-400 transition-colors">Cover Letter</Link></li>
              <li><Link to={createPageUrl('InterviewCoach')} className="hover:text-amber-400 transition-colors">Interview Coach</Link></li>
              <li><Link to={createPageUrl('Pricing')} className="hover:text-amber-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('FAQ')} className="hover:text-amber-400 transition-colors">FAQ</Link></li>
              <li><Link to={createPageUrl('Reviews')} className="hover:text-amber-400 transition-colors">Reviews</Link></li>
              <li><a href="mailto:support@applyai.com" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Contact Us
              </a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Privacy Policy
              </a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Terms of Service
              </a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {currentYear} ApplyAI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Made with AI · Trusted by job seekers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}