import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from 'lucide-react';

export default function ManualOverrideModal({ isOpen, onClose, user, subscription, onApply, isLoading }) {
  const [selectedTier, setSelectedTier] = useState('elite');
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [reason, setReason] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [enableOverride, setEnableOverride] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState({
    interview_mastery: false,
    executive_resume: false,
    portfolio_pro: false,
    salary_master: false,
    career_coaching: false,
    network_tools: false,
    priority_support: false,
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedTier('elite');
      setCreditsToAdd(0);
      setReason('');
      setExpiryDate('');
      setEnableOverride(true);
      setSelectedFeatures({
        interview_mastery: false,
        executive_resume: false,
        portfolio_pro: false,
        salary_master: false,
        career_coaching: false,
        network_tools: false,
        priority_support: false,
      });
    }
  }, [isOpen]);

  const handleApply = async () => {
    if (!enableOverride) {
      await onApply({
        subscription_status: 'free',
        subscription_tier: 'free',
        is_manual_override: false,
        credits_balance: subscription?.credits_balance || 0,
        premium_addons: '',
        subscription_expires_at: null,
        override_reason: '',
        ai_tasks_used: subscription?.ai_tasks_used || 0,
        stripe_customer_id: subscription?.stripe_customer_id || null,
        subscription_id: subscription?.subscription_id || null,
      });
      onClose();
      return;
    }

    const currentBalance = Number(subscription?.credits_balance) || 0;
    const newBalance = currentBalance + (Number(creditsToAdd) || 0);

    const enabledFeatures = Object.keys(selectedFeatures)
      .filter(feat => selectedFeatures[feat])
      .join(',');

    const payload = {
      subscription_status: selectedTier,
      subscription_tier: selectedTier === 'elite' ? 'Premium Elite' : selectedTier,
      is_manual_override: true,
      credits_balance: newBalance,
      premium_addons: enabledFeatures,
      subscription_expires_at: expiryDate || null,
      override_reason: reason || '',
      ai_tasks_used: Number(subscription?.ai_tasks_used) || 0,
      stripe_customer_id: subscription?.stripe_customer_id || null,
      subscription_id: subscription?.subscription_id || null,
    };

    await onApply(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚙️ Manual Override
            <span className="text-xs font-normal text-slate-500">{user?.email}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Override Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-700">Enable Manual Override</p>
              <p className="text-xs text-slate-500">Grant full access with selected tier</p>
            </div>
            <input
              type="checkbox"
              checked={enableOverride}
              onChange={(e) => setEnableOverride(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {enableOverride && (
            <>
              {/* Tier Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Subscription Tier</Label>
                <div className="flex gap-3">
                  {['free', 'pro', 'elite'].map(tier => (
                    <label key={tier} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tier"
                        value={tier}
                        checked={selectedTier === tier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {tier === 'free' ? '🆓 Free' : tier === 'pro' ? '⚡ Pro' : '👑 Elite'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Add Credits */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Add Credits</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={creditsToAdd}
                    onChange={(e) => setCreditsToAdd(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                    {subscription?.credits_balance || 0} → {(Number(subscription?.credits_balance) || 0) + (Number(creditsToAdd) || 0)}
                  </span>
                </div>
              </div>

              {/* Feature Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Features</Label>
                <div className="space-y-2">
                  {[
                    { key: 'interview_mastery', label: 'Unlimited Mock Interviews' },
                    { key: 'executive_resume', label: 'Executive Resume Templates' },
                    { key: 'portfolio_pro', label: 'Portfolio Website Builder' },
                    { key: 'career_coaching', label: 'Career Coaching AI Assistant' },
                    { key: 'salary_master', label: 'Salary Negotiation Tool' },
                    { key: 'network_tools', label: 'Network Building Tools' },
                    { key: 'priority_support', label: '24/7 Priority Support' },
                  ].map(feat => (
                    <label key={feat.key} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={selectedFeatures[feat.key]}
                        onChange={(e) => setSelectedFeatures(s => ({ ...s, [feat.key]: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Set Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              {/* Override Reason */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Override Reason (optional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Promo code, refund, special request..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </>
          )}

          {!enableOverride && (
            <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Unchecking will revert user to their natural tier. Existing credits/addons will be preserved.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isLoading} className="flex-1 bg-slate-800 text-white hover:bg-slate-700">
              {isLoading ? 'Applying...' : '✅ Apply Override'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}