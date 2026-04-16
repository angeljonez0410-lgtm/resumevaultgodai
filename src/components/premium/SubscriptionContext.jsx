/**
 * SubscriptionContext — single source of truth for subscription state.
 * Fetches ONCE, shared by all components. Eliminates the 429 rate limit storm.
 */
import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SubscriptionContext = createContext(null);

const TIER_RANK = { elite: 3, pro: 2, free: 1 };

function pickBestSub(records) {
  if (!records || records.length === 0) return null;
  const seen = new Set();
  const unique = records.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
  return unique.sort((a, b) => {
    if (a.is_manual_override && !b.is_manual_override) return -1;
    if (!a.is_manual_override && b.is_manual_override) return 1;
    const ra = TIER_RANK[a.subscription_status] || 0;
    const rb = TIER_RANK[b.subscription_status] || 0;
    if (rb !== ra) return rb - ra;
    return new Date(b.updated_date || 0) - new Date(a.updated_date || 0);
  })[0];
}

function deriveAccess(sub) {
  const isManualOverride = sub?.is_manual_override === true;
  const currentTier = sub?.subscription_status || 'free';
  const productTier = sub?.subscription_tier || 'free';
  const creditsBalance = Number(sub?.credits_balance) || 0;

  const isElite = currentTier === 'elite' || productTier === 'Premium Elite';
  const isPro = currentTier === 'pro' || isElite;
  const isPremium = isPro || isElite || sub?.has_addon_pack === true || sub?.has_pro === true;

  const isExpired = !isManualOverride && sub?.subscription_expires_at
    ? new Date(sub.subscription_expires_at) < new Date()
    : false;

  // For manual overrides, access is determined ONLY by selected addons, not tier
  // For tier-based access, use tier membership
  const addons = sub?.premium_addons || '';
  const hasInterviewMastery = (isManualOverride && addons.includes('interview_mastery')) || (isPro && !isManualOverride) || isElite;
  const hasExecutiveResume   = (isManualOverride && addons.includes('executive_resume')) || (isElite && !isManualOverride);
  const hasSalaryMaster      = (isManualOverride && addons.includes('salary_master')) || (isElite && !isManualOverride);
  const hasPortfolioPro      = (isManualOverride && addons.includes('portfolio_pro')) || (isPro && !isManualOverride) || isElite;
  const hasCareerCoach       = (isManualOverride && addons.includes('career_coaching')) || (isPro && !isManualOverride) || isElite;
  const hasNetworkTools      = (isManualOverride && addons.includes('network_tools')) || (isElite && !isManualOverride);
  const hasPrioritySupportAddon = (isManualOverride && addons.includes('priority_support')) || (isElite && !isManualOverride);
  const hasAddon             = isManualOverride || isElite || isPro || addons.length > 0 || sub?.has_addon_pack === true;

  const canGenerate = creditsBalance > 0 || isElite || (isPremium && !isExpired);

  return {
    isManualOverride, currentTier, productTier, creditsBalance,
    isElite, isPro, isPremium, isExpired,
    hasAddon, hasInterviewMastery, hasExecutiveResume, hasSalaryMaster, hasPortfolioPro,
    hasCareerCoach, hasNetworkTools, hasPrioritySupportAddon,
    hasPro: isPro || sub?.has_pro === true,
    canGenerate,
  };
}

export function SubscriptionProvider({ children }) {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: sub, isLoading } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      const records = await base44.entities.UserSubscription.list('-updated_date', 50);
      const email = user.email;
      const mine = (records || []).filter(r => r.created_by === email || r.user_email === email);
      return pickBestSub(mine);
    },
    enabled: !!user?.email,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: 1,
  });

  const access = deriveAccess(sub);

  const value = {
    ...access,
    subscription: sub,
    user,
    isLoading,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}