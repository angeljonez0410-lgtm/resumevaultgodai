import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { Users, Edit, CreditCard, Zap, Crown, Sparkles, RefreshCw, Search, ShieldCheck, Calendar, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import LegacySyncPanel from '../components/admin/LegacySyncPanel';
import ManualOverrideModal from '../components/admin/ManualOverrideModal';

const TIER_CONFIG = {
  free:  { label: 'Free',  color: 'bg-gray-100 text-gray-700',   icon: Sparkles },
  pro:   { label: 'Pro',   color: 'bg-blue-100 text-blue-700',   icon: Zap },
  elite: { label: 'Elite', color: 'bg-amber-100 text-amber-700', icon: Crown },
};

// Pick best subscription record for a user (override > highest tier > most recent)
function pickBestSub(records) {
  if (!records || records.length === 0) return null;
  const TIER_RANK = { elite: 3, pro: 2, free: 1 };
  return [...records].sort((a, b) => {
    if (a.is_manual_override && !b.is_manual_override) return -1;
    if (!a.is_manual_override && b.is_manual_override) return 1;
    const ra = TIER_RANK[a.subscription_status] || 0;
    const rb = TIER_RANK[b.subscription_status] || 0;
    if (rb !== ra) return rb - ra;
    return new Date(b.updated_date || 0) - new Date(a.updated_date || 0);
  })[0];
}

function validateForm(form) {
  const errors = {};
  if (!form.subscription_status) errors.subscription_status = 'Tier is required';
  const credits = Number(form.credits_balance);
  if (isNaN(credits) || credits < 0) errors.credits_balance = 'Credits must be a non-negative number';
  return errors;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [overridePicker, setOverridePicker] = useState(null); // userId -> show tier picker
  const [overrideModalUser, setOverrideModalUser] = useState(null); // {user, subscription} for modal

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = me?.role === 'admin';

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: isAdmin,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const { data: allSubscriptions = [] } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.UserSubscription.list('-updated_date', 500),
    enabled: isAdmin,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  // Build a map: email -> best subscription record
  const subMapByEmail = useMemo(() => {
    const map = {};
    for (const sub of allSubscriptions) {
      const email = sub.user_email || sub.created_by;
      if (!email) continue;
      if (!map[email]) map[email] = [];
      map[email].push(sub);
    }
    const best = {};
    for (const [email, records] of Object.entries(map)) {
      best[email] = pickBestSub(records);
    }
    return best;
  }, [allSubscriptions]);

  const updateMutation = useMutation({
    mutationFn: async ({ subId, userEmail, role, updates }) => {
      // Update user role if changed
      const currentUser = allUsers.find(u => u.email === userEmail);
      if (currentUser && role && role !== currentUser.role) {
        await base44.entities.User.update(currentUser.id, { role });
      }
      // Always include user_email so the record is findable by the target user
      const payload = { ...updates, user_email: userEmail };
      if (subId) {
        return await base44.entities.UserSubscription.update(subId, payload);
      } else {
        return await base44.entities.UserSubscription.create(payload);
      }
    },
    onError: (err) => {
      toast.error('Update failed: ' + err.message);
    },
    onSuccess: (returnedData, { subId, userEmail, updates }) => {
      // Manually update cache with the returned/updated record
      const current = queryClient.getQueryData(['admin-subscriptions']) || [];
      if (subId) {
        // Update existing: replace the record
        const updated = current.map(s => s.id === subId ? { ...s, ...updates, user_email: userEmail } : s);
        queryClient.setQueryData(['admin-subscriptions'], updated);
      } else {
        // New record: add to cache with ID from response
        const newRecord = { ...returnedData, user_email: userEmail, ...updates };
        queryClient.setQueryData(['admin-subscriptions'], [...current, newRecord]);
      }

      // Also refetch to ensure sync with server
      queryClient.refetchQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.refetchQueries({ queryKey: ['admin-users'] });

      // Log credit adjustment
      const oldSub = allSubscriptions.find(s => s.id === subId);
      const diff = (Number(updates.credits_balance) || 0) - (oldSub?.credits_balance || 0);
      if (diff !== 0 && subId) {
        base44.entities.CreditTransaction.create({
          user_email: userEmail,
          credits_amount: diff,
          transaction_type: diff > 0 ? 'bonus' : 'usage',
          description: `Admin adjustment: ${diff > 0 ? '+' : ''}${diff} credits${updates.override_reason ? ' — ' + updates.override_reason : ''}`,
          balance_after: Number(updates.credits_balance) || 0,
        }).catch(() => {});
      }

      toast.success('✅ Account updated!', { description: `Changes saved for ${userEmail}`, duration: 4000 });
      setEditTarget(null);
    },
  });

  if (me?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-slate-300" />
        <p className="text-slate-500 text-lg font-medium">Admin access required</p>
      </div>
    );
  }

  const filtered = allUsers.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (user) => {
    const sub = subMapByEmail[user.email];
    setEditTarget({ user, subscription: sub });
    setForm({
      role: user.role || 'user',
      subscription_status: sub?.subscription_status || 'free',
      subscription_tier: sub?.subscription_tier || 'free',
      is_manual_override: sub?.is_manual_override || false,
      subscription_expires_at: sub?.subscription_expires_at || '',
      credits_balance: sub?.credits_balance ?? 0,
      ai_tasks_used: sub?.ai_tasks_used ?? 0,
      premium_addons: sub?.premium_addons || '',
      stripe_customer_id: sub?.stripe_customer_id || '',
      subscription_id: sub?.subscription_id || '',
      override_reason: sub?.override_reason || '',
    });
    setFormErrors({});
  };

  const buildUpdates = (f) => ({
    subscription_status: f.subscription_status,
    subscription_tier: f.subscription_tier,
    is_manual_override: Boolean(f.is_manual_override),
    credits_balance: Number(f.credits_balance) || 0,
    ai_tasks_used: Number(f.ai_tasks_used) || 0,
    premium_addons: f.premium_addons || null,
    stripe_customer_id: f.stripe_customer_id || null,
    subscription_id: f.subscription_id || null,
    subscription_expires_at: f.subscription_expires_at || null,
    override_reason: f.override_reason || '',
  });

  const handleSave = () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    updateMutation.mutate({
      subId: editTarget.subscription?.id,
      userEmail: editTarget.user.email,
      role: form.role,
      updates: buildUpdates(form),
    });
  };

  const handleQuickAdd = (amount) => {
    if (!editTarget?.subscription?.id && !editTarget?.user?.email) return;
    const newBalance = Number(form.credits_balance) + amount;
    const newForm = { ...form, credits_balance: newBalance };
    setForm(newForm);
    updateMutation.mutate({
      subId: editTarget.subscription?.id,
      userEmail: editTarget.user.email,
      role: form.role,
      updates: { ...buildUpdates(newForm), credits_balance: newBalance },
    });
  };

  const applyManualOverride = async (updates) => {
    const user = overrideModalUser.user;
    const sub = overrideModalUser.subscription;

    // Ensure credits are explicitly set in updates
    const finalUpdates = {
      subscription_status: updates.subscription_status || 'free',
      subscription_tier: updates.subscription_tier || 'free',
      is_manual_override: updates.is_manual_override || false,
      credits_balance: Number(updates.credits_balance) || 0,
      premium_addons: updates.premium_addons || '',
      subscription_expires_at: updates.subscription_expires_at || null,
      override_reason: updates.override_reason || '',
      ai_tasks_used: Number(updates.ai_tasks_used) || 0,
      stripe_customer_id: updates.stripe_customer_id || null,
      subscription_id: updates.subscription_id || null,
    };

    return new Promise((resolve) => {
      updateMutation.mutate(
        {
          subId: sub?.id,
          userEmail: user.email,
          role: user.role || 'user',
          updates: finalUpdates,
        },
        {
          onSuccess: async () => {
            // Wait for cache to update after mutation succeeds
            await new Promise(r => setTimeout(r, 100));
            // Invalidate and refetch to get fresh data
            queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
            await queryClient.refetchQueries({ queryKey: ['admin-subscriptions'] });
            // Close modal after fresh data is in cache
            setOverrideModalUser(null);
            resolve();
          },
          onError: () => resolve(),
        }
      );
    });
  };

  const hardRefreshUser = async () => {
    queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
    
    // Stagger requests to avoid rate limit
    await queryClient.refetchQueries({ queryKey: ['admin-subscriptions'] });
    await new Promise(r => setTimeout(r, 500));
    await queryClient.refetchQueries({ queryKey: ['admin-users'] });
    await new Promise(r => setTimeout(r, 500));
    await queryClient.refetchQueries({ queryKey: ['userSubscription'] });
    
    toast.success('🔄 Data refreshed!');
  };

  const isExpiredSub = (sub) => {
    if (sub?.is_manual_override) return false;
    if (!sub?.subscription_expires_at) return false;
    return new Date(sub.subscription_expires_at) < new Date();
  };

  const stats = {
    total: allUsers.length,
    pro: Object.values(subMapByEmail).filter(s => s?.subscription_status === 'pro').length,
    elite: Object.values(subMapByEmail).filter(s => s?.subscription_status === 'elite' || s?.is_manual_override).length,
    overrides: Object.values(subMapByEmail).filter(s => s?.is_manual_override).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admin: User Management" subtitle="Manage subscriptions, credits, and plan overrides" icon={Users} />

      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-800">⚡ Legacy Sync & System Test</CardTitle>
        </CardHeader>
        <CardContent>
          <LegacySyncPanel />
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-700' },
          { label: 'Pro Users', value: stats.pro, color: 'text-blue-600' },
          { label: 'Elite/Override', value: stats.elite, color: 'text-amber-600' },
          { label: 'Active Overrides', value: stats.overrides, color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={hardRefreshUser} 
          title="Hard refresh all data"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Users ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingUsers ? (
            <div className="p-8 text-center text-slate-400">Loading users...</div>
          ) : (
            <div className="divide-y">
              {filtered.map((user) => {
                const sub = subMapByEmail[user.email];
                const tier = sub?.subscription_status || 'free';
                const cfg = TIER_CONFIG[tier] || TIER_CONFIG.free;
                const TierIcon = cfg.icon;
                const expired = isExpiredSub(sub);
                const isOverride = sub?.is_manual_override === true;
                return (
                  <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                        {(user.full_name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{user.full_name || '—'}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge className={expired ? 'bg-red-100 text-red-700 text-[10px] py-0' : cfg.color + ' text-[10px] py-0'}>
                            <TierIcon className="w-2.5 h-2.5 mr-0.5" />
                            {expired ? 'Expired' : cfg.label}
                          </Badge>
                          <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-medium">
                            ⚡ {sub?.credits_balance ?? 0} credits
                          </span>
                          {isOverride && (
                            <span className="text-[10px] bg-green-50 text-green-700 rounded px-1.5 py-0.5 font-semibold border border-green-300">🔓 Full Access Override</span>
                          )}
                          {sub?.subscription_tier === 'Premium Elite' && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 font-semibold border border-amber-200">Premium Elite</span>
                          )}
                          {sub?.premium_addons && sub.premium_addons.split(',').filter(Boolean).map(a => (
                            <span key={a} className="text-[10px] bg-purple-50 text-purple-600 rounded px-1.5 py-0.5 font-medium">{a.replace(/_/g, ' ')}</span>
                          ))}
                          {expired && (
                            <span className="text-[10px] bg-red-50 text-red-500 rounded px-1.5 py-0.5">⚠ Expired: {sub.subscription_expires_at}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      {isOverride ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            updateMutation.mutate({
                              subId: sub?.id,
                              userEmail: user.email,
                              role: user.role,
                              updates: {
                                subscription_status: 'free',
                                subscription_tier: 'free',
                                is_manual_override: false,
                                credits_balance: sub?.credits_balance || 0,
                                premium_addons: '',
                                subscription_expires_at: null,
                                override_reason: '',
                                ai_tasks_used: sub?.ai_tasks_used || 0,
                                stripe_customer_id: sub?.stripe_customer_id || null,
                                subscription_id: sub?.subscription_id || null,
                              },
                            });
                          }}
                        >
                          🔒 Revoke
                        </Button>
                      ) : (
                        <Button
                                 size="sm"
                                 variant="outline"
                                 className="gap-1 border-green-300 text-green-700 hover:bg-green-50 text-xs"
                                 disabled={updateMutation.isPending}
                                 onClick={() => setOverrideModalUser({ user, subscription: sub })}
                               >
                                 ⚙️ Override
                               </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEdit(user)} className="gap-1.5">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400">No users found.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Override Modal */}
      <ManualOverrideModal
        isOpen={!!overrideModalUser}
        onClose={() => setOverrideModalUser(null)}
        user={overrideModalUser?.user}
        subscription={overrideModalUser?.subscription}
        onApply={applyManualOverride}
        isLoading={updateMutation.isPending}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Edit: {editTarget?.user?.full_name || editTarget?.user?.email}
            </DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <Alert className="bg-slate-50 border-slate-200">
                <AlertDescription className="text-xs text-slate-600 space-y-0.5">
                  <div>📧 <strong>{editTarget.user.email}</strong></div>
                  <div>🪪 Sub record: <span className="font-mono">{editTarget.subscription?.id ? editTarget.subscription.id.slice(0, 10) + '…' : 'none (will create new)'}</span></div>
                  {editTarget.subscription?.is_manual_override && (
                    <div className="text-green-700 font-semibold">🔓 Manual override is ACTIVE — all features unlocked</div>
                  )}
                </AlertDescription>
              </Alert>

              {/* USER SETTINGS */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-1">User Settings</p>
              <div className="space-y-1.5">
                <Label>App Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">👤 User</SelectItem>
                    <SelectItem value="admin">🛡️ Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SUBSCRIPTION */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2">Subscription</p>

              {/* Info: Override is controlled by modal */}
              {form.is_manual_override && (
                <div className="p-3 rounded-lg border-2 border-green-400 bg-green-50">
                  <p className="text-sm font-semibold text-green-700">Override Active</p>
                  <p className="text-xs text-green-600 mt-1">Use the ⚙ Override button in the user list to change tier, credits, or expiry.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1.5">
                 <Label>Tier Status</Label>
                 <Select
                   value={form.subscription_status}
                   onValueChange={(v) => {
                     const isElite = v === 'elite';
                     setForm(f => ({
                       ...f,
                       subscription_status: v,
                       subscription_tier: isElite ? 'Premium Elite' : v,
                     }));
                     setFormErrors(e => ({ ...e, subscription_status: null }));
                   }}
                 >
                   <SelectTrigger className={formErrors.subscription_status ? 'border-red-400' : ''}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="free">🆓 Free</SelectItem>
                     <SelectItem value="pro">⚡ Pro</SelectItem>
                     <SelectItem value="elite">👑 Elite / Premium</SelectItem>
                   </SelectContent>
                 </Select>
                 {formErrors.subscription_status && <p className="text-xs text-red-500">{formErrors.subscription_status}</p>}
               </div>

               <div className="space-y-1.5">
                 <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Expiry Date</Label>
                 <Input
                   type="date"
                   value={form.subscription_expires_at || ''}
                   onChange={(e) => setForm(f => ({ ...f, subscription_expires_at: e.target.value }))}
                 />
               </div>
              </div>

              <div className="space-y-1.5">
                <Label>Stripe Customer ID</Label>
                <Input value={form.stripe_customer_id} onChange={(e) => setForm(f => ({ ...f, stripe_customer_id: e.target.value }))} placeholder="cus_..." className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Active Stripe Subscription ID</Label>
                <Input value={form.subscription_id} onChange={(e) => setForm(f => ({ ...f, subscription_id: e.target.value }))} placeholder="sub_..." className="font-mono text-xs" />
              </div>

              {/* CREDITS */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2">Credits & Usage</p>
              <div className="space-y-1.5">
                <Label>Quick Add Credits</Label>
                <div className="flex flex-wrap gap-2">
                  {[50, 150, 400, 1000].map(amount => (
                    <Button key={amount} type="button" size="sm" variant="outline"
                      className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
                      disabled={updateMutation.isPending}
                      onClick={() => handleQuickAdd(amount)}
                    >
                      <Plus className="w-3 h-3" />{amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Credits Balance</Label>
                  <Input type="number" min="0" value={form.credits_balance}
                    onChange={(e) => { setForm(f => ({ ...f, credits_balance: e.target.value })); setFormErrors(e2 => ({ ...e2, credits_balance: null })); }}
                    className={formErrors.credits_balance ? 'border-red-400' : ''}
                  />
                  {formErrors.credits_balance && <p className="text-xs text-red-500">{formErrors.credits_balance}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>AI Tasks Used</Label>
                  <Input type="number" min="0" value={form.ai_tasks_used} onChange={(e) => setForm(f => ({ ...f, ai_tasks_used: e.target.value }))} />
                </div>
              </div>

              {/* ADDONS */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2">Add-ons</p>
              <div className="space-y-1.5">
                <Label>Premium Addons</Label>
                <Input value={form.premium_addons} onChange={(e) => setForm(f => ({ ...f, premium_addons: e.target.value }))} placeholder="e.g. interview_mastery,executive_resume" />
                <p className="text-xs text-slate-400">Comma-separated: interview_mastery, executive_resume, salary_master, portfolio_pro</p>
              </div>

              {/* ADMIN NOTE */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2">Admin Note</p>
              <div className="space-y-1.5">
                <Label>Override Reason</Label>
                <Textarea value={form.override_reason} onChange={(e) => setForm(f => ({ ...f, override_reason: e.target.value }))} placeholder="e.g. Promo, refund, manual upgrade..." rows={2} />
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <Button variant="outline" onClick={() => setEditTarget(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 bg-slate-800 text-white">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}