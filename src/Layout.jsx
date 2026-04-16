import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Search,
  FileText,
  Mail,
  Send,
  User,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Mic,
  DollarSign,
  Map,
  Lightbulb,
  Zap,
  CreditCard,
  Briefcase,
  MessageSquare,
  Accessibility,
  TrendingUp,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AIChatWidget from './components/chat/AIChatWidget';
import { SimpleModeProvider, useSimpleMode } from './components/settings/SimpleMode';
import { SubscriptionProvider } from './components/premium/SubscriptionContext';
import Footer from './components/ui-custom/Footer';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const BASE_NAV_ITEMS = [
  { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'Auto Apply', page: 'AutoApply', icon: Zap },
  { name: 'Job Analyzer', page: 'JobAnalyzer', icon: Search },
  { name: 'Resume Builder', page: 'ResumeBuilder', icon: FileText },
  { name: 'Resume Library', page: 'ResumeLibrary', icon: FileText },
  { name: 'Cover Letter', page: 'CoverLetter', icon: Mail },
  { name: 'Follow-Up Email', page: 'FollowUpEmail', icon: Send },
  { name: 'My Profile', page: 'Profile', icon: User },
  { name: 'Application Tracker', page: 'ApplicationTracker', icon: Briefcase },
  { name: 'Analytics', page: 'Analytics', icon: TrendingUp },
  { name: 'Pricing', page: 'Pricing', icon: CreditCard },
  { name: 'Reviews', page: 'Reviews', icon: MessageSquare },
];

const premiumNavItems = [
  { name: 'Interview Coach', page: 'InterviewCoach', icon: Mic },
  { name: 'Salary Negotiation', page: 'SalaryNegotiation', icon: DollarSign },
  { name: 'Career Roadmap', page: 'CareerRoadmap', icon: Map },
  { name: 'Portfolio Ideas', page: 'PortfolioIdeas', icon: Lightbulb },
];

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSimpleMode, toggleSimpleMode } = useSimpleMode();
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  const navItems = me?.role === 'admin'
    ? [...BASE_NAV_ITEMS, { name: 'Admin Users', page: 'AdminUsers', icon: Accessibility }, { name: 'Admin AI Assistant', page: 'AdminAssistant', icon: Sparkles }]
    : BASE_NAV_ITEMS;
  const isRootPage = location.pathname === '/' || location.pathname === '/Dashboard';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-20 md:pb-0">
      <style>{`
        :root {
          --sidebar-bg: #1e2d42;
          --sidebar-hover: #2a3f5f;
          --gold: #f4c542;
          --gold-dark: #e0b02f;
          --navy: #1e2d42;
          --navy-light: #2a3f5f;
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Hidden on Mobile */}
      <aside className={`
        hidden lg:flex fixed lg:static inset-y-0 left-0 z-50 w-72 border-r border-[#2a3f5f]
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex-col
      `} style={{ backgroundColor: '#1e2d42' }}>
        {/* Logo */}
        <div className="p-6 border-b border-[#2a3f5f]">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ backgroundColor: '#f4c542' }}>
                <Sparkles className="w-5 h-5" style={{ color: '#1e2d42' }} />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-tight">Resumevault</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#f4c542' }}>God-Mode Job Hunt</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)} style={{ backgroundColor: 'transparent' }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Main Tagline */}
          <div className="mt-4 pt-4 border-t border-[#2a3f5f]">
            <p className="text-xs text-white/80 italic leading-relaxed">
              <span style={{ color: '#f4c542' }}>⚡</span> ResumevaultGodAI - Beat the ATS in 60 seconds & God-Mode your job hunt.
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive ? 'shadow-lg' : 'text-[#e5e7eb] hover:bg-[#2a3f5f]'}
                `}
                style={isActive ? { backgroundColor: '#f4c542', color: '#1e2d42' } : {}}
              >
                <item.icon className={`w-[18px] h-[18px]`} style={isActive ? { color: '#1e2d42' } : {}} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Premium Nav Section */}
        <div className="px-4 pb-2">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/60 px-4 mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3" style={{ color: '#f4c542' }} /> Premium
          </p>
          {premiumNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5
                  ${isActive ? 'shadow-lg' : 'text-[#e5e7eb] hover:bg-[#2a3f5f]'}
                `}
                style={isActive ? { backgroundColor: '#f4c542', color: '#1e2d42' } : {}}
              >
                <item.icon className={`w-[18px] h-[18px]`} style={isActive ? { color: '#1e2d42' } : { color: '#f4c542' }} />
                <span>{item.name}</span>
                <Zap className={`w-3 h-3 ml-auto`} style={isActive ? { color: '#1e2d42', opacity: 0.7 } : { color: '#f4c542', opacity: 0.7 }} />
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a3f5f] mt-2 space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#2a3f5f] hover:bg-[#354d6f] transition-colors">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4" style={{ color: '#f4c542' }} />
              <span className="text-xs font-medium text-white">Simple Mode</span>
            </div>
            <Switch checked={isSimpleMode} onCheckedChange={toggleSimpleMode} />
          </div>
          <div className="rounded-xl p-4 border" style={{ background: 'linear-gradient(to bottom right, rgba(244, 197, 66, 0.2), rgba(244, 197, 66, 0.1))', borderColor: 'rgba(244, 197, 66, 0.3)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#f4c542' }}>AI-Powered</p>
            <p className="text-[11px] text-white/70 leading-relaxed">Get tailored resumes, cover letters, and more.</p>
          </div>
          <button
            onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-[#2a3f5f] transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-12">
        {/* Mobile Header - Sticky */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#1e2d42', paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          {!isRootPage && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white user-select-none" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f4c542' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#1e2d42' }} />
            </div>
            <span className="font-bold text-white text-sm">Resumevault</span>
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-12">
          {children}
        </main>
        <Footer />
      </div>

      {/* Bottom Tab Bar - Mobile Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a3f5f] flex justify-around" style={{ backgroundColor: '#1e2d42', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
          { name: 'Analyzer', page: 'JobAnalyzer', icon: Search },
          { name: 'Resumes', page: 'ResumeLibrary', icon: FileText },
          { name: 'Profile', page: 'Profile', icon: User },
        ].map((item) => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-all user-select-none ${
                isActive ? 'text-[#f4c542]' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="truncate w-12 text-center">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <AIChatWidget />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <SimpleModeProvider>
      <SubscriptionProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </SubscriptionProvider>
    </SimpleModeProvider>
  );
}