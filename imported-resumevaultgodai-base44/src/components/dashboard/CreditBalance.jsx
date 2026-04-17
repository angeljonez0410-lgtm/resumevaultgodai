import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, TrendingUp, History, Crown, Infinity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '../premium/useSubscription';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import moment from 'moment';

export default function CreditBalance() {
  const { creditsBalance, currentTier, productTier, isManualOverride, isElite, isLoading } = useSubscription();

  const { data: transactions } = useQuery({
    queryKey: ['creditTransactions'],
    queryFn: async () => {
      const txs = await base44.entities.CreditTransaction.filter({}, '-created_date', 20);
      return txs || [];
    },
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-200 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-amber-200 rounded w-24"></div>
              <div className="h-6 bg-amber-200 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPremiumElite = productTier === 'Premium Elite' || isElite;
  // Premium Elite with 9999 credits = effectively unlimited
  const isUnlimited = isPremiumElite && creditsBalance >= 9999;
  const displayCredits = isUnlimited ? '∞' : creditsBalance;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
          <Zap className="w-5 h-5 text-amber-600" />
          AI Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{displayCredits}</span>
              {!isUnlimited && <span className="text-sm text-slate-600">credits</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {isPremiumElite && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium Elite
                </Badge>
              )}
              {!isPremiumElite && currentTier !== 'free' && (
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                  {currentTier.toUpperCase()} Plan
                </Badge>
              )}

            </div>
          </div>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${isPremiumElite ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {isUnlimited
              ? <Infinity className="w-10 h-10 text-white" />
              : <Zap className="w-10 h-10 text-white" />
            }
          </div>
        </div>

        <div className="bg-white/70 rounded-lg p-3 space-y-2">
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Credit Usage:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { color: 'bg-blue-500', label: 'AI Resume: 5 credits' },
              { color: 'bg-green-500', label: 'Cover Letter: 3 credits' },
              { color: 'bg-purple-500', label: 'Mock Interview: 10 credits' },
              { color: 'bg-amber-500', label: 'Auto-Apply: 2 credits' },
              { color: 'bg-rose-500', label: 'LinkedIn Summary: 4 credits' },
              { color: 'bg-teal-500', label: 'Follow-up Email: 2 credits' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
                <span className="text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/Pricing" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {isUnlimited ? 'View Plans' : 'Buy Credits'}
            </Button>
          </Link>

          {transactions && transactions.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-amber-300 hover:bg-amber-100">
                  <History className="w-4 h-4 text-amber-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-600" />
                    Credit History
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              tx.transaction_type === 'purchase' ? 'bg-green-100' :
                              tx.transaction_type === 'bonus' ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              {tx.transaction_type === 'purchase' && <Plus className="w-4 h-4 text-green-600" />}
                              {tx.transaction_type === 'bonus' && <Zap className="w-4 h-4 text-purple-600" />}
                              {tx.transaction_type === 'usage' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                              <p className="text-xs text-slate-500">{moment(tx.created_date).format('MMM D, YYYY h:mm A')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tx.credits_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.credits_amount > 0 ? '+' : ''}{tx.credits_amount}
                            </p>
                            <p className="text-xs text-slate-500">Balance: {tx.balance_after}</p>
                          </div>
                        </div>
                        {tx.feature_used && (
                          <Badge variant="outline" className="text-xs mt-1">{tx.feature_used}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {creditsBalance === 0 && currentTier === 'free' && !isManualOverride && (
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
            <p className="text-xs text-amber-900 font-medium">
              💡 Get credits to use AI features or upgrade to Pro for 80 resumes/month!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}